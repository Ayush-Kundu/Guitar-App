/**
 * Native Apple Sign-In for iOS (Capacitor) via @capgo/capacitor-social-login.
 *
 * Uses ASAuthorizationController — no extra setup needed beyond enabling "Sign in with Apple"
 * capability in Xcode and enabling the Apple provider in Supabase Auth.
 *
 * Xcode: target → Signing & Capabilities → + Capability → Sign in with Apple.
 * Supabase: Auth → Providers → Apple → Enable. Bundle ID = com.strummyak.app.
 */

import { SocialLogin } from '@capgo/capacitor-social-login';
import { isNative } from './capacitor';

let initialized = false;

async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  await SocialLogin.initialize({
    apple: {
      clientId: 'com.strummyak.app',
      redirectUrl: '',
    },
  });
  initialized = true;
}

export interface NativeAppleAuthResult {
  idToken: string;
  email?: string;
  name?: string;
}

/**
 * Launches Apple Sign-In sheet. Returns the Apple-issued ID token.
 * Apple only provides name/email on the FIRST sign-in; subsequent calls return null for those fields.
 */
export async function nativeAppleSignIn(): Promise<NativeAppleAuthResult> {
  if (!isNative()) {
    throw new Error('nativeAppleSignIn() must only be called on native (iOS).');
  }
  await ensureInitialized();

  const resp = await SocialLogin.login({
    provider: 'apple',
    options: {
      scopes: ['name', 'email'],
    },
  });

  const result = resp?.result as {
    identityToken?: string;
    email?: string | null;
    givenName?: string | null;
    familyName?: string | null;
  } | undefined;

  const idToken = result?.identityToken;
  if (!idToken) {
    throw new Error('Apple sign-in returned no identity token.');
  }

  const name = [result?.givenName, result?.familyName].filter(Boolean).join(' ') || undefined;

  return {
    idToken,
    email: result?.email || undefined,
    name,
  };
}

export async function nativeAppleSignOut(): Promise<void> {
  if (!isNative()) return;
  try {
    await SocialLogin.logout({ provider: 'apple' });
  } catch (_) {
    /* not signed in */
  }
}
