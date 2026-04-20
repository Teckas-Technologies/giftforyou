import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
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
    type: 'Family',
    category: 'Birthday',
    emoji: '🎂',
    day: '24',
    month: 'Apr',
    color: colors.primary,
    bgColor: colors.family,
  },
  {
    id: '2',
    name: 'Anniversary',
    type: 'Special',
    category: '5 years',
    emoji: '💍',
    day: '28',
    month: 'Apr',
    color: colors.secondary,
    bgColor: colors.secondaryLight,
  },
  {
    id: '3',
    name: 'Christmas',
    type: 'Holiday',
    category: '',
    emoji: '🎄',
    day: '25',
    month: 'Dec',
    color: colors.accentLavender,
    bgColor: '#EDE4F5',
  },
];

const HomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(upcomingEvents.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(100, cardAnims.map(anim =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>Sarah</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>😊</Text>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchBar,
            { opacity: fadeAnim }
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.textLight} />
          <Text style={styles.searchPlaceholder}>Search events or people...</Text>
        </Animated.View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coming Up</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>see all →</Text>
          </TouchableOpacity>
        </View>

        {/* Event Cards */}
        {upcomingEvents.map((event, index) => (
          <Animated.View
            key={event.id}
            style={[
              styles.eventCard,
              {
                opacity: cardAnims[index],
                transform: [{
                  translateX: cardAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity style={styles.eventCardInner} activeOpacity={0.8}>
              {/* Left accent bar */}
              <View style={[styles.accentBar, { backgroundColor: event.color }]} />

              {/* Emoji */}
              <View style={[styles.eventEmoji, { backgroundColor: event.bgColor }]}>
                <Text style={styles.emojiText}>{event.emoji}</Text>
              </View>

              {/* Event Info */}
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventType}>
                  {event.type}{event.category ? ` · ${event.category}` : ''}
                </Text>
              </View>

              {/* Date */}
              <View style={styles.eventDate}>
                <Text style={[styles.eventDay, { color: event.color }]}>{event.day}</Text>
                <Text style={styles.eventMonth}>{event.month}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {},
  greeting: {
    fontFamily: 'Caveat-Medium',
    fontSize: 22,
    color: colors.primary,
    marginBottom: 4,
  },
  userName: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 28,
    color: colors.textPrimary,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accentLavender,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentLavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 28,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchPlaceholder: {
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    color: colors.textLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: 'Caveat-Medium',
    fontSize: 18,
    color: colors.primary,
  },
  eventCard: {
    marginBottom: 14,
  },
  eventCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  eventEmoji: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  emojiText: {
    fontSize: 28,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 14,
  },
  eventName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  eventType: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.textLight,
  },
  eventDate: {
    alignItems: 'flex-end',
  },
  eventDay: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 26,
  },
  eventMonth: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
