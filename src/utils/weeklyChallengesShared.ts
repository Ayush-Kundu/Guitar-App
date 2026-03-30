/**
 * Shared weekly challenge list + progress (Compete dialog + Dashboard strip).
 */

import weeklyChallengesData from '../data/weekly-challenges.json';
import { loadProgress, type UserProgress } from './progressStorage';

export interface WeeklyChallenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  points: number;
  proofType: string;
  tips: string;
  icon?: string;
  requirement?: {
    type: string;
    count: number;
    [key: string]: unknown;
  };
}

/** Strip leading emoji from JSON titles (no icon column in UI). */
export function weeklyChallengePlainTitle(title: string): string {
  let t = title.trim();
  while (t.length > 0) {
    const m = t.match(/^(?:\p{Extended_Pictographic}|\uFE0F|\u200D)+(?:\s|\uFE0F)*/u);
    if (!m) break;
    t = t.slice(m[0].length).trimStart();
  }
  return t.trim();
}

/** Points awarded when a weekly challenge completes (by difficulty). */
export function getWeeklyChallengePointsForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'beginner':
      return 6;
    case 'intermediate':
      return 12;
    case 'advanced':
      return 20;
    default:
      return 8;
  }
}

export function getWeeklyChallengesList(): WeeklyChallenge[] {
  const challenges = weeklyChallengesData.challenges as WeeklyChallenge[];
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  const startIndex = ((weekNumber - 1) * 4) % challenges.length;
  const selected: WeeklyChallenge[] = [];
  for (let i = 0; i < 4; i++) {
    const raw = challenges[(startIndex + i) % challenges.length];
    selected.push({
      ...raw,
      title: weeklyChallengePlainTitle(raw.title),
      points: getWeeklyChallengePointsForDifficulty(raw.difficulty),
    });
  }
  return selected;
}

export type ChallengeProgressContext = {
  weeklyPoints?: number;
};

/** Difficulty pill (classic green / yellow / red). */
export function getDifficultyStyle(difficulty: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (difficulty) {
    case 'beginner':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    case 'intermediate':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    case 'advanced':
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/35',
        text: 'text-rose-800 dark:text-rose-200',
        border: 'border-rose-300 dark:border-rose-600',
      };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  }
}

/** Progress bar: blue while in progress, green when complete (classic weekly UI). */
export function getDifficultyProgressFillClass(_difficulty: string, isComplete: boolean): string {
  return isComplete ? 'bg-green-500' : 'bg-blue-500';
}

/** Empty progress track: border + fill match difficulty (complete → green). */
export function getDifficultyTrackClass(difficulty: string, isComplete: boolean): string {
  if (isComplete) {
    return 'border border-green-500/70 dark:border-green-400/50 bg-green-50/95 dark:bg-green-950/40';
  }
  switch (difficulty) {
    case 'beginner':
      return 'border border-green-400/85 dark:border-green-500/55 bg-green-50/90 dark:bg-green-950/35';
    case 'intermediate':
      return 'border border-amber-400/85 dark:border-amber-500/55 bg-amber-50/90 dark:bg-amber-950/30';
    case 'advanced':
      return 'border border-rose-400/85 dark:border-rose-500/55 bg-rose-50/90 dark:bg-rose-950/35';
    default:
      return 'border border-gray-400 dark:border-slate-500 bg-gray-100 dark:bg-slate-700/90';
  }
}

/** Filled portion of a challenge bar — matches difficulty accent when in progress. */
export function getDifficultyBarFillClass(difficulty: string, isComplete: boolean): string {
  if (isComplete) return 'bg-green-500';
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500';
    case 'intermediate':
      return 'bg-amber-500';
    case 'advanced':
      return 'bg-red-500';
    default:
      return 'bg-blue-500';
  }
}

