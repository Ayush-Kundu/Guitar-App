import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ActivityModal } from './ActivityModal';
import { 
  Brain, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  Music, 
  Play, 
  CheckCircle2,
  Star,
  Target,
  Award,
  Clock,
  RotateCcw,
  GraduationCap
} from 'lucide-react';

export function Theory() {
  const { user, getFilteredContent } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActivity, setModalActivity] = useState<any>(null);

  if (!user) return null;

  // Get personalized theory content
  const theoryTopics = getFilteredContent('theory');

  // Fallback theory content based on level
  const fallbackTheory = {
    novice: [
      { name: 'Guitar Parts & Anatomy', category: 'Basics', progress: 95, difficulty: 1, timeToLearn: '1 day', description: 'Learn all parts of the guitar' },
      { name: 'String Names & Numbers', category: 'Basics', progress: 80, difficulty: 1, timeToLearn: '2 days', description: 'Memorize the six string names' },
      { name: 'Fret Numbers', category: 'Basics', progress: 70, difficulty: 1, timeToLearn: '3 days', description: 'Understanding fret positions' },
      { name: 'Basic Chord Shapes', category: 'Chords', progress: 60, difficulty: 1, timeToLearn: '1 week', description: 'Learn your first chord shapes' }
    ],
    beginner: [
      { name: 'Basic Major Chords', category: 'Chords', progress: 90, difficulty: 2, timeToLearn: '1 week', description: 'Major chord family' },
      { name: 'Basic Minor Chords', category: 'Chords', progress: 75, difficulty: 2, timeToLearn: '1 week', description: 'Minor chord family' },
      { name: 'Chord Symbols', category: 'Notation', progress: 85, difficulty: 2, timeToLearn: '3 days', description: 'Reading chord charts' },
      { name: 'Simple Time Signatures', category: 'Rhythm', progress: 60, difficulty: 2, timeToLearn: '1 week', description: '4/4 and 3/4 time' },
      { name: 'Basic Scale Theory', category: 'Scales', progress: 50, difficulty: 2, timeToLearn: '2 weeks', description: 'Major scale foundation' }
    ],
    expert: [
      { name: 'Advanced Jazz Harmony', category: 'Master', progress: 70, difficulty: 7, timeToLearn: '1 year', description: 'Complex jazz chord progressions' },
      { name: 'Counterpoint', category: 'Master', progress: 50, difficulty: 7, timeToLearn: '1.5 years', description: 'Bach-style voice leading' },
      { name: 'Modal Interchange', category: 'Advanced', progress: 80, difficulty: 6, timeToLearn: '6 months', description: 'Borrowing from parallel modes' },
      { name: 'Chromatic Voice Leading', category: 'Advanced', progress: 60, difficulty: 6, timeToLearn: '8 months', description: 'Smooth chromatic progressions' },
      { name: 'Advanced Analysis', category: 'Master', progress: 45, difficulty: 7, timeToLearn: '2 years', description: 'Deep harmonic analysis' }
    ]
  };

  const displayTheory = theoryTopics.length > 0 ? theoryTopics : 
    fallbackTheory[user.level as keyof typeof fallbackTheory] || fallbackTheory.beginner;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Basics': return BookOpen;
      case 'Chords': return RotateCcw;
      case 'Scales': return Layers;
      case 'Keys': return Target;
      case 'Rhythm': return Clock;
      case 'Notation': return Music;
      case 'Harmony': return Brain;
      case 'Advanced': return Star;
      case 'Composition': return Lightbulb;
      case 'Master': return Award;
      default: return BookOpen;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Basics': return 'text-blue-600 bg-blue-100';
      case 'Chords': return 'text-green-600 bg-green-100';
      case 'Scales': return 'text-purple-600 bg-purple-100';
      case 'Keys': return 'text-orange-600 bg-orange-100';
      case 'Rhythm': return 'text-red-600 bg-red-100';
      case 'Notation': return 'text-indigo-600 bg-indigo-100';
      case 'Harmony': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-pink-600 bg-pink-100';
      case 'Composition': return 'text-cyan-600 bg-cyan-100';
      case 'Master': return 'text-violet-600 bg-violet-100';
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
    const colors = ['bg-violet-500', 'bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-teal-500', 'bg-indigo-500', 'bg-lime-500'];
    return colors[index % colors.length];
  };

  const handleStudy = (topic: any) => {
    setModalActivity({
      type: 'study',
      activityType: 'theory',
      name: topic.name,
      description: `Study ${topic.name} - ${topic.category} concepts. ${topic.description || 'Deepen your understanding of music theory.'}`,
      data: topic
    });
    setModalOpen(true);
  };

  const handleQuiz = (topic: any) => {
    setModalActivity({
      type: 'quiz',
      name: `${topic.name} Quiz`,
      data: topic
    });
    setModalOpen(true);
  };

  const handleInteractiveTool = (toolName: string) => {
    setModalActivity({
      type: 'study',
      name: toolName,
      description: `Interactive ${toolName} tool`
    });
    setModalOpen(true);
  };

  const handleDailyChallenge = () => {
    const challenges = {
      novice: 'What are the names of the six guitar strings?',
      beginner: 'What notes are in a C major chord?',
      expert: 'Analyze the harmonic function of this chord progression: Cmaj7 - A7alt - Dm7 - G7'
    };
    
    setModalActivity({
      type: 'quiz',
      name: 'Daily Theory Challenge',
      description: challenges[user.level as keyof typeof challenges] || challenges.beginner
    });
    setModalOpen(true);
  };

  // Get level-appropriate learning path
  const getLearningPath = () => {
    const paths = {
      novice: [
        'Master guitar anatomy and string names',
        'Learn basic chord shapes',
        'Understand fret positions',
        'Practice reading simple chord charts'
      ],
      beginner: [
        'Build chord vocabulary (major/minor)',
        'Learn basic scales and intervals',
        'Understand chord progressions',
        'Master rhythm notation'
      ],
      expert: [
        'Master advanced harmonic analysis',
        'Study counterpoint and voice leading',
        'Compose original material',
        'Analyze complex musical forms'
      ]
    };
    
    return paths[user.level as keyof typeof paths] || paths.beginner;
  };

  const learningPath = getLearningPath();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Music Theory</h1>
          </div>
          <p className="text-gray-600">Understand the fundamentals that will make you a better musician</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
              <span className="text-sm text-orange-700 font-medium">Level: {user.level}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <span className="text-sm text-purple-700 font-medium">{displayTheory.length} topics</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Curriculum adapted for you</span>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-3">Your Learning Path</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learningPath.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-purple-700">
                      <span className="w-5 h-5 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
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
                {displayTheory.filter(t => t.progress === 100).length}
              </p>
              <p className="text-sm text-gray-600">Mastered</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {displayTheory.filter(t => t.progress > 0 && t.progress < 100).length}
              </p>
              <p className="text-sm text-gray-600">Learning</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(displayTheory.reduce((sum, t) => sum + t.progress, 0) / displayTheory.length)}%
              </p>
              <p className="text-sm text-gray-600">Avg Progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {user.level === 'novice' ? '20' : user.level === 'expert' ? '90' : '45'}
              </p>
              <p className="text-sm text-gray-600">Min Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Theory Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTheory.map((topic, index) => {
            const IconComponent = getCategoryIcon(topic.category);
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(topic.category)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{topic.name}</CardTitle>
                        <p className="text-sm text-gray-600">{topic.category}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {topic.description && (
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  )}

                  {/* Difficulty */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Difficulty</span>
                    <div className="flex items-center gap-1">
                      {getDifficultyStars(topic.difficulty)}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{topic.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(index)}`} 
                        style={{ width: `${topic.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Time to Learn */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Time to Learn</span>
                    <span className="text-gray-900">{topic.timeToLearn}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-blue-400 hover:bg-blue-500"
                      onClick={() => handleStudy(topic)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Study
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleQuiz(topic)}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Quiz
                    </Button>
                  </div>

                  {/* Completion Status */}
                  {topic.progress === 100 && (
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

        {/* Interactive Theory Tools */}
        <div className="mt-12 p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Interactive Tools</h2>
          <p className="text-gray-600 mb-6">Practice theory concepts with these interactive tools</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleInteractiveTool('Circle of Fifths')}
            >
              <RotateCcw className="w-6 h-6 mb-2" />
              <span>Circle of Fifths</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleInteractiveTool('Scale Builder')}
            >
              <Layers className="w-6 h-6 mb-2" />
              <span>Scale Builder</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleInteractiveTool('Chord Finder')}
            >
              <Target className="w-6 h-6 mb-2" />
              <span>Chord Finder</span>
            </Button>
          </div>
        </div>

        {/* Daily Theory Challenge */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Daily Theory Challenge</h2>
          <p className="text-gray-600 mb-4">Test your knowledge with today's {user.level}-level challenge</p>
          
          <div className="bg-white/70 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-900 mb-2">
              {user.level === 'novice' && 'What are the names of the six guitar strings from lowest to highest?'}
              {user.level === 'beginner' && 'What notes make up a G major chord?'}
              {user.level === 'expert' && 'Identify the harmonic function of this progression in C major: Cmaj7 - A7alt - Dm7 - G7'}
              {!['novice', 'beginner', 'expert'].includes(user.level) && 'What is the relative minor of F major?'}
            </h3>
            <p className="text-sm text-gray-600">
              {user.level === 'novice' && 'From thickest to thinnest string'}
              {user.level === 'beginner' && 'List the three notes that form this triad'}
              {user.level === 'expert' && 'Consider both diatonic and chromatic harmonic functions'}
              {!['novice', 'beginner', 'expert'].includes(user.level) && 'Remember the pattern for finding relative minors'}
            </p>
          </div>
          
          <Button 
            className="bg-blue-400 hover:bg-blue-500 text-white"
            onClick={handleDailyChallenge}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Challenge
          </Button>
        </div>
      </div>

      <ActivityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        activityType={modalActivity?.type || 'study'}
        activityData={modalActivity}
      />
    </div>
  );
}