# FlowNexus

FlowNexus is a production-oriented, no-code workflow automation platform. Its first milestone provides secure account creation, a workflow dashboard, a drag-and-drop visual editor, validation, and PostgreSQL persistence.

![React](https://img.shields.io/badge/React-19-149eca) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1) ![License](https://img.shields.io/badge/license-MIT-green)

## What works

- Register, sign in, restore a session, and sign out using JWT authentication.
- Create, search, open, rename, delete, pause, and activate owned workflows.
- Drag webhook, schedule, HTTP, email, condition, and transform nodes onto a React Flow canvas.
- Connect, move, configure, and delete nodes; canvas viewport is persisted too.
- Validate missing triggers, disconnected nodes, cycles, and incomplete configuration.
- Protect every workflow query by owner ID and validate all API payloads.
- Run PostgreSQL, Redis, API, worker, and the frontend with Docker Compose.

## Repository layout

```text
client/   React + Vite + Tailwind + React Flow SPA
server/   Express + Prisma API, JWT auth, SMTP service
worker/   BullMQ execution-worker foundation
shared/   Shared Zod schemas and TypeScript contracts
docs/     Architecture and API notes
```

## Local development

Requirements: Node.js 20.19+ (22 recommended), npm, Docker Desktop.

```powershell
npm install
Copy-Item server/.env.example server/.env
docker compose up -d postgres redis
npm run db:generate
npm run db:migrate
npm run dev
```

Open `http://localhost:5173`. The API is available at `http://localhost:4000/api`; Vite proxies `/api` automatically.

To configure welcome emails, set the `SMTP_*` variables in `server/.env`. Without them, development continues normally and logs that delivery was skipped.

## Run everything with Docker

Copy `.env.example` to `.env`, replace `JWT_SECRET`, then run:

```powershell
docker compose up --build
```

Open `http://localhost:8080`. Database migrations run when the API container starts.

## Quality checks

```powershell
npm run typecheck
npm test
npm run build
```

See [docs/architecture.md](docs/architecture.md) for design decisions and [docs/api.md](docs/api.md) for the API contract.

## Security notes

Passwords are hashed with bcrypt (cost 12), auth endpoints are rate-limited, API headers are hardened with Helmet, payload size is capped, inputs are validated with Zod, and resource ownership is included in every workflow lookup. For a public deployment, use HTTPS, a randomly generated JWT secret, a restricted production CORS origin, managed secrets, backups, and token rotation/refresh-token support.

## License

MIT — see [LICENSE](LICENSE).
