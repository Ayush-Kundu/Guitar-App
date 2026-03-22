import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { 
  CheckCircle2, 
  X,
  BookOpen,
  Trophy,
  XCircle,
  ChevronRight,
  Hand,
  Star,
  RotateCcw,
  Clock,
  Target
} from 'lucide-react';
import { recordPoints } from '../utils/api';
import { playCorrect, playWrong, playComplete, playAchievementQuiz } from '../utils/soundEffects';
import { 
  getContentByTitle,
  createFallbackContent,
  shuffleQuizItemOptions,
  LessonContent, 
  QuizItem,
  MultipleChoiceItem,
  FillBlankItem
} from '../data/lesson-content';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when user gets 100% and clicks Continue – use to mark lesson complete. Receives minutes spent in quiz for technique/theory tally. */
  onComplete?: (opts?: { minutesSpent?: number }) => void;
  /** If set, after 100% Done we call this and close so parent can open chord practice (e.g. SongPractice) */
  practiceChords?: string[];
  onStartPractice?: (lessonName: string, chords: string[]) => void;
  activityType: 'practice' | 'study' | 'quiz' | 'metronome' | 'tuner' | 'history';
  activityData?: any;
}

type Phase = 'intro' | 'quiz' | 'results';

export function ActivityModal({ isOpen, onClose, onComplete, activityType, activityData, practiceChords, onStartPractice }: ActivityModalProps) {
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

  const items = useMemo(() => {
    if (!isOpen && !activityData) return [];
    const content = getLessonContent();
    return (content.items || []).map(shuffleQuizItemOptions);
  }, [isOpen, activityData?.name, activityData?.description]);
  const hasItems = items.length > 0;
  const currentItem = items[currentItemIndex] as QuizItem | undefined;

  useEffect(() => {
    if (isOpen) {
      setPhase('intro');
      setCurrentItemIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectAnswers(0);
      setShowCorrectAnimation(false);
      setShowWrongAnimation(false);
    }
  }, [isOpen]);

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
      // Technique Theory: points are awarded per unit (1) and per branch (5) in TechniqueTheory.tsx
      const isTechniqueTheoryFlow = (activityType === 'practice' || activityType === 'study') && markLessonDone;
      const pointsEarned = isTechniqueTheoryFlow ? 0 : (hasItems ? correctAnswers * 10 : 5);
      if (pointsEarned > 0) {
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
    const isCorrect = currentItem.type === 'multiple_choice' 
      ? answerIndex === (currentItem as MultipleChoiceItem).correctAnswer
      : answerIndex === (currentItem as FillBlankItem).correctAnswer;
    if (isCorrect) {
      playCorrect();
      setCorrectAnswers(prev => prev + 1);
      setShowCorrectAnimation(true);
      setTimeout(() => setShowCorrectAnimation(false), 800);
    } else {
      playWrong();
      setShowWrongAnimation(true);
      setTimeout(() => setShowWrongAnimation(false), 600);
    }
  };

  const handleNextItem = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setPhase('results');
    }
  };

  const startQuiz = () => {
    quizStartTimeRef.current = Date.now();
    setPhase('quiz');
    setCurrentItemIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
  };

  const handleRetry = () => {
    startQuiz();
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

  /** Split a paragraph into bullet points. Preserves all content. Uses newlines if present; otherwise splits on sentence boundaries (avoids e.g. / i.e.). */
  const paragraphToBullets = (paragraph: string): string[] => {
    if (!paragraph || !paragraph.trim()) return [];
    const trimmed = paragraph.trim();
    if (trimmed.includes('\n')) {
      return trimmed.split(/\n+/).map(l => l.trim()).filter(Boolean);
    }
    const parts = trimmed.split(/(?<=[.!?])\s+(?=[A-Z]|$)/);
    const bullets: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      let s = parts[i].trim();
      if (!s) continue;
      if (/^(e\.g\.?|i\.e\.?|etc\.?|vs\.?|Dr\.?|Mr\.?|Mrs\.?|Ms\.?)$/i.test(s) && i + 1 < parts.length) {
        bullets.push((s + ' ' + parts[i + 1].trim()).trim());
        i++;
      } else {
        bullets.push(s);
      }
    }
    return bullets.filter(b => b.length > 0);
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
      if (item.type === 'fill_blank') {
        const fill = item as FillBlankItem;
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

  // ─── INTRO SCREEN (paragraph explaining everything, then Start Quiz) ─────
  const renderIntro = () => {
    const estimatedTime = activityData?.estimatedTime || activityData?.data?.estimatedTime || '';
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

  // ─── RESULTS SCREEN (matches Technique Theory card/badge/button style) ───
  const renderResults = () => {
    const percentage = Math.round((correctAnswers / items.length) * 100);
    const isPassing = correctAnswers === items.length;
    const stars = percentage >= 100 ? 3 : percentage >= 80 ? 2 : percentage >= 60 ? 1 : 0;
    const hasMistakes = correctAnswers < items.length;

    return (
      <div className="flex flex-col pt-2">
        {/* Single card container - same as Technique Theory lesson list card */}
        <div 
          className="backdrop-blur-sm rounded-xl px-4 py-4 shadow-sm flex flex-col gap-4"
          style={cardStyle}
        >
          {/* Top row: icon badge + title + score (like UnitCard row) */}
          <div className="flex items-center gap-3">
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                backgroundColor: isPassing ? 'rgb(134, 239, 172)' : themeBg,
                borderBottom: `3px solid ${isPassing ? 'rgb(74, 222, 128)' : themeBorderLight}`
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
            {/* Stars inline */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {[1, 2, 3].map(s => (
                <Star
                  key={s}
                  className={`w-6 h-6 transition-all ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {/* Buttons - same as Technique Theory back button / Done pill */}
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
                  paddingBottom: 14
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isPassing) playComplete();
                if (isPassing && practiceChords?.length && onStartPractice) {
                  onStartPractice(getActivityTitle(), practiceChords);
                  onClose();
                } else if (isPassing) {
                  handleComplete(true);
                } else {
                  handleComplete();
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ 
                backgroundColor: isPassing 
                  ? 'rgba(34, 197, 94, 0.15)' 
                  : themeBg,
                borderBottom: isPassing 
                  ? '2px solid rgb(74, 222, 128)' 
                  : `2px solid ${themeBorderLight}`,
                color: isPassing ? 'rgb(22, 101, 52)' : themeColor,
                fontFamily: font,
                minHeight: 52,
                paddingTop: 14,
                paddingBottom: 14
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
    const options = isFillBlank 
      ? (currentItem as FillBlankItem).options 
      : (currentItem as MultipleChoiceItem).options;
    const correctAnswer = isFillBlank 
      ? (currentItem as FillBlankItem).correctAnswer 
      : (currentItem as MultipleChoiceItem).correctAnswer;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const blankRegex = /_{3,}/;
    const sentenceParts = isFillBlank ? (currentItem as FillBlankItem).sentence.split(blankRegex) : [];

    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden pt-1 pb-4">
        {/* Question card */}
        <div 
          className={`backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-4 mb-4 shadow-md transition-all duration-300 ${
            showCorrectAnimation ? 'ring-2 ring-emerald-400/60 ring-offset-1' : 
            showWrongAnimation ? 'ring-2 ring-red-400/60 ring-offset-1' : ''
          }`}
          style={cardStyle}
        >
          <div className="flex items-center gap-2 mb-3">
            <span 
              className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: themeLight, color: themeColor }}
            >
              {isFillBlank ? 'Fill in the blank' : 'Choose one'}
            </span>
            <span className="text-xs text-gray-500 font-medium ml-auto">
              {currentItemIndex + 1} / {items.length}
            </span>
          </div>

          <p className="text-sm font-semibold text-gray-800 leading-[1.65] break-words" style={{ fontFamily: font }}>
            {isFillBlank 
              ? sentenceParts.map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span 
                        className="inline-block min-w-[55px] mx-0.5 px-1.5 py-[1px] rounded-md text-center font-bold text-[13px]"
                        style={
                          showResult 
                            ? selectedAnswer === correctAnswer
                              ? { backgroundColor: 'rgba(34, 197, 94, 0.2)', color: 'rgb(22, 163, 74)', borderBottom: '2px solid rgb(34, 197, 94)' }
                              : { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'rgb(220, 38, 38)', borderBottom: '2px solid rgb(239, 68, 68)', textDecoration: 'line-through' }
                            : { backgroundColor: themeLight, color: themeColor, borderBottom: `2px solid ${themeColor}` }
                        }
                      >
                        {showResult 
                          ? (selectedAnswer === correctAnswer ? options[selectedAnswer!] : options[correctAnswer]) 
                          : selectedAnswer !== null ? options[selectedAnswer] : '?'
                        }
                      </span>
                    )}
                  </span>
                ))
              : (currentItem as MultipleChoiceItem).question
            }
          </p>
        </div>

        {/* Options */}
        <div ref={optionsRef} className="flex-1 overflow-y-auto min-h-0" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {options?.map((option, idx) => {
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
                {/* Letter badge */}
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
                <span className="text-sm font-medium text-gray-800 break-words" style={{
                  color: showCorrect ? 'rgb(22, 163, 74)' : showWrong ? 'rgb(220, 38, 38)' : undefined,
                  fontFamily: font,
                  lineHeight: 1.4
                }}>
                  {option}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom: explanation + continue - TechniqueTheory style */}
        {showResult && (
          <div className="flex-shrink-0 mt-4 flex flex-col gap-3">
            {currentItem?.explanation && (
              <div 
                className="backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm"
                style={{ 
                  backgroundColor: selectedAnswer === correctAnswer ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: `2.5px solid ${selectedAnswer === correctAnswer ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                }}
              >
                <div className="text-xs text-gray-600 leading-relaxed break-words" style={{ fontFamily: font }}>
                  <span className="font-bold" style={{ color: selectedAnswer === correctAnswer ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)' }}>
                    {selectedAnswer === correctAnswer ? 'Correct! ' : 'Not quite. '}
                  </span>
                  {(() => {
                    const expBullets = paragraphToBullets(currentItem.explanation);
                    if (expBullets.length <= 1) return <>{currentItem.explanation}</>;
                    return (
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {expBullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    );
                  })()}
                </div>
              </div>
            )}

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`p-0 overflow-hidden [&>button:last-of-type]:hidden flex flex-col bg-gradient-to-br ${gradientClass}`}
        style={{ width: 'calc(100% - 1rem)', maxWidth: '640px',
          borderRadius: '16px',
          border: '2.5px solid rgb(237, 237, 237)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          height: phase === 'intro' || phase === 'results' ? 'auto' : '85vh',
          maxHeight: phase === 'intro' ? '88vh' : phase === 'results' ? '90vh' : '680px',
        }}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{getActivityTitle()}</DialogTitle>

        {/* Inner wrapper: padding; when results, don't grow so dialog stays content-sized */}
        <div className={`flex flex-col px-4 sm:px-6 py-4 ${phase === 'results' ? '' : 'flex-1 min-h-0 overflow-hidden'}`}>
        
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
                <h2 className="text-sm font-bold text-gray-800 truncate" style={{ fontFamily: font }}>
                  {getActivityTitle()}
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  {phase === 'quiz' && <span>{currentItemIndex + 1} of {items.length}</span>}
                </div>
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
      </DialogContent>
    </Dialog>
  );
}
