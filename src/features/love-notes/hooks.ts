import { useQuery } from '@tanstack/react-query';
import { getLoveNoteHistory } from '../../services/api';

export interface LoveNoteHistoryItem {
  id: string;
  text: string;
  created_at: string;
  // 'sent' = I sent it to this contact, 'received' = they sent it to me
  direction: 'sent' | 'received';
}

export const loveNoteHistoryQueryKey = (circleId: string) => ['loveNoteHistory', circleId];

/**
 * Love notes between the signed-in user and one contact (both directions),
 * newest first. Shared by the contact page card and the history screen.
 */
export function useLoveNoteHistory(circleId?: string, enabled = true) {
  return useQuery({
    queryKey: loveNoteHistoryQueryKey(circleId || ''),
    queryFn: async (): Promise<LoveNoteHistoryItem[]> => {
      const res = await getLoveNoteHistory(circleId as string);
      return res?.notes || [];
    },
    enabled: !!circleId && enabled,
  });
}
