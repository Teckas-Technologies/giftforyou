// GiftBox4you Typography System
// Pink & Blue Blend Theme
// Headlines: Gifted | Body: Outfit (Light & Modern)

export const typography = {
  // Font Families
  fontFamily: {
    // Display/Headlines
    display: 'Gifted-Regular',
    // Body Text
    light: 'Outfit-Light',
    regular: 'Outfit-Regular',
    medium: 'Outfit-Medium',
    semiBold: 'Outfit-SemiBold',
    bold: 'Outfit-Bold',
  },

  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    tight: 1.3,
    normal: 1.6,
    relaxed: 1.8,
    loose: 2.0,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.3,
    normal: 0.3,
    wide: 0.6,
    wider: 1,
    widest: 2,
  },
};

// Predefined Text Styles
export const textStyles = {
  // Headings - Gifted font
  h1: {
    fontFamily: 'Gifted-Regular',
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: 0.5,
  },
  h2: {
    fontFamily: 'Gifted-Regular',
    fontSize: 28,
    lineHeight: 38,
    letterSpacing: 0.4,
  },
  h3: {
    fontFamily: 'Gifted-Regular',
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: 0.3,
  },
  h4: {
    fontFamily: 'Gifted-Regular',
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.3,
  },

  // Body - Outfit Light
  bodyLarge: {
    fontFamily: 'Outfit-Light',
    fontSize: 18,
    lineHeight: 30,
    letterSpacing: 0.4,
  },
  body: {
    fontFamily: 'Outfit-Light',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.4,
  },
  bodySmall: {
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.3,
  },

  // Labels & Captions
  label: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: 'Outfit-Light',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  captionSmall: {
    fontFamily: 'Outfit-Light',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  // Buttons
  button: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.8,
  },
  buttonSmall: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.6,
  },

  // App Specific
  appTitle: {
    fontFamily: 'Gifted-Regular',
    fontSize: 36,
    lineHeight: 46,
    letterSpacing: 0.5,
  },
  greeting: {
    fontFamily: 'Gifted-Regular',
    fontSize: 22,
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontFamily: 'Gifted-Regular',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  statValue: {
    fontFamily: 'Outfit-Medium',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0,
  },
  statLabel: {
    fontFamily: 'Outfit-Light',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  menuText: {
    fontFamily: 'Outfit-Light',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.4,
  },
  tabLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

export default typography;
