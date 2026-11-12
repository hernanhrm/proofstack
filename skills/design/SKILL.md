---
name: design
description: "Creates or revises the technical design for a change: acceptance scenarios that answer the brief, before-and-after Mermaid diagrams, numbered decisions with ADRs and tasks. Use when someone asks to design, propose or plan a change."
---

# Design a change

The design answers the brief from `understand`: it shows how the change meets each success and acceptance criterion, respects each exclusion and settles each open question. It does not restate the problem or criteria; it references them by ID. It is also the promise that a later `visual-diff` review checks against the actual diff, so write every planned flow change, decision and acceptance scenario so a reviewer can confirm or refute it in the code. Design before implementation; do not implement code or mark tasks complete.

## Prepare

Each change lives in `docs/<ticket-number>/`, such as `docs/PROJ-123/`, unless the user names another directory; take the ticket number from the user, branch or PR, otherwise ask, or use a short kebab-case name if the user has no ticket. Read that directory's `brief.md` first. If it is missing, suggest `understand`; if the user proceeds without it, ask for the success and acceptance criteria instead of inventing them. Then investigate relevant code, existing behavior and tests, and record the baseline revision the design describes. If the investigation shows a brief item is wrong, incomplete or unachievable, say so and propose the brief change instead of silently designing around it.

Find the repository's ADR directory, such as `docs/adr/` or `docs/decisions/`; default to `docs/adr/`. Read the ADRs that govern the affected area. A design that contradicts an accepted ADR must supersede it explicitly.

If an existing change is ambiguous, ask which one to update. For an existing change, read its `design.md`, `acceptance.md` and linked ADRs before editing. Reconcile requested decisions, preserve unrelated content, and identify completed work and evidence made stale by the revision; when a scenario's expectation changes, clear its later stage cells.

## Write `design.md`

Write tersely: fragments, arrows and labels such as "Not:" and "Cost:" are fine, and articles and filler can go. Keep negations, numbers, identifiers, paths and error text exact, because `verify-acceptance-criteria` and `visual-diff` check against them. Use these sections in order:

Start `design.md` with links to `brief.md` and `acceptance.md`, the baseline revision and any ADRs. The scenarios live only in `acceptance.md`; never copy them into `design.md`.

1. **Acceptance:** answer the brief in `acceptance.md`. Under every S, AC and X criterion row, add scenario rows numbered under its ID: AC2.1 and AC2.2 for acceptance, X1.1 for behavior an exclusion keeps unchanged, S1.1 for how a success measure is checked after release. Add rows for scenarios the design itself introduces, such as failure and compatibility paths, numbered under their decision, such as D5.1, after the criteria. Merge scenarios that share one check into one row. Cover boundaries, failures, behavior that must not change, and removed behavior with its reason and migration. Fill only **Scenario → expected**, **Check** and **Gap**. **Check** holds only the category from the file's legend; leave files, test names and flags to the tasks. In **Gap**, mark with ⚠ the rows met only partly or only by an assumption; they need the user's decision. For a spike, list investigation deliverables and conditional findings instead.
2. **Design:** link the brief's diagram for current behavior and add one line on what it changes; draw a **Before** diagram only when the brief's diagram does not show the part that changes. Draw an **After** diagram of planned behavior with numbered steps, then one short why note per step citing its decision or scenario IDs. Add a diagram for each other affected aspect, including callers and consumers whose code will not change: flowcharts for journeys and branches, sequence diagrams for interactions over time, ER diagrams for data, class diagrams for types and dependencies, state diagrams for lifecycles. Use real names from the code and mark new ones as planned.
3. **Decisions:** numbered D1, D2…, one item each with the choice, **Not:** rejected alternatives and why, **Cost:** the trade-off, and **Detect:** how a failure is detected, or that detection is unknown. Name the brief questions (Q) each decision answers. Link the ADR when one applies.
4. **Rollout:** numbered R1, R2… for flags and their defaults per environment, deploy order, migrations, rollback, and how each success measure is collected after release. When none apply, say so in one line.
5. **Tasks:** small end-to-end `- [ ]` tasks numbered T1, T2…, each naming its change, the files it touches when known and its scenario IDs, with tests and documentation inside the task. Human acceptance is not an agent task.
6. **Open questions:** brief questions no decision fully answers, new ones the design raises numbered N1, N2…, and assumptions.

Use fenced `mermaid` blocks with notes readable without hover. Keep each diagram focused and omit unaffected structure.

### Make scenarios independently judgeable

Merge scenarios only when they share both a check and one independently judgeable outcome. Split subcases that can have different statuses or require different environments, even if one test command covers them. A blocked deployment check or defensive edge case must not obscure passing local checks.

Before promising a fixture, inspect relevant schema constraints, contracts and test setup to confirm the state is representable. If a proposed case is impossible in the supported system, explain why and recommend omitting the unnecessary requirement or testing the defensive behavior separately where justified. Surface conflicts with an approved design for the user's decision; do not silently remove requirements, relax real constraints or expand the harness merely to manufacture an impossible fixture.

## Write ADRs

Write an ADR only for a decision that is hard to reverse or sets a rule beyond this change, such as a data model, public contract, idempotency scheme or new dependency; keep other decisions in `design.md`. Follow the repository's existing ADR format; otherwise write `docs/adr/NNNN-<slug>.md`, numbered after the highest existing ADR, with **Status**, **Context**, **Decision**, **Alternatives**, **Consequences** and links to the design and ticket. Status stays Proposed until the user approves the decision. Never rewrite an accepted ADR; supersede it with a new one and mark the old one superseded.

## Report

Render and inspect the Mermaid diagrams with an available renderer, or report that they were not checked. Report the paths written, brief items the design does not fully meet, the decisions that need the user's approval, and new questions and assumptions. A design is not implementation or evidence of a passing check. When implementation is requested, use `implement`.
