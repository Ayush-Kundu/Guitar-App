import type { SupabaseClient } from '@supabase/supabase-js';
import { getOrCreateModerationDeviceId } from './moderationDeviceId';

const MODERATION_ERR =
  'This message violates community guidelines. Your account has been removed.';

export { MODERATION_ERR };

function moderationFunctionUrl(path: string): string | null {
  const base = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!base || !anon) return null;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}/functions/v1/make-server-4ea82950${clean}`;
}

/** Ask Edge if this IP / device is banned (requires SQL tables + deployed function). */
export async function fetchModerationBanStatus(): Promise<{ banned: boolean }> {
  const deviceId = getOrCreateModerationDeviceId();
  const urlBase = moderationFunctionUrl('/moderation/ip-ban-status');
  if (!urlBase) return { banned: false };
  const url = deviceId
    ? `${urlBase}?deviceId=${encodeURIComponent(deviceId)}`
    : urlBase;
  try {
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: anon || '',
        Authorization: `Bearer ${anon || ''}`,
      },
    });
    if (!res.ok) return { banned: false };
    const data = (await res.json()) as { banned?: boolean };
    return { banned: Boolean(data.banned) };
  } catch {
    return { banned: false };
  }
}

/**
 * Server-side purge + IP/device ban when the user has a Supabase Auth session (e.g. Google).
 */
export async function invokeModerationEnforceEdge(accessToken: string): Promise<boolean> {
  const url = moderationFunctionUrl('/moderation/enforce-violation');
  if (!url) return false;
  try {
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const deviceId = getOrCreateModerationDeviceId();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: anon || '',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Best-effort removal using the anon client (succeeds only where RLS allows deletes).
 * Always call clearLocalUserState after.
 */
export async function purgeUserDataBestEffort(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const uid = userId;
  const tryDel = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch {
      /* ignore */
    }
  };

  await tryDel(() => supabase.from('likes').delete().eq('user_id', uid));
  await tryDel(() => supabase.from('posts').delete().eq('user_id', uid));
  await tryDel(() =>
    supabase.from('friend_messages').delete().or(`send_user.eq.${uid},receive_user.eq.${uid}`),
  );
  await tryDel(() =>
    supabase.from('messages').delete().or(`sender_id.eq.${uid},receive_id.eq.${uid}`),
  );
  await tryDel(() =>
    supabase
      .from('friend_requests')
      .delete()
      .or(`from_user_id.eq.${uid},to_user_id.eq.${uid}`),
  );
  await tryDel(() =>
    supabase
      .from('friendships')
      .delete()
      .or(`user_id_1.eq.${uid},user_id_2.eq.${uid}`),
  );
  await tryDel(() =>
    supabase
      .from('chats')
      .delete()
      .or(`participant_1.eq.${uid},participant_2.eq.${uid}`),
  );
  await tryDel(() =>
    supabase.from('blocked_users').delete().or(`blocker_id.eq.${uid},blocked_id.eq.${uid}`),
  );
  await tryDel(() => supabase.from('user_progress').delete().eq('user_id', uid));
  await tryDel(() => supabase.from('user_data').delete().eq('user_id', uid));
  await tryDel(() => supabase.from('profiles').delete().eq('user_id', uid));
}

export function clearLocalUserState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('guitarAppUser');
    localStorage.removeItem('guitarAppSession');
    localStorage.removeItem('guitarAppMessages');
    localStorage.removeItem('guitarAppChats');
    localStorage.removeItem('guitarAppFriends');
    localStorage.removeItem('guitarAppFriendRequests');
    sessionStorage.setItem(
      'strummy-oauth-error',
      'Your account was removed for violating community guidelines.',
    );
  } catch {
    /* ignore */
  }
}
