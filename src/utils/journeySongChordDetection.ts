/**
 * Chord labels from the detector. SongPractice uses song context + final_chord;
 * journey checkpoints use raw `chord` / `raw_chord` only (no song constraint).
 */

import type { ChordDetectionResult } from './chordDetection';

function firstPitchClassFromNotes(notes: ChordDetectionResult['notes']): string | null {
  if (!Array.isArray(notes) || notes.length === 0) return null;
  const row = notes[0];
  const s = Array.isArray(row) ? String(row[0]) : String(row);
  const m = s.match(/^([A-Ga-g])([#b♯♭]?)/);
  if (!m) return null;
  const acc =
    m[2] === '#' || m[2] === '♯' ? '#' : m[2] === 'b' || m[2] === '♭' ? 'b' : '';
  return m[1].toUpperCase() + acc;
}

/**
 * Detector output without song-constrained `final_chord` priority.
 * Order: `chord` → `raw_chord` → `final_chord` (last resort).
 */
export function rawChordLabelFromResult(result: ChordDetectionResult): string | null {
  if (result.type === 'chord') {
    const ch = result.chord ?? result.raw_chord ?? result.final_chord;
    if (ch && String(ch) !== '—' && String(ch) !== 'N/C') return String(ch);
    return null;
  }
  if (result.type === 'notes') {
    if (result.chord_candidate && String(result.chord_candidate).trim()) {
      return String(result.chord_candidate);
    }
    return firstPitchClassFromNotes(result.notes);
  }
  return null;
}

export function journeyChordLabelFromResult(result: ChordDetectionResult): string | null {
  const songId = result._currentSongId as string | undefined;

  if (result.type === 'chord') {
    if (result.song_constrained && songId) {
      const fc = result.final_chord;
      if (fc && fc !== '—' && fc !== 'N/C') return fc;
      return null;
    }
    const ch = result.chord ?? result.final_chord ?? result.raw_chord;
    if (ch && String(ch) !== '—' && String(ch) !== 'N/C') return String(ch);
    return null;
  }

  if (result.type === 'notes') {
    if (songId) {
      const c = result.chord_candidate;
      if (c && String(c).trim() && !/^[\s—]+$/i.test(String(c)) && String(c) !== 'N/C') {
        return String(c);
      }
      return null;
    }
    if (result.chord_candidate && String(result.chord_candidate).trim()) {
      return String(result.chord_candidate);
    }
    const fromNotes = firstPitchClassFromNotes(result.notes);
    if (fromNotes) return fromNotes;
  }

  return null;
}

/**
 * Label for checkpoint listen steps — always raw detector chord, never song-constrained final_chord.
 */
export function checkpointListenLabelFromResult(result: ChordDetectionResult): string | null {
  const primary = rawChordLabelFromResult(result);
  if (primary) return primary;

  const raw = result.raw_chord && String(result.raw_chord).trim();
  if (raw && raw !== '—' && raw !== 'N/C') return raw;

  if (result.chord && String(result.chord).trim()) return String(result.chord);

  const fromNotes = firstPitchClassFromNotes(result.notes);
  if (fromNotes) return fromNotes;

  return null;
}

/** Confidence aligned with raw chord (prefer primary confidence, not final-only). */
export function checkpointResultConfidence(result: ChordDetectionResult): number {
  const c = result.confidence ?? result.raw_confidence ?? result.final_confidence;
  return typeof c === 'number' && Number.isFinite(c) ? c : 0;
}
