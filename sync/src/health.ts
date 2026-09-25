import { appendFileSync, writeFileSync } from 'node:fs';
import type { SyncResult } from './types.js';

/**
 * Sources we already know are broken, with why. They're still reported on
 * every run, but don't fail it, so a red run always means something NEW broke.
 * Remove an entry once the source is fixed. See docs/known-issues.md.
 */
export const KNOWN_BROKEN: Record<string, string> = {
  'redgrave-theatre': 'site moved /events/ -> /whats-on; scraper matches nothing',
};

/**
 * Exit code for "sources had problems, and the alert has been sent".
 * Dockhead's alert-on-failure.sh treats it as already reported; GitHub
 * treats any non-zero as a failed run.
 */
export const EXIT_REPORTED_PROBLEMS = 3;

export interface HealthReport {
  failed: { source: string; error: string }[];
  empty: string[];
  known: { source: string; problem: string; why: string }[];
  retired: string[];
}

export function buildHealthReport(results: SyncResult[], retired: string[]): HealthReport {
  const report: HealthReport = { failed: [], empty: [], known: [], retired };

  for (const r of results) {
    const problem = r.errors.length > 0 ? r.errors.join('; ') : r.fetched === 0 ? '0 events' : null;
    if (!problem) continue;

    if (KNOWN_BROKEN[r.source]) {
      report.known.push({ source: r.source, problem, why: KNOWN_BROKEN[r.source] });
    } else if (r.errors.length > 0) {
      report.failed.push({ source: r.source, error: problem });
    } else {
      report.empty.push(r.source);
    }
  }

  // A known-broken source that's working again is worth hearing about too
  for (const source of Object.keys(KNOWN_BROKEN)) {
    const r = results.find((x) => x.source === source);
    if (r && r.errors.length === 0 && r.fetched > 0) {
      report.known.push({ source, problem: `working again (${r.fetched} events) - remove from KNOWN_BROKEN`, why: '' });
    }
  }

  return report;
}

/** New problems: these fail the run. */
export function hasNewProblems(report: HealthReport): boolean {
  return report.failed.length > 0 || report.empty.length > 0;
}

/**
 * Alert text, or null when there's nothing new (known-broken sources alone
 * don't warrant a message). `full` always returns text, known issues
 * included - for dry runs and the GitHub run summary.
 */
export function formatReport(report: HealthReport, full = false): string | null {
  const lines: string[] = [];

  if (report.failed.length) {
    lines.push('❌ Sources failing:');
    for (const f of report.failed) lines.push(`• ${f.source}: ${f.error}`);
  }
  if (report.empty.length) {
    lines.push('⚠️ Sources returning nothing (site changed?):');
    for (const s of report.empty) lines.push(`• ${s}`);
  }
  if (report.retired.length) {
    lines.push(`🗂 Taken off the calendar (not listed for 14+ days, now "Needs review"):`);
    for (const r of report.retired.slice(0, 15)) lines.push(`• ${r}`);
    if (report.retired.length > 15) lines.push(`…and ${report.retired.length - 15} more`);
  }
  if (lines.length === 0 && !full) return null; // nothing new: stay quiet
  if (lines.length === 0) lines.push('✅ No new problems.');

  if (report.known.length) {
    lines.push('', 'Still broken (known):');
    for (const k of report.known) lines.push(`• ${k.source}: ${k.problem}`);
  }

  const runUrl = process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null;
  return ['🎭 Improv calendar sync', '', ...lines, ...(runUrl ? ['', runUrl] : [])].join('\n');
}

/**
 * Publish the report. Never throws: a failed alert mustn't hide the sync result.
 *
 * - HEALTH_FILE (set on Dockhead): JSON status file. The 06:45 morning-brief
 *   script reads it, so problems reach Ste via Echo's morning brief.
 * - TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID: optional instant message. Unused
 *   for now (Sept 2026 choice: morning brief only); kept in case that changes.
 * - GITHUB_STEP_SUMMARY: the run summary page when run on GitHub Actions.
 */
export async function publishReport(report: HealthReport): Promise<void> {
  const text = formatReport(report);

  if (process.env.HEALTH_FILE) {
    try {
      writeFileSync(
        process.env.HEALTH_FILE,
        JSON.stringify({ checkedAt: new Date().toISOString(), alert: text, ...report }, null, 2)
      );
    } catch (error) {
      console.log(`\n⚠️ Could not write health file: ${(error as Error).message}`);
    }
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, '```\n' + formatReport(report, true) + '\n```\n');
    } catch { /* summary is best-effort */ }
  }

  if (!text) return;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    console.log(res.ok ? '\n📨 Telegram alert sent' : `\n⚠️ Telegram alert failed: ${res.status} ${await res.text()}`);
  } catch (error) {
    console.log(`\n⚠️ Telegram alert failed: ${(error as Error).message}`);
  }
}
