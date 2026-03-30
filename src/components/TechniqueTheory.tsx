import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from './ui/button';
import { ActivityModal } from './ActivityModal';
import { 
  getTechniquePath,
  getTheoryPath,
  Unit, 
  Lesson,
  getUnitProgress,
  isUnitUnlocked,
  isUnitComplete,
  type GuitarLevel
} from '../data/learning-journey';
import {
  loadProgress,
  saveProgress,
  addPoints,
  addLearningJourneyMinutes,
  markLearningJourneyLessonCompleted,
  updateSongProgress,
} from '../utils/progressStorage';
import { recordPoints } from '../utils/api';
import {
  GETTING_STARTED_CHECKPOINTS,
  checkpointCountForUnit,
  getPracticeChordsForCheckpoint,
  type GettingStartedCheckpointDef,
} from '../data/getting-started-checkpoints';
import {
  type JourneyFlatRow,
  buildUnitFlatRows,
  isLessonUnlockedInUnit,
  isJourneyRowDone,
  isJourneyRowUnlocked,
  isJourneyUnitFullyDone,
} from '../utils/learningJourneyNavigation';
import { GettingStartedCheckpointModal } from './GettingStartedCheckpointModal';
import { SongPractice } from './SongPractice';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { getTechniqueAndTheoryDailyDone } from '../utils/beatsInstructions';
import {
  advanceGuidedAfterTechniqueLesson,
  advanceGuidedAfterTheoryLesson,
} from '../utils/beatsGuidedFlow';
import { 
  ChevronRight, 
  Lock, 
  CheckCircle2, 
  Trophy,
  Zap,
  Target,
  BookOpen, 
  Hand,
  Sparkles
} from 'lucide-react';

// Character images
import pianistCharacter from '../assets/20251111_0914_Guitar Character Pianist_remix_01k9syg7bnfa4r2s22f6tzfrz5.png';
import pensiveGuitarCharacter from '../assets/20251111_1235_Pensive Guitar Character_remix_01k9ta1gmxf3cbfn07hcc91esh.png';

interface TechniqueTheoryProps {
  onSectionChange?: (section: string) => void;
  initialTab?: 'technique' | 'theory';
}

// =============================================================================
// JOURNEY ROWS — shared helpers in ../utils/learningJourneyNavigation
// =============================================================================

/** Map checkpoint id → unit id (Getting Started uses gs-cp-*; others use `{unitId}-cp-{n}`). */
function unitIdForCheckpointDef(def: GettingStartedCheckpointDef): string | undefined {
  if (GETTING_STARTED_CHECKPOINTS.some((c) => c.id === def.id)) {
    return 'tech-unit-1';
  }
  const m = def.id.match(/^(.+)-cp-\d+$/);
  return m ? m[1] : undefined;
}

function syncJourneyUnitCompletion(
  userId: string,
  unitId: string,
  type: 'technique' | 'theory',
  level: GuitarLevel
) {
  const progress = loadProgress(userId);
  const lessonsKey = type === 'technique' ? 'completedLessons' : 'completedTheoryLessons';
  const unitsKey = type === 'technique' ? 'completedUnits' : 'completedTheoryUnits';
  const path = type === 'technique' ? getTechniquePath(level) : getTheoryPath(level);
  const unit = path.find((u) => u.id === unitId);
  if (!unit) return;

  const completedLessons = new Set<string>((progress as any)[lessonsKey] || []);
  const completedUnits = new Set<string>((progress as any)[unitsKey] || []);

  if (isJourneyUnitFullyDone(unit, userId, completedLessons, type)) {
    completedUnits.add(unitId);
  } else {
    completedUnits.delete(unitId);
  }

  (progress as any)[unitsKey] = Array.from(completedUnits);
  saveProgress(progress);
}

// =============================================================================
// PROGRESS STORAGE HELPERS
// =============================================================================

function getCompletedLessons(userId: string, type: 'technique' | 'theory'): Set<string> {
  const progress = loadProgress(userId);
  const key = type === 'technique' ? 'completedLessons' : 'completedTheoryLessons';
  return new Set(progress?.[key] || []);
}

function getCompletedUnits(userId: string, type: 'technique' | 'theory'): Set<string> {
  const progress = loadProgress(userId);
  const key = type === 'technique' ? 'completedUnits' : 'completedTheoryUnits';
  return new Set(progress?.[key] || []);
}

