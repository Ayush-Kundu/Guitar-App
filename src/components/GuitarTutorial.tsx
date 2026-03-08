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
  instruction: string;
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
  // Open strings
  {
    id: 'open-strings-1',
    title: 'Open Strings: Low E',
    instruction: 'Play the low E string open (no fingers on frets)',
    notes: [{ string: 6, fret: 0, note: 'E', time: 0 }]
  },
  {
    id: 'open-strings-2',
    title: 'Open Strings: A',
    instruction: 'Play the A string open',
    notes: [{ string: 5, fret: 0, note: 'A', time: 0 }]
  },
  {
    id: 'open-strings-3',
    title: 'Open Strings: D',
    instruction: 'Play the D string open',
    notes: [{ string: 4, fret: 0, note: 'D', time: 0 }]
  },
  {
    id: 'open-strings-4',
    title: 'Open Strings: G',
    instruction: 'Play the G string open',
    notes: [{ string: 3, fret: 0, note: 'G', time: 0 }]
  },
  {
    id: 'open-strings-5',
    title: 'Open Strings: B',
    instruction: 'Play the B string open',
    notes: [{ string: 2, fret: 0, note: 'B', time: 0 }]
  },
  {
    id: 'open-strings-6',
    title: 'Open Strings: High E',
    instruction: 'Play the high E string open',
    notes: [{ string: 1, fret: 0, note: 'E', time: 0 }]
  },
  // All open strings sequence
  {
    id: 'open-all',
    title: 'All Open Strings',
    instruction: 'Play E-A-D-G-B-e in sequence',
    bpm: 60,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 0.8 },
      { string: 5, fret: 0, note: 'A', time: 1, duration: 0.8 },
      { string: 4, fret: 0, note: 'D', time: 2, duration: 0.8 },
      { string: 3, fret: 0, note: 'G', time: 3, duration: 0.8 },
      { string: 2, fret: 0, note: 'B', time: 4, duration: 0.8 },
      { string: 1, fret: 0, note: 'E', time: 5, duration: 0.8 },
    ]
  },
  // First fretted notes
  {
    id: 'fret-1-e',
    title: 'First Fret: F Note',
    instruction: 'Fret 1 on low E string = F',
    notes: [{ string: 6, fret: 1, note: 'F', time: 0 }]
  },
  {
    id: 'fret-3-e',
    title: 'Third Fret: G Note',
    instruction: 'Fret 3 on low E string = G',
    notes: [{ string: 6, fret: 3, note: 'G', time: 0 }]
  },
  {
    id: 'fret-2-a',
    title: 'Second Fret: B Note',
    instruction: 'Fret 2 on A string = B',
    notes: [{ string: 5, fret: 2, note: 'B', time: 0 }]
  },
  {
    id: 'fret-3-a',
    title: 'Third Fret: C Note',
    instruction: 'Fret 3 on A string = C',
    notes: [{ string: 5, fret: 3, note: 'C', time: 0 }]
  },
  // E string chromatic run
  {
    id: 'e-chromatic',
    title: 'E String: E-F-G Run',
    instruction: 'Play E → F → G on low E string',
    bpm: 50,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 1 },
      { string: 6, fret: 1, note: 'F', time: 1.2, duration: 1 },
      { string: 6, fret: 3, note: 'G', time: 2.4, duration: 1 },
    ]
  },
  // A string run
  {
    id: 'a-run',
    title: 'A String: A-B-C Run',
    instruction: 'Play A → B → C on A string',
    bpm: 50,
    notes: [
      { string: 5, fret: 0, note: 'A', time: 0, duration: 1 },
      { string: 5, fret: 2, note: 'B', time: 1.2, duration: 1 },
      { string: 5, fret: 3, note: 'C', time: 2.4, duration: 1 },
    ]
  },
  // High E notes
  {
    id: 'high-e-frets',
    title: 'High E String Notes',
    instruction: 'Play E → F → G on high E string',
    bpm: 50,
    notes: [
      { string: 1, fret: 0, note: 'E', time: 0, duration: 1 },
      { string: 1, fret: 1, note: 'F', time: 1.2, duration: 1 },
      { string: 1, fret: 3, note: 'G', time: 2.4, duration: 1 },
    ]
  },
  // Cross-string exercise
  {
    id: 'cross-string-1',
    title: 'Cross-String: E and A',
    instruction: 'Alternate: low E → A → low E → A',
    bpm: 60,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 0.8 },
      { string: 5, fret: 0, note: 'A', time: 1, duration: 0.8 },
      { string: 6, fret: 0, note: 'E', time: 2, duration: 0.8 },
      { string: 5, fret: 0, note: 'A', time: 3, duration: 0.8 },
    ]
  },
  // Simple melody
  {
    id: 'simple-melody',
    title: 'Simple Melody',
    instruction: 'Play: E - G - A - G - E - E',
    bpm: 60,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 0.8 },
      { string: 6, fret: 3, note: 'G', time: 1, duration: 0.8 },
      { string: 5, fret: 0, note: 'A', time: 2, duration: 0.8 },
      { string: 6, fret: 3, note: 'G', time: 3, duration: 0.8 },
      { string: 6, fret: 0, note: 'E', time: 4, duration: 0.8 },
      { string: 6, fret: 0, note: 'E', time: 5, duration: 0.8 },
    ]
  },
  // D string notes
  {
    id: 'd-string-run',
    title: 'D String: D-E-F Run',
    instruction: 'Play D → E → F on D string',
    bpm: 50,
    notes: [
      { string: 4, fret: 0, note: 'D', time: 0, duration: 1 },
      { string: 4, fret: 2, note: 'E', time: 1.2, duration: 1 },
      { string: 4, fret: 3, note: 'F', time: 2.4, duration: 1 },
    ]
  },
  // Reverse open strings
  {
    id: 'reverse-open',
    title: 'Reverse Open Strings',
    instruction: 'Play e-B-G-D-A-E (high to low)',
    bpm: 60,
    notes: [
      { string: 1, fret: 0, note: 'E', time: 0, duration: 0.8 },
      { string: 2, fret: 0, note: 'B', time: 1, duration: 0.8 },
      { string: 3, fret: 0, note: 'G', time: 2, duration: 0.8 },
      { string: 4, fret: 0, note: 'D', time: 3, duration: 0.8 },
      { string: 5, fret: 0, note: 'A', time: 4, duration: 0.8 },
      { string: 6, fret: 0, note: 'E', time: 5, duration: 0.8 },
    ]
  },
  // Two-string pattern
  {
    id: 'two-string-pattern',
    title: 'Two-String Pattern',
    instruction: 'Play: E - F - A - B pattern',
    bpm: 55,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 0.9 },
      { string: 6, fret: 1, note: 'F', time: 1.1, duration: 0.9 },
      { string: 5, fret: 0, note: 'A', time: 2.2, duration: 0.9 },
      { string: 5, fret: 2, note: 'B', time: 3.3, duration: 0.9 },
    ]
  },
  // Final challenge
  {
    id: 'final-melody',
    title: 'Final Challenge',
    instruction: 'Play: E - G - A - B - C - A - G - E',
    bpm: 55,
    notes: [
      { string: 6, fret: 0, note: 'E', time: 0, duration: 0.8 },
      { string: 6, fret: 3, note: 'G', time: 1, duration: 0.8 },
      { string: 5, fret: 0, note: 'A', time: 2, duration: 0.8 },
      { string: 5, fret: 2, note: 'B', time: 3, duration: 0.8 },
      { string: 5, fret: 3, note: 'C', time: 4, duration: 0.8 },
      { string: 5, fret: 0, note: 'A', time: 5, duration: 0.8 },
      { string: 6, fret: 3, note: 'G', time: 6, duration: 0.8 },
      { string: 6, fret: 0, note: 'E', time: 7, duration: 0.8 },
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
  const progress = (completedSteps.size / TUTORIAL_STEPS.length) * 100;
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

  // Animation loop for multi-note steps
  useEffect(() => {
    if (!isPlaying || !isMultiNote || startTimeRef.current === null) return;
    
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current!) / 1000;
      setCurrentTime(elapsed);
      
      if (elapsed < getTotalDuration()) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        // Check if all notes were correct
        const allCorrect = step.notes.every((_, idx) => noteFeedback[idx] === 'correct');
        if (allCorrect) {
          setCompletedSteps(prev => new Set([...prev, step.id]));
          // Auto-advance after multi-note completion
          setTimeout(() => advanceToNextStep(), 500);
        }
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, isMultiNote, step, noteFeedback]);

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
  const allComplete = completedSteps.size === TUTORIAL_STEPS.length;

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
        className="!w-[98vw] !max-w-[98vw] h-[90vh] max-h-[750px] p-0 overflow-hidden [&>button:last-of-type]:hidden flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 border-2 border-gray-200 dark:border-slate-600"
        style={{ borderRadius: '16px' }}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Guitar Basics Tutorial</DialogTitle>

        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 bg-white/90 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Step {currentStep + 1}: {step.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {step.instruction}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white/70 dark:bg-slate-600 border-2 border-gray-200 dark:border-slate-500"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Main Practice Area */}
        <div 
          className="flex-1 relative overflow-hidden mx-4 my-2 rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-gray-200 dark:border-slate-600" 
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
        <div className="flex-shrink-0 px-5 py-3 bg-white/90 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">

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

          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-gray-500 w-16 font-medium">Step {currentStep + 1}/{TUTORIAL_STEPS.length}</span>
            <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${progress}%`, transition: 'width 0.3s' }}
              />
            </div>
            <span className="text-xs text-gray-500 w-12 text-right font-medium">{Math.round(progress)}%</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={goToPrev}
              disabled={currentStep === 0}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white border-2 border-gray-200 disabled:opacity-50"
              style={{ borderBottomWidth: 3 }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {isMultiNote && (
              <button
                onClick={handlePlay}
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
              onClick={handleReset}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white border-2 border-gray-200"
              style={{ borderBottomWidth: 3 }}
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={goToNext}
              disabled={currentStep === TUTORIAL_STEPS.length - 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white border-2 border-gray-200 disabled:opacity-50"
              style={{ borderBottomWidth: 3 }}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={allComplete ? handleFinish : goToNext}
              className="h-10 px-12 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 flex items-center gap-2"
              style={{
                backgroundColor: allComplete ? '#22C55E' : '#3B82F6',
                border: `2px solid ${allComplete ? '#16A34A' : '#2563EB'}`,
                borderBottomWidth: 3
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {allComplete ? 'Complete!' : isStepComplete ? 'Next' : 'Skip'}
            </button>
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
