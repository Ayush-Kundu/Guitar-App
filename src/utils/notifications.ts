/**
 * Notifications Utility
 * Handles iOS push notifications for practice reminders, achievements, and weekly challenges
 */

import { useState, useEffect, useCallback } from 'react';
import { LocalNotifications, ScheduleOptions, LocalNotificationSchema } from '@capacitor/local-notifications';
import { isNative, getPlatform } from './capacitor';

// Notification IDs (using ranges to avoid conflicts)
const NOTIFICATION_IDS = {
  DAILY_REMINDER_BASE: 1000,
  ACHIEVEMENT_BASE: 2000,
  WEEKLY_CHALLENGE_BASE: 3000,
  MOTIVATIONAL_BASE: 4000,
  STREAK_REMINDER: 5000,
};

// Practice reminder messages - varied and encouraging
const PRACTICE_REMINDERS = [
  {
    title: "Time to Practice! 🎸",
    body: "Your guitar is waiting! Even 10 minutes of practice today will keep your skills sharp.",
  },
  {
    title: "Daily Practice Reminder",
    body: "Consistency is key! Jump in for a quick session and keep your streak alive.",
  },
  {
    title: "Don't Break Your Streak!",
    body: "You've been doing great! A short practice session today will maintain your momentum.",
  },
  {
    title: "Guitar Time! 🎶",
    body: "The best guitarists practice every day. Ready to join them?",
  },
  {
    title: "Your Daily Guitar Session",
    body: "Just 15 minutes can make a huge difference. Let's get those fingers moving!",
  },
  {
    title: "Practice Makes Progress",
    body: "Every chord you play brings you closer to mastery. Start your session now!",
  },
  {
    title: "Keep the Music Going 🎵",
    body: "Your skills are growing every day. Don't stop now - practice time!",
  },
  {
    title: "Ready to Rock?",
    body: "Your guitar journey continues today. Open the app and strum a few chords!",
  },
  {
    title: "Daily Guitar Check-in",
    body: "A few minutes of practice today = better playing tomorrow. Let's go!",
  },
  {
    title: "Time for Some Strings!",
    body: "Whether it's chords, scales, or songs - every practice counts. Jump in!",
  },
];

// Motivational messages for extra practice encouragement
const MOTIVATIONAL_MESSAGES = [
  {
    title: "You're Almost There! 💪",
    body: "You've made great progress this week. One more practice session to hit your goal!",
  },
  {
    title: "Halfway Through the Week",
    body: "Keep up the momentum! Your weekly goals are within reach.",
  },
  {
    title: "Weekend Practice Time",
    body: "The weekend is perfect for a longer practice session. Ready to level up?",
  },
  {
    title: "New Week, New Goals",
    body: "Fresh weekly challenges await! Start strong with a practice session.",
  },
  {
    title: "Evening Practice Session?",
    body: "Wind down your day with some relaxing guitar practice.",
  },
];

// Achievement notification templates
const ACHIEVEMENT_MESSAGES = {
  streak_milestone: {
    title: "Streak Milestone! 🔥",
    body: "Amazing! You've maintained a {days}-day practice streak. Keep it going!",
  },
  song_completed: {
    title: "Song Mastered! 🎉",
    body: "Congratulations! You've completed '{songName}'. Ready for the next one?",
  },
  technique_mastered: {
    title: "Technique Unlocked! ⭐",
    body: "You've mastered a new technique: {techniqueName}. Your skills are growing!",
  },
  level_up: {
    title: "Level Up! 🚀",
    body: "You've reached Level {level}! Your guitar journey is progressing amazingly.",
  },
  points_milestone: {
    title: "Points Milestone! 🏆",
    body: "You've earned {points} points! Your dedication is paying off.",
  },
  weekly_goal_complete: {
    title: "Weekly Goal Achieved! ✅",
    body: "You crushed your weekly goal! Take a moment to celebrate your progress.",
  },
  first_song: {
    title: "First Song Complete! 🎸",
    body: "You've finished learning your first song! This is just the beginning.",
  },
  practice_time_milestone: {
    title: "Practice Time Milestone! ⏱️",
    body: "You've practiced for {hours} hours total! That's real dedication.",
  },
};

