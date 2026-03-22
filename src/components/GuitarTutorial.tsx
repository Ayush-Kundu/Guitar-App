import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Play, Pause, RotateCcw, CheckCircle2, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { ChordDetectionService, ChordDetectionResult } from '../utils/chordDetection';

// =============================================================================
// TYPES
// =============================================================================

interface NoteTarget {
  string: number;      // 1-6 (1 = high e, 6 = low E)
  fret: number;        // 0 = open
  note: string;        // Expected note name
  time: number;        // Time offset in seconds (for multi-note)
  duration?: number;
}

interface TutorialStep {
  id: string;
  title: string;
  /** Shown only when guide is missing (legacy). Prefer guide. */
  instruction?: string;
  /** What to do / where to find the note(s). Shown as the main paragraph. */
  guide?: string;
  notes: NoteTarget[];
  bpm?: number;
}

interface GuitarTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userId: string;
  userLevel?: string;
}

// =============================================================================
// TUTORIAL STEPS - Progressive learning with multi-note sequences
// =============================================================================

const TUTORIAL_STEPS: TutorialStep[] = [
  // ─── Single notes: open strings (with locate guide)
  {
    id: 'open-strings-1',
    title: 'Open Strings: Low E',
    instruction: 'Play the low E string open (no fingers on frets)',
    guide: 'The low E is the thickest string — closest to you when you hold the guitar. "Open" means no finger on the fretboard; just pluck that string.',
    notes: [{ string: 6, fret: 0, note: 'E', time: 0 }]
  },
  {
    id: 'open-strings-2',
    title: 'Open Strings: A',
    instruction: 'Play the A string open',
    guide: 'The A string is the second thickest. Count from the bottom (low E) up: E, A. Pluck the A string with no finger on the frets.',
    notes: [{ string: 5, fret: 0, note: 'A', time: 0 }]
  },
  {
    id: 'open-strings-3',
    title: 'Open Strings: D',
    instruction: 'Play the D string open',
    guide: 'D is the third string from the bottom (E, A, D). Open = no fret pressed; just pluck it.',
    notes: [{ string: 4, fret: 0, note: 'D', time: 0 }]
  },
  {
    id: 'open-strings-4',
    title: 'Open Strings: G',
    instruction: 'Play the G string open',
    guide: 'G is the fourth string (E, A, D, G). Play it open — no finger on the fretboard.',
    notes: [{ string: 3, fret: 0, note: 'G', time: 0 }]
  },
  {
    id: 'open-strings-5',
    title: 'Open Strings: B',
    instruction: 'Play the B string open',
    guide: 'B is the second thinnest string. Only the high E is thinner. Pluck B open.',
    notes: [{ string: 2, fret: 0, note: 'B', time: 0 }]
  },
  {
    id: 'open-strings-6',
    title: 'Open Strings: High E',
    instruction: 'Play the high E string open',
    guide: 'The high E is the thinnest string, furthest from you. Same note name as the low E but higher in pitch. Pluck it open.',
    notes: [{ string: 1, fret: 0, note: 'E', time: 0 }]
  },
  // ─── First multi-note: same note over and over (vertical bar — use speed)
  {
    id: 'same-note-e',
    title: 'Same Note: Low E Four Times',
    guide: 'This is your first moving lesson: notes will scroll toward the blue bar. Pluck the low E string (thickest) open four times, once each time a note reaches the bar — use the speed control below if it moves too fast.',
    bpm: 40,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1.4 },
      { string: 6, fret: 0, note: 'E', time: 1.5, duration: 1.4 },
      { string: 6, fret: 0, note: 'E', time: 3, duration: 1.4 },
      { string: 6, fret: 0, note: 'E', time: 4.5, duration: 1.4 },
    ]
  },
  {
    id: 'same-note-a',
    title: 'Same Note: A Four Times',
    guide: 'Same idea as before: the A string is the second thickest. Pluck it open (no frets) four times, once when each note reaches the blue bar. Slow the speed down if you need more time.',
    bpm: 40,
    notes: [
      { string: 5, fret: 0, note: 'A', time: 0, duration: 1.4 },
      { string: 5, fret: 0, note: 'A', time: 1.5, duration: 1.4 },
      { string: 5, fret: 0, note: 'A', time: 3, duration: 1.4 },
      { string: 5, fret: 0, note: 'A', time: 4.5, duration: 1.4 },
    ]
  },
  // ─── Two different notes
  {
    id: 'two-notes-e-f',
    title: 'Two Notes: E then F',
    guide: 'Use only the low E string. Play it open for the first note (E), then press that string down just behind the first metal fret and pluck again for the second note (F). Use the speed control to give yourself time.',
    bpm: 45,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1.4 },
      { string: 6, fret: 1, note: 'F', time: 1.8, duration: 1.4 },
    ]
  },
  // ─── Three notes
  {
    id: 'three-notes-e-f-g',
    title: 'Three Notes: E, F, G',
    guide: 'Stay on the low E string. Play open (E), then fret 1 (F), then fret 3 (G). Press each fret firmly just behind the metal bar and pluck once per note when it reaches the blue bar.',
    bpm: 45,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1.3 },
      { string: 6, fret: 1, note: 'F', time: 1.6, duration: 1.3 },
      { string: 6, fret: 3, note: 'G', time: 3.2, duration: 1.3 },
    ]
  },
  // ─── Scale 0 1 2 3
  {
    id: 'scale-0-1-2-3',
    title: 'Scale: Frets 0, 1, 2, 3',
    guide: 'On the low E string only: play open, then fret 1, then fret 2, then fret 3 in order. Keep your fingertip right behind each fret so the note rings clearly. Use the speed control if the bar moves too quickly.',
    bpm: 45,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1.2 },
      { string: 6, fret: 1, note: 'F', time: 1.5, duration: 1.2 },
      { string: 6, fret: 2, note: 'F#', time: 3, duration: 1.2 },
      { string: 6, fret: 3, note: 'G', time: 4.5, duration: 1.2 },
    ]
  },
  // All open strings sequence
  {
    id: 'open-all',
    title: 'All Open Strings',
    guide: 'Play each string once from thickest to thinnest: 6th string (E), then 5th (A), 4th (D), 3rd (G), 2nd (B), 1st (e).',
    bpm: 50,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1 },
      { string: 5, fret: 0, note: 'A', time: 1.25, duration: 1 },
      { string: 4, fret: 0, note: 'D', time: 2.5, duration: 1 },
      { string: 3, fret: 0, note: 'G', time: 3.75, duration: 1 },
      { string: 2, fret: 0, note: 'B', time: 5, duration: 1 },
      { string: 1, fret: 0, note: 'E', time: 6.25, duration: 1 },
    ]
  },
  // First fretted notes (single)
  {
    id: 'fret-1-e',
    title: 'First Fret: F Note',
    guide: 'Press the low E string down just behind the first metal fret. That note is F. Use your fingertip, not the flat of your finger.',
    notes: [{ string: 6, fret: 1, note: 'F', time: 0 }]
  },
  {
    id: 'fret-3-e',
    title: 'Third Fret: G Note',
    guide: 'On the same thickest string, press behind the third fret. That gives you G.',
    notes: [{ string: 6, fret: 3, note: 'G', time: 0 }]
  },
  {
    id: 'fret-2-a',
    title: 'Second Fret: B Note',
    guide: 'The A string is second from the bottom. Press it behind the second fret to get B.',
    notes: [{ string: 5, fret: 2, note: 'B', time: 0 }]
  },
  {
    id: 'fret-3-a',
    title: 'Third Fret: C Note',
    guide: 'On the A string, press behind the third fret for the note C.',
    notes: [{ string: 5, fret: 3, note: 'C', time: 0 }]
  },
  // E string run (multi) — spaced out
  {
    id: 'e-chromatic',
    title: 'E String: E-F-G Run',
    guide: 'All on the low E string: open, then fret 1, then fret 3.',
    bpm: 50,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1.2 },
      { string: 6, fret: 1, note: 'F', time: 1.5, duration: 1.2 },
      { string: 6, fret: 3, note: 'G', time: 3, duration: 1.2 },
    ]
  },
  {
    id: 'a-run',
    title: 'A String: A-B-C Run',
    guide: 'On the A string (second from bottom): open = A, fret 2 = B, fret 3 = C.',
    bpm: 50,
    notes: [
      { string: 5, fret: 0, note: 'A', time: 0, duration: 1.2 },
      { string: 5, fret: 2, note: 'B', time: 1.5, duration: 1.2 },
      { string: 5, fret: 3, note: 'C', time: 3, duration: 1.2 },
    ]
  },
  {
    id: 'high-e-frets',
    title: 'High E String Notes',
    guide: 'The thinnest string: open = E, fret 1 = F, fret 3 = G.',
    bpm: 50,
    notes: [
      { string: 1, fret: 0, note: 'E', time: 0, duration: 1.2 },
      { string: 1, fret: 1, note: 'F', time: 1.5, duration: 1.2 },
      { string: 1, fret: 3, note: 'G', time: 3, duration: 1.2 },
    ]
  },
  {
    id: 'cross-string-1',
    title: 'Cross-String: E and A',
    guide: 'Switch between the two thickest strings: play low E (open), then A (open), then E again, then A again.',
    bpm: 55,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1 },
      { string: 5, fret: 0, note: 'A', time: 1.25, duration: 1 },
      { string: 6, fret: 0, note: 'E', time: 2.5, duration: 1 },
      { string: 5, fret: 0, note: 'A', time: 3.75, duration: 1 },
    ]
  },
  {
    id: 'simple-melody',
    title: 'Simple Melody',
    guide: 'Low E string for E and G (open and fret 3); A string open for A. Follow the moving notes to the bar.',
    bpm: 55,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1 },
      { string: 6, fret: 3, note: 'G', time: 1.25, duration: 1 },
      { string: 5, fret: 0, note: 'A', time: 2.5, duration: 1 },
      { string: 6, fret: 3, note: 'G', time: 3.75, duration: 1 },
      { string: 6, fret: 0, note: 'E', time: 5, duration: 1 },
      { string: 6, fret: 0, note: 'E', time: 6.25, duration: 1 },
    ]
  },
  {
    id: 'd-string-run',
    title: 'D String: D-E-F Run',
    guide: 'D string is the third from the bottom. Open = D, fret 2 = E, fret 3 = F.',
    bpm: 50,
    notes: [
      { string: 4, fret: 0, note: 'D', time: 0, duration: 1.2 },
      { string: 4, fret: 2, note: 'E', time: 1.5, duration: 1.2 },
      { string: 4, fret: 3, note: 'F', time: 3, duration: 1.2 },
    ]
  },
  {
    id: 'reverse-open',
    title: 'Reverse Open Strings',
    guide: 'Play from thinnest to thickest: high e, B, G, D, A, low E.',
    bpm: 55,
    notes: [
      { string: 1, fret: 0, note: 'E', time: 0, duration: 1 },
      { string: 2, fret: 0, note: 'B', time: 1.25, duration: 1 },
      { string: 3, fret: 0, note: 'G', time: 2.5, duration: 1 },
      { string: 4, fret: 0, note: 'D', time: 3.75, duration: 1 },
      { string: 5, fret: 0, note: 'A', time: 5, duration: 1 },
      { string: 6, fret: 0, note: 'E', time: 6.25, duration: 1 },
    ]
  },
  {
    id: 'two-string-pattern',
    title: 'Two-String Pattern',
    guide: 'Low E string for E and F (open, fret 1); A string for A and B (open, fret 2).',
    bpm: 50,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1.1 },
      { string: 6, fret: 1, note: 'F', time: 1.4, duration: 1.1 },
      { string: 5, fret: 0, note: 'A', time: 2.8, duration: 1.1 },
      { string: 5, fret: 2, note: 'B', time: 4.2, duration: 1.1 },
    ]
  },
  {
    id: 'final-melody',
    title: 'Final Challenge',
    guide: 'Mix of low E and A strings. Accuracy first, then speed.',
    bpm: 50,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1 },
      { string: 6, fret: 3, note: 'G', time: 1.25, duration: 1 },
      { string: 5, fret: 0, note: 'A', time: 2.5, duration: 1 },
      { string: 5, fret: 2, note: 'B', time: 3.75, duration: 1 },
      { string: 5, fret: 3, note: 'C', time: 5, duration: 1 },
      { string: 5, fret: 0, note: 'A', time: 6.25, duration: 1 },
      { string: 6, fret: 3, note: 'G', time: 7.5, duration: 1 },
      { string: 6, fret: 0, note: 'E', time: 8.75, duration: 1 },
    ]
  },
];

