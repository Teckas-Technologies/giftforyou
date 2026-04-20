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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { BellIcon, GiftIcon, UsersIcon, CalendarIcon, CelebrationIcon, UserIcon, HeadphonesIcon, BookIcon, FlowerIcon } from '../components';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Bell shake animation
  const bellShake = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Bell shake animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellShake, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(bellShake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(bellShake, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(bellShake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(bellShake, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.delay(1500),
      ])
    ).start();

    // Ring pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          toValue: 1.5,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringPulse, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const ringOpacity = ringPulse.interpolate({
    inputRange: [0.8, 1.5],
    outputRange: [0.8, 0],
  });

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < 3) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const skipToLogin = () => {
    navigation.replace('Login');
  };

  // Screen 1: Never miss a Birthday
  const renderScreen1 = () => (
    <LinearGradient
      colors={['#FDEEF3', '#E8F4FD', '#FBDCE9']}
      locations={[0, 0.5, 1]}
      style={styles.slide}
    >
      <View style={styles.contentTop}>
        <Text style={styles.headline}>Never miss a{'\n'}<Text style={styles.highlightPink}>Birthday</Text> again</Text>
      </View>

      <View style={styles.visualContainer}>
        {/* Bell with shake animation */}
        <View style={styles.bellContainer}>
          <Animated.View
            style={[styles.bellIconContainer, { transform: [{ rotate: bellShake.interpolate({
              inputRange: [-10, 10],
              outputRange: ['-10deg', '10deg'],
            }) }] }]}
          >
            <BellIcon size={45} color={colors.primary} />
          </Animated.View>
          <Animated.View
            style={[
              styles.bellRing,
              {
                transform: [{ scale: ringPulse }],
                opacity: ringOpacity,
              },
            ]}
          />
        </View>

        {/* Notification card */}
        <View style={styles.notificationCard}>
          <View style={styles.notifDot} />
          <View style={styles.notifContent}>
            <Text style={styles.notifTitle}>Anna: Birthday in 30 days</Text>
            <Text style={styles.notifText}>Have you got a gift yet?</Text>
          </View>
          <Text style={styles.notifTime}>now</Text>
        </View>

        {/* Mini calendar */}
        <View style={styles.miniCalendar}>
          <Text style={styles.miniCalHeader}>March 2026</Text>
          <View style={styles.miniCalGrid}>
            <Text style={styles.miniCalDay}>25</Text>
            <View style={styles.miniCalHighlight}>
              <Text style={styles.miniCalDayHighlight}>26</Text>
            </View>
            <Text style={styles.miniCalDay}>27</Text>
            <Text style={styles.miniCalDay}>28</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  // Screen 2: Import Contacts
  const renderScreen2 = () => (
    <LinearGradient
      colors={['#EBF5FB', '#FDEEF3', '#D6EAF8']}
      locations={[0, 0.5, 1]}
      style={styles.slide}
    >
      <View style={styles.contentTop}>
        <Text style={styles.headline}>Add friends from{'\n'}<Text style={styles.highlightBlue}>your contacts</Text></Text>
      </View>

      <View style={styles.visualContainer}>
        {/* Floating avatars */}
        <View style={styles.floatingAvatars}>
          <View style={[styles.floatAvatar, styles.avatar1]}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
          <View style={[styles.floatAvatar, styles.avatar2]}>
            <Ionicons name="person" size={22} color={colors.secondary} />
          </View>
          <View style={[styles.floatAvatar, styles.avatar3]}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
          <View style={styles.plusIcon}>
            <Ionicons name="add" size={24} color={colors.textWhite} />
          </View>
        </View>

        {/* Contacts preview card */}
        <View style={styles.contactsCard}>
          <View style={styles.contactRow}>
            <View style={[styles.contactCheck, styles.checked]}>
              <Ionicons name="checkmark" size={12} color={colors.textWhite} />
            </View>
            <Text style={styles.contactName}>Anna</Text>
          </View>
          <View style={styles.contactRow}>
            <View style={[styles.contactCheck, styles.checked]}>
              <Ionicons name="checkmark" size={12} color={colors.textWhite} />
            </View>
            <Text style={styles.contactName}>Chris</Text>
          </View>
          <View style={styles.contactRow}>
            <View style={styles.contactCheck} />
            <Text style={styles.contactName}>Tom</Text>
          </View>
          <View style={[styles.contactRow, styles.lastRow]}>
            <View style={styles.contactCheck} />
            <Text style={styles.contactName}>Sara</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  // Screen 3: Gift Ideas
  const renderScreen3 = () => (
    <LinearGradient
      colors={['#EBF5FB', '#FDEEF3', '#D6EAF8']}
      locations={[0, 0.5, 1]}
      style={styles.slide}
    >
      <View style={styles.contentTop}>
        <Text style={styles.headline}>Find <Text style={styles.highlightBlue}>perfect</Text>{'\n'}gift ideas</Text>
      </View>

      <View style={styles.visualContainer}>
        <View style={styles.giftBoxIconContainer}>
          <GiftIcon size={50} color={colors.secondary} />
        </View>

        <View style={styles.giftCardsStack}>
          <View style={styles.giftCard}>
            <View style={[styles.giftEmoji, { backgroundColor: colors.secondaryLight }]}>
              <HeadphonesIcon size={22} color={colors.secondary} />
            </View>
            <View style={styles.giftDetails}>
              <Text style={styles.giftName}>Wireless Earbuds</Text>
              <Text style={styles.giftPrice}>$79</Text>
            </View>
          </View>
          <View style={styles.giftCard}>
            <View style={[styles.giftEmoji, { backgroundColor: colors.secondaryLight }]}>
              <BookIcon size={22} color={colors.secondary} />
            </View>
            <View style={styles.giftDetails}>
              <Text style={styles.giftName}>Book Collection</Text>
              <Text style={styles.giftPrice}>$45</Text>
            </View>
          </View>
          <View style={styles.giftCard}>
            <View style={[styles.giftEmoji, { backgroundColor: colors.primaryLight }]}>
              <FlowerIcon size={22} color={colors.primary} />
            </View>
            <View style={styles.giftDetails}>
              <Text style={styles.giftName}>Spa Gift Set</Text>
              <Text style={styles.giftPrice}>$35</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  // Screen 4: Get Started
  const renderScreen4 = () => (
    <LinearGradient
      colors={['#FDEEF3', '#E8F4FD', '#FBDCE9']}
      locations={[0, 0.5, 1]}
      style={styles.slide}
    >
      <View style={[styles.contentTop, { marginTop: 40 }]}>
        <View style={styles.celebrationIconContainer}>
          <CelebrationIcon size={60} color={colors.primary} />
        </View>
        <Text style={[styles.headline, { textAlign: 'center' }]}>You're all{'\n'}<Text style={styles.highlightPink}>set!</Text></Text>
        <Text style={styles.subtitle}>Start adding birthdays and never forget a special day again</Text>
      </View>

      <View style={styles.visualContainer}>
        <View style={styles.featurePills}>
          <View style={styles.featurePill}>
            <BellIcon size={18} color={colors.primary} />
            <Text style={styles.pillText}>Reminders</Text>
          </View>
          <View style={styles.featurePill}>
            <UsersIcon size={18} color={colors.secondary} />
            <Text style={styles.pillText}>Contacts</Text>
          </View>
          <View style={styles.featurePill}>
            <GiftIcon size={18} color={colors.primary} />
            <Text style={styles.pillText}>Gift Ideas</Text>
          </View>
          <View style={styles.featurePill}>
            <CalendarIcon size={18} color={colors.secondary} />
            <Text style={styles.pillText}>Calendar</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderItem = ({ item, index }) => {
    switch (index) {
      case 0:
        return renderScreen1();
      case 1:
        return renderScreen2();
      case 2:
        return renderScreen3();
      case 3:
        return renderScreen4();
      default:
        return renderScreen1();
    }
  };

  const isBlueScreen = currentIndex === 1 || currentIndex === 2;
  const isLastScreen = currentIndex === 3;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={[1, 2, 3, 4]}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item, index) => index.toString()}
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
          {[0, 1, 2, 3].map((index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
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

        {/* Next button */}
        <TouchableOpacity onPress={scrollToNext} activeOpacity={0.9}>
          <LinearGradient
            colors={isBlueScreen ? [colors.secondary, colors.primaryAccent] : [colors.primaryAccent, colors.secondary]}
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>
              {isLastScreen ? 'Get Started' : 'Next'}
            </Text>
            <Text style={styles.nextButtonArrow}>
              {isLastScreen ? '🚀' : '→'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip / Sign in text */}
        {!isLastScreen ? (
          <TouchableOpacity onPress={skipToLogin} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={skipToLogin} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginHighlight}>Sign in</Text>
            </Text>
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  contentTop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headline: {
    fontFamily: 'Outfit-Medium',
    fontSize: 26,
    color: colors.textPrimary,
    lineHeight: 38,
    letterSpacing: 0.3,
  },
  highlightPink: {
    color: colors.primary,
  },
  highlightBlue: {
    color: colors.secondary,
  },
  subtitle: {
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 20,
    letterSpacing: 0.3,
  },
  visualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Screen 1 styles
  bellContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  bellIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellRing: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.primaryAccent,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 14,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryAccent,
    marginTop: 5,
    marginRight: 10,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: colors.textPrimary,
  },
  notifText: {
    fontFamily: 'Outfit-Light',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  notifTime: {
    fontFamily: 'Outfit-Light',
    fontSize: 11,
    color: colors.textLight,
  },
  miniCalendar: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  miniCalHeader: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  miniCalGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  miniCalDay: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: colors.textPrimary,
    width: 36,
    height: 36,
    textAlign: 'center',
    lineHeight: 36,
  },
  miniCalHighlight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCalDayHighlight: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: colors.textWhite,
  },

  // Screen 2 styles
  floatingAvatars: {
    position: 'relative',
    width: 150,
    height: 100,
    marginBottom: 20,
  },
  floatAvatar: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: colors.background,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  avatar1: {
    top: 0,
    left: 0,
  },
  avatar2: {
    top: 10,
    left: 50,
    zIndex: 2,
  },
  avatar3: {
    top: 0,
    right: 0,
  },
  plusIcon: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -18,
    width: 36,
    height: 36,
    backgroundColor: colors.secondary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  contactsCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  contactCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  contactName: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Screen 3 styles
  giftBoxIconContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  giftCardsStack: {
    width: '100%',
  },
  giftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  giftEmoji: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  giftDetails: {
    flex: 1,
  },
  giftName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  giftPrice: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: colors.secondary,
  },

  // Screen 4 styles
  celebrationIconContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
    gap: 6,
  },
  pillText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: colors.textPrimary,
  },

  // Footer styles
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: colors.primaryAccent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  nextButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: colors.textWhite,
    letterSpacing: 0.8,
  },
  nextButtonArrow: {
    fontSize: 16,
    color: colors.textWhite,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  skipText: {
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    color: colors.textLight,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 15,
  },
  loginText: {
    fontFamily: 'Outfit-Light',
    fontSize: 13,
    color: colors.textSecondary,
  },
  loginHighlight: {
    fontFamily: 'Outfit-SemiBold',
    color: colors.primary,
  },
});

export default OnboardingScreen;
