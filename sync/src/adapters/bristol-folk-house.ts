import { parse } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';

const SOURCE_NAME = 'bristol-folk-house';
const VENUE_NAME = 'Bristol Folk House';
const BASE_URL = 'https://www.bristolfolkhouse.co.uk';
const MAX_PAGES = 8;

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

/**
 * Bristol Folk House website scraper
 * Scrapes live music / events listing pages (paginated)
 */
export class BristolFolkHouseAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    const events: Event[] = [];
    const seenUrls = new Set<string>();

    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `${BASE_URL}/live-music/?page=${page}`;
      let html: string;

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        if (!response.ok) break;
        html = await response.text();
      } catch {
        break;
      }

      const root = parse(html);
      const eventLinks = root.querySelectorAll('a[href*="/live-music/event/"]');

      if (eventLinks.length === 0) break;

      let foundNew = false;
      for (const link of eventLinks) {
        const href = link.getAttribute('href');
        if (!href || seenUrls.has(href)) continue;

        const titleEl = link.querySelector('h4, h3, h2');
        const title = titleEl?.text?.trim() || link.text?.trim();
        if (!title || title.length < 3) continue;

        // Only mark seen once we have a valid title (avoids thumbnail links blocking title links)
        seenUrls.add(href);
        foundNew = true;

        // Date and time are in sibling/parent text near the link
        const container = link.parentNode?.parentNode || link.parentNode;
        const containerText = container?.text || '';

        const dateTime = this.parseDateAndTime(containerText);
        if (!dateTime.start) continue;

        const eventUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

        const event: Event = {
          title,
          start: dateTime.start,
          end: dateTime.end || undefined,
          venue: VENUE_NAME,
          eventUrl,
          ticketsUrl: eventUrl,
          sourceId: href,
          canonicalUrl: eventUrl,
          source: SOURCE_NAME,
          fingerprint: '',
        };

        event.fingerprint = generateFingerprint(event);
        events.push(event);
      }

      if (!foundNew) break;
    }

    return events;
  }

  private parseDateAndTime(text: string): { start: Date | null; end: Date | null } {
    // Match "Saturday 11 April 2026" or "11 April 2026"
    const dateMatch = text.match(
      /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)?\s*(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i
    );
    if (!dateMatch) return { start: null, end: null };

    const day = parseInt(dateMatch[1], 10);
    const month = MONTHS[dateMatch[2].toLowerCase()];
    const year = parseInt(dateMatch[3], 10);

    // Match "19:00 - 23:00" or "19:00"
    const timeMatch = text.match(/(\d{2}):(\d{2})\s*[-–]\s*(\d{2}):(\d{2})/);
    const startHour = timeMatch ? parseInt(timeMatch[1], 10) : 19;
    const startMin = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const endHour = timeMatch ? parseInt(timeMatch[3], 10) : undefined;
    const endMin = timeMatch ? parseInt(timeMatch[4], 10) : undefined;

    const start = new Date(year, month, day, startHour, startMin);
    const end = endHour !== undefined ? new Date(year, month, day, endHour, endMin!) : null;

    return { start, end };
  }
}
