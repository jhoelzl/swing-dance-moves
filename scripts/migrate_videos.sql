-- Migration: Add Videos table and Move-to-Video references
-- Run this in the Supabase SQL Editor

-- ============================================
-- 1. Create Videos Table
-- ============================================

CREATE TABLE IF NOT EXISTS videos (
    video_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title varchar(300) NOT NULL,
    url varchar(500) NOT NULL,
    description text NOT NULL DEFAULT '',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============================================
-- 2. Create Move-to-Video Junction Table
-- ============================================

CREATE TABLE IF NOT EXISTS moves_to_videos (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    move_id integer NOT NULL REFERENCES moves(move_id) ON DELETE CASCADE,
    video_id integer NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
    start_time varchar(10) NOT NULL DEFAULT '',   -- e.g. '10:01'
    end_time varchar(10) NOT NULL DEFAULT '',     -- e.g. '10:30'
    UNIQUE(move_id, video_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_moves_to_videos_move_id ON moves_to_videos(move_id);
CREATE INDEX IF NOT EXISTS idx_moves_to_videos_video_id ON moves_to_videos(video_id);

-- ============================================
-- 3. Enable RLS (Row Level Security)
-- ============================================

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_to_videos ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read videos" ON videos
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert videos" ON videos
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update videos" ON videos
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete videos" ON videos
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read moves_to_videos" ON moves_to_videos
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert moves_to_videos" ON moves_to_videos
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update moves_to_videos" ON moves_to_videos
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete moves_to_videos" ON moves_to_videos
    FOR DELETE TO authenticated USING (true);
