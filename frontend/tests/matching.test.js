import { describe, it, expect } from 'vitest';
import { matchRides, scoreRide } from '../../backend/src/utils/matching.js';

// The matching logic is shared conceptually with the backend; we test the
// pure function here to document the client-facing ranking behaviour.
const ride = {
  id: '1', origin: 'Nugegoda', destination: 'ICBT Campus',
  date: '2026-09-01', timeStart: '07:30', timeEnd: '08:30',
};

describe('route + time-window matching', () => {
  it('scores an exact origin/destination match highly', () => {
    expect(scoreRide(ride, { origin: 'nugegoda', destination: 'icbt' })).toBeGreaterThanOrEqual(80);
  });

  it('excludes rides with no overlap', () => {
    const results = matchRides([ride], { origin: 'kandy' });
    expect(results).toHaveLength(0);
  });

  it('ranks better matches first', () => {
    const other = { ...ride, id: '2', destination: 'Town Hall' };
    const results = matchRides([other, ride], { origin: 'nugegoda', destination: 'icbt' });
    expect(results[0].id).toBe('1');
  });
});
