/**
 * Improv acts, shows and companies to always pick up, whatever the listing
 * says and wherever they play. Add a name when you hear of one.
 *
 * Plain names, matched against the event title, ignoring case, spacing and
 * punctuation ("Real Positive Poles" also matches "REAL POSITIVE-POLES").
 * A name too generic to match on its own (e.g. "After Dusk") belongs in
 * ALWAYS_INCLUDE in classifier.ts, as a regex with extra context instead.
 */
export const IMPROV_ACTS: string[] = [
  // Bristol
  'Real Positive Poles',
  'The Y Files',
  'Brothers Grin',
  'Beansville',
  'Blame of Thrones',
  'Just For A Moment',
  'Closer Each Day',
  'Up the Antics',
  'Tales From The Wasteland',
  // Touring
  'Showstopper',
  'Austentatious',
  'Comedy Store Players',
  'Noise Next Door',
  'Instant Noodling',
  'Racing Minds',
  'Shoot From The Hip',
  'Impromptu Shakespeare',
];

/** "Real Positive Poles" → /\breal\W*positive\W*poles\b/i */
export const IMPROV_ACT_PATTERNS: RegExp[] = IMPROV_ACTS.map((name) => {
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  return new RegExp(`\\b${words.join('\\W*')}\\b`, 'i');
});
