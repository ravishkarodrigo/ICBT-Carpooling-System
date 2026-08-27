/**
 * Basic route + time-window matching. This intentionally is NOT a full
 * route-optimisation algorithm (per the brief). It scores a candidate ride
 * against a search by comparing origin/destination text and time overlap.
 */

const normalise = (s = '') => s.trim().toLowerCase();

// Overlap of two "HH:MM" time windows on the same date, in minutes.
function windowOverlapMinutes(aStart, aEnd, bStart, bEnd) {
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const start = Math.max(toMin(aStart), toMin(bStart));
  const end = Math.min(toMin(aEnd), toMin(bEnd));
  return Math.max(0, end - start);
}

export function scoreRide(ride, search) {
  let score = 0;

  if (search.origin && normalise(ride.origin).includes(normalise(search.origin))) score += 40;
  if (search.destination && normalise(ride.destination).includes(normalise(search.destination))) score += 40;

  if (search.date && ride.date === search.date) score += 10;

  if (search.timeStart && search.timeEnd && ride.timeStart && ride.timeEnd) {
    const overlap = windowOverlapMinutes(
      ride.timeStart, ride.timeEnd, search.timeStart, search.timeEnd
    );
    if (overlap > 0) score += 10;
  }

  return score;
}

export function matchRides(rides, search) {
  return rides
    .map((ride) => ({ ride, score: scoreRide(ride, search) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => ({ ...r.ride, matchScore: r.score }));
}
