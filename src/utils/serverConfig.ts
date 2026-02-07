/**
 * Server Configuration for iOS and Web
 *
 * Handles different server URLs for different platforms:
 * - Web (browser): Uses localhost
 * - iOS Simulator: Uses localhost (shares host network)
 * - iOS Physical Device: Uses configured IP address
 */

import { Capacitor } from '@capacitor/core';

// Development server configuration
// Change DEV_SERVER_IP to your Mac's local IP address when testing on physical iOS device
// Find your IP with: ipconfig getifaddr en0 (or en1)
const DEV_SERVER_IP = '192.168.1.196'; // Your Mac's local IP

// Server ports
const API_SERVER_PORT = 3001;
const CHORD_DETECTION_PORT = 9103;

/**
 * Check if running on iOS physical device (not simulator)
 */
const isPhysicalDevice = (): boolean => {
  if (Capacitor.getPlatform() !== 'ios') return false;
  // Check if we're in simulator - simulator has specific characteristics
  // This is a heuristic; in production you might use a native plugin
  const isSimulator = navigator.userAgent.includes('iPhone Simulator') ||
                      navigator.userAgent.includes('iPad Simulator') ||
                      // In Capacitor, we can check window dimensions and other factors
                      false;
  return !isSimulator;
};

/**
 * Get the appropriate host for server connections
 */
export const getServerHost = (): string => {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    // Running in browser - use localhost
    return 'localhost';
  }

  if (platform === 'ios') {
    // iOS Simulator shares the host machine's network
    // Physical devices need the actual IP
    // For simplicity, we'll use the configured IP for both
    // The simulator will also work with the IP address
    return DEV_SERVER_IP;
  }

  // Android would use 10.0.2.2 for emulator
  if (platform === 'android') {
    return '10.0.2.2';
  }

  return 'localhost';
};

/**
 * Get the API server base URL
 */
export const getApiBaseUrl = (): string => {
  const host = getServerHost();
  return `http://${host}:${API_SERVER_PORT}/api`;
};

/**
 * Get the WebSocket server URL for chord detection
 */
export const getChordDetectionWsUrl = (): string => {
  const host = getServerHost();
  return `ws://${host}:${CHORD_DETECTION_PORT}/ws`;
};

/**
 * Configuration object for easy access
 */
export const serverConfig = {
  get apiBaseUrl() {
    return getApiBaseUrl();
  },
  get chordDetectionWsUrl() {
    return getChordDetectionWsUrl();
  },
  get serverHost() {
    return getServerHost();
  },
  ports: {
    api: API_SERVER_PORT,
    chordDetection: CHORD_DETECTION_PORT,
  },
  // For manual configuration
  setDevServerIp: (ip: string) => {
    // This would need to be stored in preferences for persistence
    console.log(`[ServerConfig] Would set dev server IP to: ${ip}`);
  },
};

export default serverConfig;