// =============================================================================
// CONSTANTS (matching SongPractice exactly)
// =============================================================================

const STRING_LABELS_WIDTH = 48;
const BAR_POSITION_RATIO = 0.18;
const PIXELS_PER_SECOND = 120;
const NOTE_HEIGHT = 28;
const NOTE_MIN_WIDTH = 36;
const VISIBLE_SECONDS_AHEAD = 4;
const LEAD_IN_TIME = 2;

const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
const STRING_COLORS = [
  '#8B5A2B', '#A06E3C', '#B4824F', '#BE9160', '#C8A070', '#D2AF80',
];

// Note lookup for fretboard display
const FRET_NOTES: Record<number, Record<number, string>> = {
  6: { 0: 'E', 1: 'F', 2: 'F#', 3: 'G', 4: 'G#', 5: 'A' },
  5: { 0: 'A', 1: 'A#', 2: 'B', 3: 'C', 4: 'C#', 5: 'D' },
  4: { 0: 'D', 1: 'D#', 2: 'E', 3: 'F', 4: 'F#', 5: 'G' },
  3: { 0: 'G', 1: 'G#', 2: 'A', 3: 'A#', 4: 'B', 5: 'C' },
  2: { 0: 'B', 1: 'C', 2: 'C#', 3: 'D', 4: 'D#', 5: 'E' },
  1: { 0: 'E', 1: 'F', 2: 'F#', 3: 'G', 4: 'G#', 5: 'A' },
};

