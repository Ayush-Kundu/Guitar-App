/**
 * Legacy: alternated quiz ↔ chord-practice per lesson. No longer used by TechniqueTheory (replaced by
 * Getting Started checkpoints). Kept for localStorage compatibility if reintroduced later.
 */

export type TechniqueTheoryLessonPhase = 'quiz' | 'practice';

function storageKey(userId: string, lessonId: string): string {
  return `strummy-tt-lesson-phase-${userId}-${lessonId}`;
}

/** Session to run when the user opens this lesson now (default: quiz first). */
export function getLessonSessionPhase(userId: string, lessonId: string): TechniqueTheoryLessonPhase {
  if (typeof window === 'undefined') return 'quiz';
  try {
    const v = localStorage.getItem(storageKey(userId, lessonId));
    return v === 'practice' ? 'practice' : 'quiz';
  } catch {
    return 'quiz';
  }
}

/** Call after a successful quiz (100% Done) — next open is practice. */
export function markLessonSessionQuizFinished(userId: string, lessonId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(userId, lessonId), 'practice');
  } catch {
    /* ignore */
  }
}

/** Call after practice session completes — next open is quiz. */
export function markLessonSessionPracticeFinished(userId: string, lessonId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(userId, lessonId), 'quiz');
  } catch {
    /* ignore */
  }
}
