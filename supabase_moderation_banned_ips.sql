-- Run in Supabase SQL Editor (once) so IP bans and moderation upserts work.
-- Service role / Edge Functions bypass RLS; anon/authenticated have no access.

CREATE TABLE IF NOT EXISTS public.moderation_banned_ips (
  ip_normalized TEXT PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT 'content_policy_violation',
  banned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_banned_ips_banned_at ON public.moderation_banned_ips (banned_at);

ALTER TABLE public.moderation_banned_ips ENABLE ROW LEVEL SECURITY;

-- No policies: only service role (Edge Function) can read/write.

COMMENT ON TABLE public.moderation_banned_ips IS 'IPs blocked after automated content-policy purge (Strummy moderation).';
