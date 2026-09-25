#!/usr/bin/env python3
"""Write a markdown summary of improv-calendar events awaiting approval.

Runs on Dockhead (ste's cron, daily 06:45) and is piped into
/home/hermes/vault/context/improv-pending.md so Echo's 07:00 morning brief
can include it. Reads Airtable credentials from /home/ste/improv-alma/.env.
Never raises: on any failure it prints a shrug line so the brief degrades
gracefully instead of breaking.
"""

import json
import urllib.request
import urllib.parse
from datetime import datetime

ENV_PATH = "/home/ste/improv-alma/.env"


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
        params = {
            "pageSize": "100",
            "filterByFormula": "{Status} = 'Pending'",
        }
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


def main():
    now = datetime.now().strftime("%a %d %b %Y, %H:%M")
    print(f"# Improv calendar — pending approvals (checked {now})")
    print()
    try:
        env = load_env(ENV_PATH)
        records = fetch_pending(env["AIRTABLE_API_KEY"], env["AIRTABLE_BASE_ID"])
    except Exception as e:  # noqa: BLE001 - degrade gracefully, never break the brief
        print(f"Couldn't check Airtable this morning ({type(e).__name__}). Try again later.")
        return
    if not records:
        print("Nothing waiting — all clear.")
        return
    print(f"{len(records)} event(s) waiting for approve/reject (use the calendar bot's buttons):")
    print()
    for r in sorted(records, key=lambda r: r["fields"].get("Start", "")):
        f = r["fields"]
        title = f.get("Title", "Untitled")
        venue = f.get("Venue", "?")
        start = f.get("Start", "")
        when = ""
        if start:
            try:
                dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                when = " — " + dt.strftime("%a %d %b")
            except ValueError:
                when = " — " + start[:10]
        print(f"- **{title}** @ {venue}{when}")


if __name__ == "__main__":
    main()
