/**
 * Shared Supabase client singleton.
 * Import this instead of calling createClient() in individual files.
 */
import { createClient } from '@supabase/supabase-js';
import { capacitorStorage } from '../utils/capacitorStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: capacitorStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
