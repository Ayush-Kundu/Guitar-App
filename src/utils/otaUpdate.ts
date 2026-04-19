/**
 * Over-The-Air (OTA) update system for Strummy.
 *
 * How it works:
 * 1. The iOS app ships with a bundled copy of the web assets (ios/App/App/public/).
 * 2. On launch, the app checks `VITE_OTA_UPDATE_URL` (e.g. https://strummy.studio/ota/manifest.json)
 *    for a newer version.
 * 3. If a new version is found, the plugin downloads the zip, extracts it, and applies it on next
 *    launch — no App Store review needed.
 * 4. If the download fails or the new bundle crashes, the plugin automatically rolls back to the
 *    last working version.
 *
 * The same `npm run build` output is:
 * - Deployed to strummy.studio for web users
 * - Zipped and uploaded to strummy.studio/ota/ for iOS OTA updates
 * - Copied to ios/App/App/public/ for the initial app bundle
 *
 * To push an update:
 *   1. npm run build
 *   2. npm run ota:prepare   (zips build/ and generates manifest.json)
 *   3. Upload ota/manifest.json + ota/strummy-<version>.zip to strummy.studio/ota/
 *   4. Users get the update automatically on next app launch.
 */

import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { isNative } from './capacitor';

const UPDATE_URL = (import.meta.env.VITE_OTA_UPDATE_URL as string | undefined)?.trim() || '';

interface OtaManifest {
  version: string;
  url: string;
}

/** Call once on app startup. Checks for updates in the background, applies on next launch. */
export async function checkForOtaUpdate(): Promise<void> {
  if (!isNative() || !UPDATE_URL) return;

  try {
    // Notify the plugin that the current bundle loaded successfully (prevents rollback).
    await CapacitorUpdater.notifyAppReady();

    // Fetch the manifest to see if there's a newer version.
    const res = await fetch(UPDATE_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const manifest: OtaManifest = await res.json();

    const current = await CapacitorUpdater.current();
    const currentVersion = current?.bundle?.version;

    if (!manifest.version || !manifest.url) return;
    if (manifest.version === currentVersion) return;

    console.log(`[OTA] New version available: ${manifest.version} (current: ${currentVersion || 'bundled'})`);

    // Download the new bundle zip in the background.
    const bundle = await CapacitorUpdater.download({
      url: manifest.url,
      version: manifest.version,
    });

    // Stage it — will be applied on the next app launch.
    await CapacitorUpdater.set(bundle);
    console.log(`[OTA] Version ${manifest.version} staged. Will apply on next launch.`);
  } catch (err) {
    // Non-fatal: the app continues with the current bundle.
    console.warn('[OTA] Update check failed:', err);
  }
}
