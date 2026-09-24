import { useCallback, useState } from 'react';

/**
 * Wraps a refetch function so the pull-to-refresh spinner stays visible for
 * at least `minMs` before disappearing. Without this, when a refetch
 * resolves very fast (e.g. served from cache, or a quick network response),
 * iOS's native RefreshControl can visually get "stuck" mid-animation — the
 * spinner doesn't get enough time to actually render/settle before React
 * Native tells it to stop, a known platform quirk (not specific to this
 * app). Enforcing a small floor gives the native animation room to
 * complete cleanly every time.
 */
export function useMinDurationRefresh(refetch: () => Promise<any> | void, minMs = 400) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const start = Date.now();
    try {
      await refetch();
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < minMs) {
        await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
      }
      setRefreshing(false);
    }
  }, [refetch, minMs]);

  return { refreshing, onRefresh };
}
