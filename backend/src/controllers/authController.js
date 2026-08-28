import { asyncHandler } from './asyncHandler.js';
import * as authService from '../services/authService.js';
import { ok, created } from '../utils/respond.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  created(res, result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  ok(res, result);
});

export const me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  ok(res, profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await authService.updateProfile(req.user.id, req.body);
  ok(res, profile);
});
