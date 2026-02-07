/**
 * API utility functions for interacting with the backend server
 */

import { isNative } from './capacitor';
import * as localApi from './localApiAdapter';
import { getApiBaseUrl } from './serverConfig';

// Use environment variable if set, otherwise use platform-aware config
const API_BASE_URL = import.meta.env.VITE_API_URL || getApiBaseUrl();

/**
 * Get the API base URL
 */
export const getApiUrl = () => {
  return API_BASE_URL;
};

/**
 * Generic API request function
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ========== COMMUNITY POSTS API ==========

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
  type?: 'post' | 'achievement' | 'milestone';
  likedBy?: string[];
}

export const createPost = async (postData: {
  userId: string;
  userName: string;
  username?: string;
  userLevel?: string;
  userAvatar?: string;
  content: string;
  type?: 'post' | 'achievement' | 'milestone';
}): Promise<CommunityPost> => {
  if (isNative()) return localApi.createPost(postData);
  const response = await apiRequest<{ success: boolean; post: CommunityPost }>(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        ...postData,
        timestamp: new Date().toISOString(),
      }),
    }
  );
  return response.post;
};

export const getPosts = async (): Promise<CommunityPost[]> => {
  if (isNative()) return localApi.getPosts();
  const response = await apiRequest<{ success: boolean; posts: CommunityPost[] }>('/posts');
  return response.posts;
};

export const toggleLikePost = async (postId: string, userId: string): Promise<CommunityPost> => {
  if (isNative()) return localApi.toggleLikePost(postId, userId);
  const response = await apiRequest<{ success: boolean; post: CommunityPost }>(
    `/posts/${postId}/like`,
    {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    }
  );
  return response.post;
};

// ========== PRACTICE SESSIONS API ==========

export interface PracticeSession {
  id: string;
  userId: string;
  activityType: 'practice' | 'song' | 'technique' | 'theory' | 'study';
  activityName: string;
  duration: number; // in minutes
  difficulty?: number;
  progress?: number; // 0-100
  notes?: string;
  timestamp: string;
  date: string;
}

export const createSession = async (sessionData: {
  userId: string;
  activityType: 'practice' | 'song' | 'technique' | 'theory' | 'study';
  activityName?: string;
  duration: number;
  difficulty?: number;
  progress?: number;
  notes?: string;
}): Promise<PracticeSession> => {
  if (isNative()) return localApi.createSession(sessionData);
  const response = await apiRequest<{ success: boolean; session: PracticeSession }>(
    '/sessions',
    {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }
  );
  return response.session;
};

export const getSessions = async (
  userId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    activityType?: string;
    limit?: number;
  }
): Promise<PracticeSession[]> => {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.activityType) params.append('activityType', options.activityType);
  if (options?.limit) params.append('limit', options.limit.toString());

  const query = params.toString();
  const endpoint = `/sessions/${userId}${query ? `?${query}` : ''}`;
  
  const response = await apiRequest<{ success: boolean; sessions: PracticeSession[] }>(endpoint);
  return response.sessions;
};

export const getSessionStats = async (
  userId: string,
  period: 'week' | 'month' | 'all' = 'week'
): Promise<{
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
  averageDuration: number;
  byActivityType: Record<string, number>;
  byDay: Record<string, number>;
}> => {
  const response = await apiRequest<{
    success: boolean;
    stats: {
      totalSessions: number;
      totalMinutes: number;
      totalHours: number;
      averageDuration: number;
      byActivityType: Record<string, number>;
      byDay: Record<string, number>;
    };
  }>(`/sessions/${userId}/stats?period=${period}`);
  return response.stats;
};

// ========== PROGRESS TRACKING API ==========

export interface ProgressItem {
  [key: string]: {
    [itemId: string]: {
      progress: number;
      status: 'in-progress' | 'mastered' | 'completed';
      lastPracticed?: string;
      lastStudied?: string;
      updatedAt: string;
    };
  };
}

export const updateSongProgress = async (progressData: {
  userId: string;
  songId: string;
  songTitle?: string;
  artist?: string;
  progress: number;
  status?: 'in-progress' | 'mastered';
}): Promise<any> => {
  const response = await apiRequest<{ success: boolean; progress: any }>(
    '/progress/song',
    {
      method: 'POST',
      body: JSON.stringify(progressData),
    }
  );
  return response.progress;
};

export const getSongProgress = async (userId: string): Promise<Record<string, any>> => {
  const response = await apiRequest<{ success: boolean; progress: Record<string, any> }>(
    `/progress/song/${userId}`
  );
  return response.progress;
};

export const updateTechniqueProgress = async (progressData: {
  userId: string;
  techniqueId: string;
  techniqueName?: string;
  category?: string;
  progress: number;
  status?: 'in-progress' | 'mastered';
}): Promise<any> => {
  const response = await apiRequest<{ success: boolean; progress: any }>(
    '/progress/technique',
    {
      method: 'POST',
      body: JSON.stringify(progressData),
    }
  );
  return response.progress;
};

export const getTechniqueProgress = async (userId: string): Promise<Record<string, any>> => {
  const response = await apiRequest<{ success: boolean; progress: Record<string, any> }>(
    `/progress/technique/${userId}`
  );
  return response.progress;
};

export const updateTheoryProgress = async (progressData: {
  userId: string;
  theoryId: string;
  theoryName?: string;
  category?: string;
  progress: number;
  status?: 'in-progress' | 'completed';
}): Promise<any> => {
  const response = await apiRequest<{ success: boolean; progress: any }>(
    '/progress/theory',
    {
      method: 'POST',
      body: JSON.stringify(progressData),
    }
  );
  return response.progress;
};

export const getTheoryProgress = async (userId: string): Promise<Record<string, any>> => {
  const response = await apiRequest<{ success: boolean; progress: Record<string, any> }>(
    `/progress/theory/${userId}`
  );
  return response.progress;
};

// ========== ACTIVITIES/TIMELINE API ==========

export interface Activity {
  id: string;
  userId: string;
  type: 'practice' | 'goal' | 'achievement' | 'lesson' | 'milestone' | 'performance';
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  date: string;
  time: string;
}

export const createActivity = async (activityData: {
  userId: string;
  type: 'practice' | 'goal' | 'achievement' | 'lesson' | 'milestone' | 'performance';
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  metadata?: Record<string, any>;
}): Promise<Activity> => {
  const response = await apiRequest<{ success: boolean; activity: Activity }>(
    '/activities',
    {
      method: 'POST',
      body: JSON.stringify(activityData),
    }
  );
  return response.activity;
};

export const getActivities = async (
  userId: string,
  options?: { limit?: number; type?: string }
): Promise<Activity[]> => {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.type) params.append('type', options.type);

  const query = params.toString();
  const endpoint = `/activities/${userId}${query ? `?${query}` : ''}`;
  
  const response = await apiRequest<{ success: boolean; activities: Activity[] }>(endpoint);
  return response.activities;
};

// ========== ACHIEVEMENTS API ==========

export interface Achievement {
  achievementId: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  unlockedAt: string;
}

export const unlockAchievement = async (achievementData: {
  userId: string;
  achievementId: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
}): Promise<Achievement> => {
  const response = await apiRequest<{ success: boolean; achievement: Achievement }>(
    '/achievements',
    {
      method: 'POST',
      body: JSON.stringify(achievementData),
    }
  );
  return response.achievement;
};

export const getAchievements = async (userId: string): Promise<Achievement[]> => {
  const response = await apiRequest<{ success: boolean; achievements: Achievement[] }>(
    `/achievements/${userId}`
  );
  return response.achievements;
};

// ========== POINTS API ==========

export interface PointsActivity {
  id: string;
  userId: string;
  type: string;
  points: number;
  description?: string;
  difficulty?: number;
  timestamp: string;
}

export const recordPoints = async (pointsData: {
  userId: string;
  type: string;
  points: number;
  description?: string;
  difficulty?: number;
}): Promise<PointsActivity> => {
  const response = await apiRequest<{ success: boolean; pointsActivity: PointsActivity }>(
    '/points',
    {
      method: 'POST',
      body: JSON.stringify({
        ...pointsData,
        timestamp: new Date().toISOString(),
      }),
    }
  );
  return response.pointsActivity;
};

export const getPointsActivities = async (
  userId: string,
  options?: { limit?: number; type?: string }
): Promise<{ pointsActivities: PointsActivity[]; totalPoints: number }> => {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.type) params.append('type', options.type);

  const query = params.toString();
  const endpoint = `/points/${userId}${query ? `?${query}` : ''}`;
  
  const response = await apiRequest<{
    success: boolean;
    pointsActivities: PointsActivity[];
    totalPoints: number;
  }>(endpoint);
  return {
    pointsActivities: response.pointsActivities,
    totalPoints: response.totalPoints,
  };
};
// ========== COMPETITION API ==========

export const recordCompetition = async (competitionData: {
  userId: string;
  competitionId: string;
  competitionName?: string;
  score: number;
  rank?: number;
  pointsEarned?: number;
}): Promise<any> => {
  const response = await apiRequest<{ success: boolean; result: any }>(
    '/competitions',
    {
      method: 'POST',
      body: JSON.stringify({
        ...competitionData,
        timestamp: new Date().toISOString(),
      }),
    }
  );
  return response.result;
};

// ========== STATISTICS API ==========

export interface UserStats {
  totalPoints: number;
  weeklyPoints: number;
  totalSessions: number;
  weeklySessions: number;
  monthlySessions: number;
  totalPracticeMinutes: number;
  weeklyPracticeMinutes: number;
  songsMastered: number;
  songsInProgress: number;
  techniquesMastered: number;
  techniquesInProgress: number;
  theoryCompleted: number;
  theoryInProgress: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const response = await apiRequest<{ success: boolean; stats: UserStats }>(
    `/stats/${userId}`
  );
  return response.stats;
};

// ========== HEALTH CHECK ==========

export const checkHealth = async (): Promise<{ status: string; timestamp: string }> => {
  return apiRequest<{ status: string; timestamp: string }>('/health');
};

