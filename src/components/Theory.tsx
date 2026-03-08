import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ActivityModal } from './ActivityModal';
import { 
  getTheoryPath,
  Unit, 
  Lesson,
  getUnitProgress,
  isUnitUnlocked,
  isUnitComplete,
  type GuitarLevel
} from '../data/learning-journey';
import { loadProgress, saveProgress } from '../utils/progressStorage';
import { 
  ChevronRight, 
  Lock, 
  CheckCircle2, 
  Circle, 
  Play, 
  Clock,
  Trophy,
  Zap,
  Target,
  BookOpen,
  Brain
} from 'lucide-react';

interface TheoryProps {
  onSectionChange?: (section: string) => void;
}

// =============================================================================
// PROGRESS STORAGE HELPERS
// =============================================================================

function getCompletedTheoryLessons(userId: string): Set<string> {
  const progress = loadProgress(userId);
  return new Set(progress?.completedTheoryLessons || []);
}

function getCompletedTheoryUnits(userId: string): Set<string> {
  const progress = loadProgress(userId);
  return new Set(progress?.completedTheoryUnits || []);
}

function markTheoryLessonComplete(userId: string, lessonId: string, unitId: string, level: GuitarLevel) {
  const progress = loadProgress(userId);
  const existingLessons = (progress as any).completedTheoryLessons || [];
  const existingUnits = (progress as any).completedTheoryUnits || [];
  
  const completedLessons = new Set<string>(existingLessons);
  const completedUnits = new Set<string>(existingUnits);
  
  completedLessons.add(lessonId);
  
  const path = getTheoryPath(level);
  const unit = path.find(u => u.id === unitId);
  if (unit && unit.lessons.every(l => completedLessons.has(l.id))) {
    completedUnits.add(unitId);
  }
  
  // Update progress and save
  (progress as any).completedTheoryLessons = Array.from(completedLessons);
  (progress as any).completedTheoryUnits = Array.from(completedUnits);
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
  index: number;
}

