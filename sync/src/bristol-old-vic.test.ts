import { test } from 'node:test';
import assert from 'node:assert/strict';
import './tz.js';
import { parseShowPage } from './adapters/bristol-old-vic.js';
import { isImprovRelated } from './classifier.js';

const page = `
<div class="o-text-block o-grid__item"><p><strong>Kiell Smith-Bynoe returns with his
  smash-hit improv show.</strong></p></div>
<ul>
  <li><div class="c-instance c-instance--instance"><div class="c-instance__column">
    <time datetime="2026-11-19T19:30:00+00:00">Thu 19 Nov</time></div><span>7:30pm</span></div></li>
  <li><div class="c-instance c-instance--instance"><div class="c-instance__column">
    <time datetime="2026-11-20T19:30:00+00:00">Fri 20 Nov</time></div><span>7:30pm</span></div></li>
</ul>`;

test('show page gives each performance at its London wall-clock time', () => {
  const { dates } = parseShowPage(page);
  assert.deepEqual(dates.map((d) => d.toISOString()), ['2026-11-19T19:30:00.000Z', '2026-11-20T19:30:00.000Z']);
  // A BST date stays at the advertised time, not an hour out
  const [summer] = parseShowPage('<div class="c-instance"><time datetime="2027-06-10T19:00:00+00:00"></time></div>').dates;
  assert.equal(summer.getHours(), 19);
});

test('a matinee and evening show on the same day give one event, the evening', () => {
  const { dates } = parseShowPage(`
    <div class="c-instance"><time datetime="2027-01-30T14:30:00+00:00"></time></div>
    <div class="c-instance"><time datetime="2027-01-30T19:30:00+00:00"></time></div>`);
  assert.equal(dates.length, 1);
  assert.equal(dates[0].getHours(), 19);
});

test('a title with no improv wording is kept on its description', () => {
  const { description } = parseShowPage(page);
  const result = isImprovRelated({
    title: 'Kiell Smith-Bynoe & Friends: Kool Story Bro',
    start: new Date('2026-11-19T19:30:00Z'),
    venue: 'Bristol Old Vic',
    description,
    fingerprint: '',
    sourceId: 'x',
    source: 'bristol-old-vic',
  });
  assert.equal(result.isImprov, true);
});
