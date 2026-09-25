import ICAL from 'ical.js';
import type { Event } from '../../types.js';
import { generateFingerprint } from '../../dedupe.js';

export interface ICSParserOptions {
  sourceName: string;
  venueName: string;
  venueAddress?: string;
  feedUrl: string;
}

/**
 * Shared ICS feed parser for The Events Calendar WordPress plugin
 */
export async function parseICSFeed(options: ICSParserOptions): Promise<Event[]> {
  const { sourceName, venueName, venueAddress, feedUrl } = options;

  const response = await fetch(feedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ICS feed: ${response.status}`);
  }

  const icsText = await response.text();
  const jcalData = ICAL.parse(icsText);
  const vcalendar = new ICAL.Component(jcalData);
  const vevents = vcalendar.getAllSubcomponents('vevent');

  const events: Event[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    const startDate = event.startDate?.toJSDate();
    if (!startDate) continue;

    const endDate = event.endDate?.toJSDate();
    const rawTitle = event.summary || 'Untitled Event';
    const title = cleanTitle(rawTitle);
    const description = event.description || undefined;
    const location = event.location || venueName;
    const uid = event.uid || '';
    const url = vevent.getFirstPropertyValue('url') as string | undefined;

    // Extract address from location if not provided
    const address = venueAddress || extractAddress(location);

    const eventObj: Event = {
      title,
      start: startDate,
      end: endDate,
      venue: venueName,
      address,
      eventUrl: url,
      ticketsUrl: url,
      description,
      sourceId: uid,
      canonicalUrl: url,
      source: sourceName,
      fingerprint: '',
    };

    eventObj.fingerprint = generateFingerprint(eventObj);
    events.push(eventObj);
  }

  return events;
}

/**
 * Try to extract a street address from a location string
 */
function extractAddress(location: string): string | undefined {
  if (!location) return undefined;
  // Location often contains venue name + address, return as-is for now
  return location;
}

/**
 * Clean title by removing category prefixes like "Theatre:", "Jazz:", etc.
 */
function cleanTitle(title: string): string {
  // Remove common category prefixes (case-insensitive)
  const prefixes = [
    /^Theatre:\s*/i,
    /^Comedy:\s*/i,
    /^Jazz:\s*/i,
    /^Music:\s*/i,
    /^Dance:\s*/i,
    /^Spoken Word:\s*/i,
    /^Film:\s*/i,
    /^Kids:\s*/i,
    /^Family:\s*/i,
  ];

  let cleaned = title;
  for (const prefix of prefixes) {
    cleaned = cleaned.replace(prefix, '');
  }

  return cleaned.trim();
}
