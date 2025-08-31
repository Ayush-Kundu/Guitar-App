import React, { createContext, useContext, useState, useEffect } from 'react';
import guitarContent from '../data/guitar-content';
import { websocketService, WebSocketMessage } from '../utils/websocket';

export interface User {
  id: string;
  name: string;
  email: string;
  level: 'novice' | 'beginner' | 'elementary' | 'intermediate' | 'proficient' | 'advanced' | 'expert';
  musicPreferences: string[]; // Array of 3 selected music themes
  practiceStreak: number;
  songsMastered: number;
  chordsLearned: number;
  hoursThisWeek: number;
  totalPoints: number; // Total points earned
  weeklyPoints: number; // Points earned this week
  levelProgress: number; // Progress within current level (0-100)
  joinDate: string;
  createdAt: string; // For Settings page
  username?: string; // Unique username for messaging
  avatar?: string; // Avatar emoji or identifier
  isOnline?: boolean; // Online status
}

export interface PointsActivity {
  id: string;
  type: 'practice' | 'song_completed' | 'chord_learned' | 'theory_completed' | 'battle_won' | 'streak_milestone' | 'achievement_earned' | 'technique_mastered';
  points: number;
  description: string;
  timestamp: string;
  difficulty?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system';
}

export interface Chat {
  id: string;
  type: 'private' | 'group';
  name?: string; // For group chats
  participants: string[]; // Array of user IDs
  participantNames: string[]; // Array of user names for display
  participantUsernames: string[]; // Array of usernames
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUsername: string;
  toUserId: string;
  toUserName: string;
  toUsername: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  username: string;
  userLevel: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  hasLiked?: boolean;
  type: 'post' | 'achievement' | 'milestone';
  likedBy?: string[]; // Array of user IDs who liked this post
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  recentPointsActivities: PointsActivity[];
  isConnected: boolean; // WebSocket connection status
  
