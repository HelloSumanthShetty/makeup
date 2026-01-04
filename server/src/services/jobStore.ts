// In-memory job store for tracking async Fal.ai jobs
// For production, replace with Redis or a database

interface JobData {
    requestId: string;
    status: 'PENDING' | 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    resultUrl?: string;
    prompt?: string;
    createdAt: Date;
    updatedAt: Date;
    logs?: string[];
    error?: string;
}

const jobs: Map<string, JobData> = new Map();

export const createJob = (requestId: string, prompt: string): JobData => {
    const job: JobData = {
        requestId,
        status: 'PENDING',
        prompt,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    jobs.set(requestId, job);
    return job;
};

export const getJob = (requestId: string): JobData | undefined => {
    return jobs.get(requestId);
};

export const updateJob = (requestId: string, updates: Partial<JobData>): JobData | undefined => {
    const job = jobs.get(requestId);
    if (job) {
        const updatedJob = { ...job, ...updates, updatedAt: new Date() };
        jobs.set(requestId, updatedJob);
        return updatedJob;
    }
    return undefined;
};

export const deleteJob = (requestId: string): boolean => {
    return jobs.delete(requestId);
};

// Cleanup old jobs (older than 1 hour) - call periodically
export const cleanupOldJobs = (): void => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [id, job] of jobs.entries()) {
        if (job.createdAt < oneHourAgo) {
            jobs.delete(id);
        }
    }
};
