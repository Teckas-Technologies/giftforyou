import { UIManager, findNodeHandle } from 'react-native';

// Scrolls a focused TextInput into view inside a ScrollView, by measuring
// its position relative to the ScrollView itself and scrolling so the
// field sits near the top of the (now keyboard-shrunk) visible area —
// unconditionally above the keyboard, regardless of the keyboard's actual
// height. Pass the raw focus event (event.target is already a native node
// handle, no ref needed per-field) and the ScrollView's ref.
//
// Replaces the old scrollResponderScrollNativeHandleToKeyboard, which is
// unreliable under the New Architecture (confirmed: it silently no-ops on
// iOS there, which is why fields stayed hidden behind the keyboard).
export function scrollFocusedInputIntoView(
  event: { target: number },
  scrollRef: React.RefObject<any>,
  extraOffset = 100,
) {
  const scrollNode = findNodeHandle(scrollRef.current);
  if (!scrollNode) return;

  // A short delay lets the keyboard's own show animation (and this
  // screen's keyboard-height-driven padding) start first, so the measured
  // position already accounts for the resized layout.
  setTimeout(() => {
    UIManager.measureLayout(
      event.target,
      scrollNode,
      () => {}, // measurement can fail harmlessly if the input unmounted mid-focus
      (_x: number, y: number) => {
        scrollRef.current?.scrollTo?.({ y: Math.max(0, y - extraOffset), animated: true });
      },
    );
  }, 50);
}
