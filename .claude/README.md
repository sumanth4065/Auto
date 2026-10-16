# .claude Configuration

Lean setup for this repository.

## Keep It Small

- Use `agents/` for specialized execution roles.
- Use `commands/` for repeatable playbooks.
- Use `hooks/` only for fast local guardrails.
- Use `rules/` for short hard constraints.
- Use `skills/` for reusable delivery behavior.

## Recommended Agent Picks

- `skills/feature-delivery/SKILL.md`
- `commands/docs-generator.md`
- `rules/repo-rules.md`

## Notes

- This repo is small enough that one skill is sufficient.
- Avoid adding new config unless it removes repeated manual work.
