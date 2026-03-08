import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Play, 
  Pause, 
  CheckCircle2,
  Target,
  RotateCcw,
  Video
} from 'lucide-react';
import { 
  updateTechniqueProgress, 
  updateTheoryProgress,
  getDailyRoutine,
  getWeeklyTheoryRoutine,
  TECHNIQUE_GOALS,
  THEORY_GOALS,
  POINTS
} from '../utils/progressStorage';

interface PracticeSessionProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    category: string;
    description?: string;
    progress?: number;
    difficulty?: number;
  };
  type: 'technique' | 'theory';
  userId: string;
  onComplete: (minutesPracticed: number, newProgress: number, pointsEarned: number) => void;
}

// Tutorial video URLs for different categories
const TUTORIAL_VIDEOS: Record<string, { title: string; url: string; thumbnail: string }> = {
  // Technique videos
  'chords': {
    title: 'How to Play Guitar Chords',
    url: 'https://www.youtube.com/embed/Kk8YLNeQWDI',
    thumbnail: '🎸'
  },
  'foundation': {
    title: 'Guitar Fundamentals',
    url: 'https://www.youtube.com/embed/BBz-Jyr23M4',
    thumbnail: '📚'
  },
  'rhythm': {
    title: 'Rhythm & Strumming Patterns',
    url: 'https://www.youtube.com/embed/YX1jn1i0HYQ',
    thumbnail: '🎵'
  },
  'strum': {
    title: 'Strumming Techniques',
    url: 'https://www.youtube.com/embed/4IZqQxLlJj0',
    thumbnail: '🎶'
  },
  'fingerpicking': {
    title: 'Fingerpicking Tutorial',
    url: 'https://www.youtube.com/embed/1pltdkLbXJc',
    thumbnail: '👆'
  },
  'pluck': {
    title: 'Plucking Techniques',
    url: 'https://www.youtube.com/embed/1pltdkLbXJc',
    thumbnail: '✋'
  },
  'scale': {
    title: 'Guitar Scales for Beginners',
    url: 'https://www.youtube.com/embed/D7aQCg8DSEI',
    thumbnail: '🎼'
  },
  'lead': {
    title: 'Lead Guitar Techniques',
    url: 'https://www.youtube.com/embed/I1FKLnZQwaw',
    thumbnail: '⚡'
  },
  // Theory videos
  'basics': {
    title: 'Music Theory Basics',
    url: 'https://www.youtube.com/embed/rgaTLrZGlk0',
    thumbnail: '📖'
  },
  'intervals': {
    title: 'Understanding Intervals',
    url: 'https://www.youtube.com/embed/5Y01jIorpeA',
    thumbnail: '📏'
  },
  'mode': {
    title: 'Understanding Modes',
    url: 'https://www.youtube.com/embed/bwaeBUYcO5o',
    thumbnail: '🎹'
  },
  'time': {
    title: 'Time Signatures Explained',
    url: 'https://www.youtube.com/embed/rgaTLrZGlk0',
    thumbnail: '⏱️'
  }
};

