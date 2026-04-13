/**
 * Progress Storage Utility
 * Handles all user progress persistence using localStorage
 */

import { sendAchievementNotification, scheduleStreakReminder, cancelStreakReminder } from './notifications';
import { playAchievementSong } from './soundEffects';
import { supabase } from '../lib/supabase';

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

function dispatchProgressSync(userId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('strummy-progress-sync', { detail: { userId } }));
}

function dispatchStreakCelebrationIfIncreased(before: number, after: number): void {
  if (typeof window === 'undefined' || after <= before) return;
  window.dispatchEvent(
    new CustomEvent('strummy-celebration', { detail: { kind: 'streak' as const, streak: after } })
  );
}

function dispatchSongCompletedCelebration(title: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('strummy-celebration', { detail: { kind: 'song_complete' as const, title } })
  );
}

// Sync points, compete_level, and streak to Supabase
const syncToSupabase = async (userId: string, points: number, streak: number): Promise<void> => {
  if (!supabase) {
    console.log('⚠️ Supabase not configured, skipping sync');
    return;
  }

  try {
    const competeLevel = getCompeteLevel(points);
    
    console.log('🔄 Auto-syncing to Supabase:', { userId, points, competeLevel, streak });
    
    const { error } = await supabase
      .from('profiles')
      .update({
        points: points,
        compete_level: competeLevel,
        streak: streak
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Supabase sync error:', error.message);
    } else {
      console.log('✅ Supabase sync successful');
    }
  } catch (error) {
    console.error('❌ Failed to sync to Supabase:', error);
  }
};

// ========== Types ==========
export interface SongProgress {
  songId: string;
  title: string;
  artist: string;
  genre: string;
  progress: number; // 0-100
  lastPracticed: string;
  totalMinutes: number;
  timesPlayed: number;
  /** Finished the stepped “learn guitar basics” song program; opens free practice next time. */
  learnBasicsProgramCompleted?: boolean;
}

export interface TechniqueProgress {
  techniqueId: string;
  name: string;
  category: string;
  progress: number; // 0-100
  lastPracticed: string;
  totalMinutes: number;
  completed: boolean;
}

export interface TheoryProgress {
  theoryId: string;
  name: string;
  category: string;
  progress: number; // 0-100
  lastStudied: string;
  totalMinutes: number;
  completed: boolean;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  songsMinutes: number;
  techniqueMinutes: number;
  theoryMinutes: number;
  chordsMinutes: number;
  strumsMinutes: number;
  plucksMinutes: number;
  scalesMinutes: number;
  basicsMinutes: number;
  rhythmMinutes: number;
  goalsCompleted: string[]; // goal IDs
}

export interface WeeklyGoals {
  weekStart: string; // YYYY-MM-DD
  songGoalMinutes: number;
  songCompletedMinutes: number;
  techniqueGoalMinutes: number;
  techniqueCompletedMinutes: number;
  theoryGoalMinutes: number;
  theoryCompletedMinutes: number;
  basicsGoalMinutes: number;
  basicsCompletedMinutes: number;
  chordsGoalMinutes: number;
  chordsCompletedMinutes: number;
  scalesGoalMinutes: number;
  scalesCompletedMinutes: number;
  rhythmGoalMinutes: number;
  rhythmCompletedMinutes: number;
}

export interface DailyRoutine {
  date: string;
  chordsGoal: number;
  chordsCompleted: number;
  strumsGoal: number;
  strumsCompleted: number;
  plucksGoal: number;
  plucksCompleted: number;
  scalesGoal: number;
  scalesCompleted: number;
  completed: boolean;
}

export interface WeeklyTheoryRoutine {
  weekStart: string;
  basicsGoal: number;
  basicsCompleted: number;
  chordsGoal: number;
  chordsCompleted: number;
  scalesGoal: number;
  scalesCompleted: number;
  rhythmGoal: number;
  rhythmCompleted: number;
  completed: boolean;
}

export interface DailyTheoryRoutine {
  date: string;
  basicsGoal: number;
  basicsCompleted: number;
  chordsGoal: number;
  chordsCompleted: number;
  scalesGoal: number;
  scalesCompleted: number;
  rhythmGoal: number;
  rhythmCompleted: number;
  completed: boolean;
}

export interface SelectedSong {
  songId: string;
  title: string;
  artist: string;
  genre: string;
  chords: string[];
  bpm: number;
  duration: string;
  difficulty: number;
  addedAt: string;
  isCustom?: boolean;
  /** Catalog: practice as single-note melody (novice / beginner). */
  melodyOnly?: boolean;
}

export interface UserProgress {
  userId: string;
  streak: number;
  lastPracticeDate: string;
  totalPracticeMinutes: number;
  totalPoints: number; // Points earned from practice
  /** In-app currency; ~3× scarcer than points (floor(points/3) on grants). Spend API TBD. */
  totalCoins: number;
  currentLevel: number; // User's current level
  songs: Record<string, SongProgress>;
  selectedSongs: SelectedSong[]; // Songs the user has selected to learn
  techniques: Record<string, TechniqueProgress>;
  theory: Record<string, TheoryProgress>;
  dailyProgress: Record<string, DailyProgress>;
  weeklyGoals: Record<string, WeeklyGoals>;
  dailyRoutines: Record<string, DailyRoutine>;
  dailyTheoryRoutines: Record<string, DailyTheoryRoutine>;
  weeklyTheoryRoutines: Record<string, WeeklyTheoryRoutine>;
  achievements: Record<string, boolean>;
  achievementsPointsAwarded: Record<string, boolean>; // Track if points were given for achievement
  currentAchievementSet: number; // Current set of 8 achievements (1-13)
  dailyRoutinesCompleted: number; // Total daily routines completed
  weeklyGoalsCount: number; // Total weekly goals completed
  customSongs: any[];
  categoryGoalsCompleted: Record<string, boolean>; // Track which category goals are completed
  weeklyGoalsCompleted: Record<string, boolean>; // Track weekly goal point awards
  skillAreasCompleted: Record<string, boolean>; // Track skill area completion point awards
  songsCompleted: Record<string, boolean>; // Track song completion point awards
  cardsCompleted: Record<string, boolean>; // Track technique/theory card completion point awards
  skillAreas: {
    chordMastery: { current: number; total: number };
    strummingPatterns: { current: number; total: number };
    musicTheory: { current: number; total: number };
    songRepertoire: { current: number; total: number };
  };
  /** User-chosen daily practice goal in minutes. Weekly goal = this * 7. Default 30. */
  dailyPracticeGoalMinutes?: number;
}

// ========== Helper Functions ==========
const STORAGE_KEY = 'guitarAppProgress';

const getStorageKey = (userId: string) => `${STORAGE_KEY}_${userId}`;

// Debug helper — only registered in dev (avoids looking like an error in production consoles).
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as unknown as { debugGuitarProgress?: () => void }).debugGuitarProgress = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_KEY));
    console.log('🔍 All guitar progress keys:', keys);
    keys.forEach(key => {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      console.log(`📊 ${key}:`, {
        songs: data.songs,
        selectedSongs: data.selectedSongs,
        totalPoints: data.totalPoints,
      });
    });
  };
}

const getToday = () => new Date().toISOString().split('T')[0];

const getWeekStart = (date: Date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};

const getDayName = (date: Date) => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
};

// ========== Goal Constants (5 minutes each for easier completion) ==========
export const TECHNIQUE_GOALS = {
  chords: 5,
  strums: 5,
  plucks: 5,
  scales: 5,
};

export const THEORY_GOALS = {
  basics: 5,
  chords: 5,
  scales: 5,
  rhythm: 5,
};

// Points system
export const POINTS = {
  // Today's goals (daily goals) - 1 pt each
  DAILY_GOAL_EACH: 1,
  
  // Songs
  SONG_COMPLETE: 10,            // 10 pts for completing a song (100%)
  WEEKLY_SONG_GOAL: 3,          // 3 pts for reaching weekly song goal
  
  // Technique & Theory
  MINUTE_GOAL_TECHNIQUE: 1,     // 1 pt for each technique minute goal reached
  MINUTE_GOAL_THEORY: 1,        // 1 pt for each theory minute goal reached
  CARD_COMPLETE: 2,             // 2 pts for completing a technique/theory card
  WEEKLY_TECHNIQUE_THEORY: 3,   // 3 pts for weekly technique + theory completion together
  
  // Level & Progress
  LEVEL_UP: 15,                 // 15 pts for moving up a level
  MINUTES_BONUS: 1,             // Total minutes / 10 rounded up = points
  
  // Achievements & Skills
  ACHIEVEMENT: 4,               // 4 pts for each achievement
  SKILL_AREA_COMPLETE: 3,       // 3 pts for completing a skill area
};

// Calculate points from total minutes (minutes / 10 rounded up)
export const calculateMinutesPoints = (totalMinutes: number): number => {
  return Math.ceil(totalMinutes / 10);
};

// ========== Initialize Progress ==========
export const initializeProgress = (userId: string): UserProgress => {
  const progress: UserProgress = {
    userId,
    streak: 0,
    lastPracticeDate: '',
    totalPracticeMinutes: 0,
    totalPoints: 0,
    totalCoins: 0,
    currentLevel: 1,
    songs: {},
    selectedSongs: [], // Empty - user starts with no songs selected
    techniques: {},
    theory: {},
    dailyProgress: {},
    weeklyGoals: {},
    dailyRoutines: {},
    dailyTheoryRoutines: {},
    weeklyTheoryRoutines: {},
    achievements: {}, // Now dynamically managed based on currentAchievementSet
    achievementsPointsAwarded: {},
    currentAchievementSet: 1, // Start with first set of achievements
    dailyRoutinesCompleted: 0,
    weeklyGoalsCount: 0,
    customSongs: [],
    categoryGoalsCompleted: {},
    weeklyGoalsCompleted: {},
    skillAreasCompleted: {},
    songsCompleted: {},
    cardsCompleted: {},
    skillAreas: {
      chordMastery: { current: 0, total: 10 },
      strummingPatterns: { current: 0, total: 5 },
      musicTheory: { current: 0, total: 8 },
      songRepertoire: { current: 0, total: 5 },
    },
  };

  // Initialize today's daily routine for technique (5 minutes each)
  progress.dailyRoutines[getToday()] = {
    date: getToday(),
    chordsGoal: TECHNIQUE_GOALS.chords,
    chordsCompleted: 0,
    strumsGoal: TECHNIQUE_GOALS.strums,
    strumsCompleted: 0,
    plucksGoal: TECHNIQUE_GOALS.plucks,
    plucksCompleted: 0,
    scalesGoal: TECHNIQUE_GOALS.scales,
    scalesCompleted: 0,
    completed: false,
  };

  // Initialize today's daily routine for theory (5 minutes each) - resets daily
  progress.dailyTheoryRoutines[getToday()] = {
    date: getToday(),
    basicsGoal: THEORY_GOALS.basics,
    basicsCompleted: 0,
    chordsGoal: THEORY_GOALS.chords,
    chordsCompleted: 0,
    scalesGoal: THEORY_GOALS.scales,
    scalesCompleted: 0,
    rhythmGoal: THEORY_GOALS.rhythm,
    rhythmCompleted: 0,
    completed: false,
  };

  // Initialize this week's theory routine (5 minutes each)
  progress.weeklyTheoryRoutines[getWeekStart()] = {
    weekStart: getWeekStart(),
    basicsGoal: THEORY_GOALS.basics,
    basicsCompleted: 0,
    chordsGoal: THEORY_GOALS.chords,
    chordsCompleted: 0,
    scalesGoal: THEORY_GOALS.scales,
    scalesCompleted: 0,
    rhythmGoal: THEORY_GOALS.rhythm,
    rhythmCompleted: 0,
    completed: false,
  };

  // Initialize weekly goals (20 minutes total each = 4 categories * 5 min)
  progress.weeklyGoals[getWeekStart()] = {
    weekStart: getWeekStart(),
    songGoalMinutes: 140,
    songCompletedMinutes: 0,
    techniqueGoalMinutes: 20, // chords + strums + plucks + scales (5 each)
    techniqueCompletedMinutes: 0,
    theoryGoalMinutes: 20, // basics + chords + scales + rhythm (5 each)
    theoryCompletedMinutes: 0,
    basicsGoalMinutes: THEORY_GOALS.basics,
    basicsCompletedMinutes: 0,
    chordsGoalMinutes: THEORY_GOALS.chords,
    chordsCompletedMinutes: 0,
    scalesGoalMinutes: THEORY_GOALS.scales,
    scalesCompletedMinutes: 0,
    rhythmGoalMinutes: THEORY_GOALS.rhythm,
    rhythmCompletedMinutes: 0,
  };

  return progress;
};

