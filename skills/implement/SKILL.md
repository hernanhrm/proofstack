---
name: implement
description: "Implements and checks the tasks in a structured change. Use when someone asks to start or continue implementation from a change plan."
---

# Implement a change

Select the named or unambiguous change, by default in `docs/<ticket-number>/`; otherwise ask. Read its `design.md`, `acceptance.md`, linked ADRs and existing evidence, then inspect the affected code. Report the change, completed versus total tasks and the next task. Implement the requested unchecked tasks in order, preserving unrelated work. If the plan or prerequisites are missing, inconsistent or materially ambiguous, report the blocker rather than inventing requirements. If implementation reveals a design issue or needs materially different scope, surface it instead of silently changing the plan.

Execute each task's checks and plausible regression controls. Diagnose failures, fix within scope and rerun affected checks; never weaken criteria to obtain green. Set each scenario's **Implement** cell in `acceptance.md`: done T<n>, blocked or not run. Record supporting detail in `evidence.md` under the scenario ID, without copying its expected behavior: observed result, exact revision or content digest, environment, safe fixtures, command and evidence path. Distinguish component, API/database and end-to-end evidence. Record missing access, setup or unrun checks as blocked or not run; preserve a safe reproduction recipe before removing scratch tools. Refresh evidence affected by later code or dependency changes.

Mark each task in `design.md` complete immediately after its implementation and checks succeed. If independent review is available and appropriate, obtain it; otherwise record the gap, never label self-review independent. Report completed tasks, overall progress and blockers. When continuing the factory workflow, use `verify` next. Completed tasks are not human acceptance or deployment.
