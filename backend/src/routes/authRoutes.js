import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema, profileUpdateSchema } from '../validation/schemas.js';

const router = Router();
router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.get('/me', requireAuth, ctrl.me);
router.patch('/me', requireAuth, validate(profileUpdateSchema), ctrl.updateProfile);
export default router;
