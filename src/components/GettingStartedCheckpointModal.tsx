import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { X, ChevronRight, CheckCircle2, Trophy, Hand, BookOpen, Clock } from 'lucide-react';
import { ChordDetectionService, ChordDetectionResult } from '../utils/chordDetection';
import type { GettingStartedCheckpointDef, GettingStartedCheckpointStep } from '../data/getting-started-checkpoints';
import { markCheckpointActivityComplete } from '../utils/checkpointActivityProgress';
import { GuitarFretboardDiagram, OPEN_STRINGS_FINGERING } from './GuitarFretboardDiagram';
import { getChordFingering } from '../utils/chordFingerings';
import { techniqueTheoryChordMatch } from '../utils/techniqueChordMatch';
import {
  checkpointListenLabelFromResult,
  checkpointResultConfidence,
} from '../utils/journeySongChordDetection';
import {
  detectionMatchesOpenString,
  getListenTargetString,
} from '../utils/gettingStartedListenValidation';

const font = '"Nunito", "Segoe UI", system-ui, sans-serif';

/** Open string number → pitch class (for matching plucks to expected chord like E on string 6) */
const OPEN_STRING_ROOT: Record<number, string> = {
  6: 'E',
  5: 'A',
  4: 'D',
  3: 'G',
  2: 'B',
  1: 'E',
};

function stepMinConfidence(step: GettingStartedCheckpointStep): number {
  return step.kind === 'listen' ? step.minConfidence ?? 0.38 : 0;
}

function stepHitsRequired(step: GettingStartedCheckpointStep): number {
  return step.kind === 'listen' ? Math.max(1, step.hitsRequired ?? 1) : 1;
}

/** Raw chord / note activity — ignore song_constrained; use chord + primary confidence. */
function resultLooksLikeSound(r: ChordDetectionResult, minConf: number): boolean {
  if (r.type === 'silence' || r.type === 'listening') return false;

  if (r.type === 'chord') {
    const c = (r.confidence ?? r.raw_confidence ?? r.final_confidence ?? 0) as number;
    if (c < minConf) return false;
    const ch = r.chord ?? r.raw_chord ?? r.final_chord;
    return Boolean(ch && ch !== '—' && ch !== 'N/C');
  }
  if (r.type === 'notes' && r.chord_candidate) {
    const c = (r.confidence ?? 0) as number;
    return c >= minConf;
  }
  if (r.notes && Array.isArray(r.notes) && r.notes.length > 0) {
    const c = (r.confidence ?? 0) as number;
    return c >= minConf;
  }
  return false;
}

export interface GettingStartedCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  checkpoint: GettingStartedCheckpointDef;
  userLevel?: string;
  onComplete: () => void;
  /** Technique (orange) vs theory (blue) — matches journey tab. SongPractice-style shell keeps these accents. */
  journeyVariant?: 'technique' | 'theory';
}

