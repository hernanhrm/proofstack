---
name: writing-test-guides
description: "Creates concise, reproducible acceptance walkthroughs from an OpenSpec change. Use for human review or UAT after implementation."
---

# Guided test

Read the selected change's proposal, specs, tasks and current evidence. Write `test-guide.md` beside them; no proprietary tools or other delivery skills required.

## Output

```text
T1 → AC1, AC3 · tester/owner
Setup: URL/environment · exact revision · role · flags · safe fixtures/setup recipe.
1. Action + exact input → expected observable result.
2. Next action → expected observable result.
Capture/reset: what to record; safe cleanup if needed.
Actual: Not run · evidence: none · tester/time: pending.
```

## Do
- Derive expectations from specs and inspect the real implementation. Never invent URLs, credentials or fixture IDs; state precisely blocked setup. Dry-run when feasible and label agent observations separately from human results.
- Use a few steps covering the main journey and important boundary/failure. Map each AC to a scenario, executed automated evidence or an explicit gap; do not rerun the whole suite manually.
- For bugs give precise reproduction and expected fix; distinguish reported from observed old behavior. Use safe data and only authorized operations.
- Record actual outcomes only after execution. Agent checks, a written guide or a general yes cannot establish human-owned acceptance. Changed code/data invalidates affected results.

**Next:** `reviewing-with-humans` presents this guide with architecture and evidence; rejection returns to OpenSpec apply, changed scope to OpenSpec update/explore.
