import Airtable, { FieldSet } from 'airtable';
import type { Event } from '../types.js';

/**
 * Fields that should never be overwritten on update
 * (as specified in docs/airtable-schema.md)
 */
const PROTECTED_FIELDS = ['Type', 'Status'];

/**
 * Source value that indicates a manually-added record
 * Records with this source will be skipped entirely during sync
 */
const MANUAL_SOURCE = 'manual';

/**
 * Source value for auto-synced records
 */
const SYNC_SOURCE = 'Sync';

interface SyncStats {
  created: number;
  updated: number;
  unchanged: number;
}

type AirtableFields = FieldSet & {
  Title?: string;
  Start?: string;
  End?: string;
  Venue?: string;
  Address?: string;
  'Event URL'?: string;
  'Tickets URL'?: string;
  Type?: string;
  Status?: string;
  Source?: string;
  Fingerprint?: string;
  'Source Event ID'?: string;
  'First Seen'?: string;
  'Last Seen'?: string;
};

/**
 * Filter out undefined values from an object
 */
function filterDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}

/**
 * Map Event to Airtable field names (matching docs/airtable-schema.md)
 * Note: Address field removed - add to Airtable base if needed
 */
function eventToAirtableFields(event: Event): AirtableFields {
  const now = new Date().toISOString();
  return filterDefined({
    Title: event.title,
    Start: event.start.toISOString(),
    End: event.end?.toISOString(),
    Venue: event.venue,
    'Event URL': event.eventUrl,
    'Tickets URL': event.ticketsUrl,
    Type: event.type,
    Fingerprint: event.fingerprint,
    'Source Event ID': event.sourceId,
    'Last Seen': now,
  }) as AirtableFields;
}

/**
 * Fields for new records (includes First Seen and Type from classifier)
 */
function eventToNewRecordFields(event: Event): AirtableFields {
  const now = new Date().toISOString();
  const baseFields = eventToAirtableFields(event);
  return {
    ...baseFields,
    'First Seen': now,
    Status: 'Pending',
  };
}

/**
 * Remove protected fields from an update payload
 */
function stripProtectedFields(fields: AirtableFields): AirtableFields {
  const result = { ...fields };
  for (const field of PROTECTED_FIELDS) {
    delete result[field as keyof AirtableFields];
  }
  return result;
}

/**
 * Airtable adapter for syncing events
 * Protects manual fields from being overwritten on update
 */
export class AirtableAdapter {
  private base: Airtable.Base;
  private table: Airtable.Table<AirtableFields>;

  constructor() {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Events';

    if (!apiKey || !baseId) {
      throw new Error(
        'Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID environment variables'
      );
    }

    this.base = new Airtable({ apiKey }).base(baseId);
    this.table = this.base(tableName);
  }

  /**
   * Fetch all existing events from Airtable
   * Returns a map of fingerprint -> record
   */
  async fetchExisting(): Promise<Map<string, Airtable.Record<AirtableFields>>> {
    const records = new Map<string, Airtable.Record<AirtableFields>>();

    await this.table
      .select({
        fields: ['Fingerprint', 'Source Event ID', 'Title', 'Start', 'Source'],
      })
      .eachPage((pageRecords, fetchNextPage) => {
        for (const record of pageRecords) {
          const fingerprint = record.get('Fingerprint') as string;
          if (fingerprint) {
            records.set(fingerprint, record);
          }
        }
        fetchNextPage();
      });

    return records;
  }

