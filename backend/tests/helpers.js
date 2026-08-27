import { app } from '../src/app.js';
import { __resetInMemory } from '../src/models/datastore.js';

export { app };

export async function reset() {
  __resetInMemory();
}

let userCounter = 0;

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

export function sampleRide(overrides = {}) {
  rideCounter++;
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
