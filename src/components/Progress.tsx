import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress as ProgressBar } from './ui/progress';
import { CircularProgress } from './ui/circular-progress';
import { SkillProgressBar } from './SkillProgressBar';
import guitarVictoryStance from '../assets/20251019_1608_Guitar Victory Stance_remix_01k7zbmn8zfmqtx50kwjas8yr9.png';
import { 
  TrendingUp, 
  Award, 
  Target, 
  BarChart3,
  Music,
  Clock,
  CheckCircle2,
  BookOpen,
  Star,
  Guitar,
  Calendar,
  Trophy,
  Flame
} from 'lucide-react';
import guitarLearningSession from '../assets/20251015_2014_Guitar Learning Session_remix_01k7ng32p6eq7rve17jnf101ff.png';
import { 
  loadProgress as loadUserProgress, 
  getWeeklyPracticeMinutes, 
  getAchievements as getStoredAchievements,
  getSkillAreas as getStoredSkillAreas,
  getPracticeStreak,
  getTotalWeeklyMinutes,
  getMasteredSongsCount,
  getCurrentAchievementsWithStatus,
  getCurrentAchievementSet,
  updateAchievements,
  getTotalAchievementsEarned,
  getTotalPossibleAchievements,
  getDailyPracticeGoal,
  getAchievementPathText,
  Achievement
} from '../utils/progressStorage';
import { 
  Play, 
  Zap, 
  TrendingDown,
  Hand,
  Waves,
  ArrowUp,
  Activity,
  Crown
} from 'lucide-react';

