import request from 'supertest';
import { app, reset, sampleUser, sampleRide } from './helpers.js';

beforeEach(reset);

async function registerAndToken(over) {
  const res = await request(app).post('/api/auth/register').send(sampleUser(over));
  return { token: res.body.data.accessToken, user: res.body.data.user };
}

async function createRide(token, over) {
  const res = await request(app)
    .post('/api/rides')
    .set('Authorization', `Bearer ${token}`)
    .send(sampleRide(over));
  return res.body.data;
}

describe('Auth — profile endpoints', () => {
  test('GET /api/auth/me returns the current user', async () => {
    const { token, user } = await registerAndToken();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user.email);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  test('GET /api/auth/me requires auth', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('PATCH /api/auth/me updates profile fields', async () => {
    const { token } = await registerAndToken();
    const res = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', homeArea: 'Colombo 03' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.homeArea).toBe('Colombo 03');
  });
});

describe('Rides — detail & history', () => {
  test('GET /api/rides/:id returns ride detail', async () => {
    const { token } = await registerAndToken();
    const ride = await createRide(token);
    const res = await request(app).get(`/api/rides/${ride.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(ride.id);
  });

  test('GET /api/rides/:id returns 404 for unknown ride', async () => {
    const res = await request(app).get('/api/rides/nonexistent-id');
    expect(res.status).toBe(404);
  });

  test('GET /api/rides/mine returns driving and riding lists', async () => {
    const { token } = await registerAndToken();
    await createRide(token);
    const res = await request(app)
      .get('/api/rides/mine')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.driving).toHaveLength(1);
    expect(res.body.data.riding).toHaveLength(0);
  });

  test('GET /api/rides/history returns completed/cancelled rides', async () => {
    const { token } = await registerAndToken();
    const ride = await createRide(token);
    // Cancel the ride so it appears in history
    await request(app)
      .post(`/api/rides/${ride.id}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .get('/api/rides/history')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('cancelled');
  });

  test('POST /api/rides/:id/complete — only driver can complete', async () => {
    const driver = await registerAndToken();
    const other = await registerAndToken();
    const ride = await createRide(driver.token);

    const forbidden = await request(app)
      .post(`/api/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(403);

    const ok = await request(app)
      .post(`/api/rides/${ride.id}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.status).toBe('completed');
  });
});
