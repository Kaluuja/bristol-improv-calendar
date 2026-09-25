import './tz.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDateOnly, generateFingerprint } from './dedupe.js';

test('adapters building local times get true London instants', () => {
  // How the adapters construct a 19:30 BST curtain
  assert.equal(new Date(2026, 8, 16, 19, 30).toISOString(), '2026-09-16T18:30:00.000Z');
  // ...and a GMT one
  assert.equal(new Date(2026, 11, 2, 19, 30).toISOString(), '2026-12-02T19:30:00.000Z');
  // Spektrix sends naive local times
  assert.equal(new Date('2026-09-11T19:30:00').toISOString(), '2026-09-11T18:30:00.000Z');
});

test('fingerprint date is the London calendar date', () => {
  // 00:30 BST on 5 July is 23:30 UTC on 4 July
  assert.equal(getDateOnly(new Date('2026-07-04T23:30:00Z')), '2026-07-05');
  assert.equal(getDateOnly(new Date('2026-12-02T19:30:00Z')), '2026-12-02');
});

test('fingerprints are unchanged for ordinary evening shows', () => {
  // Pre-fix records stored 19:30 BST as 19:30Z; the fixed sync stores 18:30Z.
  // Same fingerprint, so re-syncing updates records in place, no duplicates.
  const base = { title: 'Closer Each Day', venue: 'Wardrobe Theatre' };
  assert.equal(
    generateFingerprint({ ...base, start: new Date('2026-09-16T19:30:00Z') }),
    generateFingerprint({ ...base, start: new Date('2026-09-16T18:30:00Z') })
  );
});
