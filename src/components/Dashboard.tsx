import React, { useEffect, useState, useMemo } from 'react';
import { DashboardCard } from "./DashboardCard";
import { QuickActionButton } from "./QuickActionButton";
import { StatsCard } from "./StatsCard";
import { SkillProgressBar } from "./SkillProgressBar";
import { CircularProgress } from "./ui/circular-progress";
import { useUser } from "../contexts/UserContext";
import charactersHoldingHands from '../assets/20251022_2045_Colorful Cartoon Friends_remix_01k87jmr2yfzesxbt7pcwpqy24.png';
import guitarContent from '../data/guitar-content.json';
import {
  loadProgress,
  getPracticeStreak,
  getTotalWeeklyMinutes,
  getMasteredSongsCount,
  getAllSongProgress,
  getDailyRoutine,
  getWeeklyTheoryRoutine,
  getSelectedSongs,
  SelectedSong,
  calculatePointsBreakdown,
  PointsBreakdown
} from '../utils/progressStorage';
import {
  Music,
  Plus,
  Play,
  Settings,
  CheckCircle2,
  Target,
  BookOpen,
  Headphones,
  Hand,
  Brain,
  Flame,
  Coins,
  Trophy,
  Timer
} from "lucide-react";

interface DashboardProps {
  onSectionChange: (section: string) => void;
}

