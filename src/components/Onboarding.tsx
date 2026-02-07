import React, { useState, useEffect } from 'react';
import { 
  Music, 
  BookOpen, 
  Users, 
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Home,
  Check
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onNavigate: (section: string) => void;
}

interface OnboardingSlide {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  section: string;
}

export function Onboarding({ onComplete, onNavigate }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      title: "Welcome to Strummy!",
      description: "Your personal guitar learning companion. Let me show you around and help you start your musical journey!",
      icon: <Sparkles className="w-5 h-5" />,
      color: 'rgb(249, 115, 22)',
      section: 'dashboard'
    },
    {
      title: "Your Dashboard",
      description: "This is your home base! See your daily goals, recent activity, and quick access to all features.",
      icon: <Home className="w-5 h-5" />,
      color: 'rgb(249, 115, 22)',
      section: 'dashboard'
    },
    {
      title: "Learn Songs You Love",
      description: "Browse our library of songs with chord progressions, strumming patterns, and tutorials. Filter by difficulty and genre!",
      icon: <Music className="w-5 h-5" />,
      color: 'rgb(59, 130, 246)',
      section: 'songs'
    },
    {
      title: "Master Techniques & Theory",
      description: "Build your skills with structured lessons on chords, strums, fingerpicking, and scales. Complete quizzes to track progress!",
      icon: <BookOpen className="w-5 h-5" />,
      color: 'rgb(16, 185, 129)',
      section: 'technique'
    },
    {
      title: "Track Your Progress",
      description: "Watch your skills grow with detailed stats, streaks, and achievements. Set daily goals and stay motivated!",
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'rgb(168, 85, 247)',
      section: 'progress'
    },
    {
      title: "Join the Community",
      description: "Connect with fellow guitarists, share your progress, compete in challenges, and climb the leaderboards!",
      icon: <Users className="w-5 h-5" />,
      color: 'rgb(236, 72, 153)',
      section: 'community'
    }
  ];

  // Navigate to the relevant section when slide changes
  useEffect(() => {
    const slide = slides[currentSlide];
    if (slide.section) {
      onNavigate(slide.section);
    }
  }, [currentSlide]);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate('dashboard');
    onComplete();
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent backdrop */}
      <div 
        className="absolute inset-0 bg-black/40" 
        onClick={handleSkip}
      />
      
      {/* Card Container - styled like Dashboard cards */}
      <div
        className="relative backdrop-blur-sm w-full max-w-sm overflow-hidden rounded-2xl shadow-lg"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid rgb(237, 237, 237)',
          borderBottom: '4px solid rgb(220, 220, 220)'
        }}
      >
        {/* Content */}
        <div className="p-6">
          {/* Top Row: Skip Button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-medium px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              style={{ 
                backgroundColor: 'rgb(243, 244, 246)',
                color: 'rgb(107, 114, 128)',
                border: '1px solid rgb(229, 231, 235)',
                borderBottom: '2px solid rgb(209, 213, 219)'
              }}
            >
              Skip Tour
            </button>
          </div>

          {/* Icon Badge + Title */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${slide.color}20` }}
            >
              <div style={{ color: slide.color }}>
                {slide.icon}
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              {slide.title}
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            {slide.description}
          </p>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            {/* Previous Button */}
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                style={{ 
                  backgroundColor: 'rgb(243, 244, 246)',
                  border: '1px solid rgb(229, 231, 235)',
                  borderBottom: '3px solid rgb(209, 213, 219)'
                }}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* Next/Done Button */}
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-11 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              style={{ 
                backgroundColor: slide.color,
                border: `2px solid ${slide.color}`,
                borderBottom: `4px solid ${slide.color}cc`
              }}
            >
              {isLastSlide ? (
                <>
                  Get Started
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