// ========== Load/Save Progress ==========
export const loadProgress = (userId: string): UserProgress => {
  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const progress = JSON.parse(stored);
      // Ensure all required fields exist
      return {
        ...initializeProgress(userId),
        ...progress,
      };
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
  return initializeProgress(userId);
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    const key = getStorageKey(progress.userId);
    const data = JSON.stringify(progress);
    console.log('💾 saveProgress: Saving to key:', key);
    console.log('💾 saveProgress: Songs in progress:', Object.keys(progress.songs));
    localStorage.setItem(key, data);
    
    // Verify the save worked
    const verify = localStorage.getItem(key);
    if (verify) {
      const parsed = JSON.parse(verify);
      console.log('✅ saveProgress: Verified songs saved:', Object.keys(parsed.songs));
    } else {
      console.error('❌ saveProgress: Failed to verify save!');
    }
    dispatchProgressSync(progress.userId);
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

// ========== Points Management ==========

// Reset all points to zero
export const resetPoints = (userId: string): void => {
  const progress = loadProgress(userId);
  progress.totalPoints = 0;
  saveProgress(progress);
  
  // Sync to Supabase when points change
  syncToSupabase(userId, 0, progress.streak);
  
  console.log(`[Points] Reset to 0 for user: ${userId}`);
};

// Recalculate total points based on all tracked achievements
// Points factors (ONLY these, nothing else):
// - Today's goals: 1 pt each
// - Song completion: 10 pts
// - Weekly song goal: 3 pts
// - Each minute goal for daily technique and theory: 1 pt each
// - Completion of technique or theory card: 2 pts
// - Completion of weekly technique or theory: 3 pts together
// - Moving up a level: 15 pts
// - Total minutes / 10 rounded up = points
// - Achievements: 4 pts
// - Completion of skill area: 3 pts
export const recalculateTotalPoints = (userId: string): number => {
  const progress = loadProgress(userId);
  const today = getToday();
  const weekStart = getWeekStart();
  let totalPoints = 0;
  
  // 1. Today's goals (1 pt each) - daily technique routine goals
  const dailyRoutine = progress.dailyRoutines[today];
  if (dailyRoutine) {
    if (dailyRoutine.chordsCompleted >= dailyRoutine.chordsGoal) totalPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyRoutine.strumsCompleted >= dailyRoutine.strumsGoal) totalPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyRoutine.plucksCompleted >= dailyRoutine.plucksGoal) totalPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyRoutine.scalesCompleted >= dailyRoutine.scalesGoal) totalPoints += POINTS.DAILY_GOAL_EACH;
  }
  // Daily theory routine goals
  const dailyTheoryRoutine = progress.dailyTheoryRoutines?.[today];
  if (dailyTheoryRoutine) {
    if (dailyTheoryRoutine.basicsCompleted >= dailyTheoryRoutine.basicsGoal) totalPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyTheoryRoutine.chordsCompleted >= dailyTheoryRoutine.chordsGoal) totalPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyTheoryRoutine.scalesCompleted >= dailyTheoryRoutine.scalesGoal) totalPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyTheoryRoutine.rhythmCompleted >= dailyTheoryRoutine.rhythmGoal) totalPoints += POINTS.DAILY_GOAL_EACH;
  }
  
  // 2. Completed songs (10 pts each)
  const completedSongs = Object.values(progress.songs).filter(s => s.progress >= 100);
  totalPoints += completedSongs.length * POINTS.SONG_COMPLETE;
  
  // 3. Weekly song goal (3 pts)
  const weeklyGoals = progress.weeklyGoals[weekStart];
  if (weeklyGoals && weeklyGoals.songCompletedMinutes >= weeklyGoals.songGoalMinutes) {
    totalPoints += POINTS.WEEKLY_SONG_GOAL;
  }
  
  // 4. Each minute goal for daily technique (1 pt each)
  if (dailyRoutine) {
    if (dailyRoutine.chordsCompleted >= TECHNIQUE_GOALS.chords) totalPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
    if (dailyRoutine.strumsCompleted >= TECHNIQUE_GOALS.strums) totalPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
    if (dailyRoutine.plucksCompleted >= TECHNIQUE_GOALS.plucks) totalPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
    if (dailyRoutine.scalesCompleted >= TECHNIQUE_GOALS.scales) totalPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
  }
  
  // 5. Each minute goal for daily theory (1 pt each)
  if (dailyTheoryRoutine) {
    if (dailyTheoryRoutine.basicsCompleted >= THEORY_GOALS.basics) totalPoints += POINTS.MINUTE_GOAL_THEORY;
    if (dailyTheoryRoutine.chordsCompleted >= THEORY_GOALS.chords) totalPoints += POINTS.MINUTE_GOAL_THEORY;
    if (dailyTheoryRoutine.scalesCompleted >= THEORY_GOALS.scales) totalPoints += POINTS.MINUTE_GOAL_THEORY;
    if (dailyTheoryRoutine.rhythmCompleted >= THEORY_GOALS.rhythm) totalPoints += POINTS.MINUTE_GOAL_THEORY;
  }
  
  // 6. Completed technique cards (2 pts each)
  const completedTechniques = Object.values(progress.techniques).filter(t => t.completed);
  totalPoints += completedTechniques.length * POINTS.CARD_COMPLETE;
  
  // 7. Completed theory cards (2 pts each)
  const completedTheory = Object.values(progress.theory).filter(t => t.completed);
  totalPoints += completedTheory.length * POINTS.CARD_COMPLETE;
  
  // 8. Weekly technique + theory completion (3 pts together)
  if (dailyRoutine?.completed && dailyTheoryRoutine?.completed) {
    totalPoints += POINTS.WEEKLY_TECHNIQUE_THEORY;
  }
  
  // 9. Level ups (15 pts each level above 1)
  totalPoints += (progress.currentLevel - 1) * POINTS.LEVEL_UP;
  
  // 10. Minutes bonus: Total minutes / 10 rounded up
  totalPoints += calculateMinutesPoints(progress.totalPracticeMinutes);
  
  // 11. Achievements (4 pts each)
  totalPoints += Object.values(progress.achievements).filter(v => v).length * POINTS.ACHIEVEMENT;
  
  // 12. Skill areas completed (3 pts each)
  const skillAreas = progress.skillAreas;
  if (skillAreas.chordMastery.current >= skillAreas.chordMastery.total) totalPoints += POINTS.SKILL_AREA_COMPLETE;
  if (skillAreas.strummingPatterns.current >= skillAreas.strummingPatterns.total) totalPoints += POINTS.SKILL_AREA_COMPLETE;
  if (skillAreas.musicTheory.current >= skillAreas.musicTheory.total) totalPoints += POINTS.SKILL_AREA_COMPLETE;
  if (skillAreas.songRepertoire.current >= skillAreas.songRepertoire.total) totalPoints += POINTS.SKILL_AREA_COMPLETE;
  
  progress.totalPoints = totalPoints;
  saveProgress(progress);
  
  // Sync to Supabase when points change
  syncToSupabase(userId, totalPoints, progress.streak);
  
  return totalPoints;
};

// Award points and return the amount awarded
export const awardPoints = (userId: string, points: number, reason: string): number => {
  const progress = loadProgress(userId);
  const previousPoints = progress.totalPoints;
  progress.totalPoints += points;
  saveProgress(progress);
  console.log(`[Points] Awarded ${points} pts for: ${reason}. Total: ${progress.totalPoints}`);

  // Check for points milestones (100, 250, 500, 1000, 2500, 5000, 10000)
  const pointsMilestones = [100, 250, 500, 1000, 2500, 5000, 10000];
  for (const milestone of pointsMilestones) {
    if (progress.totalPoints >= milestone && previousPoints < milestone) {
      sendAchievementNotification('points_milestone', { points: milestone });
      break;
    }
  }

  // Sync to Supabase when points change
  syncToSupabase(userId, progress.totalPoints, progress.streak);

  return points;
};

