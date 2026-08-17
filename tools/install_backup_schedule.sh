#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STATE_DIR="$HOME/.health-dashboard-backup"
CONFIG_FILE="$STATE_DIR/config.json"
LOG_DIR="$STATE_DIR/logs"
PLIST_PATH="$HOME/Library/LaunchAgents/com.benashy.health-dashboard-backup.plist"
PYTHON_BIN="$(command -v python3)"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Private configuration is missing: $CONFIG_FILE" >&2
  echo "Create it from tools/backup-config.example.json, then run this installer again." >&2
  exit 1
fi

mkdir -p "$LOG_DIR" "$(dirname "$PLIST_PATH")"
chmod 700 "$STATE_DIR" "$LOG_DIR"

TMP_PLIST="$(mktemp)"
trap 'rm -f "$TMP_PLIST"' EXIT
sed \
  -e "s|__PYTHON_BIN__|$PYTHON_BIN|g" \
  -e "s|__SCRIPT_PATH__|$REPO_DIR/tools/backup_health_dashboard.py|g" \
  -e "s|__CONFIG_PATH__|$CONFIG_FILE|g" \
  -e "s|__LOG_DIR__|$LOG_DIR|g" \
  "$REPO_DIR/tools/com.benashy.health-dashboard-backup.plist.template" > "$TMP_PLIST"

launchctl bootout "gui/$(id -u)" "$PLIST_PATH" 2>/dev/null || true
cp "$TMP_PLIST" "$PLIST_PATH"
chmod 600 "$PLIST_PATH"
launchctl bootstrap "gui/$(id -u)" "$PLIST_PATH"
launchctl kickstart -k "gui/$(id -u)/com.benashy.health-dashboard-backup"
echo "Health Dashboard backup schedule installed."
