import { useUser } from '../contexts/UserContext';
import { Progress } from './ui/progress';

const LEVEL_INFO = {
  novice: { name: 'Novice', color: 'text-red-600', bgColor: 'bg-red-100' },
  beginner: { name: 'Beginner', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  elementary: { name: 'Elementary', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  intermediate: { name: 'Intermediate', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  proficient: { name: 'Proficient', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  advanced: { name: 'Advanced', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  expert: { name: 'Expert', color: 'text-green-600', bgColor: 'bg-green-100' }
};

const LEVEL_ORDER = ['novice', 'beginner', 'elementary', 'intermediate', 'proficient', 'advanced', 'expert'];

interface SkillProgressBarProps {
  onSectionChange?: (section: string) => void;
}

export function SkillProgressBar({ onSectionChange }: SkillProgressBarProps) {
  const { user, getLevelProgressPercentage } = useUser();

  if (!user) return null;

  const currentLevelIndex = LEVEL_ORDER.indexOf(user.level);
  const nextLevel = currentLevelIndex < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[currentLevelIndex + 1] : null;
  const levelProgressPercentage = getLevelProgressPercentage();
  const currentLevelInfo = LEVEL_INFO[user.level as keyof typeof LEVEL_INFO];
  const nextLevelInfo = nextLevel ? LEVEL_INFO[nextLevel as keyof typeof LEVEL_INFO] : null;

  const handleClick = () => {
    if (onSectionChange) {
      onSectionChange('progress');
    }
  };

  return (
    <div 
      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200 dark:border-gray-700 ${
        onSectionChange ? 'cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-[1.02]' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Current Level Progress</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{levelProgressPercentage}% to next level</span>
      </div>
      
      {/* Current Level Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`px-3 py-1.5 ${currentLevelInfo.bgColor} dark:bg-opacity-20 rounded-full`}>
          <span className={`text-sm font-medium ${currentLevelInfo.color} dark:opacity-90`}>
            {currentLevelInfo.name}
          </span>
        </div>
        {nextLevelInfo && (
          <>
            <span className="text-gray-400 dark:text-gray-500">→</span>
            <div className={`px-3 py-1.5 ${nextLevelInfo.bgColor} dark:bg-opacity-20 rounded-full opacity-60`}>
              <span className={`text-sm font-medium ${nextLevelInfo.color} dark:opacity-90`}>
                {nextLevelInfo.name}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Progress Bar - Now shows progress within current level */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="level-progress-bar" 
            style={{ width: `${levelProgressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{currentLevelInfo.name} Start</span>
          <span>{nextLevelInfo ? `${nextLevelInfo.name} Level` : 'Mastery'}</span>
        </div>
      </div>

      {/* Level Milestones - Removed blue ring */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {LEVEL_ORDER.map((level, index) => {
          const isCompleted = index < currentLevelIndex;
          const isCurrent = index === currentLevelIndex;
          const levelInfo = LEVEL_INFO[level as keyof typeof LEVEL_INFO];
          return (
            <div key={level} className="text-center">
              <div 
                className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                  isCompleted 
                    ? `${levelInfo.bgColor} dark:bg-opacity-20 ${levelInfo.color} dark:opacity-90` 
                    : isCurrent
                    ? `${levelInfo.bgColor} dark:bg-opacity-20 ${levelInfo.color} dark:opacity-90`
                    : 'bg-gray-200 dark:bg-gray-700'
                } flex items-center justify-center transition-all duration-300 ${
                  isCurrent ? 'scale-110 shadow-lg' : ''
                }`}
              >
                {(isCompleted || isCurrent) && (
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                )}
              </div>
              <span className={`text-xs ${
                isCompleted || isCurrent ? `${levelInfo.color} dark:opacity-90` : 'text-gray-400 dark:text-gray-600'
              }`}>
                {levelInfo.name.charAt(0)}
              </span>
            </div>
          );
        })}
      </div>

      {nextLevelInfo && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Next level:</span> {nextLevelInfo.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {onSectionChange ? 'Click to view detailed progress!' : 'Keep practicing to unlock new challenges and techniques!'}
          </p>
        </div>
      )}
    </div>
  );
}