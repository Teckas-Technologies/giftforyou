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
  // Notification text and time — used to open a love note on its own screen
  body?: string;
  created_at?: string | Date;
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

    case 'love_note_received': {
      // Opens the animated love note screen. Push payloads carry the text
      // in data.noteText (older pushes: the banner body, passed as `body`);
      // in-app rows carry it in data.noteText / body.
      const noteText = data.noteText || notif.body;
      if (!noteText) return { screen: 'Notifications', params: {} };
      const sentAt = data.sentAt || notif.created_at;
      return {
        screen: 'LoveNoteReceived',
        params: {
          senderName: data.senderName || 'A friend',
          // Sender's user id, so "Send a love note back" can preselect them.
          // Pushes carry data.senderId; in-app rows store it as related_id.
          senderId: data.senderId || relatedId || null,
          noteText,
          // params must be plain values — Date objects become ISO strings
          sentAt: sentAt instanceof Date ? sentAt.toISOString() : sentAt || null,
        },
      };
    }

    case 'preference_updated':
      // related_id is the recipient's own gift_circles row id (see backend
      // Notification.createPreferenceUpdated) — same contract as the
      // invitation/friend cases above.
      return {
        screen: 'ContactDetail',
        params: { contactId: relatedId || data.contactId || null },
      };

    default:
      return null;
  }
}
