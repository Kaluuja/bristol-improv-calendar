import { parse, HTMLElement } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';

const SOURCE_NAME = 'bristol-beacon';
const VENUE_NAME = 'Bristol Beacon';
const VENUE_ADDRESS = 'Trenchard Street, Bristol, BS1 5AR';
const BASE_URL = 'https://bristolbeacon.org';

/**
 * Bristol Beacon website scraper
 * Searches for improv-related events
 */
export class BristolBeaconAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;
  private searchTerm: string;

  constructor(options: { searchTerm?: string } = {}) {
    this.searchTerm = options.searchTerm ?? 'improv';
  }

  async fetch(): Promise<Event[]> {
    const url = `${BASE_URL}/whats-on-all/?search=${encodeURIComponent(this.searchTerm)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Bristol Beacon: ${response.status}`);
    }

    const html = await response.text();
    const root = parse(html);
    const events: Event[] = [];

    // Find event links - they follow pattern /whats-on/[slug]/
    const eventLinks = root.querySelectorAll('a[href*="/whats-on/"]');
    const seenUrls = new Set<string>();

    for (const link of eventLinks) {
      const href = link.getAttribute('href');
      if (!href || seenUrls.has(href)) continue;
      if (href.includes('/whats-on-all')) continue;
      seenUrls.add(href);

      const title = link.text?.trim();
      if (!title || title.length < 3) continue;
      if (this.isNavigationLink(title)) continue;

      const dateInfo = this.findDateNearElement(link);
      const eventUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

      const event: Event = {
        title,
        start: dateInfo.start || new Date(),
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

      if (dateInfo.start) {
        event.fingerprint = generateFingerprint(event);
        events.push(event);
      }
    }

    return events;
  }

  private isNavigationLink(text: string): boolean {
    const navTexts = [
      'book now', 'more info', 'view all', 'see all',
      'what\'s on', 'whats on', 'back', 'next', 'previous',
    ];
    return navTexts.some((nav) => text.toLowerCase().includes(nav));
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

    // Pattern: "30 Jan 2026" or "30-31 Jan 2026"
    const datePattern =
      /(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})/i;

    const match = text.match(datePattern);
    if (match) {
      const startDay = parseInt(match[1], 10);
      const endDay = match[2] ? parseInt(match[2], 10) : null;
      const month = months[match[3].toLowerCase()];
      const year = parseInt(match[4], 10);

      // Try to find time like "at 19:00" or "at 7:30pm"
      const timeMatch = text.match(/(?:at\s+)?(\d{1,2})[.:](\d{2})\s*(am|pm)?/i);
      let hours = 19, minutes = 30;
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const meridiem = timeMatch[3]?.toLowerCase();
        if (meridiem === 'pm' && hours < 12) hours += 12;
        if (meridiem === 'am' && hours === 12) hours = 0;
      }

      const start = new Date(year, month, startDay, hours, minutes);
      const end = endDay ? new Date(year, month, endDay, hours + 2, minutes) : null;
      return { start, end };
    }

    return { start: null, end: null };
  }
}
