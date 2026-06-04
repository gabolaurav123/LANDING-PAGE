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
