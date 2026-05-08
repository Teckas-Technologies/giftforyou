import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { getEventDates, getUpcomingEvents, getEventsByDate } from '../services/api';

// Plus Icon for FAB
const PlusIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const { width } = Dimensions.get('window');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to get event emoji based on type
const getEventEmoji = (eventType) => {
  const emojis = {
    'Birthday': '🎂',
    'Anniversary': '💍',
    'Wedding': '💒',
    'Graduation': '🎓',
    'Holiday': '🎉',
    'Other': '🎁',
  };
  return emojis[eventType] || '🎁';
};

// Helper to get days until event
const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `In ${diffDays} days`;
};

// Helper to format date for display
const formatEventDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${MONTHS[date.getMonth()].substring(0, 3)} ${date.getDate()}`;
};

// Sparkle decoration component
const Sparkle = ({ style, size = 8, color = '#f4cae8' }) => (
  <Animated.View style={[styles.sparkle, style]}>
    <View style={[styles.sparkleInner, { width: size, height: size, backgroundColor: color }]} />
  </Animated.View>
);

const CalendarScreen = ({ navigation }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null); // Selected date for filtering
  const [eventDates, setEventDates] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]); // Events for selected date
  const [loading, setLoading] = useState(true);
  const [loadingDateEvents, setLoadingDateEvents] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().getDate();
  const currentMonthNow = new Date().getMonth();
  const currentYearNow = new Date().getFullYear();

  // Fetch event dates for calendar and upcoming events
  const fetchEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [datesRes, upcomingRes] = await Promise.all([
        getEventDates(currentYear, currentMonth + 1).catch(() => ({ dates: [] })),
        getUpcomingEvents(5).catch(() => ({ events: [] })),
      ]);

      // Convert dates array to object with day as key
      const datesObj = {};
      if (datesRes.dates && Array.isArray(datesRes.dates)) {
        datesRes.dates.forEach(date => {
          const day = new Date(date.date || date).getDate();
          datesObj[day] = date;
        });
      }
      setEventDates(datesObj);

      // Transform upcoming events
      const events = (upcomingRes.events || []).map(event => ({
        id: event.id || event._id,
        title: event.title,
        eventType: event.eventType,
        eventDate: event.eventDate,
        date: formatEventDate(event.eventDate),
        emoji: getEventEmoji(event.eventType),
        desc: getDaysUntil(event.eventDate),
        circleId: event.circleId || event.circle_id,
        contactName: event.contact?.name,
      }));
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentMonth, currentYear]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const onRefresh = useCallback(() => {
    fetchEvents(true);
  }, [fetchEvents]);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const calendarAnim = useRef(new Animated.Value(0)).current;
  const eventsAnim = useRef(new Animated.Value(0)).current;

  // Premium animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim1 = useRef(new Animated.Value(0)).current;
  const sparkleAnim2 = useRef(new Animated.Value(0)).current;
  const sparkleAnim3 = useRef(new Animated.Value(0)).current;
  const todayPulse = useRef(new Animated.Value(1)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animations
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(calendarAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(eventsAnim, {
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

    // Nav button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Today cell pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(todayPulse, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(todayPulse, {
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

    // FAB entry animation
    setTimeout(() => {
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }, 600);

    // FAB pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabRotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(fabRotate, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
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

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', empty: true });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today && currentMonth === currentMonthNow && currentYear === currentYearNow;
      const hasEvent = eventDates[i] !== undefined;
      const isSelected = selectedDate === i;
      days.push({
        day: i,
        empty: false,
        isToday,
        hasEvent,
        isSelected,
      });
    }

    return days;
  };

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null); // Reset selection on month change
    setSelectedDateEvents([]); // Clear selected date events
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null); // Reset selection on month change
    setSelectedDateEvents([]); // Clear selected date events
  };

  // Handle date selection - fetch events from API
  const handleDateSelect = async (day) => {
    if (selectedDate === day) {
      setSelectedDate(null); // Deselect if same date clicked
      setSelectedDateEvents([]);
    } else {
      setSelectedDate(day);

      // Fetch events for the selected date from API
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      try {
        setLoadingDateEvents(true);
        const response = await getEventsByDate(dateStr);
        const events = (response.events || []).map(event => ({
          id: event.id || event._id,
          title: event.title,
          eventType: event.eventType || event.event_type,
          eventDate: event.eventDate || event.event_date,
          date: formatEventDate(event.eventDate || event.event_date),
          emoji: getEventEmoji(event.eventType || event.event_type),
          desc: getDaysUntil(event.eventDate || event.event_date),
          circleId: event.circleId || event.circle_id,
          contactName: event.contact?.name,
        }));
        setSelectedDateEvents(events);
      } catch (error) {
        console.error('Error fetching events for date:', error);
        setSelectedDateEvents([]);
      } finally {
        setLoadingDateEvents(false);
      }
    }
  };

  // Get events to display - selected date events or upcoming events
  const displayedEvents = selectedDate ? selectedDateEvents : upcomingEvents;
  const isLoadingEvents = selectedDate ? loadingDateEvents : loading;

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
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Sparkles */}
      <Sparkle style={[{ top: 60, right: 25 }, sparkle1Style]} size={10} color="#f4cae8" />
      <Sparkle style={[{ top: 120, left: 20 }, sparkle2Style]} size={7} color="#70d0dd" />
      <Sparkle style={[{ top: 90, right: 80 }, sparkle3Style]} size={8} color="#ca9ad6" />

      {/* Header - Fixed at top */}
      <Animated.View style={[styles.header, createFadeStyle(headerAnim)]}>
        {/* Gradient Month Text */}
        <MaskedView
          maskElement={
            <Text style={styles.monthTextMask}>{MONTHS[currentMonth]}</Text>
          }
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.monthTextMask, { opacity: 0 }]}>{MONTHS[currentMonth]}</Text>
          </LinearGradient>
        </MaskedView>

        <Animated.Text style={[
          styles.yearText,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          }
        ]}>
          {currentYear}
        </Animated.Text>

        {/* Navigation Buttons with pulse */}
        <View style={styles.navRow}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity onPress={goToPrevMonth} activeOpacity={0.8}>
              <LinearGradient
                colors={['#fbe5f5', '#ccf9ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.navBtn}
              >
                <Text style={styles.navBtnText}>‹</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity onPress={goToNextMonth} activeOpacity={0.8}>
              <LinearGradient
                colors={['#ccf9ff', '#fbe5f5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.navBtn}
              >
                <Text style={styles.navBtnText}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ca9ad6']}
            tintColor="#ca9ad6"
          />
        }
      >
        {/* Calendar */}
        <Animated.View style={[styles.calendarSection, createFadeStyle(calendarAnim)]}>
          {/* Calendar Card with shadow */}
          <View style={styles.calendarCard}>
            {/* Week Header */}
            <View style={styles.weekHeader}>
              {DAYS.map((day, index) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {getDaysInMonth().map((item, index) => (
                <View key={index} style={styles.dayCell}>
                  {!item.empty && (
                    <TouchableOpacity
                      style={styles.dayCellInner}
                      activeOpacity={0.7}
                      onPress={() => handleDateSelect(item.day)}
                    >
                      {item.isToday ? (
                        <Animated.View style={[
                          styles.todayCellWrapper,
                          {
                            transform: [{ scale: todayPulse }],
                          }
                        ]}>
                          <LinearGradient
                            colors={['#ca9ad6', '#70d0dd']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.todayCell}
                          >
                            <Text style={styles.todayText}>{item.day}</Text>
                            {item.hasEvent && (
                              <View style={styles.eventDotWhite} />
                            )}
                          </LinearGradient>
                        </Animated.View>
                      ) : item.isSelected ? (
                        <View style={styles.selectedCellWrapper}>
                          <LinearGradient
                            colors={['#fbe5f5', '#ccf9ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.selectedCell}
                          >
                            <Text style={styles.selectedText}>{item.day}</Text>
                            {item.hasEvent && (
                              <View style={styles.eventDotSelected} />
                            )}
                          </LinearGradient>
                        </View>
                      ) : (
                        <View style={styles.normalCell}>
                          <Text style={styles.dayText}>{item.day}</Text>
                          {item.hasEvent && (
                            <LinearGradient
                              colors={['#f4cae8', '#70d0dd']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.eventDot}
                            />
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Events Section */}
        <Animated.View style={[styles.eventsSection, createFadeStyle(eventsAnim)]}>
          <View style={styles.eventsSectionHeader}>
            <MaskedView
              maskElement={
                <Text style={styles.eventsTitleMask}>
                  {selectedDate ? `Events on ${MONTHS[currentMonth].substring(0, 3)} ${selectedDate}` : 'Upcoming Events'}
                </Text>
              }
            >
              <LinearGradient
                colors={['#ca9ad6', '#70d0dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.eventsTitleMask, { opacity: 0 }]}>
                  {selectedDate ? `Events on ${MONTHS[currentMonth].substring(0, 3)} ${selectedDate}` : 'Upcoming Events'}
                </Text>
              </LinearGradient>
            </MaskedView>
            {selectedDate && (
              <TouchableOpacity
                style={styles.clearDateBtn}
                onPress={() => setSelectedDate(null)}
              >
                <Text style={styles.clearDateText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingEvents && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ca9ad6" />
            </View>
          )}

          {!isLoadingEvents && displayedEvents.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedDate ? 'No events on this date' : 'No upcoming events'}
              </Text>
              <Text style={styles.emptySubtext}>
                {selectedDate ? 'Select another date or add an event' : 'Add an event using the + button'}
              </Text>
            </View>
          )}

          {!isLoadingEvents && displayedEvents.map((event, index) => (
            <View key={event.id || index} style={styles.eventItem}>
              <TouchableOpacity
                style={styles.eventItemInner}
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate('EventDetail', { eventId: event.id, event });
                }}
              >
                <Text style={styles.eventTime}>{event.date}</Text>
                <LinearGradient
                  colors={['#f4cae8', '#70d0dd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.eventDotLarge}
                />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title} {event.emoji}</Text>
                  <Text style={styles.eventDesc}>{event.desc}</Text>
                  {event.contactName && (
                    <Text style={styles.eventContact}>For: {event.contactName}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB - Add Event */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [
              { scale: fabScale },
              {
                rotate: fabRotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '5deg'],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('AddEvent')}
          activeOpacity={0.85}
          style={styles.fabTouchable}
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <PlusIcon size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  monthTextMask: {
    fontSize: 28,
    fontFamily: 'Handlee_400Regular',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  yearText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 12,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  navBtnText: {
    fontSize: 22,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  calendarSection: {
    marginBottom: 24,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCellInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  normalCell: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  todayCellWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCellWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ca9ad6',
  },
  selectedText: {
    color: '#6b3a8a',
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    fontWeight: '600',
  },
  eventDotSelected: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ca9ad6',
  },
  todayCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  todayText: {
    color: '#FFFFFF',
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  eventDotWhite: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  eventsSection: {
    marginTop: 8,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitleMask: {
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
  },
  clearDateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fbe5f5',
    borderRadius: 12,
  },
  clearDateText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
  eventItem: {
    marginBottom: 12,
  },
  eventItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  eventTime: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    width: 50,
  },
  eventDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  eventDesc: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 2,
  },
  eventContact: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
    marginTop: 4,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    zIndex: 100,
  },
  fabTouchable: {
    borderRadius: 30,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
});

export default CalendarScreen;
