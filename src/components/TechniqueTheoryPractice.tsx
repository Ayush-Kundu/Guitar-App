/**
 * Chord practice popup for the Technique Theory page.
 * Uses the chord recognizer; shows fretboard (like SongPractice / practice basics).
 * Single chord = one chord diagram. Sequence = timeline with vertical bar.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { X, Hand, BookOpen, CheckCircle2, Play, Pause } from 'lucide-react';
import { ChordDetectionService, ChordDetectionResult } from '../utils/chordDetection';

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

/** Fret for each string (1=high e .. 6=low E). -1 = mute, 0 = open, 1+ = fret */
const CHORD_FINGERINGS: Record<string, number[]> = {
  Em: [0, 0, 0, 2, 2, 0],
  E: [0, 0, 1, 2, 2, 0],
  A: [0, 2, 2, 2, 0, -1],
  Am: [0, 1, 2, 2, 0, -1],
  D: [2, 3, 2, 0, -1, -1],
  G: [3, 0, 0, 0, 2, 3],
  C: [0, 1, 0, 2, 3, -1],
  F: [1, 1, 2, 3, 3, 1],
};

function getChordFingering(chordName: string): number[] {
  const s = chordName.replace(/\s/g, '');
  const isMinor = /\bmin|m$/i.test(s) || s.toLowerCase().includes('minor');
  const base = s.replace(/minor|min|m$/gi, '').replace(/major/gi, '') || s.charAt(0);
  const letter = base.charAt(0).toUpperCase() + base.slice(1);
  const key = letter + (isMinor ? 'm' : '');
  if (CHORD_FINGERINGS[key]) return CHORD_FINGERINGS[key];
  if (CHORD_FINGERINGS[letter]) return CHORD_FINGERINGS[letter];
  return CHORD_FINGERINGS[letter + 'm'] ?? [0, 0, 0, 0, 0, 0];
}

export interface TechniqueTheoryPracticeProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  chords: string[];
  type: 'technique' | 'theory';
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

