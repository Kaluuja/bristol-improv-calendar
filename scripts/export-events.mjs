/**
 * Export approved events from Airtable to events.json
 * Runs in GitHub Actions - no dependencies needed (uses built-in fetch)
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = 'Events';

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  process.exit(1);
}

async function fetchApprovedEvents() {
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
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}?${params}`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
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

function transformEvent(record) {
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

async function main() {
  console.log('Fetching approved events from Airtable...');
  const records = await fetchApprovedEvents();
  console.log(`Found ${records.length} approved events`);

  const events = records.map(transformEvent);

  const today = new Date().toISOString().split('T')[0];
  console.log(`Today: ${today}`);

  // Keep events from the start of the previous month onwards (current + previous month history)
  const now = new Date();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  const recentAndFutureEvents = events.filter((e) => e.date >= prevMonthStart);
  console.log(`${recentAndFutureEvents.length} events from ${prevMonthStart} onwards (including past events this month and last month)`);

  const output = {
    lastUpdated: new Date().toISOString(),
    events: recentAndFutureEvents,
  };

  const fs = await import('fs');
  fs.writeFileSync('events.json', JSON.stringify(output, null, 2));
  console.log('Written to events.json');
}

main().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});