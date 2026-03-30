import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ActivityModal } from './ActivityModal';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  loadProgress,
  awardPoints as awardPointsStorage,
  getWeeklyGoals,
  getPracticeStreak,
} from '../utils/progressStorage';
import { createClient } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogContentFullscreen, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import guitarContent from '../data/guitar-content.json';
import {
  getWeeklyChallengesList,
  getWeeklyChallengeProgress,
  getDifficultyStyle,
  getDifficultyBarFillClass,
  type WeeklyChallenge,
} from '../utils/weeklyChallengesShared';
import {
  Trophy,
  Crown,
  Medal,
  Sword,
  Shield,
  Award,
  UserPlus,
  MessageCircle,
  Search,
  Coins,
  X,
  Check,
  Target,
  ChevronRight,
} from 'lucide-react';

import guitarCompete from '../assets/20251005_0034_Duel Characters Removed Background_remix_01k6smkddjencvmx83rm1j7mar.png';
import bronzeImage from '../assets/image.png';
import goldImage from '../assets/image2.png';
import silverImage from '../assets/image3.png';
import diamondImage from '../assets/image4.png';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Leaderboard user type
interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  level: string;
  points: number;
  rank: string;
  streak: number;
  weeklyPoints: number;
  avatar: string;
  isFriend: boolean;
  isCurrentUser: boolean;
}

// Duel types
interface Duel {
  id: string;
  challengerId: string;
  challengerName: string;
  opponentId: string;
  opponentName: string;
  songId: string;
  songTitle: string;
  songArtist: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined';
  challengerScore: number;
  opponentScore: number;
  winnerId?: string;
  createdAt: string;
}

// Get all songs from guitar content
const getAllSongs = () => {
  const songs: any[] = [];
  const levels = ['novice', 'beginner', 'elementary', 'intermediate', 'proficient', 'advanced', 'expert'];
  
  levels.forEach(level => {
    const levelSongs = (guitarContent.songs as any)[level];
    if (levelSongs) {
      Object.keys(levelSongs).forEach(genre => {
        const genreSongs = levelSongs[genre];
        if (Array.isArray(genreSongs)) {
          genreSongs.forEach(song => {
            songs.push({
              ...song,
              songId: `${song.title.toLowerCase().replace(/\s+/g, '_')}_${song.artist.toLowerCase().replace(/\s+/g, '_')}`,
              level
            });
          });
        }
      });
    }
  });
  
  return songs;
};

