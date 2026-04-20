import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme';
import { GradientText } from '../components';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Events data
const eventsData = [
  { id: '1', date: 24, title: "Claude's Birthday", emoji: '🎂', desc: 'Tomorrow' },
  { id: '2', date: 25, title: "Susanne's Birthday", emoji: '🎉', desc: 'In 2 days' },
];

const CalendarScreen = ({ navigation }) => {
  const [currentMonth, setCurrentMonth] = useState(2); // March
  const [currentYear, setCurrentYear] = useState(2026);
  const today = 23;

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', isEmpty: true });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isToday: day === today,
        hasEvent: eventsData.some(e => e.date === day),
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <GradientText
            style={styles.monthTitle}
            colors={[colors.primary, colors.secondary]}
          >
            {MONTHS[currentMonth]}
          </GradientText>
          <Text style={styles.yearText}>{currentYear}</Text>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setCurrentMonth(m => m > 0 ? m - 1 : 11)}
            >
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setCurrentMonth(m => m < 11 ? m + 1 : 0)}
            >
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Week Days Header */}
        <View style={styles.weekHeader}>
          {WEEK_DAYS.map((day, index) => (
            <Text key={index} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((item, index) => (
            <View key={index} style={styles.dayCell}>
              {!item.isEmpty && (
                <View style={[
                  styles.dayCircle,
                  item.isToday && styles.dayCircleToday
                ]}>
                  <Text style={[
                    styles.dayText,
                    item.isToday && styles.dayTextToday
                  ]}>{item.day}</Text>
                  {item.hasEvent && !item.isToday && (
                    <View style={styles.eventDot} />
                  )}
                  {item.hasEvent && item.isToday && (
                    <View style={styles.eventDotToday} />
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Events Section */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>This week</Text>

          {eventsData.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <Text style={styles.eventTime}>Mar {event.date}</Text>
              <View style={styles.eventDotLine} />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title} {event.emoji}</Text>
                <Text style={styles.eventDesc}>{event.desc}</Text>
              </View>
            </View>
          ))}
        </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontFamily: 'Gifted-Regular',
    fontSize: 26,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  yearText: {
    fontFamily: 'Outfit-Light',
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 10,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 20,
    color: colors.textSecondary,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: colors.textLight,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCircle: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    position: 'relative',
  },
  dayCircleToday: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: colors.textPrimary,
  },
  dayTextToday: {
    fontFamily: 'Outfit-SemiBold',
    color: colors.textWhite,
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  eventDotToday: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textWhite,
  },
  eventsSection: {
    marginTop: 25,
  },
  eventsTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventTime: {
    fontFamily: 'Outfit-Light',
    fontSize: 13,
    color: colors.textLight,
    width: 55,
  },
  eventDotLine: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryAccent,
    marginTop: 4,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  eventDesc: {
    fontFamily: 'Outfit-Light',
    fontSize: 13,
    color: colors.textLight,
  },
});

export default CalendarScreen;
