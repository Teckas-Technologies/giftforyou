// Tracks whether the random "love note" popup has already been shown this
// app open, so it surfaces once per cold start rather than on every visit
// to the Home screen.
let shown = false;

export const hasShownLoveNoteThisSession = () => shown;

export const markLoveNoteShown = () => {
  shown = true;
};