function UnitCard({ unit, isUnlocked, isComplete, progress, onSelect, index }: UnitCardProps) {
  const getStatusColor = () => {
    if (isComplete) return 'bg-emerald-500';
    if (!isUnlocked) return 'bg-gray-400';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle2 className="w-6 h-6 text-white" />;
    if (!isUnlocked) return <Lock className="w-6 h-6 text-white/70" />;
    return <BookOpen className="w-6 h-6 text-white" />;
  };

  return (
    <Card
      onClick={() => isUnlocked && onSelect(unit)}
      className={`relative overflow-hidden transition-all duration-300 ${
        isUnlocked 
          ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' 
          : 'opacity-60 cursor-not-allowed'
      }`}
      style={{
        border: isComplete ? '2px solid rgb(34, 197, 94)' : '2px solid rgb(229, 231, 235)',
        borderBottomWidth: '4px'
      }}
    >
      {/* Progress bar at top */}
      {isUnlocked && progress > 0 && !isComplete && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Unit number badge */}
          <div 
            className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${getStatusColor()} shadow-md`}
          >
            {isComplete ? (
              getStatusIcon()
            ) : (
              <span className="text-2xl font-bold text-white">{unit.number}</span>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{unit.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white truncate">
                {unit.title}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {unit.subtitle}
            </p>
            
            {/* Progress info */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-gray-400">
                <Target className="w-3 h-3" />
                {unit.lessons.length} lessons
              </span>
              {isUnlocked && !isComplete && progress > 0 && (
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <Zap className="w-3 h-3" />
                  {progress}% complete
                </span>
              )}
              {isComplete && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <Trophy className="w-3 h-3" />
                  Completed!
                </span>
              )}
              {!isUnlocked && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Lock className="w-3 h-3" />
                  Complete previous unit first
                </span>
              )}
            </div>
          </div>
          
          {/* Arrow */}
          {isUnlocked && (
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
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
}

function LessonList({ unit, completedLessons, onLessonSelect, onBack }: LessonListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{unit.icon}</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Unit {unit.number}: {unit.title}
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unit.description}
          </p>
        </div>
      </div>
      
      {/* Lessons */}
      <div className="space-y-3">
        {unit.lessons.map((lesson, index) => {
          const isCompleted = completedLessons.has(lesson.id);
          const previousCompleted = index === 0 || completedLessons.has(unit.lessons[index - 1].id);
          const isUnlocked = index === 0 || previousCompleted;
          
          return (
            <Card
              key={lesson.id}
              onClick={() => isUnlocked && onLessonSelect(lesson)}
              className={`transition-all duration-200 ${
                isUnlocked 
                  ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{
                border: isCompleted 
                  ? '2px solid rgb(34, 197, 94)' 
                  : '2px solid rgb(229, 231, 235)',
                borderBottomWidth: '3px'
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Lesson number/status */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isUnlocked 
                        ? 'bg-purple-500' 
                        : 'bg-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : isUnlocked ? (
                      <span className="text-white font-bold">{index + 1}</span>
                    ) : (
                      <Lock className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {lesson.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {lesson.subtitle}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.estimatedTime}
                      </span>
                      {lesson.quizRequired && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          Quiz
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action */}
                  {isUnlocked && (
                    <Button 
                      size="sm"
                      className={isCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'}
                    >
                      {isCompleted ? 'Review' : 'Start'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function Theory({ onSectionChange }: TheoryProps) {
  const { user } = useUser();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [completedUnits, setCompletedUnits] = useState<Set<string>>(new Set());

  // Load progress
  useEffect(() => {
    if (user) {
      setCompletedLessons(getCompletedTheoryLessons(user.id));
      setCompletedUnits(getCompletedTheoryUnits(user.id));
    }
  }, [user]);

  const refreshProgress = () => {
    if (user) {
      setCompletedLessons(getCompletedTheoryLessons(user.id));
      setCompletedUnits(getCompletedTheoryUnits(user.id));
    }
  };

  if (!user) return null;

  const level = (user.level || 'novice') as GuitarLevel;
  const theoryPathCurrent = getTheoryPath(level);

  // Progress within current level's path only
  const totalLessons = theoryPathCurrent.reduce((sum, unit) => sum + unit.lessons.length, 0);
  const completedInPath = theoryPathCurrent.flatMap(u => u.lessons).filter(l => completedLessons.has(l.id)).length;
  const overallProgress = totalLessons ? Math.round((completedInPath / totalLessons) * 100) : 0;
  const completedUnitsInPath = theoryPathCurrent.filter(u => u.lessons.every(l => completedLessons.has(l.id))).length;

  const getTheoryUnitProgress = (unitId: string): number => {
    const unit = theoryPathCurrent.find(u => u.id === unitId);
    if (!unit) return 0;
    const completed = unit.lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((completed / unit.lessons.length) * 100);
  };

  const isTheoryUnitUnlocked = (unitId: string): boolean => {
    const unit = theoryPathCurrent.find(u => u.id === unitId);
    if (!unit) return false;
    return unit.prerequisiteUnits.every(prereq => completedUnits.has(prereq));
  };

  const isTheoryUnitComplete = (unitId: string): boolean => {
    const unit = theoryPathCurrent.find(u => u.id === unitId);
    if (!unit) return false;
    return unit.lessons.every(l => completedLessons.has(l.id));
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setModalOpen(true);
  };

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧠 Theory Journey
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Understand the "why" behind music - from basics to advanced concepts
          </p>
          
          {/* Overall progress */}
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-2 border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Progress
              </span>
              <span className="text-sm font-bold text-blue-600">
                {completedInPath} / {totalLessons} lessons
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {completedUnitsInPath} of {theoryPathCurrent.length} units completed
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
          />
        ) : (
          <div className="space-y-4">
            {theoryPathCurrent.map((unit, index) => {
              const isUnlocked = isTheoryUnitUnlocked(unit.id) || index === 0;
              const isComplete = isTheoryUnitComplete(unit.id);
              const progress = getTheoryUnitProgress(unit.id);
              
              return (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  isUnlocked={isUnlocked}
                  isComplete={isComplete}
                  progress={progress}
                  onSelect={setSelectedUnit}
                  index={index}
                />
            );
          })}
        </div>
        )}
      </div>

      {/* Lesson Modal */}
      <ActivityModal
        isOpen={modalOpen}
        onClose={() => {
          // Mark lesson complete when modal closes
          if (selectedLesson && selectedUnit && user) {
            markTheoryLessonComplete(user.id, selectedLesson.id, selectedUnit.id, (user.level || 'novice') as GuitarLevel);
            refreshProgress();
          }
          setModalOpen(false);
          setSelectedLesson(null);
        }}
        activityType="study"
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
