import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ActivityModal } from './ActivityModal';
import { VideoPopup } from './VideoPopup';
import { 
  Hand, 
  RotateCcw, 
  TrendingUp, 
  Star,
  Target,
  Activity,
  Award,
  Brain, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  Music, 
  Clock
} from 'lucide-react';
import pianistCharacter from '../assets/20251111_0914_Guitar Character Pianist_remix_01k9syg7bnfa4r2s22f6tzfrz5.png';
import pensiveGuitarCharacter from '../assets/20251111_1235_Pensive Guitar Character_remix_01k9ta1gmxf3cbfn07hcc91esh.png';
import {
  loadProgress
} from '../utils/progressStorage';

interface TechniqueTheoryProps {
  onSectionChange?: (section: string) => void;
  initialTab?: 'technique' | 'theory';
}

export function TechniqueTheory({ onSectionChange, initialTab = 'technique' }: TechniqueTheoryProps) {
  const { user, getFilteredContent } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActivity, setModalActivity] = useState<any>(null);
  const [mainTab, setMainTab] = useState<'technique' | 'theory'>(initialTab);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [practiceType, setPracticeType] = useState<'technique' | 'theory'>('technique');
  const [progressData, setProgressData] = useState<any>(null);
  
  // Update mainTab when initialTab prop changes
  useEffect(() => {
    setMainTab(initialTab);
  }, [initialTab]);

  // Load progress data
  useEffect(() => {
    if (user) {
      setProgressData(loadProgress(user.id));
    }
  }, [user]);

  const refreshProgress = () => {
    if (user) {
      setProgressData(loadProgress(user.id));
    }
  };
  
  // Technique state
  const [techniqueTab, setTechniqueTab] = useState<'chords' | 'strums' | 'plucks' | 'scales'>('chords');
  
  // Theory state
  const [theoryTab, setTheoryTab] = useState<'basics' | 'chords' | 'scales' | 'rhythm'>('basics');

  if (!user) return null;

  // ========== TECHNIQUE LOGIC ==========
  const allTechniques = getFilteredContent('techniques');
  
  // Filter techniques by the selected tab (chords, strums, plucks, scales)
  // The JSON structure has these as subcategories, so we filter by category name
  const getFilteredTechniques = () => {
    const categoryMap: Record<string, string[]> = {
      chords: ['Chords'],
      strums: ['Strums'],
      plucks: ['Plucks'],
      scales: ['Scales']
    };
    
    const categories = categoryMap[techniqueTab];
    return allTechniques.filter((t: any) => 
      categories.some(cat => t.category?.toLowerCase() === cat.toLowerCase())
    );
  };

  const filteredTechniques = getFilteredTechniques().map((t: any) => {
    const techniqueId = t.name.toLowerCase().replace(/\s+/g, '_');
    const stored = progressData?.techniques?.[techniqueId];
    return {
      ...t,
      // Progress starts at 0, only updated through practice
      progress: stored?.progress || 0,
    };
  });

  const handleTechniquePractice = (technique: any) => {
    setSelectedItem(technique);
    setPracticeType('technique');
    setPracticeOpen(true);
  };

  const handleTheoryPractice = (topic: any) => {
    setSelectedItem(topic);
    setPracticeType('theory');
    setPracticeOpen(true);
  };

  const handlePracticeComplete = (minutesPracticed: number, newProgress: number, pointsEarned: number) => {
    refreshProgress();
  };

  const getTechniqueCategoryIcon = (category: string) => {
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

  const getTechniqueCategoryColor = (category: string) => {
    if (category.toLowerCase().includes('chord') || category.toLowerCase().includes('foundation')) {
      return 'text-red-600 bg-red-100';
    } else if (category.toLowerCase().includes('rhythm') || category.toLowerCase().includes('strum')) {
      return 'text-orange-600 bg-orange-100';
    } else if (category.toLowerCase().includes('fingerpicking') || category.toLowerCase().includes('pluck')) {
      return 'text-yellow-600 bg-yellow-100';
    } else {
      return 'text-yellow-600';
    }
  };

  const getTechniqueCategoryBgColor = (category: string) => {
    if (category.toLowerCase().includes('chord') || category.toLowerCase().includes('foundation')) {
      return 'rgb(254, 226, 226)';
    } else if (category.toLowerCase().includes('rhythm') || category.toLowerCase().includes('strum')) {
      return 'rgb(255, 237, 213)';
    } else if (category.toLowerCase().includes('fingerpicking') || category.toLowerCase().includes('pluck')) {
      return 'rgb(254, 249, 195)';
    } else {
      return 'rgb(255, 249, 219)';
    }
  };

  const getTechniqueProgressColor = (category: string) => {
    if (category.toLowerCase().includes('chord') || category.toLowerCase().includes('foundation')) {
      return 'rgb(239, 68, 68)';
    } else if (category.toLowerCase().includes('rhythm') || category.toLowerCase().includes('strum')) {
      return 'rgb(249, 115, 22)';
    } else if (category.toLowerCase().includes('fingerpicking') || category.toLowerCase().includes('pluck')) {
      return 'rgb(234, 179, 8)';
    } else {
      return 'rgb(255, 209, 71)';
    }
  };

  // ========== THEORY LOGIC ==========
  const allTheory = getFilteredContent('theory');
  
  // Filter theory by the selected tab (basics, chords, scales, rhythm)
  const getFilteredTheory = () => {
    const categoryMap: Record<string, string[]> = {
      basics: ['Basics'],
      chords: ['Chords'],
      scales: ['Scales'],
      rhythm: ['Rhythm']
    };
    
    const categories = categoryMap[theoryTab];
    return allTheory.filter((t: any) => 
      categories.some(cat => t.category?.toLowerCase() === cat.toLowerCase())
    );
  };

  const filteredTheory = getFilteredTheory().map((t: any) => {
    const theoryId = t.name.toLowerCase().replace(/\s+/g, '_');
    const stored = progressData?.theory?.[theoryId];
    return {
      ...t,
      // Progress starts at 0, only updated through practice
      progress: stored?.progress || 0,
    };
  });

  const getTheoryCategoryIcon = (category: string) => {
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

  const getTheoryCategoryColor = (category: string) => {
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

  const getTheoryProgressColor = (category: string) => {
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
      switch (theoryTab) {
        case 'basics': return 'rgb(59, 130, 246)';
        case 'chords': return 'rgb(16, 185, 129)';
        case 'scales': return 'rgb(168, 85, 247)';
        case 'rhythm': return 'rgb(99, 102, 241)';
        default: return 'rgb(59, 130, 246)';
      }
    }
  };

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
      {/* Top-Level Navigation: Technique | Theory */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-2 border-2 border-gray-200 dark:border-slate-600">
          <div className="flex gap-2">
            <button
              onClick={() => setMainTab('technique')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${mainTab === 'technique' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: mainTab === 'technique' ? 'rgb(239, 68, 68)' : 'transparent',
                color: mainTab === 'technique' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Technique
            </button>
            <button
              onClick={() => setMainTab('theory')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${mainTab === 'theory' ? 'shadow-md' : ''}`}
              style={{
                backgroundColor: mainTab === 'theory' ? 'rgb(59, 130, 246)' : 'transparent',
                color: mainTab === 'theory' ? 'white' : 'rgb(107, 114, 128)'
              }}
            >
              Theory
            </button>
          </div>
        </div>
      </div>

      {/* TECHNIQUE CONTENT */}
      {mainTab === 'technique' && (
        <>
          {/* Pianist Character Image */}
          <div className="max-w-6xl mx-auto flex justify-center relative" style={{ zIndex: 20, marginBottom: '-70px' }}>
            <img
              src={pianistCharacter}
              alt="Pianist character"
              className="w-64 h-auto object-contain drop-shadow-lg"
            />
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Technique Navigation Tabs */}
            <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-1.5 sm:p-2 relative overflow-hidden" style={{ border: '2.5px solid rgb(237, 237, 237)', zIndex: 30 }}>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => setTechniqueTab('chords')}
                  className={`flex-1 min-w-0 py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 truncate ${techniqueTab === 'chords' ? 'shadow-md' : ''}`}
                  style={{
                    backgroundColor: techniqueTab === 'chords' ? 'rgb(239, 68, 68)' : 'transparent',
                    color: techniqueTab === 'chords' ? 'white' : 'rgb(107, 114, 128)'
                  }}
                >
                  Chords
                </button>
                <button
                  onClick={() => setTechniqueTab('strums')}
                  className={`flex-1 min-w-0 py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 truncate ${techniqueTab === 'strums' ? 'shadow-md' : ''}`}
                  style={{
                    backgroundColor: techniqueTab === 'strums' ? 'rgb(249, 115, 22)' : 'transparent',
                    color: techniqueTab === 'strums' ? 'white' : 'rgb(107, 114, 128)'
                  }}
                >
                  Strums
                </button>
                <button
                  onClick={() => setTechniqueTab('plucks')}
                  className={`flex-1 min-w-0 py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 truncate ${techniqueTab === 'plucks' ? 'shadow-md' : ''}`}
                  style={{
                    backgroundColor: techniqueTab === 'plucks' ? 'rgb(234, 179, 8)' : 'transparent',
                    color: techniqueTab === 'plucks' ? 'white' : 'rgb(107, 114, 128)'
                  }}
                >
                  Plucks
                </button>
                <button
                  onClick={() => setTechniqueTab('scales')}
                  className={`flex-1 min-w-0 py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 truncate ${techniqueTab === 'scales' ? 'shadow-md' : ''}`}
                  style={{
                    backgroundColor: techniqueTab === 'scales' ? 'rgb(255, 209, 71)' : 'transparent',
                    color: techniqueTab === 'scales' ? 'white' : 'rgb(107, 114, 128)'
                  }}
                >
                  Scales
                </button>
              </div>
            </div>

            {/* Techniques Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-2">
              {filteredTechniques.map((technique, index) => {
                const IconComponent = getTechniqueCategoryIcon(technique.category);
                return (
                  <Card 
                    key={index} 
                    onClick={() => handleTechniquePractice(technique)}
                    className="bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer" 
                    style={{ border: '2.5px solid rgb(237, 237, 237)' }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTechniqueCategoryColor(technique.category)}`}
                            style={{ backgroundColor: getTechniqueCategoryBgColor(technique.category) }}
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
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{technique.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${technique.progress}%`, backgroundColor: getTechniqueProgressColor(technique.category) }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* THEORY CONTENT */}
      {mainTab === 'theory' && (
        <div className="max-w-6xl mx-auto">
          {/* Weekly Theory Goal */}
          <Card
            className="mb-8 rounded-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden backdrop-blur-sm bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 border-0"
            style={{ border: '2px solid rgb(237, 237, 237)', borderLeft: '3.5px solid rgb(237, 237, 237)', borderBottom: '3.5px solid rgb(237, 237, 237)', borderRight: '3.5px solid rgb(237, 237, 237)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
          >
            <CardContent className="p-6 bg-transparent">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">Weekly Theory Goal</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {allTheory.filter((t: any) => (progressData?.theory?.[t.name?.toLowerCase().replace(/\s+/g, '_')]?.progress || 0) >= 100).length} / {allTheory.length} topics
                </div>
              </div>
              <div className="relative w-full">
                <div className="h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((allTheory.filter((t: any) => (progressData?.theory?.[t.name?.toLowerCase().replace(/\s+/g, '_')]?.progress || 0) >= 100).length / allTheory.length) * 100)}%`,
                      backgroundColor: 'rgb(59, 130, 246)'
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pensive Guitar Character Image */}
          <div className="max-w-6xl mx-auto flex justify-center relative mb-8" style={{ zIndex: 20, marginBottom: '-20px' }}>
            <img
              src={pensiveGuitarCharacter}
              alt="Pensive guitar character"
              className="w-96 h-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Theory Navigation Tabs */}
          <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-1.5 sm:p-2 relative overflow-hidden" style={{ border: '2.5px solid rgb(237, 237, 237)', zIndex: 30 }}>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setTheoryTab('basics')}
                className={`flex-1 min-w-0 py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 truncate ${theoryTab === 'basics' ? 'shadow-md' : ''}`}
                style={{
                  backgroundColor: theoryTab === 'basics' ? 'rgb(59, 130, 246)' : 'transparent',
                  color: theoryTab === 'basics' ? 'white' : 'rgb(107, 114, 128)'
                }}
              >
                Basics
              </button>
              <button
                onClick={() => setTheoryTab('chords')}
                className={`flex-1 min-w-0 py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 truncate ${theoryTab === 'chords' ? 'shadow-md' : ''}`}
                style={{
                  backgroundColor: theoryTab === 'chords' ? 'rgb(16, 185, 129)' : 'transparent',
                  color: theoryTab === 'chords' ? 'white' : 'rgb(107, 114, 128)'
                }}
              >
                Chords
              </button>
              <button
                onClick={() => setTheoryTab('scales')}
                className={`flex-1 min-w-0 py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 truncate ${theoryTab === 'scales' ? 'shadow-md' : ''}`}
                style={{
                  backgroundColor: theoryTab === 'scales' ? 'rgb(168, 85, 247)' : 'transparent',
                  color: theoryTab === 'scales' ? 'white' : 'rgb(107, 114, 128)'
                }}
              >
                Scales
              </button>
              <button
                onClick={() => setTheoryTab('rhythm')}
                className={`flex-1 min-w-0 py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 truncate ${theoryTab === 'rhythm' ? 'shadow-md' : ''}`}
                style={{
                  backgroundColor: theoryTab === 'rhythm' ? 'rgb(99, 102, 241)' : 'transparent',
                  color: theoryTab === 'rhythm' ? 'white' : 'rgb(107, 114, 128)'
                }}
              >
                Rhythm
              </button>
            </div>
          </div>

          {/* Theory Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-2">
            {filteredTheory.map((topic, index) => {
              const IconComponent = getTheoryCategoryIcon(topic.category);
              return (
                <Card 
                  key={index} 
                  onClick={() => handleTheoryPractice(topic)}
                  className="bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer" 
                  style={{ border: '2.5px solid rgb(237, 237, 237)' }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTheoryCategoryColor(topic.category)}`}>
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
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{topic.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${topic.progress}%`, backgroundColor: getTheoryProgressColor(topic.category) }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <ActivityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        activityType={modalActivity?.type || 'practice'}
        activityData={modalActivity}
      />

      {/* Video Popup */}
      {selectedItem && (
        <VideoPopup
          isOpen={practiceOpen}
          onClose={() => {
            setPracticeOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          type={practiceType}
          userId={user.id}
          onComplete={handlePracticeComplete}
        />
      )}
    </div>
  );
}



