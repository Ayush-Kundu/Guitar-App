import { supabase } from '../lib/supabase';
import { textViolatesContentPolicy } from './contentModeration';

export function moderationApiBase(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) return '';
  return `${supabaseUrl}/functions/v1/make-server-4ea82950`;
}

export type AppUserLike = { id: string; email?: string };

/**
 * Calls Edge Function to purge the violator from Supabase, ban client IP, and delete Auth user when applicable.
 * Uses JWT when present; otherwise shared secret + user id + email (set MODERATION_SHARED_SECRET in Supabase + VITE_MODERATION_SHARED_SECRET).
 */
/** True if Edge reports this browser session's public IP is not banned. */
export async function fetchIpAllowedForApp(): Promise<boolean> {
  const base = moderationApiBase();
  if (!base) return true;
  try {
    const res = await fetch(`${base}/moderation/ip-status`, { method: 'GET' });
    const j = await res.json().catch(() => ({ allowed: true }));
    return (j as { allowed?: boolean }).allowed !== false;
  } catch {
    return true;
  }
}

export async function requestServerBanForContentViolation(
  user: AppUserLike,
  offendingText: string,
): Promise<{ ok: boolean; error?: string }> {
  const base = moderationApiBase();
  if (!base) {
    return { ok: false, error: 'Missing Supabase URL' };
  }

  const snippet = offendingText.slice(0, 500);
  if (!textViolatesContentPolicy(snippet)) {
    return { ok: false, error: 'No violation in snippet' };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    const shared = import.meta.env.VITE_MODERATION_SHARED_SECRET as string | undefined;
    if (shared) {
      headers['x-strummy-moderation-secret'] = shared;
    }
  }

  const body: Record<string, string> = { contentSnippet: snippet };
  if (!token) {
    body.userId = user.id;
    if (user.email) body.email = user.email;
  }

  try {
    const res = await fetch(`${base}/moderation/violation-ban`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (json as { error?: string }).error || res.statusText };
    }
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Network error';
    return { ok: false, error: msg };
  }
}
