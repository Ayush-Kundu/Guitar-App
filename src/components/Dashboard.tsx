import React, { useEffect, useState, useMemo, useRef } from 'react';
import { DashboardCard } from "./DashboardCard";
import { QuickActionButton } from "./QuickActionButton";
import { StatsCard } from "./StatsCard";
import { CircularProgress } from "./ui/circular-progress";
import { SkillProgressBar } from './SkillProgressBar';
import { useUser } from "../contexts/UserContext";
import charactersHoldingHands from '../assets/20251022_2045_Colorful Cartoon Friends_remix_01k87jmr2yfzesxbt7pcwpqy24.png';
/** Cropped Beats mascot for dashboard (no top/bottom black bars) */
import beatsSaysAvatar from '../assets/beats-says-avatar.png';
import guitarContent from '../data/guitar-content.json';
import { getTechniquePath, getTheoryPath } from '../data/learning-journey';
import {
  loadProgress,
  getPracticeStreak,
  getTotalWeeklyMinutes,
  getMasteredSongsCount,
  getAllSongProgress,
  getDailyRoutine,
  getWeeklyTheoryRoutine,
  getSelectedSongs,
  getWeeklyGoals,
  getDailyPracticeGoal,
  SelectedSong,
  calculatePointsBreakdown,
  PointsBreakdown
} from '../utils/progressStorage';
import { playTap } from '../utils/soundEffects';
import { getDashboardDailyFirstStep } from '../utils/beatsInstructions';
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
  Trophy,
  Timer,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from './ui/utils';

interface DashboardProps {
  onSectionChange: (section: string) => void;
}

type DashStatSnap = {
  streak: number;
  hours: number;
  songs: number;
  points: number;
  level: string;
};

function dashSnapKey(uid: string) {
  return `strummy-dash-stat-snap-${uid}`;
}

function readDashSnap(uid: string): DashStatSnap | null {
  try {
    const t = sessionStorage.getItem(dashSnapKey(uid));
    if (!t) return null;
    return JSON.parse(t) as DashStatSnap;
  } catch {
    return null;
  }
}

