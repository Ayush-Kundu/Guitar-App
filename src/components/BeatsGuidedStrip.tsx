import React from 'react';
import beatsSaysAvatar from '../assets/beats-says-avatar.png';
import { clearGuidedBeatsFlow } from '../utils/beatsGuidedFlow';

/** Sits fixed just above the footer (see globals #root padding ~70px). */
const STRIP_BOTTOM = 'calc(70px + env(safe-area-inset-bottom, 0px))';

interface BeatsGuidedStripProps {
  message: string;
  onDismiss: () => void;
}

export function BeatsGuidedStrip({ message, onDismiss }: BeatsGuidedStripProps) {
  const handleDismiss = () => {
    try {
      sessionStorage.removeItem('strummy-beats-directed');
      clearGuidedBeatsFlow();
    } catch (_) {}
    onDismiss();
  };

  return (
    <div
      className="fixed left-0 right-0 z-[45] pointer-events-auto px-4 sm:px-5"
      style={{ bottom: STRIP_BOTTOM }}
      role="status"
      aria-live="polite"
    >
      <div className="beats-popup rounded-2xl border-2 border-[#eb4034] shadow-[0_-6px_24px_rgba(235,64,52,0.18)] px-3 sm:px-4 py-3 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-orange-200/90 dark:ring-orange-900/60 shadow-sm beats-avatar">
            <img src={beatsSaysAvatar} alt="" className="w-full h-full object-cover beats-avatar-img" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wide beats-popup-text m-0 mb-0.5 opacity-90">
              Beats says
            </p>
            <p className="text-xs sm:text-[13px] font-semibold beats-popup-text m-0 leading-snug">{message}</p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 py-0.5 px-1.5 rounded-md beats-popup-btn text-[9px] font-semibold whitespace-nowrap leading-tight hover:opacity-95"
          >
            Ignore Beats
          </button>
        </div>
      </div>
    </div>
  );
}
