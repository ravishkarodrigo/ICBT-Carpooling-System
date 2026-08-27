/**
 * Shared test helpers for backend integration tests.
 * 
 * Exports:
 *  - app      : The Express app (no server started)
 *  - reset    : Clears the datastore between tests
 *  - sampleUser  : Factory for valid user payloads
 *  - sampleRide  : Factory for valid ride payloads
 */
import { app } from '../src/app.js';
import { resetDatastore } from '../src/models/datastore.js';

export { app };

export async function reset() {
  await resetDatastore();
}

let userCounter = 0;

/**
 * Returns a valid user registration payload.
 * Pass overrides to customise individual fields.
 */
export function sampleUser(overrides = {}) {
  userCounter++;
  return {
    name: `Test User ${userCounter}`,
    email: `user${userCounter}@icbt.lk`,
    password: 'Colombo123',
    role: 'student',
    ...overrides,
  };
}

let rideCounter = 0;

/**
 * Returns a valid ride creation payload.
 * Pass overrides to customise individual fields.
 */
export function sampleRide(overrides = {}) {
  rideCounter++;
  // Always pick a future date to avoid validation issues
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return {
    origin: `Home Area ${rideCounter}`,
    destination: 'ICBT Campus, Colombo 03',
    date: `${yyyy}-${mm}-${dd}`,
    timeStart: '07:00',
    timeEnd: '08:00',
    seatsTotal: 3,
    notes: '',
    ...overrides,
  };
}
