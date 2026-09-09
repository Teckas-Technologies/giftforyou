import { useQuery } from '@tanstack/react-query';
import { getInvitations } from '../../services/api';

export const INVITATIONS_QUERY_KEY = ['invitations'];

export interface Invitation {
  id: string;
  email: string;
  name: string;
  status: string;
  sent_at: Date;
  completed_at: Date | null;
  relationship: string;
  token: string | null;
  inviteLink: string | null;
}

async function fetchInvitations(): Promise<Invitation[]> {
  const response = await getInvitations();
  const invitationsList = response.invitations || [];

  return invitationsList.map((inv: any) => ({
    id: inv.id || inv._id,
    email: inv.invitee_email || inv.inviteeEmail,
    name: inv.invitee_name || inv.inviteeName,
    status: inv.status,
    sent_at: new Date(inv.last_sent_at || inv.created_at || inv.sentAt || inv.createdAt),
    completed_at:
      inv.completed_at || inv.respondedAt ? new Date(inv.completed_at || inv.respondedAt) : null,
    relationship: inv.relationship,
    token: inv.token,
    inviteLink: inv.token
      ? `${process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://giftbox-frontend-psi.vercel.app'}/invite/${inv.token}`
      : null,
  }));
}

/**
 * The signed-in user's sent invitations — the single hook the screen reads
 * it through. Replaces the old manual useFocusEffect + `silent`-refetch +
 * setInterval dance. Sending or resending an invitation just calls this
 * hook's `refetch()` afterward (matching the old code's own "refresh the
 * list" behavior) rather than patching the cache optimistically.
 */
export function useInvitations() {
  return useQuery({
    queryKey: INVITATIONS_QUERY_KEY,
    queryFn: fetchInvitations,
    refetchInterval: 12_000,
  });
}
