/**
 * Beats copy for dashboard: daily “first step” guidance and legacy helpers for other surfaces.
 */

import achievementsData from '../data/achievements.json';
import type { GuitarLevel } from '../data/learning-journey';
import { getDailyPracticeGoal, getAchievementPathText, type Achievement } from './progressStorage';
import { getNextOpenJourneyRow, type JourneyFlatRow } from './learningJourneyNavigation';

export type BeatsSection = 'songs' | 'technique' | 'theory' | 'progress' | 'community' | 'compete';

/** Short imperative headline for the dashboard card (max five words). */
export function getBeatsActionTitle(section: BeatsSection): string {
  switch (section) {
    case 'technique':
      return 'Complete a technique topic';
    case 'theory':
      return 'Complete a theory lesson';
    case 'songs':
      return 'Practice your song minutes';
    case 'progress':
      return 'Check progress and badges';
    case 'community':
      return 'Connect in Community';
    case 'compete':
      return 'Log weekly challenge time';
    default:
      return 'Keep practicing today';
  }
}

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

/** Split Beats copy into short steps (double-newline separated) for UI lists. */
export function splitBeatsCopyIntoSteps(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const BEATS_STEP_1_SENTINEL = 'Step 1 —';

/**
 * Small sequential steps after the main “do this” line — each block is one UI row.
 */
function dailyRoadmapAppendix(context: {
  techniqueDone: boolean;
  theoryDone: boolean;
  practiceDone: boolean;
  dailyGoal: number;
}): string {
  const { techniqueDone, theoryDone, practiceDone, dailyGoal } = context;
  const t = techniqueDone ? '✓ done' : 'do this next';
  const th = theoryDone ? '✓ done' : 'after step 1';
  const s = practiceDone ? '✓ done' : `~${dailyGoal} min in Songs → Practice`;
  return [
    `${BEATS_STEP_1_SENTINEL} Technique: bottom nav → Technique & Theory → Technique. Five minutes or one quiz/activity (${t}).`,
    `Step 2 — Theory: same place → Theory tab. Same rule (${th}).`,
    `Step 3 — Songs: open Songs → Practice (${s}).`,
    `Step 4 — Compete: weekly minute bars when you want extra goals.`,
    `Step 5 — Community: Activity or friends — quick hello is enough.`,
    `Step 6 — Progress: streak and badges. Dashboard skip (↷) rotates Challenges / Achievements / Friends tips.`,
  ].join('\n\n');
}

function appendRoadmapToDaily(
  specific: { instruction: string; instructionFull: string },
  context: { techniqueDone: boolean; theoryDone: boolean; practiceDone: boolean; dailyGoal: number }
): { instruction: string; instructionFull: string } {
  const appendix = dailyRoadmapAppendix(context);
  if (specific.instructionFull.includes(BEATS_STEP_1_SENTINEL)) {
    return specific;
  }
  return {
    instruction: specific.instruction,
    instructionFull: `${specific.instructionFull}\n\n${appendix}`,
  };
}

/** Append full-day context to Beats popup copy on each main tab. */
function appendRoadmapToPopupMessage(
  section: BeatsSection,
  message: string,
  user: UserLike | null,
  ctx: { techniqueDone: boolean; theoryDone: boolean; practiceDone: boolean; dailyGoal: number }
): string {
  if (!user || message.includes(BEATS_STEP_1_SENTINEL)) return message;
  if (section === 'songs' || section === 'technique' || section === 'theory') {
    return `${message}\n\n${dailyRoadmapAppendix(ctx)}`;
  }
  if (section === 'progress' || section === 'community' || section === 'compete') {
    const extra = [
      'Step A — Finish technique, theory, and song minutes (dashboard Beats shows order).',
      'Step B — Compete: weekly bars stack on top of daily goals.',
      'Step C — Community: one small social action keeps you connected.',
      'Step D — Progress: check streak and next badge.',
    ].join('\n\n');
    return `${message}\n\n${extra}`;
  }
  return message;
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
        'Open Compete (bottom nav) for weekly song, technique, and theory minute targets.\n\nThat stacks on your daily trio — do both.\n\nFinishing bars = bonus points and rank.',
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
        'Main weekly bars are full.\n\nOpen Compete → bonus tracks (chords, scales, rhythm, basics) for extra rewards before reset.\n\nKeep daily technique / theory / songs too.',
    };
  }
  const pick = incomplete[getDaySeed(today) % incomplete.length];
  const remaining = Math.max(0, pick.goal - pick.done);
  return {
    instruction: `${remaining} min left on weekly ${pick.label}`,
    instructionFull: `Weekly ${pick.label}: ${pick.goal} min goal, you’re at ${pick.done}.\n\nOpen Compete and practice in that area to close the gap.\n\nDaily technique / theory / songs still matter — use both.`,
  };
}