// ========== Song Progress ==========
export const updateSongProgress = (
  userId: string,
  songId: string,
  title: string,
  artist: string,
  genre: string,
  progressPercent: number,
  minutesPracticed: number
): SongProgress => {
  console.log('[updateSongProgress] Called with:', { userId, songId, title, progressPercent, minutesPracticed });
  
  const progress = loadProgress(userId);
  const today = getToday();

  const existing = progress.songs[songId] || {
    songId,
    title,
    artist,
    genre,
    progress: 0,
    lastPracticed: today,
    totalMinutes: 0,
    timesPlayed: 0,
  };

  console.log('[updateSongProgress] Existing progress:', existing);

  // Calculate new progress - add at least 5% per practice session, or use the session progress if higher
  // This ensures progress always increases with each practice
  // Cap at 99% unless the player earned the trophy (100% correctness, no mistakes)
  const progressIncrement = Math.max(5, progressPercent);
  const maxProgress = progressPercent >= 100 ? 100 : 99;
  const newProgress = Math.min(maxProgress, existing.progress + progressIncrement);
  
  console.log('[updateSongProgress] Progress calculation:', {
    existingProgress: existing.progress,
    progressPercent,
    progressIncrement,
    newProgress
  });
  
  const updated: SongProgress = {
    ...existing,
    progress: newProgress,
    lastPracticed: today,
    totalMinutes: existing.totalMinutes + minutesPracticed,
    timesPlayed: existing.timesPlayed + 1,
  };

  console.log('[updateSongProgress] Updated progress:', updated);

  progress.songs[songId] = updated;

  // Update daily progress
  if (!progress.dailyProgress[today]) {
    progress.dailyProgress[today] = {
      date: today,
      totalMinutes: 0,
      songsMinutes: 0,
      techniqueMinutes: 0,
      theoryMinutes: 0,
      chordsMinutes: 0,
      strumsMinutes: 0,
      plucksMinutes: 0,
      scalesMinutes: 0,
      basicsMinutes: 0,
      rhythmMinutes: 0,
      goalsCompleted: [],
    };
  }
  progress.dailyProgress[today].songsMinutes += minutesPracticed;
  progress.dailyProgress[today].totalMinutes += minutesPracticed;

  // Update weekly goals
  const weekStart = getWeekStart();
  if (!progress.weeklyGoals[weekStart]) {
    progress.weeklyGoals[weekStart] = {
      weekStart,
      songGoalMinutes: 140,
      songCompletedMinutes: 0,
      techniqueGoalMinutes: 185,
      techniqueCompletedMinutes: 0,
      theoryGoalMinutes: 180,
      theoryCompletedMinutes: 0,
      basicsGoalMinutes: 40,
      basicsCompletedMinutes: 0,
      chordsGoalMinutes: 55,
      chordsCompletedMinutes: 0,
      scalesGoalMinutes: 35,
      scalesCompletedMinutes: 0,
      rhythmGoalMinutes: 50,
      rhythmCompletedMinutes: 0,
    };
  }
  progress.weeklyGoals[weekStart].songCompletedMinutes += minutesPracticed;

  // Update total
  progress.totalPracticeMinutes += minutesPracticed;

  // Update streak
  const streakBeforeSong = progress.streak;
  updateStreak(progress);
  dispatchStreakCelebrationIfIncreased(streakBeforeSong, progress.streak);

  // Initialize tracking objects if they don't exist
  if (!progress.songsCompleted) progress.songsCompleted = {};
  if (!progress.weeklyGoalsCompleted) progress.weeklyGoalsCompleted = {};

  // Award points for song completion (10 pts) - only once per song
  if (updated.progress >= 100 && !progress.songsCompleted[songId]) {
    progress.totalPoints += POINTS.SONG_COMPLETE;
    progress.songsCompleted[songId] = true;
    console.log(`[Points] +${POINTS.SONG_COMPLETE} pts for completing song: ${title}`);
    dispatchSongCompletedCelebration(title);

    // Send song completed notification and play sound
    sendAchievementNotification('song_completed', { songName: title });
    playAchievementSong();

    // Check for first song completion
    const completedSongsCount = Object.keys(progress.songsCompleted).length;
    if (completedSongsCount === 1) {
      sendAchievementNotification('first_song', {});
    }
  }

  // Award points for weekly song goal (3 pts)
  const weeklyGoalKey = `${weekStart}_song_goal`;
  if (!progress.weeklyGoalsCompleted[weeklyGoalKey] &&
      progress.weeklyGoals[weekStart].songCompletedMinutes >= progress.weeklyGoals[weekStart].songGoalMinutes) {
    progress.totalPoints += POINTS.WEEKLY_SONG_GOAL;
    progress.weeklyGoalsCompleted[weeklyGoalKey] = true;
    console.log(`[Points] +${POINTS.WEEKLY_SONG_GOAL} pts for weekly song goal`);

    // Send weekly goal complete notification
    sendAchievementNotification('weekly_goal_complete', {});
  }

  // Check for practice time milestones (10, 50, 100, 500, 1000 hours)
  const totalHours = Math.floor(progress.totalPracticeMinutes / 60);
  const prevTotalHours = Math.floor((progress.totalPracticeMinutes - minutesPracticed) / 60);
  const hourMilestones = [10, 50, 100, 500, 1000];
  for (const milestone of hourMilestones) {
    if (totalHours >= milestone && prevTotalHours < milestone) {
      sendAchievementNotification('practice_time_milestone', { hours: milestone });
      break;
    }
  }

  // Update skill areas
  if (updated.progress >= 100 && existing.progress < 100) {
    progress.skillAreas.songRepertoire.current = Math.min(
      progress.skillAreas.songRepertoire.total,
      progress.skillAreas.songRepertoire.current + 1
    );
    
    // Check if skill area is now complete (3 pts)
    if (!progress.skillAreasCompleted) progress.skillAreasCompleted = {};
    if (!progress.skillAreasCompleted['songRepertoire'] && 
        progress.skillAreas.songRepertoire.current >= progress.skillAreas.songRepertoire.total) {
      progress.totalPoints += POINTS.SKILL_AREA_COMPLETE;
      progress.skillAreasCompleted['songRepertoire'] = true;
      console.log(`[Points] +${POINTS.SKILL_AREA_COMPLETE} pts for completing Song Repertoire skill`);
    }
  }

  // Check achievements
  checkAchievements(progress);

  saveProgress(progress);
  
  // Sync to Supabase when points/progress change
  syncToSupabase(userId, progress.totalPoints, progress.streak);

  // Debug: Verify the save worked by re-loading
  const verifyProgress = loadProgress(userId);
  console.log('🔍 VERIFY - Song progress in localStorage after save:', verifyProgress.songs[songId]);
  
  return updated;
};

export const getSongProgress = (userId: string, songId: string): SongProgress | null => {
  const progress = loadProgress(userId);
  return progress.songs[songId] || null;
};

export const getAllSongProgress = (userId: string): Record<string, SongProgress> => {
  console.log('🎵 getAllSongProgress called for userId:', userId);
  const progress = loadProgress(userId);
  console.log('🎵 getAllSongProgress returning songs:', progress.songs);
  console.log('[getAllSongProgress] Retrieved songs:', progress.songs);
  return progress.songs;
};

/** True if this song’s stepped learn program is done or the song was already mastered (100%). */
export function hasCompletedSongLearnProgram(userId: string, songId: string): boolean {
  const p = getSongProgress(userId, songId);
  if (p?.learnBasicsProgramCompleted) return true;
  if (p && p.progress >= 100) return true;
  return false;
}

/** Mark the stepped program complete so the next tap opens practice directly. */
export function markSongLearnProgramComplete(
  userId: string,
  songId: string,
  meta: { title: string; artist: string; genre: string }
): void {
  const progress = loadProgress(userId);
  const today = getToday();
  const existing = progress.songs[songId];
  progress.songs[songId] = {
    ...existing,
    songId,
    title: meta.title || existing?.title || '',
    artist: meta.artist || existing?.artist || '',
    genre: meta.genre || existing?.genre || '',
    lastPracticed: today,
    learnBasicsProgramCompleted: true,
  };
  saveProgress(progress);
  dispatchProgressSync(userId);
}

