# SDD Skill Glossary

A reference for terms, artifact types, commands, and concepts used across all SDD planning skills and the `sdd` CLI.

---

## Artifact Types

SDD uses four Jira issue types that together form a planning hierarchy under an Engineering Story.

### Engineering Story

The top-level unit of engineering work. Created from a product Epic via `sdd intake` or `sdd story create`. All other SDD artifacts are children of the Engineering Story.

An Engineering Story progresses from Backlog → In Progress → Done as its children are completed.

### Tech Analysis (TA)

Documents the discovery and research phase. Answers: *what do we need to understand before building?* Created before any implementation decisions are made.

Must reach **Done** (via `sdd approve`) before an Implementation Plan can be created. This is the `impl_create` gate.

### Implementation Plan (IP)

Documents the technical approach — *how will the system be built?* Describes architecture, key design decisions, and component interactions.

Must **not** contain phase breakdowns, task assignments, or timeline estimates — those belong in Phase Tasks. Must reach **Done** (via `sdd approve`) before Phase Tasks can be created. This is the `phase_create` gate.

### Phase Task

One executable slice of work derived from the Implementation Plan. Each Phase Task has a sequence number and carries a `[SDD-SPEC]` spec document as its description.

Phase Tasks execute sequentially — a phase cannot start until the prior phase is Done (`phase_start` gate).

---

## Artifact Hierarchy

```
Epic (product project)
└── Engineering Story
    ├── Tech Analysis
    ├── Implementation Plan
    ├── Phase Task (sequence 1)
    ├── Phase Task (sequence 2)
    └── Phase Task (sequence N)
```

The Epic lives in a product Jira project. The Engineering Story and all its children live in the engineering project. The cross-project link is recorded in `issuelinks`.

---

## Lifecycle Gates

Gates enforce the sequence of the SDD workflow. Each gate has a name, a condition, and a `--force` bypass that writes an `[SDD-OVERRIDE]` audit comment.

| Gate | Condition required |
|---|---|
| `impl_create` | Tech Analysis is Done |
| `phase_create` | Implementation Plan is Done |
| `phase_start` | Prior Phase Task is Done (or this is the first phase) |
| `work_start` | Issue is in Backlog or Selected for Development |
| `approve` | Issue is In Progress |

---

## Skill Commands

### `/spec-plan` — Core Lifecycle

| Command | What it does |
|---|---|
| `intake <epic-key>` | Create an Engineering Story from a product Epic |
| `chain <key>` | View the full artifact tree for any issue in the hierarchy |
| `status <key>` | View tree + tagged comment summary for a focal issue |
| `status <key> --detail` | As above, plus the issue's description body |
| `story create <project> "<title>"` | Create a standalone Engineering Story |
| `story create <project> --epic <key> "<title>"` | Create an Engineering Story linked to a product Epic |
| `story complete <key>` | Transition an Engineering Story to Done |
| `analysis create <story-key> "<title>"` | Create a Tech Analysis under a story |
| `impl create <story-key> "<title>"` | Create an Implementation Plan under a story |
| `phase create <story-key> <N> "<title>"` | Create Phase Task N under a story |
| `analysis start <ta-key>` | Assign and transition TA to In Progress |
| `impl start <ip-key>` | Assign and transition IP to In Progress |
| `analysis approve <ta-key>` | Review and approve a Tech Analysis (two-step) |
| `impl approve <ip-key>` | Review and approve an Implementation Plan (two-step) |
| `phase start <key>` | Start the next Phase Task |
| `phase complete <key>` | Complete the current Phase Task |
| `spec compose <phase-key>` | Compose and write the `[SDD-SPEC]` for a Phase Task |
| `spec view <phase-key>` | View the most recent spec for a Phase Task |

### `/spec-plan-discover` — Read-Only Discovery

| Command | What it does |
|---|---|
| `project <project-key>` | View issue types and workflow statuses for a Jira project |
| `tree <issue-key>` | BFS traversal of any issue's child hierarchy |
| `tree <issue-key> --depth <N>` | Traversal limited to N levels deep |
| `tree <issue-key> --max <N>` | Traversal limited to N total nodes |
| `search --jql "<JQL>"` | Search Jira with a raw JQL query |
| `search --epic <KEY>` | Search for all children of an epic |
| `search --epic <KEY> --type <name>` | Children of an epic filtered by issue type |
| `search --epic <KEY> --limit <N>` | Children of an epic, limited to N results |

### `/spec-plan-content` — Content Management

