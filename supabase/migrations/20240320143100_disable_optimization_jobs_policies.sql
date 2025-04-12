-- Migration: Disable all RLS policies for optimization_jobs table
-- Description: Temporarily disable all RLS policies for optimization_jobs table
-- Author: AltImageOptimizer Team
-- Date: 2024-03-20

-- Drop all existing policies
drop policy if exists "Users can view their own optimization jobs" on optimization_jobs;
drop policy if exists "Users can create their own optimization jobs" on optimization_jobs;
drop policy if exists "Users can update their own optimization jobs" on optimization_jobs;
drop policy if exists "Users can delete their own optimization jobs" on optimization_jobs;

-- Disable RLS on the table
alter table optimization_jobs disable row level security;