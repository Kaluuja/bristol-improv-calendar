import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';

const SOURCE_NAME = 'bristol-improv-theatre';
const VENUE_NAME = 'Bristol Improv Theatre';
const VENUE_ADDRESS = '50 Saint Pauls Road, Bristol, BS8 1LP';
const EVENTS_API = 'https://system.spektrix.com/bristolimprovtheatre/api/v3/events';
const INSTANCES_API = 'https://system.spektrix.com/bristolimprovtheatre/api/v3/instances';
const SITE_BASE = 'https://improvtheatre.co.uk';

interface SpektrixEvent {
  id: string;
  name: string;
  description?: string;
  duration?: number; // minutes
}

interface SpektrixInstance {
  id: string;
  start: string; // ISO datetime, no timezone — UK local time
  event: { id: string };
  cancelled: boolean;
  attribute_InstanceTitle?: string;
}

export class BristolImprovTheatreScraperAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    const [spektrixEvents, instances] = await Promise.all([
      this.fetchAll<SpektrixEvent>(EVENTS_API),
      this.fetchAll<SpektrixInstance>(INSTANCES_API),
    ]);

    const eventMap = new Map(spektrixEvents.map(e => [e.id, e]));
    const events: Event[] = [];

    for (const instance of instances) {
      if (instance.cancelled) continue;
      const spektrixEvent = eventMap.get(instance.event.id);
      if (!spektrixEvent) continue;

      const event = this.toEvent(instance, spektrixEvent);
      if (event) events.push(event);
    }

    return events;
  }

  private async fetchAll<T>(baseUrl: string): Promise<T[]> {
    const resp = await fetch(`${baseUrl}?pageSize=500`);
    if (!resp.ok) throw new Error(`Spektrix API ${resp.status}: ${baseUrl}`);
    return resp.json() as Promise<T[]>;
  }

  private toEvent(instance: SpektrixInstance, spektrixEvent: SpektrixEvent): Event | null {
    const start = new Date(instance.start);
    if (isNaN(start.getTime())) return null;

    const title = instance.attribute_InstanceTitle?.trim() || spektrixEvent.name.trim();

    const end = spektrixEvent.duration
      ? new Date(start.getTime() + spektrixEvent.duration * 60_000)
      : undefined;

    const ticketsUrl = eventPageUrl(spektrixEvent);

    const event: Event = {
      title,
      start,
      end,
      venue: VENUE_NAME,
      address: VENUE_ADDRESS,
      eventUrl: ticketsUrl,
      ticketsUrl,
      description: spektrixEvent.description || undefined,
      sourceId: instance.id,
      canonicalUrl: ticketsUrl,
      source: SOURCE_NAME,
      fingerprint: '',
    };

    event.fingerprint = generateFingerprint(event);
    return event;
  }
}

/**
 * Build the event's page on the BIT website, where the date picker and
 * basket live. Spektrix's `webUrl` is empty, so the URL has to be rebuilt
 * the way the site (a Blazor app, launched Sept 2026) builds it:
 *
 *   /event/<slug>-<first 4 chars of the Spektrix event ID>
 *
 * - slug: lowercase, drop everything except letters, digits, spaces and
 *   hyphens, squash runs of spaces, then spaces -> hyphens. Existing
 *   hyphens are kept, so "School - Student Showcases!" becomes
 *   "school---student-showcases", but "Presence & Hosting" becomes
 *   "presence-hosting".
 * - ID: literally the first 4 characters, not the leading digits, so
 *   "11801AKPS…" -> "1180" and "601APNN…" -> "601a".
 *
 * A wrong slug doesn't 404: the site quietly shows its generic homepage,
 * so any drift here fails silently. Verified against all 71 live events
 * on 25 Sept 2026.
 */
export function eventPageUrl(spektrixEvent: Pick<SpektrixEvent, 'id' | 'name'>): string {
  const slug = spektrixEvent.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const shortId = spektrixEvent.id.slice(0, 4).toLowerCase();
  return `${SITE_BASE}/event/${slug}-${shortId}`;
}
