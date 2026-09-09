import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

interface FoundingMemberBadgeProps {
  number: number;
  total?: number;
}

const StarIcon = ({ size = 14, color = '#8a6d1a' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z" />
  </Svg>
);

// Deliberately gold/champagne — every other badge/pill in the app uses the
// pink-purple-teal palette, so this stands out as a distinct, special
// status marker rather than blending in as just another UI chip.
const FoundingMemberBadge = ({ number, total = 5000 }: FoundingMemberBadgeProps) => {
  return (
    <LinearGradient
      colors={['#FDF0C6', '#F4D780']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StarIcon />
      <Text style={styles.label}>Founding Member</Text>
      <View style={styles.divider} />
      <Text style={styles.number}>
        #{number.toLocaleString()} of {total.toLocaleString()}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#8a6d1a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
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
