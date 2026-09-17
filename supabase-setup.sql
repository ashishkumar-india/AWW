-- Bihar ICDS AWW - Supabase Tables Setup
-- Supabase Dashboard > SQL Editor > New Query > Paste and Run

CREATE TABLE IF NOT EXISTS awc_profile (
  awc_code TEXT PRIMARY KEY,
  district TEXT, project TEXT, sector TEXT, panchayat TEXT,
  awc_name TEXT, sevika_name TEXT, sahayika_name TEXT, cdpo_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS awc_beneficiaries (
  awc_code TEXT PRIMARY KEY REFERENCES awc_profile(awc_code) ON DELETE CASCADE,
  normal_kids INT DEFAULT 32, sam_kids INT DEFAULT 4,
  preschool_kids INT DEFAULT 40, pregnant_women INT DEFAULT 12,
  lactating_mothers INT DEFAULT 10, updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS awc_transactions (
  id TEXT PRIMARY KEY, awc_code TEXT,
  date DATE NOT NULL, type TEXT NOT NULL, item TEXT NOT NULL,
  quantity NUMERIC(12,3) NOT NULL, source TEXT, challan TEXT,
  notes TEXT, details TEXT, beneficiaries_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_txn_awc ON awc_transactions(awc_code);

CREATE TABLE IF NOT EXISTS awc_opening_stock (
  awc_code TEXT, month_key TEXT,
  rice NUMERIC(12,3) DEFAULT 0, dal NUMERIC(12,3) DEFAULT 0,
  milk NUMERIC(12,3) DEFAULT 0, eggs NUMERIC(12,3) DEFAULT 0,
  soybean NUMERIC(12,3) DEFAULT 0, chana NUMERIC(12,3) DEFAULT 0,
  peanut NUMERIC(12,3) DEFAULT 0, jaggery NUMERIC(12,3) DEFAULT 0,
  oil NUMERIC(12,3) DEFAULT 0, salt_spices NUMERIC(12,3) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (awc_code, month_key)
);

CREATE TABLE IF NOT EXISTS awc_day_overrides (
  awc_code TEXT, date DATE, month_key TEXT,
  is_holiday BOOLEAN DEFAULT FALSE, holiday_name TEXT, children_count INT,
  PRIMARY KEY (awc_code, date)
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) — Full Data Protection
-- Only authenticated users (logged in with Email+Password) can access data.
-- Anyone cloning the repo or using the API without logging in is completely blocked.
-- ================================================================

ALTER TABLE awc_profile       ENABLE ROW LEVEL SECURITY;
ALTER TABLE awc_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE awc_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE awc_opening_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE awc_day_overrides ENABLE ROW LEVEL SECURITY;

-- 1. Profile Policy
DROP POLICY IF EXISTS "Auth users only" ON awc_profile;
CREATE POLICY "Auth users only" ON awc_profile
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 2. Beneficiaries Policy
DROP POLICY IF EXISTS "Auth users only" ON awc_beneficiaries;
CREATE POLICY "Auth users only" ON awc_beneficiaries
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 3. Transactions Policy
DROP POLICY IF EXISTS "Auth users only" ON awc_transactions;
CREATE POLICY "Auth users only" ON awc_transactions
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 4. Opening Stock Policy
DROP POLICY IF EXISTS "Auth users only" ON awc_opening_stock;
CREATE POLICY "Auth users only" ON awc_opening_stock
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 5. Day Overrides Policy
DROP POLICY IF EXISTS "Auth users only" ON awc_day_overrides;
CREATE POLICY "Auth users only" ON awc_day_overrides
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Realtime replication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE awc_transactions;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE awc_profile;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;