  // Existing functions
  signUp: (userData: Partial<User> & { password: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  getProgressPercentage: () => number;
  getLevelProgressPercentage: () => number;
  getFilteredContent: (contentType: 'songs' | 'techniques' | 'theory' | 'competitions') => any[];
  awardPoints: (activity: Omit<PointsActivity, 'id' | 'timestamp'>) => void;
  calculatePointsForActivity: (activityType: string, difficulty?: number) => number;
  
  // Messaging functions
  friends: string[]; // Array of user IDs
  friendRequests: FriendRequest[];
  chats: Chat[];
  messages: ChatMessage[];
  communityPosts: CommunityPost[];
  allUsers: User[]; // Demo users for search
  onlineUsers: string[]; // Array of online user IDs
  
  searchUsers: (query: string) => User[];
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  createChat: (participantIds: string[], isGroup?: boolean, groupName?: string) => Promise<Chat>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  getChatMessages: (chatId: string) => ChatMessage[];
  createCommunityPost: (content: string) => Promise<void>;
  likeCommunityPost: (postId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Music themes available for selection
export const MUSIC_THEMES = [
  { id: 'rock', name: 'Rock', description: 'Classic and modern rock music' },
  { id: 'pop', name: 'Pop', description: 'Popular contemporary music' },
  { id: 'classical', name: 'Classical', description: 'Classical and orchestral pieces' },
  { id: 'folk', name: 'Folk', description: 'Traditional and folk songs' },
  { id: 'blues', name: 'Blues', description: 'Blues and soul music' },
  { id: 'jazz', name: 'Jazz', description: 'Jazz standards and improvisation' },
  { id: 'country', name: 'Country', description: 'Country and western music' },
  { id: 'reggae', name: 'Reggae', description: 'Reggae and ska music' },
  { id: 'metal', name: 'Metal', description: 'Heavy metal and progressive rock' },
  { id: 'indie', name: 'Indie', description: 'Independent and alternative music' },
  { id: 'latin', name: 'Latin', description: 'Latin American rhythms' },
  { id: 'world', name: 'World Music', description: 'Global and ethnic music' }
];

// Points system configuration
export const POINTS_CONFIG = {
  practice: { base: 10, multiplier: 1.5 },
  song_completed: { base: 50, multiplier: 10 },
  chord_learned: { base: 25, multiplier: 5 },
  theory_completed: { base: 30, multiplier: 8 },
  battle_won: { base: 100, multiplier: 15 },
  streak_milestone: { base: 75, multiplier: 25 },
  achievement_earned: { base: 150, multiplier: 0 },
  technique_mastered: { base: 40, multiplier: 12 },
  quiz_completed: { base: 20, multiplier: 5 }
};

// Level thresholds for progression within each level
const LEVEL_THRESHOLDS = {
  novice: { songsNeeded: 3, chordsNeeded: 5, techniquesNeeded: 5 },
  beginner: { songsNeeded: 6, chordsNeeded: 10, techniquesNeeded: 8 },
  elementary: { songsNeeded: 10, chordsNeeded: 15, techniquesNeeded: 12 },
  intermediate: { songsNeeded: 15, chordsNeeded: 20, techniquesNeeded: 15 },
  proficient: { songsNeeded: 20, chordsNeeded: 25, techniquesNeeded: 18 },
  advanced: { songsNeeded: 25, chordsNeeded: 30, techniquesNeeded: 22 },
  expert: { songsNeeded: 30, chordsNeeded: 35, techniquesNeeded: 25 }
};

// Utility function to generate unique IDs
const generateUniqueId = (prefix: string = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}_${random}`;
};

// Demo users for the community
const DEMO_USERS: User[] = [
  {
    id: 'user_sarah',
    name: 'Sarah Martinez',
    username: 'sarah_guitarist',
    email: 'sarah@example.com',
    level: 'intermediate',
    musicPreferences: ['rock', 'pop', 'indie'],
    practiceStreak: 12,
    songsMastered: 8,
    chordsLearned: 15,
    hoursThisWeek: 4.5,
    totalPoints: 2150,
    weeklyPoints: 180,
    levelProgress: 45,
    joinDate: '2024-01-15',
    createdAt: '2024-01-15',
    avatar: '🎸',
    isOnline: true
  },
  {
    id: 'user_mike',
    name: 'Mike Rodriguez',
    username: 'mike_shredder',
    email: 'mike@example.com',
    level: 'advanced',
    musicPreferences: ['metal', 'rock', 'blues'],
    practiceStreak: 25,
    songsMastered: 18,
    chordsLearned: 28,
    hoursThisWeek: 8.2,
    totalPoints: 4500,
    weeklyPoints: 290,
    levelProgress: 75,
    joinDate: '2023-11-20',
    createdAt: '2023-11-20',
    avatar: '🎵',
    isOnline: false
  },
  {
    id: 'user_emma',
    name: 'Emma Thompson',
    username: 'emma_strums',
    email: 'emma@example.com',
    level: 'beginner',
    musicPreferences: ['pop', 'folk', 'country'],
    practiceStreak: 8,
    songsMastered: 3,
    chordsLearned: 7,
    hoursThisWeek: 2.8,
    totalPoints: 850,
    weeklyPoints: 120,
    levelProgress: 30,
    joinDate: '2024-02-01',
    createdAt: '2024-02-01',
    avatar: '🌟',
    isOnline: true
  },
  {
    id: 'user_alex',
    name: 'Alex Chen',
    username: 'alex_fingers',
    email: 'alex@example.com',
    level: 'intermediate',
    musicPreferences: ['jazz', 'classical', 'blues'],
    practiceStreak: 15,
    songsMastered: 12,
    chordsLearned: 20,
    hoursThisWeek: 6.1,
    totalPoints: 3200,
    weeklyPoints: 220,
    levelProgress: 60,
    joinDate: '2023-12-10',
    createdAt: '2023-12-10',
    avatar: '🎶',
    isOnline: true
  },
  {
    id: 'user_lily',
    name: 'Lily Johnson',
    username: 'lily_acoustic',
    email: 'lily@example.com',
    level: 'proficient',
    musicPreferences: ['folk', 'indie', 'world'],
    practiceStreak: 33,
    songsMastered: 22,
    chordsLearned: 24,
    hoursThisWeek: 7.5,
    totalPoints: 5800,
    weeklyPoints: 340,
    levelProgress: 85,
    joinDate: '2023-09-05',
    createdAt: '2023-09-05',
    avatar: '✨',
    isOnline: false
  }
];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentPointsActivities, setRecentPointsActivities] = useState<PointsActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Messaging state
  const [friends, setFriends] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>(DEMO_USERS);
  const [onlineUsers, setOnlineUsers] = useState<string[]>(['user_sarah', 'user_emma', 'user_alex']);

  // WebSocket message handler with error handling
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    try {
      if (!message || !message.type || !message.data) {
        console.debug('Invalid WebSocket message structure, ignoring');
        return;
      }

      switch (message.type) {
        case 'message':
          if (message.data.chatId && message.data.content) {
            setMessages(prev => [...prev, message.data]);
            // Update chat's last message
            setChats(prev => 
              prev.map(chat => 
                chat.id === message.data.chatId 
                  ? { ...chat, lastMessage: message.data, updatedAt: message.timestamp }
                  : chat
              )
            );
          }
          break;
          
        case 'friend_request':
          if (message.data.id && message.data.fromUserId && message.data.toUserId) {
            setFriendRequests(prev => [...prev, message.data]);
          }
          break;
          
        case 'friend_accept':
          if (message.data.friendId && message.data.requestId) {
            setFriends(prev => [...new Set([...prev, message.data.friendId])]);
            setFriendRequests(prev => 
              prev.map(req => 
                req.id === message.data.requestId 
                  ? { ...req, status: 'accepted' as const }
                  : req
              )
            );
          }
          break;
          
        case 'community_post':
          if (message.data.id && message.data.content) {
            setCommunityPosts(prev => [message.data, ...prev]);
          }
          break;
          
        case 'chat_created':
          if (message.data.id && message.data.participants) {
            setChats(prev => [...prev, message.data]);
          }
          break;
          
        case 'user_online':
          if (message.data.userId) {
            setOnlineUsers(prev => [...new Set([...prev, message.data.userId])]);
            setAllUsers(prev => 
              prev.map(u => 
                u.id === message.data.userId 
                  ? { ...u, isOnline: true }
                  : u
              )
            );
          }
          break;
          
        case 'user_offline':
          if (message.data.userId) {
            setOnlineUsers(prev => prev.filter(id => id !== message.data.userId));
            setAllUsers(prev => 
              prev.map(u => 
                u.id === message.data.userId 
                  ? { ...u, isOnline: false }
                  : u
              )
            );
          }
          break;
          
        default:
          console.debug('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.debug('Error handling WebSocket message:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Load all data from localStorage
    const storedUser = localStorage.getItem('guitarAppUser');
    const storedActivities = localStorage.getItem('guitarAppPointsActivities');
    const storedFriends = localStorage.getItem('guitarAppFriends');
    const storedFriendRequests = localStorage.getItem('guitarAppFriendRequests');
    const storedChats = localStorage.getItem('guitarAppChats');
    const storedMessages = localStorage.getItem('guitarAppMessages');
    const storedCommunityPosts = localStorage.getItem('guitarAppCommunityPosts');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Generate username if not exists
        if (!userData.username) {
          userData.username = userData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substr(2, 4);
          userData.avatar = '🎸';
        }
        setUser(userData);
        console.log('Restored user session from localStorage');
        
        // Connect to WebSocket
        websocketService.connect(userData.id).then(connected => {
          setIsConnected(connected);
          if (connected) {
            console.log('Connected to WebSocket server');
          } else {
            console.log('Failed to connect to WebSocket server, using offline mode');
          }
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('guitarAppUser');
      }
    }

    // Load offline data
    if (storedActivities) {
      try {
        setRecentPointsActivities(JSON.parse(storedActivities));
      } catch (error) {
        console.error('Error parsing stored activities:', error);
      }
    }

    if (storedFriends) {
      try {
        setFriends(JSON.parse(storedFriends));
      } catch (error) {
        console.error('Error parsing stored friends:', error);
      }
    }

    if (storedFriendRequests) {
      try {
        setFriendRequests(JSON.parse(storedFriendRequests));
      } catch (error) {
        console.error('Error parsing stored friend requests:', error);
      }
    }

    if (storedChats) {
      try {
        setChats(JSON.parse(storedChats));
      } catch (error) {
        console.error('Error parsing stored chats:', error);
      }
    }

    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (error) {
        console.error('Error parsing stored messages:', error);
      }
    }

    if (storedCommunityPosts) {
      try {
        setCommunityPosts(JSON.parse(storedCommunityPosts));
      } catch (error) {
        console.error('Error parsing stored community posts:', error);
      }
    } else {
      // Initialize with some demo community posts
      const demoPosts: CommunityPost[] = [
        {
          id: 'post_1',
          userId: 'user_sarah',
          userName: 'Sarah Martinez',
          username: 'sarah_guitarist',
          userLevel: 'intermediate',
          avatar: '🎸',
          content: 'Just nailed the F chord transition! After weeks of practice, it finally clicked. Never give up, fellow guitarists! 🎉',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 24,
          comments: 8,
          shares: 3,
          type: 'post',
          likedBy: ['user_emma', 'user_alex']
        },
        {
          id: 'post_2',
          userId: 'user_mike',
          userName: 'Mike Rodriguez',
          username: 'mike_shredder',
          userLevel: 'advanced',
          avatar: '🎵',
          content: 'Check out my cover of "Blackbird" - finally got the fingerpicking down! What song should I tackle next?',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 45,
          comments: 12,
          shares: 7,
          type: 'post',
          likedBy: ['user_sarah', 'user_lily', 'user_alex']
        }
      ];
      setCommunityPosts(demoPosts);
      localStorage.setItem('guitarAppCommunityPosts', JSON.stringify(demoPosts));
    }
    
    setIsLoading(false);
  }, []);

  // Setup WebSocket listeners
  useEffect(() => {
    const unsubscribeMessage = websocketService.onMessage(handleWebSocketMessage);
    const unsubscribeConnection = websocketService.onConnectionChange(setIsConnected);

    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
    };
  }, []);

  // Save to localStorage whenever data changes (backup for offline mode)
  useEffect(() => {
    if (typeof window !== 'undefined' && friends.length > 0) {
      localStorage.setItem('guitarAppFriends', JSON.stringify(friends));
    }
  }, [friends]);

  useEffect(() => {
    if (typeof window !== 'undefined' && friendRequests.length > 0) {
      localStorage.setItem('guitarAppFriendRequests', JSON.stringify(friendRequests));
    }
  }, [friendRequests]);

  useEffect(() => {
    if (typeof window !== 'undefined' && chats.length > 0) {
      localStorage.setItem('guitarAppChats', JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('guitarAppMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && communityPosts.length > 0) {
      localStorage.setItem('guitarAppCommunityPosts', JSON.stringify(communityPosts));
    }
  }, [communityPosts]);

  const calculatePointsForActivity = (activityType: string, difficulty: number = 1): number => {
    const config = POINTS_CONFIG[activityType as keyof typeof POINTS_CONFIG];
    if (!config) return 0;
    
    return Math.round(config.base + (config.multiplier * difficulty));
  };

  const awardPoints = (activity: Omit<PointsActivity, 'id' | 'timestamp'>) => {
    if (!user) return;

    const newActivity: PointsActivity = {
      ...activity,
      id: generateUniqueId('activity_'),
      timestamp: new Date().toISOString()
    };

    // Update user points
    const updatedUser = {
      ...user,
      totalPoints: user.totalPoints + activity.points,
      weeklyPoints: user.weeklyPoints + activity.points
    };

    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('guitarAppUser', JSON.stringify(updatedUser));
    }

    // Update recent activities (keep last 20)
    const updatedActivities = [newActivity, ...recentPointsActivities].slice(0, 20);
    setRecentPointsActivities(updatedActivities);
    if (typeof window !== 'undefined') {
      localStorage.setItem('guitarAppPointsActivities', JSON.stringify(updatedActivities));
    }
  };

  const createDemoUser = (userData?: Partial<User>): User => {
    const now = new Date().toISOString();
    const username = userData?.name ? 
      userData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substr(2, 4) :
      'user_' + Math.random().toString(36).substr(2, 6);
    
    return {
      id: 'demo_' + Math.random().toString(36).substr(2, 9),
      name: userData?.name || 'Demo User',
      username: username,
      email: userData?.email || 'demo@example.com',
      level: userData?.level || 'beginner',
      musicPreferences: userData?.musicPreferences || ['rock', 'pop', 'blues'],
      practiceStreak: userData?.practiceStreak || 0,
      songsMastered: userData?.songsMastered || 0,
      chordsLearned: userData?.chordsLearned || (userData?.level === 'novice' ? 0 : userData?.level === 'beginner' ? 3 : 8),
      hoursThisWeek: userData?.hoursThisWeek || 0,
      totalPoints: userData?.totalPoints || 0,
      weeklyPoints: userData?.weeklyPoints || 0,
      levelProgress: userData?.levelProgress || 0,
      joinDate: userData?.joinDate || now,
      createdAt: userData?.createdAt || now,
      avatar: userData?.avatar || '🎸',
      isOnline: true
    };
  };

  const signUp = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    
    try {
      // Create demo user for all signups
      const demoUser = createDemoUser(userData);
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('guitarAppUser', JSON.stringify(demoUser));
      }
      
      // Connect to WebSocket
      const connected = await websocketService.connect(demoUser.id);
      setIsConnected(connected);
      
      console.log('Created demo account. Your progress will be saved locally.');
      
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Demo login mode');
      
      // Create demo user based on email
      let demoUserData: Partial<User> = {
        name: 'Demo User',
        email: email,
        level: 'beginner',
        musicPreferences: ['rock', 'pop', 'blues']
      };

      // Special demo user with pre-filled data
      if (email === 'demo@example.com') {
        demoUserData = {
          ...demoUserData,
          practiceStreak: 5,
          songsMastered: 3,
          chordsLearned: 8,
          hoursThisWeek: 2.5,
          totalPoints: 1250,
          weeklyPoints: 320,
          levelProgress: 65
        };
      }

      const demoUser = createDemoUser(demoUserData);
      setUser(demoUser);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('guitarAppUser', JSON.stringify(demoUser));
      }
      
      // Connect to WebSocket
      const connected = await websocketService.connect(demoUser.id);
      setIsConnected(connected);
      
    } catch (error) {
      console.error('Signin error:', error);
      throw new Error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    websocketService.disconnect();
    setUser(null);
    setRecentPointsActivities([]);
    setFriends([]);
    setFriendRequests([]);
    setChats([]);
    setMessages([]);
    setCommunityPosts([]);
    setIsConnected(false);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guitarAppUser');
      localStorage.removeItem('guitarAppPointsActivities');
      localStorage.removeItem('guitarAppFriends');
      localStorage.removeItem('guitarAppFriendRequests');
      localStorage.removeItem('guitarAppChats');
      localStorage.removeItem('guitarAppMessages');
      localStorage.removeItem('guitarAppCommunityPosts');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('guitarAppUser', JSON.stringify(updatedUser));
      }
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('guitarAppUser', JSON.stringify(updatedUser));
    }
  };

  const getProgressPercentage = () => {
    if (!user) return 0;
    
    const levelOrder = ['novice', 'beginner', 'elementary', 'intermediate', 'proficient', 'advanced', 'expert'];
    const currentIndex = levelOrder.indexOf(user.level);
    const baseProgress = (currentIndex / (levelOrder.length - 1)) * 100;
    
    const withinLevelProgress = Math.min((user.chordsLearned * 2 + user.songsMastered * 5), 20);
    
    return Math.min(baseProgress + withinLevelProgress, 100);
  };

  const getLevelProgressPercentage = () => {
    if (!user) return 0;
    
    const threshold = LEVEL_THRESHOLDS[user.level as keyof typeof LEVEL_THRESHOLDS];
    if (!threshold) return 0;
    
    const songProgress = Math.min((user.songsMastered / threshold.songsNeeded) * 100, 100);
    const chordProgress = Math.min((user.chordsLearned / threshold.chordsNeeded) * 100, 100);
    
    const averageProgress = (songProgress + chordProgress) / 2;
    
    return user.levelProgress || Math.round(averageProgress);
  };

  const getFilteredContent = (contentType: 'songs' | 'techniques' | 'theory' | 'competitions') => {
    if (!user) return [];

    try {
      const content = guitarContent[contentType];
      const levelContent = content[user.level as keyof typeof content];
      
      if (!levelContent) return [];

      let filteredContent: any[] = [];

      if (contentType === 'songs' || contentType === 'techniques' || contentType === 'theory') {
        if (contentType === 'songs') {
          user.musicPreferences.forEach(theme => {
            const themeContent = levelContent[theme as keyof typeof levelContent];
            if (themeContent) {
              filteredContent = [...filteredContent, ...themeContent];
            }
          });
        } else {
          Object.values(levelContent).forEach((categoryContent: any) => {
            if (Array.isArray(categoryContent)) {
              filteredContent = [...filteredContent, ...categoryContent];
            }
          });
        }
      } else if (contentType === 'competitions') {
        filteredContent = levelContent as any[];
      }

      const uniqueContent = filteredContent.filter((item, index, self) => 
        index === self.findIndex(t => (t.title || t.name) === (item.title || item.name))
      );

      return uniqueContent.map((item) => ({
        ...item,
        progress: Math.floor(Math.random() * 100)
      }));
    } catch (error) {
      console.error('Error loading content:', error);
      return [];
    }
  };

  // Messaging functions
  const searchUsers = (query: string): User[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return allUsers.filter(u => 
      u.username?.toLowerCase().includes(searchTerm) ||
      u.name.toLowerCase().includes(searchTerm)
    );
  };

  const sendFriendRequest = async (username: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');
    
    const targetUser = allUsers.find(u => u.username === username);
    if (!targetUser) throw new Error('User not found');
    
    if (friends.includes(targetUser.id)) {
      throw new Error('Already friends with this user');
    }
    
    if (friendRequests.some(req => 
      req.fromUserId === user.id && req.toUserId === targetUser.id && req.status === 'pending'
    )) {
      throw new Error('Friend request already sent');
    }

    const newRequest: FriendRequest = {
      id: generateUniqueId('request_'),
      fromUserId: user.id,
      fromUserName: user.name,
      fromUsername: user.username!,
      toUserId: targetUser.id,
      toUserName: targetUser.name,
      toUsername: targetUser.username!,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    // Send via WebSocket if connected
    if (isConnected) {
      websocketService.send({
        type: 'friend_request',
        data: newRequest,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    }

    setFriendRequests(prev => [...prev, newRequest]);
  };

  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    const request = friendRequests.find(req => req.id === requestId);
    if (!request) throw new Error('Friend request not found');

    // Add to friends list
    setFriends(prev => [...prev, request.fromUserId]);
    
    // Update request status
    setFriendRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'accepted' as const }
          : req
      )
    );

    // Send via WebSocket if connected
    if (isConnected && user) {
      websocketService.send({
        type: 'friend_accept',
        data: { requestId, friendId: request.fromUserId },
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    }
  };

  const declineFriendRequest = async (requestId: string): Promise<void> => {
    setFriendRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'declined' as const }
          : req
      )
    );
  };

  const createChat = async (participantIds: string[], isGroup: boolean = false, groupName?: string): Promise<Chat> => {
    if (!user) throw new Error('User not logged in');

    const allParticipants = [user.id, ...participantIds];
    const participantUsers = [user, ...allUsers.filter(u => participantIds.includes(u.id))];
    
    const newChat: Chat = {
      id: Date.now().toString(),
      type: isGroup ? 'group' : 'private',
      name: groupName,
      participants: allParticipants,
      participantNames: participantUsers.map(u => u.name),
      participantUsernames: participantUsers.map(u => u.username!),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setChats(prev => [...prev, newChat]);
    
    // Send via WebSocket if connected
    if (isConnected) {
      websocketService.send({
        type: 'chat_created',
        data: newChat,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    }
    
    // Send system message for group chats
    if (isGroup && groupName) {
      const systemMessage: ChatMessage = {
        id: Date.now().toString() + '_system',
        chatId: newChat.id,
        senderId: 'system',
        senderName: 'System',
        senderUsername: 'system',
        content: `${user.name} created the group "${groupName}"`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      
      setMessages(prev => [...prev, systemMessage]);
    }

    return newChat;
  };

  const sendMessage = async (chatId: string, content: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      chatId,
      senderId: user.id,
      senderName: user.name,
      senderUsername: user.username!,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    // Send via WebSocket if connected
    if (isConnected) {
      websocketService.send({
        type: 'message',
        data: newMessage,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    }

    setMessages(prev => [...prev, newMessage]);
    
    // Update chat's last message and updatedAt
    setChats(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, lastMessage: newMessage, updatedAt: new Date().toISOString() }
          : chat
      )
    );
  };

  const getChatMessages = (chatId: string): ChatMessage[] => {
    return messages
      .filter(msg => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const createCommunityPost = async (content: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      username: user.username!,
      userLevel: user.level,
      avatar: user.avatar!,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      type: 'post',
      likedBy: []
    };

    // Send via WebSocket if connected
    if (isConnected) {
      websocketService.send({
        type: 'community_post',
        data: newPost,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    }

    setCommunityPosts(prev => [newPost, ...prev]);
  };

  const likeCommunityPost = (postId: string): void => {
    if (!user) return;

    setCommunityPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          const likedBy = post.likedBy || [];
          const hasLiked = likedBy.includes(user.id);
          
          return {
            ...post,
            likes: hasLiked ? post.likes - 1 : post.likes + 1,
            hasLiked: !hasLiked,
            likedBy: hasLiked 
              ? likedBy.filter(id => id !== user.id)
              : [...likedBy, user.id]
          };
        }
        return post;
      })
    );
  };

  const value: UserContextType = {
    user,
    isLoading,
    recentPointsActivities,
    isConnected,
    signUp,
    signIn,
    signOut,
    updateUser,
    updateProfile,
    getProgressPercentage,
    getLevelProgressPercentage,
    getFilteredContent,
    awardPoints,
    calculatePointsForActivity,
    
    // Messaging
    friends,
    friendRequests,
    chats,
    messages,
    communityPosts,
    allUsers,
    onlineUsers,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    createChat,
    sendMessage,
    getChatMessages,
    createCommunityPost,
    likeCommunityPost
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}