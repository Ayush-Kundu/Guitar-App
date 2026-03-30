import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { Dialog, DialogContent, DialogContentFullscreen, DialogTitle } from './ui/dialog';
import { 
  CheckCircle2, 
  X,
  BookOpen,
  Trophy,
  XCircle,
  ChevronRight,
  Hand,
  RotateCcw,
  Clock,
  Target
} from 'lucide-react';
import { recordPoints } from '../utils/api';
import { addPoints, addCoins, coinsFromPointsFloor } from '../utils/progressStorage';
import { playCorrect, playWrong, playComplete, playAchievementQuiz } from '../utils/soundEffects';
import {
  getContentByTitle,
  createFallbackContent,
  shuffleQuizItemOptions,
  buildTechniqueTheoryQuizSequence,
  TECHNIQUE_THEORY_QUIZ_TOTAL,
  quizStemKey,
  LessonContent,
  QuizItem,
  MultipleChoiceItem,
  FillBlankItem,
  DragBlankItem,
} from '../data/lesson-content';
import { cn } from './ui/utils';
/** Education mascot: guitar with graduation scroll — technique/theory quiz results (transparent BG). */
import techniqueTheoryRewardMascot from '../assets/technique-theory-reward-mascot.png';

const QUIZ_MASCOT_SRC = techniqueTheoryRewardMascot;

function itemCorrectIndex(item: QuizItem): number {
  if (item.type === 'multiple_choice') return (item as MultipleChoiceItem).correctAnswer;
  return (item as FillBlankItem | DragBlankItem).correctAnswer;
}

function cloneQuizItemLocal(item: QuizItem): QuizItem {
  return JSON.parse(JSON.stringify(item)) as QuizItem;
}