// ========== Technique Progress ==========
export const updateTechniqueProgress = (
  userId: string,
  techniqueId: string,
  name: string,
  category: string,
  progressPercent: number,
  minutesPracticed: number
): { technique: TechniqueProgress; pointsEarned: number } => {
  console.log(`[updateTechniqueProgress] Called with:`, { userId, techniqueId, name, category, progressPercent, minutesPracticed });
  const progress = loadProgress(userId);
  const today = getToday();
  let pointsEarned = 0;

  // Initialize tracking objects
  if (!progress.cardsCompleted) progress.cardsCompleted = {};
  if (!progress.categoryGoalsCompleted) progress.categoryGoalsCompleted = {};
  if (!progress.weeklyGoalsCompleted) progress.weeklyGoalsCompleted = {};
  if (!progress.skillAreasCompleted) progress.skillAreasCompleted = {};

  const existing = progress.techniques[techniqueId] || {
    techniqueId,
    name,
    category,
    progress: 0,
    lastPracticed: today,
    totalMinutes: 0,
    completed: false,
  };

  const wasCompleted = existing.completed;
  const updated: TechniqueProgress = {
    ...existing,
    progress: Math.min(100, Math.max(existing.progress, progressPercent)),
    lastPracticed: today,
    totalMinutes: existing.totalMinutes + minutesPracticed,
    completed: progressPercent >= 100,
  };

  progress.techniques[techniqueId] = updated;

  // Award points for completing a technique card (2 pts)
  // Award 5 pts for completing a chord specifically
  const lowerCategory = category.toLowerCase();
  const cardKey = `technique_${techniqueId}`;
  if (!wasCompleted && updated.completed && !progress.cardsCompleted[cardKey]) {
    // Award 2 pts for completing any technique/theory card
    pointsEarned += POINTS.CARD_COMPLETE;
    progress.totalPoints += POINTS.CARD_COMPLETE;
    console.log(`[Points] +${POINTS.CARD_COMPLETE} pts for completing technique: ${name}`);
    progress.cardsCompleted[cardKey] = true;

    // Send technique mastered notification
    sendAchievementNotification('technique_mastered', { techniqueName: name });
  }

  // Update daily progress based on category
  if (!progress.dailyProgress[today]) {
    progress.dailyProgress[today] = {
      date: today,
      totalMinutes: 0,
      songsMinutes: 0,
      techniqueMinutes: 0,
      theoryMinutes: 0,
      chordsMinutes: 0,
      strumsMinutes: 0,
      plucksMinutes: 0,
      scalesMinutes: 0,
      basicsMinutes: 0,
      rhythmMinutes: 0,
      goalsCompleted: [],
    };
  }

  if (lowerCategory.includes('chord') || lowerCategory.includes('foundation')) {
    progress.dailyProgress[today].chordsMinutes += minutesPracticed;
  } else if (lowerCategory.includes('rhythm') || lowerCategory.includes('strum')) {
    progress.dailyProgress[today].strumsMinutes += minutesPracticed;
  } else if (lowerCategory.includes('fingerpicking') || lowerCategory.includes('pluck') || lowerCategory.includes('picking')) {
    progress.dailyProgress[today].plucksMinutes += minutesPracticed;
  } else if (lowerCategory.includes('scale') || lowerCategory.includes('lead') || lowerCategory.includes('advanced') || lowerCategory.includes('master')) {
    progress.dailyProgress[today].scalesMinutes += minutesPracticed;
  }
  progress.dailyProgress[today].techniqueMinutes += minutesPracticed;
  progress.dailyProgress[today].totalMinutes += minutesPracticed;

  // Update daily routine with new goal amounts
  if (!progress.dailyRoutines[today]) {
    progress.dailyRoutines[today] = {
      date: today,
      chordsGoal: TECHNIQUE_GOALS.chords,
      chordsCompleted: 0,
      strumsGoal: TECHNIQUE_GOALS.strums,
      strumsCompleted: 0,
      plucksGoal: TECHNIQUE_GOALS.plucks,
      plucksCompleted: 0,
      scalesGoal: TECHNIQUE_GOALS.scales,
      scalesCompleted: 0,
      completed: false,
    };
  }

  // Track which category we're updating and check for goal completion
  // 1 pt for each minute goal reached (technique)
  let categoryKey = '';
  if (lowerCategory.includes('chord') || lowerCategory.includes('foundation')) {
    progress.dailyRoutines[today].chordsCompleted += minutesPracticed;
    categoryKey = `${today}_tech_chords`;
    if (!progress.categoryGoalsCompleted[categoryKey] && 
        progress.dailyRoutines[today].chordsCompleted >= progress.dailyRoutines[today].chordsGoal) {
      pointsEarned += POINTS.MINUTE_GOAL_TECHNIQUE;
      progress.totalPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
      progress.categoryGoalsCompleted[categoryKey] = true;
      console.log(`[Points] +${POINTS.MINUTE_GOAL_TECHNIQUE} pt for technique chords goal`);
    }
  } else if (lowerCategory.includes('rhythm') || lowerCategory.includes('strum')) {
    progress.dailyRoutines[today].strumsCompleted += minutesPracticed;
    categoryKey = `${today}_tech_strums`;
    if (!progress.categoryGoalsCompleted[categoryKey] && 
        progress.dailyRoutines[today].strumsCompleted >= progress.dailyRoutines[today].strumsGoal) {
      pointsEarned += POINTS.MINUTE_GOAL_TECHNIQUE;
      progress.totalPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
      progress.categoryGoalsCompleted[categoryKey] = true;
      console.log(`[Points] +${POINTS.MINUTE_GOAL_TECHNIQUE} pt for technique strums goal`);
    }
  } else if (lowerCategory.includes('fingerpicking') || lowerCategory.includes('pluck') || lowerCategory.includes('picking')) {
    progress.dailyRoutines[today].plucksCompleted += minutesPracticed;
    categoryKey = `${today}_tech_plucks`;
    if (!progress.categoryGoalsCompleted[categoryKey] && 
        progress.dailyRoutines[today].plucksCompleted >= progress.dailyRoutines[today].plucksGoal) {
      pointsEarned += POINTS.MINUTE_GOAL_TECHNIQUE;
      progress.totalPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
      progress.categoryGoalsCompleted[categoryKey] = true;
      console.log(`[Points] +${POINTS.MINUTE_GOAL_TECHNIQUE} pt for technique plucks goal`);
    }
  } else if (lowerCategory.includes('scale') || lowerCategory.includes('lead') || lowerCategory.includes('advanced') || lowerCategory.includes('master')) {
    progress.dailyRoutines[today].scalesCompleted += minutesPracticed;
    categoryKey = `${today}_tech_scales`;
    if (!progress.categoryGoalsCompleted[categoryKey] && 
        progress.dailyRoutines[today].scalesCompleted >= progress.dailyRoutines[today].scalesGoal) {
      pointsEarned += POINTS.MINUTE_GOAL_TECHNIQUE;
      progress.totalPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
      progress.categoryGoalsCompleted[categoryKey] = true;
      console.log(`[Points] +${POINTS.MINUTE_GOAL_TECHNIQUE} pt for technique scales goal`);
    }
  }

  // Check if daily routine is completed
  const routine = progress.dailyRoutines[today];
  routine.completed = 
    routine.chordsCompleted >= routine.chordsGoal &&
    routine.strumsCompleted >= routine.strumsGoal &&
    routine.plucksCompleted >= routine.plucksGoal &&
    routine.scalesCompleted >= routine.scalesGoal;

  // Update weekly goals with new amounts
  const weekStart = getWeekStart();
  if (!progress.weeklyGoals[weekStart]) {
    progress.weeklyGoals[weekStart] = {
      weekStart,
      songGoalMinutes: 140,
      songCompletedMinutes: 0,
      techniqueGoalMinutes: 20,
      techniqueCompletedMinutes: 0,
      theoryGoalMinutes: 20,
      theoryCompletedMinutes: 0,
      basicsGoalMinutes: THEORY_GOALS.basics,
      basicsCompletedMinutes: 0,
      chordsGoalMinutes: THEORY_GOALS.chords,
      chordsCompletedMinutes: 0,
      scalesGoalMinutes: THEORY_GOALS.scales,
      scalesCompletedMinutes: 0,
      rhythmGoalMinutes: THEORY_GOALS.rhythm,
      rhythmCompletedMinutes: 0,
    };
  }
  progress.weeklyGoals[weekStart].techniqueCompletedMinutes += minutesPracticed;

  // Update total
  progress.totalPracticeMinutes += minutesPracticed;

  // Update streak
  const streakBeforeTech = progress.streak;
  updateStreak(progress);
  dispatchStreakCelebrationIfIncreased(streakBeforeTech, progress.streak);

  // Check for weekly technique goal completion (combined with theory = 3 pts)
  const weeklyTechKey = `${weekStart}_weekly_technique`;
  if (!progress.weeklyGoalsCompleted[weeklyTechKey] && 
      progress.weeklyGoals[weekStart].techniqueCompletedMinutes >= progress.weeklyGoals[weekStart].techniqueGoalMinutes) {
    // Check if theory is also complete for the combined bonus
    const theoryComplete = progress.weeklyGoals[weekStart].theoryCompletedMinutes >= progress.weeklyGoals[weekStart].theoryGoalMinutes;
    const weeklyTheoryKey = `${weekStart}_weekly_theory`;
    if (theoryComplete && progress.weeklyGoalsCompleted[weeklyTheoryKey]) {
      // Both complete, award the combined bonus
      const weeklyBothKey = `${weekStart}_weekly_both`;
      if (!progress.weeklyGoalsCompleted[weeklyBothKey]) {
        pointsEarned += POINTS.WEEKLY_TECHNIQUE_THEORY;
        progress.totalPoints += POINTS.WEEKLY_TECHNIQUE_THEORY;
        progress.weeklyGoalsCompleted[weeklyBothKey] = true;
        console.log(`[Points] +${POINTS.WEEKLY_TECHNIQUE_THEORY} pts for weekly technique+theory`);
      }
    }
    progress.weeklyGoalsCompleted[weeklyTechKey] = true;
  }

  // Update skill areas and check for skill area completion (3 pts each)
  if (!wasCompleted && updated.completed) {
    if (lowerCategory.includes('chord')) {
      progress.skillAreas.chordMastery.current = Math.min(
        progress.skillAreas.chordMastery.total,
        progress.skillAreas.chordMastery.current + 1
      );
      // Check if skill area complete
      if (!progress.skillAreasCompleted['chordMastery'] && 
          progress.skillAreas.chordMastery.current >= progress.skillAreas.chordMastery.total) {
        pointsEarned += POINTS.SKILL_AREA_COMPLETE;
        progress.totalPoints += POINTS.SKILL_AREA_COMPLETE;
        progress.skillAreasCompleted['chordMastery'] = true;
        console.log(`[Points] +${POINTS.SKILL_AREA_COMPLETE} pts for completing Chord Mastery skill`);
      }
    } else if (lowerCategory.includes('strum')) {
      progress.skillAreas.strummingPatterns.current = Math.min(
        progress.skillAreas.strummingPatterns.total,
        progress.skillAreas.strummingPatterns.current + 1
      );
      // Check if skill area complete
      if (!progress.skillAreasCompleted['strummingPatterns'] && 
          progress.skillAreas.strummingPatterns.current >= progress.skillAreas.strummingPatterns.total) {
        pointsEarned += POINTS.SKILL_AREA_COMPLETE;
        progress.totalPoints += POINTS.SKILL_AREA_COMPLETE;
        progress.skillAreasCompleted['strummingPatterns'] = true;
        console.log(`[Points] +${POINTS.SKILL_AREA_COMPLETE} pts for completing Strumming Patterns skill`);
      }
    }
  }

  // Check achievements (4 pts each)
  checkAchievements(progress);

  saveProgress(progress);
  
  // Sync to Supabase when points/streak change
  syncToSupabase(userId, progress.totalPoints, progress.streak);

  console.log(`[updateTechniqueProgress] Complete. Points earned: ${pointsEarned}, Total points: ${progress.totalPoints}, Daily technique minutes: ${progress.dailyProgress[today]?.techniqueMinutes || 0}`);
  return { technique: updated, pointsEarned };
};