  /**
   * Sync events to Airtable
   * - Creates new records for events not in Airtable
   * - Updates existing records (without overwriting protected fields)
   * - Skips records with Source = 'manual' (manually-added entries)
   */
  async sync(events: Event[]): Promise<SyncStats> {
    const stats: SyncStats = { created: 0, updated: 0, unchanged: 0 };

    // Fetch existing records
    const existing = await this.fetchExisting();

    // Batch operations
    const toCreate: AirtableFields[] = [];
    const toUpdate: { id: string; fields: AirtableFields }[] = [];

    for (const event of events) {
      const existingRecord = existing.get(event.fingerprint);

      if (existingRecord) {
        // Skip manual entries - never overwrite them
        const source = existingRecord.get('Source') as string;
        if (source?.toLowerCase() === MANUAL_SOURCE) {
          stats.unchanged++;
          continue;
        }

        // Update existing record (strip protected fields)
        const fields = stripProtectedFields(eventToAirtableFields(event));
        toUpdate.push({ id: existingRecord.id, fields });
      } else {
        // Create new record with Sync source
        const fields = eventToNewRecordFields(event);
        fields.Source = SYNC_SOURCE;
        toCreate.push(fields);
      }
    }

    // Create new records in batches of 10 (Airtable limit)
    for (let i = 0; i < toCreate.length; i += 10) {
      const batch = toCreate.slice(i, i + 10);
      await this.table.create(batch.map((fields) => ({ fields })));
      stats.created += batch.length;
    }

    // Update existing records in batches of 10
    for (let i = 0; i < toUpdate.length; i += 10) {
      const batch = toUpdate.slice(i, i + 10);
      await this.table.update(batch);
      stats.updated += batch.length;
    }

    return stats;
  }

  /**
   * Take future events off the calendar when no source has listed them for
   * `maxAgeDays`: flips Approved/Pending to 'Needs review' (the export only
   * publishes Approved, so they drop off the site but nothing is deleted).
   * Catches events a venue has cancelled or delisted, records left behind
   * when a venue changes website, and phantom next-year dates from year
   * inference. Must run after sync(), which refreshes Last Seen.
   * Returns the retired records' titles for logging.
   */
  async retireUnseen(maxAgeDays: number): Promise<string[]> {
    const staleBefore = new Date(Date.now() - maxAgeDays * 86_400_000);
    const now = new Date();
    const toRetire: { id: string; label: string }[] = [];

    await this.table
      .select({ fields: ['Title', 'Start', 'Venue', 'Status', 'Source', 'Last Seen'] })
      .eachPage((records, fetchNextPage) => {
        for (const record of records) {
          const source = record.get('Source') as string;
          if (source?.toLowerCase() === MANUAL_SOURCE) continue;

          const status = record.get('Status') as string;
          if (status !== 'Approved' && status !== 'Pending') continue;

          const start = record.get('Start') as string;
          if (!start || new Date(start) < now) continue;

          const lastSeen = record.get('Last Seen') as string;
          if (lastSeen && new Date(lastSeen) >= staleBefore) continue;

          toRetire.push({
            id: record.id,
            label: `${start.split('T')[0]} ${record.get('Title')} @ ${record.get('Venue')} (last seen ${lastSeen?.split('T')[0] ?? 'never'})`,
          });
        }
        fetchNextPage();
      });

    for (let i = 0; i < toRetire.length; i += 10) {
      const batch = toRetire.slice(i, i + 10);
      await this.table.update(batch.map(({ id }) => ({ id, fields: { Status: 'Needs review' } })));
    }

    return toRetire.map((r) => r.label);
  }

  /**
   * Delete Airtable records whose Start date is before the cutoff.
   * Skips manually-added records (Source = 'manual').
   * Returns the number of deleted records.
   */
  async cleanup(cutoffDate: Date): Promise<number> {
    const toDelete: string[] = [];

    await this.table
      .select({ fields: ['Start', 'Source'] })
      .eachPage((records, fetchNextPage) => {
        for (const record of records) {
          const source = record.get('Source') as string;
          if (source?.toLowerCase() === MANUAL_SOURCE) continue;

          const start = record.get('Start') as string;
          if (start && new Date(start) < cutoffDate) {
            toDelete.push(record.id);
          }
        }
        fetchNextPage();
      });

    // Delete in batches of 10 (Airtable limit)
    for (let i = 0; i < toDelete.length; i += 10) {
      const batch = toDelete.slice(i, i + 10);
      await this.table.destroy(batch);
    }

    return toDelete.length;
  }
}
