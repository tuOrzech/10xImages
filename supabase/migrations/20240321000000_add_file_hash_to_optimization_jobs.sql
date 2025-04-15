-- Migration: Add file_hash column to optimization_jobs table
-- Description: Add file_hash column to store unique file identifiers
-- Author: AltImageOptimizer Team
-- Date: 2024-03-21

-- Add file_hash column
alter table optimization_jobs add column file_hash text;

-- Create index for file_hash for faster lookups
create index idx_optimization_jobs_file_hash on optimization_jobs using btree (file_hash);