// ========== Theory Progress ==========
export const updateTheoryProgress = (
  userId: string,
  theoryId: string,
  name: string,
  category: string,
  progressPercent: number,
  minutesStudied: number
): { theory: TheoryProgress; pointsEarned: number } => {
  console.log(`[updateTheoryProgress] Called with:`, { userId, theoryId, name, category, progressPercent, minutesStudied });
  const progress = loadProgress(userId);
  const today = getToday();
  const weekStart = getWeekStart();
  let pointsEarned = 0;

  // Initialize tracking objects
  if (!progress.cardsCompleted) progress.cardsCompleted = {};
  if (!progress.categoryGoalsCompleted) progress.categoryGoalsCompleted = {};
  if (!progress.weeklyGoalsCompleted) progress.weeklyGoalsCompleted = {};
  if (!progress.skillAreasCompleted) progress.skillAreasCompleted = {};

  const existing = progress.theory[theoryId] || {
    theoryId,
    name,
    category,
    progress: 0,
    lastStudied: today,
    totalMinutes: 0,
    completed: false,
  };

  const wasCompleted = existing.completed;
  const updated: TheoryProgress = {
    ...existing,
    progress: Math.min(100, Math.max(existing.progress, progressPercent)),
    lastStudied: today,
    totalMinutes: existing.totalMinutes + minutesStudied,
    completed: progressPercent >= 100,
  };

  progress.theory[theoryId] = updated;

  // Award points for completing a theory card (2 pts)
  const cardKey = `theory_${theoryId}`;
  if (!wasCompleted && updated.completed && !progress.cardsCompleted[cardKey]) {
    pointsEarned += POINTS.CARD_COMPLETE;
    progress.totalPoints += POINTS.CARD_COMPLETE;
    progress.cardsCompleted[cardKey] = true;
    console.log(`[Points] +${POINTS.CARD_COMPLETE} pts for completing theory: ${name}`);
  }

  // Update daily progress based on category
  if (!progress.dailyProgress[today]) {
    progress.dailyProgress[today] = {
      date: today,
      totalMinutes: 0,
      songsMinutes: 0,
      techniqueMinutes: 0,
      theoryMinutes: 0,
      chordsMinutes: 0,
      strumsMinutes: 0,
      plucksMinutes: 0,
      scalesMinutes: 0,
      basicsMinutes: 0,
      rhythmMinutes: 0,
      goalsCompleted: [],
    };
  }

  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('basics') || lowerCategory.includes('intervals')) {
    progress.dailyProgress[today].basicsMinutes += minutesStudied;
  } else if (lowerCategory.includes('chord')) {
    progress.dailyProgress[today].chordsMinutes += minutesStudied;
  } else if (lowerCategory.includes('scale') || lowerCategory.includes('mode')) {
    progress.dailyProgress[today].scalesMinutes += minutesStudied;
  } else if (lowerCategory.includes('rhythm') || lowerCategory.includes('time')) {
    progress.dailyProgress[today].rhythmMinutes += minutesStudied;
  }
  progress.dailyProgress[today].theoryMinutes += minutesStudied;
  progress.dailyProgress[today].totalMinutes += minutesStudied;

  // Update weekly theory routine with new goal amounts
  if (!progress.weeklyTheoryRoutines[weekStart]) {
    progress.weeklyTheoryRoutines[weekStart] = {
      weekStart,
      basicsGoal: THEORY_GOALS.basics,
      basicsCompleted: 0,
      chordsGoal: THEORY_GOALS.chords,
      chordsCompleted: 0,
      scalesGoal: THEORY_GOALS.scales,
      scalesCompleted: 0,
      rhythmGoal: THEORY_GOALS.rhythm,
      rhythmCompleted: 0,
      completed: false,
    };
  }

  // Track category and award 1 pt for each minute goal reached (theory)
  let categoryKey = '';
  if (lowerCategory.includes('basics') || lowerCategory.includes('intervals')) {
    progress.weeklyTheoryRoutines[weekStart].basicsCompleted += minutesStudied;
    categoryKey = `${weekStart}_theory_basics`;
    if (!progress.categoryGoalsCompleted[categoryKey] && 
        progress.weeklyTheoryRoutines[weekStart].basicsCompleted >= progress.weeklyTheoryRoutines[weekStart].basicsGoal) {
      pointsEarned += POINTS.MINUTE_GOAL_THEORY;
      progress.totalPoints += POINTS.MINUTE_GOAL_THEORY;
      progress.categoryGoalsCompleted[categoryKey] = true;
      console.log(`[Points] +${POINTS.MINUTE_GOAL_THEORY} pt for theory basics goal`);
    }
  } else if (lowerCategory.includes('chord')) {
    progress.weeklyTheoryRoutines[weekStart].chordsCompleted += minutesStudied;
    categoryKey = `${weekStart}_theory_chords`;
    if (!progress.categoryGoalsCompleted[categoryKey] && 
        progress.weeklyTheoryRoutines[weekStart].chordsCompleted >= progress.weeklyTheoryRoutines[weekStart].chordsGoal) {
      pointsEarned += POINTS.MINUTE_GOAL_THEORY;
      progress.totalPoints += POINTS.MINUTE_GOAL_THEORY;
      progress.categoryGoalsCompleted[categoryKey] = true;
      console.log(`[Points] +${POINTS.MINUTE_GOAL_THEORY} pt for theory chords goal`);
    }
  } else if (lowerCategory.includes('scale') || lowerCategory.includes('mode')) {
    progress.weeklyTheoryRoutines[weekStart].scalesCompleted += minutesStudied;
    categoryKey = `${weekStart}_theory_scales`;
    if (!progress.categoryGoalsCompleted[categoryKey] && 
        progress.weeklyTheoryRoutines[weekStart].scalesCompleted >= progress.weeklyTheoryRoutines[weekStart].scalesGoal) {
      pointsEarned += POINTS.MINUTE_GOAL_THEORY;
      progress.totalPoints += POINTS.MINUTE_GOAL_THEORY;
      progress.categoryGoalsCompleted[categoryKey] = true;
      console.log(`[Points] +${POINTS.MINUTE_GOAL_THEORY} pt for theory scales goal`);
    }
  } else if (lowerCategory.includes('rhythm') || lowerCategory.includes('time')) {
    progress.weeklyTheoryRoutines[weekStart].rhythmCompleted += minutesStudied;
    categoryKey = `${weekStart}_theory_rhythm`;
    if (!progress.categoryGoalsCompleted[categoryKey] && 
        progress.weeklyTheoryRoutines[weekStart].rhythmCompleted >= progress.weeklyTheoryRoutines[weekStart].rhythmGoal) {
      pointsEarned += POINTS.MINUTE_GOAL_THEORY;
      progress.totalPoints += POINTS.MINUTE_GOAL_THEORY;
      progress.categoryGoalsCompleted[categoryKey] = true;
      console.log(`[Points] +${POINTS.MINUTE_GOAL_THEORY} pt for theory rhythm goal`);
    }
  }

  // Check if weekly theory routine is completed
  const theoryRoutine = progress.weeklyTheoryRoutines[weekStart];
  theoryRoutine.completed = 
    theoryRoutine.basicsCompleted >= theoryRoutine.basicsGoal &&
    theoryRoutine.chordsCompleted >= theoryRoutine.chordsGoal &&
    theoryRoutine.scalesCompleted >= theoryRoutine.scalesGoal &&
    theoryRoutine.rhythmCompleted >= theoryRoutine.rhythmGoal;

  // Update weekly goals with new amounts
  if (!progress.weeklyGoals[weekStart]) {
    progress.weeklyGoals[weekStart] = {
      weekStart,
      songGoalMinutes: 140,
      songCompletedMinutes: 0,
      techniqueGoalMinutes: 20,
      techniqueCompletedMinutes: 0,
      theoryGoalMinutes: 20,
      theoryCompletedMinutes: 0,
      basicsGoalMinutes: THEORY_GOALS.basics,
      basicsCompletedMinutes: 0,
      chordsGoalMinutes: THEORY_GOALS.chords,
      chordsCompletedMinutes: 0,
      scalesGoalMinutes: THEORY_GOALS.scales,
      scalesCompletedMinutes: 0,
      rhythmGoalMinutes: THEORY_GOALS.rhythm,
      rhythmCompletedMinutes: 0,
    };
  }
  progress.weeklyGoals[weekStart].theoryCompletedMinutes += minutesStudied;

  if (lowerCategory.includes('basics') || lowerCategory.includes('intervals')) {
    progress.weeklyGoals[weekStart].basicsCompletedMinutes += minutesStudied;
  } else if (lowerCategory.includes('chord')) {
    progress.weeklyGoals[weekStart].chordsCompletedMinutes += minutesStudied;
  } else if (lowerCategory.includes('scale') || lowerCategory.includes('mode')) {
    progress.weeklyGoals[weekStart].scalesCompletedMinutes += minutesStudied;
  } else if (lowerCategory.includes('rhythm') || lowerCategory.includes('time')) {
    progress.weeklyGoals[weekStart].rhythmCompletedMinutes += minutesStudied;
  }

  // Update total
  progress.totalPracticeMinutes += minutesStudied;

  // Update streak
  const streakBeforeTheory = progress.streak;
  updateStreak(progress);
  dispatchStreakCelebrationIfIncreased(streakBeforeTheory, progress.streak);

  // Check for weekly theory goal completion (combined with technique = 3 pts)
  const weeklyTheoryKey = `${weekStart}_weekly_theory`;
  if (!progress.weeklyGoalsCompleted[weeklyTheoryKey] && 
      progress.weeklyGoals[weekStart].theoryCompletedMinutes >= progress.weeklyGoals[weekStart].theoryGoalMinutes) {
    // Check if technique is also complete for the combined bonus
    const techniqueComplete = progress.weeklyGoals[weekStart].techniqueCompletedMinutes >= progress.weeklyGoals[weekStart].techniqueGoalMinutes;
    const weeklyTechKey = `${weekStart}_weekly_technique`;
    if (techniqueComplete && progress.weeklyGoalsCompleted[weeklyTechKey]) {
      // Both complete, award the combined bonus
      const weeklyBothKey = `${weekStart}_weekly_both`;
      if (!progress.weeklyGoalsCompleted[weeklyBothKey]) {
        pointsEarned += POINTS.WEEKLY_TECHNIQUE_THEORY;
        progress.totalPoints += POINTS.WEEKLY_TECHNIQUE_THEORY;
        progress.weeklyGoalsCompleted[weeklyBothKey] = true;
        console.log(`[Points] +${POINTS.WEEKLY_TECHNIQUE_THEORY} pts for weekly technique+theory`);
      }
    }
    progress.weeklyGoalsCompleted[weeklyTheoryKey] = true;
  }

  // Update skill areas and check for skill area completion (3 pts)
  if (!wasCompleted && updated.completed) {
    progress.skillAreas.musicTheory.current = Math.min(
      progress.skillAreas.musicTheory.total,
      progress.skillAreas.musicTheory.current + 1
    );
    // Check if skill area complete
    if (!progress.skillAreasCompleted['musicTheory'] && 
        progress.skillAreas.musicTheory.current >= progress.skillAreas.musicTheory.total) {
      pointsEarned += POINTS.SKILL_AREA_COMPLETE;
      progress.totalPoints += POINTS.SKILL_AREA_COMPLETE;
      progress.skillAreasCompleted['musicTheory'] = true;
      console.log(`[Points] +${POINTS.SKILL_AREA_COMPLETE} pts for completing Music Theory skill`);
    }
  }

  // Check achievements (4 pts each)
  checkAchievements(progress);

  saveProgress(progress);
  
  // Sync to Supabase when points/streak change
  syncToSupabase(userId, progress.totalPoints, progress.streak);

  console.log(`[updateTheoryProgress] Complete. Points earned: ${pointsEarned}, Total points: ${progress.totalPoints}, Daily theory minutes: ${progress.dailyProgress[today]?.theoryMinutes || 0}`);
  return { theory: updated, pointsEarned };
};

// ========== Streak Management ==========
const updateStreak = (progress: UserProgress): void => {
  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (progress.lastPracticeDate === today) {
    // Already practiced today, no change
    return;
  } else if (progress.lastPracticeDate === yesterdayStr) {
    // Practiced yesterday, increment streak
    progress.streak += 1;
    progress.lastPracticeDate = today;
    console.log(`[Streak] Day ${progress.streak} streak`);

    // Send streak milestone notifications
    const streakMilestones = [7, 14, 21, 30, 50, 100, 365];
    if (streakMilestones.includes(progress.streak)) {
      sendAchievementNotification('streak_milestone', { days: progress.streak });
    }
  } else if (progress.lastPracticeDate === '') {
    // First practice
    progress.streak = 1;
    progress.lastPracticeDate = today;
    console.log(`[Streak] First day streak started`);
  } else {
    // Missed a day, reset streak
    progress.streak = 1;
    progress.lastPracticeDate = today;
    console.log(`[Streak] Streak reset - returning after break`);
  }

  // Cancel streak reminder since user practiced today
  cancelStreakReminder();

  // Schedule streak reminder for later tonight if they have a streak to protect
  if (progress.streak > 0) {
    scheduleStreakReminder(progress.streak);
  }
};

export const getPracticeStreak = (userId: string): number => {
  const progress = loadProgress(userId);
  return progress.streak;
};

// ========== Achievements ==========
const checkAchievements = (progress: UserProgress): void => {
  // Initialize achievements points tracking if needed
  if (!progress.achievementsPointsAwarded) {
    progress.achievementsPointsAwarded = {};
  }

  // Helper to award achievement points (4 pts each)
  const awardAchievement = (key: string) => {
    if (progress.achievements[key] && !progress.achievementsPointsAwarded[key]) {
      progress.totalPoints += POINTS.ACHIEVEMENT;
      progress.achievementsPointsAwarded[key] = true;
      console.log(`[Points] +${POINTS.ACHIEVEMENT} pts for achievement: ${key}`);
    }
  };

  // First Steps - complete first practice
  if (progress.totalPracticeMinutes > 0) {
    progress.achievements.first_steps = true;
    awardAchievement('first_steps');
  }

  // Chord Champion - master 5+ chords
  const masteredChords = Object.values(progress.techniques).filter(
    t => t.category.toLowerCase().includes('chord') && t.completed
  ).length;
  if (masteredChords >= 5) {
    progress.achievements.chord_champion = true;
    awardAchievement('chord_champion');
  }

  // Streak Master - 7+ day streak
  if (progress.streak >= 7) {
    progress.achievements.streak_master = true;
    awardAchievement('streak_master');
  }

  // Song Master - master 3+ songs
  const masteredSongs = Object.values(progress.songs).filter(s => s.progress >= 100).length;
  if (masteredSongs >= 3) {
    progress.achievements.song_master = true;
    awardAchievement('song_master');
  }

  // Time Keeper - 10+ hours total
  if (progress.totalPracticeMinutes >= 600) {
    progress.achievements.time_keeper = true;
    awardAchievement('time_keeper');
  }

  // Theory Scholar - complete 5+ theory topics
  const completedTheory = Object.values(progress.theory).filter(t => t.completed).length;
  if (completedTheory >= 5) {
    progress.achievements.theory_scholar = true;
    awardAchievement('theory_scholar');
  }

  // Daily Dedication - complete daily technique routine
  const today = getToday();
  if (progress.dailyRoutines[today]?.completed) {
    progress.achievements.daily_dedication = true;
    awardAchievement('daily_dedication');
  }

  // Weekly Warrior - complete weekly theory goal
  const weekStart = getWeekStart();
  if (progress.weeklyTheoryRoutines[weekStart]?.completed) {
    progress.achievements.weekly_warrior = true;
    awardAchievement('weekly_warrior');
  }

  // Technique Titan - master 10+ techniques
  const masteredTechniques = Object.values(progress.techniques).filter(t => t.completed).length;
  if (masteredTechniques >= 10) {
    progress.achievements.technique_titan = true;
    awardAchievement('technique_titan');
  }

  // Scale Specialist - master 3+ scales
  const masteredScales = Object.values(progress.techniques).filter(
    t => t.category.toLowerCase().includes('scale') && t.completed
  ).length;
  if (masteredScales >= 3) {
    progress.achievements.scale_specialist = true;
    awardAchievement('scale_specialist');
  }
};

export const getAchievements = (userId: string): Record<string, boolean> => {
  const progress = loadProgress(userId);
  return progress.achievements;
};

// ========== Weekly Minutes ==========
export const getWeeklyPracticeMinutes = (userId: string): Record<string, number> => {
  const progress = loadProgress(userId);
  const weekStart = new Date(getWeekStart());
  const result: Record<string, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
  };

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = getDayName(date);
    result[dayName] = progress.dailyProgress[dateStr]?.totalMinutes || 0;
  }

  return result;
};

