import { asyncHandler } from './asyncHandler.js';
import * as messageService from '../services/messageService.js';
import { ok, created } from '../utils/respond.js';

export const getConversation = asyncHandler(async (req, res) => {
  const { rideId, otherUserId } = req.params;
  ok(res, await messageService.getConversation(rideId, req.user.id, otherUserId));
});

export const send = asyncHandler(async (req, res) => {
  created(res, await messageService.sendMessage(req.user.id, req.body));
});
