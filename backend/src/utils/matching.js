/**
 * Simple ride-matching utility.
 * Filters and scores rides based on search criteria.
 * All comparisons are case-insensitive partial matches.
 */

function normalize(str = '') {
  return str.toLowerCase().trim();
}

function matchesText(field = '', query = '') {
  if (!query) return true;
  return normalize(field).includes(normalize(query));
}

function matchesDate(rideDate = '', searchDate = '') {
  if (!searchDate) return true;
  return rideDate === searchDate;
}

function matchesTime(rideTime = '', searchTime = '') {
  if (!searchTime) return true;
  // Ride's timeStart must be within 60 minutes of the search time
  const [rH, rM] = rideTime.split(':').map(Number);
  const [sH, sM] = searchTime.split(':').map(Number);
  const rideMins = rH * 60 + rM;
  const searchMins = sH * 60 + sM;
  return Math.abs(rideMins - searchMins) <= 60;
}

/**
 * @param {Array} rides - Array of ride objects
 * @param {Object} search - Search criteria { origin, destination, date, timeStart }
 * @returns {Array} Filtered and sorted rides
 */
export function matchRides(rides, search = {}) {
  const { origin, destination, date, timeStart } = search;

  return rides.filter((ride) => {
    if (!matchesText(ride.origin, origin)) return false;
    if (!matchesText(ride.destination, destination)) return false;
    if (!matchesDate(ride.date, date)) return false;
    if (!matchesTime(ride.timeStart, timeStart)) return false;
    return true;
  });
}
