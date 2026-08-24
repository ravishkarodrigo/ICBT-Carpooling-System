import request from 'supertest';
import { app, reset, sampleUser, sampleRide } from './helpers.js';

beforeEach(reset);

async function registerAndToken(over) {
  const res = await request(app).post('/api/auth/register').send(sampleUser(over));
  return { token: res.body.data.accessToken, user: res.body.data.user };
}

describe('Rides', () => {
  test('requires auth to create a ride', async () => {
    const res = await request(app).post('/api/rides').send(sampleRide());
    expect(res.status).toBe(401);
  });

  test('creates a ride and lists it as open', async () => {
    const { token } = await registerAndToken();
    const create = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleRide());
    expect(create.status).toBe(201);
    expect(create.body.data.seatsAvailable).toBe(3);

    const list = await request(app).get('/api/rides');
    expect(list.body.data).toHaveLength(1);
  });

  test('validates ride time window', async () => {
    const { token } = await registerAndToken();
    const res = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleRide({ timeStart: '09:00', timeEnd: '08:00' }));
    expect(res.status).toBe(400);
  });

  test('searches rides by origin and destination', async () => {
    const { token } = await registerAndToken();
    await request(app).post('/api/rides').set('Authorization', `Bearer ${token}`).send(sampleRide());
    const res = await request(app)
      .get('/api/rides/search')
      .query({ origin: 'nugegoda', destination: 'icbt' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].matchScore).toBeGreaterThan(0);
  });

  test('only the driver can cancel a ride', async () => {
    const driver = await registerAndToken();
    const other = await registerAndToken();
    const ride = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${driver.token}`)
      .send(sampleRide());

    const forbidden = await request(app)
      .post(`/api/rides/${ride.body.data.id}/cancel`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(403);

    const allowed = await request(app)
      .post(`/api/rides/${ride.body.data.id}/cancel`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(allowed.status).toBe(200);
    expect(allowed.body.data.status).toBe('cancelled');
  });
});
