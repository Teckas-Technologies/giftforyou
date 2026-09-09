import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getUpcomingEvents, getProfile } from '../../services/api';

export const HOME_DASHBOARD_QUERY_KEY = ['home', 'dashboard'];

export interface HomeDashboardStats {
  contactsCount: number;
  upcomingEventsCount: number;
  birthdaysThisMonth: number;
}

export interface HomeDashboard {
  userName: string;
  stats: HomeDashboardStats;
  // Shape comes from the untyped api.js response — not narrowed further here.
  upcomingEvents: any[];
}

async function fetchHomeDashboard(): Promise<HomeDashboard> {
  const [profileRes, statsRes, eventsRes] = await Promise.all([
    getProfile().catch(() => ({ user: { name: 'User' } })),
    getDashboardStats().catch(() => ({
      contactsCount: 0,
      upcomingEventsCount: 0,
      birthdaysThisMonth: 0,
    })),
    getUpcomingEvents(5).catch(() => ({ events: [] })),
  ]);

  return {
    userName: profileRes?.user?.name ? profileRes.user.name.split(' ')[0] : '',
    stats: {
      contactsCount: statsRes?.contactsCount || 0,
      upcomingEventsCount: statsRes?.upcomingEventsCount || 0,
      birthdaysThisMonth: statsRes?.birthdaysThisMonth || 0,
    },
    upcomingEvents: eventsRes?.events || [],
  };
}

/**
 * Home's aggregate dashboard (profile name, stats, upcoming events) — the
 * single hook the screen reads it through.
 *
 * Replaces the old manual useFocusEffect + `silent`-refetch + setInterval
 * dance: React Query's own `staleTime`/AppState-focus refetch (see
 * src/lib/queryClient.ts) means revisiting this tab no longer re-triggers a
 * fetch — and hides already-loaded content behind a spinner — unless the
 * data has actually gone stale. `refetchInterval` keeps it near-live while
 * the app is open, matching the old 30s poll.
 */
export function useHomeDashboard() {
  return useQuery({
    queryKey: HOME_DASHBOARD_QUERY_KEY,
    queryFn: fetchHomeDashboard,
    refetchInterval: 30_000,
  });
}
