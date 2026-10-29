import { parse } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';
import { inferYear } from './helpers/dates.js';

const SOURCE_NAME = 'bristol-old-vic';
const VENUE_NAME = 'Bristol Old Vic';
const VENUE_ADDRESS = 'King Street, Bristol, BS1 4ED';
const BASE_URL = 'https://bristololdvic.org.uk';
const MAX_PAGES = 6;

interface ListedShow {
  title: string;
  href: string;
  eventUrl: string;
  /** From the listing card, at an assumed 7:30pm. Used if the show page fails. */
  listedDates: Date[];
}

/**
 * Bristol Old Vic website scraper.
 * Reads the listing pages for titles, then each show's own page for its
 * description and real performance times. The listing alone only gives a
 * title, which isn't enough for the classifier: "Kool Story Bro" and
 * "Lifegame" were both dropped as not improv (Oct 2026).
 */
export class BristolOldVicAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    const shows: ListedShow[] = [];
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
        shows.push(...this.parseListing(html, seenUrls));
      } catch (error) {
        // Continue to next page on error
        console.error(`Error fetching page ${page}:`, error);
      }
    }

    // Read each show's page, five at a time. Fall back to the listing dates.
    const events: Event[] = [];
    for (let i = 0; i < shows.length; i += 5) {
      const batch = await Promise.all(
        shows.slice(i, i + 5).map(async (show) => {
          try {
            const response = await fetch(show.eventUrl);
            if (response.ok) return this.toEvents(show, parseShowPage(await response.text()));
          } catch {
            // Use the listing dates
          }
          return this.toEvents(show, { dates: show.listedDates });
        })
      );
      events.push(...batch.flat());
    }

    return events;
  }

  private parseListing(html: string, seenUrls: Set<string>): ListedShow[] {
    const root = parse(html);
    const shows: ListedShow[] = [];

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
      shows.push({ title, href, eventUrl, listedDates: dateInfo.dates });
    }

    return shows;
  }

  private toEvents(show: ListedShow, page: { dates: Date[]; description?: string }): Event[] {
    const dates = page.dates.length ? page.dates : show.listedDates;
    return dates.map((date) => {
      const event: Event = {
        title: show.title,
        start: date,
        venue: VENUE_NAME,
        address: VENUE_ADDRESS,
        eventUrl: show.eventUrl,
        ticketsUrl: show.eventUrl,
        description: page.description,
        sourceId: `${show.href}-${date.toISOString().split('T')[0]}`,
        canonicalUrl: show.eventUrl,
        source: SOURCE_NAME,
        fingerprint: '',
      };
      event.fingerprint = generateFingerprint(event);
      return event;
    });
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

/**
 * A show page lists each performance as `.c-instance` with
 * `<time datetime="2026-11-19T19:30:00+00:00">`. Only the wall-clock part is
 * used (it matches the "7:30pm" shown beside it), built as London local time.
 *
 * One performance per day, the latest: the fingerprint is title + date, so a
 * matinee and an evening show would collapse into one record anyway.
 */
export function parseShowPage(html: string): { dates: Date[]; description?: string } {
  const root = parse(html);

  const byDay = new Map<string, Date>();
  for (const time of root.querySelectorAll('.c-instance time[datetime]')) {
    const m = time.getAttribute('datetime')?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) continue;
    const date = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    const day = m[0].slice(0, 10);
    if (!byDay.has(day) || byDay.get(day)! < date) byDay.set(day, date);
  }
  const dates = [...byDay.values()];

  const description = root.querySelectorAll('.o-text-block')
    .map((el) => el.text.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n') || undefined;

  return { dates, description };
}
