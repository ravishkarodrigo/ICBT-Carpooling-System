import request from 'supertest';
import { server, app, reset, sampleUser, sampleRide } from './helpers.js';

beforeEach(reset);

async function registerAndToken(over) {
  const res = await request(server).post('/api/auth/register').send(sampleUser(over));
  return { token: res.body.data.accessToken, user: res.body.data.user };
}

async function makeRide(token, over) {
  const res = await request(server)
    .post('/api/rides')
    .set('Authorization', `Bearer ${token}`)
    .send(sampleRide(over));
  return res.body.data;
}

describe('Ride requests and seat management', () => {
  test('passenger can request, driver accepts, seat count drops', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const ride = await makeRide(driver.token, { seatsTotal: 1 });

    const reqRes = await request(server)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id, message: 'Can I join?' });
    expect(reqRes.status).toBe(201);

    const decide = await request(server)
      .patch(`/api/requests/${reqRes.body.data.id}`)
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ decision: 'accepted' });
    expect(decide.status).toBe(200);

    const detail = await request(server).get(`/api/rides/${ride.id}`);
    expect(detail.body.data.seatsAvailable).toBe(0);
    expect(detail.body.data.status).toBe('full');
  });

  test('a non-driver cannot decide a request (authorization)', async () => {
    const driver = await registerAndToken();
    const passenger = await registerAndToken();
    const stranger = await registerAndToken();
    const ride = await makeRide(driver.token);

    const reqRes = await request(server)
      .post('/api/requests')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ rideId: ride.id });

    const res = await request(server)
      .patch(`/api/requests/${reqRes.body.data.id}`)
      .set('Authorization', `Bearer ${stranger.token}`)
      .send({ decision: 'accepted' });
    expect(res.status).toBe(403);
  });

  test('driver cannot request their own ride', async () => {
    const driver = await registerAndToken();
    const ride = await makeRide(driver.token);
    const res = await request(server)
      .post('/api/requests')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ rideId: ride.id });
    expect(res.status).toBe(400);
  });

  test('cannot double-book a full ride', async () => {
    const driver = await registerAndToken();
    const p1 = await registerAndToken();
    const p2 = await registerAndToken();
    const ride = await makeRide(driver.token, { seatsTotal: 1 });

    const r1 = await request(server).post('/api/requests').set('Authorization', `Bearer ${p1.token}`).send({ rideId: ride.id });
    const r2 = await request(server).post('/api/requests').set('Authorization', `Bearer ${p2.token}`).send({ rideId: ride.id });
    await request(server).patch(`/api/requests/${r1.body.data.id}`).set('Authorization', `Bearer ${driver.token}`).send({ decision: 'accepted' });

    // Ride is now full; second acceptance should fail.
    const second = await request(server)
      .patch(`/api/requests/${r2.body.data.id}`)
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ decision: 'accepted' });
    expect([409, 404]).toContain(second.status);
  });
});
