import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateFingerprint, looseFingerprint } from './dedupe.js';
import { buildLooseIndex } from './adapters/airtable.js';

const fp = (title: string) =>
  generateFingerprint({ title, start: new Date('2026-11-19T19:30:00Z'), venue: 'Bristol Old Vic' });

test('a relisting that only changes hyphens, spacing or capitals has the same loose key', () => {
  const original = fp('Kiell Smith-Bynoe & Friends: Kool Story Bro');
  const relisted = fp('KIELL SMITH BYNOE & FRIENDS: KOOL STORY BRO');
  assert.notEqual(original, relisted); // the bug: exact fingerprints differ
  assert.equal(looseFingerprint(original), looseFingerprint(relisted));
});

test('different shows keep different loose keys', () => {
  assert.notEqual(looseFingerprint(fp('Closer Each Day')), looseFingerprint(fp('Closer Each Night')));
});

test('the loose index prefers the approved record over a rejected relisting', () => {
  const rec = (id: string, Status: string) => ({ id, get: (f: string) => (f === 'Status' ? Status : undefined) });
  const existing = new Map([
    [fp('Kiell Smith-Bynoe & Friends: Kool Story Bro'), rec('approved', 'Approved')],
    [fp('KIELL SMITH BYNOE & FRIENDS: KOOL STORY BRO'), rec('rejected', 'Rejected')],
  ]);
  const index = buildLooseIndex(existing);
  assert.equal(index.size, 1);
  assert.equal(index.get(looseFingerprint(fp('Kiell Smith Bynoe and friends')))?.id, undefined); // "and" ≠ "&": no false match
  assert.equal([...index.values()][0].id, 'approved');
});
