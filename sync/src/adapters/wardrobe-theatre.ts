import { parse } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';
import { inferYear } from './helpers/dates.js';

const SOURCE_NAME = 'wardrobe-theatre';
const VENUE_NAME = 'Wardrobe Theatre';
const VENUE_ADDRESS = '25 West Street, Old Market, Bristol, BS2 0DF';
const BASE_URL = 'https://thewardrobetheatre.com';

/**
 * Known recurring shows that need individual page scraping
 */
const RECURRING_SHOWS = [
  { slug: 'closer-each-day', title: 'Closer Each Day: The Improvised Soap Opera' },
  { slug: 'impromptu-shakespeare', title: 'Impromptu Shakespeare' },
];

interface PerformanceDate {
  date: Date;
  time: string;
  bookingUrl?: string;
}

/**
 * Wardrobe Theatre adapter
 * Scrapes individual show pages for recurring performance dates
 */
export class WardrobeTheatreAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    const events: Event[] = [];

    // Fetch recurring shows from their individual pages
    for (const show of RECURRING_SHOWS) {
      const showEvents = await this.fetchShowPage(show.slug, show.title);
      events.push(...showEvents);
    }

    return events;
  }

  /**
   * Fetch all performance dates from a show's individual page
   */
  private async fetchShowPage(slug: string, title: string): Promise<Event[]> {
    const url = `${BASE_URL}/shows/${slug}/`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const root = parse(html);
    const events: Event[] = [];

    // Find all performance instances
    const instances = root.querySelectorAll('.instance');

    for (const instance of instances) {
      const perfDate = this.parseInstance(instance);
      if (!perfDate) continue;

      // Get booking link if available
      const bookLink = instance.querySelector('a[href*="book"]');
      const ticketsUrl = bookLink?.getAttribute('href') || url;

      const event: Event = {
        title,
        start: perfDate.date,
        venue: VENUE_NAME,
        address: VENUE_ADDRESS,
        eventUrl: url,
        ticketsUrl,
        sourceId: `wardrobe|${perfDate.date.toISOString().replace(':00.000Z', '')}`,
        canonicalUrl: url,
        source: SOURCE_NAME,
        fingerprint: '',
      };

      event.fingerprint = generateFingerprint(event);
      events.push(event);
    }

    return events;
  }

  /**
   * Parse a performance instance element
   * Format: "Mon 9th February 7:30 pm £12 Book now"
   */
  private parseInstance(instance: ReturnType<typeof parse.prototype.querySelector>): PerformanceDate | null {
    const text = instance.text.trim();

    // Extract date: "Mon 9th February" or "Mon 9th Feb"
    const dateMatch = text.match(
      /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/i
    );

    if (!dateMatch) return null;

    const weekday = dateMatch[1];
    const day = parseInt(dateMatch[2], 10);
    const monthStr = dateMatch[3].toLowerCase();

    const months: Record<string, number> = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, sept: 8, september: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11,
    };

    const month = months[monthStr];
    if (month === undefined) return null;

    const year = inferYear(month, day, weekday);

    // Extract time: "7:30 pm" or "7.30pm"
    const timeMatch = text.match(/(\d{1,2})[.:](\d{2})\s*(am|pm)?/i);
    let hours = 19; // Default to 7pm
    let minutes = 30;

    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3]?.toLowerCase();
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
    }

    const date = new Date(year, month, day, hours, minutes, 0, 0);

    return { date, time: `${hours}:${minutes.toString().padStart(2, '0')}` };
  }
}
