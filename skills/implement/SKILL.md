---
name: implement
description: "Build and check an agreed design against its acceptance scenarios. Use when someone asks to start or continue implementation."
---

# Implement a change

Read the selected change's `design.md`, `acceptance.md` and linked ADRs, then inspect the affected code. Changes normally live in `docs/<ticket-number>/` or an agreed kebab-case directory; ask if the change is ambiguous.

Implement the requested scope in small, checkable steps, preserving unrelated work. If prerequisites are missing or implementation requires a different design or scope, surface the blocker rather than inventing requirements.

Run the relevant scenario checks and regression tests. Fix failures within scope and rerun affected checks; never weaken criteria to make them pass.

Record results only in `acceptance.md`: set each scenario's **Implement** cell to **done**, **blocked** or **not run**, with limitations in **Gap**. Mark done only after implementation and its checks succeed. Clear affected later-stage results when code or dependencies change.

Report what changed, commands actually run, results and remaining blockers in the conversation, including in subagent handoffs. Do not present self-review as independent review or local checks as deployment validation or human acceptance. Use `validation-loop` next when continuing the workflow.
