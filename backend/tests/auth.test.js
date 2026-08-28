import request from 'supertest';
import { server, app, reset, sampleUser } from './helpers.js';

beforeEach(reset);

describe('Authentication', () => {
  test('registers a new user and returns tokens', async () => {
    const res = await request(server).post('/api/auth/register').send(sampleUser());
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test('rejects weak passwords', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send(sampleUser({ password: 'weak' }));
    expect(res.status).toBe(400);
    expect(res.body.error.details.some((d) => d.field === 'password')).toBe(true);
  });

  test('prevents duplicate email registration', async () => {
    const user = sampleUser();
    await request(server).post('/api/auth/register').send(user);
    const res = await request(server).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  test('logs in with correct credentials', async () => {
    const user = sampleUser();
    await request(server).post('/api/auth/register').send(user);
    const res = await request(server)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('does not reveal whether an email exists on bad login', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ email: 'nobody@icbt.lk', password: 'whatever1' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid email or password');
  });
});
