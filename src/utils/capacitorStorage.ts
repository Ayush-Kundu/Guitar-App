import { Preferences } from '@capacitor/preferences';
import { isNative } from './capacitor';

/**
 * A storage adapter for Supabase Auth that uses @capacitor/preferences
 * on native iOS/Android (persists across app restarts) and falls back
 * to localStorage on web.
 */
export const capacitorStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isNative()) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (isNative()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (isNative()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },
};
