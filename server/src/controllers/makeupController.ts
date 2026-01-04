import { Request, Response } from 'express';
import { fal } from "@fal-ai/client";
import { createJob, getJob, updateJob, JobStatus } from '../services/jobStore';

// Configure Fal.ai credentials from environment
if (process.env.FAL_KEY) {
    fal.config({
        credentials: process.env.FAL_KEY
    });
}

// POST /api/makeup/process - Submit a new job
export const submitMakeup = async (req: Request, res: Response) => {
    try {
        const { image, prompt, style, intensity } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        // Check for API key
        if (!process.env.FAL_KEY || process.env.FAL_KEY.includes('YOUR_')) {
            console.warn("FAL_KEY is missing or placeholder.");
            return res.json({
                success: true,
                message: "Mock success (FAL_KEY missing)",
                mock: true,
                requestId: "mock-request-id"
            });
        }

        const finalPrompt = prompt || `Portrait with ${style} makeup, ${intensity} intensity`;

        // Read webhook URL directly from env (undefined = polling fallback)
        const webhookUrl = process.env.WEBHOOK_URL;

        // Submit to Fal.ai Queue
        const { request_id } = await fal.queue.submit("fal-ai/nano-banana/edit", {
            input: {
                prompt: finalPrompt,
                image_urls: [image],
                num_images: 1,
                output_format: "png"
            },
            webhookUrl
        });

        // Store job in Supabase
        const job = await createJob(request_id, finalPrompt);
        if (!job) {
            console.error('Failed to create job in database');
            return res.status(500).json({ error: 'Failed to create job record' });
        }

        res.json({
            success: true,
            message: "Job submitted successfully",
            requestId: request_id,
            webhookEnabled: !!webhookUrl
        });

    } catch (error) {
        console.error('Error submitting job:', error);
        res.status(500).json({ error: 'Failed to submit job', details: String(error) });
    }
};

// POST /api/makeup/webhook - Receive webhook callback from Fal.ai
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
            // Still acknowledge - might be from a previous server instance
            return res.status(200).json({ received: true });
        }

        // Check if job succeeded or failed
        if (payload.status === 'OK' && payload.payload) {
            // Success - extract result
            const images = payload.payload.images;
            const resultUrl = images && images.length > 0 ? images[0].url : null;

            await updateJob(requestId, {
                status: 'COMPLETED',
                result_url: resultUrl,
                logs: payload.logs || null,
                error: null
            });
        } else if (payload.error) {
            // Failed - store error details
            await updateJob(requestId, {
                status: 'FAILED',
                error: String(payload.error),
                logs: payload.logs || null
            });
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// GET /api/makeup/status/:requestId - Check job status
export const getMakeupStatus = async (req: Request, res: Response) => {
    try {
        const { requestId } = req.params;

        if (!requestId) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        // Handle mock request
        if (requestId === "mock-request-id") {
            return res.json({
                status: "COMPLETED",
                resultUrl: null
            });
        }

        // Check our database first
        const job = await getJob(requestId);

        if (job) {
            // If completed or failed, return from database
            if (job.status === 'COMPLETED' || job.status === 'FAILED') {
                return res.json({
                    status: job.status,
                    resultUrl: job.result_url,
                    error: job.error
                });
            }
        }

        // If not completed yet, poll Fal.ai directly (fallback for non-webhook mode)
        try {
            const falStatus: { status: string; logs?: Array<{ message: string }> } = await fal.queue.status("fal-ai/nano-banana/edit", {
                requestId: requestId,
                logs: true
            });

            // Map Fal.ai status to our status type
            const mappedStatus: JobStatus = falStatus.status as JobStatus;
            const logMessages = falStatus.logs?.map((l) => l.message) || null;

            // Update our database
            if (job) {
                await updateJob(requestId, {
                    status: mappedStatus,
                    logs: logMessages
                });
            }

            // If completed at Fal, fetch result
            if (falStatus.status === "COMPLETED") {
                const result: { data?: { images?: Array<{ url: string }> } } = await fal.queue.result("fal-ai/nano-banana/edit", {
                    requestId: requestId
                });

                const resultUrl = result.data?.images?.[0]?.url || null;

                if (job) {
                    await updateJob(requestId, {
                        status: 'COMPLETED',
                        result_url: resultUrl,
                        error: null
                    });
                }

                return res.json({
                    status: "COMPLETED",
                    resultUrl: resultUrl
                });
            }

            // Return current status
            return res.json({
                status: falStatus.status,
                logs: logMessages
            });

        } catch (falError) {
            console.error('Error fetching status from Fal.ai:', falError);

            // Store error in database
            if (job) {
                await updateJob(requestId, {
                    error: String(falError)
                });
            }

            // Return what we have in database
            if (job) {
                return res.json({
                    status: job.status,
                    error: 'Could not fetch latest status'
                });
            }
            throw falError;
        }

    } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({ error: 'Failed to check status', details: String(error) });
    }
};
