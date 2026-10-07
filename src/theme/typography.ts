// Thoughtfully Typography System
//
// Centralized font-size scale. Every value here is ~2px bigger than what
// screens were hardcoding before, per the "bigger fonts" client feedback —
// no bold variant, since the app's Handlee font only ships a 400 (regular)
// weight and a CSS fontWeight: 'bold' override doesn't render a true bold
// face for it.

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 17,
  lg: 18,
  xl: 20,
  '2xl': 22,
  '3xl': 24,
  '4xl': 26,
  '5xl': 28,
  '6xl': 30,
  '7xl': 34,
  '8xl': 38,
  '9xl': 42,
  '10xl': 50,
} as const;

export default fontSize;
