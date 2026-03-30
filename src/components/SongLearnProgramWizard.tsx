import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContentFullscreen, DialogTitle } from './ui/dialog';
import { BookOpen, ChevronRight, GraduationCap, Music, X } from 'lucide-react';
import { SongPractice } from './SongPractice';
import { GuitarFretboardDiagram } from './GuitarFretboardDiagram';
import { getChordFingering } from '../utils/chordFingerings';
import { getSongData } from '../utils/songDataService';
import {
  orderedUniqueChords,
  buildPracticeSections,
  type SongPracticeSection,
} from '../utils/songLearningProgram';
import { markSongLearnProgramComplete } from '../utils/progressStorage';

const font = '"Nunito", "Segoe UI", system-ui, sans-serif';

export interface SongLearnProgramWizardSong {
  songId?: string;
  title: string;
  artist: string;
  chords: string[];
  duration: string;
  bpm: number;
  genre: string;
  difficulty?: number;
  melodyOnly?: boolean;
}

interface SongLearnProgramWizardProps {
  isOpen: boolean;
  onClose: () => void;
  song: SongLearnProgramWizardSong;
  userId: string;
  userLevel?: string;
  /** Called when the final full-song run logs progress (trophy path). */
  onPracticeLogged: (
    minutesPracticed: number,
    progressPercent: number,
    songInfo: { songId: string; title: string; artist: string; genre: string }
  ) => void;
  onGraduated?: () => void;
}

type PracticeMode = null | { kind: 'section'; section: SongPracticeSection; index: number; total: number } | { kind: 'full' };