// Weekly challenge notification templates
const WEEKLY_CHALLENGE_MESSAGES = [
  {
    title: "New Weekly Challenges! 🎯",
    body: "Fresh challenges are here! Check out this week's goals and earn bonus points.",
  },
  {
    title: "Challenge Reminder",
    body: "Don't forget about your weekly challenges! Complete them for extra points.",
  },
  {
    title: "Challenge Progress Update",
    body: "You're making progress on your weekly challenges. Keep pushing!",
  },
  {
    title: "Last Day for Challenges!",
    body: "Weekly challenges reset tomorrow. Finish strong and claim your rewards!",
  },
];

// Storage keys for notification settings
const STORAGE_KEYS = {
  NOTIFICATIONS_ENABLED: 'strummy_notifications_enabled',
  PRACTICE_REMINDERS: 'strummy_practice_reminders',
  ACHIEVEMENT_ALERTS: 'strummy_achievement_alerts',
  WEEKLY_CHALLENGES: 'strummy_weekly_challenges',
  REMINDER_TIME: 'strummy_reminder_time',
};

/**
 * Check if notifications are supported and get permission
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (!isNative()) {
    console.log('[Notifications] Not running on native platform');
    return false;
  }

  try {
    const permission = await LocalNotifications.checkPermissions();

    if (permission.display === 'granted') {
      return true;
    }

    if (permission.display === 'prompt' || permission.display === 'prompt-with-rationale') {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    }

    return false;
  } catch (error) {
    console.error('[Notifications] Error checking permissions:', error);
    return false;
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNative()) {
    return false;
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('[Notifications] Error requesting permissions:', error);
    return false;
  }
};

/**
 * Schedule daily practice reminder
 */
export const scheduleDailyReminder = async (hour: number = 18, minute: number = 0): Promise<void> => {
  if (!isNative()) return;

  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    console.log('[Notifications] No permission for notifications');
    return;
  }

  try {
    // Cancel existing daily reminders first
    await cancelDailyReminders();

    // Schedule reminders for the next 30 days with varied messages
    const notifications: LocalNotificationSchema[] = [];

    for (let i = 0; i < 30; i++) {
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + i);
      scheduleDate.setHours(hour, minute, 0, 0);

      // Skip if the time has already passed today
      if (i === 0 && scheduleDate.getTime() < Date.now()) {
        continue;
      }

      const message = PRACTICE_REMINDERS[i % PRACTICE_REMINDERS.length];

      notifications.push({
        id: NOTIFICATION_IDS.DAILY_REMINDER_BASE + i,
        title: message.title,
        body: message.body,
        schedule: { at: scheduleDate },
        sound: 'default',
        actionTypeId: 'PRACTICE_REMINDER',
        extra: { type: 'daily_reminder' },
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`[Notifications] Scheduled ${notifications.length} daily reminders at ${hour}:${minute.toString().padStart(2, '0')}`);
    }

    // Save the reminder time
    localStorage.setItem(STORAGE_KEYS.REMINDER_TIME, JSON.stringify({ hour, minute }));
  } catch (error) {
    console.error('[Notifications] Error scheduling daily reminders:', error);
  }
};

/**
 * Cancel all daily reminders
 */
export const cancelDailyReminders = async (): Promise<void> => {
  if (!isNative()) return;

  try {
    const idsToCancel = [];
    for (let i = 0; i < 30; i++) {
      idsToCancel.push({ id: NOTIFICATION_IDS.DAILY_REMINDER_BASE + i });
    }
    await LocalNotifications.cancel({ notifications: idsToCancel });
    console.log('[Notifications] Cancelled daily reminders');
  } catch (error) {
    console.error('[Notifications] Error cancelling daily reminders:', error);
  }
};

/**
 * Schedule weekly challenge notifications
 */
