/**
 * Journey checkpoints: bespoke activities for Getting Started (tech-unit-1),
 * topic-aware play-along for other technique units, short reflect for theory.
 */

import type { Unit, Lesson } from './learning-journey';
import type { OpenStringNum } from '../utils/gettingStartedListenValidation';
import { getPracticeChordsOrPhysicalFallback } from './lesson-content';
import { getChordFingering, highlightStringsForFingering } from '../utils/chordFingerings';

export type CheckpointStepKind = 'read' | 'listen';

export interface GettingStartedCheckpointStep {
  kind: CheckpointStepKind;
  text: string;
  showFretboard?: boolean;
  expectedChords?: string[];
  minConfidence?: number;
  hitsRequired?: number;
  fretboardHighlightStrings?: number[];
  listenTargets?: OpenStringNum[];
  practiceSong?: { title: string; artist?: string };
}

export interface GettingStartedCheckpointDef {
  id: string;
  title: string;
  subtitle: string;
  /** Parent unit title — shown in the activity modal header */
  unitTitle?: string;
  estimatedTime: string;
  steps: GettingStartedCheckpointStep[];
  practiceSong?: { title: string; artist?: string };
}

/** Open string: number + pitch (short). */
const OPEN_STRING_DESC: Record<number, string> = {
  6: '6 · low E',
  5: '5 · A',
  4: '4 · D',
  3: '3 · G',
  2: '2 · B',
  1: '1 · high e',
};

function chordListenStep(chord: string): GettingStartedCheckpointStep {
  const f = getChordFingering(chord);
  const hi = highlightStringsForFingering(f);
  const hint = hi.length ? `Strings ${hi.join(', ')} fretted as shown.` : 'Follow the diagram.';
  return {
    kind: 'listen',
    text: `${chord}: ${hint} Play until the diagram shows a match.`,
    expectedChords: [chord],
    minConfidence: 0.28,
    fretboardHighlightStrings: hi,
  };
}

/** Unique chords derived from the two quizzes this activity follows (same logic as lesson practice). */
function uniqueChordsForPair(a: Lesson, b?: Lesson): string[] {
  const acc: string[] = [];
  const seen = new Set<string>();
  const add = (L: Lesson) => {
    for (const c of getPracticeChordsOrPhysicalFallback(L.title, L.description)) {
      const n = c.trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        acc.push(n);
      }
    }
  };
  add(a);
  if (b) add(b);
  return acc;
}

function techUnit2Checkpoint(
  id: string,
  pairIndex: number,
  unit: Unit,
  sub: string
): GettingStartedCheckpointDef | null {
  if (unit.id !== 'tech-unit-2') return null;
  const base: Pick<GettingStartedCheckpointDef, 'unitTitle'> = { unitTitle: unit.title };
  if (pairIndex === 0) {
    return {
      id,
      title: 'Quick check',
      subtitle: sub,
      ...base,
      estimatedTime: '~4 min',
      steps: [
        {
          kind: 'read',
          text: 'Thumb behind neck · fingertips behind frets.',
          showFretboard: false,
        },
        {
          kind: 'listen',
          text: `Pluck ${OPEN_STRING_DESC[6]} once, clearly.`,
          expectedChords: ['E'],
          minConfidence: 0.32,
          fretboardHighlightStrings: [6],
        },
        {
          kind: 'listen',
          text: `Pluck ${OPEN_STRING_DESC[1]} once, clearly.`,
          minConfidence: 0.35,
          fretboardHighlightStrings: [1],
          listenTargets: [1],
        },
      ],
    };
  }
  if (pairIndex === 1) {
    return {
      id,
      title: 'Quick check',
      subtitle: sub,
      ...base,
      estimatedTime: '~5 min',
      steps: [
        {
          kind: 'read',
          text: 'Thumb supports neck · one finger per fret.',
          showFretboard: false,
        },
        {
          kind: 'listen',
          text: `Pluck ${OPEN_STRING_DESC[5]}, then ${OPEN_STRING_DESC[4]}.`,
          minConfidence: 0.32,
          hitsRequired: 2,
          fretboardHighlightStrings: [5, 4],
          listenTargets: [5, 4],
        },
        {
          kind: 'listen',
          text: `Pluck ${OPEN_STRING_DESC[3]}, then ${OPEN_STRING_DESC[2]}.`,
          minConfidence: 0.32,
          hitsRequired: 2,
          fretboardHighlightStrings: [3, 2],
          listenTargets: [3, 2],
        },
      ],
    };
  }
  return null;
}

