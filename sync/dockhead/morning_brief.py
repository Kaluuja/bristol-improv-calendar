#!/usr/bin/env python3
"""Write the improv-calendar section of Echo's morning brief.

Runs on Dockhead (ste's cron, daily 06:45, after the 05:30 sync) and is piped
into /home/hermes/vault/context/improv-pending.md, which Echo's 07:00 morning
brief reads (see morning-brief-spec.md in the vault). Two parts:

1. Events waiting for approval (Status = Pending in Airtable).
2. Problems: the sync's health report (sync-health.json), crash alerts from
   alert-on-failure.sh (*.alert), and a warning if the sync hasn't run lately.

Never raises: on any failure it prints a shrug line so the brief degrades
gracefully instead of breaking.
"""

import glob
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone

ENV_PATH = "/home/ste/improv-calendar.env"
STATE_DIR = "/home/ste/.local/state/improv-alerts"
HEALTH_FILE = os.path.join(STATE_DIR, "sync-health.json")
SYNC_STALE_HOURS = 36  # daily sync at 05:30; a missed day shows up the next morning


def load_env(path):
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k] = v
    return env


def fetch_pending(key, base):
    records, offset = [], None
    while True:
        # Upcoming only: approving a show that's already happened changes nothing
        params = {"pageSize": "100", "filterByFormula": "AND({Status} = 'Pending', IS_AFTER({Start}, NOW()))"}
        if offset:
            params["offset"] = offset
        url = f"https://api.airtable.com/v0/{base}/Events?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {key}"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.load(resp)
        records.extend(data.get("records", []))
        offset = data.get("offset")
        if not offset:
            return records


def pending_section():
    lines = ["## Waiting for approval", ""]
    try:
        env = load_env(ENV_PATH)
        records = fetch_pending(env["AIRTABLE_API_KEY"], env["AIRTABLE_BASE_ID"])
    except Exception as e:  # noqa: BLE001 - degrade gracefully, never break the brief
        return lines + [f"Couldn't check Airtable this morning ({type(e).__name__})."]
    if not records:
        return lines + ["Nothing waiting — all clear."]
    lines.append(
        f"{len(records)} event(s) to approve or reject in Airtable "
        f"(https://airtable.com/{env['AIRTABLE_BASE_ID']} → Events → set Status):"
    )
    lines.append("")
    for r in sorted(records, key=lambda r: r["fields"].get("Start", "")):
        f = r["fields"]
        when = ""
        if f.get("Start"):
            try:
                dt = datetime.fromisoformat(f["Start"].replace("Z", "+00:00")).astimezone()
                when = " — " + dt.strftime("%a %d %b %Y")
            except ValueError:
                when = " — " + f["Start"][:10]
        lines.append(f"- **{f.get('Title', 'Untitled')}** @ {f.get('Venue', '?')}{when}")
    return lines


def problems_section():
    problems = []

    try:
        with open(HEALTH_FILE) as f:
            health = json.load(f)
        checked = datetime.fromisoformat(health["checkedAt"].replace("Z", "+00:00"))
        age_hours = (datetime.now(timezone.utc) - checked).total_seconds() / 3600
        if age_hours > SYNC_STALE_HOURS:
            problems.append(
                f"- The sync hasn't reported since {checked.astimezone():%a %d %b %H:%M}. "
                "Check Dockhead: `tail -50 ~/improv-calendar-sync.log`."
            )
        for s in health.get("failed", []):
            problems.append(f"- Source **{s['source']}** failing: {s['error']}")
        for s in health.get("empty", []):
            problems.append(f"- Source **{s}** returned no events (site probably changed; scraper needs a look)")
        retired = health.get("retired", [])
        if retired:
            problems.append(
                f"- {len(retired)} event(s) taken off the calendar (no source has listed them for 14 days; "
                "now 'Needs review' in Airtable — set back to Approved if wrong):"
            )
            problems += [f"  - {r}" for r in retired[:10]]
            if len(retired) > 10:
                problems.append(f"  - …and {len(retired) - 10} more")
    except FileNotFoundError:
        problems.append("- No sync report found yet. Check Dockhead: `tail -50 ~/improv-calendar-sync.log`.")
    except Exception as e:  # noqa: BLE001
        problems.append(f"- Couldn't read the sync report ({type(e).__name__}).")

    for path in sorted(glob.glob(os.path.join(STATE_DIR, "*.alert"))):
        try:
            with open(path) as f:
                first, *rest = f.read().strip().splitlines() or [""]
            problems.append(f"- {first}")
            problems += [f"  > {line}" for line in rest if line.strip()]
        except Exception:  # noqa: BLE001
            continue

    if not problems:
        return []
    return ["## Problems", ""] + problems


def main():
    now = datetime.now().strftime("%a %d %b %Y, %H:%M")
    out = [f"# Improv calendar — morning check ({now})", ""]
    out += pending_section()
    problems = problems_section()
    if problems:
        out += [""] + problems
    print("\n".join(out))


if __name__ == "__main__":
    main()
