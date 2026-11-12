---
name: validation-loop
description: "Orchestrates council, merge-risk and acceptance verification, restarting from council after every implementation correction until all three pass on the same state."
---

# Validate a change

This skill only orchestrates `council` → `merge-risk` → `verify-acceptance-criteria` and in-scope corrections. Follow each skill's instructions rather than duplicating its work.

## Prepare

Identify the change directory and actual implementation state, including uncommitted and new files. Discover and read the three skills. If external dependencies are missing, install them for the current project and agent:

```sh
npx skills@latest add warpdotdev/common-skills --skill merge-risk
npx skills add https://github.com/t3dotgg/tstack --skill council
```

Use documented non-interactive options when needed. Do not install globally unless requested or overwrite a different same-name skill. Confirm the installed source and read its instructions. Missing dependencies, required models or delegation block the loop; never silently substitute.

## Delegate and loop

Use available subthreads, subagents or equivalent fresh-agent mechanisms. Give each stage the change location, exact current implementation state and necessary constraints, not earlier verdicts or implementer reasoning. Ensure delegates see the actual changed files. Follow council's delegate requirements. Reviewers do not fix application code; use a separate implementation agent for corrections. If a reviewer cannot edit the acceptance table, transcribe its reported statuses exactly.

1. **Council first:** run council until every required delegate accepts the current implementation and no actionable findings remain. Scores alone are not acceptance.
2. **Merge risk next:** run merge-risk. Require low risk with no unresolved actionable findings. Medium/high inherent risk needs a user decision, not unrelated changes to lower the label.
3. **Acceptance last:** run `verify-acceptance-criteria`. Require every applicable scenario to pass.

**Any implementation correction, at any stage, invalidates earlier gates: restart at council.** Thus council corrections rerun council; merge-risk corrections rerun council then merge-risk; acceptance corrections rerun council, merge-risk and acceptance verification. Clear affected Verify, Review and Manual cells. Pass only when all three gates apply to the same unchanged implementation; table-only result updates do not restart the loop.

Repeat in-scope fixes with `implement`; never weaken criteria or expand scope just to satisfy reviewers. Stop for user decisions, access/deployment blockers, incompatible recommendations or a round with no meaningful progress. Do not retry indefinitely. User-accepted exceptions remain GAPS, not PASS.

Do not create `evidence.md`, a Checks section or a replacement log. Results belong in the acceptance table and conversation. Never push, merge or deploy; passing means ready for human review, not permission to land.

## Report

Lead with **Validation: PASS | GAPS | FAIL | BLOCKED** and identify the implementation checked. Show one table in execution order:

| Gate | Result | Summary |
| --- | --- | --- |
| Council | PASS / GAPS / FAIL / BLOCKED | Delegate acceptance and rounds |
| Merge risk | low / medium / high / not assessed | Remaining risk |
| Acceptance criteria | PASS / GAPS / FAIL / BLOCKED | Passed / failed / not verified counts |

Include council's required scores by round, dependencies already installed/installed now/blocked with their sources, unresolved findings with next actions, checks actually run and acceptance-table update status. Do not invent scores or claim stale results apply to the final state.

PASS requires all gates without exceptions; FAIL means a confirmed defect remains; BLOCKED means the process cannot proceed; GAPS means unresolved or accepted exceptions without a confirmed defect.
