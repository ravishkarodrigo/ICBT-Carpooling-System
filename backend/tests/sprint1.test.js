/**
 * ============================================================================
 * SPRINT 1 TEST SUITE — "Walking Skeleton"
 * ============================================================================
 * Goal: A user can register, log in, post a ride and find it by search.
 *
 * User Stories covered:
 *   US-1  Register with hashed password
 *   US-2  Login / logout + protected routes
 *   US-3  Post a ride
 *   US-5  Search & rank rides by route/time
 *
 * Testing types:
 *   ✅ Functional Testing   – endpoints work as specified
 *   ✅ Validation Testing   – schema rules enforced
 *   ✅ Security Testing     – auth, token handling, data exposure
 *   ✅ Edge-Case Testing    – boundary conditions and error paths
 *   ✅ TDD documentation   – tests written against acceptance criteria
 * ============================================================================
 */

import request from 'supertest';
import { app, reset, sampleUser, sampleRide } from './helpers.js';

beforeEach(reset);

// ─── Shared helpers ───────────────────────────────────────────────────────────
async function registerAndToken(overrides = {}) {
  const res = await request(app)
    .post('/api/auth/register')
    .send(sampleUser(overrides));
  expect(res.status).toBe(201);
  return { token: res.body.data.accessToken, user: res.body.data.user };
}

