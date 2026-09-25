import type { Event, EventType } from './types.js';

/**
 * Venues that are always improv-related
 */
const IMPROV_VENUES = [
  /bristol\s*improv\s*theatre/i,
  /improvtheatre\.co\.uk/i,
];

/**
 * Shows/brands that are always included regardless of keywords
 * These are well-known improv shows that may not have obvious keywords
 */
const ALWAYS_INCLUDE = [
  // Local Bristol shows
  /\bup\s*the\s*antics\b/i,
  /\bantics\b.*\bjoke\s*show\b/i,
  /\bjoke\s*show\b.*\bantics\b/i,
  /\bcloser\s*each\s*day\b/i,
  // UK touring improv shows
  /murder.*she.*didn.t.*write/i,
  /\bshowstopper\b/i, // Showstopper! The Improvised Musical
  /\baustentatious\b/i,
  /\bcomedy\s*store\s*players\b/i,
  /\bnoise\s*next\s*door\b/i,
  /\bpaul\s*merton.s\s*impro/i,
  /\bstephen\s*frost.s\s*impro/i,
  /\bmc\s*hammersmit/i,
  /\binstant\s*noodling\b/i,
  /\bracing\s*minds\b/i,
  /\bshoot\s*from\s*the\s*hip\b/i,
  /\bimpromptu\s*shakespeare\b/i,
  // Local Bristol improv shows/groups
  /\bbrothers\s*grin\b/i,
  /\bbeansville\b/i,
  /\bblame\s*of\s*thrones\b/i,
  /\bwasteland\b/i, // Tales From The Wasteland
  /\bjust\s*for\s*a\s*moment\b/i, // Recurring improv show at Folk House
];

/**
 * Strong indicators of improv content
 */
const IMPROV_SIGNALS = [
  /\bimprov\b/i,
  /\bimprovised\b/i,
  /\bimprovisation\b/i,
  /\btheatresports\b/i,
  /\bmaestro\b/i,
  /\blong\s*form\b/i,
  /\bshort\s*form\b/i,
  /\bscene\s*work\b/i,
  /\byes\s*and\b/i,
];

/**
 * Strong indicators of non-improv content
 */
const NOT_IMPROV_SIGNALS = [
  /\bjazz\b/i,
  /\blive\s*music\b/i,
  /\bgig\b/i,
  /\bopen\s*mic\b/i,
  /\bstand[- ]?up\b/i,
  /\bcomedy\s*night\b/i,
  /\bquiz\b/i,
  /\bkaraoke\b/i,
  /\btribute\b/i,
  /\bdj\b/i,
  /\bmagic\s*show\b/i,
  /\bmusical\b/i,
  /\bconcert\b/i,
  /\bpanto(?:mime)?\b/i,
];

/**
 * Keywords for event type classification (title-first approach)
 */
const TYPE_KEYWORDS = {
  'Drop-in': {
    title: [
      /\bdrop[- ]?ins?\b/i, // "drop-in", "drop-ins", "drop in"
      /\bdropins?\b/i, // "dropin", "dropins"
    ],
    text: [/\blunchtime\b/i, /\btaster\b/i],
  },
  Workshop: {
    title: [
      /\bworkshop\b/i,
      /\bclass\b/i,
      /\bcourse\b/i,
      /\blevel\s*\d/i, // "Level 1", "Level 2", etc.
      /\bgrounding\b/i, // "Grounding in Game"
      /\btechnique\b/i, // "Meisner Technique", "Acting Technique"
      /\bskills\b/i, // "MC Skills"
      /\bintro(?:duction)?\s+to\b/i, // "Introduction to", "Intro to"
    ],
    text: [/\btraining\b/i, /\bmasterclass\b/i, /\blearn\b/i, /\bintensive\b/i],
  },
  Jam: {
    title: [/\bjam\b/i, /\blab\b/i],
    text: [/\bjam\s*night\b/i, /\bopen\s*jam\b/i],
  },
  Show: {
    title: [/\bshowcase\b/i, /\bstudent\s*showcase\b/i, /\bspotlight\b/i, /\bgauntlet\b/i],
    text: [],
  },
};

export interface ClassificationResult {
  type: EventType;
  isImprov: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason?: string;
}

/**
 * Build searchable text from event fields
 */
