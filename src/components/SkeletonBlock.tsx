import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

/**
 * The single skeleton primitive every loading state in the app is built
 * from (SkeletonRow's avatar/lines, and any screen using this directly) —
 * one shared implementation so every screen's loading state looks and
 * behaves identically. Pass the same style (width/height/borderRadius/
 * margin) you'd give a plain solid-color placeholder View.
 *
 * A soft highlight band sweeps across once, pauses, then repeats — the
 * standard "shimmer" look of polished apps (Instagram/LinkedIn) — instead
 * of a flat static block, which reads as broken rather than "loading."
 */
const SkeletonBlock = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  const [width, setWidth] = useState(0);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    const runSweep = () => {
      if (cancelled) return;
      shimmerAnim.setValue(0);
      Animated.sequence([
        Animated.delay(450),
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && !cancelled) runSweep();
      });
    };
    runSweep();

    return () => {
      cancelled = true;
    };
  }, [shimmerAnim]);

  const bandWidth = Math.max(width * 0.55, 80);

  return (
    <View style={[styles.base, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Animated.View
          style={[
            styles.band,
            {
              width: bandWidth,
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-bandWidth, width],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.skeleton,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
});

export default SkeletonBlock;
