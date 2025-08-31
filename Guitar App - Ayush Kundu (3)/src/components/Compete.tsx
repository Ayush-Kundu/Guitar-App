import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { ActivityModal } from './ActivityModal';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Trophy, 
  Target, 
  Zap, 
  Crown, 
  Star, 
  Medal, 
  Sword, 
  Shield,
  Users,
  Calendar,
  Timer,
  Award,
  TrendingUp,
  Flame,
  UserPlus,
  MessageCircle,
  Search,
  Plus,
  Send,
  Check,
  X,
  Coins
} from 'lucide-react';

export function Compete() {
  const { user, awardPoints, calculatePointsForActivity } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActivity, setModalActivity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState(2);

  if (!user) return null;

  // Generate user rank based on total points (updated system)
  const getUserRank = () => {
    const points = user.totalPoints;
    
    if (points < 500) return { rank: 'Bronze', tier: 'III', color: 'text-orange-600 bg-orange-100', icon: Medal };
    if (points < 1000) return { rank: 'Bronze', tier: 'II', color: 'text-orange-600 bg-orange-100', icon: Medal };
    if (points < 1500) return { rank: 'Bronze', tier: 'I', color: 'text-orange-600 bg-orange-100', icon: Medal };
    if (points < 2500) return { rank: 'Silver', tier: 'III', color: 'text-gray-600 bg-gray-100', icon: Award };
    if (points < 4000) return { rank: 'Silver', tier: 'II', color: 'text-gray-600 bg-gray-100', icon: Award };
    if (points < 6000) return { rank: 'Silver', tier: 'I', color: 'text-gray-600 bg-gray-100', icon: Award };
    if (points < 8000) return { rank: 'Gold', tier: 'III', color: 'text-yellow-600 bg-yellow-100', icon: Trophy };
    if (points < 12000) return { rank: 'Gold', tier: 'II', color: 'text-yellow-600 bg-yellow-100', icon: Trophy };
    if (points < 16000) return { rank: 'Gold', tier: 'I', color: 'text-yellow-600 bg-yellow-100', icon: Trophy };
    return { rank: 'Platinum', tier: 'I', color: 'text-purple-600 bg-purple-100', icon: Crown };
  };

  const userRank = getUserRank();

  // Mock leaderboard data based on points
  const leaderboard = [
    { 
      id: 1, 
      name: 'GuitarMaster2024', 
      level: 'expert', 
      points: 18450, 
      rank: 'Platinum I', 
      streak: 45, 
      weeklyPoints: 850,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&auto=format',
      isFriend: true
    },
    { 
      id: 2, 
      name: 'StrumQueen', 
      level: 'advanced', 
      points: 14200, 
      rank: 'Gold I', 
      streak: 38, 
      weeklyPoints: 720,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&auto=format',
      isFriend: false
    },
    { 
      id: 3, 
      name: 'ChordWizard', 
      level: 'proficient', 
      points: 11800, 
      rank: 'Gold II', 
      streak: 32, 
      weeklyPoints: 590,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&auto=format',
      isFriend: true
    },
    { 
      id: 4, 
      name: user.name, 
      level: user.level, 
      points: user.totalPoints, 
      rank: `${userRank.rank} ${userRank.tier}`, 
      streak: user.practiceStreak, 
      weeklyPoints: user.weeklyPoints,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&auto=format',
      isFriend: false,
      isCurrentUser: true
    },
    { 
      id: 5, 
      name: 'PickMaster', 
      level: 'intermediate', 
      points: 3100, 
      rank: 'Silver I', 
      streak: 18, 
      weeklyPoints: 180,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&auto=format',
      isFriend: false
    },
    { 
      id: 6, 
      name: 'SixStringHero', 
      level: 'elementary', 
      points: 2850, 
      rank: 'Silver II', 
      streak: 22, 
      weeklyPoints: 165,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&auto=format',
      isFriend: true
    },
  ].sort((a, b) => b.points - a.points);

  // Mock friends data
  const friends = leaderboard.filter(player => player.isFriend);

  // Mock leagues data
  const leagues = [
    {
      id: 1,
      name: 'Acoustic Legends',
      members: 8,
      maxMembers: 10,
      averagePoints: 8200,
      totalPoints: 65600,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&auto=format',
      isJoined: true,
      description: 'For acoustic guitar enthusiasts'
    },
    {
      id: 2,
      name: 'Rock Warriors',
      members: 12,
      maxMembers: 15,
      averagePoints: 10800,
      totalPoints: 129600,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&auto=format',
      isJoined: false,
      description: 'Electric guitar and rock music focus'
    },
    {
      id: 3,
      name: 'Classical Masters',
      members: 6,
      maxMembers: 8,
      averagePoints: 15500,
      totalPoints: 93000,
      image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop&auto=format',
      isJoined: false,
      description: 'Classical guitar techniques and repertoire'
    }
  ];

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

  const handleJoinLeague = (leagueId: number) => {
    console.log('Joining league:', leagueId);
    // Award points for joining a league
    awardPoints({
      type: 'achievement_earned',
      points: calculatePointsForActivity('achievement_earned'),
      description: 'Joined a guitar league'
    });
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
    setModalActivity({
      type: 'practice',
      name: 'Battle Arena',
      description: 'Challenge other players in guitar duels'
    });
    setModalOpen(true);
  };

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'leagues', label: 'Leagues', icon: Shield }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return (
          <div className="space-y-4">
            {leaderboard.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  player.isCurrentUser 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {index === 0 && <Crown className="w-6 h-6 text-yellow-500" />}
                  {index === 1 && <Medal className="w-6 h-6 text-gray-500" />}
                  {index === 2 && <Medal className="w-6 h-6 text-orange-600" />}
                  {index > 2 && <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{index + 1}</span>}
                </div>
                
                <ImageWithFallback
                  src={player.avatar}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${player.isCurrentUser ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                      {player.name} {player.isCurrentUser && '(You)'}
                    </p>
                    {player.isFriend && <Users className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>{player.rank}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>+{player.weeklyPoints} this week</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <p className="font-bold text-gray-900 dark:text-white">{player.points.toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{player.streak} day streak</p>
                </div>
                
                {!player.isCurrentUser && (
                  <div className="flex gap-2">
                    {!player.isFriend && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleAddFriend(player.id)}
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSendMessage(player.id)}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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
              {friends.map((friend) => (
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
          <div className="space-y-6">
            {/* Create League Button */}
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New League
            </Button>

            {/* Leagues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {leagues.map((league) => (
                <Card key={league.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700 overflow-hidden">
                  <div className="relative h-32">
                    <ImageWithFallback
                      src={league.image}
                      alt={league.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-semibold">{league.name}</h3>
                      <p className="text-sm opacity-90">{league.members}/{league.maxMembers} members</p>
                    </div>
                    {league.isJoined && (
                      <div className="absolute top-4 right-4">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{league.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Avg Points</span>
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium dark:text-white">{league.averagePoints.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Points</span>
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium dark:text-white">{league.totalPoints.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Members</span>
                        <span className="dark:text-white">{league.members}/{league.maxMembers}</span>
                      </div>
                      <Progress value={(league.members / league.maxMembers) * 100} className="h-2" />
                    </div>
                    
                    <Button 
                      className={`w-full mt-4 ${
                        league.isJoined 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-blue-400 hover:bg-blue-500'
                      }`}
                      onClick={() => !league.isJoined && handleJoinLeague(league.id)}
                      disabled={league.isJoined}
                    >
                      {league.isJoined ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Joined
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Join League
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compete & Achieve</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Challenge yourself and compete with other players</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className={`inline-flex items-center gap-2 px-3 py-1 ${userRank.color} rounded-full`}>
              <userRank.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{userRank.rank} {userRank.tier}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Flame className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">{user.practiceStreak} day streak</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">{user.totalPoints.toLocaleString()} points</span>
            </div>
          </div>
        </div>

        {/* Current Rank & Progress */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-6">
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
                  <p className="text-3xl font-bold">{user.totalPoints.toLocaleString()}</p>
                </div>
                <p className="text-white/80">Total Points</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to next tier</span>
                <span>+{user.weeklyPoints} points this week</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Challenge */}
        <Card className="mb-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-orange-600" />
                <div>
                  <CardTitle className="dark:text-white">Weekly Challenge</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{weeklyChallenge.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Time left</p>
                <p className="font-bold text-orange-600">{weeklyChallenge.timeLeft}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="dark:text-gray-300">Progress</span>
                <span className="font-medium dark:text-white">{weeklyChallenge.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full" style={{ width: `${weeklyChallenge.progress}%` }}></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    <span>Reward: {weeklyChallenge.pointReward} pts</span>
                  </div>
                  <span>•</span>
                  <span>{weeklyChallenge.participants} participants</span>
                </div>
                <Button 
                  size="sm" 
                  className="bg-blue-400 hover:bg-blue-500"
                  onClick={handleContinueChallenge}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <Card className="mb-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
          <CardContent className="p-6">
            {renderTabContent()}
          </CardContent>
        </Card>

        {/* Battle Arena */}
        <Card className="mb-8 bg-gradient-to-r from-red-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Sword className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Battle Arena</h2>
                  <p className="text-white/80">Challenge other players to guitar duels</p>
                  <div className="flex items-center gap-1 text-sm text-white/70 mt-1">
                    <Coins className="w-3 h-3" />
                    <span>Win points based on opponent skill level</span>
                  </div>
                </div>
              </div>
              <Button 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={handleEnterArena}
              >
                <Shield className="w-4 h-4 mr-2" />
                Enter Arena
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom spacing for footer */}
        <div className="h-32"></div>
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