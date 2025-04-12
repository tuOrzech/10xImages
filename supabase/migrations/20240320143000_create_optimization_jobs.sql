-- Migration: Create optimization_jobs table with indexes, triggers and RLS policies
-- Description: Initial schema for storing image optimization jobs
-- Author: AltImageOptimizer Team
-- Date: 2024-03-20

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create optimization job status enum
create type optimization_job_status as enum (
    'pending',
    'processing',
    'completed',
    'failed'
);

-- Create the optimization_jobs table
create table optimization_jobs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    original_filename text not null,
    user_context_subject text,
    user_context_keywords text[],
    generated_alt_text text,
    generated_filename_suggestion text,
    ai_request_id text,
    ai_detected_keywords text[],
    status optimization_job_status not null default 'pending',
    error_message text
);

-- Create indexes for better query performance
-- Index for user_id since it's used in RLS policies
create index idx_optimization_jobs_user_id on optimization_jobs using btree (user_id);
-- Index for created_at for sorting
create index idx_optimization_jobs_created_at on optimization_jobs using btree (created_at desc);
-- Index for status for filtering
create index idx_optimization_jobs_status on optimization_jobs using btree (status);

-- Create trigger function for updating updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for automatic updated_at updates
create trigger update_optimization_job_updated_at
    before update on optimization_jobs
    for each row
    execute function update_updated_at_column();

-- Enable Row Level Security
alter table optimization_jobs enable row level security;

-- Create RLS policies for authenticated users
-- Policy for SELECT operations
create policy "Users can view their own optimization jobs"
    on optimization_jobs
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

-- Policy for INSERT operations
create policy "Users can create their own optimization jobs"
    on optimization_jobs
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

-- Policy for UPDATE operations
create policy "Users can update their own optimization jobs"
    on optimization_jobs
    for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

-- Policy for DELETE operations
create policy "Users can delete their own optimization jobs"
    on optimization_jobs
    for delete
    to authenticated
    using ((select auth.uid()) = user_id);

-- Add helpful comments to the table and columns
comment on table optimization_jobs is 'Stores image optimization jobs and their results';
comment on column optimization_jobs.id is 'Unique identifier for the optimization job';
comment on column optimization_jobs.user_id is 'Reference to the auth.users table';
comment on column optimization_jobs.original_filename is 'Original name of the uploaded file';
comment on column optimization_jobs.user_context_subject is 'User-provided subject context for the image';
comment on column optimization_jobs.user_context_keywords is 'User-provided keywords for better context';
comment on column optimization_jobs.generated_alt_text is 'AI-generated alt text for the image';
comment on column optimization_jobs.generated_filename_suggestion is 'AI-suggested SEO-friendly filename';
comment on column optimization_jobs.ai_request_id is 'Reference ID for the AI service request';
comment on column optimization_jobs.ai_detected_keywords is 'Keywords detected by AI from the image';
comment on column optimization_jobs.status is 'Current status of the optimization job (pending, processing, completed, failed)';
comment on column optimization_jobs.error_message is 'Error message if the job failed';