export function GettingStartedCheckpointModal({
  isOpen,
  onClose,
  userId,
  checkpoint,
  userLevel,
  onComplete,
  journeyVariant = 'technique',
}: GettingStartedCheckpointModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [hitsInStep, setHitsInStep] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [finished, setFinished] = useState(false);
  const [validationHint, setValidationHint] = useState<string | null>(null);
  const [ttDetected, setTtDetected] = useState<string | null>(null);
  const [ttSatisfied, setTtSatisfied] = useState(false);

  const chordRef = useRef<ChordDetectionService | null>(null);
  const lastHitAtRef = useRef(0);
  const lastWrongAtRef = useRef(0);
  const hitsInStepRef = useRef(0);
  const ttSatisfiedRef = useRef(false);
  const listenAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    hitsInStepRef.current = hitsInStep;
  }, [hitsInStep]);

  const steps = checkpoint.steps;
  const current = steps[stepIndex];

  const listenEffectKey = useMemo(() => {
    const st = checkpoint.steps[stepIndex];
    if (st?.kind !== 'listen') return `${checkpoint.id}:${stepIndex}:read`;
    return [
      checkpoint.id,
      stepIndex,
      (st.expectedChords || []).join(','),
      (st.listenTargets || []).join(','),
      (st.fretboardHighlightStrings || []).join(','),
      st.hitsRequired ?? 1,
      st.minConfidence ?? '',
    ].join('|');
  }, [checkpoint.id, checkpoint.steps, stepIndex]);

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
    setHitsInStep(0);
    setFinished(false);
    lastHitAtRef.current = 0;
    lastWrongAtRef.current = 0;
    setValidationHint(null);
    setTtDetected(null);
    setTtSatisfied(false);
    ttSatisfiedRef.current = false;
  }, [isOpen, checkpoint.id]);

  useEffect(() => {
    setValidationHint(null);
    setTtDetected(null);
    setTtSatisfied(false);
    ttSatisfiedRef.current = false;
  }, [stepIndex]);

  useEffect(() => {
    bodyScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [stepIndex, finished, checkpoint.id]);

  useEffect(() => {
    if (!isOpen || finished) return;
    const step = checkpoint.steps[stepIndex];
    if (step?.kind !== 'listen') {
      if (chordRef.current) {
        chordRef.current.stopRecording();
        chordRef.current.disconnect();
        chordRef.current = null;
      }
      setConnectionStatus('connecting');
      return;
    }

    setConnectionStatus('connecting');
    setConnectionMessage('');
    setTtDetected(null);

    const service = new ChordDetectionService();
    chordRef.current = service;
    if (userLevel) service.setUserLevel(userLevel);

    service.setOnStatusChange((conn, msg) => {
      const isError = msg && /timeout|error|failed|disconnected|mic error/i.test(msg);
      setConnectionMessage(msg || '');
      if (isError) {
        setConnectionStatus('error');
      } else if (conn) {
        setConnectionStatus('connected');
      }
    });

    const minC = stepMinConfidence(step);
    const need = stepHitsRequired(step);

    service.setOnResult((result: ChordDetectionResult) => {
      if (step.expectedChords?.length) {
        if (ttSatisfiedRef.current) return;
        if (result.type === 'silence' || result.type === 'listening') {
          setTtDetected(null);
          return;
        }

        const label = checkpointListenLabelFromResult(result);
        const openTarget = getListenTargetString(step, 0);
        const openOk =
          openTarget != null && detectionMatchesOpenString(result, openTarget);
        const soundOk = resultLooksLikeSound(result, Math.max(0.12, minC * 0.4));
        if (!label && !openOk && !soundOk) {
          setTtDetected(null);
          return;
        }
        setTtDetected(label);

        let matched =
          Boolean(label) &&
          step.expectedChords!.some((e) => techniqueTheoryChordMatch(label, e));

        if (!matched && openOk && openTarget != null) {
          const root = OPEN_STRING_ROOT[openTarget];
          if (root) {
            matched = step.expectedChords!.some((e) => techniqueTheoryChordMatch(root, e));
          }
        }

        if (matched) {
          const conf = checkpointResultConfidence(result);
          const floor = Math.max(0.06, minC * 0.25);
          if (conf > 0 && conf < floor) return;
          ttSatisfiedRef.current = true;
          setTtSatisfied(true);
        }
        return;
      }

      if (!resultLooksLikeSound(result, minC)) return;

      const now = Date.now();
      const hi = hitsInStepRef.current;
      const targetString = getListenTargetString(step, hi);

      if (targetString != null) {
        if (!detectionMatchesOpenString(result, targetString)) {
          if (now - lastWrongAtRef.current > 500) {
            lastWrongAtRef.current = now;
            setValidationHint('Pluck only the highlighted open string.');
          }
          return;
        }
        setValidationHint(null);
      }

      if (now - lastHitAtRef.current < 550) return;
      lastHitAtRef.current = now;
      setHitsInStep((h) => {
        const nextHit = h + 1;
        if (nextHit >= need) {
          if (listenAdvanceTimeoutRef.current) {
            clearTimeout(listenAdvanceTimeoutRef.current);
            listenAdvanceTimeoutRef.current = null;
          }
          listenAdvanceTimeoutRef.current = window.setTimeout(() => {
            listenAdvanceTimeoutRef.current = null;
            setStepIndex((si) => {
              if (si + 1 >= checkpoint.steps.length) {
                setFinished(true);
                return si;
              }
              return si + 1;
            });
            setHitsInStep(0);
            setValidationHint(null);
          }, 400);
        }
        return nextHit;
      });
    });

    let cancelled = false;
    service.connect().then(async (ok) => {
      if (cancelled) return;
      if (!ok) {
        setConnectionStatus('error');
        setConnectionMessage('Could not reach chord detector.');
        return;
      }
      service.clearSongContext();
      const recordingOk = await service.startRecording();
      if (cancelled) return;
      if (!recordingOk) {
        setConnectionStatus('error');
        setConnectionMessage('Microphone access needed.');
      } else {
        setConnectionStatus('connected');
        service.clearSongContext();
      }
    });

    return () => {
      cancelled = true;
      if (listenAdvanceTimeoutRef.current) {
        clearTimeout(listenAdvanceTimeoutRef.current);
        listenAdvanceTimeoutRef.current = null;
      }
      if (chordRef.current) {
        chordRef.current.stopRecording();
        chordRef.current.disconnect();
        chordRef.current = null;
      }
    };
  }, [isOpen, finished, listenEffectKey, userLevel, checkpoint.id]);

  const handleClose = () => {
    if (listenAdvanceTimeoutRef.current) {
      clearTimeout(listenAdvanceTimeoutRef.current);
      listenAdvanceTimeoutRef.current = null;
    }
    if (chordRef.current) {
      chordRef.current.stopRecording();
      chordRef.current.disconnect();
      chordRef.current = null;
    }
    onClose();
  };

  const handleFinalDone = () => {
    if (listenAdvanceTimeoutRef.current) {
      clearTimeout(listenAdvanceTimeoutRef.current);
      listenAdvanceTimeoutRef.current = null;
    }
    markCheckpointActivityComplete(userId, checkpoint.id);
    if (chordRef.current) {
      chordRef.current.stopRecording();
      chordRef.current.disconnect();
      chordRef.current = null;
    }
    onComplete();
    onClose();
  };

  const continueTechniqueStep = () => {
    setTtSatisfied(false);
    ttSatisfiedRef.current = false;
    setTtDetected(null);
    setStepIndex((si) => {
      if (si + 1 >= steps.length) {
        setFinished(true);
        return si;
      }
      return si + 1;
    });
    setHitsInStep(0);
    setValidationHint(null);
  };

  const advanceRead = () => {
    if (stepIndex + 1 >= steps.length) setFinished(true);
    else {
      setStepIndex((s) => s + 1);
      setHitsInStep(0);
    }
  };

  // Match ActivityModal + TechniqueTheory journey (quiz modal family)
  const isTechnique = journeyVariant !== 'theory';
  const themeColor = isTechnique ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)';
  const themeBg = isTechnique ? 'rgb(255, 237, 213)' : 'rgb(219, 234, 254)';
  const themeBorderLight = isTechnique ? 'rgb(253, 186, 116)' : 'rgb(147, 197, 253)';
  const themeLight = isTechnique ? 'rgba(249, 115, 22, 0.08)' : 'rgba(59, 130, 246, 0.08)';
  const gradientClass = isTechnique
    ? 'from-orange-100 via-red-50 to-pink-100'
    : 'from-blue-100 via-indigo-50 to-purple-50';
  const cardStyle = { backgroundColor: 'rgba(255, 255, 255, 0.58)', border: '2.5px solid rgb(237, 237, 237)' as const };

  const needHits = current ? stepHitsRequired(current) : 1;
  const showFretboard = current ? current.showFretboard !== false : true;

  const ttExpected = current?.expectedChords;
  const ttHighlightStrings = current?.fretboardHighlightStrings ?? [];
  const diagramFingering =
    current?.kind === 'listen' && current.expectedChords?.length
      ? getChordFingering(current.expectedChords[0])
      : OPEN_STRINGS_FINGERING;
  const ttIsMatchLive = Boolean(
    ttDetected && ttExpected?.some((e) => techniqueTheoryChordMatch(ttDetected, e))
  );
  const ttIsWrongLive = Boolean(
    !ttSatisfied && ttDetected && ttExpected?.length && !ttIsMatchLive
  );
  const ttDiagramFeedback = ttSatisfied ? 'correct' : ttIsWrongLive ? 'wrong' : null;

  const openStringDiagramFeedback = validationHint ? 'wrong' : null;

  /** Open-string pluck steps: show ○ pills only on strings in this step (not all six). */
  const openPluckMarkerStrings =
    current?.kind === 'listen' &&
    !current.expectedChords?.length &&
    (current.fretboardHighlightStrings?.length || current.listenTargets?.length)
      ? [...new Set([...(current.fretboardHighlightStrings ?? []), ...(current.listenTargets ?? [])])]
      : undefined;

  const stepBadgeLabel =
    current?.kind === 'read'
      ? 'Read'
      : current?.kind === 'listen' && current.expectedChords?.length
        ? 'Play along'
        : current?.kind === 'listen'
          ? 'Open strings'
          : 'Step';

  /** Same CTA shell as ActivityModal “Start Quiz” / “Continue” */
  const ctaButtonClass =
    'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] touch-manipulation';
  const ctaButtonStyle: React.CSSProperties = {
    backgroundColor: themeBg,
    borderBottom: `2px solid ${themeBorderLight}`,
    color: themeColor,
    fontFamily: font,
  };
  const doneButtonClass =
    'w-full flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] touch-manipulation';
  const doneButtonStyle: React.CSSProperties = {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderBottom: '2px solid rgb(74, 222, 128)',
    color: 'rgb(22, 101, 52)',
    fontFamily: font,
    minHeight: 52,
    paddingTop: 14,
    paddingBottom: 14,
  };

  const headerSubtitleParts = [
    checkpoint.subtitle?.trim(),
    !finished ? `Step ${stepIndex + 1} of ${steps.length}` : 'Complete',
    checkpoint.unitTitle?.trim(),
  ].filter(Boolean) as string[];

  const progressPercent = steps.length ? Math.min(100, ((stepIndex + 1) / steps.length) * 100) : 0;

  const showFooterContinueRead = !finished && current?.kind === 'read';

  const showFooterContinueChord = !finished && current?.kind === 'listen' && Boolean(current.expectedChords?.length) && ttSatisfied;

  const getJourneyIcon = () =>
    isTechnique ? (
      <Hand className="w-4 h-4" style={{ color: 'inherit' }} />
    ) : (
      <BookOpen className="w-4 h-4" style={{ color: 'inherit' }} />
    );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className={`p-0 overflow-hidden [&>button:last-of-type]:hidden !flex flex-col min-h-0 gap-0 bg-gradient-to-br ${gradientClass} dark:from-gray-900 dark:via-slate-800 dark:to-gray-900`}
        style={{
          width: 'calc(100% - 1rem)',
          maxWidth: '640px',
          borderRadius: '16px',
          border: '2.5px solid rgb(237, 237, 237)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          maxHeight: 'min(680px, 85vh)',
          height: '85vh',
        }}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{checkpoint.title}</DialogTitle>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-4 sm:px-6 py-4">
          {/* Header — ActivityModal quiz header + UnitCard badge language */}
          <div className="flex-shrink-0 backdrop-blur-sm rounded-xl px-3 py-3 mb-3 shadow-sm" style={cardStyle}>
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: themeBg, borderBottom: `2px solid ${themeBorderLight}` }}
              >
                <span style={{ color: themeColor }}>{getJourneyIcon()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                  style={{ fontFamily: font, color: themeColor }}
                >
                  {isTechnique ? 'Technique activity' : 'Theory activity'}
                </p>
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate" style={{ fontFamily: font }}>
                  {checkpoint.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span>{headerSubtitleParts.join(' · ')}</span>
                  {checkpoint.estimatedTime ? (
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 opacity-70" />
                      {checkpoint.estimatedTime}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div
              ref={bodyScrollRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-0.5 -mr-0.5"
            >
              {finished ? (
                <div className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm flex flex-col gap-4" style={cardStyle}>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgb(134, 239, 172)',
                        borderBottom: '3px solid rgb(74, 222, 128)',
                      }}
                    >
                      <Trophy className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm" style={{ fontFamily: font }}>
                        Activity complete
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Continue your journey — quizzes unlock next.</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" aria-hidden />
                  </div>
                  <button type="button" onClick={handleFinalDone} className={doneButtonClass} style={doneButtonStyle}>
                    <Trophy className="w-4 h-4 text-green-600 fill-green-600" />
                    Done
                  </button>
                </div>
              ) : current ? (
                <>
                  <div
                    className="backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-4 mb-4 shadow-md"
                    style={cardStyle}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: themeLight, color: themeColor, fontFamily: font }}
                      >
                        {stepBadgeLabel}
                      </span>
                      <span className="text-xs text-gray-500 font-medium ml-auto">
                        {stepIndex + 1} / {steps.length}
                      </span>
                    </div>
                    <p
                      className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-[1.65] whitespace-pre-wrap"
                      style={{ fontFamily: font }}
                    >
                      {current.text}
                    </p>
                  </div>

                  {current.kind === 'read' && showFretboard ? (
                    <div className="backdrop-blur-sm rounded-xl px-4 py-3 mb-4 shadow-sm" style={cardStyle}>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2" style={{ fontFamily: font }}>
                        Open strings
                      </p>
                      <GuitarFretboardDiagram fingering={OPEN_STRINGS_FINGERING} accentColor={themeColor} embedded />
                    </div>
                  ) : null}

                  {current.kind === 'listen' && current.expectedChords?.length ? (
                    <>
                      {showFretboard ? (
                        <div className="backdrop-blur-sm rounded-xl px-4 py-3 mb-2 shadow-sm" style={cardStyle}>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2" style={{ fontFamily: font }}>
                            Shape to play
                          </p>
                          <GuitarFretboardDiagram
                            fingering={diagramFingering}
                            accentColor={themeColor}
                            highlightStringNumbers={ttHighlightStrings.length ? ttHighlightStrings : undefined}
                            feedback={ttDiagramFeedback}
                            embedded
                          />
                        </div>
                      ) : null}
                      {connectionStatus === 'error' ? (
                        <p className="text-xs text-red-600 dark:text-red-400 text-center mb-2 px-1" style={{ fontFamily: font }}>
                          {connectionMessage || 'Microphone or chord detector unavailable.'}
                        </p>
                      ) : connectionStatus === 'connecting' ? (
                        <p className="text-xs text-gray-500 text-center mb-2" style={{ fontFamily: font }}>
                          Connecting microphone…
                        </p>
                      ) : ttSatisfied ? (
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 text-center mb-2" style={{ fontFamily: font }}>
                          Matched — tap Continue below
                        </p>
                      ) : null}
                    </>
                  ) : null}

                  {current.kind === 'listen' && !current.expectedChords?.length ? (
                    <div className="space-y-3 mb-2">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300" style={{ fontFamily: font }}>
                        Only the highlighted open string counts.
                      </p>
                      {showFretboard ? (
                        <div className="backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm" style={cardStyle}>
                          <GuitarFretboardDiagram
                            fingering={OPEN_STRINGS_FINGERING}
                            accentColor={themeColor}
                            highlightStringNumbers={current.fretboardHighlightStrings}
                            feedback={openStringDiagramFeedback}
                            stringsWithNoteMarkers={openPluckMarkerStrings}
                            embedded
                          />
                        </div>
                      ) : null}
                      {validationHint ? (
                        <div
                          className="backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            border: '2.5px solid rgba(239, 68, 68, 0.25)',
                          }}
                        >
                          <p className="text-xs text-gray-700 dark:text-gray-200" style={{ fontFamily: font }}>
                            {validationHint}
                          </p>
                        </div>
                      ) : null}
                      {connectionStatus === 'error' ? (
                        <p className="text-xs text-red-600 dark:text-red-400 text-center" style={{ fontFamily: font }}>
                          {connectionMessage || 'Microphone or chord detector unavailable.'}
                        </p>
                      ) : connectionStatus === 'connecting' ? (
                        <p className="text-xs text-gray-500 text-center" style={{ fontFamily: font }}>
                          Connecting microphone…
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            {/* Footer: step bar + CTAs (detection feedback is on the fretboard only) */}
            {!finished && current ? (
              <div className="flex-shrink-0 pt-3 mt-auto border-t border-gray-200/80 dark:border-slate-600/80 space-y-3">
                <div
                  className="flex items-center gap-3 py-2 px-3 rounded-lg"
                  style={{ backgroundColor: themeLight }}
                >
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 shrink-0" style={{ fontFamily: font }}>
                    Step
                  </span>
                  <div className="flex-1 min-w-0 h-2.5 rounded-full bg-gray-200 dark:bg-slate-600 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor:
                          progressPercent >= 100 ? 'rgb(34, 197, 94)' : themeColor,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold w-10 text-right tabular-nums shrink-0"
                    style={{ fontFamily: font, color: themeColor }}
                  >
                    {stepIndex + 1}/{steps.length}
                  </span>
                </div>

                {showFooterContinueRead && (
                  <button type="button" onClick={advanceRead} className={ctaButtonClass} style={ctaButtonStyle}>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {showFooterContinueChord && (
                  <button type="button" onClick={continueTechniqueStep} className={ctaButtonClass} style={ctaButtonStyle}>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
