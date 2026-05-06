import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { colors } from '../theme';
import { markOnboardingSeenLocal } from '../services/api';

const { width } = Dimensions.get('window');

// Bell Icon
const BellIcon = ({ size = 55, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

// User Icon
const UserIcon = ({ size = 28, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

// Users Icon (for contacts feature pill)
const UsersIcon = ({ size = 16, color = '#70d0dd' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

// Gift Icon
const GiftIcon = ({ size = 55, color = '#70d0dd' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="8" width="18" height="12" rx="2" />
    <Path d="M12 8V3" />
    <Path d="M3 12h18" />
    <Path d="M12 3c-1.5 0-3 1.5-3 3s1.5 2 3 2 3-.5 3-2-1.5-3-3-3z" />
    <Path d="M12 3c1.5 0 3 1.5 3 3s-1.5 2-3 2-3-.5-3-2 1.5-3 3-3z" />
  </Svg>
);

// Small Gift Icon
const SmallGiftIcon = ({ size = 16, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="8" width="18" height="12" rx="2" />
    <Path d="M12 8V3" />
    <Path d="M3 12h18" />
  </Svg>
);

// Headphones Icon
const HeadphonesIcon = ({ size = 20, color = '#70d0dd' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </Svg>
);

// Book Icon
const BookIcon = ({ size = 20, color = '#70d0dd' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Svg>
);

// Spa/Cookie Icon
const SpaIcon = ({ size = 20, color = '#f4cae8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
    <Path d="M8.5 8.5v.01" />
    <Path d="M16 15.5v.01" />
    <Path d="M12 12v.01" />
    <Path d="M11 17v.01" />
    <Path d="M7 14v.01" />
  </Svg>
);

// Calendar Icon
const CalendarIcon = ({ size = 16, color = '#70d0dd' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

// Party/Celebration Icon
const PartyIcon = ({ size = 65, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5.8 11.3 2 22l10.7-3.79" />
    <Path d="M4 3h.01" />
    <Path d="M22 8h.01" />
    <Path d="M15 2h.01" />
    <Path d="M22 20h.01" />
    <Path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
    <Path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" />
    <Path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" />
    <Path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
  </Svg>
);

// Plus Icon
const PlusIcon = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

// Check Icon
const CheckIcon = ({ size = 12, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

const onboardingData = [
  {
    id: '1',
    title: 'Never miss a',
    titleHighlight: 'Birthday',
    titleEnd: 'again',
    theme: 'pink',
  },
  {
    id: '2',
    title: 'Add friends from',
    titleHighlight: 'your contacts',
    theme: 'blue',
  },
  {
    id: '3',
    title: 'Find',
    titleHighlight: 'perfect',
    titleEnd: 'gift ideas',
    theme: 'blue',
  },
  {
    id: '4',
    title: "You're all",
    titleHighlight: 'set!',
    description: 'Start adding birthdays and never forget a special day again',
    theme: 'pink',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Bell shake animation
  const bellShake = useRef(new Animated.Value(0)).current;
  // Ring pulse animation
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;
  // Float animation for avatars
  const floatAnim = useRef(new Animated.Value(0)).current;
  // Wiggle animation for celebration icon
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  // Content fade
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Content fade in
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Bell shake animation (matches CSS keyframes)
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellShake, { toValue: 0, duration: 0, useNativeDriver: true }),
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
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(ringScale, { toValue: 1.5, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Wiggle animation for celebration icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(wiggleAnim, { toValue: -5, duration: 100, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 5, duration: 100, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: -5, duration: 100, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 5, duration: 100, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.delay(1000),
      ])
    ).start();
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await markOnboardingSeenLocal();
      navigation.replace('SignUp');
    }
  };

  const skipToLogin = async () => {
    await markOnboardingSeenLocal();
    navigation.replace('SignUp');
  };

  const bellRotate = bellShake.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const wiggleRotate = wiggleAnim.interpolate({
    inputRange: [-5, 5],
    outputRange: ['-5deg', '5deg'],
  });

  // Slide 1: Bell & Notification
  const NotificationVisual = () => (
    <View style={styles.visualContainer}>
      {/* Bell with shake animation */}
      <View style={styles.bellContainer}>
        <Animated.View style={[
          styles.bellRing,
          {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          }
        ]} />
        <Animated.View style={{ transform: [{ rotate: bellRotate }] }}>
          <BellIcon size={55} color="#ca9ad6" />
        </Animated.View>
      </View>

      {/* Notification Card */}
      <View style={styles.notificationCard}>
        <View style={styles.notifDot} />
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>Anna: Birthday in 30 days</Text>
          <Text style={styles.notifText}>Have you got a gift yet?</Text>
        </View>
        <Text style={styles.notifTime}>now</Text>
      </View>

      {/* Mini Calendar */}
      <View style={styles.miniCalendar}>
        <Text style={styles.miniCalHeader}>March 2026</Text>
        <View style={styles.miniCalGrid}>
          <Text style={styles.calDay}>25</Text>
          <View style={styles.calDayHighlight}>
            <Text style={styles.calDayHighlightText}>26</Text>
          </View>
          <Text style={styles.calDay}>27</Text>
          <Text style={styles.calDay}>28</Text>
        </View>
      </View>
    </View>
  );

  // Slide 2: Contacts
  const ContactsVisual = () => (
    <View style={styles.visualContainer}>
      {/* Floating Avatars */}
      <View style={styles.floatingAvatars}>
        <Animated.View style={[styles.floatAvatar, styles.avatar1, { transform: [{ translateY: floatTranslateY }] }]}>
          <UserIcon size={28} color="#ca9ad6" />
        </Animated.View>
        <Animated.View style={[styles.floatAvatar, styles.avatar2, { transform: [{ translateY: floatTranslateY }] }]}>
          <UserIcon size={28} color="#70d0dd" />
        </Animated.View>
        <Animated.View style={[styles.floatAvatar, styles.avatar3, { transform: [{ translateY: floatTranslateY }] }]}>
          <UserIcon size={28} color="#f4cae8" />
        </Animated.View>
        <View style={styles.plusIcon}>
          <PlusIcon size={22} color="#FFFFFF" />
        </View>
      </View>

      {/* Contacts Card */}
      <View style={styles.contactsCard}>
        <View style={styles.contactRow}>
          <View style={[styles.contactCheck, styles.checked]}>
            <CheckIcon size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.contactName}>Anna</Text>
        </View>
        <View style={styles.contactRow}>
          <View style={[styles.contactCheck, styles.checked]}>
            <CheckIcon size={12} color="#FFFFFF" />
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
  );

  // Slide 3: Gift Ideas
  const GiftIdeasVisual = () => (
    <View style={styles.visualContainer}>
      {/* Gift Icon */}
      <View style={styles.giftBoxIcon}>
        <GiftIcon size={55} color="#70d0dd" />
      </View>

      {/* Gift Cards */}
      <View style={styles.giftCards}>
        <View style={styles.giftCard}>
          <View style={[styles.giftEmoji, { backgroundColor: '#ccf9ff' }]}>
            <HeadphonesIcon size={24} color="#70d0dd" />
          </View>
          <View style={styles.giftDetails}>
            <Text style={styles.giftName}>Wireless Earbuds</Text>
            <Text style={[styles.giftPrice, { color: '#70d0dd' }]}>$79</Text>
          </View>
        </View>
        <View style={styles.giftCard}>
          <View style={[styles.giftEmoji, { backgroundColor: '#ccf9ff' }]}>
            <BookIcon size={24} color="#70d0dd" />
          </View>
          <View style={styles.giftDetails}>
            <Text style={styles.giftName}>Book Collection</Text>
            <Text style={[styles.giftPrice, { color: '#70d0dd' }]}>$45</Text>
          </View>
        </View>
        <View style={styles.giftCard}>
          <View style={[styles.giftEmoji, { backgroundColor: '#fbe5f5' }]}>
            <SpaIcon size={24} color="#f4cae8" />
          </View>
          <View style={styles.giftDetails}>
            <Text style={styles.giftName}>Spa Gift Set</Text>
            <Text style={[styles.giftPrice, { color: '#ca9ad6' }]}>$35</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Slide 4: Get Started
  const GetStartedVisual = () => (
    <View style={styles.visualContainer}>
      {/* Feature Pills */}
      <View style={styles.featurePills}>
        <View style={styles.featurePill}>
          <BellIcon size={20} color="#ca9ad6" />
          <Text style={styles.pillText}>Reminders</Text>
        </View>
        <View style={styles.featurePill}>
          <UsersIcon size={20} color="#70d0dd" />
          <Text style={styles.pillText}>Contacts</Text>
        </View>
        <View style={styles.featurePill}>
          <SmallGiftIcon size={20} color="#ca9ad6" />
          <Text style={styles.pillText}>Gift Ideas</Text>
        </View>
        <View style={styles.featurePill}>
          <CalendarIcon size={20} color="#70d0dd" />
          <Text style={styles.pillText}>Calendar</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const isPink = item.theme === 'pink';
    const highlightColor = isPink ? '#ca9ad6' : '#70d0dd';
    const isLastSlide = index === onboardingData.length - 1;

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={isPink
            ? ['#FDEEF3', '#D4F1F9', '#FBDCE9']
            : ['#D4F1F9', '#EBF5FB', '#B2EBF2']
          }
          locations={[0, 0.5, 1]}
          style={styles.gradientBg}
        />

        <View style={styles.slideContent}>
          {/* Celebration Icon for last slide */}
          {index === 3 && (
            <Animated.View style={[styles.celebrationIcon, { transform: [{ rotate: wiggleRotate }] }]}>
              <PartyIcon size={65} color="#ca9ad6" />
            </Animated.View>
          )}

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.headline}>
              {item.title}{'\n'}
              <Text style={[styles.headlineHighlight, { color: highlightColor }]}>
                {item.titleHighlight}
              </Text>
              {item.titleEnd && <Text style={styles.headline}> {item.titleEnd}</Text>}
            </Text>
          </View>

          {/* Description for last slide */}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          {/* Visual Content */}
          {index === 0 && <NotificationVisual />}
          {index === 1 && <ContactsVisual />}
          {index === 2 && <GiftIdeasVisual />}
          {index === 3 && <GetStartedVisual />}
        </View>

        {/* Footer inside slide */}
        <View style={styles.footer}>
          {renderPagination()}

          <TouchableOpacity onPress={scrollToNext} activeOpacity={0.9}>
            <LinearGradient
              colors={isPink
                ? ['#f4cae8', '#70d0dd']
                : ['#70d0dd', '#f4cae8']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {isLastSlide ? 'Get Started 🚀' : 'Next →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {isLastSlide ? (
            <TouchableOpacity onPress={skipToLogin}>
              <Text style={styles.loginLink}>
                Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={skipToLogin}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    const currentItem = onboardingData[currentIndex];
    const activeColor = currentItem.theme === 'pink' ? '#ca9ad6' : '#70d0dd';

    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((item, index) => {
          const isActive = currentIndex === index;
          const dotColor = item.theme === 'pink' ? '#ca9ad6' : '#70d0dd';
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive && [styles.dotActive, { backgroundColor: dotColor }],
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: contentFade }]}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={0}
        removeClippedSubviews={false}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    height: '100%',
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headline: {
    fontSize: 26,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: 0.5,
  },
  headlineHighlight: {
    fontFamily: 'Handlee_400Regular',
  },
  description: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#4a1a6b',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  celebrationIcon: {
    marginTop: 15,
    marginBottom: 12,
  },
  visualContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 20,
  },

  // Bell & Notification Styles
  bellContainer: {
    position: 'relative',
    marginTop: 15,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#f4cae8',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
    gap: 10,
  },
  notifDot: {
    width: 10,
    height: 10,
    backgroundColor: '#f4cae8',
    borderRadius: 5,
    marginTop: 4,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  notifText: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 2,
  },
  notifTime: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  miniCalendar: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  miniCalHeader: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
    marginBottom: 10,
    color: '#330c54',
  },
  miniCalGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  calDay: {
    width: 40,
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 40,
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  calDayHighlight: {
    width: 40,
    height: 40,
    backgroundColor: '#f4cae8',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayHighlightText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },

  // Floating Avatars Styles
  floatingAvatars: {
    position: 'relative',
    width: 160,
    height: 100,
    marginTop: 15,
    marginBottom: 18,
  },
  floatAvatar: {
    position: 'absolute',
    width: 54,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  avatar1: { top: 0, left: 0 },
  avatar2: { top: 10, left: 52, zIndex: 2 },
  avatar3: { top: 0, right: 0 },
  plusIcon: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 40,
    backgroundColor: '#70d0dd',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#70d0dd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },

  // Contacts Card Styles
  contactsCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
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
    borderBottomColor: '#f4cae8',
    gap: 12,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  contactCheck: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#f4cae8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#70d0dd',
    borderColor: '#70d0dd',
  },
  contactName: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },

  // Gift Cards Styles
  giftBoxIcon: {
    marginTop: 15,
    marginBottom: 18,
  },
  giftCards: {
    width: '100%',
  },
  giftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
    gap: 12,
  },
  giftEmoji: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftDetails: {
    flex: 1,
  },
  giftName: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  giftPrice: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    marginTop: 2,
  },

  // Feature Pills Styles
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  pillText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },

  // Footer Styles
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 45,
    backgroundColor: 'transparent',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dotActive: {
    width: 28,
    borderRadius: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  skipText: {
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 10,
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 10,
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#4a1a6b',
  },
  loginLinkBold: {
    color: '#ca9ad6',
    fontFamily: 'Handlee_400Regular',
  },
});

export default OnboardingScreen;
