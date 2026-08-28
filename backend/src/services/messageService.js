import { Messages, Rides } from '../models/datastore.js';
import { ApiError } from '../utils/apiError.js';
import { createNotification } from './notificationService.js';

// A user may message about a ride only if THEY are the driver or an accepted
// passenger. Checking only the sender (fromUserId) prevents strangers from
// messaging participants of rides they are not part of.
async function assertCanMessage(ride, userId, otherUserId) {
  const parties = new Set([ride.driverId, ...(ride.passengerIds || [])]);
  if (!parties.has(userId)) {
    throw ApiError.forbidden('You are not part of this ride conversation');
  }
}

export async function sendMessage(fromUserId, { rideId, toUserId, body }) {
  const ride = await Rides().getById(rideId);
  if (!ride) throw ApiError.notFound('Ride not found');
  await assertCanMessage(ride, fromUserId, toUserId);

  const message = await Messages().create({ rideId, fromUserId, toUserId, body });
  await createNotification(toUserId, {
    type: 'message:new',
    rideId,
    message: 'You have a new message',
  });
  return message;
}

export async function getConversation(rideId, userId, otherUserId) {
  const all = await Messages().query(
    (m) =>
      m.rideId === rideId &&
      ((m.fromUserId === userId && m.toUserId === otherUserId) ||
        (m.fromUserId === otherUserId && m.toUserId === userId))
  );
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
