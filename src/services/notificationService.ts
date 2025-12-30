/**
 * Notification Service
 * Handles all notification-related operations:
 * - Requesting permissions
 * - Scheduling daily reminders
 * - Canceling notifications
 * - Persisting settings to AsyncStorage
 */

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY = "notif_settings_v1";

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM" (24-hour format)
  days: string[]; // Array of days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
}

// Default settings
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  time: "09:00",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Daily
};

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("daily-reminder", {
        name: "Daily Yoga Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#5B8C6A",
      });
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Load notification settings from AsyncStorage
 */
export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error loading notification settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save notification settings to AsyncStorage
 */
export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving notification settings:", error);
    throw error;
  }
}

/**
 * Schedule a daily notification at the specified time
 */
export async function scheduleDailyNotification(
  settings: NotificationSettings
): Promise<void> {
  try {
    // Cancel all existing notifications first
    await cancelAllNotifications();

    if (!settings.enabled) {
      return;
    }

    // Parse the time
    const [hourStr, minuteStr] = settings.time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Determine if we're doing daily or specific days
    const isDailyReminder = settings.days.length === 7;

    if (isDailyReminder) {
      // Schedule a daily notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time for Your Yoga Practice 🧘",
          body: "Take a moment to breathe, stretch, and center yourself.",
          sound: "default",
          data: { type: "daily_reminder" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          repeats: true,
        },
      });
    } else {
      // Schedule for specific days of the week
      const dayMap: { [key: string]: number } = {
        Sun: 1,
        Mon: 2,
        Tue: 3,
        Wed: 4,
        Thu: 5,
        Fri: 6,
        Sat: 7,
      };

      for (const day of settings.days) {
        const weekday = dayMap[day];
        if (weekday) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Time for Your Yoga Practice 🧘",
              body: "Take a moment to breathe, stretch, and center yourself.",
              sound: "default",
              data: { type: "daily_reminder", day },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday,
              hour,
              minute,
              repeats: true,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw error;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling notifications:", error);
    throw error;
  }
}

/**
 * Get all scheduled notifications (useful for debugging)
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}