export const getTotalWeeklyMinutes = (userId: string): number => {
  const weeklyMinutes = getWeeklyPracticeMinutes(userId);
  return Object.values(weeklyMinutes).reduce((sum, min) => sum + min, 0);
};

// ========== Daily Routine (Technique) ==========
export const getDailyRoutine = (userId: string): DailyRoutine => {
  const progress = loadProgress(userId);
  const today = getToday();
  
  // If today's routine doesn't exist, create and save it
  if (!progress.dailyRoutines[today]) {
    const newRoutine: DailyRoutine = {
      date: today,
      chordsGoal: TECHNIQUE_GOALS.chords,
      chordsCompleted: 0,
      strumsGoal: TECHNIQUE_GOALS.strums,
      strumsCompleted: 0,
      plucksGoal: TECHNIQUE_GOALS.plucks,
      plucksCompleted: 0,
      scalesGoal: TECHNIQUE_GOALS.scales,
      scalesCompleted: 0,
      completed: false,
    };
    progress.dailyRoutines[today] = newRoutine;
    saveProgress(progress);
    console.log(`[DailyRoutine] Created new technique routine for ${today}`);
    return newRoutine;
  }
  
  return progress.dailyRoutines[today];
};

// ========== Daily Theory Routine ==========
export const getDailyTheoryRoutine = (userId: string): DailyTheoryRoutine => {
  const progress = loadProgress(userId);
  const today = getToday();
  
  // Ensure dailyTheoryRoutines object exists
  if (!progress.dailyTheoryRoutines) {
    progress.dailyTheoryRoutines = {};
  }
  
  // If today's routine doesn't exist, create and save it
  if (!progress.dailyTheoryRoutines[today]) {
    const newRoutine: DailyTheoryRoutine = {
      date: today,
      basicsGoal: THEORY_GOALS.basics,
      basicsCompleted: 0,
      chordsGoal: THEORY_GOALS.chords,
      chordsCompleted: 0,
      scalesGoal: THEORY_GOALS.scales,
      scalesCompleted: 0,
      rhythmGoal: THEORY_GOALS.rhythm,
      rhythmCompleted: 0,
      completed: false,
    };
    progress.dailyTheoryRoutines[today] = newRoutine;
    saveProgress(progress);
    console.log(`[DailyTheoryRoutine] Created new theory routine for ${today}`);
    return newRoutine;
  }
  
  return progress.dailyTheoryRoutines[today];
};

// ========== Weekly Theory Routine ==========
export const getWeeklyTheoryRoutine = (userId: string): WeeklyTheoryRoutine => {
  const progress = loadProgress(userId);
  const weekStart = getWeekStart();
  return progress.weeklyTheoryRoutines[weekStart] || {
    weekStart,
    basicsGoal: THEORY_GOALS.basics,
    basicsCompleted: 0,
    chordsGoal: THEORY_GOALS.chords,
    chordsCompleted: 0,
    scalesGoal: THEORY_GOALS.scales,
    scalesCompleted: 0,
    rhythmGoal: THEORY_GOALS.rhythm,
    rhythmCompleted: 0,
    completed: false,
  };
};

// ========== Points ==========
export const getTotalPoints = (userId: string): number => {
  const progress = loadProgress(userId);
  return progress.totalPoints || 0;
};

export const addPoints = (userId: string, points: number): number => {
  const progress = loadProgress(userId);
  progress.totalPoints = (progress.totalPoints || 0) + points;
  saveProgress(progress);

  // Sync to Supabase when points change
  syncToSupabase(userId, progress.totalPoints, progress.streak);

  return progress.totalPoints;
};

/** Grant coins (whole units). Typically floor(pointGrant / 3) so coins are ~3× “rarer” than points. */
export const addCoins = (userId: string, coins: number): number => {
  if (coins <= 0) return loadProgress(userId).totalCoins || 0;
  const progress = loadProgress(userId);
  progress.totalCoins = (progress.totalCoins || 0) + Math.floor(coins);
  saveProgress(progress);
  syncToSupabase(userId, progress.totalPoints, progress.streak);
  return progress.totalCoins;
};

/** Points earned this grant → coin grant using floor division (lower bound). */
export const coinsFromPointsFloor = (points: number): number =>
  points > 0 ? Math.floor(points / 3) : 0;

/** Add minutes spent on technique/theory learning journey quizzes. Updates daily + weekly tallies and awards today's goal point once when threshold (5 min) is reached. */
export const addLearningJourneyMinutes = (userId: string, type: 'technique' | 'theory', minutes: number): void => {
  if (minutes <= 0) return;
  const progress = loadProgress(userId);
  const today = getToday();
  const weekStart = getWeekStart();

  if (!progress.dailyProgress[today]) {
    progress.dailyProgress[today] = {
      date: today,
      totalMinutes: 0,
      songsMinutes: 0,
      techniqueMinutes: 0,
      theoryMinutes: 0,
      chordsMinutes: 0,
      strumsMinutes: 0,
      plucksMinutes: 0,
      scalesMinutes: 0,
      basicsMinutes: 0,
      rhythmMinutes: 0,
      goalsCompleted: [],
    };
  }

  const dp = progress.dailyProgress[today];
  if (type === 'technique') {
    dp.techniqueMinutes = (dp.techniqueMinutes || 0) + minutes;
  } else {
    dp.theoryMinutes = (dp.theoryMinutes || 0) + minutes;
  }
  dp.totalMinutes = (dp.totalMinutes || 0) + minutes;

  if (!progress.weeklyGoals[weekStart]) {
    progress.weeklyGoals[weekStart] = {
      weekStart,
      songGoalMinutes: 140,
      songCompletedMinutes: 0,
      techniqueGoalMinutes: 20,
      techniqueCompletedMinutes: 0,
      theoryGoalMinutes: 20,
      theoryCompletedMinutes: 0,
      basicsGoalMinutes: THEORY_GOALS.basics,
      basicsCompletedMinutes: 0,
      chordsGoalMinutes: THEORY_GOALS.chords,
      chordsCompletedMinutes: 0,
      scalesGoalMinutes: THEORY_GOALS.scales,
      scalesCompletedMinutes: 0,
      rhythmGoalMinutes: THEORY_GOALS.rhythm,
      rhythmCompletedMinutes: 0,
    };
  }
  const wg = progress.weeklyGoals[weekStart];
  if (type === 'technique') {
    wg.techniqueCompletedMinutes = (wg.techniqueCompletedMinutes || 0) + minutes;
  } else {
    wg.theoryCompletedMinutes = (wg.theoryCompletedMinutes || 0) + minutes;
  }

  progress.totalPracticeMinutes = (progress.totalPracticeMinutes || 0) + minutes;

  const techniqueGoalKey = 'technique_goal_5';
  const theoryGoalKey = 'theory_goal_5';
  if (type === 'technique' && (dp.techniqueMinutes || 0) >= 5 && !(dp.goalsCompleted || []).includes(techniqueGoalKey)) {
    dp.goalsCompleted = dp.goalsCompleted || [];
    dp.goalsCompleted.push(techniqueGoalKey);
    progress.totalPoints = (progress.totalPoints || 0) + POINTS.MINUTE_GOAL_TECHNIQUE;
    console.log(`[Points] +${POINTS.MINUTE_GOAL_TECHNIQUE} pt for today's technique goal (5 min)`);
  }
  if (type === 'theory' && (dp.theoryMinutes || 0) >= 5 && !(dp.goalsCompleted || []).includes(theoryGoalKey)) {
    dp.goalsCompleted = dp.goalsCompleted || [];
    dp.goalsCompleted.push(theoryGoalKey);
    progress.totalPoints = (progress.totalPoints || 0) + POINTS.MINUTE_GOAL_THEORY;
    console.log(`[Points] +${POINTS.MINUTE_GOAL_THEORY} pt for today's theory goal (5 min)`);
  }

  const streakBeforeJourneyMin = progress.streak;
  updateStreak(progress);
  dispatchStreakCelebrationIfIncreased(streakBeforeJourneyMin, progress.streak);
  saveProgress(progress);
  syncToSupabase(userId, progress.totalPoints, progress.streak);
};

/** Mark that the user completed one technique or theory lesson today and award today's goal point if not already awarded. Call when one quiz/category is completed. */
export const markLearningJourneyLessonCompleted = (userId: string, type: 'technique' | 'theory'): void => {
  const progress = loadProgress(userId);
  const today = getToday();
  if (!progress.dailyProgress[today]) {
    progress.dailyProgress[today] = {
      date: today,
      totalMinutes: 0,
      songsMinutes: 0,
      techniqueMinutes: 0,
      theoryMinutes: 0,
      chordsMinutes: 0,
      strumsMinutes: 0,
      plucksMinutes: 0,
      scalesMinutes: 0,
      basicsMinutes: 0,
      rhythmMinutes: 0,
      goalsCompleted: [],
    };
  }
  const dp = progress.dailyProgress[today];
  const techniqueLessonKey = 'technique_lesson_today';
  const theoryLessonKey = 'theory_lesson_today';
  if (type === 'technique' && !(dp.goalsCompleted || []).includes(techniqueLessonKey)) {
    dp.goalsCompleted = dp.goalsCompleted || [];
    dp.goalsCompleted.push(techniqueLessonKey);
    progress.totalPoints = (progress.totalPoints || 0) + POINTS.MINUTE_GOAL_TECHNIQUE;
    console.log(`[Points] +${POINTS.MINUTE_GOAL_TECHNIQUE} pt for today's technique goal (1 lesson completed)`);
  }
  if (type === 'theory' && !(dp.goalsCompleted || []).includes(theoryLessonKey)) {
    dp.goalsCompleted = dp.goalsCompleted || [];
    dp.goalsCompleted.push(theoryLessonKey);
    progress.totalPoints = (progress.totalPoints || 0) + POINTS.MINUTE_GOAL_THEORY;
    console.log(`[Points] +${POINTS.MINUTE_GOAL_THEORY} pt for today's theory goal (1 lesson completed)`);
  }
  const streakBeforeLesson = progress.streak;
  updateStreak(progress);
  dispatchStreakCelebrationIfIncreased(streakBeforeLesson, progress.streak);
  saveProgress(progress);
  syncToSupabase(userId, progress.totalPoints, progress.streak);
};

// Calculate comprehensive points breakdown
export interface PointsBreakdown {
  dailyGoals: number;           // 1 pt each daily goal
  songsCompleted: number;       // 10 pts per song completed
  weeklySongGoal: number;       // 3 pts if weekly song goal met
  techniqueMinuteGoals: number; // 1 pt per technique minute goal reached
  theoryMinuteGoals: number;    // 1 pt per theory minute goal reached
  cardsCompleted: number;       // 2 pts per technique/theory card completed
  weeklyTechniqueTheory: number;// 3 pts for weekly completion
  levelBonus: number;           // 15 pts per level
  minutesBonus: number;         // total minutes / 10 rounded up
  achievements: number;         // 4 pts per achievement
  skillAreas: number;           // 3 pts per skill area completed
  total: number;
}

