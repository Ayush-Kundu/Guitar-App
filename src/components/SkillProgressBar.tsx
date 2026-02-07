import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Progress } from './ui/progress';

const LEVEL_INFO = {
  novice: { name: 'Nov', color: 'text-red-500', bgColor: 'bg-red-500' },
  beginner: { name: 'Beg', color: 'text-orange-500', bgColor: 'bg-orange-500' },
  elementary: { name: 'Elm', color: 'text-amber-500', bgColor: 'bg-amber-500' },
  intermediate: { name: 'Int', color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  proficient: { name: 'Pro', color: 'text-green-500', bgColor: 'bg-green-500' },
  advanced: { name: 'Adv', color: 'text-blue-500', bgColor: 'bg-blue-500' },
  expert: { name: 'Exp', color: 'text-purple-500', bgColor: 'bg-purple-500' }
};

const LEVEL_ORDER = ['novice', 'beginner', 'elementary', 'intermediate', 'proficient', 'advanced', 'expert'];

// Helper function to convert Tailwind color classes to actual color values
const getColorValue = (colorClass: string) => {
  const colorMap: { [key: string]: string } = {
    'bg-red-500': '#ef4444',
    'bg-orange-500': '#f97316',
    'bg-amber-500': '#f59e0b',
    'bg-yellow-500': '#eab308',
    'bg-green-500': '#22c55e',
    'bg-blue-500': '#3b82f6',
    'bg-purple-500': '#a855f7'
  };
  return colorMap[colorClass] || '#6b7280';
};

interface SkillProgressBarProps {
  onSectionChange?: (section: string) => void;
}

export function SkillProgressBar({ onSectionChange }: SkillProgressBarProps) {
  const { user, getLevelProgressPercentage } = useUser();
  const [levelProgressPercentage, setLevelProgressPercentage] = useState(0);

  // Refresh progress periodically
  useEffect(() => {
    if (!user) return;
    
    // Initial load
    setLevelProgressPercentage(getLevelProgressPercentage());
    
    // Refresh every 2 seconds to pick up changes
    const intervalId = setInterval(() => {
      setLevelProgressPercentage(getLevelProgressPercentage());
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [user, getLevelProgressPercentage]);

  if (!user) return null;

  const currentLevelIndex = LEVEL_ORDER.indexOf(user.level);
  const nextLevel = currentLevelIndex < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[currentLevelIndex + 1] : null;
  const currentLevelInfo = LEVEL_INFO[user.level as keyof typeof LEVEL_INFO];
  const nextLevelInfo = nextLevel ? LEVEL_INFO[nextLevel as keyof typeof LEVEL_INFO] : null;

  const handleClick = () => {
    if (onSectionChange) {
      onSectionChange('progress');
    }
  };

  return (
    <div 
      className={`bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm ${
        onSectionChange ? 'cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-[1.02]' : ''
      }`}
      style={{border: "2.5px solid rgb(237, 237, 237)", backgroundColor: 'rgba(255, 255, 255, 0.58)' }}
      onClick={handleClick}
    >

      {/* Current Level Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 ${currentLevelInfo.bgColor} rounded-full`}>
            <span className="text-sm font-medium text-white">
              {currentLevelInfo.name}
            </span>
          </div>
          {nextLevelInfo && (
            <>
              <span className="text-gray-400 dark:text-gray-500">→</span>
              <div className={`px-3 py-1.5 ${nextLevelInfo.bgColor} rounded-full opacity-60`}>
                <span className="text-sm font-medium text-white">
                  {nextLevelInfo.name}
                </span>
              </div>
            </>
          )}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{levelProgressPercentage}% to next level</span>
      </div>

      {/* Progress Bar - Now shows progress within current level */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden relative">
          {LEVEL_ORDER.map((level, index) => {
            const levelInfo = LEVEL_INFO[level as keyof typeof LEVEL_INFO];
            const segmentWidth = 100 / LEVEL_ORDER.length; // Each level gets equal width
            const segmentStart = index * segmentWidth;
            const segmentEnd = (index + 1) * segmentWidth;
            const currentProgress = ((currentLevelIndex + levelProgressPercentage / 100) / LEVEL_ORDER.length) * 100;
            
            // Calculate how much of this segment should be filled
            let fillWidth = 0;
            if (currentProgress >= segmentEnd) {
              fillWidth = segmentWidth;
            } else if (currentProgress > segmentStart) {
              fillWidth = currentProgress - segmentStart;
            }
            
            return fillWidth > 0 ? (
              <div
                key={level}
                className="absolute top-0 h-full"
                style={{
                  left: `${segmentStart}%`,
                  width: `${fillWidth}%`,
                  backgroundColor: getColorValue(levelInfo.bgColor),
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            ) : null;
          })}
        </div>
      </div>

      {/* Level Milestones - Removed blue ring */}
      <div className="mt-6 grid grid-cols-7 gap-1" style={{ marginTop: '20px' }}>
        {LEVEL_ORDER.map((level, index) => {
          const isCompleted = index < currentLevelIndex;
          const isCurrent = index === currentLevelIndex;
          const levelInfo = LEVEL_INFO[level as keyof typeof LEVEL_INFO];
          return (
            <div key={level} className="text-center">
              <div 
                className={`w-8 h-8 rounded-full mx-auto ${
                  isCompleted 
                    ? `${levelInfo.bgColor} dark:bg-opacity-20` 
                    : isCurrent
                    ? `${levelInfo.bgColor} dark:bg-opacity-20`
                    : 'bg-gray-200 dark:bg-gray-700'
                } flex items-center justify-center transition-all duration-300 ${
                  isCurrent ? 'scale-110 shadow-lg' : ''
                }`}
                style={{ marginTop: '-12px' }}
              >
                <span className={`text-sm font-semibold ${
                  isCompleted || isCurrent ? 'text-white' : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {levelInfo.name.charAt(0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
}