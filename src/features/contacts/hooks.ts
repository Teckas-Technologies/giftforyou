import { useQuery } from '@tanstack/react-query';
import { getCircles, getCircle, getContactPreferences } from '../../services/api';
import { getDateParts } from '../../utils/date';

export const CONTACTS_QUERY_KEY = ['contacts'];

export interface Contact {
  id: string;
  name: string;
  initials: string;
  birthday: string;
  relation: string;
  relationTag: 'family' | 'work' | 'friend';
  colorType: 'pink' | 'blue';
  status?: string;
  isPending: boolean;
  // True once the account has dropped to the free plan and this contact
  // is beyond its one free slot — the server already stripped their real
  // name/birthday/photo, so this row can only render a placeholder.
  locked: boolean;
}

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatBirthday = (dateStr?: string) => {
  const p = getDateParts(dateStr);
  return p ? `${p.day} ${p.monthLong}` : '';
};

const getRelationTag = (relationship?: string): Contact['relationTag'] => {
  const familyTypes = ['Parent', 'Sibling', 'Child', 'Spouse', 'Grandparent', 'Relative', 'Family'];
  const workTypes = ['Colleague', 'Boss', 'Client', 'Business'];

  if (familyTypes.some((t) => relationship?.toLowerCase().includes(t.toLowerCase()))) {
    return 'family';
  }
  if (workTypes.some((t) => relationship?.toLowerCase().includes(t.toLowerCase()))) {
    return 'work';
  }
  return 'friend';
};

async function fetchContacts(): Promise<Contact[]> {
  const response = await getCircles();
  const contactsList = response.circles || response.contacts || [];

  return contactsList.map((contact: any, index: number) => {
    if (contact.locked) {
      return {
        id: contact.id || String(index),
        name: '',
        initials: '',
        birthday: '',
        relation: contact.relationship || 'Friend',
        relationTag: getRelationTag(contact.relationship),
        colorType: index % 2 === 0 ? 'pink' : 'blue',
        isPending: false,
        locked: true,
      };
    }

    // Handle nested member object from API
    const memberName =
      contact.member?.name || contact.memberName || contact.guestName || contact.name || 'Unknown';
    const memberBirthday =
      contact.member?.birthday ||
      contact.memberBirthday ||
      contact.guestBirthday ||
      contact.birthday;

    return {
      id: contact.id || contact._id || String(index),
      name: memberName,
      initials: getInitials(memberName),
      birthday: formatBirthday(memberBirthday),
      relation: contact.relationship || 'Friend',
      relationTag: getRelationTag(contact.relationship),
      colorType: index % 2 === 0 ? 'pink' : 'blue',
      status: contact.status,
      isPending: contact.status === 'pending',
      locked: false,
    };
  });
}

/**
 * The signed-in user's contact circle — the single hook the screen reads it
 * through. Replaces the old manual useFocusEffect + `silent`-refetch +
 * setInterval dance (see src/lib/queryClient.ts for the staleTime/AppState
 * refetch policy that replaces per-tab-focus refetching).
 */
export function useContacts() {
  return useQuery({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: fetchContacts,
    refetchInterval: 15_000,
  });
}

export const contactDetailQueryKey = (contactId: string) => ['contact', contactId];

export interface ContactRaw {
  contactData: any;
  preferencesData: any;
}

async function fetchContactRaw(contactId: string): Promise<ContactRaw> {
  const [contactData, preferencesData] = await Promise.all([
    getCircle(contactId),
    getContactPreferences(contactId).catch(() => null), // Preferences may not exist
  ]);
  return { contactData, preferencesData };
}

/**
 * Raw contact + preferences payload for one contact — the single hook
 * ContactDetailScreen reads it through. The screen's own transform
 * (contact shape, preference label-cleaning) stays in
 * ContactDetailScreen.js as a useMemo over this data, unchanged from
 * before this migration — it's too fallback-heavy to safely relocate
 * blind.
 *
 * Replaces the old manual useFocusEffect + `silent`-refetch + setInterval
 * + `loadedContactIdRef` dance: React Query's per-key cache means
 * switching to a different contactId naturally shows the loader (no
 * cached data for that key yet), while revisiting the same contact
 * doesn't.
 */
export function useContactRaw(contactId?: string) {
  return useQuery({
    queryKey: contactDetailQueryKey(contactId || ''),
    queryFn: () => fetchContactRaw(contactId as string),
    enabled: !!contactId,
    refetchInterval: 15_000,
  });
}
