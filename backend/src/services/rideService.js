import { Rides, RideRequests, Users } from '../models/datastore.js';
import { ApiError } from '../utils/apiError.js';
import { matchRides } from '../utils/matching.js';

// Add driver and passenger names to ride responses.
const withDriver = async (ride) => {
  const driver = await Users().getById(ride.driverId);

  const passengerIds = ride.passengerIds || [];

  const passengers = await Promise.all(
    passengerIds.map((id) => Users().getById(id))
  );

  return {
    ...ride,

    // Driver information
    driverName: driver ? driver.name : 'Unknown',

    // Passenger information
    passengerNames: passengers
      .filter(Boolean)
      .map((passenger) => ({
        id: passenger.id,
        name: passenger.name,
      })),

    // Calculate remaining seats
    seatsAvailable: ride.seatsTotal - passengerIds.length,
  };
};

export async function createRide(driverId, data) {
  const ride = await Rides().create({
    ...data,
    driverId,
    passengerIds: [],
    status: 'open', // open | full | cancelled | completed
  });

  return withDriver(ride);
}

export async function listOpenRides() {
  const rides = await Rides().query((r) => r.status === 'open');

  return Promise.all(
    rides.sort(byDateTime).map(withDriver)
  );
}

export async function searchRides(search) {
  const rides = await Rides().query((r) => r.status === 'open');

  const matched = matchRides(rides, search);

  return Promise.all(
    matched.map(withDriver)
  );
}

export async function getRide(rideId) {
  const ride = await Rides().getById(rideId);

  if (!ride) {
    throw ApiError.notFound('Ride not found');
  }

  return withDriver(ride);
}

export async function getMyRides(userId) {
  const asDriver = await Rides().query(
    (r) => r.driverId === userId
  );

  const asPassenger = await Rides().query(
    (r) => (r.passengerIds || []).includes(userId)
  );

  const driving = await Promise.all(
    asDriver.sort(byDateTime).map(withDriver)
  );

  const riding = await Promise.all(
    asPassenger.sort(byDateTime).map(withDriver)
  );

  return {
    driving,
    riding,
  };
}

export async function getTripHistory(userId) {
  const all = await Rides().query(
    (r) =>
      (r.driverId === userId ||
        (r.passengerIds || []).includes(userId)) &&
      (r.status === 'completed' ||
        r.status === 'cancelled')
  );

  return Promise.all(
    all.sort(byDateTime).map(withDriver)
  );
}

export async function cancelRide(rideId, userId) {
  const ride = await Rides().getById(rideId);

  if (!ride) {
    throw ApiError.notFound('Ride not found');
  }

  if (ride.driverId !== userId) {
    throw ApiError.forbidden(
      'Only the driver can cancel this ride'
    );
  }

  const updated = await Rides().update(
    rideId,
    {
      status: 'cancelled',
    }
  );

  return withDriver(updated);
}

export async function completeRide(rideId, userId) {
  const ride = await Rides().getById(rideId);

  if (!ride) {
    throw ApiError.notFound('Ride not found');
  }

  if (ride.driverId !== userId) {
    throw ApiError.forbidden(
      'Only the driver can complete this ride'
    );
  }

  const updated = await Rides().update(
    rideId,
    {
      status: 'completed',
    }
  );

  return withDriver(updated);
}

// Internal: recompute status and seat state after passenger changes.
export async function applyPassenger(rideId, passengerId) {
  const ride = await Rides().getById(rideId);

  if (!ride) {
    throw ApiError.notFound('Ride not found');
  }

  const passengerIds = new Set(
    ride.passengerIds || []
  );

  if (passengerIds.has(passengerId)) {
    throw ApiError.conflict(
      'Already joined this ride'
    );
  }

  if (passengerIds.size >= ride.seatsTotal) {
    throw ApiError.conflict(
      'No seats available'
    );
  }

  passengerIds.add(passengerId);

  const nextStatus =
    passengerIds.size >= ride.seatsTotal
      ? 'full'
      : ride.status;

  return Rides().update(
    rideId,
    {
      passengerIds: [...passengerIds],
      status: nextStatus,
    }
  );
}

const byDateTime = (a, b) =>
  `${a.date}${a.timeStart}`.localeCompare(
    `${b.date}${b.timeStart}`
  );