import http from 'http';
import { createApp } from '../src/app.js';
import { __resetInMemory } from '../src/models/datastore.js';

export const app = createApp();
export const server = http.createServer(app);

// Start server on an ephemeral port before tests
beforeAll((done) => {
  server.listen(0, '127.0.0.1', done);
});

// Clean up server after tests
afterAll((done) => {
  server.close(done);
});

export function reset() {
  __resetInMemory();
}

let userCounter = 0;
export const sampleUser = (over = {}) => ({
  name: 'Nimal Perera',
  email: `user${++userCounter}@icbt.lk`,
  password: 'Colombo123',
  role: 'student',
  ...over,
});

export const sampleRide = (over = {}) => ({
  origin: 'Nugegoda',
  destination: 'ICBT Campus',
  date: '2026-09-01',
  timeStart: '07:30',
  timeEnd: '08:30',
  seatsTotal: 3,
  notes: 'Leaving from the junction',
  ...over,
});
