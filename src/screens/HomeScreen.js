import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 32; // outer scroll has 16px horizontal padding on each side
const CARD_GAP = 12;
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboardStats, getUpcomingEvents, getProfile } from '../services/api';

// Users Icon SVG
const UsersIcon = ({ size = 18, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

// Calendar Icon SVG
const CalendarIcon = ({ size = 18, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

// Gift Icon SVG
const GiftIcon = ({ size = 18, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="8" width="18" height="12" rx="2" />
    <Path d="M12 8V3" />
    <Path d="M3 12h18" />
  </Svg>
);

// Cake Icon for Birthdays
const CakeIcon = ({ size = 18, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <Path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <Path d="M2 21h20" />
    <Path d="M7 8v2" />
    <Path d="M12 8v2" />
    <Path d="M17 8v2" />
    <Path d="M7 4h.01" />
    <Path d="M12 4h.01" />
    <Path d="M17 4h.01" />
  </Svg>
);

// Sparkle Icon
const SparkleIcon = ({ size = 16, color = '#70d0dd' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </Svg>
);

// Helper to get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Helper to format date
const formatEventDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  return `${day}. ${month}`;
};

// Helper to get days until event
const getDaysUntil = (dateStr) => {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper to get badge info
const getBadgeInfo = (daysUntil) => {
  if (daysUntil === 0) return { text: 'today', type: 'urgent' };
  if (daysUntil === 1) return { text: 'tomorrow', type: 'urgent' };
  if (daysUntil <= 7) return { text: `in ${daysUntil} days`, type: 'soon' };
  return { text: `in ${daysUntil} days`, type: 'normal' };
};

const getAvatarStyle = (index) => {
  if (index % 2 === 0) {
    return { bg: '#fbe5f5', color: '#ca9ad6', colorType: 'pink' };
  }
  return { bg: '#ccf9ff', color: '#70d0dd', colorType: 'blue' };
};

const HomeScreen = ({ navigation }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    contactsCount: 0,
    upcomingEventsCount: 0,
    birthdaysThisMonth: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const sectionAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;
  const quickAnim = useRef(new Animated.Value(0)).current;

  // Premium animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;

  // Fetch data from API - auto-refresh when screen comes into focus
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [profileRes, statsRes, eventsRes] = await Promise.all([
        getProfile().catch(() => ({ user: { name: 'User' } })),
        getDashboardStats().catch(() => ({ contactsCount: 0, upcomingEventsCount: 0, birthdaysThisMonth: 0 })),
        getUpcomingEvents(5).catch(() => ({ events: [] })),
      ]);

      // Set user name
      if (profileRes?.user?.name) {
        setUserName(profileRes.user.name.split(' ')[0]); // First name only
      }

      // Set stats
      if (statsRes) {
        setStats({
          contactsCount: statsRes.contactsCount || 0,
          upcomingEventsCount: statsRes.upcomingEventsCount || 0,
          birthdaysThisMonth: statsRes.birthdaysThisMonth || 0,
        });
      }

      // Set upcoming events
      if (eventsRes?.events) {
        setUpcomingEvents(eventsRes.events);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    // Entry animations with spring physics
    Animated.sequence([
      Animated.spring(headerAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.stagger(80, statsAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        })
      )),
      Animated.timing(sectionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(100, cardAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 45,
          useNativeDriver: true,
        })
      )),
      Animated.spring(quickAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for icons
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle rotation
    Animated.loop(
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Breathe animation for cards
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.02,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const createFadeStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [25, 0],
      }),
    }, {
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
      }),
    }],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const sparkleRotate = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Background Gradient - Diagonal */}
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Decorative Elements */}
      <Animated.View style={[styles.floatingSparkle1, {
        transform: [{ rotate: sparkleRotate }, { translateY: floatTranslateY }],
        opacity: glowOpacity
      }]}>
        <SparkleIcon size={20} color="#ca9ad6" />
      </Animated.View>
      <Animated.View style={[styles.floatingSparkle2, {
        transform: [{ rotate: sparkleRotate }, { translateY: floatTranslateY }],
        opacity: glowOpacity
      }]}>
        <SparkleIcon size={14} color="#70d0dd" />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with float animation */}
        <Animated.View style={[
          styles.header,
          createFadeStyle(headerAnim),
          { transform: [{ translateY: floatTranslateY }] }
        ]}>
          <Text style={styles.homeLabel}>HOME</Text>
          <MaskedView
            maskElement={
              <Text style={styles.greetingMask}>{getGreeting()}, {userName || 'there'}!</Text>
            }
          >
            <LinearGradient
              colors={['#330c54', '#6b3a8a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.greetingMask, { opacity: 0 }]}>{getGreeting()}, {userName || 'there'}!</Text>
            </LinearGradient>
          </MaskedView>
        </Animated.View>

        {/* Stats Row with enhanced animations */}
        <View style={styles.statsRow}>
          {[
            { icon: UsersIcon, value: String(stats.contactsCount), label: 'Contacts', colors: ['#fbe5f5', '#f4cae8', '#ccf9ff'] },
            { icon: CalendarIcon, value: String(stats.upcomingEventsCount), label: 'Events', colors: ['#ccf9ff', '#a8e6f0', '#fbe5f5'] },
            { icon: CakeIcon, value: String(stats.birthdaysThisMonth), label: 'Birthdays', colors: ['#fbe5f5', '#f4cae8', '#ccf9ff'] },
          ].map((stat, index) => (
            <Animated.View
              key={index}
              style={[
                styles.statCardContainer,
                createFadeStyle(statsAnims[index]),
                { transform: [{ scale: breatheAnim }] }
              ]}
            >
              <LinearGradient
                colors={stat.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                {/* Glow effect */}
                <Animated.View style={[styles.statGlow, { opacity: glowOpacity }]} />

                <Animated.View style={[
                  styles.statIcon,
                  { transform: [{ scale: pulseAnim }] }
                ]}>
                  <stat.icon size={20} color="#ca9ad6" />
                </Animated.View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* Section Header */}
        <Animated.View style={[styles.sectionHeader, createFadeStyle(sectionAnim)]}>
          <Text style={styles.sectionLabel}>Upcoming events</Text>
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('Calendar')}>
            <MaskedView
              maskElement={
                <Text style={styles.seeAllMask}>See all →</Text>
              }
            >
              <LinearGradient
                colors={['#ca9ad6', '#70d0dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.seeAllMask, { opacity: 0 }]}>See all →</Text>
              </LinearGradient>
            </MaskedView>
          </TouchableOpacity>
        </Animated.View>

        {/* Event Cards with premium styling - Horizontal Scroll */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ca9ad6" />
          </View>
        ) : upcomingEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No upcoming events</Text>
            <Text style={styles.emptySubtext}>Add events to see them here</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            contentContainerStyle={styles.eventsScrollContent}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP)
              );
              if (index !== activeEventIndex && index >= 0) {
                setActiveEventIndex(index);
              }
            }}
          >
          {upcomingEvents.slice(0, 5).map((event, index) => {
            const avatarStyle = getAvatarStyle(index);
            const daysUntil = getDaysUntil(event.event_date || event.eventDate);
            const badgeInfo = getBadgeInfo(daysUntil);
            const contactName = event.contact_name || event.title || 'Event';

            return (
              <Animated.View
                key={event.id}
                style={[styles.birthdayCard, createFadeStyle(cardAnims[index] || cardAnims[0])]}
              >
                <TouchableOpacity
                  style={styles.birthdayCardInner}
                  activeOpacity={0.7}
                  onPress={() => {
                    navigation.navigate('EventDetail', {
                      eventId: event.id,
                      event: {
                        ...event,
                        eventType: event.event_type || event.eventType,
                        eventDate: event.event_date || event.eventDate,
                        contactName: event.contact_name || event.contactName,
                        circleId: event.circle_id || event.circleId,
                      }
                    });
                  }}
                >
                  {/* Card glow effect */}
                  <Animated.View style={[
                    styles.cardGlow,
                    {
                      backgroundColor: avatarStyle.colorType === 'pink' ? '#fbe5f5' : '#ccf9ff',
                      opacity: glowOpacity
                    }
                  ]} />

                  <Animated.View style={[
                    styles.birthdayAvatar,
                    { backgroundColor: avatarStyle.bg },
                    { transform: [{ scale: pulseAnim }] }
                  ]}>
                    <Text style={[styles.birthdayAvatarText, { color: avatarStyle.color }]}>
                      {getInitials(contactName)}
                    </Text>
                  </Animated.View>
                  <View style={styles.birthdayInfo}>
                    <Text style={styles.birthdayName} numberOfLines={1}>{contactName}</Text>
                    <Text style={styles.birthdayRelation} numberOfLines={1}>{event.event_type || event.eventType || 'Event'}</Text>
                  </View>
                  <View style={styles.birthdayDateInfo}>
                    <Text style={styles.birthdayDate}>{formatEventDate(event.event_date || event.eventDate)}</Text>
                    {badgeInfo.type === 'urgent' ? (
                      <LinearGradient
                        colors={['#f4cae8', '#70d0dd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.badgeUrgent}
                      >
                        <Text style={styles.badgeUrgentText}>{badgeInfo.text}</Text>
                      </LinearGradient>
                    ) : (
                      <LinearGradient
                        colors={['#fbe5f5', '#ccf9ff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.badgeSoon}
                      >
                        <Text style={styles.badgeSoonText}>{badgeInfo.text}</Text>
                      </LinearGradient>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
          </ScrollView>
        )}

        {!loading && upcomingEvents.length > 1 && (
          <View style={styles.pagerDots}>
            {upcomingEvents.slice(0, 5).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.pagerDot,
                  i === activeEventIndex && styles.pagerDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Quick Actions with premium styling */}
        <Animated.View style={[styles.quickSection, createFadeStyle(quickAnim)]}>
          <Text style={styles.quickTitle}>Quick actions</Text>

          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickBtnContainer} activeOpacity={0.8} onPress={() => navigation.navigate('Invitations')}>
              <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
                <LinearGradient
                  colors={['#ca9ad6', '#70d0dd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickBtn}
                >
                  <Text style={styles.quickBtnIcon}>💌</Text>
                  <Text style={styles.quickBtnTextWhite}>Invite Friends</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBtnContainer} activeOpacity={0.8} onPress={() => navigation.navigate('AddEvent')}>
              <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
                <LinearGradient
                  colors={['#ccf9ff', '#a8e6f0', '#fbe5f5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickBtn}
                >
                  <Text style={styles.quickBtnIcon}>🎁</Text>
                  <Text style={styles.quickBtnTextBlue}>Add Event</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 120,
  },
  floatingSparkle1: {
    position: 'absolute',
    top: 100,
    right: 30,
    zIndex: 1,
  },
  floatingSparkle2: {
    position: 'absolute',
    top: 180,
    left: 25,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  homeLabel: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  greetingMask: {
    fontSize: 26,
    fontFamily: 'Handlee_400Regular',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  statCardContainer: {
    flex: 1,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  statGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },
  statIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#4a1a6b',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    letterSpacing: 0.3,
  },
  seeAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllMask: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
  },
  eventsScrollContent: {
    gap: CARD_GAP,
  },
  pagerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  pagerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(107, 58, 138, 0.2)',
  },
  pagerDotActive: {
    width: 18,
    backgroundColor: '#ca9ad6',
  },
  birthdayCard: {
    width: CARD_WIDTH,
  },
  birthdayCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    height: 88,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(202, 154, 214, 0.12)',
    shadowColor: '#6b3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  birthdayAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  birthdayAvatarText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
  },
  birthdayInfo: {
    flex: 1,
  },
  birthdayName: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    letterSpacing: 0.3,
  },
  birthdayRelation: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 2,
  },
  birthdayDateInfo: {
    alignItems: 'flex-end',
  },
  birthdayDate: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#4a1a6b',
  },
  badgeUrgent: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#f4cae8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeUrgentText: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  badgeSoon: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
  },
  badgeSoonText: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  quickSection: {
    marginTop: 20,
  },
  quickTitle: {
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  quickBtnFull: {
    marginBottom: 12,
  },
  quickBtnWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 18,
    gap: 10,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickSecondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quickBtnHalf: {
    width: '60%',
  },
  quickBtnContainer: {
    flex: 1,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 8,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  quickBtnIcon: {
    fontSize: 20,
  },
  quickBtnTextWhite: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
    fontWeight: '500',
  },
  quickBtnTextPink: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  quickBtnTextBlue: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#4a8a9a',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
    marginTop: 4,
  },
});

export default HomeScreen;
