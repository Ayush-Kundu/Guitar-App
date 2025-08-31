import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ActivityModal } from './ActivityModal';
import { EmptyState } from './EmptyState';
import { 
  Music, 
  Play, 
  Pause, 
  Clock, 
  Star, 
  CheckCircle2, 
  Plus,
  Volume2,
  RotateCcw,
  Timer,
  Heart,
  TrendingUp
} from 'lucide-react';

export function Songs() {
  const { user, getFilteredContent } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActivity, setModalActivity] = useState<any>(null);

  if (!user) return null;

  // Get personalized songs based on user level and preferences
  const songs = getFilteredContent('songs');

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600 bg-green-100';
    if (difficulty <= 4) return 'text-yellow-600 bg-yellow-100';
    if (difficulty <= 6) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard', 'Expert', 'Master'];
    return labels[difficulty] || 'Unknown';
  };

  const getProgressColor = (index: number) => {
    const colors = ['bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-red-500'];
    return colors[index % colors.length];
  };

  const getGenreIcon = (genre: string) => {
    switch (genre) {
      case 'classical': return '🎼';
      case 'rock': return '🎸';
      case 'pop': return '🎵';
      case 'blues': return '🎺';
      case 'folk': return '🪕';
      case 'country': return '🤠';
      case 'jazz': return '🎷';
      case 'metal': return '⚡';
      case 'reggae': return '🏝️';
      case 'indie': return '🎨';
      case 'latin': return '💃';
      case 'world': return '🌍';
      default: return '🎵';
    }
  };

  const getGenreColor = (genre: string) => {
    switch (genre) {
      case 'classical': return 'bg-purple-100 text-purple-700';
      case 'rock': return 'bg-red-100 text-red-700';
      case 'pop': return 'bg-pink-100 text-pink-700';
      case 'blues': return 'bg-blue-100 text-blue-700';
      case 'folk': return 'bg-green-100 text-green-700';
      case 'country': return 'bg-yellow-100 text-yellow-700';
      case 'jazz': return 'bg-indigo-100 text-indigo-700';
      case 'metal': return 'bg-gray-100 text-gray-700';
      case 'reggae': return 'bg-emerald-100 text-emerald-700';
      case 'indie': return 'bg-orange-100 text-orange-700';
      case 'latin': return 'bg-rose-100 text-rose-700';
      case 'world': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePractice = (song: any) => {
    setModalActivity({
      type: 'practice',
      activityType: 'song',
      name: `${song.title} - ${song.artist}`,
      description: `Practice playing ${song.title} with chords: ${song.chords.join(', ')}. This ${song.genre} song is perfect for your ${user.level} level.`,
      data: song
    });
    setModalOpen(true);
  };

  const handleStats = (song: any) => {
    setModalActivity({
      type: 'history',
      name: `${song.title} Statistics`,
      data: song
    });
    setModalOpen(true);
  };

  const handleQuickAction = (actionType: string) => {
    if (actionType === 'tuner') {
      setModalActivity({ type: 'tuner' });
    } else if (actionType === 'metronome') {
      setModalActivity({ type: 'metronome' });
    } else if (actionType === 'history') {
      setModalActivity({ type: 'history' });
    }
    setModalOpen(true);
  };

  // Get level-appropriate tips
  const getLevelTips = () => {
    const tips = {
      novice: [
        'Start with simple one or two chord songs',
        'Focus on clean chord changes',
        'Practice strumming slowly and steadily'
      ],
      beginner: [
        'Work on smooth transitions between chords',
        'Try different strumming patterns',
        'Listen to the original songs for timing'
      ],
      expert: [
        'Focus on musical expression and dynamics',
        'Experiment with advanced arrangements',
        'Study the harmonic progressions deeply'
      ]
    };
    
    return tips[user.level as keyof typeof tips] || tips.beginner;
  };

  const levelTips = getLevelTips();

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Personalized Songs</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Songs curated for your {user.level} level and music preferences</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">Level: {user.level}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">{songs.length} songs available</span>
            </div>
            {user.musicPreferences.map((preference, index) => (
              <div key={preference} className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                <span className="text-xs">{getGenreIcon(preference)}</span>
                <span className="text-sm text-green-700 dark:text-green-300 font-medium capitalize">{preference}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Level-specific Tips */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Tips for {user.level} level</h3>
                <ul className="space-y-1">
                  {levelTips.map((tip, index) => (
                    <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions with Popping Add Song Button */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button className="h-16 action-button-pop">
            <div className="text-center">
              <Plus className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Add Song</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => handleQuickAction('tuner')}
          >
            <div className="text-center">
              <Volume2 className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Tuner</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => handleQuickAction('metronome')}
          >
            <div className="text-center">
              <Timer className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Metronome</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => handleQuickAction('history')}
          >
            <div className="text-center">
              <RotateCcw className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Practice Log</span>
            </div>
          </Button>
        </div>

        {songs.length === 0 ? (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
            <CardContent className="p-0">
              <EmptyState
                title="No songs available yet"
                description="We're building a personalized song library for your preferences. Check back soon!"
                actionLabel="Suggest a Song"
                onAction={() => console.log('Suggest song clicked')}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Songs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song, index) => (
                <Card key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm border border-orange-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1 dark:text-white">{song.title}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{song.artist}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(song.difficulty)}`}>
                        {getDifficultyLabel(song.difficulty)}
                      </div>
                    </div>
                    
                    {song.genre && (
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(song.genre)}`}>
                          <span>{getGenreIcon(song.genre)}</span>
                          <span className="capitalize">{song.genre}</span>
                        </span>
                        {user.musicPreferences.includes(song.genre) && (
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        )}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium dark:text-white">{song.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(index)}`} 
                          style={{ width: `${song.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Chords */}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Chords used:</p>
                      <div className="flex flex-wrap gap-1">
                        {song.chords.map((chord: string, chordIndex: number) => (
                          <span 
                            key={chordIndex}
                            className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded"
                          >
                            {chord}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                        onClick={() => handlePractice(song)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Practice
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 dark:border-gray-600 dark:text-gray-300"
                        onClick={() => handleStats(song)}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Stats
                      </Button>
                    </div>

                    {/* Completion Status */}
                    {song.progress === 100 && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium">Mastered!</span>
                        <Star className="w-4 h-4 text-yellow-500 ml-auto" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommended Next Songs */}
            <div className="mt-12 p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Expand Your Repertoire</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Ready for more? Here are some songs from your favorite genres</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.musicPreferences.slice(0, 3).map((genre, index) => (
                  <div key={genre} className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getGenreIcon(genre)}</span>
                      <h3 className="font-medium text-gray-900 dark:text-white capitalize">{genre} Collection</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Discover more {genre} songs perfect for your level</p>
                    <Button size="sm" variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">
                      <Plus className="w-4 h-4 mr-1" />
                      Explore {genre}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
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