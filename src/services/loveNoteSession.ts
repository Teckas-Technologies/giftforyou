// Tracks whether the random "love note" popup has already been shown today,
// so it surfaces at most once per day rather than on every app open.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = '@giftbox_love_note_last_shown_date';

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Keyed per account, not just per device — without the userId, logging out
// and signing up as a brand-new account on the same phone the same day
// would wrongly skip their first-ever love note, since the flag from the
// PREVIOUS account already marked "shown today" for that device. Falls back
// to a shared device-level key only if no user is signed in yet (shouldn't
// normally happen, since this is only called from the logged-in Home screen).
const storageKey = (userId?: string | null) =>
  userId ? `${STORAGE_KEY_PREFIX}:${userId}` : STORAGE_KEY_PREFIX;

export const hasShownLoveNoteToday = async (userId?: string | null) => {
  try {
    const lastShown = await AsyncStorage.getItem(storageKey(userId));
    return lastShown === todayKey();
  } catch {
    return false;
  }
};

export const markLoveNoteShownToday = async (userId?: string | null) => {
  try {
    await AsyncStorage.setItem(storageKey(userId), todayKey());
  } catch {
    // non-critical — worst case the note shows again today
  }
};
