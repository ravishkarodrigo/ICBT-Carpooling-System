import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessTtl });

export const signRefreshToken = (payload) =>
  jwt.sign({ ...payload, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshTtl,
  });

export const verifyToken = (token) => jwt.verify(token, config.jwt.secret);
