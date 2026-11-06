# Guided test — portable review pilot

Scope: workflow prototype, not a Phoenix feature. No production account, data or writes.

## T1 → AC3 · human reviewer
Setup: extract the prototype outside Phoenix; use the content revision in `evidence/source-sha256.txt`. Open `review.html` in a browser; no server, roles or flags.

1. Read the before/after overview → distinguish OpenSpec delivery from the two custom review skills without reading implementation files.
2. Expand “Evidence and limits” → see executed CLI results separately from untested multi-harness agent behavior and pending human acceptance.
3. Expand “Try it” → see concrete steps with expected outcomes, not an unexplained “please test.”

Capture: record what remains unclear and whether this is enough to judge the workflow. Reset: none.

Actual: **Not run by a human** · evidence: none · tester/time: pending. Agent browser inspection is recorded separately in evidence.md.

## T2 → AC1, AC2 · optional technical check
Setup: Node 22.12+, npm, extracted directory; follow README's install/environment commands.

1. Run `npm run check` → four tests pass, including CLI transitions, archive/spec-sync, docs-only behavior and two-tool generation.
2. Run `openspec show portable-review-pilot` → the compact 5W + How proposal is displayed; no separate design document is required.
3. Open the directory in your usual agent and request “Use reviewing-with-humans for portable-review-pilot” → it reads the ordinary files and preserves pending human results. Record the actual harness/version and any missing capabilities.

Capture: command output and agent response if step 3 is tried. Reset: tests clean their own disposable fixtures; do not archive the pilot during this check.

Agent execution: steps 1–2 checked; step 3 **Not run**. Human execution: **Not run** · tester/time: pending.
