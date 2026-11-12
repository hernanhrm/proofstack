# proofstack

Standalone agent skills for exploring, planning, implementing and reviewing changes. The skills use ordinary Markdown files; they do not require the OpenSpec CLI or a hosted service.

## Install

The skills are in `skills/<name>/SKILL.md`. Install them into the project where you want to use them, choosing your agent when prompted:

```sh
npx skills@latest add /path/to/proofstack --list
npx skills@latest add /path/to/proofstack --skill '*'
```

Run the install command from the target project. To install just one skill, replace `'*'` with its name. Skills can also be copied from `skills/` to an agent's documented skill directory.

The workflow's `merge-risk` and `council` skills are external dependencies, not bundled here. Install them for the same agent, or let `validation-loop` install missing dependencies:

```sh
npx skills@latest add warpdotdev/common-skills --skill merge-risk
npx skills add https://github.com/t3dotgg/tstack --skill council
```

## Work with an agent

1. `understand` — clarify the problem in a 5W brief, capture criteria and resolve open questions.
2. `design` — add acceptance scenarios that answer the brief, then write the technical design: before-and-after diagrams, decisions with ADRs and tasks.
3. `implement` — build the change and mark implementation status in the acceptance table.
4. `validation-loop` — orchestrate external `council`, external `merge-risk`, then fresh-agent `verify-acceptance-criteria`. Any implementation correction restarts at council; finish only when all gates pass on the same state or a blocker needs a decision.
5. `verify-acceptance-criteria` (formerly `verify`) can also run independently to check the implementation against acceptance scenarios and mark the table.
6. `visual-diff` — explain the change for AI and human review, and mark each design scenario kept, broken or untested.
7. `manual-test-guide` — prepare the final manual walkthrough after AI and human reviews have passed.

Resolve required AI and human review findings before preparing the manual guide. If either review is missing, failed or stale, the guide waits; a passing automated check or visual diff is not approval. Manual verification is the final check, not a substitute for either review.

Change documents live in one directory, `docs/<ticket-number>/` (or a short kebab-case name without a ticket): `brief.md`, `acceptance.md`, `design.md` and `test-guide.md`. `acceptance.md` is the change's only acceptance table and result record: `understand` adds the criteria, `design` adds scenarios under them, and `implement`, `verify-acceptance-criteria`, `visual-diff` and `manual-test-guide` each fill their own column until every scenario is done. Verification checks the actual implementation against the scenarios and marks the table; limitations go in **Gap**. There is no separate evidence file or Checks section; commands and detailed observations stay in the conversation. ADRs outlive a single change, so they go in the repository's ADR directory, `docs/adr/` by default. A user can name another directory. Planning, implementation, verification, human acceptance and deployment are distinct; no skill implies that a later stage happened.

`visual-diff` also works independently of this workflow. It saves portable Markdown with Mermaid diagrams and scenario-based test tables under `.code-diff/reviews/`, locally excluded through Git's info/exclude file. Git exclusions are not access controls.
