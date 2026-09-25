/**
 * Event types as defined in Airtable schema
 */
export type EventType = 'Show' | 'Workshop' | 'Jam' | 'Drop-in' | 'Other';

/**
 * Canonical event structure matching Airtable schema
 */
export interface Event {
  title: string;
  start: Date;
  end?: Date;
  venue: string;
  address?: string;
  eventUrl?: string;
  ticketsUrl?: string;
  type?: EventType;
  fingerprint: string;
  sourceId: string;
  sourceIds?: string[];
  canonicalUrl?: string;
  description?: string;
  source: string;
}

/**
 * Airtable record with ID for updates
 */
export interface AirtableEvent extends Event {
  airtableId?: string;
}

/**
 * Fields that should never be overwritten on update
 * (as specified in docs/airtable-schema.md)
 */
export const MANUAL_FIELDS: (keyof Event)[] = ['type'];

/**
 * Source adapter interface - all source adapters must implement this
 */
export interface SourceAdapter {
  readonly name: string;
  fetch(): Promise<Event[]>;
}

/**
 * Sync result for logging/reporting
 */
export interface SyncResult {
  source: string;
  fetched: number;
  created: number;
  updated: number;
  unchanged: number;
  errors: string[];
}