function markLessonComplete(userId: string, lessonId: string, unitId: string, type: 'technique' | 'theory', level: GuitarLevel) {
  const progress = loadProgress(userId);
  const lessonsKey = type === 'technique' ? 'completedLessons' : 'completedTheoryLessons';
  const unitsKey = type === 'technique' ? 'completedUnits' : 'completedTheoryUnits';
  const path = type === 'technique' ? getTechniquePath(level) : getTheoryPath(level);
  
  const existingLessons = (progress as any)[lessonsKey] || [];
  const existingUnits = (progress as any)[unitsKey] || [];
  
  const completedLessons = new Set<string>(existingLessons);
  const completedUnits = new Set<string>(existingUnits);
  
  completedLessons.add(lessonId);

  const unit = path.find((u) => u.id === unitId);
  if (unit) {
    if (isJourneyUnitFullyDone(unit, userId, completedLessons, type)) {
      completedUnits.add(unitId);
    } else {
      completedUnits.delete(unitId);
    }
  }

  // Update progress object and save
  (progress as any)[lessonsKey] = Array.from(completedLessons);
  (progress as any)[unitsKey] = Array.from(completedUnits);
  saveProgress(progress);
}

// =============================================================================
// UNIT CARD COMPONENT
// =============================================================================

interface UnitCardProps {
  unit: Unit;
  isUnlocked: boolean;
  isComplete: boolean;
  progress: number;
  onSelect: (unit: Unit) => void;
  type: 'technique' | 'theory';
  key?: string;
}

