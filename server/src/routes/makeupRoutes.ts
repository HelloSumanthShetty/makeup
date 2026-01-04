import { Router } from 'express';
import { submitMakeup, handleWebhook } from '../controllers/makeupController';

const router = Router();

// Submit a new makeup processing job
router.post('/process', submitMakeup);

// Webhook endpoint - Fal.ai will POST results here
router.post('/webhook', handleWebhook);

export default router;
