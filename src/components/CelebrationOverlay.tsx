import React, { useEffect } from 'react';

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
      ? 'Keep showing up — you’re building a habit.'
      : payload.kind === 'song_complete'
        ? payload.title
        : payload.kind === 'level_up'
          ? `You reached ${payload.level}.`
          : 'Animation placeholder — drop your motion design here.';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 text-center celebration-overlay animate-in fade-in-0 duration-300 bg-gradient-to-b from-red-700 via-red-600 to-red-800 dark:from-red-950 dark:via-red-900 dark:to-red-950"
      role="dialog"
      aria-live="polite"
      aria-label={title}
    >
      <div className="relative z-10 max-w-sm rounded-2xl bg-red-950 dark:bg-red-950 border-4 border-red-900 dark:border-red-800 px-8 py-10 shadow-2xl">
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
