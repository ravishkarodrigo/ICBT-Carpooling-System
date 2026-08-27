import { describe, it, expect } from 'vitest';
import { matchRides } from '../../backend/src/utils/matching.js';

// The matching logic lives in the backend utility; we test it here to document
// the expected filtering behaviour from the client's perspective.
const ride = {
  id: '1', origin: 'Nugegoda', destination: 'ICBT Campus',
  date: '2026-09-01', timeStart: '07:30', timeEnd: '08:30',
};

describe('route + time-window matching', () => {
  it('includes a ride that matches origin and destination', () => {
    const results = matchRides([ride], { origin: 'nugegoda', destination: 'icbt' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('excludes rides with no overlap', () => {
    const results = matchRides([ride], { origin: 'kandy' });
    expect(results).toHaveLength(0);
  });

  it('ranks better matches first', () => {
    const other = { ...ride, id: '2', destination: 'Town Hall' };
    // ride matches both origin + destination, other only matches origin
    const results = matchRides([other, ride], { origin: 'nugegoda', destination: 'icbt' });
    expect(results[0].id).toBe('1');
  });
});
