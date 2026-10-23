# HTTP API

Base path: `/api`. JSON errors use `{ "error": { "message", "code", "details?" } }`.

## Authentication

- `POST /auth/register` — `{ name, email, password }`
- `POST /auth/login` — `{ email, password }`
- `GET /auth/me` — bearer token required

Register and login return `{ token, user }`.

## Workflows

All workflow routes require `Authorization: Bearer <token>`.

- `GET /workflows` — list the current user's workflows.
- `POST /workflows` — create a workflow.
- `GET /workflows/:id` — read an owned workflow.
- `PATCH /workflows/:id` — update metadata, state, or definition.
- `DELETE /workflows/:id` — permanently delete an owned workflow.

A definition has the following shape:

```json
{
  "nodes": [{ "id": "node-1", "type": "workflowNode", "position": { "x": 100, "y": 120 }, "data": { "label": "Webhook", "kind": "webhook", "config": {} } }],
  "edges": [],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

Valid statuses are `DRAFT`, `ACTIVE`, and `PAUSED`. Valid node kinds are `webhook`, `schedule`, `httpRequest`, `sendEmail`, `condition`, and `transform`.

## Operations

- `GET /health` — liveness endpoint; does not require authentication.
- `GET /ready` — readiness endpoint; verifies the PostgreSQL connection.
