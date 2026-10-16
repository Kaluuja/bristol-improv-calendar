import type { Event } from './types.js';

/**
 * Venues the sync ignores completely: events there never reach Airtable, so
 * they don't land as Pending or show up in the morning brief.
 *
 * The Bristol Improv Theatre closed on 9 Oct 2026, but Headfirst and
 * Eventbrite still list its cancelled dates. Remove its entry to start
 * picking it up again (and re-add its adapter in cli.ts).
 *
 * `venue` is tested against the event's venue name; `anywhere` against its
 * title, venue and links too, because aggregators sometimes glue the venue
 * into the title ("... at Bristol Improv Theatre") or only give a link.
 */
const PAUSED_VENUES: { name: string; venue: RegExp; anywhere: RegExp }[] = [
  {
    name: 'Bristol Improv Theatre',
    venue: /\bimprov theat(re|er)\b/i,
    anywhere: /bristol improv theat(re|er)|improvtheatre\.co\.uk|spektrix\.com\/bristolimprovtheatre/i,
  },
];

export function pausedVenueOf(event: Event): string | undefined {
  const everywhere = [event.title, event.venue, event.address, event.eventUrl, event.ticketsUrl, event.canonicalUrl]
    .filter(Boolean)
    .join(' ');
  return PAUSED_VENUES.find((v) => v.venue.test(event.venue || '') || v.anywhere.test(everywhere))?.name;
}