function UnitCard({ unit, isUnlocked, isComplete, progress, onSelect, type }: UnitCardProps) {
  const colors = type === 'technique' 
    ? { bg: 'rgb(255, 237, 213)', border: 'rgb(253, 186, 116)', fill: 'rgb(249, 115, 22)', text: 'text-orange-600' }
    : { bg: 'rgb(219, 234, 254)', border: 'rgb(147, 197, 253)', fill: 'rgb(59, 130, 246)', text: 'text-blue-600' };

  return (
    <div
      onClick={() => isUnlocked && onSelect(unit)}
      className={`backdrop-blur-sm rounded-xl px-3 py-3 shadow-sm transition-all duration-300 ${
        isUnlocked 
          ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' 
          : 'opacity-50 cursor-not-allowed'
      }`}
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.58)', 
        border: '2.5px solid rgb(237, 237, 237)' 
      }}
    >
      <div className="flex items-center gap-3">
        {/* Unit number badge - Dashboard style */}
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ 
            backgroundColor: isComplete ? 'rgb(134, 239, 172)' : !isUnlocked ? 'rgb(229, 231, 235)' : colors.bg,
            borderBottom: `3px solid ${isComplete ? 'rgb(74, 222, 128)' : !isUnlocked ? 'rgb(209, 213, 219)' : colors.border}`
          }}
        >
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : !isUnlocked ? (
            <Lock className="w-4 h-4 text-gray-400" />
          ) : (
            <span className="text-lg font-bold" style={{ color: colors.fill }}>{unit.number}</span>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm truncate">
            {unit.title}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {unit.subtitle}
          </p>
        </div>
        
        {/* Progress indicator - Dashboard style */}
        <div className="flex items-center gap-2">
          {isComplete ? (
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
            >
              <Trophy className="w-3.5 h-3.5 text-green-500 fill-green-500" />
              <span className="text-xs font-bold text-green-600">Done</span>
            </div>
          ) : isUnlocked ? (
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: progress >= 60 ? 'rgb(34, 197, 94)' : progress >= 30 ? colors.fill : 'rgb(239, 68, 68)'
                  }}
                />
              </div>
              <span className={`text-xs font-bold w-8 text-right ${colors.text}`}>{progress}%</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Locked</span>
          )}
        </div>
        
        {/* Arrow */}
        {isUnlocked && (
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </div>
      
      {/* Lesson count row */}
      <div className="flex items-center gap-2 mt-2">
        <div 
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
          style={{ backgroundColor: type === 'technique' ? 'rgba(249, 115, 22, 0.08)' : 'rgba(59, 130, 246, 0.08)' }}
        >
          <Target className="w-3 h-3" style={{ color: colors.fill }} />
            <span className="text-xs font-medium text-gray-600">
              {unit.lessons.length}Q · {checkpointCountForUnit(unit)}A
            </span>
        </div>
        {!isComplete && progress > 0 && (
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
          >
            <Zap className="w-3 h-3 text-green-500" />
            <span className="text-xs font-medium text-gray-600">
              {Math.round(
                (progress / 100) * (unit.lessons.length + checkpointCountForUnit(unit))
              )}
              /{unit.lessons.length + checkpointCountForUnit(unit)} steps
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// LESSON LIST COMPONENT
// =============================================================================

interface LessonListProps {
  unit: Unit;
  userId: string;
  completedLessons: Set<string>;
  listEpoch: number;
  onLessonSelect: (lesson: Lesson) => void;
  onCheckpointOpen: (def: GettingStartedCheckpointDef) => void;
  onBack: () => void;
  type: 'technique' | 'theory';
}

function LessonList({
  unit,
  userId,
  completedLessons,
  listEpoch,
  onLessonSelect,
  onCheckpointOpen,
  onBack,
  type,
}: LessonListProps) {
  const colors =
    type === 'technique'
      ? {
          bg: 'rgb(255, 237, 213)',
          border: 'rgb(253, 186, 116)',
          fill: 'rgb(249, 115, 22)',
          light: 'rgba(249, 115, 22, 0.08)',
        }
      : {
          bg: 'rgb(219, 234, 254)',
          border: 'rgb(147, 197, 253)',
          fill: 'rgb(59, 130, 246)',
          light: 'rgba(59, 130, 246, 0.08)',
        };

  const rows = buildUnitFlatRows(unit, type);
  const doneRows = rows.filter((r) => isJourneyRowDone(r, userId, completedLessons)).length;
  const progress = rows.length ? Math.round((doneRows / rows.length) * 100) : 0;
  const lessonCompletedCount = unit.lessons.filter((l) => completedLessons.has(l.id)).length;

  const handleRowClick = (row: JourneyFlatRow, unlocked: boolean) => {
    if (!unlocked) return;
    if (row.kind === 'checkpoint') {
      onCheckpointOpen(row.checkpointDef);
      return;
    }
    onLessonSelect(row.lesson);
  };

  const rowLabel = (row: JourneyFlatRow): { title: string; subtitle: string } => {
    if (row.kind === 'checkpoint') {
      const d = row.checkpointDef;
      return {
        title: d.title,
        subtitle: d.subtitle,
      };
    }
    return {
      title: row.lesson.title,
      subtitle: 'Quiz',
    };
  };

  return (
    <div className="space-y-3">
      <div
        className="backdrop-blur-sm rounded-xl px-3 py-3 shadow-sm"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.58)', border: '2.5px solid rgb(237, 237, 237)' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: colors.bg, borderBottom: `2px solid ${colors.border}` }}
          >
            <ChevronRight className="w-4 h-4 rotate-180" style={{ color: colors.fill }} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-800 truncate">{unit.title}</h2>
            <p className="text-xs text-gray-500">{unit.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg" style={{ backgroundColor: colors.light }}>
          <div className="flex items-center gap-2 min-w-0">
            <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.fill }} />
            <span className="text-xs font-medium text-gray-600 truncate">
              {doneRows}/{rows.length} · {lessonCompletedCount}/{unit.lessons.length}Q
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress >= 100 ? 'rgb(34, 197, 94)' : colors.fill,
                }}
              />
            </div>
            <span
              className="text-xs font-bold w-8 text-right"
              style={{ color: progress >= 100 ? 'rgb(34, 197, 94)' : colors.fill }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <div
        className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.58)', border: '2.5px solid rgb(237, 237, 237)' }}
      >
        <div className="space-y-3">
          {rows.map((row, index) => {
            const unlocked = isJourneyRowUnlocked(unit, rows, index, userId, completedLessons);
            const done = isJourneyRowDone(row, userId, completedLessons);
            const { title, subtitle } = rowLabel(row);
            const isCheckpoint = row.kind === 'checkpoint';

            return (
              <div
                key={`${row.key}-${listEpoch}`}
                role="button"
                tabIndex={unlocked ? 0 : -1}
                onClick={() => handleRowClick(row, unlocked)}
                onKeyDown={(e) => {
                  if (unlocked && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleRowClick(row, unlocked);
                  }
                }}
                className={`flex items-center justify-between py-3 px-3 rounded-lg transition-all ${
                  unlocked ? 'cursor-pointer hover:scale-[1.01]' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: done
                    ? 'rgba(34, 197, 94, 0.1)'
                    : index % 2 === 0
                      ? colors.light
                      : 'rgba(156, 163, 175, 0.06)',
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: done
                        ? 'rgb(134, 239, 172)'
                        : !unlocked
                          ? 'rgb(229, 231, 235)'
                          : colors.bg,
                      borderBottom: `2px solid ${
                        done ? 'rgb(74, 222, 128)' : !unlocked ? 'rgb(209, 213, 219)' : colors.border
                      }`,
                    }}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : !unlocked ? (
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                    ) : isCheckpoint ? (
                      <Sparkles className="w-3.5 h-3.5" style={{ color: colors.fill }} />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5" style={{ color: colors.fill }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm leading-snug">{title}</h4>
                    <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
                  </div>
                </div>

                {done ? (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <Trophy className="w-3 h-3 text-green-500 fill-green-500" />
                    <span className="text-xs font-bold text-green-600">Done</span>
                  </div>
                ) : unlocked ? (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TechniqueTheory({ onSectionChange, initialTab = 'technique' }: TechniqueTheoryProps) {
  const { user, updateUser, syncProfileToSupabase } = useUser();
  const [mainTab, setMainTab] = useState<'technique' | 'theory'>(initialTab);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  /** Getting Started interactive checkpoint (mic + guitar) */
  const [openCheckpoint, setOpenCheckpoint] = useState<GettingStartedCheckpointDef | null>(null);
  /** SongPractice after a technique checkpoint — chord timeline matches that activity only. */
  const [checkpointPracticeSong, setCheckpointPracticeSong] = useState<{
    songId: string;
    title: string;
    artist: string;
    chords: string[];
    duration: string;
    bpm: number;
    genre: string;
    difficulty: number;
  } | null>(null);
  const [checkpointSongPracticeOpen, setCheckpointSongPracticeOpen] = useState(false);
  const [journeyListEpoch, setJourneyListEpoch] = useState(0);
  const techniqueDailyWasMetRef = useRef(false);
  const [theoryNudgeOpen, setTheoryNudgeOpen] = useState(false);
  const [techCompletedLessons, setTechCompletedLessons] = useState<Set<string>>(new Set());
  const [techCompletedUnits, setTechCompletedUnits] = useState<Set<string>>(new Set());
  const [theoryCompletedLessons, setTheoryCompletedLessons] = useState<Set<string>>(new Set());
  const [theoryCompletedUnits, setTheoryCompletedUnits] = useState<Set<string>>(new Set());

  const todayIso = () => new Date().toISOString().split('T')[0];

  const syncTechniqueDailyRefAndMaybeNudgeTheory = () => {
    if (!user || mainTab !== 'technique') return;
    const today = todayIso();
    const p = loadProgress(user.id);
    const { techniqueDone, theoryDone } = getTechniqueAndTheoryDailyDone(
      p as Parameters<typeof getTechniqueAndTheoryDailyDone>[0],
      { id: user.id, level: user.level || 'novice' },
      today
    );
    const wasMet = techniqueDailyWasMetRef.current;
    techniqueDailyWasMetRef.current = techniqueDone;
    if (typeof window === 'undefined') return;
    const nudgeKey = `strummy-theory-nudge-shown-${user.id}-${today}`;
    if (sessionStorage.getItem(nudgeKey)) return;
    if (!wasMet && techniqueDone && !theoryDone) {
      sessionStorage.setItem(nudgeKey, '1');
      setTheoryNudgeOpen(true);
    }
  };

  useEffect(() => {
    if (!user) return;
    const p = loadProgress(user.id);
    const { techniqueDone } = getTechniqueAndTheoryDailyDone(
      p as Parameters<typeof getTechniqueAndTheoryDailyDone>[0],
      { id: user.id, level: user.level || 'novice' },
      todayIso()
    );
    techniqueDailyWasMetRef.current = techniqueDone;
  }, [user?.id]);

  // Update tab when initialTab prop changes
  useEffect(() => {
    setMainTab(initialTab);
  }, [initialTab]);

  // Load progress
  useEffect(() => {
    if (user) {
      setTechCompletedLessons(getCompletedLessons(user.id, 'technique'));
      setTechCompletedUnits(getCompletedUnits(user.id, 'technique'));
      setTheoryCompletedLessons(getCompletedLessons(user.id, 'theory'));
      setTheoryCompletedUnits(getCompletedUnits(user.id, 'theory'));
    }
  }, [user]);

  const refreshProgress = () => {
    if (user) {
      setTechCompletedLessons(getCompletedLessons(user.id, 'technique'));
      setTechCompletedUnits(getCompletedUnits(user.id, 'technique'));
      setTheoryCompletedLessons(getCompletedLessons(user.id, 'theory'));
      setTheoryCompletedUnits(getCompletedUnits(user.id, 'theory'));
    }
  };

  const awardPointsForJourneyTransition = async (
    type: 'technique' | 'theory',
    unitId: string,
    unitsBefore: Set<string>,
    unitsAfter: Set<string>,
    unitTitle?: string
  ) => {
    if (!user) return;
    const level = (user.level || 'novice') as GuitarLevel;
    const path = type === 'technique' ? getTechniquePath(level) : getTheoryPath(level);
    const unit = path.find((u) => u.id === unitId);
    const unitJustCompleted = unitsAfter.has(unitId) && !unitsBefore.has(unitId);
    const branchJustCompleted = path.length > 0 && path.every((u) => unitsAfter.has(u.id));
    let pointsToAward = 0;
    if (unitJustCompleted) pointsToAward += 1;
    if (branchJustCompleted) pointsToAward += 5;
    if (pointsToAward > 0) {
      try {
        await recordPoints({
          userId: user.id,
          type: type === 'technique' ? 'practice' : 'theory_completed',
          points: pointsToAward,
          description:
            unitJustCompleted && branchJustCompleted
              ? `Completed ${unit?.title ?? unitTitle} and ${type === 'technique' ? 'Technique' : 'Theory'} branch`
              : branchJustCompleted
                ? `Completed ${type === 'technique' ? 'Technique' : 'Theory'} branch`
                : `Completed unit: ${unit?.title ?? unitId}`,
          difficulty: 1,
        });
        addPoints(user.id, pointsToAward);
        updateUser({
          totalPoints: (user.totalPoints || 0) + pointsToAward,
          weeklyPoints: (user.weeklyPoints || 0) + pointsToAward,
        });
        syncProfileToSupabase();
      } catch (e) {
        console.error('Error awarding technique/theory points:', e);
      }
    }
  };

  const completeLessonAndAwardPoints = async (
    lessonId: string,
    unitId: string,
    type: 'technique' | 'theory',
    unitTitle?: string
  ) => {
    if (!user) return;
    const level = (user.level || 'novice') as GuitarLevel;
    const unitsBefore = new Set(getCompletedUnits(user.id, type));
    markLessonComplete(user.id, lessonId, unitId, type, level);
    markLearningJourneyLessonCompleted(user.id, type);
    refreshProgress();
    const unitsAfter = new Set(getCompletedUnits(user.id, type));
    await awardPointsForJourneyTransition(type, unitId, unitsBefore, unitsAfter, unitTitle);
  };

  if (!user) return null;

  const userLevel = (user.level || 'novice') as GuitarLevel;
  const currentPath = mainTab === 'technique' ? getTechniquePath(userLevel) : getTheoryPath(userLevel);
  const completedLessons = mainTab === 'technique' ? techCompletedLessons : theoryCompletedLessons;
  const completedUnits = mainTab === 'technique' ? techCompletedUnits : theoryCompletedUnits;

  // Overall progress: quizzes + activities (checkpoints) across the visible path
  const { done: journeyDoneSteps, total: journeyTotalSteps } = useMemo(() => {
    if (!user) return { done: 0, total: 0 };
    let total = 0;
    let done = 0;
    for (const unit of currentPath) {
      const rows = buildUnitFlatRows(unit, mainTab);
      total += rows.length;
      for (const r of rows) {
        if (isJourneyRowDone(r, user.id, completedLessons)) done += 1;
      }
    }
    return { done, total };
  }, [currentPath, mainTab, user, completedLessons, journeyListEpoch]);

  const overallProgress = journeyTotalSteps
    ? Math.round((journeyDoneSteps / journeyTotalSteps) * 100)
    : 0;

  // Helper functions for current path
  const getCurrentUnitProgress = (unitId: string): number => {
    const unit = currentPath.find((u) => u.id === unitId);
    if (!unit || !user) return 0;
    const rows = buildUnitFlatRows(unit, mainTab);
    const done = rows.filter((r) => isJourneyRowDone(r, user.id, completedLessons)).length;
    return rows.length ? Math.round((done / rows.length) * 100) : 0;
  };

  const isCurrentUnitUnlocked = (unitId: string): boolean => {
    const unit = currentPath.find((u) => u.id === unitId);
    if (!unit || !user) return false;
    return unit.prerequisiteUnits.every((prereqId) => {
      const prereq = currentPath.find((u) => u.id === prereqId);
      if (!prereq) return true;
      return isJourneyUnitFullyDone(prereq, user.id, completedLessons, mainTab);
    });
  };

  const isCurrentUnitComplete = (unitId: string): boolean => {
    const unit = currentPath.find((u) => u.id === unitId);
    if (!unit || !user) return false;
    return isJourneyUnitFullyDone(unit, user.id, completedLessons, mainTab);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    if (!user || !selectedUnit) return;
    setSelectedLesson(lesson);
    setModalOpen(true);
  };

  const handleTabChange = (tab: 'technique' | 'theory') => {
    setMainTab(tab);
    setSelectedUnit(null);
    setSelectedLesson(null);
    if (tab === 'theory') setTheoryNudgeOpen(false);
  };

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        
        {/* Tab Switcher */}
        <div 
          className="mb-4"
          style={{ 
            padding: '4px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            border: '2.5px solid rgb(237, 237, 237)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Sliding pill */}
            <div
              style={{
                position: 'absolute',
                top: '0',
                bottom: '0',
                left: mainTab === 'technique' ? '0' : '50%',
                width: '50%',
                borderRadius: '12px',
                backgroundColor: mainTab === 'technique' ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
                zIndex: 0,
                boxShadow: mainTab === 'technique' 
                  ? '0 2px 10px rgba(249, 115, 22, 0.35)' 
                  : '0 2px 10px rgba(59, 130, 246, 0.35)'
              }}
            />

            <div
              onClick={() => handleTabChange('technique')}
              style={{ flex: 1, position: 'relative', zIndex: 1, cursor: 'pointer', padding: '10px 16px', background: 'transparent', userSelect: 'none' }}
            >
              <div className="flex items-center justify-center gap-2">
                <Hand style={{ width: 16, height: 16, color: mainTab === 'technique' ? 'white' : 'rgb(156,163,175)', transition: 'color 0.3s, transform 0.3s', transform: mainTab === 'technique' ? 'scale(1.1)' : 'scale(1)' }} />
                <span style={{
                  fontSize: '13px', fontWeight: 700, letterSpacing: '0.01em',
                  color: mainTab === 'technique' ? 'white' : 'rgb(107,114,128)',
                  transition: 'color 0.3s',
                  fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif'
                }}>
                  Technique
                </span>
              </div>
            </div>

            <div
              onClick={() => handleTabChange('theory')}
              style={{ flex: 1, position: 'relative', zIndex: 1, cursor: 'pointer', padding: '10px 16px', background: 'transparent', userSelect: 'none' }}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen style={{ width: 16, height: 16, color: mainTab === 'theory' ? 'white' : 'rgb(156,163,175)', transition: 'color 0.3s, transform 0.3s', transform: mainTab === 'theory' ? 'scale(1.1)' : 'scale(1)' }} />
                <span style={{
                  fontSize: '13px', fontWeight: 700, letterSpacing: '0.01em',
                  color: mainTab === 'theory' ? 'white' : 'rgb(107,114,128)',
                  transition: 'color 0.3s',
                  fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif'
                }}>
                  Theory
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="text-center"
          style={{ marginBottom: mainTab === 'technique' ? '-24px' : '0.25rem' }}
        >
          <h1
            className="text-2xl font-bold"
            style={{
              color: mainTab === 'technique' ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)',
              fontFamily: '"Comfortaa", "Nunito", "Quicksand", sans-serif',
              letterSpacing: '2px',
              textShadow:
                mainTab === 'technique'
                  ? '0 2px 4px rgba(249, 115, 22, 0.2)'
                  : '0 2px 4px rgba(59, 130, 246, 0.2)',
            }}
          >
            {mainTab === 'technique' ? 'Technique' : 'Theory'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mainTab === 'technique' ? 'Skills path' : 'Concepts path'}
          </p>
        </div>

        {/* Character Image — overlaps progress card below */}
        <div
          className="relative flex justify-center z-10"
          style={{ marginBottom: mainTab === 'technique' ? '-80px' : '-35px' }}
        >
          <img 
            src={mainTab === 'technique' ? pianistCharacter : pensiveGuitarCharacter}
            alt={mainTab === 'technique' ? 'Piano Character' : 'Pensive Guitar Character'}
            className="object-contain w-full drop-shadow-lg"
            style={{ 
              maxHeight: mainTab === 'technique' ? '300px' : '460px',
              maxWidth: mainTab === 'technique' ? '280px' : '400px'
            }}
          />
        </div>

        {/* Overall Progress Card - Dashboard style */}
        <div 
          className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm hover:shadow-md transition-all mb-6"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.58)',
            border: '2.5px solid rgb(237, 237, 237)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: mainTab === 'technique' ? 'rgb(255, 237, 213)' : 'rgb(219, 234, 254)',
                borderBottom: `2px solid ${mainTab === 'technique' ? 'rgb(253, 186, 116)' : 'rgb(147, 197, 253)'}`
              }}
            >
              <Zap 
                className="w-4 h-4 flex-shrink-0" 
                style={{ color: mainTab === 'technique' ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)' }} 
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Progress</h3>
              <p className="text-[11px] text-gray-500">
                {journeyDoneSteps}/{journeyTotalSteps} steps
              </p>
            </div>
          </div>
          
          {/* Progress bar row */}
          <div 
            className="flex items-center justify-between py-2 px-3 rounded-lg"
            style={{ backgroundColor: mainTab === 'technique' ? 'rgba(249, 115, 22, 0.08)' : 'rgba(59, 130, 246, 0.08)' }}
          >
            <div className="flex items-center gap-2">
              {mainTab === 'technique' ? (
                <Hand className="w-3.5 h-3.5" style={{ color: 'rgb(249, 115, 22)' }} />
              ) : (
                <BookOpen className="w-3.5 h-3.5" style={{ color: 'rgb(59, 130, 246)' }} />
              )}
              <span className="text-xs font-medium text-gray-600">
                {mainTab === 'technique' ? 'Technique' : 'Theory'} mastery
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${overallProgress}%`,
                    backgroundColor: overallProgress >= 80 ? 'rgb(34, 197, 94)' : overallProgress >= 40 ? (mainTab === 'technique' ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)') : 'rgb(239, 68, 68)'
                  }}
                />
              </div>
              <span 
                className="text-xs font-bold w-8 text-right"
                style={{ color: overallProgress >= 80 ? 'rgb(34, 197, 94)' : mainTab === 'technique' ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)' }}
              >
                {overallProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedUnit ? (
          <LessonList
            unit={selectedUnit}
            userId={user.id}
            completedLessons={completedLessons}
            listEpoch={journeyListEpoch}
            onLessonSelect={handleLessonSelect}
            onCheckpointOpen={(def) => setOpenCheckpoint(def)}
            onBack={() => setSelectedUnit(null)}
            type={mainTab}
          />
        ) : (
            <div className="space-y-3">
            {currentPath.map((unit, index) => {
              const isUnlocked = isCurrentUnitUnlocked(unit.id) || index === 0;
              const isComplete = isCurrentUnitComplete(unit.id);
              const progress = getCurrentUnitProgress(unit.id);
              
              return (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  isUnlocked={isUnlocked}
                  isComplete={isComplete}
                  progress={progress}
                  onSelect={setSelectedUnit}
                  type={mainTab}
                />
              );
            })}
          </div>
        )}
        </div>

      {openCheckpoint && user && (
        <GettingStartedCheckpointModal
          isOpen={!!openCheckpoint}
          onClose={() => setOpenCheckpoint(null)}
          userId={user.id}
          checkpoint={openCheckpoint}
          userLevel={user.level}
          journeyVariant={mainTab}
          onComplete={async () => {
            const cp = openCheckpoint;
            if (!cp) return;
            const level = (user.level || 'novice') as GuitarLevel;
            const uid = unitIdForCheckpointDef(cp);
            if (uid) {
              const unitsBefore = new Set(getCompletedUnits(user.id, mainTab));
              syncJourneyUnitCompletion(user.id, uid, mainTab, level);
              refreshProgress();
              const unitsAfter = new Set(getCompletedUnits(user.id, mainTab));
              const u = currentPath.find((x) => x.id === uid);
              await awardPointsForJourneyTransition(mainTab, uid, unitsBefore, unitsAfter, u?.title);
            } else {
              refreshProgress();
            }
            // Technique activities with listen steps: open SongPractice using this checkpoint’s chords only.
            if (mainTab === 'technique') {
              const chords = getPracticeChordsForCheckpoint(cp);
              if (chords.length > 0) {
                const dur =
                  chords.length >= 4 ? '2:30' : chords.length >= 2 ? '2:00' : '1:30';
                setCheckpointPracticeSong({
                  songId: `checkpoint-${cp.id}`,
                  title: `${cp.title} — practice track`,
                  artist: cp.unitTitle ?? 'Technique journey',
                  chords,
                  duration: dur,
                  bpm: 76,
                  genre: 'Activity',
                  difficulty: 1,
                });
                setCheckpointSongPracticeOpen(true);
              }
            }
            setJourneyListEpoch((n) => n + 1);
            syncTechniqueDailyRefAndMaybeNudgeTheory();
          }}
        />
      )}

      {checkpointPracticeSong && user && (
        <SongPractice
          isOpen={checkpointSongPracticeOpen}
          onClose={() => {
            setCheckpointSongPracticeOpen(false);
            setCheckpointPracticeSong(null);
          }}
          song={checkpointPracticeSong}
          userId={user.id}
          userLevel={user.level}
          onComplete={(minutesPracticed, progressPercent, songInfo) => {
            if (user) {
              if (minutesPracticed > 0) {
                addLearningJourneyMinutes(user.id, mainTab, minutesPracticed);
              }
              updateSongProgress(
                user.id,
                songInfo.songId,
                songInfo.title,
                songInfo.artist,
                songInfo.genre,
                progressPercent,
                minutesPracticed
              );
              syncProfileToSupabase();
            }
            setCheckpointSongPracticeOpen(false);
            setCheckpointPracticeSong(null);
            syncTechniqueDailyRefAndMaybeNudgeTheory();
          }}
        />
      )}

      <Dialog open={theoryNudgeOpen} onOpenChange={(open) => !open && setTheoryNudgeOpen(false)}>
        <DialogContent
          className="max-w-sm rounded-2xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-5"
          aria-describedby={undefined}
        >
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2" style={{ fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif' }}>
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" aria-hidden />
            Technique goal done
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed" style={{ fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif' }}>
            Next: Theory tab — finish a quiz or reflect step, or ~5 min there for today’s theory goal.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setTheoryNudgeOpen(false);
                handleTabChange('theory');
              }}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{
                fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif',
                backgroundColor: 'rgb(59, 130, 246)',
                borderBottom: '2px solid rgb(37, 99, 235)',
              }}
            >
              Go to Theory
            </button>
            <button
              type="button"
              onClick={() => setTheoryNudgeOpen(false)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/80"
              style={{ fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif' }}
            >
              Stay on Technique
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Modal - onComplete when user finishes quiz and taps Done (X closes without completing) */}
      <ActivityModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLesson(null);
        }}
        onComplete={async (opts) => {
          if (!selectedLesson || !selectedUnit || !user) return;
          const minutesSpent = opts?.minutesSpent;
          if (minutesSpent != null && minutesSpent > 0) {
            addLearningJourneyMinutes(user.id, mainTab, minutesSpent);
          }
          await completeLessonAndAwardPoints(selectedLesson.id, selectedUnit.id, mainTab, selectedUnit.title);
          if (mainTab === 'technique') advanceGuidedAfterTechniqueLesson();
          else advanceGuidedAfterTheoryLesson();
          setJourneyListEpoch((n) => n + 1);
          syncTechniqueDailyRefAndMaybeNudgeTheory();
        }}
        skipPostQuizPractice
        activityType={mainTab === 'technique' ? 'practice' : 'study'}
        activityData={selectedLesson ? {
          name: selectedLesson.title,
          description: selectedLesson.description,
          category: 'Learning',
          difficulty: 1,
          estimatedTime: selectedLesson.estimatedTime
        } : null}
      />
    </div>
  );
}
