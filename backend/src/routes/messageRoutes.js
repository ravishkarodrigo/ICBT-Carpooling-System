import { Router } from 'express';
import * as ctrl from '../controllers/messageController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { messageSchema } from '../validation/schemas.js';

const router = Router();
router.use(requireAuth);
router.get('/:rideId/:otherUserId', ctrl.getConversation);
router.post('/', validate(messageSchema), ctrl.send);
export default router;