const FRIEND_FOCUS_BY_DAY: Pick<BeatsCategoryInstructionResult, 'instruction' | 'instructionFull'>[] = [
  {
    instruction: 'Community: post in Activity',
    instructionFull:
      'Bottom nav → Community → Activity.\n\nOne post: hi, streak cheer, or one short question.\n\nPairs with your daily technique / theory / songs.',
  },
  {
    instruction: 'Community: send one friend request',
    instructionFull:
      'Bottom nav → Community.\n\nSend one friend request to another learner.\n\nPractice first if you can — then connect.',
  },
  {
    instruction: 'Community: reply to one post',
    instructionFull:
      'Bottom nav → Community.\n\nReply once on any post — quick and supportive.\n\nHit technique / theory / songs first when possible.',
  },
  {
    instruction: 'Community: check invites',
    instructionFull:
      'Bottom nav → Community.\n\nCheck invites or suggestions — accept or send one reach-out.\n\nFriends make Compete and Progress more fun.',
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
      const roadmapCtx = { techniqueDone, theoryDone, practiceDone, dailyGoal };
      const withRoadmap = (r: BeatsCategoryInstructionResult): BeatsCategoryInstructionResult => {
        const m = appendRoadmapToDaily(
          { instruction: r.instruction, instructionFull: r.instructionFull },
          roadmapCtx
        );
        return { ...r, instruction: m.instruction, instructionFull: m.instructionFull };
      };
      // Order: Technique → Theory → Songs (same for every level, including novice).
      if (!techniqueDone && user) {
        const lines = nextTechniqueBeatsLines(user, progressData);
        return withRoadmap({ ...lines, section: 'technique' });
      }
      if (!techniqueDone) {
        return withRoadmap({
          instruction: 'Technique: open Technique & Theory',
          instructionFull:
            'Start here: bottom nav → Technique & Theory → Technique.\n\nFinish the next quiz or activity, or stay 5+ minutes for today’s technique goal.\n\nThen theory, then songs — expand for the full map.',
          section: 'technique',
        });
      }
      if (!theoryDone && user) {
        const lines = nextTheoryBeatsLines(user, progressData);
        return withRoadmap({ ...lines, section: 'theory' });
      }
      if (!theoryDone) {
        return withRoadmap({
          instruction: 'Theory: open Technique & Theory',
          instructionFull:
            'Technique goal is in — nice.\n\nNext: same app section → Theory tab. One quiz or reflect step, or 5 focused minutes.\n\nThen Songs for playing time.',
          section: 'theory',
        });
      }
      if (!practiceDone) {
        const lines = nextSongsBeatsLines(progressData, today, dailyGoal, true);
        return withRoadmap({ ...lines, section: 'songs' });
      }
      const songPick = pickSongToPractice(progressData, today);
      const doneOpts: BeatsCategoryInstructionResult[] = [
        songPick
          ? {
              instruction: `Songs: polish “${songPick.line}”`,
              instructionFull: `All three daily goals are done.\n\nOptional: Songs → “${songPick.line}” for extra reps, or browse something new.\n\nWhen you want more: Compete, Community, Progress — expand for the checklist.`,
              section: 'songs',
            }
          : {
              instruction: 'Songs: explore or add a track',
              instructionFull:
                'Daily goals are checked off.\n\nBrowse Songs or add to My Songs — or take a breather.\n\nStill: quick Compete / Community / Progress visit keeps the week rounded (see steps below).',
              section: 'songs',
            },
        {
          instruction: 'Review Progress & achievements',
          instructionFull:
            'Core practice is done today.\n\nOpen Progress → streak, points, Achievements.\n\nPick one almost-there badge and one small step this week.\n\nCompete + Community keep it social.',
          section: 'progress',
        },
        {
          instruction: 'Drop into Community',
          instructionFull:
            'Core practice is done.\n\nNext: Community → Activity — hi, react, or one friend invite.\n\nYou already hit technique, theory, and songs; social time locks the habit.',
          section: 'community',
        },
      ];
      return withRoadmap(doneOpts[daySeed % doneOpts.length]);
    }
    case 'challenges': {
      const w = getWeeklyChallengeInstruction(progressData, today);
      return {
        instruction: w.instruction,
        instructionFull: `${w.instructionFull}\n\nOpen Compete (bottom nav) to log minutes and see every bar.\n\nWeekly goals sit on top of daily technique / theory / songs — use both.`,
        section: 'compete',
      };
    }
    case 'achievements': {
      const next = getNextAchievementFocus(progressData);
      if (next) {
        return {
          instruction: `Progress: earn “${next.title}”`,
          instructionFull: `Bottom nav → Progress → Achievements.\n\nNext: “${next.title}” — ${next.description}\n\nDo this: ${next.pathText}.\n\nBadges pull from technique, theory, songs, Compete, and Community.`,
          section: 'progress',
        };
      }
      return {
        instruction: 'Progress: open your next badge set',
        instructionFull:
          'Bottom nav → Progress.\n\nThis badge set is clear — open the next set.\n\nKeep mixing daily technique, theory, songs, plus Compete and Community.',
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

function completedLessonSetsFromProgress(progressData: ProgressData | null): {
  technique: Set<string>;
  theory: Set<string>;
} {
  const p = progressData as Record<string, unknown> | null;
  return {
    technique: new Set<string>((p?.completedLessons as string[]) ?? []),
    theory: new Set<string>((p?.completedTheoryLessons as string[]) ?? []),
  };
}

function describeJourneyRow(row: JourneyFlatRow): { headline: string; sub: string } {
  if (row.kind === 'quiz') {
    return { headline: row.lesson.title, sub: row.lesson.subtitle || 'Quiz' };
  }
  return { headline: row.checkpointDef.title, sub: row.checkpointDef.subtitle };
}

/** Dashboard “Beats says” block — specific next technique step */
function nextTechniqueBeatsLines(
  user: UserLike,
  progressData: ProgressData | null
): { instruction: string; instructionFull: string } {
  const { technique } = completedLessonSetsFromProgress(progressData);
  const level = (user.level || 'novice') as GuitarLevel;
  const next = getNextOpenJourneyRow(user.id, level, 'technique', technique);
  if (!next) {
    return {
      instruction: 'Technique: 5+ min today or review a unit',
      instructionFull:
        'No further unlocked step is waiting right now — you may be caught up on the next row, or a prerequisite is still open.\n\nBottom nav → Technique & Theory → Technique: spend 5+ minutes for today’s goal, or revisit any unit for extra reps.',
    };
  }
  const { headline, sub } = describeJourneyRow(next.row);
  const stepKind = next.row.kind === 'quiz' ? 'quiz' : 'activity';
  return {
    instruction: `Technique: “${headline}” · ${next.unit.title}`,
    instructionFull: `Go to Technique & Theory → Technique → unit “${next.unit.title}”.\n\nDo the ${stepKind} “${headline}” (${sub}).`,
  };
}

/** Dashboard “Beats says” block — specific next theory step */
function nextTheoryBeatsLines(
  user: UserLike,
  progressData: ProgressData | null
): { instruction: string; instructionFull: string } {
  const { theory } = completedLessonSetsFromProgress(progressData);
  const level = (user.level || 'novice') as GuitarLevel;
  const next = getNextOpenJourneyRow(user.id, level, 'theory', theory);
  if (!next) {
    return {
      instruction: 'Theory: 5+ min today or review a unit',
      instructionFull:
        'No further unlocked theory step is waiting right now — you may be caught up, or finish the previous row first.\n\nBottom nav → Technique & Theory → Theory: spend 5+ minutes for today’s goal, or reopen any unit to review.',
    };
  }
  const { headline, sub } = describeJourneyRow(next.row);
  const stepKind = next.row.kind === 'quiz' ? 'quiz' : 'reflect step';
  return {
    instruction: `Theory: “${headline}” · ${next.unit.title}`,
    instructionFull: `Go to Technique & Theory → Theory → unit “${next.unit.title}”.\n\nDo the ${stepKind} “${headline}” (${sub}).`,
  };
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

function formatSongLine(title: string, artist: string): string {
  const t = (title || '').trim() || 'this song';
  const a = (artist || '').trim();
  return a ? `${t} — ${a}` : t;
}

interface SongProgressLite {
  title: string;
  artist: string;
  progress: number;
  lastPracticed: string;
}

/**
 * Concrete song to mention in Beats: My Songs rotation first, then in-progress library, then any played song.
 */
function pickSongToPractice(
  progressData: ProgressData | null,
  today: string
): { line: string; reason: string } | null {
  const p = progressData as Record<string, unknown> | null;
  if (!p) return null;
  const selected = (p.selectedSongs as { title?: string; artist?: string }[]) || [];
  const seed = getDaySeed(today);

  if (selected.length > 0) {
    const s = selected[seed % selected.length];
    const line = formatSongLine(s.title || 'Song', s.artist || '');
    return { line, reason: 'it’s on your My Songs list' };
  }

  const songs = p.songs as Record<string, SongProgressLite> | undefined;
  if (songs && Object.keys(songs).length > 0) {
    const list = Object.values(songs);
    const inProgress = list.filter((x) => (x.progress || 0) > 0 && (x.progress || 0) < 100);
    if (inProgress.length > 0) {
      inProgress.sort((a, b) => (b.lastPracticed || '').localeCompare(a.lastPracticed || ''));
      const x = inProgress[0];
      return {
        line: formatSongLine(x.title, x.artist),
        reason: 'you’re partway through—good one to push toward 100%',
      };
    }
    const sorted = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    const x = sorted[seed % sorted.length];
    return {
      line: formatSongLine(x.title, x.artist),
      reason: 'from songs you’ve opened before',
    };
  }
  return null;
}

function nextSongsBeatsLines(
  progressData: ProgressData | null,
  today: string,
  dailyGoal: number,
  /** True when technique + theory daily goals are already met (wording skips “after T&T”). */
  journeyGoalsDone = false
): { instruction: string; instructionFull: string } {
  const pick = pickSongToPractice(progressData, today);
  const prefix = journeyGoalsDone
    ? 'Technique and theory goals are done for today — step 3 is song time.'
    : 'Finish technique, then theory, then this (step 3 — songs):';
  if (pick) {
    return {
      instruction: `Songs: practice “${pick.line}”`,
      instructionFull: `${prefix}\n\nBottom nav → Songs → “${pick.line}” → Practice ~${dailyGoal} min for your daily goal.`,
    };
  }
  return {
    instruction: `Songs: add a song → Practice`,
    instructionFull: `${prefix}\n\nBottom nav → Songs → add a song → Practice ~${dailyGoal} min for your daily goal.`,
  };
}

export type DashboardDailyFirstStep = {
  line: string;
  section: BeatsSection;
  openLearnGuitarBasics?: boolean;
};

function hasCompletedLearnBasicsProgram(progressData: ProgressData | null): boolean {
  const p = progressData as Record<string, unknown> | null;
  const songs = p?.songs as Record<string, { learnBasicsProgramCompleted?: boolean }> | undefined;
  if (!songs) return false;
  return Object.values(songs).some(s => Boolean(s?.learnBasicsProgramCompleted));
}

/**
 * Single “do this first” line for the dashboard Beats card (daily only).
 * Callers navigate with `onSectionChange`; do not set strummy-beats-directed (no bottom popup).
 */
export function getDashboardDailyFirstStep(
  user: UserLike | null,
  progressData: ProgressData | null,
  ctx: {
    today: string;
    practiceDone: boolean;
    techniqueDone: boolean;
    theoryDone: boolean;
    dailyGoal: number;
  }
): DashboardDailyFirstStep {
  if (!user) {
    return { line: 'Open Technique & Theory to begin your path.', section: 'technique' };
  }

  const p = progressData as Record<string, unknown> | null;
  const techCount = Array.isArray(p?.completedLessons) ? (p!.completedLessons as string[]).length : 0;
  const theoryCount = Array.isArray(p?.completedTheoryLessons)
    ? (p!.completedTheoryLessons as string[]).length
    : 0;
  const { practiceDone, techniqueDone, theoryDone, dailyGoal, today } = ctx;
  const level = (user.level || 'novice') as GuitarLevel;
  const uid = user.id;

  const brandNewNovice =
    level === 'novice' &&
    techCount === 0 &&
    theoryCount === 0 &&
    !hasCompletedLearnBasicsProgram(progressData);

  if (brandNewNovice) {
    return {
      line: 'Learning Guitar Basics — start here',
      section: 'songs',
      openLearnGuitarBasics: true,
    };
  }

  if (!techniqueDone) {
    const { technique } = completedLessonSetsFromProgress(progressData);
    const next = getNextOpenJourneyRow(uid, level, 'technique', technique);
    if (next) {
      const headline = describeJourneyRow(next.row).headline;
      return {
        line: `Technique: ${headline}`,
        section: 'technique',
      };
    }
    return {
      line: 'Technique: 5+ min or your next lesson',
      section: 'technique',
    };
  }

  if (!theoryDone) {
    const { theory } = completedLessonSetsFromProgress(progressData);
    const next = getNextOpenJourneyRow(uid, level, 'theory', theory);
    if (next) {
      const headline = describeJourneyRow(next.row).headline;
      return {
        line: `Theory: ${headline}`,
        section: 'theory',
      };
    }
    return {
      line: 'Theory: 5+ min or your next lesson',
      section: 'theory',
    };
  }

  if (!practiceDone) {
    const pick = pickSongToPractice(progressData, today);
    if (pick) {
      return {
        line: `Practice: ${pick.line} · ~${dailyGoal} min`,
        section: 'songs',
      };
    }
    return {
      line: `Songs: add one & practice ~${dailyGoal} min`,
      section: 'songs',
    };
  }

  return {
    line: 'All set today — open Compete for weekly goals',
    section: 'compete',
  };
}

/** Technique / theory daily goals: 5+ minutes in that area or one lesson/activity completed today. */
export function getTechniqueAndTheoryDailyDone(
  progressData: ProgressData | null,
  user: UserLike | null,
  today: string
): { techniqueDone: boolean; theoryDone: boolean } {
  const dp = progressData?.dailyProgress?.[today] || {};
  const techMin = dp.techniqueMinutes || 0;
  const theoryMin = dp.theoryMinutes || 0;
  const goalsDone = dp.goalsCompleted || [];
  const techniqueDone = techMin >= 5 || goalsDone.includes('technique_lesson_today');
  const theoryDone = theoryMin >= 5 || goalsDone.includes('theory_lesson_today');
  return { techniqueDone, theoryDone };
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
  const dailyGoal = user ? getDailyPracticeGoal(user.id) : 30;
  const practiceDone = totalMin >= dailyGoal;
  const { techniqueDone, theoryDone } = getTechniqueAndTheoryDailyDone(progressData, user, today);
  switch (section) {
    case 'songs':
      return practiceDone;
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
function toShortPopupLine(full: string, maxLen = 72): string {
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
  const dailyGoal = user ? getDailyPracticeGoal(user.id) : 30;
  const practiceDone = totalMin >= dailyGoal;
  const { techniqueDone, theoryDone } = getTechniqueAndTheoryDailyDone(progressData, user, today);
  const { technique: techDoneSet, theory: theoryDoneSet } = completedLessonSetsFromProgress(progressData);
  const level = (user?.level || 'novice') as GuitarLevel;
  const uid = user?.id ?? '';
  const roadmapCtx = { techniqueDone, theoryDone, practiceDone, dailyGoal };

  let message: string;
  switch (section) {
    case 'songs': {
      if (!practiceDone) {
        if (techniqueDone && theoryDone) {
          message = nextSongsBeatsLines(progressData, today, dailyGoal, true).instructionFull;
          break;
        }
        const pick = pickSongToPractice(progressData, today);
        if (pick) {
          message = `You’re on Songs (step 3). If needed, finish technique then theory first so all three stay even.\n\nOpen “${pick.line}” (${pick.reason}): bottom nav → Songs → that track → Practice ~${dailyGoal} min today.`;
          break;
        }
        message = `You’re on Songs (step 3). Do technique and theory first if you haven’t.\n\nThen add a song to My Songs → Practice ~${dailyGoal} min. Beats will suggest tracks once you save some.`;
        break;
      }
      const pickDone = pickSongToPractice(progressData, today);
      if (pickDone) {
        message = `Song minutes goal met — daily trio done.\n\nOptional: jam “${pickDone.line}” again, try a new song, or open Compete / Community / Progress.`;
        break;
      }
      message = pickByDay(
        [
          'Daily song minutes are done — core goals met. Add a new song, polish one you know, or open Compete for weekly bars.',
          'Practice goal met. Browse Songs for something fresh, then peek at Community or Progress when you want variety.',
          'Nice—daily playing time is covered. Optional: jam another track, then stack a quick Compete or Community visit.',
        ],
        today
      );
      break;
    }

    case 'technique': {
      if (!uid) {
        message = 'Sign in, then open Technique & Theory → Technique to continue your path.';
        break;
      }
      const nextT = getNextOpenJourneyRow(uid, level, 'technique', techDoneSet);
      if (!techniqueDone) {
        if (nextT) {
          const { headline, sub } = describeJourneyRow(nextT.row);
          const kind = nextT.row.kind === 'quiz' ? 'quiz' : 'activity';
          message = `Do this first today: technique before theory and songs.\n\nBottom nav → Technique & Theory → Technique → “${nextT.unit.title}”. ${kind}: “${headline}” (${sub}).\n\nNext after this goal: Theory tab, then Songs.`;
          break;
        }
        message =
          'Technique is step 1 today.\n\nBottom nav → Technique & Theory → Technique → first unlocked unit → next row.\n\nThen Theory, then Songs.';
        break;
      }
      if (!theoryDone) {
        message =
          'Technique goal done.\n\nNext: bottom nav → Technique & Theory → Theory tab (same daily flow).\n\nThen Songs for playing time.';
        break;
      }
      if (!practiceDone) {
        message = nextSongsBeatsLines(progressData, today, dailyGoal, true).instructionFull;
        break;
      }
      if (nextT) {
        const { headline } = describeJourneyRow(nextT.row);
        message = `All daily goals met—great work. Optional: keep exploring “${headline}” in “${nextT.unit.title}”, or jam a song for fun.`;
        break;
      }
      message = pickByDay(
        [
          'All daily goals met. Browse Songs for extra reps or take a breather.',
          'Technique, theory, and song goals are done. Optional: polish a favorite track.',
          'You’re caught up for today. Come back tomorrow or explore any tab you like.',
        ],
        today
      );
      break;
    }

    case 'theory': {
      if (!uid) {
        message = 'Sign in, then open Technique & Theory → Theory to continue.';
        break;
      }
      const nextTh = getNextOpenJourneyRow(uid, level, 'theory', theoryDoneSet);
      if (!theoryDone) {
        if (nextTh) {
          const { headline, sub } = describeJourneyRow(nextTh.row);
          const kind = nextTh.row.kind === 'quiz' ? 'quiz' : 'reflect step';
          message = `Theory is step 2 (after technique).\n\nBottom nav → Technique & Theory → Theory → “${nextTh.unit.title}”. ${kind}: “${headline}” (${sub}).\n\nThen open Songs for your playing minutes.`;
          break;
        }
        message =
          'Theory is step 2.\n\nBottom nav → Technique & Theory → Theory → first unlocked unit → next row.\n\nThen Songs.';
        break;
      }
      if (!techniqueDone) {
        message =
          'Theory is done for today; technique still counts.\n\nGo to Technique & Theory → Technique to balance the pair.\n\nThen Songs if you still need minutes.';
        break;
      }
      if (!practiceDone) {
        message = nextSongsBeatsLines(progressData, today, dailyGoal, true).instructionFull;
        break;
      }
      if (nextTh) {
        const { headline } = describeJourneyRow(nextTh.row);
        message = `Theory goal done for today—great! Optional: continue “${headline}” in “${nextTh.unit.title}”.`;
        break;
      }
      message = 'Theory goal done for today. You’re caught up on this level’s theory path.';
      break;
    }

    case 'progress': {
      const nextAch = getNextAchievementFocus(progressData);
      if (nextAch) {
        message = `Open Progress to see streak and badges.\n\nNext badge: “${nextAch.title}” — ${nextAch.description}\n\nHow: ${nextAch.pathText}.`;
        break;
      }
      message = pickByDay(
        [
          'Open Progress.\n\nCheck streak, points, and weekly summaries.',
          'Progress tab.\n\nReview goals and achievements next to your daily trio.',
          'Head to Progress.\n\nSee how today adds up across everything you touched.',
        ],
        today
      );
      break;
    }

    case 'community': {
      message = pickByDay(
        [
          'Open Community → Activity.\n\nSay hi, react, or post one quick win — pairs with your technique / theory / song routine.',
          'Community: send a friend request or reply once.\n\nStill keep your daily practice goals on the dashboard.',
          'Bottom nav → Community.\n\nCheck invites or welcome someone. Mix people with drills and songs.',
        ],
        today
      );
      break;
    }

    case 'compete': {
      const w = getWeeklyChallengeInstruction(progressData, today);
      message = `${w.instructionFull}\n\nOpen Compete (bottom nav) to log minutes toward weekly bars.\n\nKeep daily dashboard goals too — weekly stacks on top, not instead.`;
      break;
    }

    default:
      message = 'Open the tab Beats pointed you to and take the next small step there.';
  }

  return appendRoadmapToPopupMessage(section, message, user, roadmapCtx);
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

/** One-line summary when we know the exact next journey row */
function beatsPopupShortLine(
  section: BeatsSection,
  progressData: ProgressData | null,
  user: UserLike | null,
  full: string,
  today: string
): string {
  if (!user?.id) return toShortPopupLine(full, 72);
  const level = (user.level || 'novice') as GuitarLevel;
  const { technique, theory } = completedLessonSetsFromProgress(progressData);
  if (section === 'technique') {
    const { techniqueDone: td, theoryDone: thd } = getTechniqueAndTheoryDailyDone(progressData, user, today);
    const dailyGoal = getDailyPracticeGoal(user.id);
    const dp = progressData?.dailyProgress?.[today] || {};
    const totalMin = dp.totalMinutes || 0;
    const practiceDone = totalMin >= dailyGoal;
    if (td && thd && !practiceDone) {
      return nextSongsBeatsLines(progressData, today, dailyGoal, true).instruction;
    }
    if (td && !thd) {
      return nextTheoryBeatsLines(user, progressData).instruction;
    }
    const next = getNextOpenJourneyRow(user.id, level, 'technique', technique);
    if (next) {
      const h = describeJourneyRow(next.row).headline;
      return `Technique: do “${h}” next · ${next.unit.title}`;
    }
  }
  if (section === 'theory') {
    const { techniqueDone: td, theoryDone: thd } = getTechniqueAndTheoryDailyDone(progressData, user, today);
    const dailyGoal = getDailyPracticeGoal(user.id);
    const dp = progressData?.dailyProgress?.[today] || {};
    const totalMin = dp.totalMinutes || 0;
    const practiceDone = totalMin >= dailyGoal;
    if (td && thd && !practiceDone) {
      return nextSongsBeatsLines(progressData, today, dailyGoal, true).instruction;
    }
    if (thd && !td) {
      return nextTechniqueBeatsLines(user, progressData).instruction;
    }
    const next = getNextOpenJourneyRow(user.id, level, 'theory', theory);
    if (next) {
      const h = describeJourneyRow(next.row).headline;
      return `Theory: do “${h}” next · ${next.unit.title}`;
    }
  }
  if (section === 'songs') {
    const dailyGoal = getDailyPracticeGoal(user.id);
    const dp = progressData?.dailyProgress?.[today] || {};
    const totalMin = dp.totalMinutes || 0;
    if (totalMin < dailyGoal) {
      const { techniqueDone: td, theoryDone: thd } = getTechniqueAndTheoryDailyDone(progressData, user, today);
      if (td && thd) {
        return nextSongsBeatsLines(progressData, today, dailyGoal, true).instruction;
      }
      const pick = pickSongToPractice(progressData, today);
      if (pick) {
        const short = `Practice “${pick.line}” (~${dailyGoal} min)`;
        return short.length <= 78 ? short : toShortPopupLine(short, 78);
      }
      return `Songs: add a song, Practice ~${dailyGoal} min`;
    }
  }
  if (section === 'compete') {
    const w = getWeeklyChallengeInstruction(progressData, today);
    const line = `${w.instruction} · Open Compete`;
    return line.length <= 72 ? line : toShortPopupLine(`${w.instruction}. Open Compete.`, 72);
  }
  return toShortPopupLine(full, 72);
}

/** Short line + full paragraph for expandable popup copy */
export function getBeatsPopupMessageParts(
  section: BeatsSection,
  progressData: ProgressData | null,
  user: UserLike | null,
  today: string
): { short: string; full: string } {
  const full = getBeatsPopupMessageFull(section, progressData, user, today);
  const short = beatsPopupShortLine(section, progressData, user, full, today);
  return { short, full };
}
