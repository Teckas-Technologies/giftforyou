import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Timeline events
const timelineEvents = [
  { id: '1', time: '10:00', title: 'Buy flowers for Mom 💐', subtitle: 'Birthday prep' },
  { id: '2', time: '14:30', title: 'Pick up cake 🎂', subtitle: 'From Sweet Bakery' },
  { id: '3', time: '18:00', title: 'Family dinner 🍽️', subtitle: 'At home' },
];

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(22);
  const [currentMonth, setCurrentMonth] = useState(3); // April
  const [currentYear, setCurrentYear] = useState(2026);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const timelineAnims = useRef(timelineEvents.map(() => new Animated.Value(0))).current;

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

    Animated.stagger(100, timelineAnims.map(anim =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  // Generate week days around selected date
  const getWeekDays = () => {
    const days = [];
    const startDate = selectedDate - 2;
    for (let i = 0; i < 6; i++) {
      const date = startDate + i;
      const dayOfWeek = new Date(currentYear, currentMonth, date).getDay();
      const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      days.push({
        date: date,
        day: WEEK_DAYS[adjustedDayIndex],
        isSelected: date === selectedDate,
        hasEvent: [21, 22, 24].includes(date),
      });
    }
    return days;
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
          <Text style={styles.monthTitle}>{MONTHS[currentMonth]}</Text>
          <Text style={styles.yearText}>{currentYear}</Text>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setCurrentMonth(m => m > 0 ? m - 1 : 11)}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setCurrentMonth(m => m < 11 ? m + 1 : 0)}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Week Strip */}
        <Animated.View style={[styles.weekStrip, { opacity: fadeAnim }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekScrollContent}
          >
            {getWeekDays().map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayPill,
                  item.isSelected && styles.dayPillActive
                ]}
                onPress={() => setSelectedDate(item.date)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.dayName,
                  item.isSelected && styles.dayNameActive
                ]}>{item.day}</Text>
                <Text style={[
                  styles.dayNum,
                  item.isSelected && styles.dayNumActive
                ]}>{item.date}</Text>
                {item.hasEvent && (
                  <View style={[
                    styles.eventDot,
                    item.isSelected && styles.eventDotActive
                  ]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.timelineTitle}>Today's Events</Text>

          {timelineEvents.map((event, index) => (
            <Animated.View
              key={event.id}
              style={[
                styles.timelineItem,
                {
                  opacity: timelineAnims[index],
                  transform: [{
                    translateY: timelineAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }]
                }
              ]}
            >
              {/* Time */}
              <Text style={styles.timelineTime}>{event.time}</Text>

              {/* Line with dot */}
              <View style={styles.timelineLine}>
                <View style={styles.timelineDot} />
                {index < timelineEvents.length - 1 && (
                  <View style={styles.timelineConnector} />
                )}
              </View>

              {/* Content Card */}
              <TouchableOpacity style={styles.timelineCard} activeOpacity={0.8}>
                <Text style={styles.timelineCardTitle}>{event.title}</Text>
                <Text style={styles.timelineCardSubtitle}>{event.subtitle}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>
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
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  monthTitle: {
    fontFamily: 'Caveat-SemiBold',
    fontSize: 32,
    color: colors.primary,
    marginBottom: 4,
  },
  yearText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  weekStrip: {
    marginBottom: 32,
  },
  weekScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  dayPill: {
    width: 52,
    paddingVertical: 14,
    backgroundColor: colors.backgroundCard,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  dayPillActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  dayName: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNameActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dayNum: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 18,
    color: colors.textPrimary,
  },
  dayNumActive: {
    color: '#FFFFFF',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  eventDotActive: {
    backgroundColor: '#FFFFFF',
  },
  timelineSection: {
    paddingHorizontal: 20,
  },
  timelineTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineTime: {
    fontFamily: 'Nunito-SemiBold',
    width: 50,
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'right',
    paddingTop: 16,
  },
  timelineLine: {
    width: 30,
    alignItems: 'center',
    paddingTop: 16,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    zIndex: 1,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: -2,
    minHeight: 60,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineCardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  timelineCardSubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.textLight,
  },
});

export default CalendarScreen;
