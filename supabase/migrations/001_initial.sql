-- PMO AI Studio V3 — Schema complet

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plans
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  max_projects INTEGER NOT NULL DEFAULT 3,
  features JSONB NOT NULL DEFAULT '[]',
  stripe_price_monthly TEXT,
  stripe_price_yearly TEXT
);
INSERT INTO plans VALUES
  ('free',  'Gratuit',       0,    0,    3,  '["3 projets","Export PDF basique","Génération IA limitée"]', null, null),
  ('pro',   'Pro',           2900, 2500, 20, '["20 projets","Tous les outils","Export complet","Collaboration","Support prioritaire"]', null, null),
  ('team',  'Équipe',        7900, 6500, 100,'["100 projets","Collaboration temps réel","Stripe","API","Formations PMI"]', null, null);

-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan_id TEXT REFERENCES plans(id) DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  client TEXT,
  budget NUMERIC(15,2),
  start_date DATE,
  end_date DATE,
  team TEXT[],
  methodology TEXT DEFAULT 'PMI',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','archived','completed')),
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT '📋',
  completion INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project tools data (one row per tool per project, upsert)
CREATE TABLE project_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('wbs','gantt','raid','jalons','budget','workpackages','mindmap','pert','documents')),
  data JSONB NOT NULL DEFAULT '{}',
  version INTEGER DEFAULT 1,
  generated_by TEXT DEFAULT 'ai' CHECK (generated_by IN ('ai','manual','mixed')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, tool_type)
);

-- Tool history (unlimited for Pro)
CREATE TABLE tool_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL,
  label TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_tool_history_project_tool ON tool_history(project_id, tool_type);

-- Collaborators
CREATE TABLE project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner','editor','viewer')),
  invited_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own" ON profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "projects_own" ON projects FOR ALL USING (user_id = auth.uid());
CREATE POLICY "project_tools_own" ON project_tools FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);
CREATE POLICY "tool_history_own" ON tool_history FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (user_id = auth.uid());

-- ── Trigger: auto-create profile on signup ────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Trigger: update projects.updated_at ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tools_updated_at BEFORE UPDATE ON project_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at();
