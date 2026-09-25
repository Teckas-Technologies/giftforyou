/**
 * Push Notification Service
 * Handles push notification registration, permissions, and local notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';
import { registerPushToken } from './api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // drop-down banner like WhatsApp
    shouldShowList: true, // appears in the notification panel
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications
 * Returns the Expo push token
 */
export async function registerForPushNotifications() {
  console.log('registerForPushNotifications: Starting...');

  // Must be a physical device
  if (!Device.isDevice) {
    console.log('registerForPushNotifications: Not a physical device - skipping');
    return null;
  }
  console.log('registerForPushNotifications: Physical device:', Device.brand, Device.modelName);

  // Check/request permissions
  let finalStatus;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('registerForPushNotifications: Existing permission:', existingStatus);
    finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('registerForPushNotifications: Requested permission:', status);
    }
  } catch (permError: any) {
    console.log('registerForPushNotifications: Permission error:', permError.message);
    return null;
  }

  if (finalStatus !== 'granted') {
    console.log('registerForPushNotifications: Permission denied');
    return null;
  }

  // Get projectId - read from expo config (set by `npx eas init`)
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.manifest?.extra?.eas?.projectId ||
    Constants.manifest2?.extra?.expoClient?.extra?.eas?.projectId;

  console.log('registerForPushNotifications: projectId:', projectId);
  console.log(
    'registerForPushNotifications: expoConfig:',
    JSON.stringify(Constants.expoConfig?.extra),
  );

  // Get Expo push token
  let token = null;
  try {
    const response = await Notifications.getExpoPushTokenAsync({ projectId });
    token = response.data;
    console.log('registerForPushNotifications: Got token:', token);
  } catch (tokenError: any) {
    console.log('registerForPushNotifications: Token error:', tokenError.message);
    return null;
  }

  // Register token with backend (separate try-catch)
  if (token) {
    try {
      console.log('registerForPushNotifications: Registering with backend...');
      const result = await registerPushToken(token);
      console.log('registerForPushNotifications: Backend result:', result);
    } catch (apiError: any) {
      console.log('registerForPushNotifications: API error:', apiError.message);
      // Token obtained but API failed - still return token
    }
  }

  // Android-specific notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ca9ad6',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Event Reminders',
      description: 'Notifications for upcoming events and birthdays',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ca9ad6',
    });
  }

  return token;
}

interface ScheduleTrigger {
  date?: Date;
  seconds?: number;
  repeats?: boolean;
}

interface ScheduleLocalNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger?: Date | ScheduleTrigger | null;
  channelId?: string;
}

/**
 * Schedule a local notification.
 * `trigger`:
 *   - null/undefined → fires immediately
 *   - Date instance → fires at that exact time
 *   - { seconds: N }  → fires N seconds from now
 */
export async function scheduleLocalNotification({
  title,
  body,
  data = {},
  trigger = null,
  channelId = 'default',
}: ScheduleLocalNotificationOptions) {
  try {
    let normalizedTrigger: Notifications.NotificationTriggerInput | null = null;
    if (trigger instanceof Date) {
      normalizedTrigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId,
      };
    } else if (trigger?.date instanceof Date) {
      normalizedTrigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger.date,
        channelId,
      };
    } else if (typeof trigger?.seconds === 'number') {
      normalizedTrigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: trigger.seconds,
        repeats: !!trigger.repeats,
        channelId,
      };
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: normalizedTrigger,
    });
    return id;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return null;
  }
}

interface ScheduleEventReminderOptions {
  eventId: string;
  eventTitle: string;
  eventDate: string | number | Date;
  daysBefore?: number;
}

/**
 * Schedule an event reminder notification.
 * Returns the notification id so we can cancel it later if the event is deleted.
 */
export async function scheduleEventReminder({
  eventId,
  eventTitle,
  eventDate,
  daysBefore = 1,
}: ScheduleEventReminderOptions) {
  const reminderDate = new Date(eventDate);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);
  reminderDate.setHours(9, 0, 0, 0); // 9 AM local time

  // Don't schedule if reminder date is in the past
  if (reminderDate <= new Date()) {
    return null;
  }

  return scheduleLocalNotification({
    title: `Upcoming: ${eventTitle}`,
    body:
      daysBefore === 0
        ? `${eventTitle} is today!`
        : `${eventTitle} is in ${daysBefore} day${daysBefore > 1 ? 's' : ''}`,
    data: { eventId, type: 'event_reminder' },
    trigger: reminderDate,
    channelId: 'reminders',
  });
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error canceling all notifications:', error);
  }
}

// scheduleEventReminder() returns a fresh, unique local-notification id per
// call, but that id was never saved anywhere — a created event's reminders
// were fire-and-forget, with no way to find and cancel them again later.
// Deleting the event only removed it from the server; the already-scheduled
// notification(s) stayed on the device and fired anyway for an event that
// no longer existed. This maps eventId -> the notification ids scheduled
// for it, so they can be found and cancelled on delete.
const EVENT_NOTIFICATION_IDS_KEY_PREFIX = '@giftbox_event_notification_ids';

export async function saveEventNotificationIds(eventId: string, notificationIds: string[]) {
  try {
    await AsyncStorage.setItem(
      `${EVENT_NOTIFICATION_IDS_KEY_PREFIX}:${eventId}`,
      JSON.stringify(notificationIds),
    );
  } catch (error) {
    console.log('Error saving event notification ids:', error);
  }
}

export async function cancelEventNotifications(eventId: string) {
  const key = `${EVENT_NOTIFICATION_IDS_KEY_PREFIX}:${eventId}`;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const notificationIds: string[] = JSON.parse(raw);
    await Promise.all(notificationIds.map((id) => cancelNotification(id)));
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log('Error cancelling event notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Whether notification permission is currently granted at the OS level,
 * without triggering the permission prompt (use
 * registerForPushNotifications for that). Once a user taps "Don't Allow",
 * neither iOS nor Android will show that prompt again — the only way back
 * is the native Settings app, which openNotificationSettings() below
 * deep-links to.
 */
export async function getNotificationPermissionGranted() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Error checking notification permission:', error);
    // Fail open: an error here shouldn't be the reason toggles look disabled.
    return true;
  }
}

/**
 * Deep-links into this app's native OS settings screen (iOS: Settings >
 * Thoughtfully; Android: App info > Notifications) so a user who denied
 * the permission prompt has a way to grant it after the fact.
 */
export function openNotificationSettings() {
  Linking.openSettings();
}

/**
 * Set the home-screen app icon badge count. Works on iOS always; on Android
 * it depends on the launcher supporting icon badges (many do — Samsung,
 * Pixel, etc. — some stock/AOSP launchers don't, in which case this just
 * silently has no visible effect, not an error).
 */
export async function setBadgeCount(count: number) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.log('Error setting badge count:', error);
  }
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (event: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (event: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export default {
  registerForPushNotifications,
  scheduleLocalNotification,
  scheduleEventReminder,
  cancelNotification,
  cancelAllNotifications,
  saveEventNotificationIds,
  cancelEventNotifications,
  getScheduledNotifications,
  getNotificationPermissionGranted,
  openNotificationSettings,
  setBadgeCount,
  addNotificationReceivedListener,
  addNotificationResponseListener,
};
