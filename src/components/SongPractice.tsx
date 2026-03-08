import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Play, Pause, RotateCcw, CheckCircle2, X, Trophy } from 'lucide-react';
import {
  getSongData,
  NoteEvent,
  SongData,
  calculateDurationFromEvents,
  formatDuration
} from '../utils/songDataService';
import { ChordDetectionService, ChordDetectionResult } from '../utils/chordDetection';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface SongPracticeProps {
  isOpen: boolean;
  onClose: () => void;
  song: {
    songId?: string;
    title: string;
    artist: string;
    chords: string[];
    duration: string;
    bpm: number;
    genre: string;
    difficulty?: number;
  };
  userId: string;
  userLevel?: string;
  onComplete: (
    minutesPracticed: number,
    progressPercent: number,
    songInfo: { songId: string; title: string; artist: string; genre: string }
  ) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Layout constants
const STRING_LABELS_WIDTH = 48; // px - width of the string label column
const BAR_POSITION_RATIO = 0.18; // Bar is at 18% from left of timeline area
const PIXELS_PER_SECOND = 120; // How fast notes scroll
const NOTE_HEIGHT = 28; // px
const NOTE_MIN_WIDTH = 36; // px
const VISIBLE_SECONDS_AHEAD = 4; // How many seconds of notes to show ahead
const LEAD_IN_TIME = 3; // Seconds before first note hits after pressing play
const STATE_ADVANCE_TIME = 0.25; // Seconds - how early to trigger active state before visual bar hit

// Speed options
const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1.0, 2.0];

