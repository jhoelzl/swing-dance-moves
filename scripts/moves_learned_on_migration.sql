-- Add an optional "learned_on" date column to moves.
-- Run this on existing databases created before this field existed.

ALTER TABLE moves
ADD COLUMN IF NOT EXISTS learned_on date;
