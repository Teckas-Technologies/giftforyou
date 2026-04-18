import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, avatarSizes, borderRadius } from '../theme';

const Avatar = ({
  source,
  name,
  size = 'base', // xs, sm, md, base, lg, xl, 2xl, 3xl
  style,
}) => {
  const avatarSize = avatarSizes[size] || avatarSizes.base;

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getFontSize = () => {
    const sizeMap = {
      xs: 10,
      sm: 12,
      md: 14,
      base: 16,
      lg: 20,
      xl: 24,
      '2xl': 28,
      '3xl': 32,
    };
    return sizeMap[size] || 16;
  };

  const getBackgroundColor = (name) => {
    if (!name) return colors.primaryLight;
    const colorOptions = [
      '#FFB3C6', // Light pink
      '#B3D4FF', // Light blue
      '#C5B3FF', // Light purple
      '#B3FFD9', // Light green
      '#FFD9B3', // Light orange
      '#FFB3E6', // Light magenta
    ];
    const index = name.charCodeAt(0) % colorOptions.length;
    return colorOptions[index];
  };

  if (source) {
    return (
      <Image
        source={source}
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.initialsContainer,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: getBackgroundColor(name),
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: getFontSize() }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default Avatar;
