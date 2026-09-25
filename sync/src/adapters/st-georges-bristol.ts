import { parse, HTMLElement } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';

const SOURCE_NAME = 'st-georges-bristol';
const VENUE_NAME = "St George's Bristol";
const VENUE_ADDRESS = 'Great George Street, Bristol, BS1 5RR';
const BASE_URL = 'https://www.stgeorgesbristol.co.uk';
const LISTING_URL = `${BASE_URL}/whats-on/`;

/**
 * St George's Bristol website scraper
 */
export class StGeorgesBristolAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    const response = await fetch(LISTING_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch St George's Bristol: ${response.status}`);
    }

    const html = await response.text();
    const root = parse(html);
    const events: Event[] = [];

    // Find event links
    const eventLinks = root.querySelectorAll('a[href*="/whats-on/"]');
    const seenUrls = new Set<string>();

    for (const link of eventLinks) {
      const href = link.getAttribute('href');
      if (!href || seenUrls.has(href)) continue;
      if (href === '/whats-on/' || href === LISTING_URL) continue;
      seenUrls.add(href);

      // Get title
      const title = link.text?.trim();
      if (!title || title.length < 3) continue;
      if (this.isNavigationText(title)) continue;

      // Find date near the link
      const dateInfo = this.findDateNearElement(link);
      if (!dateInfo.start) continue;

      const eventUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

      const event: Event = {
        title,
        start: dateInfo.start,
        end: dateInfo.end || undefined,
        venue: VENUE_NAME,
        address: VENUE_ADDRESS,
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

    return events;
  }

  private isNavigationText(text: string): boolean {
    const navTexts = [
      'book now', 'buy tickets', 'more info', 'view all',
      'what\'s on', 'home', 'contact', 'about',
    ];
    return navTexts.some((nav) => text.toLowerCase() === nav);
  }

  private findDateNearElement(
    element: HTMLElement
  ): { start: Date | null; end: Date | null } {
    let current: HTMLElement | null = element;
    for (let i = 0; i < 5 && current; i++) {
      const text = current.text || '';
      const dateMatch = this.parseDate(text);
      if (dateMatch.start) return dateMatch;
      current = current.parentNode as HTMLElement;
    }
    return { start: null, end: null };
  }

  private parseDate(text: string): { start: Date | null; end: Date | null } {
    const months: Record<string, number> = {
      jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
      apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
      aug: 7, august: 7, sep: 8, sept: 8, september: 8,
      oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
    };

    // Pattern: "Fri 30 Jan 2026" or "30 Jan 2026"
    const dateMatch = text.match(
      /(?:mon|tue|wed|thu|fri|sat|sun)?\s*(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})/i
    );

    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = months[dateMatch[2].toLowerCase()];
      const year = parseInt(dateMatch[3], 10);
      return {
        start: new Date(year, month, day, 19, 30),
        end: null,
      };
    }

    return { start: null, end: null };
  }
}
