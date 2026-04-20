import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    emoji: '🗓️',
    title: 'Never Forget Again',
    description: 'Keep track of birthdays, anniversaries, and all the special moments that matter to you and your loved ones.',
    color: colors.primary,
    gradientColors: [colors.primary, colors.primaryDark],
    dotColor: colors.primary,
  },
  {
    id: '2',
    emoji: '👥',
    title: 'Organize Your People',
    description: 'Create circles for family, friends, and colleagues. Keep everyone organized and never miss a celebration.',
    color: colors.secondary,
    gradientColors: [colors.secondary, '#7BA66A'],
    dotColor: colors.secondary,
  },
  {
    id: '3',
    emoji: '🎁',
    title: 'Perfect Gift Ideas',
    description: 'Save gift ideas, track your budget, and never give a last-minute present again. Thoughtful gifting made easy!',
    color: colors.accentLavender,
    gradientColors: [colors.accentLavender, '#B8A5DB'],
    dotColor: colors.accentLavender,
  },
  {
    id: '4',
    emoji: '🎉',
    title: "You're All Set!",
    description: "Start adding your special dates and make every celebration memorable. Let's spread some joy!",
    color: colors.accentSunny,
    gradientColors: [colors.accentSunny, '#F5C800'],
    dotColor: colors.accentSunny,
    isLast: true,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Animations
  const iconScale = useRef(new Animated.Value(1)).current;
  const ringRotation = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([
    new Animated.Value(0.4),
    new Animated.Value(0.4),
    new Animated.Value(0.4),
    new Animated.Value(0.4),
  ]).current;

  useEffect(() => {
    // Start ring rotation animation
    Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Start icon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start dot pulse animations with stagger
    dotAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 500),
          Animated.timing(anim, {
            toValue: 0.8,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.4,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const ringRotateInterpolate = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const skipToLogin = () => {
    navigation.replace('Login');
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        {/* Skip button - not on last screen */}
        {!item.isLast && (
          <TouchableOpacity style={styles.skipButton} onPress={skipToLogin}>
            <Text style={styles.skipText}>skip</Text>
          </TouchableOpacity>
        )}

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          {/* Dashed ring */}
          <Animated.View
            style={[
              styles.dashedRing,
              { transform: [{ rotate: ringRotateInterpolate }] },
            ]}
          />

          {/* Main icon */}
          <Animated.View
            style={[
              styles.iconWrapper,
              { transform: [{ scale: iconScale }] },
            ]}
          >
            <LinearGradient
              colors={item.gradientColors}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.iconEmoji}>{item.emoji}</Text>
            </LinearGradient>

            {/* Accent dots */}
            <Animated.View style={[styles.accentDot, styles.dotTop, { opacity: dotAnims[0], backgroundColor: item.dotColor }]} />
            <Animated.View style={[styles.accentDot, styles.dotBottom, { opacity: dotAnims[1], backgroundColor: item.dotColor }]} />
            <Animated.View style={[styles.accentDot, styles.dotLeft, { opacity: dotAnims[2], backgroundColor: item.dotColor }]} />
            <Animated.View style={[styles.accentDot, styles.dotRight, { opacity: dotAnims[3], backgroundColor: item.dotColor }]} />
          </Animated.View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Feature badges on last screen */}
          {item.isLast && (
            <View style={styles.badgesContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>🔔</Text>
                <Text style={styles.badgeText}>Reminders</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>🎁</Text>
                <Text style={styles.badgeText}>Gifts</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>👥</Text>
                <Text style={styles.badgeText}>Circles</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const currentItem = onboardingData[currentIndex];

  return (
    <View style={styles.container}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          {onboardingData.map((item, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 28, 10],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <TouchableOpacity onPress={scrollToNext} activeOpacity={0.9}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Text style={styles.nextButtonArrow}>
              {currentIndex === onboardingData.length - 1 ? '🚀' : '→'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary button on last screen */}
        {currentItem.isLast && (
          <TouchableOpacity style={styles.secondaryButton} onPress={skipToLogin}>
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontFamily: 'Caveat-Medium',
    fontSize: 22,
    color: colors.textLight,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    borderStyle: 'dashed',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  iconEmoji: {
    fontSize: 45,
  },
  accentDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotTop: {
    top: -18,
    left: '50%',
    marginLeft: -4,
  },
  dotBottom: {
    bottom: -18,
    left: '50%',
    marginLeft: -4,
  },
  dotLeft: {
    left: -18,
    top: '50%',
    marginTop: -4,
  },
  dotRight: {
    right: -18,
    top: '50%',
    marginTop: -4,
  },
  contentContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Caveat-SemiBold',
    fontSize: 32,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeIcon: {
    fontSize: 16,
  },
  badgeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginHorizontal: 5,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  nextButtonArrow: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: colors.backgroundCard,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 15,
    color: colors.primary,
  },
});

export default OnboardingScreen;