export const scheduleWeeklyChallengeNotifications = async (): Promise<void> => {
  if (!isNative()) return;

  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) return;

  try {
    // Cancel existing challenge notifications
    await cancelWeeklyChallengeNotifications();

    const notifications: LocalNotificationSchema[] = [];
    const now = new Date();

    // Get the start of the current week (Monday)
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(9, 0, 0, 0);

    // Schedule for the next 4 weeks
    for (let week = 0; week < 4; week++) {
      // Monday - New challenges notification
      const newChallengesDate = new Date(monday);
      newChallengesDate.setDate(monday.getDate() + (week * 7));

      if (newChallengesDate.getTime() > Date.now()) {
        notifications.push({
          id: NOTIFICATION_IDS.WEEKLY_CHALLENGE_BASE + (week * 4),
          title: WEEKLY_CHALLENGE_MESSAGES[0].title,
          body: WEEKLY_CHALLENGE_MESSAGES[0].body,
          schedule: { at: newChallengesDate },
          sound: 'default',
          extra: { type: 'weekly_challenge_new' },
        });
      }

      // Wednesday - Mid-week reminder
      const midWeekDate = new Date(monday);
      midWeekDate.setDate(monday.getDate() + (week * 7) + 2);
      midWeekDate.setHours(12, 0, 0, 0);

      if (midWeekDate.getTime() > Date.now()) {
        notifications.push({
          id: NOTIFICATION_IDS.WEEKLY_CHALLENGE_BASE + (week * 4) + 1,
          title: WEEKLY_CHALLENGE_MESSAGES[1].title,
          body: WEEKLY_CHALLENGE_MESSAGES[1].body,
          schedule: { at: midWeekDate },
          sound: 'default',
          extra: { type: 'weekly_challenge_reminder' },
        });
      }

      // Friday - Progress update
      const fridayDate = new Date(monday);
      fridayDate.setDate(monday.getDate() + (week * 7) + 4);
      fridayDate.setHours(17, 0, 0, 0);

      if (fridayDate.getTime() > Date.now()) {
        notifications.push({
          id: NOTIFICATION_IDS.WEEKLY_CHALLENGE_BASE + (week * 4) + 2,
          title: WEEKLY_CHALLENGE_MESSAGES[2].title,
          body: WEEKLY_CHALLENGE_MESSAGES[2].body,
          schedule: { at: fridayDate },
          sound: 'default',
          extra: { type: 'weekly_challenge_progress' },
        });
      }

      // Sunday - Last day reminder
      const sundayDate = new Date(monday);
      sundayDate.setDate(monday.getDate() + (week * 7) + 6);
      sundayDate.setHours(10, 0, 0, 0);

      if (sundayDate.getTime() > Date.now()) {
        notifications.push({
          id: NOTIFICATION_IDS.WEEKLY_CHALLENGE_BASE + (week * 4) + 3,
          title: WEEKLY_CHALLENGE_MESSAGES[3].title,
          body: WEEKLY_CHALLENGE_MESSAGES[3].body,
          schedule: { at: sundayDate },
          sound: 'default',
          extra: { type: 'weekly_challenge_last_day' },
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`[Notifications] Scheduled ${notifications.length} weekly challenge notifications`);
    }
  } catch (error) {
    console.error('[Notifications] Error scheduling weekly challenge notifications:', error);
  }
};

/**
 * Cancel weekly challenge notifications
 */
export const cancelWeeklyChallengeNotifications = async (): Promise<void> => {
  if (!isNative()) return;

  try {
    const idsToCancel = [];
    for (let i = 0; i < 20; i++) {
      idsToCancel.push({ id: NOTIFICATION_IDS.WEEKLY_CHALLENGE_BASE + i });
    }
    await LocalNotifications.cancel({ notifications: idsToCancel });
    console.log('[Notifications] Cancelled weekly challenge notifications');
  } catch (error) {
    console.error('[Notifications] Error cancelling weekly challenge notifications:', error);
  }
};

/**
 * Send an immediate achievement notification
 */
export const sendAchievementNotification = async (
  type: keyof typeof ACHIEVEMENT_MESSAGES,
  data?: Record<string, string | number>
): Promise<void> => {
  if (!isNative()) return;

  const enabled = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENT_ALERTS) !== 'false';
  if (!enabled) return;

  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) return;

  try {
    const template = ACHIEVEMENT_MESSAGES[type];
    let title = template.title;
    let body = template.body;

    // Replace placeholders with actual data
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        body = body.replace(`{${key}}`, String(value));
        title = title.replace(`{${key}}`, String(value));
      });
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIFICATION_IDS.ACHIEVEMENT_BASE + Date.now() % 1000,
        title,
        body,
        schedule: { at: new Date(Date.now() + 1000) }, // 1 second delay
        sound: 'default',
        extra: { type: 'achievement', achievementType: type },
      }],
    });

    console.log(`[Notifications] Sent achievement notification: ${type}`);
  } catch (error) {
    console.error('[Notifications] Error sending achievement notification:', error);
  }
};

