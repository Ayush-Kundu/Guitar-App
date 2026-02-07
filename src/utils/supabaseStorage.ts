/**
 * Custom Supabase Storage Adapter for Capacitor
 * Uses @capacitor/preferences for persistent storage on iOS/Android
 * Falls back to localStorage on web
 */

import { Preferences } from '@capacitor/preferences';
import { isNative } from './capacitor';

const STORAGE_PREFIX = 'supabase_auth_';

/**
 * Custom storage adapter that uses Capacitor Preferences on native platforms
 * This ensures auth tokens persist properly on iOS and Android
 */
export const capacitorStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isNative()) {
      try {
        const { value } = await Preferences.get({ key: STORAGE_PREFIX + key });
        return value;
      } catch (error) {
        console.error('[CapacitorStorage] Error getting item:', key, error);
        return null;
      }
    } else {
      return localStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isNative()) {
      try {
        await Preferences.set({ key: STORAGE_PREFIX + key, value });
      } catch (error) {
        console.error('[CapacitorStorage] Error setting item:', key, error);
      }
    } else {
      localStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isNative()) {
      try {
        await Preferences.remove({ key: STORAGE_PREFIX + key });
      } catch (error) {
        console.error('[CapacitorStorage] Error removing item:', key, error);
      }
    } else {
      localStorage.removeItem(key);
    }
  },
};

/**
 * Clear all Supabase auth data from storage
 * Call this on sign out to ensure clean state
 */
export const clearAuthStorage = async (): Promise<void> => {
  const keysToRemove = [
    'sb-auth-token',
    'sb-refresh-token',
    'supabase.auth.token',
  ];

  for (const key of keysToRemove) {
    await capacitorStorage.removeItem(key);
  }

  // Also clear from localStorage directly (belt and suspenders)
  if (typeof localStorage !== 'undefined') {
    keysToRemove.forEach(key => localStorage.removeItem(key));
    // Clear any Supabase-related keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  }

  console.log('[CapacitorStorage] Cleared all auth storage');
};

/**
 * Check if we have a stored session
 */
export const hasStoredSession = async (): Promise<boolean> => {
  const token = await capacitorStorage.getItem('sb-auth-token');
  return !!token;
};
