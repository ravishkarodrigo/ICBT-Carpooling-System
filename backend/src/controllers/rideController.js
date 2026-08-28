import { asyncHandler } from './asyncHandler.js';
import * as rideService from '../services/rideService.js';
import { ok, created } from '../utils/respond.js';

export const create = asyncHandler(async (req, res) => {
  const ride = await rideService.createRide(req.user.id, req.body);
  created(res, ride);
});

export const list = asyncHandler(async (_req, res) => {
  ok(res, await rideService.listOpenRides());
});

export const search = asyncHandler(async (req, res) => {
  ok(res, await rideService.searchRides(req.query));
});

export const detail = asyncHandler(async (req, res) => {
  ok(res, await rideService.getRide(req.params.id));
});

export const mine = asyncHandler(async (req, res) => {
  ok(res, await rideService.getMyRides(req.user.id));
});

export const history = asyncHandler(async (req, res) => {
  ok(res, await rideService.getTripHistory(req.user.id));
});

export const cancel = asyncHandler(async (req, res) => {
  ok(res, await rideService.cancelRide(req.params.id, req.user.id));
});

export const complete = asyncHandler(async (req, res) => {
  ok(res, await rideService.completeRide(req.params.id, req.user.id));
});
