import type { Event, SourceAdapter } from '../types.js';
import { parseICSFeed } from './helpers/ics-parser.js';

const SOURCE_NAME = 'prsc';
const VENUE_NAME = 'PRSC';
const VENUE_ADDRESS = '17-25 Jamaica Street, Bristol, BS2 8JP';
const ICS_FEED_URL =
  'https://prsc.org.uk/?post_type=tribe_events&ical=1&eventDisplay=list';

/**
 * PRSC (Peoples Republic of Stokes Croft) ICS feed adapter
 */
export class PRSCAdapter implements SourceAdapter {
  readonly name = SOURCE_NAME;

  async fetch(): Promise<Event[]> {
    return parseICSFeed({
      sourceName: SOURCE_NAME,
      venueName: VENUE_NAME,
      venueAddress: VENUE_ADDRESS,
      feedUrl: ICS_FEED_URL,
    });
  }
}
