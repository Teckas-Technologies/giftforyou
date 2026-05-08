import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { getEvent, deleteEvent } from '../services/api';

// Icons
const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const CalendarIcon = ({ size = 24, color = '#70d0dd' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const UserIcon = ({ size = 24, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const BellIcon = ({ size = 24, color = '#f9a825' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const RepeatIcon = ({ size = 24, color = '#4caf50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="17 1 21 5 17 9" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <Polyline points="7 23 3 19 7 15" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Svg>
);

const TrashIcon = ({ size = 24, color = '#e53935' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="3 6 5 6 21 6" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
);

const ChevronRightIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

// Helper functions
const getEventEmoji = (eventType) => {
  const emojis = {
    'Birthday': '🎂',
    'Anniversary': '💍',
    'Wedding': '💒',
    'Graduation': '🎓',
    'Holiday': '🎉',
    'Baby Shower': '👶',
    'Other': '🎁',
  };
  return emojis[eventType] || '🎁';
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { text: 'Today!', type: 'urgent' };
  if (diffDays === 1) return { text: 'Tomorrow', type: 'urgent' };
  if (diffDays < 0) return { text: `${Math.abs(diffDays)} days ago`, type: 'past' };
  if (diffDays <= 7) return { text: `In ${diffDays} days`, type: 'soon' };
  if (diffDays <= 30) return { text: `In ${diffDays} days`, type: 'upcoming' };
  return { text: `In ${diffDays} days`, type: 'later' };
};

const EventDetailScreen = ({ navigation, route }) => {
  const { eventId, event: passedEvent } = route.params || {};

  const [event, setEvent] = useState(passedEvent || null);
  const [loading, setLoading] = useState(!passedEvent);
  const [deleting, setDeleting] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (eventId && !passedEvent) {
      fetchEvent();
    } else {
      startAnimations();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await getEvent(eventId);
      setEvent(response.event || response);
      startAnimations();
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteEvent(event.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const navigateToContact = () => {
    // Use circleId (gift_circles.id) for ContactDetailScreen - this is what the API expects
    const circleId = event.circleId || event.circle_id;
    if (circleId) {
      navigation.navigate('ContactDetail', {
        contactId: circleId,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#70d0dd" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const daysInfo = getDaysUntil(event.eventDate || event.event_date);
  const contactName = event.contact?.name || event.contactName || event.circle?.nickname || event.circle?.guest_name;
  const hasCircle = !!(event.circleId || event.circle_id); // Can navigate to contact

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon size={24} color="#6b3a8a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaskedView
            maskElement={
              <Text style={styles.headerTitleMask}>Event Details</Text>
            }
          >
            <LinearGradient
              colors={['#70d0dd', '#ca9ad6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Event Details</Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={deleting}>
          {deleting ? (
            <ActivityIndicator size="small" color="#e53935" />
          ) : (
            <TrashIcon size={22} color="#e53935" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Event Header Card */}
          <View style={styles.eventCard}>
            <LinearGradient
              colors={['#ccf9ff', '#e0f7fa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emojiContainer}
            >
              <Text style={styles.emoji}>{getEventEmoji(event.eventType || event.event_type)}</Text>
            </LinearGradient>

            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventType}>{event.eventType || event.event_type}</Text>

            {/* Days Until Badge */}
            <View style={[
              styles.daysUntilBadge,
              daysInfo.type === 'urgent' && styles.badgeUrgent,
              daysInfo.type === 'soon' && styles.badgeSoon,
              daysInfo.type === 'past' && styles.badgePast,
            ]}>
              <Text style={[
                styles.daysUntilText,
                daysInfo.type === 'urgent' && styles.textUrgent,
                daysInfo.type === 'past' && styles.textPast,
              ]}>
                {daysInfo.text}
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            {/* Date */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <CalendarIcon size={22} color="#70d0dd" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(event.eventDate || event.event_date)}
                </Text>
              </View>
            </View>

            {/* Contact */}
            {hasCircle && contactName && (
              <TouchableOpacity style={styles.detailRow} onPress={navigateToContact}>
                <View style={styles.detailIconContainer}>
                  <UserIcon size={22} color="#ca9ad6" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Contact</Text>
                  <Text style={styles.detailValue}>{contactName}</Text>
                </View>
                <ChevronRightIcon size={20} color="#6b3a8a" />
              </TouchableOpacity>
            )}

            {/* Recurring */}
            {(event.isRecurring || event.is_recurring) && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <RepeatIcon size={22} color="#4caf50" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Recurring</Text>
                  <Text style={styles.detailValue}>Repeats every year</Text>
                </View>
              </View>
            )}

            {/* Reminder */}
            {(event.reminderEnabled || event.reminder_enabled) && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <BellIcon size={22} color="#f9a825" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Reminder</Text>
                  <Text style={styles.detailValue}>
                    {event.reminderDays || event.reminder_days || 7} days before
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          {(event.description) && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionText}>{event.description}</Text>
              </View>
            </View>
          )}

          {/* View Contact Button */}
          {hasCircle && contactName && (
            <TouchableOpacity
              style={styles.viewContactButton}
              onPress={navigateToContact}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#70d0dd', '#ca9ad6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.viewContactGradient}
              >
                <UserIcon size={20} color="#FFFFFF" />
                <Text style={styles.viewContactText}>View {contactName}'s Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 16,
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#70d0dd',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleMask: {
    fontSize: 20,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  deleteButton: {
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  content: {},
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
  },
  eventTitle: {
    fontSize: 24,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    textAlign: 'center',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 16,
  },
  daysUntilBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0f7fa',
  },
  badgeUrgent: {
    backgroundColor: '#fce4ec',
  },
  badgeSoon: {
    backgroundColor: '#fff3e0',
  },
  badgePast: {
    backgroundColor: '#f5f5f5',
  },
  daysUntilText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#00897b',
  },
  textUrgent: {
    color: '#e91e63',
  },
  textPast: {
    color: '#9e9e9e',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 12,
    marginLeft: 4,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    lineHeight: 22,
  },
  viewContactButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#70d0dd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  viewContactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  viewContactText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
});

export default EventDetailScreen;
