import { parse } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';
import { inferYear } from './helpers/dates.js';

const SOURCE_NAME = 'bristol-old-vic';
const VENUE_NAME = 'Bristol Old Vic';
const VENUE_ADDRESS = 'King Street, Bristol, BS1 4ED';
const BASE_URL = 'https://bristololdvic.org.uk';
const MAX_PAGES = 6;

/**
 * Bristol Old Vic website scraper
 * Fetches multiple pages and expands date ranges into individual events
 */
export class BristolOldVicAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    const events: Event[] = [];
    const seenUrls = new Set<string>();

    // Fetch all pages
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = page === 1
        ? `${BASE_URL}/whats-on`
        : `${BASE_URL}/whats-on/page-${page}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          // Stop if page doesn't exist
          if (response.status === 404) break;
          continue;
        }

        const html = await response.text();
        const pageEvents = this.parseEventsFromHtml(html, seenUrls);
        events.push(...pageEvents);
      } catch (error) {
        // Continue to next page on error
        console.error(`Error fetching page ${page}:`, error);
      }
    }

    return events;
  }

  private parseEventsFromHtml(html: string, seenUrls: Set<string>): Event[] {
    const root = parse(html);
    const events: Event[] = [];

    // Find event cards
    const eventCards = root.querySelectorAll('a[href*="/whats-on/"]');

    for (const card of eventCards) {
      const href = card.getAttribute('href');
      if (!href || seenUrls.has(href)) continue;
      if (href === '/whats-on' || href === '/whats-on/' || href.match(/\/whats-on\/page-\d+/)) continue;
      seenUrls.add(href);

      // Get title
      const titleEl = card.querySelector('.c-card__title, h3, h2');
      const title = titleEl?.text?.trim() || card.text?.trim();
      if (!title || title.length < 3) continue;

      // Parse date from card content
      const dateInfo = this.parseDate(card.text || '');
      if (!dateInfo.dates.length) continue;

      const eventUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

      // Create an event for each date in the range
      for (const date of dateInfo.dates) {
        const event: Event = {
          title,
          start: date,
          venue: VENUE_NAME,
          address: VENUE_ADDRESS,
          eventUrl,
          ticketsUrl: eventUrl,
          sourceId: `${href}-${date.toISOString().split('T')[0]}`,
          canonicalUrl: eventUrl,
          source: SOURCE_NAME,
          fingerprint: '',
        };

        event.fingerprint = generateFingerprint(event);
        events.push(event);
      }
    }

    return events;
  }

  private parseDate(text: string): { dates: Date[] } {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    // Pattern: "16–19 Sep" or "29–31 Jan"
    const rangeMatch = text.match(
      /(\d{1,2})[\s–-]+(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i
    );

    // Pattern: "4 Feb" or "16 Sep"
    const singleMatch = text.match(
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i
    );

    if (rangeMatch) {
      const startDay = parseInt(rangeMatch[1], 10);
      const endDay = parseInt(rangeMatch[2], 10);
      const month = months[rangeMatch[3].toLowerCase()];

      const year = inferYear(month, startDay);

      // Generate all dates in the range
      const dates: Date[] = [];
      for (let day = startDay; day <= endDay; day++) {
        dates.push(new Date(year, month, day, 19, 30));
      }
      return { dates };
    }

    if (singleMatch) {
      const day = parseInt(singleMatch[1], 10);
      const month = months[singleMatch[2].toLowerCase()];

      const year = inferYear(month, day);

      return { dates: [new Date(year, month, day, 19, 30)] };
    }

    return { dates: [] };
  }
}
