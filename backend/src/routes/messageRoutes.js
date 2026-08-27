import { Router } from 'express';
import { asyncHandler } from '../controllers/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { Messages } from '../models/datastore.js';
import { ok, created } from '../utils/respond.js';

const router = Router();

// GET /api/messages/:rideId — fetch all messages for a ride
router.get('/:rideId', requireAuth, asyncHandler(async (req, res) => {
  const messages = await Messages().query((m) => m.rideId === req.params.rideId);
  ok(res, messages);
}));

// POST /api/messages — send a message in a ride chat
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { rideId, text } = req.body;
  const message = await Messages().create({
    rideId,
    senderId: req.user.id,
    text,
    sentAt: new Date().toISOString(),
  });
  created(res, message);
}));

export default router;
