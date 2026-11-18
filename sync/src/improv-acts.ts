/**
 * Improv acts, shows and companies to always pick up, whatever else the
 * listing says and wherever they play. Add a name when you hear of one.
 *
 * Plain names, matched against the event title, ignoring case, spacing and
 * punctuation ("Real Positive Poles" also matches "REAL POSITIVE-POLES").
 */
export const IMPROV_ACTS: string[] = [
  // Tilt (also matched anywhere in the listing, links included: see classifier.ts)
  'Tilt Improv',
  'Wednesday Night Improv',
  'This Is Your Musical',
  'This Is Your Panto',
  // Bristol
  'Real Positive Poles',
  'The Y Files',
  'Cult of the Unwritten',
  'Sometimes We Wear Shirts',
  'Instant Wit',
  'Unscripted Players',
  'The Supermalts',
  'Bish Bosh Bash',
  'Drag Dungeoneers',
  'Deathmatch Improv',
  'Crime Scene Improvisation',
  'David Elms',
  'Improv Spotlight',
  'Improv Gauntlet',
  'Bristol Longform',
  'BLC Double Dip',
  'Brothers Grin',
  'Beansville',
  'Blame of Thrones',
  'Just For A Moment',
  'Closer Each Day',
  'Up the Antics',
  'Tales From The Wasteland',
  // Touring
  'Kool Story Bro',
  'Showstopper',
  'Austentatious',
  'Comedy Store Players',
  'Noise Next Door',
  'Instant Noodling',
  'Racing Minds',
  'Shoot From The Hip',
  'Impromptu Shakespeare',
];

/**
 * Names that are ordinary words too ("Birdwatchers" could be a nature walk).
 * These count only when the listing also mentions improv, comedy, sketch or
 * fooling somewhere (title, description or links).
 */
export const IMPROV_ACTS_NEEDING_CONTEXT: string[] = [
  "What's Your Star Sign",
  'Birdwatchers',
  'The Groundhogs',
  'Last Day On Earth',
  'Lifegame',
  'The Maydays',
  'Denouement',
  'Title Goes Here',
  'In the Cards',
  'All Made Up',
  'Failing Forward',
];

/** "Real Positive Poles" → /\breal\W*positive\W*poles\b/i */
function toPattern(name: string): RegExp {
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  return new RegExp(`\\b${words.join("[\\W_]*")}\\b`, 'i');
}

export const IMPROV_ACT_PATTERNS: RegExp[] = IMPROV_ACTS.map(toPattern);
export const CONTEXT_ACT_PATTERNS: RegExp[] = IMPROV_ACTS_NEEDING_CONTEXT.map(toPattern);
export const ACT_CONTEXT = /\b(improv\w*|impro|comedy|comedic|sketch(es)?|fooling|clown\w*)\b/i;