export function PracticeSession({ 
  isOpen, 
  onClose, 
  item, 
  type, 
  userId, 
  onComplete 
}: PracticeSessionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(item.progress || 0);
  const [showVideo, setShowVideo] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Get goal information
  const dailyRoutine = getDailyRoutine(userId);
  const weeklyTheoryRoutine = getWeeklyTheoryRoutine(userId);

  // Get the appropriate tutorial video based on category
  const getTutorialVideo = () => {
    const lowerCategory = item.category.toLowerCase();
    for (const key of Object.keys(TUTORIAL_VIDEOS)) {
      if (lowerCategory.includes(key)) {
        return TUTORIAL_VIDEOS[key];
      }
    }
    // Default video
    return type === 'technique' 
      ? TUTORIAL_VIDEOS['chords'] 
      : TUTORIAL_VIDEOS['basics'];
  };

  const tutorialVideo = getTutorialVideo();

  // Suggested practice time based on type and category (now 5 minutes each)
  const getSuggestedTime = (): number => {
    if (type === 'technique') {
      const lowerCategory = item.category.toLowerCase();
      if (lowerCategory.includes('chord') || lowerCategory.includes('foundation')) {
        return Math.max(0, TECHNIQUE_GOALS.chords - dailyRoutine.chordsCompleted);
      } else if (lowerCategory.includes('rhythm') || lowerCategory.includes('strum')) {
        return Math.max(0, TECHNIQUE_GOALS.strums - dailyRoutine.strumsCompleted);
      } else if (lowerCategory.includes('fingerpicking') || lowerCategory.includes('pluck') || lowerCategory.includes('picking')) {
        return Math.max(0, TECHNIQUE_GOALS.plucks - dailyRoutine.plucksCompleted);
      } else {
        return Math.max(0, TECHNIQUE_GOALS.scales - dailyRoutine.scalesCompleted);
      }
    } else {
      const lowerCategory = item.category.toLowerCase();
      if (lowerCategory.includes('basics') || lowerCategory.includes('intervals')) {
        return Math.max(0, THEORY_GOALS.basics - weeklyTheoryRoutine.basicsCompleted);
      } else if (lowerCategory.includes('chord')) {
        return Math.max(0, THEORY_GOALS.chords - weeklyTheoryRoutine.chordsCompleted);
      } else if (lowerCategory.includes('scale') || lowerCategory.includes('mode')) {
        return Math.max(0, THEORY_GOALS.scales - weeklyTheoryRoutine.scalesCompleted);
      } else {
        return Math.max(0, THEORY_GOALS.rhythm - weeklyTheoryRoutine.rhythmCompleted);
      }
    }
  };

  // Get remaining time or default to 5 minutes
  const remainingTime = getSuggestedTime();
  const suggestedMinutes = remainingTime > 0 ? remainingTime : 5;

  useEffect(() => {
    if (isOpen) {
      setElapsedSeconds(0);
      setSessionProgress(item.progress || 0);
      setIsRunning(false);
      setShowVideo(false);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen, item]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);
        
        // Update progress based on time (every minute adds ~5% progress)
        const minutesElapsed = elapsed / 60;
        const newProgress = Math.min(100, (item.progress || 0) + (minutesElapsed * 5));
        setSessionProgress(newProgress);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, item.progress]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setSessionProgress(item.progress || 0);
  };

  const handleComplete = () => {
    setIsRunning(false);
    
    // Only count full minutes - minimum 1 minute if at least 30 seconds passed
    const minutesPracticed = elapsedSeconds >= 30 
      ? Math.max(1, Math.floor(elapsedSeconds / 60)) 
      : 0;
    const itemId = item.name.toLowerCase().replace(/\s+/g, '_');
    const newProgress = Math.round(sessionProgress);
    let totalPointsEarned = 0;

    if (type === 'technique') {
      const result = updateTechniqueProgress(
        userId,
        itemId,
        item.name,
        item.category,
        newProgress,
        minutesPracticed
      );
      totalPointsEarned = result.pointsEarned;
    } else {
      const result = updateTheoryProgress(
        userId,
        itemId,
        item.name,
        item.category,
        newProgress,
        minutesPracticed
      );
      totalPointsEarned = result.pointsEarned;
    }

    onComplete(minutesPracticed, newProgress, totalPointsEarned);
    onClose();
  };

  const getProgressColor = () => {
    if (sessionProgress >= 80) return 'bg-green-500';
    if (sessionProgress >= 60) return 'bg-lime-500';
    if (sessionProgress >= 40) return 'bg-yellow-500';
    if (sessionProgress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCategoryColor = () => {
    if (type === 'technique') {
      return 'bg-orange-500';
    } else {
      return 'bg-blue-500';
    }
  };

  // Get current goal progress for display
  const getCurrentGoalProgress = () => {
    const lowerCategory = item.category.toLowerCase();
    if (type === 'technique') {
      if (lowerCategory.includes('chord') || lowerCategory.includes('foundation')) {
        return { completed: dailyRoutine.chordsCompleted, goal: TECHNIQUE_GOALS.chords };
      } else if (lowerCategory.includes('strum') || lowerCategory.includes('rhythm')) {
        return { completed: dailyRoutine.strumsCompleted, goal: TECHNIQUE_GOALS.strums };
      } else if (lowerCategory.includes('pluck') || lowerCategory.includes('pick') || lowerCategory.includes('fingerpicking')) {
        return { completed: dailyRoutine.plucksCompleted, goal: TECHNIQUE_GOALS.plucks };
      } else {
        return { completed: dailyRoutine.scalesCompleted, goal: TECHNIQUE_GOALS.scales };
      }
    } else {
      if (lowerCategory.includes('basics') || lowerCategory.includes('intervals')) {
        return { completed: weeklyTheoryRoutine.basicsCompleted, goal: THEORY_GOALS.basics };
      } else if (lowerCategory.includes('chord')) {
        return { completed: weeklyTheoryRoutine.chordsCompleted, goal: THEORY_GOALS.chords };
      } else if (lowerCategory.includes('scale') || lowerCategory.includes('mode')) {
        return { completed: weeklyTheoryRoutine.scalesCompleted, goal: THEORY_GOALS.scales };
      } else {
        return { completed: weeklyTheoryRoutine.rhythmCompleted, goal: THEORY_GOALS.rhythm };
      }
    }
  };

  const goalProgress = getCurrentGoalProgress();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-sm" style={{ width: 'calc(100% - 1rem)', maxWidth: '28rem', border: '2.5px solid rgb(237, 237, 237)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Target className="w-5 h-5" />
            {item.name}
          </DialogTitle>
          <p className="text-sm text-gray-500">{item.category}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Compact Timer display */}
          <div className="bg-white p-4 rounded-xl text-center" style={{ border: '2px solid rgb(237, 237, 237)', borderBottom: '3px solid rgb(220, 220, 220)' }}>
            <div className="text-3xl font-mono font-bold text-gray-900 mb-1">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-xs text-gray-500">
              Goal: {suggestedMinutes} min {remainingTime <= 0 && <span className="text-green-500">✓</span>}
            </div>
          </div>

          {/* Goal progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{type === 'technique' ? "Today's" : 'Weekly'} Goal</span>
              <span className="font-medium text-gray-700">
                {Math.min(goalProgress.completed + Math.ceil(elapsedSeconds / 60), goalProgress.goal)}/{goalProgress.goal} min
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, ((goalProgress.completed + Math.ceil(elapsedSeconds / 60)) / goalProgress.goal) * 100)}%`,
                  backgroundColor: type === 'technique' ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)'
                }}
              />
            </div>
          </div>

          {/* Mastery Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Mastery</span>
              <span className="font-medium text-gray-700">{Math.round(sessionProgress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${sessionProgress}%` }}
              />
            </div>
          </div>

          {/* Video Tutorial Section - Collapsible */}
          <div className="bg-gray-50 p-3 rounded-xl" style={{ border: '1px solid rgb(237, 237, 237)' }}>
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{tutorialVideo.thumbnail}</span>
                <span className="text-sm font-medium text-gray-700">Watch Tutorial</span>
              </div>
              <Video className={`w-4 h-4 text-gray-400 transition-transform ${showVideo ? 'rotate-90' : ''}`} />
            </button>
            
            {showVideo && (
              <div className="mt-3 aspect-video rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  src={tutorialVideo.url}
                  title={tutorialVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={handleToggle}
              className={isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
            >
              {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Complete button */}
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleComplete}
              className="bg-green-500 hover:bg-green-600"
              size="sm"
              disabled={elapsedSeconds < 10}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

