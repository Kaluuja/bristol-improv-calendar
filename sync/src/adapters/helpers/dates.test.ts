import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inferYear } from './dates.js';

const at = (iso: string) => new Date(iso);

test('show listed for tonight stays this year (the phantom-2027 bug)', () => {
  // Mon 9 Feb 2026, run at 10:00 on the day
  assert.equal(inferYear(1, 9, 'Mon', at('2026-02-09T10:00:00')), 2026);
  assert.equal(inferYear(1, 9, undefined, at('2026-02-09T10:00:00')), 2026);
});

test('weekday picks next year for a January date listed in December', () => {
  // Fri 15 Jan 2027
  assert.equal(inferYear(0, 15, 'Fri', at('2026-12-01T12:00:00')), 2027);
  assert.equal(inferYear(0, 15, 'friday', at('2026-12-01T12:00:00')), 2027);
});

test('weekday picks last year for a December date still listed in January', () => {
  // Mon 28 Dec 2026
  assert.equal(inferYear(11, 28, 'Mon', at('2027-01-05T12:00:00')), 2026);
});

test('without a weekday: recent past stays this year, long past rolls on', () => {
  const now = at('2026-09-25T12:00:00');
  assert.equal(inferYear(7, 20, undefined, now), 2026); // 20 Aug, 36 days ago
  assert.equal(inferYear(0, 15, undefined, now), 2027); // 15 Jan, 8 months ago
  assert.equal(inferYear(11, 5, undefined, now), 2026); // 5 Dec, upcoming
});

test('unrecognised weekday falls back to the 60-day rule', () => {
  assert.equal(inferYear(0, 15, 'xyz', at('2026-09-25T12:00:00')), 2027);
});
