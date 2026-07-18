/**
 * Export approved events from Airtable to events.json and events.ics
 * Runs in GitHub Actions - no dependencies needed (uses built-in fetch)
 */

import fs from 'fs';
import { pathToFileURL } from 'url';

const TABLE_NAME = 'Events';

async function fetchApprovedEvents(apiKey, baseId) {
  const events = [];
  let offset = null;

  do {
    const params = new URLSearchParams({
      filterByFormula: '{Status} = "Approved"',
      'sort[0][field]': 'Start',
      'sort[0][direction]': 'asc',
    });
    if (offset) params.set('offset', offset);

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLE_NAME)}?${params}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    events.push(...data.records);
    offset = data.offset;
  } while (offset);

  return events;
}

function formatTime(startISO, endISO) {
  const start = new Date(startISO);
  const startTime = start.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London',
  });

  if (!endISO) return startTime;

  const end = new Date(endISO);
  const endTime = end.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London',
  });

  return `${startTime}–${endTime}`;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
}

export function transformEvent(record) {
  const fields = record.fields;
  return {
    date: formatDate(fields.Start),
    title: fields.Title || '',
    venue: fields.Venue || '',
    time: formatTime(fields.Start, fields.End),
    type: (fields.Type || 'show').toLowerCase(),
    url: fields['Tickets URL'] || fields['Event URL'] || '',
    description: '',
  };
}

// --- iCalendar feed ---

function escapeICSText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// UTC basic format: 20260401T193000Z
function formatICSDate(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// RFC 5545: content lines should stay within 75 octets; continuation lines start with a space
function foldLine(line) {
  if (line.length <= 74) return line;
  const parts = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length > 0) {
    parts.push(' ' + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  return parts.join('\r\n');
}

export function buildICS(records, now = new Date()) {
  const dtstamp = formatICSDate(now.toISOString());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bristol Improv Calendar//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Bristol Improv Calendar',
    'X-WR-TIMEZONE:Europe/London',
  ];

  for (const record of records) {
    const f = record.fields;
    if (!f.Start) continue;

    // No end time in Airtable: assume 2 hours, same as the site does
    const end = f.End || new Date(new Date(f.Start).getTime() + 2 * 60 * 60 * 1000).toISOString();
    const url = f['Tickets URL'] || f['Event URL'] || '';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${record.id}@bristol-improv-calendar`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${formatICSDate(f.Start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${escapeICSText(f.Title || 'Improv event')}`
    );
    if (f.Venue) lines.push(`LOCATION:${escapeICSText(f.Venue)}`);
    if (url) lines.push(`URL:${url}`, `DESCRIPTION:${escapeICSText(`Details and tickets: ${url}`)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

async function main() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
    process.exit(1);
  }

  console.log('Fetching approved events from Airtable...');
  const records = await fetchApprovedEvents(apiKey, baseId);
  console.log(`Found ${records.length} approved events`);

  // Keep events from the start of the previous month onwards (current + previous month history)
  const now = new Date();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  const keptRecords = records.filter((r) => r.fields.Start && formatDate(r.fields.Start) >= prevMonthStart);
  console.log(`${keptRecords.length} events from ${prevMonthStart} onwards (including past events this month and last month)`);

  // Guard: a renamed Airtable view or changed token scope returns few/no events;
  // refuse to publish a >50% shrink rather than silently wiping the calendar.
  let previousEvents = null;
  try {
    previousEvents = JSON.parse(fs.readFileSync('events.json', 'utf8')).events;
  } catch {
    // no previous events.json - nothing to compare against
  }
  const previousCount = previousEvents ? previousEvents.length : 0;
  if (previousCount >= 20 && keptRecords.length < previousCount / 2 && process.env.ALLOW_SHRINK !== '1') {
    console.error(
      `Refusing to publish: ${keptRecords.length} events vs ${previousCount} previously (>50% drop). ` +
      'If this shrink is genuine, re-run with ALLOW_SHRINK=1.'
    );
    process.exit(1);
  }

  const newEvents = keptRecords.map(transformEvent);

  // Skip the write (and downstream commit) when only the timestamp would change -
  // avoids a no-op commit + Netlify rebuild every single day.
  if (previousEvents && JSON.stringify(previousEvents) === JSON.stringify(newEvents)) {
    console.log('No change in events since last run - skipping write');
    return;
  }

  const output = {
    lastUpdated: now.toISOString(),
    events: newEvents,
  };

  fs.writeFileSync('events.json', JSON.stringify(output, null, 2));
  console.log('Written to events.json');

  fs.writeFileSync('events.ics', buildICS(keptRecords, now));
  console.log('Written to events.ics');
}

// Only run when executed directly (allows importing buildICS/transformEvent in tests)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('Export failed:', err);
    process.exit(1);
  });
}
