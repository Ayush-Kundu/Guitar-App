import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { ChordDetectionService, ChordDetectionResult } from '../utils/chordDetection';
import { CheckCircle2, Circle, Music, Volume2, ArrowRight, X, Mic, Guitar } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  instruction: string;
  expectedNotes: string[];
  targetString?: number;
  targetFret?: number;
  type: 'single-note' | 'sequence' | 'chord';
}

interface GuitarTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userId: string;
  userLevel?: string;
}

// =============================================================================
// TUTORIAL LESSONS
// =============================================================================

const TUTORIAL_STEPS: TutorialStep[] = [
  // Lesson 1: Open Strings
  {
    id: 'open-e-low',
    title: 'Low E String (6th)',
    description: 'Let\'s start with the thickest string - the low E.',
    instruction: 'Pluck the 6th string (thickest one) open - no fingers on the frets',
    expectedNotes: ['E'],
    targetString: 6,
    targetFret: 0,
    type: 'single-note'
  },
  {
    id: 'open-a',
    title: 'A String (5th)',
    description: 'Great! Now the A string.',
    instruction: 'Pluck the 5th string open',
    expectedNotes: ['A'],
    targetString: 5,
    targetFret: 0,
    type: 'single-note'
  },
  {
    id: 'open-d',
    title: 'D String (4th)',
    description: 'Moving to the D string.',
    instruction: 'Pluck the 4th string open',
    expectedNotes: ['D'],
    targetString: 4,
    targetFret: 0,
    type: 'single-note'
  },
  {
    id: 'open-g',
    title: 'G String (3rd)',
    description: 'Now the G string.',
    instruction: 'Pluck the 3rd string open',
    expectedNotes: ['G'],
    targetString: 3,
    targetFret: 0,
    type: 'single-note'
  },
  {
    id: 'open-b',
    title: 'B String (2nd)',
    description: 'Almost there! The B string.',
    instruction: 'Pluck the 2nd string open',
    expectedNotes: ['B'],
    targetString: 2,
    targetFret: 0,
    type: 'single-note'
  },
  {
    id: 'open-e-high',
    title: 'High E String (1st)',
    description: 'Last open string - the thin high E.',
    instruction: 'Pluck the 1st string (thinnest one) open',
    expectedNotes: ['E'],
    targetString: 1,
    targetFret: 0,
    type: 'single-note'
  },
  // Lesson 2: Fretted Notes on Low E
  {
    id: 'e-fret-1',
    title: 'First Fret - F Note',
    description: 'Now let\'s add fingers! Press the 1st fret on the low E string.',
    instruction: 'Hold down the 1st fret on the 6th string and pluck',
    expectedNotes: ['F'],
    targetString: 6,
    targetFret: 1,
    type: 'single-note'
  },
  {
    id: 'e-fret-2',
    title: 'Second Fret - F# Note',
    description: 'Move to the 2nd fret.',
    instruction: 'Hold down the 2nd fret on the 6th string and pluck',
    expectedNotes: ['F#', 'Gb'],
    targetString: 6,
    targetFret: 2,
    type: 'single-note'
  },
  {
    id: 'e-fret-3',
    title: 'Third Fret - G Note',
    description: 'Now the 3rd fret.',
    instruction: 'Hold down the 3rd fret on the 6th string and pluck',
    expectedNotes: ['G'],
    targetString: 6,
    targetFret: 3,
    type: 'single-note'
  },
  // Lesson 3: Notes on A String
  {
    id: 'a-fret-2',
    title: 'A String - B Note',
    description: 'Let\'s try the A string. The 2nd fret gives you a B note.',
    instruction: 'Hold down the 2nd fret on the 5th string and pluck',
    expectedNotes: ['B'],
    targetString: 5,
    targetFret: 2,
    type: 'single-note'
  },
  {
    id: 'a-fret-3',
    title: 'A String - C Note',
    description: 'The 3rd fret on the A string is C - an important note!',
    instruction: 'Hold down the 3rd fret on the 5th string and pluck',
    expectedNotes: ['C'],
    targetString: 5,
    targetFret: 3,
    type: 'single-note'
  },
  // Lesson 4: Simple Chord
  {
    id: 'em-chord',
    title: 'E Minor Chord',
    description: 'You\'re ready for your first chord! E minor uses fret 2 on strings 5 and 4.',
    instruction: 'Place fingers on fret 2 of the A and D strings, then strum all strings',
    expectedNotes: ['E', 'Em'],
    type: 'chord'
  }
];

