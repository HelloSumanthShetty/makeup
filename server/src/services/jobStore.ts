
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('SUPABASE_URL or SUPABASE_SERVICE_KEY not set. Job store will not work.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');


export type JobStatus = 'PENDING' | 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface JobData {
    id?: string;
    request_id: string;
    status: JobStatus;
    result_url?: string | null;
    prompt?: string | null;
    error?: string | null;
    logs?: string[] | null;
    created_at?: string;
    updated_at?: string;
}

// Create a new job
export const createJob = async (requestId: string, prompt: string): Promise<JobData | null> => {
    const { data, error } = await supabase
        .from('jobs')
        .insert({
            request_id: requestId,
            status: 'PENDING',
            prompt: prompt
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating job:', error);
        return null;
    }

    return data;
};

// Get a job by request ID
export const getJob = async (requestId: string): Promise<JobData | null> => {
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('request_id', requestId)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { 
            console.error('Error getting job:', error);
        }
        return null;
    }

    return data;
};

// Update an existing job
export const updateJob = async (
    requestId: string,
    updates: Partial<Omit<JobData, 'id' | 'request_id' | 'created_at'>>
): Promise<JobData | null> => {
    const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('request_id', requestId)
        .select()
        .single();

    if (error) {
        console.error('Error updating job:', error);
        return null;
    }

    return data;
};

// Delete a job
export const deleteJob = async (requestId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('request_id', requestId);

    if (error) {
        console.error('Error deleting job:', error);
        return false;
    }

    return true;
};
