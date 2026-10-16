#!/bin/bash
#Version 2.0.0

# Generates a PO/PM-friendly release summary from JIRA tickets, grouped by track.
# Accepts the same parameters as get-asset-versions.sh
# Optional --ai flag generates a narrative summary via GitHub Models API.

OUTPUT_FILE="release_summary.txt"
SEPARATOR="==============================================="
SECTION_LINE="-----------------------------------------------"

RED='\033[0;31m'
NC='\033[0m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
GREEN='\033[0;32m'

# Check for --ai flag anywhere in the arguments
USE_AI=false
POSITIONAL_ARGS=()
for arg in "$@"; do
  if [ "$arg" = "--ai" ]; then
    USE_AI=true
  else
    POSITIONAL_ARGS+=("$arg")
  fi
done
set -- "${POSITIONAL_ARGS[@]}"

if [ -z "$JIRA_URL" ] || [ -z "$JIRA_EMAIL" ] || [ -z "$JIRA_API_TOKEN" ]; then
  echo "Error: JIRA_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables must be set."
  echo "Please read the README.md file for more information."
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: $0 <version> [<track>] [<ready>] [--ai]"
  echo -e "${RED}<version> is required${NC}"
  echo -e "Run ${CYAN}./get-jira-release-summary.sh help${NC} for help"
  exit 1
fi

if [[ $1 == "help" ]]; then
  echo -e "${YELLOW}Usage: $0 <version> [<track>] [<ready>] [--ai]"
  echo -e "<version> is the fix version from JIRA"
  echo -e "<track> is an optional filter by track"
  echo -e "<ready> is an optional filter by ready only status (Pending Signoff or Ready to Ship)"
  echo -e "--ai generates an AI-powered narrative summary (requires GITHUB_TOKEN or gh CLI)${NC}"
  echo ""
  echo -e "Example: ${CYAN}./get-jira-release-summary.sh 'ER2-7670 (03/20/2025) - AWS'${NC}"
  echo -e "Example: ${CYAN}./get-jira-release-summary.sh 'ER2-7670 (03/20/2025) - AWS' Yosemite${NC}"
  echo -e "Example: ${CYAN}./get-jira-release-summary.sh 'ER2-7670 (03/20/2025) - AWS' --ai${NC}"
  echo -e "Example: ${CYAN}./get-jira-release-summary.sh 'ER2-7670 (03/20/2025) - AWS' Yosemite ready --ai${NC}"
  exit 0
fi

FIX_VERSION=$1
TRACK="nothing"
FILTER="none"

if [ -z "$2" ]; then
  TRACK="nothing"
elif [ "$2" = "ready" ]; then
  FILTER="ready"
  TRACK="nothing"
else
  TRACK="$2"
fi

if [ -z "$3" ]; then
  if [ "$FILTER" != "ready" ]; then
    FILTER="none"
  fi
else
  FILTER="$3"
fi

TRACK_FIELD_ID="customfield_12248"
SEARCH_URL="${JIRA_URL}/rest/api/3/search/jql"

echo "release: $FIX_VERSION"
JQL="fixVersion~'*$FIX_VERSION*'"

case $TRACK in
  "nothing")
    ;;
  *)
    echo "track: $TRACK"
    JQL="$JQL&tracks='$TRACK'"
    ;;
esac

case $FILTER in
  "ready")
    echo "status: 'Pending Signoff' | 'Ready to Ship'"
    JQL="$JQL&status IN ('Pending Signoff', 'Ready to Ship')"
    ;;
  *)
    ;;
esac

if [ "$USE_AI" = true ]; then
  echo "ai summary: enabled"
fi

response=$(curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -G --data-urlencode "jql=$JQL" \
  --data-urlencode "fields=key,summary,status,description,$TRACK_FIELD_ID" \
  --data-urlencode "maxResults=100" \
  "$SEARCH_URL")

if [[ $response == *"errorMessages"* ]]; then
  echo "Error fetching tickets."
  errorMessages=$(echo "$response" | jq -r '.errorMessages')
  warningMessages=$(echo "$response" | jq -r '.warningMessages')
  printf '\n"errorMessages": "%s", \n"warningMessages": "%s"\n' "$errorMessages" "$warningMessages"
  exit 1
fi

COUNT=$(echo "$response" | jq -r '.issues | length')
echo "tickets found: $COUNT"
echo ""

if [ "$COUNT" -eq 0 ]; then
  echo "No tickets found for this release."
  exit 0
fi

