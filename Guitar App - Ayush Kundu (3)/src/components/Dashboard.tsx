import { DashboardCard } from "./DashboardCard";
import { QuickActionButton } from "./QuickActionButton";
import { StatsCard } from "./StatsCard";
import { SkillProgressBar } from "./SkillProgressBar";
import { CircularProgress } from "./ui/circular-progress";
import { useUser } from "../contexts/UserContext";
import { 
  Music, 
  Plus, 
  Play, 
  Settings, 
  BarChart3, 
  Clock, 
  CheckCircle2,
  Target,
  Users,
  Zap,
  Guitar,
  Volume2,
  BookOpen,
  Award,
  Timer,
  Headphones,
  Hand,
  Brain,
  Repeat,
  TrendingUp,
  Lightbulb,
  Layers,
  RotateCcw,
  Flame,
  Star,
  Coins,
  Sparkles,
  Trophy,
  Gauge,
  Dumbbell,
  GraduationCap,
  FileText
} from "lucide-react";

interface DashboardProps {
  onSectionChange: (section: string) => void;
}

export function Dashboard({ onSectionChange }: DashboardProps) {
  const { user, awardPoints, calculatePointsForActivity } = useUser();

  if (!user) {
    return null;
  }

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
          greeting: `Welcome back ${user.name}!`,
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

  // Calculate overall progress for circular progress bars
  const calculateTechniqueProgress = () => {
    // Mock calculation based on user level and progress
    const baseProgress = user.level === 'novice' ? 15 : 
                        user.level === 'beginner' ? 30 :
                        user.level === 'elementary' ? 45 :
                        user.level === 'intermediate' ? 60 :
                        user.level === 'proficient' ? 75 :
                        user.level === 'advanced' ? 85 : 95;
    return Math.min(baseProgress + (user.chordsLearned * 2), 100);
  };

  const calculateTheoryProgress = () => {
    // Mock calculation based on user level and progress
    const baseProgress = user.level === 'novice' ? 10 : 
                        user.level === 'beginner' ? 25 :
                        user.level === 'elementary' ? 40 :
                        user.level === 'intermediate' ? 55 :
                        user.level === 'proficient' ? 70 :
                        user.level === 'advanced' ? 80 : 90;
    return Math.min(baseProgress + (user.songsMastered * 3), 100);
  };

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header with Gradient Background */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-pink-600"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
          
          <div className="relative p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Guitar className="w-10 h-10" />
              <div>
                <h1 className="text-4xl font-bold">Welcome back, {user.name}!</h1>
                <p className="text-white/90">Ready to continue your guitar journey?</p>
              </div>
            </div>
            
            {/* Enhanced Stats with Points/Streak Emphasis */}
            <div className="flex items-center gap-6 mt-6 flex-wrap">
              <div className={`flex items-center gap-2 ${streakStatus === 'legendary' ? 'streak-milestone' : ''}`}>
                <Flame className={`w-5 h-5 text-orange-400 ${user.practiceStreak >= 7 ? 'streak-flame' : ''}`} />
                <span className="font-bold">{user.practiceStreak} day streak</span>
                {user.practiceStreak >= 7 && (
                  <div className="ml-1 text-xs bg-orange-500 text-white px-2 py-1 rounded-full animate-pulse">
                    {streakStatus === 'legendary' ? '🏆 LEGENDARY!' : 
                     streakStatus === 'epic' ? '⚡ EPIC!' : '🔥 ON FIRE!'}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{user.songsMastered} songs mastered</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                <span>{user.level} level</span>
              </div>
              
              {/* Enhanced Points Display */}
              <div className="flex items-center gap-2 points-highlight">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-xl points-counter">{user.totalPoints.toLocaleString()}</span>
                <span className="text-white/80">points</span>
                {user.weeklyPoints > 0 && (
                  <div className="ml-2 flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span className="text-xs text-yellow-200">+{user.weeklyPoints} this week</span>
                  </div>
                )}
              </div>
            </div>

            {/* Motivational Message Based on Streak */}
            {user.practiceStreak > 0 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-300/30">
                <p className="text-sm text-orange-100">
                  {user.practiceStreak === 1 ? "Great start! Keep your streak alive 🔥" :
                   user.practiceStreak < 7 ? `${7 - user.practiceStreak} more days to reach weekly mastery! 💪` :
                   user.practiceStreak < 30 ? `Amazing streak! ${30 - user.practiceStreak} days to legendary status! 🏆` :
                   "LEGENDARY STREAK! You're a guitar dedication master! 👑"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Goals and Current Songs Row - Fixed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Today's Goals with Points Preview */}
          <DashboardCard
            title="Today's Goals"
            subtitle="Earn points and keep your streak!"
            gradient="from-purple-400 to-indigo-500"
            icon={<Target className="w-5 h-5 text-white" />}
            className="h-80"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">Practice 30 minutes</span>
                </div>
                <span className="text-white/70 text-xs">+15 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                  <span className="text-white text-sm">{levelInfo.techniqueGoal}</span>
                </div>
                <span className="text-white/70 text-xs">+25 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                  <span className="text-white text-sm">{levelInfo.theoryGoal}</span>
                </div>
                <span className="text-white/70 text-xs">+30 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                  <span className="text-white text-sm">
                    {user.level === 'beginner' ? 'Practice chord changes' : 
                     user.level === 'intermediate' ? 'Use metronome' : 
                     'Record practice session'}
                  </span>
                </div>
                <span className="text-white/70 text-xs">+20 pts</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-medium">Daily Total:</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-300" />
                    <span className="font-bold">90 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Current Songs */}
          <div 
            onClick={() => onSectionChange('songs')}
            className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          >
            <DashboardCard
              title="Current Songs"
              subtitle="3 songs in your practice playlist"
              gradient="from-orange-400 via-red-500 to-pink-600"
              icon={<Music className="w-5 h-5 text-white" />}
              className="h-80"
            >
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-white" />
                    <span className="text-white font-medium">
                      {user.level === 'beginner' ? 'Twinkle Twinkle - Simple' : 
                       user.level === 'intermediate' ? 'Wonderwall - Oasis' : 
                       'Blackbird - The Beatles'}
                    </span>
                  </div>
                  <span className="text-white/80 text-sm">85%</span>
                </div>
                <div className="mt-2 bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 w-5/6"></div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-white" />
                    <span className="text-white font-medium">
                      {user.level === 'beginner' ? 'Happy Birthday - Easy Chords' : 
                       user.level === 'intermediate' ? 'House of the Rising Sun' : 
                       'Classical Gas - Mason Williams'}
                    </span>
                  </div>
                  <span className="text-white/80 text-sm">60%</span>
                </div>
                <div className="mt-2 bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 w-3/5"></div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-white" />
                    <span className="text-white font-medium">
                      {user.level === 'beginner' ? 'Mary Had a Little Lamb' : 
                       user.level === 'intermediate' ? 'Sweet Child O Mine - Intro' : 
                       'Eruption - Van Halen'}
                    </span>
                  </div>
                  <span className="text-white/80 text-sm">25%</span>
                </div>
                <div className="mt-2 bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 w-1/4"></div>
                </div>
              </div>
            </div>
            </DashboardCard>
          </div>
        </div>

        {/* Current Level Progress Bar */}
        <div className="mb-8">
          <SkillProgressBar onSectionChange={onSectionChange} />
        </div>

        {/* Technique and Theory Spotlights with Thicker Circular Progress and Extra Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Technique Section with Thicker Circular Progress and Additional Icons */}
          <div 
            onClick={() => onSectionChange('technique')}
            className="cursor-pointer hover:scale-[1.01] transition-transform duration-200"
          >
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200 dark:border-gray-700 h-80">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Hand className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    <Dumbbell className="w-5 h-5 text-orange-500 dark:text-orange-300" />
                    <Gauge className="w-5 h-5 text-orange-400 dark:text-orange-200" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-right">Technique</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-right">Overall Progress</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <CircularProgress 
                  value={calculateTechniqueProgress()} 
                  size={180} 
                  strokeWidth={14}
                  color="#f97316"
                  showPercentage={true}
                />
              </div>
            </div>
          </div>

          {/* Theory Section with Thicker Circular Progress and Additional Icons */}
          <div 
            onClick={() => onSectionChange('theory')}
            className="cursor-pointer hover:scale-[1.01] transition-transform duration-200"
          >
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200 dark:border-gray-700 h-80">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <GraduationCap className="w-5 h-5 text-purple-500 dark:text-purple-300" />
                    <FileText className="w-5 h-5 text-purple-400 dark:text-purple-200" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-right">Theory</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-right">Overall Progress</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <CircularProgress 
                  value={calculateTheoryProgress()} 
                  size={180} 
                  strokeWidth={14}
                  color="#9333ea"
                  showPercentage={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Row with Points Emphasis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Practice Streak"
            value={user.practiceStreak.toString()}
            icon={Award}
            trend={{ value: "3 days", isPositive: true }}
            color="text-orange-500"
            className={user.practiceStreak >= 7 ? 'achievement-glow' : ''}
          />
          <StatsCard
            title="Songs Mastered"
            value={user.songsMastered.toString()}
            icon={CheckCircle2}
            trend={{ value: "2", isPositive: true }}
            color="text-green-500"
          />
          <StatsCard
            title="Hours This Week"
            value={user.hoursThisWeek.toString()}
            icon={Clock}
            color="text-blue-500"
          />
          <StatsCard
            title="Chords Learned"
            value={user.chordsLearned.toString()}
            icon={BookOpen}
            trend={{ value: "4", isPositive: true }}
            color="text-purple-500"
          />
          <StatsCard
            title="Total Points"
            value={user.totalPoints.toLocaleString()}
            icon={Coins}
            trend={{ value: `+${user.weeklyPoints} this week`, isPositive: true }}
            color="text-yellow-500"
            className="points-sparkle"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickActionButton
              icon={Play}
              label="Start Practice"
              color="bg-orange-500"
              onClick={() => handleCompleteActivity('practice', 2)}
            />
            <QuickActionButton
              icon={Volume2}
              label="Tuner"
              color="bg-blue-500"
            />
            <QuickActionButton
              icon={Timer}
              label="Metronome"
              color="bg-green-500"
            />
            <QuickActionButton
              icon={BookOpen}
              label="Chord Library"
              color="bg-purple-500"
            />
            <QuickActionButton
              icon={Headphones}
              label="Backing Tracks"
              color="bg-pink-500"
            />
            <QuickActionButton
              icon={Settings}
              label="Settings"
              color="bg-gray-500"
            />
          </div>
        </div>

        {/* Recent Practice Activity with Points */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Practice</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <Guitar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white">
                  Practiced "{user.level === 'novice' || user.level === 'beginner' ? 'Happy Birthday' : 
                            user.level === 'elementary' || user.level === 'intermediate' ? 'Wonderwall' : 
                            user.level === 'proficient' || user.level === 'advanced' ? 'Classical Gas' :
                            'Caprice No. 24'}" for 45 minutes
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                <Coins className="w-3 h-3 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">+30</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white">
                  Mastered {user.level === 'novice' || user.level === 'beginner' ? 'A major chord' : 
                           user.level === 'elementary' || user.level === 'intermediate' ? 'F major chord' : 
                           user.level === 'proficient' || user.level === 'advanced' ? 'Cmaj7 chord voicing' :
                           'Complex jazz chord substitution'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                <Coins className="w-3 h-3 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">+{calculatePointsForActivity('chord_learned', 2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white">Learned new strumming pattern</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">2 days ago</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                <Coins className="w-3 h-3 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">+{calculatePointsForActivity('technique_mastered', 1)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white">
                  Practiced with metronome at {user.level === 'novice' || user.level === 'beginner' ? '60' : 
                                              user.level === 'elementary' || user.level === 'intermediate' ? '120' : 
                                              user.level === 'proficient' || user.level === 'advanced' ? '160' :
                                              '200'} BPM
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">3 days ago</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                <Coins className="w-3 h-3 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">+{calculatePointsForActivity('practice', 1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}