function weekStartIso(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const d = new Date(now);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function getWeeklyChallengeProgress(
  challenge: WeeklyChallenge,
  userId: string,
  ctx?: ChallengeProgressContext
): { current: number; target: number; isComplete: boolean } {
  if (!challenge.requirement || !userId) {
    return { current: 0, target: 1, isComplete: false };
  }

  const progress = loadProgress(userId) as UserProgress & {
    completedLessons?: string[];
    completedTheoryLessons?: string[];
  };
  const requirement = challenge.requirement;
  const target = requirement.count || 1;
  let current = 0;
  const weekStart = weekStartIso();

  switch (requirement.type) {
    case 'songs_completed':
    case 'unique_songs_completed':
      current = Object.values(progress.songs).filter(s => s.progress >= 100).length;
      break;

    case 'friends_added':
    case 'total_friends':
    case 'same_level_friends':
    case 'country_friends':
    case 'timezone_friends':
      current = 0;
      break;

    case 'streak_days':
      current = progress.streak || 0;
      break;

    case 'practice_minutes': {
      const weeklyGoals = progress.weeklyGoals?.[weekStart];
      if (weeklyGoals) {
        current =
          (weeklyGoals.songCompletedMinutes || 0) +
          (weeklyGoals.techniqueCompletedMinutes || 0) +
          (weeklyGoals.theoryCompletedMinutes || 0);
      }
      break;
    }

    case 'techniques_completed':
      current = Array.isArray(progress.completedLessons)
        ? progress.completedLessons.length
        : Object.values(progress.techniques || {}).filter(t => t.completed).length;
      break;

    case 'theory_completed':
      current = Array.isArray(progress.completedTheoryLessons)
        ? progress.completedTheoryLessons.length
        : Object.values(progress.theory || {}).filter(t => t.completed).length;
      break;

    case 'genres_played':
      current = new Set(Object.values(progress.songs).map(s => s.genre)).size;
      break;

    case 'duels_won':
    case 'total_duels':
    case 'win_streak':
    case 'consecutive_wins':
    case 'defensive_wins':
    case 'duels_initiated':
      current = 0;
      break;

    case 'points_earned':
      current = typeof ctx?.weeklyPoints === 'number' ? ctx.weeklyPoints : 0;
      break;

    case 'rank_improved':
    case 'leaderboard_rank':
    case 'weekly_rank':
    case 'rank_maintained':
      current = 0;
      break;

    case 'hard_songs_completed':
      current = Object.values(progress.songs).filter(s => s.progress >= 100).length;
      break;

    case 'chords_learned':
    case 'unique_chords_used':
      current = Object.values(progress.techniques).filter(
        t => t.category.toLowerCase().includes('chord') && t.completed
      ).length;
      break;

    case 'longest_session_minutes':
      current = 0;
      break;

    case 'perfect_songs':
    case 'high_accuracy_songs':
      current = Object.values(progress.songs).filter(s => s.progress >= 100).length;
      break;

    case 'messages_sent':
    case 'social_interactions':
    case 'helped_beginners':
    case 'requests_accepted':
      current = 0;
      break;

    case 'challenges_completed':
    case 'all_weekly_challenges':
    case 'same_day_challenges':
      current = 0;
      break;

    case 'morning_sessions':
    case 'evening_sessions':
    case 'quick_start_songs':
    case 'app_opens':
    case 'daily_arena':
      current = 0;
      break;

    case 'daily_goals_completed': {
      const routine = progress.dailyRoutines?.[new Date().toISOString().split('T')[0]];
      if (routine?.completed) current = 1;
      break;
    }

    case 'weekend_practice_minutes':
      current = 0;
      break;

    case 'daily_song_streak':
    case 'exact_daily_songs':
      current = progress.streak || 0;
      break;

    case 'technique_categories':
    case 'all_technique_categories':
      current = new Set(
        Object.values(progress.techniques)
          .filter(t => t.completed)
          .map(t => t.category)
      ).size;
      break;

    case 'achievements_unlocked':
      current = Object.values(progress.achievements).filter(Boolean).length;
      break;

    case 'songs_improved':
      current = 0;
      break;

    case 'total_activities':
      current =
        Object.values(progress.songs).length +
        Object.values(progress.techniques).length +
        Object.values(progress.theory).length;
      break;

    case 'level_up':
      current = progress.currentLevel > 1 ? 1 : 0;
      break;

    default:
      current = 0;
  }

  return {
    current: Math.min(current, target),
    target,
    isComplete: current >= target,
  };
}

/** Card frame: full border + thicker bottom in the same difficulty hue. */
export function getDifficultyRankBorderClass(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return 'border-green-500 dark:border-green-400 border-b-green-800 dark:border-b-green-600';
    case 'intermediate':
      return 'border-amber-500 dark:border-amber-400 border-b-amber-800 dark:border-b-amber-600';
    case 'advanced':
      return 'border-rose-500 dark:border-rose-400 border-b-rose-800 dark:border-b-rose-600';
    default:
      return 'border-gray-400 dark:border-gray-500 border-b-gray-700 dark:border-b-gray-500';
  }
}

/** For tie-breaking "closest to done" (higher = harder). */
export function weeklyChallengeDifficultyRank(difficulty: string): number {
  switch (difficulty) {
    case 'advanced':
      return 3;
    case 'intermediate':
      return 2;
    case 'beginner':
      return 1;
    default:
      return 0;
  }
}

/** Pick the challenge closest to completion; ties → harder difficulty wins. */
export function pickClosestWeeklyChallenge(
  challenges: WeeklyChallenge[],
  userId: string,
  ctx?: ChallengeProgressContext
): { challenge: WeeklyChallenge; progress: ReturnType<typeof getWeeklyChallengeProgress> } | null {
  if (!challenges.length || !userId) return null;
  const scored = challenges.map((challenge) => {
    const progress = getWeeklyChallengeProgress(challenge, userId, ctx);
    const target = Math.max(1, progress.target);
    const ratio = Math.min(1, progress.current / target);
    return {
      challenge,
      progress,
      ratio,
      rank: weeklyChallengeDifficultyRank(challenge.difficulty),
    };
  });
  scored.sort((a, b) => {
    if (Math.abs(b.ratio - a.ratio) > 1e-9) return b.ratio - a.ratio;
    return b.rank - a.rank;
  });
  return scored[0] ?? null;
}
