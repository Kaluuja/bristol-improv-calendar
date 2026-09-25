import type { Event } from './types.js';

/**
 * Normalize a URL for comparison
 * - Remove trailing slashes
 * - Remove protocol
 * - Lowercase
 */
export function normalizeUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .replace(/^www\./, '');
}

/**
 * Known title aliases (normalized form -> canonical form)
 * Used for fingerprint matching
 */
const TITLE_ALIASES: Record<string, string> = {
  'in da hive': 'live in da hive',
};

/**
 * Title corrections - map incorrect titles to correct ones
 * Applied after deduplication to fix known issues
 */
const TITLE_CORRECTIONS: Record<string, string> = {
  'IN DA HIVE: THE IMPROV GAUNTLET': 'Live in da Hive: The Improv Gauntlet',
};

/**
 * Normalize a title for comparison
 * - Lowercase
 * - Remove subtitles (text after colon)
 * - Remove extra whitespace
 * - Remove common punctuation
 * - Apply title aliases
 */
export function normalizeTitle(title: string): string {
  let normalized = title
    .toLowerCase()
    .trim()
    .replace(/:\s*[^:]+$/, '') // Remove subtitle after last colon
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();

  // Check for known title aliases
  for (const [alias, canonical] of Object.entries(TITLE_ALIASES)) {
    if (normalized === alias) {
      return canonical;
    }
  }

  return normalized;
}

/**
 * Known venue aliases for deduplication (maps to canonical key)
 */
const VENUE_ALIASES: Record<string, string> = {
  'space at prsc': 'prsc',
  "people's republic of stoke's croft": 'prsc',
  'peoples republic of stokes croft': 'prsc',
  'prsc': 'prsc',
  'hen & chicken studio': 'hen chicken',
  'hen and chicken studio': 'hen chicken',
  'hen & chicken (studio)': 'hen chicken',
  'hen & chicken (chicken shed)': 'hen chicken',
  'hen and chicken': 'hen chicken',
  'hen chicken': 'hen chicken',
  'tobacco factory theatres': 'tobacco factory',
  'tobacco factory': 'tobacco factory',
  'wardrobe theatre': 'wardrobe theatre',
  'the wardrobe theatre': 'wardrobe theatre',
  'bristol folk house': 'folk house',
  'the bristol folk house': 'folk house',
  'folk house': 'folk house',
};

/**
 * Display names for canonical venue keys
 */
const VENUE_DISPLAY_NAMES: Record<string, string> = {
  'prsc': 'PRSC',
  'hen chicken': 'Hen & Chicken',
  'tobacco factory': 'Tobacco Factory',
  'wardrobe theatre': 'Wardrobe Theatre',
  'folk house': 'The Folk House',
};

/**
 * Get display name for a venue (for Airtable output)
 */
export function getVenueDisplayName(venue: string): string {
  const normalized = normalizeVenue(venue);
  return VENUE_DISPLAY_NAMES[normalized] || venue;
}

/**
 * Normalize venue name for comparison
 */
export function normalizeVenue(venue: string): string {
  let normalized = venue
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and') // Normalize ampersand to 'and'
    .replace(/\s+/g, ' ')
    .replace(/^the\s+/, '')
    .replace(/theatre|theater/g, 'theatre');

  // Check for known aliases
  for (const [alias, canonical] of Object.entries(VENUE_ALIASES)) {
    if (normalized === alias || normalized.includes(alias)) {
      return canonical;
    }
  }

  return normalized;
}

/**
 * Get date-only string for deduplication (YYYY-MM-DD)
 * Using date-only because different sources may report slightly different times
 */
export function getDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate a fingerprint for deduplication
 * Uses: normalized title + date (not time) + normalized venue
 * Time is excluded because sources often report slightly different times for the same event
 */
export function generateFingerprint(event: Pick<Event, 'title' | 'start' | 'venue'>): string {
  const normTitle = normalizeTitle(event.title);
  const dateOnly = getDateOnly(event.start);
  const normVenue = normalizeVenue(event.venue);

  return `${normTitle}|${dateOnly}|${normVenue}`;
}

/**
 * Source priority for deduplication (lower = higher priority)
 * Headfirst preferred, then venue-specific, then Eventbrite
 */
const SOURCE_PRIORITY: Record<string, number> = {
  // Venue-specific sources (highest priority - most accurate titles and links)
  'bristol-improv-theatre': 1,
  'wardrobe-theatre': 1,
  'hen-and-chicken': 1,
  'prsc': 1,
  'tobacco-factory': 1,
  'bristol-beacon': 1,
  'bristol-old-vic': 1,
  'redgrave-theatre': 1,
  'st-georges-bristol': 1,
  'alma-tavern': 1,
  'bristol-folk-house': 1,
  // Headfirst (second priority)
  'headfirst': 2,
  // Eventbrite (lowest priority)
  'eventbrite': 3,
};

/**
 * Get priority for a source (lower = higher priority)
 */
