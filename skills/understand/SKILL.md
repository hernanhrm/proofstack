---
name: understand
description: "Investigates a problem and resolves open questions with the user. Use to reach a shared understanding before designing a change."
---

# Explore a change

Investigate the request, relevant code, existing behavior and available project context before asking questions. Separate observations, reports, assumptions and unknowns; distinguish confirmed decisions from suggestions. For a spike, clarify what needs to be learned rather than assuming a feature will be built.

## Resolve questions in conversation

Investigate unresolved questions that available evidence can answer. Keep findings, proposed scope and questions in the conversation until all material questions are resolved and the user has confirmed the problem, scope and decisions. Number questions Q1, Q2…; explain what their answers unblock and distinguish recommendations awaiting approval from confirmed decisions. Do not treat silence or assumptions as agreement.

Do not create or update `brief.md` or `acceptance.md` while questions remain open or recommendations await approval. After each answer, update the conversational understanding and ask any remaining questions. If investigation uncovers another material unknown, resolve it before writing either file.

## Write the agreed brief

Once shared understanding is confirmed, write a concise **5W** brief:

- **Why:** the problem and the value of addressing it.
- **Who:** the people and high-level systems affected, describing each system's role in plain language.
- **What:** current behavior and scope.
- **Where:** the affected user journeys, parts of the product and high-level system boundaries.
- **When:** when the problem occurs or the change applies; timing and rollout if known.

Write for a product manager with no technical knowledge. Use only plain-language text and fenced Mermaid diagrams to explain the problem, current behavior and agreed scope. Include at least one diagram showing the affected journey or before-and-after user-visible behavior; label it in product terms, not code or infrastructure terms. You may name affected systems at a high level when it helps explain responsibility or scope, but explain their role in everyday language (for example, "Game catalogue — controls which games players can discover"). Do not include code references, file paths, line numbers, symbols, code snippets, API routes or implementation details. Translate technical findings into their observable effects on people using the product. Keep code-level evidence in the conversation, not the brief.

The brief records agreed understanding, not an open-question log or a technical design. Do not propose or choose an implementation.

## Record agreed acceptance criteria

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

Write criteria only from the resolved, agreed scope; do not turn assumptions or unapproved recommendations into requirements.

## Save and hand off

Only after all material questions are resolved and the user has confirmed shared understanding, save the 5W brief and diagrams to `docs/<ticket-number>/brief.md` and the criteria to `docs/<ticket-number>/acceptance.md`, such as `docs/PROJ-123/`. Take the ticket number from the user, branch or PR; without one, ask, or use a short kebab-case name if the user has no ticket. If a file exists, read it first and preserve content you did not write; keep pending revisions in the conversation until the same resolution gate is met. Write no other files and do not implement while exploring. Use `design` when the user asks to plan the change.
