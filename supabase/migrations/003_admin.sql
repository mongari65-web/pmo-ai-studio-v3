-- Table des rôles admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin','admin','support')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enrichir profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','team'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_calls_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_calls_reset_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storage_used_mb NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id);

-- RLS admin_users : lecture seule pour les admins
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "admin_read" ON admin_users FOR SELECT USING (
  user_id = auth.uid()
);

-- Insérer le super admin (remplacer par votre user_id Supabase)
-- INSERT INTO admin_users (user_id, role) VALUES ('YOUR_USER_ID_HERE', 'super_admin');