| Command | What it does |
|---|---|
| `set-description <KEY> <file>` | Write a markdown file as a Jira issue's description |
| `add-decision <KEY> "<decision>" "<rationale>"` | Log a decision with rationale |
| `view-decisions <KEY>` | List all logged decisions |
| `add-question <KEY> "<question>" "<owner>"` | Log an open question with an owner |
| `resolve-question <KEY> <id> "<resolution>"` | Resolve a question by ID |
| `view-questions <KEY>` | List all questions with resolution status |

### `/spec-plan-config` — Project Configuration

| Command | What it does |
|---|---|
| `init <project-key>` | Scaffold `.sdd/` directory for a project |
| `show` | Display current `.sdd/config.json` |
| `validate` | Validate config against schema |
| `add-project <key> --role <engineering\|product>` | Register a Jira project |
| `remove-project <key>` | Remove a project from config |
| `set-default <key>` | Set the default engineering project |
| `discover <key>` | Auto-discover issue type IDs for a project |

### `/spec-plan-setup` — One-Time Setup

Checks prerequisites (acli installation, authentication, user identity) and creates `.sdd/config.json` if it doesn't exist.

---

## CLI Concepts

### JSON Envelope

Every `sdd` command emits a JSON envelope to stdout:

```json
{"ok": true,  "result": {...}, "warnings": [...]}
{"ok": false, "error": {"code": "...", "message": "..."}}
```

Skills parse this envelope and display `result` content or `error.message` to the user. Raw JSON and stack traces are never shown.

### Artifact Tree (`result.tree`)

A pre-rendered text string showing the Engineering Story and all its children:

```
SDD-8 | Engineering Story | In Progress
├── SDD-9  | Tech Analysis        | Done
├── SDD-10 | Implementation Plan  | Done
├── SDD-11 | Phase Task           | Done
├── SDD-12 | Phase Task           | In Progress
└── SDD-13 | Phase Task           | Backlog
Links: SDD-7 (Epic)
Last verified: 2026-05-05T14:32:00Z
```

Always displayed as-is — skills never reformat or re-render the tree.

### `[SDD-STATE]` Comment

A structured Jira comment written after every mutation. Contains the serialised artifact tree in a JSON block. Enables cross-session continuity — a new Claude Code session reads the latest `[SDD-STATE]` comment instead of re-fetching the full Jira hierarchy.

### Comment Tags

All structured comments written by the CLI use bracketed tags on the first line:

| Tag | Written by | Purpose |
|---|---|---|
| `[SDD-STATE]` | All mutation commands | Serialised artifact tree |
| `[SDD-SPEC]` | `sdd spec compose` | Phase Task spec document |
| `[SDD-DECISION]` | `sdd decision add` | Logged decision with rationale |
| `[SDD-QUESTION]` | `sdd question add` | Open question with owner |
| `[SDD-RESOLUTION]` | `sdd question resolve` | Resolution for a question |
| `[SDD-OVERRIDE]` | Any `--force` command | Gate bypass audit trail |
| `[SDD-INTAKE]` | `sdd intake` | Intake summary when creating a story from an epic |

### `[SDD-SPEC]` Document

A structured spec document attached to each Phase Task. On first composition it is written to the Jira **description field**. Subsequent re-compositions are posted as comments (edit history). Composed from: phase task description, TA and IP descriptions, logged decisions and open questions, prior phase summary.

### `--force` / Gate Bypass

Any gated command accepts `--force` to bypass the gate check. This always writes an `[SDD-OVERRIDE]` audit comment so the bypass is visible in the issue history.

---

## Jira Field Mappings

| SDD concept | Jira field |
|---|---|
| Issue type IDs | Sourced from `.sdd/config.json` `issue_types` per project |
| Spec document | `description` field (first compose) or `comment` (re-compose) |
| Epic link | `issuelinks` with `inward`/`outward` relationship |
| Parent story | `issuelinks` with `parent` relationship |
| Assignee | `assignee.emailAddress` |
| Status | `status.name` — compared against config `statuses` list |

### `.sdd/config.json`

Per-repository config file. Contains project registry, issue type IDs, and status lists. Created by `/spec-plan-setup` or `sdd config init`.

```json
{
  "version": "1.0",
  "projects": [
    {
      "key": "SDD",
      "role": "engineering",
      "label": "SDD Planning",
      "issue_types": {
        "engineering_story": {"id": "14257", "name": "Engineering Story"},
        "tech_analysis":     {"id": "14258", "name": "Tech Analysis"},
        "implementation_plan": {"id": "14259", "name": "Implementation Plan"},
        "phase_task":        {"id": "14260", "name": "Phase Task"}
      },
      "statuses": ["Backlog", "Selected for Development", "In Progress", "Done"]
    }
  ],
  "defaults": {
    "engineering_project": "SDD"
  }
}
```
