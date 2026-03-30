/**
 * Compact 6-string diagram (open/muted/fretted) — same layout as SongPractice / TechniqueTheoryPractice.
 * highlightStringNumbers: guitar string numbers 6 = low E (top) … 1 = high e (bottom).
 */
import React from 'react';

const STRING_LABELS_WIDTH = 48;
const NOTE_HEIGHT = 28;
const NOTE_MIN_WIDTH = 36;
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
const STRING_COLORS = ['#8B5A2B', '#A06E3C', '#B4824F', '#BE9160', '#C8A070', '#D2AF80'];

/** Centers are 100/6% apart; note cells are NOTE_HEIGHT px — need H ≥ 6×NOTE_HEIGHT to avoid overlap. */
const MIN_HEIGHT_NO_OVERLAP = Math.ceil(NOTE_HEIGHT * 6 + 12);

function parseAccentRgb(accent: string): { r: number; g: number; b: number } {
  const m = accent.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return { r: 249, g: 115, b: 22 };
}

function getStringY(stringNum: number): number {
  const stringIndex = 6 - stringNum;
  const stringHeight = 100 / 6;
  return stringIndex * stringHeight + stringHeight / 2;
}

export type FretboardDiagramFeedback = 'correct' | 'wrong' | null;

export interface GuitarFretboardDiagramProps {
  /** Per string, low E first: [6th,5th,…,1st] same as CHORD_FINGERINGS */
  fingering: number[];
  accentColor?: string;
  /** Highlight these string numbers (1–6) with a ring */
  highlightStringNumbers?: number[];
  /** When set, ring / colors on highlighted strings (e.g. green = matched detector) */
  feedback?: FretboardDiagramFeedback;
  minHeight?: number;
  /** Softer chrome when nested inside a frosted activity card (less double-border). */
  embedded?: boolean;
  /**
   * If set, only these strings (1–6) get a note cell (○ / fret / ×). Others keep the string line only.
   * Use for single-string pluck steps so other open strings don’t look like things to play.
   */
  stringsWithNoteMarkers?: number[];
}

export function GuitarFretboardDiagram({
  fingering,
  accentColor = 'rgb(249, 115, 22)',
  highlightStringNumbers,
  feedback = null,
  minHeight = 200,
  embedded = false,
  stringsWithNoteMarkers,
}: GuitarFretboardDiagramProps) {
  const highlight = new Set(highlightStringNumbers ?? []);
  const markerStrings =
    stringsWithNoteMarkers != null && stringsWithNoteMarkers.length > 0
      ? new Set(stringsWithNoteMarkers)
      : null;
  const heightPx = Math.max(minHeight, MIN_HEIGHT_NO_OVERLAP);
  const { r: ar, g: ag, b: ab } = parseAccentRgb(accentColor);

  const outerClass = embedded
    ? 'relative overflow-hidden rounded-xl bg-white/92 dark:bg-slate-800/92 border border-gray-200/90 dark:border-slate-600/85 shadow-[0_1px_3px_rgba(0,0,0,0.06)] w-full'
    : 'relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-gray-200 dark:border-slate-600 w-full';

  const labelRailClass = embedded
    ? 'absolute left-0 top-0 bottom-0 z-40 flex flex-col bg-white/92 dark:bg-slate-800/92 border-r border-gray-200/90 dark:border-slate-600/80'
    : 'absolute left-0 top-0 bottom-0 z-40 flex flex-col bg-white/95 dark:bg-slate-800 border-r-2 border-gray-200 dark:border-slate-600';

  return (
    <div className={outerClass} style={{ minHeight: heightPx }}>
      <div className={labelRailClass} style={{ width: STRING_LABELS_WIDTH }}>
        {STRING_NAMES.map((name, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center text-sm font-bold"
            style={{ color: STRING_COLORS[i] }}
          >
            {name}
          </div>
        ))}
      </div>

      <div className="absolute top-0 bottom-0 right-0 overflow-hidden" style={{ left: STRING_LABELS_WIDTH }}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const stringNum = 6 - i;
          const yPercent = (i + 0.5) * (100 / 6);
          const dimmed = markerStrings && !markerStrings.has(stringNum);
          return (
            <div
              key={`string-${i}`}
              className="absolute left-0 right-0"
              style={{
                top: `${yPercent}%`,
                height: 2,
                backgroundColor: dimmed ? 'rgba(209, 213, 219, 0.35)' : '#D1D5DB',
                transform: 'translateY(-50%)',
              }}
            />
          );
        })}

        {([1, 2, 3, 4, 5, 6] as const).map((stringNum) => {
          if (markerStrings && !markerStrings.has(stringNum)) return null;
          const fret = fingering[stringNum - 1] ?? 0;
          const isOpen = fret === 0;
          const isMute = fret === -1;
          const noteY = getStringY(stringNum);
          const isHi = highlight.has(stringNum);
          let colors: { bg: string; border: string; text: string };
          if (isMute) {
            colors = { bg: '#E5E7EB', border: '#D1D5DB', text: '#9CA3AF' };
          } else if (isOpen) {
            colors = { bg: '#FFFFFF', border: '#9CA3AF', text: '#374151' };
          } else {
            colors = { bg: accentColor, border: accentColor, text: '#FFFFFF' };
          }
          const baseShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          let ring = '';
          if (isHi && feedback === 'correct') {
            ring = '0 0 0 3px rgba(34, 197, 94, 0.65), 0 2px 8px rgba(34, 197, 94, 0.35)';
          } else if (isHi && feedback === 'wrong') {
            ring = '0 0 0 3px rgba(239, 68, 68, 0.55), 0 2px 8px rgba(239, 68, 68, 0.25)';
          } else if (isHi) {
            ring = `0 0 0 3px rgba(${ar}, ${ag}, ${ab}, 0.5), 0 2px 8px rgba(${ar}, ${ag}, ${ab}, 0.22), ${baseShadow}`;
          }
          let cellBg = colors.bg;
          let cellBorder = colors.border;
          let cellText = colors.text;
          if (isHi && feedback === 'correct') {
            cellBg = '#DCFCE7';
            cellBorder = '#22C55E';
            cellText = '#16A34A';
          } else if (isHi && feedback === 'wrong') {
            cellBg = '#FEE2E2';
            cellBorder = '#EF4444';
            cellText = '#DC2626';
          }
          return (
            <div
              key={stringNum}
              className="absolute flex items-center justify-center rounded-lg font-bold text-sm select-none"
              style={{
                left: `calc(50% - ${NOTE_MIN_WIDTH / 2}px)`,
                top: `calc(${noteY}% - ${NOTE_HEIGHT / 2}px)`,
                width: NOTE_MIN_WIDTH,
                height: NOTE_HEIGHT,
                backgroundColor: cellBg,
                border: `2px solid ${cellBorder}`,
                borderBottomWidth: 3,
                color: cellText,
                boxShadow: ring ? ring : baseShadow,
                zIndex: 10,
              }}
            >
              {isMute ? '×' : isOpen ? '○' : fret}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** All strings open — common for Getting Started plucks */
export const OPEN_STRINGS_FINGERING: number[] = [0, 0, 0, 0, 0, 0];
