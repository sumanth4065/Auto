## Output Contract

**Never return large content as response text.** The dispatcher only reads the `result:` line and the JSON artifact. Any document content (written descriptions, multi-line reports, etc.) must be written to a temp file, converted to ADF, and posted to Jira via `acli`, then referenced by key in the `result:` line.

To post document content to Jira:
1. Write Markdown to a temp file: `cat > /tmp/sdd-<type>-<key>.md << 'EOF' ... EOF`
2. Convert to ADF: `python3 .sdd/utils/convert.py md2adf /tmp/sdd-<type>-<key>.md /tmp/sdd-<type>-<key>.json`
3. Post to Jira: `acli jira workitem comment create --key <key> --body-file /tmp/sdd-<type>-<key>.json`

Never post raw Markdown to Jira — always convert first. State artifacts (the JSON code block) are the only structured content that belongs in your response.
