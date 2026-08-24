import { Router } from 'express';
import * as ctrl from '../controllers/rideController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { createRideSchema, searchRideSchema } from '../validation/schemas.js';

const router = Router();
router.get('/', ctrl.list);
router.get('/search', validate(searchRideSchema, 'query'), ctrl.search);
router.get('/mine', requireAuth, ctrl.mine);
router.get('/history', requireAuth, ctrl.history);
router.get('/:id', ctrl.detail);
router.post('/', requireAuth, validate(createRideSchema), ctrl.create);
router.post('/:id/cancel', requireAuth, ctrl.cancel);
router.post('/:id/complete', requireAuth, ctrl.complete);
export default router;
