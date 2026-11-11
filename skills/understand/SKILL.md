---
name: understand
description: "Investigates a problem and resolves open questions with the user. Use to reach a shared understanding before designing a change."
---

# Explore a change

Investigate the request, relevant code, existing behavior and available project context before asking questions. Separate observations, reports, assumptions and unknowns; distinguish confirmed decisions from suggestions. For a spike, clarify what needs to be learned rather than assuming a feature will be built.

Present a concise **5W** brief:

- **Why:** the problem and the value of addressing it.
- **Who:** the people or systems affected.
- **What:** current behavior and scope.
- **Where:** affected journeys and system boundaries; relevant UI/API gates, flags and deployed revision if known.
- **When:** when the problem occurs or the change applies; timing and rollout if known.

Number unresolved questions Q1, Q2… in the brief.

Write the criteria to `acceptance.md`, not the brief. It is the change's single acceptance table: later stages add scenario rows under each criterion and each fills only its own column, so the criteria are never copied into other files. Add one row per criterion, with stable IDs:

- **S1, S2…** success: the desired result and who benefits, its measure, and the baseline, target and timeframe when known.
- **AC1, AC2…** acceptance: an observable behavior or constraint the change must satisfy.
- **X1, X2…** exclusions: what the change leaves out.

Create the file with this legend and header, and leave the other columns empty:

```markdown
# <ticket-number> acceptance

Check: unit test · integration test · e2e test · human check · code review · production metric
Implement: done T<n> · blocked · not run. Verify: pass · fail · not verified. Review: kept · broken · untested. Manual: pending · pass · fail.
Empty = stage not reached; — = not applicable. Stage columns apply to scenario rows such as AC1.1. Done when no scenario cell is empty, failing, broken or blocked, and the user has accepted any untested or ⚠ row.

| ID | Scenario → expected | Check | Gap | Implement | Verify | Review | Manual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC1** | <criterion> | | | | | | |
```

Investigate unresolved questions that available evidence can answer. Ask the user about remaining material unknowns and explain what their answers unblock. Update the brief after each answer and continue until you and the user share an understanding of the problem and scope; do not treat silence or assumptions as agreement. Label any unresolved questions rather than inventing answers.

Use a fenced Mermaid diagram when it helps explain the problem or existing system. Do not propose or choose an implementation.

Save the 5W brief, diagrams and unresolved questions to `docs/<ticket-number>/brief.md` and the criteria to `docs/<ticket-number>/acceptance.md`, such as `docs/PROJ-123/`, and update both after each answer. Take the ticket number from the user, branch or PR; without one, ask, or use a short kebab-case name if the user has no ticket. If a file exists, read it first and preserve content you did not write. Write no other files and do not implement while exploring. After reaching shared understanding, use `design` when the user asks to plan the change.
