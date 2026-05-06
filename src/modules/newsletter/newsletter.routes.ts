import { Router } from 'express';
import { subscribeNewsletter, getAllSubscribers, unsubscribeNewsletter } from './newsletter.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public route
router.post('/subscribe', subscribeNewsletter);

// Admin only routes
router.get('/subscribers', authenticate, authorizeAdmin, getAllSubscribers);
router.post('/unsubscribe', authenticate, authorizeAdmin, unsubscribeNewsletter);

export default router;
