/**
 * Local API Adapter for Capacitor (iOS)
 *
 * Replaces HTTP backend calls with local Preferences storage.
 * Implements the same interface as api.ts so the rest of the app
 * works identically on iOS without a remote server.
 */

import { Preferences } from '@capacitor/preferences';
import type {
  CommunityPost,
  PracticeSession,
  Activity,
  Achievement,
  PointsActivity,
  UserStats,
} from './api';

// ========== Storage Helpers ==========

const KEYS = {
  posts: 'strummy_posts',
  sessions: (userId: string) => `strummy_sessions_${userId}`,
  songProgress: (userId: string) => `strummy_song_progress_${userId}`,
  techniqueProgress: (userId: string) => `strummy_technique_progress_${userId}`,
  theoryProgress: (userId: string) => `strummy_theory_progress_${userId}`,
  activities: (userId: string) => `strummy_activities_${userId}`,
  achievements: (userId: string) => `strummy_achievements_${userId}`,
  points: (userId: string) => `strummy_points_${userId}`,
  competitions: (userId: string) => `strummy_competitions_${userId}`,
};

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const { value } = await Preferences.get({ key });
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function setJSON(key: string, data: unknown): Promise<void> {
  await Preferences.set({ key, value: JSON.stringify(data) });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ========== COMMUNITY POSTS ==========

export const createPost = async (postData: {
  userId: string;
  userName: string;
  username?: string;
  userLevel?: string;
  userAvatar?: string;
  content: string;
  type?: 'post' | 'achievement' | 'milestone';
}): Promise<CommunityPost> => {
  const posts = await getJSON<CommunityPost[]>(KEYS.posts, []);
  const newPost: CommunityPost = {
    id: generateId(),
    userId: postData.userId,
    userName: postData.userName,
    username: postData.username || postData.userName.toLowerCase().replace(/\s/g, ''),
    userLevel: postData.userLevel || 'Beginner',
    avatar: postData.userAvatar || '',
    content: postData.content,
    timestamp: new Date().toISOString(),
    likes: 0,
    comments: 0,
    shares: 0,
    hasLiked: false,
    type: postData.type || 'post',
    likedBy: [],
  };
  posts.unshift(newPost);
  await setJSON(KEYS.posts, posts);
  return newPost;
};

export const getPosts = async (): Promise<CommunityPost[]> => {
  return getJSON<CommunityPost[]>(KEYS.posts, []);
};

export const toggleLikePost = async (postId: string, userId: string): Promise<CommunityPost> => {
  const posts = await getJSON<CommunityPost[]>(KEYS.posts, []);
  const idx = posts.findIndex(p => p.id === postId);
  if (idx === -1) throw new Error('Post not found');

  const post = posts[idx];
  const likedBy = post.likedBy || [];
  const alreadyLiked = likedBy.includes(userId);

  if (alreadyLiked) {
    post.likedBy = likedBy.filter(id => id !== userId);
    post.likes = Math.max(0, post.likes - 1);
    post.hasLiked = false;
  } else {
    post.likedBy = [...likedBy, userId];
    post.likes += 1;
    post.hasLiked = true;
  }

  posts[idx] = post;
  await setJSON(KEYS.posts, posts);
  return post;
};

// ========== PRACTICE SESSIONS ==========

export const createSession = async (sessionData: {
  userId: string;
  activityType: 'practice' | 'song' | 'technique' | 'theory' | 'study';
  activityName?: string;
  duration: number;
  difficulty?: number;
  progress?: number;
  notes?: string;
}): Promise<PracticeSession> => {
  const key = KEYS.sessions(sessionData.userId);
  const sessions = await getJSON<PracticeSession[]>(key, []);
  const now = new Date();
  const newSession: PracticeSession = {
    id: generateId(),
    userId: sessionData.userId,
    activityType: sessionData.activityType,
    activityName: sessionData.activityName || sessionData.activityType,
    duration: sessionData.duration,
    difficulty: sessionData.difficulty,
    progress: sessionData.progress,
    notes: sessionData.notes,
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0],
  };
  sessions.unshift(newSession);
  await setJSON(key, sessions);
  return newSession;
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
  let sessions = await getJSON<PracticeSession[]>(KEYS.sessions(userId), []);

  if (options?.startDate) {
    sessions = sessions.filter(s => s.date >= options.startDate!);
  }
  if (options?.endDate) {
    sessions = sessions.filter(s => s.date <= options.endDate!);
  }
  if (options?.activityType) {
    sessions = sessions.filter(s => s.activityType === options.activityType);
  }
  if (options?.limit) {
    sessions = sessions.slice(0, options.limit);
  }

  return sessions;
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
  let sessions = await getJSON<PracticeSession[]>(KEYS.sessions(userId), []);

  const now = new Date();
  if (period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    sessions = sessions.filter(s => s.date >= weekAgo);
  } else if (period === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    sessions = sessions.filter(s => s.date >= monthAgo);
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const byActivityType: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  for (const s of sessions) {
    byActivityType[s.activityType] = (byActivityType[s.activityType] || 0) + s.duration;
    byDay[s.date] = (byDay[s.date] || 0) + s.duration;
  }

  return {
    totalSessions: sessions.length,
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    averageDuration: sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0,
    byActivityType,
    byDay,
  };
};

// ========== PROGRESS TRACKING ==========

export const updateSongProgress = async (progressData: {
  userId: string;
  songId: string;
  songTitle?: string;
  artist?: string;
  progress: number;
  status?: 'in-progress' | 'mastered';
}): Promise<any> => {
  const key = KEYS.songProgress(progressData.userId);
  const progress = await getJSON<Record<string, any>>(key, {});
  progress[progressData.songId] = {
    progress: progressData.progress,
    status: progressData.status || (progressData.progress >= 100 ? 'mastered' : 'in-progress'),
    songTitle: progressData.songTitle,
    artist: progressData.artist,
    lastPracticed: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setJSON(key, progress);
  return progress[progressData.songId];
};

export const getSongProgress = async (userId: string): Promise<Record<string, any>> => {
  return getJSON<Record<string, any>>(KEYS.songProgress(userId), {});
};

export const updateTechniqueProgress = async (progressData: {
  userId: string;
  techniqueId: string;
  techniqueName?: string;
  category?: string;
  progress: number;
  status?: 'in-progress' | 'mastered';
}): Promise<any> => {
  const key = KEYS.techniqueProgress(progressData.userId);
  const progress = await getJSON<Record<string, any>>(key, {});
  progress[progressData.techniqueId] = {
    progress: progressData.progress,
    status: progressData.status || (progressData.progress >= 100 ? 'mastered' : 'in-progress'),
    techniqueName: progressData.techniqueName,
    category: progressData.category,
    lastPracticed: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setJSON(key, progress);
  return progress[progressData.techniqueId];
};

export const getTechniqueProgress = async (userId: string): Promise<Record<string, any>> => {
  return getJSON<Record<string, any>>(KEYS.techniqueProgress(userId), {});
};

export const updateTheoryProgress = async (progressData: {
  userId: string;
  theoryId: string;
  theoryName?: string;
  category?: string;
  progress: number;
  status?: 'in-progress' | 'completed';
}): Promise<any> => {
  const key = KEYS.theoryProgress(progressData.userId);
  const progress = await getJSON<Record<string, any>>(key, {});
  progress[progressData.theoryId] = {
    progress: progressData.progress,
    status: progressData.status || (progressData.progress >= 100 ? 'completed' : 'in-progress'),
    theoryName: progressData.theoryName,
    category: progressData.category,
    lastStudied: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setJSON(key, progress);
  return progress[progressData.theoryId];
};

export const getTheoryProgress = async (userId: string): Promise<Record<string, any>> => {
  return getJSON<Record<string, any>>(KEYS.theoryProgress(userId), {});
};

// ========== ACTIVITIES/TIMELINE ==========

export const createActivity = async (activityData: {
  userId: string;
  type: 'practice' | 'goal' | 'achievement' | 'lesson' | 'milestone' | 'performance';
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  metadata?: Record<string, any>;
}): Promise<Activity> => {
  const key = KEYS.activities(activityData.userId);
  const activities = await getJSON<Activity[]>(key, []);
  const now = new Date();
  const newActivity: Activity = {
    id: generateId(),
    userId: activityData.userId,
    type: activityData.type,
    title: activityData.title,
    description: activityData.description,
    icon: activityData.icon,
    color: activityData.color,
    metadata: activityData.metadata,
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0].slice(0, 5),
  };
  activities.unshift(newActivity);
  await setJSON(key, activities);
  return newActivity;
};

export const getActivities = async (
  userId: string,
  options?: { limit?: number; type?: string }
): Promise<Activity[]> => {
  let activities = await getJSON<Activity[]>(KEYS.activities(userId), []);

  if (options?.type) {
    activities = activities.filter(a => a.type === options.type);
  }
  if (options?.limit) {
    activities = activities.slice(0, options.limit);
  }

  return activities;
};

// ========== ACHIEVEMENTS ==========

export const unlockAchievement = async (achievementData: {
  userId: string;
  achievementId: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
}): Promise<Achievement> => {
  const key = KEYS.achievements(achievementData.userId);
  const achievements = await getJSON<Achievement[]>(key, []);

  const existing = achievements.find(a => a.achievementId === achievementData.achievementId);
  if (existing) return existing;

  const newAchievement: Achievement = {
    achievementId: achievementData.achievementId,
    title: achievementData.title,
    description: achievementData.description,
    icon: achievementData.icon,
    category: achievementData.category,
    unlockedAt: new Date().toISOString(),
  };
  achievements.push(newAchievement);
  await setJSON(key, achievements);
  return newAchievement;
};

export const getAchievements = async (userId: string): Promise<Achievement[]> => {
  return getJSON<Achievement[]>(KEYS.achievements(userId), []);
};

// ========== POINTS ==========

export const recordPoints = async (pointsData: {
  userId: string;
  type: string;
  points: number;
  description?: string;
  difficulty?: number;
}): Promise<PointsActivity> => {
  const key = KEYS.points(pointsData.userId);
  const pointsActivities = await getJSON<PointsActivity[]>(key, []);
  const newEntry: PointsActivity = {
    id: generateId(),
    userId: pointsData.userId,
    type: pointsData.type,
    points: pointsData.points,
    description: pointsData.description,
    difficulty: pointsData.difficulty,
    timestamp: new Date().toISOString(),
  };
  pointsActivities.unshift(newEntry);
  await setJSON(key, pointsActivities);
  return newEntry;
};

export const getPointsActivities = async (
  userId: string,
  options?: { limit?: number; type?: string }
): Promise<{ pointsActivities: PointsActivity[]; totalPoints: number }> => {
  let pointsActivities = await getJSON<PointsActivity[]>(KEYS.points(userId), []);

  if (options?.type) {
    pointsActivities = pointsActivities.filter(p => p.type === options.type);
  }

  const totalPoints = pointsActivities.reduce((sum, p) => sum + p.points, 0);

  if (options?.limit) {
    pointsActivities = pointsActivities.slice(0, options.limit);
  }

  return { pointsActivities, totalPoints };
};

// ========== COMPETITIONS ==========

export const recordCompetition = async (competitionData: {
  userId: string;
  competitionId: string;
  competitionName?: string;
  score: number;
  rank?: number;
  pointsEarned?: number;
}): Promise<any> => {
  const key = KEYS.competitions(competitionData.userId);
  const competitions = await getJSON<any[]>(key, []);
  const entry = {
    id: generateId(),
    ...competitionData,
    timestamp: new Date().toISOString(),
  };
  competitions.unshift(entry);
  await setJSON(key, competitions);
  return entry;
};

// ========== STATISTICS ==========

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const sessions = await getJSON<PracticeSession[]>(KEYS.sessions(userId), []);
  const songProgress = await getJSON<Record<string, any>>(KEYS.songProgress(userId), {});
  const techniqueProgress = await getJSON<Record<string, any>>(KEYS.techniqueProgress(userId), {});
  const theoryProgress = await getJSON<Record<string, any>>(KEYS.theoryProgress(userId), {});
  const achievements = await getJSON<Achievement[]>(KEYS.achievements(userId), []);
  const pointsActivities = await getJSON<PointsActivity[]>(KEYS.points(userId), []);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const weeklySessions = sessions.filter(s => s.date >= weekAgo);
  const monthlySessions = sessions.filter(s => s.date >= monthAgo);

  const totalPoints = pointsActivities.reduce((sum, p) => sum + p.points, 0);
  const weeklyPoints = pointsActivities
    .filter(p => p.timestamp >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .reduce((sum, p) => sum + p.points, 0);

  const totalPracticeMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const weeklyPracticeMinutes = weeklySessions.reduce((sum, s) => sum + s.duration, 0);

  const songEntries = Object.values(songProgress);
  const techniqueEntries = Object.values(techniqueProgress);
  const theoryEntries = Object.values(theoryProgress);

  // Calculate streak
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  let currentStreak = 0;
  const today = now.toISOString().split('T')[0];
  let checkDate = today;
  for (const date of dates) {
    if (date === checkDate || date === getPreviousDate(checkDate)) {
      currentStreak++;
      checkDate = date;
    } else {
      break;
    }
  }

  return {
    totalPoints,
    weeklyPoints,
    totalSessions: sessions.length,
    weeklySessions: weeklySessions.length,
    monthlySessions: monthlySessions.length,
    totalPracticeMinutes,
    weeklyPracticeMinutes,
    songsMastered: songEntries.filter(s => s.status === 'mastered').length,
    songsInProgress: songEntries.filter(s => s.status === 'in-progress').length,
    techniquesMastered: techniqueEntries.filter(t => t.status === 'mastered').length,
    techniquesInProgress: techniqueEntries.filter(t => t.status === 'in-progress').length,
    theoryCompleted: theoryEntries.filter(t => t.status === 'completed').length,
    theoryInProgress: theoryEntries.filter(t => t.status === 'in-progress').length,
    achievementsUnlocked: achievements.length,
    currentStreak,
    longestStreak: currentStreak, // Simplified; a full implementation would track historically
  };
};

function getPreviousDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ========== HEALTH CHECK ==========

export const checkHealth = async (): Promise<{ status: string; timestamp: string }> => {
  return { status: 'ok', timestamp: new Date().toISOString() };
};
