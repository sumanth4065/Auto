## Tech Analysis Structure

A Tech Analysis documents the discovery and research phase. It answers: *what do we need to understand before building?* It is written before implementation decisions are made and must reach Done before an Implementation Plan can be created.

The content lives in the **Jira issue description**. Decisions and question resolutions surfaced during analysis are logged as `[SDD-DECISION]` and `[SDD-RESOLUTION]` comments.

### Required Sections

**Current State**
Describe the relevant system behaviour as it exists today. Name file paths, function names, CLI flags, data shapes, or API surfaces that were observed or tested. "This does not exist yet" is not sufficient — the TA must show what was actually examined and how it behaves.

**Findings**
State what was learned from the investigation. What do we now know that we didn't know before? What was confirmed, disproven, or discovered? Decisions reached during analysis are logged as `[SDD-DECISION]` comments; any decision that shapes the Implementation Plan must be captured there.

**Open Questions**
List any questions that could not be resolved during analysis. Each open question must be logged as a `[SDD-QUESTION]` comment with an owner. A TA cannot be approved while unresolved questions remain — they must either be resolved (logged as `[SDD-RESOLUTION]`) or explicitly deferred with a rationale.

**Risk and Constraints**
State the risk level and any known constraints. Include blocking unknowns, external dependencies, or technical hazards uncovered during analysis. A section that says only "low risk" with no reasoning is insufficient — explain why.

### What Does NOT Belong

- Implementation details or proposed solutions — those belong in the Implementation Plan
- Phase breakdowns or task sequencing
- Code snippets or file-level change instructions
- Estimates or timelines
