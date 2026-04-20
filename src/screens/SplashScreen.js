import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Loading dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Dots animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Main animation sequence
    Animated.sequence([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to Onboarding after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Onboarding');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <LinearGradient
        colors={['#FFF5EE', '#FFE4D6', '#FFDAC8']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <Animated.View style={[styles.decorCircle, styles.circle1, { opacity: fadeIn }]} />
        <Animated.View style={[styles.decorCircle, styles.circle2, { opacity: fadeIn }]} />
        <Animated.View style={[styles.decorCircle, styles.circle3, { opacity: fadeIn }]} />

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: logoScale },
                  { translateY: floatInterpolate },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.logoGradient}
            >
              <Text style={styles.logoEmoji}>🎁</Text>
            </LinearGradient>
          </Animated.View>

          {/* App name */}
          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text style={styles.appName}>GiftBox</Text>
            <Text style={styles.appNameAccent}>4you</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            remember what matters
          </Animated.Text>
        </View>

        {/* Loading dots */}
        <View style={styles.loadingContainer}>
          <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 139, 123, 0.15)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: '10%',
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: '20%',
    left: -40,
  },
  circle3: {
    width: 100,
    height: 100,
    top: '40%',
    left: '10%',
    backgroundColor: 'rgba(157, 192, 139, 0.15)',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 15,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 50,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  appName: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 36,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  appNameAccent: {
    fontFamily: 'Nunito-Regular',
    fontSize: 36,
    color: colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: 'Caveat-Medium',
    fontSize: 22,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

export default SplashScreen;
