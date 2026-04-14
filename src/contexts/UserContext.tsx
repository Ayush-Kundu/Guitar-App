import React, { createContext, useContext, useState, useEffect } from 'react';
import guitarContent from '../data/guitar-content';
import { getTechniquePath, getTheoryPath } from '../data/learning-journey';
import { websocketService, WebSocketMessage } from '../utils/websocket';
import { createLocalPost } from '../api/local-posts';
import { type Session } from '@supabase/supabase-js';
import { loadProgress, getSelectedSongs, getAllSongProgress, loadProgressFromSupabase, syncFullProgressToSupabase } from '../utils/progressStorage';
import { scanUserGeneratedText } from '../utils/contentModeration';
import {
  clearLocalUserState,
  fetchModerationBanStatus,
  invokeModerationEnforceEdge,
  MODERATION_ERR,
  purgeUserDataBestEffort,
} from '../utils/moderationPurge';
import { playAchievementPoints } from '../utils/soundEffects';
import { supabase } from '../lib/supabase';
import { isNative } from '../utils/capacitor';
import { Browser } from '@capacitor/browser';
import { App as CapacitorApp } from '@capacitor/app';
import { isNativeGoogleConfigured, nativeGoogleSignIn, nativeGoogleSignOut } from '../utils/nativeGoogleAuth';

export { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Custom URL scheme used for OAuth callbacks on native (iOS/Android).
 * Must match an entry in `CFBundleURLSchemes` (iOS Info.plist) and be added to Supabase Auth → Redirect URLs.
 */
const NATIVE_OAUTH_REDIRECT = 'com.strummyak.app://auth-callback';

/**
 * OAuth redirect URL — must match a Supabase Auth redirect allowlist entry exactly (including trailing slash).
 * Native (Capacitor): uses `com.strummyak.app://auth-callback` so Google can return to the app via custom scheme.
 * Web: `window.location.origin + "/"` (e.g. `http://localhost:3001/` when using Vite on port 3001).
 * Set `VITE_AUTH_REDIRECT_URL` for a fixed return URL (e.g. production at `https://strummy.studio/`).
 */
function getOAuthRedirectTo(): string | undefined {
  if (isNative()) return NATIVE_OAUTH_REDIRECT;
  if (typeof window === 'undefined') return undefined;
  const fromEnv = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();
  if (fromEnv) return fromEnv;
  return `${window.location.origin}/`;
}

// Export the function to fetch users from Supabase
export const fetchUsersFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")        // 👈 Change to profiles table
      .select("user_id, username, guitar_level"); // 👈 Only use existing columns
    if (error) {
      return [];
    } else {
      return data || [];
    }
  } catch (error) {
    return [];
  }
};

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
  /** Practice coins (~3× scarcer than points); store spend TBD */
  totalCoins: number;
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
  signInWithGoogle: () => Promise<void>;
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
  setCommunityPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  
  searchUsers: (query: string) => User[];
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  blockedUsers: string[];
  createChat: (participantIds: string[], isGroup?: boolean, groupName?: string) => Promise<Chat>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  getChatMessages: (chatId: string) => ChatMessage[];
  createCommunityPost: (content: string) => Promise<void>;
  /** Throws MODERATION_ERR and removes account if text violates policy. */
  enforceOutgoingTextPolicy: (text: string) => Promise<void>;
  likeCommunityPost: (postId: string) => void;
  fetchCommunityPosts: () => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  fetchUsersFromSupabase: () => Promise<void>; // Add this
  syncProfileToSupabase: () => Promise<void>; // Sync points, compete level, and streak to Supabase
  fetchFriendRequests: () => Promise<void>; // Fetch friend requests from Supabase
  fetchFriends: () => Promise<void>; // Fetch friends from Supabase
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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentPointsActivities, setRecentPointsActivities] = useState<PointsActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Messaging state
  const [friends, setFriends] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  // Initialize with empty array - will be populated from Supabase
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Helper function to get API base URL
  const getApiUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return '';
    // Extract project ref from Supabase URL
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!match) return '';
    const projectRef = match[1];
    return `${supabaseUrl}/functions/v1/make-server-4ea82950`;
  };

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        return null;
      }
      return session?.access_token || null;
    } catch (error) {
      return null;
    }
  };

  // WebSocket message handler with error handling
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    try {
      if (!message || !message.type || !message.data) {
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
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Check for active session in localStorage
    const initializeAuth = async () => {
      try {
        // Check for saved session
        const savedSession = localStorage.getItem('guitarAppSession');
        const savedUser = localStorage.getItem('guitarAppUser');
        
        if (savedSession && savedUser) {
          const session = JSON.parse(savedSession);
          
          // Verify session by fetching profile from Supabase
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.userId)
            .single();
          
          if (profile && !error) {
            const ban = await fetchModerationBanStatus();
            if (ban.banned) {
              clearLocalUserState();
              localStorage.removeItem('guitarAppSession');
              setIsLoading(false);
              return;
            }

            // Create user object from profile
          const userData: User = {
              id: profile.user_id,
              name: profile.username || 'User',
              email: profile.email || session.email || '',
              username: profile.username || 'user',
              level: profile.guitar_level || 'beginner',
              musicPreferences: [
                profile.style_1 || 'rock',
                profile.style_2 || 'pop',
                profile.style_3 || 'blues'
              ],
              practiceStreak: profile.streak || 0,
              songsMastered: 0,
              chordsLearned: 0,
              hoursThisWeek: 0,
              totalPoints: profile.points || 0,
              totalCoins: 0,
              weeklyPoints: 0,
              levelProgress: 0,
              joinDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              avatar: '🎸',
            isOnline: true
          };
          
          try {
            const lp = loadProgress(profile.user_id);
            userData.totalCoins = typeof lp.totalCoins === 'number' ? lp.totalCoins : 0;
            userData.totalPoints = typeof lp.totalPoints === 'number' ? lp.totalPoints : userData.totalPoints;
          } catch (_) {}
          
          setUser(userData);
          localStorage.setItem('guitarAppUser', JSON.stringify(userData));
            
            // Load progress from Supabase
            try {
              const cloudProgress = await loadProgressFromSupabase(profile.user_id);
              if (cloudProgress) {
              }
            } catch (err) {
            }
          
          // Connect to WebSocket
          websocketService.connect(userData.id).then(connected => {
            setIsConnected(connected);
          });
          
            setIsLoading(false);
            return; // Exit early, we have a valid session
          } else {
            // Clear invalid session
            localStorage.removeItem('guitarAppSession');
            localStorage.removeItem('guitarAppUser');
          }
        }
      } catch (error) {
        // Clear potentially corrupted session data
        localStorage.removeItem('guitarAppSession');
        localStorage.removeItem('guitarAppUser');
      }
      
      // No valid session - show login page
      setIsLoading(false);
    };
    
    initializeAuth();

    // Load all data from localStorage
    const storedActivities = localStorage.getItem('guitarAppPointsActivities');
    const storedFriends = localStorage.getItem('guitarAppFriends');
    const storedFriendRequests = localStorage.getItem('guitarAppFriendRequests');
    const storedChats = localStorage.getItem('guitarAppChats');
    const storedMessages = localStorage.getItem('guitarAppMessages');
    const storedCommunityPosts = localStorage.getItem('guitarAppCommunityPosts');

    // Load offline data
    if (storedActivities) {
      try {
        setRecentPointsActivities(JSON.parse(storedActivities));
      } catch (error) {
      }
    }

    if (storedFriends) {
      try {
        setFriends(JSON.parse(storedFriends));
      } catch (error) {
      }
    }

    if (storedFriendRequests) {
      try {
        setFriendRequests(JSON.parse(storedFriendRequests));
      } catch (error) {
      }
    }

    if (storedChats) {
      try {
        setChats(JSON.parse(storedChats));
      } catch (error) {
      }
    }

    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (error) {
      }
    }

    if (storedCommunityPosts) {
      try {
        setCommunityPosts(JSON.parse(storedCommunityPosts));
      } catch (error) {
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
    
    // Fetch users from Supabase
    fetchUsersFromSupabase();
  }, []);

  // No longer using Supabase Auth listeners - using custom session management

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
      try { localStorage.setItem('guitarAppFriends', JSON.stringify(friends)); } catch (_) { /* quota exceeded */ }
    }
  }, [friends]);

  useEffect(() => {
    if (typeof window !== 'undefined' && friendRequests.length > 0) {
      try { localStorage.setItem('guitarAppFriendRequests', JSON.stringify(friendRequests)); } catch (_) { /* quota exceeded */ }
    }
  }, [friendRequests]);

  useEffect(() => {
    if (typeof window !== 'undefined' && chats.length > 0) {
      try { localStorage.setItem('guitarAppChats', JSON.stringify(chats)); } catch (_) { /* quota exceeded */ }
    }
  }, [chats]);

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try { localStorage.setItem('guitarAppMessages', JSON.stringify(messages)); } catch (_) { /* quota exceeded */ }
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && communityPosts.length > 0) {
      try { localStorage.setItem('guitarAppCommunityPosts', JSON.stringify(communityPosts)); } catch (_) { /* quota exceeded */ }
    }
  }, [communityPosts]);

  // Fetch functions for friends data (defined before useEffect hooks)
  const fetchFriends = React.useCallback(async () => {
    if (!user) return;

    try {
      
      const friendIds: string[] = [];
      
      // PRIMARY SOURCE: Fetch from friend_requests where status = 'accepted'
      // This is the most reliable source since we update the status when accepting
      
      // Get accepted requests where current user SENT the request (friend is to_user_id)
      const { data: sentAccepted, error: sentError } = await supabase
        .from('friend_requests')
        .select('to_user_id, to_user_name')
        .eq('from_user_id', user.id)
        .eq('status', 'accepted');
      
      
      if (sentAccepted) {
        friendIds.push(...sentAccepted.map(r => r.to_user_id));
      }
      
      // Get accepted requests where current user RECEIVED the request (friend is from_user_id)
      const { data: receivedAccepted, error: receivedError } = await supabase
        .from('friend_requests')
        .select('from_user_id, from_user_name')
        .eq('to_user_id', user.id)
        .eq('status', 'accepted');
      
      
      if (receivedAccepted) {
        friendIds.push(...receivedAccepted.map(r => r.from_user_id));
      }
      
      // SECONDARY SOURCE: Also check friendships table as backup
      const { data: friendships1 } = await supabase
        .from('friendships')
        .select('user_id_2')
        .eq('user_id_1', user.id);

      const { data: friendships2 } = await supabase
        .from('friendships')
        .select('user_id_1')
        .eq('user_id_2', user.id);

      if (friendships1) {
        friendIds.push(...friendships1.map(f => f.user_id_2));
      }
      if (friendships2) {
        friendIds.push(...friendships2.map(f => f.user_id_1));
      }
      

      // Remove duplicates and filter out any null/undefined values
      const uniqueFriendIds = [...new Set(friendIds)].filter(id => id != null);
      
      
      setFriends(uniqueFriendIds);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('guitarAppFriends', JSON.stringify(uniqueFriendIds));
      }
    } catch (error) {
      
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const storedFriends = localStorage.getItem('guitarAppFriends');
        if (storedFriends) {
          try {
            setFriends(JSON.parse(storedFriends));
          } catch (e) {
          }
        }
      }
    }
  }, [user]);

  const fetchFriendRequests = React.useCallback(async () => {
    if (!user) {
      return;
    }
    
    
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      const storedRequests = localStorage.getItem('guitarAppFriendRequests');
      if (storedRequests) {
        try {
          const parsedRequests = JSON.parse(storedRequests);
          setFriendRequests(parsedRequests);
        } catch (error) {
        }
      }
      return;
    }

    try {
      // Fetch ALL pending requests where user is either sender or receiver
      
      // First, let's see ALL pending friend requests in the table
      const { data: allPendingRequests, error: allError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('status', 'pending');
      
      
      if (allPendingRequests && allPendingRequests.length > 0) {
        allPendingRequests.forEach((req, i) => {
          const isReceiver = req.to_user_id === user.id;
          const isSender = req.from_user_id === user.id;
        });
      }

      // Fetch received requests (where user is the recipient)
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('to_user_id', user.id)
        .eq('status', 'pending');

      // Fetch sent requests (where user is the sender)
      const { data: sentRequests, error: sentError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('from_user_id', user.id)
        .eq('status', 'pending');

      // If both queries failed, fall back to localStorage
      if (receivedError && sentError) {
        
        const storedRequests = localStorage.getItem('guitarAppFriendRequests');
        if (storedRequests) {
          try {
            const parsedRequests = JSON.parse(storedRequests);
            setFriendRequests(parsedRequests);
          } catch (error) {
          }
        }
        return;
      }

      // Format received requests
      const formattedReceived = (receivedRequests || []).map((req: any) => {
        // Try to find profile in allUsers
        const profile = allUsers.find(u => u.id === req.from_user_id);
        return {
          id: String(req.id),
          fromUserId: req.from_user_id,
          fromUserName: req.from_user_name || profile?.name || 'User',
          fromUsername: profile?.username || req.from_user_name || 'user',
          toUserId: req.to_user_id,
          toUserName: req.to_user_name || user.name,
          toUsername: user.username || '',
          status: req.status,
          timestamp: req.created_at
        };
      });

      // Format sent requests
      const formattedSent = (sentRequests || []).map((req: any) => {
        const profile = allUsers.find(u => u.id === req.to_user_id);
        return {
          id: String(req.id),
          fromUserId: req.from_user_id,
          fromUserName: req.from_user_name || user.name,
          fromUsername: user.username || '',
          toUserId: req.to_user_id,
          toUserName: req.to_user_name || profile?.name || 'User',
          toUsername: profile?.username || req.to_user_name || 'user',
          status: req.status,
          timestamp: req.created_at
        };
      });

      const allRequests = [...formattedReceived, ...formattedSent];
      setFriendRequests(allRequests);
      
      // Also save to localStorage as backup
      localStorage.setItem('guitarAppFriendRequests', JSON.stringify(allRequests));
      
      if (formattedReceived.length > 0) {
        formattedReceived.forEach((req, i) => {
        });
      }
      
    } catch (error) {
      
      // Fall back to localStorage
      const storedRequests = localStorage.getItem('guitarAppFriendRequests');
      if (storedRequests) {
        try {
          const parsedRequests = JSON.parse(storedRequests);
          setFriendRequests(parsedRequests);
        } catch (parseError) {
        }
      }
    }
  }, [user, allUsers]);

  const fetchBlockedUsers = React.useCallback(async () => {
    if (!user) return;

    try {
      // Fetch blocked users from Supabase where current user is the blocker
      const { data: blockedData, error: blockedError } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);

      if (blockedError) {
        return;
      }

      if (blockedData) {
        const blockedIds = blockedData.map(b => b.blocked_id);
        setBlockedUsers(blockedIds);
      }
    } catch (error) {
    }
  }, [user]);

  // Fetch chats from Supabase
  const fetchChats = React.useCallback(async () => {
    if (!user) return;

    try {
      
      // Fetch chats where user is either participant_1 or participant_2
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (chatsError) {
        // Fall back to localStorage
        const storedChats = localStorage.getItem('guitarAppChats');
        if (storedChats) {
          try {
            setChats(JSON.parse(storedChats));
          } catch (e) {
          }
        }
        return;
      }

      if (chatsData && chatsData.length > 0) {
        
        // Convert Supabase format to local Chat format
        const formattedChats: Chat[] = chatsData.map(chat => {
          const participant1 = chat.participant_1;
          const participant2 = chat.participant_2;
          const participants = [participant1, participant2].filter(Boolean);
          
          // Get participant names from allUsers
          const participantUsers = participants.map(pId => allUsers.find(u => u.id === pId));
          
          return {
            id: chat.id,
            type: chat.type as 'private' | 'group',
            name: chat.name,
            participants: participants,
            participantNames: participantUsers.map(u => u?.name || 'Unknown'),
            participantUsernames: participantUsers.map(u => u?.username || 'unknown'),
            createdAt: chat.created_at,
            updatedAt: chat.updated_at
          };
        });

        // NOTE: Don't setChats yet - we'll do it after processing friend_messages
        // since we may need to add auto-generated chats
        
        // Log the chats we found to help debug matching
        formattedChats.forEach(chat => {
        });

        // Fetch messages from friend_messages table (primary source)
        
        // Fetch ALL messages and filter client-side (more reliable than .or() query)
        const { data: allFriendMsgs, error: friendMsgsError } = await supabase
          .from('friend_messages')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (friendMsgsError) {
        } else {
        }
        
        // Filter to messages where current user is sender OR receiver
        const friendMsgsData = (allFriendMsgs || []).filter(msg => 
          msg.send_user === user.id || msg.receive_user === user.id
        );
        
        friendMsgsData.forEach((m, i) => {
        });
        
        // Convert friend_messages to ChatMessage format
        const friendMessages: ChatMessage[] = [];
        
        if (friendMsgsData && friendMsgsData.length > 0) {
          
          for (const msg of friendMsgsData) {
            
            // Get sender info
            const senderUser = allUsers.find(u => u.id === msg.send_user);
            
            // Determine who the "other" user is in this conversation
            const otherUserId = msg.send_user === user.id ? msg.receive_user : msg.send_user;
            
            // Find the chat that involves BOTH the current user AND the other user
            let matchingChat = formattedChats.find(chat => {
              const hasCurrentUser = chat.participants.includes(user.id);
              const hasOtherUser = chat.participants.includes(otherUserId);
              if (hasCurrentUser || hasOtherUser) {
              }
              return hasCurrentUser && hasOtherUser;
            });
            
            // Strategy 2: Find ANY private chat that has the other user
            if (!matchingChat) {
              matchingChat = formattedChats.find(chat => 
                chat.type === 'private' && chat.participants.includes(otherUserId)
              );
              if (matchingChat) {
              }
            }
            
            // Strategy 3: Find the most recent private chat for current user
            if (!matchingChat) {
              matchingChat = formattedChats.find(chat => 
                chat.type === 'private' && chat.participants.includes(user.id)
              );
              if (matchingChat) {
                // Update this chat to include the other user
                if (!matchingChat.participants.includes(otherUserId)) {
                  matchingChat.participants.push(otherUserId);
                }
              }
            }
            
            // Determine the chatId to use
            let chatIdToUse: string;
            
            if (matchingChat) {
              chatIdToUse = matchingChat.id;
            } else {
              // Create deterministic chat ID from sorted user IDs
              const sortedIds = [msg.send_user, msg.receive_user].sort();
              chatIdToUse = `chat_${sortedIds[0].substring(0, 8)}_${sortedIds[1].substring(0, 8)}`;
              
              // Add this chat to formattedChats
              const receiverUser = allUsers.find(u => u.id === msg.receive_user);
              formattedChats.push({
                id: chatIdToUse,
                type: 'private',
                participants: [msg.send_user, msg.receive_user],
                participantNames: [senderUser?.name || 'Unknown', receiverUser?.name || 'Unknown'],
                participantUsernames: [senderUser?.username || 'unknown', receiverUser?.username || 'unknown'],
                createdAt: msg.created_at,
                updatedAt: msg.created_at
              });
            }
            
            const formattedMessage: ChatMessage = {
              id: `fm_${msg.id}`,
              chatId: chatIdToUse,
              senderId: msg.send_user,
              senderName: senderUser?.name || 'Unknown',
              senderUsername: senderUser?.username || 'unknown',
              content: msg.message,
              timestamp: msg.created_at,
              type: 'text'
            };
            
            friendMessages.push(formattedMessage);
          }
        }
        
        
        // Also fetch from messages table as backup
        const chatIds = formattedChats.map(c => c.id);
        let messagesTableData: ChatMessage[] = [];
        
        if (chatIds.length > 0) {
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .in('chat_id', chatIds)
            .order('created_at', { ascending: true });

          if (!messagesError && messagesData) {
            
            messagesTableData = messagesData.map(msg => ({
              id: msg.id,
              chatId: msg.chat_id,
              senderId: msg.sender_id,
              senderName: msg.sender_name,
              senderUsername: msg.sender_username || 'unknown',
              content: msg.content,
              timestamp: msg.created_at,
              type: msg.message_type as 'text' | 'system'
            }));
          }
        }
        
        // Combine messages from both sources, removing duplicates by content+timestamp
        const allMessages = [...friendMessages, ...messagesTableData];
        const uniqueMessages = allMessages.reduce((acc: ChatMessage[], msg) => {
          // Check if we already have a message with same content, sender, and similar timestamp
          const isDuplicate = acc.some(existing => 
            existing.content === msg.content && 
            existing.senderId === msg.senderId &&
            Math.abs(new Date(existing.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 5000
          );
          if (!isDuplicate) {
            acc.push(msg);
          }
          return acc;
        }, []);
        
        // Sort by timestamp
        uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        
        // Set chats (including any auto-generated from friend_messages)
        setChats(formattedChats);
        localStorage.setItem('guitarAppChats', JSON.stringify(formattedChats));
        
        // Set messages
        setMessages(uniqueMessages);
        localStorage.setItem('guitarAppMessages', JSON.stringify(uniqueMessages));
      } else {
        const storedChats = localStorage.getItem('guitarAppChats');
        if (storedChats) {
          try {
            setChats(JSON.parse(storedChats));
          } catch (e) {
          }
        }
      }
    } catch (error) {
      // Fall back to localStorage
      const storedChats = localStorage.getItem('guitarAppChats');
      if (storedChats) {
        try {
          setChats(JSON.parse(storedChats));
        } catch (e) {
        }
      }
    }
    // Only depend on user.id to prevent infinite loops when allUsers changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Fetch friends data when user logs in (simplified to prevent loops)
  useEffect(() => {
    if (user?.id) {
      // Use a flag to prevent duplicate fetches
      let isCancelled = false;
      
      const fetchData = async () => {
        try {
          if (!isCancelled) await fetchFriends();
          if (!isCancelled) await fetchFriendRequests();
          if (!isCancelled) await fetchBlockedUsers();
          if (!isCancelled) await fetchChats();
        } catch (error) {
        }
      };
      
      fetchData();
      
      return () => {
        isCancelled = true;
      };
    }
    // Only depend on user.id, not the functions (they're stable via useCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Real-time subscriptions for chats and messages
  useEffect(() => {
    if (!user?.id) return;

    // Use unique channel names per user to avoid conflicts when multiple users are on the page
    const uniqueId = `${user.id}-${Date.now()}`;
    
    // Debounce tracking - use shorter delays for better responsiveness
    let isUnmounted = false;
    let lastChatsFetch = 0;
    let lastFriendsFetch = 0;
    let lastRequestsFetch = 0;
    const DEBOUNCE_MS = 1000; // 1 second debounce for faster updates
    
    // Debounced fetch functions to prevent infinite loops
    const debouncedFetchChats = async () => {
      const now = Date.now();
      if (isUnmounted || (now - lastChatsFetch) < DEBOUNCE_MS) {
        return;
      }
      lastChatsFetch = now;
      try {
        await fetchChats();
      } catch (e) {
      }
    };
    
    const debouncedFetchFriends = async () => {
      const now = Date.now();
      if (isUnmounted || (now - lastFriendsFetch) < DEBOUNCE_MS) {
        return;
      }
      lastFriendsFetch = now;
      try {
        await fetchFriends();
      } catch (e) {
      }
    };
    
    const debouncedFetchRequests = async () => {
      const now = Date.now();
      if (isUnmounted || (now - lastRequestsFetch) < DEBOUNCE_MS) {
        return;
      }
      lastRequestsFetch = now;
      try {
        await fetchFriendRequests();
      } catch (e) {
      }
    };

    // Subscribe to new chats where user is a participant
    const chatsSubscription = supabase
      .channel(`chats-${uniqueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `participant_1=eq.${user.id}`
        },
        (payload) => {
          debouncedFetchChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `participant_2=eq.${user.id}`
        },
        (payload) => {
          debouncedFetchChats();
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel(`messages-${uniqueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMsg = payload.new as any;
          
          // Format the message
          const formattedMessage: ChatMessage = {
            id: newMsg.id,
            chatId: newMsg.chat_id,
            senderId: newMsg.sender_id,
            senderName: newMsg.sender_name,
            senderUsername: newMsg.sender_username || 'unknown',
            content: newMsg.content,
            timestamp: newMsg.created_at,
            type: newMsg.message_type as 'text' | 'system'
          };

          // Add message to state - check chats dynamically via setChats callback
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === formattedMessage.id)) {
              return prev;
            }
            const updated = [...prev, formattedMessage];
            localStorage.setItem('guitarAppMessages', JSON.stringify(updated));
            return updated;
          });
          
          // Also refresh chats to update last message (debounced)
          debouncedFetchChats();
        }
      )
      .subscribe();

    // Subscribe to new friendships - this allows the sender to see when their request is accepted
    const friendshipsSubscription = supabase
      .channel(`friendships-${uniqueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `user_id_1=eq.${user.id}`
        },
        (payload) => {
          debouncedFetchFriends();
          debouncedFetchChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `user_id_2=eq.${user.id}`
        },
        (payload) => {
          debouncedFetchFriends();
          debouncedFetchChats();
        }
      )
      .subscribe();

    // Subscribe to friend request updates - so sender knows when request is accepted
    const friendRequestsSubscription = supabase
      .channel(`friend-requests-${uniqueId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friend_requests',
          filter: `from_user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedRequest = payload.new as any;
          // If the request was accepted, refresh friends and chats
          if (updatedRequest.status === 'accepted') {
            debouncedFetchFriends();
            debouncedFetchChats();
            debouncedFetchRequests();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_requests',
          filter: `to_user_id=eq.${user.id}`
        },
        (payload) => {
          debouncedFetchRequests();
        }
      )
      .subscribe();

    // Subscribe to friend_messages - for real-time messaging between friends
    // Listen for ALL messages involving this user (both sent and received)
    const friendMessagesSubscription = supabase
      .channel(`friend-messages-${uniqueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_messages'
        },
        (payload) => {
          const newMsg = payload.new as any;
          
          // Only process if this user is sender OR receiver
          if (newMsg.send_user !== user.id && newMsg.receive_user !== user.id) {
            return; // Not our message
          }
          
          
          // Get sender info
          const senderUser = allUsers.find(u => u.id === newMsg.send_user);
          
          // Determine who the "other" user is
          const otherUserId = newMsg.send_user === user.id ? newMsg.receive_user : newMsg.send_user;
          
          // Find matching chat - try multiple strategies
          setChats(currentChats => {
            // Strategy 1: Find chat with BOTH current user AND other user
            let matchingChat = currentChats.find(chat => 
              chat.participants.includes(user.id) && 
              chat.participants.includes(otherUserId)
            );
            
            // Strategy 2: Find ANY private chat with the other user
            if (!matchingChat) {
              matchingChat = currentChats.find(chat => 
                chat.type === 'private' && chat.participants.includes(otherUserId)
              );
            }
            
            // Strategy 3: Find ANY private chat for current user
            if (!matchingChat) {
              matchingChat = currentChats.find(chat => 
                chat.type === 'private' && chat.participants.includes(user.id)
              );
            }
            
            if (matchingChat) {
              const formattedMessage: ChatMessage = {
                id: `fm_${newMsg.id}`,
                chatId: matchingChat.id,
                senderId: newMsg.send_user,
                senderName: senderUser?.name || 'Unknown',
                senderUsername: senderUser?.username || 'unknown',
                content: newMsg.message,
                timestamp: newMsg.created_at,
                type: 'text'
              };
              
              
              // Add message to state immediately
              setMessages(prev => {
                if (prev.some(m => m.id === formattedMessage.id)) {
                  return prev;
                }
                const updated = [...prev, formattedMessage];
                localStorage.setItem('guitarAppMessages', JSON.stringify(updated));
                return updated;
              });
            } else {
              // Force immediate refresh (bypass debounce)
              fetchChats();
            }
            
            return currentChats;
          });
        }
      )
      .subscribe();

    // Cleanup: unsubscribe first so the client closes cleanly (avoids noisy
    // "WebSocket is closed before the connection is established" on fast unmount).
    return () => {
      isUnmounted = true;
      const channels = [
        chatsSubscription,
        messagesSubscription,
        friendshipsSubscription,
        friendRequestsSubscription,
        friendMessagesSubscription,
      ];
      for (const ch of channels) {
        void (async () => {
          try {
            await ch.unsubscribe();
          } catch {
            /* noop */
          }
          try {
            supabase.removeChannel(ch);
          } catch {
            /* noop */
          }
        })();
      }
    };
    // Only re-run when user.id changes - NOT when chats/friends update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

    const newTotal = user.totalPoints + activity.points;
    const milestones = [100, 250, 500, 1000, 2500, 5000];
    const crossed = milestones.some(m => user.totalPoints < m && newTotal >= m);
    if (crossed) playAchievementPoints();

    // Update user points
    const updatedUser = {
      ...user,
      totalPoints: newTotal,
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
      totalCoins: userData?.totalCoins ?? 0,
      weeklyPoints: userData?.weeklyPoints || 0,
      levelProgress: userData?.levelProgress || 0,
      joinDate: userData?.joinDate || now,
      createdAt: userData?.createdAt || now,
      avatar: userData?.avatar || '🎸',
      isOnline: true
    };
  };

  // Helper function to calculate compete level from points
  const getCompeteLevel = (points: number): string => {
    const tierThresholds = [
      { rank: 'Bronze', tier: 'I', points: 0 },
      { rank: 'Bronze', tier: 'II', points: 100 },
      { rank: 'Bronze', tier: 'III', points: 250 },
      { rank: 'Silver', tier: 'I', points: 450 },
      { rank: 'Silver', tier: 'II', points: 700 },
      { rank: 'Silver', tier: 'III', points: 1000 },
      { rank: 'Gold', tier: 'I', points: 1350 },
      { rank: 'Gold', tier: 'II', points: 1750 },
      { rank: 'Gold', tier: 'III', points: 2200 },
      { rank: 'Diamond', tier: 'I', points: 2700 },
      { rank: 'Diamond', tier: 'II', points: 3250 },
      { rank: 'Diamond', tier: 'III', points: 3850 },
      { rank: 'Platinum', tier: 'I', points: 4500 },
      { rank: 'Platinum', tier: 'II', points: 5200 },
      { rank: 'Platinum', tier: 'III', points: 5950 },
    ];
    
    let currentTier = tierThresholds[0];
    for (let i = tierThresholds.length - 1; i >= 0; i--) {
      if (points >= tierThresholds[i].points) {
        currentTier = tierThresholds[i];
        break;
      }
    }
    
    return `${currentTier.rank} ${currentTier.tier}`;
  };

  // Hash password using Web Crypto API with fallback
  const hashPassword = async (password: string): Promise<string> => {
    try {
      // Check if crypto.subtle is available (requires secure context)
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'strummy_salt_2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      // crypto.subtle not available
    }

    // Fallback: multi-round FNV-1a-based hash for non-secure contexts
    // Produces a 64-char hex string by running 4 independent rounds with different seeds
    const fnv1a = (str: string, seed: number): number => {
      let h = 0x811c9dc5 ^ seed;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
      }
      return h >>> 0;
    };
    const salted = password + 'strummy_salt_2024';
    const parts: string[] = [];
    for (let round = 0; round < 4; round++) {
      const input = round === 0 ? salted : parts[round - 1] + salted;
      const h1 = fnv1a(input, round * 0x12345);
      const h2 = fnv1a(input + String(h1), round * 0x67890);
      parts.push(h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0'));
    }
    return parts.join('');
  };

  // Generate a UUID for new users
  const generateUserId = (): string => {
    // Use native crypto.randomUUID if available, otherwise fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Add this function to create user profile in Supabase
  const createUserProfile = async (user: any, additionalData: Partial<User>) => {
    try {
      
      const points = additionalData.totalPoints || 0;
      const streak = additionalData.practiceStreak || 0;
      const competeLevel = getCompeteLevel(points);
      
      const profileData = {
        user_id: user.id,
        username: user.user_metadata?.username || user.user_metadata?.name || user.user_metadata?.display_name,
        guitar_level: additionalData.level || 'beginner',
        style_1: additionalData.musicPreferences?.[0] || 'rock',
        style_2: additionalData.musicPreferences?.[1] || 'pop',
        style_3: additionalData.musicPreferences?.[2] || 'blues',
        // New fields for compete system
        points: points,
        compete_level: competeLevel,
        streak: streak
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (error) {
        throw error;
      } else {
        return data;
      }
    } catch (error) {
      throw error;
    }
  };

  // Function to update user profile in Supabase with current points, compete level, and streak
  const updateProfileInSupabase = async (userId: string, points: number, streak: number) => {
    try {
      const competeLevel = getCompeteLevel(points);
      
      const updateData: any = {
          points: points,
          compete_level: competeLevel,
          streak: streak
      };

      // Also sync username if available
      if (user?.name) {
        updateData.username = user.name;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
      } else {
      }
    } catch (error) {
    }
  };

  // Public function to sync current progress to Supabase
  // This reads points and streak from localStorage (progressStorage) and updates Supabase
  const syncProfileToSupabase = async () => {
    if (!user) {
      return;
    }

    try {
      // Import loadProgress dynamically to avoid circular dependencies
      const { loadProgress, getPracticeStreak } = await import('../utils/progressStorage');
      
      const progress = loadProgress(user.id);
      const points = progress?.totalPoints || 0;
      const streak = getPracticeStreak(user.id);
      
      
      await updateProfileInSupabase(user.id, points, streak);
      
      // Also sync full progress data
      await syncFullProgressToSupabase(user.id);
    } catch (error) {
    }
  };

  // Add this function to update user display name in Supabase Auth
  const updateUserDisplayName = async (displayName: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          display_name: displayName,
          name: displayName,
          full_name: displayName
        }
      });

      if (error) {
      } else {
      }
    } catch (error) {
    }
  };

  // Updated signup function - stores credentials directly in profiles table
  const signUp = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email!)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password length
      if (!userData.password || userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', userData.email!.toLowerCase());

      if (checkError) {
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      const banSignup = await fetchModerationBanStatus();
      if (banSignup.banned) {
        throw new Error('This network location is not allowed to create an account.');
      }

      // Generate new user ID and hash password
      const userId = generateUserId();
      const passwordHash = await hashPassword(userData.password);
      

      // Create profile with email and password_hash
      const profileData = {
        user_id: userId,
        email: userData.email!.toLowerCase(),
        password_hash: passwordHash,
        username: userData.name || userData.email!.split('@')[0],
        guitar_level: userData.level || 'beginner',
        style_1: userData.musicPreferences?.[0] || 'rock',
        style_2: userData.musicPreferences?.[1] || 'pop',
        style_3: userData.musicPreferences?.[2] || 'blues',
        points: 0,
        compete_level: 'Bronze I',
        streak: 0
      };

      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select();

      if (insertError) {
        throw new Error(`Failed to create account: ${insertError.message}`);
      }

        
        // Set user in context
      const newUser: User = {
        id: userId,
        name: userData.name || userData.email!.split('@')[0],
          email: userData.email!,
          level: userData.level || 'beginner',
          musicPreferences: userData.musicPreferences || ['rock', 'pop', 'blues'],
          practiceStreak: 0,
          songsMastered: 0,
          chordsLearned: 0,
          hoursThisWeek: 0,
          totalPoints: 0,
          totalCoins: 0,
          weeklyPoints: 0,
          levelProgress: 0,
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        username: userData.name || userData.email!.split('@')[0],
        avatar: '🎸',
          isOnline: true
        };
      
        setUser(newUser);
        
        // Save to localStorage for session persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('guitarAppUser', JSON.stringify(newUser));
        localStorage.setItem('guitarAppSession', JSON.stringify({ userId, email: userData.email!.toLowerCase() }));
      }
      

    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Updated signin function - queries profiles table directly
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();

      // Query profiles table by email
      const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
        .eq('email', email.toLowerCase())
          .single();

        if (profileError || !profile) {
        throw new Error('Incorrect email or password.');
      }

      // Hash the provided password and compare
      const passwordHash = await hashPassword(password);

      if (profile.password_hash !== passwordHash) {
        throw new Error('Incorrect email or password.');
        }

      const banSignin = await fetchModerationBanStatus();
      if (banSignin.banned) {
        throw new Error('This network location is not allowed to sign in.');
      }

        // Set user in local state
      const userData: User = {
        id: profile.user_id,
        name: profile.username || email.split('@')[0],
        email: profile.email || email,
        level: profile.guitar_level || 'beginner',
          musicPreferences: [
          profile.style_1 || 'rock',
          profile.style_2 || 'pop', 
          profile.style_3 || 'blues'
        ],
        practiceStreak: profile.streak || 0,
          songsMastered: 0,
          chordsLearned: 0,
          hoursThisWeek: 0,
        totalPoints: profile.points || 0,
        totalCoins: 0,
          weeklyPoints: 0,
          levelProgress: 0,
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          avatar: '🎸',
        username: profile.username || email.split('@')[0],
          isOnline: true
        };

      try {
        const lp = loadProgress(profile.user_id);
        userData.totalCoins = typeof lp.totalCoins === 'number' ? lp.totalCoins : 0;
        userData.totalPoints = typeof lp.totalPoints === 'number' ? lp.totalPoints : userData.totalPoints;
      } catch (_) {}

      setUser(userData);
        
        // Save to localStorage for session persistence
        if (typeof window !== 'undefined') {
        localStorage.setItem('guitarAppUser', JSON.stringify(userData));
        localStorage.setItem('guitarAppSession', JSON.stringify({ userId: profile.user_id, email: email.toLowerCase() }));
      }
      
      // Load progress from Supabase (restores user's progress from cloud)
      const cloudProgress = await loadProgressFromSupabase(profile.user_id);
      if (cloudProgress) {
      } else {
        }
        
        // WebSocket is disabled for stability
        setIsConnected(false);
        
      
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In — only links to an existing `profiles` row by email (no auto-registration).
  //
  // Native (iOS): uses the native Google Sign-In SDK via @codetrix-studio/capacitor-google-auth.
  //   The plugin presents ASWebAuthenticationSession (Google-approved for OAuth) and returns an
  //   ID token. We hand that token to `supabase.auth.signInWithIdToken` which creates the Supabase
  //   session entirely inside the app — no redirect URLs, no custom URL schemes, no popup webpage.
  //   `onAuthStateChange` fires with the new session, `applyProfileFromGoogleSession` looks up the
  //   email in `profiles` and signs the user in with that profile (or shows an error if no match).
  //
  // Web: uses Supabase OAuth redirect flow (unchanged).
  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      // Preferred on native: native Google SDK → idToken → signInWithIdToken.
      // Requires VITE_GOOGLE_IOS_CLIENT_ID + VITE_GOOGLE_WEB_CLIENT_ID in .env and matching setup
      // in Google Cloud Console + Supabase. Falls through to the OAuth URL flow below when not set.
      if (isNative() && isNativeGoogleConfigured()) {
        const { idToken } = await nativeGoogleSignIn();
        const { error: idTokenError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (idTokenError) {
          throw new Error(`Google sign-in failed: ${idTokenError.message}`);
        }
        // onAuthStateChange → applyProfileFromGoogleSession handles profile lookup and sets user state.
        return;
      }

      const redirectTo = getOAuthRedirectTo();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        throw new Error(`Google sign-in failed: ${error.message}`);
      }

      const url = data?.url;
      if (!url) {
        setIsLoading(false);
        throw new Error(
          'Google sign-in did not return a link. In Supabase Dashboard → Authentication → Providers, enable Google and set the Client ID / Secret.',
        );
      }

      // Native fallback (when iOS Google client isn't configured): open Google in
      // SFSafariViewController so the user at least sees the account picker.
      // After account selection, Supabase redirects to `com.strummyak.app://auth-callback` (if
      // you've added it to Supabase Auth → Redirect URLs) which iOS hands to `appUrlOpen`.
      if (isNative()) {
        await Browser.open({ url, presentationStyle: 'popover' });
        return;
      }

      if (typeof window !== 'undefined') {
        window.location.assign(url);
      }
    } catch (error: any) {
      setIsLoading(false);
      // Surface a friendlier message for the common "user cancelled the Google sheet" case.
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('cancel') || msg.includes('popup_closed')) {
        return; // swallow silently — user intentionally dismissed
      }
      throw error;
    }
  };

  /** Load app User from `profiles` when Google OAuth session exists; email must match an existing profile row. */
  const applyProfileFromGoogleSession = async (session: Session) => {
    const authUser = session.user;
    const email = authUser.email?.toLowerCase();
    const googleName =
      authUser.user_metadata?.full_name || authUser.user_metadata?.name || email?.split('@')[0] || 'User';
    const isGoogle =
      authUser.app_metadata?.provider === 'google' ||
      (authUser.identities ?? []).some((id) => id.provider === 'google');

    if (!email || !isGoogle) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error('Profile lookup (Google):', profileError);
        try {
          sessionStorage.setItem(
            'strummy-oauth-error',
            'Could not verify your account. Try again or sign in with email and password.',
          );
        } catch (_) {}
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!existingProfile) {
        try {
          sessionStorage.setItem(
            'strummy-oauth-error',
            'No Strummy account found for this Google email. Sign up with email and password first, then you can use Google next time with the same email.',
          );
        } catch (_) {}
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      const banGoogle = await fetchModerationBanStatus();
      if (banGoogle.banned) {
        await supabase.auth.signOut();
        clearLocalUserState();
        setIsLoading(false);
        return;
      }

      const userData: User = {
        id: existingProfile.user_id,
        name: existingProfile.username || googleName,
        email: existingProfile.email || email,
        level: existingProfile.guitar_level || 'beginner',
        musicPreferences: [
          existingProfile.style_1 || 'rock',
          existingProfile.style_2 || 'pop',
          existingProfile.style_3 || 'blues',
        ],
        practiceStreak: existingProfile.streak || 0,
        songsMastered: 0,
        chordsLearned: 0,
        hoursThisWeek: 0,
        totalPoints: existingProfile.points || 0,
        totalCoins: 0,
        weeklyPoints: 0,
        levelProgress: 0,
        joinDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        avatar: '🎸',
        username: existingProfile.username || googleName,
        isOnline: true,
      };

      try {
        const lp = loadProgress(existingProfile.user_id);
        userData.totalCoins = typeof lp.totalCoins === 'number' ? lp.totalCoins : 0;
        userData.totalPoints = typeof lp.totalPoints === 'number' ? lp.totalPoints : userData.totalPoints;
      } catch (_) {}

      setUser(userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('guitarAppUser', JSON.stringify(userData));
        localStorage.setItem(
          'guitarAppSession',
          JSON.stringify({ userId: existingProfile.user_id, email }),
        );
      }

      await loadProgressFromSupabase(existingProfile.user_id);
    } catch (err) {
      console.error('Error handling Google sign-in:', err);
      try {
        sessionStorage.setItem('strummy-oauth-error', 'Something went wrong signing in with Google. Please try again.');
      } catch (_) {}
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth callback + restore session on load (INITIAL_SESSION)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) return;
      const isGoogle =
        session.user.app_metadata?.provider === 'google' ||
        (session.user.identities ?? []).some((id) => id.provider === 'google');
      if (!isGoogle) return;

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        await applyProfileFromGoogleSession(session);
      }
    });

    // Native (Capacitor): intercept the custom-scheme callback from SFSafariViewController / Chrome Custom Tab
    // after Google OAuth completes. Parse the `code` query param and exchange it for a Supabase session
    // (PKCE flow). Detect session in URL is disabled on native, so we have to do this by hand.
    let urlOpenHandle: { remove: () => void } | undefined;
    if (isNative()) {
      void CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
        if (!url || !url.startsWith('com.strummyak.app://')) return;
        try {
          const parsed = new URL(url);
          const code = parsed.searchParams.get('code');
          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
          }
        } catch (err) {
          console.error('OAuth callback handling failed:', err);
        } finally {
          try {
            await Browser.close();
          } catch (_) {
            /* Browser may already be closed */
          }
        }
      }).then((handle) => {
        urlOpenHandle = handle;
      });
    }

    return () => {
      subscription.unsubscribe();
      urlOpenHandle?.remove();
    };
  }, []);

  // Updated signout function
  const signOut = async () => {
    try {
      // Sync progress to Supabase before signing out
      if (user) {
        await syncFullProgressToSupabase(user.id);
      }

      await supabase.auth.signOut();

      // Also clear the native Google session so the next sign-in re-prompts the account chooser.
      if (isNative()) {
        await nativeGoogleSignOut();
      }

      // Disconnect WebSocket
      websocketService.disconnect();
      
      // Clear session from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('guitarAppUser');
        localStorage.removeItem('guitarAppSession');
      }
      
      // Clear local state
      setUser(null);
      setRecentPointsActivities([]);
      setFriends([]);
      setFriendRequests([]);
      setChats([]);
      setMessages([]);
      setCommunityPosts([]);
      setIsConnected(false);
      
      
    } catch (error) {
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

  // Keep profile points/streak aligned when progress file updates (e.g. lesson goals, song practice).
  useEffect(() => {
    if (!user?.id) return;
    const onSync = (e: Event) => {
      const detail = (e as CustomEvent<{ userId: string }>).detail;
      if (!detail?.userId || detail.userId !== user.id) return;
      const p = loadProgress(user.id);
      setUser(prev => {
        if (!prev) return prev;
        const next = {
          ...prev,
          totalPoints: typeof p.totalPoints === 'number' ? p.totalPoints : prev.totalPoints,
          totalCoins: typeof p.totalCoins === 'number' ? p.totalCoins : prev.totalCoins ?? 0,
          practiceStreak: typeof p.streak === 'number' ? p.streak : prev.practiceStreak,
        };
        try {
          localStorage.setItem('guitarAppUser', JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    };
    window.addEventListener('strummy-progress-sync', onSync as EventListener);
    return () => window.removeEventListener('strummy-progress-sync', onSync as EventListener);
  }, [user?.id]);

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
    
    // Level progress based on:
    // - 40% for completing all selected songs (100% progress)
    // - 25% for completing technique cards
    // - 25% for completing theory cards
    // - 10% for reaching point threshold (200 pts per level)
    
    try {
      const progress = loadProgress(user.id);
      const selectedSongs = getSelectedSongs(user.id);
      const songProgressData = getAllSongProgress(user.id);
      
      // Songs: 40% - Calculate based on selected songs at 100% progress
      let completedSongs = 0;
      const totalSelectedSongs = selectedSongs.length || 1; // Avoid division by zero
      selectedSongs.forEach(song => {
        const songData = songProgressData[song.songId];
        if (songData && songData.progress >= 100) {
          completedSongs++;
        }
      });
      const songProgress = Math.min((completedSongs / totalSelectedSongs), 1) * 40;
      
      // Technique: 25% - Based on current level's technique path units completed
      const techPath = getTechniquePath(user.level as any);
      const techPathIds = new Set(techPath.map((u: { id: string }) => u.id));
      const completedTechniqueUnits = ((progress as any).completedUnits ?? []).filter((id: string) => techPathIds.has(id)).length;
      const totalTechniqueUnits = techPath?.length ?? 1;
      const techniqueProgress = Math.min((completedTechniqueUnits / totalTechniqueUnits), 1) * 25;
      
      // Theory: 25% - Based on current level's theory path units completed
      const theoryPathCur = getTheoryPath(user.level as any);
      const theoryPathIds = new Set(theoryPathCur.map((u: { id: string }) => u.id));
      const completedTheoryUnits = ((progress as any).completedTheoryUnits ?? []).filter((id: string) => theoryPathIds.has(id)).length;
      const totalTheoryUnits = theoryPathCur?.length ?? 1;
      const theoryProgress = Math.min((completedTheoryUnits / totalTheoryUnits), 1) * 25;
      
      // Points: 10% - 200 points per level increment
      const levelIndex = LEVEL_ORDER.indexOf(user.level);
      const levelPointThreshold = (levelIndex + 1) * 200;
      const pointsProgress = Math.min((progress.totalPoints / levelPointThreshold), 1) * 10;
      
      const totalProgress = Math.round(songProgress + techniqueProgress + theoryProgress + pointsProgress);
      
      
      return Math.min(totalProgress, 100);
    } catch (error) {
      return 0;
    }
  };
  
  // Helper: Get level order for points calculation
  const LEVEL_ORDER = ['novice', 'beginner', 'elementary', 'intermediate', 'proficient', 'advanced', 'expert'];

  const getFilteredContent = (contentType: 'songs' | 'techniques' | 'theory' | 'competitions') => {
    if (!user) return [];

    try {
      const content = guitarContent[contentType];
      const levelContent = content[user.level as keyof typeof content];
      
      if (!levelContent) return [];

      let filteredContent: any[] = [];

      if (contentType === 'songs' || contentType === 'techniques' || contentType === 'theory') {
        if (contentType === 'songs') {
          // Use preferred genres from Settings (localStorage) when available so add-song popup reflects current genre selection
          const preferredGenres = (typeof window !== 'undefined' && localStorage.getItem('guitarApp_preferredGenres'))
            ? JSON.parse(localStorage.getItem('guitarApp_preferredGenres')!)
            : user.musicPreferences;
          let genresToUse =
            Array.isArray(preferredGenres) && preferredGenres.length > 0
              ? preferredGenres
              : Array.isArray(user.musicPreferences) && user.musicPreferences.length > 0
                ? user.musicPreferences
                : ['rock', 'pop', 'blues'];
          genresToUse.forEach((theme: string) => {
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
      return [];
    }
  };

  // Messaging functions
  // Updated search function to prioritize display names
  const searchUsers = (query: string): User[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(searchTerm) ||
      u.username?.toLowerCase().includes(searchTerm) ||
      u.email?.toLowerCase().includes(searchTerm)
    );
  };

  const sendFriendRequest = async (usernameOrUserId: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');
    
    // Try to find user by ID first, then by username/name
    let targetUser = allUsers.find(u => u.id === usernameOrUserId);
    if (!targetUser) {
      targetUser = allUsers.find(u => u.username === usernameOrUserId || u.name === usernameOrUserId);
    }
    
    // If still not found, try to fetch from Supabase
    if (!targetUser) {
      try {
        // Try by user_id first
        let { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, username, guitar_level')
          .eq('user_id', usernameOrUserId)
          .single();
        
        // If not found, try by username
        if (!profileData) {
          const { data: usernameData } = await supabase
            .from('profiles')
            .select('user_id, username, guitar_level')
            .eq('username', usernameOrUserId)
            .single();
          profileData = usernameData;
        }
        
        if (profileData) {
          targetUser = {
            id: profileData.user_id,
            name: profileData.username,
            username: profileData.username,
            email: '',
            level: profileData.guitar_level || 'beginner',
            musicPreferences: [],
            practiceStreak: 0,
            songsMastered: 0,
            chordsLearned: 0,
            hoursThisWeek: 0,
            totalPoints: 0,
            totalCoins: 0,
            weeklyPoints: 0,
            levelProgress: 0,
            joinDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            avatar: '🎸',
            isOnline: false
          };
        }
      } catch (error) {
      }
    }
    
    if (!targetUser) {
      throw new Error('User not found');
    }
    
    // Check if target is a demo user (can't receive real friend requests)
    if (targetUser.id.startsWith('user_')) {
      throw new Error('This is a demo user. Please search for real users to add as friends.');
    }
    
    // Check if already friends
    if (friends.includes(targetUser.id)) {
      throw new Error('You are already friends with this user');
    }
    
    // Check if there's already a pending request
    const existingRequest = friendRequests.find(
      req => 
        (req.fromUserId === user.id && req.toUserId === targetUser.id && req.status === 'pending') ||
        (req.fromUserId === targetUser.id && req.toUserId === user.id && req.status === 'pending')
    );
    
    if (existingRequest) {
      if (existingRequest.fromUserId === user.id) {
        throw new Error('You have already sent a friend request to this user');
      } else {
        throw new Error('This user has already sent you a friend request. Please accept it instead.');
      }
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    
      
    // Always try Supabase first, use user.id if no session
    const fromUserId = session?.user?.id || user.id;
    
    try {
      

      // Check if request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', targetUser.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkError) {
      }

      if (existingRequest) {
        throw new Error('Friend request already sent');
      }

      // Insert new friend request (don't include id - let Supabase auto-generate it)
      // Use fromUserId to ensure it matches auth.uid() for RLS policies
      const insertData = {
        from_user_id: fromUserId,
        to_user_id: targetUser.id,
        status: 'pending',
        from_user_name: user.name,
        to_user_name: targetUser.name
      };

      // Try insert without .select() to avoid RLS issues on the return
      const { error: insertError } = await supabase
        .from('friend_requests')
        .insert(insertData);

      if (insertError) {
        
        // Provide specific guidance based on error type
        if (insertError.code === '42501' || insertError.message?.includes('permission denied') || insertError.message?.includes('policy')) {
        } else if (insertError.code === '42703' || insertError.message?.includes('column')) {
        } else if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
        } else if (insertError.code === '42P01' || insertError.message?.includes('does not exist')) {
        } else if (insertError.message?.includes('JWT') || insertError.message?.includes('token')) {
        } else {
        }
        
        throw new Error(insertError.message || 'Failed to send friend request');
      }

      // Fetch updated requests
      await fetchFriendRequests();
      return; // Success - exit function
    } catch (error: any) {
      
      // Fall back to local storage
      const newRequest: FriendRequest = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUsername: user.username || user.name.toLowerCase().replace(/\s+/g, '_'),
        toUserId: targetUser.id,
        toUserName: targetUser.name,
        toUsername: targetUser.username || targetUser.name.toLowerCase().replace(/\s+/g, '_'),
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      // Add to friend requests
      const updatedRequests = [...friendRequests, newRequest];
      setFriendRequests(updatedRequests);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('guitarAppFriendRequests', JSON.stringify(updatedRequests));
      }
      
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');
    
    
    // Find the friend request
    const request = friendRequests.find(req => req.id === requestId);
    if (!request) {
      throw new Error('Friend request not found');
    }
    
    // Check if this is a local storage request
    const isLocalRequest = requestId.startsWith('local_');
    
    // If it's a local request, use local storage mode
    if (isLocalRequest) {
      // Update friend request status
      const updatedRequests = friendRequests.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' as const } : req
      ).filter(req => req.id !== requestId); // Remove accepted request
      
      setFriendRequests(updatedRequests);
      
      // Add to friends list if not already there
      if (!friends.includes(request.fromUserId)) {
        const updatedFriends = [...friends, request.fromUserId];
        setFriends(updatedFriends);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('guitarAppFriends', JSON.stringify(updatedFriends));
          localStorage.setItem('guitarAppFriendRequests', JSON.stringify(updatedRequests));
        }
      }
      
      return;
    }

    // Use Supabase directly for non-local requests
    try {
      // Handle both string (local) and integer (Supabase) IDs
      const requestIdNum = isNaN(Number(requestId)) ? null : parseInt(requestId);
      
      
      if (!requestIdNum) {
        throw new Error('Invalid request ID');
      }

      // Get the request - don't filter by to_user_id in case of ID mismatch
      const { data: requestData, error: fetchError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestIdNum)
        .eq('status', 'pending')
        .single();

      if (fetchError || !requestData) {
        throw new Error('Friend request not found in database');
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestIdNum);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to accept request');
      }
      

      // Create friendship in Supabase
      // user_id_1 = sender of friend request (from_user_id)
      // user_id_2 = accepter of friend request (current user)
      const senderUserId = requestData.from_user_id;  // The one who SENT the request
      const accepterUserId = user.id;                  // The one who ACCEPTED the request
      
      
      try {
        const { data: friendshipData, error: friendshipError } = await supabase
          .from('friendships')
          .insert({
            user_id_1: senderUserId,    // Sender of friend request
            user_id_2: accepterUserId,  // Accepter of friend request
            created_at: new Date().toISOString()
          })
          .select();

        if (friendshipError) {
          // Still continue - the request is accepted
        } else {
        }
      } catch (friendshipError) {
      }
      
      // Also update local friends state immediately
      const friendUserId = senderUserId;

      // Create a chat room between the two users in SUPABASE - this enables instant messaging for BOTH users
      try {
        const friendUser = allUsers.find(u => u.id === friendUserId);
        const friendName = requestData.from_user_name || friendUser?.name || 'Your new friend';
        
        // Check if a chat already exists in Supabase between these users
        const { data: existingChatData } = await supabase
          .from('chats')
          .select('*')
          .or(`and(participant_1.eq.${user.id},participant_2.eq.${friendUserId}),and(participant_1.eq.${friendUserId},participant_2.eq.${user.id})`)
          .single();

        if (!existingChatData) {
          const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();
          
          // Save chat to Supabase - this makes it visible to BOTH users
          const { data: insertedChat, error: chatInsertError } = await supabase
            .from('chats')
            .insert({
              id: chatId,
              type: 'private',
              participant_1: user.id,
              participant_2: friendUserId,
              created_at: now,
              updated_at: now
            })
            .select()
            .single();

          if (chatInsertError) {
            // Fall back to local storage
          } else {
          }

          // Create welcome message and save to Supabase
          const welcomeMessageId = `msg_welcome_${Date.now()}`;
          const welcomeMessage: ChatMessage = {
            id: welcomeMessageId,
            chatId: chatId,
            senderId: 'system',
            senderName: 'System',
            senderUsername: 'system',
            content: `🎸 You and ${friendName} are now friends! Start your guitar journey together. Say hello!`,
            timestamp: now,
            type: 'system'
          };

          // Save message to Supabase
          const { error: msgInsertError } = await supabase
            .from('messages')
            .insert({
              id: welcomeMessageId,
              chat_id: chatId,
              sender_id: 'system',
              sender_name: 'System',
              sender_username: 'system',
              content: welcomeMessage.content,
              message_type: 'system',
              created_at: now
            });

          if (msgInsertError) {
          } else {
          }

          // Update local state
          const allParticipants = [user.id, friendUserId];
          const participantUsers = [user, friendUser].filter(Boolean);
          
          const newChat: Chat = {
            id: chatId,
            type: 'private',
            participants: allParticipants,
            participantNames: participantUsers.map(u => u?.name || 'Unknown'),
            participantUsernames: participantUsers.map(u => u?.username || 'unknown'),
            createdAt: now,
            updatedAt: now
          };

          setChats(prev => {
            const updatedChats = [...prev, newChat];
          if (typeof window !== 'undefined') {
            localStorage.setItem('guitarAppChats', JSON.stringify(updatedChats));
          }
            return updatedChats;
          });
          
          setMessages(prev => {
            const updatedMessages = [...prev, welcomeMessage];
            if (typeof window !== 'undefined') {
              localStorage.setItem('guitarAppMessages', JSON.stringify(updatedMessages));
            }
            return updatedMessages;
          });
          
        } else {
        }
      } catch (chatError) {
        // Still continue - friendship is established
      }

      // Add friend to local state immediately
      if (!friends.includes(friendUserId)) {
        setFriends(prev => [...prev, friendUserId]);
      }

      // Fetch updated friends and requests
      await Promise.all([fetchFriends(), fetchFriendRequests()]);
    } catch (error: any) {
      throw error;
    }
  };

  const declineFriendRequest = async (requestId: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');
    
    
    // Find the friend request
    const request = friendRequests.find(req => req.id === requestId);
    if (!request) {
      throw new Error('Friend request not found');
    }
    
    // Check if this is a local storage request
    const isLocalRequest = requestId.startsWith('local_');
    
    // If it's a local request, use local storage mode
    if (isLocalRequest) {
      // Remove the friend request
      const updatedRequests = friendRequests.filter(req => req.id !== requestId);
      setFriendRequests(updatedRequests);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('guitarAppFriendRequests', JSON.stringify(updatedRequests));
      }
      
      return;
    }

    // Use Supabase directly for non-local requests
    try {
      // Handle both string (local) and integer (Supabase) IDs
      const requestIdNum = isNaN(Number(requestId)) ? null : parseInt(requestId);
      
      if (!requestIdNum) {
        throw new Error('Invalid request ID');
      }

      // First, get the friend request to know who sent it
      const { data: requestData, error: fetchError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestIdNum)
        .single();

      if (fetchError || !requestData) {
        throw new Error('Friend request not found in database');
      }

      const senderUserId = requestData.from_user_id;

      // Update request status to declined (don't filter by to_user_id to avoid ID mismatch issues)
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestIdNum);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to decline friend request');
      }
      

      // Add to blocked_users table - BLOCK THE SENDER so they can't send requests again
      
      const { data: blockData, error: blockError } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,           // Current user (who declined)
          blocked_id: senderUserId,       // The person who sent the request
          created_at: new Date().toISOString()
        })
        .select();

      if (blockError) {
        // Check if it's a duplicate entry error (already blocked)
        if (blockError.code === '23505') {
        } else {
        }
      } else {
        
        // Update local blockedUsers state
        setBlockedUsers(prev => [...prev, senderUserId]);
      }

      // Fetch updated requests
      await fetchFriendRequests();
    } catch (error: any) {
      throw error;
    }
  };

  const removeFriend = async (friendId: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');

    try {
      // Remove from friendships table in Supabase
      // The friendship could be stored as (user.id, friendId) or (friendId, user.id)
      const { error: deleteError1 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id_1', user.id)
        .eq('user_id_2', friendId);

      const { error: deleteError2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id_1', friendId)
        .eq('user_id_2', user.id);

      if (deleteError1) {
      }
      if (deleteError2) {
      }

      // Remove from local state
      setFriends(prev => prev.filter(id => id !== friendId));

      // Remove from localStorage
      if (typeof window !== 'undefined') {
        const storedFriends = localStorage.getItem('guitarAppFriends');
        if (storedFriends) {
          try {
            const friendsList = JSON.parse(storedFriends);
            const updatedFriends = friendsList.filter((id: string) => id !== friendId);
            localStorage.setItem('guitarAppFriends', JSON.stringify(updatedFriends));
          } catch (e) {
          }
        }
      }

      // Also remove any chat with this friend
      setChats(prev => prev.filter(chat => 
        !(chat.type === 'private' && chat.participants.includes(friendId))
      ));

      // Fetch updated friends
      await fetchFriends();
    } catch (error: any) {
      throw error;
    }
  };

  const blockUser = async (userId: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');

    try {
      // Insert into blocked_users table in Supabase
      const { data: blockData, error: blockError } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,    // Current user doing the blocking
          blocked_id: userId,      // User being blocked
          created_at: new Date().toISOString()
        })
        .select();

      if (blockError) {
        // Check if it's a duplicate entry error (already blocked)
        if (blockError.code === '23505') {
        } else {
          throw new Error(blockError.message || 'Failed to block user');
        }
      } else {
      }

      // Update local blockedUsers state
      setBlockedUsers(prev => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });

      // Also remove from friends if they were friends
      if (friends.includes(userId)) {
        // Remove friendship from Supabase
        await supabase
          .from('friendships')
          .delete()
          .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${userId}),and(user_id_1.eq.${userId},user_id_2.eq.${user.id})`);
        
        // Update local friends state
        setFriends(prev => prev.filter(id => id !== userId));
      }

      // Fetch updated data
      await Promise.all([fetchFriends(), fetchFriendRequests(), fetchBlockedUsers()]);
    } catch (error: any) {
      throw error;
    }
  };

  const unblockUser = async (userId: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');

    try {
      // Delete from blocked_users table in Supabase
      const { error: unblockError } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (unblockError) {
        throw new Error(unblockError.message || 'Failed to unblock user');
      }

      // Update local blockedUsers state
      setBlockedUsers(prev => prev.filter(id => id !== userId));

      // Fetch updated blocked users
      await fetchBlockedUsers();
    } catch (error: any) {
      throw error;
    }
  };

  const createChat = async (participantIds: string[], isGroup: boolean = false, groupName?: string): Promise<Chat> => {
    if (!user) throw new Error('User not logged in');

    const allParticipants = [user.id, ...participantIds];
    const participantUsers = [user, ...allUsers.filter(u => participantIds.includes(u.id))];
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newChat: Chat = {
      id: chatId,
      type: isGroup ? 'group' : 'private',
      name: groupName,
      participants: allParticipants,
      participantNames: participantUsers.map(u => u.name),
      participantUsernames: participantUsers.map(u => u.username!),
      createdAt: now,
      updatedAt: now
    };

    // Save chat to Supabase for real-time sync between users
    try {
      const { error: chatError } = await supabase
        .from('chats')
        .insert({
          id: chatId,
          type: isGroup ? 'group' : 'private',
          name: groupName || null,
          participant_1: user.id,
          participant_2: participantIds[0] || null,
          created_at: now,
          updated_at: now
        });

      if (chatError) {
      } else {
      }
    } catch (error) {
    }

    // Update chats state with new chat
    setChats(prev => {
      const updatedChats = [...prev, newChat];
      // Save to localStorage inside the callback to get latest state
      if (typeof window !== 'undefined') {
        localStorage.setItem('guitarAppChats', JSON.stringify(updatedChats));
      }
      return updatedChats;
    });
    
    // Send via WebSocket if connected
    if (isConnected) {
      websocketService.send({
        type: 'chat_created',
        data: newChat,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    }
    
    // Create welcome/system message based on chat type and save to Supabase
    if (isGroup && groupName) {
      // Group chat: announce creation
      const msgId = `msg_${Date.now()}_system`;
      const systemMessage: ChatMessage = {
        id: msgId,
        chatId: chatId,
        senderId: 'system',
        senderName: 'System',
        senderUsername: 'system',
        content: `${user.name} created the group "${groupName}"`,
        timestamp: now,
        type: 'system'
      };
      
      // Save to Supabase
      try {
        await supabase.from('messages').insert({
          id: msgId,
          chat_id: chatId,
          sender_id: 'system',
          sender_name: 'System',
          sender_username: 'system',
          content: systemMessage.content,
          message_type: 'system',
          created_at: now
        });
      } catch (e) {
      }
      
      setMessages(prev => {
        const updatedMessages = [...prev, systemMessage];
        if (typeof window !== 'undefined') {
          localStorage.setItem('guitarAppMessages', JSON.stringify(updatedMessages));
        }
        return updatedMessages;
      });
    } else if (!isGroup && participantIds.length === 1) {
      // Private chat with a friend: add welcome message
      const friendId = participantIds[0];
      const friendUser = allUsers.find(u => u.id === friendId);
      const friendName = friendUser?.name || 'your friend';
      
      // Check if they're actually friends (to add the appropriate message)
      const isFriend = friends.includes(friendId);
      
      const msgId = `msg_welcome_${Date.now()}`;
      const welcomeMessage: ChatMessage = {
        id: msgId,
        chatId: chatId,
        senderId: 'system',
        senderName: 'System',
        senderUsername: 'system',
        content: isFriend 
          ? `🎸 Start chatting with ${friendName}! Share your guitar progress and jam together.`
          : `💬 You started a conversation with ${friendName}.`,
        timestamp: now,
        type: 'system'
      };
      
      // Save to Supabase
      try {
        await supabase.from('messages').insert({
          id: msgId,
          chat_id: chatId,
          sender_id: 'system',
          sender_name: 'System',
          sender_username: 'system',
          content: welcomeMessage.content,
          message_type: 'system',
          created_at: now
        });
      } catch (e) {
      }
      
      setMessages(prev => {
        const updatedMessages = [...prev, welcomeMessage];
        if (typeof window !== 'undefined') {
          localStorage.setItem('guitarAppMessages', JSON.stringify(updatedMessages));
        }
        return updatedMessages;
      });
    }

    return newChat;
  };

  const sendMessage = async (chatId: string, content: string, receiverId?: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');

    await enforceOutgoingTextPolicy(content);

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Determine receiver_id from chat if not provided
    let actualReceiverId = receiverId;
    if (!actualReceiverId) {
      const chat = chats.find(c => c.id === chatId);
      if (chat && chat.participants) {
        actualReceiverId = chat.participants.find(p => p !== user.id);
      }
    }
    
    // Get receiver name for logging
    const receiverUser = allUsers.find(u => u.id === actualReceiverId);
    const receiverName = receiverUser?.name || 'Unknown';
    

    const newMessage: ChatMessage = {
      id: messageId,
      chatId,
      senderId: user.id,
      senderName: user.name,
      senderUsername: user.username!,
      content: content.trim(),
      timestamp: now,
      type: 'text'
    };

    // Save message to Supabase for real-time sync between users
    try {
      
      // Save to friend_messages table (the main messages table)
      const { data: friendMsgData, error: friendMsgError } = await supabase
        .from('friend_messages')
        .insert({
          send_user: user.id,           // user_1: the one who sends the message
          receive_user: actualReceiverId, // user_2: the one who receives the message
          message: content.trim(),       // the message content
          created_at: now
        })
        .select();

      if (friendMsgError) {
      } else {
      }
      
      // Also save to messages table (for chat display)
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          chat_id: chatId,
          sender_id: user.id,
          receive_id: actualReceiverId,
          sender_name: user.name,
          sender_username: user.username || 'unknown',
          content: content.trim(),
          message_type: 'text',
          created_at: now
        });

      if (msgError) {
      } else {
      }

      // Update chat's updated_at in Supabase
      await supabase
        .from('chats')
        .update({ updated_at: now })
        .eq('id', chatId);

    } catch (error) {
    }

    // Send via WebSocket if connected (backup for real-time)
    if (isConnected) {
      websocketService.send({
        type: 'message',
        data: newMessage,
        timestamp: now,
        userId: user.id
      });
    }

    // Update local state immediately for instant feedback
    setMessages(prev => {
      const updated = [...prev, newMessage];
      localStorage.setItem('guitarAppMessages', JSON.stringify(updated));
      return updated;
    });
    
    // Update chat's last message and updatedAt
    setChats(prev => {
      const updated = prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, lastMessage: newMessage, updatedAt: now }
          : chat
    );
      localStorage.setItem('guitarAppChats', JSON.stringify(updated));
      return updated;
    });
  };

  const getChatMessages = (chatId: string): ChatMessage[] => {
    return messages
      .filter(msg => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  /** After prohibited community or DM text: purge data, ban IP/device (Edge), sign out. */
  const handleModerationViolation = async (violatingUserId: string) => {
    try {
      websocketService.disconnect();
    } catch {
      /* noop */
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        await invokeModerationEnforceEdge(session.access_token);
      }
    } catch {
      /* Edge may be unavailable; still attempt client purge */
    }
    try {
      await purgeUserDataBestEffort(supabase, violatingUserId);
    } catch {
      /* noop */
    }
    clearLocalUserState();
    try {
      await supabase.auth.signOut();
    } catch {
      /* noop */
    }
    setUser(null);
    setRecentPointsActivities([]);
    setFriends([]);
    setFriendRequests([]);
    setChats([]);
    setMessages([]);
    setCommunityPosts([]);
    setBlockedUsers([]);
    setIsConnected(false);
  };

  const enforceOutgoingTextPolicy = async (text: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');
    const mod = scanUserGeneratedText(text);
    if (!mod.ok) {
      await handleModerationViolation(user.id);
      throw new Error(MODERATION_ERR);
    }
  };

  const createCommunityPost = async (content: string): Promise<void> => {
    if (!user) throw new Error('User not logged in');

    await enforceOutgoingTextPolicy(content);

    const newPost: CommunityPost = {
      id: generateUniqueId('post_'),
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
      hasLiked: false, // Always start as false
      likedBy: []
    };

    // Send POST request to local API (simulates Supabase)
    try {
      const result = await createLocalPost({
        userId: user.id,
        userName: user.name,
        avatar: user.avatar,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        hasLiked: false,
        likedBy: [],
      });

      // Send to Supabase posts table
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('posts')
        .insert([{
          id: newPost.id,
          user_id: newPost.userId,
          user_name: newPost.userName,
          avatar: newPost.avatar,
          content: newPost.content,
          timestamp: newPost.timestamp,
          likes: newPost.likes,
          comments: newPost.comments,
          shares: newPost.shares,
          has_liked: newPost.hasLiked,
          liked_by: newPost.likedBy
        }]);
      
      if (supabaseError) {
        // If RLS error, try to handle it gracefully
        if (supabaseError.code === '42501') {
        }
      } else {
      }

      
      
      
    } catch (error) {
      // Continue with local state update even if server request fails
    }

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

  // Add this function to fetch posts from Supabase
  const fetchCommunityPosts = async (): Promise<void> => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        return;
      }

      if (posts) {
        // Convert Supabase posts to CommunityPost format
        const formattedPosts: CommunityPost[] = posts.map(post => ({
          id: post.id,
          userId: post.user_id,
          userName: post.user_name,
          username: post.username || post.user_name,
          userLevel: post.guitar_level || 'beginner',
          avatar: post.avatar || '/default-avatar.png',
          content: post.content,
          timestamp: post.timestamp,
          likes: post.likes || 0,
          comments: post.comments || 0,
          shares: post.shares || 0,
          type: 'post' as const,
          hasLiked: false, // Always start as false
          likedBy: post.liked_by || []
        }));

        // Update the community posts state
        setCommunityPosts(formattedPosts);
      }
    } catch (error) {
    }
  };

  // Add this function to like/unlike posts
  const toggleLikePost = async (postId: string): Promise<void> => {
    if (!user) return;

    try {
      // Check if user has already liked this post
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return;
      }

      if (existingLike) {
        // Unlike: Remove the like
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (deleteError) {
          return;
        }

        // DON'T update local state here - let the Community component handle it

      } else {
        // Like: Add the like
        const { error: insertError } = await supabase
          .from('likes')
          .insert([{
            post_id: postId,
            user_id: user.id,
            user_name: user.name,
            username: user.username || user.name,
            avatar: user.avatar || '/default-avatar.png',
            timestamp: new Date().toISOString()
          }]);

        if (insertError) {
          return;
        }

        // DON'T update local state here - let the Community component handle it
      }

    } catch (error) {
    }
  };

  // Updated function using profiles table instead of Admin API
  const fetchUsersFromSupabase = async (): Promise<void> => {
    
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('user_id, username, guitar_level, points, compete_level, streak');

      if (error) {
        return;
      }

      if (users && users.length > 0) {
        // Convert Supabase profiles to User format
        const supabaseUsers: User[] = users.map(profile => ({
          id: profile.user_id,
          name: profile.username || 'User',
          username: profile.username || 'user',
          email: '',
          level: profile.guitar_level || 'beginner',
          musicPreferences: ['rock', 'pop', 'blues'],
          practiceStreak: profile.streak || 0,
          songsMastered: 0,
          chordsLearned: 0,
          hoursThisWeek: 0,
          totalPoints: profile.points || 0,
          totalCoins: 0,
          weeklyPoints: 0,
          levelProgress: 0,
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          avatar: '🎸',
          isOnline: false
        }));

        // Only use Supabase users (no demo users)
        setAllUsers(supabaseUsers);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      setAllUsers([]);
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    recentPointsActivities,
    isConnected,
    signUp,
    signIn,
    signInWithGoogle,
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
    blockedUsers,
    chats,
    messages,
    communityPosts,
    allUsers,
    onlineUsers,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    createChat,
    sendMessage,
    getChatMessages,
    createCommunityPost,
    enforceOutgoingTextPolicy,
    likeCommunityPost,
    fetchCommunityPosts,
    toggleLikePost,
    fetchUsersFromSupabase,
    setCommunityPosts,
    syncProfileToSupabase,
    fetchFriendRequests,
    fetchFriends
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

async function saveResultsToSupabase(results: any) {
  try {
    const { data, error } = await supabase
      .from('posts') // change to your actual table
      .insert([results]);      // wrap in [] because insert expects an array

    if (error) {
    } else {
    }
  } catch (err) {
  }
}
