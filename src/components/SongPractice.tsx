import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Trophy
} from 'lucide-react';
import {
  getSongData,
  NoteEvent,
  SongData,
  STRING_NAMES,
  getNoteName,
  getCurrentNotes,
  getNextNote,
  calculateDurationFromEvents,
  formatDuration
} from '../utils/songDataService';
import { ChordDetectionService, ChordDetectionResult } from '../utils/chordDetection';

interface ChordBlock {
  chord: string;
  time: number;
  duration: number;
}

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
  onComplete: (
    minutesPracticed: number,
    progressPercent: number,
    songInfo: { songId: string; title: string; artist: string; genre: string }
  ) => void;
}

// Chord fingering diagrams (fret positions for 6 strings, -1 = muted, 0 = open)
const chordDiagrams: Record<string, { frets: number[]; fingers: number[]; barFret?: number }> = {
  'C':  { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'D':  { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'E':  { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'G':  { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'A':  { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Am': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'Dm': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'F':  { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barFret: 1 },
  'B7': { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  'G7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  'C7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  'D7': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'Bb': { frets: [1, 1, 3, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barFret: 1 },
  'Bm': { frets: [2, 2, 4, 4, 3, 2], fingers: [1, 1, 3, 4, 2, 1], barFret: 2 },
};

// Generate chord blocks for timeline
const generateChordBlocks = (chords: string[], bpm: number, durationStr: string): ChordBlock[] => {
  const blocks: ChordBlock[] = [];
  const [mins, secs] = durationStr.split(':').map(Number);
  const totalSeconds = mins * 60 + secs;
  const beatsPerSecond = bpm / 60;
  const secondsPerChord = 4 / beatsPerSecond;

  let currentTime = 0;
  let chordIndex = 0;

  while (currentTime < totalSeconds) {
    blocks.push({
      chord: chords[chordIndex % chords.length],
        time: currentTime,
        duration: secondsPerChord,
    });
    currentTime += secondsPerChord;
    chordIndex++;
  }

  return blocks;
};

export function SongPractice({ isOpen, onClose, song, userId, onComplete }: SongPracticeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [practiceStartTime, setPracticeStartTime] = useState<number | null>(null);
  const [chordBlocks, setChordBlocks] = useState<ChordBlock[]>([]);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>();
  const timelineRef = useRef<HTMLDivElement>(null);
  const practiceAreaRef = useRef<HTMLDivElement>(null);
  const hitZoneRef = useRef<HTMLDivElement>(null);

  // Hit zone offset - calculated from actual element positions
  const [hitZoneOffset, setHitZoneOffset] = useState(0);

  // Song data with note events
  const [songData, setSongData] = useState<SongData | null>(null);
  const [noteEvents, setNoteEvents] = useState<NoteEvent[]>([]);

  // Completion celebration state
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionOpacity, setCompletionOpacity] = useState(0);
  const [slideOut, setSlideOut] = useState(false);

  // Playback speed control
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1.0, 2.0];

  // Mistake tracking
  const [firstMistakeTime, setFirstMistakeTime] = useState<number | null>(null);
  const [hasMadeMistake, setHasMadeMistake] = useState(false);
  const [showMistakeOptions, setShowMistakeOptions] = useState(false);

  // Chord detection state (mirrors index.html: chordName, chordConfidence, chordStability)
  const [chordDetectionConnected, setChordDetectionConnected] = useState(false);
  const [detectedChord, setDetectedChord] = useState<string | null>(null);
  const [detectedNotes, setDetectedNotes] = useState<string[]>([]);
  const [chordConfidence, setChordConfidence] = useState<number>(0);
  const [chordStability, setChordStability] = useState<number>(0);
  const chordDetectionRef = useRef<ChordDetectionService | null>(null);

  // Note feedback state: tracks which notes are correct/wrong/too-long
  // Key: noteIndex, Value: 'correct' | 'wrong' | 'too-long' | null
  const [noteFeedback, setNoteFeedback] = useState<Record<number, string | null>>({});
  const activeNoteStartTimeRef = useRef<Record<number, number>>({});

  // Duration state - will be calculated from note events when available
  // Includes 4 second buffer for breathing room at the end
  const [totalDuration, setTotalDuration] = useState<number>(() => {
    // Initial fallback from song.duration prop + 4 second buffer
    const [mins, secs] = song.duration.split(':').map(Number);
    return mins * 60 + secs + 4;
  });

  // Formatted duration for display
  const displayDuration = formatDuration(totalDuration);

  // Get current chord based on time
  const getCurrentChord = useCallback(() => {
    const block = chordBlocks.find(b => currentTime >= b.time && currentTime < b.time + b.duration);
    return block?.chord || song.chords[0];
  }, [chordBlocks, currentTime, song.chords]);

  const currentChord = getCurrentChord();

  useEffect(() => {
    if (isOpen && song) {
      const blocks = generateChordBlocks(song.chords, song.bpm, song.duration);
      setChordBlocks(blocks);
      setCurrentTime(0);
      setProgress(0);
      setPracticeStartTime(Date.now());

      // Load song data with note events
      const data = getSongData(song.title, song.chords, song.bpm, song.duration);
      setSongData(data);
      setNoteEvents(data.events || []);

      // Calculate actual duration from note events + 4 second buffer for breathing room
      const DURATION_BUFFER = 4; // Extra seconds at the end
      if (data.events && data.events.length > 0) {
        const calculatedDuration = calculateDurationFromEvents(data.events) + DURATION_BUFFER;
        setTotalDuration(calculatedDuration);
        console.log(`🎵 Loaded song data for "${song.title}":`, data.events.length, 'notes, duration:', formatDuration(calculatedDuration), '(includes 4s buffer)');
      } else {
        // Fallback to song.duration prop + buffer
        const [mins, secs] = song.duration.split(':').map(Number);
        setTotalDuration(mins * 60 + secs + DURATION_BUFFER);
        console.log(`🎵 Loaded song "${song.title}" with default duration:`, song.duration, '(+ 4s buffer)');
      }

      // Initialize chord detection service
      if (!chordDetectionRef.current) {
        chordDetectionRef.current = new ChordDetectionService('ws://localhost:9103/ws');

        chordDetectionRef.current.setOnStatusChange((connected, status) => {
          setChordDetectionConnected(connected);
          console.log(`🎸 Chord Detection: ${status}`);
        });

        chordDetectionRef.current.setOnResult((result: ChordDetectionResult) => {
          // Minimum confidence threshold - ignore very low-confidence detections
          const MIN_CONFIDENCE = 0.3;

          // Check if this is a "listening" or silence message (no actual detection)
          const isSilence = result.type === 'listening' ||
                           (!result.chord && (!result.notes || result.notes.length === 0));

          // Also treat low-confidence results as silence
          const isLowConfidence = result.confidence !== undefined && result.confidence < MIN_CONFIDENCE;

          if (isSilence || isLowConfidence) {
            // Clear everything when no sound or low confidence
            setDetectedChord(null);
            setDetectedNotes([]);
            setChordConfidence(0);
            return;
          }

          // Same logic as main.js updateChordDisplay
          if (result.chord) {
            setDetectedChord(result.chord);
          } else {
            setDetectedChord(null);
          }

          if (result.notes && result.notes.length > 0) {
            // Handle notes format - can be string[] or [note, freq][]
            // Notes are ordered by confidence, so first note is most confident
            const allNotes = result.notes.map(n =>
              Array.isArray(n) ? n[0] : n
            );

            // Only use the MOST CONFIDENT note (first one in the list)
            const mostConfidentNote = allNotes[0];
            console.log('🎵 Most confident note:', mostConfidentNote,
              `(confidence: ${((result.confidence || 0) * 100).toFixed(0)}%)`);
            setDetectedNotes([mostConfidentNote]); // Only store the most confident
          } else {
            setDetectedNotes([]);
          }

          if (result.confidence !== undefined) {
            setChordConfidence(result.confidence);
          }
          if (result.stability !== undefined) {
            setChordStability(result.stability);
          }
        });

        // Try to connect to the chord detection server
        chordDetectionRef.current.connect().then((connected) => {
          if (connected) {
            console.log('🎸 Connected to chord detection server');
          } else {
            console.log('🎸 Chord detection server not available (run: cd audio/music_test && python web_server.py)');
          }
        });
      }
    }

    // Cleanup chord detection on close
    return () => {
      if (chordDetectionRef.current) {
        chordDetectionRef.current.stopRecording();
        chordDetectionRef.current.disconnect();
        chordDetectionRef.current = null;
      }
      setChordDetectionConnected(false);
      setDetectedChord(null);
      setDetectedNotes([]);
      setChordConfidence(0);
      setChordStability(0);
    };
  }, [isOpen, song]);

  // Calculate hit zone offset when practice area is rendered
  useEffect(() => {
    if (isOpen && practiceAreaRef.current && hitZoneRef.current && timelineRef.current) {
      const updateHitZoneOffset = () => {
        if (!practiceAreaRef.current || !hitZoneRef.current || !timelineRef.current) return;

        // Get the actual pixel positions of the hit zone and timeline
        const containerRect = practiceAreaRef.current.getBoundingClientRect();
        const hitZoneRect = hitZoneRef.current.getBoundingClientRect();
        const timelineRect = timelineRef.current.getBoundingClientRect();

        // Hit zone center position relative to timeline's left edge
        const hitZoneCenter = hitZoneRect.left + hitZoneRect.width / 2;
        const timelineLeft = timelineRect.left;

        // The offset needed so note center lands at hit zone center when currentTime = note.time
        const offset = hitZoneCenter - timelineLeft;
        setHitZoneOffset(offset);

        console.log('Hit zone calibration:', {
          hitZoneCenter,
          timelineLeft,
          offset,
          containerWidth: containerRect.width
        });
      };

      // Calculate after a short delay to ensure DOM is ready
      const timer = setTimeout(updateHitZoneOffset, 100);
      window.addEventListener('resize', updateHitZoneOffset);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateHitZoneOffset);
      };
    }
  }, [isOpen]);

  // Track last log time for throttling
  const lastLogTimeRef = useRef<number>(0);

  // Compare detected chord/notes with expected notes at current time
  useEffect(() => {
    if (!isPlaying || !noteEvents.length) return;

    // IMPORTANT: Match visual note activation timing
    // Positive delay = notes activate LATER (after bar touches)
    // Adjust this value to match visual timing
    const VISUAL_ACTIVATION_DELAY = 2.5;

    // Timing windows:
    // - EARLY_ACCEPT: Accept correct plays slightly early (but don't mark wrong yet)
    // - LATE_LEEWAY: Continue accepting correct plays after note ends
    const EARLY_ACCEPT = 0.15;  // Accept correct notes 0.15s before bar touches
    const LATE_LEEWAY = 0.4;    // Accept late plays up to 0.4s after note ends

    // Convert detected notes to comparable format (just note names like "A", "C", "E")
    const detectedNoteNames = detectedNotes.map(n => {
      // Handle format like "A4" -> "A", or just "A"
      const match = n.match(/^([A-G][#b]?)/i);
      return match ? match[1].toUpperCase() : n.toUpperCase();
    });

    // Check each active note
    const newFeedback: Record<number, string | null> = { ...noteFeedback };
    const now = Date.now();
    const shouldLog = now - lastLogTimeRef.current >= 1000; // Log once per second

    noteEvents.forEach((note, noteIndex) => {
      // Exact visual timing (when bar touches note)
      const visualHitTime = note.time + VISUAL_ACTIVATION_DELAY;
      const visualEndTime = note.time + (note.duration || 0.5) + VISUAL_ACTIVATION_DELAY;

      // Early acceptance window (can mark correct early, but NOT wrong)
      const earlyAcceptStart = visualHitTime - EARLY_ACCEPT;
      // Late acceptance window (continue accepting after visual end)
      const lateAcceptEnd = visualEndTime + LATE_LEEWAY;

      // Is the bar currently at or past this note?
      const barHasTouched = currentTime >= visualHitTime;
      const barHasPassed = currentTime >= visualEndTime;

      // Is this note in any active window?
      const isInEarlyWindow = currentTime >= earlyAcceptStart && currentTime < visualHitTime;
      const isInActiveWindow = currentTime >= visualHitTime && currentTime < visualEndTime;
      const isInLateWindow = currentTime >= visualEndTime && currentTime <= lateAcceptEnd;

      const isNoteActive = isInEarlyWindow || isInActiveWindow || isInLateWindow;

      if (isNoteActive) {
        // Get expected note name from fret (simplified mapping)
        const stringNotes = ['E', 'B', 'G', 'D', 'A', 'E']; // High to low (string 1-6)
        const stringIndex = note.string - 1;
        const openNote = stringNotes[stringIndex] || 'E';

        // Calculate actual note from open string + fret
        const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const openNoteIndex = noteOrder.indexOf(openNote);
        const actualNoteIndex = (openNoteIndex + note.fret) % 12;
        const expectedNote = noteOrder[actualNoteIndex];

        // Track when note became active (only start tracking when bar touches)
        if (barHasTouched && !activeNoteStartTimeRef.current[noteIndex]) {
          activeNoteStartTimeRef.current[noteIndex] = currentTime;
        }

        // Check if detected notes contain the expected note
        const expectedNoteFlat = expectedNote.replace('#', 'b');

        const isCorrect =
          // Check detected individual notes
          detectedNoteNames.some(dn =>
            dn === expectedNote || dn === expectedNoteFlat
          ) ||
          // Check if detected chord starts with expected note (e.g., "Dm" contains "D")
          (detectedChord && (
            detectedChord.toUpperCase().startsWith(expectedNote) ||
            detectedChord.toUpperCase().startsWith(expectedNoteFlat) ||
            // Handle cases like "D" matching "Dm", "D7", "Dmaj", etc.
            detectedChord.match(new RegExp(`^${expectedNote}[^#]?`, 'i')) ||
            detectedChord.match(new RegExp(`^${expectedNoteFlat}`, 'i'))
          ));

        // Check duration - only when bar has touched
        const playDuration = barHasTouched && activeNoteStartTimeRef.current[noteIndex]
          ? currentTime - activeNoteStartTimeRef.current[noteIndex]
          : 0;
        const expectedDuration = note.duration || 0.5;
        const isTooLong = playDuration > expectedDuration + LATE_LEEWAY + 0.3;

        // Determine state based on timing window
        let newState: string | null = null;

        if (isInEarlyWindow) {
          // Early window: Only accept correct, don't mark wrong yet
          // This lets users play slightly early without penalty
          if (isCorrect) {
            newState = 'correct';
          } else {
            // Keep previous state or null - don't mark wrong before bar touches
            newState = noteFeedback[noteIndex] || null;
          }
        } else if (barHasTouched) {
          // Bar has touched or passed: Now we can mark wrong/too-long
          if (isTooLong && detectedNotes.length > 0) {
            newState = 'too-long';
          } else if (isCorrect) {
            newState = 'correct';
          } else {
            // Wrong note OR silence - bar has touched, so this is a mistake
            newState = 'wrong';
          }

          // Track first mistake (only after bar has touched)
          if (newState === 'wrong' && !hasMadeMistake) {
            setHasMadeMistake(true);
            setFirstMistakeTime(currentTime);
            console.log(`❌ First mistake at ${currentTime.toFixed(2)}s (${detectedNotes.length > 0 ? 'wrong note' : 'silence'})`);
          }
        }

        newFeedback[noteIndex] = newState;

        // Log once per second if something is detected
        if (shouldLog && detectedNotes.length > 0 && barHasTouched) {
          const emoji = newState === 'correct' ? '✅ CORRECT' : newState === 'wrong' ? '❌ WRONG' : '⏱️ TOO LONG';
          console.log(`🎵 Note: String ${note.string}, Fret ${note.fret} | Expected: ${expectedNote} | Played: [${detectedNoteNames.join(', ')}] → ${emoji}`);
          lastLogTimeRef.current = now;
        }
      } else {
        // Note is no longer active, clear its start time
        if (activeNoteStartTimeRef.current[noteIndex]) {
          delete activeNoteStartTimeRef.current[noteIndex];
        }
      }
    });

    setNoteFeedback(newFeedback);
  }, [isPlaying, currentTime, detectedNotes, detectedChord, noteEvents]);

  // Cleanup chord detection when component unmounts
  useEffect(() => {
    return () => {
      if (chordDetectionRef.current) {
        chordDetectionRef.current.stopRecording();
        chordDetectionRef.current.disconnect();
        chordDetectionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && startTime) {
      const animate = () => {
        // Apply playback speed to elapsed time
        const elapsed = ((Date.now() - startTime) / 1000) * playbackSpeed;
        setCurrentTime(elapsed);
        const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);
        setProgress(progressPercent);

        // Check if we're in the last 3 seconds - trigger completion celebration (only if no mistakes)
        const timeRemaining = totalDuration - elapsed;
        if (timeRemaining <= 3 && timeRemaining > 0 && !showCompletion && !hasMadeMistake) {
          setShowCompletion(true);
          setCompletionOpacity(0);
        }

        // Animate the completion fade-in during the last 3 seconds
        if (showCompletion && timeRemaining <= 3 && timeRemaining > 0) {
          const fadeProgress = 1 - (timeRemaining / 3);
          setCompletionOpacity(Math.min(1, fadeProgress));
        }

        if (elapsed < totalDuration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          setProgress(100);

          if (hasMadeMistake) {
            // Show mistake options instead of trophy
            setShowMistakeOptions(true);
          } else {
            // Perfect run - show trophy and complete
            setCompletionOpacity(1);
            setTimeout(() => {
              setSlideOut(true);
              setTimeout(() => {
                handleComplete();
              }, 500);
            }, 800);
          }
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, startTime, totalDuration, showCompletion, playbackSpeed, hasMadeMistake]);

  const handlePlay = async () => {
    if (!isPlaying) {
      // Start chord detection if connected
      if (chordDetectionRef.current?.isConnected()) {
        await chordDetectionRef.current.startRecording();
        console.log('🎸 Started chord detection');
      }

      setStartTime(Date.now() - currentTime * 1000);
      setIsPlaying(true);
    } else {
      // Pause playback
      setIsPlaying(false);

      // Stop chord detection
      if (chordDetectionRef.current) {
        chordDetectionRef.current.stopRecording();
        console.log('🎸 Stopped chord detection');
      }
    }
  };

  const handleReset = async () => {
    // Stop chord detection
    if (chordDetectionRef.current) {
      chordDetectionRef.current.stopRecording();
    }
    setDetectedChord(null);
    setDetectedNotes([]);
    setChordConfidence(0);
    setChordStability(0);

    // Reset note feedback
    setNoteFeedback({});
    activeNoteStartTimeRef.current = {};

    // Reset mistake tracking
    setHasMadeMistake(false);
    setFirstMistakeTime(null);
    setShowMistakeOptions(false);

    setIsPlaying(false);
    setCurrentTime(0);
    setStartTime(null);
    setProgress(0);
    // Reset completion celebration
    setShowCompletion(false);
    setCompletionOpacity(0);
    setSlideOut(false);
  };

  // Restart from beginning
  const handleRestartFromStart = () => {
    setShowMistakeOptions(false);
    setHasMadeMistake(false);
    setFirstMistakeTime(null);
    setNoteFeedback({});
    activeNoteStartTimeRef.current = {};
    setCurrentTime(0);
    setProgress(0);
    setStartTime(Date.now());
    setIsPlaying(true);

    // Restart chord detection
    if (chordDetectionRef.current) {
      chordDetectionRef.current.startRecording();
    }
  };

  // Restart from 3 seconds before first mistake
  const handleRestartFromMistake = () => {
    if (firstMistakeTime === null) return;

    const restartTime = Math.max(0, firstMistakeTime - 3);
    setShowMistakeOptions(false);
    setHasMadeMistake(false);
    setFirstMistakeTime(null);
    setNoteFeedback({});
    activeNoteStartTimeRef.current = {};
    setCurrentTime(restartTime);
    setProgress((restartTime / totalDuration) * 100);
    // Adjust start time to account for the offset
    setStartTime(Date.now() - (restartTime * 1000 / playbackSpeed));
    setIsPlaying(true);

    // Restart chord detection
    if (chordDetectionRef.current) {
      chordDetectionRef.current.startRecording();
    }
  };

  // Handle closing the dialog
  const handleClose = () => {
    // Stop playback
    setIsPlaying(false);

    // Stop chord detection
    if (chordDetectionRef.current) {
      chordDetectionRef.current.stopRecording();
      chordDetectionRef.current.disconnect();
    }

    // Call the parent's onClose
    onClose();
  };

  const handleComplete = () => {
    console.log('🟢 COMPLETE PRACTICE BUTTON CLICKED!');

    // Stop chord detection
    if (chordDetectionRef.current) {
      chordDetectionRef.current.stopRecording();
    }

    // Calculate actual minutes practiced based on how long the popup was open
    const elapsedMs = practiceStartTime ? Date.now() - practiceStartTime : 0;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    // Use actual seconds converted to minutes (rounded to nearest minute, minimum 0)
    // For short songs, this will be 0 minutes if less than 30 seconds
    const minutesPracticed = Math.round(elapsedSeconds / 60);

    console.log('⏱️ Practice time: ', elapsedSeconds, 'seconds =', minutesPracticed, 'minutes');

    // Calculate final progress based on how much of the song was played
    // If the completion animation was shown, the song was fully completed = 100%
    let finalProgress: number;
    const playbackProgress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
    const combinedProgress = Math.max(playbackProgress, progress);

    if (showCompletion) {
      // Song was completed naturally through playback
      finalProgress = 100;
      console.log('🏆 Song completed naturally - setting progress to 100%');
    } else {
      // Manual completion - calculate based on how much was played
      // Minimum 10% for any practice session
      finalProgress = Math.max(combinedProgress, 10);
    }

    // Use the songId from props - this should always exist from the selected songs
    const songId = song.songId || `${song.title.toLowerCase().replace(/\s+/g, '_')}_${song.artist.toLowerCase().replace(/\s+/g, '_')}`;

    console.log('🎵 SongPractice handleComplete:');
    console.log('  - song.songId from props:', song.songId);
    console.log('  - computed songId:', songId);
    console.log('  - showCompletion:', showCompletion);
    console.log('  - currentTime:', currentTime);
    console.log('  - totalDuration:', totalDuration);
    console.log('  - playbackProgress:', playbackProgress);
    console.log('  - progress state:', progress);
    console.log('  - combinedProgress:', combinedProgress);
    console.log('  - finalProgress (will be sent):', Math.round(finalProgress));
    console.log('  - elapsedSeconds:', elapsedSeconds);
    console.log('  - minutesPracticed:', minutesPracticed);

    const progressToSend = Math.round(finalProgress);
    console.log('🎵 Calling onComplete with progressPercent:', progressToSend);

    // Call onComplete first to update progress
    onComplete(minutesPracticed, progressToSend, {
      songId,
      title: song.title,
      artist: song.artist,
      genre: song.genre
    });

    // Longer delay before closing to ensure state updates propagate
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pixels per second for the scrolling timeline
  const pixelsPerSecond = 150;

  // String colors (darker for light theme)
  const stringColors = [
    'rgb(139, 90, 43)',   // E (low) - thickest
    'rgb(160, 110, 60)',  // A
    'rgb(180, 130, 80)',  // D
    'rgb(190, 145, 95)',  // G
    'rgb(200, 160, 110)', // B
    'rgb(210, 175, 125)', // e (high) - thinnest
  ];

  const stringThicknesses = [4, 3.5, 3, 2.5, 2, 1.5];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* CSS Animation for bar glow pulse */}
      <style>{`
        @keyframes barPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
      <DialogContent
        className="!w-[98vw] !max-w-[98vw] h-[85vh] max-h-[700px] p-0 overflow-hidden [&>button:last-of-type]:hidden flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 sm:!max-w-[98vw] border-2 border-gray-200 dark:border-slate-600"
        style={{
          borderRadius: '16px',
          width: '98vw',
          maxWidth: '98vw',
          transform: slideOut ? 'translateY(120%)' : 'translateY(0)',
          opacity: slideOut ? 0 : 1,
          transition: 'transform 0.5s ease-in, opacity 0.4s ease-out'
        }}
        aria-describedby={undefined}
      >
        {/* Hidden accessibility elements */}
        <DialogTitle className="sr-only">{song.title} - Practice Session</DialogTitle>

        {/* Header */}
        <div
          className="flex-shrink-0 px-5 py-4 bg-white/90 dark:bg-slate-800"
        >
          {/* Header indicators */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Play in reverse indicator */}
            <span
              className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700"
            >
              ← Play in reverse
            </span>

          </div>
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
        <div
          ref={practiceAreaRef}
          className="flex-1 relative overflow-hidden mx-4 rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-gray-200 dark:border-slate-600"
          style={{
            borderBottomWidth: '3.5px',
            minHeight: '280px'
          }}
        >
          {/* String labels on the left */}
          <div
            className="absolute left-0 top-0 bottom-0 w-10 z-40 flex flex-col justify-center bg-white/95 dark:bg-slate-800 border-r-2 border-gray-200 dark:border-slate-600"
          >
            {['E', 'A', 'D', 'G', 'B', 'e'].map((name, i) => (
              <div
                key={i}
                className="flex-1 flex items-center justify-center text-xs font-bold"
                style={{ color: stringColors[i] }}
              >
                {name}
                </div>
              ))}
            </div>

          {/* Hit zone indicator - vertical blue line (matching Songs page blue) */}
          {(() => {
            // Check if any note is currently being hit (for bar animation)
            const VISUAL_DELAY = 2.5;
            const anyNoteActive = noteEvents.some(note => {
              const hitTime = note.time + VISUAL_DELAY;
              const endTime = note.time + (note.duration || 0.5) + VISUAL_DELAY;
              return currentTime >= hitTime && currentTime < endTime;
            });

            // Check feedback state for color
            const activeNoteIndex = noteEvents.findIndex(note => {
              const hitTime = note.time + VISUAL_DELAY;
              const endTime = note.time + (note.duration || 0.5) + VISUAL_DELAY;
              return currentTime >= hitTime && currentTime < endTime;
            });
            const activeFeedback = activeNoteIndex >= 0 ? noteFeedback[activeNoteIndex] : null;

            // Bar color based on feedback
            const barColor = activeFeedback === 'correct'
              ? 'rgb(34, 197, 94)'
              : activeFeedback === 'wrong'
                ? 'rgb(239, 68, 68)'
                : 'rgb(59, 130, 246)';
            const barColorDark = activeFeedback === 'correct'
              ? 'rgb(22, 163, 74)'
              : activeFeedback === 'wrong'
                ? 'rgb(220, 38, 38)'
                : 'rgb(37, 99, 235)';
            const glowColor = activeFeedback === 'correct'
              ? 'rgba(34, 197, 94, 0.6)'
              : activeFeedback === 'wrong'
                ? 'rgba(239, 68, 68, 0.6)'
                : 'rgba(59, 130, 246, 0.4)';

            return (
              <div
                ref={hitZoneRef}
                className="absolute top-0 bottom-0 z-30"
                style={{
                  left: '15%',
                  width: anyNoteActive ? '6px' : '4px',
                  background: `linear-gradient(to bottom, ${barColor}, ${barColorDark})`,
                  boxShadow: anyNoteActive
                    ? `0 0 25px ${glowColor}, 0 0 50px ${glowColor}`
                    : `0 0 15px ${glowColor}`,
                  transform: anyNoteActive ? 'scaleX(1.5)' : 'scaleX(1)',
                  transition: 'width 0.1s ease-out, box-shadow 0.1s ease-out, transform 0.1s ease-out, background 0.15s ease-out'
                }}
              />
            );
          })()}

          {/* Static horizontal string lines in the streaming area - aligned with notes */}
          <div className="absolute left-10 right-0 top-0 bottom-0 flex flex-col justify-center pointer-events-none z-5">
            {[0, 1, 2, 3, 4, 5].map((stringIndex) => {
              const stringHeight = 100 / 6;
              const topPercent = stringIndex * stringHeight + stringHeight / 2;
              return (
                <div
                  key={`string-line-${stringIndex}`}
                  className="absolute left-0 right-0"
                      style={{
                    top: `${topPercent}%`,
                    height: '2px',
                    backgroundColor: 'rgb(200, 200, 200)',
                    transform: 'translateY(-50%)'
                  }}
                />
              );
            })}
          </div>

          {/* Scrolling note events - shows exactly which notes to play */}
          <div
            ref={timelineRef}
            className="absolute left-10 right-0 top-0 bottom-0"
            style={{
              transform: `translateX(${-currentTime * pixelsPerSecond}px)`,
              transition: isPlaying ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {/* First, render chord connectors for notes that play at the same time */}
            {(() => {
              // Group notes by time to find chords
              const notesByTime = new Map<number, typeof noteEvents>();
              noteEvents.forEach(note => {
                const timeKey = Math.round(note.time * 1000) / 1000; // Round to avoid floating point issues
                if (!notesByTime.has(timeKey)) {
                  notesByTime.set(timeKey, []);
                }
                notesByTime.get(timeKey)!.push(note);
              });

              // Render connectors for chords (2+ notes at same time)
              return Array.from(notesByTime.entries()).map(([time, notes]) => {
                if (notes.length < 2) return null;

                const noteWidth = Math.max(30, notes[0].duration * pixelsPerSecond * 0.8);
                // Position note so it reaches bar when currentTime = time
                const noteStartX = time * pixelsPerSecond + hitZoneOffset;
                const activationDelay = 2.5;
                const isActive = currentTime >= (time + activationDelay) && currentTime < (time + notes[0].duration + activationDelay);
                const isPast = currentTime >= (time + notes[0].duration + activationDelay);

                // Find the top and bottom strings
                const strings = notes.map(n => n.string).sort((a, b) => a - b);
                const topString = strings[strings.length - 1]; // Highest string number = lowest on screen
                const bottomString = strings[0]; // Lowest string number = highest on screen

                const stringHeight = 100 / 6;
                const topStringIndex = 6 - topString;
                const bottomStringIndex = 6 - bottomString;
                const topPercent = topStringIndex * stringHeight + stringHeight / 2;
                const bottomPercent = bottomStringIndex * stringHeight + stringHeight / 2;

                return (
                  <div
                    key={`chord-connector-${time}`}
                    className="absolute"
                    style={{
                      left: `${noteStartX + noteWidth / 2 - 2}px`,
                      top: `${topPercent}%`,
                      width: '4px',
                      height: `${bottomPercent - topPercent}%`,
                      backgroundColor: isPast
                        ? 'rgb(209, 213, 219)'
                        : isActive
                          ? 'rgb(59, 130, 246)'
                          : 'rgb(191, 219, 254)',
                      borderRadius: '2px',
                      opacity: isPast ? 0.4 : 0.8,
                      transform: isPast ? 'scaleX(0.8)' : 'scaleX(1)',
                      zIndex: 5,
                      transition: 'background-color 0.15s ease-out, opacity 0.2s ease-out, transform 0.15s ease-out'
                    }}
                  />
                );
              });
            })()}

            {noteEvents.map((note, noteIndex) => {
              // Calculate note width
              const noteWidth = Math.max(30, note.duration * pixelsPerSecond * 0.8);

              // Position note so it reaches bar exactly when currentTime = note.time
              const noteStartX = note.time * pixelsPerSecond + hitZoneOffset;

              // Activation delay to match visual timing
              const activationDelay = 2.5;
              const isActive = currentTime >= (note.time + activationDelay) && currentTime < (note.time + note.duration + activationDelay);
              const isPast = currentTime >= (note.time + note.duration + activationDelay);

              // String position (string 1 = high e at top, string 6 = low E at bottom)
              // So we need to map: string 6 -> index 0 (top), string 1 -> index 5 (bottom)
              // Actually: E A D G B e from top to bottom = strings 6,5,4,3,2,1
              const stringIndex = 6 - note.string; // Convert to visual index (0-5 from top)

              // Display fret number (0 = open string shown as ○)
              const isOpenString = note.fret === 0;
              const stringHeight = 100 / 6;
              const topPercent = stringIndex * stringHeight + stringHeight / 2;

              // Color based on technique
              const getTechniqueColor = (technique: string | undefined, active: boolean, past: boolean) => {
                if (past) return { bg: 'rgb(209, 213, 219)', border: 'rgb(229, 231, 235)' };
                if (!active) {
                  switch (technique) {
                    case 'hammer': return { bg: 'rgb(253, 186, 116)', border: 'rgb(251, 146, 60)' };
                    case 'pull': return { bg: 'rgb(196, 181, 253)', border: 'rgb(167, 139, 250)' };
                    case 'slide': return { bg: 'rgb(134, 239, 172)', border: 'rgb(74, 222, 128)' };
                    case 'mute': return { bg: 'rgb(156, 163, 175)', border: 'rgb(107, 114, 128)' };
                    default: return { bg: 'rgb(147, 197, 253)', border: 'rgb(96, 165, 250)' };
                  }
                }
                // Active note
                switch (technique) {
                  case 'hammer': return { bg: 'rgb(249, 115, 22)', border: 'rgb(234, 88, 12)' };
                  case 'pull': return { bg: 'rgb(139, 92, 246)', border: 'rgb(124, 58, 237)' };
                  case 'slide': return { bg: 'rgb(34, 197, 94)', border: 'rgb(22, 163, 74)' };
                  case 'mute': return { bg: 'rgb(107, 114, 128)', border: 'rgb(75, 85, 99)' };
                  default: return { bg: 'rgb(59, 130, 246)', border: 'rgb(37, 99, 235)' };
                }
              };

              const colors = getTechniqueColor(note.technique, isActive, isPast);

              // Get feedback for this note
              const feedback = noteFeedback[noteIndex];

              // Feedback colors: wrong = red, too-long = gray, correct = green
              const getFeedbackColors = () => {
                if (!isActive) return null;
                if (feedback === 'wrong') {
                  return { bg: 'rgb(239, 68, 68)', border: 'rgb(220, 38, 38)', bottom: 'rgb(185, 28, 28)' };
                }
                if (feedback === 'too-long') {
                  return { bg: 'rgb(156, 163, 175)', border: 'rgb(107, 114, 128)', bottom: 'rgb(75, 85, 99)' };
                }
                if (feedback === 'correct') {
                  return { bg: 'rgb(34, 197, 94)', border: 'rgb(22, 163, 74)', bottom: 'rgb(21, 128, 61)' };
                }
                return null;
              };

              const feedbackColors = getFeedbackColors();

              // Button-like styling matching the control buttons
              const buttonBg = isPast
                ? 'rgb(229, 231, 235)'
                : feedbackColors
                  ? feedbackColors.bg
                  : isActive
                    ? 'rgb(59, 130, 246)'
                    : isOpenString
                      ? 'rgba(255, 255, 255, 0.95)'
                      : colors.bg;

              const buttonBorder = isPast
                ? 'rgb(209, 213, 219)'
                : feedbackColors
                  ? feedbackColors.border
                  : isActive
                    ? 'rgb(37, 99, 235)'
                    : isOpenString
                      ? 'rgb(156, 163, 175)'
                      : colors.border;

              const buttonBottomBorder = isPast
                ? 'rgb(209, 213, 219)'
                : feedbackColors
                  ? feedbackColors.bottom
                  : isActive
                    ? 'rgb(29, 78, 216)'
                    : isOpenString
                      ? 'rgb(107, 114, 128)'
                      : colors.border;

              return (
                <div
                  key={`note-${noteIndex}`}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${noteStartX}px`,
                    top: `calc(${topPercent}% - 12px)`,
                    minWidth: '28px',
                    width: `${Math.max(28, noteWidth)}px`,
                    height: '24px',
                    borderRadius: '8px',
                    backgroundColor: buttonBg,
                    border: `2px solid ${buttonBorder}`,
                    borderBottom: `3px solid ${buttonBottomBorder}`,
                    boxShadow: isActive
                      ? '0 4px 12px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)'
                      : isPast
                        ? 'none'
                        : '0 2px 4px rgba(0, 0, 0, 0.1)',
                    opacity: isPast ? 0.4 : 1,
                    // INSTANT transform change - no transition delay
                    transform: isActive
                      ? 'scale(1.15)'
                      : isPast
                        ? 'scale(0.9)'
                        : 'scale(1)',
                    // Only animate scale DOWN (when leaving active), not UP (when becoming active)
                    transition: isPast || !isActive
                      ? 'transform 0.2s ease-out, opacity 0.2s ease-out'
                      : 'none',
                    zIndex: isActive ? 20 : 10
                  }}
                >
                  {/* Fret number display */}
                  <span
                    className="font-bold select-none"
                            style={{
                      fontSize: '12px',
                      color: isPast
                        ? 'rgb(156, 163, 175)'
                        : isActive
                          ? 'white'
                          : isOpenString
                            ? 'rgb(75, 85, 99)'
                            : 'white',
                      textShadow: (isActive || !isOpenString) && !isPast ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    {isOpenString ? '○' : note.fret}
                  </span>
                </div>
              );
            })}
          </div>


          {/* Completion Celebration Overlay - Just trophy */}
          {showCompletion && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${completionOpacity * 0.95})`,
                backdropFilter: `blur(${completionOpacity * 8}px)`,
                transition: 'backdrop-filter 0.3s ease-out'
              }}
            >
              {/* Trophy */}
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  opacity: completionOpacity,
                  transform: `scale(${0.6 + completionOpacity * 0.4})`,
                  transition: 'transform 0.4s ease-out, opacity 0.3s ease-out',
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, rgb(251, 191, 36), rgb(245, 158, 11), rgb(217, 119, 6))',
                  boxShadow: '0 12px 40px rgba(245, 158, 11, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                  border: '4px solid rgb(217, 119, 6)',
                  borderBottom: '6px solid rgb(180, 83, 9)'
                }}
              >
                <Trophy
                  className="text-white drop-shadow-lg"
                  style={{ width: '60px', height: '60px' }}
                />
              </div>
            </div>
          )}

          {/* Mistake Options Overlay */}
          {showMistakeOptions && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(254, 242, 242, 0.97)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                boxShadow: 'inset 0 0 40px rgba(239, 68, 68, 0.08)'
              }}
            >
              <div className="flex flex-col items-center p-8">
                <p className="text-xl font-bold text-red-700 mb-2">You made a mistake</p>
                <p className="text-sm text-red-400 mb-8">First mistake at {formatTime(firstMistakeTime || 0)}</p>
                <div className="flex gap-4">
                  <button
                    onClick={handleRestartFromStart}
                    className="rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      padding: '12px 32px',
                      backgroundColor: 'rgb(239, 68, 68)',
                      color: 'white',
                      border: '2px solid rgb(220, 38, 38)',
                      borderBottom: '3px solid rgb(185, 28, 28)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    Start Over
                  </button>
                  <button
                    onClick={handleRestartFromMistake}
                    className="rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      padding: '12px 32px',
                      backgroundColor: 'rgb(34, 197, 94)',
                      color: 'white',
                      border: '2px solid rgb(22, 163, 74)',
                      borderBottom: '3px solid rgb(21, 128, 61)',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    Try from {formatTime(Math.max(0, (firstMistakeTime || 0) - 3))}
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>

        {/* Footer Controls */}
        <div
          className="flex-shrink-0 px-5 py-4 bg-white/90 dark:bg-slate-800"
        >
          {/* Detected Chord Display - replaces index.html chordDisplay section */}
          <div className="flex items-center justify-center mb-4">
            <div
              className="px-8 py-4 rounded-2xl text-center transition-all duration-200"
              style={{
                backgroundColor: !chordDetectionConnected
                  ? 'rgba(239, 68, 68, 0.1)'
                  : detectedChord
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(156, 163, 175, 0.08)',
                border: `2px solid ${!chordDetectionConnected
                  ? 'rgba(239, 68, 68, 0.3)'
                  : detectedChord
                    ? 'rgba(34, 197, 94, 0.3)'
                    : 'rgba(156, 163, 175, 0.2)'}`,
                minWidth: '220px'
              }}
            >
              {/* Connection status indicator */}
              {!chordDetectionConnected && (
                <div className="text-sm text-red-500 mb-2">
                  ⚠️ Not connected to chord server
                </div>
              )}
              {/* chordName - same as index.html #chordName */}
              <div
                className="text-4xl font-bold transition-all"
                style={{
                  color: !chordDetectionConnected
                    ? 'rgb(239, 68, 68)'
                    : detectedChord
                      ? 'rgb(22, 163, 74)'
                      : 'rgb(156, 163, 175)'
                }}
              >
                {!chordDetectionConnected ? '🔌' : (detectedChord || '--')}
                </div>

                {/* chordConfidence - same as index.html #chordConfidence */}
                {detectedChord && chordConfidence > 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Confidence: {(chordConfidence * 100).toFixed(1)}%
                  </div>
                )}

                {/* chordStability - same as index.html #chordStability */}
                {detectedChord && (
                  <div
                    className="text-xs mt-1 font-medium"
                    style={{
                      color: chordStability >= 2 ? 'rgb(34, 197, 94)' : 'rgb(234, 179, 8)'
                    }}
                  >
                    {chordStability >= 2 ? 'Stable' : 'Unstable'}
                  </div>
                )}

                {/* notesList - shows most confident detected note */}
                {chordDetectionConnected && detectedNotes.length > 0 && (
                  <div className="text-sm text-gray-400 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    Playing: <span className="font-semibold text-gray-600 dark:text-gray-300">{detectedNotes[0]}</span>
                  </div>
                )}
            </div>
          </div>

          {/* Progress bar - follows currentTime continuously */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-gray-500 w-10 font-medium">{formatTime(currentTime)}</span>
            <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  // Use currentTime directly for smooth continuous progress
                  width: `${Math.min(100, (currentTime / totalDuration) * 100)}%`,
                  backgroundColor: 'rgb(59, 130, 246)',
                  border: '1px solid rgb(37, 99, 235)',
                  borderBottomWidth: '2px',
                  // No transition for instant updates during playback
                  transition: isPlaying ? 'none' : 'width 0.3s ease-out'
                }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10 text-right font-medium">{displayDuration}</span>
          </div>

          {/* Speed control */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500 mr-2">Speed:</span>
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  setPlaybackSpeed(speed);
                  // Adjust startTime if currently playing
                  if (isPlaying && startTime) {
                    setStartTime(Date.now() - (currentTime * 1000 / speed));
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                  playbackSpeed === speed
                    ? 'bg-blue-500 text-white border-blue-600 scale-105'
                    : 'bg-white/90 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={handlePlay}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{
                backgroundColor: isPlaying ? 'rgb(234, 179, 8)' : 'rgb(59, 130, 246)',
                border: `2px solid ${isPlaying ? 'rgb(202, 138, 4)' : 'rgb(37, 99, 235)'}`,
                borderBottom: `4px solid ${isPlaying ? 'rgb(161, 98, 7)' : 'rgb(37, 99, 235)'}`,
                boxShadow: `0 4px 6px -1px ${isPlaying ? 'rgba(234, 179, 8, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
              }}
            >
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-white/90 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600"
              style={{
                borderBottomWidth: '4px'
              }}
            >
              <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <button
              onClick={handleComplete}
              className="w-20 h-12 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'rgb(59, 130, 246)',
                border: '2px solid rgb(37, 99, 235)',
                borderBottom: '4px solid rgb(37, 99, 235)'
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
