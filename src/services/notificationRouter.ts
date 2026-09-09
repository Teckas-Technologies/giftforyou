/**
 * Notification Router
 *
 * Single source of truth for mapping a notification (in-app row OR push payload)
 * to a target screen + params. Used by both:
 *   - App.js push tap handler (lock-screen / banner taps)
 *   - NotificationsScreen in-app tap handler (bell row taps)
 *
 * Keeps tap behavior identical across surfaces.
 */

export interface NotificationRouteInput {
  type: string;
  data?: { contactId?: string; eventId?: string; [key: string]: any };
  related_id?: string;
  eventId?: string;
}

export interface NotificationRoute {
  screen: string;
  params: Record<string, any>;
}

export function getRouteForNotification(
  notif: NotificationRouteInput | null | undefined,
): NotificationRoute | null {
  if (!notif || !notif.type) return null;

  const { type, data = {}, related_id: relatedId } = notif;

  switch (type) {
    case 'invitation_accepted':
    case 'friend_request_accepted':
    case 'circle_added':
    case 'new_friend':
      // ContactDetailScreen's `contactId` param is actually the gift_circles row id
      // (getCircle hits /api/circles/:id → GiftCircle.findById). related_id stores
      // exactly that for these notification types — use it as the param.
      return {
        screen: 'ContactDetail',
        params: { contactId: relatedId || data.contactId || null },
      };

    case 'friend_request':
      return { screen: 'Notifications', params: {} };

    case 'friend_request_declined':
      // The pending request row is deleted on decline, so there's no contact
      // to open. Steer the sender toward finding other people instead.
      return { screen: 'Discover', params: {} };

    case 'event_reminder':
      return {
        screen: 'EventDetail',
        params: { eventId: relatedId || data.eventId || notif.eventId || null },
      };

    case 'profile_incomplete':
      return { screen: 'MainApp', params: { screen: 'Profile' } };

    case 'love_note_received':
      // The note text is already shown in the notification row/body — just
      // land on the bell screen rather than a dedicated detail screen.
      return { screen: 'Notifications', params: {} };

    default:
      return null;
  }
}
