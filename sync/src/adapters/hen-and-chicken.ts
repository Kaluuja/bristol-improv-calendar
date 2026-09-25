import type { Event, SourceAdapter } from '../types.js';
import { parseICSFeed } from './helpers/ics-parser.js';

const SOURCE_NAME = 'hen-and-chicken';
const VENUE_NAME = 'Hen & Chicken';
const VENUE_ADDRESS = '210 North Street, Bedminster, Bristol, BS3 1JF';
const ICS_FEED_URL =
  'https://www.henandchicken.com/?post_type=tribe_events&ical=1&eventDisplay=list';

/**
 * Hen & Chicken venue ICS feed adapter
 */
export class HenAndChickenAdapter implements SourceAdapter {
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
