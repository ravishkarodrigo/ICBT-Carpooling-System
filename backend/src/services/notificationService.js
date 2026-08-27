import { Notifications } from '../models/datastore.js';

/**
 * Create a notification for a user.
 * @param {string} userId - The recipient user's ID
 * @param {Object} payload - { type, rideId, message }
 */
export async function createNotification(userId, { type, rideId, message }) {
  return Notifications().create({
    userId,
    type,
    rideId,
    message,
    read: false,
  });
}

export async function listNotifications(userId) {
  const all = await Notifications().query((n) => n.userId === userId);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markRead(notificationId, userId) {
  const notification = await Notifications().getById(notificationId);
  if (!notification || notification.userId !== userId) return null;
  return Notifications().update(notificationId, { read: true });
}
