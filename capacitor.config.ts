import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.strummyak.app',
  appName: 'Strummy',
  webDir: 'build',
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
    scheme: 'Strummy',
    allowsLinkPreview: false,
    scrollEnabled: false,
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      overlaysWebView: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
    // Native Google Sign-In is configured at runtime via SocialLogin.initialize() in
    // `src/utils/nativeGoogleAuth.ts` — uses VITE_GOOGLE_IOS_CLIENT_ID / VITE_GOOGLE_WEB_CLIENT_ID.
    CapacitorUpdater: {
      // Self-hosted OTA — the app checks the manifest URL on launch and downloads new bundles.
      // Set autoUpdate to false because we manage the update flow ourselves in src/utils/otaUpdate.ts.
      autoUpdate: false,
    },
  },
  server: {
    // Allow cleartext traffic for local development servers
    cleartext: true,
    // For development, you may want to use live reload:
    // url: 'http://YOUR_COMPUTER_IP:3000',
    // allowNavigation: ['*'],
  },
};

export default config;
