---
name: implement
description: "Implements and checks the tasks in a structured change. Use when someone asks to start or continue implementation from a change plan."
---

# Implement a change

Select the named or unambiguous change, by default in `docs/<ticket-number>/`; otherwise ask. Read its `design.md`, `acceptance.md` and linked ADRs, then inspect the affected code. Report the change, completed versus total tasks and the next task. Implement the requested unchecked tasks in order, preserving unrelated work. If the plan or prerequisites are missing, inconsistent or materially ambiguous, report the blocker rather than inventing requirements. If implementation reveals a design issue or needs materially different scope, surface it instead of silently changing the plan.

Execute each task's checks and plausible regression controls. Diagnose failures, fix within scope and rerun affected checks; never weaken criteria to obtain green. Set each scenario's **Implement** cell in `acceptance.md`: done T<n>, blocked or not run. Put concise limitations or blockers in **Gap**. When code or dependencies change, clear affected later-stage cells so those stages check the new implementation.

Do not create or update `evidence.md`, add a Checks section, or introduce a replacement evidence log. The acceptance table is the result record. Report commands actually run, their results and relevant limitations in the conversation, distinguishing component, API/database and end-to-end checks. Apply the same rule in subagent handoffs.

## Progress and handoff

Mark each task in `design.md` complete immediately after its implementation and checks succeed. If independent review is available and appropriate, obtain it; otherwise record the gap, never label self-review independent. Report completed tasks, overall progress and blockers. Distinguish implementation completion, local verification with listed gaps, deployment validation and human acceptance; never use task completion to imply release readiness. Updates should lead with what changed since the previous report, then the current decision or blocker, rather than repeat the full workflow history. When continuing the factory workflow, use `validation-loop` next. Completed tasks are not human acceptance or deployment.
