import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

// Mock data
const upcomingEvents = [
  {
    id: '1',
    name: "Mom's Birthday",
    date: 'December 15, 2024',
    daysUntil: 3,
    emoji: '🎂',
    type: 'birthday',
  },
  {
    id: '2',
    name: 'Anniversary',
    date: 'December 20, 2024',
    daysUntil: 8,
    emoji: '💝',
    type: 'anniversary',
  },
];

const HomeScreen = ({ navigation }) => {
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const sectionAnim = useRef(new Animated.Value(0)).current;
  const eventAnims = useRef(upcomingEvents.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.stagger(100, statsAnims.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        })
      )),
      Animated.timing(sectionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(100, eventAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      )),
    ]).start();
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
        outputRange: [15, 0],
      }),
    }],
  });

  const createSlideStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateX: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 0],
      }),
    }],
  });

  return (
    <View style={styles.container}>
      {/* Background Glow */}
      <View style={styles.backgroundGlow} />

      {/* Header */}
      <Animated.View style={[styles.header, createFadeStyle(headerAnim)]}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>Sarah Johnson</Text>
        </View>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#E07B5C', '#D06A4C']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>SJ</Text>
          </LinearGradient>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Animated.View style={[styles.statBox, createFadeStyle(statsAnims[0])]}>
            <Text style={[styles.statNum, { color: '#E07B5C' }]}>12</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </Animated.View>
          <Animated.View style={[styles.statBox, createFadeStyle(statsAnims[1])]}>
            <Text style={[styles.statNum, { color: '#6B7FD7' }]}>48</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </Animated.View>
          <Animated.View style={[styles.statBox, createFadeStyle(statsAnims[2])]}>
            <Text style={[styles.statNum, { color: '#4CAF78' }]}>23</Text>
            <Text style={styles.statLabel}>Gifts</Text>
          </Animated.View>
        </View>

        {/* Section Header */}
        <Animated.View style={[styles.sectionHeader, createFadeStyle(sectionAnim)]}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllBtn}>See all</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Event Cards */}
        <View style={styles.eventsList}>
          {upcomingEvents.map((event, index) => (
            <Animated.View
              key={event.id}
              style={[styles.eventCard, createSlideStyle(eventAnims[index])]}
            >
              <TouchableOpacity style={styles.eventCardInner} activeOpacity={0.8}>
                <View style={[
                  styles.eventIcon,
                  { backgroundColor: event.type === 'birthday' ? '#FEF3F0' : '#F0F4FE' }
                ]}>
                  <Text style={styles.eventEmoji}>{event.emoji}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                {event.daysUntil <= 5 ? (
                  <LinearGradient
                    colors={['#E07B5C', '#D06A4C']}
                    style={styles.eventBadgeSoon}
                  >
                    <Text style={styles.eventBadgeSoonText}>{event.daysUntil} days</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.eventBadgeLater}>
                    <Text style={styles.eventBadgeLaterText}>{event.daysUntil} days</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <Animated.View style={[styles.quickActionsSection, createFadeStyle(sectionAnim)]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
              <LinearGradient
                colors={['#E07B5C', '#D06A4C']}
                style={styles.quickActionIcon}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Add Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
              <View style={[styles.quickActionIconOutline, { borderColor: '#6B7FD7' }]}>
                <Ionicons name="people-outline" size={22} color="#6B7FD7" />
              </View>
              <Text style={styles.quickActionText}>New Circle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
              <View style={[styles.quickActionIconOutline, { borderColor: '#4CAF78' }]}>
                <Ionicons name="gift-outline" size={22} color="#4CAF78" />
              </View>
              <Text style={styles.quickActionText}>Find Gift</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(224, 123, 92, 0.12)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  avatarContainer: {
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  statNum: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  seeAllBtn: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E07B5C',
  },
  // Events
  eventsList: {
    marginBottom: 28,
  },
  eventCard: {
    marginBottom: 12,
  },
  eventCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  eventIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventEmoji: {
    fontSize: 26,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: '#888888',
  },
  eventBadgeSoon: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  eventBadgeSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventBadgeLater: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F0F4FE',
  },
  eventBadgeLaterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B7FD7',
  },
  // Quick Actions
  quickActionsSection: {
    marginBottom: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  quickActionIconOutline: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});

export default HomeScreen;
