import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Dialog, DialogContent } from './ui/dialog';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle2, 
  Timer,
  Volume2,
  RotateCcw,
  X,
  BookOpen,
  Zap,
  Music
} from 'lucide-react';
import { createSession, createActivity, recordPoints, updateSongProgress, updateTechniqueProgress, updateTheoryProgress, getSessions } from '../utils/api';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: 'practice' | 'study' | 'quiz' | 'metronome' | 'tuner' | 'history';
  activityData?: any;
}

export function ActivityModal({ isOpen, onClose, activityType, activityData }: ActivityModalProps) {
  const { user, updateUser, syncProfileToSupabase } = useUser();
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setProgress(prev => Math.min(prev + 1, 100));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get colors based on activity type - matching technique/theory page colors
  const getActivityColors = () => {
    switch (activityType) {
      case 'practice':
        return {
          primary: 'rgb(239, 68, 68)', // Red - matching Technique Chords tab
          primaryLight: 'rgb(254, 226, 226)',
          primaryBorder: 'rgb(220, 38, 38)',
          gradient: 'linear-gradient(135deg, rgb(254, 242, 242) 0%, rgb(254, 226, 226) 100%)',
          text: 'rgb(185, 28, 28)',
          icon: 'rgb(220, 38, 38)',
          tabColor: 'rgb(249, 115, 22)' // Orange secondary
        };
      case 'study':
        return {
          primary: 'rgb(59, 130, 246)', // Blue - matching Theory Basics tab
          primaryLight: 'rgb(219, 234, 254)',
          primaryBorder: 'rgb(37, 99, 235)',
          gradient: 'linear-gradient(135deg, rgb(239, 246, 255) 0%, rgb(219, 234, 254) 100%)',
          text: 'rgb(29, 78, 216)',
          icon: 'rgb(37, 99, 235)',
          tabColor: 'rgb(16, 185, 129)' // Green secondary
        };
      case 'quiz':
        return {
          primary: 'rgb(168, 85, 247)', // Purple - matching Theory Scales tab
          primaryLight: 'rgb(243, 232, 255)',
          primaryBorder: 'rgb(147, 51, 234)',
          gradient: 'linear-gradient(135deg, rgb(250, 245, 255) 0%, rgb(243, 232, 255) 100%)',
          text: 'rgb(107, 33, 168)',
          icon: 'rgb(147, 51, 234)',
          tabColor: 'rgb(99, 102, 241)'
        };
      case 'metronome':
        return {
          primary: 'rgb(234, 179, 8)', // Yellow - matching Technique Plucks tab
          primaryLight: 'rgb(254, 249, 195)',
          primaryBorder: 'rgb(202, 138, 4)',
          gradient: 'linear-gradient(135deg, rgb(254, 252, 232) 0%, rgb(254, 249, 195) 100%)',
          text: 'rgb(161, 98, 7)',
          icon: 'rgb(202, 138, 4)',
          tabColor: 'rgb(249, 115, 22)'
        };
      case 'tuner':
        return {
          primary: 'rgb(16, 185, 129)', // Green - matching Theory Chords tab
          primaryLight: 'rgb(209, 250, 229)',
          primaryBorder: 'rgb(5, 150, 105)',
          gradient: 'linear-gradient(135deg, rgb(236, 253, 245) 0%, rgb(209, 250, 229) 100%)',
          text: 'rgb(4, 120, 87)',
          icon: 'rgb(5, 150, 105)',
          tabColor: 'rgb(59, 130, 246)'
        };
      case 'history':
        return {
          primary: 'rgb(249, 115, 22)', // Orange - matching Technique Strums tab
          primaryLight: 'rgb(255, 237, 213)',
          primaryBorder: 'rgb(234, 88, 12)',
          gradient: 'linear-gradient(135deg, rgb(255, 247, 237) 0%, rgb(255, 237, 213) 100%)',
          text: 'rgb(194, 65, 12)',
          icon: 'rgb(234, 88, 12)',
          tabColor: 'rgb(239, 68, 68)'
        };
      default:
        return {
          primary: 'rgb(249, 115, 22)',
          primaryLight: 'rgb(255, 237, 213)',
          primaryBorder: 'rgb(234, 88, 12)',
          gradient: 'linear-gradient(135deg, rgb(255, 247, 237) 0%, rgb(255, 237, 213) 100%)',
          text: 'rgb(194, 65, 12)',
          icon: 'rgb(234, 88, 12)',
          tabColor: 'rgb(239, 68, 68)'
        };
    }
  };

  const colors = getActivityColors();

  const handleComplete = async () => {
    if (!user) return;

    try {
      const durationMinutes = timeElapsed / 60;
      
      // Determine activity type for session
      let sessionActivityType: 'practice' | 'song' | 'technique' | 'theory' | 'study' = 'practice';
      if (activityType === 'study') {
        sessionActivityType = 'theory';
      } else if (activityData?.type === 'song') {
        sessionActivityType = 'song';
      } else if (activityData?.type === 'technique') {
        sessionActivityType = 'technique';
      }

      // Save practice session to backend
      await createSession({
        userId: user.id,
        activityType: sessionActivityType,
        activityName: activityData?.name || 'Practice Session',
        duration: durationMinutes,
        difficulty: activityData?.data?.difficulty || activityData?.difficulty || 1,
        progress: Math.min(100, Math.round((timeElapsed / 60) * 2)),
        notes: activityData?.description || ''
      });

      // Create timeline activity
      await createActivity({
        userId: user.id,
        type: activityType === 'practice' ? 'practice' : 'lesson',
        title: activityData?.name || `${activityType === 'practice' ? 'Practice' : 'Study'} Session`,
        description: `Completed ${Math.round(durationMinutes)} minute session`,
        icon: activityType === 'practice' ? '🎸' : '📚',
        color: activityType === 'practice' ? 'bg-orange-100' : 'bg-purple-100'
      });

      // Calculate and record points
      const basePoints = durationMinutes * 2;
      const difficultyMultiplier = (activityData?.data?.difficulty || activityData?.difficulty || 1) * 0.5;
      const pointsEarned = Math.round(basePoints * (1 + difficultyMultiplier));

      await recordPoints({
        userId: user.id,
        type: activityType === 'practice' ? 'practice' : 'theory_completed',
        points: pointsEarned,
        description: `Completed ${activityData?.name || 'session'} - ${Math.round(durationMinutes)} minutes`,
        difficulty: activityData?.data?.difficulty || activityData?.difficulty || 1
      });

      // Update specific progress if applicable
      if (activityData?.type === 'song' && activityData?.data) {
        const song = activityData.data;
        const currentProgress = song.progress || 0;
        const newProgress = Math.min(100, currentProgress + Math.round(durationMinutes * 0.5));
        
        await updateSongProgress({
          userId: user.id,
          songId: song.title || song.id || 'unknown',
          songTitle: song.title,
          artist: song.artist || '',
          progress: newProgress,
          status: newProgress >= 100 ? 'mastered' : 'in-progress'
        });
      } else if (activityData?.type === 'technique' && activityData?.data) {
        const technique = activityData.data;
        const currentProgress = technique.progress || 0;
        const newProgress = Math.min(100, currentProgress + Math.round(durationMinutes * 0.3));
        
        await updateTechniqueProgress({
          userId: user.id,
          techniqueId: technique.name || technique.id || 'unknown',
          techniqueName: technique.name,
          category: technique.category || '',
          progress: newProgress,
          status: newProgress >= 100 ? 'mastered' : 'in-progress'
        });
      } else if (activityType === 'study' && activityData?.data) {
        const theory = activityData.data;
        const currentProgress = theory.progress || 0;
        const newProgress = Math.min(100, currentProgress + Math.round(durationMinutes * 0.4));
        
        await updateTheoryProgress({
          userId: user.id,
          theoryId: theory.name || theory.id || 'unknown',
          theoryName: theory.name,
          category: theory.category || '',
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : 'in-progress'
        });
      }

      // Update user progress locally
      const updates: any = {};
      
      if (activityType === 'practice') {
        updates.practiceStreak = user.practiceStreak + 1;
        updates.hoursThisWeek = Math.round((Number(user.hoursThisWeek) + (durationMinutes / 60)) * 10) / 10;
        updates.totalPoints = (user.totalPoints || 0) + pointsEarned;
        updates.weeklyPoints = (user.weeklyPoints || 0) + pointsEarned;
      } else if (activityType === 'study') {
        updates.hoursThisWeek = Math.round((Number(user.hoursThisWeek) + (durationMinutes / 60)) * 10) / 10;
        updates.totalPoints = (user.totalPoints || 0) + pointsEarned;
        updates.weeklyPoints = (user.weeklyPoints || 0) + pointsEarned;
      }
      
      updateUser(updates);
    } catch (error) {
      console.error('Error saving session:', error);
      // Still update locally even if backend fails
      const updates: any = {};
      if (activityType === 'practice') {
        updates.practiceStreak = user.practiceStreak + 1;
        updates.hoursThisWeek = Math.round((Number(user.hoursThisWeek) + (timeElapsed / 3600)) * 10) / 10;
      } else if (activityType === 'study') {
        updates.hoursThisWeek = Math.round((Number(user.hoursThisWeek) + (timeElapsed / 3600)) * 10) / 10;
      }
      updateUser(updates);
    }
    
    setIsActive(false);
    setTimeElapsed(0);
    setProgress(0);
    
    // Sync updated points, compete level, and streak to Supabase
    syncProfileToSupabase();
    
    onClose();
  };

  const getActivityIcon = () => {
    switch (activityType) {
      case 'practice': return <Play className="w-5 h-5" style={{ color: colors.icon }} />;
      case 'study': return <BookOpen className="w-5 h-5" style={{ color: colors.icon }} />;
      case 'quiz': return <Zap className="w-5 h-5" style={{ color: colors.icon }} />;
      case 'metronome': return <Timer className="w-5 h-5" style={{ color: colors.icon }} />;
      case 'tuner': return <Volume2 className="w-5 h-5" style={{ color: colors.icon }} />;
      case 'history': return <RotateCcw className="w-5 h-5" style={{ color: colors.icon }} />;
      default: return <Music className="w-5 h-5" style={{ color: colors.icon }} />;
    }
  };

  const renderContent = () => {
    switch (activityType) {
      case 'practice':
        return (
          <div className="space-y-4">
            {/* Activity Info Card */}
            <div 
              className="p-4 bg-white/70 backdrop-blur-sm rounded-xl"
              style={{ border: '2.5px solid rgb(237, 237, 237)' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {activityData?.name || 'Practice Session'}
              </h3>
              <p className="text-sm text-gray-600">
                {activityData?.description || 'Focus on your technique and timing'}
              </p>
            </div>

            {/* Timer Card */}
            <div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl text-center"
              style={{ border: '2.5px solid rgb(237, 237, 237)' }}
            >
              <div 
                className="text-5xl font-bold mb-2"
                style={{ color: colors.primary }}
              >
                {formatTime(timeElapsed)}
              </div>
              <div className="text-sm text-gray-600 mb-4">Session Time</div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-5">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: colors.primary }}
                />
              </div>
              
              {/* Control Buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
                  style={{ backgroundColor: colors.primary }}
                >
                  {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isActive ? 'Pause' : 'Start'}
                </button>
                
                <button
                  onClick={() => {
                    setIsActive(false);
                    setTimeElapsed(0);
                    setProgress(0);
                  }}
                  className="flex items-center justify-center px-5 py-2.5 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
                  style={{ 
                    backgroundColor: 'rgb(243, 244, 246)',
                    color: 'rgb(107, 114, 128)'
                  }}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
                style={{ 
                  backgroundColor: 'rgb(243, 244, 246)',
                  color: 'rgb(107, 114, 128)'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleComplete}
                disabled={timeElapsed < 30}
                className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                style={{ backgroundColor: 'rgb(34, 197, 94)' }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete
              </button>
            </div>
          </div>
        );

      case 'study':
        return (
          <div className="space-y-4">
            {/* Activity Info Card */}
            <div 
              className="p-4 bg-white/70 backdrop-blur-sm rounded-xl"
              style={{ border: '2.5px solid rgb(237, 237, 237)' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {activityData?.name || 'Study Session'}
              </h3>
              <p className="text-sm text-gray-600">
                Learn and understand music theory concepts
              </p>
            </div>

            {/* Timer Card */}
            <div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl text-center"
              style={{ border: '2.5px solid rgb(237, 237, 237)' }}
            >
              <div 
                className="text-5xl font-bold mb-2"
                style={{ color: colors.primary }}
              >
                {formatTime(timeElapsed)}
              </div>
              <div className="text-sm text-gray-600 mb-4">Study Time</div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-5">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: colors.primary }}
                />
              </div>
              
              {/* Control Button */}
              <button
                onClick={() => setIsActive(!isActive)}
                className="flex items-center justify-center px-6 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90 active:scale-95 mx-auto shadow-md"
                style={{ backgroundColor: colors.primary }}
              >
                {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isActive ? 'Pause' : 'Start'}
              </button>
            </div>

            {/* Tips Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="p-3 bg-blue-50/70 backdrop-blur-sm rounded-xl"
                style={{ border: '2.5px solid rgb(191, 219, 254)' }}
              >
                <h4 className="font-semibold text-blue-800 mb-2 text-sm">Key Concepts</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Scale patterns</li>
                  <li>• Chord progressions</li>
                  <li>• Interval relationships</li>
                </ul>
              </div>
              <div 
                className="p-3 bg-green-50/70 backdrop-blur-sm rounded-xl"
                style={{ border: '2.5px solid rgb(187, 247, 208)' }}
              >
                <h4 className="font-semibold text-green-800 mb-2 text-sm">Practice Tips</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Start slowly</li>
                  <li>• Use a metronome</li>
                  <li>• Focus on accuracy</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
                style={{ 
                  backgroundColor: 'rgb(243, 244, 246)',
                  color: 'rgb(107, 114, 128)'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleComplete}
                disabled={timeElapsed < 15}
                className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                style={{ backgroundColor: 'rgb(34, 197, 94)' }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete
              </button>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            {/* Quiz Header */}
            <div 
              className="p-4 bg-white/70 backdrop-blur-sm rounded-xl"
              style={{ border: '2.5px solid rgb(237, 237, 237)' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Theory Quiz</h3>
              <p className="text-sm text-gray-600">Test your knowledge</p>
            </div>

            {/* Quiz Content */}
            <div 
              className="p-4 bg-white/70 backdrop-blur-sm rounded-xl"
              style={{ border: '2.5px solid rgb(237, 237, 237)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-700">Question 1 of 5</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div 
                      key={i} 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: i === 1 ? colors.primary : 'rgb(209, 213, 219)' }}
                    />
                  ))}
                </div>
              </div>
              <p className="mb-4 font-medium text-gray-800">What are the notes in a C major scale?</p>
              
              <div className="space-y-2">
                {['C-D-E-F-G-A-B', 'C-D-E#-F-G-A-B', 'C-D-E-F#-G-A-B', 'C-D#-E-F-G-A-B'].map((option, i) => (
                  <button 
                    key={i} 
                    className="w-full text-left p-3 rounded-lg font-medium transition-all hover:scale-[1.01] active:scale-[0.99] bg-gray-50"
                    style={{ border: '2px solid rgb(229, 231, 235)' }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
                style={{ 
                  backgroundColor: 'rgb(243, 244, 246)',
                  color: 'rgb(107, 114, 128)'
                }}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-2.5 px-4 rounded-lg font-medium text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
                style={{ backgroundColor: colors.primary }}
              >
                Next Question
              </button>
            </div>
          </div>
        );

      case 'metronome':
        return (
          <div className="space-y-4">
            {/* Metronome Display */}
            <div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl text-center"
              style={{ border: '2.5px solid rgb(237, 237, 237)' }}
            >
              {/* BPM Display */}
              <div className="mb-5">
              <div 
                className="text-5xl font-bold mb-1"
                style={{ color: colors.primary }}
              >
                120
              </div>
                <div className="text-sm font-medium text-gray-500 tracking-wide uppercase">BPM</div>
              </div>
              
              {/* Visual Beat Indicator */}
              <div className="flex justify-center gap-2.5 mb-5">
                {[1, 2, 3, 4].map((beat) => (
                  <div 
                    key={beat}
                    className="w-4 h-4 rounded-full transition-all duration-100"
                    style={{ 
                      backgroundColor: beat === 1 ? colors.primary : 'rgb(229, 231, 235)',
                      transform: beat === 1 && isActive ? 'scale(1.3)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
              
              {/* BPM Controls */}
              <div className="flex justify-center gap-4 mb-8">
                {['-10', '-1', '+1', '+10'].map((val) => (
                  <button
                    key={val}
                    className="w-12 h-10 rounded-lg font-bold text-sm transition-all hover:opacity-90 active:scale-95 bg-gray-100"
                    style={{ 
                      border: '2px solid rgb(229, 231, 235)',
                      color: 'rgb(75, 85, 99)'
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
              
              {/* Play Button */}
              <button
                onClick={() => setIsActive(!isActive)}
                className="flex items-center justify-center w-36 h-12 rounded-xl font-semibold text-base text-white transition-all hover:opacity-90 active:scale-95 mx-auto shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isActive ? 'Stop' : 'Start'}
              </button>
            </div>

            {/* Close Button */}
            <div className="flex justify-center mt-2">
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
                style={{ 
                  backgroundColor: 'rgb(243, 244, 246)',
                  color: 'rgb(107, 114, 128)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        );

      case 'tuner':
        return (
          <div className="space-y-4">
            {/* Tuner Display */}
            <div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl"
              style={{ border: '2.5px solid rgb(237, 237, 237)' }}
            >
              {/* Current Note Display */}
              <div className="text-center mb-5">
                <div 
                  className="text-5xl font-bold mb-1"
                  style={{ color: colors.primary }}
                >
                  E
                </div>
                <div className="text-sm font-medium text-gray-500 tracking-wide uppercase">Current String</div>
              </div>
              
              {/* Tuning Indicator with labels */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-400 mb-2 px-1">
                  <span>♭ Flat</span>
                  <span className="font-semibold text-green-500">In Tune</span>
                  <span>Sharp ♯</span>
                </div>
                <div className="relative w-full h-4 rounded-full bg-gray-200 overflow-hidden">
                  {/* Center marker */}
                  <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-400 transform -translate-x-1/2 z-10" />
                  {/* Tuning indicator */}
                <div 
                    className="absolute top-0 h-full w-6 rounded-full transition-all duration-200"
                    style={{ 
                      left: 'calc(50% - 12px)',
                      backgroundColor: 'rgb(34, 197, 94)'
                    }}
                />
                </div>
              </div>
              
              {/* String Buttons */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                {['E', 'A', 'D', 'G', 'B', 'e'].map((string, i) => (
                  <button 
                    key={i} 
                    className="h-11 flex items-center justify-center rounded-lg font-bold text-base transition-all hover:opacity-90 active:scale-95"
                    style={{ 
                      backgroundColor: i === 0 ? colors.primary : 'rgb(243, 244, 246)',
                      color: i === 0 ? 'white' : 'rgb(75, 85, 99)',
                      border: '2px solid rgb(229, 231, 235)'
                    }}
                  >
                    {string}
                  </button>
                ))}
              </div>
              
              {/* String labels */}
              <div className="grid grid-cols-6 gap-2 text-center mb-4">
                {['6th', '5th', '4th', '3rd', '2nd', '1st'].map((label, i) => (
                  <span key={i} className="text-[10px] text-gray-400">{label}</span>
                ))}
              </div>
              
              <div className="text-center text-sm text-gray-500 font-medium">
                🎸 Play a string to tune
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-center mt-2">
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
                style={{ 
                  backgroundColor: 'rgb(243, 244, 246)',
                  color: 'rgb(107, 114, 128)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        );

      case 'history':
        return (
          <HistoryContent userId={user?.id || ''} onClose={onClose} colors={colors} />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`p-0 overflow-hidden [&>button:last-of-type]:hidden ${activityType === 'tuner' || activityType === 'metronome' ? 'max-w-sm' : 'max-w-md'}`}
        style={{ 
          background: 'linear-gradient(135deg, rgb(255, 251, 235) 0%, rgb(254, 243, 199) 100%)',
          border: '2.5px solid rgb(237, 237, 237)',
          borderRadius: '20px'
        }}
      >
        {/* Custom Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-90 active:scale-95 z-10 bg-white/70 backdrop-blur-sm"
          style={{ border: '2px solid rgb(229, 231, 235)' }}
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.primaryLight }}
            >
              {getActivityIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {activityType.charAt(0).toUpperCase() + activityType.slice(1)}
              </h2>
              <p className="text-sm text-gray-600">
                {activityType === 'practice' && 'Technique Practice'}
                {activityType === 'study' && 'Theory Study'}
                {activityType === 'quiz' && 'Knowledge Test'}
                {activityType === 'metronome' && 'Timing Tool'}
                {activityType === 'tuner' && 'Tuning Tool'}
                {activityType === 'history' && 'Past Sessions'}
              </p>
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// History Content Component
function HistoryContent({ userId, onClose, colors }: { userId: string; onClose: () => void; colors: any }) {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await getSessions(userId, { limit: 10 });
        setSessions(data);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadSessions();
    }
  }, [userId]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div 
          className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: `${colors.primary} transparent ${colors.primary} ${colors.primary}` }}
        />
        <p className="text-gray-600 text-sm">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <div 
        className="p-4 bg-white/70 backdrop-blur-sm rounded-xl"
        style={{ border: '2.5px solid rgb(237, 237, 237)' }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Practice History</h3>
        <p className="text-sm text-gray-600">Your recent sessions</p>
      </div>

      {/* Sessions List */}
      <div 
        className="rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm"
        style={{ border: '2.5px solid rgb(237, 237, 237)' }}
      >
        <div className="max-h-56 overflow-y-auto p-3 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p className="font-medium text-sm">No practice sessions yet.</p>
              <p className="text-xs mt-1">Start practicing to see your history here!</p>
            </div>
          ) : (
            sessions.map((session, index) => (
              <div 
                key={session.id} 
                className="p-3 rounded-lg flex justify-between items-center"
                style={{ 
                  backgroundColor: index % 2 === 0 ? 'rgb(249, 250, 251)' : 'white',
                  border: '1px solid rgb(229, 231, 235)'
                }}
              >
                <div>
                  <div className="font-medium text-gray-800 text-sm">{session.activityName}</div>
                  <div className="text-xs text-gray-500">{formatDate(session.timestamp)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm" style={{ color: colors.primary }}>{Math.round(session.duration)} min</div>
                  <div className="text-xs text-green-600 font-medium">
                    {session.progress ? `+${Math.round(session.progress)}%` : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="py-2.5 px-6 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ 
            backgroundColor: 'rgb(243, 244, 246)',
            color: 'rgb(107, 114, 128)'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
