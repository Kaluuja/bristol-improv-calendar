import { parse, HTMLElement } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';
import { inferYear } from './helpers/dates.js';

const SOURCE_NAME = 'headfirst';
const BASE_URL = 'https://www.headfirstbristol.co.uk';

interface ListedTime {
  hours: number;
  minutes: number;
  /** The listing's time is really the doors time; the start is on the event page */
  isDoors: boolean;
}

/** "The event starts at <span>19:30</span>." on a Headfirst event page */
export function parseEventPageStart(html: string): { hours: number; minutes: number } | null {
  const match = html.match(/event starts at\s*(?:<[^>]+>\s*)*(\d{1,2})[:.](\d{2})/i);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours <= 23 && minutes <= 59 ? { hours, minutes } : null;
}

/**
 * Headfirst Bristol event scraper
 * Scrapes event listings for comedy/theatre events at key improv venues
 */
export class HeadfirstAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    const pages = [
      '/event-listings/comedy',
      '/event-listings/theatre',
      '/whats-on/hen-and-chicken',
      '/whats-on/prsc',
      '/whats-on/the-wardrobe-theatre',
      '/whats-on/the-folk-house',
      '/whats-on/loco-klub',
    ];

    // Step 1: Fetch all pages and collect JSON-LD times into a combined map
    const pageHtmls: string[] = [];
    const combinedTimeMap = new Map<string, ListedTime>();

    for (const page of pages) {
      try {
        const response = await fetch(`${BASE_URL}${page}`);
        if (!response.ok) continue;

        const html = await response.text();
        pageHtmls.push(html);

        const pageTimes = this.parseJsonLdTimes(html);
        for (const [key, time] of pageTimes) {
          combinedTimeMap.set(key, time);
        }
      } catch {
        // Skip failed pages
      }
    }

    // Step 2: Parse events from all pages using the combined time map
    const events: Event[] = [];
    const seenUrls = new Set<string>();

    const doorsOnly: Event[] = [];
    for (const html of pageHtmls) {
      const pageEvents = this.parseEventsFromHtml(html, seenUrls, combinedTimeMap, doorsOnly);
      events.push(...pageEvents);
    }

    // Step 3: Where the listing only gave the doors time, read the real start
    // time from the event's own page. Keep the doors time if that fails.
    for (let i = 0; i < doorsOnly.length; i += 5) {
      await Promise.all(
        doorsOnly.slice(i, i + 5).map(async (event) => {
          try {
            const response = await fetch(event.eventUrl!);
            if (!response.ok) return;
            const time = parseEventPageStart(await response.text());
            if (time) event.start.setHours(time.hours, time.minutes, 0, 0);
          } catch {
            // Keep the doors time
          }
        })
      );
    }

    return events;
  }

  private parseEventsFromHtml(
    html: string,
    seenUrls: Set<string>,
    timeMap: Map<string, ListedTime>,
    doorsOnly: Event[]
  ): Event[] {
    const root = parse(html);
    const events: Event[] = [];
    const eventLinks = root.querySelectorAll('a[href*="/whats-on/"]');

    for (const link of eventLinks) {
      const href = link.getAttribute('href');
      if (!href || seenUrls.has(href)) continue;
      if (!href.match(/\/whats-on\/[^/]+\/[a-z]{3}-\d{1,2}-[a-z]{3}/i)) continue;
      seenUrls.add(href);

      const title = link.text?.trim();
      if (!title || title.length < 3) continue;
      if (title.match(/^(The )?(Wardrobe|Hen|Chicken|Redgrave|Cube)/i)) continue;

      const dateInfo = this.parseDateFromUrl(href);
      if (!dateInfo.start) continue;

      const eventUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      const dateStr = dateInfo.start.toISOString().split('T')[0];
      // By URL first: the JSON-LD name is often longer than the link text
      // ("Improv Halloween Double Bill (After Dusk / Cult of the Unwritten)").
      const jsonLdTime =
        timeMap.get(eventUrl) ?? timeMap.get(this.normalizeForTimeMatch(title) + '|' + dateStr);

      if (jsonLdTime) {
        dateInfo.start.setHours(jsonLdTime.hours, jsonLdTime.minutes);
      } else {
        const parentTime = this.findTimeInParent(link);
        if (parentTime) {
          dateInfo.start.setHours(parentTime.hours, parentTime.minutes);
        }
      }

      const venue = this.extractVenueFromUrl(href);

      const event: Event = {
        title,
        start: dateInfo.start,
        end: dateInfo.end || undefined,
        venue,
        eventUrl,
        ticketsUrl: eventUrl,
        sourceId: href,
        canonicalUrl: eventUrl,
        source: SOURCE_NAME,
        fingerprint: '',
      };

      event.fingerprint = generateFingerprint(event);
      events.push(event);
      if (jsonLdTime?.isDoors) doorsOnly.push(event);
    }

    return events;
  }

  /** JSON-LD start times, keyed by event URL and by normalised name + date. */
  private parseJsonLdTimes(html: string): Map<string, ListedTime> {
    const timeMap = new Map<string, ListedTime>();
    const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);

    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);
        const events = Array.isArray(data) ? data : [data];

        for (const event of events) {
          if ((event['@type'] === 'Event' || event['@type'] === 'MusicEvent') && event.startDate && event.name) {
            const timeMatch = event.startDate.match(/(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
            if (timeMatch) {
              const time: ListedTime = {
                hours: parseInt(timeMatch[2], 10),
                minutes: parseInt(timeMatch[3], 10),
                // Headfirst gives the doors time as startDate when it has one
                isDoors: event.doorTime === event.startDate,
              };
              timeMap.set(this.normalizeForTimeMatch(event.name) + '|' + timeMatch[1], time);
              if (event.url) timeMap.set(event.url, time);
            }
          }
        }
      } catch {
        // Ignore invalid JSON
      }
    }

    return timeMap;
  }

  private normalizeForTimeMatch(title: string): string {
    return title
      .toLowerCase()
      .replace(/&amp;/g, '&')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private findTimeInParent(element: HTMLElement): { hours: number; minutes: number } | null {
    let current: HTMLElement | null = element;

    // Stay inside the event's own listing card. Climbing further reaches the
    // page's JSON-LD, whose "+00:00" offsets read as a midnight start.
    for (let i = 0; i < 5 && current && current.tagName !== 'BODY'; i++) {
      const text = current.text || '';
      if (text.length > 1000) break;

      const time12Match = text.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)/i);
      if (time12Match) {
        let hours = parseInt(time12Match[1], 10);
        const minutes = parseInt(time12Match[2], 10);
        const isPM = time12Match[3].toLowerCase() === 'pm';

        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        return { hours, minutes };
      }

      const time24Match = text.match(/\b(\d{2}):(\d{2})\b/);
      if (time24Match) {
        const hours = parseInt(time24Match[1], 10);
        const minutes = parseInt(time24Match[2], 10);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          return { hours, minutes };
        }
      }

      current = current.parentNode as HTMLElement;
    }

    return null;
  }

  private extractVenueFromUrl(url: string): string {
    const match = url.match(/\/whats-on\/([^/]+)\//);
    if (match) {
      return match[1]
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Unknown Venue';
  }

  private parseDateFromUrl(url: string): { start: Date | null; end: Date | null } {
    const match = url.match(
      /\/(mon|tue|wed|thu|fri|sat|sun)-(\d{1,2})-(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-/i
    );

    if (match) {
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      };

      const day = parseInt(match[2], 10);
      const month = months[match[3].toLowerCase()];
      const date = new Date(inferYear(month, day, match[1]), month, day, 20, 0);

      return { start: date, end: null };
    }

    return { start: null, end: null };
  }
}
