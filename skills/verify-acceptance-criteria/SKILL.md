---
name: verify-acceptance-criteria
description: "Checks that an implementation satisfies its acceptance scenarios and marks the acceptance table. Use for acceptance verification on its own or within validation-loop."
---

# Verify acceptance criteria

Select the change, normally `docs/<ticket-number>/`; ask if ambiguous. Read `acceptance.md` and the actual implementation, consulting the brief, design and linked ADRs when needed to interpret the requirements.

## Exercise every scenario

Try to validate every acceptance scenario against real behavior, including those marked **human check**. The goal is to catch errors before the user's final walkthrough, not to leave executable checks for the user.

- Run the relevant automated tests and inspect code where appropriate; code inspection alone does not prove runtime behavior.
- Use `curl` or an equivalent HTTP client to exercise endpoints and inspect responses.
- Discover available browser MCP tools and use them to interact with the UI when available. An API check is not a substitute for a required UI interaction.
- Discover database MCP tools when fixtures or stored-state checks are needed. Ask the user for permission before database access or changes; agree on the target environment, operations, test data and cleanup.
- Prepare the environment needed to run as many checks as possible. Ask permission before starting services or making environment changes such as installing dependencies, configuring services, seeding data or running migrations. Explain the commands, target and side effects first; do not repeat requests for operations already explicitly authorized.

Prefer isolated local or test environments and safe fixtures. Never assume permission for production access, destructive operations or external side effects. Ask the user to supply missing credentials securely, never in committed files. Record reproducible setup, actual inputs, observed outcomes and cleanup in the conversation so they can inform the final manual guide.

## Record the result

Mark each scenario's **Verify** cell **pass**, **fail** or **not verified**; put concise failures and limitations in **Gap**. Pass only what the performed check actually proves. Do not count test code, skipped tests or earlier status marks as proof. Leave unavailable checks, subjective judgments, unrun deployment checks and unmeasured success criteria not verified, with the exact blocker and next step.

Do not fix application code, change criteria or edit other stage columns. Report checks actually performed in the conversation; `acceptance.md` is the lasting result. Agent execution of a human-check scenario is verification, not human approval: leave **Manual** untouched.

Once verification and the required AI and human reviews pass, use `manual-test-guide` to turn the exercised journeys and authorized setup into the user's final walkthrough. Surface any remaining gaps for explicit acceptance rather than promising an error-free result.

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
