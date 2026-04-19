CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL,
  reported_user_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'message')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_reports_created ON public.content_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reports_reported ON public.content_reports (reported_user_id);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.content_reports
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.content_reports IS 'User-submitted reports of community posts and DMs (App Store guideline 1.2).';
