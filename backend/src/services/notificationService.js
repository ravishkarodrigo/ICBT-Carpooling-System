import { Notifications } from '../models/datastore.js';

export async function createNotification(userId, { type, rideId, message }) {
  return Notifications().create({ userId, type, rideId: rideId || null, message, read: false });
}

export async function listNotifications(userId) {
  const items = await Notifications().query((n) => n.userId === userId);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markRead(notificationId, userId) {
  const n = await Notifications().getById(notificationId);
  if (!n || n.userId !== userId) return null;
  return Notifications().update(notificationId, { read: true });
}
