import { ApiError } from '../utils/apiError.js';
import { verifyToken } from '../utils/tokens.js';

// Requires a valid Bearer access token. Attaches req.user = { id, role, ... }.
export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized());
  }
  try {
    const payload = verifyToken(token);
    if (payload.type === 'refresh') return next(ApiError.unauthorized('Wrong token type'));
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

// Authorises based on role membership.
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(ApiError.forbidden());
  }
  next();
};
