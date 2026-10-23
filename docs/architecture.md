# Architecture

FlowNexus uses an npm-workspaces monorepo. `shared` is compiled first so the browser and API consume the same workflow contracts and Zod schemas.

## Request flow

1. The SPA authenticates through `/api/auth` and stores the short-lived access credential locally.
2. Its Axios client adds the bearer token to workflow requests.
3. Express verifies the token and places the user ID on the request.
4. Workflow queries always filter by both workflow ID and authenticated user ID.
5. Zod validates JSON before Prisma writes it to PostgreSQL.

Workflow definitions are stored as versionable JSON (`nodes`, `edges`, and `viewport`) while searchable metadata remains relational. This keeps the visual-editor model flexible without giving up ownership constraints, sorting, or indexing.

## Boundaries

- `client`: presentation, canvas interaction, client-side preflight validation.
- `server`: authentication, authorization, authoritative validation, persistence, SMTP.
- `worker`: Redis/BullMQ process boundary for later execution jobs.
- `shared`: transport types and schemas; no application state.

Part 1 intentionally does not execute workflow nodes. The worker accepts the queue boundary but the execution planner, credentials vault, run records, retries, and per-integration adapters belong to the next milestone.

## Production evolution

Before multi-tenant production rollout, add refresh-token rotation in secure HTTP-only cookies, secret encryption/KMS, organization membership and roles, audit events, OpenTelemetry, structured logs, execution idempotency, and workflow-definition versioning.
