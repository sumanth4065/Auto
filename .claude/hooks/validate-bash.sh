#!/bin/bash
# Pre-edit validation hook
# Runs before Claude edits files to ensure safety

set -e

FILE_PATH="$1"

# Don't edit package-lock.json or yarn.lock directly
if [[ "$FILE_PATH" == *"package-lock.json"* ]] || [[ "$FILE_PATH" == *"yarn.lock"* ]]; then
  echo "⚠️  Warning: Avoid editing lock files directly. Use yarn add/remove instead."
  exit 1
fi

# Don't edit .env files (should be in .gitignore)
if [[ "$FILE_PATH" == *".env"* ]] && [[ "$FILE_PATH" != *".env.example"* ]]; then
  echo "⚠️  Warning: .env files should not be edited by Claude (may contain secrets)"
  exit 1
fi

# Don't edit GitHub workflow files without caution
if [[ "$FILE_PATH" == *".github/workflows/"* ]]; then
  echo "⚠️  Warning: GitHub workflow changes may affect CI/CD. Review carefully."
  # Allow but warn
fi

# Warn about infrastructure changes
if [[ "$FILE_PATH" == *"infrastructure/"* ]] || [[ "$FILE_PATH" == *"cdk"* ]]; then
  echo "⚠️  Warning: Infrastructure changes detected. Ensure you understand CDK implications."
fi

echo "✅ Pre-edit validation passed for $FILE_PATH"
exit 0
