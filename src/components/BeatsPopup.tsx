import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { loadProgress } from '../utils/progressStorage';
import {
  getBeatsPopupMessageParts,
  isSectionTaskComplete,
  type BeatsSection,
} from '../utils/beatsInstructions';
import { clearGuidedBeatsFlow } from '../utils/beatsGuidedFlow';
/** Cropped Beats mascot (no letterbox) */
import beatsSaysAvatar from '../assets/beats-says-avatar.png';
import { MoreHorizontal } from 'lucide-react';

const POPUP_IGNORE_PREFIX = 'strummy-ignore-beats-popup-';

function getIgnoreKey(section: string, today: string): string {
  return `${POPUP_IGNORE_PREFIX}${section}-${today}`;
}

function isPopupIgnored(section: string, today: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getIgnoreKey(section, today)) === 'true';
}

export type BeatsPopupVisualWeight = 'emphasized' | 'subtle';

interface BeatsPopupProps {
  section: BeatsSection;
  visualWeight?: BeatsPopupVisualWeight;
  onDismiss?: () => void;
  onNavigate?: (section: string) => void;
}

export function BeatsPopup({
  section,
  visualWeight = 'emphasized',
  onDismiss,
  onNavigate,
}: BeatsPopupProps) {
  const { user } = useUser();
  const [progressData, setProgressData] = useState<ReturnType<typeof loadProgress> | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [messageExpanded, setMessageExpanded] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const ignoreKey = getIgnoreKey(section, today);
  const subtle = visualWeight === 'subtle';

  useEffect(() => {
    if (!user) return;
    setProgressData(loadProgress(user.id));
  }, [user, section]);

  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;
    const onSync = (ev: Event) => {
      const d = (ev as CustomEvent<{ userId?: string }>).detail;
      if (d?.userId === uid) setProgressData(loadProgress(uid));
    };
    window.addEventListener('strummy-progress-sync', onSync);
    return () => window.removeEventListener('strummy-progress-sync', onSync);
  }, [user?.id]);

  useEffect(() => {
    const ignored = isPopupIgnored(section, today);
    const fromBeats =
      typeof window !== 'undefined' && sessionStorage.getItem('strummy-beats-directed') === section;
    if (!fromBeats && ignored) setDismissed(true);
    else if (fromBeats) setDismissed(false);
  }, [section, today]);

  useEffect(() => {
    setMessageExpanded(false);
  }, [section, today, user?.id]);

  const handleIgnore = () => {
    localStorage.setItem(ignoreKey, 'true');
    try {
      sessionStorage.removeItem('strummy-beats-directed');
      clearGuidedBeatsFlow();
    } catch (_) {}
    onDismiss?.();
    setDismissed(true);
  };

  const handleBackToDashboard = () => {
    localStorage.setItem(ignoreKey, 'true');
    try {
      sessionStorage.removeItem('strummy-beats-directed');
      clearGuidedBeatsFlow();
    } catch (_) {}
    onNavigate?.('dashboard');
    onDismiss?.();
    setDismissed(true);
  };

  if (!user || dismissed) return null;

  const { short: messageShort, full: messageFull } = getBeatsPopupMessageParts(section, progressData, user, today);
  const showMessageExpand = messageFull.trim() !== messageShort.trim();
  const taskComplete = isSectionTaskComplete(section, progressData, user, today);

  const avatarClass = subtle ? 'w-7 h-7 ring-1 ring-orange-200/50' : 'w-9 h-9 ring-2 ring-orange-200/80';
  const cardClass = subtle
    ? 'opacity-90 beats-popup border border-gray-200/60 dark:border-slate-600/80'
    : 'beats-popup';

  return (
    <div
      className="fixed left-0 right-0 z-40 px-4 sm:px-5 safe-area-bottom"
      style={{ bottom: '64px' }}
    >
      <div
        className={`w-full max-w-md mx-auto rounded-2xl p-3 sm:p-4 shadow-md ${cardClass}`}
        data-beats="popup"
      >
        <div className="flex items-start gap-2">
          <div
            className={`rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center beats-avatar ${avatarClass}`}
          >
            <img src={beatsSaysAvatar} alt="Beats" className="beats-avatar-img" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold leading-tight beats-popup-text m-0 mb-0.5 ${
                    subtle ? 'text-[10px]' : 'text-[11px]'
                  }`}
                >
                  Beats says
                </p>
                {!messageExpanded ? (
                  <p
                    className={`leading-snug beats-popup-text m-0 ${
                      subtle ? 'text-[11px]' : 'text-xs font-medium'
                    } ${showMessageExpand ? 'line-clamp-3' : ''}`}
                  >
                    {messageShort}
                  </p>
                ) : (
                  <div
                    className={`max-h-[min(50vh,220px)] overflow-y-auto overscroll-contain leading-relaxed beats-popup-text m-0 pr-0.5 ${
                      subtle ? 'text-[11px]' : 'text-xs'
                    } whitespace-pre-wrap`}
                  >
                    {messageFull}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {showMessageExpand ? (
                  <button
                    type="button"
                    onClick={() => setMessageExpanded(e => !e)}
                    className="p-1 rounded-md border-0 bg-transparent shadow-none beats-popup-text cursor-pointer"
                    title={messageExpanded ? 'Show shorter' : 'Show steps'}
                    aria-expanded={messageExpanded}
                    aria-label={messageExpanded ? 'Collapse Beats steps' : 'Expand Beats steps'}
                  >
                    <MoreHorizontal className="w-3.5 h-3.5 shrink-0" />
                  </button>
                ) : null}
                {taskComplete ? (
                  <button
                    type="button"
                    onClick={handleBackToDashboard}
                    className="py-0.5 px-1.5 rounded-md text-[9px] font-semibold beats-popup-btn whitespace-nowrap leading-tight"
                  >
                    Back to dashboard
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleIgnore}
                    className="py-0.5 px-1.5 rounded-md text-[9px] font-semibold beats-popup-btn whitespace-nowrap leading-tight"
                  >
                    Ignore Beats
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
