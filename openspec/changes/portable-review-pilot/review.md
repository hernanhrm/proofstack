# OpenSpec delivery; two custom review skills

**Review: preliminary.** Local prototype only; no shared rollout, product flag or deployment. Human acceptance and independent reviewer-agent findings are pending.

**Scope:** replace custom delivery orchestration with stock OpenSpec; preserve compact product framing and visual human review. Existing Phoenix setup is unchanged.

## System change

| Existing Phoenix setup (retained) | Isolated prototype |
| --- | --- |
| Understand + Design custom skills | OpenSpec explore/new/continue/update; 5W + How proposal |
| Implement + Prove custom skills | OpenSpec apply/verify; tasks include execution and evidence |
| Shared workflow + hosted visual conventions | Repository proposal/specs/tasks/evidence |
| Human review + Test guide | The only two custom skills; ordinary Markdown/HTML/SVG/media |

See the same overview in [standalone review.html](review.html). Baseline: six existing local skill files; prototype: schema/config plus stock OpenSpec 1.16.0 and two self-contained skills. This compares architecture, not a completed migration.

## Result against Prove

| Criterion | Observed | Status |
| --- | --- | --- |
| AC1 — OpenSpec delivery | CLI lifecycle, mixed task progress, strict validation, archive/spec-sync and docs-only controls passed | Passed · agent check |
| AC2 — portable skills | Codex/Claude setup generation preserves the same custom instructions; no dependency on the old delivery skills | Passed · setup check only |
| AC3 — human judgment | Visual review and walkthrough prepared; no human has followed them | Not run · human |

Evidence: [executed CLI tests](evidence/cli-tests.txt), [provenance/limits](evidence.md), [content revision](evidence/source-sha256.txt). Live multi-harness agent behavior remains untested; configuration compatibility is not behavioral parity.

**Try it:** [T1–T2](test-guide.md). **Judge:** can you understand who owns each stage and evaluate the result without reading generated code? What is still missing for a real Phoenix review?

**Decision:** no human acceptance recorded. No claim yet of reduced review effort or UAT rework.
