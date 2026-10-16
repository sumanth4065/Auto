## Implementation Plan Structure

An Implementation Plan is a design review document intended for engineers and stakeholders to assess the feasibility and approach of a proposed implementation. It is **not** a project plan, task list, or phase breakdown — those belong in Phase Tasks.

The content lives in the **Jira issue description**. Comments are the review mechanism — reviewers use comments to provide input, raise concerns, or suggest changes before the IP is approved. When generating Phase Tasks, comments on the IP should be read and reconciled with the description to ensure outstanding feedback has been addressed or consciously deferred.

### Required Sections

**Problem Statement**
What is broken, missing, or suboptimal? Why does this need to change, and why now?

**Proposed Solution**
High-level description of the approach. What will be built, changed, or removed? Include key design decisions and the reasoning behind them.

**Alternatives Considered**
Other approaches that were evaluated, and why they were rejected or deprioritized.

**Risks and Open Questions**
Known unknowns, technical risks, dependency risks, or decisions that must be resolved before or during implementation.

**Dependencies**
External systems, other tickets, prerequisite work, or environmental requirements this work depends on.

### What Does NOT Belong

- Phase breakdowns or sequenced task lists
- File-level implementation details or code snippets
- Step-by-step build instructions
- Estimates or timelines