// =============================================================================
// FRETBOARD VISUALIZATION
// =============================================================================

const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'];
const STRING_COLORS = [
  '#D2AF80', // e (high) - 1st
  '#C8A070', // B - 2nd
  '#BE9160', // G - 3rd
  '#B4824F', // D - 4th
  '#A06E3C', // A - 5th
  '#8B5A2B', // E (low) - 6th
];

function FretboardDiagram({ 
  targetString, 
  targetFret, 
  isCorrect 
}: { 
  targetString?: number; 
  targetFret?: number; 
  isCorrect: boolean;
}) {
  const frets = [0, 1, 2, 3, 4, 5];
  
  return (
    <div className="bg-amber-900/30 rounded-lg p-4 mb-4">
      <div className="relative">
        {/* Nut */}
        <div className="absolute left-[60px] top-0 bottom-0 w-1 bg-amber-100 rounded" />
        
        {/* Fretboard */}
        <div className="ml-[65px] relative">
          {/* Fret markers */}
          <div className="flex mb-2">
            <div className="w-8 text-center text-amber-200/60 text-xs">open</div>
            {[1, 2, 3, 4, 5].map(fret => (
              <div key={fret} className="w-12 text-center text-amber-200/60 text-xs">{fret}</div>
            ))}
          </div>
          
          {/* Strings */}
          {STRING_NAMES.map((name, idx) => {
            const stringNum = 6 - idx; // 6 is low E (bottom), 1 is high e (top)
            const isTargetString = targetString === stringNum;
            
            return (
              <div key={idx} className="flex items-center h-7 relative">
                {/* String label */}
                <div 
                  className="absolute -left-[60px] w-8 text-right pr-2 font-mono text-sm"
                  style={{ color: isTargetString ? '#fcd34d' : '#a8a29e' }}
                >
                  {name}
                </div>
                
                {/* String line */}
                <div 
                  className="absolute left-0 right-0 h-[2px] rounded"
                  style={{ 
                    backgroundColor: STRING_COLORS[idx],
                    opacity: isTargetString ? 1 : 0.5
                  }} 
                />
                
                {/* Fret positions */}
                {frets.map(fret => {
                  const isTarget = isTargetString && targetFret === fret;
                  return (
                    <div 
                      key={fret} 
                      className={`w-${fret === 0 ? '8' : '12'} h-7 flex items-center justify-center relative z-10`}
                      style={{ width: fret === 0 ? '32px' : '48px' }}
                    >
                      {isTarget && (
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                            isCorrect 
                              ? 'bg-green-500 text-white scale-110' 
                              : 'bg-amber-500 text-amber-900 animate-pulse'
                          }`}
                        >
                          {fret}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          
          {/* Fret bars */}
          <div className="absolute top-6 flex pointer-events-none">
            <div className="w-8" /> {/* Open position space */}
            {[1, 2, 3, 4, 5].map(fret => (
              <div 
                key={fret} 
                className="w-12 border-r-2 border-amber-200/30 h-[168px]"
              />
            ))}
          </div>
          
          {/* Fret markers (dots at fret 3 and 5) */}
          <div className="absolute top-[90px] pointer-events-none flex">
            <div className="w-8" />
            <div className="w-12" />
            <div className="w-12" />
            <div className="w-12 flex justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-200/40" />
            </div>
            <div className="w-12" />
            <div className="w-12 flex justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-200/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GuitarTutorial({ isOpen, onClose, onComplete, userId, userLevel }: GuitarTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const chordDetectionRef = useRef<ChordDetectionService | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const step = TUTORIAL_STEPS[currentStep];
  const progress = (completedSteps.size / TUTORIAL_STEPS.length) * 100;
  
  // Initialize chord detection service
  useEffect(() => {
    if (isOpen && !chordDetectionRef.current) {
      chordDetectionRef.current = new ChordDetectionService();
      
      // Set user level for the chord detection API
      if (userLevel) {
        chordDetectionRef.current.setUserLevel(userLevel);
      }
      
      chordDetectionRef.current.setOnStatusChange((status) => {
        setConnectionStatus(status);
      });
      
      chordDetectionRef.current.setOnResult((result: ChordDetectionResult) => {
        if (result.type === 'silence' || result.type === 'listening') {
          return;
        }
        
        // Extract detected note
        let note: string | null = null;
        
        if (result.type === 'chord' && result.chord) {
          note = result.chord.replace(/m|7|maj|min|dim|aug|sus|\d/gi, '').toUpperCase();
          setDetectedNote(result.chord);
        } else if (result.type === 'notes' && result.notes?.length) {
          const firstNote = result.notes[0];
          note = Array.isArray(firstNote) ? String(firstNote[0]) : String(firstNote);
          note = note.toUpperCase();
          setDetectedNote(note);
        } else if (result.dominant_notes?.length) {
          note = result.dominant_notes[0].toUpperCase();
          setDetectedNote(note);
        }
        
        if (note && step) {
          // Check if the note matches expected
          const normalizedNote = note.replace(/\d/g, '').toUpperCase();
          const isMatch = step.expectedNotes.some(expected => 
            normalizedNote === expected.toUpperCase() ||
            normalizedNote.startsWith(expected.toUpperCase())
          );
          
          if (isMatch && !isCorrect) {
            setIsCorrect(true);
            setShowSuccess(true);
            
            // Mark step as completed
            setCompletedSteps(prev => new Set([...prev, step.id]));
            
            // Auto-advance after success
            successTimeoutRef.current = setTimeout(() => {
              setShowSuccess(false);
              setIsCorrect(false);
              setDetectedNote(null);
              
              if (currentStep < TUTORIAL_STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
              } else {
                // Tutorial complete!
                handleComplete();
              }
            }, 1500);
          }
        }
      });
    }
    
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [isOpen, step, currentStep, isCorrect]);
  
  // Start/stop listening
  const toggleListening = useCallback(async () => {
    if (!chordDetectionRef.current) return;
    
    if (isListening) {
      chordDetectionRef.current.stopRecording();
      setIsListening(false);
    } else {
      const success = await chordDetectionRef.current.startRecording();
      setIsListening(success);
    }
  }, [isListening]);
  
  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      if (chordDetectionRef.current) {
        chordDetectionRef.current.stopRecording();
        chordDetectionRef.current.disconnect();
        chordDetectionRef.current = null;
      }
      setIsListening(false);
      setDetectedNote(null);
      setIsCorrect(false);
      setShowSuccess(false);
    }
  }, [isOpen]);
  
  const handleComplete = () => {
    // Save completion to localStorage
    localStorage.setItem(`guitar_tutorial_complete_${userId}`, 'true');
    onComplete();
  };
  
  const handleSkip = () => {
    localStorage.setItem(`guitar_tutorial_skipped_${userId}`, 'true');
    onClose();
  };
  
  if (!step) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 border-amber-800/50 text-white p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Guitar className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Guitar Basics Tutorial</h2>
                <p className="text-amber-100 text-sm">Learn to play notes with chord recognition</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-amber-100 mb-1">
              <span>Step {currentStep + 1} of {TUTORIAL_STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-2 bg-amber-900/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Step info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <Circle className="w-6 h-6 text-amber-400" />
              )}
              <h3 className="text-xl font-semibold text-amber-100">{step.title}</h3>
            </div>
            <p className="text-stone-300 mb-3">{step.description}</p>
            <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3">
              <p className="text-amber-200 font-medium">
                <Music className="w-4 h-4 inline mr-2" />
                {step.instruction}
              </p>
            </div>
          </div>
          
          {/* Fretboard visualization */}
          {step.type !== 'chord' && (
            <FretboardDiagram 
              targetString={step.targetString}
              targetFret={step.targetFret}
              isCorrect={isCorrect}
            />
          )}
          
          {/* Chord diagram for chord steps */}
          {step.type === 'chord' && step.id === 'em-chord' && (
            <div className="bg-amber-900/30 rounded-lg p-4 mb-4">
              <div className="text-center mb-3 text-amber-200 font-semibold">E Minor Chord Shape</div>
              <div className="flex justify-center">
                <div className="bg-amber-950 p-4 rounded">
                  <pre className="text-amber-100 font-mono text-sm leading-6">
{`e |---0---|
B |---0---|
G |---0---|
D |---2---|  ← Middle finger
A |---2---|  ← Index finger
E |---0---|`}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          {/* Detection display */}
          <div className="bg-stone-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className={`w-5 h-5 ${isListening ? 'text-green-400 animate-pulse' : 'text-stone-500'}`} />
                <span className="text-sm text-stone-400">
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>
              <Button
                onClick={toggleListening}
                variant={isListening ? "destructive" : "default"}
                size="sm"
                className={isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}
              >
                <Mic className="w-4 h-4 mr-2" />
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </Button>
            </div>
            
            {/* Detected note display */}
            <div className={`text-center p-6 rounded-lg transition-all duration-300 ${
              showSuccess 
                ? 'bg-green-600/30 border-2 border-green-500' 
                : isListening 
                  ? 'bg-amber-600/20 border-2 border-amber-500/50' 
                  : 'bg-stone-700/30 border-2 border-stone-600/30'
            }`}>
              {showSuccess ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                  <span className="text-2xl font-bold text-green-400">Perfect!</span>
                  <span className="text-green-300">You played: {detectedNote}</span>
                </div>
              ) : isListening ? (
                <div>
                  <div className="text-4xl font-bold mb-2 text-amber-100">
                    {detectedNote || '—'}
                  </div>
                  <div className="text-stone-400 text-sm">
                    {detectedNote ? 'Detected note' : 'Play the note shown above...'}
                  </div>
                </div>
              ) : (
                <div className="text-stone-400">
                  <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Click "Start Listening" to begin</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-stone-400 hover:text-stone-200"
            >
              Skip Tutorial
            </Button>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(prev => prev - 1);
                    setIsCorrect(false);
                    setDetectedNote(null);
                  }}
                  className="border-amber-700 text-amber-200 hover:bg-amber-900/50"
                >
                  Previous
                </Button>
              )}
              
              {completedSteps.has(step.id) && currentStep < TUTORIAL_STEPS.length - 1 && (
                <Button
                  onClick={() => {
                    setCurrentStep(prev => prev + 1);
                    setIsCorrect(false);
                    setDetectedNote(null);
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {completedSteps.size === TUTORIAL_STEPS.length && (
                <Button
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Tutorial <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Step indicators */}
        <div className="bg-stone-900 p-4 border-t border-stone-800">
          <div className="flex justify-center gap-1 flex-wrap">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  if (completedSteps.has(s.id) || idx <= currentStep) {
                    setCurrentStep(idx);
                    setIsCorrect(completedSteps.has(s.id));
                    setDetectedNote(null);
                  }
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  completedSteps.has(s.id)
                    ? 'bg-green-500'
                    : idx === currentStep
                      ? 'bg-amber-500 scale-125'
                      : 'bg-stone-700'
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// UTILITY: Check if tutorial should show
// =============================================================================

export function shouldShowTutorial(userId: string, userLevel: string): boolean {
  if (userLevel !== 'novice') return false;
  
  const completed = localStorage.getItem(`guitar_tutorial_complete_${userId}`);
  const skipped = localStorage.getItem(`guitar_tutorial_skipped_${userId}`);
  
  return !completed && !skipped;
}
