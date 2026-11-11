# Department playbook starter catalog

The Playbooks dashboard includes a searchable catalog of **64 starter questions** across 12 departments: Engineering, Security, Product, Operations, Finance, People, Sales, Customer Success, Marketing, Data, Legal and Leadership.

## Why this exists

New workspaces often have useful documents but no idea where to begin querying them. These starters provide explicit, operational questions as clickable entries so teams can discover their institutional knowledge and turn it into cited, regenerable playbooks.

## How to use it

1. In the web dashboard, open **Playbooks**.
2. Select a department and search by task, role or workflow.
3. Select a starter to run the existing authenticated playbook-generation flow.
4. Review the source citations. A starter is **not evidence** that your company has a particular process; it is a question for retrieval.
5. If the sources are missing or weak, add verified company documents before relying on the generated answer.

The catalog does **not** inject invented policies or public reference materials into your company memory. Existing tenant-scoped retrieval and citation behavior remain unchanged.

## Implementation

- Starter data and filter: `apps/web/src/lib/playbook-starters.ts`.
- Dashboard integration: `apps/web/src/app/(app)/playbooks/page.tsx`.
- Tests: `apps/web/src/lib/playbook-starters.test.ts`.
- CI: API, core and web typechecks/tests run on each push.

## Extending the catalog

Add a unique, stable ID and a precise question (max 300 characters) to `PLAYBOOK_STARTERS`. Questions should be neutral, ask about existing company evidence, and avoid assuming that a policy or outcome exists. Run:

```bash
pnpm --filter @companybrain/web typecheck
pnpm --filter @companybrain/web test
```

**Scope:** This is a usability and onboarding improvement, not a validated benchmark of retrieval accuracy or a claim that 64 company policies have been implemented. The original repository license and contributor notices remain intact.