function writeDashSnap(uid: string, s: DashStatSnap) {
  try {
    sessionStorage.setItem(dashSnapKey(uid), JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function AnimatedStatNumber({
  value,
  from,
  run,
  decimals,
  className,
}: {
  value: number;
  from: number;
  run: boolean;
  decimals: 0 | 1;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (!run || from === value) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const ease = 1 - (1 - p) ** 2;
      setDisplay(from + (value - from) * ease);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, from, run]);
  const rounded =
    decimals === 1 ? Math.round(display * 10) / 10 : Math.round(display);
  return <span className={className}>{rounded}</span>;
}

function DashboardBeatsSaysBlock({
  user,
  progressData,
  onSectionChange,
}: {
  user: ReturnType<typeof useUser>['user'];
  progressData: any;
  onSectionChange: (section: string) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const dp = progressData?.dailyProgress?.[today] || {};
  const totalMin = dp.totalMinutes || 0;
  const goalsDone = dp.goalsCompleted || [];
  const dailyGoal = user ? getDailyPracticeGoal(user.id) : 30;
  const practiceDone = totalMin >= dailyGoal;
  const techniqueDone = (dp.techniqueMinutes || 0) >= 5 || goalsDone.includes('technique_lesson_today');
  const theoryDone = (dp.theoryMinutes || 0) >= 5 || goalsDone.includes('theory_lesson_today');

  const firstStep = getDashboardDailyFirstStep(user, progressData, {
    today,
    practiceDone,
    techniqueDone,
    theoryDone,
    dailyGoal,
  });

  const openBeatsTarget = () => {
    try {
      sessionStorage.removeItem('strummy-beats-directed');
    } catch (_) {}

    if (firstStep.openLearnGuitarBasics) {
      onSectionChange('songs');
      window.requestAnimationFrame(() => {
        try {
          window.dispatchEvent(new CustomEvent('strummy-request-open-guitar-basics'));
        } catch (_) {}
      });
      return;
    }

    onSectionChange(firstStep.section);
  };

  return (
    <div
      className="relative mb-4 rounded-2xl p-4 pt-3 shadow-sm backdrop-blur-sm border border-[#eb4034]/25 dark:border-[#eb4034]/35 bg-white/55 dark:bg-slate-900/45"
      data-beats="card"
      style={{ borderBottom: '5px solid rgba(235, 64, 52, 0.38)' }}
      key={`beats-${(progressData?.completedLessons as string[] | undefined)?.length ?? 0}-${(progressData?.completedTheoryLessons as string[] | undefined)?.length ?? 0}-${techniqueDone}-${theoryDone}-${practiceDone}`}
    >
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg beats-badge">
          <Sparkles className="w-3.5 h-3.5 beats-card-text" />
          <span className="text-[10px] font-medium beats-card-text">Daily</span>
        </div>
      </div>
      <div className="flex items-start gap-2 mb-3 pr-20">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center beats-avatar ring-2 ring-[#eb4034]/35 dark:ring-[#ff9a8f]/40">
          <img src={beatsSaysAvatar} alt="Beats" className="beats-avatar-img" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-[#c42a22] dark:text-[#ff9a8f] m-0 leading-tight">Beats says</h3>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-snug mt-1">
            Your next step today
          </p>
        </div>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={openBeatsTarget}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openBeatsTarget();
          }
        }}
        className="w-full flex items-center gap-3 text-left py-3 px-3 sm:py-3.5 sm:px-4 rounded-xl cursor-pointer bg-[#eb4034]/[0.07] dark:bg-[#eb4034]/[0.12] border border-[#eb4034]/22 dark:border-[#eb4034]/32 hover:bg-[#eb4034]/[0.11] dark:hover:bg-[#eb4034]/[0.16] transition-colors"
      >
        <p className="flex-1 min-w-0 text-sm font-medium text-gray-600 dark:text-gray-300 m-0 leading-tight pr-1 truncate">
          {firstStep.line}
        </p>
        <ChevronRight className="w-5 h-5 flex-shrink-0 text-[#eb4034] dark:text-[#ff9a8f] self-center" aria-hidden />
      </div>
    </div>
  );
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
  const [weeklyGoals, setWeeklyGoals] = useState<ReturnType<typeof getWeeklyGoals> | null>(null);
  const LEVEL_ORDER = ['novice', 'beginner', 'elementary', 'intermediate', 'proficient', 'advanced', 'expert'];
  const lastLevelUpPromoRef = useRef<string>('');
  const [statBumpKeys, setStatBumpKeys] = useState<Set<string>>(() => new Set());
  const [tallyOrigin, setTallyOrigin] = useState<DashStatSnap | null>(null);
  const animatingBumpRef = useRef(false);
  const bumpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDashSnapRef = useRef<DashStatSnap | null>(null);

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
      setWeeklyGoals(getWeeklyGoals(user.id));
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

    const handleProgressSync = (ev: Event) => {
      const detail = (ev as CustomEvent<{ userId?: string }>).detail;
      if (user?.id && detail?.userId === user.id) {
        refreshDashboardData();
      }
    };

    // Also refresh periodically to catch changes from other components
    const intervalId = setInterval(() => {
      refreshDashboardData();
    }, 30000); // Refresh every 30 seconds

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('strummy-progress-sync', handleProgressSync);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('strummy-progress-sync', handleProgressSync);
    };
  }, [user]);

  // Auto level-up when progress reaches 100%
  useEffect(() => {
    if (user) {
      const levelProgress = getLevelProgressPercentage();
      const currentIndex = LEVEL_ORDER.indexOf(user.level);
      if (levelProgress >= 100 && currentIndex < LEVEL_ORDER.length - 1) {
        const newLevel = LEVEL_ORDER[currentIndex + 1] as typeof user.level;
        const promoKey = `${user.level}->${newLevel}`;
        if (lastLevelUpPromoRef.current !== promoKey) {
          lastLevelUpPromoRef.current = promoKey;
          updateUser({ level: newLevel });
          try {
            window.dispatchEvent(
              new CustomEvent('strummy-celebration', { detail: { kind: 'level_up', level: newLevel } })
            );
          } catch (_) {}
        }
      }
    }
  }, [progressData, user, getLevelProgressPercentage, updateUser]);

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
  const displayPoints =
    typeof user?.totalPoints === 'number'
      ? user.totalPoints
      : (progressData?.totalPoints ?? 0);

  useEffect(() => {
    if (!user) {
      latestDashSnapRef.current = null;
      return;
    }
    latestDashSnapRef.current = {
      streak: displayStreak,
      hours: displayHours,
      songs: displayMasteredSongs,
      points: displayPoints,
      level: user.level,
    };
  }, [user, displayStreak, displayHours, displayMasteredSongs, displayPoints]);

  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;
    return () => {
      const s = latestDashSnapRef.current;
      if (s) writeDashSnap(uid, s);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user || progressData == null) return;
    if (animatingBumpRef.current) return;
    const curr: DashStatSnap = {
      streak: displayStreak,
      hours: displayHours,
      songs: displayMasteredSongs,
      points: displayPoints,
      level: user.level,
    };
    const prev = readDashSnap(user.id);
    if (!prev) {
      writeDashSnap(user.id, curr);
      return;
    }
    const bumps = new Set<string>();
    if (curr.streak > prev.streak) bumps.add('streak');
    if (curr.hours > prev.hours + 0.0001) bumps.add('hours');
    if (curr.songs > prev.songs) bumps.add('songs');
    if (curr.points > prev.points) bumps.add('points');
    if (curr.level !== prev.level) bumps.add('level');
    if (bumps.size === 0) {
      writeDashSnap(user.id, curr);
      return;
    }
    animatingBumpRef.current = true;
    setTallyOrigin(prev);
    setStatBumpKeys(bumps);
    if (bumpTimeoutRef.current) clearTimeout(bumpTimeoutRef.current);
    bumpTimeoutRef.current = window.setTimeout(() => {
      setStatBumpKeys(new Set());
      setTallyOrigin(null);
      writeDashSnap(user.id, curr);
      animatingBumpRef.current = false;
      bumpTimeoutRef.current = null;
    }, 1650);
  }, [
    user,
    progressData,
    displayStreak,
    displayHours,
    displayMasteredSongs,
    displayPoints,
  ]);

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

  // Technique / Theory progress: % of lessons completed (same as mastery on Technique/Theory pages)
  const calculateTechniqueProgress = () => {
    if (!user) return 0;
    const level = user.level || 'novice';
    const path = getTechniquePath(level);
    if (!path.length) return 0;
    const completedLessons = new Set((progressData as any)?.completedLessons ?? []);
    const totalLessons = path.reduce((sum, u) => sum + u.lessons.length, 0);
    const completedInPath = path.flatMap(u => u.lessons).filter(l => completedLessons.has(l.id)).length;
    return totalLessons ? Math.round((completedInPath / totalLessons) * 100) : 0;
  };

  const calculateTheoryProgress = () => {
    if (!user) return 0;
    const level = user.level || 'novice';
    const path = getTheoryPath(level);
    if (!path.length) return 0;
    const completedLessons = new Set((progressData as any)?.completedTheoryLessons ?? []);
    const totalLessons = path.reduce((sum, u) => sum + u.lessons.length, 0);
    const completedInPath = path.flatMap(u => u.lessons).filter(l => completedLessons.has(l.id)).length;
    return totalLessons ? Math.round((completedInPath / totalLessons) * 100) : 0;
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
            style={{ maxHeight: '220px' }}
          />
        </div>

        {/* User Stats — single row; no coins pill */}
        <div className="flex flex-nowrap justify-center items-center gap-2 mb-4 w-full min-w-0 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div
            className={cn(
              'flex shrink-0 items-center justify-center px-3 py-1.5 rounded-xl',
              statBumpKeys.has('streak') && 'dashboard-stat-pop',
            )}
            style={{ backgroundColor: 'rgb(255, 191, 73)', borderBottom: '3px solid rgb(255, 171, 46)' }}
          >
            <Flame className="text-orange-500 fill-orange-500" style={{ marginRight: '6px', width: '18px', height: '18px' }} />
            <span className="text-base font-bold text-orange-600 tabular-nums">
              {tallyOrigin && statBumpKeys.has('streak') ? (
                <AnimatedStatNumber
                  value={displayStreak}
                  from={tallyOrigin.streak}
                  run={statBumpKeys.has('streak')}
                  decimals={0}
                />
              ) : (
                displayStreak
              )}
            </span>
          </div>
          <div
            className={cn(
              'flex shrink-0 items-center justify-center px-3 py-1.5 rounded-xl',
              statBumpKeys.has('hours') && 'dashboard-stat-pop',
            )}
            style={{ backgroundColor: 'rgb(134, 239, 172)', borderBottom: '3px solid rgb(74, 222, 128)' }}
          >
            <Timer className="text-green-600" style={{ marginRight: '6px', width: '18px', height: '18px' }} />
            <span className="text-base font-bold text-green-700 tabular-nums">
              {tallyOrigin && statBumpKeys.has('hours') ? (
                <>
                  <AnimatedStatNumber
                    value={displayHours}
                    from={tallyOrigin.hours}
                    run={statBumpKeys.has('hours')}
                    decimals={1}
                  />
                  h
                </>
              ) : (
                `${displayHours}h`
              )}
            </span>
          </div>
          <div
            className={cn(
              'flex shrink-0 items-center justify-center px-3 py-1.5 rounded-xl',
              statBumpKeys.has('songs') && 'dashboard-stat-pop',
            )}
            style={{ backgroundColor: 'rgb(255, 223, 0)', borderBottom: '3px solid rgb(240, 204, 0)' }}
          >
            <Trophy className="text-yellow-500 fill-yellow-500" style={{ marginRight: '6px', width: '18px', height: '18px' }} />
            <span className="text-base font-bold text-yellow-600 tabular-nums">
              {tallyOrigin && statBumpKeys.has('songs') ? (
                <AnimatedStatNumber
                  value={displayMasteredSongs}
                  from={tallyOrigin.songs}
                  run={statBumpKeys.has('songs')}
                  decimals={0}
                />
              ) : (
                displayMasteredSongs
              )}
            </span>
          </div>
          <div
            className={cn(
              'flex shrink-0 items-center justify-center px-3 py-1.5 rounded-xl',
              statBumpKeys.has('level') && 'dashboard-stat-pop',
            )}
            style={{ backgroundColor: 'rgb(147, 197, 253)', borderBottom: '3px solid rgb(96, 165, 250)' }}
          >
            <Target className="text-blue-500" style={{ marginRight: '6px', width: '18px', height: '18px', strokeWidth: 2.5 }} />
            <span className="text-base font-bold text-blue-600">{getLevelAbbreviation(user.level)}</span>
          </div>
          <div
            className={cn(
              'flex shrink-0 items-center justify-center px-3 py-1.5 rounded-xl',
              statBumpKeys.has('points') && 'dashboard-stat-pop',
            )}
            style={{ backgroundColor: 'rgb(216, 180, 254)', borderBottom: '3px solid rgb(192, 132, 252)' }}
          >
            <Sparkles className="text-purple-500" style={{ marginRight: '6px', width: '18px', height: '18px' }} />
            <span className="text-base font-bold text-purple-600 tabular-nums">
              {tallyOrigin && statBumpKeys.has('points') ? (
                <AnimatedStatNumber
                  value={displayPoints}
                  from={tallyOrigin.points}
                  run={statBumpKeys.has('points')}
                  decimals={0}
                />
              ) : (
                displayPoints
              )}
            </span>
          </div>
        </div>


        {/* Level progress — goals shell + original SkillProgressBar content */}
        <button
          type="button"
          onClick={() => onSectionChange('progress')}
          className="w-full text-left backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-all mb-6 bg-white/50 dark:bg-slate-900/50 cursor-pointer"
        >
          <SkillProgressBar embedded />
        </button>

        {/* Today's Goals and Current Songs Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Today's Goals */}
          <div className="backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-all bg-white/50 dark:bg-slate-900/50">
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
              {/* Practice X Minutes Goal (user-set daily goal) */}
              {(() => {
                const dailyGoal = user ? getDailyPracticeGoal(user.id) : 30;
                const totalMin = progressData?.dailyProgress?.[new Date().toISOString().split('T')[0]]?.totalMinutes || 0;
                return (
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                    <div className="flex items-center gap-2">
                      {totalMin >= dailyGoal ? (
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'rgb(34, 197, 94)' }} />
                      ) : (
                        <div className="w-3.5 h-3.5 border-2 rounded-full" style={{ borderColor: 'rgb(59, 130, 246)' }}></div>
                      )}
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Practice {dailyGoal} min</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'rgb(59, 130, 246)' }}>+1</span>
                  </div>
                );
              })()}
              {/* Technique Tasks Goal - one technique lesson completed OR 5 min today */}
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)' }}>
                <div className="flex items-center gap-2">
                  {(progressData?.dailyProgress?.[new Date().toISOString().split('T')[0]]?.techniqueMinutes || 0) >= 5 ||
                   (progressData?.dailyProgress?.[new Date().toISOString().split('T')[0]]?.goalsCompleted || []).includes('technique_lesson_today') ? (
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'rgb(34, 197, 94)' }} />
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 rounded-full" style={{ borderColor: 'rgb(168, 85, 247)' }}></div>
                  )}
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Technique</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'rgb(168, 85, 247)' }}>+1</span>
              </div>
              {/* Theory Tasks Goal - one theory lesson completed OR 5 min today */}
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 72, 153, 0.08)' }}>
                <div className="flex items-center gap-2">
                  {(progressData?.dailyProgress?.[new Date().toISOString().split('T')[0]]?.theoryMinutes || 0) >= 5 ||
                   (progressData?.dailyProgress?.[new Date().toISOString().split('T')[0]]?.goalsCompleted || []).includes('theory_lesson_today') ? (
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
            className="backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01] bg-white/50 dark:bg-slate-900/50"
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

        {/* Beats says — below today’s goals & My Songs */}
        <DashboardBeatsSaysBlock user={user} progressData={progressData} onSectionChange={onSectionChange} />

        {/* Technique and Theory — same frosted shell as Today's Goals */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onSectionChange('technique')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSectionChange('technique');
              }
            }}
            className={cn(
              'rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-sm transition-all cursor-pointer',
              'bg-white/50 dark:bg-slate-900/50 hover:shadow-md',
            )}
          >
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'rgb(249, 115, 22)' }}>
                Technique
              </h2>
              <p className="text-lg font-bold mb-4" style={{ color: 'rgb(249, 115, 22)' }}>
                {calculateTechniqueProgress()}%
              </p>
              <div className="relative">
                <CircularProgress
                  value={calculateTechniqueProgress()}
                  size={140}
                  strokeWidth={12}
                  color="rgb(249, 115, 22)"
                  gradientToColor="rgb(251, 191, 36)"
                      showPercentage={false}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Hand className="w-12 h-12" style={{ color: 'rgb(249, 115, 22)' }} />
                </div>
              </div>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => onSectionChange('theory')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSectionChange('theory');
              }
            }}
            className={cn(
              'rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-sm transition-all cursor-pointer',
              'bg-white/50 dark:bg-slate-900/50 hover:shadow-md',
            )}
          >
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'rgb(59, 130, 246)' }}>
                Theory
              </h2>
              <p className="text-lg font-bold mb-4" style={{ color: 'rgb(59, 130, 246)' }}>
                {calculateTheoryProgress()}%
              </p>
              <div className="relative">
                <CircularProgress
                  value={calculateTheoryProgress()}
                  size={140}
                  strokeWidth={12}
                  color="rgb(59, 130, 246)"
                  gradientToColor="rgb(147, 197, 253)"
                      showPercentage={false}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-12 h-12" style={{ color: 'rgb(59, 130, 246)' }} />
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