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

test('Tilt events are kept wherever Tilt is mentioned, links included', async () => {
  const { isImprovRelated } = await import('./classifier.js');
  const at = (fields: object) => isImprovRelated({ title: 'Mystery Night', venue: 'Somewhere', source: 'x', ...fields } as any);
  assert.equal(at({}).isImprov, false);
  assert.equal(at({ description: 'Presented by Tilt Improv' }).isImprov, true);
  assert.equal(at({ ticketsUrl: 'https://tiltimprov.co.uk/shows/x/' }).isImprov, true);
  assert.equal(at({ title: 'Wednesday Night Improv: January Show' }).isImprov, true);
  assert.equal(at({ title: 'This Is Your Panto!' }).isImprov, true); // despite "panto" being excluded
});

test('acts with everyday names need a hint of comedy or improv', async () => {
  const { isImprovRelated } = await import('./classifier.js');
  const ev = (title: string, description?: string) =>
    isImprovRelated({ title, description, venue: 'Somewhere', source: 'x' } as any).isImprov;
  assert.equal(ev('Birdwatchers'), false);
  assert.equal(ev('Birdwatchers', 'Award-winning comedy double act'), true);
  assert.equal(ev("Festive Double Bill: What's Your Star Sign?", 'Two comedy shows'), true);
  assert.equal(ev('Whats Your Star Sign', 'An improvised show'), true);
  assert.equal(ev('Sometimes We Wear Shirts present: Knock Knock'), true);
});

test('the rejected log keeps first-seen dates and drops old events', async () => {
  const { updateRejectedLog } = await import('./rejected-log.js');
  const now = new Date('2026-11-18T06:00:00Z');
  const event = { title: 'Buffoon Comedy', venue: 'Loco Klub', start: new Date('2026-11-25T20:00:00Z'), eventUrl: 'https://x/1', canonicalUrl: 'https://x/1', source: 'headfirst', fingerprint: 'a' } as any;
  const old = { title: 'Old', venue: '', date: '2026-08-01', url: '', source: 'x', reason: '', firstSeen: '2026-07-01', lastSeen: '2026-08-01' };
  const log = updateRejectedLog({ 'https://x/1': { ...old, date: '2026-11-25', firstSeen: '2026-11-10' }, old: old }, [event], now);
  assert.deepEqual(Object.keys(log), ['https://x/1']);
  assert.equal(log['https://x/1'].firstSeen, '2026-11-10');
  assert.equal(log['https://x/1'].lastSeen, '2026-11-18');
  assert.equal(log['https://x/1'].reason, 'no improv signals');
});
