/**
 * Shared Supabase client singleton.
 * Import this instead of calling createClient() in individual files.
 */
import { createClient } from '@supabase/supabase-js';
import { capacitorStorage } from '../utils/capacitorStorage';

const rawUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const rawKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
const supabaseUrl = rawUrl.replace(/\/+$/, '');
const supabaseAnonKey = rawKey;

/** True when URL and anon key look usable (JWT-shaped key + http URL). */
export const isSupabaseConfigured = Boolean(
  supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 20 &&
    supabaseAnonKey.includes('.'),
);

if (typeof window !== 'undefined' && !isSupabaseConfigured) {
  console.error(
    '[Strummy] Supabase is not configured.\n' +
      '• Create a file named `.env` in the project root (same folder as package.json).\n' +
      '• Add:\n' +
      '    VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co\n' +
      '    VITE_SUPABASE_ANON_KEY=your_anon_public_key\n' +
      '  (Dashboard → Project Settings → API)\n' +
      '• Stop and restart the dev server after saving `.env`.\n' +
      'Console errors from `content.js` / `browser is not defined` come from a browser extension, not Strummy.',
  );
}

/** Placeholders avoid passing `undefined` into the client (which can break auth storage). */
const resolvedUrl = isSupabaseConfigured ? supabaseUrl : 'https://invalid.strummy.local';
const resolvedKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.invalid-placeholder';

export const supabase = createClient(resolvedUrl, resolvedKey, {
  auth: {
    storage: capacitorStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

/** Dev-only: call from console to confirm env (does not print secrets). */
export function logSupabaseConfigDebug(): void {
  const host = isSupabaseConfigured ? new URL(supabaseUrl).host : '(not configured)';
  console.info('[Strummy] Supabase:', { isSupabaseConfigured, host });
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { logSupabaseConfigDebug?: typeof logSupabaseConfigDebug }).logSupabaseConfigDebug =
    logSupabaseConfigDebug;
}
