-- ============================================
-- Swing Dance Moves – Database Init Script
-- PostgreSQL (Supabase)
-- 
-- Creates the full schema without any data.
-- Run this in the Supabase SQL Editor to set up
-- a fresh database instance.
-- ============================================


-- ============================================
-- 1. Tables
-- ============================================

-- Tag types (grouping of tags, e.g. "Level", "Dances", "Technical")
CREATE TABLE IF NOT EXISTS tag_types (
    tag_type_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag_type_name varchar(200) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    tag_type_css varchar(200) NOT NULL DEFAULT ''
);

-- Tags (individual tags belonging to a tag type)
CREATE TABLE IF NOT EXISTS tags (
    tag_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag_type_id integer NOT NULL REFERENCES tag_types(tag_type_id),
    tag_name varchar(100) NOT NULL,
    tag_label varchar(20) NOT NULL DEFAULT 'light',
    tag_css varchar(200) NOT NULL DEFAULT '',
    tag_sort integer NOT NULL DEFAULT 0
);

-- Moves (dance moves)
CREATE TABLE IF NOT EXISTS moves (
    move_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(200) NOT NULL,
    synonyms varchar(400) NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT ''
);

-- N:M junction table: moves <-> tags
CREATE TABLE IF NOT EXISTS moves_to_tags (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    move_id integer NOT NULL REFERENCES moves(move_id) ON DELETE CASCADE,
    tag_id integer NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- Videos (YouTube links)
CREATE TABLE IF NOT EXISTS videos (
    video_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title varchar(300) NOT NULL,
    url varchar(500) NOT NULL,
    description text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- N:M junction table: moves <-> videos (with optional time markers)
CREATE TABLE IF NOT EXISTS moves_to_videos (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    move_id integer NOT NULL REFERENCES moves(move_id) ON DELETE CASCADE,
    video_id integer NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
    start_time varchar(10) NOT NULL DEFAULT '',
    end_time varchar(10) NOT NULL DEFAULT '',
    UNIQUE(move_id, video_id)
);

-- User settings (per-user preferences, linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS user_settings (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language varchar(5) NOT NULL DEFAULT 'de',
    random_moves_count integer NOT NULL DEFAULT 2,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT user_settings_user_id_unique UNIQUE (user_id),
    CONSTRAINT user_settings_language_check CHECK (language IN ('de', 'en')),
    CONSTRAINT user_settings_random_moves_count_check CHECK (random_moves_count BETWEEN 1 AND 5)
);


-- ============================================
-- 2. Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tags_tag_type_id ON tags(tag_type_id);
CREATE INDEX IF NOT EXISTS idx_moves_to_tags_move_id ON moves_to_tags(move_id);
CREATE INDEX IF NOT EXISTS idx_moves_to_tags_tag_id ON moves_to_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_moves_to_videos_move_id ON moves_to_videos(move_id);
CREATE INDEX IF NOT EXISTS idx_moves_to_videos_video_id ON moves_to_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);


-- ============================================
-- 3. Triggers
-- ============================================

-- Auto-update updated_at on user_settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 4. Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tag_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_to_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_to_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- tag_types: public read, authenticated write
CREATE POLICY "Allow public read on tag_types" ON tag_types FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on tag_types" ON tag_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on tag_types" ON tag_types FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on tag_types" ON tag_types FOR DELETE TO authenticated USING (true);

-- tags: public read, authenticated write
CREATE POLICY "Allow public read on tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on tags" ON tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on tags" ON tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on tags" ON tags FOR DELETE TO authenticated USING (true);

-- moves: public read, authenticated write
CREATE POLICY "Allow public read on moves" ON moves FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on moves" ON moves FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on moves" ON moves FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on moves" ON moves FOR DELETE TO authenticated USING (true);

-- moves_to_tags: public read, authenticated write
CREATE POLICY "Allow public read on moves_to_tags" ON moves_to_tags FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on moves_to_tags" ON moves_to_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on moves_to_tags" ON moves_to_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on moves_to_tags" ON moves_to_tags FOR DELETE TO authenticated USING (true);

-- videos: authenticated read/write
CREATE POLICY "Allow authenticated read videos" ON videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert videos" ON videos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update videos" ON videos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete videos" ON videos FOR DELETE TO authenticated USING (true);

-- moves_to_videos: authenticated read/write
CREATE POLICY "Allow authenticated read moves_to_videos" ON moves_to_videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert moves_to_videos" ON moves_to_videos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update moves_to_videos" ON moves_to_videos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete moves_to_videos" ON moves_to_videos FOR DELETE TO authenticated USING (true);

-- user_settings: users can only access their own row
CREATE POLICY "Users can read own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
