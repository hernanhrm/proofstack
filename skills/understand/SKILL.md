---
name: understand
description: "Clarify why a change matters, who benefits and the smallest worthwhile scope. Use before designing a change."
---

# Start with why

Inspired by Simon Sinek's *Start with Why*: understand the purpose before choosing a solution.

## Find the purpose

Use the request and available project context first. Ask only what is missing, a few questions at a time:

- **Why this?** What problem or opportunity makes a change worthwhile?
- **Why now?** What changed, or what happens if we do nothing?
- **Who benefits, and how?** What value would they gain?
- **When and where?** In which situation or part of their journey does that value matter?

Treat these as conversation prompts, not a mandatory questionnaire. Investigate code only when it helps answer them. Distinguish evidence from assumptions; do not invent urgency, beneficiaries or value.

## Agree on the smallest worthwhile change

Summarize the purpose, the smallest scope that could deliver value, what stays out and how we would know it helped. For an investigation, define what we need to learn instead of assuming a feature must be built.

Resolve questions that would change the purpose or scope and ask the user to confirm the summary before saving it. Leave non-blocking unknowns explicit rather than expanding the MVP to answer everything. Do not choose an implementation or build the change.

## Save the agreement

Use `docs/<ticket-number>/`, taking the ticket from the user, branch or PR; without one, agree on a short kebab-case name. Read existing files before updating them and preserve unrelated content.

- **`brief.md`:** a short, plain-language account of why this matters, why now, who benefits, when and where, and the agreed MVP and exclusions. No required diagram or technical design.
- **`acceptance.md`:** the single acceptance table for downstream skills. Add agreed criteria with stable IDs: **S1…** for desired value and success measures (targets and timeframe only when known), **AC1…** for observable behavior or constraints, and **X1…** for exclusions. Do not turn assumptions into requirements.

Use this format for `brief.md`. Keep each section to a short paragraph or a few bullets. Omit **Unknowns** when none remain; state when timing or context is unknown rather than inventing it. Keep detailed criteria and measures in `acceptance.md`, linked rather than copied here.

```markdown
# <Change title>

## Why
<Problem or opportunity, why it matters, and why this change is worth pursuing.>

## Why now
<What changed or what happens if we do nothing; note if there is no urgency.>

## Who benefits
<Who gains value and what becomes better for them.>

## When and where
<The situation and part of the journey where the problem occurs and the value matters.>

## Smallest worthwhile change
<The smallest outcome worth delivering in this iteration and the value it adds. See [acceptance criteria](acceptance.md) for observable checks and measures.>

## Not now
<What we deliberately leave out of this iteration.>

## Unknowns
<Non-blocking unknowns and assumptions that still need checking.>
```

Use this acceptance header and legend, leaving stage columns empty. Later skills add scenario rows and fill their own columns:

```markdown
# <ticket-number> acceptance

Check: unit test · integration test · e2e test · human check · code review · production metric
Implement: done · blocked · not run. Verify: pass · fail · not verified. Review: kept · broken · untested. Manual: pending · pass · fail.
Empty = stage not reached; — = not applicable. Stage columns apply to scenario rows such as AC1.1. Done when no scenario cell is empty, failing, broken or blocked, and the user has accepted any untested or ⚠ row.

| ID | Scenario → expected | Check | Gap | Implement | Verify | Review | Manual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC1** | <criterion> | | | | | | |
```

Write only these two files. Hand off to `design` when the user asks to plan the implementation.
