import React, { useEffect } from 'react';
import guitarVictoryStance from '../assets/20251019_1608_Guitar Victory Stance_remix_01k7zbmn8zfmqtx50kwjas8yr9.png';

export type CelebrationPayload =
  | { kind: 'streak'; streak: number }
  | { kind: 'song_complete'; title: string }
  | { kind: 'level_up'; level: string }
  | { kind: 'placeholder'; label?: string };

const DISPLAY_MS = 2800;

interface CelebrationOverlayProps {
  payload: CelebrationPayload;
  onDone: () => void;
}

export function CelebrationOverlay({ payload, onDone }: CelebrationOverlayProps) {
  useEffect(() => {
    const t = window.setTimeout(onDone, DISPLAY_MS);
    return () => window.clearTimeout(t);
  }, [onDone]);

  const title =
    payload.kind === 'streak'
      ? `${payload.streak}-day streak`
      : payload.kind === 'song_complete'
        ? 'Song mastered'
        : payload.kind === 'level_up'
          ? 'Level up'
          : payload.label || 'Nice work';

  const subtitle =
    payload.kind === 'streak'
      ? 'Keep showing up — you\u2019re building a habit.'
      : payload.kind === 'song_complete'
        ? payload.title
        : payload.kind === 'level_up'
          ? `You reached ${payload.level}.`
          : 'Keep up the great work!';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 text-center celebration-overlay animate-in fade-in-0 duration-300 bg-gradient-to-b from-red-700 via-red-600 to-red-800 dark:from-red-950 dark:via-red-900 dark:to-red-950"
      role="dialog"
      aria-live="polite"
      aria-label={title}
    >
      <div className="relative z-10 max-w-sm rounded-2xl bg-red-950 dark:bg-red-950 border-4 border-red-900 dark:border-red-800 px-8 py-10 shadow-2xl flex flex-col items-center">
        <div className="relative mb-4">
          <img
            src={guitarVictoryStance}
            alt="Celebration"
            className="w-28 h-28 object-contain animate-bounce"
            style={{ animationDuration: '1.5s' }}
          />
          <svg
            className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 drop-shadow-lg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <p
          className="text-3xl sm:text-4xl font-extrabold text-white m-0 mb-3"
          style={{ fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif' }}
        >
          {title}
        </p>
        <p className="text-base sm:text-lg text-red-50 font-medium m-0 leading-snug">{subtitle}</p>
      </div>
    </div>
  );
}
