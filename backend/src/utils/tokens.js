import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign({ ...payload, type: 'access' }, config.jwt.secret, {
    expiresIn: config.jwt.accessTtl,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign({ ...payload, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshTtl,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}
