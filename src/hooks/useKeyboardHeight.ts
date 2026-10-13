import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// `KeyboardAvoidingView`'s `padding` behavior only resizes the available
// space — it has no idea which input is focused, so a field positioned low
// in a long ScrollView (or a tall multiline textarea) can still end up
// covered, with nothing to scroll it into view. Measuring the real keyboard
// height ourselves lets screens both reserve scroll room AND scroll a
// specific focused field above it (see useScrollToFocusedInput below),
// as one single mechanism instead of two that can fight each other.
//
// iOS gets the `Will` events, so the shift tracks the keyboard's own
// animation curve; Android only emits the `Did` pair reliably.
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) =>
      setHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      setHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
