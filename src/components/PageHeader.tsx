import React from 'react';

type PageVariant = 'default' | 'songs' | 'technique' | 'progress' | 'compete' | 'community' | 'settings' | 'timeline';

interface PageHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  variant?: PageVariant;
}

// Solid background colors for clean Duolingo-style header
const variantColors: Record<PageVariant, { bg: string; darkBg: string }> = {
  default: { bg: '#FED7AA', darkBg: '#1f2937' },      // orange-200
  songs: { bg: '#DDD6FE', darkBg: '#1f2937' },        // violet-200
  technique: { bg: '#A7F3D0', darkBg: '#1f2937' },    // emerald-200
  progress: { bg: '#BFDBFE', darkBg: '#1f2937' },     // blue-200
  compete: { bg: '#FDE68A', darkBg: '#1f2937' },      // amber-200
  community: { bg: '#FBCFE8', darkBg: '#1f2937' },    // pink-200
  settings: { bg: '#E5E7EB', darkBg: '#1f2937' },     // gray-200
  timeline: { bg: '#FDE68A', darkBg: '#1f2937' }      // amber-200
};

/**
 * Duolingo-style PageHeader with iOS safe area handling
 * Clean, minimal design with solid color background
 */
export function PageHeader({ title, rightElement, variant = 'default' }: PageHeaderProps) {
  const colors = variantColors[variant];

  return (
    <>
      {/* Fixed header that stays at top */}
      <div
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          backgroundColor: colors.bg,
          paddingTop: 'env(safe-area-inset-top, 0px)'
        }}
      >
        {/* Header content - Duolingo style: centered title, minimal */}
        <div className="flex items-center justify-center h-12 px-4 relative">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
            {title}
          </h1>
          {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
      </div>
      {/* Spacer to push content below fixed header */}
      <div
        style={{
          height: 'calc(env(safe-area-inset-top, 0px) + 48px)'
        }}
      />
    </>
  );
}

export default PageHeader;