export function Progress() {
  const { user } = useUser();
  const [progressData, setProgressData] = useState<any>(null);
  const [weeklyMinutesData, setWeeklyMinutesData] = useState<Record<string, number>>({});
  const [achievementsData, setAchievementsData] = useState<Record<string, boolean>>({});
  const [skillAreasData, setSkillAreasData] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [totalWeeklyMinutes, setTotalWeeklyMinutes] = useState(0);
  const [masteredSongs, setMasteredSongs] = useState(0);
  const [currentAchievements, setCurrentAchievements] = useState<(Achievement & { earned: boolean })[]>([]);
  const [currentSet, setCurrentSet] = useState<any>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);

  useEffect(() => {
    if (user) {
      const progress = loadUserProgress(user.id);
      setProgressData(progress);
      setWeeklyMinutesData(getWeeklyPracticeMinutes(user.id));
      setAchievementsData(getStoredAchievements(user.id));
      setSkillAreasData(getStoredSkillAreas(user.id));
      
      // Update achievements and check for newly earned ones
      updateAchievements(user.id);
      
      // Load current achievement set data
      setCurrentAchievements(getCurrentAchievementsWithStatus(user.id));
      setCurrentSet(getCurrentAchievementSet(user.id));
      setTotalEarned(getTotalAchievementsEarned(user.id));
      setTotalPossible(getTotalPossibleAchievements());
      setStreak(getPracticeStreak(user.id));
      setTotalWeeklyMinutes(getTotalWeeklyMinutes(user.id));
      setMasteredSongs(getMasteredSongsCount(user.id));
    }
  }, [user]);

  // Add shine animation styles
  const shineStyles = `
    @keyframes shine {
      0% { 
        transform: translateX(-100%) skewX(-15deg);
        opacity: 0;
      }
      5% { 
        opacity: 0.7;
      }
      15% { 
        transform: translateX(100%) skewX(-15deg);
        opacity: 0.7;
      }
      100% { 
        transform: translateX(100%) skewX(-15deg);
        opacity: 0;
      }
    }
  `;

  if (!user) {
    return null;
  }

  const getSkillAreasForDisplay = () => {
    // Use stored skill areas if available
    const stored = skillAreasData;
    if (stored) {
      return [
        {
          name: 'Chord Mastery',
          current: stored.chordMastery.current,
          total: stored.chordMastery.total,
          color: 'rgb(10, 201, 235)',
          icon: <Music className="w-4 h-4" />
        },
        {
          name: 'Strumming Patterns',
          current: stored.strummingPatterns.current,
          total: stored.strummingPatterns.total,
          color: 'rgb(125, 149, 255)',
          icon: <Target className="w-4 h-4" />
        },
        {
          name: 'Music Theory',
          current: stored.musicTheory.current,
          total: stored.musicTheory.total,
          color: 'rgb(171, 135, 255)',
          icon: <BookOpen className="w-4 h-4" />
        },
        {
          name: 'Song Repertoire',
          current: stored.songRepertoire.current,
          total: stored.songRepertoire.total,
          color: 'rgb(9, 200, 57)',
          icon: <CheckCircle2 className="w-4 h-4" />
        }
      ];
    }

    // Fallback to level-based defaults
    const configs = {
      novice: { chordTotal: 5, theoryTotal: 5, songTotal: 2, strummingTotal: 3 },
      beginner: { chordTotal: 10, theoryTotal: 8, songTotal: 5, strummingTotal: 5 },
      elementary: { chordTotal: 15, theoryTotal: 12, songTotal: 8, strummingTotal: 8 },
      intermediate: { chordTotal: 20, theoryTotal: 15, songTotal: 12, strummingTotal: 12 },
      proficient: { chordTotal: 25, theoryTotal: 18, songTotal: 15, strummingTotal: 15 },
      advanced: { chordTotal: 30, theoryTotal: 22, songTotal: 20, strummingTotal: 18 },
      expert: { chordTotal: 35, theoryTotal: 25, songTotal: 25, strummingTotal: 20 }
    };
    
    const config = configs[user.level as keyof typeof configs] || configs.beginner;
    
    return [
      {
        name: 'Chord Mastery',
        current: 0,
        total: config.chordTotal,
        color: 'rgb(10, 201, 235)',
        icon: <Music className="w-4 h-4" />
      },
      {
        name: 'Strumming Patterns',
        current: 0,
        total: config.strummingTotal,
        color: 'rgb(125, 149, 255)',
        icon: <Target className="w-4 h-4" />
      },
      {
        name: 'Music Theory',
        current: 0,
        total: config.theoryTotal,
        color: 'rgb(171, 135, 255)',
        icon: <BookOpen className="w-4 h-4" />
      },
      {
        name: 'Song Repertoire',
        current: 0,
        total: config.songTotal,
        color: 'rgb(9, 200, 57)',
        icon: <CheckCircle2 className="w-4 h-4" />
      }
    ];
  };

  const skillAreas = getSkillAreasForDisplay();

  // Use streak from storage, fallback to user context
  const displayStreak = streak !== 0 ? streak : user.practiceStreak;
  const displayMasteredSongs = masteredSongs || user.songsMastered;
  const displayTotalHours = Math.round((totalWeeklyMinutes / 60) * 10) / 10;

  // Map icon string to actual icon component
  const getIconComponent = (iconName: string, color: string) => {
    const colorMap: Record<string, string> = {
      'red': 'text-red-500', 'orange': 'text-orange-500', 'amber': 'text-amber-500',
      'yellow': 'text-yellow-500', 'lime': 'text-lime-500', 'green': 'text-green-500',
      'emerald': 'text-emerald-500', 'teal': 'text-teal-500', 'cyan': 'text-cyan-500',
      'sky': 'text-sky-500', 'blue': 'text-blue-500', 'indigo': 'text-indigo-500',
      'violet': 'text-violet-500', 'purple': 'text-purple-500', 'fuchsia': 'text-fuchsia-500',
      'pink': 'text-pink-500', 'rose': 'text-rose-500', 'gray': 'text-gray-500',
    };
    const colorClass = colorMap[color] || 'text-gray-500';
    const iconProps = { className: `w-6 h-6 ${colorClass}` };
    
    switch (iconName) {
      case 'Star': return <Star {...iconProps} />;
      case 'Music': return <Music {...iconProps} />;
      case 'Award': return <Award {...iconProps} />;
      case 'Trophy': return <Trophy {...iconProps} />;
      case 'Clock': return <Clock {...iconProps} />;
      case 'BookOpen': return <BookOpen {...iconProps} />;
      case 'Target': return <Target {...iconProps} />;
      case 'Calendar': return <Calendar {...iconProps} />;
      case 'Flame': return <Flame {...iconProps} />;
      case 'Play': return <Play {...iconProps} />;
      case 'CheckCircle2': return <CheckCircle2 {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      case 'Hand': return <Hand {...iconProps} />;
      case 'Waves': return <Waves {...iconProps} />;
      case 'ArrowUp': return <ArrowUp {...iconProps} />;
      case 'Activity': return <Activity {...iconProps} />;
      case 'Crown': return <Crown {...iconProps} />;
      case 'Guitar': return <Guitar {...iconProps} />;
      default: return <Star {...iconProps} />;
    }
  };

  // Use dynamic achievements from current set
  const achievements = currentAchievements.map(achievement => ({
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    earned: achievement.earned,
    icon: getIconComponent(achievement.icon, achievement.color),
  }));

  // Use weeklyMinutes from storage
  const displayWeeklyProgress = [
    { day: 'Mon', minutes: weeklyMinutesData['Mon'] || 0 },
    { day: 'Tue', minutes: weeklyMinutesData['Tue'] || 0 },
    { day: 'Wed', minutes: weeklyMinutesData['Wed'] || 0 },
    { day: 'Thu', minutes: weeklyMinutesData['Thu'] || 0 },
    { day: 'Fri', minutes: weeklyMinutesData['Fri'] || 0 },
    { day: 'Sat', minutes: weeklyMinutesData['Sat'] || 0 },
    { day: 'Sun', minutes: weeklyMinutesData['Sun'] || 0 }
  ];

  const getWeeklyProgressColor = (index: number) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500'];
    return colors[index % colors.length];
  };

  // Calculate circular progress values
  const overallProgress = skillAreas.length > 0
    ? Math.round(skillAreas.reduce((acc, skill) => acc + (skill.total > 0 ? skill.current / skill.total : 0), 0) / skillAreas.length * 100)
    : 0;
  const weeklyGoalProgress = Math.round((user.hoursThisWeek / 10) * 100); // Assuming 10 hours is the weekly goal
  const streakProgress = Math.round(Math.min((user.practiceStreak / 30) * 100, 100)); // 30 days = 100%

  return (
    <>
      <style>{shineStyles}</style>
      <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with White Background */}
        <div className="relative mb-16 rounded-2xl overflow-visible bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 py-8 px-8" style={{ border: '2px solid rgb(230, 230, 230)', borderBottom: '4px solid rgb(220, 220, 220)' }}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-black" style={{ color: 'rgb(170, 170, 170)' }} />
            <h1 className="text-3xl font-bold text-gray" style={{ color: 'rgb(170, 170, 170)' }}>Your Progress</h1>
          </div>
          
          {/* Stats positioned to cross the border */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="flex items-center bg-orange-100 px-16 py-1.5 rounded-xl" style={{backgroundColor: 'rgb(255, 191, 73)', borderBottom: '4px solid rgb(255, 171, 46)'}}>
              <Flame className="text-orange-500 fill-orange-500" style={{ marginLeft: '35px', width: '25px', height: '24px'}} />
              <span className="text-2xl font-bold text-orange-600 w-16">{displayStreak}</span>
            </div>
            <div className="flex items-center bg-yellow-100 px-16 py-1.5 rounded-xl" style={{ backgroundColor: 'rgb(255, 223, 0)', borderBottom: '4px solid rgb(240, 204, 0)'}}>
              <Trophy className="text-yellow-500 fill-yellow-500" style={{ marginLeft: '35px', width: '25px', height: '24px' }} />
              <span className="text-2xl font-bold text-yellow-600 w-16">{displayMasteredSongs}</span>
            </div>
            <div className="flex items-center bg-green-100 px-16 py-1.5 rounded-xl" style={{ backgroundColor: 'rgb(144, 238, 144)', borderBottom: '4px solid rgb(102, 212, 102)'}}>
              <Clock className="text-green-500" style={{ marginLeft: '35px', width: '25px', height: '24px', strokeWidth: 2.5 }} />
              <span className="text-2xl font-bold text-green-600 w-16">{displayTotalHours}h</span>
            </div>
          </div>
        </div>

        {/* Guitar Learning Session Image */}
        <div className="flex justify-start ml-8 relative z-10" style={{ marginTop: '-40px'}}>
          <img 
            src={guitarLearningSession} 
            alt="Guitar Learning Session" 
            className="w-full max-w-md h-auto object-contain " 
          />
        </div>

        <Card className="bg-transparent mb-4 relative z-0" style={{marginTop: '-10px', border: '2px solid rgb(237, 237, 237)', borderLeft: '3.5px solid rgb(237, 237, 237)', borderBottom: '3.5px solid rgb(237, 237, 237)', borderRight: '3.5px solid rgb(237, 237, 237)', backgroundColor: 'rgba(255, 255, 255, 0.4)'}}>

            <CardContent className="p-4 mt-4 mb-2">
              <div className="space-y-4">
                {displayWeeklyProgress.map((day, index) => {
                  const dailyGoal = user ? getDailyPracticeGoal(user.id) : 30;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div 
                              className={`${getWeeklyProgressColor(index)} h-3 rounded-full transition-all duration-300`}
                              style={{ width: `${dailyGoal > 0 ? Math.min((day.minutes / dailyGoal) * 100, 100) : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 w-16">
                            {day.minutes}/{dailyGoal}min
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        {/* Overall Skill Progression */}
        <div className="mb-8">
          <SkillProgressBar />
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-500 dark:text-gray-400" style={{ borderTop: "2.5px solid rgb(144, 218, 255)", borderLeft: "2.5px solid rgb(144, 218, 255)", borderBottom: "4px solid rgb(144, 218, 255)", borderRight: "2.5px solid rgb(144, 218, 255)", color: 'rgb(63, 191, 255)', padding: "8px 16px", borderRadius: "8px", backgroundColor: 'rgb(180, 226, 255)', marginBottom: '-20px', width: 'fit-content', margin: '0 auto -20px auto' }}>Achievements</h2>
          
          {/* Guitar Victory Stance Image */}
          <div className="flex justify-center mb-2" style={{ marginBottom: '0px', marginRight: '25px'}}>
            <img
              src={guitarVictoryStance}
              alt="Guitar Victory Stance"
              className="w-1/4 h-auto max-w-xs"
              style={{ width: '285px', height: '200px' }}
            />
          </div>
          
          {/* Current Set Info */}
          {currentSet && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200">
                <Trophy className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-700">Set {currentSet.setId}: {currentSet.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{currentSet.description}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs text-gray-400">
                  {achievements.filter(a => a.earned).length}/8 in current set
                </span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-400">
                  {totalEarned}/{totalPossible} total achievements
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                  achievement.earned 
                    ? 'border-green-300 bg-green-200' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                {/* Shine effect for earned achievements */}
                {achievement.earned && (
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, transparent 25%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.4) 65%, transparent 75%, transparent 100%)',
                      animation: 'shine 7s ease-in-out infinite',
                      zIndex: 1
                    }}
                  />
                )}
                <div className="flex flex-col items-start text-left relative z-10">
                  <div className="flex items-center gap-1 mb-2">
                    <div className={`p-2 rounded-full ${
                      achievement.earned ? 'bg-green-900' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {achievement.earned ? (
                        achievement.icon
                      ) : (
                        <Star className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <h3 className={`font-semibold ${
                      achievement.earned ? 'text-green-800' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                  </div>
                  <p className={`text-sm ml-1 ${
                      achievement.earned ? 'text-green-700' : 'text-gray-500 dark:text-gray-500'
                    }`}>
                    {achievement.description}
                  </p>
                  {!achievement.earned && achievement.requirement && (
                    <p className="text-xs ml-1 mt-1 text-gray-500 dark:text-gray-400 italic">
                      Path: {getAchievementPathText(achievement.requirement)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 rounded-2xl p-4" style={{ border: '2px solid rgb(200, 200, 200)', borderBottom: '4px solid rgb(200, 200, 200)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-500 dark:text-gray-400">Skill Areas</h2>
          <div className="space-y-6">
            {skillAreas.map((skill, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ backgroundColor: skill.color }}>
                      <div className="text-white">
                        {skill.icon}
                      </div>
                    </div>
                    <span className="font-medium text-gray-700 dark:text-white">{skill.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {skill.current}/{skill.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full" 
                    style={{ width: `${(skill.current / skill.total) * 100}%`, backgroundColor: skill.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom spacing for footer */}
        <div className="h-32"></div>
      </div>
    </div>
    </>
  );
}