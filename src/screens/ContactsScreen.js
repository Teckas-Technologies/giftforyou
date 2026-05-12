import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  Easing,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Circle, Line, Rect, Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { getCircles } from '../services/api';

const { width, height } = Dimensions.get('window');

// Search Icon SVG
const SearchIcon = ({ size = 18, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

// Calendar Icon SVG
const CalendarIcon = ({ size = 12, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

// Plus Icon SVG
const PlusIcon = ({ size = 24, color = 'white' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

// Users Icon for Discover
const UsersIcon = ({ size = 22, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

// Chevron Right Icon
const ChevronRightIcon = ({ size = 18, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

// Sparkle decoration component
const Sparkle = ({ style, size = 8, color = '#f4cae8' }) => (
  <Animated.View style={[styles.sparkle, style]}>
    <View style={[styles.sparkleInner, { width: size, height: size, backgroundColor: color }]} />
  </Animated.View>
);

// Helper to get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper to format birthday date
const formatBirthday = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

// Helper to get relation tag type
const getRelationTag = (relationship) => {
  const familyTypes = ['Parent', 'Sibling', 'Child', 'Spouse', 'Grandparent', 'Relative', 'Family'];
  const workTypes = ['Colleague', 'Boss', 'Client', 'Business'];

  if (familyTypes.some(t => relationship?.toLowerCase().includes(t.toLowerCase()))) {
    return 'family';
  }
  if (workTypes.some(t => relationship?.toLowerCase().includes(t.toLowerCase()))) {
    return 'work';
  }
  return 'friend';
};

const getTagStyle = (tag) => {
  switch (tag) {
    case 'family':
      return { bg: '#fbe5f5', color: '#ca9ad6' };
    case 'friend':
      return { bg: '#ccf9ff', color: '#70d0dd' };
    case 'work':
      return { bg: '#E8F5E9', color: '#43A047' };
    default:
      return { bg: '#fbe5f5', color: '#ca9ad6' };
  }
};

const getAvatarStyle = (colorType) => {
  if (colorType === 'pink') {
    return { bg: '#fbe5f5', color: '#ca9ad6' };
  }
  return { bg: '#ccf9ff', color: '#70d0dd' };
};

const ContactsScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch contacts from API
  const fetchContacts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getCircles();
      const contactsList = response.circles || response.contacts || [];

      // Transform API data to component format
      const transformedContacts = contactsList.map((contact, index) => {
        // Handle nested member object from API
        const memberName = contact.member?.name || contact.memberName || contact.guestName || contact.name || 'Unknown';
        const memberBirthday = contact.member?.birthday || contact.memberBirthday || contact.guestBirthday || contact.birthday;

        return {
          id: contact.id || contact._id || String(index),
          name: memberName,
          initials: getInitials(memberName),
          birthday: formatBirthday(memberBirthday),
          relation: contact.relationship || 'Friend',
          relationTag: getRelationTag(contact.relationship),
          colorType: index % 2 === 0 ? 'pink' : 'blue',
          status: contact.status,
          isPending: contact.status === 'pending',
        };
      });

      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [fetchContacts])
  );

  const onRefresh = useCallback(() => {
    fetchContacts(true);
  }, [fetchContacts]);

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;

  // Premium animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim1 = useRef(new Animated.Value(0)).current;
  const sparkleAnim2 = useRef(new Animated.Value(0)).current;
  const sparkleAnim3 = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animations with spring physics
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(fabAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // FAB continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.12,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation for decorations
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

    // Sparkle animations with different timings
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

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);


  const createFadeStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }),
    }],
  });

  const filteredContacts = contacts.filter(contact =>
    contact.name && contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Sparkle float transforms
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Background Gradient - Diagonal */}
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Sparkle Decorations */}
      <Sparkle style={[{ top: 80, right: 30 }, sparkle1Style]} size={10} color="#f4cae8" />
      <Sparkle style={[{ top: 150, left: 25 }, sparkle2Style]} size={7} color="#70d0dd" />
      <Sparkle style={[{ top: 200, right: 50 }, sparkle3Style]} size={8} color="#ca9ad6" />

      {/* Header */}
      <Animated.View style={[styles.header, createFadeStyle(headerAnim)]}>
        <MaskedView
          maskElement={
            <Text style={styles.headerTitleMask}>Contacts</Text>
          }
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Contacts</Text>
          </LinearGradient>
        </MaskedView>
        <Animated.Text style={[
          styles.headerSubtitle,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          }
        ]}>
          {contacts.length} contacts saved
        </Animated.Text>
      </Animated.View>

      {/* Search Bar */}
      <View style={[
        styles.searchBar,
        searchFocused && styles.searchBarFocused,
      ]}>
        <SearchIcon size={18} color={searchFocused ? '#ca9ad6' : '#6b3a8a'} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#6b3a8a"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={true}
          underlineColorAndroid="transparent"
        />
      </View>

      {/* Discover People Card - Hide when searching */}
      {!searchText && (
        <TouchableOpacity
          style={styles.discoverCard}
          onPress={() => navigation.navigate('Discover')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#fbe5f5', '#ccf9ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.discoverCardGradient}
          >
            <View style={styles.discoverIconContainer}>
              <UsersIcon size={22} color="#ca9ad6" />
            </View>
            <View style={styles.discoverTextContainer}>
              <Text style={styles.discoverTitle}>People You May Know</Text>
              <Text style={styles.discoverSubtitle}>Discover and connect with friends</Text>
            </View>
            <ChevronRightIcon size={20} color="#ca9ad6" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ca9ad6']}
            tintColor="#ca9ad6"
          />
        }
      >
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ca9ad6" />
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredContacts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchText ? 'No contacts found' : 'No contacts yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchText ? 'Try a different search' : 'Add your first contact using the + button'}
            </Text>
          </View>
        )}

        {/* Contact List */}
        {!loading && filteredContacts.map((contact, index) => {
          const avatarStyle = getAvatarStyle(contact.colorType);
          const tagStyle = getTagStyle(contact.relationTag);

          return (
            <View
              key={contact.id}
              style={styles.contactItem}
            >
              <TouchableOpacity style={styles.contactItemInner} activeOpacity={0.7} onPress={() => navigation.navigate('ContactDetail', { contactId: contact.id })}>
                {/* Avatar with glow */}
                <Animated.View style={[
                  styles.avatarGlow,
                  {
                    shadowOpacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 0.5],
                    }),
                    shadowColor: contact.colorType === 'pink' ? '#ca9ad6' : '#70d0dd',
                  }
                ]}>
                  <LinearGradient
                    colors={contact.colorType === 'pink'
                      ? ['#fbe5f5', '#f4cae8']
                      : ['#ccf9ff', '#a8e6f0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                  >
                    <Text style={[styles.avatarText, { color: avatarStyle.color }]}>
                      {contact.initials}
                    </Text>
                  </LinearGradient>
                </Animated.View>

                {/* Details */}
                <View style={styles.contactDetails}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <View style={styles.contactBirthday}>
                    <CalendarIcon size={12} color="#6b3a8a" />
                    <Text style={styles.birthdayText}>
                      {contact.isPending ? 'Waiting for them to accept' : contact.birthday}
                    </Text>
                  </View>
                </View>

                {/* Pending badge or Relation Tag */}
                {contact.isPending ? (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Requested</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={contact.relationTag === 'family'
                      ? ['#fbe5f5', '#f4cae8']
                      : contact.relationTag === 'friend'
                      ? ['#ccf9ff', '#a8e6f0']
                      : ['#E8F5E9', '#C8E6C9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.relationTag}
                  >
                    <Text style={[styles.relationTagText, { color: tagStyle.color }]}>
                      {contact.relation}
                    </Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB with enhanced pulse and glow */}
      <Animated.View style={[
        styles.fab,
        {
          opacity: fabAnim,
          transform: [
            {
              scale: Animated.multiply(
                fabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                fabPulse
              ),
            },
          ],
        },
      ]}>
        {/* Glow ring */}
        <Animated.View style={[
          styles.fabGlowRing,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7],
            }),
            transform: [{
              scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.3],
              }),
            }],
          },
        ]} />
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Invitations')}>
          <LinearGradient
            colors={['#f4cae8', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <PlusIcon size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    paddingTop: 50,
    marginBottom: 18,
  },
  headerTitleMask: {
    fontSize: 24,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: '#ca9ad6',
    shadowOpacity: 0.25,
    elevation: 6,
  },
  discoverCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  discoverCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  discoverIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverTextContainer: {
    flex: 1,
  },
  discoverTitle: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  discoverSubtitle: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  contactItem: {
    marginBottom: 12,
  },
  contactItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarGlow: {
    borderRadius: 26,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontFamily: 'Handlee_400Regular',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  contactBirthday: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  birthdayText: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  relationTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  relationTagText: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
  },
  pendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f4e8f7',
    borderWidth: 1,
    borderColor: 'rgba(202, 154, 214, 0.4)',
  },
  pendingBadgeText: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  fab: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlowRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f4cae8',
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default ContactsScreen;
