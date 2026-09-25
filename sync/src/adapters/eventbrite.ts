import { parse } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';

const SOURCE_NAME = 'eventbrite';
const BASE_URL = 'https://www.eventbrite.co.uk';

/**
 * Bristol area postcodes and location keywords
 */
const BRISTOL_INDICATORS = [
  /\bbristol\b/i,
  /\bbs\d{1,2}\b/i, // BS postcodes
  /\bbedminster\b/i,
  /\bclifton\b/i,
  /\bstokes?\s*croft\b/i,
  /\bold\s*market\b/i,
  /\bredland\b/i,
  /\bmontpelier\b/i,
  /\beaston\b/i,
  /\bsouthville\b/i,
];

interface EventbriteEvent {
  id: string;
  name: string;
  url: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  primary_venue?: {
    name: string;
    address?: {
      address_1?: string;
      city?: string;
      postal_code?: string;
    };
  };
  summary?: string;
  tickets_url?: string;
}

interface ServerData {
  search_data?: {
    events?: {
      results?: EventbriteEvent[];
    };
  };
}

/**
 * Eventbrite search scraper
 * Extracts events from embedded __SERVER_DATA__ JSON
 */
export class EventbriteAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;
  private searchTerm: string;
  private location: string;

  constructor(options: { searchTerm?: string; location?: string } = {}) {
    this.searchTerm = options.searchTerm ?? 'improv';
    this.location = options.location ?? 'bristol';
  }

  async fetch(): Promise<Event[]> {
    const url = `${BASE_URL}/d/united-kingdom--${this.location}/${encodeURIComponent(this.searchTerm)}/`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Eventbrite: ${response.status}`);
    }

    const html = await response.text();
    const events: Event[] = [];

    // Extract events array from __SERVER_DATA__ using bracket matching
    // (The full JSON is often malformed, so we extract just the events array)
    const eventsArray = this.extractEventsArray(html);

    if (eventsArray) {
      for (const item of eventsArray) {
        const event = this.parseEvent(item);
        if (event) events.push(event);
      }
    }

    // Fallback: try to scrape from HTML structure
    if (events.length === 0) {
      const root = parse(html);
      const eventLinks = root.querySelectorAll('a[href*="/e/"]');

      for (const link of eventLinks) {
        const href = link.getAttribute('href');
        if (!href) continue;

        const title = link.text?.trim();
        if (!title || title.length < 5) continue;

        const event: Event = {
          title,
          start: new Date(), // Placeholder - would need to scrape individual pages
          venue: 'See Eventbrite',
          eventUrl: href.startsWith('http') ? href : `${BASE_URL}${href}`,
          ticketsUrl: href.startsWith('http') ? href : `${BASE_URL}${href}`,
          sourceId: href,
          canonicalUrl: href,
          source: SOURCE_NAME,
          fingerprint: '',
        };

        event.fingerprint = generateFingerprint(event);
        events.push(event);
      }
    }

    return events;
  }

  private parseEvent(item: EventbriteEvent): Event | null {
    const title = item.name;
    if (!title) return null;

    // Filter out non-Bristol events
    if (!this.isBristolArea(item)) {
      return null;
    }

    const startDate = this.parseDateTime(item.start_date, item.start_time);
    if (!startDate) return null;

    const endDate = item.end_date
      ? this.parseDateTime(item.end_date, item.end_time) || undefined
      : undefined;

    const venue = item.primary_venue?.name || 'See Eventbrite';
    const address = item.primary_venue?.address
      ? [
          item.primary_venue.address.address_1,
          item.primary_venue.address.city,
          item.primary_venue.address.postal_code,
        ]
          .filter(Boolean)
          .join(', ')
      : undefined;

    const event: Event = {
      title,
      start: startDate,
      end: endDate,
      venue,
      address,
      description: item.summary,
      eventUrl: item.url,
      ticketsUrl: item.tickets_url || item.url,
      sourceId: `eventbrite-${item.id}`,
      canonicalUrl: item.url,
      source: SOURCE_NAME,
      fingerprint: '',
    };

    event.fingerprint = generateFingerprint(event);
    return event;
  }

  private parseDateTime(dateStr: string, timeStr?: string): Date | null {
    try {
      // Eventbrite dates: "2026-02-22" and times: "14:00"
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;

      if (timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        date.setHours(hours || 19, minutes || 0, 0, 0);
      } else {
        date.setHours(19, 0, 0, 0);
      }

      return date;
    } catch {
      return null;
    }
  }

  /**
   * Check if event is in the Bristol area
   */
  private isBristolArea(item: EventbriteEvent): boolean {
    const locationText = [
      item.primary_venue?.name,
      item.primary_venue?.address?.city,
      item.primary_venue?.address?.address_1,
      item.primary_venue?.address?.postal_code,
    ]
      .filter(Boolean)
      .join(' ');

    return BRISTOL_INDICATORS.some((pattern) => pattern.test(locationText));
  }

  /**
   * Extract events array from HTML using bracket matching
   * The full __SERVER_DATA__ JSON is often malformed, so we extract just the events array
   */
  private extractEventsArray(html: string): EventbriteEvent[] | null {
    const startMarker = '"results":[';
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) return null;

    // Find matching closing bracket using depth counting
    let depth = 0;
    let endIdx = startIdx + startMarker.length - 1;
    for (let i = startIdx + startMarker.length - 1; i < html.length && i < startIdx + 200000; i++) {
      if (html[i] === '[') depth++;
      else if (html[i] === ']') {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    const eventsJson = html.substring(startIdx + startMarker.length - 1, endIdx);

    try {
      return JSON.parse(eventsJson) as EventbriteEvent[];
    } catch {
      return null;
    }
  }
}
