#!/usr/bin/env bash
# Install the sdd CLI and verify acli is present and authenticated.
# Run this once per machine before using /sdd-planning-setup.
#
# Usage: bash .claude/scripts/sdd-install/sdd-install.sh --repo <path>
#
# --repo <path>   Path to a local sdd_spec-workflow checkout (required).

set -euo pipefail

SDD_REPO=""
GITHUB_RELEASE_URL="https://github.com/ACE-Clublabs/sdd_spec-workflow"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) SDD_REPO="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

echo "SDD CLI Installer"
echo "================="
echo ""

# --- Check pipx ---
echo "Checking pipx..."
if ! command -v pipx &>/dev/null; then
  echo "  ERROR: pipx not found."
  echo "  Install with: brew install pipx && pipx ensurepath"
  exit 1
fi
echo "  OK: pipx $(pipx --version)"
echo ""

# --- Install sdd CLI ---
echo "Installing sdd CLI..."
if [[ -n "$SDD_REPO" ]]; then
  if [[ ! -d "$SDD_REPO/cli" ]]; then
    echo "  ERROR: $SDD_REPO/cli not found"
    exit 1
  fi
  pipx install --force "$SDD_REPO/cli"
  echo "  OK: installed from $SDD_REPO/cli"
else
  echo "  ERROR: --repo <path> is required."
  echo "  Clone the sdd_spec-workflow repo first:"
  echo "    git clone $GITHUB_RELEASE_URL"
  echo "  Then run: bash .claude/scripts/sdd-install/sdd-install.sh --repo <path-to-clone>"
  exit 1
fi
echo ""

# --- Verify sdd is on PATH ---
echo "Verifying sdd CLI..."
if ! command -v sdd &>/dev/null; then
  echo "  ERROR: sdd not found on PATH after install."
  echo "  Run: pipx ensurepath  (then restart your shell)"
  exit 1
fi
echo "  OK: $(sdd --version 2>/dev/null || echo 'sdd installed')"
echo ""

# --- Check acli ---
echo "Checking acli..."
if ! command -v acli &>/dev/null; then
  echo "  ERROR: acli not found."
  echo "  Install with: brew install atlassian/acli/acli"
  exit 1
fi
echo "  OK: $(acli --version 2>/dev/null | head -1)"
echo ""

# --- Check acli global auth ---
echo "Checking acli global authentication..."
if ! acli auth status &>/dev/null; then
  echo "  WARNING: acli global auth not configured."
  echo "  Run: acli auth login"
else
  echo "  OK: acli global auth active"
fi
echo ""

# --- Check acli Jira auth ---
echo "Checking acli Jira authentication..."
if ! acli jira project list &>/dev/null; then
  echo "  WARNING: acli Jira auth not configured or Jira unreachable."
  echo "  Run: acli auth login --service jira"
else
  echo "  OK: acli Jira auth active"
fi
echo ""

echo "==============================="
echo "SDD CLI installation complete."
echo "Next step: run /sdd-planning-setup to configure your project."
