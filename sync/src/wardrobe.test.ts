import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlToText, isCurrentShow, wardrobeImprovReason, type WardrobeShow } from './adapters/wardrobe-theatre.js';
import { isImprovRelated } from './classifier.js';

const show = (fields: Partial<WardrobeShow>): WardrobeShow => ({ slug: 'a-show', ...fields });

test('a show the Wardrobe tags as Improv counts, whatever its wording', () => {
  const reason = wardrobeImprovReason(show({ class_list: ['shows_genre-comedy', 'shows_genre-improv'] }));
  assert.equal(reason, 'Wardrobe genre: improv');
});

test('untagged shows count on improv, unscripted or made-up-on-the-spot wording', () => {
  const said = (html: string) => wardrobeImprovReason(show({ content: { rendered: html } }));
  assert.match(said('<p>A night of improvised sketch comedy</p>')!, /improv/);
  assert.match(said('<p>Totally <em>unscripted</em> chaos</p>')!, /unscripted/);
  assert.match(said('<p>Characters and stories, all made up on the spot!</p>')!, /made up on the spot/);
  assert.equal(said('<p>A one-woman play about cars</p>'), undefined);
  assert.equal(said('<p>Ways to improve your life</p>'), undefined);
});

test('past and archived shows are skipped', () => {
  assert.equal(isCurrentShow(show({ acf: { event_end_date: '20261220' } }), '20261013'), true);
  assert.equal(isCurrentShow(show({ acf: { event_end_date: '20261012' } }), '20261013'), false);
  assert.equal(isCurrentShow(show({ acf: { event_end_date: '20261220', archived_show: true } }), '20261013'), false);
  assert.equal(isCurrentShow(show({}), '20261013'), false);
});

test('WordPress entities in titles are decoded', () => {
  assert.equal(htmlToText('Up The Antics&#8217; Christmas Playlist'), 'Up The Antics’ Christmas Playlist');
  assert.equal(htmlToText('Fish &amp; Chips &#8211; Live'), 'Fish & Chips – Live');
});

test('a venue-tagged improv show survives the exclusion list', () => {
  const event = {
    title: 'This Is Your Musical',
    start: new Date('2026-12-01T19:30:00Z'),
    venue: 'Wardrobe Theatre',
    fingerprint: '',
    sourceId: 'x',
    source: 'wardrobe-theatre',
  };
  assert.equal(isImprovRelated(event).isImprov, false);
  assert.equal(isImprovRelated({ ...event, improvReason: 'Wardrobe genre: improv' }).isImprov, true);
});

test('if in doubt, include: improv wording beats exclusion words', () => {
  const event = {
    title: 'Saturday Special',
    description: 'An improvised musical comedy night',
    start: new Date('2026-12-01T19:30:00Z'),
    venue: 'Somewhere',
    fingerprint: '',
    sourceId: 'x',
    source: 'headfirst',
  };
  assert.equal(isImprovRelated(event).isImprov, true);
});

test('unscripted and made-up-on-the-spot count as improv for every source', () => {
  const event = (description: string) => ({
    title: 'Some Show',
    description,
    start: new Date('2026-12-01T19:30:00Z'),
    venue: 'Somewhere',
    fingerprint: '',
    sourceId: 'x',
    source: 'eventbrite',
  });
  assert.equal(isImprovRelated(event('An unscripted evening of comedy')).isImprov, true);
  assert.equal(isImprovRelated(event('Every story made up on the spot')).isImprov, true);
});
