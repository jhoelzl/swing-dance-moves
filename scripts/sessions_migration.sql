-- ============================================
-- Sessions Feature Migration
-- Run this in the Supabase SQL Editor to add
-- training session support to an existing DB.
-- ============================================

-- Training sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
    session_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(200) NOT NULL,
    session_date date NOT NULL,
    notes text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- N:M junction: sessions <-> moves
CREATE TABLE IF NOT EXISTS session_to_moves (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id integer NOT NULL REFERENCES training_sessions(session_id) ON DELETE CASCADE,
    move_id integer NOT NULL REFERENCES moves(move_id) ON DELETE CASCADE,
    UNIQUE(session_id, move_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_session_to_moves_session_id ON session_to_moves(session_id);
CREATE INDEX IF NOT EXISTS idx_session_to_moves_move_id ON session_to_moves(move_id);

-- RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read training_sessions" ON training_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert training_sessions" ON training_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update training_sessions" ON training_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete training_sessions" ON training_sessions FOR DELETE TO authenticated USING (true);

ALTER TABLE session_to_moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read session_to_moves" ON session_to_moves FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert session_to_moves" ON session_to_moves FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update session_to_moves" ON session_to_moves FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete session_to_moves" ON session_to_moves FOR DELETE TO authenticated USING (true);
