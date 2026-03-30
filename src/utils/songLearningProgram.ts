import type { NoteEvent } from './songDataService';

/** Preserve song order, drop duplicates. */
export function orderedUniqueChords(chords: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of chords || []) {
    const k = c.trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

export interface SongPracticeSection {
  label: string;
  /** Start time in seconds on the original (pre–lead-in) event timeline. */
  startSec: number;
  /** End time in seconds (exclusive) on the original timeline. */
  endSec: number;
}

function targetSectionCount(spanSec: number): number {
  // Scale sections by song length so longer songs get more gradual ramps.
  if (spanSec <= 25) return 2;
  if (spanSec <= 45) return 3;
  if (spanSec <= 80) return 4;
  if (spanSec <= 130) return 5;
  if (spanSec <= 200) return 6;
  return 7;
}

/**
 * Cumulative windows from the start of the timeline: each step adds more of the song
 * until the last segment stops short of the full span so the wizard’s final step is clearly “full song”.
 */
export function buildPracticeSections(events: NoteEvent[], preferredCount = 5): SongPracticeSection[] {
  if (!events.length) {
    return [{ label: 'Warm-up', startSec: 0, endSec: 1 }];
  }
  let t0 = Infinity;
  let t1 = 0;
  for (const e of events) {
    t0 = Math.min(t0, e.time);
    t1 = Math.max(t1, e.time + e.duration);
  }
  if (!Number.isFinite(t0)) t0 = 0;
  const span = Math.max(t1 - t0, 2);
  const n = Math.max(2, Math.min(targetSectionCount(span), Math.max(2, preferredCount)));
  const sections: SongPracticeSection[] = [];
  for (let i = 0; i < n; i++) {
    const startSec = t0;
    const frac = (i + 1) / (n + 1);
    const endSec = t0 + frac * span;
    const pct = Math.round(frac * 100);
    const label = `From the start · ~${pct}% of the song (${i + 1} of ${n})`;
    sections.push({ label, startSec, endSec });
  }
  return sections;
}
