import { Router } from 'express';
import authRoutes from './authRoutes.js';
import rideRoutes from './rideRoutes.js';
import requestRoutes from './requestRoutes.js';
import messageRoutes from './messageRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();
router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
router.use('/auth', authRoutes);
router.use('/rides', rideRoutes);
router.use('/requests', requestRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
export default router;
