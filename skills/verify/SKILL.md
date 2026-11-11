---
name: verify
description: "Verifies a structured change against its plan and tests its behavior. Use when someone asks to verify or prove a planned change."
---

# Verify a change

Select the named or unambiguous change, by default in `docs/<ticket-number>/`; otherwise ask. Read its `brief.md`, `acceptance.md`, `design.md`, linked ADRs, implementation and evidence. Check whether evidence applies to the current revision and environment.

Run appropriate safe checks against the actual implementation, covering the main journey and meaningful boundaries and regressions. For fixes, compare the baseline with the changed behavior when feasible; use the real integrated stack for end-to-end checks when relevant and available. Inspect rendered UI evidence when visual behavior changes. Set each scenario's **Verify** cell in `acceptance.md`: pass, fail or not verified. Record commands, revision, environment, observed results and evidence paths in `evidence.md` under the scenario ID; distinguish automated, end-to-end and human observations.

Check added and modified behavior against the plan. For removals, identify the baseline contract and check the behavior is gone; for renames, check the behavior remains. If the baseline is unavailable, mark the affected check not verified.

Present a summary table for **completeness** (tasks and acceptance scenarios), **correctness** (behavior and scenario coverage) and **coherence** (decisions, ADRs and repository patterns). Follow it with critical gaps, warnings and suggestions, each with concrete evidence and an actionable recommendation. Mark intentionally inapplicable checks not applicable; label missing, stale, partial or unrun checks not verified and explain why. Do not treat test code as a passing test, skipped checks as readiness, or agent observations as human acceptance. Passing acceptance checks do not show the success result was achieved; report success measures that need production data or time as not yet measured. Verification does not implement, archive or deploy the change.

When continuing the factory workflow, assess `merge-risk` next using the separately installed skill, then create a `visual-diff` for review. Report if the external skill is unavailable rather than implying a risk assessment ran.
