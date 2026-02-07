import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ActivityModal } from './ActivityModal';
import { EmptyState } from './EmptyState';
import { SongPractice } from './SongPractice';
import { Dialog, DialogContent } from './ui/dialog';
import { 
  Play, 
  Plus,
  Volume2,
  RotateCcw,
  Timer,
  Music,
  Check,
  X,
  Search
} from 'lucide-react';
import { Badge } from './ui/badge';
import { SkillProgressBar } from './SkillProgressBar';
import guitarCelebration from '../assets/20251110_1336_Guitar Character Celebration_remix_01k9qv39xaenxbhjcq4ym616ha.png';
import { 
  getAllSongProgress, 
  getWeeklyGoals, 
  getSelectedSongs,
  addSelectedSong,
  removeSelectedSong,
  isSelectedSong,
  updateSongProgress,
  SongProgress as StoredSongProgress,
  SelectedSong
} from '../utils/progressStorage';
import { getAccurateSongDuration } from '../utils/songDataService';
import guitarContent from '../data/guitar-content.json';

export function Songs() {
  const { user, getFilteredContent, syncProfileToSupabase } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActivity, setModalActivity] = useState<any>(null);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [songProgress, setSongProgress] = useState<Record<string, StoredSongProgress>>({});
  const [weeklyGoals, setWeeklyGoals] = useState<any>(null);
  const [userSelectedSongs, setUserSelectedSongs] = useState<SelectedSong[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [songToRemove, setSongToRemove] = useState<{ id: string; title: string } | null>(null);

  const refreshData = () => {
    if (user) {
      console.log('🔄 refreshData called for user:', user.id);
      const progress = getAllSongProgress(user.id);
      console.log('🔄 refreshData - getAllSongProgress returned:', progress);
      setSongProgress(progress);
      setWeeklyGoals(getWeeklyGoals(user.id));
      setUserSelectedSongs(getSelectedSongs(user.id));
    } else {
      console.warn('⚠️ refreshData called but no user!');
    }
  };

  // Load progress on mount and when songs change
  useEffect(() => {
    refreshData();
  }, [user]);

  // Refresh when practice modal closes
  useEffect(() => {
    if (!practiceOpen) {
      console.log('🔄 Practice modal closed, refreshing data...');
      refreshData();
    }
  }, [practiceOpen]);

  // Debug: Log when songProgress state changes
  useEffect(() => {
    console.log('📊 songProgress state updated:', songProgress);
    // Also log what's directly in localStorage for comparison
    if (user) {
      const directCheck = getAllSongProgress(user.id);
      console.log('📊 Direct localStorage check:', directCheck);
    }
  }, [songProgress, user]);

  if (!user) return null;

  // Get all available songs from catalog (based on user level and preferences)
  // First try filtered content, then fallback to all songs for user's level
  const getAvailableSongs = () => {
    const filteredSongs = getFilteredContent('songs');
    if (filteredSongs && filteredSongs.length > 0) {
      return filteredSongs;
    }
    
    // Fallback: get all songs for user's level regardless of preferences
    try {
      const levelContent = guitarContent.songs[user.level as keyof typeof guitarContent.songs];
      if (!levelContent) return [];
      
      const allSongs: any[] = [];
      Object.values(levelContent).forEach((genreSongs: any) => {
        if (Array.isArray(genreSongs)) {
          allSongs.push(...genreSongs);
        }
      });
      return allSongs;
    } catch (error) {
      console.error('Error loading songs:', error);
      return [];
    }
  };
  
  const catalogSongs = getAvailableSongs();

  // Only show songs the user has selected to learn (with progress data)
  const songs = userSelectedSongs.map(selected => {
    const progress = songProgress[selected.songId];
    console.log(`📀 Song "${selected.title}" (${selected.songId}): stored progress =`, progress);
    return {
      ...selected,
      progress: progress?.progress || 0, // Always starts at 0, only updated through practice
      totalMinutes: progress?.totalMinutes || 0,
      timesPlayed: progress?.timesPlayed || 0,
    };
  });

  // Filter catalog songs based on search only (music preferences are already applied by getFilteredContent)
  const filteredCatalogSongs = catalogSongs.filter(song => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
           song.title.toLowerCase().includes(query) || 
           song.artist.toLowerCase().includes(query) ||
           song.genre.toLowerCase().includes(query);
    return matchesSearch;
  });

  const weeklyGoalMinutes = weeklyGoals?.songGoalMinutes || 140;
  const minutesThisWeek = weeklyGoals?.songCompletedMinutes || 0;
  const weeklyPct = Math.min(100, Math.round((minutesThisWeek / weeklyGoalMinutes) * 100));
  const displayWeeklyPct = weeklyPct;

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

  // Randomized colors for each song card (progress bars and badges)
  const cardColors = [
    { progress: 'rgb(99, 102, 241)', badge: 'rgba(99, 102, 241, 0.15)', badgeText: 'rgb(67, 56, 202)' },    // Indigo
    { progress: 'rgb(168, 85, 247)', badge: 'rgba(168, 85, 247, 0.15)', badgeText: 'rgb(126, 34, 206)' },   // Purple
    { progress: 'rgb(236, 72, 153)', badge: 'rgba(236, 72, 153, 0.15)', badgeText: 'rgb(190, 24, 93)' },    // Pink
    { progress: 'rgb(34, 197, 94)', badge: 'rgba(34, 197, 94, 0.15)', badgeText: 'rgb(21, 128, 61)' },      // Green
    { progress: 'rgb(14, 165, 233)', badge: 'rgba(14, 165, 233, 0.15)', badgeText: 'rgb(3, 105, 161)' },    // Sky blue
    { progress: 'rgb(249, 115, 22)', badge: 'rgba(249, 115, 22, 0.15)', badgeText: 'rgb(194, 65, 12)' },    // Orange
    { progress: 'rgb(234, 179, 8)', badge: 'rgba(234, 179, 8, 0.15)', badgeText: 'rgb(161, 98, 7)' },       // Yellow
    { progress: 'rgb(6, 182, 212)', badge: 'rgba(6, 182, 212, 0.15)', badgeText: 'rgb(14, 116, 144)' },     // Cyan
    { progress: 'rgb(139, 92, 246)', badge: 'rgba(139, 92, 246, 0.15)', badgeText: 'rgb(109, 40, 217)' },   // Violet
    { progress: 'rgb(20, 184, 166)', badge: 'rgba(20, 184, 166, 0.15)', badgeText: 'rgb(13, 148, 136)' },   // Teal
  ];

  const getCardColors = (index: number) => {
    return cardColors[index % cardColors.length];
  };

  const handlePractice = (song: any) => {
    console.log('🎯 handlePractice called with song:', song);
    console.log('🎯 song.songId:', song.songId);
    // Ensure songId is set - should come from userSelectedSongs
    const songWithId = {
      ...song,
      songId: song.songId || `${song.title.toLowerCase().replace(/\s+/g, '_')}_${song.artist.toLowerCase().replace(/\s+/g, '_')}`
    };
    console.log('🎯 songWithId:', songWithId);
    setSelectedSong(songWithId);
    setPracticeOpen(true);
  };

  const handlePracticeComplete = (
    minutesPracticed: number, 
    progressPercent: number,
    songInfo: { songId: string; title: string; artist: string; genre: string }
  ) => {
    console.log('🎸 Practice complete callback received:', { minutesPracticed, progressPercent, songInfo });
    
    if (!user) {
      console.error('❌ No user found!');
      return;
    }
    
    console.log('📝 Calling updateSongProgress with:', {
      userId: user.id,
      songId: songInfo.songId,
      title: songInfo.title,
      progressPercent,
      minutesPracticed
    });
    
    // Update the song progress in storage
    const updatedProgress = updateSongProgress(
      user.id,
      songInfo.songId,
      songInfo.title,
      songInfo.artist,
      songInfo.genre,
      progressPercent,
      minutesPracticed
    );
    
    console.log('✅ Updated song progress returned:', updatedProgress);
    console.log('✅ updatedProgress.progress =', updatedProgress.progress);
    
    // Update local state immediately with the new progress
    setSongProgress(prev => {
      const newState = {
        ...prev,
        [songInfo.songId]: updatedProgress
      };
      console.log('📊 New songProgress state:', newState);
      console.log('📊 Song progress for this songId:', newState[songInfo.songId]);
      return newState;
    });
    
    // Also update userSelectedSongs to force a re-render of the songs list
    setUserSelectedSongs(prev => [...prev]);
    
    // Force refresh immediately AND after a delay to ensure UI updates
    refreshData();
    setTimeout(() => {
      refreshData();
      console.log('🔄 Data refreshed (delayed)');
      // Log the current state of songProgress after refresh
      const currentProgress = getAllSongProgress(user.id);
      console.log('🔄 Current songProgress from storage:', currentProgress);
    }, 300);
    
    // Sync updated points, compete level, and streak to Supabase
    syncProfileToSupabase();
  };

  const handleAddFromCatalog = (song: any) => {
    if (!user) return;
    
    // Use accurate duration from song data if available
    const accurateDuration = getAccurateSongDuration(song.title, song.duration || '3:00');
    
    addSelectedSong(user.id, {
      title: song.title,
      artist: song.artist,
      genre: song.genre,
      chords: song.chords || [],
      bpm: song.bpm || 120,
      duration: accurateDuration,
      difficulty: song.difficulty || 2,
    });
    refreshData();
  };

  const handleRemoveSong = (songId: string, songTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setSongToRemove({ id: songId, title: songTitle });
    setRemoveConfirmOpen(true);
  };

  const confirmRemoveSong = () => {
    if (!user || !songToRemove) return;
    removeSelectedSong(user.id, songToRemove.id);
    refreshData();
    setRemoveConfirmOpen(false);
    setSongToRemove(null);
  };

  const cancelRemoveSong = () => {
    setRemoveConfirmOpen(false);
    setSongToRemove(null);
  };

  const isSongSelected = (song: any): boolean => {
    if (!user) return false;
    const songId = `${song.title.toLowerCase().replace(/\s+/g, '_')}_${song.artist.toLowerCase().replace(/\s+/g, '_')}`;
    return isSelectedSong(user.id, songId);
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

  // Removed level-specific tips per request

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
      <div className="max-w-6xl mx-auto">

        {/* Quick Actions over Celebration Image */}
        <div className="relative mx-auto" style={{ width: '320px', maxHeight: '160px', marginBottom: '100px', zIndex: 10 }}>
          <img 
            src={guitarCelebration} 
            alt="Guitar celebration" 
            className="w-full h-full object-contain rounded-2xl drop-shadow-sm"
            style={{ maxHeight: '335px' }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <Button className="w-16 h-16 flex items-center justify-center rounded-xl p-1" style={{ transform: 'rotate(-16deg)', marginTop: '180px', marginLeft: '-5px', backgroundColor: 'rgb(255, 67, 25)', border: '2px solid rgb(239, 68, 68)', borderBottom: '6px solid rgb(239, 68, 68)' }}>
              <div className="w-14 h-14 flex items-center justify-center">
                <Music className="w-14 h-14 text-white" />
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-16 h-16 flex items-center justify-center rounded-xl p-1 opacity-70"
              style={{ transform: 'rotate(-15deg)', marginLeft: '-100px', backgroundColor: 'hsl(201, 100.00%, 67.10%)', border: '2px solid rgb(34, 181, 225)', borderBottom: '6px solid rgb(34, 181, 225)' }}
              onClick={() => {}}
            >
              <div className="w-14 h-14 flex items-center justify-center">
                <Volume2 className="w-14 h-14 text-white" />
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-16 h-16 flex items-center justify-center rounded-xl p-1 opacity-70"
              style={{ transform: 'rotate(-20deg)', marginRight: '-110px', backgroundColor: 'rgb(0, 233, 0)', border: '2px solid rgb(10, 216, 4)', borderBottom: '6px solid rgb(10, 216, 4)' }}
              onClick={() => {}}
            >
              <div className="w-14 h-14 flex items-center justify-center">
                <Timer className="w-14 h-14 text-white" />
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-16 h-16 flex items-center justify-center rounded-xl p-1"
              style={{ transform: 'rotate(28deg)', marginTop: '230px', marginRight: '-5px', backgroundColor: 'rgb(255, 138, 21)', border: '2px solid rgb(249, 115, 22)', borderBottom: '6px solid rgb(249, 115, 22)' }}
              onClick={() => handleQuickAction('history')}
            >
              <div className="w-14 h-14 flex items-center justify-center">
                <RotateCcw className="w-14 h-14 text-white" />
              </div>
            </Button>
          </div>
        </div>

        {/* Weekly Goal */}
        <Card
          className="mb-8 rounded-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden backdrop-blur-sm bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 border-0"
          style={{ border: '2px solid rgb(237, 237, 237)', borderLeft: '3.5px solid rgb(237, 237, 237)', borderBottom: '3.5px solid rgb(237, 237, 237)', borderRight: '3.5px solid rgb(237, 237, 237)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
        >
          <CardContent className="p-6 bg-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg text-gray-600 dark:text-gray-300">Weekly Song Goal</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{minutesThisWeek} / {weeklyGoalMinutes} min</div>
            </div>
            <div className="relative w-full">
              <div className="h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                {/* Absolute segment fills, clipped to percentage with small gaps and rounded corners */}
                <div
                  className="absolute top-0 left-0 h-full"
                  style={{
                    width: `calc(${Math.max(0, Math.min(displayWeeklyPct, 20))}% - 1px)`,
                    backgroundColor: '#ff2d1a',
                    borderRadius: '8px',
                    border: '1px solid #e02612',
                    borderBottomWidth: '2px'
                  }}
                />
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: 'calc(20% + 1px)',
                    width: `calc(${Math.max(0, Math.min(displayWeeklyPct - 20, 20))}% - 2px)`,
                    backgroundColor: '#ff5a00',
                    borderRadius: '8px',
                    border: '1px solid #e65000',
                    borderBottomWidth: '2px'
                  }}
                />
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: 'calc(40% + 2px)',
                    width: `calc(${Math.max(0, Math.min(displayWeeklyPct - 40, 20))}% - 2px)`,
                    backgroundColor: '#ff8a00',
                    borderRadius: '8px',
                    border: '1px solid #e07700',
                    borderBottomWidth: '2px'
                  }}
                />
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: 'calc(60% + 3px)',
                    width: `calc(${Math.max(0, Math.min(displayWeeklyPct - 60, 20))}% - 2px)`,
                    backgroundColor: '#ffb700',
                    borderRadius: '8px',
                    border: '1px solid #d99f00',
                    borderBottomWidth: '2px'
                  }}
                />
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: 'calc(80% + 4px)',
                    width: `calc(${Math.max(0, Math.min(displayWeeklyPct - 80, 20))}% - 1px)`,
                    backgroundColor: '#ffe000',
                    borderRadius: '8px',
                    border: '1px solid #d1c200',
                    borderBottomWidth: '2px'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-8">
          <hr style={{ width: '80%', height: '2px', backgroundColor: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: '9999px' }} />
        </div>

        {/* Add Songs Button - Below HR */}
        <div className="flex justify-center mb-6">
          <button 
            onClick={() => setCatalogOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105"
            style={{ 
              backgroundColor: 'rgb(59, 130, 246)',
              border: '2px solid rgb(37, 99, 235)',
              borderBottom: '4px solid rgb(37, 99, 235)'
            }}
          >
            <Plus className="w-5 h-5" />
            Add Songs
          </button>
        </div>

        {songs.length === 0 ? (
          <Card
            className="rounded-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden backdrop-blur-sm bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 border-2 border-gray-200 dark:border-slate-600 bg-white/40 dark:bg-slate-800/60"
            style={{ borderLeftWidth: '3.5px', borderBottomWidth: '3.5px', borderRightWidth: '3.5px' }}
          >
            <CardContent className="p-8 bg-transparent text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No songs yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Add songs you want to learn!</p>
              <button 
                onClick={() => setCatalogOpen(true)}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white mx-auto transition-all hover:scale-105"
                style={{ 
                  backgroundColor: 'rgb(59, 130, 246)',
                  border: '2px solid rgb(37, 99, 235)',
                  borderBottom: '4px solid rgb(37, 99, 235)'
                }}
              >
                <Plus className="w-5 h-5" />
                Add Songs
              </button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Songs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song, index) => {
                const isCompleted = song.progress >= 100;
                return (
                  <Card
                    key={song.songId}
                    onClick={() => handlePractice(song)}
                    className={`rounded-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden backdrop-blur-sm cursor-pointer relative border-2 ${
                      isCompleted 
                        ? 'border-green-300 dark:border-green-600 bg-green-50/40 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-slate-600 bg-white/40 dark:bg-slate-800/60'
                    }`}
                    style={{ 
                      borderLeftWidth: '3.5px',
                      borderBottomWidth: '3.5px',
                      borderRightWidth: '3.5px',
                      boxShadow: isCompleted ? '0 2px 8px rgba(134, 239, 172, 0.15)' : 'none'
                    }}
                  >
                    <CardHeader className="pb-2 bg-transparent">
                      <div className="flex items-start justify-between mb-1">
                        <CardTitle className="text-lg dark:text-white">{song.title}</CardTitle>
                        <Badge 
                          className="text-xs border-0"
                          style={{
                            backgroundColor: isCompleted ? 'rgb(236, 253, 245)' : getCardColors(index).badge,
                            color: isCompleted ? 'rgb(34, 197, 94)' : getCardColors(index).badgeText
                          }}
                        >
                          {song.genre}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{song.artist}</p>
                    </CardHeader>
                    
                    <CardContent className="bg-transparent">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{getAccurateSongDuration(song.title, song.duration)} · {song.bpm} BPM</span>
                        <span>{song.timesPlayed || 0} plays</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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

      {/* Song Practice Modal */}
      {selectedSong && user && (
        <SongPractice
          isOpen={practiceOpen}
          onClose={() => {
            setPracticeOpen(false);
            setSelectedSong(null);
          }}
          song={selectedSong}
          userId={user.id}
          onComplete={handlePracticeComplete}
        />
      )}

      {/* Add Songs Dialog - Matching Songs Page Style */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent 
          className="w-[95vw] max-w-2xl max-h-[500px] overflow-hidden flex flex-col p-0 rounded-2xl [&>button:last-of-type]:hidden border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
        >
          {/* Header */}
              <div 
            className="flex-shrink-0 p-4 bg-white/90 dark:bg-slate-800"
              >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Add Songs</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {catalogSongs.length} available • {songs.length} added
                </p>
              </div>
              <button
                onClick={() => setCatalogOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 bg-gray-100 dark:bg-slate-600 border-2 border-gray-200 dark:border-slate-500"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-xl text-sm focus:outline-none transition-all border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Songs List - Scrollable with fixed height */}
          <div 
            className="overflow-y-auto bg-gradient-to-b from-blue-50/30 to-white/50 dark:from-slate-800 dark:to-slate-900" 
            style={{ 
              height: '200px',
              maxHeight: '200px'
            }}
          >
            <div className="p-3 space-y-2">
              {filteredCatalogSongs.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-500" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No songs found</p>
                </div>
              ) : (
                filteredCatalogSongs.map((song, index) => {
                  const selected = isSongSelected(song);
                  
                  return (
                    <div 
                      key={index}
                      className={`rounded-xl p-3 transition-all hover:scale-[1.01] border-2 ${
                        selected 
                          ? 'border-green-300 bg-green-50/80 dark:bg-green-900/30 dark:border-green-600' 
                          : 'border-gray-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80'
                      }`}
                      style={{ 
                        borderBottomWidth: '3px'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-semibold text-sm text-gray-800 dark:text-white truncate">{song.title}</h4>
                            {selected && (
                              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                          <span 
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                          >
                            {song.genre}
                          </span>
                            <span 
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
                            >
                              {song.difficulty || 'Beginner'}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          {selected ? (
                            <button
                              onClick={() => {
                                const songId = `${song.title.toLowerCase().replace(/\s+/g, '_')}_${song.artist.toLowerCase().replace(/\s+/g, '_')}`;
                                handleRemoveSong(songId, song.title, { stopPropagation: () => {} } as React.MouseEvent);
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                              style={{ 
                                backgroundColor: 'rgb(254, 226, 226)',
                                color: 'rgb(220, 38, 38)',
                                border: '2px solid rgb(252, 165, 165)',
                                borderBottom: '3px solid rgb(248, 113, 113)'
                              }}
                            >
                              Remove
                            </button>
                        ) : (
                          <button
                            onClick={() => handleAddFromCatalog(song)}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all hover:scale-105"
                              style={{ 
                                backgroundColor: 'rgb(59, 130, 246)',
                                border: '2px solid rgb(37, 99, 235)',
                                borderBottom: '3px solid rgb(37, 99, 235)'
                              }}
                          >
                            Add
                          </button>
                        )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer with Done Button */}
          <div 
            className="flex-shrink-0 p-3 border-t-2 border-gray-200 dark:border-slate-600 bg-white/90 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{songs.length}</span> song{songs.length !== 1 ? 's' : ''} in playlist
            </p>
            <button 
              onClick={() => setCatalogOpen(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-105 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-200 border-2 border-gray-200 dark:border-slate-500"
              style={{ 
                  borderBottomWidth: '3px'
              }}
            >
              <Check className="w-4 h-4" />
              Done
            </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Song Confirmation Dialog */}
      <Dialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))' }}>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgb(254, 226, 226)' }}
              >
                <X className="w-6 h-6" style={{ color: 'rgb(220, 38, 38)' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Remove Song?</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-600">
              Are you sure you want to remove <span className="font-semibold text-gray-800">"{songToRemove?.title}"</span> from your playlist?
            </p>
            <p className="text-sm text-gray-400 mt-2">Your progress for this song will be lost.</p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button 
              onClick={cancelRemoveSong}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'rgb(243, 244, 246)',
                border: '2px solid rgb(229, 231, 235)',
                borderBottom: '3px solid rgb(209, 213, 219)',
                color: 'rgb(75, 85, 99)'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={confirmRemoveSong}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'rgb(220, 38, 38)',
                border: '2px solid rgb(185, 28, 28)',
                borderBottom: '3px solid rgb(185, 28, 28)'
              }}
            >
              Remove
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}