// Find where a note was likely played (prioritize open strings, then low frets)
function findNotePosition(note: string, targetString: number): { string: number; fret: number } {
  const normalizedNote = note.replace(/\d/g, '').toUpperCase();
  
  // First check the target string for this note
  for (let fret = 0; fret <= 5; fret++) {
    if (FRET_NOTES[targetString]?.[fret]?.toUpperCase() === normalizedNote) {
      return { string: targetString, fret };
    }
  }
  
  // Check open strings first (most likely for beginners)
  const openStringNotes: Record<string, number> = { 'E': 6, 'A': 5, 'D': 4, 'G': 3, 'B': 2 };
  if (openStringNotes[normalizedNote]) {
    return { string: openStringNotes[normalizedNote], fret: 0 };
  }
  
  // Search all strings for the note
  for (const stringNum of [6, 5, 4, 3, 2, 1]) {
    for (let fret = 0; fret <= 5; fret++) {
      if (FRET_NOTES[stringNum]?.[fret]?.toUpperCase() === normalizedNote) {
        return { string: stringNum, fret };
      }
    }
  }
  
  // Fallback to target string position
  return { string: targetString, fret: 0 };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GuitarTutorial({ isOpen, onClose, onComplete, userId, userLevel }: GuitarTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [noteConfidence, setNoteConfidence] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [chordDetectionConnected, setChordDetectionConnected] = useState(false);
  
  // Multi-note step state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [noteFeedback, setNoteFeedback] = useState<Record<number, 'correct' | 'wrong' | null>>({});
  const [wrongNoteInfo, setWrongNoteInfo] = useState<{ played: string; expected: string; playedString: number; playedFret: number } | null>(null);
  /** Playback speed for multi-note (vertical bar) steps. 0.5 = half speed, 1 = normal. */
  const [playbackSpeed, setPlaybackSpeed] = useState(0.75);
  
  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fretboardOpacity, setFretboardOpacity] = useState(1);
  
  const chordDetectionRef = useRef<ChordDetectionService | null>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lastWrongNoteTimeRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);
  const [timelineWidth, setTimelineWidth] = useState(600);
  
  const step = TUTORIAL_STEPS[currentStep];
  const totalSteps = TUTORIAL_STEPS.length;
  // Progress bar: step count x/25 (updates as you move through steps)
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const isMultiNote = step?.notes.length > 1;
  const barX = timelineWidth * BAR_POSITION_RATIO;
  
  // Compute total duration for multi-note steps
  const getTotalDuration = () => {
    if (!step || step.notes.length <= 1) return 3;
    const lastNote = step.notes[step.notes.length - 1];
    return lastNote.time + (lastNote.duration || 1) + LEAD_IN_TIME + 2;
  };
  
  // Get string Y position
  const getStringY = (stringNum: number): number => {
    const index = 6 - stringNum;
    return (index + 0.5) * (100 / 6);
  };
  
  // Get note X position for scrolling timeline
  const getNoteX = (noteTime: number, noteWidth: number): number => {
    const adjustedTime = noteTime + LEAD_IN_TIME;
    const timeUntilNote = adjustedTime - currentTime;
    return barX + (timeUntilNote * PIXELS_PER_SECOND) - noteWidth / 2;
  };

  // Measure timeline
  useEffect(() => {
    if (!isOpen) return;
    const measureTimeline = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.clientWidth);
      }
    };
    measureTimeline();
    window.addEventListener('resize', measureTimeline);
    return () => window.removeEventListener('resize', measureTimeline);
  }, [isOpen]);

  // Initialize chord detection
  useEffect(() => {
    if (!isOpen) return;
    
    if (chordDetectionRef.current) {
      chordDetectionRef.current.stopRecording();
      chordDetectionRef.current.disconnect();
      chordDetectionRef.current = null;
    }
    
    const chordService = new ChordDetectionService();
    chordDetectionRef.current = chordService;
    
    if (userLevel) {
      chordService.setUserLevel(userLevel);
    }
    
    chordService.setOnStatusChange((connected) => {
      setChordDetectionConnected(connected);
      if (connected && chordDetectionRef.current) {
        chordDetectionRef.current.startRecording().then(success => {
          setIsListening(success);
        });
      }
    });
    
    chordService.setOnResult((result: ChordDetectionResult) => {
      // Ignore chord detection during transitions
      if (isTransitioningRef.current) return;
      if (result.type === 'silence' || result.type === 'listening') return;
      
      let note: string | null = null;
      let confidence = 0;
      
      if (result.type === 'chord' && result.chord) {
        note = result.chord.replace(/m|7|maj|min|dim|aug|sus|\d/gi, '').toUpperCase();
        confidence = result.confidence || 0;
      } else if (result.type === 'notes' && result.notes?.length) {
        const firstNote = result.notes[0];
        note = Array.isArray(firstNote) ? String(firstNote[0]) : String(firstNote);
        note = note.toUpperCase();
        confidence = result.confidence || 0;
      } else if (result.dominant_notes?.length) {
        note = result.dominant_notes[0].toUpperCase();
        confidence = result.confidence || 0;
      }
      
      if (note) {
        setDetectedNote(note);
        setNoteConfidence(confidence);
      }
    });
    
    chordService.connect();
    
    return () => {
      if (chordDetectionRef.current) {
        chordDetectionRef.current.stopRecording();
        chordDetectionRef.current.disconnect();
        chordDetectionRef.current = null;
      }
      setChordDetectionConnected(false);
      setDetectedNote(null);
      setIsListening(false);
    };
  }, [isOpen, userLevel]);

  // Auto-reconnect when disconnected so chord/note detection works all the time
  useEffect(() => {
    if (!isOpen || chordDetectionConnected) return;
    const t = setTimeout(() => {
      if (chordDetectionRef.current) {
        chordDetectionRef.current.connect().then((ok) => {
          if (ok && chordDetectionRef.current) {
            chordDetectionRef.current.startRecording().then((success) => setIsListening(success));
          }
        });
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [isOpen, chordDetectionConnected]);

  // Auto-advance to next step with fade transition
  const advanceToNextStep = () => {
    if (currentStep >= TUTORIAL_STEPS.length - 1 || isTransitioning) return;
    
    setIsTransitioning(true);
    isTransitioningRef.current = true;
    // Fade out
    setFretboardOpacity(0);
    
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setWrongNoteInfo(null);
      setDetectedNote(null);
      // Fade in
      setTimeout(() => {
        setFretboardOpacity(1);
        setIsTransitioning(false);
        isTransitioningRef.current = false;
      }, 50);
    }, 300);
  };

  // Animation loop for multi-note steps (playbackSpeed slows down note movement)
  useEffect(() => {
    if (!isPlaying || !isMultiNote || startTimeRef.current === null) return;
    
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current!) / 1000;
      const effectiveTime = elapsed * playbackSpeed;
      setCurrentTime(effectiveTime);
      
      const totalDuration = getTotalDuration();
      if (effectiveTime < totalDuration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        const allCorrect = step.notes.every((_, idx) => noteFeedback[idx] === 'correct');
        if (allCorrect) {
          setCompletedSteps(prev => new Set([...prev, step.id]));
          setTimeout(() => advanceToNextStep(), 500);
        }
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, isMultiNote, step, noteFeedback, playbackSpeed]);

  // Note matching for single-note steps
  useEffect(() => {
    if (!detectedNote || !step || isMultiNote || isTransitioning) return;
    
    const target = step.notes[0];
    const normalizedNote = detectedNote.replace(/\d/g, '').replace(/#/g, '').toUpperCase();
    const expected = target.note.replace(/#/g, '').toUpperCase();
    
    const isMatch = normalizedNote === expected || 
                    normalizedNote.startsWith(expected) ||
                    (expected === 'E' && normalizedNote === 'E');
    
    if (isMatch) {
      setWrongNoteInfo(null);
      setCompletedSteps(prev => new Set([...prev, step.id]));
      // Auto-advance to next step with transition
      setTimeout(() => advanceToNextStep(), 500);
    } else {
      // Only update wrong note feedback every 3 seconds
      const now = Date.now();
      const timeSinceLastWrong = now - lastWrongNoteTimeRef.current;
      
      if (timeSinceLastWrong >= 3000 || !wrongNoteInfo) {
        const playedPos = findNotePosition(detectedNote, target.string);
        // Only update if it's a different position
        if (!wrongNoteInfo || 
            wrongNoteInfo.playedString !== playedPos.string || 
            wrongNoteInfo.playedFret !== playedPos.fret) {
          setWrongNoteInfo({
            played: detectedNote,
            expected: target.note,
            playedString: playedPos.string,
            playedFret: playedPos.fret
          });
          lastWrongNoteTimeRef.current = now;
        }
      }
    }
  }, [detectedNote, step, isMultiNote, isTransitioning, wrongNoteInfo, currentStep]);

  // Note matching for multi-note steps (check active note)
  useEffect(() => {
    if (!detectedNote || !step || !isMultiNote || !isPlaying || isTransitioning) return;
    
    // Find active note
    const activeIdx = step.notes.findIndex((n, idx) => {
      const adjustedTime = n.time + LEAD_IN_TIME;
      const window = 0.5;
      return currentTime >= adjustedTime - window && 
             currentTime < adjustedTime + (n.duration || 0.5) + window &&
             noteFeedback[idx] === undefined;
    });
    
    if (activeIdx >= 0) {
      const target = step.notes[activeIdx];
      const normalizedNote = detectedNote.replace(/\d/g, '').replace(/#/g, '').toUpperCase();
      const expected = target.note.replace(/#/g, '').toUpperCase();
      
      const isMatch = normalizedNote === expected || normalizedNote.startsWith(expected);
      
      setNoteFeedback(prev => ({ ...prev, [activeIdx]: isMatch ? 'correct' : 'wrong' }));
      
      if (!isMatch) {
        // Only update wrong note every 3 seconds
        const now = Date.now();
        const timeSinceLastWrong = now - lastWrongNoteTimeRef.current;
        
        if (timeSinceLastWrong >= 3000 || !wrongNoteInfo) {
          const playedPos = findNotePosition(detectedNote, target.string);
          if (!wrongNoteInfo || 
              wrongNoteInfo.playedString !== playedPos.string || 
              wrongNoteInfo.playedFret !== playedPos.fret) {
            setWrongNoteInfo({
              played: detectedNote,
              expected: target.note,
              playedString: playedPos.string,
              playedFret: playedPos.fret
            });
            lastWrongNoteTimeRef.current = now;
          }
        }
      } else {
        setWrongNoteInfo(null);
      }
    }
  }, [detectedNote, step, isMultiNote, isPlaying, currentTime, noteFeedback, isTransitioning, wrongNoteInfo]);

  // Reset when step changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setNoteFeedback({});
    setWrongNoteInfo(null);
    setDetectedNote(null);
    startTimeRef.current = null;
    lastWrongNoteTimeRef.current = 0;
    setPlaybackSpeed(0.75);
  }, [currentStep]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setDetectedNote(null);
      setIsPlaying(false);
      setNoteFeedback({});
      setWrongNoteInfo(null);
      setIsTransitioning(false);
      setFretboardOpacity(1);
      lastWrongNoteTimeRef.current = 0;
      isTransitioningRef.current = false;
    }
  }, [isOpen]);
  
  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTime(0);
      setNoteFeedback({});
      setWrongNoteInfo(null);
      startTimeRef.current = Date.now();
      setIsPlaying(true);
    }
  };
  
  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setNoteFeedback({});
    setWrongNoteInfo(null);
    startTimeRef.current = null;
    if (!isMultiNote) {
      setCompletedSteps(prev => {
        const next = new Set(prev);
        next.delete(step.id);
        return next;
      });
    }
  };
  
  const handleFinish = () => {
    localStorage.setItem(`guitar_tutorial_complete_${userId}`, 'true');
    onComplete();
  };
  
  const goToNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goToPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  if (!step) return null;

  const isStepComplete = completedSteps.has(step.id);
  const allComplete = completedSteps.size === totalSteps;

  // Get note colors based on state
  const getNoteColors = (idx: number) => {
    const feedback = noteFeedback[idx];
    if (feedback === 'correct') return { bg: 'rgba(34, 197, 94, 0.3)', border: '#22C55E', text: '#16A34A' };
    if (feedback === 'wrong') return { bg: 'rgba(239, 68, 68, 0.3)', border: '#EF4444', text: '#DC2626' };
    return { bg: 'rgba(59, 130, 246, 0.2)', border: '#3B82F6', text: '#2563EB' };
  };

  // Get the current expected note for display
  const getCurrentExpectedNote = (): NoteTarget | null => {
    if (!isMultiNote) return step.notes[0];
    return step.notes.find((n, idx) => {
      const adjustedTime = n.time + LEAD_IN_TIME;
      return currentTime >= adjustedTime - 0.3 && currentTime < adjustedTime + (n.duration || 0.5);
    }) || null;
  };

  const expectedNote = getCurrentExpectedNote();
  const isCurrentCorrect = isStepComplete || (expectedNote && detectedNote?.toUpperCase().startsWith(expectedNote.note.toUpperCase()));
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="relative h-[90vh] max-h-[750px] p-0 overflow-hidden [&>button:last-of-type]:hidden flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 border-2 border-gray-200 dark:border-slate-600"
        style={{ width: 'calc(100% - 1.5rem)', maxWidth: '56rem', borderRadius: '16px' }}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Guitar Basics Tutorial</DialogTitle>

        {/* Header: title + close X aligned on same row */}
        <div className="flex-shrink-0 flex items-start justify-between gap-4 px-5 sm:px-6 py-4 bg-white/90 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Step {currentStep + 1}: {step.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5" style={{ fontFamily: '"Nunito", sans-serif' }}>
              {step.guide ?? step.instruction}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white/90 dark:bg-slate-600 border-2 border-gray-200 dark:border-slate-500"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Main + sidebar row */}
        <div className="flex-1 flex min-h-0 gap-4 px-5 sm:px-6 py-4">
          {/* Left column: practice area + footer */}
          <div className="flex-1 flex flex-col min-w-0 gap-3">
          {/* Main Practice Area */}
          <div 
            className="flex-1 min-h-0 relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-gray-200 dark:border-slate-600" 
            style={{ 
              minHeight: '200px',
              opacity: fretboardOpacity,
              transition: 'opacity 0.3s ease-in-out'
            }}
          >

          {/* String Labels */}
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

          {/* Timeline Area */}
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

            {/* Hit Bar - always visible for multi-note, centered for single */}
            {isMultiNote && (
              <div
                className="absolute top-0 bottom-0 z-30"
                style={{
                  left: barX - 2,
                  width: 4,
                  backgroundColor: '#3B82F6',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)'
                }}
              />
            )}

            {/* Notes */}
            {isMultiNote ? (
              // Multi-note: scrolling notes
              step.notes.map((note, idx) => {
                const noteWidth = Math.max(NOTE_MIN_WIDTH, (note.duration || 0.5) * PIXELS_PER_SECOND * 0.8);
                const noteX = getNoteX(note.time, noteWidth);
                const noteY = getStringY(note.string);
                
                const timeUntilNote = note.time + LEAD_IN_TIME - currentTime;
                if (timeUntilNote > VISIBLE_SECONDS_AHEAD + 1 || timeUntilNote < -2) return null;
                
                const colors = getNoteColors(idx);
                const isOpen = note.fret === 0;
                
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
                      zIndex: 10
                    }}
                  >
                    {isOpen ? '○' : note.fret}
                  </div>
                );
              })
            ) : (
              // Single note: centered target - stays blue unless correct
              <div
                className="absolute flex items-center justify-center rounded-lg font-bold text-sm select-none transition-all duration-300"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: `calc(${getStringY(step.notes[0].string)}% - ${NOTE_HEIGHT / 2}px)`,
                  width: 48,
                  height: NOTE_HEIGHT,
                  backgroundColor: isStepComplete
                    ? 'rgba(34, 197, 94, 0.3)'
                    : 'rgba(59, 130, 246, 0.2)',
                  border: `3px solid ${isStepComplete ? '#22C55E' : '#3B82F6'}`,
                  borderBottomWidth: 4,
                  color: isStepComplete ? '#16A34A' : '#2563EB',
                  boxShadow: isStepComplete
                    ? '0 4px 12px rgba(34, 197, 94, 0.4)'
                    : '0 4px 12px rgba(59, 130, 246, 0.3)',
                  zIndex: 20
                }}
              >
                {step.notes[0].fret === 0 ? '○' : step.notes[0].fret}
              </div>
            )}

            {/* Wrong note indicator - red note showing where they played */}
            {wrongNoteInfo && !isMultiNote && (
              <div
                className="absolute flex items-center justify-center rounded-lg font-bold text-sm select-none"
                style={{
                  left: 'calc(50% + 60px)',
                  top: `calc(${getStringY(wrongNoteInfo.playedString)}% - ${NOTE_HEIGHT / 2}px)`,
                  width: 48,
                  height: NOTE_HEIGHT,
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                  border: '3px solid #EF4444',
                  borderBottomWidth: 4,
                  color: '#DC2626',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  zIndex: 15
                }}
              >
                {wrongNoteInfo.playedFret === 0 ? '○' : wrongNoteInfo.playedFret}
              </div>
            )}

            {/* Completion check */}
            {isStepComplete && !isMultiNote && (
              <div
                className="absolute z-30"
                style={{
                  left: 'calc(50% + 24px)',
                  top: `calc(${getStringY(step.notes[0].string)}% - 12px)`,
                }}
              >
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex-shrink-0 px-4 py-3 rounded-2xl bg-white/90 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">

          {/* Chord Detection Display */}
          <div className="flex items-center justify-center mb-3">
            <div
              className="px-8 py-3 rounded-2xl text-center"
              style={{
                backgroundColor: !chordDetectionConnected
                  ? 'rgba(239, 68, 68, 0.1)'
                  : isCurrentCorrect
                    ? 'rgba(34, 197, 94, 0.15)'
                    : wrongNoteInfo
                      ? 'rgba(239, 68, 68, 0.15)'
                      : detectedNote
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(156, 163, 175, 0.08)',
                border: `2px solid ${!chordDetectionConnected
                  ? 'rgba(239, 68, 68, 0.3)'
                  : isCurrentCorrect
                    ? 'rgba(34, 197, 94, 0.5)'
                    : wrongNoteInfo
                      ? 'rgba(239, 68, 68, 0.5)'
                      : detectedNote
                        ? 'rgba(59, 130, 246, 0.3)'
                        : 'rgba(156, 163, 175, 0.2)'}`,
                minWidth: 280,
                transition: 'all 0.15s ease-out'
              }}
            >
              {!chordDetectionConnected && (
                <div className="text-sm text-red-500 mb-1">Connecting...</div>
              )}

              {chordDetectionConnected && expectedNote && (
                <div className="text-xs text-gray-500 mb-1">
                  Play: <span className="font-bold text-gray-700">{expectedNote.note}</span>
                  {expectedNote.fret > 0 && (
                    <span className="text-gray-400"> (fret {expectedNote.fret})</span>
                  )}
                </div>
              )}

              <div
                className="text-4xl font-bold"
                style={{
                  color: !chordDetectionConnected
                    ? '#EF4444'
                    : isCurrentCorrect
                      ? '#16A34A'
                      : wrongNoteInfo
                        ? '#DC2626'
                        : detectedNote
                          ? '#3B82F6'
                          : '#9CA3AF'
                }}
              >
                {!chordDetectionConnected ? '🔌' : detectedNote || '--'}
              </div>

              {chordDetectionConnected && detectedNote && (
                <div
                  className="text-sm font-semibold mt-1"
                  style={{ color: isCurrentCorrect ? '#16A34A' : '#DC2626' }}
                >
                  {isCurrentCorrect ? '✓ Correct!' : '✗ Try again'}
                </div>
              )}
            </div>
          </div>

          {/* Speed control — same style as SongPractice popup */}
          {isMultiNote && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs text-gray-500">Speed:</span>
              {[0.5, 0.75, 1].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                    playbackSpeed === speed
                      ? 'bg-blue-500 text-white border-blue-600 scale-105'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}

          {/* Progress Bar - step count x/25, shows Done when 25/25 */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium w-16 shrink-0">
              {allComplete ? (
                <span className="text-green-600 dark:text-green-400">Done</span>
              ) : (
                <span className="text-gray-500">{currentStep + 1}/{totalSteps}</span>
              )}
            </span>
            <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-slate-600 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-12 text-right font-medium shrink-0">{allComplete ? '100%' : `${Math.round(progress)}%`}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => goToPrev()}
              disabled={currentStep === 0}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white border-2 border-gray-200 disabled:opacity-50"
              style={{ borderBottomWidth: 3 }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {isMultiNote && (
              <button
                onClick={() => handlePlay()}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{
                  backgroundColor: isPlaying ? '#EAB308' : '#3B82F6',
                  border: `2px solid ${isPlaying ? '#CA8A04' : '#2563EB'}`,
                  borderBottomWidth: 3
                }}
              >
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>
            )}

            <button
              onClick={() => handleReset()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white border-2 border-gray-200"
              style={{ borderBottomWidth: 3 }}
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => goToNext()}
              disabled={currentStep === totalSteps - 1 || !isStepComplete}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderBottomWidth: 3 }}
              title={!isStepComplete ? 'Complete the step first (note must go green)' : undefined}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => ((allComplete || currentStep === totalSteps - 1) ? handleFinish : goToNext)()}
              className="h-10 min-w-[100px] px-8 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                backgroundColor: (allComplete || currentStep === totalSteps - 1) ? '#22C55E' : '#3B82F6',
                border: `2px solid ${(allComplete || currentStep === totalSteps - 1) ? '#16A34A' : '#2563EB'}`,
                borderBottomWidth: 3,
                paddingLeft: '28px',
                paddingRight: '28px'
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {allComplete || currentStep === totalSteps - 1 ? 'Done' : isStepComplete ? 'Next' : 'Skip'}
            </button>
          </div>
        </div>
          </div>

          {/* Right sidebar - tips & progress (hidden on small screens) */}
          <div className="hidden md:flex w-48 lg:w-52 flex-shrink-0 flex-col gap-3">
            <div className="rounded-2xl border-2 border-gray-200 dark:border-slate-600 bg-white/95 dark:bg-slate-800/95 p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                {allComplete ? 'Done' : `Step ${currentStep + 1} of ${totalSteps}`}
              </p>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-600 overflow-hidden">
                <div className="h-full rounded-full bg-green-500 transition-all duration-300" style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/30 p-4">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1.5">Tip</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed" style={{ fontFamily: '"Nunito", sans-serif' }}>
                {isMultiNote ? 'Play each note when the blue bar reaches it. Use speed to slow down.' : 'Play the note on your guitar to match the one shown.'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// UTILITY
// =============================================================================

export function shouldShowTutorial(userId: string, userLevel: string): boolean {
  if (userLevel !== 'novice') return false;
  const completed = localStorage.getItem(`guitar_tutorial_complete_${userId}`);
  const skipped = localStorage.getItem(`guitar_tutorial_skipped_${userId}`);
  return !completed && !skipped;
}
