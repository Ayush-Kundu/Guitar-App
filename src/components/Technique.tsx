import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ActivityModal } from './ActivityModal';
import { 
  getDailyRoutine,
  loadProgress,
  TECHNIQUE_GOALS
} from '../utils/progressStorage';
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
import pianistCharacter from '../assets/20251111_0914_Guitar Character Pianist_remix_01k9syg7bnfa4r2s22f6tzfrz5.png';

interface TechniqueProps {
  onSectionChange?: (section: string) => void;
}

export function Technique({ onSectionChange }: TechniqueProps) {
  const { user, getFilteredContent } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActivity, setModalActivity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'chords' | 'strums' | 'plucks' | 'scales'>('chords');
  const [dailyRoutine, setDailyRoutine] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);

  // Load daily routine and progress data
  useEffect(() => {
    if (user) {
      setDailyRoutine(getDailyRoutine(user.id));
      setProgressData(loadProgress(user.id));
    }
  }, [user]);

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

  // Filter techniques by active tab
  const getFilteredTechniques = () => {
    const categoryMap = {
      chords: ['Chords', 'Foundation'],
      strums: ['Rhythm', 'Strumming'],
      plucks: ['Fingerpicking', 'Plucking'],
      scales: ['Lead', 'Scales', 'Advanced', 'Master']
    };
    
    const categories = categoryMap[activeTab];
    return displayTechniques.filter(t => 
      categories.some(cat => t.category.toLowerCase().includes(cat.toLowerCase()))
    );
  };

  // Get filtered techniques with stored progress (persists, doesn't reset)
  const filteredTechniques = getFilteredTechniques().map((t: any) => {
    const techniqueId = t.name.toLowerCase().replace(/\s+/g, '_');
    const stored = progressData?.techniques?.[techniqueId];
    return {
      ...t,
      // Progress persists - only updated through practice
      progress: stored?.progress || 0,
    };
  });

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
    // Match colors to progress bars
    if (category.toLowerCase().includes('chord') || category.toLowerCase().includes('foundation')) {
      return 'text-red-600 bg-red-100'; // Red for Chords
    } else if (category.toLowerCase().includes('rhythm') || category.toLowerCase().includes('strum')) {
      return 'text-orange-600 bg-orange-100'; // Orange for Strums
    } else if (category.toLowerCase().includes('fingerpicking') || category.toLowerCase().includes('pluck')) {
      return 'text-yellow-600 bg-yellow-100'; // Yellow for Plucks
    } else {
      return 'text-yellow-600'; // Yellow text for Scales/Lead/Advanced/Master (background via inline style)
    }
  };

  const getCategoryBgColor = (category: string) => {
    // Return background color for inline styles
    if (category.toLowerCase().includes('chord') || category.toLowerCase().includes('foundation')) {
      return 'rgb(254, 226, 226)'; // Light red
    } else if (category.toLowerCase().includes('rhythm') || category.toLowerCase().includes('strum')) {
      return 'rgb(255, 237, 213)'; // Light orange
    } else if (category.toLowerCase().includes('fingerpicking') || category.toLowerCase().includes('pluck')) {
      return 'rgb(254, 249, 195)'; // Light yellow
    } else {
      return 'rgb(255, 249, 219)'; // Light yellow matching rgb(255, 209, 71)
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
    // Match colors to the practice routine bars
    if (category.toLowerCase().includes('chord') || category.toLowerCase().includes('foundation')) {
      return 'rgb(239, 68, 68)'; // Red for Chords
    } else if (category.toLowerCase().includes('rhythm') || category.toLowerCase().includes('strum')) {
      return 'rgb(249, 115, 22)'; // Orange for Strums
    } else if (category.toLowerCase().includes('fingerpicking') || category.toLowerCase().includes('pluck')) {
      return 'rgb(234, 179, 8)'; // Yellow for Plucks
    } else {
      return 'rgb(255, 209, 71)'; // Yellow for Scales/Lead/Advanced/Master
    }
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
        focus: { title: 'Basic Chord Practice (10 min)', description: 'Practice holding and switc/hing between basic chords' },
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
      {/* Practice Routine - Resets Daily */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm" style={{ border: '2.5px solid rgb(237, 237, 237)' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Today's Practice Routine</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 w-16">Chords</span>
              <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full" style={{ 
                  width: `${Math.min(100, ((dailyRoutine?.chordsCompleted || 0) / (dailyRoutine?.chordsGoal || TECHNIQUE_GOALS.chords)) * 100)}%`, 
                  backgroundColor: 'rgb(239, 68, 68)' 
                }}></div>
              </div>
              <span className="text-gray-600 w-16 text-right">{dailyRoutine?.chordsCompleted || 0}min</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 w-16">Strums</span>
              <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full" style={{ 
                  width: `${Math.min(100, ((dailyRoutine?.strumsCompleted || 0) / (dailyRoutine?.strumsGoal || TECHNIQUE_GOALS.strums)) * 100)}%`, 
                  backgroundColor: 'rgb(249, 115, 22)' 
                }}></div>
              </div>
              <span className="text-gray-600 w-16 text-right">{dailyRoutine?.strumsCompleted || 0}min</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 w-16">Plucks</span>
              <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full" style={{ 
                  width: `${Math.min(100, ((dailyRoutine?.plucksCompleted || 0) / (dailyRoutine?.plucksGoal || TECHNIQUE_GOALS.plucks)) * 100)}%`, 
                  backgroundColor: 'rgb(234, 179, 8)' 
                }}></div>
              </div>
              <span className="text-gray-600 w-16 text-right">{dailyRoutine?.plucksCompleted || 0}min</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 w-16">Scales</span>
              <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full" style={{ 
                  width: `${Math.min(100, ((dailyRoutine?.scalesCompleted || 0) / (dailyRoutine?.scalesGoal || TECHNIQUE_GOALS.scales)) * 100)}%`, 
                  backgroundColor: 'rgb(255, 209, 71)' 
                }}></div>
              </div>
              <span className="text-gray-600 w-16 text-right">{dailyRoutine?.scalesCompleted || 0}min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pianist Character Image - Overlaying */}
      <div className="max-w-6xl mx-auto flex justify-center relative" style={{ zIndex: 20, marginTop: '-120px', marginBottom: '-70px' }}>
        <img 
          src={pianistCharacter} 
          alt="Pianist character" 
          className="w-64 h-auto object-contain drop-shadow-lg"
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-2 relative" style={{ border: '2.5px solid rgb(237, 237, 237)', zIndex: 30 }}>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('chords')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'chords' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: activeTab === 'chords' ? 'rgb(239, 68, 68)' : 'transparent',
                color: activeTab === 'chords' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Chords
            </button>
            <button
              onClick={() => setActiveTab('strums')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'strums' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: activeTab === 'strums' ? 'rgb(249, 115, 22)' : 'transparent',
                color: activeTab === 'strums' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Strums
            </button>
            <button
              onClick={() => setActiveTab('plucks')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'plucks' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: activeTab === 'plucks' ? 'rgb(234, 179, 8)' : 'transparent',
                color: activeTab === 'plucks' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Plucks
            </button>
            <button
              onClick={() => setActiveTab('scales')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'scales' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: activeTab === 'scales' ? 'rgb(255, 209, 71)' : 'transparent',
                color: activeTab === 'scales' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Scales
            </button>
          </div>
        </div>

        {/* Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechniques.map((technique, index) => {
            const IconComponent = getCategoryIcon(technique.category);
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow" style={{ border: '2.5px solid rgb(237, 237, 237)' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(technique.category)}`}
                        style={{ backgroundColor: getCategoryBgColor(technique.category) }}
                      >
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
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{technique.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full" 
                        style={{ width: `${technique.progress}%`, backgroundColor: getProgressColor(technique.category) }}
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
        activityType={modalActivity?.type || 'practice'}
        activityData={modalActivity}
      />
    </div>
  );
}