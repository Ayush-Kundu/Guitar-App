/**
 * Chord practice popup for the Technique Theory page.
 * Uses the chord recognizer; shows fretboard (like SongPractice / practice basics).
 * Single chord = one chord diagram. Multiple chords = step-by-step (one chord at a time, no order).
 */
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { X, Hand, BookOpen, CheckCircle2 } from 'lucide-react';
import { ChordDetectionService, ChordDetectionResult } from '../utils/chordDetection';
import { techniqueTheoryChordMatch } from '../utils/techniqueChordMatch';
import { getChordFingering } from '../utils/chordFingerings';

const font = '"Nunito", "Segoe UI", system-ui, sans-serif';

// Match SongPractice exactly: same layout constants and string order
const STRING_LABELS_WIDTH = 48;
const NOTE_HEIGHT = 28;
const NOTE_MIN_WIDTH = 36;
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
const STRING_COLORS = [
  '#8B5A2B', // E (low) - string 6
  '#A06E3C', '#B4824F', '#BE9160', '#C8A070', '#D2AF80', // e (high) = string 1
];

export interface TechniqueTheoryPracticeProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  chords: string[];
  type: 'technique' | 'theory';
  /** Lesson-specific focus line from lesson-physical-practice (e.g. posture, strumming). */
  practiceFocusTitle?: string;
  /** Step-by-step physical practice for this lesson. */
  practiceInstructions?: string[];
  onComplete: () => void;
  userLevel?: string;
}

const theme = {
  technique: {
    bg: 'rgb(255, 237, 213)',
    border: 'rgb(253, 186, 116)',
    fill: 'rgb(249, 115, 22)',
    light: 'rgba(249, 115, 22, 0.08)',
  },
  theory: {
    bg: 'rgb(219, 234, 254)',
    border: 'rgb(147, 197, 253)',
    fill: 'rgb(59, 130, 246)',
    light: 'rgba(59, 130, 246, 0.08)',
  },
};

const cardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.58)' as const,
  border: '2.5px solid rgb(237, 237, 237)' as const,
};

const FRETBOARD_MIN_HEIGHT = 200;

/** Same getStringY as SongPractice: string 6 (low E) at top, string 1 (high e) at bottom. */
function getStringY(stringNum: number): number {
  const stringIndex = 6 - stringNum;
  const stringHeight = 100 / 6;
  return stringIndex * stringHeight + stringHeight / 2;
}

/** Feedback from chord detection: correct = green notes, wrong = red notes + gray Done. */
type FretboardFeedback = 'correct' | 'wrong' | null;

