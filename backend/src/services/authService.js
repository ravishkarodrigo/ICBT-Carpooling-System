import { Users } from '../models/datastore.js';
import { ApiError } from '../utils/apiError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken } from '../utils/tokens.js';

export async function register({ name, email, password, role }) {
  const existing = await Users().findOne((u) => u.email === email);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const hashed = await hashPassword(password);
  const user = await Users().create({ name, email, password: hashed, role });

  const { password: _, ...safe } = user;
  return {
    user: safe,
    accessToken: signAccessToken({ id: user.id, role: user.role }),
    refreshToken: signRefreshToken({ id: user.id, role: user.role }),
  };
}

export async function login({ email, password }) {
  const user = await Users().findOne((u) => u.email === email);
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const ok = await verifyPassword(password, user.password);
  if (!ok) throw ApiError.unauthorized('Invalid email or password');

  const { password: _, ...safe } = user;
  return {
    user: safe,
    accessToken: signAccessToken({ id: user.id, role: user.role }),
    refreshToken: signRefreshToken({ id: user.id, role: user.role }),
  };
}

export async function getProfile(userId) {
  const user = await Users().getById(userId);
  if (!user) throw ApiError.notFound('User not found');
  const { password: _, ...safe } = user;
  return safe;
}

export async function updateProfile(userId, patch) {
  const allowed = ['name', 'phone', 'homeArea'];
  const update = Object.fromEntries(
    Object.entries(patch).filter(([k]) => allowed.includes(k))
  );
  const updated = await Users().update(userId, update);
  if (!updated) throw ApiError.notFound('User not found');
  const { password: _, ...safe } = updated;
  return safe;
}
