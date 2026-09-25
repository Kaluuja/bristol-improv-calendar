import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHealthReport, formatReport, hasNewProblems, KNOWN_BROKEN } from './health.js';
import type { SyncResult } from './types.js';

const result = (source: string, fetched: number, errors: string[] = []): SyncResult =>
  ({ source, fetched, created: 0, updated: 0, unchanged: 0, errors });

const knownSource = Object.keys(KNOWN_BROKEN)[0];

test('healthy run is quiet and passes', () => {
  const report = buildHealthReport([result('prsc', 14)], []);
  assert.equal(hasNewProblems(report), false);
  assert.equal(formatReport(report), null);
});

test('a newly failing source fails the run and is reported', () => {
  const report = buildHealthReport([result('prsc', 0, ['Failed to fetch ICS feed: 403'])], []);
  assert.equal(hasNewProblems(report), true);
  assert.match(formatReport(report)!, /prsc: Failed to fetch ICS feed: 403/);
});

test('a source returning nothing fails the run', () => {
  const report = buildHealthReport([result('tobacco-factory', 0)], []);
  assert.equal(hasNewProblems(report), true);
  assert.match(formatReport(report)!, /returning nothing[\s\S]*tobacco-factory/);
});

test('known-broken sources alone neither fail the run nor send an alert', () => {
  const report = buildHealthReport([result(knownSource, 0, ['403'])], []);
  assert.equal(hasNewProblems(report), false);
  assert.equal(formatReport(report), null);
});

test('known-broken sources ride along when something else is reported', () => {
  const report = buildHealthReport([result(knownSource, 0, ['403'])], ['2026-10-15 Some show @ BIT']);
  assert.equal(hasNewProblems(report), false); // retirements are news, not failures
  const text = formatReport(report)!;
  assert.match(text, /Taken off the calendar[\s\S]*Some show/);
  assert.match(text, new RegExp(`Still broken \\(known\\)[\\s\\S]*${knownSource}`));
});

test('a known-broken source that recovers is flagged for removal', () => {
  const report = buildHealthReport([result(knownSource, 12)], ['x']);
  assert.match(formatReport(report)!, /working again \(12 events\)/);
});
