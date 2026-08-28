# Architecture overview

## Client–server model
```
        HTTPS/REST + WebSocket
  React SPA  <-------------------->  Node/Express API  <---->  Firestore
 (frontend)      Socket.IO           (backend)               (or in-memory)
```

- **Frontend** (React + Vite): UI, routing, calls the REST API via Axios and
  connects to Socket.IO for live chat. Served by Nginx in production.
- **Backend** (Node + Express): REST API, JWT auth, validation, business logic,
  and a Socket.IO server for messaging.
- **Data** (Firebase Firestore): persistence via a repository abstraction. In
  `test`/review mode the same abstraction uses an in-memory store, so the API
  runs with no credentials.

## Backend layering
```
routes/         HTTP endpoints + per-route validation
  └─ controllers/   thin request/response glue (asyncHandler)
       └─ services/     business logic (auth, rides, requests, messages)
            └─ models/      datastore repository (Firestore | in-memory)
utils/          tokens, password hashing, matching, responses, errors
middleware/     auth, validate, error handling, rate limiting
sockets/        Socket.IO chat, persisting through the same services
```
This separation keeps controllers free of vendor code and makes every layer
testable in isolation.

## Request lifecycle (example: request a seat)
1. `POST /api/requests` → `rateLimit` → `requireAuth` → `validate(schema)`
2. `requestController.create` → `requestService.createRequest`
3. Service checks the ride is `open`, prevents self/duplicate requests, creates
   the request, and raises a notification for the driver.
4. Uniform JSON envelope `{ success, data }` returns to the client.

## Objective → testable outcome mapping (from the product vision)
| Objective | Where it's implemented | Test |
|-----------|------------------------|------|
| G2 route/time matching | `utils/matching.js`, `rideService.searchRides` | `frontend/tests/matching.test.js`, `backend/tests/rides.test.js` |
| G3 real-time coordination | `sockets/chat.js`, `messageService` | `backend/tests/security.test.js` (authz), manual chat check |
| G4 data protection | `utils/password.js`, `middleware/auth.js`, `validate` | `backend/tests/auth.test.js`, `security.test.js` |
| G5 runnable/deployable | Dockerfiles, `docker-compose.yml`, CI | `.github/workflows/ci.yml` |

## Technology choices
| Concern | Choice | Why |
|---------|--------|-----|
| Frontend | React + Vite | Fast dev, component reuse, easy testing with Vitest |
| Backend | Express | Minimal, well-understood REST framework |
| Auth | JWT (access + refresh) | Stateless, works for both REST and Socket.IO |
| Real-time | Socket.IO | Handles WebSocket with fallback; simple rooms model |
| DB | Firestore | Managed, no server to run; repository keeps it swappable |
| Container | Docker + Compose | One-command run; reproducible builds; CI parity |
