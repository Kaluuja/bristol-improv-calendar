import test from 'node:test';
import assert from 'node:assert/strict';

import { buildICS, transformEvent, mergeManualEvents } from './export-events.mjs';

const record = (fields, id = 'event-1') => ({ id, fields });
const NOW = new Date('2026-06-01T00:00:00Z');

test('buildICS writes London local times with a TZID', () => {
  const ics = buildICS([
    record({ Start: '2026-06-01T14:00:00', Title: 'Test event' }),
  ], NOW);

  assert.match(ics, /DTSTART;TZID=Europe\/London:20260601T140000/);
  assert.match(ics, /DTEND;TZID=Europe\/London:20260601T160000/);
});

// The regression this file exists for: Airtable stamps Start as UTC, but the clock
// reading is already London wall time. Converting it applied BST twice and put every
// summer event an hour late - a 19:30 curtain published as 20:30.
test('a UTC-stamped BST start keeps its wall-clock time', () => {
  const fields = {
    Start: '2026-09-16T19:30:00.000Z',
    End: '2026-09-16T21:30:00.000Z',
    Title: "Murder, She Didn't Write",
    Venue: 'Bristol Old Vic',
  };

  const ics = buildICS([record(fields)], NOW);
  assert.match(ics, /DTSTART;TZID=Europe\/London:20260916T193000/);
  assert.match(ics, /DTEND;TZID=Europe\/London:20260916T213000/);

  assert.deepEqual(transformEvent(record(fields)), {
    date: '2026-09-16',
    title: "Murder, She Didn't Write",
    venue: 'Bristol Old Vic',
    time: '19:30–21:30',
    type: 'show',
    url: '',
    description: '',
  });
});

test('a GMT start is unaffected', () => {
  const fields = { Start: '2026-12-02T19:30:00.000Z', Title: 'Winter show' };

  assert.match(buildICS([record(fields)], NOW), /DTSTART;TZID=Europe\/London:20261202T193000/);
  assert.equal(transformEvent(record(fields)).time, '19:30');
});

// A late start must not roll into the next day, which is what converting a
// UTC-stamped 23:30 to London used to do.
test('a late start stays on its own date', () => {
  const event = transformEvent(record({ Start: '2026-07-04T23:30:00.000Z', Title: 'Late one' }));
  assert.equal(event.date, '2026-07-04');
  assert.equal(event.time, '23:30');
});

test('a missing end time defaults to two hours later', () => {
  const ics = buildICS([record({ Start: '2026-09-16T19:30:00.000Z', Title: 'No end' })], NOW);
  assert.match(ics, /DTEND;TZID=Europe\/London:20260916T213000/);
});

test('the calendar declares the Europe/London VTIMEZONE it references', () => {
  const ics = buildICS([record({ Start: '2026-09-16T19:30:00.000Z', Title: 'x' })], NOW);

  assert.match(ics, /BEGIN:VTIMEZONE\r\nTZID:Europe\/London/);
  assert.match(ics, /TZNAME:BST/);
  assert.match(ics, /TZNAME:GMT/);
  // VTIMEZONE must precede the events that reference it
  assert.ok(ics.indexOf('END:VTIMEZONE') < ics.indexOf('BEGIN:VEVENT'));
});

test('unparseable dates fail loudly rather than publishing a wrong time', () => {
  assert.throws(() => transformEvent(record({ Start: 'not a date', Title: 'x' })), /Unrecognised date/);
});

test('manual events merge in date order', () => {
  const airtable = [record({ Start: '2026-09-14T19:30:00.000Z', Title: 'Closer Each Day' }, 'a1')];
  const manual = [record({ Start: '2026-09-10T19:30:00', Title: 'Balls!' }, 'm1')];

  const merged = mergeManualEvents(airtable, manual);
  assert.deepEqual(merged.map((r) => r.id), ['m1', 'a1']);
});

test('a manual event is dropped once Airtable carries the same title and date', () => {
  const airtable = [record({ Start: '2026-09-16T19:30:00.000Z', Title: 'Balls!' }, 'a1')];
  // Same show, same day, different clock reading and casing - still a duplicate
  const manual = [record({ Start: '2026-09-16T20:00:00', Title: '  balls!  ' }, 'm1')];

  assert.deepEqual(mergeManualEvents(airtable, manual).map((r) => r.id), ['a1']);
});

test('manual events without a start or title are ignored', () => {
  const manual = [
    record({ Title: 'No date' }, 'm1'),
    record({ Start: '2026-09-16T19:30:00' }, 'm2'),
    record({ Start: '2026-09-16T19:30:00', Title: 'Good one' }, 'm3'),
  ];

  assert.deepEqual(mergeManualEvents([], manual).map((r) => r.id), ['m3']);
});

test('the real manual-events file is valid and parses', async () => {
  const { readFile } = await import('node:fs/promises');
  const parsed = JSON.parse(await readFile(new URL('../data/manual-events.json', import.meta.url), 'utf8'));

  const merged = mergeManualEvents([], parsed.events);
  assert.ok(merged.length > 0, 'expected at least one manual event');
  for (const event of merged) {
    const transformed = transformEvent(event);
    assert.match(transformed.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(transformed.time, /^\d{2}:\d{2}/);
    assert.ok(transformed.title, 'manual event needs a title');
    assert.ok(transformed.venue, 'manual event needs a venue');
  }
});

test('a record with no start does not break the merge', () => {
  const airtable = [
    record({ Title: 'Missing start' }, 'a1'),
    record({ Start: '2026-09-14T19:30:00.000Z', Title: 'Real one' }, 'a2'),
  ];
  const merged = mergeManualEvents(airtable, [record({ Start: '2026-09-10T19:30:00', Title: 'Balls!' }, 'm1')]);

  assert.deepEqual(merged.map((r) => r.id), ['m1', 'a2', 'a1']);
  // and it is still skipped when the feed is built
  assert.equal((buildICS(merged, NOW).match(/BEGIN:VEVENT/g) || []).length, 2);
});
