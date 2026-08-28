/**
 * ============================================================================
 * SPRINT 2 TEST SUITE — "Coordination"
 * ============================================================================
 * Goal: Passengers can request seats, drivers approve, partners chat.
 *
 * User Stories covered:
 *   US-6  Request a seat
 *   US-7  Approve / decline requests + seat management
 *   US-4  Cancel / complete a ride (driver manages ride lifecycle)
 *   US-8  Real-time messaging (REST layer; Socket.IO tested separately)
 *
 * Testing types:
 *   ✅ Functional Testing   – endpoints work as specified
 *   ✅ Validation Testing   – schema and business-rule enforcement
 *   ✅ Security Testing     – auth, authorisation, data isolation
 *   ✅ Edge-Case Testing    – boundary conditions and conflict paths
 *   ✅ Integration Testing  – multi-step flows end-to-end
 * ============================================================================
 */

import request from 'supertest';
import { server, app, reset, sampleUser, sampleRide } from './helpers.js';

beforeEach(reset);

// ─── Shared helpers ───────────────────────────────────────────────────────────
async function registerAndToken(overrides = {}) {
  const res = await request(server)
    .post('/api/auth/register')
    .send(sampleUser(overrides));
  expect(res.status).toBe(201);
  return { token: res.body.data.accessToken, user: res.body.data.user };
}

async function createRide(token, overrides = {}) {
  const res = await request(server)
    .post('/api/rides')
    .set('Authorization', `Bearer ${token}`)
    .send(sampleRide(overrides));
  expect(res.status).toBe(201);
  return res.body.data;
}

async function requestSeat(passengerToken, rideId, message = '') {
  return request(server)
    .post('/api/requests')
    .set('Authorization', `Bearer ${passengerToken}`)
    .send({ rideId, message });
}

