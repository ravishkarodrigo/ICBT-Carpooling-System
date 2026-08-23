import bcrypt from 'bcryptjs';

// Passwords are never stored in plain text. bcrypt with a per-password salt.
const ROUNDS = 10;

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);
