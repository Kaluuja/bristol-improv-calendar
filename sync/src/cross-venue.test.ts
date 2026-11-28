import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dedupeAcrossVenues, generateFingerprint } from './dedupe.js';
import type { Event } from './types.js';

const ev = (source: string, venue: string, start: string, title = "Festive Improv Double Bill: Cult of the Unwritten & What's Your Star Sign?"): Event => {
  const e = { title, venue, start: new Date(start), source, sourceId: `${source}-1`, eventUrl: '', fingerprint: '' } as Event;
  e.fingerprint = generateFingerprint(e);
  return e;
};

test('the same show under two venue spellings is kept once, from Headfirst over Tickettailor', () => {
  const tt = ev('alma-tickettailor', 'Alma Tavern & Theatre', '2026-12-02T20:00:00Z');
  const hf = ev('headfirst', 'Alma Tavern Theatre', '2026-12-02T20:00:00Z');
  const kept = dedupeAcrossVenues([tt, hf]);
  assert.equal(kept.length, 1);
  assert.equal(kept[0].source, 'headfirst');
  assert.deepEqual(kept[0].sourceIds?.sort(), ['alma-tickettailor-1', 'headfirst-1']);
});

test('a matinee and an evening performance both stay', () => {
  const kept = dedupeAcrossVenues([
    ev('bristol-old-vic', 'Bristol Old Vic', '2027-01-31T13:30:00Z', 'Austentatious'.concat(' Live')),
    ev('headfirst', 'Bristol Old Vic', '2027-01-31T19:30:00Z', 'Austentatious'.concat(' Live')),
  ]);
  assert.equal(kept.length, 2);
});
