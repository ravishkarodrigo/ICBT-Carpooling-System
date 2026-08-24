import { asyncHandler } from './asyncHandler.js';
import * as requestService from '../services/requestService.js';
import { ok, created } from '../utils/respond.js';

export const create = asyncHandler(async (req, res) => {
  created(res, await requestService.createRequest(req.user.id, req.body));
});

export const forDriver = asyncHandler(async (req, res) => {
  ok(res, await requestService.listRequestsForDriver(req.user.id));
});

export const forPassenger = asyncHandler(async (req, res) => {
  ok(res, await requestService.listRequestsForPassenger(req.user.id));
});

export const decide = asyncHandler(async (req, res) => {
  ok(res, await requestService.decideRequest(req.params.id, req.user.id, req.body.decision));
});
