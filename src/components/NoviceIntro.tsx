/**
 * Introductory popup: guitar basics (tab, minutes, you're ready), then coach's board tour.
 * Only shown once per user.
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import {
  ChevronRight,
  ChevronLeft,
  Music,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Home,
  TrendingUp,
  Check,
} from 'lucide-react';
import { setDailyPracticeGoal } from '../utils/progressStorage';

const font = '"Nunito", "Segoe UI", system-ui, sans-serif';
const cardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.58)' as const,
  border: '2.5px solid rgb(237, 237, 237)' as const,
};

const MINUTES_OPTIONS = [10, 15, 20, 30, 45, 60];

// Strip **bold** so all text renders plain
function stripBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1');
}

export interface NoviceIntroProps {
  isOpen: boolean;
  userId: string;
  userLevel?: string;
  onComplete: () => void;
  onGoToBasics?: () => void;
  onGoToSongs?: () => void;
  onNavigate?: (section: string) => void;
}

const COACH_SLIDES = [
  { id: 'coach-welcome', title: "Welcome to Strummy!", description: "Your personal guitar learning companion — here's your coach's board to help you start your musical journey!", icon: Sparkles, color: 'rgb(249, 115, 22)', section: 'dashboard' },
  { id: 'coach-dashboard', title: "Your Dashboard", description: "Your home base: daily goals, recent activity, and quick access to all features.", icon: Home, color: 'rgb(249, 115, 22)', section: 'dashboard' },
  { id: 'coach-songs', title: "Learn Songs You Love", description: "Browse songs with chord progressions, strumming patterns, and tutorials. Filter by difficulty and genre.", icon: Music, color: 'rgb(59, 130, 246)', section: 'songs' },
  { id: 'coach-learn', title: "Master Techniques & Theory", description: "Structured lessons on chords, strums, fingerpicking, and scales. Complete quizzes to track progress.", icon: BookOpen, color: 'rgb(16, 185, 129)', section: 'technique' },
  { id: 'coach-progress', title: "Track Your Progress", description: "Stats, streaks, and achievements. Set daily goals and stay motivated.", icon: TrendingUp, color: 'rgb(168, 85, 247)', section: 'progress' },
];

const GUITAR_SLIDES = [
  {
    id: 'welcome',
    title: 'Before You Play',
    icon: Music,
    color: 'rgb(249, 115, 22)',
    bullets: [
      "If you've never held a guitar, that's okay — Strummy starts from zero.",
      "Tab is how guitar music is written. Here's how to read it.",
    ],
  },
  {
    id: 'tab',
    title: 'How to Read Guitar Tab',
    icon: BookOpen,
    color: 'rgb(59, 130, 246)',
    bullets: [
      "Each line is one string: top = thinnest (high e), bottom = thickest (low E). A number is the fret to press; 0 = play the string open (no fret).",
      "Read left to right. Numbers in the same column mean play those notes together (a chord).",
    ],
    diagram: 'tab' as const,
  },
  {
    id: 'minutes',
    title: 'How much will you play?',
    icon: Clock,
    color: 'rgb(249, 115, 22)',
    bullets: [],
  },
  {
    id: 'next',
    title: "You're Ready",
    icon: CheckCircle2,
    color: 'rgb(249, 115, 22)',
    bullets: [
      "Next we'll show you around the app. Then you can start with Learn Guitar Basics or jump into songs.",
    ],
  },
];

// SongPractice-style tab constants for static diagram
const STRING_LABELS_WIDTH = 48;
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
const STRING_COLORS = ['#8B5A2B', '#A06E3C', '#B4824F', '#BE9160', '#C8A070', '#D2AF80'];

const LEARN_BASICS_SLIDE = {
  id: 'learn-basics',
  title: 'Learn Guitar Basics',
  icon: BookOpen,
  color: 'rgb(59, 130, 246)' as const,
  bullets: [
    "In the Songs section, open Learn Guitar Basics to see where each note is on the fretboard. The app listens and tells you when you're right.",
    "Start with one note, then a few notes, then a short scale. Use the speed control to slow down.",
  ],
};

const NOVICE_LEVELS = ['novice', 'beginner', 'elementary'];

export function NoviceIntro({ isOpen, userId, userLevel, onComplete, onGoToBasics, onGoToSongs, onNavigate }: NoviceIntroProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(30);

  const SLIDES = React.useMemo(() => {
    const base = [...GUITAR_SLIDES, ...COACH_SLIDES];
    if (userLevel && NOVICE_LEVELS.includes(userLevel)) base.push(LEARN_BASICS_SLIDE as typeof base[0]);
    return base;
  }, [userLevel]);

  const slide = SLIDES[slideIndex];
  const isLast = slideIndex === SLIDES.length - 1;
  const isNextSlide = slide?.id === 'next';
  const isMinutesSlide = slide?.id === 'minutes';
  const isLearnBasicsSlide = slide?.id === 'learn-basics';
  const isCoachSlide = slide && 'section' in slide && !!(slide as { section?: string }).section;
  const isFirstCoachSlide = isCoachSlide && slide?.id === 'coach-welcome';

  // Scroll content to top when transitioning to coach's board so the new section is in view
  const contentRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isFirstCoachSlide && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isFirstCoachSlide]);

  // Navigate when showing a coach slide
  useEffect(() => {
    if (isCoachSlide && (slide as { section?: string }).section && onNavigate) {
      onNavigate((slide as { section: string }).section);
    }
  }, [slideIndex, isCoachSlide, slide, onNavigate]);

  const handleNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setSlideIndex((i) => i + 1);
  };

  const handleMinutesContinue = () => {
    setDailyPracticeGoal(userId, selectedMinutes);
    setSlideIndex((i) => i + 1);
  };

  const handleMinutesSkip = () => {
    setSlideIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (slideIndex > 0) setSlideIndex((i) => i - 1);
  };

  // Static tab diagram: notes on every string, two columns (chord then next chord)
  const renderTabDiagram = () => {
    const noteHeight = 28;
    const noteWidth = 36;
    const colGap = 16;
    // Column 1: one fret number per string (e.g. open chord); column 2: next chord
    const column1 = [0, 0, 0, 0, 0, 0]; // open strings
    const column2 = [3, 2, 0, 0, 0, 0]; // example chord
    const left1 = 20;
    const left2 = left1 + noteWidth + colGap;
    return (
      <div className="my-4 rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-gray-200 dark:border-slate-600 overflow-hidden p-4">
        <div className="relative" style={{ minHeight: '220px' }}>
          <div
            className="absolute left-0 top-0 bottom-0 z-10 flex flex-col bg-white/95 dark:bg-slate-800 border-r-2 border-gray-200 dark:border-slate-600 rounded-l-lg"
            style={{ width: STRING_LABELS_WIDTH }}
          >
            {STRING_NAMES.map((name, i) => (
              <div key={i} className="flex-1 flex items-center justify-center text-sm font-bold" style={{ color: STRING_COLORS[i], minHeight: noteHeight + 8 }}>
                {name}
              </div>
            ))}
          </div>
          <div className="absolute top-0 bottom-0 right-0 overflow-hidden" style={{ left: STRING_LABELS_WIDTH }}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const yPercent = (i + 0.5) * (100 / 6);
              return (
                <div
                  key={`line-${i}`}
                  className="absolute left-0 right-0"
                  style={{ top: `${yPercent}%`, height: 2, backgroundColor: '#D1D5DB', transform: 'translateY(-50%)' }}
                />
              );
            })}
            {STRING_NAMES.map((_, stringIndex) => (
              <React.Fragment key={`row-${stringIndex}`}>
                <div
                  className="absolute flex items-center justify-center rounded-lg font-bold text-sm bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-600"
                  style={{
                    left: left1,
                    top: `${(stringIndex + 0.5) * (100 / 6)}%`,
                    width: noteWidth,
                    height: noteHeight,
                    transform: 'translateY(-50%)',
                  }}
                >
                  {column1[stringIndex]}
                </div>
                <div
                  className="absolute flex items-center justify-center rounded-lg font-bold text-sm bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-600"
                  style={{
                    left: left2,
                    top: `${(stringIndex + 0.5) * (100 / 6)}%`,
                    width: noteWidth,
                    height: noteHeight,
                    transform: 'translateY(-50%)',
                  }}
                >
                  {column2[stringIndex]}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 space-y-1.5 text-xs text-gray-600 dark:text-gray-400" style={{ fontFamily: font }}>
          <p><strong className="text-gray-700 dark:text-gray-300">Left column:</strong> One number per string — play these six notes together (a chord). 0 = open string.</p>
          <p><strong className="text-gray-700 dark:text-gray-300">Right column:</strong> Next chord. You read tab left → right, like reading words.</p>
        </div>
      </div>
    );
  };

  const renderBullets = (bullets: string[]) => (
    <ul className="list-disc pl-6 pr-2 space-y-3 text-sm text-gray-700 leading-relaxed" style={{ fontFamily: font }}>
      {bullets.map((b, i) => (
        <li key={i}>{stripBold(b)}</li>
      ))}
    </ul>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="min-w-0 p-0 overflow-hidden [&>button:last-of-type]:hidden flex flex-col rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{
          width: 'calc(100vw - 16px)',
          maxWidth: '72rem',
          border: '1px solid rgb(231, 231, 231)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(to bottom right, #fff7ed, #fef2f2, #fdf2f8)',
        }}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Getting started with guitar</DialogTitle>

        <div ref={contentRef} className="flex flex-col p-6 sm:p-8 lg:p-10 gap-6">
          <div className="flex justify-center gap-2">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === slideIndex ? 18 : 6,
                  backgroundColor: i <= slideIndex ? 'rgb(249, 115, 22)' : 'rgb(209, 213, 219)',
                }}
              />
            ))}
          </div>

          {isFirstCoachSlide && (
            <p className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400" style={{ fontFamily: font }}>
              Tour of the app
            </p>
          )}

          <div className="backdrop-blur-sm rounded-xl shadow-sm flex-shrink-0 px-6 py-6 sm:px-8 sm:py-7" style={cardStyle}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: slide.color.replace(/^rgb\(/, 'rgba(').replace(/\)$/, ', 0.25)'),
                  borderBottom: `2px solid ${slide.color}`,
                }}
              >
                <slide.icon className="w-5 h-5" style={{ color: slide.color }} aria-hidden />
              </div>
              <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: font }}>
                {slide.title}
              </h2>
            </div>

            {isCoachSlide ? (
              <p className="text-gray-600 text-sm leading-relaxed pr-1" style={{ fontFamily: font }}>
                {(slide as { description: string }).description}
              </p>
            ) : isMinutesSlide ? (
              <>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed pr-1" style={{ fontFamily: font }}>
                  We'll use this for your daily and weekly goals. You can change it later in Settings.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {MINUTES_OPTIONS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setSelectedMinutes(min)}
                      className="py-3 rounded-xl text-sm font-bold transition-all border-2"
                      style={{
                        fontFamily: font,
                        backgroundColor: selectedMinutes === min ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.9)',
                        color: selectedMinutes === min ? 'rgb(194, 65, 12)' : 'rgb(75, 85, 99)',
                        borderColor: selectedMinutes === min ? slide.color : 'rgb(229, 231, 235)',
                        borderBottomWidth: selectedMinutes === min ? 3 : 2,
                      }}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {slide.bullets && slide.bullets.length > 0 && renderBullets(slide.bullets)}
                {'diagram' in slide && slide.diagram === 'tab' && renderTabDiagram()}
              </>
            )}
          </div>

          <div className={isMinutesSlide ? 'flex flex-col gap-4 mt-2 min-h-0' : 'flex flex-col gap-3 mt-1 min-h-0'}>
            {isCoachSlide && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'rgb(75, 85, 99)', fontFamily: font }}
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                  style={{
                    backgroundColor: (slide as { color: string }).color,
                    color: 'white',
                    border: `2px solid ${(slide as { color: string }).color}`,
                    fontFamily: font,
                  }}
                >
                  {isLast ? <>Get Started <Check className="w-4 h-4" /></> : <>Next <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}
            {isMinutesSlide && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleMinutesSkip}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ fontFamily: font, backgroundColor: 'rgb(243, 244, 246)', color: 'rgb(107, 114, 128)', border: '1.5px solid rgb(229, 231, 235)' }}
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleMinutesContinue}
                  className="flex-1 py-3 rounded-xl text-sm font-bold"
                  style={{ fontFamily: font, backgroundColor: 'rgba(249, 115, 22, 0.2)', borderBottom: `3px solid ${slide.color}`, color: 'rgb(194, 65, 12)' }}
                >
                  Continue
                </button>
              </div>
            )}
            {isLearnBasicsSlide && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'rgb(75, 85, 99)', fontFamily: font }}
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try { sessionStorage.setItem('strummy-open-guitar-basics', '1'); } catch (_) {}
                      onGoToBasics?.();
                      onComplete();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: (slide as { color: string }).color, color: 'white', border: `2px solid ${(slide as { color: string }).color}`, fontFamily: font }}
                  >
                    Get Started <Check className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onComplete}
                  className="w-full py-2.5 rounded-xl text-sm font-medium"
                  style={{ fontFamily: font, backgroundColor: 'rgba(0,0,0,0.06)', color: 'rgb(107, 114, 128)', border: '1.5px solid rgb(229, 231, 235)' }}
                >
                  Skip Learn Guitar Basics
                </button>
              </div>
            )}
            {isNextSlide && !isMinutesSlide && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'rgb(75, 85, 99)', fontFamily: font }}
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => { setSlideIndex((i) => i + 1); onNavigate?.('dashboard'); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', borderBottom: '3px solid rgb(249, 115, 22)', color: 'rgb(194, 65, 12)', fontFamily: font }}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {!isNextSlide && !isMinutesSlide && !isCoachSlide && !isLearnBasicsSlide && (
              <div className="flex gap-3">
                {slideIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'rgb(75, 85, 99)', fontFamily: font }}
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', borderBottom: '3px solid rgb(249, 115, 22)', color: 'rgb(194, 65, 12)', fontFamily: font }}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const STORAGE_KEY_PREFIX = 'strummy-novice-intro-done-';
const INTRO_COMPLETE_KEY_PREFIX = 'strummy-intro-complete-';

export function shouldShowIntro(userId: string): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(INTRO_COMPLETE_KEY_PREFIX + userId) !== 'true';
}

export function markIntroDone(userId: string): void {
  try {
    localStorage.setItem(INTRO_COMPLETE_KEY_PREFIX + userId, 'true');
    localStorage.setItem(STORAGE_KEY_PREFIX + userId, 'true');
    localStorage.setItem(`strummy-onboarding-complete-${userId}`, 'true');
  } catch (_) {}
}

export function shouldShowNoviceIntro(userId: string, level: string): boolean {
  if (level !== 'novice') return false;
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY_PREFIX + userId) !== 'true';
}

export function markNoviceIntroDone(userId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + userId, 'true');
  } catch (_) {}
}
