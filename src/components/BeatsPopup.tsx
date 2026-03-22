import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { loadProgress } from '../utils/progressStorage';
import {
  getBeatsPopupMessageParts,
  isSectionTaskComplete,
  type BeatsSection,
} from '../utils/beatsInstructions';
/** Same as Settings profile “Orange Circle” (red Beats) */
import beatsAvatarProfile from '../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (5).png';
import { MoreHorizontal } from 'lucide-react';

const POPUP_IGNORE_PREFIX = 'strummy-ignore-beats-popup-';

function getIgnoreKey(section: string, today: string): string {
  return `${POPUP_IGNORE_PREFIX}${section}-${today}`;
}

function isPopupIgnored(section: string, today: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getIgnoreKey(section, today)) === 'true';
}

interface BeatsPopupProps {
  section: BeatsSection;
  onDismiss?: () => void;
  onNavigate?: (section: string) => void;
}

export function BeatsPopup({ section, onDismiss, onNavigate }: BeatsPopupProps) {
  const { user } = useUser();
  const [progressData, setProgressData] = useState<ReturnType<typeof loadProgress> | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [messageExpanded, setMessageExpanded] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const ignoreKey = getIgnoreKey(section, today);

  useEffect(() => {
    if (!user) return;
    setProgressData(loadProgress(user.id));
  }, [user, section]);

  // Only hide if they previously clicked "Ignore" for this section today. When user just clicked Beats CTA we clear that key before nav, so we stay visible.
  useEffect(() => {
    const ignored = isPopupIgnored(section, today);
    const fromBeats = typeof window !== 'undefined' && sessionStorage.getItem('strummy-beats-directed') === section;
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
    } catch (_) {}
    onDismiss?.();
    setDismissed(true);
  };

  const handleBackToDashboard = () => {
    localStorage.setItem(ignoreKey, 'true');
    try {
      sessionStorage.removeItem('strummy-beats-directed');
    } catch (_) {}
    onNavigate?.('dashboard');
    onDismiss?.();
    setDismissed(true);
  };

  if (!user || dismissed) return null;

  const { short: messageShort, full: messageFull } = getBeatsPopupMessageParts(section, progressData, user, today);
  const showMessageExpand = messageFull.trim() !== messageShort.trim();
  const taskComplete = isSectionTaskComplete(section, progressData, user, today);

  return (
    <div
      className="fixed left-0 right-0 z-40 px-3 safe-area-bottom"
      style={{ bottom: '64px' }}
    >
      <div className="w-full max-w-md mx-auto rounded-xl p-3 shadow-sm beats-popup" data-beats="popup">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center beats-avatar"
          >
            <img
              src={beatsAvatarProfile}
              alt="Beats"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <p className="text-xs font-semibold leading-tight beats-popup-text flex-shrink-0 pt-0.5">Beats says</p>
            <div className="flex-1 min-w-0 flex items-start gap-2">
              {!showMessageExpand ? (
                <p className="text-xs leading-snug beats-popup-text m-0 min-w-0 flex-1">{messageShort}</p>
              ) : (
                <div className="flex flex-1 min-w-0 items-end gap-1">
                  <p
                    className={`text-xs leading-snug beats-popup-text m-0 flex-1 min-w-0 break-words ${
                      !messageExpanded ? 'line-clamp-1' : ''
                    }`}
                  >
                    {messageExpanded ? messageFull : messageShort}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMessageExpanded(e => !e)}
                    className="flex-shrink-0 p-0 m-0 border-0 bg-transparent shadow-none rounded-none beats-popup-text cursor-pointer pb-px"
                    title={messageExpanded ? 'Show shorter' : 'Show full message'}
                    aria-expanded={messageExpanded}
                    aria-label={messageExpanded ? 'Collapse Beats message' : 'Expand Beats message'}
                  >
                    <MoreHorizontal className="w-3.5 h-3.5 shrink-0" strokeWidth={2.25} />
                  </button>
                </div>
              )}
            {taskComplete ? (
              <button
                type="button"
                onClick={handleBackToDashboard}
                className="flex-shrink-0 py-1 px-2 rounded-lg text-xs font-medium beats-popup-btn whitespace-nowrap"
              >
                Back to dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={handleIgnore}
                className="flex-shrink-0 py-1 px-2 rounded-lg text-xs font-medium beats-popup-btn whitespace-nowrap"
              >
                Ignore Beats
              </button>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
