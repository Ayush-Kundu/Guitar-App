/**
 * Welcome popup for all levels: ask daily practice goal (minutes), then user sees onboarding tour.
 * Shown once per user. Skip button available.
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { playTap } from '../utils/soundEffects';
import { setDailyPracticeGoal } from '../utils/progressStorage';

const font = '"Nunito", "Segoe UI", system-ui, sans-serif';
const MINUTES_OPTIONS = [10, 15, 20, 30, 45, 60];

export interface WelcomeSetupProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function WelcomeSetup({ isOpen, userId, onComplete, onSkip }: WelcomeSetupProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(30);

  const handleContinue = () => {
    playTap();
    setDailyPracticeGoal(userId, selectedMinutes);
    onComplete();
  };

  const handleSkip = () => {
    playTap();
    onSkip();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden [&>button:last-of-type]:hidden rounded-2xl"
        style={{
          border: '2.5px solid rgb(237, 237, 237)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(to bottom right, #fff7ed, #fef2f2)',
        }}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Set your practice goal</DialogTitle>
        <div className="p-6 pb-5">
          <h2 className="text-xl font-bold text-gray-800 mb-1" style={{ fontFamily: font }}>
            Welcome to Strummy
          </h2>
          <p className="text-sm text-gray-600 mb-5" style={{ fontFamily: font }}>
            How many minutes per day do you want to practice? We’ll use this for your daily and weekly goals.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {MINUTES_OPTIONS.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => { playTap(); setSelectedMinutes(min); }}
                className="py-3 rounded-xl text-sm font-bold transition-all border-2"
                style={{
                  fontFamily: font,
                  backgroundColor: selectedMinutes === min ? 'rgb(249, 115, 22)' : 'rgba(255,255,255,0.9)',
                  color: selectedMinutes === min ? 'white' : 'rgb(75, 85, 99)',
                  borderColor: selectedMinutes === min ? 'rgb(234, 88, 12)' : 'rgb(229, 231, 235)',
                  borderBottomWidth: 3,
                }}
              >
                {min} min
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{
                fontFamily: font,
                backgroundColor: 'rgb(243, 244, 246)',
                color: 'rgb(107, 114, 128)',
                border: '1.5px solid rgb(229, 231, 235)',
              }}
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                fontFamily: font,
                backgroundColor: 'rgb(249, 115, 22)',
                border: '2px solid rgb(234, 88, 12)',
                borderBottomWidth: 3,
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const WELCOME_KEY_PREFIX = 'strummy-welcome-complete-';

export function shouldShowWelcome(userId: string): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(WELCOME_KEY_PREFIX + userId) !== 'true';
}

export function markWelcomeComplete(userId: string): void {
  try {
    localStorage.setItem(WELCOME_KEY_PREFIX + userId, 'true');
  } catch (_) {}
}
