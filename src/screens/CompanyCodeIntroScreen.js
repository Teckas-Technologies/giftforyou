import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path } from 'react-native-svg';
import { colors } from '../theme';

const BuildingIcon = ({ size = 34, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="4" y="2" width="16" height="20" rx="1" />
    <Path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
  </Svg>
);

// Shown once, right after signup, only for brand-new users (piggybacks on
// AppNavigator's existing "hasAnyAnswers" check — see checkQuestionnaireStatus).
// Never shown again on later logins.
const CompanyCodeIntroScreen = ({ navigation, route }) => {
  const nextRoute = route?.params?.nextRoute || 'MainApp';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // reset (not replace/navigate) so this one-time screen — and RedeemCoupon,
  // if they went through it — are cleared from the stack entirely. Otherwise
  // the back button from nextRoute could loop back into this flow.
  const goNext = () => navigation.reset({ index: 0, routes: [{ name: nextRoute }] });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.primaryLight, colors.primaryBg, colors.background]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBadge}
          >
            <BuildingIcon size={36} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', width: '100%' }}>
          <Text style={styles.eyebrow}>WORKPLACE ACCESS</Text>
          <Text style={styles.title}>Have a company code?</Text>

          <Text style={styles.subtitle}>
            If your workplace partners with Thoughtfully, your code unlocks full access instantly.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('RedeemCoupon', { nextRoute })}
            activeOpacity={0.85}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.enterButton}
            >
              <Text style={styles.enterButtonText}>Enter code</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={goNext} style={styles.skipButton} activeOpacity={0.6}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  eyebrow: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 13,
    letterSpacing: 2,
    color: colors.secondary,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Handlee_400Regular',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  enterButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 18,
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  skipButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 15,
    color: colors.textLight,
  },
});

export default CompanyCodeIntroScreen;