/**
 * Schedule streak reminder (sent if user hasn't practiced by evening)
 */
export const scheduleStreakReminder = async (currentStreak: number): Promise<void> => {
  if (!isNative() || currentStreak === 0) return;

  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) return;

  try {
    // Cancel existing streak reminder
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.STREAK_REMINDER }] });

    // Schedule for 8 PM tonight
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0);

    // If it's already past 8 PM, don't schedule
    if (reminderTime.getTime() < Date.now()) return;

    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIFICATION_IDS.STREAK_REMINDER,
        title: `Don't Lose Your ${currentStreak}-Day Streak! 🔥`,
        body: `You've practiced for ${currentStreak} days in a row. A quick session tonight will keep it alive!`,
        schedule: { at: reminderTime },
        sound: 'default',
        extra: { type: 'streak_reminder', streak: currentStreak },
      }],
    });

    console.log(`[Notifications] Scheduled streak reminder for ${currentStreak}-day streak`);
  } catch (error) {
    console.error('[Notifications] Error scheduling streak reminder:', error);
  }
};

/**
 * Cancel streak reminder (call when user practices)
 */
export const cancelStreakReminder = async (): Promise<void> => {
  if (!isNative()) return;

  try {
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.STREAK_REMINDER }] });
    console.log('[Notifications] Cancelled streak reminder');
  } catch (error) {
    console.error('[Notifications] Error cancelling streak reminder:', error);
  }
};

/**
 * Initialize all notifications based on user settings
 */
export const initializeNotifications = async (): Promise<void> => {
  if (!isNative()) return;

  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    console.log('[Notifications] No permission, skipping initialization');
    return;
  }

  // Check if practice reminders are enabled (default: true)
  const practiceRemindersEnabled = localStorage.getItem(STORAGE_KEYS.PRACTICE_REMINDERS) !== 'false';
  const weeklyProgressEnabled = localStorage.getItem(STORAGE_KEYS.WEEKLY_CHALLENGES) !== 'false';

  // Get saved reminder time or use default (6 PM)
  const savedTime = localStorage.getItem(STORAGE_KEYS.REMINDER_TIME);
  const { hour, minute } = savedTime ? JSON.parse(savedTime) : { hour: 18, minute: 0 };

  if (practiceRemindersEnabled) {
    await scheduleDailyReminder(hour, minute);
  }

  if (weeklyProgressEnabled) {
    await scheduleWeeklyChallengeNotifications();
  }

  console.log('[Notifications] Initialization complete');
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (settings: {
  practiceReminders?: boolean;
  achievementAlerts?: boolean;
  weeklyProgress?: boolean;
  reminderHour?: number;
  reminderMinute?: number;
}): Promise<void> => {
  if (settings.practiceReminders !== undefined) {
    localStorage.setItem(STORAGE_KEYS.PRACTICE_REMINDERS, String(settings.practiceReminders));

    if (settings.practiceReminders) {
      const hour = settings.reminderHour ?? 18;
      const minute = settings.reminderMinute ?? 0;
      await scheduleDailyReminder(hour, minute);
    } else {
      await cancelDailyReminders();
    }
  }

  if (settings.achievementAlerts !== undefined) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENT_ALERTS, String(settings.achievementAlerts));
  }

  if (settings.weeklyProgress !== undefined) {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_CHALLENGES, String(settings.weeklyProgress));

    if (settings.weeklyProgress) {
      await scheduleWeeklyChallengeNotifications();
    } else {
      await cancelWeeklyChallengeNotifications();
    }
  }

  if (settings.reminderHour !== undefined && settings.reminderMinute !== undefined) {
    const practiceRemindersEnabled = localStorage.getItem(STORAGE_KEYS.PRACTICE_REMINDERS) !== 'false';
    if (practiceRemindersEnabled) {
      await scheduleDailyReminder(settings.reminderHour, settings.reminderMinute);
    }
  }

  console.log('[Notifications] Settings updated:', settings);
};

