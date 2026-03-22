/**
 * Beats popup instructions: section-specific, achievement-based, and day-varied.
 * Supports multiple categories: Daily, Challenges, Achievements, Friends. User can skip a category.
 */

import achievementsData from '../data/achievements.json';
import { getDailyPracticeGoal, getAchievementPathText, type Achievement } from './progressStorage';

export type BeatsSection = 'songs' | 'technique' | 'theory' | 'progress' | 'community' | 'compete';

/** Beats "section" shown in the badge (Daily, Challenges, Achievements, Friends) */
export type BeatsCategory = 'daily' | 'challenges' | 'achievements' | 'friends';

const BEATS_SKIPPED_KEY = 'strummy-beats-skipped';
const CATEGORY_ORDER: BeatsCategory[] = ['daily', 'challenges', 'achievements', 'friends'];

function getSkippedKey(today: string): string {
  return `${BEATS_SKIPPED_KEY}-${today}`;
}

/** Get list of categories the user has skipped today */
export function getSkippedBeatsCategories(today: string): BeatsCategory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getSkippedKey(today));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return parsed.filter((c): c is BeatsCategory => CATEGORY_ORDER.includes(c as BeatsCategory));
  } catch {
    return [];
  }
}

/** Mark a Beats category as skipped for today */
export function skipBeatsCategory(category: BeatsCategory, today: string): void {
  if (typeof window === 'undefined') return;
  const skipped = getSkippedBeatsCategories(today);
  if (skipped.includes(category)) return;
  skipped.push(category);
  try {
    localStorage.setItem(getSkippedKey(today), JSON.stringify(skipped));
  } catch (_) {}
}

/** Get the current Beats category to show (first non-skipped in order) */
export function getCurrentBeatsCategory(today: string): BeatsCategory {
  const skipped = getSkippedBeatsCategories(today);
  const current = CATEGORY_ORDER.find(c => !skipped.includes(c));
  return current ?? 'daily';
}

/** Human-readable label for the category badge */
export function getBeatsCategoryLabel(category: BeatsCategory): string {
  switch (category) {
    case 'daily': return 'Daily';
    case 'challenges': return 'Challenges';
    case 'achievements': return 'Achievements';
    case 'friends': return 'Friends';
    default: return 'Daily';
  }
}

export interface BeatsCategoryInstructionResult {
  /** Short line shown by default (saves space) */
  instruction: string;
  /** Full paragraph when user expands */
  instructionFull: string;
  section: BeatsSection;
}

