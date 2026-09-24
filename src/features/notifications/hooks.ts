import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getPendingRequests,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../../services/api';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: Date;
  related_id: string | null;
  related_type: string | null;
  data: any;
}

export interface NotificationsData {
  notifications: AppNotification[];
  incomingRequests: any[];
}

async function fetchNotificationsData(): Promise<NotificationsData> {
  const [notifResp, requestsResp] = await Promise.all([
    getNotifications().catch(() => ({ notifications: [] })),
    getPendingRequests().catch(() => ({ incoming: [] })),
  ]);

  // `friend_request` notifications are intentionally excluded from the
  // general list: the same request is already shown as an actionable
  // Accept/Decline card in the "Friend Requests" section above, so a
  // generic row here is a duplicate. Covers any rows created before the
  // backend stopped emitting them.
  const notificationsList = (notifResp.notifications || []).filter(
    (n: any) => n.type !== 'friend_request',
  );

  const notifications: AppNotification[] = notificationsList.map((n: any) => ({
    id: n.id || n._id,
    type: n.type,
    title: n.title,
    body: n.body || n.message,
    is_read: n.isRead || n.is_read,
    created_at: new Date(n.createdAt || n.created_at),
    related_id: n.relatedId || n.related_id || null,
    related_type: n.relatedType || n.related_type || null,
    data: n.data || {},
  }));

  return { notifications, incomingRequests: requestsResp.incoming || [] };
}

/**
 * Notifications + pending friend requests — the single hook the screen
 * reads it through. Replaces the old manual useFocusEffect + `silent`-
 * refetch + setInterval dance.
 */
export function useNotificationsData() {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotificationsData,
    refetchInterval: 12_000,
  });
}

export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

// Lightweight, app-wide poll (used to drive the home-screen app icon badge —
// see AppNavigator) — deliberately a separate, cheaper query from
// useNotificationsData above rather than reusing its full fetch+12s poll,
// since this one needs to run everywhere in the app, not just while the
// Notifications screen is open.
export function useUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => getUnreadCount().then((res: any) => res.count || 0),
    refetchInterval: 30_000,
    enabled,
  });
}

/**
 * Mutations for this screen — each makes the API call, then patches the
 * shared cache the same way the old setNotifications/setIncomingRequests
 * updaters did (see usePatchCase in casearc-mobile for the pattern this
 * mirrors).
 */
export function useNotificationActions() {
  const queryClient = useQueryClient();

  const patch = (updater: (prev: NotificationsData) => NotificationsData) => {
    queryClient.setQueryData<NotificationsData>(
      NOTIFICATIONS_QUERY_KEY,
      (prev: NotificationsData | undefined) => (prev ? updater(prev) : prev),
    );
  };

  return {
    acceptRequest: async (requestId: string) => {
      await acceptFriendRequest(requestId);
      patch((prev) => ({
        ...prev,
        incomingRequests: prev.incomingRequests.filter((r: any) => r.id !== requestId),
      }));
    },
    rejectRequest: async (requestId: string) => {
      await rejectFriendRequest(requestId);
      patch((prev) => ({
        ...prev,
        incomingRequests: prev.incomingRequests.filter((r: any) => r.id !== requestId),
      }));
    },
    markAllRead: async () => {
      await markAllNotificationsRead();
      patch((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
      }));
    },
    markRead: async (id: string) => {
      await markNotificationRead(id);
      patch((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      }));
    },
    deleteOne: async (id: string) => {
      await deleteNotification(id);
      patch((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== id),
      }));
    },
  };
}
