import { Router } from 'express';
import { submitMakeup, getMakeupStatus, handleWebhook } from '../controllers/makeupController';

const router = Router();

// Submit a new makeup processing job
router.post('/process', submitMakeup);

// Webhook endpoint - Fal.ai will POST results here
router.post('/webhook', handleWebhook);

// Check status of a job
router.get('/status/:requestId', getMakeupStatus);

export default router;
