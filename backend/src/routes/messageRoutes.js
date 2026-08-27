import { Router } from 'express';
import * as ctrl from '../controllers/messageController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { messageSchema } from '../validation/schemas.js';

const router = Router();
router.use(requireAuth);
router.post('/', validate(messageSchema), ctrl.send);
router.get('/:rideId/:otherUserId', ctrl.conversation);
export default router;
