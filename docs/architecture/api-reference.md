# API reference

Base URL: `/api`. All responses use `{ "success": true, "data": ... }` on
success or `{ "success": false, "error": { "message", "details?" } }` on failure.
Authenticated routes require `Authorization: Bearer <accessToken>`.

## Auth
| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| POST | `/auth/register` | — | name, email, password, role | Returns user + tokens |
| POST | `/auth/login` | — | email, password | Returns user + tokens |
| GET | `/auth/me` | ✓ | — | Current profile |
| PATCH | `/auth/me` | ✓ | name?, phone?, homeArea? | Update profile |

## Rides
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/rides` | — | List open rides |
| GET | `/rides/search` | — | Query: origin, destination, date, timeStart, timeEnd |
| GET | `/rides/mine` | ✓ | Rides you drive / ride in |
| GET | `/rides/history` | ✓ | Completed/cancelled trips |
| GET | `/rides/:id` | — | Ride detail |
| POST | `/rides` | ✓ | Create ride |
| POST | `/rides/:id/cancel` | ✓ | Driver only |
| POST | `/rides/:id/complete` | ✓ | Driver only |

## Requests
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/requests` | ✓ | Body: rideId, message? |
| GET | `/requests/incoming` | ✓ | Requests on your rides |
| GET | `/requests/outgoing` | ✓ | Your requests |
| PATCH | `/requests/:id` | ✓ | Body: decision `accepted`|`rejected` (driver only) |

## Messages
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/messages` | ✓ | Body: rideId, toUserId, body |
| GET | `/messages/:rideId/:otherUserId` | ✓ | Conversation thread |

## Notifications
| Method | Path | Auth |
|--------|------|------|
| GET | `/notifications` | ✓ |
| PATCH | `/notifications/:id/read` | ✓ |

## Socket.IO events (namespace `/`, auth via `{ token }`)
| Event | Direction | Payload |
|-------|-----------|---------|
| `chat:send` | client → server | `{ rideId, toUserId, body }` (ack returns saved message) |
| `chat:message` | server → client | saved message object |
| `chat:typing` | both | `{ rideId, toUserId/fromUserId }` |

## Health
`GET /api/health` → `{ success: true, data: { status: "ok" } }`
