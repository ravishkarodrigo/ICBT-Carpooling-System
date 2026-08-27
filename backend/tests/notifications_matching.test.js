import request from 'supertest';
import { app, reset, sampleUser } from './helpers.js';
import { matchRides } from '../src/utils/matching.js';

beforeEach(async () => {
  await reset();
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

describe('matchRides()', () => {
  const rides = [
    { id: '1', origin: 'Nugegoda', destination: 'ICBT', date: '2026-09-01', timeStart: '07:00', timeEnd: '08:00', status: 'open' },
    { id: '2', origin: 'Maharagama', destination: 'ICBT', date: '2026-09-01', timeStart: '07:30', timeEnd: '08:30', status: 'open' },
    { id: '3', origin: 'Kandy', destination: 'Galle', date: '2026-09-02', timeStart: '10:00', timeEnd: '11:00', status: 'open' },
  ];

  test('filters by destination', () => {
    const results = matchRides(rides, { destination: 'icbt' });
    expect(results).toHaveLength(2);
  });

  test('filters by origin and destination', () => {
    const results = matchRides(rides, { origin: 'nugegoda', destination: 'icbt' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  test('returns empty array when nothing matches', () => {
    const results = matchRides(rides, { origin: 'Nuwara Eliya' });
    expect(results).toHaveLength(0);
  });

  test('returns all rides when no search criteria given', () => {
    const results = matchRides(rides, {});
    expect(results).toHaveLength(3);
  });

  test('filters by date', () => {
    const results = matchRides(rides, { date: '2026-09-01' });
    expect(results).toHaveLength(2);
  });
});
