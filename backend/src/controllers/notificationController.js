import { asyncHandler } from './asyncHandler.js';
import * as notificationService from '../services/notificationService.js';
import { ok } from '../utils/respond.js';

export const list = asyncHandler(async (req, res) => {
  ok(res, await notificationService.listNotifications(req.user.id));
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user.id);
  if (!notification) {
    const { ApiError } = await import('../utils/apiError.js');
    throw ApiError.notFound('Notification not found');
  }
  ok(res, notification);
});
