import { parse } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';

const SOURCE_NAME = 'redgrave-theatre';
const VENUE_NAME = 'Redgrave Theatre';
const VENUE_ADDRESS = 'Percival Road, Clifton, Bristol, BS8 3LE';
const BASE_URL = 'https://redgravetheatre.com';
const LISTING_URL = `${BASE_URL}/events/`;

/**
 * Redgrave Theatre website scraper
 */
export class RedgraveTheatreAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    const response = await fetch(LISTING_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Redgrave Theatre: ${response.status}`);
    }

    const html = await response.text();
    const root = parse(html);
    const events: Event[] = [];

    // Find event links - pattern: /event/YYYY/MM/slug/ID/
    const eventLinks = root.querySelectorAll('a[href*="/event/"]');
    const seenUrls = new Set<string>();

    for (const link of eventLinks) {
      const href = link.getAttribute('href');
      if (!href || seenUrls.has(href)) continue;
      seenUrls.add(href);

      // Extract date from URL pattern: /event/2026/01/slug/ID/
      const urlMatch = href.match(/\/event\/(\d{4})\/(\d{2})\/([^/]+)\/(\d+)/);
      if (!urlMatch) continue;

      const [, year, month, slug, id] = urlMatch;

      // Get title from link or nearby text
      let title = link.text?.trim();
      if (!title || title.length < 3 || title === 'Book Now') {
        title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }

      const eventUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

      // Parse more specific date if available in parent text
      const parentText = link.parentNode?.text || '';
      const dateInfo = this.parseDate(parentText, parseInt(year), parseInt(month) - 1);

      const event: Event = {
        title,
        start: dateInfo.start,
        end: dateInfo.end || undefined,
        venue: VENUE_NAME,
        address: VENUE_ADDRESS,
        eventUrl,
        ticketsUrl: `https://tickets.redgravetheatre.com`,
        sourceId: `redgrave-${id}`,
        canonicalUrl: eventUrl,
        source: SOURCE_NAME,
        fingerprint: '',
      };

      event.fingerprint = generateFingerprint(event);
      events.push(event);
    }

    return events;
  }

  private parseDate(
    text: string,
    year: number,
    month: number
  ): { start: Date; end: Date | null } {
    // Try to find specific date like "January 31" or "March 4-6"
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
    ];

    const rangeMatch = text.match(
      new RegExp(`(${months.join('|')})\\s+(\\d{1,2})[-–](\\d{1,2})`, 'i')
    );
    const singleMatch = text.match(
      new RegExp(`(${months.join('|')})\\s+(\\d{1,2})`, 'i')
    );

    if (rangeMatch) {
      const monthIdx = months.indexOf(rangeMatch[1].toLowerCase());
      const startDay = parseInt(rangeMatch[2], 10);
      const endDay = parseInt(rangeMatch[3], 10);
      return {
        start: new Date(year, monthIdx, startDay, 19, 30),
        end: new Date(year, monthIdx, endDay, 22, 0),
      };
    }

    if (singleMatch) {
      const monthIdx = months.indexOf(singleMatch[1].toLowerCase());
      const day = parseInt(singleMatch[2], 10);
      return {
        start: new Date(year, monthIdx, day, 19, 30),
        end: null,
      };
    }

    // Fallback to first of the month from URL
    return {
      start: new Date(year, month, 1, 19, 30),
      end: null,
    };
  }
}
