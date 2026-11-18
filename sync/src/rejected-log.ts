import fs from 'node:fs';
import type { Event } from './types.js';
import { isImprovRelated } from './classifier.js';

/**
 * A running log of future events the classifier turned down, so we can check
 * what we're missing (Ste, Nov 2026: measure before deciding on Jev or any
 * other AI second opinion).
 *
 * Set REJECTED_FILE (Dockhead does) to turn it on. Entries are kept by link,
 * with when each was first and last seen, and dropped 60 days after the event.
 * Skim it, or ask Claude to: anything that's really improv means a new act
 * name for improv-acts.ts or a keyword for classifier.ts.
 */
export interface RejectedEntry {
  title: string;
  venue: string;
  date: string;
  url: string;
  source: string;
  reason: string;
  description?: string;
  firstSeen: string;
  lastSeen: string;
}

const KEEP_DAYS_AFTER_EVENT = 60;

export function updateRejectedLog(
  existing: Record<string, RejectedEntry>,
  rejected: Event[],
  now: Date
): Record<string, RejectedEntry> {
  const today = now.toISOString().slice(0, 10);
  const cutoff = new Date(now.getTime() - KEEP_DAYS_AFTER_EVENT * 86_400_000).toISOString().slice(0, 10);
  const log: Record<string, RejectedEntry> = {};

  for (const [key, entry] of Object.entries(existing)) {
    if (entry.date >= cutoff) log[key] = entry;
  }
  for (const event of rejected) {
    const key = event.canonicalUrl || event.eventUrl || `${event.source}|${event.title}|${event.start.toISOString()}`;
    log[key] = {
      title: event.title,
      venue: event.venue || '',
      date: event.start.toISOString().slice(0, 10),
      url: event.eventUrl || event.ticketsUrl || '',
      source: event.source,
      reason: isImprovRelated(event).reason || '',
      ...(event.description ? { description: event.description.slice(0, 500) } : {}),
      firstSeen: log[key]?.firstSeen || today,
      lastSeen: today,
    };
  }
  return log;
}

/** Future events in `all` that didn't make it into `kept` */
export function futureRejects(all: Event[], kept: Event[], now: Date): Event[] {
  const keptPrints = new Set(kept.map((e) => e.fingerprint));
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return all.filter((e) => e.start >= midnight && !keptPrints.has(e.fingerprint));
}

export function writeRejectedLog(all: Event[], kept: Event[], now = new Date()): void {
  const file = process.env.REJECTED_FILE;
  if (!file) return;
  try {
    let existing: Record<string, RejectedEntry> = {};
    try {
      existing = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      // First run
    }
    const log = updateRejectedLog(existing, futureRejects(all, kept, now), now);
    fs.writeFileSync(file, JSON.stringify(log, null, 2));
    console.log(`  Logged ${Object.keys(log).length} rejected event(s) to ${file}`);
  } catch (error) {
    // Never fail a sync over the log
    console.warn(`  Couldn't write the rejected-events log: ${error instanceof Error ? error.message : error}`);
  }
}
