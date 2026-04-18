import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Mock events
const eventsData = {
  5: { name: "Dad's Birthday", type: 'birthday' },
  12: { name: 'Today', type: 'today' },
  15: { name: "Mom's Birthday", type: 'birthday' },
  20: { name: 'Anniversary', type: 'anniversary' },
};

const CalendarScreen = ({ navigation }) => {
  const [currentMonth, setCurrentMonth] = useState(11); // December
  const [currentYear, setCurrentYear] = useState(2024);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const calendarAnim = useRef(new Animated.Value(0)).current;
  const upcomingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(calendarAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(upcomingAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const createFadeStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 0],
      }),
    }],
  });

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, muted: true });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        muted: false,
        isToday: i === 12 && currentMonth === 11,
        hasEvent: eventsData[i] !== undefined,
      });
    }

    // Fill remaining cells
    const remaining = 35 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, muted: true });
    }

    return days.slice(0, 35); // Show 5 weeks
  };

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const upcomingEvents = [
    { id: '1', name: "Mom's Birthday", date: 'Dec 15', days: 3, color: '#E07B5C' },
    { id: '2', name: 'Anniversary', date: 'Dec 20', days: 8, color: '#5B7FD7' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, createFadeStyle(headerAnim)]}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity style={styles.todayBtn} activeOpacity={0.8}>
          <Text style={styles.todayBtnText}>Today</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendar Box */}
        <Animated.View style={[
          styles.calendarBox,
          {
            opacity: calendarAnim,
            transform: [{
              scale: calendarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            }],
          },
        ]}>
          {/* Gradient Header with Month */}
          <LinearGradient
            colors={['#E07B5C', '#C4956A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.calendarHeader}
          >
            {/* Month Navigation */}
            <View style={styles.monthRow}>
              <TouchableOpacity onPress={goToPrevMonth} style={styles.monthNavBtn}>
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[currentMonth]} {currentYear}</Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavBtn}>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdaysRow}>
              {DAYS.map((day, index) => (
                <View key={index} style={styles.weekdayCell}>
                  <Text style={styles.weekdayText}>{day}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {getDaysInMonth().map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dayCell}
                activeOpacity={0.7}
              >
                {item.isToday ? (
                  <LinearGradient
                    colors={['#E07B5C', '#D06A4C']}
                    style={styles.todayCell}
                  >
                    <Text style={styles.todayText}>{item.day}</Text>
                    {item.hasEvent && <View style={styles.eventDotWhite} />}
                  </LinearGradient>
                ) : (
                  <View style={styles.dayCellInner}>
                    <Text style={[
                      styles.dayText,
                      item.muted && styles.mutedDay,
                    ]}>
                      {item.day}
                    </Text>
                    {item.hasEvent && !item.muted && <View style={styles.eventDot} />}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Upcoming Section */}
        <Animated.View style={[styles.upcomingSection, createFadeStyle(upcomingAnim)]}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>

          {upcomingEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.upcomingItem} activeOpacity={0.8}>
              <View style={[styles.upcomingDot, { backgroundColor: event.color }]} />
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingName}>{event.name}</Text>
                <Text style={styles.upcomingDate}>{event.date}</Text>
              </View>
              <View style={[styles.daysTag, { backgroundColor: `${event.color}15` }]}>
                <Text style={[styles.upcomingDays, { color: event.color }]}>
                  {event.days} days
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <LinearGradient
          colors={['#E07B5C', '#D06A4C']}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  todayBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  todayBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E07B5C',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  calendarBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  calendarHeader: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 16,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  weekdaysRow: {
    flexDirection: 'row',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellInner: {
    width: '85%',
    height: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  mutedDay: {
    color: '#CCCCCC',
  },
  todayCell: {
    width: '85%',
    height: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  todayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E07B5C',
  },
  eventDotWhite: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  upcomingSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  upcomingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  upcomingDate: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  daysTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upcomingDays: {
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CalendarScreen;