export const calculatePointsBreakdown = (userId: string): PointsBreakdown => {
  const progress = loadProgress(userId);
  const today = getToday();
  const weekStart = getWeekStart();
  
  // 1. Daily goals (1 pt each) - check how many daily technique & theory goals completed today
  const dailyRoutine = progress.dailyRoutines[today];
  const dailyTheoryRoutine = progress.dailyTheoryRoutines?.[today];
  let dailyGoalsPoints = 0;
  // Technique daily goals
  if (dailyRoutine) {
    if (dailyRoutine.chordsCompleted >= dailyRoutine.chordsGoal) dailyGoalsPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyRoutine.strumsCompleted >= dailyRoutine.strumsGoal) dailyGoalsPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyRoutine.plucksCompleted >= dailyRoutine.plucksGoal) dailyGoalsPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyRoutine.scalesCompleted >= dailyRoutine.scalesGoal) dailyGoalsPoints += POINTS.DAILY_GOAL_EACH;
  }
  // Theory daily goals
  if (dailyTheoryRoutine) {
    if (dailyTheoryRoutine.basicsCompleted >= dailyTheoryRoutine.basicsGoal) dailyGoalsPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyTheoryRoutine.chordsCompleted >= dailyTheoryRoutine.chordsGoal) dailyGoalsPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyTheoryRoutine.scalesCompleted >= dailyTheoryRoutine.scalesGoal) dailyGoalsPoints += POINTS.DAILY_GOAL_EACH;
    if (dailyTheoryRoutine.rhythmCompleted >= dailyTheoryRoutine.rhythmGoal) dailyGoalsPoints += POINTS.DAILY_GOAL_EACH;
  }
  
  // 2. Songs completed (10 pts each)
  const completedSongs = Object.values(progress.songs).filter(s => s.progress >= 100).length;
  const songsCompletedPoints = completedSongs * POINTS.SONG_COMPLETE;
  
  // 3. Weekly song goal (3 pts)
  const weeklyGoals = progress.weeklyGoals[weekStart];
  const weeklySongGoalPoints = weeklyGoals && weeklyGoals.songCompletedMinutes >= weeklyGoals.songGoalMinutes 
    ? POINTS.WEEKLY_SONG_GOAL : 0;
  
  // 4. Technique minute goals (1 pt each category that reached goal)
  let techniqueMinuteGoalsPoints = 0;
  if (dailyRoutine) {
    if (dailyRoutine.chordsCompleted >= TECHNIQUE_GOALS.chords) techniqueMinuteGoalsPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
    if (dailyRoutine.strumsCompleted >= TECHNIQUE_GOALS.strums) techniqueMinuteGoalsPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
    if (dailyRoutine.plucksCompleted >= TECHNIQUE_GOALS.plucks) techniqueMinuteGoalsPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
    if (dailyRoutine.scalesCompleted >= TECHNIQUE_GOALS.scales) techniqueMinuteGoalsPoints += POINTS.MINUTE_GOAL_TECHNIQUE;
  }
  
  // 5. Theory minute goals (1 pt each category that reached goal) - daily
  let theoryMinuteGoalsPoints = 0;
  if (dailyTheoryRoutine) {
    if (dailyTheoryRoutine.basicsCompleted >= THEORY_GOALS.basics) theoryMinuteGoalsPoints += POINTS.MINUTE_GOAL_THEORY;
    if (dailyTheoryRoutine.chordsCompleted >= THEORY_GOALS.chords) theoryMinuteGoalsPoints += POINTS.MINUTE_GOAL_THEORY;
    if (dailyTheoryRoutine.scalesCompleted >= THEORY_GOALS.scales) theoryMinuteGoalsPoints += POINTS.MINUTE_GOAL_THEORY;
    if (dailyTheoryRoutine.rhythmCompleted >= THEORY_GOALS.rhythm) theoryMinuteGoalsPoints += POINTS.MINUTE_GOAL_THEORY;
  }
  
  // 6. Cards completed (2 pts each technique/theory card)
  const completedTechniques = Object.values(progress.techniques).filter(t => t.completed).length;
  const completedTheory = Object.values(progress.theory).filter(t => t.completed).length;
  const cardsCompletedPoints = (completedTechniques + completedTheory) * POINTS.CARD_COMPLETE;
  
  // 7. Weekly technique/theory completion (3 pts if both complete)
  const weeklyTechTheoryPoints = (dailyRoutine?.completed && dailyTheoryRoutine?.completed) 
    ? POINTS.WEEKLY_TECHNIQUE_THEORY : 0;
  
  // 8. Level bonus (15 pts per level above 1)
  const levelBonusPoints = (progress.currentLevel - 1) * POINTS.LEVEL_UP;
  
  // 9. Minutes bonus (total minutes / 10, rounded up)
  const minutesBonusPoints = Math.ceil(progress.totalPracticeMinutes / 10) * POINTS.MINUTES_BONUS;
  
  // 10. Achievements (4 pts each)
  const earnedAchievements = Object.values(progress.achievements).filter(Boolean).length;
  const achievementsPoints = earnedAchievements * POINTS.ACHIEVEMENT;
  
  // 11. Skill areas completed (3 pts each)
  let skillAreasCompleted = 0;
  if (progress.skillAreas.chordMastery.current >= progress.skillAreas.chordMastery.total) skillAreasCompleted++;
  if (progress.skillAreas.strummingPatterns.current >= progress.skillAreas.strummingPatterns.total) skillAreasCompleted++;
  if (progress.skillAreas.musicTheory.current >= progress.skillAreas.musicTheory.total) skillAreasCompleted++;
  if (progress.skillAreas.songRepertoire.current >= progress.skillAreas.songRepertoire.total) skillAreasCompleted++;
  const skillAreasPoints = skillAreasCompleted * POINTS.SKILL_AREA_COMPLETE;
  
  const total = dailyGoalsPoints + songsCompletedPoints + weeklySongGoalPoints + 
                techniqueMinuteGoalsPoints + theoryMinuteGoalsPoints + cardsCompletedPoints +
                weeklyTechTheoryPoints + levelBonusPoints + minutesBonusPoints +
                achievementsPoints + skillAreasPoints;
  
  return {
    dailyGoals: dailyGoalsPoints,
    songsCompleted: songsCompletedPoints,
    weeklySongGoal: weeklySongGoalPoints,
    techniqueMinuteGoals: techniqueMinuteGoalsPoints,
    theoryMinuteGoals: theoryMinuteGoalsPoints,
    cardsCompleted: cardsCompletedPoints,
    weeklyTechniqueTheory: weeklyTechTheoryPoints,
    levelBonus: levelBonusPoints,
    minutesBonus: minutesBonusPoints,
    achievements: achievementsPoints,
    skillAreas: skillAreasPoints,
    total
  };
};

// Recalculate and sync total points
export const syncTotalPoints = (userId: string): number => {
  const progress = loadProgress(userId);
  const breakdown = calculatePointsBreakdown(userId);
  progress.totalPoints = breakdown.total;
  saveProgress(progress);
  
  // Sync to Supabase when points change
  syncToSupabase(userId, progress.totalPoints, progress.streak);
  
  return breakdown.total;
};

// ========== Daily practice goal (user-set minutes per day; weekly = goal * 7) ==========
const DEFAULT_DAILY_PRACTICE_GOAL = 30;

export const getDailyPracticeGoal = (userId: string): number => {
  const progress = loadProgress(userId);
  return progress.dailyPracticeGoalMinutes ?? DEFAULT_DAILY_PRACTICE_GOAL;
};

export const setDailyPracticeGoal = (userId: string, minutes: number): void => {
  const progress = loadProgress(userId);
  progress.dailyPracticeGoalMinutes = Math.max(5, Math.min(120, minutes));
  saveProgress(progress);
};

// ========== Weekly Goals ==========
export const getWeeklyGoals = (userId: string): WeeklyGoals => {
  const progress = loadProgress(userId);
  const weekStart = getWeekStart();
  return progress.weeklyGoals[weekStart] || {
    weekStart,
    songGoalMinutes: 140,
    songCompletedMinutes: 0,
    techniqueGoalMinutes: 20,
    techniqueCompletedMinutes: 0,
    theoryGoalMinutes: 20,
    theoryCompletedMinutes: 0,
    basicsGoalMinutes: THEORY_GOALS.basics,
    basicsCompletedMinutes: 0,
    chordsGoalMinutes: THEORY_GOALS.chords,
    chordsCompletedMinutes: 0,
    scalesGoalMinutes: THEORY_GOALS.scales,
    scalesCompletedMinutes: 0,
    rhythmGoalMinutes: THEORY_GOALS.rhythm,
    rhythmCompletedMinutes: 0,
  };
};

// ========== Custom Songs ==========
export const addCustomSong = (userId: string, song: any): void => {
  const progress = loadProgress(userId);
  const songId = `custom_${Date.now()}`;
  const customSong = {
    ...song,
    id: songId,
    isCustom: true,
  };
  progress.customSongs.push(customSong);
  
  // Also add to selected songs automatically
  addSelectedSong(userId, {
    songId,
    title: song.title,
    artist: song.artist,
    genre: song.genre,
    chords: song.chords || [],
    bpm: song.bpm || 120,
    duration: song.duration || '3:00',
    difficulty: song.difficulty || 2,
    isCustom: true,
  });
  
  saveProgress(progress);
};

export const getCustomSongs = (userId: string): any[] => {
  const progress = loadProgress(userId);
  return progress.customSongs || [];
};

