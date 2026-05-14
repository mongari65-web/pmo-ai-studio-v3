-- Table des abonnements Stripe
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id    TEXT,
  stripe_price_id       TEXT,
  plan                  TEXT NOT NULL DEFAULT 'free',
  status                TEXT NOT NULL DEFAULT 'inactive',
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN DEFAULT false,
  canceled_at           TIMESTAMPTZ,
  trial_end             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_user    ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_stripe  ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_status  ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sub_read_own" ON subscriptions;
CREATE POLICY "sub_read_own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Table des événements webhook (audit trail)
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    TEXT UNIQUE NOT NULL,
  event_type  TEXT NOT NULL,
  payload     JSONB,
  processed   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS webhook : service only
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webhook_service" ON stripe_webhook_events;
CREATE POLICY "webhook_service" ON stripe_webhook_events FOR ALL USING (true);

-- Mettre à jour profiles quand abonnement change
CREATE OR REPLACE FUNCTION sync_profile_plan()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' OR NEW.status = 'trialing' THEN
    UPDATE profiles SET
      plan = NEW.plan,
      stripe_customer_id = NEW.stripe_customer_id,
      stripe_subscription_id = NEW.stripe_subscription_id,
      subscription_status = NEW.status,
      plan_started_at = NEW.current_period_start,
      plan_expires_at = NEW.current_period_end
    WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('canceled','unpaid','past_due') THEN
    UPDATE profiles SET
      plan = 'free',
      subscription_status = NEW.status,
      plan_expires_at = NEW.current_period_end
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_subscription_change ON subscriptions;
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION sync_profile_plan();
