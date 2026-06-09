CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  counter_key TEXT NOT NULL DEFAULT 'main',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  amount_total INTEGER,
  currency TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_counter_key ON payments(counter_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session_id
  ON payments(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS premium_code_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS premium_code TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS premium_code_assigned_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS premium_code_error TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_premium_code_id ON payments(premium_code_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_premium_code
  ON payments(premium_code)
  WHERE premium_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS campaign_counters (
  counter_key TEXT PRIMARY KEY,
  total_quantity INTEGER NOT NULL DEFAULT 100,
  sold_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CHECK (total_quantity >= 0),
  CHECK (sold_count >= 0),
  CHECK (sold_count <= total_quantity)
);

CREATE TABLE IF NOT EXISTS premium_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT now(),
  used_at TIMESTAMP,
  used_by_user_id TEXT,
  used_by_telegram_id TEXT,
  created_by_admin_id TEXT,
  notes TEXT,
  reserved_at TIMESTAMP,
  assigned_email TEXT,
  assigned_order_id TEXT,
  assigned_payment_id TEXT,
  assigned_source TEXT,
  delivered_at TIMESTAMP,
  CHECK (status IN ('available', 'reserved', 'used', 'disabled'))
);

ALTER TABLE premium_codes ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMP;
ALTER TABLE premium_codes ADD COLUMN IF NOT EXISTS assigned_email TEXT;
ALTER TABLE premium_codes ADD COLUMN IF NOT EXISTS assigned_order_id TEXT;
ALTER TABLE premium_codes ADD COLUMN IF NOT EXISTS assigned_payment_id TEXT;
ALTER TABLE premium_codes ADD COLUMN IF NOT EXISTS assigned_source TEXT;
ALTER TABLE premium_codes ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_premium_codes_status ON premium_codes(status);
CREATE INDEX IF NOT EXISTS idx_premium_codes_assigned_payment_id
  ON premium_codes(assigned_payment_id);

CREATE TABLE IF NOT EXISTS tracking_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  payment_id TEXT,
  email TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_event_name ON tracking_events(event_name);
CREATE INDEX IF NOT EXISTS idx_tracking_events_payment_id ON tracking_events(payment_id);
