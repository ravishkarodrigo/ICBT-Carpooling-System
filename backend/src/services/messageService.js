import { Messages } from '../models/datastore.js';
import { ApiError } from '../utils/apiError.js';

export async function sendMessage(fromUserId, { rideId, toUserId, body }) {
  if (fromUserId === toUserId) {
    throw ApiError.badRequest('Cannot send a message to yourself');
  }
  return Messages().create({
    rideId,
    fromUserId,
    toUserId,
    body,
  });
}

export async function getConversation(rideId, userId, otherUserId) {
  const messages = await Messages().query(
    (m) =>
      m.rideId === rideId &&
      ((m.fromUserId === userId && m.toUserId === otherUserId) ||
        (m.fromUserId === otherUserId && m.toUserId === userId))
  );
  return messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
