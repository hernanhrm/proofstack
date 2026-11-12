---
name: verify-acceptance-criteria
description: "Checks that an implementation satisfies its acceptance scenarios and marks the acceptance table. Use for acceptance verification on its own or within validation-loop."
---

# Verify acceptance criteria

Select the change, normally `docs/<ticket-number>/`; ask if ambiguous. Read `acceptance.md` and the actual implementation, consulting the brief, design and linked ADRs when needed to interpret the requirements.

Check each scenario using code inspection and appropriate tests of the real behavior. Mark its **Verify** cell **pass**, **fail** or **not verified**; put concise failures and limitations in **Gap**. Do not count test code, skipped tests or earlier status marks as proof that behavior passes. Leave unrun deployment checks and unmeasured success criteria not verified.

Do not fix code, change criteria or edit other stage columns. Do not create `evidence.md`, a Checks section or another result log. Report checks actually performed in the conversation; `acceptance.md` is the lasting result.

## Example output

```markdown
## Acceptance verification: GAPS

13 scenarios passed, 0 failed, 1 not verified. Acceptance table updated.

### Remaining findings
- **S1.1 — not verified:** Deployed session-count check requires a test deployment.
  Next: run the rollout check in the authorized test environment.

### Checks performed
- `go test ./...` — passed, no skips; provider calls mocked.
- Inspected the launch flow — hidden games are rejected before session creation.
```

Use PASS when all applicable scenarios pass, FAIL when any fails, GAPS when none fail but some remain unverified, or BLOCKED when verification cannot meaningfully proceed. When there are no findings, write “None.”
