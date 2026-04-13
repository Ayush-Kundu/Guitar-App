/**
 * Server Configuration for iOS and Web
 */

import { Capacitor } from '@capacitor/core';

// Development server configuration
const DEV_SERVER_IP = '192.168.1.196';
const API_SERVER_PORT = 3001;

// Remote chord detection API at strummy.studio
const CHORD_DETECTION_WS_URL = 'wss://strummy.studio/c_d/ws';

/**
 * Get the appropriate host for server connections
 */
export const getServerHost = (): string => {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    return 'localhost';
  }

  if (platform === 'ios') {
    return DEV_SERVER_IP;
  }

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
 * Get the WebSocket URL for chord detection (remote API)
 */
export const getChordDetectionWsUrl = (): string => {
  return CHORD_DETECTION_WS_URL;
};

/**
 * Configuration object
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
  },
};

export default serverConfig;
