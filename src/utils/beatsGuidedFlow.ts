/** Novice/beginner sequential Beats guidance (session-only). */

export type GuidedBeatsStep = 'technique' | 'theory' | 'songs';

const ACTIVE_KEY = 'strummy-beats-guided-active';
const STEP_KEY = 'strummy-beats-guided-step';

export function shouldUseGuidedBeatsLevel(level: string | undefined): boolean {
  const l = (level || 'novice').toLowerCase();
  return l === 'novice' || l === 'beginner';
}

export function startGuidedBeatsFlow(): void {
  try {
    sessionStorage.setItem(ACTIVE_KEY, '1');
    sessionStorage.setItem(STEP_KEY, 'technique');
    sessionStorage.setItem('strummy-beats-directed', 'technique');
  } catch (_) {}
}

export function isGuidedBeatsFlowActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(ACTIVE_KEY) === '1';
  } catch (_) {
    return false;
  }
}

export function getGuidedBeatsStep(): GuidedBeatsStep | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = sessionStorage.getItem(STEP_KEY);
    if (s === 'technique' || s === 'theory' || s === 'songs') return s;
  } catch (_) {}
  return null;
}

export function setGuidedBeatsStep(step: GuidedBeatsStep): void {
  try {
    sessionStorage.setItem(STEP_KEY, step);
    sessionStorage.setItem('strummy-beats-directed', step === 'songs' ? 'songs' : step);
  } catch (_) {}
}

export function clearGuidedBeatsFlow(): void {
  try {
    sessionStorage.removeItem(ACTIVE_KEY);
    sessionStorage.removeItem(STEP_KEY);
    sessionStorage.removeItem('strummy-beats-directed');
  } catch (_) {}
}

export function getGuidedBeatsMessage(step: GuidedBeatsStep): string {
  switch (step) {
    case 'technique':
      return 'Complete one technique lesson here.';
    case 'theory':
      return 'Switch to the Theory tab and complete one theory lesson.';
    case 'songs':
      return 'Open Songs and practice one of your favorites for a few minutes.';
    default:
      return '';
  }
}

export function guidedStepMatchesSection(
  step: GuidedBeatsStep,
  section: string
): boolean {
  if (step === 'songs') return section === 'songs';
  return section === step;
}

/** After completing a technique lesson while guided flow expects technique. */
export function advanceGuidedAfterTechniqueLesson(): void {
  if (!isGuidedBeatsFlowActive() || getGuidedBeatsStep() !== 'technique') return;
  setGuidedBeatsStep('theory');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('strummy-guided-beats-navigate', { detail: { section: 'theory' } })
    );
  }
}

/** After completing a theory lesson while guided flow expects theory. */
export function advanceGuidedAfterTheoryLesson(): void {
  if (!isGuidedBeatsFlowActive() || getGuidedBeatsStep() !== 'theory') return;
  setGuidedBeatsStep('songs');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('strummy-guided-beats-navigate', { detail: { section: 'songs' } })
    );
  }
}

/** Call when user has practiced songs (e.g. logged minutes) during songs step. */
export function completeGuidedSongsStepIfActive(): void {
  if (!isGuidedBeatsFlowActive() || getGuidedBeatsStep() !== 'songs') return;
  clearGuidedBeatsFlow();
}
