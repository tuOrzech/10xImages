-- Migration: Add storage_path column to optimization_jobs table
-- Description: Add storage_path column to store full path to the file in Supabase Storage
-- Author: AltImageOptimizer Team
-- Date: 2024-03-21

-- Add storage_path column
alter table optimization_jobs add column storage_path text;

-- Create index for storage_path for faster lookups
create index idx_optimization_jobs_storage_path on optimization_jobs using btree (storage_path);

-- Add comment
comment on column optimization_jobs.storage_path is 'Full path to the file in Supabase Storage';