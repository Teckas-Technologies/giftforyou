import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getUpcomingEvents, getProfile } from '../../services/api';

// Shared prefix so EventDetailScreen's queryClient.invalidateQueries({
// queryKey: HOME_DASHBOARD_QUERY_KEY }) still invalidates all three queries
// below via React Query's prefix matching, without needing to know they're
// now split.
export const HOME_DASHBOARD_QUERY_KEY = ['home', 'dashboard'];

export interface HomeDashboardStats {
  contactsCount: number;
  upcomingEventsCount: number;
  birthdaysThisMonth: number;
}

const DEFAULT_STATS: HomeDashboardStats = {
  contactsCount: 0,
  upcomingEventsCount: 0,
  birthdaysThisMonth: 0,
};

/**
 * Home's dashboard used to be one combined fetch (profile + stats + events
 * via Promise.all) behind a single loading flag. On a slow/flaky connection
 * that meant the WHOLE screen — including stats that came back in
 * milliseconds — stayed on skeletons until whichever of the three calls was
 * slowest finished or hit its 15s network timeout (see services/api.ts).
 * Split into independent queries so each section renders as soon as its own
 * data is ready instead of waiting on the slowest one.
 */
export function useHomeName() {
  return useQuery({
    queryKey: [...HOME_DASHBOARD_QUERY_KEY, 'profile'],
    queryFn: async () => {
      const res = await getProfile().catch(() => ({ user: { name: '' } }));
      return res?.user?.name ? res.user.name.split(' ')[0] : '';
    },
    refetchInterval: 30_000,
  });
}

export function useHomeStats() {
  return useQuery({
    queryKey: [...HOME_DASHBOARD_QUERY_KEY, 'stats'],
    queryFn: async () => {
      const res = await getDashboardStats().catch(() => null);
      return {
        contactsCount: res?.contactsCount || 0,
        upcomingEventsCount: res?.upcomingEventsCount || 0,
        birthdaysThisMonth: res?.birthdaysThisMonth || 0,
      };
    },
    refetchInterval: 30_000,
  });
}

export function useHomeUpcomingEvents() {
  return useQuery({
    // Shape comes from the untyped api.js response — not narrowed further here.
    queryKey: [...HOME_DASHBOARD_QUERY_KEY, 'events'],
    queryFn: async (): Promise<any[]> => {
      const res = await getUpcomingEvents(5).catch(() => ({ events: [] }));
      return res?.events || [];
    },
    refetchInterval: 30_000,
  });
}

export { DEFAULT_STATS };