async function postRide(token, overrides = {}) {
  return request(app)
    .post('/api/rides')
    .set('Authorization', `Bearer ${token}`)
    .send(sampleRide(overrides));
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  US-1 — Register with hashed password                                    ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('US-1 — Registration', () => {

  test('[US-1-F1] registers successfully and returns 201 with tokens', async () => {
    const res = await request(app).post('/api/auth/register').send(sampleUser());
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('[US-1-F2] returns user object with correct name, email and role', async () => {
    const payload = sampleUser({ name: 'Amal Fernando', role: 'staff' });
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.data.user.name).toBe('Amal Fernando');
    expect(res.body.data.user.email).toBe(payload.email.toLowerCase());
    expect(res.body.data.user.role).toBe('staff');
  });

  test('[US-1-F3] token returned on register can immediately access protected routes', async () => {
    const reg = await request(app).post('/api/auth/register').send(sampleUser());
    const token = reg.body.data.accessToken;
    const profile = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(profile.status).toBe(200);
  });

  test('[US-1-S1] password hash is NEVER returned in the response', async () => {
    const res = await request(app).post('/api/auth/register').send(sampleUser());
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('[US-1-S2] email stored lowercase regardless of input casing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser({ email: 'CAPITAL@ICBT.LK' }));
    expect(res.body.data.user.email).toBe('capital@icbt.lk');
  });

  test('[US-1-V1] rejects weak password — fewer than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser({ password: 'abc123' }));
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toContain('password');
  });

  test('[US-1-V2] rejects password with no number', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser({ password: 'NoNumbers!' }));
    expect(res.status).toBe(400);
  });

  test('[US-1-V3] rejects password with no letter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser({ password: '12345678' }));
    expect(res.status).toBe(400);
  });

  test('[US-1-V4] rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser({ email: 'not-an-email' }));
    expect(res.status).toBe(400);
  });

  test('[US-1-V5] rejects name shorter than 2 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser({ name: 'A' }));
    expect(res.status).toBe(400);
  });

  test('[US-1-V6] rejects duplicate email — 409 Conflict', async () => {
    const user = sampleUser();
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  test('[US-1-V7] accepts both student and staff roles', async () => {
    const s = await request(app).post('/api/auth/register').send(sampleUser({ role: 'student' }));
    const st = await request(app).post('/api/auth/register').send(sampleUser({ role: 'staff' }));
    expect(s.status).toBe(201);
    expect(st.status).toBe(201);
  });

  test('[US-1-V8] rejects unknown roles (e.g. "admin")', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser({ role: 'admin' }));
    expect(res.status).toBe(400);
  });

  test('[US-1-V9] rejects request with missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@icbt.lk' });
    expect(res.status).toBe(400);
  });
});

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  US-2 — Login / logout + protected routes                                 ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('US-2 — Login & Protected Routes', () => {

  test('[US-2-F1] logs in with correct credentials and returns tokens', async () => {
    const user = sampleUser();
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('[US-2-F2] GET /api/auth/me returns authenticated user data', async () => {
    const { token, user } = await registerAndToken();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data.email).toBe(user.email);
  });

  test('[US-2-F3] login email is case-insensitive', async () => {
    const user = sampleUser({ email: 'login@icbt.lk' });
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'LOGIN@ICBT.LK', password: user.password });
    expect(res.status).toBe(200);
  });

  test('[US-2-S1] wrong password returns 401 with generic message — no account enumeration', async () => {
    const user = sampleUser();
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid email or password');
  });

  test('[US-2-S2] non-existent email returns identical 401 message — no enumeration', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@icbt.lk', password: 'Whatever1' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid email or password');
  });

  test('[US-2-S3] password hash never exposed on login response', async () => {
    const user = sampleUser();
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test('[US-2-S4] malformed token is rejected with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.fake');
    expect(res.status).toBe(401);
  });

  test('[US-2-S5] refresh token cannot be used as an access token', async () => {
    const reg = await request(app).post('/api/auth/register').send(sampleUser());
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.data.refreshToken}`);
    expect(res.status).toBe(401);
  });

  test('[US-2-S6] missing Authorization header returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('[US-2-P1] GET /api/rides/mine requires authentication', async () => {
    const res = await request(app).get('/api/rides/mine');
    expect(res.status).toBe(401);
  });

  test('[US-2-P2] POST /api/rides requires authentication', async () => {
    const res = await request(app).post('/api/rides').send(sampleRide());
    expect(res.status).toBe(401);
  });

  test('[US-2-P3] POST /api/requests requires authentication', async () => {
    const res = await request(app).post('/api/requests').send({ rideId: 'any' });
    expect(res.status).toBe(401);
  });

  test('[US-2-P4] unknown API routes return 404 with error envelope', async () => {
    const res = await request(app).get('/api/this-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  US-3 — Post a ride                                                       ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('US-3 — Post a Ride', () => {

  test('[US-3-F1] authenticated driver creates a ride — 201', async () => {
    const { token } = await registerAndToken();
    const res = await postRide(token);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
  });

  test('[US-3-F2] newly created ride has status "open"', async () => {
    const { token } = await registerAndToken();
    const res = await postRide(token);
    expect(res.body.data.status).toBe('open');
  });

  test('[US-3-F3] seatsAvailable equals seatsTotal on creation', async () => {
    const { token } = await registerAndToken();
    const res = await postRide(token, { seatsTotal: 4 });
    expect(res.body.data.seatsAvailable).toBe(4);
  });

  test('[US-3-F4] ride appears in the public open listing', async () => {
    const { token } = await registerAndToken();
    await postRide(token);
    const list = await request(app).get('/api/rides');
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('[US-3-F5] ride includes driverName in the response', async () => {
    const { token } = await registerAndToken({ name: 'Kamal Driver' });
    const res = await postRide(token);
    expect(res.body.data.driverName).toBe('Kamal Driver');
  });

  test('[US-3-F6] all required fields are stored and returned correctly', async () => {
    const { token } = await registerAndToken();
    const payload = {
      origin: 'Maharagama', destination: 'ICBT Campus',
      date: '2026-09-15', timeStart: '07:00', timeEnd: '08:30',
      seatsTotal: 2, notes: 'Call me when ready',
    };
    const res = await postRide(token, payload);
    const data = res.body.data;
    expect(data.origin).toBe('Maharagama');
    expect(data.destination).toBe('ICBT Campus');
    expect(data.date).toBe('2026-09-15');
    expect(data.timeStart).toBe('07:00');
    expect(data.timeEnd).toBe('08:30');
    expect(data.seatsTotal).toBe(2);
    expect(data.notes).toBe('Call me when ready');
  });

  test('[US-3-F7] GET /api/rides/:id returns full ride detail', async () => {
    const { token } = await registerAndToken();
    const created = await postRide(token);
    const rideId = created.body.data.id;
    const res = await request(app).get(`/api/rides/${rideId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(rideId);
  });

  test('[US-3-F8] GET /api/rides/mine lists ride under "driving" array', async () => {
    const { token } = await registerAndToken();
    await postRide(token);
    const res = await request(app).get('/api/rides/mine').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.driving.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.riding).toHaveLength(0);
  });

  test('[US-3-V1] end time must be after start time — 400', async () => {
    const { token } = await registerAndToken();
    const res = await postRide(token, { timeStart: '09:00', timeEnd: '08:00' });
    expect(res.status).toBe(400);
  });

  test('[US-3-V2] equal start and end time is rejected', async () => {
    const { token } = await registerAndToken();
    const res = await postRide(token, { timeStart: '09:00', timeEnd: '09:00' });
    expect(res.status).toBe(400);
  });

  test('[US-3-V3] origin field is required', async () => {
    const { token } = await registerAndToken();
    const payload = sampleRide();
    delete payload.origin;
    const res = await request(app)
      .post('/api/rides').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(400);
  });

  test('[US-3-V4] destination field is required', async () => {
    const { token } = await registerAndToken();
    const payload = sampleRide();
    delete payload.destination;
    const res = await request(app)
      .post('/api/rides').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(400);
  });

  test('[US-3-V5] date must match YYYY-MM-DD format', async () => {
    const { token } = await registerAndToken();
    const res = await postRide(token, { date: '28-08-2026' });
    expect(res.status).toBe(400);
  });

  test('[US-3-V6] seatsTotal must be at least 1', async () => {
    const { token } = await registerAndToken();
    const res = await postRide(token, { seatsTotal: 0 });
    expect(res.status).toBe(400);
  });

  test('[US-3-V7] seatsTotal cannot exceed 7', async () => {
    const { token } = await registerAndToken();
    const res = await postRide(token, { seatsTotal: 8 });
    expect(res.status).toBe(400);
  });

  test('[US-3-V8] time must follow HH:MM 24-hour format', async () => {
    const { token } = await registerAndToken();
    const res = await postRide(token, { timeStart: '7:30', timeEnd: '08:30' });
    expect(res.status).toBe(400);
  });

  test('[US-3-S1] unauthenticated POST /api/rides is rejected — 401', async () => {
    const res = await request(app).post('/api/rides').send(sampleRide());
    expect(res.status).toBe(401);
  });

  test('[US-3-S2] only the driver can cancel their ride — others get 403', async () => {
    const driver = await registerAndToken();
    const other = await registerAndToken();
    const ride = await postRide(driver.token);
    const rideId = ride.body.data.id;
    const forbidden = await request(app)
      .post(`/api/rides/${rideId}/cancel`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(403);
    const ok = await request(app)
      .post(`/api/rides/${rideId}/cancel`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.status).toBe('cancelled');
  });

  test('[US-3-S3] only the driver can complete their ride — others get 403', async () => {
    const driver = await registerAndToken();
    const other = await registerAndToken();
    const ride = await postRide(driver.token);
    const forbidden = await request(app)
      .post(`/api/rides/${ride.body.data.id}/complete`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(403);
  });

  test('[US-3-E1] GET /api/rides/:id returns 404 for non-existent ride', async () => {
    const res = await request(app).get('/api/rides/nonexistent-uuid');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('[US-3-E2] cancelled ride disappears from open listing', async () => {
    const { token } = await registerAndToken();
    const ride = await postRide(token);
    const rideId = ride.body.data.id;
    await request(app).post(`/api/rides/${rideId}/cancel`).set('Authorization', `Bearer ${token}`);
    const list = await request(app).get('/api/rides');
    const openIds = list.body.data.map((r) => r.id);
    expect(openIds).not.toContain(rideId);
  });

  test('[US-3-E3] cancelled ride appears in trip history', async () => {
    const { token } = await registerAndToken();
    const ride = await postRide(token);
    const rideId = ride.body.data.id;
    await request(app).post(`/api/rides/${rideId}/cancel`).set('Authorization', `Bearer ${token}`);
    const history = await request(app).get('/api/rides/history').set('Authorization', `Bearer ${token}`);
    expect(history.status).toBe(200);
    const found = history.body.data.find((r) => r.id === rideId);
    expect(found).toBeDefined();
    expect(found.status).toBe('cancelled');
  });

  test('[US-3-E4] notes field is optional and defaults to empty string', async () => {
    const { token } = await registerAndToken();
    const payload = sampleRide();
    delete payload.notes;
    const res = await request(app)
      .post('/api/rides').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(201);
    expect(res.body.data.notes).toBe('');
  });
});

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  US-5 — Search & rank rides by route / time                               ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('US-5 — Search & Rank Rides', () => {

  test('[US-5-F1] search by origin returns matching rides with matchScore', async () => {
    const { token } = await registerAndToken();
    await postRide(token, { origin: 'Nugegoda', destination: 'ICBT Campus' });
    const res = await request(app).get('/api/rides/search').query({ origin: 'nugegoda' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].matchScore).toBeGreaterThan(0);
  });

  test('[US-5-F2] search by destination returns matching rides', async () => {
    const { token } = await registerAndToken();
    await postRide(token, { origin: 'Maharagama', destination: 'ICBT Campus' });
    const res = await request(app).get('/api/rides/search').query({ destination: 'icbt' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('[US-5-F3] exact origin+destination match scores >= 80', async () => {
    const { token } = await registerAndToken();
    await postRide(token, { origin: 'Nugegoda', destination: 'ICBT Campus' });
    const res = await request(app)
      .get('/api/rides/search')
      .query({ origin: 'nugegoda', destination: 'icbt' });
    expect(res.status).toBe(200);
    expect(res.body.data[0].matchScore).toBeGreaterThanOrEqual(80);
  });

  test('[US-5-F4] results are ordered by matchScore descending', async () => {
    const { token } = await registerAndToken();
    await postRide(token, { origin: 'Nugegoda', destination: 'ICBT Campus' });
    await postRide(token, { origin: 'Maharagama', destination: 'ICBT Campus' });
    const res = await request(app)
      .get('/api/rides/search')
      .query({ origin: 'nugegoda', destination: 'icbt' });
    expect(res.status).toBe(200);
    const scores = res.body.data.map((r) => r.matchScore);
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  });

  test('[US-5-F5] search is case-insensitive', async () => {
    const { token } = await registerAndToken();
    await postRide(token, { origin: 'Nugegoda', destination: 'ICBT Campus' });
    const lower = await request(app).get('/api/rides/search').query({ origin: 'nugegoda' });
    const upper = await request(app).get('/api/rides/search').query({ origin: 'NUGEGODA' });
    expect(lower.body.data.length).toBe(upper.body.data.length);
  });

  test('[US-5-F6] date match boosts score — matching-date ride ranks first', async () => {
    // The scoring algorithm awards +10 for date match but does NOT exclude
    // other dates; it only boosts relevance. Both rides share origin 'Nugegoda'
    // (+40 each) but the 2026-09-01 ride scores +10 extra for the date match.
    const { token } = await registerAndToken();
    const ride1 = await postRide(token, { date: '2026-09-01' });                                  // should score higher
    const ride2 = await postRide(token, { date: '2026-10-15', timeStart: '08:00', timeEnd: '09:00' });
    const res = await request(app)
      .get('/api/rides/search')
      .query({ origin: 'nugegoda', date: '2026-09-01' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    // The date-matching ride should be ranked first (highest score).
    expect(res.body.data[0].id).toBe(ride1.body.data.id);
    expect(res.body.data[0].matchScore).toBeGreaterThan(
      res.body.data.length > 1 ? res.body.data[1].matchScore : -1
    );
  });

  test('[US-5-F7] non-matching rides are excluded from search results', async () => {
    const { token } = await registerAndToken();
    await postRide(token, { origin: 'Kandy', destination: 'Peradeniya' });
    const res = await request(app)
      .get('/api/rides/search')
      .query({ origin: 'Colombo', destination: 'icbt' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('[US-5-F8] only "open" rides appear in search — cancelled excluded', async () => {
    const { token } = await registerAndToken();
    const ride = await postRide(token, { origin: 'Nugegoda', destination: 'ICBT' });
    const rideId = ride.body.data.id;
    await request(app).post(`/api/rides/${rideId}/cancel`).set('Authorization', `Bearer ${token}`);
    const res = await request(app).get('/api/rides/search').query({ origin: 'nugegoda' });
    const foundIds = res.body.data.map((r) => r.id);
    expect(foundIds).not.toContain(rideId);
  });

  test('[US-5-F9] GET /api/rides is publicly accessible without auth', async () => {
    const res = await request(app).get('/api/rides');
    expect(res.status).toBe(200);
  });

  test('[US-5-F10] GET /api/rides/search is publicly accessible without auth', async () => {
    const res = await request(app).get('/api/rides/search').query({ origin: 'any' });
    expect(res.status).toBe(200);
  });

  test('[US-5-E1] returns empty array when no rides exist', async () => {
    const res = await request(app).get('/api/rides/search').query({ origin: 'Anywhere' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('[US-5-E2] partial text match works (e.g. "nugeg" matches "Nugegoda")', async () => {
    const { token } = await registerAndToken();
    await postRide(token, { origin: 'Nugegoda', destination: 'ICBT Campus' });
    const res = await request(app).get('/api/rides/search').query({ origin: 'nugeg' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  Sprint 1 — End-to-End Walking Skeleton Integration Test                   ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('Sprint 1 — End-to-End Walking Skeleton', () => {

  test('[S1-E2E] register → login → post ride → search finds it with correct score', async () => {
    // 1. Register
    const regRes = await request(app).post('/api/auth/register').send(sampleUser({ name: 'Dinesh Perera' }));
    expect(regRes.status).toBe(201);

    // 2. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: regRes.body.data.user.email, password: 'Colombo123' });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.accessToken;

    // 3. Post a ride
    const rideRes = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${token}`)
      .send({
        origin: 'Nugegoda Junction', destination: 'ICBT Colombo Campus',
        date: '2026-09-10', timeStart: '07:00', timeEnd: '08:00', seatsTotal: 3,
      });
    expect(rideRes.status).toBe(201);
    const rideId = rideRes.body.data.id;

    // 4. Search and verify
    const searchRes = await request(app)
      .get('/api/rides/search')
      .query({ origin: 'nugegoda', destination: 'icbt' });
    expect(searchRes.status).toBe(200);
    const found = searchRes.body.data.find((r) => r.id === rideId);
    expect(found).toBeDefined();
    expect(found.matchScore).toBeGreaterThanOrEqual(80);
    expect(found.status).toBe('open');
    expect(found.seatsAvailable).toBe(3);
    expect(found.driverName).toBe('Dinesh Perera');
  });
});
