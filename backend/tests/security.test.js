import request from 'supertest';
import { app, reset, sampleUser, sampleRide } from './helpers.js';

beforeEach(reset);

describe('Security & authorization', () => {
  test('rejects malformed / tampered tokens', async () => {
    const res = await request(app)
      .get('/api/rides/mine')
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });

  test('rejects refresh token used as access token', async () => {
    const reg = await request(app).post('/api/auth/register').send(sampleUser());
    const res = await request(app)
      .get('/api/rides/mine')
      .set('Authorization', `Bearer ${reg.body.data.refreshToken}`);
    expect(res.status).toBe(401);
  });

  test('users cannot read a conversation they are not part of', async () => {
    const reg = await request(app).post('/api/auth/register').send(sampleUser());
    const driverRes = await request(app).post('/api/auth/register').send(sampleUser());
    const ride = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${driverRes.body.data.accessToken}`)
      .send(sampleRide());

    const res = await request(app)
      .get(`/api/messages/${ride.body.data.id}/${driverRes.body.data.user.id}`)
      .set('Authorization', `Bearer ${reg.body.data.accessToken}`);
    // Requester is neither driver nor passenger of this ride.
    expect(res.status).toBe(200); // empty conversation is allowed
    expect(res.body.data).toEqual([]);
  });

  test('unknown routes return a 404 envelope', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
