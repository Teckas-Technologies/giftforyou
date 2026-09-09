// Tracks whether the random "love note" popup has already been shown today,
// so it surfaces at most once per day rather than on every app open.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@giftbox_love_note_last_shown_date';

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export const hasShownLoveNoteToday = async () => {
  try {
    const lastShown = await AsyncStorage.getItem(STORAGE_KEY);
    return lastShown === todayKey();
  } catch {
    return false;
  }
};

export const markLoveNoteShownToday = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, todayKey());
  } catch {
    // non-critical — worst case the note shows again today
  }
};
