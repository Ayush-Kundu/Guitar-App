/**
 * Validates chord-detector results against expected open strings for Getting Started checkpoints.
 * Uses fundamental frequency when present; otherwise chord / note roots (with E-string disambiguation when possible).
 */

import type { ChordDetectionResult } from './chordDetection';
import { rawChordLabelFromResult } from './journeySongChordDetection';

/** Guitar string number: 6 = low E (thick) … 1 = high e (thin) */
export type OpenStringNum = 1 | 2 | 3 | 4 | 5 | 6;

/** Approximate open-string fundamental Hz ranges (tuning drift tolerant) */
const F0_BAND: Record<OpenStringNum, readonly [number, number]> = {
  6: [73, 95], // E2
  5: [98, 125], // A2
  4: [130, 162], // D3
  3: [178, 208], // G3
  2: [228, 262], // B3
  1: [305, 360], // E4
};

const ROOT_BY_STRING: Record<OpenStringNum, string> = {
  6: 'E',
  5: 'A',
  4: 'D',
  3: 'G',
  2: 'B',
  1: 'E',
};

function primaryFrequencyHz(r: ChordDetectionResult): number | null {
  const f = r.frequencies;
  if (Array.isArray(f) && f.length > 0) {
    const v = f[0];
    if (typeof v === 'number' && Number.isFinite(v) && v > 40 && v < 2000) return v;
  }
  return null;
}

/** First letter chord root, optional #/b */
function chordRootBase(chord: string): string | null {
  const s = chord.trim();
  if (!s || s === '—' || s === 'N/C') return null;
  const m = s.match(/^([A-Ga-g])([#b♯♭]?)/i);
  if (!m) return null;
  return m[1].toUpperCase();
}

function chordLabelMatchesStringRoot(chord: string, stringNum: OpenStringNum): boolean {
  const base = chordRootBase(chord);
  if (!base) return false;
  const want = ROOT_BY_STRING[stringNum];
  return base === want;
}

function dominantNotesHint(r: ChordDetectionResult, stringNum: OpenStringNum): boolean {
  const dn = r.dominant_notes;
  if (!Array.isArray(dn) || dn.length === 0) return false;
  const want = ROOT_BY_STRING[stringNum];
  return dn.some((n) => String(n).toUpperCase().startsWith(want));
}

/**
 * True if this detection is a confident match for the given open string.
 */
export function detectionMatchesOpenString(result: ChordDetectionResult, stringNum: OpenStringNum): boolean {
  const freq = primaryFrequencyHz(result);
  const [lo, hi] = F0_BAND[stringNum];

  if (freq != null) {
    if (freq >= lo && freq <= hi) return true;
    // Wrong band for this string — reject even if chord label matches
    if (stringNum === 6 && freq >= F0_BAND[1][0]) return false;
    if (stringNum === 1 && freq <= F0_BAND[6][1]) return false;
  }

  const fromRaw = rawChordLabelFromResult(result);
  const ch =
    fromRaw ??
    (result.type === 'chord' ? result.chord ?? result.raw_chord ?? result.final_chord : null) ??
    result.chord_candidate ??
    '';

  if (typeof ch === 'string' && ch.length > 0 && chordLabelMatchesStringRoot(ch, stringNum)) {
    if (stringNum === 6) {
      if (freq != null && freq > 150) return false;
      return true;
    }
    if (stringNum === 1) {
      if (freq != null && freq < 200) return false;
      return true;
    }
    if (freq != null && (freq < lo || freq > hi)) return false;
    return true;
  }

  if (dominantNotesHint(result, stringNum)) {
    if (stringNum === 6 && freq != null && freq > 150) return false;
    if (stringNum === 1 && freq != null && freq < 200) return false;
    return true;
  }

  // Single-note payloads
  if (Array.isArray(result.notes) && result.notes.length > 0) {
    const row = result.notes[0] as unknown;
    const name =
      Array.isArray(row) && row.length > 0
        ? String(row[0]).toUpperCase()
        : typeof row === 'string'
          ? row.toUpperCase()
          : '';
    const want = ROOT_BY_STRING[stringNum];
    if (name.startsWith(want)) {
      if (stringNum === 6 && freq != null && freq > 150) return false;
      if (stringNum === 1 && freq != null && freq < 200) return false;
      return true;
    }
  }

  return false;
}

/** Target for current hit within a listen step (0-based index into listenTargets). */
export function getListenTargetString(
  step: {
    listenTargets?: OpenStringNum[];
    fretboardHighlightStrings?: number[];
    hitsRequired?: number;
  },
  hitIndexSoFar: number
): OpenStringNum | null {
  const targets = step.listenTargets;
  if (targets?.length) {
    const idx = Math.min(hitIndexSoFar, targets.length - 1);
    return targets[idx] ?? null;
  }
  const fb = step.fretboardHighlightStrings;
  if (!fb?.length) return null;
  const idx = Math.min(hitIndexSoFar, fb.length - 1);
  const n = fb[idx];
  if (typeof n === 'number' && n >= 1 && n <= 6) return n as OpenStringNum;
  return null;
}