/**
 * Get current notification settings
 */
export const getNotificationSettings = (): {
  practiceReminders: boolean;
  achievementAlerts: boolean;
  weeklyProgress: boolean;
  reminderHour: number;
  reminderMinute: number;
} => {
  const savedTime = localStorage.getItem(STORAGE_KEYS.REMINDER_TIME);
  const { hour, minute } = savedTime ? JSON.parse(savedTime) : { hour: 18, minute: 0 };

  return {
    practiceReminders: localStorage.getItem(STORAGE_KEYS.PRACTICE_REMINDERS) !== 'false',
    achievementAlerts: localStorage.getItem(STORAGE_KEYS.ACHIEVEMENT_ALERTS) !== 'false',
    weeklyProgress: localStorage.getItem(STORAGE_KEYS.WEEKLY_CHALLENGES) !== 'false',
    reminderHour: hour,
    reminderMinute: minute,
  };
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  if (!isNative()) return;

  try {
    await LocalNotifications.cancel({ notifications: [] });
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
    }
    console.log('[Notifications] Cancelled all notifications');
  } catch (error) {
    console.error('[Notifications] Error cancelling all notifications:', error);
  }
};

/**
 * Get pending notifications (for debugging)
 */
export const getPendingNotifications = async () => {
  if (!isNative()) return [];

  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications;
  } catch (error) {
    console.error('[Notifications] Error getting pending notifications:', error);
    return [];
  }
};

// ========== Notification Categories & Hook ==========

export type NotificationCategory =
  | 'practice_reminder'
  | 'streak_reminder'
  | 'achievement'
  | 'weekly_challenge'
  | 'social'
  | 'tip'
  | 'song_suggestion';

interface NotificationSettingsState {
  enabled: boolean;
  practiceReminders: boolean;
  practiceReminderTime: string;
  streakReminders: boolean;
  challengeNotifications: boolean;
  songSuggestions: boolean;
  achievementNotifications: boolean;
  socialNotifications: boolean;
  tipNotifications: boolean;
}

const HOOK_STORAGE_KEYS = {
  ENABLED: 'strummy_notifications_enabled',
  PRACTICE_REMINDERS: 'strummy_practice_reminders',
  PRACTICE_REMINDER_TIME: 'strummy_reminder_time',
  STREAK_REMINDERS: 'strummy_streak_reminders',
  CHALLENGE_NOTIFICATIONS: 'strummy_challenge_notifications',
  SONG_SUGGESTIONS: 'strummy_song_suggestions',
  ACHIEVEMENT_NOTIFICATIONS: 'strummy_achievement_alerts',
  SOCIAL_NOTIFICATIONS: 'strummy_social_notifications',
  TIP_NOTIFICATIONS: 'strummy_tip_notifications',
};

const loadSettingsFromStorage = (): NotificationSettingsState => {
  const savedTime = localStorage.getItem(HOOK_STORAGE_KEYS.PRACTICE_REMINDER_TIME);
  const { hour, minute } = savedTime ? JSON.parse(savedTime) : { hour: 18, minute: 0 };

  return {
    enabled: localStorage.getItem(HOOK_STORAGE_KEYS.ENABLED) !== 'false',
    practiceReminders: localStorage.getItem(HOOK_STORAGE_KEYS.PRACTICE_REMINDERS) !== 'false',
    practiceReminderTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    streakReminders: localStorage.getItem(HOOK_STORAGE_KEYS.STREAK_REMINDERS) !== 'false',
    challengeNotifications: localStorage.getItem(HOOK_STORAGE_KEYS.CHALLENGE_NOTIFICATIONS) !== 'false',
    songSuggestions: localStorage.getItem(HOOK_STORAGE_KEYS.SONG_SUGGESTIONS) !== 'false',
    achievementNotifications: localStorage.getItem(HOOK_STORAGE_KEYS.ACHIEVEMENT_NOTIFICATIONS) !== 'false',
    socialNotifications: localStorage.getItem(HOOK_STORAGE_KEYS.SOCIAL_NOTIFICATIONS) !== 'false',
    tipNotifications: localStorage.getItem(HOOK_STORAGE_KEYS.TIP_NOTIFICATIONS) !== 'false',
  };
};

