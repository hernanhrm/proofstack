---
name: manual-test-guide
description: "Creates a concise, reproducible final manual verification walkthrough and records its results in the change's acceptance table. Use after the change passes AI and human reviews."
---

# Guided test

Manual verification is the last stage: a person checks the finished change once, after every other stage and both reviews have passed. The guide is instructions; results go to the **Manual** column of `acceptance.md`, with concise limitations in **Gap**.

## Check the gate

By default, the change is in `docs/<ticket-number>/`; use another directory the user identifies. Read `acceptance.md` first and check every scenario row:

- **Implement** is done or —, never empty or blocked.
- **Verify** is pass, not verified or —, never empty or fail.
- **Review** is kept or untested, never empty or broken.
- The user has accepted each untested, not verified or ⚠ row.

Then confirm from the review conversation or PR that the AI review applies to the implementation you will test; later implementation changes make affected review results stale. Check the human review result, such as a PR approval or the user's statement, for that state. If the reviewed state is unclear, ask. If anything fails, report exactly which rows or reviews block the guide and wait; do not infer approval from tests or a visual diff.

## Write `test-guide.md`

Read `acceptance.md`, `design.md` with its linked ADRs and `brief.md`. Take environments, flag values and deploy order from the design's Rollout, the main journey from its After diagram, and the people and roles from the brief. Inspect the real implementation and available test setup to establish the revision, safe fixtures and setup steps. If setup is missing, state exactly what blocks it rather than inventing URLs, credentials or fixture IDs.

Reuse the setup, inputs and observed journeys from `verify-acceptance-criteria` when they apply to the current revision and environment. Recheck fixture availability and authorization; prior agent execution does not count as the user's final check.

Start the file with links to `acceptance.md` and `design.md` and the exact revision under test. Then write one block per walkthrough, tersely, with step-level observable results; reference scenarios by ID instead of restating them:

```text
M1 → AC1.4, D5.1 · tester/owner
Setup: environment · revision · role · flags · safe fixtures/setup recipe.
1. Action + exact input → expected observable result.
2. Next action → expected observable result.
Capture/reset: what to record; safe cleanup if needed.
```

Cover every scenario whose Check is human check, plus the main journey and one important boundary or failure. For bugs, give a precise reproduction and the expected fix, and distinguish reported from observed old behavior. Use safe data and only authorized operations. Dry-run when feasible and label agent observations separately from human results.

## Record results

When you write the guide, set **Manual** to pending for every scenario a walkthrough covers and to — for the rest: automated checks and code reviews already settle them, and production metrics (S rows) are measured after release under the design's Rollout. Set pass or fail only after a person reports the result; put failures or limitations in **Gap**. Keep detailed observations in the conversation. Agent checks, a written guide or a general yes are not human results.

When every Manual cell is pass or —, check the done rule in `acceptance.md`'s legend and report the change ready. Ready is not deployment, and success measures stay unmeasured until production data exists.

**Next:** a failed walkthrough returns to `implement`, or to `design` or `understand` when scope changed. A fix makes the affected rows' Verify, Review and Manual cells stale; clear them so those stages run again before final verification is repeated.
