import type { Event, SourceAdapter, SyncResult } from './types.js';
import { dedupeEvents, fuzzyDedupeByPrefix, getVenueDisplayName } from './dedupe.js';
import { filterAndClassifyEvents } from './classifier.js';
import { AirtableAdapter } from './adapters/airtable.js';

/**
 * Default minimum date: first day of the previous month.
 * This keeps current-month and previous-month events while dropping older ones.
 */
function getDefaultMinDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
}

export interface PipelineOptions {
  dryRun?: boolean;
  verbose?: boolean;
  minDate?: Date;
}

/**
 * Main sync pipeline
 * 1. Fetch events from all sources
 * 2. Deduplicate across sources
 * 3. Sync to Airtable (respecting manual fields)
 */
export async function runPipeline(
  sources: SourceAdapter[],
  options: PipelineOptions = {}
): Promise<SyncResult[]> {
  const { dryRun = false, verbose = false, minDate = getDefaultMinDate() } = options;
  const results: SyncResult[] = [];

  // Step 1: Fetch from all sources
  console.log('📥 Fetching events from sources...');
  const allEvents: Event[] = [];

  for (const source of sources) {
    const result: SyncResult = {
      source: source.name,
      fetched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      errors: [],
    };

    try {
      if (verbose) console.log(`  Fetching from ${source.name}...`);
      const events = await source.fetch();
      result.fetched = events.length;
      allEvents.push(...events);
      if (verbose) console.log(`  ✓ ${source.name}: ${events.length} events`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(message);
      console.error(`  ✗ ${source.name}: ${message}`);
    }

    results.push(result);
  }

  console.log(`\n📊 Total fetched: ${allEvents.length} events`);

  // Step 2: Deduplicate
  console.log('\n🔍 Deduplicating events...');
  const dedupedEvents = fuzzyDedupeByPrefix(dedupeEvents(allEvents));
  console.log(`  ${allEvents.length} → ${dedupedEvents.length} unique events`);

  // Step 3: Filter and classify
  console.log('\n🎭 Filtering improv events and classifying types...');
  const classifiedEvents = filterAndClassifyEvents(dedupedEvents, { minDate, verbose });
  console.log(`  ${dedupedEvents.length} → ${classifiedEvents.length} improv events (from ${minDate.toISOString().split('T')[0]})`);

  // Step 3.5: Normalize venue display names
  for (const event of classifiedEvents) {
    event.venue = getVenueDisplayName(event.venue);
  }

  if (dryRun) {
    console.log('\n🏃 Dry run - skipping Airtable sync');
    if (verbose) {
      console.log('\nEvents that would be synced:');
      for (const event of classifiedEvents.slice(0, 20)) {
        console.log(`  [${event.type}] ${event.title} @ ${event.venue} (${event.start.toISOString().split('T')[0]})`);
      }
      if (classifiedEvents.length > 20) {
        console.log(`  ... and ${classifiedEvents.length - 20} more`);
      }
    }
    return results;
  }

  // Step 4: Sync to Airtable
  console.log('\n📤 Syncing to Airtable...');
  const airtable = new AirtableAdapter();
  const syncStats = await airtable.sync(classifiedEvents);

  console.log(`  Created: ${syncStats.created}`);
  console.log(`  Updated: ${syncStats.updated}`);
  console.log(`  Unchanged: ${syncStats.unchanged}`);

  // Step 5: Clean up old events past the retention window
  console.log('\n🧹 Cleaning up old events...');
  const deleted = await airtable.cleanup(minDate);
  console.log(`  Deleted: ${deleted} events before ${minDate.toISOString().split('T')[0]}`);

  return results;
}
