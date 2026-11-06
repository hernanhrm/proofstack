# Evidence — portable workflow infrastructure

Recorded 2026-11-06 UTC on macOS 26.6.2 arm64, Node 26.12.1, npm 11.20.0, OpenSpec 1.16.0. Local uncommitted prototype; exact source revision is the relative-path SHA-256 manifest in `evidence/source-sha256.txt`, not a claimed Phoenix deployment.

## AC1 / AC2 · executed CLI checks · Passed

Fixture source: `proposal.md`, `specs/portable-change-review/spec.md`, schema/config, and `test/workflow.test.mjs`. Tests copy these to disposable directories outside Phoenix, override OpenSpec's config/data paths and disable telemetry/update checks. No account, database or shared state is needed.

Recipe from prototype root: install and set the environment in README, then run `npm run check`. See [raw output](evidence/cli-tests.txt).

Expected/observed: four tests pass; zero failures/skips. Checked readiness with and without prerequisites; mixed completed/uncompleted task progress; injected project context and operation guidance; strict validation rejects malformed scenario headers; archive syncs specs and retains evidence; docs-only work skips specs without invented requirements. Generated Codex and Claude integrations retain both custom skills unchanged beside eight stock skills each.

Relocation control: the bundle was extracted outside Phoenix; README's `npm ci --ignore-scripts --no-audit --no-fund` succeeded there, then the same four tests passed. See [relocated run](evidence/relocated-cli-tests.txt). This checks independence from the original checkout's installed packages, not live harness behavior.

These are CLI/setup checks, not live agent behavior. The first check run had one test-discovery error: OpenSpec writes a `.openspec-target` metadata file that is not a skill. Discovery was corrected to count directories containing SKILL.md; all four checks then passed. No application failure was hidden.

`openspec show portable-review-pilot` also displayed the 5W + How proposal: [recorded output](evidence/proposal-shown.txt). This keeps the native proposal filename intentionally.

## AC3 · agent preparation checked; human acceptance Not run

The standalone review was opened offline in system Chrome at 720px/light and 360px/dark. Both detail controls were exercised by click; default and expanded states captured. DOM checks found no horizontal overflow, three criterion rows, zero external requests and zero script errors. All four captures were inspected: text/diagrams/statuses wrap without clipping or overlap.

Records: [browser checks](evidence/browser/browser-checks.json) and images in `evidence/browser/`. macOS reproduction recipe, retained without dependencies:

```sh
node openspec/changes/portable-review-pilot/evidence/browser-recipe.mjs \
  openspec/changes/portable-review-pilot/review.html \
  .runtime/review-captures
```

The capture recipe uses system Chrome on macOS; it is optional evidence tooling, not a requirement of the skills. The page itself can be opened in any ordinary browser without scripts or network.

## Limits / decisions

- No human has followed T1/T2; AC3 is Not run, not agent-accepted.
- No independent reviewer-agent findings or actual Codex/Claude sessions exist. Two-tool setup compatibility does not prove equivalent agent execution.
- No Phoenix UI/API/database feature was implemented or tested. No speed, defect-reduction or UAT improvement is established.
- The human requested this prototype, not adoption or publication. Existing Phoenix skills, global configuration and ignore rules remain unchanged. The pilot stays active; only disposable fixtures were archived in tests.