export function Dashboard({ onSectionChange }: DashboardProps) {
  const { user, awardPoints, calculatePointsForActivity, updateUser, getLevelProgressPercentage } = useUser();
  const [progressData, setProgressData] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [masteredSongs, setMasteredSongs] = useState(0);
  const [songProgress, setSongProgress] = useState<Record<string, any>>({});
  const [selectedSongs, setSelectedSongs] = useState<SelectedSong[]>([]);
  const [dailyRoutine, setDailyRoutine] = useState<any>(null);
  const [theoryRoutine, setTheoryRoutine] = useState<any>(null);
  const [pointsBreakdown, setPointsBreakdown] = useState<PointsBreakdown | null>(null);
  const LEVEL_ORDER = ['novice', 'beginner', 'elementary', 'intermediate', 'proficient', 'advanced', 'expert'];

  // Function to refresh all data
  const refreshDashboardData = () => {
    if (user) {
      const progress = loadProgress(user.id);
      setProgressData(progress);
      setStreak(getPracticeStreak(user.id));
      setWeeklyMinutes(getTotalWeeklyMinutes(user.id));
      setMasteredSongs(getMasteredSongsCount(user.id));
      setSongProgress(getAllSongProgress(user.id));
      setSelectedSongs(getSelectedSongs(user.id));
      setDailyRoutine(getDailyRoutine(user.id));
      setTheoryRoutine(getWeeklyTheoryRoutine(user.id));
      setPointsBreakdown(calculatePointsBreakdown(user.id));
    }
  };

  // Load progress data from storage
  useEffect(() => {
    refreshDashboardData();
  }, [user]);

  // Refresh data when window becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshDashboardData();
      }
    };

    const handleFocus = () => {
      refreshDashboardData();
    };

    // Also refresh periodically to catch changes from other components
    const intervalId = setInterval(() => {
      refreshDashboardData();
    }, 2000); // Refresh every 2 seconds

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Auto level-up when progress reaches 100%
  useEffect(() => {
    if (user) {
      const levelProgress = getLevelProgressPercentage();
      const currentIndex = LEVEL_ORDER.indexOf(user.level);
      if (levelProgress >= 100 && currentIndex < LEVEL_ORDER.length - 1) {
        const newLevel = LEVEL_ORDER[currentIndex + 1] as typeof user.level;
        updateUser({ level: newLevel });
      }
    }
  }, [progressData, user]);

  // Combine selected songs with their progress data
  const songsWithProgress = useMemo(() => selectedSongs.map(song => {
    const progress = songProgress[song.songId];
    return {
      ...song,
      progress: progress?.progress || 0,
    };
  }).slice(0, 3), [selectedSongs, songProgress]); // Show top 3

  // Use stored values with fallback to user context
  const displayStreak = streak || user?.practiceStreak || 0;
  const displayMasteredSongs = masteredSongs || user?.songsMastered || 0;
  // Round hours to nearest tenth (e.g., 2.3h)
  const rawHours = weeklyMinutes > 0 ? weeklyMinutes / 60 : (user?.hoursThisWeek || 0);
  const displayHours = Math.round(rawHours * 10) / 10;

  if (!user) {
    return null;
  }

  // Helper function to get 3-letter level abbreviation
  const getLevelAbbreviation = (level: string) => {
    const abbreviations: { [key: string]: string } = {
      'novice': 'Nov',
      'beginner': 'Beg',
      'elementary': 'Elm',
      'intermediate': 'Int',
      'proficient': 'Pro',
      'advanced': 'Adv',
      'expert': 'Exp'
    };
    return abbreviations[level] || level;
  };

  // Get level-appropriate content
  const getLevelInfo = (level: string) => {
    switch (level) {
      case 'novice':
        return {
          greeting: `Welcome ${user.name}! Let's start your guitar journey 🎸`,
          techniqueGoal: "Learn proper posture",
          theoryGoal: "Understand guitar anatomy"
        };
      case 'beginner':
        return {
          greeting: `Keep practicing ${user.name}! You're building the foundation 🎵`,
          techniqueGoal: "Learn basic chord shapes",
          theoryGoal: "Understand chord names"
        };
      case 'elementary':
        return {
          greeting: `Great progress ${user.name}! Keep building your skills 🎯`,
          techniqueGoal: "Master chord transitions",
          theoryGoal: "Learn basic scales"
        };
      case 'intermediate':
        return {
          greeting: `Keep practicing ${user.name}! You're making great progress 🎼`,
          techniqueGoal: "Learn fingerpicking basics",
          theoryGoal: "Study circle of fifths"
        };
      case 'proficient':
        return {
          greeting: `Excellent work ${user.name}! You're becoming skilled 🌟`,
          techniqueGoal: "Perfect advanced techniques",
          theoryGoal: "Master modal theory"
        };
      case 'advanced':
        return {
          greeting: `Outstanding ${user.name}! Push your limits today 🚀`,
          techniqueGoal: "Master complex techniques",
          theoryGoal: "Study jazz harmony"
        };
      case 'expert':
        return {
          greeting: `Masterful ${user.name}! Share your expertise 👑`,
          techniqueGoal: "Perfect master techniques",
          theoryGoal: "Compose original music"
        };
      default:
        return {
          greeting: `${user.name}!`,
          techniqueGoal: "Practice techniques",
          theoryGoal: "Study theory"
        };
    }
  };

  const levelInfo = getLevelInfo(user.level);

  // Mock function to simulate completing an activity
  const handleCompleteActivity = (activityType: string, difficulty: number) => {
    const points = calculatePointsForActivity(activityType, difficulty);
    awardPoints({
      type: activityType as any,
      points: points,
      description: `Completed ${activityType.replace('_', ' ')} (Difficulty ${difficulty})`,
      difficulty: difficulty
    });
  };

  // Determine streak status for special effects
  const getStreakStatus = () => {
    if (user.practiceStreak >= 30) return 'legendary';
    if (user.practiceStreak >= 14) return 'epic';
    if (user.practiceStreak >= 7) return 'great';
    return 'building';
  };

  const streakStatus = getStreakStatus();

  // Calculate overall progress for circular progress bars based on ALL available cards for the level
  const calculateTechniqueProgress = () => {
    if (!user) return 0;
    
    // Get all technique cards for the user's level from guitar content
    const levelTechniques = (guitarContent.techniques as any)[user.level];
    if (!levelTechniques) return 0;
    
    // Combine all technique cards from all subcategories (chords, strums, plucks, scales)
    const allCards: { name: string }[] = [];
    const subcategories = ['chords', 'strums', 'plucks', 'scales'];
    subcategories.forEach(subcat => {
      if (levelTechniques[subcat]) {
        allCards.push(...levelTechniques[subcat]);
      }
    });
    
    if (allCards.length === 0) return 0;
    
    // For each card, get the stored progress (or 0 if not started)
    let totalProgress = 0;
    allCards.forEach(card => {
      // Create a consistent ID for matching with stored progress
      const cardId = card.name.toLowerCase().replace(/\s+/g, '_');
      const storedProgress = progressData?.techniques?.[cardId];
      totalProgress += storedProgress?.progress || 0;
    });
    
    // Calculate percentage of total possible progress (all cards at 100%)
    const maxPossible = allCards.length * 100;
    return Math.round((totalProgress / maxPossible) * 100);
  };

  const calculateTheoryProgress = () => {
    if (!user) return 0;
    
    // Get all theory cards for the user's level from guitar content
    const levelTheory = (guitarContent.theory as any)[user.level];
    if (!levelTheory) return 0;
    
    // Combine all theory cards from all subcategories (basics, chords, scales, rhythm)
    const allCards: { name: string }[] = [];
    const subcategories = ['basics', 'chords', 'scales', 'rhythm'];
    subcategories.forEach(subcat => {
      if (levelTheory[subcat]) {
        allCards.push(...levelTheory[subcat]);
      }
    });
    
    if (allCards.length === 0) return 0;
    
    // For each card, get the stored progress (or 0 if not started)
    let totalProgress = 0;
    allCards.forEach(card => {
      // Create a consistent ID for matching with stored progress
      const cardId = card.name.toLowerCase().replace(/\s+/g, '_');
      const storedProgress = progressData?.theory?.[cardId];
      totalProgress += storedProgress?.progress || 0;
    });
    
    // Calculate percentage of total possible progress (all cards at 100%)
    const maxPossible = allCards.length * 100;
    return Math.round((totalProgress / maxPossible) * 100);
  };

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Text */}
        <div className="text-center" style={{ marginTop: '8px', marginBottom: '-30px', position: 'relative', zIndex: 10 }}>
          <h1 
            className="text-3xl font-bold"
            style={{
              color: 'rgb(249, 115, 22)',
              fontFamily: '"Comfortaa", "Nunito", "Quicksand", sans-serif',
              letterSpacing: '2px',
              textShadow: '0 2px 4px rgba(249, 115, 22, 0.2)'
            }}
          >
            {user.name}!
          </h1>
        </div>

        {/* Colorful Cartoon Friends Image */}
        <div className="relative flex justify-center" style={{ marginBottom: '-20px' }}>
          <img 
            src={charactersHoldingHands} 
            alt="Colorful Cartoon Friends" 
            className="object-contain w-full max-w-lg" 
            style={{ 
              maxHeight: '220px'
            }}
          />
        </div>

        {/* User Stats */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center justify-center px-3 py-1.5 rounded-xl" style={{backgroundColor: 'rgb(255, 191, 73)', borderBottom: '3px solid rgb(255, 171, 46)'}}>
            <Flame className="text-orange-500 fill-orange-500" style={{ marginRight: '6px', width: '18px', height: '18px'}} />
            <span className="text-base font-bold text-orange-600">{displayStreak}</span>
          </div>
          <div className="flex items-center justify-center px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgb(134, 239, 172)', borderBottom: '3px solid rgb(74, 222, 128)'}}>
            <Timer className="text-green-600" style={{ marginRight: '6px', width: '18px', height: '18px' }} />
            <span className="text-base font-bold text-green-700">{displayHours}h</span>
          </div>
          <div className="flex items-center justify-center px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgb(255, 223, 0)', borderBottom: '3px solid rgb(240, 204, 0)'}}>
            <Trophy className="text-yellow-500 fill-yellow-500" style={{ marginRight: '6px', width: '18px', height: '18px' }} />
            <span className="text-base font-bold text-yellow-600">{displayMasteredSongs}</span>
          </div>
          <div className="flex items-center justify-center px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgb(147, 197, 253)', borderBottom: '3px solid rgb(96, 165, 250)'}}>
            <Target className="text-blue-500" style={{ marginRight: '6px', width: '18px', height: '18px', strokeWidth: 2.5 }} />
            <span className="text-base font-bold text-blue-600">{getLevelAbbreviation(user.level)}</span>
          </div>
          <div className="flex items-center justify-center px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgb(216, 180, 254)', borderBottom: '3px solid rgb(192, 132, 252)'}}>
            <Coins className="text-purple-500" style={{ marginRight: '6px', width: '18px', height: '18px' }} />
            <span className="text-base font-bold text-purple-600">{progressData?.totalPoints || 0}</span>
          </div>
        </div>

        {/* Today's Goals and Current Songs Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Today's Goals */}
          <div
            className="backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgb(219, 234, 254)' }}>
                <Target className="w-4 h-4" style={{ color: 'rgb(59, 130, 246)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Today's Goals</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Complete to earn points</p>
              </div>
            </div>
            <div className="space-y-2">
              {/* Practice 30 Minutes Goal */}
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                <div className="flex items-center gap-2">
                  {(progressData?.dailyProgress?.[new Date().toISOString().split('T')[0]]?.totalMinutes || 0) >= 30 ? (
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'rgb(34, 197, 94)' }} />
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 rounded-full" style={{ borderColor: 'rgb(59, 130, 246)' }}></div>
                  )}
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Practice 30 min</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'rgb(59, 130, 246)' }}>+1</span>
              </div>
              {/* Technique Tasks Goal - check if at least 5 min of technique practiced today */}
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)' }}>
                <div className="flex items-center gap-2">
                  {(progressData?.dailyProgress?.[new Date().toISOString().split('T')[0]]?.techniqueMinutes || 0) >= 5 ? (
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'rgb(34, 197, 94)' }} />
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 rounded-full" style={{ borderColor: 'rgb(168, 85, 247)' }}></div>
                  )}
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Technique</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'rgb(168, 85, 247)' }}>+1</span>
              </div>
              {/* Theory Tasks Goal - check if at least 5 min of theory practiced today */}
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 72, 153, 0.08)' }}>
                <div className="flex items-center gap-2">
                  {(progressData?.dailyProgress?.[new Date().toISOString().split('T')[0]]?.theoryMinutes || 0) >= 5 ? (
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'rgb(34, 197, 94)' }} />
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 rounded-full" style={{ borderColor: 'rgb(236, 72, 153)' }}></div>
                  )}
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Theory</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'rgb(236, 72, 153)' }}>+1</span>
              </div>
            </div>
          </div>

          {/* Current Songs */}
          <div
            onClick={() => onSectionChange('songs')}
            className="backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 237, 213)' }}>
                <Music className="w-4 h-4" style={{ color: 'rgb(249, 115, 22)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">My Songs</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{songsWithProgress.length} in playlist</p>
              </div>
            </div>
            <div className="space-y-2">
              {songsWithProgress.length > 0 ? (
                songsWithProgress.map((song, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg"
                    style={{ backgroundColor: index === 0 ? 'rgba(249, 115, 22, 0.1)' : index === 1 ? 'rgba(234, 88, 12, 0.08)' : 'rgba(220, 38, 38, 0.06)' }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Play className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgb(249, 115, 22)' }} />
                      <span className="text-xs font-medium text-gray-700 truncate">{song.title}</span>
                </div>
                    <div className="flex items-center gap-1 ml-2">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${song.progress}%`,
                            backgroundColor: song.progress >= 80 ? 'rgb(34, 197, 94)' : song.progress >= 40 ? 'rgb(249, 115, 22)' : 'rgb(239, 68, 68)'
                          }}
                        />
              </div>
                      <span className="text-xs font-bold text-gray-500 w-8 text-right">{song.progress}%</span>
                </div>
              </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Plus className="w-6 h-6 mb-1" style={{ color: 'rgb(249, 115, 22)' }} />
                  <span className="text-xs font-medium text-gray-600">Add songs to learn</span>
                  <span className="text-xs text-gray-400">Tap to browse library</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Level Progress Bar */}
        <div className="mb-8">
          <SkillProgressBar onSectionChange={onSectionChange} />
        </div>

        {/* Technique and Theory Spotlights - Combined in One Row */}
        <div className="mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-sm" style={{ border: '2px solid rgb(231, 231, 231)' }}>
            <div className="grid grid-cols-2 gap-8">
              {/* Technique Section */}
              <div 
                onClick={() => onSectionChange('technique')}
                className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-semibold mb-1" style={{ color: '#3b82f6' }}>Technique</h2>
                  <p className="text-lg font-bold mb-4" style={{ color: '#3b82f6' }}>{calculateTechniqueProgress()}%</p>
                  
                  <div className="relative">
                    <CircularProgress 
                      value={calculateTechniqueProgress()} 
                      size={140} 
                      strokeWidth={12}
                      color="#3b82f6"
                      showPercentage={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Hand className="w-12 h-12" style={{ color: '#3b82f6' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Theory Section */}
              <div 
                onClick={() => onSectionChange('theory')}
                className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-semibold mb-1" style={{ color: '#a855f7' }}>Theory</h2>
                  <p className="text-lg font-bold mb-4" style={{ color: '#a855f7' }}>{calculateTheoryProgress()}%</p>
                  
                  <div className="relative">
                    <CircularProgress 
                      value={calculateTheoryProgress()} 
                      size={140} 
                      strokeWidth={12}
                      color="#a855f7"
                      showPercentage={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-12 h-12" style={{ color: '#a855f7' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 mx-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <QuickActionButton
              icon={Play}
              label="Start Practice"
              onClick={() => onSectionChange('technique')}
              style={{backgroundColor: 'rgb(255, 207, 147)'}}
            />
            <QuickActionButton
              icon={BookOpen}
              label="Chord Library"
              onClick={() => onSectionChange('technique')}
              style={{backgroundColor: 'rgb(224, 190, 255)'}}
            />
            <QuickActionButton
              icon={Headphones}
              label="Backing Tracks"
              onClick={() => onSectionChange('songs')}
              style={{backgroundColor: 'rgb(246, 142, 193)'}}
            />
            <QuickActionButton
              icon={Settings}
              label="Settings"
              onClick={() => onSectionChange('settings')}
              style={{backgroundColor: 'rgb(167, 174, 188)'}}
            />
          </div>
        </div>

      </div>
    </div>
  );
}