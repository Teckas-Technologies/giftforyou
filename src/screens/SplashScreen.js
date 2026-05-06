import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme';
import { GiftBoxIcon } from '../components';
import { initializeUser, hasSeenOnboardingLocal } from '../services/api';

const { width, height } = Dimensions.get('window');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const SplashScreenComponent = ({ navigation }) => {
  const [nextScreen, setNextScreen] = useState(null); // null until determined
  const [isReady, setIsReady] = useState(false);

  // Animation refs
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  // Text animations
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(25)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;

  // Dots animation
  const dot1 = useRef(new Animated.Value(0.6)).current;
  const dot2 = useRef(new Animated.Value(0.6)).current;
  const dot3 = useRef(new Animated.Value(0.6)).current;

  // Fade out
  const fadeOut = useRef(new Animated.Value(1)).current;

  // Initialize user and check onboarding status
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First, initialize user (load or create unique ID)
        await initializeUser();

        // Check local storage for onboarding status (faster than API)
        const hasSeenOnboarding = await hasSeenOnboardingLocal();

        if (hasSeenOnboarding) {
          // User has seen onboarding, go to Login (auth required)
          setNextScreen('Login');
        } else {
          // Show onboarding for new users
          setNextScreen('Onboarding');
        }
      } catch (error) {
        console.log('Initialization error:', error.message);
        setNextScreen('Onboarding');
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  // Hide native splash screen when layout is ready
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

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

    // Dots animation - first dot stays at 1, others pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.6, duration: 300, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0.6, duration: 300, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0.6, duration: 300, useNativeDriver: true }),
      ])
    ).start();

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
    ]).start();

    // Navigate after 3.5 seconds, but only if ready
    const timer = setTimeout(() => {
      if (isReady && nextScreen) {
        Animated.timing(fadeOut, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          navigation.replace(nextScreen);
        });
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [isReady, nextScreen]);

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeOut }]}
      onLayout={onLayoutRootView}
    >
      <LinearGradient
        colors={['#FDEEF3', '#E8F4FD', '#FBDCE9', '#D6EAF8']}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
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
                { scale: glowPulse },
              ],
            },
          ]}
        >
          <View style={styles.logoBox}>
            <GiftBoxIcon size={70} />
          </View>
        </Animated.View>

        {/* App name with gradient "Box" */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textSlide }],
            },
          ]}
        >
          <Text style={styles.appName}>Gift</Text>
          <MaskedView
            maskElement={
              <Text style={styles.appNameMask}>Box</Text>
            }
          >
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.appNameMask, { opacity: 0 }]}>Box</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={styles.appName}>4you</Text>
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
          Never miss a birthday
        </Animated.Text>

        {/* Loading dots - centered below tagline */}
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  logoBox: {
    width: 100,
    height: 100,
    backgroundColor: '#330c54',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  appName: {
    fontSize: 38,
    fontFamily: 'StyleScript_400Regular',
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  appNameMask: {
    fontSize: 38,
    fontFamily: 'StyleScript_400Regular',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: colors.primary,
    fontFamily: 'Handlee_400Regular',
    letterSpacing: 1,
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 50,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryAccent,
  },
});

export default SplashScreenComponent;
