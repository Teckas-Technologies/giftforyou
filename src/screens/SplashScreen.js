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
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Animation refs
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-10)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Ring animations
  const ringScale1 = useRef(new Animated.Value(0.8)).current;
  const ringScale2 = useRef(new Animated.Value(0.8)).current;
  const ringScale3 = useRef(new Animated.Value(0.8)).current;
  const ringOpacity1 = useRef(new Animated.Value(0.6)).current;
  const ringOpacity2 = useRef(new Animated.Value(0.6)).current;
  const ringOpacity3 = useRef(new Animated.Value(0.6)).current;

  // Text animations
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(25)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;

  // Loader animations
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderWidth = useRef(new Animated.Value(0)).current;

  // Confetti animations
  const confetti1 = useRef(new Animated.Value(0)).current;
  const confetti2 = useRef(new Animated.Value(0)).current;
  const confetti3 = useRef(new Animated.Value(0)).current;
  const confetti4 = useRef(new Animated.Value(0)).current;

  // Glow pulse
  const glowPulse = useRef(new Animated.Value(1)).current;

  // Fade out
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Glow pulse animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Ring expansion animations (continuous)
    const ringAnimation = (scale, opacity, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 2.5,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    ringAnimation(ringScale1, ringOpacity1, 0).start();
    ringAnimation(ringScale2, ringOpacity2, 700).start();
    ringAnimation(ringScale3, ringOpacity3, 1400).start();

    // Confetti animation (continuous)
    const confettiAnimation = (anim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    confettiAnimation(confetti1, 0).start();
    confettiAnimation(confetti2, 500).start();
    confettiAnimation(confetti3, 1000).start();
    confettiAnimation(confetti4, 1500).start();

    // Main animation sequence
    Animated.sequence([
      // Logo appears with bounce
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Title slides up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      // Tagline slides up
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(taglineSlide, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      // Loader appears
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Loader bar fill
    setTimeout(() => {
      Animated.timing(loaderWidth, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, 1500);

    // Navigate after 4.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Onboarding');
      });
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [-10, 0],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <View style={styles.background}>
        {/* Gradient background */}
        <LinearGradient
          colors={['#FDF8F3', '#F8EEE4', '#FDF8F3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Coral glow - top right */}
        <Animated.View
          style={[
            styles.glow,
            styles.glowTopRight,
            { transform: [{ scale: glowPulse }] },
          ]}
        />

        {/* Gold glow - bottom left */}
        <Animated.View
          style={[
            styles.glow,
            styles.glowBottomLeft,
            { transform: [{ scale: glowPulse }] },
          ]}
        />

        {/* Confetti particles */}
        <Animated.View
          style={[
            styles.confetti,
            styles.confetti1,
            {
              opacity: confetti1.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 0.7, 0.7, 0],
              }),
              transform: [
                {
                  translateY: confetti1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 40],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.confetti,
            styles.confetti2,
            {
              opacity: confetti2.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 0.7, 0.7, 0],
              }),
              transform: [
                {
                  translateY: confetti2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 35],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.confetti,
            styles.confetti3,
            {
              opacity: confetti3.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 0.7, 0.7, 0],
              }),
              transform: [
                {
                  translateY: confetti3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 45],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.confetti,
            styles.confetti4,
            {
              opacity: confetti4.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 0.7, 0.7, 0],
              }),
              transform: [
                {
                  translateY: confetti4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 38],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Expanding rings */}
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity1,
              transform: [{ scale: ringScale1 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity2,
              transform: [{ scale: ringScale2 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity3,
              transform: [{ scale: ringScale3 }],
            },
          ]}
        />

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { rotate: logoRotateInterpolate },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#E07B5C', '#D06A4C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="gift" size={48} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* App name */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            <Text style={styles.appName}>GiftBox</Text>
            <Text style={styles.appNameAccent}>4you</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineSlide }],
              },
            ]}
          >
            Perfect gifts, every time
          </Animated.Text>
        </View>

        {/* Loading bar */}
        <Animated.View style={[styles.loaderContainer, { opacity: loaderOpacity }]}>
          <View style={styles.loaderBg}>
            <Animated.View
              style={[
                styles.loaderFill,
                {
                  width: loaderWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loaderText}>Loading...</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 1000,
  },
  glowTopRight: {
    width: 250,
    height: 250,
    backgroundColor: '#E07B5C',
    top: -80,
    right: -80,
    opacity: 0.25,
  },
  glowBottomLeft: {
    width: 220,
    height: 220,
    backgroundColor: '#C4956A',
    bottom: -60,
    left: -60,
    opacity: 0.2,
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  confetti1: {
    backgroundColor: '#E07B5C',
    top: '18%',
    left: '15%',
    transform: [{ rotate: '15deg' }],
  },
  confetti2: {
    backgroundColor: '#C4956A',
    top: '22%',
    right: '18%',
    transform: [{ rotate: '-20deg' }],
  },
  confetti3: {
    backgroundColor: '#E07B5C',
    bottom: '28%',
    left: '20%',
    transform: [{ rotate: '45deg' }],
  },
  confetti4: {
    backgroundColor: '#C4956A',
    bottom: '32%',
    right: '15%',
    transform: [{ rotate: '-10deg' }],
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: '#E07B5C',
    borderRadius: 60,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 28,
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  logoGradient: {
    width: 110,
    height: 110,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#3D3D3D',
    letterSpacing: -1,
  },
  appNameAccent: {
    fontSize: 40,
    fontWeight: '300',
    color: '#E07B5C',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: '#888888',
    fontWeight: '500',
    letterSpacing: 1,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 90,
    alignItems: 'center',
  },
  loaderBg: {
    width: 130,
    height: 5,
    backgroundColor: 'rgba(224, 123, 92, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  loaderFill: {
    height: '100%',
    backgroundColor: '#E07B5C',
    borderRadius: 3,
  },
  loaderText: {
    fontSize: 11,
    color: '#AAAAAA',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;
