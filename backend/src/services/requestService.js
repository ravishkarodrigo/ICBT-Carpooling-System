import { RideRequests, Rides } from '../models/datastore.js';
import { ApiError } from '../utils/apiError.js';
import { applyPassenger } from './rideService.js';
import { createNotification } from './notificationService.js';

export async function createRequest(passengerId, { rideId, message }) {
  const ride = await Rides().getById(rideId);
  if (!ride) throw ApiError.notFound('Ride not found');
  if (ride.driverId === passengerId) throw ApiError.badRequest('You cannot join your own ride');
  if (ride.status !== 'open') throw ApiError.conflict('This ride is not accepting requests');

  const dup = await RideRequests().findOne(
    (r) => r.rideId === rideId && r.passengerId === passengerId && r.status === 'pending'
  );
  if (dup) throw ApiError.conflict('You already have a pending request for this ride');

  const request = await RideRequests().create({
    rideId,
    passengerId,
    driverId: ride.driverId,
    message: message || '',
    status: 'pending', // pending | accepted | rejected | cancelled
  });

  await createNotification(ride.driverId, {
    type: 'request:new',
    rideId,
    message: 'You have a new ride request',
  });

  return request;
}

export async function listRequestsForDriver(driverId) {
  return RideRequests().query((r) => r.driverId === driverId);
}

export async function listRequestsForPassenger(passengerId) {
  return RideRequests().query((r) => r.passengerId === passengerId);
}

export async function decideRequest(requestId, driverId, decision) {
  const request = await RideRequests().getById(requestId);
  if (!request) throw ApiError.notFound('Request not found');
  if (request.driverId !== driverId) {
    throw ApiError.forbidden('Only the ride driver can decide this request');
  }
  if (request.status !== 'pending') {
    throw ApiError.conflict(`Request is already ${request.status}`);
  }

  if (decision === 'accepted') {
    // Seat allocation is enforced here; may throw if the ride became full.
    await applyPassenger(request.rideId, request.passengerId);
  }

  const updated = await RideRequests().update(requestId, { status: decision });

  await createNotification(request.passengerId, {
    type: `request:${decision}`,
    rideId: request.rideId,
    message: `Your ride request was ${decision}`,
  });

  return updated;
}
