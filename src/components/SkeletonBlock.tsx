import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

/**
 * Drop-in replacement for a plain skeleton `View` — pass the same style
 * (width/height/borderRadius/margin) you'd give a solid-color placeholder
 * block. Flat colors.skeleton fill, matching the plain SkeletonRow style
 * already used on Notifications/Invitations/Contacts/Calendar, so every
 * screen's loading state is the same color instead of each one picking its
 * own (a shimmer/gradient version was tried here and reverted — this app's
 * loading state is meant to look like the rest of it, i.e. simple).
 */
const SkeletonBlock = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.base, style]} />
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.skeleton,
  },
});

export default SkeletonBlock;
