import type { Event, SourceAdapter } from '../types.js';
import { generateFingerprint } from '../dedupe.js';

const SOURCE_NAME = 'bristol-improv-theatre';
const VENUE_NAME = 'Bristol Improv Theatre';
const VENUE_ADDRESS = '50 Saint Pauls Road, Bristol, BS8 1LP';
const EVENTS_API = 'https://system.spektrix.com/bristolimprovtheatre/api/v3/events';
const INSTANCES_API = 'https://system.spektrix.com/bristolimprovtheatre/api/v3/instances';
const SITE_BASE = 'https://events.improvtheatre.co.uk';

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

    // Spektrix IDs start with the numeric ID used in the site's URL slugs
    const numericId = spektrixEvent.id.match(/^(\d+)/)?.[1] ?? spektrixEvent.id;
    const slug = this.toSlug(spektrixEvent.name) + '-' + numericId;
    const ticketsUrl = `${SITE_BASE}/event/${slug}`;

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

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
