#!/bin/bash
# Post-edit formatting hook
# Runs after Claude edits files to ensure formatting

set -e

FILE_PATH="$1"

# Skip non-code files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx|json)$ ]]; then
  echo "⏭️  Skipping format check for non-code file"
  exit 0
fi

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
  echo "⚠️  File not found: $FILE_PATH"
  exit 1
fi

# Run Prettier if available
if command -v prettier &> /dev/null; then
  echo "🎨 Running Prettier on $FILE_PATH..."
  prettier --write "$FILE_PATH" 2>/dev/null || {
    echo "⚠️  Prettier formatting failed (non-fatal)"
  }
fi

# Check TypeScript compilation if it's a TS file
if [[ "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  if command -v tsc &> /dev/null; then
    echo "🔍 Checking TypeScript compilation..."
    tsc --noEmit "$FILE_PATH" 2>/dev/null || {
      echo "⚠️  TypeScript compilation warnings (check manually)"
    }
  fi
fi

echo "✅ Post-edit checks complete for $FILE_PATH"
exit 0
