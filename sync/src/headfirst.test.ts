import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEventPageStart } from './adapters/headfirst.js';

test('reads the start time from a Headfirst event page, not the doors time', () => {
  const html = `<p>An event held at <a href="#">Loco Klub</a> on <a href="#">Tuesday 20th October</a>.
    The event starts at <span class="has-lilac-color">19:30</span>.</p>`;
  assert.deepEqual(parseEventPageStart(html), { hours: 19, minutes: 30 });
});

test('no start sentence means no time, so the listing time is kept', () => {
  assert.equal(parseEventPageStart('<p>Doors 18:30</p>'), null);
});
