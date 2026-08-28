# RideShare ICBT — Carpooling App

A client–server carpooling web application for ICBT students and staff, built for
the **SEN5002 Agile Development and DevOps** portfolio. It helps people travelling
the same route at the same time share one vehicle — a practical response to Sri
Lanka's fuel shortage and odd-even refuelling quota.

> **React + Vite** frontend · **Node/Express** API · **Firebase Firestore** ·
> **Socket.IO** real-time chat · **Docker Compose** · **GitHub Actions CI**.

---

## Features
- Student/staff registration & login with hashed passwords and JWT sessions
- Post a carpool ride (route, date, time window, seats)
- Search & rank rides by route and time-window overlap
- Request a seat; driver approves/declines; **seat counts update automatically**
- Near-real-time messaging between matched users (Socket.IO)
- Notifications for requests, approvals and messages
- Trip history, ride cancellation/completion, profile editing
- Responsive, professional UI with loading / empty / error / success states

## Quick start

### Option A — Docker (recommended, one command)
```bash
cp .env.example .env        # set JWT_SECRET; leave USE_IN_MEMORY_DB=true to try it without Firebase
docker compose up --build
```
- Frontend: http://localhost:8080
- API health: http://localhost:5000/api/health

The backend defaults to an **in-memory data store** so it runs with no Firebase
credentials. To use Firestore, set `USE_IN_MEMORY_DB=false` and the `FIREBASE_*`
values in `.env`.

### Option B — Run locally (two terminals)
```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```
Frontend dev server: http://localhost:5173

## Testing
```bash
cd backend  && npm test            # Jest + Supertest (auth, rides, requests, security)
cd backend  && npm run test:coverage
cd frontend && npm test            # Vitest + Testing Library (components, matching, auth flow)
```
All tests also run automatically in CI on every push and pull request
(`.github/workflows/ci.yml`).

## Configuration
All configuration is via environment variables — **no secrets are hardcoded**.
See [`.env.example`](.env.example). `.env` is git-ignored.

## Deployment notes
- The images are production-ready: backend runs as a non-root user with a
  healthcheck; frontend is served by Nginx with SPA fallback and cache headers.
- To deploy to a public URL, push the two images to a registry and run them on
  any container host (Render, Railway, Fly.io, a VPS, etc.), setting the same
  env vars and a real `FIREBASE_*` config. Point the frontend build args
  (`VITE_API_URL`, `VITE_SOCKET_URL`) at the deployed API. Record the live URL
  and a security-testing pass in [`docs/security.md`](docs/security.md).

## Project structure
```
carpooling-app/
├── frontend/           React + Vite SPA (components, pages, context, services, tests)
├── backend/            Express API (routes → controllers → services → models), Socket.IO, tests
├── docs/               Portfolio artifacts (vision, personas, stories, agile, architecture, security)
├── .github/            CI workflow, PR & issue templates
├── docker-compose.yml  Full-stack one-command run
├── .env.example        Environment template
├── .gitignore
└── README.md
```

## Documentation
Start at [`docs/README.md`](docs/README.md). It indexes every phase artifact and
explains how to keep them updated as the project runs.

## How this maps to the assessment rubric
| Phase | Where |
|-------|-------|
| 1 · Project Planning | `docs/requirements/product-vision.md`, `docs/agile/product-backlog.md` |
| 2 · Requirements Engineering | `docs/requirements/` (personas, scenarios, user-stories, prioritisation, prototype = the running app) |
| 3 · Agile & DevOps | `docs/agile/` (sprints, retros, branching), feature branches + PRs, `docker-compose.yml`, GitHub Actions CI |
| 4 · Testing, Security & Deployment | `backend/tests/`, `frontend/tests/`, `docs/security.md`, Dockerfiles, deployment notes |

## Important: produce your own evidence
The **code and structure** are here; the **evidence must be real**. Do not
fabricate commits, sprint results, usability feedback, test runs, security
findings or deployment proof. Use the templates in `docs/` to record genuine
work as your team does it — that authenticity is what the marking criteria reward,
and every member should be able to explain any part of the submission.
