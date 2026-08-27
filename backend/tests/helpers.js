import { createApp } from '../src/app.js';
import { __resetInMemory } from '../src/models/datastore.js';

export const app = createApp();

export function reset() {
  __resetInMemory();
}

export const sampleUser = (over = {}) => ({
  name: 'Nimal Perera',
  email: `user${Math.random().toString(36).slice(2, 8)}@icbt.lk`,
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
