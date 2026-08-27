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

describe('Ride Requests', () => {
  test('requires auth to submit a request', async () => {
    const res = await request(app)
      .post('/api/requests')
      .send({ rideId: 'some-id', message: 'Please' });
    expect(res.status).toBe(401);
  });

  test('passenger can request to join a ride', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id, message: 'Hi' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.rideId).toBe(ride.id);
  });

  test('driver cannot join their own ride', async () => {
    const driver = await registerAndToken();
    const ride = await createRide(driver.token);

    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: ride.id });
    expect(res.status).toBe(400);
  });

  test('prevents duplicate pending requests', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id });

    const dup = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id });
    expect(dup.status).toBe(409);
  });

  test('driver can see incoming requests', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id });

    const res = await request(app)
      .get('/api/requests/driver')
      .set('Authorization', `Bearer ${driver.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('passenger can see their own requests', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id });

    const res = await request(app)
      .get('/api/requests/passenger')
      .set('Authorization', `Bearer ${passenger.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('driver can accept a request and passenger is added to ride', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id });

    const decide = await request(app)
      .patch(`/api/requests/${reqRes.body.data.id}/decide`)
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ decision: 'accepted' });
    expect(decide.status).toBe(200);
    expect(decide.body.data.status).toBe('accepted');
  });

  test('driver can reject a request', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await createRide(driver.token);

    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id });

    const decide = await request(app)
      .patch(`/api/requests/${reqRes.body.data.id}/decide`)
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ decision: 'rejected' });
    expect(decide.status).toBe(200);
    expect(decide.body.data.status).toBe('rejected');
  });

  test('non-driver cannot decide a request', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const otherUser = await registerAndToken();
    const ride = await createRide(driver.token);

    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id });

    const res = await request(app)
      .patch(`/api/requests/${reqRes.body.data.id}/decide`)
      .set('Authorization', `Bearer ${otherUser.token}`)
      .send({ decision: 'accepted' });
    expect(res.status).toBe(403);
  });

  test('ride becomes full when all seats are accepted', async () => {
    const driver = await registerAndToken();
    const p1 = await registerAndToken();
    const p2 = await registerAndToken();
    // Create ride with 1 seat
    const ride = await createRide(driver.token, { seatsTotal: 1 });

    const r1 = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${p1.token}`)
      .send({ rideId: ride.id });

    // Accept p1 — fills the seat
    await request(app)
      .patch(`/api/requests/${r1.body.data.id}/decide`)
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ decision: 'accepted' });

    // p2 tries to join a now-closed ride
    const r2 = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${p2.token}`)
      .send({ rideId: ride.id });
    expect(r2.status).toBe(409);
  });
});