export function SongLearnProgramWizard({
  isOpen,
  onClose,
  song,
  userId,
  userLevel,
  onPracticeLogged,
  onGraduated,
}: SongLearnProgramWizardProps) {
  const [step, setStep] = useState(0);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);
  const [pendingJumpToFull, setPendingJumpToFull] = useState(false);
  /** User chose "Go straight to full song" — skip melody note prep in full-song practice. */
  const [skipMelodyPrepForFullSong, setSkipMelodyPrepForFullSong] = useState(false);

  const program = useMemo(() => {
    const chords = orderedUniqueChords(song.chords);
    const data = getSongData(song.title, song.chords || [], song.bpm || 120, song.duration || '3:00', {
      melodyOnly: Boolean(song.melodyOnly),
    });
    const sections = buildPracticeSections(data.events || []);
    return { chords, sections };
  }, [song.title, song.chords, song.bpm, song.duration, song.melodyOnly]);

  const introSteps = 1;
  const chordSteps = song.melodyOnly ? 0 : program.chords.length;
  const sectionSteps = program.sections.length;
  const totalGuideSteps = introSteps + chordSteps + sectionSteps;
  const totalSteps = totalGuideSteps + 1;

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setPracticeMode(null);
    setPendingJumpToFull(false);
    setSkipMelodyPrepForFullSong(false);
  }, [isOpen, song.songId, song.title]);

  const resolveStep = (s: number) => {
    if (s === 0) return { type: 'intro' as const };
    if (s < introSteps + chordSteps) {
      const i = s - introSteps;
      return {
        type: 'chord' as const,
        chord: program.chords[i],
        index: i + 1,
        total: chordSteps,
      };
    }
    if (s < totalGuideSteps) {
      const i = s - introSteps - chordSteps;
      return {
        type: 'section' as const,
        section: program.sections[i],
        index: i + 1,
        total: sectionSteps,
      };
    }
    return { type: 'full' as const };
  };

  const current = resolveStep(step);
  const songId =
    song.songId ||
    `${song.title.toLowerCase().replace(/\s+/g, '_')}_${song.artist.toLowerCase().replace(/\s+/g, '_')}`;

  const ctaClass =
    'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] touch-manipulation';
  const ctaStyle: React.CSSProperties = {
    backgroundColor: 'rgb(219, 234, 254)',
    borderBottom: '2px solid rgb(147, 197, 253)',
    color: 'rgb(37, 99, 235)',
    fontFamily: font,
  };

  const openSectionPractice = (section: SongPracticeSection, index: number, total: number) => {
    setPracticeMode({ kind: 'section', section, index, total });
  };

  const openFullPractice = () => {
    setPracticeMode({ kind: 'full' });
  };

  const handleGoStraightToFull = () => {
    setSkipMelodyPrepForFullSong(true);
    if (chordSteps > 0) {
      // Gate full-song attempts behind chord checks.
      setPendingJumpToFull(true);
      setStep(1);
      return;
    }
    setStep(totalGuideSteps);
  };

  return (
    <>
      <Dialog open={isOpen && !practiceMode} onOpenChange={(open) => !open && onClose()}>
        <DialogContentFullscreen
          className="!flex flex-col min-h-0 gap-0 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 border-0 shadow-none"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Learn {song.title}</DialogTitle>

          <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden px-4 sm:px-6 py-4">
            <div className="flex-shrink-0 backdrop-blur-sm rounded-xl px-3 py-3 mb-3 shadow-sm bg-white/60 dark:bg-slate-800/80 border-2 border-gray-200/80 dark:border-slate-600">
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgb(219, 234, 254)',
                    borderBottom: '2px solid rgb(147, 197, 253)',
                  }}
                >
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 text-blue-600"
                    style={{ fontFamily: font }}
                  >
                    Learn guitar basics
                  </p>
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate" style={{ fontFamily: font }}>
                    {song.title}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {song.artist} · Step {Math.min(step + 1, totalSteps)} of {totalSteps}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                  style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 -mr-0.5">
              {current.type === 'intro' && (
                <div className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm bg-white/60 dark:bg-slate-800/80 border-2 border-gray-200/80 dark:border-slate-600 space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Music className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold" style={{ fontFamily: font }}>
                      How this song program works
                    </p>
                  </div>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed" style={{ fontFamily: font }}>
                    {song.melodyOnly ? (
                      <li>
                        This track is a single-note melody on the tab — follow one note at a time (no chord-shape steps in this program).
                      </li>
                    ) : (
                      <li>
                        You’ll see each chord (or shape) used in this song, one at a time, with a fretboard diagram.
                      </li>
                    )}
                    <li>
                      Then you’ll practice {sectionSteps} segments that each start from the beginning and grow longer, until you’re ready for the full song.
                    </li>
                  </ol>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-3" style={{ fontFamily: font }}>
                    Let’s get started!
                  </p>
                  <button
                    type="button"
                    className={ctaClass}
                    style={ctaStyle}
                    onClick={() => {
                      setSkipMelodyPrepForFullSong(false);
                      setStep(1);
                    }}
                  >
                    {chordSteps > 0 ? 'Start with chords' : 'Start sections'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={ctaClass}
                    style={{ ...ctaStyle, backgroundColor: 'rgba(79, 70, 229, 0.12)', borderBottom: '2px solid rgba(79, 70, 229, 0.35)', color: 'rgb(67, 56, 202)' }}
                    onClick={handleGoStraightToFull}
                  >
                    Go straight to full song
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {chordSteps > 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: font }}>
                      We’ll run a quick chord check first.
                    </p>
                  ) : null}
                </div>
              )}

              {current.type === 'chord' && (
                <div className="space-y-4">
                  <div className="backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm bg-white/60 dark:bg-slate-800/80 border-2 border-gray-200/80 dark:border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-wide text-blue-600" style={{ fontFamily: font }}>
                        Chord {current.index} of {current.total}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-1" style={{ fontFamily: font }}>
                      {current.chord}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: font }}>
                      This shape appears in your song. Press the strings cleanly; avoid buzzing muted strings.
                    </p>
                  </div>
                  <div className="backdrop-blur-sm rounded-xl px-3 py-3 shadow-sm bg-white/60 dark:bg-slate-800/80 border-2 border-gray-200/80 dark:border-slate-600">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2" style={{ fontFamily: font }}>
                      Fretboard
                    </p>
                    <GuitarFretboardDiagram
                      fingering={getChordFingering(current.chord)}
                      accentColor="rgb(59, 130, 246)"
                      embedded
                    />
                  </div>
                  <button
                    type="button"
                    className={ctaClass}
                    style={ctaStyle}
                    onClick={() => {
                      if (current.index >= current.total) {
                        if (pendingJumpToFull) {
                          setStep(totalGuideSteps);
                          return;
                        }
                      }
                      setStep((s) => s + 1);
                    }}
                  >
                    {current.index >= current.total
                      ? pendingJumpToFull
                        ? 'Chords checked: go to full song'
                        : 'Next: section practice'
                      : 'Next chord'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {current.type === 'section' && (
                <div className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm bg-white/60 dark:bg-slate-800/80 border-2 border-gray-200/80 dark:border-slate-600 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-1" style={{ fontFamily: font }}>
                      Section practice · {current.index} of {current.total}
                    </p>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-50" style={{ fontFamily: font }}>
                      {current.section.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2" style={{ fontFamily: font }}>
                      Practice just this part. Slow speed if needed, then continue to the next part.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={ctaClass}
                    style={ctaStyle}
                    onClick={() => openSectionPractice(current.section, current.index, current.total)}
                  >
                    Practice this section
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {current.type === 'full' && (
                <div className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm bg-white/60 dark:bg-slate-800/80 border-2 border-gray-200/80 dark:border-slate-600 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-violet-600 mb-1" style={{ fontFamily: font }}>
                      Final step
                    </p>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-50" style={{ fontFamily: font }}>
                      Whole song
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2" style={{ fontFamily: font }}>
                      Play from start to finish. Hit the trophy run (no mistakes) to complete this song’s learn program.
                    </p>
                  </div>
                  <button type="button" className={ctaClass} style={ctaStyle} onClick={() => openFullPractice()}>
                    Play full song
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogContentFullscreen>
      </Dialog>

      {practiceMode?.kind === 'section' && (
        <SongPractice
          isOpen
          onClose={() => setPracticeMode(null)}
          song={{ ...song, songId }}
          userId={userId}
          userLevel={userLevel}
          timeWindowSec={{
            start: practiceMode.section.startSec,
            end: practiceMode.section.endSec,
          }}
          relaxedCompletion
          headerSubtitle={`${practiceMode.section.label} (${practiceMode.index}/${practiceMode.total})`}
          onComplete={(_minutes, _progressPercent, _songInfo) => {
            setStep((s) => s + 1);
            setPracticeMode(null);
          }}
        />
      )}

      {practiceMode?.kind === 'full' && (
        <SongPractice
          isOpen
          onClose={() => setPracticeMode(null)}
          song={{ ...song, songId }}
          userId={userId}
          userLevel={userLevel}
          skipMelodyNotePrep={skipMelodyPrepForFullSong}
          headerSubtitle="Full song — complete program"
          onComplete={(minutes, progressPercent, songInfo) => {
            onPracticeLogged(minutes, progressPercent, songInfo);
            if (progressPercent >= 100) {
              markSongLearnProgramComplete(userId, songInfo.songId, {
                title: songInfo.title,
                artist: songInfo.artist,
                genre: songInfo.genre,
              });
              onGraduated?.();
              onClose();
            }
            setPracticeMode(null);
          }}
        />
      )}
    </>
  );
}
