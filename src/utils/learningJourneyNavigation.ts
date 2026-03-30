/**
 * Shared flattened journey rows (quizzes + activities) and unlock/done logic
 * for Technique & Theory — used by TechniqueTheory and Beats messaging.
 */

import type { Unit, Lesson, GuitarLevel } from '../data/learning-journey';
import { getTechniquePath, getTheoryPath } from '../data/learning-journey';
import {
  GETTING_STARTED_CHECKPOINTS,
  buildJourneyCheckpoint,
  type GettingStartedCheckpointDef,
} from '../data/getting-started-checkpoints';
import { isCheckpointActivityComplete } from './checkpointActivityProgress';

export type JourneyFlatRow =
  | { kind: 'quiz'; key: string; lesson: Lesson }
  | { kind: 'checkpoint'; key: string; checkpointDef: GettingStartedCheckpointDef };

/** Every two quizzes → one activity checkpoint (Getting Started bespoke; else topic-aware builder). */
export function buildUnitFlatRows(unit: Unit, pathType: 'technique' | 'theory'): JourneyFlatRow[] {
  const rows: JourneyFlatRow[] = [];
  const bespoke = unit.id === 'tech-unit-1' ? GETTING_STARTED_CHECKPOINTS : null;

  for (let i = 0; i < unit.lessons.length; i += 2) {
    rows.push({ kind: 'quiz', key: `quiz:${unit.lessons[i].id}`, lesson: unit.lessons[i] });
    if (i + 1 < unit.lessons.length) {
      rows.push({
        kind: 'quiz',
        key: `quiz:${unit.lessons[i + 1].id}`,
        lesson: unit.lessons[i + 1],
      });
    }
    const pairIndex = i / 2;
    const checkpointDef = bespoke?.[pairIndex] ?? buildJourneyCheckpoint(unit, pairIndex, pathType);
    rows.push({
      kind: 'checkpoint',
      key: `cp:${checkpointDef.id}`,
      checkpointDef,
    });
  }
  return rows;
}

function lessonIndexInUnit(unit: Unit, lessonId: string): number {
  return unit.lessons.findIndex((l) => l.id === lessonId);
}

export function isLessonUnlockedInUnit(unit: Unit, lesson: Lesson, completedLessons: Set<string>): boolean {
  const idx = lessonIndexInUnit(unit, lesson.id);
  if (idx <= 0) return true;
  return completedLessons.has(unit.lessons[idx - 1].id);
}

export function isJourneyRowDone(
  row: JourneyFlatRow,
  userId: string,
  completedLessons: Set<string>
): boolean {
  if (row.kind === 'checkpoint') {
    return isCheckpointActivityComplete(userId, row.checkpointDef.id);
  }
  return completedLessons.has(row.lesson.id);
}

export function isJourneyRowUnlocked(
  unit: Unit,
  rows: JourneyFlatRow[],
  index: number,
  userId: string,
  completedLessons: Set<string>
): boolean {
  const row = rows[index];
  const prev = index > 0 ? rows[index - 1] : null;

  if (!prev) {
    if (row.kind !== 'quiz') return false;
    return isLessonUnlockedInUnit(unit, row.lesson, completedLessons);
  }

  if (!isJourneyRowDone(prev, userId, completedLessons)) return false;

  if (row.kind === 'quiz' && prev.kind === 'checkpoint') {
    return isLessonUnlockedInUnit(unit, row.lesson, completedLessons);
  }

  return true;
}

export function isJourneyUnitFullyDone(
  unit: Unit,
  userId: string,
  completedLessons: Set<string>,
  pathType: 'technique' | 'theory'
): boolean {
  const rows = buildUnitFlatRows(unit, pathType);
  return rows.every((r) => isJourneyRowDone(r, userId, completedLessons));
}

export function isUnitUnlockedInPath(
  unit: Unit,
  path: Unit[],
  userId: string,
  completedLessons: Set<string>,
  pathType: 'technique' | 'theory'
): boolean {
  return unit.prerequisiteUnits.every((prereqId) => {
    const prereq = path.find((u) => u.id === prereqId);
    if (!prereq) return true;
    return isJourneyUnitFullyDone(prereq, userId, completedLessons, pathType);
  });
}

/** First unlocked, not-done row on the path, or null if caught up / nothing unlocked. */
export function getNextOpenJourneyRow(
  userId: string,
  level: GuitarLevel,
  pathType: 'technique' | 'theory',
  completedLessons: Set<string>
): { unit: Unit; row: JourneyFlatRow; rowIndex: number } | null {
  const path = pathType === 'technique' ? getTechniquePath(level) : getTheoryPath(level);
  for (const unit of path) {
    if (!isUnitUnlockedInPath(unit, path, userId, completedLessons, pathType)) continue;
    const rows = buildUnitFlatRows(unit, pathType);
    for (let i = 0; i < rows.length; i++) {
      if (!isJourneyRowUnlocked(unit, rows, i, userId, completedLessons)) continue;
      if (isJourneyRowDone(rows[i], userId, completedLessons)) continue;
      return { unit, row: rows[i], rowIndex: i };
    }
  }
  return null;
}
