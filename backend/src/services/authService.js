import { Users } from '../models/datastore.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken } from '../utils/tokens.js';
import { ApiError } from '../utils/apiError.js';

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone || '',
  homeArea: u.homeArea || '',
  createdAt: u.createdAt,
});

export async function register({ name, email, password, role }) {
  const existing = await Users().findOne((u) => u.email === email.toLowerCase());
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(password);
  const user = await Users().create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
  });

  return issueTokens(user);
}

export async function login({ email, password }) {
  const user = await Users().findOne((u) => u.email === email.toLowerCase());
  // Constant-ish message: never reveal whether the email exists.
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  return issueTokens(user);
}

export async function getProfile(userId) {
  const user = await Users().getById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return publicUser(user);
}

export async function updateProfile(userId, patch) {
  const updated = await Users().update(userId, patch);
  if (!updated) throw ApiError.notFound('User not found');
  return publicUser(updated);
}

function issueTokens(user) {
  const claims = { id: user.id, role: user.role, name: user.name };
  return {
    user: publicUser(user),
    accessToken: signAccessToken(claims),
    refreshToken: signRefreshToken(claims),
  };
}
