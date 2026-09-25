import { parse, HTMLElement } from 'node-html-parser';
import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';
import { inferYear } from './helpers/dates.js';

const SOURCE_NAME = 'tobacco-factory';
const VENUE_NAME = 'Tobacco Factory Theatres';
const VENUE_ADDRESS = 'Raleigh Road, Southville, Bristol, BS3 1TF';
const BASE_URL = 'https://tobaccofactorytheatres.com';
const LISTING_URL = `${BASE_URL}/whats-on/`;

/**
 * Tobacco Factory Theatres website scraper
 */
export class TobaccoFactoryAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    const response = await fetch(LISTING_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Tobacco Factory: ${response.status}`);
    }

    const html = await response.text();
    const root = parse(html);
    const events: Event[] = [];

    // Find all show links - they follow pattern /shows/[slug]/
    const showLinks = root.querySelectorAll('a[href*="/shows/"]');
    const seenUrls = new Set<string>();

    for (const link of showLinks) {
      const href = link.getAttribute('href');
      if (!href || seenUrls.has(href)) continue;
      seenUrls.add(href);

      // Get title from heading inside link, image alt, or slug
      let title = '';

      // Try heading inside link first
      const heading = link.querySelector('h2, h3, h4');
      if (heading) {
        title = heading.text?.trim() || '';
      }

      // Try image alt text
      if (!title) {
        const img = link.querySelector('img');
        title = img?.getAttribute('alt')?.trim() || '';
      }

      // Fall back to extracting from URL slug
      if (!title) {
        const slugMatch = href.match(/\/shows\/([^/]+)/);
        if (slugMatch) {
          title = slugMatch[1]
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
        }
      }

      if (!title || title === 'Book Now' || title === 'More Info') continue;

      // Parse date from nearby text
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

      // Only include events with valid dates
      if (dateInfo.start) {
        event.fingerprint = generateFingerprint(event);
        events.push(event);
      }
    }

    return events;
  }

  private findDateNearElement(
    element: HTMLElement
  ): { start: Date | null; end: Date | null } {
    // Walk up to find container with date info
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
    // Match patterns like "07 Jun", "24-27 Jun 2026", "07 Jun - 07 Jun 2026"
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    // Pattern: "DD Mon" or "DD Mon YYYY" or "DD-DD Mon YYYY" or "DD Mon - DD Mon YYYY"
    const singleDateMatch = text.match(
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?/i
    );

    const rangeDateMatch = text.match(
      /(\d{1,2})(?:\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))?\s*[-–]\s*(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?/i
    );

    if (rangeDateMatch) {
      const startDay = parseInt(rangeDateMatch[1], 10);
      const endDay = parseInt(rangeDateMatch[2], 10);
      const month = months[rangeDateMatch[3].toLowerCase()];
      const year = rangeDateMatch[4]
        ? parseInt(rangeDateMatch[4], 10)
        : inferYear(month, startDay);

      return {
        start: new Date(year, month, startDay, 19, 30),
        end: new Date(year, month, endDay, 22, 0),
      };
    }

    if (singleDateMatch) {
      const day = parseInt(singleDateMatch[1], 10);
      const month = months[singleDateMatch[2].toLowerCase()];
      const year = singleDateMatch[3]
        ? parseInt(singleDateMatch[3], 10)
        : inferYear(month, day);

      return {
        start: new Date(year, month, day, 19, 30),
        end: null,
      };
    }

    return { start: null, end: null };
  }
}
