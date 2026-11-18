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

test('reads the description from a Headfirst event page', async () => {
  const { parseEventPageDescription } = await import('./adapters/headfirst.js');
  const html = `<meta property="og:description" content="Award winning improvisers Real Positive Poles &amp; friends">`;
  assert.equal(parseEventPageDescription(html), 'Award winning improvisers Real Positive Poles & friends');
  assert.equal(parseEventPageDescription('<p>nothing</p>'), null);
});

test('a show with no improv in the title is kept once its description says improvisers', async () => {
  const { isImprovRelated } = await import('./classifier.js');
  const event = { title: 'Some New Double Bill', venue: 'Loco Klub', source: 'headfirst' } as any;
  assert.equal(isImprovRelated(event).isImprov, false);
  event.description = 'Award winning improvisers back with a new show';
  assert.equal(isImprovRelated(event).isImprov, true);
});

test('acts on the watchlist are kept whatever the title says', async () => {
  const { isImprovRelated } = await import('./classifier.js');
  for (const title of ['REAL POSITIVE-POLES: Live!', 'After Dusk & The Y Files', 'Brothers Grin']) {
    assert.equal(isImprovRelated({ title, venue: 'Somewhere', source: 'x' } as any).isImprov, true, title);
  }
  assert.equal(isImprovRelated({ title: 'After Dusk Techno Rave', venue: 'Loco Klub', source: 'x' } as any).isImprov, false);
});