function buildSearchText(event: Event): string {
  return [
    event.title,
    event.venue,
    event.description,
    event.eventUrl,
    event.ticketsUrl,
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
}

/**
 * Check if any pattern matches the text
 */
function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

/**
 * Classify whether an event is improv-related
 */
export function isImprovRelated(event: Event): { isImprov: boolean; confidence: 'high' | 'medium' | 'low'; reason?: string } {
  const title = event.title.toLowerCase();
  const text = buildSearchText(event);

  // 1. Venue-based (highest confidence)
  if (matchesAny(text, IMPROV_VENUES)) {
    return { isImprov: true, confidence: 'high', reason: 'improv venue' };
  }

  // 2. Always-include list (specific shows/brands)
  if (matchesAny(title, ALWAYS_INCLUDE)) {
    return { isImprov: true, confidence: 'high', reason: 'known improv show' };
  }

  // 3. Explicit non-improv signals (check first to exclude)
  if (matchesAny(text, NOT_IMPROV_SIGNALS)) {
    // But check if it also has strong improv signals
    if (matchesAny(text, IMPROV_SIGNALS)) {
      // Conflicting signals - could be "jazz improv" vs "improv comedy"
      // Check if improv is in the title (stronger signal)
      if (/\bimprov/i.test(title)) {
        return { isImprov: true, confidence: 'medium', reason: 'improv in title despite exclusion keywords' };
      }
      return { isImprov: false, confidence: 'low', reason: 'conflicting signals' };
    }
    return { isImprov: false, confidence: 'high', reason: 'non-improv keywords' };
  }

  // 4. Improv signals
  if (matchesAny(text, IMPROV_SIGNALS)) {
    return { isImprov: true, confidence: 'high', reason: 'improv keywords' };
  }

  // 5. Source-based hints (BIT ICS feed, etc.)
  if (event.source === 'bristol-improv-theatre') {
    return { isImprov: true, confidence: 'high', reason: 'BIT source' };
  }

  // 6. Default - not enough signals
  return { isImprov: false, confidence: 'low', reason: 'no improv signals' };
}

/**
 * Classify event type (Show, Workshop, Jam, Drop-in, Other)
 */
export function classifyEventType(event: Event): EventType {
  const title = event.title.toLowerCase();
  const text = buildSearchText(event);

  // 1. HIGHEST PRIORITY: "showcase" in title = always Show
  // This takes precedence over "Level X" workshop patterns
  if (/\bshowcase\b/i.test(title)) {
    return 'Show';
  }

  // 2. Title-based classification (check each type's title patterns)
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS) as [EventType, typeof TYPE_KEYWORDS.Workshop][]) {
    if (matchesAny(title, keywords.title)) {
      return type;
    }
  }

  // 3. Secondary cues from full text
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS) as [EventType, typeof TYPE_KEYWORDS.Workshop][]) {
    if (keywords.text.length > 0 && matchesAny(text, keywords.text)) {
      return type;
    }
  }

  // 4. BIT-style workshop pattern: "[Topic] with [Instructor Name]"
  // e.g., "Improv for Actors with Maria Peters", "Making Interactive Theatre with Dylan Lowena"
  if (/\bwith\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s*$/.test(event.title)) {
    // Has "with FirstName LastName" at end - likely a workshop/masterclass
    // Check for teaching-related subjects
    if (/\b(improv|acting|sketch|theatre|theater|scene|character|meisner|making|writing)\b/i.test(title)) {
      return 'Workshop';
    }
  }

  // 5. Time-based heuristics
  if (event.start && event.end) {
    const durationHours = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
    const startHour = event.start.getHours();

    // Long daytime events = Workshop
    if (durationHours >= 3.5 && startHour >= 9 && startHour <= 16) {
      return 'Workshop';
    }

    // Short evening events = Show
    if (durationHours > 0 && durationHours <= 3.25 && startHour >= 17 && startHour <= 22) {
      return 'Show';
    }
  }

  // 6. Default
  return 'Show';
}

/**
 * Full classification of an event
 */
export function classifyEvent(event: Event): ClassificationResult {
  const improvResult = isImprovRelated(event);
  const type = classifyEventType(event);

  return {
    type,
    isImprov: improvResult.isImprov,
    confidence: improvResult.confidence,
    reason: improvResult.reason,
  };
}

/**
 * Filter and classify events
 * Returns only improv-related events with their types assigned
 */
export function filterAndClassifyEvents(
  events: Event[],
  options: { minDate?: Date; verbose?: boolean } = {}
): Event[] {
  const { minDate, verbose } = options;
  const results: Event[] = [];
  let filtered = { date: 0, notImprov: 0 };

  for (const event of events) {
    // Date filter
    if (minDate && event.start < minDate) {
      filtered.date++;
      continue;
    }

    // Language filter — drop events with non-Latin script titles (Cyrillic, CJK, Arabic, etc.)
    if (/[\u0370-\u03FF\u0400-\u04FF\u0590-\u06FF\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(event.title)) {
      if (verbose) console.log(`  ⊘ Filtered (non-English title): "${event.title}"`);
      continue;
    }

    // Improv classification
    const classification = classifyEvent(event);

    if (!classification.isImprov) {
      filtered.notImprov++;
      if (verbose) {
        console.log(`  ⊘ Filtered: "${event.title}" (${classification.reason})`);
      }
      continue;
    }

    // Assign type and include
    results.push({
      ...event,
      type: classification.type,
    });

    if (verbose) {
      console.log(`  ✓ ${classification.type}: "${event.title}" (${classification.reason})`);
    }
  }

  if (verbose) {
    console.log(`\n  Filtered: ${filtered.date} before min date, ${filtered.notImprov} not improv-related`);
  }

  return results;
}
