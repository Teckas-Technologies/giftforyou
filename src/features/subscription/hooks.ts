import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlanStatus } from '../../services/api';

export const PLAN_STATUS_QUERY_KEY = ['planStatus'];

export interface PlanStatus {
  plan: string;
  planExpiresAt: string | null;
  organizationName: string | null;
  contactLimit: number | null;
  usedContactSlots: number;
  hasFreeContactSlot: boolean;
}

/**
 * Cached plan/contact-slot status, so screens that gate an action on the
 * free-plan contact limit (Invitations, Discover) can check it locally and
 * show the upgrade prompt immediately on tap — no spinner, no waiting on a
 * request that's only going to come back 403 anyway. The real send/add
 * endpoints still enforce the limit server-side regardless (this cached
 * copy can go briefly stale between renders), so this is purely a UX
 * shortcut, not a replacement for that check.
 */
export function usePlanStatus() {
  return useQuery({
    queryKey: PLAN_STATUS_QUERY_KEY,
    queryFn: (): Promise<PlanStatus> => getPlanStatus(),
    staleTime: 30_000,
  });
}

/**
 * Call after any action that consumes a contact slot (sending an
 * invitation, adding a friend) so the cached hasFreeContactSlot check is
 * accurate on the very next tap instead of waiting out staleTime.
 */
export function useInvalidatePlanStatus() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: PLAN_STATUS_QUERY_KEY });
}
