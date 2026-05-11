-- Table des questions PMP
CREATE TABLE IF NOT EXISTS pmp_questions (
  id          INTEGER PRIMARY KEY,
  lot         INTEGER NOT NULL,
  level       TEXT NOT NULL CHECK (level IN ('facile','difficile','tres-difficile')),
  domain      TEXT NOT NULL,
  pmbok       TEXT NOT NULL,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL,
  correct     INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index pour filtrer par lot et niveau
CREATE INDEX IF NOT EXISTS idx_pmp_lot   ON pmp_questions(lot);
CREATE INDEX IF NOT EXISTS idx_pmp_level ON pmp_questions(level);

-- RLS : lecture publique (accessible à tous les utilisateurs connectés)
ALTER TABLE pmp_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pmp_read" ON pmp_questions;
CREATE POLICY "pmp_read" ON pmp_questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "pmp_insert_admin" ON pmp_questions;
CREATE POLICY "pmp_insert_admin" ON pmp_questions FOR INSERT WITH CHECK (true);