/** Index = pair index (0 = after lessons 1–2, 1 = after lessons 3–4). */
export const GETTING_STARTED_CHECKPOINTS: GettingStartedCheckpointDef[] = [
  {
    id: 'gs-cp-hold-hands',
    title: 'Hold & pluck',
    subtitle: 'Lessons 1–2',
    unitTitle: 'Getting Started',
    estimatedTime: '~4 min',
    steps: [
      {
        kind: 'read',
        text: 'Balanced hold · thumb behind · strum hand over sound hole.',
        showFretboard: false,
      },
      {
        kind: 'listen',
        text: `Pluck ${OPEN_STRING_DESC[6]} once; let it ring.`,
        minConfidence: 0.32,
        fretboardHighlightStrings: [6],
        listenTargets: [6],
      },
      {
        kind: 'listen',
        text: `Pluck ${OPEN_STRING_DESC[1]} once; let it ring.`,
        minConfidence: 0.35,
        fretboardHighlightStrings: [1],
        listenTargets: [1],
      },
    ],
  },
  {
    id: 'gs-cp-sound-strings',
    title: 'Open strings',
    subtitle: 'Lessons 3–4',
    unitTitle: 'Getting Started',
    estimatedTime: '~5 min',
    steps: [
      {
        kind: 'read',
        text: 'Order thick→thin: E-A-D-G-B-e.',
      },
      {
        kind: 'listen',
        text: `${OPEN_STRING_DESC[6]}, then ${OPEN_STRING_DESC[5]} (two plucks).`,
        minConfidence: 0.32,
        hitsRequired: 2,
        fretboardHighlightStrings: [6, 5],
        listenTargets: [6, 5],
      },
      {
        kind: 'listen',
        text: `${OPEN_STRING_DESC[4]}, then ${OPEN_STRING_DESC[3]} (two plucks).`,
        minConfidence: 0.32,
        hitsRequired: 2,
        fretboardHighlightStrings: [4, 3],
        listenTargets: [4, 3],
      },
    ],
  },
];

export function getGettingStartedCheckpointById(id: string): GettingStartedCheckpointDef | undefined {
  return GETTING_STARTED_CHECKPOINTS.find((c) => c.id === id);
}

/**
 * After each pair of quizzes when no bespoke checkpoint exists.
 * Technique: mic check with chords/strings tied to lesson topics. Theory: short reflect (no mic).
 */
export function buildJourneyCheckpoint(
  unit: Unit,
  pairIndex: number,
  pathType: 'technique' | 'theory'
): GettingStartedCheckpointDef {
  const id = `${unit.id}-cp-${pairIndex}`;
  const i = pairIndex * 2;
  const a = unit.lessons[i];
  const b = unit.lessons[i + 1];
  const sub = b ? `${a.title} · ${b.title}` : a.title;

  const tech2 = pathType === 'technique' ? techUnit2Checkpoint(id, pairIndex, unit, sub) : null;
  if (tech2) return tech2;

  if (pathType === 'theory') {
    return {
      id,
      title: 'Reflect',
      subtitle: sub,
      unitTitle: unit.title,
      estimatedTime: '~1 min',
      steps: [
        { kind: 'read', text: `Covered: ${sub}.`, showFretboard: false },
        { kind: 'read', text: 'Tap Continue when ready.', showFretboard: false },
      ],
    };
  }

  const chords = uniqueChordsForPair(a, b).slice(0, 3);
  const steps: GettingStartedCheckpointStep[] = [
    { kind: 'read', text: `Quick apply: ${sub}.`, showFretboard: false },
    ...chords.map((ch) => chordListenStep(ch)),
  ];

  return {
    id,
    title: 'Quick check',
    subtitle: sub,
    unitTitle: unit.title,
    estimatedTime: chords.length ? `~${2 + chords.length} min` : '~2 min',
    steps,
  };
}

/** @deprecated Use buildJourneyCheckpoint — kept for imports */
export function buildDefaultReflectionCheckpoint(
  unit: Unit,
  pairIndex: number,
  pathType: 'technique' | 'theory'
): GettingStartedCheckpointDef {
  return buildJourneyCheckpoint(unit, pairIndex, pathType);
}

export function checkpointCountForUnit(unit: Unit): number {
  return Math.ceil(unit.lessons.length / 2);
}

/** Open string number → pitch class (same as checkpoint listen matching). */
const OPEN_STRING_ROOT: Record<number, string> = {
  6: 'E',
  5: 'A',
  4: 'D',
  3: 'G',
  2: 'B',
  1: 'E',
};

/**
 * Chord list for SongPractice after this activity — only material the user just practiced
 * (expected chords + open-string roots from pluck steps). Empty for read-only / theory reflect.
 */
export function getPracticeChordsForCheckpoint(def: GettingStartedCheckpointDef): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (c: string) => {
    const n = c.trim();
    if (!n || seen.has(n)) return;
    seen.add(n);
    out.push(n);
  };
  for (const step of def.steps) {
    if (step.expectedChords?.length) {
      for (const c of step.expectedChords) add(c);
    }
    if (step.listenTargets?.length) {
      for (const t of step.listenTargets) {
        const r = OPEN_STRING_ROOT[t];
        if (r) add(r);
      }
    }
  }
  return out;
}
