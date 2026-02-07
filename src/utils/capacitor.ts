import { Capacitor } from '@capacitor/core';

/**
 * Returns true if the app is running inside a native Capacitor shell (iOS/Android).
 * Returns false if running in a standard browser.
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Returns the current platform: 'ios', 'android', or 'web'.
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};