export function Compete() {
  const { user, awardPoints, calculatePointsForActivity, friends, allUsers } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActivity, setModalActivity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState(2);
  const [totalPoints, setTotalPoints] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  
  // Arena state
  const [arenaOpen, setArenaOpen] = useState(false);
  const [arenaStep, setArenaStep] = useState<'users' | 'songs' | 'waiting' | 'duel' | 'results'>('users');
  const [selectedOpponent, setSelectedOpponent] = useState<LeaderboardUser | null>(null);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [arenaSearchQuery, setArenaSearchQuery] = useState('');
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [currentDuel, setCurrentDuel] = useState<Duel | null>(null);
  const [duelResult, setDuelResult] = useState<{ won: boolean; score: number; opponentScore: number } | null>(null);
  const [allSongs] = useState(getAllSongs());
  const duelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Challenge state
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [weeklyChallenges] = useState<WeeklyChallenge[]>(getWeeklyChallengesList());
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<WeeklyChallenge | null>(null);
  const [showChallengeDetails, setShowChallengeDetails] = useState(false);

  // Load completed challenges and check for auto-completion based on user progress
  useEffect(() => {
    if (user) {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const currentWeek = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
      
      // Load previously completed challenges
      let existingCompleted: number[] = [];
      const storedCompleted = localStorage.getItem(`guitarApp_completedChallenges_${user.id}`);
      if (storedCompleted) {
        try {
          const parsed = JSON.parse(storedCompleted);
          if (parsed.week === currentWeek) {
            existingCompleted = parsed.completed || [];
          }
        } catch (e) {
          console.error('Error loading completed challenges:', e);
        }
      }
      
      // Check each challenge for auto-completion based on actual progress
      const newlyCompleted: number[] = [];
      weeklyChallenges.forEach(challenge => {
        if (!existingCompleted.includes(challenge.id)) {
          const progress = getWeeklyChallengeProgress(challenge, user.id, {
            weeklyPoints: user.weeklyPoints ?? 0,
          });
          if (progress.isComplete) {
            newlyCompleted.push(challenge.id);
            // Award points for newly completed challenges
            awardPointsStorage(user.id, challenge.points, `challenge_completed_${challenge.id}`);
            console.log(`🏆 Auto-completed challenge: ${challenge.title} - Awarded ${challenge.points} points!`);
          }
        }
      });
      
      // Update state with all completed challenges
      const allCompleted = [...existingCompleted, ...newlyCompleted];
      setCompletedChallenges(allCompleted);
      
      // Save to localStorage
      localStorage.setItem(`guitarApp_completedChallenges_${user.id}`, JSON.stringify({ 
        week: currentWeek, 
        completed: allCompleted 
      }));
    }
  }, [user, weeklyChallenges]);

  useEffect(() => {
    if (!user?.id) return;
    try {
      if (sessionStorage.getItem('strummy-open-weekly-challenges') === '1') {
        sessionStorage.removeItem('strummy-open-weekly-challenges');
        setChallengeOpen(true);
      }
    } catch (_) {}
  }, [user?.id]);

  // Save completed challenges to localStorage
  const saveCompletedChallenges = (completed: number[]) => {
    if (user) {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const currentWeek = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
      localStorage.setItem(`guitarApp_completedChallenges_${user.id}`, JSON.stringify({ week: currentWeek, completed }));
    }
  };

  // Load points from the same source as Dashboard (progressStorage)
  useEffect(() => {
    if (user) {
      const progress = loadProgress(user.id);
      setTotalPoints(progress?.totalPoints || 0);
      setWeeklyPoints(progress?.weeklyPoints || user.weeklyPoints || 0);
    }
  }, [user]);

  // Function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    if (!supabase) {
      console.log('⚠️ Supabase not configured, skipping leaderboard fetch');
      setIsLoadingLeaderboard(false);
      return;
    }

    try {
      console.log('🏆 Fetching leaderboard from Supabase...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, guitar_level, points, compete_level, streak')
        .order('points', { ascending: false })
        .limit(25);

      if (error) {
        console.error('❌ Error fetching leaderboard:', error);
        setIsLoadingLeaderboard(false);
        return;
      }

      if (data) {
        console.log('✅ Leaderboard data fetched:', data.length, 'users');
        
        const leaderboardUsers: LeaderboardUser[] = data.map((profile) => ({
          id: profile.user_id,
          name: profile.username || 'Unknown',
          username: profile.username || 'unknown',
          level: profile.guitar_level || 'beginner',
          points: profile.points || 0,
          rank: profile.compete_level || 'Bronze I',
          streak: profile.streak || 0,
          weeklyPoints: 0, // Not tracked in profiles yet
          avatar: '🎸',
          isFriend: friends?.includes(profile.user_id) || false,
          isCurrentUser: user?.id === profile.user_id
        }));

        setLeaderboard(leaderboardUsers);
      }
    } catch (error) {
      console.error('❌ Failed to fetch leaderboard:', error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Fetch leaderboard on mount (realtime subscriptions disabled for stability)
  useEffect(() => {
    if (user?.id) {
      fetchLeaderboard();
    }
    // Only depend on user.id to prevent infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Also refresh when totalPoints changes (local user updated)
  useEffect(() => {
    if (totalPoints > 0) {
      // Small delay to ensure Supabase has received the update
      const timer = setTimeout(() => {
        fetchLeaderboard();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [totalPoints]);

  if (!user) return null;

  // Load active duels from localStorage
  useEffect(() => {
    const storedDuels = localStorage.getItem(`guitarApp_duels_${user.id}`);
    if (storedDuels) {
      try {
        setActiveDuels(JSON.parse(storedDuels));
      } catch (e) {
        console.error('Error loading duels:', e);
      }
    }
  }, [user.id]);

  // Save duels to localStorage when they change
  useEffect(() => {
    if (activeDuels.length > 0) {
      localStorage.setItem(`guitarApp_duels_${user.id}`, JSON.stringify(activeDuels));
    } else {
      localStorage.removeItem(`guitarApp_duels_${user.id}`);
    }
  }, [activeDuels, user.id]);

  // Cleanup duel timer on unmount
  useEffect(() => {
    return () => {
      if (duelTimerRef.current) {
        clearTimeout(duelTimerRef.current);
      }
    };
  }, []);

  // Filter users for arena search
  const filteredArenaUsers = leaderboard.filter(player => {
    if (player.isCurrentUser) return false; // Can't challenge yourself
    const query = arenaSearchQuery.toLowerCase();
    return player.name.toLowerCase().includes(query) || 
           player.username.toLowerCase().includes(query);
  });

  // Filter songs for selection
  const filteredSongs = allSongs.filter(song => {
    const query = songSearchQuery.toLowerCase();
    return song.title.toLowerCase().includes(query) || 
           song.artist.toLowerCase().includes(query) ||
           song.genre.toLowerCase().includes(query);
  });

  // Handle opening Arena
  const handleOpenArena = () => {
    setArenaOpen(true);
    setArenaStep('users');
    setSelectedOpponent(null);
    setSelectedSong(null);
    setArenaSearchQuery('');
    setSongSearchQuery('');
    setDuelResult(null);
  };

  // Handle selecting an opponent
  const handleSelectOpponent = (opponent: LeaderboardUser) => {
    setSelectedOpponent(opponent);
    setArenaStep('songs');
  };

  // Handle selecting a song
  const handleSelectSong = (song: any) => {
    setSelectedSong(song);
  };

  // Handle sending a challenge
  const handleSendChallenge = () => {
    if (!selectedOpponent || !selectedSong) return;

    const newDuel: Duel = {
      id: `duel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      challengerId: user.id,
      challengerName: user.name || user.username || 'You',
      opponentId: selectedOpponent.id,
      opponentName: selectedOpponent.name,
      songId: selectedSong.songId,
      songTitle: selectedSong.title,
      songArtist: selectedSong.artist,
      status: 'pending',
      challengerScore: 0,
      opponentScore: 0,
      createdAt: new Date().toISOString()
    };

    setActiveDuels(prev => [...prev, newDuel]);
    setCurrentDuel(newDuel);
    setArenaStep('waiting');

    // Simulate opponent response (for demo - in real app this would be via Supabase)
    const duelTimerId = setTimeout(() => {
      // Simulate the opponent accepting and completing their attempt
      const opponentScore = Math.floor(Math.random() * 100); // Random score 0-100

      setActiveDuels(prev => prev.map(d =>
        d.id === newDuel.id
          ? { ...d, status: 'accepted', opponentScore }
          : d
      ));

      setCurrentDuel(prev => prev ? { ...prev, status: 'accepted', opponentScore } : null);
      setArenaStep('duel');
    }, 2000);

    // Store timer ID for cleanup
    duelTimerRef.current = duelTimerId;
  };

  // Handle completing your duel attempt
  const handleCompleteDuel = (score: number) => {
    if (!currentDuel) return;

    const opponentScore = currentDuel.opponentScore;
    const won = score > opponentScore;
    const winnerId = won ? user.id : currentDuel.opponentId;

    // Update duel status
    const completedDuel: Duel = {
      ...currentDuel,
      status: 'completed',
      challengerScore: score,
      winnerId
    };

    setActiveDuels(prev => prev.map(d => 
      d.id === currentDuel.id ? completedDuel : d
    ));

    setCurrentDuel(completedDuel);
    setDuelResult({ won, score, opponentScore });
    setArenaStep('results');

    // Award points if won
    if (won) {
      awardPoints(2, 'duel_win');
      console.log('🏆 Awarded 2 points for duel win!');
    }
  };

  // Simulate a duel performance (for demo purposes)
  const simulateDuelPerformance = () => {
    // In a real implementation, this would be based on actual song practice performance
    // For now, we generate a random score based on user's level
    const baseScore = 50;
    const levelBonus = totalPoints / 100; // Higher points = potentially better performance
    const randomFactor = Math.random() * 40 - 20; // +/- 20 random factor
    const score = Math.min(100, Math.max(0, Math.round(baseScore + levelBonus + randomFactor)));
    
    handleCompleteDuel(score);
  };

  // Tier thresholds based on progressive point system
  // Bronze I: 0, Bronze II: 100, Bronze III: 250 (100+150)
  // Silver I: 450 (250+200), Silver II: 700 (450+250), Silver III: 1000 (700+300)
  // Gold I: 1350 (1000+350), Gold II: 1750 (1350+400), Gold III: 2200 (1750+450)
  // Diamond I: 2700 (2200+500), Diamond II: 3250 (2700+550), Diamond III: 3850 (3250+600)
  // Platinum I: 4500 (3850+650), Platinum II: 5200 (4500+700), Platinum III: 5950 (5200+750)
  
  const tierThresholds = [
    { rank: 'Bronze', tier: 'I', points: 0, color: 'text-amber-900 bg-amber-100', icon: Medal },
    { rank: 'Bronze', tier: 'II', points: 100, color: 'text-amber-900 bg-amber-100', icon: Medal },
    { rank: 'Bronze', tier: 'III', points: 250, color: 'text-amber-900 bg-amber-100', icon: Medal },
    { rank: 'Silver', tier: 'I', points: 450, color: 'text-slate-600 bg-slate-200', icon: Award },
    { rank: 'Silver', tier: 'II', points: 700, color: 'text-slate-600 bg-slate-200', icon: Award },
    { rank: 'Silver', tier: 'III', points: 1000, color: 'text-slate-600 bg-slate-200', icon: Award },
    { rank: 'Gold', tier: 'I', points: 1350, color: 'text-amber-800 bg-amber-200', icon: Trophy },
    { rank: 'Gold', tier: 'II', points: 1750, color: 'text-amber-800 bg-amber-200', icon: Trophy },
    { rank: 'Gold', tier: 'III', points: 2200, color: 'text-amber-800 bg-amber-200', icon: Trophy },
    { rank: 'Diamond', tier: 'I', points: 2700, color: 'text-indigo-800 bg-indigo-100', icon: Crown },
    { rank: 'Diamond', tier: 'II', points: 3250, color: 'text-indigo-800 bg-indigo-100', icon: Crown },
    { rank: 'Diamond', tier: 'III', points: 3850, color: 'text-indigo-800 bg-indigo-100', icon: Crown },
    { rank: 'Platinum', tier: 'I', points: 4500, color: 'text-rose-800 bg-rose-100', icon: Crown },
    { rank: 'Platinum', tier: 'II', points: 5200, color: 'text-rose-800 bg-rose-100', icon: Crown },
    { rank: 'Platinum', tier: 'III', points: 5950, color: 'text-rose-800 bg-rose-100', icon: Crown },
  ];

  // Generate user rank based on total points (progressive system)
  // Uses the same points source as Dashboard (progressStorage)
  const getUserRank = () => {
    const points = totalPoints;
    
    // Find the highest tier the user has reached
    let currentTierIndex = 0;
    for (let i = tierThresholds.length - 1; i >= 0; i--) {
      if (points >= tierThresholds[i].points) {
        currentTierIndex = i;
        break;
      }
    }
    
    const currentTier = tierThresholds[currentTierIndex];
    const nextTier = tierThresholds[currentTierIndex + 1] || null;
    
    // Calculate progress to next tier
    let progressToNext = 100;
    let pointsToNext = 0;
    let pointsInCurrentTier = 0;
    
    if (nextTier) {
      const tierStartPoints = currentTier.points;
      const tierEndPoints = nextTier.points;
      pointsInCurrentTier = points - tierStartPoints;
      pointsToNext = tierEndPoints - points;
      progressToNext = Math.min(100, Math.round((pointsInCurrentTier / (tierEndPoints - tierStartPoints)) * 100));
    }
    
    return { 
      ...currentTier, 
      nextTier,
      progressToNext,
      pointsToNext,
      pointsInCurrentTier
    };
  };

  const userRank = getUserRank();

  // Get background image based on rank
  const getRankBackground = (rank: string) => {
    switch (rank) {
      case 'Bronze':
        return bronzeImage;
      case 'Silver':
        return silverImage;
      case 'Gold':
        return goldImage;
      case 'Diamond':
        return diamondImage;
      case 'Platinum':
        return diamondImage; // Use diamond image for platinum (similar style)
      default:
        return bronzeImage; // Default to bronze (starting tier)
    }
  };

  // Friends on leaderboard (from Supabase data)
  const friendsOnLeaderboard = leaderboard.filter(player => player.isFriend);

  // Get current user's position on leaderboard
  const currentUserPosition = leaderboard.findIndex(player => player.isCurrentUser) + 1;

  // Mock weekly challenge with point rewards
  const weeklyChallenge = {
    name: 'Chord Master Challenge',
    description: 'Play 100 different chord progressions this week',
    progress: 65,
    timeLeft: '2 days',
    pointReward: 500,
    bonusReward: 'Gold Badge',
    participants: 156
  };

  const handleAddFriend = (playerId: number) => {
    console.log('Adding friend:', playerId);
    // Implementation would go here
  };

  const handleSendMessage = (playerId: number) => {
    console.log('Sending message to:', playerId);
    // Implementation would go here
  };

  const handleBattleWin = (opponentLevel: string) => {
    const difficulty = opponentLevel === 'expert' ? 7 : opponentLevel === 'advanced' ? 5 : 3;
    const points = calculatePointsForActivity('battle_won', difficulty);
    awardPoints({
      type: 'battle_won',
      points: points,
      description: `Won battle against ${opponentLevel} player`,
      difficulty: difficulty
    });
  };

  const handleContinueChallenge = () => {
    setModalActivity({
      type: 'practice',
      name: weeklyChallenge.name,
      description: weeklyChallenge.description
    });
    setModalOpen(true);
  };

  const handleEnterArena = () => {
    handleOpenArena();
  };

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'leagues', label: 'Leagues', icon: Shield }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return (
          <div className="space-y-4">
            {/* Leaderboard Header with Refresh */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-200">Top 25 Players</span>
              </div>
              <button
                onClick={() => {
                  setIsLoadingLeaderboard(true);
                  fetchLeaderboard();
                }}
                disabled={isLoadingLeaderboard}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors disabled:opacity-50"
              >
                <svg 
                  className={`w-4 h-4 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            
            {isLoadingLeaderboard ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">No players yet</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Be the first to join the leaderboard!</p>
              </div>
            ) : leaderboard.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 transform border border-gray-300 border-b-4 border-b-gray-400 bg-gray-50 dark:bg-gray-700
                  ${player.isCurrentUser 
                    ? 'scale-[1.02]' 
                    : 'hover:scale-[1.01]'
                  }`}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-700">
                  {index === 0 && <Crown className="w-6 h-6 text-yellow-500" />}
                  {index === 1 && <Medal className="w-6 h-6 text-blue-500" />}
                  {index === 2 && <Medal className="w-6 h-6 text-pink-500" />}
                  {index > 2 && (
                    <span className="text-sm font-extrabold text-gray-600 dark:text-gray-300">
                      #{index + 1}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className={`font-semibold text-lg truncate ${player.isCurrentUser ? 'text-teal-700 dark:text-teal-300' : 'text-gray-900 dark:text-white'}`}>
                      {player.isCurrentUser ? (user?.name || player.name) : player.name} {player.isCurrentUser && '(You)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span>{player.rank}</span>
                    <span>•</span>
                    <span>Level {player.level}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {(player.isCurrentUser ? totalPoints : player.points).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {player.streak} day streak
                  </p>
                </div>
                
                
              </div>
            ))}
          </div>
        );

      case 'friends':
        return (
          <div className="space-y-6">
            {/* Friend Requests */}
            {pendingRequests > 0 && (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Friend Requests</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">{pendingRequests} pending requests</p>
                    </div>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                      View Requests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Friends */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search for friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                />
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            </div>

            {/* Friends List */}
            <div className="space-y-3">
              {friendsOnLeaderboard.map((friend) => (
                <div key={friend.id} className="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="relative">
                    <ImageWithFallback
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">{friend.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>{friend.rank}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        <span>{friend.points.toLocaleString()} pts</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleSendMessage(friend.id)}>
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-400 hover:bg-blue-500"
                      onClick={() => handleBattleWin(friend.level)}
                    >
                      <Sword className="w-4 h-4 mr-1" />
                      Challenge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'leagues':
        return (
          <div className="text-center py-12">
            <div 
              className="inline-block px-6 py-3 rounded-2xl mb-4"
              style={{ 
                background: 'linear-gradient(135deg, rgb(168, 85, 247), rgb(139, 92, 246))',
                border: '2px solid rgb(147, 51, 234)',
                borderBottom: '4px solid rgb(126, 34, 206)',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
              }}
            >
              <h3 className="text-2xl font-bold text-white">Coming Soon!</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Leagues are under construction</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm max-w-md mx-auto">
              We're working hard to bring you an amazing leagues experience where you can compete with teams of guitar players!
            </p>
                      </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <style>{`
        @keyframes shine {
          0% { 
            transform: translateX(-100%) skewX(-15deg);
            opacity: 0;
          }
          5% { 
            opacity: 0.7;
          }
          15% { 
            transform: translateX(100%) skewX(-15deg);
            opacity: 0.7;
          }
          100% { 
            transform: translateX(100%) skewX(-15deg);
            opacity: 0;
          }
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {/* Current Rank & Progress */}
        <Card 
          className="mb-4 text-white border-8 border-black relative" 
          style={{ 
            backgroundImage: `url(${getRankBackground(userRank.rank)})`,
            backgroundSize: userRank.rank === 'Bronze' ? '100%' : 'cover',
            backgroundPosition: userRank.rank === 'Bronze' ? 'center' : 'center',
            backgroundRepeat: 'no-repeat',
            marginTop: '10px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <userRank.icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{userRank.rank} {userRank.tier}</h2>
                  <p className="text-white/80">Current Ranking</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <Coins className="w-5 h-5" />
                  <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
                </div>
                <p className="text-white/80">Total Points</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2 gap-2 flex-wrap">
                {userRank.nextTier ? (
                  <span>
                    {userRank.pointsToNext} pts to {userRank.nextTier.rank} {userRank.nextTier.tier}
                  </span>
                ) : (
                  <span>Max tier reached!</span>
                )}
                <span className="text-white/90">+{weeklyPoints} pts this week</span>
              </div>
              {userRank.nextTier && (
                <p className="text-xs text-white/70 mb-2 tabular-nums">
                  Progress to next rank: {totalPoints.toLocaleString()} / {userRank.nextTier.points.toLocaleString()} pts
                </p>
              )}
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${userRank.progressToNext}%`,
                    background:
                      userRank.rank === 'Bronze'
                        ? 'linear-gradient(90deg, rgb(110, 72, 38), rgb(165, 112, 55))'
                        : userRank.rank === 'Silver'
                          ? 'linear-gradient(90deg, rgb(175, 180, 190), rgb(220, 224, 232))'
                          : userRank.rank === 'Gold'
                            ? 'linear-gradient(90deg, rgb(184, 140, 40), rgb(232, 195, 85))'
                            : userRank.rank === 'Diamond'
                              ? 'linear-gradient(90deg, rgb(90, 120, 200), rgb(150, 185, 245))'
                              : userRank.rank === 'Platinum'
                                ? 'linear-gradient(90deg, rgb(175, 160, 195), rgb(215, 205, 225))'
                                : 'linear-gradient(90deg, rgb(140, 170, 230), rgb(180, 200, 255))',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1 text-white/60">
                <span>{userRank.rank} {userRank.tier}</span>
                {userRank.nextTier && <span>{userRank.nextTier.rank} {userRank.nextTier.tier}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
        {!arenaOpen && !challengeOpen && (
        <div className="flex justify-center mb-4" style={{ marginTop: '-100px', marginBottom: '-63px', marginLeft: '20px', pointerEvents: 'none' }} >
          <img 
            src={guitarCompete} 
            alt="Guitar Compete" 
            className="w-1/2 h-36 relative" 
            style={{ zIndex: 100000, pointerEvents: 'none' }}
          />
        </div>
        )}

        
        {/* Tabs */}
        <div className="mb-6">
          <div className={`flex space-x-1 rounded-lg p-2 border transition-all duration-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700`}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors relative ${
                    activeTab === tab.id
                      ? (tab.id === 'leaderboard'
                          ? 'bg-blue-400 text-white shadow-lg' 
                          : 'bg-amber-500 text-white shadow-lg'
                          )
                      : 'text-gray-700 dark:text-white hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Create League Button removed - Coming Soon */}

        {/* Tab Content */}
        <Card className={`mb-8 backdrop-blur-sm ${
          activeTab === 'leaderboard'
            ? 'bg-white border-none'
            : 'bg-white/70'
        }`}>
          <CardContent className="p-6">
            {renderTabContent()}
          </CardContent>
        </Card>

        {/* Bottom spacing for footer */}
        <div className="h-32"></div>
      </div>

      {/* Floating Action Buttons - Outside container */}
      {!arenaOpen && !challengeOpen && (
      <div 
        className="fixed flex gap-4"
        style={{
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999
        }}
      >
        {/* Red Arena Button */}
        <div 
          onClick={handleEnterArena}
          className=" text-white px-6 py-4 cursor-pointer transition-all duration-300 hover:scale-105 flex items-center gap-3 relative overflow-hidden"
          style={{ 
            minWidth: '120px', 
            borderRadius: '10px',
            borderBottom: '4px solid rgba(239, 101, 101, 0.6)',
            borderLeft: '4px solid rgba(239, 68, 68, 0.6)',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)'
          }}
        >
          {/* Shine effect */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, transparent 25%, rgba(255,180,180,0.5) 35%, rgba(255,180,180,0.5) 65%, transparent 75%, transparent 100%)',
              animation: 'shine 7s ease-in-out infinite',
              zIndex: 1
            }}
          />
          <Sword className="w-6 h-6 relative z-10" />
          <span className="font-semibold text-lg relative z-10">Arena</span>
        </div>
        
        {/* Blue Challenge Button */}
        <div 
          onClick={() => setChallengeOpen(true)}
          className="text-white px-6 py-4 cursor-pointer transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 relative overflow-hidden"
          style={{ 
            minWidth: '120px', 
            borderRadius: '10px', 
            borderBottom: '4px solid rgb(111, 171, 230)', 
            borderRight: '4px solid rgb(111, 171, 230)', 
            backgroundColor: 'rgb(127, 181, 243)'
          }}
        >
          {/* Shine effect */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, transparent 25%, rgba(180,200,255,0.5) 35%, rgba(180,200,255,0.5) 65%, transparent 75%, transparent 100%)',
              animation: 'shine 7s ease-in-out infinite 0.5s',
              zIndex: 1
            }}
          />
          <span className="font-semibold text-lg relative z-10">Challenge</span>
        </div>
      </div>
      )}

      <ActivityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        activityType={modalActivity?.type || 'practice'}
        activityData={modalActivity}
      />

      {/* Arena Dialog */}
      <Dialog open={arenaOpen} onOpenChange={setArenaOpen}>
        <DialogContent 
          className="p-0 overflow-hidden rounded-2xl"
          style={{
            width: 'calc(100% - 1rem)', maxWidth: '28rem',
            border: '3px solid rgb(239, 68, 68)',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)'
          }}
        >
          {/* Header */}
          <div 
            className="p-6 text-center relative"
            style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)'
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <Sword className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Guitar Arena</h2>
              <Sword className="w-8 h-8 text-white transform scale-x-[-1]" />
            </div>
          </div>

          {/* Coming Soon Content */}
          <div className="p-8 bg-white text-center">
            <div 
              className="inline-block px-6 py-3 rounded-2xl mb-4"
              style={{ 
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: '2px solid #dc2626',
                borderBottom: '4px solid #b91c1c',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
              }}
            >
              <h3 className="text-2xl font-bold text-white">Coming Soon!</h3>
            </div>
            <p className="text-gray-600 text-lg mb-2">Arena battles are under construction</p>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Challenge other players to guitar duels and see who can play songs the longest without mistakes!
            </p>
            <button
              onClick={() => setArenaOpen(false)}
              className="px-6 py-2 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Weekly Challenge Dialog */}
      <Dialog
        open={challengeOpen}
        onOpenChange={(open) => {
          setChallengeOpen(open);
          if (!open) {
            setShowChallengeDetails(false);
            setSelectedChallenge(null);
          }
        }}
      >
        <DialogContentFullscreen className="bg-white dark:bg-slate-900 p-0 border-0 shadow-none">
          <div className="flex flex-col h-full min-h-0 w-full">
            <div
              className="flex-shrink-0 flex items-start justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 24px rgba(37, 99, 235, 0.25)',
              }}
            >
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-white">Weekly Challenges</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {completedChallenges.length}/{weeklyChallenges.length} completed •{' '}
                  {weeklyChallenges.reduce((acc, c) => (completedChallenges.includes(c.id) ? acc + c.points : acc), 0)} pts earned
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChallengeOpen(false)}
                className="shrink-0 w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors border border-white/30"
                aria-label="Close weekly challenges"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 bg-white dark:bg-slate-900">
            {!showChallengeDetails ? (
              <div className="space-y-4">
                {weeklyChallenges.map((challenge) => {
                  const isCompleted = completedChallenges.includes(challenge.id);
                  const diffColors = getDifficultyStyle(challenge.difficulty);
                  const progress = user
                    ? getWeeklyChallengeProgress(challenge, user.id, { weeklyPoints: user.weeklyPoints ?? 0 })
                    : { current: 0, target: 1, isComplete: false };
                  const progressPercent = Math.min(100, (progress.current / progress.target) * 100);
                  const barFill = getDifficultyBarFillClass(challenge.difficulty, isCompleted);

                  return (
                    <div
                      key={challenge.id}
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setShowChallengeDetails(true);
                      }}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        isCompleted
                          ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600'
                          : 'hover:scale-[1.02] active:scale-[0.98] bg-blue-50/70 dark:bg-slate-700/70 border-blue-200 dark:border-slate-600'
                      }`}
                      style={{ borderBottomWidth: '4px' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3
                              className={`font-bold text-base flex-1 min-w-0 ${
                                isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-white'
                              }`}
                            >
                              {challenge.title}
                            </h3>
                            <span
                              className={`shrink-0 text-sm font-bold tabular-nums ${
                                isCompleted ? 'text-green-700 dark:text-green-400' : diffColors.text
                              }`}
                            >
                              +{challenge.points} pts
                            </span>
                          </div>
                          <p
                            className={`text-sm line-clamp-1 ${
                              isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {challenge.description}
                          </p>

                          <div className="mt-2 mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span
                                className={`tabular-nums font-medium ${
                                  isCompleted ? 'text-green-600 dark:text-green-400' : diffColors.text
                                }`}
                              >
                                {progress.current} / {progress.target}
                              </span>
                              <span
                                className={`font-semibold tabular-nums ${
                                  isCompleted ? 'text-green-600 dark:text-green-400' : diffColors.text
                                }`}
                              >
                                {Math.round(progressPercent)}%
                              </span>
                            </div>
                            <div className="h-2.5 rounded-full overflow-hidden border border-gray-400 dark:border-slate-500 bg-gray-100 dark:bg-slate-700/90 box-border">
                              <div
                                className={`h-full transition-all duration-500 ${barFill}`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${diffColors.bg} ${diffColors.text}`}>
                              {challenge.difficulty}
                            </span>
                          </div>
                        </div>

                        {isCompleted && (
                          <div className="px-3 py-1 bg-green-500 rounded-full shrink-0">
                            <span className="text-xs font-bold text-white">DONE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : selectedChallenge && (
              <div className="space-y-4">
                {/* Back button */}
                <button
                  onClick={() => {
                    setShowChallengeDetails(false);
                    setSelectedChallenge(null);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  ← Back to challenges
                </button>

                {/* Challenge Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{selectedChallenge.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyStyle(selectedChallenge.difficulty).bg} ${getDifficultyStyle(selectedChallenge.difficulty).text}`}
                    >
                      {selectedChallenge.difficulty}
                    </span>
                    <span
                      className={`text-sm font-bold ${getDifficultyStyle(selectedChallenge.difficulty).text}`}
                    >
                      +{selectedChallenge.points} pts
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-3 border border-gray-100 dark:border-slate-600">
                  <p className="text-gray-700 dark:text-gray-200 text-base">{selectedChallenge.description}</p>
                </div>

                {/* Requirement info */}
                {selectedChallenge.requirement && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 mb-3">
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      Goal: {selectedChallenge.requirement.count} {selectedChallenge.requirement.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}

                {/* Progress Display - Auto-completes based on actual progress */}
                {(() => {
                  const progress = user
                    ? getWeeklyChallengeProgress(selectedChallenge, user.id, { weeklyPoints: user.weeklyPoints ?? 0 })
                    : { current: 0, target: 1, isComplete: false };
                  const progressPercent = Math.min(100, (progress.current / progress.target) * 100);
                  const detailDiff = getDifficultyStyle(selectedChallenge.difficulty);
                  const detailBarFill = getDifficultyBarFillClass(selectedChallenge.difficulty, progress.isComplete);

                  return (
                    <div className="space-y-3">
                      <div className="w-full">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span
                            className={`font-bold tabular-nums ${
                              progress.isComplete ? 'text-green-600 dark:text-green-400' : detailDiff.text
                            }`}
                          >
                            {progress.current} / {progress.target}
                          </span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden border border-gray-400 dark:border-slate-500 bg-gray-100 dark:bg-slate-700/90 box-border">
                          <div
                            className={`h-full transition-all duration-500 ${detailBarFill}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Status badge */}
                      <div 
                        className={`w-full py-4 px-6 rounded-xl font-bold text-center ${
                          progress.isComplete 
                            ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                            : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                        }`}
                      >
                        {progress.isComplete ? (
                          <div className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" />
                            Challenge Complete! +{selectedChallenge.points} pts
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Target className="w-5 h-5" />
                            Keep going! {progress.target - progress.current} more to go
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            </div>
          </div>
        </DialogContentFullscreen>
      </Dialog>
    </div>
  );
}