/** Fretboard matching SongPractice: same container, string labels, 6 horizontal lines, one note cell per string. */
export function TechniqueTheoryFretboardView({
  fingering,
  accentColor,
  feedback,
}: {
  fingering: number[];
  accentColor: string;
  feedback?: FretboardFeedback;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-gray-200 dark:border-slate-600"
      style={{ minHeight: FRETBOARD_MIN_HEIGHT }}
    >
      {/* String labels - exact copy of SongPractice */}
      <div
        className="absolute left-0 top-0 bottom-0 z-40 flex flex-col bg-white/95 dark:bg-slate-800 border-r-2 border-gray-200 dark:border-slate-600"
        style={{ width: STRING_LABELS_WIDTH }}
      >
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

      {/* Timeline area (right of string labels) - exact copy of SongPractice structure */}
      <div
        className="absolute top-0 bottom-0 right-0 overflow-hidden"
        style={{ left: STRING_LABELS_WIDTH }}
      >
        {/* Horizontal string lines - same as SongPractice */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const yPercent = (i + 0.5) * (100 / 6);
          return (
            <div
              key={`string-${i}`}
              className="absolute left-0 right-0"
              style={{
                top: `${yPercent}%`,
                height: 2,
                backgroundColor: '#D1D5DB',
                transform: 'translateY(-50%)',
              }}
            />
          );
        })}

        {/* Chord as one note per string - react to feedback: green when correct (same style as wrong but green), red when wrong */}
        {([1, 2, 3, 4, 5, 6] as const).map((stringNum) => {
          const fret = fingering[stringNum - 1];
          const isOpen = fret === 0;
          const isMute = fret === -1;
          const noteY = getStringY(stringNum);
          let colors: { bg: string; border: string; text: string; shadow?: string };
          if (feedback === 'correct') {
            colors = { bg: '#DCFCE7', border: '#22C55E', text: '#16A34A', shadow: '0 2px 8px rgba(34, 197, 94, 0.4)' };
          } else if (feedback === 'wrong') {
            colors = { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626', shadow: '0 2px 8px rgba(239, 68, 68, 0.4)' };
          } else if (isMute) {
            colors = { bg: '#E5E7EB', border: '#D1D5DB', text: '#9CA3AF' };
          } else if (isOpen) {
            colors = { bg: '#FFFFFF', border: '#9CA3AF', text: '#374151' };
          } else {
            colors = { bg: accentColor, border: accentColor, text: '#FFFFFF' };
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
                backgroundColor: colors.bg,
                border: `2px solid ${colors.border}`,
                borderBottomWidth: 3,
                color: colors.text,
                boxShadow: colors.shadow ?? '0 2px 4px rgba(0, 0, 0, 0.1)',
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

export function TechniqueTheoryPractice({
  isOpen,
  onClose,
  title,
  chords,
  type,
  practiceFocusTitle,
  practiceInstructions,
  onComplete,
  userLevel,
}: TechniqueTheoryPracticeProps) {
  const safeChords = Array.isArray(chords) && chords.length > 0 ? chords : ['Em'];
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [hasPlayedCorrect, setHasPlayedCorrect] = useState(false);
  const [detectedChord, setDetectedChord] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(() => safeChords.map(() => false));
  const chordRef = useRef<ChordDetectionService | null>(null);
  const hasPlayedCorrectRef = useRef(false);

  const colors = theme[type];
  const isStepMode = safeChords.length > 1;
  const currentChord = isStepMode ? safeChords[currentStepIndex] : safeChords[0];
  const currentFingering = getChordFingering(currentChord || 'Em');
  const allStepsComplete = isStepMode && currentStepIndex >= safeChords.length;
  const singleChordDone = !isStepMode && hasPlayedCorrect;
  const canComplete = singleChordDone || allStepsComplete;

  useEffect(() => {
    if (!isOpen) return;

    setConnectionStatus('connecting');
    setConnectionMessage('');
    setConnected(false);
    setHasPlayedCorrect(false);
    hasPlayedCorrectRef.current = false;
    setDetectedChord(null);
    setConfidence(0);
    setCurrentStepIndex(0);
    setCompletedSteps(safeChords.map(() => false));

    const service = new ChordDetectionService();
    chordRef.current = service;
    if (userLevel) service.setUserLevel(userLevel);
    service.setOnStatusChange((conn, msg) => {
      const isError = msg && /timeout|error|failed|disconnected|mic error/i.test(msg);
      setConnectionMessage(msg || '');
      if (isError) {
        setConnectionStatus('error');
        setConnected(false);
      } else if (conn) {
        setConnectionStatus('connected');
        setConnected(true);
      } else {
        setConnected(conn);
      }
    });
    service.setOnResult((result: ChordDetectionResult) => {
      if (hasPlayedCorrectRef.current) return;
      if (result.type === 'chord') {
        const chord = result.final_chord ?? result.chord;
        if (chord) {
          setDetectedChord(chord);
          setConfidence((result.final_confidence ?? result.confidence) ?? 0);
        } else {
          setDetectedChord(null);
          setConfidence(0);
        }
      } else if (result.type === 'notes' && result.chord_candidate) {
        setDetectedChord(result.chord_candidate);
        setConfidence(result.confidence ?? 0);
      } else if (result.type === 'silence' || result.type === 'listening') {
        setDetectedChord(null);
        setConfidence(0);
      }
    });

    let cancelled = false;
    service.connect().then(async (ok) => {
      if (cancelled) return;
      if (!ok) {
        setConnectionStatus('error');
        setConnectionMessage('Could not reach chord detector.');
        return;
      }
      const recordingOk = await service.startRecording();
      if (cancelled) return;
      if (!recordingOk) {
        setConnectionStatus('error');
        setConnectionMessage('Microphone access needed.');
        setConnected(false);
      } else {
        setConnectionStatus('connected');
      }
    }).catch((err) => {
      if (!cancelled) {
        setConnectionStatus('error');
        setConnectionMessage('Connection failed.');
        setConnected(false);
        console.error('[TechniqueTheoryPractice] chord detector:', err);
      }
    });

    return () => {
      cancelled = true;
      if (chordRef.current) {
        chordRef.current.stopRecording();
        chordRef.current.disconnect();
        chordRef.current = null;
      }
      setConnected(false);
      setDetectedChord(null);
      setConfidence(0);
    };
  }, [isOpen, userLevel, safeChords.length]);

  const isCurrentMatch = Boolean(detectedChord && techniqueTheoryChordMatch(detectedChord, currentChord));
  const isWrong = Boolean(detectedChord && !isCurrentMatch);

  useEffect(() => {
    if (!isCurrentMatch) return;
    if (isStepMode) {
      setCompletedSteps((prev) => {
        const next = [...prev];
        next[currentStepIndex] = true;
        return next;
      });
      setCurrentStepIndex((prev) => Math.min(prev + 1, safeChords.length));
    } else {
      setHasPlayedCorrect(true);
      hasPlayedCorrectRef.current = true;
    }
  }, [isCurrentMatch, isStepMode, currentStepIndex, safeChords.length]);

  const handleDone = () => {
    if (chordRef.current) {
      chordRef.current.stopRecording();
      chordRef.current.disconnect();
      chordRef.current = null;
    }
    onComplete();
    onClose();
  };

  const fretboardFeedback: FretboardFeedback = isCurrentMatch ? 'correct' : isWrong ? 'wrong' : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-0 overflow-hidden [&>button:last-of-type]:hidden flex flex-col rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{
          width: 'calc(100% - 1rem)', maxWidth: '420px',
          border: '2.5px solid rgb(237, 237, 237)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          background: type === 'technique' ? 'linear-gradient(to bottom right, #fff7ed, #fef2f2, #fdf2f8)' : 'linear-gradient(to bottom right, #eff6ff, #eef2ff, #f5f3ff)',
        }}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="flex flex-col p-4 gap-4">
          {/* Header */}
          <div className="backdrop-blur-sm rounded-xl px-3 py-3 shadow-sm" style={cardStyle}>
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.bg, borderBottom: `2px solid ${colors.border}` }}
              >
                {type === 'technique' ? (
                  <Hand className="w-5 h-5" style={{ color: colors.fill }} />
                ) : (
                  <BookOpen className="w-5 h-5" style={{ color: colors.fill }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-gray-800 truncate" style={{ fontFamily: font }}>
                  {title}
                </h2>
                <p className="text-xs text-gray-500" style={{ fontFamily: font }}>
                  {practiceFocusTitle || 'Play the chord(s) on the fretboard'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100"
                style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {practiceInstructions && practiceInstructions.length > 0 && (
            <div className="backdrop-blur-sm rounded-xl px-3 py-3 shadow-sm" style={cardStyle}>
              <p className="text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: font }}>
                On your guitar
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-600 leading-relaxed" style={{ fontFamily: font }}>
                {practiceInstructions.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step indicator when multiple chords: Step 1 of 3, Step 2 of 3, ... */}
          {isStepMode && (
            <div className="backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm flex items-center gap-2 flex-wrap" style={cardStyle}>
              <span className="text-xs font-medium text-gray-600" style={{ fontFamily: font }}>
                Practice each chord one at a time
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {safeChords.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: completedSteps[i] ? 'rgba(34, 197, 94, 0.15)' : i === currentStepIndex ? colors.light : 'rgba(156, 163, 175, 0.15)',
                      border: `2px solid ${completedSteps[i] ? '#22C55E' : i === currentStepIndex ? colors.border : 'rgba(156, 163, 175, 0.4)'}`,
                      color: completedSteps[i] ? '#16A34A' : i === currentStepIndex ? colors.fill : '#6B7280',
                      fontFamily: font,
                    }}
                  >
                    {completedSteps[i] ? '✓ ' : ''}{c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fretboard - current chord only (one at a time in step mode) */}
          <div className="backdrop-blur-sm rounded-xl px-3 py-3 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600" style={{ fontFamily: font }}>
                {isStepMode ? `Step ${currentStepIndex + 1} of ${safeChords.length}: Play ${currentChord}` : `Play: ${safeChords[0]}`}
              </span>
            </div>
            <TechniqueTheoryFretboardView
              fingering={currentFingering}
              accentColor={colors.fill}
              feedback={fretboardFeedback}
            />
          </div>

          {/* Heard */}
          <div className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-gray-600" style={{ fontFamily: font }}>
                Heard
              </span>
              {connectionStatus === 'connecting' && (
                <span className="text-xs text-amber-600" style={{ fontFamily: font }}>Connecting to chord detector…</span>
              )}
            </div>
            <div
              className="rounded-xl py-4 flex flex-col items-center justify-center min-h-[52px] gap-2"
              style={{
                backgroundColor: isCurrentMatch ? 'rgba(34, 197, 94, 0.12)' : isWrong ? 'rgba(239, 68, 68, 0.1)' : colors.light,
                border: `2px solid ${isCurrentMatch ? 'rgb(74, 222, 128)' : isWrong ? 'rgb(239, 68, 68)' : 'transparent'}`,
              }}
            >
              {connectionStatus === 'error' && (
                <p className="text-sm text-center text-amber-700 px-2" style={{ fontFamily: font }}>
                  {connectionMessage || 'Could not connect.'}
                </p>
              )}
              {connectionStatus === 'connecting' && (
                <span className="text-sm text-gray-500" style={{ fontFamily: font }}>Connecting…</span>
              )}
              {connectionStatus === 'connected' && (
                <span className="text-xl font-bold" style={{ fontFamily: font, color: isCurrentMatch ? 'rgb(22, 101, 52)' : isWrong ? 'rgb(185, 28, 28)' : colors.fill }}>
                  {detectedChord || '—'}
                </span>
              )}
              {connectionStatus === 'connected' && !detectedChord && (
                <span className="text-sm text-gray-500" style={{ fontFamily: font }}>Play a chord</span>
              )}
            </div>
            {connected && detectedChord && confidence > 0 && (
              <p className="text-xs text-gray-500 mt-1 text-center" style={{ fontFamily: font }}>
                Confidence: {Math.round(confidence * 100)}%
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={canComplete ? handleDone : undefined}
            disabled={!canComplete}
            className={`w-full flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${canComplete ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}`}
            style={{
              minHeight: 56,
              paddingTop: 16,
              paddingBottom: 16,
              backgroundColor: canComplete ? 'rgba(249, 115, 22, 0.2)' : 'rgba(156, 163, 175, 0.25)',
              borderBottom: canComplete ? '3px solid rgb(249, 115, 22)' : '3px solid rgb(156, 163, 175)',
              color: canComplete ? 'rgb(194, 65, 12)' : 'rgb(107, 114, 128)',
              fontFamily: font,
              cursor: canComplete ? 'pointer' : 'not-allowed',
              opacity: canComplete ? 1 : 0.85,
              ...(canComplete && { transform: 'translateZ(0)' }),
            }}
            title={!canComplete ? (isStepMode ? `Play each chord correctly to enable Done (${completedSteps.filter(Boolean).length}/${safeChords.length})` : 'Play the correct chord to enable Done') : undefined}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: canComplete ? 'rgb(194, 65, 12)' : 'rgb(107, 114, 128)' }} />
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