function dedupeMistakenQuizItems(list: QuizItem[]): QuizItem[] {
  const seen = new Set<string>();
  const out: QuizItem[] = [];
  for (const it of list) {
    const k = quizStemKey(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

/** Short “why” line after Correct / Incorrect (max words). */
function explanationSnippet(explanation: string | undefined, maxWords = 14): string {
  const t = explanation?.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return t.split(/\s+/).slice(0, maxWords).join(' ');
}
interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when the user finishes the quiz and confirms (e.g. Done). Receives minutes spent in quiz for technique/theory tally. */
  onComplete?: (opts?: { minutesSpent?: number }) => void;
  /** If set, after 100% Done we call this and close so parent can open chord practice (e.g. SongPractice) */
  practiceChords?: string[];
  onStartPractice?: (lessonName: string, chords: string[]) => void;
  /** When true, passing the quiz only completes the lesson — no immediate jump to chord practice (Technique/Theory alternates sessions). */
  skipPostQuizPractice?: boolean;
  activityType: 'practice' | 'study' | 'quiz' | 'metronome' | 'tuner' | 'history';
  activityData?: any;
}

type Phase = 'intro' | 'quiz' | 'results';

export function ActivityModal({
  isOpen,
  onClose,
  onComplete,
  activityType,
  activityData,
  practiceChords,
  onStartPractice,
  skipPostQuizPractice,
}: ActivityModalProps) {
  const { user, updateUser, syncProfileToSupabase } = useUser();
  
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showWrongAnimation, setShowWrongAnimation] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const quizStartTimeRef = useRef<number>(0);
  const peakMultiplierRef = useRef(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [rewardMultiplier, setRewardMultiplier] = useState(1);
  const [quizBuildKey, setQuizBuildKey] = useState(0);
  const [progressGreenOverlay, setProgressGreenOverlay] = useState(false);
  const [progressNudge, setProgressNudge] = useState(false);
  const [liftedOptionIdx, setLiftedOptionIdx] = useState<number | null>(null);
  const [sessionItems, setSessionItems] = useState<QuizItem[]>([]);
  const sessionItemsRef = useRef<QuizItem[]>([]);
  const mainQuizLengthRef = useRef(0);
  const mistakesInMainRef = useRef(0);
  const mistakenItemsRef = useRef<QuizItem[]>([]);
  const retryAppendedRef = useRef(false);
  const totalQuizItemsRef = useRef(0);
  const modalWasOpenRef = useRef(false);

  const getLessonContent = (): LessonContent => {
    const name = activityData?.name || activityData?.data?.name || '';
    const description = activityData?.description || activityData?.data?.description || '';
    let content: LessonContent | null = getContentByTitle(name);
    if (content?.items?.length) {
      return content;
    }
    if (content?.quiz?.length) {
      return {
        ...content,
        items: content.quiz.map(q => ({
          type: 'multiple_choice' as const,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: undefined
        }))
      };
    }
    return createFallbackContent(name, description || 'This topic covers essential guitar concepts.');
  };

  const isTechniqueTheory = activityType === 'practice' || activityType === 'study';

  const lessonNameForQuiz = activityData?.name || activityData?.data?.name || '';
  const lessonDescriptionForQuiz =
    activityData?.description || activityData?.data?.description || '';

  const quizMascotSrc = QUIZ_MASCOT_SRC;

  const items = useMemo(() => {
    if (!isOpen && !activityData) return [];
    const content = getLessonContent();
    const raw = content.items || [];
    if (isTechniqueTheory && raw.length > 0) {
      return buildTechniqueTheoryQuizSequence(raw, lessonNameForQuiz, lessonDescriptionForQuiz);
    }
    return raw.map(shuffleQuizItemOptions);
  }, [
    isOpen,
    activityData?.name,
    activityData?.description,
    activityType,
    isTechniqueTheory,
    quizBuildKey,
    lessonNameForQuiz,
    lessonDescriptionForQuiz,
  ]);
  const hasItems = items.length > 0;
  const quizItems: QuizItem[] =
    isTechniqueTheory && sessionItems.length > 0 ? sessionItems : items;
  const currentItem = quizItems[currentItemIndex] as QuizItem | undefined;

  useEffect(() => {
    sessionItemsRef.current = sessionItems;
    totalQuizItemsRef.current = sessionItems.length > 0 ? sessionItems.length : items.length;
  }, [sessionItems, items.length]);

  useEffect(() => {
    if (!isOpen) {
      modalWasOpenRef.current = false;
      return;
    }
    const justOpened = !modalWasOpenRef.current;
    modalWasOpenRef.current = true;

    setCurrentItemIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setShowCorrectAnimation(false);
    setShowWrongAnimation(false);
    setConsecutiveCorrect(0);
    setRewardMultiplier(1);
    peakMultiplierRef.current = 1;
    setProgressGreenOverlay(false);
    setProgressNudge(false);
    setLiftedOptionIdx(null);
    mistakesInMainRef.current = 0;
    mistakenItemsRef.current = [];
    retryAppendedRef.current = false;

    if (isTechniqueTheory && items.length > 0) {
      const cloned = items.map(cloneQuizItemLocal);
      setSessionItems(cloned);
      mainQuizLengthRef.current = cloned.length;
      setPhase('quiz');
      quizStartTimeRef.current = Date.now();
    } else {
      setSessionItems([]);
      if (justOpened) {
        setPhase('intro');
      }
    }
  }, [isOpen, isTechniqueTheory, items, quizBuildKey]);

  const isTechnique = activityType === 'practice';
  const themeColor = isTechnique ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)';
  const themeBorder = isTechnique ? 'rgb(234, 88, 12)' : 'rgb(37, 99, 235)';
  const themeBg = isTechnique ? 'rgb(255, 237, 213)' : 'rgb(219, 234, 254)';
  const themeBorderLight = isTechnique ? 'rgb(253, 186, 116)' : 'rgb(147, 197, 253)';
  const themeLight = isTechnique ? 'rgba(249, 115, 22, 0.08)' : 'rgba(59, 130, 246, 0.08)';
  const themeLighter = isTechnique ? 'rgba(249, 115, 22, 0.06)' : 'rgba(59, 130, 246, 0.06)';
  const gradientClass = isTechnique ? 'from-orange-100 via-red-50 to-pink-100' : 'from-blue-100 via-indigo-50 to-purple-50';
  const font = '"Nunito", "Segoe UI", system-ui, sans-serif';
  const cardStyle = { backgroundColor: 'rgba(255, 255, 255, 0.58)', border: '2.5px solid rgb(237, 237, 237)' as const };

  const handleComplete = async (markLessonDone?: boolean) => {
    if (!user) return;
    if (markLessonDone && hasItems) playAchievementQuiz();
    const minutesSpent = quizStartTimeRef.current
      ? Math.max(1, Math.ceil((Date.now() - quizStartTimeRef.current) / 60000))
      : undefined;
    if (markLessonDone) onComplete?.({ minutesSpent });
    try {
      const isTechniqueTheoryFlow = isTechniqueTheory && markLessonDone;
      let pointsEarned = isTechniqueTheoryFlow ? 0 : (hasItems ? correctAnswers * 10 : 5);

      if (isTechniqueTheoryFlow && hasItems && items.length > 0) {
        const totalQ = Math.max(1, totalQuizItemsRef.current || items.length);
        const pct = Math.round((correctAnswers / totalQ) * 100);
        const peakTier = Math.max(1, peakMultiplierRef.current);
        /** Points only if accuracy > 70%; amount = highest streak tier reached (×5 → 5 pts). */
        pointsEarned = pct > 70 ? peakTier : 0;
        const coinGrant = coinsFromPointsFloor(pointsEarned);
        if (pointsEarned > 0) {
          addPoints(user.id, pointsEarned);
          if (coinGrant > 0) addCoins(user.id, coinGrant);
          await recordPoints({
            userId: user.id,
            type: isTechnique ? 'practice' : 'theory_completed',
            points: pointsEarned,
            description: `Quiz: ${activityData?.name || 'lesson'} (${pct}% · tier ×${peakTier})`,
            difficulty: activityData?.data?.difficulty || 1,
          });
          updateUser({
            weeklyPoints: (user.weeklyPoints || 0) + pointsEarned,
          });
          syncProfileToSupabase();
        }
      } else if (pointsEarned > 0) {
        await recordPoints({
          userId: user.id,
          type: isTechnique ? 'practice' : 'theory_completed',
          points: pointsEarned,
          description: `Completed ${activityData?.name || 'lesson'}`,
          difficulty: activityData?.data?.difficulty || 1
        });
        updateUser({
          totalPoints: (user.totalPoints || 0) + pointsEarned,
          weeklyPoints: (user.weeklyPoints || 0) + pointsEarned
        });
        syncProfileToSupabase();
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
    onClose();
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult || !currentItem) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setLiftedOptionIdx(null);
    const correctIdx = itemCorrectIndex(currentItem);
    const isCorrect = answerIndex === correctIdx;
    if (isCorrect) {
      playCorrect();
      setCorrectAnswers(prev => prev + 1);
      setShowCorrectAnimation(true);
      setTimeout(() => setShowCorrectAnimation(false), 800);
      setProgressGreenOverlay(true);
      setProgressNudge(true);
      window.setTimeout(() => {
        setProgressGreenOverlay(false);
        setProgressNudge(false);
      }, 1200);
      if (isTechniqueTheory) {
        setConsecutiveCorrect(prev => {
          const next = prev + 1;
          if (next > 0 && next % 4 === 0) {
            setRewardMultiplier(m => {
              const nm = m + 1;
              peakMultiplierRef.current = Math.max(peakMultiplierRef.current, nm);
              return nm;
            });
          }
          return next;
        });
      }
    } else {
      playWrong();
      setShowWrongAnimation(true);
      setTimeout(() => setShowWrongAnimation(false), 600);
      if (isTechniqueTheory) {
        setConsecutiveCorrect(0);
        setRewardMultiplier(1);
      }
    }
  };

  const handleNextItem = () => {
    setLiftedOptionIdx(null);
    const list = isTechniqueTheory ? sessionItemsRef.current : items;
    const idx = currentItemIndex;
    if (idx < list.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      return;
    }
    if (
      isTechniqueTheory &&
      !retryAppendedRef.current &&
      idx === mainQuizLengthRef.current - 1 &&
      mistakesInMainRef.current > 3
    ) {
      const unique = dedupeMistakenQuizItems(mistakenItemsRef.current);
      if (unique.length > 0) {
        retryAppendedRef.current = true;
        const extras = unique.map(r => shuffleQuizItemOptions(cloneQuizItemLocal(r)));
        setSessionItems(prev => {
          const next = [...prev, ...extras];
          sessionItemsRef.current = next;
          totalQuizItemsRef.current = next.length;
          return next;
        });
        setCurrentItemIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        return;
      }
    }
    setPhase('results');
  };

  const startQuiz = () => {
    quizStartTimeRef.current = Date.now();
    setPhase('quiz');
    setCurrentItemIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setConsecutiveCorrect(0);
    setRewardMultiplier(1);
    peakMultiplierRef.current = 1;
  };

  const handleRetry = () => {
    if (!isTechniqueTheory) {
      setPhase('quiz');
      quizStartTimeRef.current = Date.now();
    }
    setQuizBuildKey(k => k + 1);
  };

  const getActivityIcon = () => isTechnique 
    ? <Hand className="w-4 h-4" style={{ color: 'inherit' }} /> 
    : <BookOpen className="w-4 h-4" style={{ color: 'inherit' }} />;

  const getActivityTitle = () => {
    return activityData?.name || activityData?.data?.name || 
           (isTechnique ? 'Technique Lesson' : 'Theory Lesson');
  };

  const getDescription = () => {
    return activityData?.description || activityData?.data?.description || '';
  };

  const MAX_BULLET_CHARS = 130;

  /** Split long clauses without losing wording (semicolons, em/en dashes). */
  const splitDensePhrase = (text: string): string[] => {
    const t = text.trim();
    if (!t) return [];
    if (t.length <= MAX_BULLET_CHARS) return [t];
    const bySemi = t.split(/\s*;\s+/).map((x) => x.trim()).filter(Boolean);
    if (bySemi.length > 1) return bySemi.flatMap(splitDensePhrase);
    const byDash = t.split(/\s+[—–]\s+/).map((x) => x.trim()).filter(Boolean);
    if (byDash.length > 1) return byDash.flatMap(splitDensePhrase);
    return [t];
  };

  /** Split a paragraph into bullet points. Preserves all content; favors many short bullets over one long block. */
  const paragraphToBullets = (paragraph: string): string[] => {
    if (!paragraph || !paragraph.trim()) return [];
    const trimmed = paragraph.trim();
    const lines = trimmed.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const bullets: string[] = [];
    for (const line of lines) {
      const parts = line.split(/(?<=[.!?])\s+(?=[A-Z"`'"(\[]|$)/);
      for (let i = 0; i < parts.length; i++) {
        let s = parts[i].trim();
        if (!s) continue;
        if (/^(e\.g\.?|i\.e\.?|etc\.?|vs\.?|Dr\.?|Mr\.?|Mrs\.?|Ms\.?)$/i.test(s) && i + 1 < parts.length) {
          s = (s + ' ' + parts[i + 1].trim()).trim();
          i++;
        }
        bullets.push(...splitDensePhrase(s));
      }
    }
    return bullets.filter((b) => b.length > 0);
  };

  /** Build the intro as bullet points from the description and (if present) quiz item summaries. All content preserved. */
  const getIntroBullets = (): string[] => {
    if (!items.length) {
      const desc = getDescription();
      const text = desc || `This lesson covers the fundamentals of ${getActivityTitle().toLowerCase()}. Read through the material, then test your knowledge with the quiz.`;
      return paragraphToBullets(text);
    }
    const bullets: string[] = [];
    const desc = getDescription().trim();
    if (desc) {
      bullets.push(...paragraphToBullets(desc));
      bullets.push('Here\'s what you need to know for the quiz:');
    }
    for (const item of items) {
      if (item.type === 'fill_blank' || item.type === 'drag_blank') {
        const fill = item as FillBlankItem | DragBlankItem;
        const answer = fill.options[fill.correctAnswer];
        const sentence = fill.sentence.replace(/_{3,}/g, answer).trim();
        bullets.push(sentence.endsWith('.') ? sentence : sentence + '.');
      } else {
        const mc = item as MultipleChoiceItem;
        const answer = mc.options[mc.correctAnswer];
        const q = mc.question.trim();
        const endsWithQ = q.endsWith('?');
        bullets.push(endsWithQ ? `${q} ${answer}.` : `${q}: ${answer}.`);
      }
    }
    return bullets;
  };

  // ─── INTRO SCREEN (technique/theory: compact trainer; other: bullets + Start) ─────
  const renderIntro = () => {
    const estimatedTime = activityData?.estimatedTime || activityData?.data?.estimatedTime || '';
    if (isTechniqueTheory && hasItems) {
      return (
        <div className="flex-1 flex flex-col justify-center min-h-0 px-4 py-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2" style={{ fontFamily: font }}>
            {getActivityTitle()}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4" style={{ fontFamily: font }}>
            {TECHNIQUE_THEORY_QUIZ_TOTAL} questions — multiple choice, tap-to-fill, and <span className="font-semibold">drag-and-drop</span> into the sentence. Order and mix change each run.
            Every <span className="font-semibold">4 correct in a row</span> raises your streak tier (shown as ×2, ×3…). You always earn <span className="font-semibold">1 point per correct</span> at the end; your <span className="font-semibold">highest tier adds that many extra points</span> (e.g. tier 3 → +3 pts). Resets after a miss.
            Score <span className="font-semibold">70–89%</span> for +1 bonus point; <span className="font-semibold">90–100%</span> for +2.
            If you miss <span className="font-semibold">more than 3</span> questions in the main round, you’ll get <span className="font-semibold">extra tries</span> on those at the end.
            Coins use ⌊points ÷ 3⌋ so they stay rarer than points.
          </p>
          {estimatedTime ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-4">
              <Clock className="w-3 h-3" />
              {estimatedTime}
            </span>
          ) : null}
          <div
            role="button"
            tabIndex={0}
            onClick={() => startQuiz()}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                startQuiz();
              }
            }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-none text-sm font-bold cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
            style={{
              backgroundColor: themeBg,
              borderBottom: `2px solid ${themeBorderLight}`,
              color: themeColor,
              fontFamily: font,
            }}
          >
            Start quiz
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      );
    }
    const introBullets = getIntroBullets();
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-shrink-0 pt-2 pb-3">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-2" style={{ fontFamily: font }}>
            {getActivityTitle()}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {estimatedTime && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Clock className="w-3 h-3" />
                {estimatedTime}
              </span>
            )}
            <span
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ backgroundColor: themeLight, color: themeColor }}
            >
              <Target className="w-3 h-3" />
              {items.length} {items.length === 1 ? 'question' : 'questions'}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 mb-4">
          <div className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm" style={cardStyle}>
            <ul className="list-disc pl-5 space-y-2 text-[13px] text-gray-700 dark:text-gray-300 leading-[1.75]" style={{ fontFamily: font }}>
              {introBullets.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex-shrink-0 pt-2">
          <div
            onClick={() => startQuiz()}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
            style={{
              backgroundColor: themeBg,
              borderBottom: `2px solid ${themeBorderLight}`,
              color: themeColor,
              fontFamily: font,
            }}
          >
            Start Quiz
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  // ─── RESULTS SCREEN ───
  const renderResults = () => {
    const totalAnsweredSlots =
      isTechniqueTheory && sessionItems.length > 0 ? sessionItems.length : items.length;
    const percentage =
      totalAnsweredSlots > 0 ? Math.round((correctAnswers / totalAnsweredSlots) * 100) : 0;
    const isPassing = correctAnswers === totalAnsweredSlots;
    const hasMistakes = correctAnswers < totalAnsweredSlots;
    const peakTier = Math.max(1, peakMultiplierRef.current);
    const earnedPoints =
      isTechniqueTheory && hasItems && items.length > 0
        ? percentage > 70
          ? peakTier
          : 0
        : 0;

    const finishPrimary = () => {
      if (isTechniqueTheory && hasItems) {
        playComplete();
        handleComplete(true);
        return;
      }
      if (isPassing) playComplete();
      if (isPassing && practiceChords?.length && onStartPractice && !skipPostQuizPractice) {
        onStartPractice(getActivityTitle(), practiceChords);
        onClose();
      } else if (isPassing) {
        handleComplete(true);
      } else {
        handleComplete();
      }
    };

    if (isTechniqueTheory && hasItems) {
      return (
        <div className="flex flex-col pt-2 pb-4 w-full max-w-md mx-auto px-2" style={{ fontFamily: font }}>
          <div className="flex justify-center mb-5 px-2">
            <img
              src={quizMascotSrc}
              alt=""
              className="h-52 w-auto sm:h-64 md:h-72 max-w-[min(100%,440px)] object-contain object-center select-none pointer-events-none drop-shadow-sm"
              draggable={false}
            />
          </div>
          <div className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm flex flex-col gap-4" style={cardStyle}>
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: isPassing ? 'rgb(134, 239, 172)' : themeBg,
                  borderBottom: `3px solid ${isPassing ? 'rgb(74, 222, 128)' : themeBorderLight}`,
                }}
              >
                {isPassing ? (
                  <Trophy className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5" style={{ color: themeColor }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                  {isPassing ? 'Lesson complete' : 'Keep practicing'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {correctAnswers} of {totalAnsweredSlots} correct ({percentage}%)
                  {earnedPoints > 0 ? (
                    <span className="text-gray-600 dark:text-gray-300"> · +{earnedPoints} pts (tier ×{peakTier})</span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400"> · No points — need over 70% accuracy</span>
                  )}
                </p>
              </div>
            </div>

            <div className={`flex gap-3 pt-1 ${hasMistakes ? 'items-stretch' : ''}`}>
              {hasMistakes && (
                <button
                  type="button"
                  onClick={() => handleRetry()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    backgroundColor: themeBg,
                    borderBottom: `2px solid ${themeBorderLight}`,
                    color: themeColor,
                    fontFamily: font,
                    minHeight: 52,
                    paddingTop: 14,
                    paddingBottom: 14,
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry quiz
                </button>
              )}
              <button
                type="button"
                onClick={finishPrimary}
                className={`flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] ${hasMistakes ? 'flex-1' : 'w-full'}`}
                style={{
                  backgroundColor: isPassing ? 'rgba(34, 197, 94, 0.15)' : themeBg,
                  borderBottom: isPassing ? '2px solid rgb(74, 222, 128)' : `2px solid ${themeBorderLight}`,
                  color: isPassing ? 'rgb(22, 101, 52)' : themeColor,
                  fontFamily: font,
                  minHeight: 52,
                  paddingTop: 14,
                  paddingBottom: 14,
                }}
              >
                {isPassing ? (
                  <>
                    <Trophy className="w-4 h-4 text-green-600 fill-green-600" />
                    Done
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 shrink-0" style={{ color: themeColor }} />
                    Complete lesson
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col pt-2">
        <div
          className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm flex flex-col gap-4"
          style={cardStyle}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: isPassing ? 'rgb(134, 239, 172)' : themeBg,
                borderBottom: `3px solid ${isPassing ? 'rgb(74, 222, 128)' : themeBorderLight}`,
              }}
            >
              {isPassing ? (
                <Trophy className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5" style={{ color: themeColor }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-sm">
                {isPassing ? 'Lesson complete' : 'Keep practicing'}
              </h3>
              <p className="text-xs text-gray-500">
                {correctAnswers} of {items.length} correct ({percentage}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {hasMistakes && (
              <button
                type="button"
                onClick={() => handleRetry()}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: themeBg,
                  borderBottom: `2px solid ${themeBorderLight}`,
                  color: themeColor,
                  fontFamily: font,
                  minHeight: 52,
                  paddingTop: 14,
                  paddingBottom: 14,
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            )}
            <button
              type="button"
              onClick={finishPrimary}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: isPassing ? 'rgba(34, 197, 94, 0.15)' : themeBg,
                borderBottom: isPassing ? '2px solid rgb(74, 222, 128)' : `2px solid ${themeBorderLight}`,
                color: isPassing ? 'rgb(22, 101, 52)' : themeColor,
                fontFamily: font,
                minHeight: 52,
                paddingTop: 14,
                paddingBottom: 14,
              }}
            >
              {isPassing ? (
                <>
                  <Trophy className="w-4 h-4 text-green-600 fill-green-600" />
                  Done
                </>
              ) : (
                'Finish'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── QUIZ SCREEN ───────────────────────────────────────────────────────
  const renderQuiz = () => {
    if (!hasItems) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed" style={{ fontFamily: font }}>No content for this lesson yet.</p>
          <div 
            onClick={handleComplete}
            className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer text-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: themeBg, borderBottom: `2px solid ${themeBorderLight}`, color: themeColor, fontFamily: font }}
          >
            Complete
          </div>
        </div>
      );
    }

    const isFillBlank = currentItem?.type === 'fill_blank';
    const isDragBlank = currentItem?.type === 'drag_blank';
    const isBlankQuestion = isFillBlank || isDragBlank;
    const options = !currentItem
      ? []
      : currentItem.type === 'multiple_choice'
        ? (currentItem as MultipleChoiceItem).options
        : (currentItem as FillBlankItem | DragBlankItem).options;
    const correctAnswer = currentItem ? itemCorrectIndex(currentItem) : 0;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const blankRegex = /_{3,}/;
    const sentenceParts =
      isBlankQuestion && currentItem
        ? (currentItem as FillBlankItem | DragBlankItem).sentence.split(blankRegex)
        : [];

    const ciProg = currentItem ? itemCorrectIndex(currentItem) : 0;
    const stepDoneProg = Boolean(
      showResult && selectedAnswer !== null && currentItem && selectedAnswer === ciProg,
    );
    const progressPct = Math.min(
      100,
      ((currentItemIndex + (stepDoneProg ? 1 : 0)) / Math.max(1, items.length)) * 100,
    );

    const DRAG_SLOT_W = 86;
    const DRAG_SLOT_H = 32;

    const themeFillGradient = isTechnique
      ? 'linear-gradient(90deg, rgb(234, 88, 12) 0%, rgb(249, 115, 22) 45%, rgb(253, 186, 116) 100%)'
      : 'linear-gradient(90deg, rgb(37, 99, 235) 0%, rgb(59, 130, 246) 45%, rgb(147, 197, 253) 100%)';
    const greenFillGradient =
      'linear-gradient(90deg, rgb(21, 128, 61) 0%, rgb(34, 197, 94) 50%, rgb(134, 239, 172) 100%)';

    const renderBlankSlot = (key: string, interactive: boolean) => {
      const dragBox = interactive;
      const slotStyle = showResult
        ? selectedAnswer === correctAnswer
          ? {
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              color: 'rgb(22, 163, 74)',
              border: dragBox ? '2px solid rgb(134, 239, 172)' : undefined,
              borderBottom: dragBox ? '3px solid rgb(134, 239, 172)' : '2px solid rgb(34, 197, 94)',
            }
          : {
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: 'rgb(220, 38, 38)',
              border: dragBox ? '2px solid rgb(252, 165, 165)' : undefined,
              borderBottom: dragBox ? '3px solid rgb(252, 165, 165)' : '2px solid rgb(239, 68, 68)',
              textDecoration: dragBox ? undefined : ('line-through' as const),
            }
        : dragBox
          ? {
              backgroundColor: themeLight,
              color: themeColor,
              border: `2px solid ${themeBorderLight}`,
              borderBottom: `3px solid ${themeBorderLight}`,
            }
          : {
              backgroundColor: themeLight,
              color: themeColor,
              borderBottom: `2px solid ${themeColor}`,
            };
      const slotLabel = showResult
        ? selectedAnswer === correctAnswer
          ? options[selectedAnswer!]
          : options[correctAnswer]
        : selectedAnswer !== null
          ? options[selectedAnswer]
          : interactive && liftedOptionIdx !== null
            ? '· drop ·'
            : '?';

      return (
        <span
          key={key}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive && !showResult ? 0 : undefined}
          onDragOver={
            interactive && !showResult
              ? (e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }
              : undefined
          }
          onDragEnter={
            interactive && !showResult
              ? (e) => {
                  e.preventDefault();
                }
              : undefined
          }
          onDrop={
            interactive && !showResult
              ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const di = parseInt(e.dataTransfer.getData('text/plain'), 10);
                  if (!Number.isNaN(di)) handleAnswer(di);
                }
              : undefined
          }
          onClick={() => {
            if (!interactive || showResult) return;
            if (liftedOptionIdx !== null) {
              handleAnswer(liftedOptionIdx);
            }
          }}
          onKeyDown={(e) => {
            if (!interactive || showResult) return;
            if ((e.key === 'Enter' || e.key === ' ') && liftedOptionIdx !== null) {
              e.preventDefault();
              handleAnswer(liftedOptionIdx);
            }
          }}
          className={cn(
            dragBox
              ? 'inline-flex items-center justify-center mx-1 box-border rounded-lg text-center text-xs font-bold align-middle border-2'
              : 'inline-block min-w-[56px] mx-0.5 px-1.5 py-[2px] rounded-md text-center font-bold text-[13px]',
            interactive &&
              !showResult &&
              (isTechnique ? 'cursor-pointer hover:ring-2 hover:ring-orange-300/70' : 'cursor-pointer hover:ring-2 hover:ring-blue-300/70'),
          )}
          style={{
            ...slotStyle,
            ...(dragBox
              ? {
                  minWidth: DRAG_SLOT_W,
                  width: DRAG_SLOT_W,
                  height: DRAG_SLOT_H,
                  boxSizing: 'border-box',
                  verticalAlign: 'middle',
                }
              : {}),
          }}
        >
          <span
            className={cn('px-1 truncate', dragBox ? 'max-w-[78px] pointer-events-none' : 'max-w-[100px]')}
          >
            {slotLabel}
          </span>
        </span>
      );
    };

    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden pt-1 pb-4">
        {isTechniqueTheory ? (
          <div className="backdrop-blur-sm rounded-2xl px-4 py-3 mb-4 shadow-md" style={cardStyle}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div
                className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400"
                style={{ fontFamily: font }}
              >
                <span>
                  Question {currentItemIndex + 1} / {quizItems.length}
                </span>
              </div>
              {rewardMultiplier > 1 ? (
                <span
                  className="text-xs font-extrabold tabular-nums px-2.5 py-1 rounded-xl shrink-0 border-2"
                  style={{
                    backgroundColor: themeLight,
                    color: themeColor,
                    fontFamily: font,
                    borderColor: themeBorderLight,
                  }}
                >
                  Tier {rewardMultiplier}
                </span>
              ) : null}
            </div>
            <div
              className="h-5 w-full rounded-full overflow-hidden"
              style={{
                border: '2.5px solid rgb(237, 237, 237)',
                backgroundColor: 'rgb(241, 245, 249)',
              }}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-[480ms] ease-out relative overflow-hidden',
                  progressNudge && 'quiz-progress-fill--nudge',
                )}
                style={{ width: `${progressPct}%` }}
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-full',
                    rewardMultiplier >= 3 &&
                      (isTechnique ? 'quiz-progress-fill--pulse-warm' : 'quiz-progress-fill--pulse-cool'),
                  )}
                  style={rewardMultiplier >= 3 ? undefined : { background: themeFillGradient }}
                />
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: greenFillGradient,
                    opacity: progressGreenOverlay ? 1 : 0,
                    boxShadow: progressGreenOverlay ? '0 0 14px rgba(34, 197, 94, 0.35)' : undefined,
                    transition: 'opacity 1.65s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 1.65s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Technique/theory: no mascot during questions — scroll guitar only on results */}

        {/* Question card */}
        <div 
          className={`backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-4 mb-4 shadow-md transition-all duration-300 ${
            showCorrectAnimation ? 'ring-2 ring-emerald-400/60 ring-offset-1' : 
            showWrongAnimation ? 'ring-2 ring-red-400/60 ring-offset-1' : ''
          }`}
          style={cardStyle}
          onDragOver={
            isDragBlank && !showResult
              ? (e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }
              : undefined
          }
        >
          {!isTechniqueTheory ? (
            <div className="flex justify-end mb-2">
              <span className="text-xs text-gray-500 font-medium">
                {currentItemIndex + 1} / {items.length}
              </span>
            </div>
          ) : null}

          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-[1.65] break-words" style={{ fontFamily: font }}>
            {isBlankQuestion
              ? sentenceParts.map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 &&
                      renderBlankSlot(`b-${i}`, Boolean(isDragBlank && !showResult))}
                  </span>
                ))
              : (currentItem as MultipleChoiceItem).question}
          </p>
        </div>

        {/* Options: list (MC / fill / review) or draggable chips (drag_blank, active) */}
        <div ref={optionsRef} className="flex-1 overflow-y-auto min-h-0" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isDragBlank && !showResult ? (
            <div className="flex flex-wrap justify-center gap-2 pb-1 w-full">
              {options.map((option, idx) => (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', String(idx));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onClick={() => {
                    setLiftedOptionIdx((prev) => (prev === idx ? null : idx));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLiftedOptionIdx((prev) => (prev === idx ? null : idx));
                    }
                  }}
                  className={cn(
                    'rounded-lg text-xs font-semibold transition-all touch-manipulation flex items-center justify-center text-center px-1.5 box-border cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                    isTechnique ? 'focus-visible:ring-orange-400/80' : 'focus-visible:ring-blue-400/80',
                    liftedOptionIdx === idx
                      ? 'scale-105 shadow-md'
                      : 'hover:scale-[1.02] active:scale-[0.98]',
                  )}
                  style={{
                    fontFamily: font,
                    minWidth: DRAG_SLOT_W,
                    width: DRAG_SLOT_W,
                    minHeight: DRAG_SLOT_H,
                    height: DRAG_SLOT_H,
                    backgroundColor: liftedOptionIdx === idx ? themeBg : 'rgba(255,255,255,0.65)',
                    color: themeColor,
                    border: `2px solid ${themeBorderLight}`,
                    borderBottom: `3px solid ${themeBorderLight}`,
                    boxSizing: 'border-box',
                  }}
                >
                  <span className="line-clamp-2 leading-tight px-0.5 pointer-events-none">{option}</span>
                </div>
              ))}
            </div>
          ) : (
            options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrectOpt = idx === correctAnswer;
              const showCorrect = showResult && isCorrectOpt;
              const showWrong = showResult && isSelected && !isCorrectOpt;

              return (
                <div
                  key={idx}
                  onClick={() => !showResult && handleAnswer(idx)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '12px', cursor: showResult ? 'default' : 'pointer',
                    backgroundColor: showCorrect ? 'rgba(34, 197, 94, 0.1)' : 
                                 showWrong ? 'rgba(239, 68, 68, 0.1)' :
                                 isSelected && !showResult ? themeLight :
                                 'rgba(255, 255, 255, 0.58)',
                    border: showCorrect ? '2.5px solid rgb(34, 197, 94)' : 
                            showWrong ? '2.5px solid rgb(239, 68, 68)' : 
                            isSelected && !showResult ? `2.5px solid ${themeBorderLight}` :
                            '2.5px solid rgb(237, 237, 237)',
                    transition: 'all 0.15s ease',
                    transform: (!showResult && isSelected) ? 'scale(1.01)' : 'scale(1)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{
                    flexShrink: 0, width: '28px', height: '28px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 800,
                    backgroundColor: showCorrect ? 'rgb(34, 197, 94)' : 
                                     showWrong ? 'rgb(239, 68, 68)' : 
                                     isSelected && !showResult ? themeBg :
                                     'rgba(156, 163, 175, 0.12)',
                    color: showCorrect || showWrong ? 'white' : (isSelected && !showResult ? themeColor : 'rgb(107, 114, 128)'),
                    borderBottom: (showCorrect || showWrong || (isSelected && !showResult)) 
                      ? `2px solid ${showCorrect ? 'rgb(5, 150, 105)' : showWrong ? 'rgb(185, 28, 28)' : themeBorderLight}` 
                      : '2px solid rgba(156, 163, 175, 0.2)',
                    transition: 'all 0.15s ease'
                  }}>
                    {showCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                     showWrong ? <XCircle className="w-3.5 h-3.5" /> : 
                     labels[idx]}
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 break-words" style={{
                    color: showCorrect ? 'rgb(22, 163, 74)' : showWrong ? 'rgb(220, 38, 38)' : undefined,
                    fontFamily: font,
                    lineHeight: 1.4
                  }}>
                    {option}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom: explanation + continue - TechniqueTheory style */}
        {showResult && (
          <div className="flex-shrink-0 mt-4 flex flex-col gap-3">
            <div 
              className="backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm"
              style={{ 
                backgroundColor: selectedAnswer === correctAnswer ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `2.5px solid ${selectedAnswer === correctAnswer ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
              }}
            >
              <p className="text-sm break-words leading-snug" style={{ fontFamily: font }}>
                <span
                  className="font-extrabold"
                  style={{
                    color: selectedAnswer === correctAnswer ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)',
                  }}
                >
                  {selectedAnswer === correctAnswer ? 'Correct' : 'Incorrect'}
                </span>
                {(() => {
                  const why = explanationSnippet(currentItem?.explanation);
                  return why ? (
                    <span className="text-gray-600 dark:text-gray-300 font-medium"> — {why}</span>
                  ) : null;
                })()}
              </p>
            </div>

            <div 
              onClick={() => handleNextItem()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{ backgroundColor: themeBg, borderBottom: `2px solid ${themeBorderLight}`, color: themeColor, fontFamily: font }}
            >
              {currentItemIndex < items.length - 1 ? 'Continue' : 'See Results'}
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!user) return null;

  const showHeader = phase !== 'intro';

  const modalInner = (
    <>
        <DialogTitle className="sr-only">{getActivityTitle()}</DialogTitle>

        <div
          className={`flex flex-col px-4 sm:px-6 py-4 safe-area-top ${
            isTechniqueTheory || phase !== 'results' ? 'flex-1 min-h-0 overflow-hidden' : ''
          }`}
        >
        
        {/* Header - only during quiz/results (TechniqueTheory card style, X on right) */}
        {showHeader && (
          <div 
            className="flex-shrink-0 backdrop-blur-sm rounded-xl px-3 py-3 mb-3 shadow-sm"
            style={cardStyle}
          >
            <div className="flex items-center gap-3">
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: themeBg, borderBottom: `2px solid ${themeBorderLight}` }}
              >
                <span style={{ color: themeColor }}>{getActivityIcon()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate" style={{ fontFamily: font }}>
                  {getActivityTitle()}
                </h2>
                {phase === 'quiz' && !isTechniqueTheory ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span>
                      {currentItemIndex + 1} of {items.length}
                    </span>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100"
                style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Intro: close button on top-right, same padding as wrapper */}
        {!showHeader && (
          <div className="absolute top-4 right-4 z-10 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100"
              style={{ backgroundColor: 'rgba(255,255,255,0.58)', border: '2.5px solid rgb(237, 237, 237)' }}
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {phase === 'intro' && renderIntro()}
        {phase === 'quiz' && renderQuiz()}
        {phase === 'results' && renderResults()}
        </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isTechniqueTheory ? (
        <DialogContentFullscreen
          className={`p-0 overflow-hidden flex flex-col bg-gradient-to-br ${gradientClass} dark:from-gray-950 dark:via-slate-900 dark:to-gray-900`}
          aria-describedby={undefined}
        >
          {modalInner}
        </DialogContentFullscreen>
      ) : (
        <DialogContent
          className={`p-0 overflow-hidden [&>button:last-of-type]:hidden flex flex-col bg-gradient-to-br ${gradientClass}`}
          style={{
            width: 'calc(100% - 1rem)',
            maxWidth: '640px',
            borderRadius: '16px',
            border: '2.5px solid rgb(237, 237, 237)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            height: phase === 'intro' || phase === 'results' ? 'auto' : '85vh',
            maxHeight: phase === 'intro' ? '88vh' : phase === 'results' ? '90vh' : '680px',
          }}
          aria-describedby={undefined}
        >
          {modalInner}
        </DialogContent>
      )}
    </Dialog>
  );
}
