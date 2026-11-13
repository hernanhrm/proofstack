---
name: visual-diff
description: "Creates a portable visual review of code changes and checks them against the change's design and acceptance table. Use to understand a PR, branch, commit, revision range, or local diff through before-and-after diagrams and decisions."
---

# Map code changes

Create a portable Markdown review with Mermaid diagrams and visible notes, without a hosted viewer or hover interaction. It works on any diff. When the change has workflow files, the review checks the diff against them: the design is the promise, and the review says whether the code kept it.

## Investigate

Review the specified PR, branch, commit, revision range, or local changes. Record the original checkout root before creating a worktree. Identify the exact before and after states, respecting the user's comparison. Compare a single non-merge commit with its parent, or the empty tree for an initial commit. Ask if the target or base is unknown. Inspect uncommitted changes in the current checkout without switching branches; distinguish staged, unstaged, and untracked content.

Inspect revisions directly with Git by default. If execution of a committed revision requires a checkout, use a temporary detached worktree. For uncommitted changes, reproduce the requested state in isolation or report that it could not be tested; worktrees do not include it automatically or sandbox external services. Remove only worktrees you created when safe, without discarding user changes.

Inspect the diff, relevant code in both states, tests, descriptions, and design discussion. Trace changed paths from start to end, including important branches and other callers affected by shared code. Cite revision-pinned links or file paths. Separate reported problems, observed code, inferred rationale, and unverified behavior; state gaps rather than inventing details.

Find issue links or IDs in PR metadata, branch names, commits, and comments. Discover available project sources and integrations; read relevant issues, requirements, documentation, and discussions. Follow links and search distinctive project or change terms; verify matches. Cite sources, distinguish decisions from proposals, avoid exposing restricted context to a broader audience, and report unavailable sources. Do not invent links to the changes.

### Change files

Find the change directory: a path the user names, otherwise `docs/<ticket-number>/` for an issue ID found above, read at the after revision or in the original checkout. Read what exists:

- `brief.md`: the problem, its diagram and open questions (Q).
- `design.md`: baseline revision, planned After diagram, decisions (D) and rollout (R), plus linked ADRs.
- `acceptance.md`: the scenarios and the Implement and Verify cells earlier stages filled.

Without `design.md` and `acceptance.md`, skip the design check and say so. If the design's baseline differs from the review's before revision, say so and check the scenarios against the after state only.

## Choose diagrams

Show what was added, removed, or changed before and after, including affected flows whose own code is unchanged. Choose diagrams for distinct aspects; omit repetitive, unaffected, or nonexistent structures. Use flowcharts for journeys, branches, and outcomes; sequence diagrams for interactions over time; ER diagrams for entities, fields, keys, and relationships; class diagrams for types, interfaces, and dependencies; state diagrams for lifecycle transitions. Explain migration and rollback risks separately.

Use actual names and relationships. Distinguish new behavior from compatibility paths, failures, and unchanged context; diagrams do not prove runtime behavior.

When `design.md` exists, draw the actual After with the design's step numbers so a reader can lay the two side by side, and mark steps the code adds, drops or changes from the plan. Link the brief's or design's Before diagram when it still matches the before revision instead of redrawing it.

## Deliver

Write a self-contained Markdown story: start with the problem, follow the numbered before-and-after journeys, and explain why the decisions matter. Ground the story in evidence, not invented motives or outcomes. With change files, write tersely like the design: fragments and arrows are fine, but keep negations, numbers, identifiers, paths and error text exact. Link the change files instead of restating them. Use these sections:

1. **Problem statement:** identify the compared revisions or uncommitted scope. With `brief.md`, link it and summarize the problem in one or two sentences; otherwise explain the problem briefly.
2. **Solution diff:** before-and-after diagrams with numbered steps and matching why notes beside each: Mermaid notes where supported, Markdown otherwise. Then a tests table with columns **Scenario**, **Test change**, and **Gap or question**. Label tests added, changed, removed, or unchanged and link to their code, using the before revision for removals. With `acceptance.md`, start each Scenario cell with its scenario IDs and describe only the test change; label tests that match no scenario as unplanned. Without it, explain what each scenario checks, its expected behavior and why it matters. Say when no relevant test was found and identify important gaps whether or not tests changed; a missing gap does not imply coverage is complete. Distinguish test code, statuses reported in the acceptance table, and tests you ran.
3. **Design check:** only with `design.md` and `acceptance.md`. Set each scenario row's **Review** cell, in the original checkout: **kept** when the after-state code does what the scenario expects and its planned check exists, such as test code of the planned category, a confirmed code review, or recorded human or metric evidence; **broken** when the code contradicts the expected behavior; **untested** when the code may match but the planned check is missing, not yet possible, or the behavior cannot be confirmed. Replace Review cells from an earlier run. If that checkout is unavailable, report the statuses only in the review. In the review, give the count of each status and list only broken and untested scenarios by ID, with evidence linking code and tests. Then list departures by ID: decisions (D) and ADRs the code does not follow, rollout items (R) such as flag defaults the code or config contradicts, and diff changes outside the agreed design and acceptance scenarios.
4. **Important decisions:** cite design decisions by D ID rather than restating them, and describe trade-offs made in the code that the design does not record, with open questions. Where applicable, note failures that can be hidden and how they are detected, or say detection is unknown; end with evidence and limitations.

Link supporting code and discussion. Use fenced `mermaid` blocks for diagrams, not images or custom scripts; notes must be readable without hover. Keep diagrams focused and briefly explain each one's value.

### Save

Keep reviews out of Git using the local exclude file from `git rev-parse --git-path info/exclude`: add `/.code-diff/` if not already covered there, preserving existing rules. This file is shared by linked worktrees. Do not change `.gitignore` or untrack files. Git exclusions are not access controls.

Save in `.code-diff/reviews/` at the original checkout root, not a temporary worktree, creating it if needed. For a PR, use `pr-<number>-<count>.md`, or `unassigned` for a missing number. Otherwise use `diff-<reference>-<count>.md`, with a filename-safe branch, commit, range, or local-change identifier. Start count at 1, increment beyond existing reviews with the same prefix, and never overwrite.

The review file stays local; the Review cells are the lasting result, with concise limitations in **Gap**. Report the reviewed after state and status counts in the conversation so later stages can confirm what was reviewed. Do not create or update `evidence.md` or a replacement evidence log. Do not link the local review file from tracked change files.

### Verify and report

Verify the review is ignored; report if it is not or is already tracked. Render and inspect Mermaid with an available compatible renderer; report if it could not be checked. Report the absolute file path, broken and untested scenarios, departures, and material evidence gaps. Do not post externally unless asked.

In the factory workflow, a broken scenario returns to `implement`, or to `design` when the design was wrong. Untested and ⚠ rows need the user's acceptance. The review supports AI and human review; it is not approval. Use `manual-test-guide` only after no Review cell is broken and both reviews pass.
