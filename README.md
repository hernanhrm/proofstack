# OpenSpec delivery + two portable review skills

Standalone workflow prototype, pinned to OpenSpec 1.16.0. No Phoenix application change, migration, deployment or formal approval machinery.

## Try it

Clone this repository **outside the Phoenix checkout** and open its root in your agent. This avoids inheriting Phoenix's old six-skill setup. Node.js 22.12+ and npm are required; macOS/Linux shell commands below.

```sh
npm ci --ignore-scripts --no-audit --no-fund
export PATH="$PWD/node_modules/.bin:$PATH"
export XDG_CONFIG_HOME="$PWD/profile" XDG_DATA_HOME="$PWD/.runtime/data"
export OPENSPEC_TELEMETRY=0 DO_NOT_TRACK=1 OPENSPEC_NO_UPDATE_CHECK=1
openspec schema validate human-steered
npm run check
```

Open `openspec/changes/portable-review-pilot/review.html` in any ordinary browser. No server, account, hosted artifact or network request is needed. `review.md`, `test-guide.md` and `evidence.md` are the corresponding plain-text records.

## Work with an agent

The bundle includes stock OpenSpec skills for Codex (`.agents/skills/`) and Claude Code (`.claude/skills/`). Both expose the same two custom skills. Generated OpenSpec skills are upstream files, not custom workflow replacements.

| Step | Ask your agent |
| --- | --- |
| Explore | “Use OpenSpec explore for [request]. Investigate first; clarify value and scope.” |
| Plan | “Use OpenSpec new and continue for [change]. Use human-steered; start with the 5W + How proposal.” |
| Refine | “Use OpenSpec update to incorporate [decision].” |
| Build | “Use OpenSpec apply. Execute the checks in the tasks; fix and recheck failures; preserve evidence.” |
| Align | “Use OpenSpec verify for [change].” This reports plan/code alignment, not execution. |
| Try | “Use writing-test-guides for [change].” |
| Review | “Use reviewing-with-humans for [change]. Show architecture, actual evidence and what I should judge.” |
| Finish | “Use OpenSpec archive for [change].” Archive is not deployment or human acceptance. |

There are no formal approval gates. Human steering happens in the conversation; expected behavior stays in specs, choices in the proposal and observations in evidence. The CLI does not run agents or enforce the fix/recheck loop; the stock apply skill executes its tasks under the schema/config instructions. Harness capabilities and agent judgment still matter.

## What is customized

- `openspec/config.yaml`: project context, compactness, investigation discipline, execution/evidence instructions and review handoff.
- `openspec/schemas/human-steered/`: proposal (5W + How) → specs (ACs) → tasks. No separate design document.
- `.agents/skills/reviewing-with-humans/` and `writing-test-guides/`: the **only two custom skills**, each standalone. Claude's copies link to these canonical files.
- `profile/openspec/config.json`: isolated skills-only profile including optional new/continue/verify. It does not modify your normal global OpenSpec settings.

`proposal.md` deliberately keeps OpenSpec's native filename so `openspec show` works. Review is one compact entry point, not a second independently edited requirements document. Regenerate HTML when its source records change.

## Refresh or use another harness

With the environment above, run `openspec init --tools codex,claude --profile custom --no-animation` to regenerate the two demonstrated integrations. For another supported harness, select its tool ID instead, and copy the **two canonical custom skill directories** to that harness's documented skills location if it does not read `.agents/skills/`. OpenSpec installs its own skills, not ours. Skill invocation syntax varies by harness.

The custom skills contain no tool-specific permissions, proprietary APIs, or dependencies on the four replaced delivery skills. Setup generation has been checked for two harnesses; full live agent sessions on multiple harnesses have not been run.

## Verification and limits

`npm run check` uses the actual CLI in disposable directories: schema/readiness and mixed task progress; strict validation including a malformed-spec rejection; archive/spec-sync with evidence preservation; docs-only spec skipping; two-harness skill generation preserving custom skills. No temporary directories survive the checks.

The pilot demonstrates this infrastructure, not a shipped Phoenix feature or faster human review. Human acceptance and independent reviewer-agent findings remain pending. The old Phoenix skills and ignore policy are unchanged. To adopt later, remove the prototype-only scope restriction in config and deliberately install/version the chosen setup in the real repo; do not copy this pilot's fictional capability into Phoenix's product specs.
