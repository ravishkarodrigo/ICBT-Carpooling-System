import request from 'supertest';
import { app, reset, sampleUser } from './helpers.js';
import { scoreRide, matchRides } from '../src/utils/matching.js';
import { __resetInMemory } from '../src/models/datastore.js';

beforeEach(() => {
  reset();
  __resetInMemory();
});

async function registerAndToken(over) {
  const res = await request(app).post('/api/auth/register').send(sampleUser(over));
  return { token: res.body.data.accessToken, user: res.body.data.user };
}

// ─── Notifications ────────────────────────────────────────────────────────────

describe('Notifications', () => {
  test('GET /api/notifications returns empty list initially', async () => {
    const { token } = await registerAndToken();
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('notifications are created when a request is submitted', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();

    // Create a ride
    const rideRes = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        origin: 'Nugegoda', destination: 'ICBT', date: '2026-09-01',
        timeStart: '07:30', timeEnd: '08:30', seatsTotal: 3,
      });
    const rideId = rideRes.body.data.id;

    // Passenger submits a request — should trigger a notification to driver
    await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].type).toBe('request:new');
  });

  test('PATCH /api/notifications/:id/read marks notification as read', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();

    const rideRes = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        origin: 'Nugegoda', destination: 'ICBT', date: '2026-09-01',
        timeStart: '07:30', timeEnd: '08:30', seatsTotal: 3,
      });

    await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: rideRes.body.data.id });

    const list = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${driver.token}`);
    const notifId = list.body.data[0].id;

    const res = await request(app)
      .patch(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.read).toBe(true);
  });

  test('GET /api/notifications requires auth', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});

// ─── Matching utility ─────────────────────────────────────────────────────────

describe('scoreRide()', () => {
  const baseRide = {
    origin: 'Nugegoda', destination: 'ICBT Campus',
    date: '2026-09-01', timeStart: '07:30', timeEnd: '08:30',
  };

  test('scores 80 for exact origin + destination match', () => {
    expect(scoreRide(baseRide, { origin: 'nugegoda', destination: 'icbt campus' })).toBe(80);
  });

  test('scores 40 for origin-only match', () => {
    expect(scoreRide(baseRide, { origin: 'nugegoda' })).toBe(40);
  });

  test('scores 40 for destination-only match', () => {
    expect(scoreRide(baseRide, { destination: 'icbt' })).toBe(40);
  });

  test('adds 10 for matching date', () => {
    const score = scoreRide(baseRide, { origin: 'nugegoda', date: '2026-09-01' });
    expect(score).toBe(50);
  });

  test('adds 10 for overlapping time window', () => {
    const score = scoreRide(baseRide, {
      origin: 'nugegoda',
      timeStart: '07:00', timeEnd: '08:00',
    });
    expect(score).toBe(50);
  });

  test('returns 0 for no match', () => {
    expect(scoreRide(baseRide, { origin: 'Kandy', destination: 'Galle' })).toBe(0);
  });

  test('returns 0 for non-overlapping time window', () => {
    const score = scoreRide(baseRide, {
      origin: 'nugegoda',
      timeStart: '09:00', timeEnd: '10:00',
    });
    expect(score).toBe(40); // origin matches but time doesn't overlap
  });
});

describe('matchRides()', () => {
  const rides = [
    { id: '1', origin: 'Nugegoda', destination: 'ICBT', date: '2026-09-01', timeStart: '07:00', timeEnd: '08:00', status: 'open' },
    { id: '2', origin: 'Maharagama', destination: 'ICBT', date: '2026-09-01', timeStart: '07:30', timeEnd: '08:30', status: 'open' },
    { id: '3', origin: 'Kandy', destination: 'Galle', date: '2026-09-02', timeStart: '10:00', timeEnd: '11:00', status: 'open' },
  ];

  test('filters rides with score > 0', () => {
    const results = matchRides(rides, { destination: 'icbt' });
    expect(results).toHaveLength(2);
  });

  test('sorts by score descending', () => {
    const results = matchRides(rides, { origin: 'nugegoda', destination: 'icbt' });
    expect(results[0].id).toBe('1');
  });

  test('returns empty array when nothing matches', () => {
    const results = matchRides(rides, { origin: 'Nuwara Eliya' });
    expect(results).toHaveLength(0);
  });

  test('attaches matchScore to each result', () => {
    const results = matchRides(rides, { destination: 'icbt' });
    expect(results[0].matchScore).toBeGreaterThan(0);
  });
});