JQ_HELPERS='
  def get_track:
    if . == null then "Unassigned"
    elif type == "array" then
      if length > 0 then (.[0].value // "Unassigned") else "Unassigned" end
    elif type == "object" then (.value // .name // "Unassigned")
    elif type == "string" then .
    else "Unassigned"
    end;

  def extract_text:
    if type == "object" and has("content") then
      .content | map(
        if .type == "paragraph" and has("content") then
          .content | map(if .type == "text" then .text else empty end) | join("")
        elif .type == "bulletList" and has("content") then
          .content | map(
            if .type == "listItem" and has("content") then
              .content | map(
                if .type == "paragraph" and has("content") then
                  .content | map(if .type == "text" then .text else empty end) | join("")
                else empty end
              ) | join("")
            else empty end
          ) | map("  - " + .) | join("\n")
        elif .type == "heading" and has("content") then
          .content | map(if .type == "text" then .text else empty end) | join("")
        else empty end
      ) | map(select(length > 0)) | join("\n")
    elif . == null then ""
    else ""
    end;
'

TICKET_SUMMARY=$(echo "$response" | jq -r --arg tf "$TRACK_FIELD_ID" "$JQ_HELPERS"'
  [.issues[] | {
    track: (.fields[$tf] | get_track),
    key: .key,
    summary: .fields.summary,
    status: .fields.status.name
  }] |
  sort_by(.track) | group_by(.track) |
  sort_by(.[0].track) |
  map(
    "--- \(.[0].track) (\(length) \(if length > 1 then "tickets" else "ticket" end)) ---\n" +
    (map("  [\(.status)] \(.key): \(.summary)") | join("\n"))
  ) | join("\n\n")')

DETAILED_DESCRIPTIONS=$(echo "$response" | jq -r --arg tf "$TRACK_FIELD_ID" "$JQ_HELPERS"'
  [.issues[] |
    {
      track: (.fields[$tf] | get_track),
      key: .key,
      summary: .fields.summary,
      description: (.fields.description | extract_text)
    } |
    select(.description != null and (.description | length) > 0)
  ] |
  if length == 0 then "  No descriptions available."
  else
    sort_by(.track) | group_by(.track) |
    sort_by(.[0].track) |
    map(
      "--- \(.[0].track) ---\n" +
      (map(
        "  \(.key): \(.summary)\n    \(.description | split("\n") | map("    " + .) | join("\n") | ltrimstr("    "))"
      ) | join("\n\n"))
    ) | join("\n\n")
  end')

AI_SUMMARY=""
if [ "$USE_AI" = true ]; then
  echo -e "${CYAN}Generating AI summary...${NC}"

  GH_TOKEN="${GITHUB_TOKEN:-}"
  if [ -z "$GH_TOKEN" ]; then
    if command -v gh &> /dev/null; then
      GH_TOKEN=$(gh auth token 2>/dev/null)
    fi
  fi

  if [ -z "$GH_TOKEN" ]; then
    echo -e "${YELLOW}Warning: No GitHub token found. Set GITHUB_TOKEN or authenticate with 'gh auth login'.${NC}"
    echo -e "${YELLOW}Skipping AI summary.${NC}"
  else
    TICKET_DATA=$(echo "$response" | jq -r --arg tf "$TRACK_FIELD_ID" "$JQ_HELPERS"'
      [.issues[] | {
        track: (.fields[$tf] | get_track),
        key: .key,
        title: .fields.summary,
        status: .fields.status.name,
        description: (.fields.description | extract_text | if length > 300 then .[:300] + "..." else . end)
      }] |
      sort_by(.track) | group_by(.track) |
      sort_by(.[0].track) |
      map(
        "Track: \(.[0].track)\n" +
        (map("- \(.key): \(.title)\n  Status: \(.status)" + (if .description != "" then "\n  Description: \(.description)" else "" end)) | join("\n"))
      ) | join("\n\n")')

    SYSTEM_PROMPT="You are a technical writer creating release summaries for product owners and managers. Given JIRA tickets grouped by track, write a brief, non-technical narrative summary for each track. Keep each track summary to 2-3 sentences max. Focus on what the changes mean for end users or the business. Do not include ticket numbers. Use simple language."

    ESCAPED_TICKET_DATA=$(echo "$TICKET_DATA" | jq -Rs .)
    ESCAPED_SYSTEM_PROMPT=$(echo "$SYSTEM_PROMPT" | jq -Rs .)

    AI_REQUEST=$(jq -n \
      --argjson system "$ESCAPED_SYSTEM_PROMPT" \
      --argjson user "$ESCAPED_TICKET_DATA" \
      '{
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: $system },
          { role: "user", content: ("Summarize this release for a product owner:\n\n" + $user) }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }')

    AI_RESPONSE=$(curl -s -X POST "https://models.inference.ai.azure.com/chat/completions" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $GH_TOKEN" \
      -d "$AI_REQUEST" 2>/dev/null)

    AI_CONTENT=$(echo "$AI_RESPONSE" | jq -r '.choices[0].message.content // empty' 2>/dev/null)

    if [ -n "$AI_CONTENT" ] && [ "$AI_CONTENT" != "null" ]; then
      AI_SUMMARY="$AI_CONTENT"
      echo -e "${GREEN}AI summary generated.${NC}"
    else
      AI_ERROR=$(echo "$AI_RESPONSE" | jq -r '.error.message // .message // empty' 2>/dev/null)
      if [ -n "$AI_ERROR" ]; then
        echo -e "${YELLOW}AI summary failed: $AI_ERROR${NC}"
      else
        echo -e "${YELLOW}AI summary failed. Continuing without it.${NC}"
      fi
    fi
  fi
fi

{
  echo "Release Summary"
  echo "$SEPARATOR"
  echo "Version: $FIX_VERSION"
  echo "Generated: $(date '+%Y-%m-%d %H:%M')"
  if [ "$TRACK" != "nothing" ]; then
    echo "Track Filter: $TRACK"
  fi
  if [ "$FILTER" = "ready" ]; then
    echo "Status Filter: Pending Signoff, Ready to Ship"
  fi

  if [ -n "$AI_SUMMARY" ]; then
    echo ""
    echo "AI-GENERATED SUMMARY"
    echo "$SECTION_LINE"
    echo "$AI_SUMMARY"
  fi

  echo ""
  echo "TICKET SUMMARY"
  echo "$SECTION_LINE"
  echo "$TICKET_SUMMARY"

  echo ""
  echo "DETAILED DESCRIPTIONS"
  echo "$SECTION_LINE"
  echo "$DETAILED_DESCRIPTIONS"

  echo ""
  echo "$SEPARATOR"
  echo "Total: $COUNT tickets"
} > "$OUTPUT_FILE"

cat "$OUTPUT_FILE"

echo ""
echo -e "${CYAN}Summary saved to $OUTPUT_FILE${NC}"

exit 0
