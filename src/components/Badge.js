import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

const Badge = ({
  text,
  variant = 'default', // default, urgent, soon, later, success, info
  size = 'medium', // small, medium
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'urgent':
        return {
          container: styles.urgentContainer,
          text: styles.urgentText,
        };
      case 'soon':
        return {
          container: styles.soonContainer,
          text: styles.soonText,
        };
      case 'later':
        return {
          container: styles.laterContainer,
          text: styles.laterText,
        };
      case 'success':
        return {
          container: styles.successContainer,
          text: styles.successText,
        };
      case 'info':
        return {
          container: styles.infoContainer,
          text: styles.infoText,
        };
      default:
        return {
          container: styles.defaultContainer,
          text: styles.defaultText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.base,
        variantStyles.container,
        size === 'small' && styles.small,
        style,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          variantStyles.text,
          size === 'small' && styles.smallText,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

// Helper function to get badge variant based on days
export const getBadgeVariant = (daysUntil) => {
  if (daysUntil <= 1) return 'urgent';
  if (daysUntil <= 7) return 'soon';
  return 'later';
};

// Helper function to format countdown text
export const formatCountdown = (daysUntil) => {
  if (daysUntil === 0) return 'Today';
  if (daysUntil === 1) return 'Tomorrow';
  if (daysUntil < 7) return `in ${daysUntil} days`;
  if (daysUntil < 30) return `in ${Math.floor(daysUntil / 7)} weeks`;
  if (daysUntil < 365) return `in ${Math.floor(daysUntil / 30)} months`;
  return `in ${Math.floor(daysUntil / 365)} years`;
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  textBase: {
    fontSize: 12,
    fontWeight: '600',
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  smallText: {
    fontSize: 10,
  },

  // Variants
  defaultContainer: {
    backgroundColor: colors.primaryLight,
  },
  defaultText: {
    color: colors.primary,
  },
  urgentContainer: {
    backgroundColor: '#FFE0E6',
  },
  urgentText: {
    color: '#E91E63',
  },
  soonContainer: {
    backgroundColor: '#FFF3E0',
  },
  soonText: {
    color: '#FF9800',
  },
  laterContainer: {
    backgroundColor: '#E8F5E9',
  },
  laterText: {
    color: '#4CAF50',
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
  },
  successText: {
    color: '#4CAF50',
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
  },
  infoText: {
    color: '#2196F3',
  },
});

export default Badge;