// String names from top to bottom (E A D G B e)
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
const STRING_COLORS = [
  '#8B5A2B', // E (low) - brown
  '#A06E3C', // A
  '#B4824F', // D
  '#BE9160', // G
  '#C8A070', // B
  '#D2AF80', // e (high)
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get expected note name from string and fret
const getExpectedNoteName = (stringNum: number, fret: number): string => {
  const stringNotes = ['E', 'B', 'G', 'D', 'A', 'E']; // String 1-6 (high to low)
  const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const openNote = stringNotes[stringNum - 1] || 'E';
  const openNoteIndex = noteOrder.indexOf(openNote);
  const actualNoteIndex = (openNoteIndex + fret) % 12;
  return noteOrder[actualNoteIndex];
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SongPractice({ isOpen, onClose, song, userId, userLevel, onComplete }: SongPracticeProps) {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Song data
  const [noteEvents, setNoteEvents] = useState<NoteEvent[]>([]);
  const [totalDuration, setTotalDuration] = useState(180);

  // UI state
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionOpacity, setCompletionOpacity] = useState(0);
  const [slideOut, setSlideOut] = useState(false);
  const [showMistakeOptions, setShowMistakeOptions] = useState(false);

  // Mistake tracking
  const [hasMadeMistake, setHasMadeMistake] = useState(false);
  const [firstMistakeTime, setFirstMistakeTime] = useState<number | null>(null);

  // Chord detection
  const [chordDetectionConnected, setChordDetectionConnected] = useState(false);
  const [detectedChord, setDetectedChord] = useState<string | null>(null);
  const [detectedNotes, setDetectedNotes] = useState<string[]>([]);
  const [chordConfidence, setChordConfidence] = useState(0);
  const [chordStability, setChordStability] = useState(0);
  const [currentExpectedNotes, setCurrentExpectedNotes] = useState<string[]>([]);
  const [isChordMatching, setIsChordMatching] = useState<boolean | null>(null); // null = no active note, true = match, false = no match

  // Note feedback: 'correct' | 'wrong' | 'too-long' | null
  const [noteFeedback, setNoteFeedback] = useState<Record<number, string | null>>({});

  // -------------------------------------------------------------------------
  // REFS
  // -------------------------------------------------------------------------

  const animationRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);
  const practiceStartTimeRef = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const chordDetectionRef = useRef<ChordDetectionService | null>(null);
  const activeNoteStartTimeRef = useRef<Record<number, number>>({});

  // Timeline dimensions (measured from DOM)
  const [timelineWidth, setTimelineWidth] = useState(600);

  // Computed: bar X position in pixels from timeline left edge
  const barX = timelineWidth * BAR_POSITION_RATIO;

  // -------------------------------------------------------------------------
  // EFFECTS
  // -------------------------------------------------------------------------

  // Measure timeline width on mount and resize
  useEffect(() => {
    if (!isOpen) return;

    const measureTimeline = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setTimelineWidth(rect.width);
        }
      }
    };

    // Initial measurement after a frame
    requestAnimationFrame(measureTimeline);

    // Re-measure on resize
    window.addEventListener('resize', measureTimeline);
    return () => window.removeEventListener('resize', measureTimeline);
  }, [isOpen]);

  // Load song data when opened
  useEffect(() => {
    if (!isOpen || !song) return;

    // Reset state
      setCurrentTime(0);
    setIsPlaying(false);
    setShowCompletion(false);
    setCompletionOpacity(0);
    setSlideOut(false);
    setShowMistakeOptions(false);
    setHasMadeMistake(false);
    setFirstMistakeTime(null);
    setNoteFeedback({});
    activeNoteStartTimeRef.current = {};
    practiceStartTimeRef.current = Date.now();

    // Load song data
    const chords = song.chords || ['C', 'G', 'Am', 'F'];
    const bpm = song.bpm || 120;
    const duration = song.duration || '3:00';

    const data = getSongData(song.title || 'Unknown', chords, bpm, duration);

    // Add lead-in time to all note events so user has time to prepare
    const eventsWithLeadIn = (data?.events || []).map(event => ({
      ...event,
      time: event.time + LEAD_IN_TIME
    }));
    setNoteEvents(eventsWithLeadIn);

    // Calculate duration (include lead-in time)
    const BUFFER = 4;
    if (data?.events?.length > 0) {
      setTotalDuration(calculateDurationFromEvents(data.events) + LEAD_IN_TIME + BUFFER);
      } else {
      const [mins, secs] = duration.split(':').map(Number);
      setTotalDuration((mins || 0) * 60 + (secs || 0) + LEAD_IN_TIME + BUFFER);
    }

    // Clean up any existing connection before creating a new one
    if (chordDetectionRef.current) {
      chordDetectionRef.current.stopRecording();
      chordDetectionRef.current.disconnect();
      chordDetectionRef.current = null;
    }

    // Initialize chord detection - matches browser behavior exactly
    const chordService = new ChordDetectionService();
    chordDetectionRef.current = chordService;

    // Set user level for the chord detection API
    if (userLevel) {
      chordService.setUserLevel(userLevel);
    }

    chordService.setOnStatusChange((connected) => {
          setChordDetectionConnected(connected);
    });

    chordService.setOnResult((result: ChordDetectionResult) => {
      const songId = result._currentSongId;

      if (result.type === 'chord') {
        if (result.song_constrained && songId) {
          if (result.final_chord) {
            setDetectedChord(result.final_chord);
            if (result.final_confidence !== undefined) setChordConfidence(result.final_confidence);
          } else {
            setDetectedChord(null);
          }
        } else {
          if (result.chord) {
            setDetectedChord(result.chord);
            if (result.confidence !== undefined) setChordConfidence(result.confidence);
          } else {
            setDetectedChord(null);
          }
        }
        if (result.stability !== undefined) setChordStability(result.stability);
        if (result.notes?.length) {
          setDetectedNotes(result.notes.map((n: any) => Array.isArray(n) ? String(n[0]) : String(n)));
        }
        return;
      }

      if (result.type === 'notes') {
        if (result.notes?.length) {
          setDetectedNotes(result.notes.map((n: any) => Array.isArray(n) ? String(n[0]) : String(n)));
          } else {
          setDetectedNotes([]);
        }
        if (!songId) {
          if (result.chord_candidate) {
            setDetectedChord(result.chord_candidate);
            if (result.confidence !== undefined) setChordConfidence(result.confidence);
          } else {
            setDetectedChord(null);
          }
        }
        return;
      }
    });

    chordService.setSong(song.title, song.artist);
    chordService.connect();

    return () => {
      if (chordDetectionRef.current) {
        chordDetectionRef.current.stopRecording();
        chordDetectionRef.current.disconnect();
        chordDetectionRef.current = null;
      }
      setChordDetectionConnected(false);
      setDetectedChord(null);
      setDetectedNotes([]);
    };
  }, [isOpen, song]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || startTimeRef.current === null) return;

    const animate = () => {
      const elapsed = ((Date.now() - startTimeRef.current!) / 1000) * playbackSpeed;
      setCurrentTime(elapsed);

      // Check for completion
      const timeRemaining = totalDuration - elapsed;
      if (timeRemaining <= 3 && timeRemaining > 0 && !showCompletion && !hasMadeMistake) {
        setShowCompletion(true);
      }
      if (showCompletion && timeRemaining > 0) {
        setCompletionOpacity(Math.min(1, 1 - timeRemaining / 3));
      }

      if (elapsed < totalDuration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        chordDetectionRef.current?.stopRecording();
        setDetectedChord(null);
        setDetectedNotes([]);
        setChordConfidence(0);
        if (hasMadeMistake) {
          setShowMistakeOptions(true);
        } else {
          setCompletionOpacity(1);
          setTimeout(() => {
            setSlideOut(true);
            setTimeout(handleComplete, 500);
          }, 800);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, totalDuration, showCompletion, playbackSpeed, hasMadeMistake]);

  // Note feedback evaluation - directly uses API's song-constrained chord
  useEffect(() => {
    if (!isPlaying || !noteEvents.length) return;

    const EARLY_ACCEPT = 0.3;
    const LATE_LEEWAY = 0.5;

    // Extract note name from detected chord (e.g., "F9" -> "F", "G#m" -> "G#")
    const getChordRoot = (chord: string | null): string | null => {
      if (!chord) return null;
      const match = chord.match(/^([A-G][#b]?)/i);
      return match ? match[1].toUpperCase() : null;
    };

    // Get all detected note names
    const detectedNoteNames = detectedNotes.map(n => {
      const match = n.match(/^([A-G][#b]?)/i);
      return match ? match[1].toUpperCase() : n.toUpperCase();
    });

    // Also get the root from the detected chord
    const detectedChordRoot = getChordRoot(detectedChord);
    if (detectedChordRoot && !detectedNoteNames.includes(detectedChordRoot)) {
      detectedNoteNames.push(detectedChordRoot);
    }

    const newFeedback: Record<number, string | null> = { ...noteFeedback };
    const activeExpectedNotes: string[] = [];
    let hasActiveNote = false;
    let anyMatch = false;

    noteEvents.forEach((note, idx) => {
      const stateTime = note.time - STATE_ADVANCE_TIME;
      const endTime = stateTime + (note.duration || 0.5);
      const isInWindow = currentTime >= stateTime - EARLY_ACCEPT && currentTime <= endTime + LATE_LEEWAY;

      if (!isInWindow) {
        if (activeNoteStartTimeRef.current[idx]) delete activeNoteStartTimeRef.current[idx];
        return;
      }

      const barTouched = currentTime >= stateTime;
      if (barTouched && !activeNoteStartTimeRef.current[idx]) {
        activeNoteStartTimeRef.current[idx] = currentTime;
      }

      const expectedNote = getExpectedNoteName(note.string, note.fret);
      const expectedFlat = expectedNote.replace('#', 'b');
      const expectedSharp = expectedNote.replace('b', '#');

      // Track active notes at the bar
      if (barTouched) {
        hasActiveNote = true;
        if (!activeExpectedNotes.includes(expectedNote)) {
          activeExpectedNotes.push(expectedNote);
        }
      }

      // Direct comparison with API chord root and detected notes
      const isCorrect = detectedNoteNames.some(dn => 
        dn === expectedNote || dn === expectedFlat || dn === expectedSharp
      );

      if (isCorrect && barTouched) {
        anyMatch = true;
      }

      // Once a note is marked correct, it stays correct (latch behavior)
      if (noteFeedback[idx] === 'correct') {
        newFeedback[idx] = 'correct';
        if (barTouched) anyMatch = true;
        return;
      }

      // Grace period before marking wrong
      const WRONG_GRACE_PERIOD = 0.3;
      const timeSinceBarTouched = activeNoteStartTimeRef.current[idx]
        ? currentTime - activeNoteStartTimeRef.current[idx]
        : 0;

      if (currentTime < stateTime) {
        newFeedback[idx] = isCorrect ? 'correct' : noteFeedback[idx] || null;
          } else {
        if (isCorrect) {
          newFeedback[idx] = 'correct';
        } else if (timeSinceBarTouched >= WRONG_GRACE_PERIOD) {
          newFeedback[idx] = 'wrong';
          if (!hasMadeMistake) {
            setHasMadeMistake(true);
            setFirstMistakeTime(currentTime);
            // Keep chord detection running - don't stop recording or clear display
        }
      } else {
          newFeedback[idx] = noteFeedback[idx] || null;
        }
      }
    });

    setNoteFeedback(newFeedback);
    setCurrentExpectedNotes(activeExpectedNotes);
    setIsChordMatching(hasActiveNote ? anyMatch : null);
  }, [isPlaying, currentTime, detectedNotes, detectedChord, noteEvents]);

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------

  const handlePlay = async () => {
    if (!isPlaying) {
      if (chordDetectionRef.current?.isConnected()) {
        // Re-send song context before starting recording
        chordDetectionRef.current.setSong(song.title, song.artist);
        await chordDetectionRef.current.startRecording();
      }
      startTimeRef.current = Date.now() - (currentTime * 1000 / playbackSpeed);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      chordDetectionRef.current?.stopRecording();
    }
  };

  const handleReset = () => {
    chordDetectionRef.current?.stopRecording();
    setIsPlaying(false);
    setCurrentTime(0);
    startTimeRef.current = null;
    setDetectedChord(null);
    setDetectedNotes([]);
    setChordConfidence(0);
    setChordStability(0);
    setNoteFeedback({});
    activeNoteStartTimeRef.current = {};
    setHasMadeMistake(false);
    setFirstMistakeTime(null);
    setShowMistakeOptions(false);
    setShowCompletion(false);
    setCompletionOpacity(0);
    setSlideOut(false);
  };

  const handleRestartFromStart = async () => {
    handleReset();
    startTimeRef.current = Date.now();
    setIsPlaying(true);
    if (chordDetectionRef.current?.isConnected()) {
      await chordDetectionRef.current.startRecording();
    }
  };

  const handleRestartFromMistake = async () => {
    if (firstMistakeTime === null) return;
    const restartTime = Math.max(0, firstMistakeTime - 3);

    setShowMistakeOptions(false);
    setHasMadeMistake(false);
    setFirstMistakeTime(null);
    setNoteFeedback({});
    activeNoteStartTimeRef.current = {};
    setCurrentTime(restartTime);
    startTimeRef.current = Date.now() - (restartTime * 1000 / playbackSpeed);
    setIsPlaying(true);

    if (chordDetectionRef.current?.isConnected()) {
      await chordDetectionRef.current.startRecording();
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    chordDetectionRef.current?.stopRecording();
    chordDetectionRef.current?.disconnect();
    onClose();
  };

  const handleComplete = () => {
    chordDetectionRef.current?.stopRecording();

    // Only award progress/points if the song was played 100% correctly (trophy earned)
    if (!showCompletion) {
      setTimeout(onClose, 400);
      return;
    }

    const elapsedMs = practiceStartTimeRef.current ? Date.now() - practiceStartTimeRef.current : 0;
    const minutesPracticed = Math.round(elapsedMs / 60000);

    const songId = song.songId || `${song.title.toLowerCase().replace(/\s+/g, '_')}_${song.artist.toLowerCase().replace(/\s+/g, '_')}`;

    onComplete(minutesPracticed, 100, {
      songId,
      title: song.title,
      artist: song.artist,
      genre: song.genre
    });

    setTimeout(onClose, 400);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying && startTimeRef.current) {
      startTimeRef.current = Date.now() - (currentTime * 1000 / speed);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------------------

  // Calculate note's X position relative to timeline left edge
  // Note center aligns with bar center when note.time === currentTime
  const getNoteX = (noteTime: number, noteWidth: number): number => {
    const timeOffset = noteTime - currentTime;
    const pixelOffset = timeOffset * PIXELS_PER_SECOND;
    return barX + pixelOffset - noteWidth / 2;
  };

  // Get string Y position (0-5 from top)
  // String 1 = high e (bottom in standard notation, but we show top to bottom as E A D G B e)
  // So string 6 (low E) is index 0, string 1 (high e) is index 5
  const getStringY = (stringNum: number): number => {
    // stringNum 1-6 maps to visual index 5-0
    const stringIndex = 6 - stringNum;
    const stringHeight = 100 / 6;
    return stringIndex * stringHeight + stringHeight / 2;
  };

  // Determine note visual state
  // State triggers STATE_ADVANCE_TIME seconds BEFORE visual bar hit to compensate for rendering delay
  const getNoteState = (note: NoteEvent, noteIndex: number) => {
    const stateTime = note.time - STATE_ADVANCE_TIME;
    const isActive = currentTime >= stateTime && currentTime < stateTime + (note.duration || 0.5);
    const isPast = currentTime >= stateTime + (note.duration || 0.5);
    const feedback = noteFeedback[noteIndex];

    return { isActive, isPast, feedback };
  };

  // Get colors for a note based on its state
  // No approaching state - notes go directly from normal to correct/wrong
  const getNoteColors = (state: ReturnType<typeof getNoteState>, isOpen: boolean) => {
    const { isActive, isPast, feedback } = state;

    if (isPast) {
      return { bg: '#E5E7EB', border: '#D1D5DB', text: '#9CA3AF' };
    }
    if (isActive) {
      // When active, show green for correct, red for wrong (no blue state)
      if (feedback === 'correct') {
        return { bg: '#22C55E', border: '#16A34A', text: '#FFFFFF' };
      } else {
        // Wrong or no feedback yet - show red
        return { bg: '#EF4444', border: '#DC2626', text: '#FFFFFF' };
      }
    }
    // Normal state (not active, not past)
    if (isOpen) {
      return { bg: '#FFFFFF', border: '#9CA3AF', text: '#374151' };
    }
    return { bg: '#BFDBFE', border: '#60A5FA', text: '#FFFFFF' };
  };

  // Bar visual state - uses same advance timing as notes
  const getBarState = () => {
    const firstNoteTime = noteEvents.length > 0 ? Math.min(...noteEvents.map(n => n.time)) : LEAD_IN_TIME;
    const isLeadIn = currentTime < firstNoteTime - STATE_ADVANCE_TIME - 0.3;

    const activeNote = noteEvents.find(n => {
      const stateTime = n.time - STATE_ADVANCE_TIME;
      return currentTime >= stateTime && currentTime < stateTime + (n.duration || 0.5);
    });
    const activeIdx = activeNote ? noteEvents.indexOf(activeNote) : -1;
    const activeFeedback = activeIdx >= 0 ? noteFeedback[activeIdx] : null;

    return { isLeadIn, isActive: !!activeNote, activeFeedback };
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  const barState = getBarState();

  // Bar styling - shows green for correct, red for wrong (no blue states)
  let barColor = '#93C5FD';
  let barGlow = 'none';
  let barWidth = 4;

  if (barState.isLeadIn) {
    barColor = '#94A3B8';
    barGlow = 'none';
    barWidth = 4;
  } else if (barState.isActive) {
    // When a note is at the bar, show correct (green) or wrong (red)
    if (barState.activeFeedback === 'correct') {
      barColor = '#22C55E';
      barGlow = '0 0 20px rgba(34, 197, 94, 0.6)';
      barWidth = 6;
    } else {
      // Wrong or no feedback yet - show red
      barColor = '#EF4444';
      barGlow = '0 0 20px rgba(239, 68, 68, 0.6)';
      barWidth = 6;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="w-[calc(100%-0.75rem)] max-w-4xl h-[85vh] max-h-[700px] p-0 overflow-hidden [&>button:last-of-type]:hidden flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 border-2 border-gray-200 dark:border-slate-600"
        style={{
          borderRadius: '16px',
          transform: slideOut ? 'translateY(120%)' : 'translateY(0)',
          opacity: slideOut ? 0 : 1,
          transition: 'transform 0.5s ease-in, opacity 0.4s ease-out'
        }}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{song.title} - Practice Session</DialogTitle>

        {/* Header */}
        <div className="flex-shrink-0 px-3 sm:px-5 py-3 sm:py-4 bg-white/90 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{song.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{song.artist} • {song.bpm} BPM</p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white/70 dark:bg-slate-600 border-2 border-gray-200 dark:border-slate-500"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </button>
          </div>
          </div>

        {/* Main Practice Area */}
        <div className="flex-1 relative overflow-hidden mx-2 sm:mx-4 rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-gray-200 dark:border-slate-600" style={{ minHeight: '280px' }}>

          {/* String Labels (left column) */}
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

          {/* Timeline Area (right of string labels) */}
          <div
            ref={timelineRef}
            className="absolute top-0 bottom-0 right-0 overflow-hidden"
            style={{ left: STRING_LABELS_WIDTH }}
          >
            {/* Horizontal String Lines */}
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
                    transform: 'translateY(-50%)'
                  }}
                />
              );
            })}

            {/* Hit Bar (fixed position) */}
          <div
              className="absolute top-0 bottom-0 z-30"
            style={{
                left: barX - barWidth / 2,
                width: barWidth,
                backgroundColor: barColor,
                boxShadow: barGlow,
                transition: barState.isActive ? 'none' : 'all 0.15s ease-out'
              }}
            />

            {/* Notes */}
            {noteEvents.map((note, idx) => {
              const noteWidth = Math.max(NOTE_MIN_WIDTH, (note.duration || 0.5) * PIXELS_PER_SECOND * 0.8);
              const noteX = getNoteX(note.time, noteWidth);
              const noteY = getStringY(note.string);

              // Only render notes that are visible (within view + buffer)
              const timeUntilNote = note.time - currentTime;
              const maxVisibleTime = VISIBLE_SECONDS_AHEAD + 1;
              if (timeUntilNote > maxVisibleTime || timeUntilNote < -2) return null;

              const state = getNoteState(note, idx);
              const isOpen = note.fret === 0;
              const colors = getNoteColors(state, isOpen);

              const scale = state.isActive ? 1.1 : state.isPast ? 0.95 : 1;
              const opacity = state.isPast ? 0.4 : 1;

              // Shadow matches feedback color when active
              let shadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              if (state.isActive) {
                if (state.feedback === 'correct') {
                  shadow = '0 4px 12px rgba(34, 197, 94, 0.6)';
                } else {
                  shadow = '0 4px 12px rgba(239, 68, 68, 0.6)';
                }
              }

              return (
                <div
                  key={`note-${idx}`}
                  className="absolute flex items-center justify-center rounded-lg font-bold text-sm select-none"
                  style={{
                    left: noteX,
                    top: `calc(${noteY}% - ${NOTE_HEIGHT / 2}px)`,
                    width: noteWidth,
                    height: NOTE_HEIGHT,
                    backgroundColor: colors.bg,
                    border: `2px solid ${colors.border}`,
                    borderBottomWidth: 3,
                    color: colors.text,
                    transform: `scale(${scale})`,
                    opacity,
                    boxShadow: shadow,
                    transition: state.isActive ? 'none' : 'transform 0.15s, opacity 0.2s',
                    zIndex: state.isActive ? 20 : 10
                  }}
                >
                  {isOpen ? '○' : note.fret}
                </div>
              );
            })}

            {/* Completion Overlay */}
          {showCompletion && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${completionOpacity * 0.95})`,
                  backdropFilter: `blur(${completionOpacity * 8}px)`
              }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  opacity: completionOpacity,
                  transform: `scale(${0.6 + completionOpacity * 0.4})`,
                    width: 120,
                    height: 120,
                    background: 'linear-gradient(135deg, #FBBF24, #F59E0B, #D97706)',
                    boxShadow: '0 12px 40px rgba(245, 158, 11, 0.5)',
                    border: '4px solid #D97706'
                  }}
                >
                  <Trophy className="text-white" style={{ width: 60, height: 60 }} />
              </div>
            </div>
          )}

          {/* Mistake Options Overlay */}
          {showMistakeOptions && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(254, 242, 242, 0.97)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-lg max-w-sm mx-4">
                  <h3 className="text-lg font-bold text-red-600 mb-1">Oops! Keep Practicing</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Mistake at <span className="font-semibold text-red-500">{formatTime(firstMistakeTime || 0)}</span>
                  </p>
                  <div className="flex gap-3 w-full">
                  <button
                    onClick={handleRestartFromStart}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: '#DC2626', border: '2px solid #B91C1C' }}
                  >
                    Start Over
                  </button>
                  <button
                    onClick={handleRestartFromMistake}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: '#FEE2E2', border: '2px solid #F87171', color: '#DC2626' }}
                    >
                      Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
          </div>

        {/* Footer Controls */}
        <div className="flex-shrink-0 px-3 sm:px-5 py-3 sm:py-4 bg-white/90 dark:bg-slate-800">

          {/* Chord Detection Display */}
          <div className="flex items-center justify-center mb-4">
            <div
              className="px-4 sm:px-8 py-3 sm:py-4 rounded-2xl text-center w-full max-w-xs mx-auto"
              style={{
                backgroundColor: !chordDetectionConnected
                  ? 'rgba(239, 68, 68, 0.1)'
                  : isChordMatching === true
                    ? 'rgba(34, 197, 94, 0.15)'
                    : isChordMatching === false
                      ? 'rgba(239, 68, 68, 0.15)'
                  : detectedChord
                        ? 'rgba(59, 130, 246, 0.1)'
                    : 'rgba(156, 163, 175, 0.08)',
                border: `2px solid ${!chordDetectionConnected
                  ? 'rgba(239, 68, 68, 0.3)'
                  : isChordMatching === true
                    ? 'rgba(34, 197, 94, 0.5)'
                    : isChordMatching === false
                      ? 'rgba(239, 68, 68, 0.5)'
                  : detectedChord
                        ? 'rgba(59, 130, 246, 0.3)'
                    : 'rgba(156, 163, 175, 0.2)'}`,
                transition: 'all 0.15s ease-out'
              }}
            >
              {!chordDetectionConnected && (
                <div className="text-sm text-red-500 mb-2">Not connected to chord server</div>
              )}

              {/* Expected note indicator */}
              {currentExpectedNotes.length > 0 && chordDetectionConnected && (
                <div className="text-xs text-gray-500 mb-1">
                  Expecting: <span className="font-bold text-gray-700">{currentExpectedNotes.join(', ')}</span>
                </div>
              )}

              {/* Detected chord - directly from API song-constrained output */}
              <div
                className="text-4xl font-bold"
                style={{
                  color: !chordDetectionConnected
                    ? '#EF4444'
                    : isChordMatching === true
                      ? '#16A34A'
                      : isChordMatching === false
                        ? '#DC2626'
                    : detectedChord
                          ? '#3B82F6'
                          : '#9CA3AF'
                }}
              >
                {!chordDetectionConnected ? '🔌' : detectedChord || '--'}
                </div>

              {/* Match indicator */}
              {chordDetectionConnected && isChordMatching !== null && (
                <div
                  className="text-sm font-semibold mt-1"
                  style={{ color: isChordMatching ? '#16A34A' : '#DC2626' }}
                >
                  {isChordMatching ? '✓ Correct!' : '✗ Wrong'}
                  </div>
                )}

              {/* Confidence */}
              {detectedChord && chordConfidence > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Confidence: {(chordConfidence * 100).toFixed(0)}%
                  </div>
                )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-gray-500 w-10 font-medium">{formatTime(currentTime)}</span>
            <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${Math.min(100, (currentTime / totalDuration) * 100)}%`,
                  transition: isPlaying ? 'none' : 'width 0.3s'
                }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10 text-right font-medium">{formatDuration(totalDuration)}</span>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs text-gray-500 mr-2">Speed:</span>
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  playbackSpeed === speed
                    ? 'bg-blue-500 text-white border-blue-600 scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePlay}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{
                backgroundColor: isPlaying ? '#EAB308' : '#3B82F6',
                border: `2px solid ${isPlaying ? '#CA8A04' : '#2563EB'}`,
                borderBottomWidth: 4
              }}
            >
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white border-2 border-gray-200"
              style={{ borderBottomWidth: 4 }}
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={handleComplete}
              className="h-12 px-6 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 flex items-center gap-2"
              style={{
                backgroundColor: '#3B82F6',
                border: '2px solid #2563EB',
                borderBottomWidth: 4
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
