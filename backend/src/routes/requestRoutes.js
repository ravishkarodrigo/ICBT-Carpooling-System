import { Router } from 'express';
import { asyncHandler } from '../controllers/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as requestService from '../services/requestService.js';
import { ok, created } from '../utils/respond.js';

const router = Router();

// POST /api/requests — passenger submits a request to join a ride
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const request = await requestService.createRequest(req.user.id, req.body);
  created(res, request);
}));

// GET /api/requests/driver — driver sees all requests for their rides
router.get('/driver', requireAuth, asyncHandler(async (req, res) => {
  ok(res, await requestService.listRequestsForDriver(req.user.id));
}));

// GET /api/requests/passenger — passenger sees their own requests
router.get('/passenger', requireAuth, asyncHandler(async (req, res) => {
  ok(res, await requestService.listRequestsForPassenger(req.user.id));
}));

// PATCH /api/requests/:id/decide — driver accepts or rejects a request
router.patch('/:id/decide', requireAuth, asyncHandler(async (req, res) => {
  const { decision } = req.body; // 'accepted' | 'rejected'
  ok(res, await requestService.decideRequest(req.params.id, req.user.id, decision));
}));

export default router;
