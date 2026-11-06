---
name: reviewing-with-humans
description: "Presents a compact visual review of an OpenSpec change with architecture, real evidence and guided tests. Use when humans evaluate product fit and system consequences."
---

# Human review

Read the selected change, current code, evidence and independent findings. Use `writing-test-guides` for missing walkthroughs. Write `review.md`; optionally render the same state as standalone `review.html`. All outputs are ordinary files beside the change, not hosted artifacts.

## Output

```text
Review: preliminary / ready / accepted / changes requested · baseline → current revision.
Scope/rollout: promise + exclusions · UI/API gates · configured/live state · deployed revision or unknown.
Result/gap: key observed outcome · remaining evidence/acceptance gap.
Architecture: before/after diagram · changed responsibilities/data flow + unchanged context.
AC1: diagram part → T1 → expected → observed → status/evidence · owner.
Try/judge: test-guide.md · product/domain question + system consequence.
Decision: actual reviewer result · remaining risks; never inferred.
```

## Do
- Keep the opening roughly one screen: scope, rollout, readiness, result/gap and compact before/after. Put galleries, provenance and steps in linked or expandable detail. Use local PNG/SVG/video links in Markdown; HTML must inline CSS/SVG and have no network dependencies. Local media can be embedded as data URLs for a self-contained page.
- Ground architecture in actual baseline/current code at the same level. Choose component/data flow, class, sequence or state view as useful; mark unavailable details unknown. A diagram explains but does not prove runtime behavior.
- Map inspected real captures or executed traces/results to ACs, exact revision/environment and safe reproduction recipe. Distinguish component, API/DB and end-to-end evidence. Missing/stale checks stay pending; request actual execution through OpenSpec apply rather than treating OpenSpec verify's report as a test run. Missing independent agent review stays visible.
- For existing PRs recover decisions and criteria; label reconstructed criteria review-derived/proposed. Compare tested/current revisions plus dependencies; refresh affected evidence, never relabel old captures current. Historical acceptance stays unknown unless recorded.
- Humans judge product truth, tradeoffs and system consequences and try the guide—not every generated line. Challenge unsupported claims or disproportionate cost with a concise concern, evidence and alternative; respect informed choices. Record actual human observations/decisions only. No required criterion failed, blocked or unrun can count as accepted; an agent cannot accept human-owned criteria.

**Next:** defect → OpenSpec apply; scope change → OpenSpec update/explore. Human acceptance, independent UAT, archive and release are distinct. Do not push, post, deploy or change shared state without authorization.
