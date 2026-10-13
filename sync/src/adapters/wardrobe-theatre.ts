import { parse } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';
import { inferYear } from './helpers/dates.js';

const SOURCE_NAME = 'wardrobe-theatre';
const VENUE_NAME = 'Wardrobe Theatre';
const VENUE_ADDRESS = '25 West Street, Old Market, Bristol, BS2 0DF';
const BASE_URL = 'https://thewardrobetheatre.com';

// The site is WordPress: every show (past ones too) is in this endpoint, with
// its genre tags, description and first/last dates.
const SHOWS_API = `${BASE_URL}/wp-json/wp/v2/shows`;
const SHOWS_API_FIELDS = 'slug,title,excerpt,content,class_list,acf';

/**
 * Used only if the shows API fails, so the source doesn't drop to zero.
 */
const FALLBACK_SHOWS = [
  { slug: 'closer-each-day', title: 'Closer Each Day: The Improvised Soap Opera' },
  { slug: 'impromptu-shakespeare', title: 'Impromptu Shakespeare' },
];

/**
 * Wording that marks a show as improv even when the Wardrobe hasn't tagged it.
 */
const IMPROV_WORDING: { pattern: RegExp; label: string }[] = [
  { pattern: /\bimprov(?:i[sz]ed|i[sz]ing|i[sz]ation)?\b/i, label: 'improv' },
  { pattern: /\bunscripted\b/i, label: 'unscripted' },
  { pattern: /\bmade\s+up\s+on\s+the\s+spot\b/i, label: 'made up on the spot' },
];

interface WardrobeCandidate {
  slug: string;
  title: string;
  /** Set only when the Wardrobe tags the show as Improv. */
  improvReason?: string;
  description?: string;
}

export interface WardrobeShow {
  slug: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  class_list?: string[];
  acf?: { event_end_date?: string; archived_show?: boolean };
}

interface PerformanceDate {
  date: Date;
  time: string;
  bookingUrl?: string;
}

/** Strip tags and decode the entities WordPress uses (&#8217;, &amp;, ...). */
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Why a show counts as improv: the Wardrobe's own "Improv" genre tag, or
 * improv wording in its title or description. Undefined means it doesn't.
 */
export function wardrobeImprovReason(show: WardrobeShow): string | undefined {
  if (show.class_list?.includes('shows_genre-improv')) return 'Wardrobe genre: improv';
  const text = [show.title?.rendered, show.excerpt?.rendered, show.content?.rendered]
    .map((html) => htmlToText(html || ''))
    .join(' ');
  const hit = IMPROV_WORDING.find(({ pattern }) => pattern.test(text));
  return hit ? `Wardrobe listing says "${hit.label}"` : undefined;
}

/** Shows whose last date (acf.event_end_date, "YYYYMMDD") is today or later. */
export function isCurrentShow(show: WardrobeShow, today: string): boolean {
  const end = show.acf?.event_end_date;
  return Boolean(end) && !show.acf?.archived_show && end! >= today;
}

/**
 * Wardrobe Theatre adapter
 * Finds improv shows through the site's shows API, then reads each show's page
 * for its performance dates and times.
 */
export class WardrobeTheatreAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    let shows: WardrobeCandidate[];
    try {
      shows = await this.findImprovShows();
    } catch (error) {
      console.error(`Wardrobe shows API failed, checking known shows only: ${(error as Error).message}`);
      shows = FALLBACK_SHOWS;
    }

    const events: Event[] = [];
    for (const show of shows) {
      const showEvents = await this.fetchShowPage(show);
      events.push(...showEvents);
    }

    return events;
  }

  private async findImprovShows(): Promise<WardrobeCandidate[]> {
    const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '');
    const found: WardrobeCandidate[] = [];

    for (let page = 1, totalPages = 1; page <= totalPages; page++) {
      const response = await fetch(`${SHOWS_API}?per_page=100&page=${page}&_fields=${SHOWS_API_FIELDS}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      if (!response.ok) throw new Error(`${SHOWS_API} page ${page}: ${response.status}`);
      totalPages = Number(response.headers.get('x-wp-totalpages')) || 1;

      for (const show of (await response.json()) as WardrobeShow[]) {
        if (!isCurrentShow(show, today)) continue;
        const reason = wardrobeImprovReason(show);
        if (!reason) continue;
        found.push({
          slug: show.slug,
          title: htmlToText(show.title?.rendered || show.slug),
          // Only the Wardrobe's own Improv tag skips the classifier's exclusions;
          // shows matched on wording alone are judged on their description.
          improvReason: show.class_list?.includes('shows_genre-improv') ? reason : undefined,
          description: htmlToText(show.content?.rendered || show.excerpt?.rendered || ''),
        });
      }
    }

    return found;
  }

  /**
   * Fetch all performance dates from a show's individual page
   */
  private async fetchShowPage({ slug, title, improvReason, description }: WardrobeCandidate): Promise<Event[]> {
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
        improvReason,
        description,
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
