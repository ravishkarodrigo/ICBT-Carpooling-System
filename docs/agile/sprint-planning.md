# Sprint planning (template)

> Fill this in per sprint. A suggested 3-sprint shape is below to get you started
> — adjust to your team's capacity. Track dependencies and milestones on the
> board, not just a flat list (the rubric rewards this).

## Suggested milestones
- **M1 – Walking skeleton:** auth + post/search rides runnable end to end.
- **M2 – Coordination:** requests, seat management, messaging.
- **M3 – Hardening:** security fixes, tests in CI, Docker, deployment.

## Sprint 1 — "Walking skeleton" (dates: ____ to ____)
**Sprint goal:** A user can register, log in, post a ride and find it by search.
| Story | Owner | Est. | Dependency |
|-------|-------|------|------------|
| US-1 |  | 3 | — |
| US-2 |  | 3 | US-1 |
| US-3 |  | 5 | US-2 |
| US-5 |  | 5 | US-3 |

## Sprint 2 — "Coordination" (dates: ____ to ____)
**Sprint goal:** Passengers can request seats, drivers approve, partners chat.
| Story | Owner | Est. | Dependency |
|-------|-------|------|------------|
| US-6 |  | 3 | US-5 |
| US-7 |  | 5 | US-6 |
| US-4 |  | 2 | US-3 |
| US-8 |  | 8 | US-7 |

## Sprint 3 — "Hardening & deploy" (dates: ____ to ____)
**Sprint goal:** Secured, tested in CI, containerised and deployed.
| Story / task | Owner | Est. | Dependency |
|--------------|-------|------|------------|
| US-11 |  | 2 | US-4 |
| US-9 |  | 3 | US-7 |
| Security testing pass |  | 3 | all |
| Deploy to public URL |  | 3 | Docker |

## Sprint 4 — "Polish & enhancements" (dates: ____ to ____)
**Sprint goal:** Real-time socket layer verified, full frontend component coverage, API contract hardened, and Could stories completed.
| Story / task | Owner | Est. | Dependency |
|--------------|-------|------|------------|
| US-10 (profile editing — full coverage) |  | 2 | US-9 |
| Socket.IO chat layer tests |  | 3 | US-8 |
| Frontend component tests (Register, Rides, Dashboard, ProtectedRoute) |  | 5 | US-2 |
| API service layer tests (api.js / AuthContext) |  | 3 | all |
| Ride lifecycle regression (seat edge cases, status machine) |  | 2 | US-7 |
| Matching algorithm unit tests (scoring, ranking, time overlap) |  | 2 | US-5 |

## Velocity log
| Sprint | Committed pts | Completed pts | Notes / scope changes |
|--------|---------------|---------------|-----------------------|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

> Use completed points to adjust the next sprint's scope. Record *why* scope
> changed — that reasoning is the evidence markers want.
