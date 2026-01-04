import { Request, Response } from 'express';
import { fal } from "@fal-ai/client";
import { createJob, getJob, updateJob } from '../services/jobStore';

if (process.env.FAL_KEY) {
    fal.config({
        credentials: process.env.FAL_KEY
    });
}

// POST /api/makeup/process 
export const submitMakeup = async (req: Request, res: Response) => {
    try {
        const { image, prompt, style, intensity } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        if (!process.env.FAL_KEY || process.env.FAL_KEY.includes('YOUR_')) {
            console.warn("FAL_KEY is missing or placeholder.");
            return res.json({
                success: true,
                message: "Mock success (FAL_KEY missing)",
                mock: true,
                requestId: "mock-request-id"
            });
        }

        if (!process.env.WEBHOOK_URL) {
            return res.status(500).json({ error: 'WEBHOOK_URL not configured' });
        }

        const finalPrompt = prompt || `Portrait with ${style} makeup, ${intensity} intensity`;

        const { request_id } = await fal.queue.submit("fal-ai/nano-banana/edit", {
            input: {
                prompt: finalPrompt,
                image_urls: [image],
                num_images: 1,
                output_format: "png"
            },
            webhookUrl: process.env.WEBHOOK_URL
        });

        const job = await createJob(request_id, finalPrompt);
        if (!job) {
            console.error('Failed to create job in database');
            return res.status(500).json({ error: 'Failed to create job record' });
        }

        res.json({
            success: true,
            message: "Job submitted successfully",
            requestId: request_id
        });

    } catch (error) {
        console.error('Error submitting job:', error);
        res.status(500).json({ error: 'Failed to submit job', details: String(error) });
    }
};

// POST /api/makeup/webhook 
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const requestId = payload.request_id;

        if (!requestId) {
            console.error('Webhook missing request_id');
            return res.status(400).json({ error: 'Missing request_id' });
        }

        const job = await getJob(requestId);
        if (!job) {
            console.warn(`Webhook for unknown job: ${requestId}`);
            return res.status(200).json({ received: true });
        }

        // Check if job succeeded or failed
        if (payload.status === 'OK' && payload.payload) {
            const images = payload.payload.images;
            const resultUrl = images && images.length > 0 ? images[0].url : null;

            await updateJob(requestId, {
                status: 'COMPLETED',
                result_url: resultUrl,
                error: null
            });
        } else if (payload.error) {
            await updateJob(requestId, {
                status: 'FAILED',
                error: String(payload.error)
            });
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};
