-- Collaboration temps réel

-- Membres projet (si pas déjà créé)
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner','editor','viewer')),
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, email)
);

-- Comments sur les outils
CREATE TABLE IF NOT EXISTS tool_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL,
  item_id TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_project_tool ON tool_comments(project_id, tool_type);

-- Activité projet
CREATE TABLE IF NOT EXISTS project_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_project ON project_activity(project_id, created_at DESC);

-- RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "members_project_access" ON project_members FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR user_id = auth.uid()
);
CREATE POLICY IF NOT EXISTS "comments_project_access" ON tool_comments FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND status = 'accepted')
);
CREATE POLICY IF NOT EXISTS "activity_project_access" ON project_activity FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND status = 'accepted')
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tool_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE project_activity;
ALTER PUBLICATION supabase_realtime ADD TABLE project_tools;