// ========== Selected Songs (Learning List) ==========
export const addSelectedSong = (userId: string, song: {
  songId?: string;
  title: string;
  artist: string;
  genre: string;
  chords: string[];
  bpm: number;
  duration: string;
  difficulty: number;
  isCustom?: boolean;
  melodyOnly?: boolean;
}): void => {
  const progress = loadProgress(userId);
  
  // Generate songId if not provided
  const songId = song.songId || `${song.title.toLowerCase().replace(/\s+/g, '_')}_${song.artist.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Check if already selected
  if (progress.selectedSongs.some(s => s.songId === songId)) {
    return; // Already in learning list
  }
  
  progress.selectedSongs.push({
    songId,
    title: song.title,
    artist: song.artist,
    genre: song.genre,
    chords: song.chords,
    bpm: song.bpm,
    duration: song.duration,
    difficulty: song.difficulty,
    addedAt: new Date().toISOString(),
    isCustom: song.isCustom,
    melodyOnly: song.melodyOnly,
  });
  
  saveProgress(progress);
};

export const removeSelectedSong = (userId: string, songId: string): void => {
  const progress = loadProgress(userId);
  progress.selectedSongs = progress.selectedSongs.filter(s => s.songId !== songId);
  saveProgress(progress);
};

export const getSelectedSongs = (userId: string): SelectedSong[] => {
  const progress = loadProgress(userId);
  return progress.selectedSongs || [];
};

export const isSelectedSong = (userId: string, songId: string): boolean => {
  const progress = loadProgress(userId);
  return progress.selectedSongs.some(s => s.songId === songId);
};

// ========== Skill Areas ==========
export const getSkillAreas = (userId: string) => {
  const progress = loadProgress(userId);
  return progress.skillAreas;
};

export const updateSkillArea = (
  userId: string,
  area: 'chordMastery' | 'strummingPatterns' | 'musicTheory' | 'songRepertoire',
  increment: number
): void => {
  const progress = loadProgress(userId);
  progress.skillAreas[area].current = Math.min(
    progress.skillAreas[area].total,
    progress.skillAreas[area].current + increment
  );
  saveProgress(progress);
};

// ========== Song Mastered Count ==========
export const getMasteredSongsCount = (userId: string): number => {
  const progress = loadProgress(userId);
  return Object.values(progress.songs).filter(s => s.progress >= 100).length;
};

// ========== Reset Weekly Data ==========
export const resetWeeklyData = (userId: string): void => {
  const progress = loadProgress(userId);
  const weekStart = getWeekStart();
  
  // Reset weekly goals with new amounts
  progress.weeklyGoals[weekStart] = {
    weekStart,
    songGoalMinutes: 140,
    songCompletedMinutes: 0,
    techniqueGoalMinutes: 20,
    techniqueCompletedMinutes: 0,
    theoryGoalMinutes: 20,
    theoryCompletedMinutes: 0,
    basicsGoalMinutes: THEORY_GOALS.basics,
    basicsCompletedMinutes: 0,
    chordsGoalMinutes: THEORY_GOALS.chords,
    chordsCompletedMinutes: 0,
    scalesGoalMinutes: THEORY_GOALS.scales,
    scalesCompletedMinutes: 0,
    rhythmGoalMinutes: THEORY_GOALS.rhythm,
    rhythmCompletedMinutes: 0,
  };

  // Reset weekly theory routine with new amounts
  progress.weeklyTheoryRoutines[weekStart] = {
    weekStart,
    basicsGoal: THEORY_GOALS.basics,
    basicsCompleted: 0,
    chordsGoal: THEORY_GOALS.chords,
    chordsCompleted: 0,
    scalesGoal: THEORY_GOALS.scales,
    scalesCompleted: 0,
    rhythmGoal: THEORY_GOALS.rhythm,
    rhythmCompleted: 0,
    completed: false,
  };

  saveProgress(progress);
};

// ========== New Achievement System ==========
import achievementsData from '../data/achievements.json';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement: {
    type: string;
    value: number;
    category?: string;
  };
}

export interface AchievementSet {
  setId: number;
  name: string;
  description: string;
  achievements: Achievement[];
}

/** Human-readable "how to unlock" path for an achievement requirement */
export function getAchievementPathText(requirement: Achievement['requirement']): string {
  const v = requirement.value;
  switch (requirement.type) {
    case 'totalMinutes':
      return v >= 60 ? `Practice ${Math.round(v / 60)} hour${v >= 120 ? 's' : ''} total` : `Practice ${v} minute${v !== 1 ? 's' : ''} total`;
    case 'streak':
      return `Practice ${v} day${v !== 1 ? 's' : ''} in a row`;
    case 'totalPoints':
      return `Earn ${v} point${v !== 1 ? 's' : ''}`;
    case 'level':
      return `Reach level ${v}`;
    case 'selectedSongs':
      return `Add ${v} song${v !== 1 ? 's' : ''} to learn`;
    case 'songsStarted':
      return `Start practicing ${v} song${v !== 1 ? 's' : ''}`;
    case 'songsCompleted':
      return `Complete ${v} song${v !== 1 ? 's' : ''} (100%)`;
    case 'songProgress':
      return `Reach ${v}% on any song`;
    case 'theoryCompleted':
      return `Complete ${v} theory topic${v !== 1 ? 's' : ''}`;
    case 'techniquesCompleted':
      if (requirement.category) {
        const cat = requirement.category.charAt(0).toUpperCase() + requirement.category.slice(1);
        return `Complete ${v} ${cat} technique${v !== 1 ? 's' : ''}`;
      }
      return `Complete ${v} technique${v !== 1 ? 's' : ''}`;
    case 'dailyGoals':
      return `Complete ${v} daily goal${v !== 1 ? 's' : ''}`;
    case 'dailyRoutineComplete':
    case 'dailyRoutinesCompleted':
      return `Complete daily routine ${v} time${v !== 1 ? 's' : ''}`;
    case 'weeklyGoalsCompleted':
      return `Complete weekly goals ${v} time${v !== 1 ? 's' : ''}`;
    case 'allCategories':
      return `Complete ${v} technique${v !== 1 ? 's' : ''} in each category`;
    case 'skillAreasCompleted':
      return `Complete ${v} skill area${v !== 1 ? 's' : ''}`;
    default:
      return 'Complete the requirement';
  }
}

// Get the current achievement set for a user
export const getCurrentAchievementSet = (userId: string): AchievementSet | null => {
  const progress = loadProgress(userId);
  const setId = progress.currentAchievementSet || 1;
  const set = achievementsData.achievementSets.find(s => s.setId === setId);
  return set || null;
};

// Get all achievement sets
export const getAllAchievementSets = (): AchievementSet[] => {
  return achievementsData.achievementSets;
};

// Check if a specific achievement requirement is met
export const checkAchievementRequirement = (userId: string, requirement: Achievement['requirement']): boolean => {
  const progress = loadProgress(userId);
  
  switch (requirement.type) {
    case 'totalMinutes':
      return progress.totalPracticeMinutes >= requirement.value;
      
    case 'streak':
      return progress.streak >= requirement.value;
      
    case 'totalPoints':
      return progress.totalPoints >= requirement.value;
      
    case 'level':
      return progress.currentLevel >= requirement.value;
      
    case 'selectedSongs':
      return progress.selectedSongs.length >= requirement.value;
      
    case 'songsStarted':
      return Object.values(progress.songs).filter(s => s.progress > 0).length >= requirement.value;
      
    case 'songsCompleted':
      return Object.values(progress.songs).filter(s => s.progress >= 100).length >= requirement.value;
      
    case 'songProgress':
      return Object.values(progress.songs).some(s => s.progress >= requirement.value);
      
    case 'theoryCompleted':
      return Object.values(progress.theory).filter(t => t.completed).length >= requirement.value;
      
    case 'techniquesCompleted':
      if (requirement.category) {
        return Object.values(progress.techniques).filter(
          t => t.category.toLowerCase().includes(requirement.category!) && t.completed
        ).length >= requirement.value;
      }
      return Object.values(progress.techniques).filter(t => t.completed).length >= requirement.value;
      
    case 'dailyGoals':
      // Check if at least one daily goal is completed today
      const today = getToday();
      const routine = progress.dailyRoutines[today];
      if (!routine) return false;
      const completedGoals = [
        routine.chordsCompleted >= routine.chordsGoal,
        routine.strumsCompleted >= routine.strumsGoal,
        routine.plucksCompleted >= routine.plucksGoal,
        routine.scalesCompleted >= routine.scalesGoal,
      ].filter(Boolean).length;
      return completedGoals >= requirement.value;
      
    case 'dailyRoutineComplete':
      return (progress.dailyRoutinesCompleted || 0) >= requirement.value;
      
    case 'dailyRoutinesCompleted':
      return (progress.dailyRoutinesCompleted || 0) >= requirement.value;
      
    case 'weeklyGoalsCompleted':
      return (progress.weeklyGoalsCount || 0) >= requirement.value;
      
    case 'allCategories':
      // Check if user has completed at least X techniques in each category
      const categories = ['chord', 'strum', 'pluck', 'scale'];
      return categories.every(cat => 
        Object.values(progress.techniques).filter(
          t => t.category.toLowerCase().includes(cat) && t.completed
        ).length >= requirement.value
      );
      
    case 'skillAreasCompleted':
      const skillAreas = progress.skillAreas;
      const completedAreas = [
        skillAreas.chordMastery.current >= skillAreas.chordMastery.total,
        skillAreas.strummingPatterns.current >= skillAreas.strummingPatterns.total,
        skillAreas.musicTheory.current >= skillAreas.musicTheory.total,
        skillAreas.songRepertoire.current >= skillAreas.songRepertoire.total,
      ].filter(Boolean).length;
      return completedAreas >= requirement.value;
      
    default:
      return false;
  }
};

// Get achievements with their earned status for the current set
export const getCurrentAchievementsWithStatus = (userId: string): (Achievement & { earned: boolean })[] => {
  const progress = loadProgress(userId);
  const currentSet = getCurrentAchievementSet(userId);
  
  if (!currentSet) return [];
  
  return currentSet.achievements.map(achievement => ({
    ...achievement,
    earned: progress.achievements[achievement.id] || checkAchievementRequirement(userId, achievement.requirement),
  }));
};

// Update achievements and check if set is complete
export const updateAchievements = (userId: string): { earnedNew: string[]; setAdvanced: boolean } => {
  const progress = loadProgress(userId);
  const currentSet = getCurrentAchievementSet(userId);
  const earnedNew: string[] = [];
  let setAdvanced = false;
  
  if (!currentSet) return { earnedNew, setAdvanced };
  
  // Check each achievement in current set
  for (const achievement of currentSet.achievements) {
    if (!progress.achievements[achievement.id]) {
      const isEarned = checkAchievementRequirement(userId, achievement.requirement);
      if (isEarned) {
        progress.achievements[achievement.id] = true;
        earnedNew.push(achievement.id);
        
        // Award points if not already awarded
        if (!progress.achievementsPointsAwarded[achievement.id]) {
          progress.totalPoints += POINTS.ACHIEVEMENT;
          progress.achievementsPointsAwarded[achievement.id] = true;
          console.log(`[Points] +${POINTS.ACHIEVEMENT} pts for achievement: ${achievement.title}`);
        }
      }
    }
  }
  
  // Check if all 8 achievements in current set are earned
  const allEarned = currentSet.achievements.every(a => progress.achievements[a.id]);
  
  if (allEarned && progress.currentAchievementSet < achievementsData.achievementSets.length) {
    progress.currentAchievementSet += 1;
    setAdvanced = true;
    console.log(`[Achievements] Advanced to set ${progress.currentAchievementSet}`);
  }
  
  saveProgress(progress);
  return { earnedNew, setAdvanced };
};

// Get total achievements earned across all sets
export const getTotalAchievementsEarned = (userId: string): number => {
  const progress = loadProgress(userId);
  return Object.values(progress.achievements).filter(Boolean).length;
};

// Get total possible achievements
export const getTotalPossibleAchievements = (): number => {
  return achievementsData.achievementSets.reduce((total, set) => total + set.achievements.length, 0);
};

// Increment daily routines completed counter
export const incrementDailyRoutinesCompleted = (userId: string): void => {
  const progress = loadProgress(userId);
  progress.dailyRoutinesCompleted = (progress.dailyRoutinesCompleted || 0) + 1;
  saveProgress(progress);
};

// Increment weekly goals completed counter
export const incrementWeeklyGoalsCompleted = (userId: string): void => {
  const progress = loadProgress(userId);
  progress.weeklyGoalsCount = (progress.weeklyGoalsCount || 0) + 1;
  saveProgress(progress);
};

// Load progress from Supabase cloud storage
export const loadProgressFromSupabase = async (userId: string): Promise<UserProgress | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.log('No cloud progress found for user:', userId);
      return null;
    }

    // Merge cloud data into local progress
    const localProgress = loadProgress(userId);
    const mergedProgress: UserProgress = {
      ...localProgress,
      totalPoints: Math.max(localProgress.totalPoints || 0, data.total_points || 0),
      streak: Math.max(localProgress.streak || 0, data.streak || 0),
      selectedSongs: data.selected_songs || localProgress.selectedSongs || [],
    };

    saveProgress(mergedProgress);
    return mergedProgress;
  } catch (error) {
    console.error('Error loading progress from Supabase:', error);
    return null;
  }
};

// Sync full progress data to Supabase cloud storage
export const syncFullProgressToSupabase = async (userId: string): Promise<void> => {
  if (!supabase) return;
  try {
    const progress = loadProgress(userId);

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        total_points: progress.totalPoints || 0,
        streak: progress.streak || 0,
        selected_songs: progress.selectedSongs || [],
        songs_progress: progress.songs || {},
        techniques_progress: progress.techniques || {},
        theory_progress: progress.theory || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error syncing progress to Supabase:', error);
    } else {
      console.log('✅ Progress synced to Supabase');
    }
  } catch (error) {
    console.error('Error in syncFullProgressToSupabase:', error);
  }
};