/**
 * React hook for managing notification settings in Settings page
 */
export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettingsState>(loadSettingsFromStorage);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const native = isNative();

  useEffect(() => {
    if (native) {
      checkNotificationPermission().then(setPermissionGranted);
    }
  }, [native]);

  const updateSettings = useCallback((updates: Partial<NotificationSettingsState>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };

      // Persist each setting
      if (updates.enabled !== undefined) {
        localStorage.setItem(HOOK_STORAGE_KEYS.ENABLED, String(next.enabled));
      }
      if (updates.practiceReminders !== undefined) {
        localStorage.setItem(HOOK_STORAGE_KEYS.PRACTICE_REMINDERS, String(next.practiceReminders));
        if (next.practiceReminders && next.enabled) {
          const [h, m] = next.practiceReminderTime.split(':').map(Number);
          scheduleDailyReminder(h, m);
        } else {
          cancelDailyReminders();
        }
      }
      if (updates.practiceReminderTime !== undefined) {
        const [h, m] = next.practiceReminderTime.split(':').map(Number);
        localStorage.setItem(HOOK_STORAGE_KEYS.PRACTICE_REMINDER_TIME, JSON.stringify({ hour: h, minute: m }));
        if (next.practiceReminders && next.enabled) {
          scheduleDailyReminder(h, m);
        }
      }
      if (updates.streakReminders !== undefined) {
        localStorage.setItem(HOOK_STORAGE_KEYS.STREAK_REMINDERS, String(next.streakReminders));
      }
      if (updates.challengeNotifications !== undefined) {
        localStorage.setItem(HOOK_STORAGE_KEYS.CHALLENGE_NOTIFICATIONS, String(next.challengeNotifications));
        if (next.challengeNotifications && next.enabled) {
          scheduleWeeklyChallengeNotifications();
        } else {
          cancelWeeklyChallengeNotifications();
        }
      }
      if (updates.songSuggestions !== undefined) {
        localStorage.setItem(HOOK_STORAGE_KEYS.SONG_SUGGESTIONS, String(next.songSuggestions));
      }
      if (updates.achievementNotifications !== undefined) {
        localStorage.setItem(HOOK_STORAGE_KEYS.ACHIEVEMENT_NOTIFICATIONS, String(next.achievementNotifications));
      }
      if (updates.socialNotifications !== undefined) {
        localStorage.setItem(HOOK_STORAGE_KEYS.SOCIAL_NOTIFICATIONS, String(next.socialNotifications));
      }
      if (updates.tipNotifications !== undefined) {
        localStorage.setItem(HOOK_STORAGE_KEYS.TIP_NOTIFICATIONS, String(next.tipNotifications));
      }

      // If master toggle is turned off, cancel all
      if (updates.enabled === false) {
        cancelAllNotifications();
      }

      return next;
    });
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

  const sendTestNotification = useCallback(async (category: NotificationCategory) => {
    if (!native) return;
    const granted = await checkNotificationPermission();
    if (!granted) return;

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now() % 100000,
          title: 'Test Notification',
          body: `This is a test ${category.replace(/_/g, ' ')} notification from Strummy!`,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'test', category },
        }],
      });
    } catch (error) {
      console.error('[Notifications] Error sending test notification:', error);
    }
  }, [native]);

  return {
    settings,
    updateSettings,
    permissionGranted,
    requestPermission,
    sendTestNotification,
    isNative: native,
  };
};
