import React from 'react';
import { View, StyleSheet } from 'react-native';

// Generic list-row placeholder shown while a screen's first data fetch is
// in flight. Matches the height/shape of a real row (avatar/icon circle +
// 1-2 text lines) so swapping it for real content doesn't visibly shift
// everything below it, the way an empty centered spinner does. Render
// several of these (e.g. 3) in place of a full-screen ActivityIndicator.
const SkeletonRow = ({
  avatarSize = 52,
  lines = 2,
  style,
}: {
  avatarSize?: number;
  lines?: 1 | 2;
  style?: any;
}) => (
  <View style={[styles.row, style]}>
    {avatarSize > 0 && (
      <View
        style={[
          styles.avatar,
          { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        ]}
      />
    )}
    <View style={styles.textCol}>
      <View style={[styles.line, { width: '65%' }]} />
      {lines === 2 && <View style={[styles.line, styles.lineShort]} />}
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#ece7f0',
  },
  textCol: {
    flex: 1,
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ece7f0',
    marginBottom: 8,
  },
  lineShort: {
    width: '40%',
    height: 10,
    marginBottom: 0,
  },
});

export default SkeletonRow;
