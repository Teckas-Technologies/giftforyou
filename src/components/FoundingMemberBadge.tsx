import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontSize as typeScale } from '../theme';

interface FoundingMemberBadgeProps {
  number: number;
  total?: number;
}

const badgeIcon = require('../../assets/founding-member-badge.png');

const BADGE_RADIUS = 30;

// Shadow and rounded-corner clipping can't both live on the same gradient
// view in RN (overflow: 'hidden' needed to clip the gradient to its
// corners also clips the shadow). Outer View carries the shadow; inner
// LinearGradient carries the radius + overflow clip, so both render
// correctly at once.
const FoundingMemberBadge = ({ number, total = 5000 }: FoundingMemberBadgeProps) => {
  return (
    <View style={styles.shadowWrap}>
      <LinearGradient
        colors={['#FBEFCF', '#EFCB73']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.iconPlate}>
          <Image source={badgeIcon} style={styles.icon} resizeMode="contain" />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.label}>Founding Member</Text>
          <Text style={styles.number}>
            #{number.toLocaleString()} of {total.toLocaleString()}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrap: {
    alignSelf: 'center',
    borderRadius: BADGE_RADIUS,
    shadowColor: '#8a6600',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BADGE_RADIUS,
    borderWidth: 1.5,
    borderColor: '#C9A227',
    overflow: 'hidden',
  },
  iconPlate: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 120, 15, 0.3)',
  },
  icon: {
    width: 28,
    height: 28,
  },
  textBlock: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.lg,
    color: '#4a3508',
    lineHeight: typeScale.lg + 4,
  },
  number: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.sm,
    color: '#6b4f0f',
    lineHeight: typeScale.sm + 4,
  },
});

export default FoundingMemberBadge;
