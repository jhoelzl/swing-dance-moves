-- Migration: Remove 'link' column from 'moves' table
-- Run this in the Supabase SQL Editor AFTER deploying the new frontend code.

ALTER TABLE moves DROP COLUMN IF EXISTS link;