/** Monday-based week start key, aligned with progressStorage */
function getWeekStartIso(fromDateStr: string): string {
  const d = new Date(fromDateStr + 'T12:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getNextAchievementFocus(
  progressData: ProgressData | null
): { title: string; description: string; pathText: string } | null {
  if (!progressData) return null;
  const setId = progressData.currentAchievementSet ?? 1;
  const set = achievementsData.achievementSets.find(s => s.setId === setId);
  if (!set) return null;
  const earned = progressData.achievements ?? {};
  for (const ach of set.achievements) {
    if (!earned[ach.id]) {
      return {
        title: ach.title,
        description: ach.description,
        pathText: getAchievementPathText(ach.requirement as Achievement['requirement']),
      };
    }
  }
  return null;
}

function getWeeklyChallengeInstruction(
  progressData: ProgressData | null,
  today: string
): Pick<BeatsCategoryInstructionResult, 'instruction' | 'instructionFull'> {
  const weekStart = getWeekStartIso(today);
  const wg = progressData?.weeklyGoals?.[weekStart];
  if (!wg) {
    return {
      instruction: 'Open Compete for this week’s targets',
      instructionFull:
        'Head to Compete to see your weekly song, technique, and theory minute goals. Finishing them earns bonus points and keeps your compete rank moving.',
    };
  }
  type Row = { label: string; goal: number; done: number };
  const rows: Row[] = [
    { label: 'song practice', goal: wg.songGoalMinutes ?? 0, done: wg.songCompletedMinutes ?? 0 },
    { label: 'technique', goal: wg.techniqueGoalMinutes ?? 0, done: wg.techniqueCompletedMinutes ?? 0 },
    { label: 'theory', goal: wg.theoryGoalMinutes ?? 0, done: wg.theoryCompletedMinutes ?? 0 },
  ];
  const incomplete = rows.filter(r => r.goal > 0 && r.done < r.goal);
  if (incomplete.length === 0) {
    return {
      instruction: 'Finish a bonus weekly track in Compete',
      instructionFull:
        'Main weekly bars are full — open Compete and chip away at chords, scales, rhythm, or basics minutes to grab extra rewards before the week resets.',
    };
  }
  const pick = incomplete[getDaySeed(today) % incomplete.length];
  const remaining = Math.max(0, pick.goal - pick.done);
  return {
    instruction: `${remaining} min left on weekly ${pick.label}`,
    instructionFull: `This week’s ${pick.label} target is ${pick.goal} minutes and you’re at ${pick.done}. Open Compete, keep practicing in that area, and close the gap to score your weekly challenge bonus.`,
  };
}

const FRIEND_FOCUS_BY_DAY: Pick<BeatsCategoryInstructionResult, 'instruction' | 'instructionFull'>[] = [
  {
    instruction: 'Say hi in Community Activity',
    instructionFull:
      'Open Community and join the activity feed — welcome someone, celebrate a streak, or ask a quick question. Small interactions make the app feel less solo.',
  },
  {
    instruction: 'Send one friend request',
    instructionFull:
      'From Community, find another learner and send a friend request. Friends can cheer you on and you’ll see more of each other’s milestones.',
  },
  {
    instruction: 'Reply to a Community post',
    instructionFull:
      'Pick a post in Community and leave a supportive reply. You stay in the habit of connecting without a big time commitment.',
  },
  {
    instruction: 'Check invites & connections',
    instructionFull:
      'Open Community and review friend invites or suggested people. Accepting or reaching out is a concrete step in the Friends track.',
  },
];

/** For dashboard: short + full instruction and target section for a given category */
export function getBeatsCategoryInstruction(
  category: BeatsCategory,
  context: {
    user: UserLike | null;
    progressData: ProgressData | null;
    today: string;
    goalsCount: number;
    practiceDone: boolean;
    techniqueDone: boolean;
    theoryDone: boolean;
    dailyGoal: number;
  }
): BeatsCategoryInstructionResult {
  const { user, today, progressData, practiceDone, techniqueDone, theoryDone, dailyGoal } = context;
  const daySeed = getDaySeed(today);

  switch (category) {
    case 'daily': {
      if (user?.level === 'novice') {
        return {
          instruction: 'Add or practice a song',
          instructionFull:
            'Pick something from the song library or keep working on a track you started. Song minutes count toward your goals and help you level up faster.',
          section: 'songs',
        };
      }
      if (!techniqueDone) {
        return {
          instruction: 'Complete one technique lesson',
          instructionFull:
            'Finish one technique lesson today (or spend 5 minutes in Technique) so your daily checklist moves forward and your streak stays protected.',
          section: 'technique',
        };
      }
      if (!theoryDone) {
        return {
          instruction: 'Complete one theory lesson',
          instructionFull:
            'Complete one theory lesson (or 5 focused minutes in Theory) for today’s goal. It balances your playing with fretboard smarts.',
          section: 'theory',
        };
      }
      if (!practiceDone) {
        return {
          instruction: `Get ${dailyGoal} min practice today`,
          instructionFull: `Aim for ${dailyGoal} minutes of practice across songs today. Use the timer or song sessions — once you hit it, your daily practice goal is in the bag.`,
          section: 'songs',
        };
      }
      const doneOpts: BeatsCategoryInstructionResult[] = [
        {
          instruction: 'Keep practicing or explore songs',
          instructionFull:
            'Daily goals are checked off. You can polish a song, browse new music, or take a breather — whatever keeps you excited to come back tomorrow.',
          section: 'songs',
        },
        {
          instruction: 'Review Progress & achievements',
          instructionFull:
            'Open Progress to see streak, points, and badges. Pick one achievement you’re close on and make a tiny plan to finish it this week.',
          section: 'progress',
        },
        {
          instruction: 'Drop into Community',
          instructionFull:
            'Head to Community to see what others are working on. A quick hello or reaction still counts as engaging with the social side of practice.',
          section: 'community',
        },
      ];
      return doneOpts[daySeed % doneOpts.length];
    }
    case 'challenges': {
      const w = getWeeklyChallengeInstruction(progressData, today);
      return { ...w, section: 'compete' };
    }
    case 'achievements': {
      const next = getNextAchievementFocus(progressData);
      if (next) {
        return {
          instruction: `Complete “${next.title}”`,
          instructionFull: `Your next badge is “${next.title}”: ${next.description} How: ${next.pathText}. Open Progress to watch it unlock when you meet the requirement.`,
          section: 'progress',
        };
      }
      return {
        instruction: 'Open Progress for your next badge set',
        instructionFull:
          'You’ve finished every achievement in your current set. Open Progress to advance to the next set of badges and keep earning points.',
        section: 'progress',
      };
    }
    case 'friends': {
      const f = FRIEND_FOCUS_BY_DAY[daySeed % FRIEND_FOCUS_BY_DAY.length];
      return { ...f, section: 'community' };
    }
    default:
      return {
        instruction: 'Explore at your own pace',
        instructionFull: 'Browse songs, technique, or theory — pick whatever you’re in the mood for today.',
        section: 'songs',
      };
  }
}

interface DailyProgress {
  totalMinutes?: number;
  techniqueMinutes?: number;
  theoryMinutes?: number;
  goalsCompleted?: string[];
}

interface WeeklyGoalsRow {
  weekStart?: string;
  songGoalMinutes?: number;
  songCompletedMinutes?: number;
  techniqueGoalMinutes?: number;
  techniqueCompletedMinutes?: number;
  theoryGoalMinutes?: number;
  theoryCompletedMinutes?: number;
  basicsGoalMinutes?: number;
  basicsCompletedMinutes?: number;
  chordsGoalMinutes?: number;
  chordsCompletedMinutes?: number;
  scalesGoalMinutes?: number;
  scalesCompletedMinutes?: number;
  rhythmGoalMinutes?: number;
  rhythmCompletedMinutes?: number;
}

interface ProgressData {
  dailyProgress?: Record<string, DailyProgress>;
  userId?: string;
  achievements?: Record<string, boolean>;
  currentAchievementSet?: number;
  weeklyGoals?: Record<string, WeeklyGoalsRow>;
}

interface UserLike {
  id: string;
  level: string;
}

/** Day seed for varying copy: 0–6 for weekday, stable per calendar day */
function getDaySeed(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getDay();
}

/** Pick one of the options based on day and progress so it feels different each day */
function pickByDay<T>(options: T[], dateStr: string): T {
  const seed = getDaySeed(dateStr);
  const idx = seed % options.length;
  return options[idx];
}

/** True if the "task" for this section is completed today (e.g. technique goal done on technique page). */
export function isSectionTaskComplete(
  section: BeatsSection,
  progressData: ProgressData | null,
  user: UserLike | null,
  today: string
): boolean {
  const dp = progressData?.dailyProgress?.[today] || {};
  const totalMin = dp.totalMinutes || 0;
  const techMin = dp.techniqueMinutes || 0;
  const theoryMin = dp.theoryMinutes || 0;
  const goalsDone = dp.goalsCompleted || [];
  const dailyGoal = user ? getDailyPracticeGoal(user.id) : 30;
  const practiceDone = totalMin >= dailyGoal;
  const techniqueDone = techMin >= 5 || goalsDone.includes('technique_lesson_today');
  const theoryDone = theoryMin >= 5 || goalsDone.includes('theory_lesson_today');
  switch (section) {
    case 'songs':
      return user?.level === 'novice' ? false : practiceDone;
    case 'technique':
      return techniqueDone;
    case 'theory':
      return theoryDone;
    case 'progress':
    case 'community':
    case 'compete':
      return false;
    default:
      return false;
  }
}

/** First line / clause for popup; full string used when expanded */
function toShortPopupLine(full: string, maxLen = 56): string {
  const t = full.trim();
  if (t.length <= maxLen) return t;
  const m = t.match(/^.{1,400}?\.(?:\s|$)/);
  if (m && m[0].length >= 28 && m[0].length <= maxLen + 12) {
    return m[0].trim();
  }
  const cut = t.lastIndexOf(' ', maxLen - 1);
  return (cut > 26 ? t.slice(0, cut) : t.slice(0, maxLen - 1)).trim();
}

function getBeatsPopupMessageFull(
  section: BeatsSection,
  progressData: ProgressData | null,
  user: UserLike | null,
  today: string
): string {
  const dp = progressData?.dailyProgress?.[today] || {};
  const totalMin = dp.totalMinutes || 0;
  const techMin = dp.techniqueMinutes || 0;
  const theoryMin = dp.theoryMinutes || 0;
  const goalsDone = dp.goalsCompleted || [];
  const dailyGoal = user ? getDailyPracticeGoal(user.id) : 30;
  const practiceDone = totalMin >= dailyGoal;
  const techniqueDone = techMin >= 5 || goalsDone.includes('technique_lesson_today');
  const theoryDone = theoryMin >= 5 || goalsDone.includes('theory_lesson_today');

  switch (section) {
    case 'songs': {
      if (!practiceDone) {
        const options = [
          `Practice here — aim for ${dailyGoal} min today.`,
          `Get some practice. Goal: ${dailyGoal} min.`,
          `Play a song; every minute counts.`,
        ];
        return pickByDay(options, today);
      }
      const options = [
        "Goal done. Explore or polish a song.",
        "Practice done. Try a new song.",
        "Nice work. Keep going or add a song.",
      ];
      return pickByDay(options, today);
    }

    case 'technique': {
      if (!techniqueDone) {
        const options = [
          "Do one technique lesson (or 5 min) for today's goal.",
          "Complete one lesson from your path.",
          "One technique lesson to hit your goal.",
        ];
        return pickByDay(options, today);
      }
      const options = [
        "Technique done. Do more or return to dashboard.",
        "Goal complete. Try theory or another lesson.",
        "Done. Switch to theory or keep going.",
      ];
      return pickByDay(options, today);
    }

    case 'theory': {
      if (!theoryDone) {
        const options = [
          "Do one theory lesson (or 5 min) for today's goal.",
          "Complete one lesson from your theory path.",
          "One theory lesson to hit your goal.",
        ];
        return pickByDay(options, today);
      }
      const options = [
        "Theory done. Do more or return to dashboard.",
        "Goal complete. Try technique or songs.",
        "Done. Explore more or switch section.",
      ];
      return pickByDay(options, today);
    }

    case 'progress': {
      const options = [
        "Check stats, weekly goals, and achievements.",
        "See your streak and weekly challenges.",
        "Review progress and goals.",
      ];
      return pickByDay(options, today);
    }

    case 'community': {
      const options = [
        "Share progress and connect with others.",
        "Connect with learners and share your journey.",
        "Say hi or add a friend.",
      ];
      return pickByDay(options, today);
    }

    case 'compete': {
      const options = [
        "Complete weekly challenges for bonus rewards.",
        "Check Compete for this week's challenges.",
        "Tackle a challenge to earn points.",
      ];
      return pickByDay(options, today);
    }

    default:
      return "Explore at your own pace.";
  }
}

/**
 * Returns the instruction message for the Beats popup on the given section.
 * Varies by: section, today's progress (achievement-based), and day of week (new guide each day).
 */
export function getBeatsPopupMessage(
  section: BeatsSection,
  progressData: ProgressData | null,
  user: UserLike | null,
  today: string
): string {
  return getBeatsPopupMessageFull(section, progressData, user, today);
}

/** Short line + full paragraph for expandable popup copy */
export function getBeatsPopupMessageParts(
  section: BeatsSection,
  progressData: ProgressData | null,
  user: UserLike | null,
  today: string
): { short: string; full: string } {
  const full = getBeatsPopupMessageFull(section, progressData, user, today);
  const short = toShortPopupLine(full, 56);
  return { short, full };
}
