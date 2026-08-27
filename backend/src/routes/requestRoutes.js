import { Router } from 'express';
import * as ctrl from '../controllers/requestController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { rideRequestSchema, requestDecisionSchema } from '../validation/schemas.js';

const router = Router();
router.use(requireAuth);
router.post('/', validate(rideRequestSchema), ctrl.create);
router.get('/incoming', ctrl.forDriver);
router.get('/outgoing', ctrl.forPassenger);
router.patch('/:id', validate(requestDecisionSchema), ctrl.decide);
export default router;
