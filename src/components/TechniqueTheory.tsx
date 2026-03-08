import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from './ui/button';
import { ActivityModal } from './ActivityModal';
import { 
  techniquePath, 
  theoryPath, 
  Unit, 
  Lesson,
  getUnitProgress,
  isUnitUnlocked,
  isUnitComplete
} from '../data/learning-journey';
import { loadProgress, saveProgress, addPoints } from '../utils/progressStorage';
import { recordPoints } from '../utils/api';
import { getPracticeChordsForLesson } from '../data/lesson-content';
import { TechniqueTheoryPractice } from './TechniqueTheoryPractice';
import { 
  ChevronRight, 
  Lock, 
  CheckCircle2, 
  Play,
  Clock,
  Trophy,
  Zap,
  Target,
  BookOpen, 
  Hand
} from 'lucide-react';

// Character images
import pianistCharacter from '../assets/20251111_0914_Guitar Character Pianist_remix_01k9syg7bnfa4r2s22f6tzfrz5.png';
import pensiveGuitarCharacter from '../assets/20251111_1235_Pensive Guitar Character_remix_01k9ta1gmxf3cbfn07hcc91esh.png';

interface TechniqueTheoryProps {
  onSectionChange?: (section: string) => void;
  initialTab?: 'technique' | 'theory';
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

function markLessonComplete(userId: string, lessonId: string, unitId: string, type: 'technique' | 'theory') {
  const progress = loadProgress(userId);
  const lessonsKey = type === 'technique' ? 'completedLessons' : 'completedTheoryLessons';
  const unitsKey = type === 'technique' ? 'completedUnits' : 'completedTheoryUnits';
  const path = type === 'technique' ? techniquePath : theoryPath;
  
  const existingLessons = (progress as any)[lessonsKey] || [];
  const existingUnits = (progress as any)[unitsKey] || [];
  
  const completedLessons = new Set<string>(existingLessons);
  const completedUnits = new Set<string>(existingUnits);
  
  completedLessons.add(lessonId);
  
  // Check if unit is now complete
  const unit = path.find(u => u.id === unitId);
  if (unit && unit.lessons.every(l => completedLessons.has(l.id))) {
    completedUnits.add(unitId);
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
          <span className="text-xs font-medium text-gray-600">{unit.lessons.length} lessons</span>
        </div>
        {!isComplete && progress > 0 && (
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
          >
            <Zap className="w-3 h-3 text-green-500" />
            <span className="text-xs font-medium text-gray-600">
              {Math.round((progress / 100) * unit.lessons.length)}/{unit.lessons.length} done
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
  completedLessons: Set<string>;
  onLessonSelect: (lesson: Lesson) => void;
  onBack: () => void;
  type: 'technique' | 'theory';
}

function LessonList({ unit, completedLessons, onLessonSelect, onBack, type }: LessonListProps) {
  const colors = type === 'technique' 
    ? { bg: 'rgb(255, 237, 213)', border: 'rgb(253, 186, 116)', fill: 'rgb(249, 115, 22)', light: 'rgba(249, 115, 22, 0.08)' }
    : { bg: 'rgb(219, 234, 254)', border: 'rgb(147, 197, 253)', fill: 'rgb(59, 130, 246)', light: 'rgba(59, 130, 246, 0.08)' };

  const completedCount = unit.lessons.filter(l => completedLessons.has(l.id)).length;
  const progress = Math.round((completedCount / unit.lessons.length) * 100);
  
  return (
    <div className="space-y-3">
      {/* Header Card - Dashboard style */}
      <div 
        className="backdrop-blur-sm rounded-xl px-3 py-3 shadow-sm"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.58)', border: '2.5px solid rgb(237, 237, 237)' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: colors.bg, borderBottom: `2px solid ${colors.border}` }}
          >
            <ChevronRight className="w-4 h-4 rotate-180" style={{ color: colors.fill }} />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-800">{unit.title}</h2>
            <p className="text-xs text-gray-500">{unit.subtitle}</p>
          </div>
        </div>
        
        {/* Progress row */}
        <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg" style={{ backgroundColor: colors.light }}>
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5" style={{ color: colors.fill }} />
            <span className="text-xs font-medium text-gray-600">{completedCount}/{unit.lessons.length} completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: progress >= 100 ? 'rgb(34, 197, 94)' : colors.fill
                }}
              />
            </div>
            <span className="text-xs font-bold" style={{ color: progress >= 100 ? 'rgb(34, 197, 94)' : colors.fill }}>{progress}%</span>
          </div>
        </div>
      </div>
      
      {/* Lessons - Dashboard row style */}
      <div 
        className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.58)', border: '2.5px solid rgb(237, 237, 237)' }}
      >
        <div className="space-y-3">
          {unit.lessons.map((lesson, index) => {
            const isCompleted = completedLessons.has(lesson.id);
            const previousCompleted = index === 0 || completedLessons.has(unit.lessons[index - 1].id);
            const isUnlocked = index === 0 || previousCompleted;
            
            return (
              <div
                key={lesson.id}
                onClick={() => isUnlocked && onLessonSelect(lesson)}
                className={`flex items-center justify-between py-3 px-3 rounded-lg transition-all ${
                  isUnlocked ? 'cursor-pointer hover:scale-[1.01]' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ 
                  backgroundColor: isCompleted 
                    ? 'rgba(34, 197, 94, 0.1)' 
                    : index % 2 === 0 ? colors.light : 'rgba(156, 163, 175, 0.06)'
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Status icon */}
                  <div 
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ 
                      backgroundColor: isCompleted ? 'rgb(134, 239, 172)' : !isUnlocked ? 'rgb(229, 231, 235)' : colors.bg,
                      borderBottom: `2px solid ${isCompleted ? 'rgb(74, 222, 128)' : !isUnlocked ? 'rgb(209, 213, 219)' : colors.border}`
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : !isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <Play className="w-3.5 h-3.5" style={{ color: colors.fill }} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm truncate">{lesson.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Status badge */}
                {isCompleted ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
                    <Trophy className="w-3 h-3 text-green-500 fill-green-500" />
                    <span className="text-xs font-bold text-green-600">Done</span>
                  </div>
                ) : isUnlocked ? (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
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
  /** After quiz 100%, if lesson has chord practice we open SongPractice; this holds context until practice completes */
  const [pendingPractice, setPendingPractice] = useState<{
    lessonId: string;
    unitId: string;
    lessonName: string;
    chords: string[];
    type: 'technique' | 'theory';
  } | null>(null);
  
  // Technique progress
  const [techCompletedLessons, setTechCompletedLessons] = useState<Set<string>>(new Set());
  const [techCompletedUnits, setTechCompletedUnits] = useState<Set<string>>(new Set());
  
  // Theory progress
  const [theoryCompletedLessons, setTheoryCompletedLessons] = useState<Set<string>>(new Set());
  const [theoryCompletedUnits, setTheoryCompletedUnits] = useState<Set<string>>(new Set());

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

  const completeLessonAndAwardPoints = async (lessonId: string, unitId: string, type: 'technique' | 'theory', unitTitle?: string) => {
    if (!user) return;
    const path = type === 'technique' ? techniquePath : theoryPath;
    const unit = path.find(u => u.id === unitId);
    const unitsBefore = getCompletedUnits(user.id, type);
    markLessonComplete(user.id, lessonId, unitId, type);
    refreshProgress();
    const unitsAfter = getCompletedUnits(user.id, type);
    const unitJustCompleted = unitsAfter.size > unitsBefore.size;
    const branchJustCompleted = path.length > 0 && unitsAfter.size === path.length;
    let pointsToAward = 0;
    if (unitJustCompleted) pointsToAward += 1;
    if (branchJustCompleted) pointsToAward += 5;
    if (pointsToAward > 0) {
      try {
        await recordPoints({
          userId: user.id,
          type: type === 'technique' ? 'practice' : 'theory_completed',
          points: pointsToAward,
          description: unitJustCompleted && branchJustCompleted
            ? `Completed ${unit?.title ?? unitTitle} and ${type === 'technique' ? 'Technique' : 'Theory'} branch`
            : branchJustCompleted
              ? `Completed ${type === 'technique' ? 'Technique' : 'Theory'} branch`
              : `Completed unit: ${unit?.title ?? unitId}`,
          difficulty: 1
        });
        addPoints(user.id, pointsToAward);
        updateUser({
          totalPoints: (user.totalPoints || 0) + pointsToAward,
          weeklyPoints: (user.weeklyPoints || 0) + pointsToAward
        });
        syncProfileToSupabase();
      } catch (e) {
        console.error('Error awarding technique/theory points:', e);
      }
    }
  };

  if (!user) return null;

  const currentPath = mainTab === 'technique' ? techniquePath : theoryPath;
  const completedLessons = mainTab === 'technique' ? techCompletedLessons : theoryCompletedLessons;
  const completedUnits = mainTab === 'technique' ? techCompletedUnits : theoryCompletedUnits;

  // Calculate progress
  const totalLessons = currentPath.reduce((sum, unit) => sum + unit.lessons.length, 0);
  const completedCount = completedLessons.size;
  const overallProgress = Math.round((completedCount / totalLessons) * 100);

  // Helper functions for current path
  const getCurrentUnitProgress = (unitId: string): number => {
    const unit = currentPath.find(u => u.id === unitId);
    if (!unit) return 0;
    const completed = unit.lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((completed / unit.lessons.length) * 100);
  };

  const isCurrentUnitUnlocked = (unitId: string): boolean => {
    const unit = currentPath.find(u => u.id === unitId);
    if (!unit) return false;
    return unit.prerequisiteUnits.every(prereq => completedUnits.has(prereq));
  };

  const isCurrentUnitComplete = (unitId: string): boolean => {
    const unit = currentPath.find(u => u.id === unitId);
    if (!unit) return false;
    return unit.lessons.every(l => completedLessons.has(l.id));
  };

  const handleLessonSelect = (lesson: Lesson) => {
    if (lesson.practiceChords?.length && selectedUnit) {
      setPendingPractice({
        lessonId: lesson.id,
        unitId: selectedUnit.id,
        lessonName: lesson.title,
        chords: lesson.practiceChords,
        type: mainTab
      });
      return;
    }
    setSelectedLesson(lesson);
    setModalOpen(true);
  };

  const handleTabChange = (tab: 'technique' | 'theory') => {
    setMainTab(tab);
    setSelectedUnit(null);
    setSelectedLesson(null);
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

        {/* Header */}
        <div className="text-center mb-1">
          <h1 
            className="text-2xl font-bold"
            style={{
              color: mainTab === 'technique' ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)',
              fontFamily: '"Comfortaa", "Nunito", "Quicksand", sans-serif',
              letterSpacing: '2px',
              textShadow: mainTab === 'technique' ? '0 2px 4px rgba(249, 115, 22, 0.2)' : '0 2px 4px rgba(59, 130, 246, 0.2)'
            }}
          >
            {mainTab === 'technique' ? 'Technique Journey' : 'Theory Journey'}
          </h1>
          <p className="text-sm text-gray-600">
            {mainTab === 'technique' 
              ? 'Master guitar skills step-by-step'
              : 'Understand the "why" behind music'
            }
          </p>
        </div>
          
        {/* Character Image - interjects into Your Progress via negative spacing */}
        <div 
          className="relative flex justify-center z-10" 
          style={{ marginBottom: mainTab === 'technique' ? '-80px' : '-35px' }}
        >
          <img 
            src={mainTab === 'technique' ? pianistCharacter : pensiveGuitarCharacter}
            alt={mainTab === 'technique' ? 'Piano Character' : 'Pensive Guitar Character'}
            className="object-contain w-full drop-shadow-lg"
            style={{ 
              maxHeight: '300px',
              maxWidth: '280px'
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
              <h3 className="font-semibold text-gray-800 text-sm">Your Progress</h3>
              <p className="text-[11px] text-gray-500">Keep learning to level up</p>
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
            completedLessons={completedLessons}
            onLessonSelect={handleLessonSelect}
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

      {/* Lesson Modal - onComplete only when user gets 100% and taps Done */}
      <ActivityModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLesson(null);
        }}
        onComplete={async () => {
          if (!selectedLesson || !selectedUnit || !user) return;
          await completeLessonAndAwardPoints(selectedLesson.id, selectedUnit.id, mainTab, selectedUnit.title);
        }}
        practiceChords={selectedLesson ? (getPracticeChordsForLesson(selectedLesson.title) ?? undefined) : undefined}
        onStartPractice={(lessonName, chords) => {
          if (selectedLesson && selectedUnit) {
            setPendingPractice({
              lessonId: selectedLesson.id,
              unitId: selectedUnit.id,
              lessonName,
              chords,
              type: mainTab
            });
            setModalOpen(false);
            setSelectedLesson(null);
          }
        }}
        activityType={mainTab === 'technique' ? 'practice' : 'study'}
        activityData={selectedLesson ? {
          name: selectedLesson.title,
          description: selectedLesson.description,
          category: 'Learning',
          difficulty: 1,
          estimatedTime: selectedLesson.estimatedTime
        } : null}
      />
      {pendingPractice && (
        <TechniqueTheoryPractice
          isOpen={!!pendingPractice}
          onClose={() => setPendingPractice(null)}
          title={pendingPractice.lessonName}
          chords={pendingPractice.chords}
          type={pendingPractice.type}
          userLevel={user.level}
          onComplete={async () => {
            await completeLessonAndAwardPoints(
              pendingPractice.lessonId,
              pendingPractice.unitId,
              pendingPractice.type
            );
            setPendingPractice(null);
          }}
        />
      )}
    </div>
  );
}
