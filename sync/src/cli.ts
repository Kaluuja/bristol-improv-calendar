import './tz.js';
import 'dotenv/config';

import { runPipeline } from './pipeline.js';
import { buildHealthReport, formatReport, hasNewProblems, publishReport } from './health.js';
import {
  // Website scraper (BIT - covers 6+ months)
  BristolImprovTheatreScraperAdapter,
  BristolFolkHouseAdapter,
  // ICS feeds
  PRSCAdapter,
  HenAndChickenAdapter,
  // JSON API
  WardrobeTheatreAdapter,
  // HTML scrapers - venues
  TobaccoFactoryAdapter,
  BristolBeaconAdapter,
  BristolOldVicAdapter,
  RedgraveTheatreAdapter,
  StGeorgesBristolAdapter,
  // Event aggregators
  HeadfirstAdapter,
  EventbriteAdapter,
} from './adapters/index.js';

const USAGE = `
improv-calendar-sync - Sync improv events from multiple sources to Airtable

Commands:
  sync [options]    Fetch events and sync to Airtable

Options:
  --dry-run         Preview changes without writing to Airtable
  --verbose, -v     Show detailed output
  --help, -h        Show this help message
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || args.includes('--help') || args.includes('-h')) {
    console.log(USAGE);
    process.exit(0);
  }

  if (command !== 'sync') {
    console.error(`Unknown command: ${command}`);
    console.log(USAGE);
    process.exit(1);
  }

  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log('🎭 Improv Calendar Sync\n');

  // Initialize all source adapters
  const sources = [
    // BIT (Spektrix API)
    new BristolImprovTheatreScraperAdapter(),
    // Bristol Folk House website (for recurring improv shows like Just For A Moment)
    new BristolFolkHouseAdapter(),
    // ICS feeds
    new PRSCAdapter(),
    new HenAndChickenAdapter(),
    // JSON API
    new WardrobeTheatreAdapter(),
    // HTML scrapers - venues
    new TobaccoFactoryAdapter(),
    new BristolBeaconAdapter(),
    new BristolOldVicAdapter(),
    new RedgraveTheatreAdapter(),
    new StGeorgesBristolAdapter(),
    // Event aggregators
    new HeadfirstAdapter(),
    new EventbriteAdapter(),
  ];

  try {
    const { results, retired } = await runPipeline(sources, { dryRun, verbose });

    console.log('\n✅ Sync complete!\n');

    // Summary
    const totalFetched = results.reduce((sum, r) => sum + r.fetched, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    console.log('Summary:');
    console.log(`  Sources: ${results.length}`);
    console.log(`  Events fetched: ${totalFetched}`);
    if (totalErrors > 0) {
      console.log(`  Errors: ${totalErrors}`);
    }

    // Report problems. Dry runs only print, so testing never pings Telegram.
    const report = buildHealthReport(results, retired);
    if (dryRun) {
      console.log(`\n${formatReport(report, true)}`);
    } else {
      await publishReport(report);
    }

    // Fail the run on NEW breakage so GitHub marks it red and emails.
    // Known-broken sources (health.ts) are reported but don't fail it.
    if (hasNewProblems(report)) {
      console.error('\n❌ New source problems - failing the run so it gets noticed');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
