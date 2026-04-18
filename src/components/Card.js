import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../theme';

const Card = ({
  children,
  onPress,
  variant = 'elevated', // elevated, outlined, flat
  padding = 'medium', // none, small, medium, large
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return styles.outlined;
      case 'flat':
        return styles.flat;
      default:
        return styles.elevated;
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return styles.paddingNone;
      case 'small':
        return styles.paddingSmall;
      case 'large':
        return styles.paddingLarge;
      default:
        return styles.paddingMedium;
    }
  };

  const cardContent = (
    <View style={[styles.base, getVariantStyles(), getPaddingStyles(), style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
  },

  // Variants
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.backgroundDark,
  },

  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: spacing.sm,
  },
  paddingMedium: {
    padding: spacing.base,
  },
  paddingLarge: {
    padding: spacing.xl,
  },
});

export default Card;
