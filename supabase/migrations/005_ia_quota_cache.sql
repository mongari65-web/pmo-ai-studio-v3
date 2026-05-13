-- Table cache des générations IA (évite les appels redondants)
CREATE TABLE IF NOT EXISTS ia_cache (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key    TEXT UNIQUE NOT NULL,  -- hash(tool_type + project_description)
  tool_type    TEXT NOT NULL,
  result       JSONB NOT NULL,
  hits         INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  expires_at   TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days'
);
CREATE INDEX IF NOT EXISTS idx_ia_cache_key ON ia_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ia_cache_expires ON ia_cache(expires_at);

-- RLS cache : chaque user peut lire, seul le service peut écrire
ALTER TABLE ia_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cache_read" ON ia_cache;
CREATE POLICY "cache_read" ON ia_cache FOR SELECT USING (true);
DROP POLICY IF EXISTS "cache_write" ON ia_cache;
CREATE POLICY "cache_write" ON ia_cache FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "cache_update" ON ia_cache;
CREATE POLICY "cache_update" ON ia_cache FOR UPDATE USING (true);

-- Nettoyer le cache expiré (à appeler périodiquement)
CREATE OR REPLACE FUNCTION cleanup_ia_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM ia_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Réinitialiser les quotas IA chaque mois
-- (à appeler via cron job ou pg_cron si disponible)
CREATE OR REPLACE FUNCTION reset_monthly_ai_quotas()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET ai_calls_count = 0,
      ai_calls_reset_at = now()
  WHERE ai_calls_reset_at < now() - INTERVAL '30 days'
     OR ai_calls_reset_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction d'incrémentation atomique du compteur IA
CREATE OR REPLACE FUNCTION increment_ai_calls(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET ai_calls_count = COALESCE(ai_calls_count, 0) + 1
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
