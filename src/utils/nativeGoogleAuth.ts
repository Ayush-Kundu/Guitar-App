/**
 * Native Google Sign-In for iOS (Capacitor) via @capgo/capacitor-social-login.
 *
 * Why: Google blocks OAuth inside WKWebView ("Access blocked: does not comply with Google's policies").
 * Supabase's redirect-based OAuth flow also needs a custom URL scheme in the Redirect URLs allowlist
 * and tends to fall back to the Site URL (strummy.studio) on misconfig.
 *
 * Solution: native Google Sign-In uses the Google Identity SDK (iOS) which presents
 * ASWebAuthenticationSession — Google-approved, Apple's recommended OAuth UI, and returns the ID
 * token directly to the app. We then call `supabase.auth.signInWithIdToken` to create a Supabase
 * session without any redirect dance.
 *
 * Google Cloud Console setup required:
 * 1. Credentials → Create OAuth 2.0 Client ID of type "iOS" with bundle id `com.strummyak.app`.
 *    (This yields an iOS client ID and a reversed client ID like `com.googleusercontent.apps.XYZ`.)
 * 2. Add the reversed iOS client ID to `ios/App/App/Info.plist` as a URL scheme.
 *
 * Supabase setup required (Authentication → Providers → Google):
 * 1. Primary "Client ID" = your Web OAuth client ID (used server-side to verify `aud` claim).
 * 2. "Additional Authorized Client IDs" += the iOS client ID, so Supabase also accepts tokens whose
 *    `aud` claim matches the iOS client.
 *
 * Env vars (see `.env.example`):
 * - VITE_GOOGLE_WEB_CLIENT_ID  web OAuth client id (used for server-side token audience verification)
 * - VITE_GOOGLE_IOS_CLIENT_ID  iOS OAuth client id (used by the iOS Google SDK)
 */

import { SocialLogin } from '@capgo/capacitor-social-login';
import { isNative } from './capacitor';

let initialized = false;

function readEnv(name: string): string | undefined {
  const v = (import.meta.env as Record<string, string | undefined>)[name];
  return v && v.trim() ? v.trim() : undefined;
}

/** True if both Google client IDs are set in env so native sign-in can actually run. */
export function isNativeGoogleConfigured(): boolean {
  return Boolean(readEnv('VITE_GOOGLE_WEB_CLIENT_ID') && readEnv('VITE_GOOGLE_IOS_CLIENT_ID'));
}

async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  const webClientId = readEnv('VITE_GOOGLE_WEB_CLIENT_ID');
  const iosClientId = readEnv('VITE_GOOGLE_IOS_CLIENT_ID');

  if (!webClientId || !iosClientId) {
    throw new Error('Native Google sign-in is not configured (missing VITE_GOOGLE_WEB_CLIENT_ID or VITE_GOOGLE_IOS_CLIENT_ID).');
  }

  await SocialLogin.initialize({
    google: {
      iOSClientId: iosClientId,
      webClientId,
      mode: 'online',
    },
  });
  initialized = true;
}

export interface NativeGoogleAuthResult {
  idToken: string;
  accessToken?: string;
  email?: string;
  name?: string;
}

/**
 * Launches native Google Sign-In. Returns the Google-issued ID token plus profile fields.
 */
export async function nativeGoogleSignIn(): Promise<NativeGoogleAuthResult> {
  if (!isNative()) {
    throw new Error('nativeGoogleSignIn() must only be called on native (iOS/Android).');
  }
  await ensureInitialized();

  const resp = await SocialLogin.login({
    provider: 'google',
    options: {
      scopes: ['profile', 'email'],
    },
  });

  // In 'online' mode the response is GoogleLoginResponseOnline with idToken.
  const result = resp?.result;
  if (!result || (result as { responseType?: string }).responseType !== 'online') {
    throw new Error('Google sign-in returned an unexpected response shape.');
  }
  const online = result as {
    idToken: string | null;
    accessToken?: { token: string } | null;
    profile: { email: string | null; name: string | null };
  };
  if (!online.idToken) {
    throw new Error('Google sign-in returned no ID token — check iOS OAuth client setup.');
  }
  return {
    idToken: online.idToken,
    accessToken: online.accessToken?.token,
    email: online.profile?.email || undefined,
    name: online.profile?.name || undefined,
  };
}

export async function nativeGoogleSignOut(): Promise<void> {
  if (!isNative()) return;
  try {
    await SocialLogin.logout({ provider: 'google' });
  } catch (_) {
    /* not signed in */
  }
}
