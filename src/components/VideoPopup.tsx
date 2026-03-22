import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { 
  RotateCcw,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  XCircle,
  Trophy,
  Send
} from 'lucide-react';
import { 
  updateTechniqueProgress, 
  updateTheoryProgress
} from '../utils/progressStorage';
import type { LessonContent, QuizQuestion } from '../data/lesson-content';

interface VideoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    category: string;
    description?: string;
    progress?: number;
  };
  type: 'technique' | 'theory';
  userId: string;
  onComplete: (minutesPracticed: number, newProgress: number, pointsEarned: number) => void;
}

export function VideoPopup({ 
  isOpen, 
  onClose, 
  item, 
  type, 
  userId, 
  onComplete 
}: VideoPopupProps) {
  // View state: 'content' | 'quiz' | 'result'
  const [viewState, setViewState] = useState<'content' | 'quiz' | 'result'>('content');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const askAI = async (question: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) return;

    setAiLoading(true);
    setAiResponse('');

    const systemPrompt = `You are Strummy, a friendly and encouraging guitar coach. You help users learn guitar by answering questions about chords, strumming patterns, music theory, song recommendations, practice routines, and technique. Keep answers concise and practical. Use simple language suitable for beginners unless the user indicates they are advanced. The user is currently studying "${item.name}" in the ${item.category} category. Keep your response under 100 words.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: question }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { maxOutputTokens: 150 },
          }),
        }
      );
      const data = await res.json();
      if (data?.error) {
        if (data.error.code === 429) {
          setAiResponse('Rate limit reached — please wait a minute and try again.');
        } else {
          setAiResponse(data.error.message || 'API error. Please try again.');
        }
        return;
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      setAiResponse(text);
    } catch {
      setAiResponse('Something went wrong. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Default quiz for fallback - 5 questions to match required quiz length
  const defaultQuiz: QuizQuestion[] = [
    {
      question: 'What is the most important aspect of learning this technique?',
      options: ['Speed first', 'Proper form and practice', 'Playing loud', 'Skipping basics'],
      correctAnswer: 1
    },
    {
      question: 'How should you approach practicing?',
      options: ['As fast as possible', 'Start slow and build gradually', 'Only when performing', 'Skip practice entirely'],
      correctAnswer: 1
    },
    {
      question: 'What helps build muscle memory?',
      options: ['Random practice', 'Consistent, focused repetition', 'Avoiding practice', 'Playing once and stopping'],
      correctAnswer: 1
    },
    {
      question: 'What should you do if you make a mistake while practicing?',
      options: ['Start over from the beginning', 'Slow down and isolate the problem', 'Give up and try another day', 'Play faster to cover it up'],
      correctAnswer: 1
    },
    {
      question: 'What is the best way to warm up before practice?',
      options: ['Jump straight into difficult pieces', 'Start with simple exercises and stretches', 'Avoid warming up entirely', 'Only warm up on stage'],
      correctAnswer: 1
    }
  ];
  
  // Fallback content if no specific content found
  const defaultContent: LessonContent = {
    title: item.name,
    content: item.description || `Practice ${item.name} to improve your ${type === 'technique' ? 'technique' : 'music theory'} skills.\n\nFocus on clean execution and proper form. Start slow and gradually increase speed as you build muscle memory.\n\n**Tips:**\n• Practice regularly for best results\n• Use a metronome when possible\n• Record yourself to track progress`,
    quiz: defaultQuiz
  };
  
  const content = lessonContent || defaultContent;
  // Ensure we have exactly 5 questions - supplement from default if needed
  const contentQuiz = content.quiz || [];
  const quiz = contentQuiz.length >= 5
    ? contentQuiz.slice(0, 5)
    : [...contentQuiz, ...defaultQuiz.slice(0, 5 - contentQuiz.length)];

  // Get category color for the progress bar
  const getCategoryColor = () => {
    if (type === 'theory') {
      return 'rgb(59, 130, 246)'; // Blue for theory
    }
    const lowerCategory = item.category.toLowerCase();
    if (lowerCategory.includes('chord') || lowerCategory.includes('foundation')) {
      return 'rgb(239, 68, 68)'; // Red
    } else if (lowerCategory.includes('rhythm') || lowerCategory.includes('strum')) {
      return 'rgb(249, 115, 22)'; // Orange
    } else if (lowerCategory.includes('fingerpicking') || lowerCategory.includes('pluck')) {
      return 'rgb(234, 179, 8)'; // Yellow
    }
    return 'rgb(255, 209, 71)'; // Yellow for scales
  };

  // Reset state and lazy-load lesson content when popup opens
  useEffect(() => {
    if (isOpen) {
      setViewState('content');
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswers([]);
      setShowAnswerFeedback(false);
      setQuizPassed(false);
      setAiQuestion('');
      setAiResponse('');
      setAiLoading(false);
      setLessonContent(null);

      import('../data/lesson-content').then(mod => {
        setLessonContent(mod.getLessonContent(item.name, type));
      });
    }
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, [isOpen, item.name, type]);

  // Handle quiz answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    if (showAnswerFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  // Handle quiz answer submission
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowAnswerFeedback(true);
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    
    // Wait for feedback, then move to next question or results
    feedbackTimerRef.current = setTimeout(() => {
      if (currentQuestionIndex < quiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowAnswerFeedback(false);
      } else {
        // Quiz complete - check results
        const correctCount = newAnswers.filter((ans, idx) => ans === quiz[idx].correctAnswer).length;
        const passed = correctCount === quiz.length;
        setQuizPassed(passed);
        setViewState('result');
      }
    }, 1500);
  };

  // Start quiz
  const handleStartQuiz = () => {
    setViewState('quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowAnswerFeedback(false);
  };

  // Retry quiz
  const handleRetryQuiz = () => {
    setViewState('quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowAnswerFeedback(false);
    setQuizPassed(false);
  };

  const handleDone = () => {
    // Only allow completion if quiz was passed
    if (!quizPassed) return;
    
    // Award progress for completing the quiz - 100% complete when passing
    const minutesPracticed = 5; // Award 5 minutes for completing quiz
    const itemId = item.name.toLowerCase().replace(/\s+/g, '_');
    const newProgress = 100; // 100% complete when quiz is passed
    let totalPointsEarned = 0;

    if (type === 'technique') {
      const result = updateTechniqueProgress(
        userId,
        itemId,
        item.name,
        item.category,
        newProgress,
        minutesPracticed
      );
      totalPointsEarned = result.pointsEarned;
    } else {
      const result = updateTheoryProgress(
        userId,
        itemId,
        item.name,
        item.category,
        newProgress,
        minutesPracticed
      );
      totalPointsEarned = result.pointsEarned;
    }

    onComplete(minutesPracticed, newProgress, totalPointsEarned);
    onClose();
  };

  const categoryColor = getCategoryColor();

  // Function to render markdown-like content
  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Bold text (section headers)
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold text-gray-900 dark:text-white mt-4 mb-2 text-center text-sm">{line.slice(2, -2)}</p>;
      }
      // Section headers with bold
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="text-gray-600 dark:text-gray-300 mb-1 text-center text-sm">
            {parts.map((part, i) => 
              i % 2 === 1 ? <span key={i} className="font-semibold text-gray-900 dark:text-white">{part}</span> : part
            )}
          </p>
        );
      }
      // Bullet points
      if (line.startsWith('•') || line.startsWith('-')) {
        return <p key={index} className="text-gray-600 dark:text-gray-300 ml-6 mb-1 text-sm">{line}</p>;
      }
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      // Regular paragraph
      return <p key={index} className="text-gray-600 dark:text-gray-300 mb-2 leading-relaxed text-center text-sm">{line}</p>;
    });
  };

  // Render quiz question
  const renderQuiz = () => {
    const currentQuestion = quiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    return (
      <div className="space-y-3 px-4 sm:px-6">
        {/* Question counter */}
        <div className="flex justify-center gap-2 mb-2">
          {quiz.map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx < currentQuestionIndex 
                  ? answers[idx] === quiz[idx].correctAnswer 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                  : idx === currentQuestionIndex 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        {/* Question */}
        <div className="text-center mb-3 px-2 sm:px-3">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {quiz.length}
          </p>
          <p className="text-gray-800 dark:text-gray-200 mt-1 font-medium">
            {currentQuestion.question}
          </p>
        </div>
        
        {/* Options */}
        <div className="space-y-2">
          {currentQuestion.options.map((option, idx) => {
            let buttonStyle = 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-400';
            
            if (showAnswerFeedback) {
              if (idx === currentQuestion.correctAnswer) {
                buttonStyle = 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400';
              } else if (idx === selectedAnswer && idx !== currentQuestion.correctAnswer) {
                buttonStyle = 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400';
              }
            } else if (selectedAnswer === idx) {
              buttonStyle = 'bg-blue-50 dark:bg-blue-900/30 border-blue-500';
            }
            
            return (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={showAnswerFeedback}
                className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    selectedAnswer === idx ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 text-sm">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Submit button */}
        {!showAnswerFeedback && (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="w-full h-11 mt-2 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: 'rgb(59, 130, 246)',
              border: '2px solid rgb(37, 99, 235)',
              borderBottom: '4px solid rgb(29, 78, 216)'
            }}
          >
            Submit Answer
          </button>
        )}
        
        {/* Feedback */}
        {showAnswerFeedback && (
          <div className={`py-3 px-4 rounded-xl text-center ${
            isCorrect 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            <div className="flex items-center justify-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold text-sm">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span className="font-semibold text-sm">Incorrect</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render quiz results
  const renderResults = () => {
    const correctCount = answers.filter((ans, idx) => ans === quiz[idx].correctAnswer).length;
    
    return (
      <div className="text-center space-y-5 py-2">
        {quizPassed ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">Congratulations!</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                You answered all {quiz.length} questions correctly!
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Not quite!</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                You got {correctCount} out of {quiz.length} correct.
              </p>
            </div>
            <p className="text-amber-600 dark:text-amber-400 text-sm">
              Review the content and try again.
            </p>
            <button
              onClick={handleRetryQuiz}
              className="w-full h-11 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: 'rgb(59, 130, 246)',
                border: '2px solid rgb(37, 99, 235)',
                borderBottom: '4px solid rgb(29, 78, 216)'
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="p-0 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 [&>button:last-of-type]:hidden"
        style={{
          width: 'calc(100% - 1rem)', maxWidth: '36rem',
          border: '2px solid rgb(237, 237, 237)',
          borderRadius: '16px',
          maxHeight: '85vh'
        }}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2 sm:pb-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 text-base sm:text-lg font-semibold">
              <div 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ 
                  backgroundColor: `${categoryColor}20`,
                  border: `2px solid ${categoryColor}40`
                }}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: categoryColor }} />
              </div>
              <span className="truncate">{item.name}</span>
            </DialogTitle>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 ml-10 sm:ml-12 truncate">{item.category}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center transition-all hover:scale-105 flex-shrink-0 ml-2"
            style={{ 
              border: '2px solid rgb(237, 237, 237)',
              borderBottom: '3px solid rgb(220, 220, 220)'
            }}
          >
            <span className="text-gray-500 text-base sm:text-lg font-light">×</span>
          </button>
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 space-y-3 sm:space-y-4">
          {viewState === 'content' && (
            <>
              {/* Lesson Content Area */}
              <div 
                ref={contentRef}
                className="relative rounded-xl overflow-hidden bg-white dark:bg-gray-800"
                style={{ 
                  border: '2px solid rgb(237, 237, 237)',
                  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  maxHeight: '250px',
                  overflowY: 'auto'
                }}
              >
                <div className="p-4 sm:p-5">
                  {renderContent(content.content)}
            </div>
          </div>

              {/* Ask AI */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Ask about ${item.name}...`}
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && aiQuestion.trim()) {
                        askAI(aiQuestion);
                      }
                    }}
                    className="flex-1 min-w-0 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 dark:text-gray-200"
                  />
                  <button
                    onClick={() => {
                      if (aiQuestion.trim()) {
                        askAI(aiQuestion);
                      }
                    }}
                    className="flex-shrink-0 w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Send className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                {aiLoading && (
                  <div className="flex gap-1.5 px-1 py-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
                )}
                {aiResponse && !aiLoading && (
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {aiResponse}
            </div>
                )}
          </div>

              {/* Start Quiz Button */}
            <button
                onClick={handleStartQuiz}
                className="w-full h-10 sm:h-11 text-sm sm:text-base text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              style={{ 
                  backgroundColor: 'rgb(59, 130, 246)',
                  border: '2px solid rgb(37, 99, 235)',
                  borderBottom: '4px solid rgb(29, 78, 216)',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                }}
              >
                <HelpCircle className="w-4 h-4" />
                Start Quiz
              </button>
                </>
              )}

          {viewState === 'quiz' && (
            <div 
              className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 p-4 sm:p-5"
              style={{ 
                border: '2px solid rgb(237, 237, 237)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              {renderQuiz()}
            </div>
          )}

          {viewState === 'result' && (
            <>
              <div 
                className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 p-3 sm:p-4"
                style={{ 
                  border: '2px solid rgb(237, 237, 237)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {renderResults()}
          </div>

              {/* Done Button - only enabled if quiz passed */}
              {quizPassed && (
            <button 
              onClick={handleDone}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: 'rgb(34, 197, 94)',
                border: '2px solid rgb(22, 163, 74)',
                borderBottom: '4px solid rgb(21, 128, 61)',
                boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.3)'
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
                  Complete
            </button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

