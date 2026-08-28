# Security & privacy

Maps to the "Testing, Software Security and Deployment" phase. It documents the
controls **implemented** and the security testing the team should run and record.

## Threat model (brief)
Assets: user accounts and personal data (email, phone), ride data, and private
messages. Main risks: unauthorised access to accounts/data, broken access control
between users, injection, and secret leakage.

## Controls implemented
| Risk | Control | Where |
|------|---------|-------|
| Password theft | Passwords hashed with bcrypt + per-password salt; never stored or returned in plain text | `backend/src/utils/password.js`, `authService` |
| Unauthenticated access | JWT-based `requireAuth`; protected routes and Socket.IO handshake auth | `middleware/auth.js`, `sockets/chat.js` |
| Broken access control | Server-side ownership checks: only a ride's driver can cancel/complete or decide requests; message threads limited to participants | `rideService`, `requestService`, `messageService` |
| Account enumeration | Login returns a generic "Invalid email or password" | `authService.login` |
| Injection / bad input | Zod schema validation on every write endpoint | `validation/schemas.js`, `middleware/validate.js` |
| Brute force | Rate limiting, stricter on auth routes | `middleware/rateLimit.js` |
| Common web headers | Helmet on the API; security headers in Nginx | `app.js`, `frontend/nginx.conf` |
| Token misuse | Refresh tokens rejected where an access token is required | `middleware/auth.js` |
| Secret leakage | No hardcoded secrets; all via env vars; `.env` git-ignored; `.env.example` provided | `config/env.js`, `.gitignore` |
| Least privilege in container | Backend image runs as a non-root user | `backend/Dockerfile` |

## Security tests (automated)
See `backend/tests/security.test.js` and `auth.test.js`:
- Tampered/invalid tokens are rejected.
- Refresh token cannot be used as an access token.
- Non-driver cannot decide another driver's ride request (authorization).
- Weak passwords are rejected; duplicate registration blocked.

## Security testing pass (to complete and record)
Run at least one deliberate pass and log findings + fixes here. Suggested checks
mapped loosely to the OWASP Top 10:
- [ ] A01 Broken access control — try acting on another user's ride/request/messages.
- [ ] A02 Cryptographic failures — confirm no plaintext passwords anywhere in DB/logs.
- [ ] A03 Injection — send unexpected payloads; confirm validation rejects them.
- [ ] A05 Misconfiguration — confirm CORS origin, headers, and no secrets in the repo.
- [ ] A07 Auth failures — expired/invalid tokens, rate limiting on login.

### Findings log
| Date | Finding | Severity | Fix / status |
|------|---------|----------|--------------|
|      |         |          |              |

> **Do not fabricate this log.** Run the checks and record real results — that
> evidence is exactly what the top rubric band rewards.

## Privacy
Phone numbers are optional and intended to be shared only with confirmed ride
partners. If deploying publicly, add a short privacy note covering what data is
collected and how it's used, in line with the EDGE "Ethical" attribute in the brief.
