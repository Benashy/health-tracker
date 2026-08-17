#!/usr/bin/env python3
"""Create a dated, portable Health Dashboard backup in Dropbox."""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

APP_NAME = "Health Dashboard"
DEFAULT_TABLES = [
    "health_dashboard_data",
    "health_dashboard_telegram_reminder_state",
]
TABLE_NAME_PATTERN = re.compile(r"^[a-z][a-z0-9_]*$")


def private_state_dir() -> Path:
    return Path.home() / ".health-dashboard-backup"


def default_backup_root() -> Path:
    cloud_storage = Path.home() / "Library" / "CloudStorage" / "Dropbox"
    if cloud_storage.exists():
        return cloud_storage / "Health Dashboard Backups"
    return Path.home() / "Dropbox" / "Health Dashboard Backups"


def load_config(path: Path) -> dict:
    if not path.exists():
        raise RuntimeError(f"Private configuration not found: {path}")
    config = json.loads(path.read_text(encoding="utf-8"))
    url = str(config.get("supabase_url", "")).rstrip("/")
    key = str(config.get("service_role_key", "")).strip()
    if not url.startswith("https://") or not key:
        raise RuntimeError("Private configuration needs supabase_url and service_role_key.")
    tables = config.get("tables", DEFAULT_TABLES)
    if not isinstance(tables, list) or not tables:
        raise RuntimeError("At least one database table must be configured.")
    if any(not TABLE_NAME_PATTERN.fullmatch(str(table)) for table in tables):
        raise RuntimeError("A configured database table name is invalid.")
    return {
        "supabase_url": url,
        "service_role_key": key,
        "tables": [str(table) for table in tables],
        "backup_root": Path(config.get("backup_root", default_backup_root())).expanduser(),
    }


def fetch_table(config: dict, table: str) -> list[dict]:
    url = f"{config['supabase_url']}/rest/v1/{urllib.parse.quote(table)}?select=*"
    request = urllib.request.Request(
        url,
        headers={
            "apikey": config["service_role_key"],
            "Authorization": f"Bearer {config['service_role_key']}",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:300]
        raise RuntimeError(f"Supabase returned HTTP {error.code} for {table}: {detail}") from error
    if not isinstance(payload, list):
        raise RuntimeError(f"Supabase returned an unexpected response for {table}.")
    return payload


def csv_value(value: object) -> object:
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if value is None:
        return ""
    return value


def write_table_csv(path: Path, rows: list[dict]) -> None:
    fieldnames = sorted({key for row in rows for key in row})
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        if fieldnames:
            writer.writeheader()
            for row in rows:
                writer.writerow({key: csv_value(row.get(key)) for key in fieldnames})


def write_summary(path: Path, exported_at: str, tables: dict[str, list[dict]]) -> None:
    lines = [
        f"{APP_NAME} database backup",
        f"Created: {exported_at}",
        "",
        "Contents:",
    ]
    lines.extend(f"- {name}: {len(rows)} row(s)" for name, rows in tables.items())
    lines.extend(
        [
            "",
            "The JSON file is the complete recovery copy.",
            "CSV files are provided for inspection in spreadsheet software.",
            "The dated folder is the source of truth for this backup.",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def copy_latest(source: Path, destination: Path) -> str:
    try:
        if destination.exists():
            shutil.rmtree(destination)
        shutil.copytree(source, destination)
        return "updated"
    except OSError as error:
        return f"not updated ({error})"


def run_backup(config: dict, force: bool) -> Path | None:
    now = dt.datetime.now().astimezone()
    today = now.date().isoformat()
    state_dir = private_state_dir()
    state_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
    marker = state_dir / "last-success-date"
    if not force and marker.exists() and marker.read_text(encoding="utf-8").strip() == today:
        print(f"A successful backup already exists for {today}; nothing to do.")
        return None

    backup_root = config["backup_root"]
    daily_root = backup_root / "daily"
    daily_root.mkdir(parents=True, exist_ok=True)
    folder = daily_root / now.strftime("%Y-%m-%d-%H%M%S")
    folder.mkdir(mode=0o700)

    try:
        tables = {table: fetch_table(config, table) for table in config["tables"]}
        exported_at = now.isoformat(timespec="seconds")
        full_backup = {
            "backup_type": "health-dashboard-database-backup",
            "backup_version": 1,
            "exported_at": exported_at,
            "tables": tables,
        }
        json_path = folder / "health-dashboard-backup.json"
        json_path.write_text(json.dumps(full_backup, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for table, rows in tables.items():
            write_table_csv(folder / f"{table}.csv", rows)
        write_summary(folder / "backup-summary.txt", exported_at, tables)
        for path in folder.iterdir():
            path.chmod(0o600)
    except Exception:
        shutil.rmtree(folder, ignore_errors=True)
        raise

    latest_status = copy_latest(folder, backup_root / "latest-scheduled")
    marker.write_text(today + "\n", encoding="utf-8")
    marker.chmod(0o600)
    print(f"Backup created: {folder}")
    print(f"Latest scheduled copy: {latest_status}")
    return folder


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--config",
        type=Path,
        default=private_state_dir() / "config.json",
        help="Private JSON configuration path.",
    )
    parser.add_argument("--force", action="store_true", help="Create another backup even if today already succeeded.")
    args = parser.parse_args()
    try:
        config = load_config(args.config.expanduser())
        run_backup(config, args.force)
        return 0
    except Exception as error:
        print(f"Backup failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
