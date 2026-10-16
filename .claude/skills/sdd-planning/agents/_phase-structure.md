## Phase Task Structure

A Phase Task description is the spec for one executable slice of work derived from the Implementation Plan. It must give an implementer everything they need to build the phase without referring back to the session that created it or asking follow-up questions.

The content lives in the **Jira issue description**. The `[SDD-SPEC]` document (composed via `sdd spec compose`) is a richer prompt-ready artifact built from this description combined with the TA, IP, and prior phase context — but the description itself must be complete on its own.

### Required Sections

**Scope**
One paragraph describing what this phase accomplishes and what it explicitly does not touch. This bounds the work so the implementer knows where to stop. "Update config.py" is not a scope statement — describe the user-visible or system-visible outcome.

**Changes**
For each file that changes: name the file, then name the specific functions, classes, arguments, CLI flags, or data structures being added or modified within it. Naming only the file without stating what changes inside it is not sufficient. Code sketches or pseudocode are welcome where they clarify intent.

**Tests**
List the specific test cases to add or modify. Each test case must describe the input condition and the expected behaviour — enough detail that a different engineer can write it without guessing. "Add tests" with no specifics is not sufficient.

**Dependencies**
If this phase depends on output from a prior phase (a helper function, a schema change, a new CLI flag, a new module), name it explicitly. Phases execute sequentially and the implementer must know what to assume is already in place.

### What Does NOT Belong

- Design rationale or architecture decisions — those belong in the Implementation Plan
- Cross-cutting concerns that span multiple phases
- Estimates or timelines
