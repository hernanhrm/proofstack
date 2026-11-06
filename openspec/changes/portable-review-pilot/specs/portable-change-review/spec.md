# Spec delta

## Purpose
Make an OpenSpec change reviewable through portable files, reproducible checks and an explicit human testing record.

## ADDED Requirements

### Requirement: AC1 — OpenSpec owns delivery
The workflow SHALL use a custom OpenSpec proposal/specs/tasks schema and stock delivery workflows, without requiring a separate design document or custom delivery skills. Check owner: agent.

#### Scenario: Plan and implement a change
- **WHEN** a new change acquires its proposal, acceptance specs and tracked tasks
- **THEN** OpenSpec exposes the implementation context and task progress without a design artifact.

#### Scenario: Finish a change
- **WHEN** completed tasks and valid delta specs are archived
- **THEN** the specs are synced and the change-local evidence is retained in the archive.

### Requirement: AC2 — Review skills are portable
The two custom skills SHALL operate on local change files without proprietary APIs or dependencies on other custom delivery skills. Check owner: agent.

#### Scenario: Select another harness
- **WHEN** OpenSpec integrations are generated for Codex and Claude Code
- **THEN** both can load the same Human review and Guided test instructions alongside stock delivery skills.

### Requirement: AC3 — Humans can judge the demonstrated result
The review SHALL show a before/after system overview, observed evidence and limits, with concise reproducible testing steps and an unambiguous human result. Check owner: human.

#### Scenario: Review before human execution
- **WHEN** agent checks have run but no human has followed the guide
- **THEN** agent observations are labeled separately and human acceptance remains pending.
