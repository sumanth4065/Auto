#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
bedrock-usage.py — Bedrock spend display for the Claude Code status bar.

Usage:
    python3 bedrock-usage.py <projects_dir> <session_id>

Output (single status-bar line):
    💰 sess $0.42  |  ████████░░ $12.34 / $60.00  [snt $9.10  ops $3.24]

Quota priority (highest wins):
    1. ~/.claude/bedrock-quota.json   { "daily": 150.0 }  — user override, skips Confluence
    2. ~/.claude/quota-cache.json     today's cached Confluence value
    3. Live Confluence fetch via acli  — cached for the rest of the day
    4. Stale quota-cache.json         — used if Confluence is unreachable
    5. Hardcoded $60 default
"""

import sys
import json
import glob
import os
import re
import subprocess
import datetime
from collections import defaultdict

# ── Args ──────────────────────────────────────────────────────────────────────

if len(sys.argv) < 3:
    print("usage: bedrock-usage.py <projects_dir> <session_id>", file=sys.stderr)
    sys.exit(1)

projects_dir = sys.argv[1]
session_id   = sys.argv[2]

QUOTA_CACHE        = os.path.expanduser("~/.claude/quota-cache.json")
BEDROCK_QUOTA_FILE = os.path.expanduser("~/.claude/bedrock-quota.json")
CONFLUENCE_PAGE_ID = "5340659729"
DAILY_LIMIT_DEFAULT = 60.0

# ── Pricing — AWS Bedrock TCU rates ($/1M tokens) ────────────────────────────

PRICING = {
    "sonnet": {"input": 3.00,  "cc": 3.75,  "cr": 0.30,  "output": 15.00},
    "opus":   {"input": 5.00,  "cc": 6.25,  "cr": 0.50,  "output": 25.00},
    "haiku":  {"input": 1.00,  "cc": 1.25,  "cr": 0.10,  "output":  5.00},
}

# ── Confluence quota fetch ────────────────────────────────────────────────────

def parse_total_from_xml(xml):
    """Parse shared-pool day/week/month totals from the Confluence quota table.
    Supports the old per-model format (sums columns) and a future shared-total format."""
    period_map = {"per day": "day", "per week": "week", "per month": "month"}
    row_re    = re.compile(r'<tr[^>]*>(.*?)</tr>', re.DOTALL | re.IGNORECASE)
    cell_re   = re.compile(r'<td[^>]*>(.*?)</td>', re.DOTALL | re.IGNORECASE)
    tag_re    = re.compile(r'<[^>]+>')
    dollar_re = re.compile(r'\$(\d+(?:\.\d+)?)')
    totals = {}
    for rm in row_re.finditer(xml):
        cells = [tag_re.sub('', cm.group(1)).strip() for cm in cell_re.finditer(rm.group(1))]
        if not cells:
            continue
        period = period_map.get(cells[0].lower())
        if not period:
            continue
        amounts = [float(m.group(1)) for c in cells[1:] for m in [dollar_re.search(c)] if m]
        if amounts:
            totals[period] = sum(amounts)  # sum per-model cols = shared pool total
    return totals if "day" in totals else None

def fetch_quotas_from_confluence():
    try:
        result = subprocess.run(
            ["acli", "confluence", "page", "view",
             "--id", CONFLUENCE_PAGE_ID, "--json", "--body-format", "storage"],
            capture_output=True, text=True, timeout=20
        )
        xml = json.loads(result.stdout).get("body", {}).get("storage", {}).get("value", "")
        return parse_total_from_xml(xml)
    except Exception:
        return None

def load_daily_limit():
    """
    Return the daily spend limit (USD).

    Priority:
      1. ~/.claude/bedrock-quota.json  — user override, skips Confluence entirely
      2. ~/.claude/quota-cache.json    — today's cached Confluence value
      3. Live Confluence fetch          — result cached for the rest of the day
      4. Stale quota-cache.json        — any age is better than the default
      5. Hardcoded $60 default
    """
    today_str = datetime.date.today().isoformat()

    # 1 — user override
    if os.path.exists(BEDROCK_QUOTA_FILE):
        try:
            with open(BEDROCK_QUOTA_FILE) as fh:
                val = float(json.load(fh).get("daily", 0))
            if val > 0:
                return val
        except Exception:
            pass

    # 2 — today's cache (supports both {"fetched":...,"limits":{}} and {"fetched":...,"day":n})
    if os.path.exists(QUOTA_CACHE):
        try:
            with open(QUOTA_CACHE) as fh:
                cache = json.load(fh)
            if cache.get("fetched") == today_str:
                if "limits" in cache:
                    return cache["limits"].get("day", DAILY_LIMIT_DEFAULT)
                if "quotas" in cache:
                    day_q = cache["quotas"].get("day", {})
                    if day_q:
                        return sum(day_q.values())
        except Exception:
            pass

    # 3 — live Confluence fetch
    parsed = fetch_quotas_from_confluence()
    if parsed:
        try:
            with open(QUOTA_CACHE, "w") as f:
                json.dump({"fetched": today_str, "limits": parsed}, f)
        except Exception:
            pass
        return parsed.get("day", DAILY_LIMIT_DEFAULT)

    # 4 — stale cache
    if os.path.exists(QUOTA_CACHE):
        try:
            with open(QUOTA_CACHE) as fh:
                cache = json.load(fh)
            if "limits" in cache:
                return cache["limits"].get("day", DAILY_LIMIT_DEFAULT)
            if "quotas" in cache:
                day_q = cache["quotas"].get("day", {})
                if day_q:
                    return sum(day_q.values())
        except Exception:
            pass

    # 5 — hardcoded default
    return DAILY_LIMIT_DEFAULT

# ── JSONL parsing ─────────────────────────────────────────────────────────────

today      = datetime.date.today()
week_start = today - datetime.timedelta(days=today.weekday())
# file_mtime_floor skips JSONL files untouched since week start — optimisation only.
# is_today() does the real today-only filtering on individual records.
file_mtime_floor = datetime.datetime.combine(week_start, datetime.time.min).timestamp()

def ts_to_local_date(ts):
    try:
        dt = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.astimezone().date()
    except Exception:
        return None

def is_today(ts):
    d = ts_to_local_date(ts)
    return d == today if d else False

def model_key(name):
    n = name.lower()
    if "haiku" in n: return "haiku"
    if "opus"  in n: return "opus"
    return "sonnet"

def token_cost(mk, t):
    p = PRICING.get(mk, PRICING["sonnet"])
    return (t["input"]*p["input"] + t["cc"]*p["cc"] + t["cr"]*p["cr"] + t["output"]*p["output"]) / 1_000_000

def parse_records(files, cutoff=None):
    seen, out = set(), []
    for path in files:
        if cutoff and os.path.getmtime(path) < cutoff:
            continue
        try:
            with open(path) as f:
                for raw in f:
                    if '"usage"' not in raw:
                        continue
                    try:
                        d = json.loads(raw)
                    except Exception:
                        continue
                    msg = d.get("message", {})
                    u   = msg.get("usage", {})
                    mid = msg.get("id")
                    if not u or not mid or mid in seen:
                        continue
                    seen.add(mid)
                    out.append((
                        d.get("timestamp", ""),
                        model_key(msg.get("model", "")),
                        {
                            "input":  u.get("input_tokens", 0),
                            "cc":     u.get("cache_creation_input_tokens", 0),
                            "cr":     u.get("cache_read_input_tokens", 0),
                            "output": u.get("output_tokens", 0),
                        }
                    ))
        except Exception:
            pass
    return out

# ── Main ──────────────────────────────────────────────────────────────────────

daily_limit = load_daily_limit()

all_files  = glob.glob(f"{projects_dir}/**/*.jsonl", recursive=True)
sess_files = []
if session_id:
    f = next(iter(glob.glob(f"{projects_dir}/**/{session_id}.jsonl", recursive=True)), None)
    if f:
        sess_files = [f]
    # Include subagent files — actual on-disk layout emitted by Claude Code: {session_id}/subagents/agent-*.jsonl
    sess_files += glob.glob(f"{projects_dir}/**/{session_id}/subagents/*.jsonl", recursive=True)
# No fallback to most-recent file — a new session with no JSONL yet has $0.00 cost.

all_records  = parse_records(all_files, file_mtime_floor)
sess_records = parse_records(sess_files)

sess_cost = sum(token_cost(mk, t) for _, mk, t in sess_records)

# Shared daily total + per-model breakdown (filtered to today by record timestamp)
daily_total    = 0.0
daily_by_model = defaultdict(float)
for ts, mk, t in all_records:
    if is_today(ts):
        cost = token_cost(mk, t)
        daily_total += cost
        daily_by_model[mk] += cost

def fmt_dollar(n):
    return f"${n:.2f}"

def progress_bar(pct, width=10):
    filled = max(0, min(width, int(pct / 100 * width)))
    return "█" * filled + "░" * (width - filled)

pct   = min(daily_total / daily_limit * 100, 100.0) if daily_limit else 0.0
bar   = progress_bar(pct, width=10)
alert = "❌" if pct >= 100 else "⚠️ " if pct >= 70 else ""

# Per-model breakdown — only models with usage today, ordered by cost desc
MODEL_LABELS = {"sonnet": "snt", "opus": "ops", "haiku": "hku"}
model_parts = [
    f"{MODEL_LABELS[mk]} {fmt_dollar(daily_by_model[mk])}"
    for mk in sorted(daily_by_model, key=lambda k: daily_by_model[k], reverse=True)
    if daily_by_model.get(mk, 0) > 0
]

daily_str = f"{bar}{alert} {fmt_dollar(daily_total)} / {fmt_dollar(daily_limit)}"
sess_str  = f"💰 sess {fmt_dollar(sess_cost)}"
model_str = "  ".join(model_parts)

if model_str:
    print(f"{sess_str}  |  {daily_str}  [{model_str}]")
else:
    print(f"{sess_str}  |  {daily_str}")
