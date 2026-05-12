/**
 * Push Notification Service
 * Handles push notification registration, permissions, and local notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { registerPushToken } from './api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // drop-down banner like WhatsApp
    shouldShowList: true,    // appears in the notification panel
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
  } catch (permError) {
    console.log('registerForPushNotifications: Permission error:', permError.message);
    return null;
  }

  if (finalStatus !== 'granted') {
    console.log('registerForPushNotifications: Permission denied');
    return null;
  }

  // Get projectId - SDK 54 compatible with hardcoded fallback for release builds
  const projectId = Constants.expoConfig?.extra?.eas?.projectId
    || Constants.manifest?.extra?.eas?.projectId
    || Constants.manifest2?.extra?.expoClient?.extra?.eas?.projectId
    || '4b765adc-af4c-4925-bad7-debcb3ecfb98';

  console.log('registerForPushNotifications: projectId:', projectId);
  console.log('registerForPushNotifications: expoConfig:', JSON.stringify(Constants.expoConfig?.extra));

  // Get Expo push token
  let token = null;
  try {
    const response = await Notifications.getExpoPushTokenAsync({ projectId });
    token = response.data;
    console.log('registerForPushNotifications: Got token:', token);
  } catch (tokenError) {
    console.log('registerForPushNotifications: Token error:', tokenError.message);
    return null;
  }

  // Register token with backend (separate try-catch)
  if (token) {
    try {
      console.log('registerForPushNotifications: Registering with backend...');
      const result = await registerPushToken(token);
      console.log('registerForPushNotifications: Backend result:', result);
    } catch (apiError) {
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
}) {
  try {
    let normalizedTrigger = null;
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

/**
 * Schedule an event reminder notification.
 * Returns the notification id so we can cancel it later if the event is deleted.
 */
export async function scheduleEventReminder({
  eventId,
  eventTitle,
  eventDate,
  daysBefore = 1,
}) {
  const reminderDate = new Date(eventDate);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);
  reminderDate.setHours(9, 0, 0, 0); // 9 AM local time

  // Don't schedule if reminder date is in the past
  if (reminderDate <= new Date()) {
    return null;
  }

  return scheduleLocalNotification({
    title: `Upcoming: ${eventTitle}`,
    body: daysBefore === 0
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
export async function cancelNotification(notificationId) {
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
 * Set badge count (iOS)
 */
export async function setBadgeCount(count) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.log('Error setting badge count:', error);
  }
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export default {
  registerForPushNotifications,
  scheduleLocalNotification,
  scheduleEventReminder,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  setBadgeCount,
  addNotificationReceivedListener,
  addNotificationResponseListener,
};
