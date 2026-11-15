-- Add direct video-to-tag assignments for festival and teacher metadata.
CREATE TABLE IF NOT EXISTS videos_to_tags (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    video_id integer NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
    tag_id integer NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    UNIQUE(video_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_videos_to_tags_video_id ON videos_to_tags(video_id);
CREATE INDEX IF NOT EXISTS idx_videos_to_tags_tag_id ON videos_to_tags(tag_id);

ALTER TABLE videos_to_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read videos_to_tags" ON videos_to_tags;
DROP POLICY IF EXISTS "Allow authenticated insert videos_to_tags" ON videos_to_tags;
DROP POLICY IF EXISTS "Allow authenticated update videos_to_tags" ON videos_to_tags;
DROP POLICY IF EXISTS "Allow authenticated delete videos_to_tags" ON videos_to_tags;

CREATE POLICY "Allow authenticated read videos_to_tags"
    ON videos_to_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert videos_to_tags"
    ON videos_to_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update videos_to_tags"
    ON videos_to_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete videos_to_tags"
    ON videos_to_tags FOR DELETE TO authenticated USING (true);

-- Preserve festival and teacher metadata currently inherited from linked moves.
INSERT INTO videos_to_tags (video_id, tag_id)
SELECT DISTINCT mv.video_id, mt.tag_id
FROM moves_to_videos AS mv
JOIN moves_to_tags AS mt ON mt.move_id = mv.move_id
JOIN tags AS t ON t.tag_id = mt.tag_id
JOIN tag_types AS tt ON tt.tag_type_id = t.tag_type_id
WHERE lower(trim(tt.tag_type_name)) IN ('festivals', 'festival / classes', 'teachers')
ON CONFLICT (video_id, tag_id) DO NOTHING;
