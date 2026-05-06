import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Polyline, Rect, Line } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { getProfile, getDashboardStats, clearUserCredentials } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

const { width } = Dimensions.get('window');

// User Icon SVG
const UserIcon = ({ size = 32, color = 'white' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

// Bell Icon SVG
const BellIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

// Chevron Right Icon SVG
const ChevronRightIcon = ({ size = 16, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

// Mail Icon SVG (Invitations)
const MailIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

// Calendar Plus Icon SVG (Add Event)
const CalendarPlusIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
    <Line x1="12" y1="14" x2="12" y2="18" />
    <Line x1="10" y1="16" x2="14" y2="16" />
  </Svg>
);

// Settings Icon SVG
const SettingsIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

// Sparkle decoration component
const Sparkle = ({ style, size = 8, color = '#f4cae8' }) => (
  <Animated.View style={[styles.sparkle, style]}>
    <View style={[styles.sparkleInner, { width: size, height: size, backgroundColor: color }]} />
  </Animated.View>
);

const menuItems = [
  { id: '1', icon: BellIcon, title: 'Notifications', route: 'Notifications' },
  { id: '2', icon: MailIcon, title: 'Invite Friends', route: 'Invitations' },
  { id: '3', icon: CalendarPlusIcon, title: 'Add Event', route: 'AddEvent' },
  { id: '4', icon: SettingsIcon, title: 'Settings', route: 'Settings' },
];

// Gradient Text Component for stat values
const GradientStatValue = ({ value, glowAnim }) => (
  <Animated.View style={{
    transform: [{
      scale: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05],
      }),
    }],
  }}>
    <MaskedView
      maskElement={
        <Text style={styles.statValueMask}>{value}</Text>
      }
    >
      <LinearGradient
        colors={['#ca9ad6', '#70d0dd']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.statValueMask, { opacity: 0 }]}>{value}</Text>
      </LinearGradient>
    </MaskedView>
  </Animated.View>
);

const ProfileScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const scrollViewRef = useRef(null);
  const { alertConfig, showAlert, hideAlert } = useAlert();

  // Scroll to top when screen is focused
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // State for API data
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    photoUrl: null,
    avatarType: null,
  });
  const [stats, setStats] = useState({
    contactsCount: 0,
    upcomingEventsCount: 0,
    giftsGivenCount: 0,
  });

  // Handle logout
  const handleLogout = () => {
    showAlert({
      type: 'warning',
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {}
        },
        {
          text: 'Log Out',
          onPress: async () => {
            try {
              await clearUserCredentials();
              await signOut();
            } catch (error) {
              console.log('Logout error:', error);
            }
          }
        },
      ],
    });
  };

  // Animation values
  const cardAnim = useRef(new Animated.Value(0)).current;
  const menuAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;
  const logoutAnim = useRef(new Animated.Value(0)).current;

  // Premium animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;
  const sparkleAnim1 = useRef(new Animated.Value(0)).current;
  const sparkleAnim2 = useRef(new Animated.Value(0)).current;
  const sparkleAnim3 = useRef(new Animated.Value(0)).current;

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Fetch profile and stats data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, statsRes] = await Promise.all([
          getProfile().catch(() => ({ user: null })),
          getDashboardStats().catch(() => ({ contactsCount: 0, upcomingEventsCount: 0, giftsGivenCount: 0 })),
        ]);

        if (profileRes.user) {
          setProfile({
            name: profileRes.user.name || '',
            email: profileRes.user.email || '',
            photoUrl: profileRes.user.photoUrl || null,
            avatarType: profileRes.user.avatarType || null,
          });
        }

        setStats({
          contactsCount: statsRes.contactsCount || 0,
          upcomingEventsCount: statsRes.upcomingEventsCount || 0,
          giftsGivenCount: statsRes.giftsGivenCount || 0,
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Entry animations
    Animated.sequence([
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.stagger(100, menuAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        })
      )),
      Animated.timing(logoutAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
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

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Avatar pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Menu icon pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle animations
    const createSparkleAnimation = (anim, delay) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 2500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    createSparkleAnimation(sparkleAnim1, 0);
    createSparkleAnimation(sparkleAnim2, 800);
    createSparkleAnimation(sparkleAnim3, 1600);
  }, []);

  const createSlideStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateX: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 0],
      }),
    }],
  });

  // Sparkle styles
  const sparkle1Style = {
    opacity: sparkleAnim1,
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        }),
      },
      {
        rotate: sparkleAnim1.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
      {
        scale: sparkleAnim1.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 1.2, 0.8],
        }),
      },
    ],
  };

  const sparkle2Style = {
    opacity: sparkleAnim2,
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
      {
        rotate: sparkleAnim2.interpolate({
          inputRange: [0, 1],
          outputRange: ['45deg', '225deg'],
        }),
      },
      {
        scale: sparkleAnim2.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.6, 1, 0.6],
        }),
      },
    ],
  };

  const sparkle3Style = {
    opacity: sparkleAnim3,
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
      {
        rotate: sparkleAnim3.interpolate({
          inputRange: [0, 1],
          outputRange: ['90deg', '270deg'],
        }),
      },
      {
        scale: sparkleAnim3.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.7, 1],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient - Diagonal */}
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#fbe5f5', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Sparkles */}
      <Sparkle style={[{ top: 60, right: 30 }, sparkle1Style]} size={10} color="#f4cae8" />
      <Sparkle style={[{ top: 140, left: 25 }, sparkle2Style]} size={7} color="#70d0dd" />
      <Sparkle style={[{ top: 100, right: 70 }, sparkle3Style]} size={8} color="#ca9ad6" />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ca9ad6" />
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <Animated.View style={[
          styles.profileCardContainer,
          {
            opacity: cardAnim,
            transform: [
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}>
          <LinearGradient
            colors={['#fbe5f5', '#ccf9ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            {/* Avatar with glow ring */}
            <Animated.View style={[
              styles.avatarContainer,
              {
                transform: [{ scale: avatarPulse }],
              }
            ]}>
              {/* Glow ring */}
              <Animated.View style={[
                styles.avatarGlowRing,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.7],
                  }),
                  transform: [{
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  }],
                }
              ]} />
              <LinearGradient
                colors={['#f4cae8', '#70d0dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                {profile.photoUrl ? (
                  <Image
                    source={{ uri: profile.photoUrl }}
                    style={styles.avatarImage}
                  />
                ) : profile.name ? (
                  <Text style={styles.avatarInitials}>{getInitials(profile.name)}</Text>
                ) : (
                  <UserIcon size={32} color="white" />
                )}
              </LinearGradient>
            </Animated.View>

            <Text style={styles.profileName}>{profile.name || 'User'}</Text>
            <Animated.Text style={[
              styles.profileEmail,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }
            ]}>
              {profile.email || 'No email'}
            </Animated.Text>

            {/* Stats with gradient values */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <GradientStatValue value={String(stats.contactsCount)} glowAnim={glowAnim} />
                <Text style={styles.statLabel}>Contacts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <GradientStatValue value={String(stats.upcomingEventsCount)} glowAnim={glowAnim} />
                <Text style={styles.statLabel}>Events</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <GradientStatValue value={String(stats.giftsGivenCount)} glowAnim={glowAnim} />
                <Text style={styles.statLabel}>Gifts</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isAlternate = index % 2 === 1;
            return (
              <Animated.View
                key={item.id}
                style={[styles.menuItem, createSlideStyle(menuAnims[index])]}
              >
                <TouchableOpacity style={styles.menuItemInner} activeOpacity={0.7} onPress={() => item.route && navigation.navigate(item.route)}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <LinearGradient
                      colors={isAlternate ? ['#ccf9ff', '#fbe5f5'] : ['#fbe5f5', '#ccf9ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.menuIcon}
                    >
                      <IconComponent size={20} color="#ca9ad6" />
                    </LinearGradient>
                  </Animated.View>
                  <Text style={styles.menuText}>{item.title}</Text>
                  <Animated.View style={{
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  }}>
                    <ChevronRightIcon size={16} color="#6b3a8a" />
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Logout Button */}
        <Animated.View style={[
          styles.logoutContainer,
          {
            opacity: logoutAnim,
            transform: [{
              translateY: logoutAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          }
        ]}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleLogout}>
            <LinearGradient
              colors={['#fbe5f5', '#f4cae8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutBtn}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sparkle: {
    position: 'absolute',
    zIndex: 10,
  },
  sparkleInner: {
    borderRadius: 50,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 120,
  },
  profileCardContainer: {
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarContainer: {
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlowRing: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 47.5,
    backgroundColor: '#f4cae8',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(202,154,214,0.3)',
  },
  statValueMask: {
    fontSize: 24,
    fontFamily: 'Handlee_400Regular',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 4,
  },
  menuSection: {
    marginBottom: 16,
  },
  menuItem: {
    marginBottom: 10,
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  logoutContainer: {
    marginTop: 8,
  },
  logoutBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 100,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarInitials: {
    fontSize: 24,
    fontFamily: 'Handlee_400Regular',
    color: 'white',
  },
});

export default ProfileScreen;