async function decideRequest(driverToken, requestId, decision) {
  return request(server)
    .patch(`/api/requests/${requestId}`)
    .set('Authorization', `Bearer ${driverToken}`)
    .send({ decision });
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  US-6 — Request a seat                                                    ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('US-6 — Request a Seat', () => {

  // ── Functional ──────────────────────────────────────────────────────────────
  test('[US-6-F1] passenger can submit a seat request — 201', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await requestSeat(passenger.token, ride.id, 'Can I join?');
    expect(res.status).toBe(201);
    expect(res.body.data.rideId).toBe(ride.id);
    expect(res.body.data.passengerId).toBe(passenger.user.id);
    expect(res.body.data.status).toBe('pending');
  });

  test('[US-6-F2] request stores optional message', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await requestSeat(passenger.token, ride.id, 'Please let me in!');
    expect(res.status).toBe(201);
    expect(res.body.data.message).toBe('Please let me in!');
  });

  test('[US-6-F3] request message defaults to empty string when omitted', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await request(server)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id }); // no message field
    expect(res.status).toBe(201);
    expect(res.body.data.message).toBe('');
  });

  test('[US-6-F4] GET /api/requests/outgoing returns the passenger\'s pending requests', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    await requestSeat(passenger.token, ride.id);

    const res = await request(server)
      .get('/api/requests/outgoing')
      .set('Authorization', `Bearer ${passenger.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].rideId).toBe(ride.id);
  });

  test('[US-6-F5] GET /api/requests/incoming returns the driver\'s pending requests', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    await requestSeat(passenger.token, ride.id);

    const res = await request(server)
      .get('/api/requests/incoming')
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].passengerId).toBe(passenger.user.id);
  });

  test('[US-6-F6] driver\'s incoming list does not show other drivers\' requests', async () => {
    const driver1 = await registerAndToken();
    const driver2 = await registerAndToken();
    const passenger = await registerAndToken();
    const ride1 = await createRide(driver1.token);
    await requestSeat(passenger.token, ride1.id);

    // driver2 has no requests
    const res = await request(server)
      .get('/api/requests/incoming')
      .set('Authorization', `Bearer ${driver2.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  // ── Validation ───────────────────────────────────────────────────────────────
  test('[US-6-V1] driver cannot request their own ride — 400', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);
    const res = await requestSeat(driver.token, ride.id);
    expect(res.status).toBe(400);
  });

  test('[US-6-V2] cannot request a cancelled ride', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    // Cancel the ride first
    await request(server)
      .post(`/api/rides/${ride.id}/cancel`)
      .set('Authorization', `Bearer ${driver.token}`);

    const res = await requestSeat(passenger.token, ride.id);
    expect(res.status).toBe(409);
  });

  test('[US-6-V3] cannot request a completed ride', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    await request(server)
      .post(`/api/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    const res = await requestSeat(passenger.token, ride.id);
    expect(res.status).toBe(409);
  });

  test('[US-6-V4] duplicate pending request is rejected — 409', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    await requestSeat(passenger.token, ride.id);
    const res = await requestSeat(passenger.token, ride.id); // duplicate
    expect(res.status).toBe(409);
  });

  test('[US-6-V5] rideId is required in the request body', async () => {
    const passenger = await registerAndToken();
    const res = await request(server)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({}); // no rideId
    expect(res.status).toBe(400);
  });

  test('[US-6-V6] request for a non-existent ride returns 404', async () => {
    const passenger = await registerAndToken();
    const res = await requestSeat(passenger.token, 'nonexistent-ride-id');
    expect(res.status).toBe(404);
  });

  // ── Security ─────────────────────────────────────────────────────────────────
  test('[US-6-S1] unauthenticated POST /api/requests is rejected — 401', async () => {
    const res = await request(server).post('/api/requests').send({ rideId: 'abc' });
    expect(res.status).toBe(401);
  });

  test('[US-6-S2] GET /api/requests/outgoing requires authentication', async () => {
    const res = await request(server).get('/api/requests/outgoing');
    expect(res.status).toBe(401);
  });

  test('[US-6-S3] GET /api/requests/incoming requires authentication', async () => {
    const res = await request(server).get('/api/requests/incoming');
    expect(res.status).toBe(401);
  });

  // ── Notification side-effect ──────────────────────────────────────────────────
  test('[US-6-N1] submitting a request creates a notification for the driver', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    await requestSeat(passenger.token, ride.id);

    const res = await request(server)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].type).toBe('request:new');
    expect(res.body.data[0].rideId).toBe(ride.id);
  });
});

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  US-7 — Approve / decline requests + seat management                      ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('US-7 — Approve / Decline Requests', () => {

  // ── Functional ──────────────────────────────────────────────────────────────
  test('[US-7-F1] driver can accept a pending request — 200', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);

    const res = await decideRequest(driver.token, req.body.data.id, 'accepted');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('accepted');
  });

  test('[US-7-F2] driver can reject a pending request — 200', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);

    const res = await decideRequest(driver.token, req.body.data.id, 'rejected');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('rejected');
  });

  test('[US-7-F3] accepting a request reduces seatsAvailable by 1', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token, { seatsTotal: 3 });
    const req = await requestSeat(passenger.token, ride.id);

    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const detail = await request(server).get(`/api/rides/${ride.id}`);
    expect(detail.body.data.seatsAvailable).toBe(2);
  });

  test('[US-7-F4] rejecting a request does NOT reduce seatsAvailable', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token, { seatsTotal: 3 });
    const req = await requestSeat(passenger.token, ride.id);

    await decideRequest(driver.token, req.body.data.id, 'rejected');

    const detail = await request(server).get(`/api/rides/${ride.id}`);
    expect(detail.body.data.seatsAvailable).toBe(3);
  });

  test('[US-7-F5] ride status becomes "full" when the last seat is accepted', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token, { seatsTotal: 1 });
    const req = await requestSeat(passenger.token, ride.id);

    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const detail = await request(server).get(`/api/rides/${ride.id}`);
    expect(detail.body.data.status).toBe('full');
    expect(detail.body.data.seatsAvailable).toBe(0);
  });

  test('[US-7-F6] ride stays "open" when seats remain after acceptance', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token, { seatsTotal: 2 });
    const req = await requestSeat(passenger.token, ride.id);

    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const detail = await request(server).get(`/api/rides/${ride.id}`);
    expect(detail.body.data.status).toBe('open');
    expect(detail.body.data.seatsAvailable).toBe(1);
  });

  test('[US-7-F7] accepted passenger appears in passengerNames on ride detail', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken({ name: 'Sadun Passenger' });
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const detail = await request(server).get(`/api/rides/${ride.id}`);
    const names = detail.body.data.passengerNames.map((p) => p.name);
    expect(names).toContain('Sadun Passenger');
  });

  test('[US-7-F8] accepted passenger sees the ride under GET /api/rides/mine riding list', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const mine = await request(server)
      .get('/api/rides/mine')
      .set('Authorization', `Bearer ${passenger.token}`);
    expect(mine.status).toBe(200);
    const ridingIds = mine.body.data.riding.map((r) => r.id);
    expect(ridingIds).toContain(ride.id);
  });

  test('[US-7-F9] multiple passengers can be accepted up to seatsTotal', async () => {
    const driver = await registerAndToken();
    const p1 = await registerAndToken();
    const p2 = await registerAndToken();
    const ride = await createRide(driver.token, { seatsTotal: 2 });

    const r1 = await requestSeat(p1.token, ride.id);
    const r2 = await requestSeat(p2.token, ride.id);
    await decideRequest(driver.token, r1.body.data.id, 'accepted');
    await decideRequest(driver.token, r2.body.data.id, 'accepted');

    const detail = await request(server).get(`/api/rides/${ride.id}`);
    expect(detail.body.data.status).toBe('full');
    expect(detail.body.data.seatsAvailable).toBe(0);
  });

  // ── Security / Authorization ──────────────────────────────────────────────────
  test('[US-7-S1] a stranger cannot decide a request — 403', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const stranger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);

    const res = await decideRequest(stranger.token, req.body.data.id, 'accepted');
    expect(res.status).toBe(403);
  });

  test('[US-7-S2] passenger cannot decide their own request — 403', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);

    const res = await decideRequest(passenger.token, req.body.data.id, 'accepted');
    expect(res.status).toBe(403);
  });

  test('[US-7-S3] PATCH /api/requests/:id requires authentication', async () => {
    const res = await request(server)
      .patch('/api/requests/fake-id')
      .send({ decision: 'accepted' });
    expect(res.status).toBe(401);
  });

  // ── Validation ───────────────────────────────────────────────────────────────
  test('[US-7-V1] invalid decision value is rejected — 400', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);

    const res = await request(server)
      .patch(`/api/requests/${req.body.data.id}`)
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ decision: 'maybe' }); // invalid
    expect(res.status).toBe(400);
  });

  test('[US-7-V2] deciding an already-decided request returns 409', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);

    await decideRequest(driver.token, req.body.data.id, 'accepted');
    const res = await decideRequest(driver.token, req.body.data.id, 'rejected'); // already decided
    expect(res.status).toBe(409);
  });

  test('[US-7-V3] cannot accept when no seats remain (full ride) — 409', async () => {
    const driver = await registerAndToken();
    const p1 = await registerAndToken();
    const p2 = await registerAndToken();
    const ride = await createRide(driver.token, { seatsTotal: 1 });

    const r1 = await requestSeat(p1.token, ride.id);
    const r2 = await requestSeat(p2.token, ride.id);
    await decideRequest(driver.token, r1.body.data.id, 'accepted'); // fills the only seat

    const res = await decideRequest(driver.token, r2.body.data.id, 'accepted');
    expect([409, 404]).toContain(res.status); // no seat left
  });

  test('[US-7-V4] deciding a non-existent request returns 404', async () => {
    const driver = await registerAndToken();
    const res = await decideRequest(driver.token, 'nonexistent-request-id', 'accepted');
    expect(res.status).toBe(404);
  });

  // ── Notification side-effects ─────────────────────────────────────────────────
  test('[US-7-N1] accepting a request notifies the passenger', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const notifs = await request(server)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${passenger.token}`);
    const types = notifs.body.data.map((n) => n.type);
    expect(types).toContain('request:accepted');
  });

  test('[US-7-N2] rejecting a request notifies the passenger', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'rejected');

    const notifs = await request(server)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${passenger.token}`);
    const types = notifs.body.data.map((n) => n.type);
    expect(types).toContain('request:rejected');
  });
});

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  US-4 — Cancel / complete a ride                                           ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('US-4 — Manage a Ride (Cancel / Complete)', () => {

  // ── Functional ──────────────────────────────────────────────────────────────
  test('[US-4-F1] driver can cancel their own ride — status becomes "cancelled"', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await request(server)
      .post(`/api/rides/${ride.id}/cancel`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });

  test('[US-4-F2] driver can complete their own ride — status becomes "completed"', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await request(server)
      .post(`/api/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
  });

  test('[US-4-F3] cancelled ride is removed from the open listing', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    await request(server)
      .post(`/api/rides/${ride.id}/cancel`)
      .set('Authorization', `Bearer ${driver.token}`);

    const list = await request(server).get('/api/rides');
    const openIds = list.body.data.map((r) => r.id);
    expect(openIds).not.toContain(ride.id);
  });

  test('[US-4-F4] completed ride is removed from the open listing', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    await request(server)
      .post(`/api/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    const list = await request(server).get('/api/rides');
    const openIds = list.body.data.map((r) => r.id);
    expect(openIds).not.toContain(ride.id);
  });

  test('[US-4-F5] cancelled ride appears in GET /api/rides/history', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    await request(server)
      .post(`/api/rides/${ride.id}/cancel`)
      .set('Authorization', `Bearer ${driver.token}`);

    const history = await request(server)
      .get('/api/rides/history')
      .set('Authorization', `Bearer ${driver.token}`);
    expect(history.status).toBe(200);
    const found = history.body.data.find((r) => r.id === ride.id);
    expect(found).toBeDefined();
    expect(found.status).toBe('cancelled');
  });

  test('[US-4-F6] completed ride appears in GET /api/rides/history', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    await request(server)
      .post(`/api/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    const history = await request(server)
      .get('/api/rides/history')
      .set('Authorization', `Bearer ${driver.token}`);
    const found = history.body.data.find((r) => r.id === ride.id);
    expect(found).toBeDefined();
    expect(found.status).toBe('completed');
  });

  test('[US-4-F7] history also shows passenger\'s completed/cancelled rides', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    await request(server)
      .post(`/api/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    const history = await request(server)
      .get('/api/rides/history')
      .set('Authorization', `Bearer ${passenger.token}`);
    const found = history.body.data.find((r) => r.id === ride.id);
    expect(found).toBeDefined();
    expect(found.status).toBe('completed');
  });

  test('[US-4-F8] open rides do NOT appear in history', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    const history = await request(server)
      .get('/api/rides/history')
      .set('Authorization', `Bearer ${driver.token}`);
    const openIds = history.body.data.map((r) => r.id);
    expect(openIds).not.toContain(ride.id);
  });

  // ── Security ─────────────────────────────────────────────────────────────────
  test('[US-4-S1] another user cannot cancel a ride — 403', async () => {
    const driver = await registerAndToken();
    const other = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await request(server)
      .post(`/api/rides/${ride.id}/cancel`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(res.status).toBe(403);
  });

  test('[US-4-S2] another user cannot complete a ride — 403', async () => {
    const driver = await registerAndToken();
    const other = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await request(server)
      .post(`/api/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(res.status).toBe(403);
  });

  test('[US-4-S3] unauthenticated cancel request is rejected — 401', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await request(server).post(`/api/rides/${ride.id}/cancel`);
    expect(res.status).toBe(401);
  });

  test('[US-4-S4] unauthenticated complete request is rejected — 401', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await request(server).post(`/api/rides/${ride.id}/complete`);
    expect(res.status).toBe(401);
  });

  // ── Edge Cases ───────────────────────────────────────────────────────────────
  test('[US-4-E1] cancelling a non-existent ride returns 404', async () => {
    const driver = await registerAndToken();
    const res = await request(server)
      .post('/api/rides/nonexistent-id/cancel')
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(404);
  });

  test('[US-4-E2] completing a non-existent ride returns 404', async () => {
    const driver = await registerAndToken();
    const res = await request(server)
      .post('/api/rides/nonexistent-id/complete')
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(404);
  });

  test('[US-4-E3] GET /api/rides/history requires authentication', async () => {
    const res = await request(server).get('/api/rides/history');
    expect(res.status).toBe(401);
  });
});

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  US-8 — Real-time messaging (REST layer)                                  ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('US-8 — Messaging', () => {

  // ── Functional ──────────────────────────────────────────────────────────────
  test('[US-8-F1] driver can send a message to an accepted passenger — 201', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const res = await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: ride.id, toUserId: passenger.user.id, body: 'I will be at the junction at 7:30' });
    expect(res.status).toBe(201);
    expect(res.body.data.body).toBe('I will be at the junction at 7:30');
    expect(res.body.data.fromUserId).toBe(driver.user.id);
    expect(res.body.data.toUserId).toBe(passenger.user.id);
  });

  test('[US-8-F2] accepted passenger can reply to the driver', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const res = await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id, toUserId: driver.user.id, body: 'Sounds good!' });
    expect(res.status).toBe(201);
    expect(res.body.data.fromUserId).toBe(passenger.user.id);
  });

  test('[US-8-F3] GET conversation returns messages in chronological order', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: ride.id, toUserId: passenger.user.id, body: 'First message' });

    await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id, toUserId: driver.user.id, body: 'Second message' });

    const res = await request(server)
      .get(`/api/messages/${ride.id}/${passenger.user.id}`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].body).toBe('First message');
    expect(res.body.data[1].body).toBe('Second message');
  });

  test('[US-8-F4] conversation is empty when no messages have been sent', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const res = await request(server)
      .get(`/api/messages/${ride.id}/${passenger.user.id}`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('[US-8-F5] sending a message creates a notification for the recipient', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: ride.id, toUserId: passenger.user.id, body: 'Meet you at 7:30' });

    const notifs = await request(server)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${passenger.token}`);
    const types = notifs.body.data.map((n) => n.type);
    expect(types).toContain('message:new');
  });

  // ── Security / Authorization ──────────────────────────────────────────────────
  test('[US-8-S1] unauthenticated POST /api/messages is rejected — 401', async () => {
    const res = await request(server)
      .post('/api/messages')
      .send({ rideId: 'abc', toUserId: 'xyz', body: 'hi' });
    expect(res.status).toBe(401);
  });

  test('[US-8-S2] a stranger cannot message participants of a ride they are not in', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const stranger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const res = await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${stranger.token}`)
      .send({ rideId: ride.id, toUserId: driver.user.id, body: 'Can I sneak in?' });
    expect(res.status).toBe(403);
  });

  test('[US-8-S3] conversation is scoped to the ride — messages from other rides are excluded', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride1 = await createRide(driver.token);
    const ride2 = await createRide(driver.token);

    const r1 = await requestSeat(passenger.token, ride1.id);
    const r2 = await requestSeat(passenger.token, ride2.id);
    await decideRequest(driver.token, r1.body.data.id, 'accepted');
    await decideRequest(driver.token, r2.body.data.id, 'accepted');

    // Message only on ride1
    await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: ride1.id, toUserId: passenger.user.id, body: 'Ride 1 message' });

    // Conversation for ride2 should be empty
    const res = await request(server)
      .get(`/api/messages/${ride2.id}/${passenger.user.id}`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  // ── Validation ───────────────────────────────────────────────────────────────
  test('[US-8-V1] empty message body is rejected — 400', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const res = await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: ride.id, toUserId: passenger.user.id, body: '' });
    expect(res.status).toBe(400);
  });

  test('[US-8-V2] rideId is required — 400', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const res = await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ toUserId: passenger.user.id, body: 'Hi' });
    expect(res.status).toBe(400);
  });

  test('[US-8-V3] toUserId is required — 400', async () => {
    const driver = await registerAndToken();
    const res = await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: 'some-id', body: 'Hi' });
    expect(res.status).toBe(400);
  });

  test('[US-8-V4] message body cannot exceed 1000 characters — 400', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);
    const req = await requestSeat(passenger.token, ride.id);
    await decideRequest(driver.token, req.body.data.id, 'accepted');

    const res = await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: ride.id, toUserId: passenger.user.id, body: 'x'.repeat(1001) });
    expect(res.status).toBe(400);
  });
});

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  Sprint 2 — End-to-End Coordination Flow                                  ║
// ╚════════════════════════════════════════════════════════════════════════════╝
describe('Sprint 2 — End-to-End Coordination Flow', () => {

  test('[S2-E2E] full journey: post ride → request seat → approve → message → complete → history', async () => {
    // 1. Driver posts a ride
    const driver = await registerAndToken({ name: 'Kasun Driver' });
    const passenger = await registerAndToken({ name: 'Nimali Passenger' });

    const ride = await createRide(driver.token, {
      origin: 'Maharagama', destination: 'ICBT Campus',
      seatsTotal: 2,
    });
    expect(ride.status).toBe('open');
    expect(ride.seatsAvailable).toBe(2);

    // 2. Passenger requests a seat
    const reqRes = await requestSeat(passenger.token, ride.id, 'Please let me join!');
    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.data.id;

    // 3. Driver checks incoming requests
    const incoming = await request(server)
      .get('/api/requests/incoming')
      .set('Authorization', `Bearer ${driver.token}`);
    expect(incoming.body.data.some((r) => r.id === requestId)).toBe(true);

    // 4. Driver approves the request
    const decision = await decideRequest(driver.token, requestId, 'accepted');
    expect(decision.status).toBe(200);
    expect(decision.body.data.status).toBe('accepted');

    // 5. Seat count decreases
    const rideDetail = await request(server).get(`/api/rides/${ride.id}`);
    expect(rideDetail.body.data.seatsAvailable).toBe(1);
    expect(rideDetail.body.data.status).toBe('open'); // still open (1 seat left)

    // 6. Passenger received a notification
    const passengerNotifs = await request(server)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${passenger.token}`);
    const types = passengerNotifs.body.data.map((n) => n.type);
    expect(types).toContain('request:accepted');

    // 7. Driver messages the passenger
    const msgRes = await request(server)
      .post('/api/messages')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: ride.id, toUserId: passenger.user.id, body: 'Be at junction at 7:30!' });
    expect(msgRes.status).toBe(201);

    // 8. Passenger reads the conversation
    const conv = await request(server)
      .get(`/api/messages/${ride.id}/${driver.user.id}`)
      .set('Authorization', `Bearer ${passenger.token}`);
    expect(conv.status).toBe(200);
    expect(conv.body.data[0].body).toBe('Be at junction at 7:30!');

    // 9. Driver completes the ride
    const complete = await request(server)
      .post(`/api/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(complete.status).toBe(200);
    expect(complete.body.data.status).toBe('completed');

    // 10. Both driver and passenger see it in history
    const driverHistory = await request(server)
      .get('/api/rides/history')
      .set('Authorization', `Bearer ${driver.token}`);
    expect(driverHistory.body.data.find((r) => r.id === ride.id)).toBeDefined();

    const passengerHistory = await request(server)
      .get('/api/rides/history')
      .set('Authorization', `Bearer ${passenger.token}`);
    expect(passengerHistory.body.data.find((r) => r.id === ride.id)).toBeDefined();
  });
});
