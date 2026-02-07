import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ActivityModal } from './ActivityModal';
import { 
  getDailyTheoryRoutine,
  loadProgress,
  THEORY_GOALS
} from '../utils/progressStorage';
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
  GraduationCap,
  TrendingUp
} from 'lucide-react';

interface TheoryProps {
  onSectionChange?: (section: string) => void;
}

export function Theory({ onSectionChange }: TheoryProps) {
  const { user, getFilteredContent } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActivity, setModalActivity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'basics' | 'chords' | 'scales' | 'rhythm'>('basics');
  const [dailyRoutine, setDailyRoutine] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);

  // Load daily routine and progress data
  useEffect(() => {
    if (user) {
      setDailyRoutine(getDailyTheoryRoutine(user.id));
      setProgressData(loadProgress(user.id));
    }
  }, [user]);

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

  // Filter theory topics by active tab
  const getFilteredTheory = () => {
    const categoryMap = {
      basics: ['Basics'],
      chords: ['Chords'],
      scales: ['Scales'],
      rhythm: ['Rhythm']
    };
    
    const categories = categoryMap[activeTab];
    return displayTheory.filter(t => 
      categories.some(cat => t.category.toLowerCase().includes(cat.toLowerCase()))
    );
  };

  // Get filtered theory with stored progress (persists, doesn't reset)
  const filteredTheory = getFilteredTheory().map((t: any) => {
    const theoryId = t.name.toLowerCase().replace(/\s+/g, '_');
    const stored = progressData?.theory?.[theoryId];
    return {
      ...t,
      // Progress persists - only updated through practice
      progress: stored?.progress || 0,
    };
  });

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
      case 'Keys': return 'text-teal-600 bg-teal-100';
      case 'Rhythm': return 'text-indigo-600 bg-indigo-100';
      case 'Notation': return 'text-cyan-600 bg-cyan-100';
      case 'Harmony': return 'text-violet-600 bg-violet-100';
      case 'Advanced': return 'text-blue-600 bg-blue-100';
      case 'Composition': return 'text-emerald-600 bg-emerald-100';
      case 'Master': return 'text-purple-600 bg-purple-100';
      default: return 'text-blue-600 bg-blue-100';
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



  const getProgressColor = (category: string) => {
    // Match colors to the theory tab colors
    const cat = category.toLowerCase();
    if (cat === 'basics' || cat.includes('basic')) {
      return 'rgb(59, 130, 246)'; // Blue for Basics
    } else if (cat === 'chords' || cat.includes('chord')) {
      return 'rgb(16, 185, 129)'; // Green for Chords
    } else if (cat === 'scales' || cat.includes('scale')) {
      return 'rgb(168, 85, 247)'; // Purple for Scales
    } else if (cat === 'rhythm' || cat.includes('rhythm')) {
      return 'rgb(99, 102, 241)'; // Indigo/Deep blue for Rhythm
    } else {
      // Default based on which tab is active
      switch (activeTab) {
        case 'basics': return 'rgb(59, 130, 246)';
        case 'chords': return 'rgb(16, 185, 129)';
        case 'scales': return 'rgb(168, 85, 247)';
        case 'rhythm': return 'rgb(99, 102, 241)';
        default: return 'rgb(59, 130, 246)';
      }
    }
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
        {/* Today's Practice Routine - Resets Daily */}
        <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm mb-8" style={{ border: '2.5px solid rgb(237, 237, 237)' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Today's Practice Routine</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 w-20">Basics</span>
              <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full" style={{ 
                  width: `${Math.min(100, ((dailyRoutine?.basicsCompleted || 0) / (dailyRoutine?.basicsGoal || THEORY_GOALS.basics)) * 100)}%`, 
                  backgroundColor: 'rgb(59, 130, 246)' 
                }}></div>
              </div>
              <span className="text-gray-600 w-16 text-right">{dailyRoutine?.basicsCompleted || 0}min</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 w-20">Chords</span>
              <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full" style={{ 
                  width: `${Math.min(100, ((dailyRoutine?.chordsCompleted || 0) / (dailyRoutine?.chordsGoal || THEORY_GOALS.chords)) * 100)}%`, 
                  backgroundColor: 'rgb(16, 185, 129)' 
                }}></div>
              </div>
              <span className="text-gray-600 w-16 text-right">{dailyRoutine?.chordsCompleted || 0}min</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 w-20">Scales</span>
              <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full" style={{ 
                  width: `${Math.min(100, ((dailyRoutine?.scalesCompleted || 0) / (dailyRoutine?.scalesGoal || THEORY_GOALS.scales)) * 100)}%`, 
                  backgroundColor: 'rgb(168, 85, 247)' 
                }}></div>
              </div>
              <span className="text-gray-600 w-16 text-right">{dailyRoutine?.scalesCompleted || 0}min</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 w-20">Rhythm</span>
              <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full" style={{ 
                  width: `${Math.min(100, ((dailyRoutine?.rhythmCompleted || 0) / (dailyRoutine?.rhythmGoal || THEORY_GOALS.rhythm)) * 100)}%`, 
                  backgroundColor: 'rgb(99, 102, 241)' 
                }}></div>
              </div>
              <span className="text-gray-600 w-16 text-right">{dailyRoutine?.rhythmCompleted || 0}min</span>
            </div>
          </div>
        </div>

        {/* Weekly Theory Goal */}
        <Card
          className="mb-8 rounded-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden backdrop-blur-sm bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 border-0"
          style={{ border: '2px solid rgb(237, 237, 237)', borderLeft: '3.5px solid rgb(237, 237, 237)', borderBottom: '3.5px solid rgb(237, 237, 237)', borderRight: '3.5px solid rgb(237, 237, 237)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
        >
          <CardContent className="p-6 bg-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">Weekly Theory Goal</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {displayTheory.filter(t => t.progress === 100).length} / {displayTheory.length} topics
              </div>
            </div>
            <div className="relative w-full">
              <div className="h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                {/* Absolute segment fills with color blocks - fills entire bar */}
                <div
                  className="absolute top-0 left-0 h-full"
                  style={{
                    width: 'calc(20% - 1px)',
                    backgroundColor: '#10b981',
                    borderRadius: '8px',
                    border: '1px solid #059669',
                    borderBottomWidth: '2px'
                  }}
                />
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: 'calc(20% + 1px)',
                    width: 'calc(20% - 2px)',
                    backgroundColor: '#14b8a6',
                    borderRadius: '8px',
                    border: '1px solid #0d9488',
                    borderBottomWidth: '2px'
                  }}
                />
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: 'calc(40% + 2px)',
                    width: 'calc(20% - 2px)',
                    backgroundColor: '#06b6d4',
                    borderRadius: '8px',
                    border: '1px solid #0891b2',
                    borderBottomWidth: '2px'
                  }}
                />
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: 'calc(60% + 3px)',
                    width: 'calc(20% - 2px)',
                    backgroundColor: '#3b82f6',
                    borderRadius: '8px',
                    border: '1px solid #2563eb',
                    borderBottomWidth: '2px'
                  }}
                />
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: 'calc(80% + 4px)',
                    width: 'calc(20% - 1px)',
                    backgroundColor: '#8b5cf6',
                    borderRadius: '8px',
                    border: '1px solid #7c3aed',
                    borderBottomWidth: '2px'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-2 relative" style={{ border: '2.5px solid rgb(237, 237, 237)', zIndex: 30 }}>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('basics')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'basics' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: activeTab === 'basics' ? 'rgb(59, 130, 246)' : 'transparent',
                color: activeTab === 'basics' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Basics
            </button>
            <button
              onClick={() => setActiveTab('chords')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'chords' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: activeTab === 'chords' ? 'rgb(16, 185, 129)' : 'transparent',
                color: activeTab === 'chords' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Chords
            </button>
            <button
              onClick={() => setActiveTab('scales')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'scales' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: activeTab === 'scales' ? 'rgb(168, 85, 247)' : 'transparent',
                color: activeTab === 'scales' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Scales
            </button>
            <button
              onClick={() => setActiveTab('rhythm')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'rhythm' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: activeTab === 'rhythm' ? 'rgb(99, 102, 241)' : 'transparent',
                color: activeTab === 'rhythm' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Rhythm
            </button>
          </div>
        </div>

        {/* Theory Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheory.map((topic, index) => {
            const IconComponent = getCategoryIcon(topic.category);
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow" style={{ border: '2.5px solid rgb(237, 237, 237)' }}>
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
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{topic.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full" 
                        style={{ width: `${topic.progress}%`, backgroundColor: getProgressColor(topic.category) }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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