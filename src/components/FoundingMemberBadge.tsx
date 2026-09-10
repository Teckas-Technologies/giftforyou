import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface FoundingMemberBadgeProps {
  number: number;
  total?: number;
}

const badgeIcon = require('../../assets/founding-member-badge.png');

// Deliberately gold, with a white (not gold) pill background — every other
// badge/pill in the app uses the pink-purple-teal palette, so gold stands
// out as a distinct, special status marker, but the icon itself is gold
// line art: a gold pill behind it washed it out, so the background stays
// white/light to keep the icon and text visible against it.
const FoundingMemberBadge = ({ number, total = 5000 }: FoundingMemberBadgeProps) => {
  return (
    <View style={styles.container}>
      <Image source={badgeIcon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.label}>Founding Member</Text>
      <View style={styles.divider} />
      <Text style={styles.number}>
        #{number.toLocaleString()} of {total.toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    backgroundColor: '#FFFDF5',
    borderWidth: 1.5,
    borderColor: '#F4D780',
    shadowColor: '#8a6d1a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    width: 32,
    height: 32,
  },
  label: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 13,
    color: '#5c4813',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(92, 72, 19, 0.3)',
  },
  number: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 13,
    color: '#5c4813',
    fontWeight: '600',
  },
});

export default FoundingMemberBadge;
