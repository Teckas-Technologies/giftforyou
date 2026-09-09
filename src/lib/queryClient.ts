import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * React Query watches the browser's window focus by default, which does not
 * exist on a phone — so it never considered anything refocused, and a
 * screen kept showing whatever was cached from before the app was
 * backgrounded. Wiring this to AppState makes "coming back to the app"
 * mean something, so a query that's gone stale while backgrounded refreshes
 * automatically instead of waiting for a remount.
 *
 * Deliberately NOT wired to per-screen navigation focus (React Navigation's
 * useFocusEffect) — that would refetch on every tab switch, which is the
 * exact spinner-flash behavior this migration is meant to get away from.
 * `staleTime` below governs in-app refetching instead.
 */
AppState.addEventListener('change', (status: AppStateStatus) => {
  focusManager.setFocused(status === 'active');
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
