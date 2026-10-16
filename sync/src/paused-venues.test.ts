import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Event } from './types.js';
import { pausedVenueOf } from './paused-venues.js';

const event = (fields: Partial<Event>): Event => ({
  title: 'Some Show',
  start: new Date('2026-11-01T19:30:00Z'),
  venue: 'Hen & Chicken',
  fingerprint: '',
  sourceId: '',
  source: 'headfirst',
  ...fields,
});

test('events at the Bristol Improv Theatre are ignored, however a source names it', () => {
  assert.equal(pausedVenueOf(event({ venue: 'Bristol Improv Theatre' })), 'Bristol Improv Theatre');
  assert.equal(pausedVenueOf(event({ venue: 'The Improv Theatre' })), 'Bristol Improv Theatre');
  assert.equal(pausedVenueOf(event({ venue: '', title: 'Baby Jane? 12 7.00pm at Bristol Improv Theatre' })), 'Bristol Improv Theatre');
  assert.equal(pausedVenueOf(event({ venue: 'Clifton', eventUrl: 'https://improvtheatre.co.uk/whats-on/x' })), 'Bristol Improv Theatre');
});

test('events elsewhere are kept', () => {
  assert.equal(pausedVenueOf(event({})), undefined);
  assert.equal(pausedVenueOf(event({ title: 'Improv Jam', venue: 'Wardrobe Theatre' })), undefined);
});
