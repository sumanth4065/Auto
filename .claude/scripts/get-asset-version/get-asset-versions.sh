#!/bin/bash
#Version 1.4.0

# Variables user can change
OUTPUT_FILE="asset_versions.txt" # You can change the output file name if you want
SEPARATOR="-----------------------------" # You can change the separator if you want

RED='\033[0;31m'
NC='\033[0m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'

# Check if required environment variables are set
if [ -z "$JIRA_URL" ] || [ -z "$JIRA_EMAIL" ] || [ -z "$JIRA_API_TOKEN" ]; then
  echo "Error: JIRA_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables must be set."
  echo "Please read the README.md file for more information."
  exit 1
fi

# Check if a fix version is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <version> [<track>] [<ready>]"
  echo -e "${RED}<version> is required${NC}"
  echo -e "Run ${CYAN}./get-asset-versions.sh help${NC} for help"
  exit 1
fi

# Help command
if [[ $1 == "help" ]]; then
  echo -e "${YELLOW}Usage: $0 <version> [<track>] [<ready>]"
  echo -e "<version> is the fix version from JIRA"
  echo -e "<track> is an optional filter by track"
  echo -e "<ready> is an optional filter by ready only status (Pending Signoff or Ready to Ship)${NC}"
  echo -e "Example: ${CYAN}./get-asset-versions.sh 'ER2-7670 (03/20/2025) - AWS'${NC}"
  echo -e "Example: ${CYAN}./get-asset-versions.sh 'ER2-7670 (03/20/2025) - AWS' Yosemite${NC}"
  echo -e "Example: ${CYAN}./get-asset-versions.sh 'ER2-7670 (03/20/2025) - AWS' Yosemite ready${NC}"
  echo -e "Example: ${CYAN}./get-asset-versions.sh 'ER2-7670 (03/20/2025) - AWS' ready${NC}"
  exit 0
fi

# Default values for optional params
FIX_VERSION=$1
TRACK="nothing"
FILTER="none"

# Check if a track is passed as the second argument
if [ -z "$2" ]; then
  TRACK="nothing"
elif [ "$2" = "ready" ]; then
  FILTER="ready"
  TRACK="nothing"
else
  TRACK="$2"
fi

# Check if filter is passed as the third argument
if [ -z "$3" ]; then
  if [ -z "$FILTER" ]; then
    FILTER="none"
  fi
else
  FILTER="$3"
fi

ASSET_FIELD_ID="customfield_12267"
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

# Fetch issues from JIRA
response=$(curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -G --data-urlencode "jql=$JQL" \
  --data-urlencode "fields=key,summary,status,$ASSET_FIELD_ID" \
  "$SEARCH_URL")

# Check if the response contains issues
if [[ $response == *"errorMessages"* ]]; then
  echo "Error fetching tickets."
  errorMessages=$(echo "$response" | jq -r '.errorMessages')
  warningMessages=$(echo "$response" | jq -r '.warningMessages')
  printf '\n"errorMessages": "%s", \n"warningMessages": "%s"\n' "$errorMessages" "$warningMessages"
  exit 1
fi

echo "output: $OUTPUT_FILE"
echo ""
COUNT=$(echo "$response" | jq -r '.issues | length')
echo "Number of jira tickets: $COUNT"

PID=$$

echo "$response" | jq -r '
  def extract_inline:
    if .type == "text" then
      if (.marks // [] | map(select(.type == "link")) | length) > 0 then
        .text + (.marks | map(select(.type == "link")) | .[0].attrs.href)
      else
        .text
      end
    elif .type == "inlineCard" then
      .attrs.url
    else empty end;

  def extract_text:
    if type == "object" and has("content") then
      .content | map(
        if .type == "paragraph" and has("content") then
          .content | map(extract_inline) | join("")
        elif .type == "bulletList" and has("content") then
          .content | map(
            if .type == "listItem" and has("content") then
              .content | map(
                if .type == "paragraph" and has("content") then
                  .content | map(extract_inline) | join("")
                elif .type == "bulletList" and has("content") then
                  .content | map(
                    if .type == "listItem" and has("content") then
                      .content | map(
                        if .type == "paragraph" and has("content") then
                          .content | map(extract_inline) | join("")
                        else empty end
                      ) | join("")
                    else empty end
                  ) | join("")
                else empty end
              ) | join("\n")
            else empty end
          ) | join("\n")
        else empty end
      ) | join("\n")
    else . end;

  .issues[] |
  "\(.key): \(.fields.summary)\nStatus: \(.fields.status.name)\nAsset Versions:\n\((.fields.'"$ASSET_FIELD_ID"' | extract_text) // "N/A")\n'$SEPARATOR'"' | grep -v '"'"'^$'"'"'  >> "$PID"

sed -e "s/$SEPARATOR/\n$SEPARATOR\n/g" $PID > $OUTPUT_FILE
rm $PID

exit 0
