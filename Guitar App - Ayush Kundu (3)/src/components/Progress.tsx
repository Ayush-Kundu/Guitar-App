import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress as ProgressBar } from './ui/progress';
import { CircularProgress } from './ui/circular-progress';
import { SkillProgressBar } from './SkillProgressBar';
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

export function Progress() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const getSkillAreasForLevel = (level: string) => {
    const configs = {
      novice: { chordTotal: 5, theoryTotal: 5, songTotal: 2, strummingTotal: 3 },
      beginner: { chordTotal: 10, theoryTotal: 8, songTotal: 5, strummingTotal: 5 },
      elementary: { chordTotal: 15, theoryTotal: 12, songTotal: 8, strummingTotal: 8 },
      intermediate: { chordTotal: 20, theoryTotal: 15, songTotal: 12, strummingTotal: 12 },
      proficient: { chordTotal: 25, theoryTotal: 18, songTotal: 15, strummingTotal: 15 },
      advanced: { chordTotal: 30, theoryTotal: 22, songTotal: 20, strummingTotal: 18 },
      expert: { chordTotal: 35, theoryTotal: 25, songTotal: 25, strummingTotal: 20 }
    };
    
    const config = configs[level as keyof typeof configs] || configs.beginner;
    
    return [
      {
        name: 'Chord Mastery',
        current: user.chordsLearned,
        total: config.chordTotal,
        color: 'bg-rose-500',
        icon: <Music className="w-4 h-4" />
      },
      {
        name: 'Strumming Patterns',
        current: Math.min(Math.floor(user.chordsLearned / 2), config.strummingTotal),
        total: config.strummingTotal,
        color: 'bg-cyan-500',
        icon: <Target className="w-4 h-4" />
      },
      {
        name: 'Music Theory',
        current: Math.min(Math.floor(user.chordsLearned / 3), config.theoryTotal),
        total: config.theoryTotal,
        color: 'bg-violet-500',
        icon: <BookOpen className="w-4 h-4" />
      },
      {
        name: 'Song Repertoire',
        current: user.songsMastered,
        total: config.songTotal,
        color: 'bg-emerald-500',
        icon: <CheckCircle2 className="w-4 h-4" />
      }
    ];
  };

  const skillAreas = getSkillAreasForLevel(user.level);

  const achievements = [
    {
      title: 'First Steps',
      description: 'Completed your first practice session',
      earned: true,
      icon: <Star className="w-6 h-6 text-yellow-500" />
    },
    {
      title: 'Chord Champion',
      description: `Learn ${user.level === 'novice' ? '3' : user.level === 'beginner' ? '5' : user.level === 'elementary' ? '8' : user.level === 'intermediate' ? '12' : user.level === 'proficient' ? '18' : user.level === 'advanced' ? '25' : '30'} chords`,
      earned: user.chordsLearned >= (user.level === 'novice' ? 3 : user.level === 'beginner' ? 5 : user.level === 'elementary' ? 8 : user.level === 'intermediate' ? 12 : user.level === 'proficient' ? 18 : user.level === 'advanced' ? 25 : 30),
      icon: <Music className="w-6 h-6 text-orange-500" />
    },
    {
      title: 'Streak Master',
      description: 'Practice for 7 days in a row',
      earned: user.practiceStreak >= 7,
      icon: <Award className="w-6 h-6 text-purple-500" />
    },
    {
      title: 'Song Master',
      description: `Master ${user.level === 'novice' ? '1' : user.level === 'beginner' ? '3' : user.level === 'elementary' ? '5' : user.level === 'intermediate' ? '8' : user.level === 'proficient' ? '12' : user.level === 'advanced' ? '15' : '20'} songs`,
      earned: user.songsMastered >= (user.level === 'novice' ? 1 : user.level === 'beginner' ? 3 : user.level === 'elementary' ? 5 : user.level === 'intermediate' ? 8 : user.level === 'proficient' ? 12 : user.level === 'advanced' ? 15 : 20),
      icon: <Trophy className="w-6 h-6 text-green-500" />
    },
    {
      title: 'Time Keeper',
      description: 'Practice for 10 hours total',
      earned: parseFloat(user.hoursThisWeek.toString()) >= 10,
      icon: <Clock className="w-6 h-6 text-blue-500" />
    },
    {
      title: 'Theory Scholar',
      description: 'Complete music theory basics',
      earned: !['novice', 'beginner'].includes(user.level),
      icon: <BookOpen className="w-6 h-6 text-indigo-500" />
    }
  ];

  const weeklyProgress = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 30 },
    { day: 'Wed', minutes: 60 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 50 },
    { day: 'Sat', minutes: 75 },
    { day: 'Sun', minutes: 40 }
  ];

  const getWeeklyProgressColor = (index: number) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500'];
    return colors[index % colors.length];
  };

  // Calculate circular progress values
  const overallProgress = Math.round(skillAreas.reduce((acc, skill) => acc + (skill.current / skill.total), 0) / skillAreas.length * 100);
  const weeklyGoalProgress = Math.round((user.hoursThisWeek / 10) * 100); // Assuming 10 hours is the weekly goal
  const streakProgress = Math.round(Math.min((user.practiceStreak / 30) * 100, 100)); // 30 days = 100%

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Gradient Background - Removed realistic image */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
          
          <div className="relative p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Your Progress</h1>
            </div>
            <p className="text-white/90 mb-4">Track your guitar learning journey, {user.name}!</p>
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span>{user.practiceStreak} day streak</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>{user.songsMastered} songs mastered</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span>{user.hoursThisWeek}h this week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Circular Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <CircularProgress 
                value={overallProgress} 
                size={120} 
                color="#f97316" 
                className="mx-auto mb-4"
              />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Overall Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Across all skills</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <CircularProgress 
                value={weeklyGoalProgress} 
                size={120} 
                color="#10b981" 
                className="mx-auto mb-4"
              />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Weekly Goal</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{user.hoursThisWeek}h / 10h target</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <CircularProgress 
                value={streakProgress} 
                size={120} 
                color="#8b5cf6" 
                className="mx-auto mb-4"
              />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Streak Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{user.practiceStreak} days strong</p>
            </CardContent>
          </Card>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Practice Streak</p>
                  <p className="text-2xl font-bold dark:text-white">{user.practiceStreak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Songs Mastered</p>
                  <p className="text-2xl font-bold dark:text-white">{user.songsMastered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Hours This Week</p>
                  <p className="text-2xl font-bold dark:text-white">{user.hoursThisWeek}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Chords Learned</p>
                  <p className="text-2xl font-bold dark:text-white">{user.chordsLearned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Skill Progression */}
        <div className="mb-8">
          <SkillProgressBar />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skill Progress */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Skill Areas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {skillAreas.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 ${skill.color.replace('bg-', 'bg-').replace('-500', '-100')} dark:bg-opacity-20 rounded-lg flex items-center justify-center`}>
                        {skill.icon}
                      </div>
                      <span className="font-medium dark:text-white">{skill.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {skill.current}/{skill.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${skill.color}`} 
                      style={{ width: `${(skill.current / skill.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Practice */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">This Week's Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className={`${getWeeklyProgressColor(index)} h-3 rounded-full transition-all duration-300`}
                            style={{ width: `${Math.min((day.minutes / 90) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-16">
                          {day.minutes}min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.earned 
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      achievement.earned ? 'bg-white dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {achievement.earned ? (
                        achievement.icon
                      ) : (
                        <Star className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        achievement.earned ? 'text-green-900 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
                          Earned!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom spacing for footer */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}