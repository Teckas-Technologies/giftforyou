import { useQueryClient, useQuery } from '@tanstack/react-query';
import { getProfile, getDashboardStats, uploadProfilePhoto } from '../../services/api';

export const PROFILE_QUERY_KEY = ['profile', 'dashboard'];

export interface ProfileInfo {
  name: string;
  email: string;
  photoUrl: string | null;
  avatarType: string | null;
  isFoundingMember: boolean;
  foundingMemberNumber: number | null;
}

export interface ProfileStats {
  contactsCount: number;
  upcomingEventsCount: number;
  giftsGivenCount: number;
}

export interface ProfileDashboard {
  profile: ProfileInfo;
  stats: ProfileStats;
}

async function fetchProfileDashboard(): Promise<ProfileDashboard> {
  const [profileRes, statsRes] = await Promise.all([
    getProfile(),
    getDashboardStats().catch(() => ({
      contactsCount: 0,
      upcomingEventsCount: 0,
      giftsGivenCount: 0,
    })),
  ]);

  if (!profileRes?.user) {
    // A request that "succeeds" with no user (or a network failure further
    // up) should not blank an already-loaded profile — throwing here keeps
    // React Query's last good cached data in place instead of overwriting
    // it, same as the old `if (profileRes.user)` guard did.
    throw new Error('getProfile returned no user');
  }

  return {
    profile: {
      name: profileRes.user.name || '',
      email: profileRes.user.email || '',
      // API returns this as `profilePhoto` (user.profile_photo); accept the
      // other shapes too so the picture loads on revisit.
      photoUrl:
        profileRes.user.profilePhoto ||
        profileRes.user.photoUrl ||
        profileRes.user.profile_photo ||
        null,
      avatarType: profileRes.user.avatarType || profileRes.user.avatar_type || null,
      isFoundingMember: !!(profileRes.user.isFoundingMember ?? profileRes.user.is_founding_member),
      foundingMemberNumber:
        profileRes.user.foundingMemberNumber ?? profileRes.user.founding_member_number ?? null,
    },
    stats: {
      contactsCount: statsRes.contactsCount || 0,
      upcomingEventsCount: statsRes.upcomingEventsCount || 0,
      giftsGivenCount: statsRes.giftsGivenCount || 0,
    },
  };
}

export const emptyProfileDashboard: ProfileDashboard = {
  profile: {
    name: '',
    email: '',
    photoUrl: null,
    avatarType: null,
    isFoundingMember: false,
    foundingMemberNumber: null,
  },
  stats: { contactsCount: 0, upcomingEventsCount: 0, giftsGivenCount: 0 },
};

/**
 * Profile info + dashboard stats — the single hook the screen reads it
 * through. Replaces the old manual useFocusEffect + `hasLoadedOnce`-guarded
 * setLoading dance (see src/lib/queryClient.ts for the staleTime/AppState
 * refetch policy that replaces per-tab-focus refetching).
 */
export function useProfileDashboard() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfileDashboard,
  });
}

/**
 * Uploads a picked photo, patching the shared cache optimistically (shows
 * the new photo immediately) and rolling back on failure — the same
 * optimistic-then-confirm/rollback behavior the screen had with local
 * `setProfile`, just against the query cache instead.
 */
export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();

  return async (asset: { uri: string; fileName?: string; mimeType?: string }) => {
    const previous = queryClient.getQueryData<ProfileDashboard>(PROFILE_QUERY_KEY);
    const previousPhoto = previous?.profile.photoUrl ?? null;

    const patchPhoto = (photoUrl: string | null) => {
      queryClient.setQueryData<ProfileDashboard>(
        PROFILE_QUERY_KEY,
        (prev: ProfileDashboard | undefined) =>
          prev ? { ...prev, profile: { ...prev.profile, photoUrl } } : prev,
      );
    };

    // Optimistic UI — show the new photo immediately while upload runs.
    patchPhoto(asset.uri);

    try {
      const formData = new FormData();
      const filename = asset.fileName || `profile-${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';
      formData.append('photo', {
        uri: asset.uri,
        name: filename,
        type: mimeType,
      } as any);

      const result = await uploadProfilePhoto(formData);
      if (!result?.photoUrl) {
        throw new Error('No photoUrl returned');
      }
      patchPhoto(result.photoUrl);
    } catch (error) {
      patchPhoto(previousPhoto);
      throw error;
    }
  };
}
