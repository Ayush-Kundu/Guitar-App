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
