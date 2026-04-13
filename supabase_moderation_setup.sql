-- Run in Supabase SQL Editor (once). Used by make-server-4ea82950 moderation routes.
-- After deploy, redeploy Edge function so routes /moderation/* are live.

CREATE TABLE IF NOT EXISTS banned_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_raw TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS banned_ips_ip_raw_unique ON banned_ips (ip_raw);

CREATE TABLE IF NOT EXISTS banned_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS banned_devices_device_id_unique ON banned_devices (device_id);

-- Optional: tighten with RLS + service_role only (Edge uses service role).
ALTER TABLE banned_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role all banned_ips" ON banned_ips;
CREATE POLICY "service role all banned_ips" ON banned_ips FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service role all banned_devices" ON banned_devices;
CREATE POLICY "service role all banned_devices" ON banned_devices FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
