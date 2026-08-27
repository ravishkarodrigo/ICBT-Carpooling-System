import { Messages } from '../models/datastore.js';

export async function sendMessage(senderId, { rideId, toUserId, body }) {
  return Messages().create({ senderId, rideId, toUserId, body, sentAt: new Date().toISOString() });
}

export async function getConversation(userId, rideId, otherUserId) {
  const all = await Messages().query(
    (m) =>
      m.rideId === rideId &&
      ((m.senderId === userId && m.toUserId === otherUserId) ||
        (m.senderId === otherUserId && m.toUserId === userId))
  );
  return all.sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}