const CHORD_DURATION = 2;
const PIXELS_PER_SECOND = 80;
const BAR_POSITION_RATIO = 0.22;
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
function FretboardView({
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
  onComplete,
  userLevel,
}: TechniqueTheoryPracticeProps) {
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [hasPlayedCorrect, setHasPlayedCorrect] = useState(false);
  const [detectedChord, setDetectedChord] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const chordRef = useRef<ChordDetectionService | null>(null);
  const hasPlayedCorrectRef = useRef(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);

  const colors = theme[type];
  const isSequence = chords.length > 1;
  const chordEvents = chords.map((c, i) => ({ chord: c, time: i * CHORD_DURATION }));
  const totalDuration = chords.length * CHORD_DURATION;
  const currentChordIndex = Math.min(
    Math.floor(currentTime / CHORD_DURATION),
    chords.length - 1
  );
  const currentChord = chords[currentChordIndex];
  const currentFingering = getChordFingering(currentChord);

  useEffect(() => {
    if (!isOpen) return;

    setConnectionStatus('connecting');
    setConnectionMessage('');
    setConnected(false);
    setHasPlayedCorrect(false);
    hasPlayedCorrectRef.current = false;
    setDetectedChord(null);
    setConfidence(0);

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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setConnected(false);
      setDetectedChord(null);
      setConfidence(0);
    };
  }, [isOpen, userLevel]);

  useEffect(() => {
    if (!isSequence || !isPlaying) return;
    startTimeRef.current = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - (startTimeRef.current ?? 0)) / 1000;
      if (elapsed >= totalDuration) {
        setCurrentTime(0);
        startTimeRef.current = Date.now();
      } else {
        setCurrentTime(elapsed);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSequence, isPlaying, totalDuration]);

  const normalizeForMatch = (s: string) =>
    s.replace(/\s/g, '').toUpperCase().replace(/MINOR|MIN$/gi, 'M').replace(/MAJOR|MAJ$/gi, '').trim();
  const normalizedDetected = detectedChord ? normalizeForMatch(detectedChord) : null;
  const chordList = chords.map((c) => normalizeForMatch(c));
  const isMatch = normalizedDetected && chordList.some((c) => normalizedDetected === c || normalizedDetected.startsWith(c) || c.startsWith(normalizedDetected));
  const isWrong = normalizedDetected && !isMatch;

  useEffect(() => {
    if (isMatch) {
      setHasPlayedCorrect(true);
      hasPlayedCorrectRef.current = true;
    }
  }, [isMatch]);

  const handleDone = () => {
    if (chordRef.current) {
      chordRef.current.stopRecording();
      chordRef.current.disconnect();
      chordRef.current = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    onComplete();
    onClose();
  };

  const fretboardFeedback: FretboardFeedback = hasPlayedCorrect ? 'correct' : isWrong ? 'wrong' : null;
  const canHitDone = hasPlayedCorrect || !isWrong;

  const timelineWidth = 320;
  const barX = timelineWidth * BAR_POSITION_RATIO;
  const getNoteX = (time: number, noteWidth: number) => {
    const offset = (time - currentTime) * PIXELS_PER_SECOND;
    return barX + offset - noteWidth / 2;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!w-[min(95vw,420px)] !max-w-[420px] p-0 overflow-hidden [&>button:last-of-type]:hidden flex flex-col rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{
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
                <p className="text-xs text-gray-500">Play the chord(s) on the fretboard</p>
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

          {/* Fretboard - one chord (current) like practice basics */}
          <div className="backdrop-blur-sm rounded-xl px-3 py-3 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600" style={{ fontFamily: font }}>
                {isSequence ? `Play: ${currentChord}` : `Play: ${chords[0]}`}
              </span>
              {isSequence && (
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: colors.light, color: colors.fill, fontFamily: font }}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              )}
            </div>
            <FretboardView
              fingering={isSequence ? currentFingering : getChordFingering(chords[0])}
              accentColor={colors.fill}
              feedback={fretboardFeedback}
            />
          </div>

          {/* Sequence: timeline with vertical bar */}
          {isSequence && (
            <div
              className="backdrop-blur-sm rounded-xl overflow-hidden shadow-sm relative"
              style={{ ...cardStyle, minHeight: 72 }}
            >
              <div className="px-2 py-2 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600" style={{ fontFamily: font }}>
                  Order
                </span>
              </div>
              <div className="relative overflow-hidden" style={{ height: 48, left: 0, width: timelineWidth, margin: '0 auto' }}>
                {/* String lines (horizontal) */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0"
                    style={{
                      top: `${(i + 0.5) * (100 / 6)}%`,
                      height: 2,
                      backgroundColor: '#D1D5DB',
                      transform: 'translateY(-50%)',
                    }}
                  />
                ))}
                {/* Chord blocks */}
                {chordEvents.map((ev, idx) => {
                  const noteWidth = 44;
                  const x = getNoteX(ev.time, noteWidth);
                  if (x + noteWidth < -20 || x > timelineWidth + 20) return null;
                  const isAtBar = Math.abs(ev.time - currentTime) < 0.3;
                  return (
                    <div
                      key={idx}
                      className="absolute flex items-center justify-center rounded-lg font-bold text-sm"
                      style={{
                        left: x,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: noteWidth,
                        height: NOTE_HEIGHT,
                        backgroundColor: isAtBar ? colors.bg : 'rgba(156, 163, 175, 0.2)',
                        border: `2px solid ${isAtBar ? colors.border : 'rgba(156, 163, 175, 0.4)'}`,
                        color: colors.fill,
                        zIndex: isAtBar ? 15 : 10,
                      }}
                    >
                      {ev.chord}
                    </div>
                  );
                })}
                {/* Vertical bar */}
                <div
                  className="absolute top-0 bottom-0 z-30 pointer-events-none"
                  style={{
                    left: barX - 2,
                    width: 4,
                    backgroundColor: colors.fill,
                    boxShadow: `0 0 10px ${colors.fill}80`,
                  }}
                />
              </div>
            </div>
          )}

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
                backgroundColor: isMatch ? 'rgba(34, 197, 94, 0.12)' : isWrong ? 'rgba(239, 68, 68, 0.1)' : colors.light,
                border: `2px solid ${isMatch ? 'rgb(74, 222, 128)' : isWrong ? 'rgb(239, 68, 68)' : 'transparent'}`,
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
                <span className="text-xl font-bold" style={{ fontFamily: font, color: isMatch ? 'rgb(22, 101, 52)' : isWrong ? 'rgb(185, 28, 28)' : colors.fill }}>
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
            onClick={canHitDone ? handleDone : undefined}
            disabled={!canHitDone}
            className={`w-full flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${canHitDone ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}`}
            style={{
              minHeight: 56,
              paddingTop: 16,
              paddingBottom: 16,
              backgroundColor: canHitDone ? 'rgba(249, 115, 22, 0.2)' : 'rgba(156, 163, 175, 0.25)',
              borderBottom: canHitDone ? '3px solid rgb(249, 115, 22)' : '3px solid rgb(156, 163, 175)',
              color: canHitDone ? 'rgb(194, 65, 12)' : 'rgb(107, 114, 128)',
              fontFamily: font,
              cursor: canHitDone ? 'pointer' : 'not-allowed',
              opacity: canHitDone ? 1 : 0.85,
              ...(canHitDone && { transform: 'translateZ(0)' }),
            }}
            title={!canHitDone ? 'Play the correct chord to enable Done' : undefined}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: canHitDone ? 'rgb(194, 65, 12)' : 'rgb(107, 114, 128)' }} />
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
