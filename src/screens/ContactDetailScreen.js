import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { getCircle, getContactPreferences } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

// Icons
const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const EditIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const MailIcon = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

const CalendarIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const GiftIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 12 20 22 4 22 4 12" />
    <Rect x="2" y="7" width="20" height="5" />
    <Line x1="12" y1="22" x2="12" y2="7" />
    <Path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <Path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </Svg>
);

const HeartIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

const StarIcon = ({ size = 16, color = '#f9a825' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={1}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const PhoneIcon = ({ size = 18, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

const EmailIcon = ({ size = 18, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="4" />
    <Path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </Svg>
);

const ClipboardIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </Svg>
);

const ChevronRightIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

// Default empty contact
const emptyContact = {
  id: '',
  name: '',
  email: '',
  phone: '',
  birthday: null,
  relationship: 'friend',
  nickname: '',
  notes: '',
  avatar: null,
  hasQuestionnaire: false,
  preferences: {
    activities: [],
    activityDetails: '',
    style: [],
    colors: [],
    sizes: {},
    giftTypes: [],
    giftDetails: '',
    causes: [],
    flower: '',
    flowerDetails: '',
    cuisines: [],
    restaurant: '',
    desserts: [],
    movieGenre: [],
    favoriteMovies: '',
    musicGenre: [],
    favoriteArtists: '',
    likesSurprises: null,
    wishlistText: '',
  },
  upcomingEvents: [],
};

const getRelationshipLabel = (relationship) => {
  const labels = {
    family: 'Family',
    friend: 'Friend',
    colleague: 'Colleague',
    partner: 'Partner',
    other: 'Other',
  };
  return labels[relationship] || 'Contact';
};

const getRelationshipEmoji = (relationship) => {
  const emojis = {
    family: '👨‍👩‍👧',
    friend: '👫',
    colleague: '💼',
    partner: '💕',
    other: '👤',
  };
  return emojis[relationship] || '👤';
};

const formatDate = (date) => {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const ContactDetailScreen = ({ navigation, route }) => {
  const contactId = route?.params?.contactId;
  const [contact, setContact] = useState(emptyContact);
  const [loading, setLoading] = useState(true);

  // Custom alert hook
  const { alertConfig, showError, hideAlert } = useAlert();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;
  const sectionAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  const fetchContactDetails = useCallback(async () => {
    if (!contactId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch contact details and preferences in parallel
      const [contactData, preferencesData] = await Promise.all([
        getCircle(contactId),
        getContactPreferences(contactId).catch(() => null), // Preferences may not exist
      ]);

      // Transform API data to component format (handle both snake_case and nested member object)
      const rawContact = contactData.contact || contactData;
      const memberName = rawContact.member?.name || rawContact.guest_name || rawContact.guestName || rawContact.memberName || 'Unknown';
      const memberEmail = rawContact.member?.email || rawContact.guest_email || rawContact.guestEmail || rawContact.memberEmail || '';
      const memberBirthday = rawContact.member?.birthday || rawContact.guest_birthday || rawContact.guestBirthday || rawContact.memberBirthday;
      const memberPhoto = rawContact.member?.profile_photo || rawContact.member?.photo || rawContact.memberPhoto;

      const transformedContact = {
        id: rawContact._id || rawContact.id || contactId,
        name: memberName,
        email: memberEmail,
        phone: rawContact.phone || '',
        birthday: memberBirthday ? new Date(memberBirthday) : null,
        relationship: rawContact.relationship?.toLowerCase() || 'friend',
        nickname: rawContact.nickname || '',
        notes: rawContact.notes || '',
        avatar: memberPhoto || null,
        hasQuestionnaire: !!preferencesData?.preferences,
        preferences: preferencesData?.preferences ? {
          activities: preferencesData.preferences.favoriteActivities || [],
          activityDetails: preferencesData.preferences.activityDetails || '',
          style: preferencesData.preferences.personalStyle || [],
          colors: preferencesData.preferences.favoriteColors || [],
          sizes: preferencesData.preferences.clothingSizes || {},
          giftTypes: preferencesData.preferences.giftTypes || [],
          giftDetails: preferencesData.preferences.giftDetails || '',
          causes: preferencesData.preferences.causesValues || [],
          flower: preferencesData.preferences.favoriteFlower || '',
          flowerDetails: preferencesData.preferences.flowerDetails || '',
          cuisines: preferencesData.preferences.favoriteCuisines || [],
          restaurant: preferencesData.preferences.favoriteRestaurant || '',
          desserts: preferencesData.preferences.favoriteDesserts || [],
          movieGenre: preferencesData.preferences.movieGenre || [],
          favoriteMovies: preferencesData.preferences.favoriteMovies || '',
          musicGenre: preferencesData.preferences.musicGenre || [],
          favoriteArtists: preferencesData.preferences.favoriteArtists || '',
          likesSurprises: preferencesData.preferences.likesSurprises,
          wishlistText: preferencesData.preferences.wishlistText || '',
        } : emptyContact.preferences,
        upcomingEvents: (rawContact.upcomingEvents || []).map(event => ({
          id: event._id || event.id,
          name: event.title || event.eventType,
          date: new Date(event.eventDate),
          type: event.eventType?.toLowerCase() || 'event',
          daysUntil: Math.ceil((new Date(event.eventDate) - new Date()) / (1000 * 60 * 60 * 24)),
        })),
      };

      setContact(transformedContact);
    } catch (error) {
      console.error('Error fetching contact details:', error);
      showError('Failed to load contact details');
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchContactDetails();
  }, [fetchContactDetails]);

  useEffect(() => {
    if (!loading && contact.name) {
      // Run animations after data is loaded
      Animated.sequence([
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(avatarAnim, {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(contentAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.stagger(80, sectionAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          })
        )),
      ]).start();

      // Avatar pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(avatarPulse, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(avatarPulse, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading, contact.name]);

  const createSlideStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }),
    }],
  });

  const handleSendInvitation = () => {
    navigation.navigate('Invitations');
  };

  // Questionnaire is handled via web form only - commented for potential future use
  // const handleViewQuestionnaire = () => {
  //   navigation.navigate('Questionnaire', { contactId: contact.id, viewOnly: true });
  // };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#ccf9ff', '#fbe5f5', '#FFFFFF']}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BackIcon size={24} color="#6b3a8a" />
          </TouchableOpacity>
          <MaskedView
            maskElement={
              <Text style={styles.headerTitleMask}>Contact</Text>
            }
          >
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Contact</Text>
            </LinearGradient>
          </MaskedView>
          <View style={styles.editButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ca9ad6" />
          <Text style={styles.loadingText}>Loading contact...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#fbe5f5', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon size={24} color="#6b3a8a" />
        </TouchableOpacity>
        <MaskedView
          maskElement={
            <Text style={styles.headerTitleMask}>Contact</Text>
          }
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Contact</Text>
          </LinearGradient>
        </MaskedView>
        <TouchableOpacity style={styles.editButton}>
          <EditIcon size={20} color="#6b3a8a" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <Animated.View style={[
          styles.profileHeader,
          {
            opacity: avatarAnim,
            transform: [{ scale: Animated.multiply(avatarAnim, avatarPulse) }],
          }
        ]}>
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>
              {getInitials(contact.name)}
            </Text>
          </LinearGradient>
          <Text style={styles.contactName}>{contact.name}</Text>
          {contact.nickname && (
            <Text style={styles.nickname}>"{contact.nickname}"</Text>
          )}
          <View style={styles.relationshipBadge}>
            <Text style={styles.relationshipEmoji}>
              {getRelationshipEmoji(contact.relationship)}
            </Text>
            <Text style={styles.relationshipText}>
              {getRelationshipLabel(contact.relationship)}
            </Text>
          </View>
        </Animated.View>

        {/* Quick Info */}
        <Animated.View style={[styles.section, createSlideStyle(sectionAnims[0])]}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <EmailIcon size={18} color="#6b3a8a" />
            </View>
            <Text style={styles.infoText}>{contact.email}</Text>
          </View>
          {contact.phone && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <PhoneIcon size={18} color="#6b3a8a" />
              </View>
              <Text style={styles.infoText}>{contact.phone}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <CalendarIcon size={18} color="#6b3a8a" />
            </View>
            <Text style={styles.infoText}>Birthday: {formatDate(contact.birthday)}</Text>
          </View>
        </Animated.View>

        {/* Upcoming Events */}
        <Animated.View style={[styles.section, createSlideStyle(sectionAnims[1])]}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={20} color="#ca9ad6" />
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
          </View>
          {contact.upcomingEvents.length > 0 ? (
            contact.upcomingEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <LinearGradient
                  colors={['#fbe5f5', '#ccf9ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.eventIconBg}
                >
                  <Text style={styles.eventEmoji}>🎂</Text>
                </LinearGradient>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                </View>
                <View style={styles.daysUntilBadge}>
                  <Text style={styles.daysUntilText}>{event.daysUntil}d</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming events</Text>
          )}
        </Animated.View>

        {/* Gift Preferences */}
        {contact.hasQuestionnaire && (
          <Animated.View style={[styles.section, createSlideStyle(sectionAnims[2])]}>
            <View style={styles.sectionHeader}>
              <GiftIcon size={20} color="#ca9ad6" />
              <Text style={styles.sectionTitle}>Gift Preferences</Text>
            </View>

            {/* Gift Types */}
            {contact.preferences.giftTypes?.length > 0 && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Loves to receive</Text>
                <View style={styles.tagContainer}>
                  {contact.preferences.giftTypes.map((type, index) => (
                    <LinearGradient
                      key={index}
                      colors={['#fbe5f5', '#ccf9ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientTag}
                    >
                      <HeartIcon size={12} color="#ca9ad6" />
                      <Text style={styles.gradientTagText}>{type}</Text>
                    </LinearGradient>
                  ))}
                </View>
                {contact.preferences.giftDetails ? (
                  <Text style={styles.preferenceDetail}>{contact.preferences.giftDetails}</Text>
                ) : null}
              </View>
            )}

            {/* Interests/Activities */}
            {contact.preferences.activities?.length > 0 && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Interests & Hobbies</Text>
                <View style={styles.tagContainer}>
                  {contact.preferences.activities.map((activity, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{activity}</Text>
                    </View>
                  ))}
                </View>
                {contact.preferences.activityDetails ? (
                  <Text style={styles.preferenceDetail}>{contact.preferences.activityDetails}</Text>
                ) : null}
              </View>
            )}

            {/* Personal Style */}
            {contact.preferences.style?.length > 0 && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Personal Style</Text>
                <View style={styles.tagContainer}>
                  {contact.preferences.style.map((style, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{style}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Favorite Colors */}
            {contact.preferences.colors?.length > 0 && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Favorite Colors</Text>
                <View style={styles.tagContainer}>
                  {contact.preferences.colors.map((color, index) => (
                    <View key={index} style={[styles.colorTag, { backgroundColor: '#fbe5f5' }]}>
                      <Text style={styles.tagText}>{color}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Likes Surprises */}
            {contact.preferences.likesSurprises !== null && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Surprise Preference</Text>
                <View style={[styles.surpriseBadge, { backgroundColor: contact.preferences.likesSurprises ? '#e8f5e9' : '#fff3e0' }]}>
                  <Text style={[styles.surpriseText, { color: contact.preferences.likesSurprises ? '#43a047' : '#f57c00' }]}>
                    {contact.preferences.likesSurprises ? '🎉 Loves surprises!' : '📋 Prefers to know ahead'}
                  </Text>
                </View>
              </View>
            )}

            {/* Causes & Values */}
            {contact.preferences.causes?.length > 0 && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Causes They Care About</Text>
                <View style={styles.tagContainer}>
                  {contact.preferences.causes.map((cause, index) => (
                    <View key={index} style={styles.causeTag}>
                      <Text style={styles.causeTagText}>💚 {cause}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* Food & Flowers */}
        {contact.hasQuestionnaire && (contact.preferences.flower || contact.preferences.cuisines?.length > 0 || contact.preferences.desserts?.length > 0) && (
          <Animated.View style={[styles.section, createSlideStyle(sectionAnims[3])]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🌸</Text>
              <Text style={styles.sectionTitle}>Food & Flowers</Text>
            </View>

            {/* Favorite Flower */}
            {contact.preferences.flower && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Favorite Flower</Text>
                <Text style={styles.preferenceValue}>{contact.preferences.flower}</Text>
                {contact.preferences.flowerDetails ? (
                  <Text style={styles.preferenceDetail}>{contact.preferences.flowerDetails}</Text>
                ) : null}
              </View>
            )}

            {/* Cuisines */}
            {contact.preferences.cuisines?.length > 0 && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Favorite Cuisines</Text>
                <View style={styles.tagContainer}>
                  {contact.preferences.cuisines.map((cuisine, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{cuisine}</Text>
                    </View>
                  ))}
                </View>
                {contact.preferences.restaurant ? (
                  <Text style={styles.preferenceDetail}>🍽️ Favorite restaurant: {contact.preferences.restaurant}</Text>
                ) : null}
              </View>
            )}

            {/* Desserts */}
            {contact.preferences.desserts?.length > 0 && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Favorite Desserts</Text>
                <View style={styles.tagContainer}>
                  {contact.preferences.desserts.map((dessert, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>🍰 {dessert}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* Entertainment */}
        {contact.hasQuestionnaire && (contact.preferences.musicGenre?.length > 0 || contact.preferences.movieGenre?.length > 0) && (
          <Animated.View style={[styles.section, createSlideStyle(sectionAnims[3])]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🎬</Text>
              <Text style={styles.sectionTitle}>Entertainment</Text>
            </View>

            {/* Music */}
            {contact.preferences.musicGenre?.length > 0 && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Music Taste</Text>
                <View style={styles.tagContainer}>
                  {contact.preferences.musicGenre.map((genre, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>🎵 {genre}</Text>
                    </View>
                  ))}
                </View>
                {contact.preferences.favoriteArtists ? (
                  <Text style={styles.preferenceDetail}>Favorite artists: {contact.preferences.favoriteArtists}</Text>
                ) : null}
              </View>
            )}

            {/* Movies */}
            {contact.preferences.movieGenre?.length > 0 && (
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Movie Preferences</Text>
                <View style={styles.tagContainer}>
                  {contact.preferences.movieGenre.map((genre, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>🎬 {genre}</Text>
                    </View>
                  ))}
                </View>
                {contact.preferences.favoriteMovies ? (
                  <Text style={styles.preferenceDetail}>Favorites: {contact.preferences.favoriteMovies}</Text>
                ) : null}
              </View>
            )}
          </Animated.View>
        )}

        {/* Wishlist */}
        {contact.hasQuestionnaire && contact.preferences.wishlistText && (
          <Animated.View style={[styles.section, createSlideStyle(sectionAnims[3])]}>
            <View style={styles.sectionHeader}>
              <ClipboardIcon size={20} color="#ca9ad6" />
              <Text style={styles.sectionTitle}>Wishlist & Notes</Text>
            </View>
            <Text style={styles.wishlistTextContent}>{contact.preferences.wishlistText}</Text>
          </Animated.View>
        )}

        {/* Clothing Sizes */}
        {contact.hasQuestionnaire && contact.preferences.sizes && Object.keys(contact.preferences.sizes).length > 0 && (
          <Animated.View style={[styles.section, createSlideStyle(sectionAnims[3])]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>👕</Text>
              <Text style={styles.sectionTitle}>Clothing Sizes</Text>
            </View>
            <View style={styles.sizesGrid}>
              {Object.entries(contact.preferences.sizes).map(([key, value]) => (
                value ? (
                  <View key={key} style={styles.sizeItem}>
                    <Text style={styles.sizeLabel}>{key}</Text>
                    <Text style={styles.sizeValue}>{value}</Text>
                  </View>
                ) : null
              ))}
            </View>
          </Animated.View>
        )}

        {/* Notes */}
        {contact.notes && (
          <Animated.View style={[styles.section, createSlideStyle(sectionAnims[4])]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{contact.notes}</Text>
          </Animated.View>
        )}

        {/* Action Buttons */}
        {!contact.hasQuestionnaire && (
          <Animated.View style={[styles.actionContainer, createSlideStyle(sectionAnims[4])]}>
            <TouchableOpacity onPress={handleSendInvitation}>
              <LinearGradient
                colors={['#ca9ad6', '#70d0dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButton}
              >
                <MailIcon size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Send Questionnaire</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.actionHint}>
              Invite {contact.name.split(' ')[0]} to share their gift preferences
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitleMask: {
    fontSize: 22,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  contactName: {
    fontSize: 26,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    textAlign: 'center',
  },
  nickname: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    fontStyle: 'italic',
    marginTop: 4,
  },
  relationshipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbe5f5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  relationshipEmoji: {
    fontSize: 16,
  },
  relationshipText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fbe5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    flex: 1,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  eventIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventEmoji: {
    fontSize: 22,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  eventDate: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 2,
  },
  daysUntilBadge: {
    backgroundColor: '#fbe5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysUntilText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
  preferenceRow: {
    marginBottom: 14,
  },
  preferenceLabel: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  gradientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  gradientTagText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  colorTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  preferenceDetail: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 8,
    fontStyle: 'italic',
  },
  preferenceValue: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginTop: 4,
  },
  surpriseBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  surpriseText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
  },
  causeTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  causeTagText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#2e7d32',
  },
  sectionEmoji: {
    fontSize: 20,
  },
  wishlistTextContent: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    lineHeight: 22,
  },
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sizeItem: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  sizeLabel: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  sizeValue: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 18,
    gap: 10,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  actionHint: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ContactDetailScreen;
