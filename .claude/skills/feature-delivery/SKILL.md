---
name: feature-delivery
description: Orchestrates small-scope delivery by delegating to focused agents for implementation, testing, build confidence, and PR/docs.
---

# Skill: Feature Delivery

## When To Use

- Features and bug fixes that need implementation plus confidence checks.
- Changes that touch both code and validation/reporting expectations.

## Agent Routing

- This repository currently does not include local `.claude/agents/*` files.
- Use direct implementation + targeted test/build commands listed below.

## Minimum Validation Set

- Web-only: `yarn build-web && yarn test-web`
- App/lib/lambda-only: `yarn build-app && yarn test-app`
- Mixed areas: run both sets or `yarn build && yarn test`

## Execution Pattern

1. Checkout `main` branch and pull
2. Create branch:
   - if a feature -> f/JIRA_TICKET_NO
   - if a bug -> b/JIRA_TICKET_NO
   - if a chore -> chore/APPROPRIATE_TITLE_OF_THE_CHANGE

3. Apply minimal implementation change
4. Update nearest tests
5. Build
6. Test
7. Update the documentations by using `docs-generator` command
8. Commit the changes:
   - Start with Jira ticket, e.g., `[JIRA-1234]` or `[chore]`
   - Use imperative verb + oneliner title, e.g., `Fix blah blah bug`
   - Extended message from the PR summary template if needed
9. Open PR in GitHub with a summary of:
   - What changed
   - Why it changed
   - Validation run
   - Risks/follow-ups
10. Request review (manual for now)
11. Address feedback (manual for now)
12. Merge to main (manual for now)

## Implementation-Specific Notes

- Common code (shared lib) changes often trigger build in both app and web scopes
- When updating code, try to keep the related packages updated to the most recent minor version unless a breaking change is introduced
- When it comes to lambda changes, make sure to check if there are any related web/app/gateway changes needed to keep the contract/behavior consistent
- Always look for needed changes in the AWS CDK + GitHub actions setup to include the required steps, variables, environment, or other forms of data to support the change

## Test-Specific Notes

- It's easy to be drifted away from the test suite when making changes, so make sure to run the relevant tests locally before pushing
- When adding new tests, try to keep them focused on the change and avoid over-testing. If the change is small, a unit test with minimal setup might be sufficient.
- When adding new tests or updating existing ones, make sure to follow the existing test patterns and conventions in the codebase.

## Output Format

1. What changed
2. Why it changed
3. Which agent paths were used
4. Tests and build commands run
5. Risks or follow-ups