function getSourcePriority(source: string): number {
  return SOURCE_PRIORITY[source] ?? 10;
}

/**
 * Deduplicate events by fingerprint
 * When duplicates found, keeps the event from the higher-priority source
 * and merges sourceIds
 */
export function dedupeEvents(events: Event[]): Event[] {
  const byFingerprint = new Map<string, Event>();

  for (const event of events) {
    const existing = byFingerprint.get(event.fingerprint);

    if (existing) {
      // Merge sourceIds
      const sourceIds = new Set([
        ...(existing.sourceIds || [existing.sourceId]),
        event.sourceId,
      ]);

      // Keep the event from the higher-priority source
      const existingPriority = getSourcePriority(existing.source);
      const newPriority = getSourcePriority(event.source);

      if (newPriority < existingPriority) {
        // New event has higher priority - replace but keep merged sourceIds
        byFingerprint.set(event.fingerprint, { ...event, sourceIds: [...sourceIds] });
      } else {
        // Keep existing but update sourceIds
        existing.sourceIds = [...sourceIds];
      }
    } else {
      byFingerprint.set(event.fingerprint, { ...event });
    }
  }

  // Apply title corrections
  const results = [...byFingerprint.values()];
  for (const event of results) {
    if (TITLE_CORRECTIONS[event.title]) {
      event.title = TITLE_CORRECTIONS[event.title];
    }
  }

  return results;
}

/**
 * Secondary dedup pass: merge events at the same venue/date whose titles share
 * a common prefix of ≥ 2 words covering ≥ 40% of both titles.
 *
 * Catches cases where different sources use slightly different subtitles for the
 * same event (e.g. "Zinezilla Exhibition Preview" vs "Zinezilla Exhibition Opening Night").
 * The higher-priority source wins; the other's sourceIds are merged in.
 */
export function fuzzyDedupeByPrefix(events: Event[]): Event[] {
  // Group by date + normalised venue
  const groups = new Map<string, Event[]>();
  for (const event of events) {
    const key = `${getDateOnly(event.start)}|${normalizeVenue(event.venue)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }

  const absorbed = new Set<Event>();

  for (const group of groups.values()) {
    for (let i = 0; i < group.length; i++) {
      if (absorbed.has(group[i])) continue;
      const aWords = normalizeTitle(group[i].title).split(' ').filter(Boolean);
      const aWordSet = new Set(aWords);

      for (let j = i + 1; j < group.length; j++) {
        if (absorbed.has(group[j])) continue;
        const bWords = normalizeTitle(group[j].title).split(' ').filter(Boolean);

        let isFuzzyDuplicate = false;

        // Check 1: Shared leading-word prefix covers ≥40% of both titles
        let prefixLen = 0;
        while (prefixLen < aWords.length && prefixLen < bWords.length && aWords[prefixLen] === bWords[prefixLen]) {
          prefixLen++;
        }
        if (prefixLen >= 2 && prefixLen / aWords.length >= 0.4 && prefixLen / bWords.length >= 0.4) {
          isFuzzyDuplicate = true;
        }

        // Check 2: Token-set overlap for reordered titles (e.g. "FREE X" vs "X - Free Session")
        // Requires times within 60 minutes as a guard against different events at the same venue
        if (!isFuzzyDuplicate) {
          const timeDiffMinutes = Math.abs(group[i].start.getTime() - group[j].start.getTime()) / 60000;
          if (timeDiffMinutes <= 60) {
            const sharedCount = bWords.filter(w => aWordSet.has(w)).length;
            const minLen = Math.min(aWords.length, bWords.length);
            if (sharedCount >= 3 && sharedCount / minLen >= 0.7) {
              isFuzzyDuplicate = true;
            }
          }
        }

        // Check 3: Same ticket URL — identical ticketing link is a definitive duplicate signal
        // A non-trivial URL (has a path) uniquely identifies an event
        if (!isFuzzyDuplicate) {
          const aTickets = group[i].ticketsUrl;
          const bTickets = group[j].ticketsUrl;
          if (aTickets && bTickets) {
            const normA = normalizeUrl(aTickets);
            const normB = normalizeUrl(bTickets);
            if (normA === normB && normA.includes('/')) {
              isFuzzyDuplicate = true;
            }
          }
        }

        if (!isFuzzyDuplicate) continue;

        // Fuzzy duplicate — keep higher-priority source
        const aPriority = getSourcePriority(group[i].source);
        const bPriority = getSourcePriority(group[j].source);
        const [winner, loser] = bPriority < aPriority ? [group[j], group[i]] : [group[i], group[j]];

        winner.sourceIds = [
          ...new Set([
            ...(winner.sourceIds ?? [winner.sourceId]),
            ...(loser.sourceIds ?? [loser.sourceId]),
          ]),
        ];
        absorbed.add(loser);
      }
    }
  }

  return events.filter((e) => !absorbed.has(e));
}
