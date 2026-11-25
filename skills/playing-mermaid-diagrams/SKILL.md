---
name: playing-mermaid-diagrams
description: "Turns Mermaid flowcharts and sequence diagrams into playable, clickable diagrams: a token walks the flow step by step, the reader picks branches at decisions, and each step shows its details (HTTP request, callback, SQL). Steps are coloured new, changed, removed or unchanged, for before/after designs, PRDs, TDDs and pull request reviews. Outputs one self-contained HTML file or an Amp visual artifact. Use when asked for an interactive, animated or playable diagram, a flow or sequence diagram of a design or change, or a visual explanation of what a PR adds, changes or removes. Not for static images or other Mermaid diagram types."
---

# Playing Mermaid diagrams

You write plain Mermaid (`flowchart`/`graph` or `sequenceDiagram`) plus optional `%%` annotation comments. `scripts/cli.js` renders it with the vendored Pele renderer and writes one HTML file with the SVG, the play model and the player inlined: no network, no server, deterministic output. Needs Node 20 or newer; nothing to install.

```sh
S=<this skill's directory>
node $S/scripts/cli.js design.mmd -o out/design.html --strict             # page: opens with a double-click
node $S/scripts/cli.js design.mmd -o out/design.fragment.html --fragment --strict  # Amp visual artifact
node $S/scripts/cli.js design.md -o out/design.html --title "Refunds" --strict    # every ```mermaid block in a .md
```

Always pass `--strict`: it turns warnings, such as a request with no reply drawn back, into errors with line numbers. Fix the Mermaid and rebuild until it passes. `examples/` has a flowchart (`refund.mmd`), a sequence diagram with `alt` and DB lanes (`checkout.mmd`) and a login flow (`login.mmd`); read one before writing your first diagram.

## Workflow

1. Write the `.mmd` (or `.md` with several diagrams) in the workspace, one diagram per flow or scenario. Split a diagram past about 15 nodes or 20 messages.
2. Build with `--strict`.
3. Check it renders: build the page form and open it with agent-browser, press Play, pick a branch in the dialog, and screenshot the start and a later step. Inspect the screenshots before showing anything.
4. Deliver: for an Amp visual artifact, publish the fragment with the artifact tool (`kind: visual`, `folder: visuals`, `content_path` pointing at the fragment) and embed its URL as an image. Otherwise link the page file. Keep the `.mmd` next to the output so the diagram can be rebuilt.

## Annotations

Annotations are Mermaid comments, so the source still renders as a plain diagram on GitHub or in any Mermaid viewer.

```text
%% @title Checkout now checks fraud before charging   the takeaway as a sentence, not a topic
%% @subtitle Proposed change. Pick the decline branch.
%% @caption One line on what to notice.
%% @path Small refund: ask > ok > small > issued > done   a named route through a flowchart, by node id
%% @start ask                                           start node, when several have no incoming arrow
%% @small new: The €50 limit is configuration.          status new|changed|removed|same, with a detail
%% @issued detail: Records who approved it.             detail only
%% @issued raw: UPDATE refunds SET status = 'issued'    raw payload, shown as code; continue with %%| lines
%%| WHERE id = 'r_88'
%% @small->issued new                                   an edge, by from->to
%% @DB detail: Table orders in Postgres.                a sequence participant
```

In a sequence diagram, `%% @new: ...`, `%% @changed: ...`, `%% @detail: ...` or `%% @raw: ...` with no target applies to the message just above it, and `%% @#3 ...` targets the third message.

## Content rules

- Colours: green new, orange changed, red removed (dashed, struck through), gray unchanged. Mark only what differs from today's system; leave every status out for a diagram of current behaviour. For a pull request, mark what the PR adds, changes and removes, and keep the untouched steps around them as context.
- Draw every request's reply back with `-->>`, including errors. `--strict` fails on a request with no reply.
- Put the real HTTP request, callback body or SQL in `raw`, with realistic values. Keep `detail` to one or two sentences on why, not a restatement of the label.
- Keep labels short (under about 30 characters); the details panel carries the rest. Decision nodes are questions (`{Amount under €50?}`) and their arrows carry the answers (`-->|yes|`).
- Name database tables as participants, such as `participant DB as DB: orders`. The Mermaid `database T as orders` syntax fails in Pele.
- Use `alt`/`else` or `opt` for alternative outcomes in a sequence; the reader picks one in a dialog, the same way as a flowchart decision.
- A flowchart needs a start (a node with no incoming arrows, or `@start`) and should reach an end node.

## What the reader gets

Play/pause, step back/forward and restart; a path picker ("choose at each decision" or a named or generated path); speed; a decision dialog beside each branch point (keys 1–9); zoom with −/+ buttons or ⌘/Ctrl + scroll and drag to pan; a step list and a details panel for any clicked box, arrow or step. Mention these in one line when you hand the diagram over.
