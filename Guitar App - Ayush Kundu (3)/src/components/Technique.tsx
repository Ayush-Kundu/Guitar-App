import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ActivityModal } from './ActivityModal';
import { 
  Hand, 
  RotateCcw, 
  TrendingUp, 
  Play, 
  Clock, 
  CheckCircle2,
  Star,
  Target,
  Zap,
  Activity,
  Award,
  Timer,
  Music
} from 'lucide-react';

export function Technique() {
  const { user, getFilteredContent } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActivity, setModalActivity] = useState<any>(null);

  if (!user) return null;

  // Get personalized techniques based on user level and preferences
  const techniques = getFilteredContent('techniques');

  // Fallback techniques if no filtered content
  const fallbackTechniques = {
    novice: [
      { name: 'Proper Posture', category: 'Foundation', progress: 90, difficulty: 1, timeToMaster: '1-2 days', description: 'Learn correct sitting and holding position' },
      { name: 'Basic Fretting', category: 'Foundation', progress: 70, difficulty: 1, timeToMaster: '3-5 days', description: 'Press strings cleanly on frets' },
      { name: 'Simple Strumming', category: 'Rhythm', progress: 50, difficulty: 1, timeToMaster: '1 week', description: 'Basic down-up strumming motion' }
    ],
    beginner: [
      { name: 'Basic Strumming Patterns', category: 'Rhythm', progress: 85, difficulty: 2, timeToMaster: '2 weeks', description: 'Learn common rhythm patterns' },
      { name: 'Chord Transitions', category: 'Chords', progress: 70, difficulty: 2, timeToMaster: '3 weeks', description: 'Smooth changes between chords' },
      { name: 'Pick Holding', category: 'Foundation', progress: 90, difficulty: 1, timeToMaster: '1 week', description: 'Proper pick grip and control' },
      { name: 'Muting Strings', category: 'Foundation', progress: 60, difficulty: 2, timeToMaster: '2 weeks', description: 'Control unwanted string noise' }
    ],
    expert: [
      { name: 'Advanced Tapping', category: 'Master', progress: 80, difficulty: 7, timeToMaster: '1 year', description: 'Two-handed tapping techniques' },
      { name: 'Multi-finger Tapping', category: 'Master', progress: 60, difficulty: 7, timeToMaster: '8 months', description: 'Complex finger independence' },
      { name: 'Advanced Sweep Picking', category: 'Master', progress: 70, difficulty: 7, timeToMaster: '1 year', description: 'Fluid arpeggiated passages' },
      { name: 'Polyrhythmic Playing', category: 'Master', progress: 40, difficulty: 7, timeToMaster: '1.5 years', description: 'Multiple rhythms simultaneously' }
    ]
  };

  const displayTechniques = techniques.length > 0 ? techniques : 
    fallbackTechniques[user.level as keyof typeof fallbackTechniques] || fallbackTechniques.beginner;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Foundation': return Hand;
      case 'Rhythm': return Activity;
      case 'Chords': return RotateCcw;
      case 'Fingerpicking': return Target;
      case 'Lead': return TrendingUp;
      case 'Advanced': return Star;
      case 'Master': return Award;
      default: return Hand;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Foundation': return 'text-blue-600 bg-blue-100';
      case 'Rhythm': return 'text-green-600 bg-green-100';
      case 'Chords': return 'text-purple-600 bg-purple-100';
      case 'Fingerpicking': return 'text-orange-600 bg-orange-100';
      case 'Lead': return 'text-red-600 bg-red-100';
      case 'Advanced': return 'text-indigo-600 bg-indigo-100';
      case 'Master': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < difficulty ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getProgressColor = (index: number) => {
    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-teal-500', 'bg-amber-500'];
    return colors[index % colors.length];
  };

  const handlePractice = (technique: any) => {
    setModalActivity({
      type: 'practice',
      activityType: 'technique',
      name: technique.name,
      description: `Practice ${technique.name} - ${technique.category} technique. ${technique.description || 'Focus on proper form and consistency.'}`,
      data: technique
    });
    setModalOpen(true);
  };

  const handleHistory = (technique: any) => {
    setModalActivity({
      type: 'history',
      name: technique.name,
      data: technique
    });
    setModalOpen(true);
  };

  const handleStartPracticeSession = () => {
    setModalActivity({
      type: 'practice',
      activityType: 'session',
      name: 'Technique Practice Session',
      description: `Customized practice session for ${user.level} level focusing on your music preferences: ${user.musicPreferences.join(', ')}`
    });
    setModalOpen(true);
  };

  // Get level-appropriate practice routine
  const getPracticeRoutine = () => {
    const routines = {
      novice: {
        warmup: { title: 'Finger Stretches (3 min)', description: 'Gentle finger and wrist exercises' },
        focus: { title: 'Basic Chord Practice (10 min)', description: 'Practice holding and switching between basic chords' },
        application: { title: 'Simple Songs (5 min)', description: 'Apply chords in easy songs' }
      },
      beginner: {
        warmup: { title: 'Chromatic Exercises (5 min)', description: 'Basic finger exercises and stretches' },
        focus: { title: 'Chord Transitions (15 min)', description: 'Work on smooth chord changes' },
        application: { title: 'Song Practice (10 min)', description: 'Apply techniques in real songs' }
      },
      expert: {
        warmup: { title: 'Advanced Warm-up (10 min)', description: 'Complex finger independence exercises' },
        focus: { title: 'Master Techniques (30 min)', description: 'Advanced technique refinement' },
        application: { title: 'Performance Pieces (20 min)', description: 'Work on concert-level repertoire' }
      }
    };
    
    return routines[user.level as keyof typeof routines] || routines.beginner;
  };

  const practiceRoutine = getPracticeRoutine();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Hand className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Guitar Technique</h1>
          </div>
          <p className="text-gray-600">Master essential techniques to improve your playing</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
              <span className="text-sm text-orange-700 font-medium">Level: {user.level}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
              <span className="text-sm text-green-700 font-medium">{displayTechniques.length} techniques</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <Music className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700 font-medium">Personalized for your style</span>
            </div>
          </div>
        </div>

        {/* Level-specific guidance */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">
                  {user.level === 'novice' && 'Building Your Foundation'}
                  {user.level === 'beginner' && 'Developing Core Skills'}
                  {user.level === 'expert' && 'Mastering Advanced Techniques'}
                  {!['novice', 'beginner', 'expert'].includes(user.level) && 'Expanding Your Technique'}
                </h3>
                <p className="text-sm text-green-700">
                  {user.level === 'novice' && 'Focus on proper posture, basic fretting, and simple strumming. Take your time building good habits.'}
                  {user.level === 'beginner' && 'Work on chord transitions and consistent strumming patterns. Practice regularly to build muscle memory.'}
                  {user.level === 'expert' && 'Refine advanced techniques with precision and musical expression. Focus on performance-level execution.'}
                  {!['novice', 'beginner', 'expert'].includes(user.level) && 'Balance learning new techniques with perfecting existing ones.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {displayTechniques.filter(t => t.progress === 100).length}
              </p>
              <p className="text-sm text-gray-600">Mastered</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {displayTechniques.filter(t => t.progress > 0 && t.progress < 100).length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(displayTechniques.reduce((sum, t) => sum + t.progress, 0) / displayTechniques.length)}%
              </p>
              <p className="text-sm text-gray-600">Avg Progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Timer className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {user.level === 'novice' ? '1.0' : user.level === 'beginner' ? '1.5' : '2.5'}
              </p>
              <p className="text-sm text-gray-600">Hours Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTechniques.map((technique, index) => {
            const IconComponent = getCategoryIcon(technique.category);
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(technique.category)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{technique.name}</CardTitle>
                        <p className="text-sm text-gray-600">{technique.category}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {technique.description && (
                    <p className="text-sm text-gray-600">{technique.description}</p>
                  )}

                  {/* Difficulty */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Difficulty</span>
                    <div className="flex items-center gap-1">
                      {getDifficultyStars(technique.difficulty)}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{technique.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(index)}`} 
                        style={{ width: `${technique.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Time to Master */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Time to Master</span>
                    <span className="text-gray-900">{technique.timeToMaster}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-blue-400 hover:bg-blue-500"
                      onClick={() => handlePractice(technique)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Practice
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleHistory(technique)}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      History
                    </Button>
                  </div>

                  {/* Completion Status */}
                  {technique.progress === 100 && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Mastered!</span>
                      <Star className="w-4 h-4 text-yellow-500 ml-auto" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <hr className="my-12 border-gray-300" />

        {/* Practice Routine Suggestion */}
        <div className="mt-12 p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Practice Routine</h2>
          <p className="text-gray-600 mb-6">
            Recommended technique practice for {user.level} level - {user.level === 'novice' ? '20 minutes' : user.level === 'expert' ? '60 minutes' : '30 minutes'} total
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-gray-900 mb-2">{practiceRoutine.warmup.title}</h3>
              <p className="text-sm text-gray-600">{practiceRoutine.warmup.description}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <h3 className="font-medium text-gray-900 mb-2">{practiceRoutine.focus.title}</h3>
              <p className="text-sm text-gray-600">{practiceRoutine.focus.description}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-gray-900 mb-2">{practiceRoutine.application.title}</h3>
              <p className="text-sm text-gray-600">{practiceRoutine.application.description}</p>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4 bg-blue-400 hover:bg-blue-500"
            onClick={handleStartPracticeSession}
          >
            <Zap className="w-4 h-4 mr-2" />
            Start Practice Session
          </Button>
        </div>
      </div>

      <ActivityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        activityType={modalActivity?.type || 'practice'}
        activityData={modalActivity}
      />
    </div>
  );
}