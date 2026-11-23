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
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';
import { colors, fontSize as typeScale } from '../../theme';
import { SkeletonRow } from '../../components';
import { getEventsByDate } from '../../services/api';
import { getDateParts } from '../../utils/date';
import { useCalendarEvents, useAllUpcomingEvents, toCalendarEvent, CalendarEvent } from './hooks';
import { useMinDurationRefresh } from '../../hooks/useMinDurationRefresh';
import type { ScreenProps, IconProps } from '../../types/navigation';

// Plus Icon for FAB
const PlusIcon = ({ size = 24, color = '#FFFFFF' }: IconProps) => (
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
// Day circles must fit inside one grid cell on every phone. A cell is
// (screen − 16px page padding ×2 − 16px card padding ×2) / 7 wide, minus 2px
// padding each side; keep a 4px gap so neighbouring circles never touch.
// 36px on normal phones, smaller on narrow ones (e.g. 320px wide).
const DAY_CELL = (width - 64) / 7;
const DAY_CIRCLE = Math.min(36, Math.floor(DAY_CELL - 8));
const TODAY_CIRCLE = Math.min(38, DAY_CIRCLE + 2);

// Events shown per page in the list; "Load more" reveals the next batch
const PAGE_SIZE = 5;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Sparkle decoration component
const Sparkle = ({
  style,
  size = 8,
  color = '#f4cae8',
}: {
  style?: any;
  size?: number;
  color?: string;
}) => (
  <Animated.View style={[styles.sparkle, style]}>
    <View style={[styles.sparkleInner, { width: size, height: size, backgroundColor: color }]} />
  </Animated.View>
);

const CalendarScreen = ({ navigation }: ScreenProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null); // Selected date for filtering
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]); // Events for selected date
  const [loadingDateEvents, setLoadingDateEvents] = useState(false);
  // List under the grid: every upcoming event (default) or just the month
  // the grid is showing
  const [listMode, setListMode] = useState<'all' | 'month'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<ScrollView>(null);

  const today = new Date().getDate();
  const currentMonthNow = new Date().getMonth();
  const currentYearNow = new Date().getFullYear();

  // Event dates (for the calendar grid) + upcoming events, via React Query —
  // see hooks.js for why revisiting this tab no longer re-shows a spinner.
  // Keyed by year/month, so switching months fetches fresh data.
  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    refetch,
  } = useCalendarEvents(currentYear, currentMonth);
  const loading = isCalendarLoading && !calendarData;
  const eventDates = calendarData?.eventDates || {};
  const monthEvents = calendarData?.upcomingEvents || [];

  // Every upcoming event from today on, across all months
  const {
    data: allUpcoming = [],
    isLoading: isAllLoading,
    refetch: refetchAll,
  } = useAllUpcomingEvents();

  const refetchBoth = useCallback(
    () => Promise.all([refetch(), refetchAll()]),
    [refetch, refetchAll],
  );

  // Enforces a minimum visible spinner duration — see the hook's comment
  // for why (a too-fast refetch can leave iOS's native pull-to-refresh
  // spinner visually stuck).
  const { refreshing, onRefresh } = useMinDurationRefresh(refetchBoth);

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
      ]),
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
      ]),
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
      ]),
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
      ]),
    ).start();

    // Sparkle animations
    const createSparkleAnimation = (anim: Animated.Value, delay: number) => {
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
          ]),
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
      ]),
    ).start();
  }, []);

  const createFadeStyle = (anim: Animated.Value | Animated.AnimatedInterpolation<number>) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
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
      const isToday =
        i === today && currentMonth === currentMonthNow && currentYear === currentYearNow;
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
  const handleDateSelect = async (day: number) => {
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
        const events = (response.events || []).map(toCalendarEvent);
        setSelectedDateEvents(events);
      } catch (error) {
        console.error('Error fetching events for date:', error);
        setSelectedDateEvents([]);
      } finally {
        setLoadingDateEvents(false);
      }
    }
  };

  // What the list shows: a tapped date > the viewed month > all upcoming
  const showingAll = !selectedDate && listMode === 'all';
  const listEvents = selectedDate
    ? selectedDateEvents
    : listMode === 'all'
      ? allUpcoming
      : monthEvents;
  // A tapped date shows everything; the tab lists show PAGE_SIZE at a time
  const displayedEvents = selectedDate ? listEvents : listEvents.slice(0, visibleCount);
  const remainingCount = listEvents.length - displayedEvents.length;
  const nextBatch = Math.min(PAGE_SIZE, remainingCount);

  // Back to the first page whenever the list changes (tab, month, date)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [listMode, currentMonth, currentYear, selectedDate]);

  // Real per-month totals, so a heading still says "3 events" when only
  // some of that month's events are on screen yet
  const monthTotals: Record<string, number> = {};
  for (const event of allUpcoming) {
    monthTotals[event.monthKey] = (monthTotals[event.monthKey] || 0) + 1;
  }
  const isLoadingEvents = selectedDate
    ? loadingDateEvents
    : listMode === 'all'
      ? isAllLoading && allUpcoming.length === 0
      : loading;

  // All upcoming → one section per month that HAS events (no empty months)
  const monthGroups: {
    key: string;
    label: string;
    month: number;
    year: number;
    events: CalendarEvent[];
  }[] = [];
  if (showingAll) {
    for (const event of displayedEvents) {
      const last = monthGroups[monthGroups.length - 1];
      if (last && last.key === event.monthKey) last.events.push(event);
      else
        monthGroups.push({
          key: event.monthKey,
          label: event.monthLabel,
          month: event.monthIndex,
          year: event.year,
          events: [event],
        });
    }
  }

  // Tapping a month heading jumps the calendar grid to that month
  const jumpToMonth = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setSelectedDate(null);
    setSelectedDateEvents([]);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const sectionTitle = selectedDate
    ? `Events on ${MONTHS[currentMonth].substring(0, 3)} ${selectedDate}`
    : 'Upcoming Events';

  const emptyTitle = selectedDate
    ? 'No events on this date'
    : listMode === 'all'
      ? 'No upcoming events'
      : `No events in ${MONTHS[currentMonth]}`;
  const emptySubtitle = selectedDate
    ? 'Select another date or add an event'
    : 'Add an event using the + button';

  const renderEventCard = (event: CalendarEvent, index: number) => {
    const isToday = event.desc === 'Today';
    return (
      <TouchableOpacity
        key={event.id || index}
        style={styles.eventCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('EventDetail', { eventId: event.id, event })}
      >
        <LinearGradient
          colors={['#fbe5f5', '#ccf9ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dateBadge}
        >
          <Text style={styles.dateBadgeWeekday}>{event.weekday}</Text>
          <Text style={styles.dateBadgeDay}>{event.day}</Text>
        </LinearGradient>
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title} {event.emoji}
          </Text>
          {event.contactName ? (
            <Text style={styles.eventContact} numberOfLines={1}>
              For {event.contactName}
            </Text>
          ) : null}
        </View>
        {event.desc ? (
          <View style={[styles.countdownPill, isToday && styles.countdownPillToday]}>
            <Text style={[styles.countdownText, isToday && styles.countdownTextToday]}>
              {event.desc}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

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
        <MaskedView maskElement={<Text style={styles.monthTextMask}>{MONTHS[currentMonth]}</Text>}>
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.monthTextMask, { opacity: 0 }]}>{MONTHS[currentMonth]}</Text>
          </LinearGradient>
        </MaskedView>

        <Animated.Text
          style={[
            styles.yearText,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ]}
        >
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
        ref={scrollRef}
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
                      onPress={() => handleDateSelect(item.day as number)}
                    >
                      {item.isToday ? (
                        <Animated.View
                          style={[
                            styles.todayCellWrapper,
                            {
                              transform: [{ scale: todayPulse }],
                            },
                          ]}
                        >
                          <LinearGradient
                            colors={['#ca9ad6', '#70d0dd']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.todayCell}
                          >
                            <Text style={styles.todayText}>{item.day}</Text>
                            {item.hasEvent && <View style={styles.eventDotWhite} />}
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
                            {item.hasEvent && <View style={styles.eventDotSelected} />}
                          </LinearGradient>
                        </View>
                      ) : item.hasEvent ? (
                        // Event day: soft pink→cyan bubble + gradient dot so
                        // it stands out from plain days in the app theme.
                        <View style={styles.selectedCellWrapper}>
                          <LinearGradient
                            colors={['#fbe5f5', '#ccf9ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.eventCell}
                          >
                            <Text style={styles.eventDayText}>{item.day}</Text>
                            <LinearGradient
                              colors={['#ca9ad6', '#70d0dd']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.eventDot}
                            />
                          </LinearGradient>
                        </View>
                      ) : (
                        <View style={styles.normalCell}>
                          <Text style={styles.dayText}>{item.day}</Text>
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
            <MaskedView maskElement={<Text style={styles.eventsTitleMask}>{sectionTitle}</Text>}>
              <LinearGradient
                colors={['#ca9ad6', '#70d0dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.eventsTitleMask, { opacity: 0 }]}>{sectionTitle}</Text>
              </LinearGradient>
            </MaskedView>
            {selectedDate && (
              <TouchableOpacity
                style={styles.clearDateBtn}
                onPress={() => {
                  setSelectedDate(null);
                  setSelectedDateEvents([]);
                }}
              >
                <Text style={styles.clearDateText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* All upcoming | the month shown in the grid */}
          {!selectedDate && (
            <View style={styles.tabs}>
              {(
                [
                  { key: 'all', label: `All upcoming (${allUpcoming.length})` },
                  { key: 'month', label: `${MONTHS[currentMonth]} (${monthEvents.length})` },
                ] as const
              ).map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tab, listMode === t.key && styles.tabActive]}
                  onPress={() => setListMode(t.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.tabText, listMode === t.key && styles.tabTextActive]}
                    numberOfLines={1}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isLoadingEvents &&
            [0, 1].map((i) => <SkeletonRow key={`skeleton-${i}`} avatarSize={40} />)}

          {!isLoadingEvents && displayedEvents.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{emptyTitle}</Text>
              <Text style={styles.emptySubtext}>{emptySubtitle}</Text>
              {!selectedDate && listMode === 'month' && allUpcoming.length > 0 && (
                <TouchableOpacity onPress={() => setListMode('all')} activeOpacity={0.8}>
                  <Text style={styles.emptyLink}>See all upcoming events →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!isLoadingEvents &&
            (showingAll
              ? monthGroups.map((group) => (
                  <View key={group.key} style={styles.monthGroup}>
                    <TouchableOpacity
                      style={styles.monthHeader}
                      activeOpacity={0.7}
                      onPress={() => jumpToMonth(group.month, group.year)}
                    >
                      <Text style={styles.monthHeaderText}>{group.label}</Text>
                      <View style={styles.monthHeaderLine} />
                      <Text style={styles.monthHeaderCount}>
                        {monthTotals[group.key]} {monthTotals[group.key] === 1 ? 'event' : 'events'}
                      </Text>
                    </TouchableOpacity>
                    {group.events.map(renderEventCard)}
                  </View>
                ))
              : displayedEvents.map(renderEventCard))}

          {!isLoadingEvents && remainingCount > 0 && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              activeOpacity={0.8}
              onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              <Text style={styles.loadMoreText}>Load {nextBatch} more</Text>
              <Text style={styles.loadMoreSub}>
                Showing {displayedEvents.length} of {listEvents.length}
              </Text>
            </TouchableOpacity>
          )}
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
    fontSize: typeScale['6xl'],
    fontFamily: 'Handlee_400Regular',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  yearText: {
    fontSize: typeScale.base,
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
    fontSize: typeScale['3xl'],
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
    fontSize: typeScale.sm,
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
    fontSize: typeScale.base,
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
    width: DAY_CIRCLE,
    height: DAY_CIRCLE,
    borderRadius: DAY_CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ca9ad6',
  },
  selectedText: {
    color: '#6b3a8a',
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.base,
  },
  eventDotSelected: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8a4fa3',
  },
  todayCell: {
    width: TODAY_CIRCLE,
    height: TODAY_CIRCLE,
    borderRadius: TODAY_CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: TODAY_CIRCLE, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  todayText: {
    color: '#FFFFFF',
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.base,
  },
  eventCell: {
    width: DAY_CIRCLE,
    height: DAY_CIRCLE,
    borderRadius: DAY_CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDayText: {
    color: '#8a4fa3',
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.base,
  },
  eventDot: {
    position: 'absolute',
    bottom: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventDotWhite: {
    position: 'absolute',
    bottom: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
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
    fontSize: typeScale.xl,
    fontFamily: 'Handlee_400Regular',
  },
  clearDateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fbe5f5',
    borderRadius: 12,
  },
  clearDateText: {
    fontSize: typeScale.base,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 4,
    borderRadius: 14,
    backgroundColor: '#f4e8f7',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: typeScale.base,
    fontFamily: 'Handlee_400Regular',
    color: '#7d6b8f',
  },
  tabTextActive: {
    color: '#6b3a8a',
  },
  monthGroup: {
    marginBottom: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  monthHeaderText: {
    fontSize: typeScale.sm,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    letterSpacing: 1,
  },
  monthHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ead7f0',
  },
  monthHeaderCount: {
    fontSize: typeScale.xs,
    fontFamily: 'Handlee_400Regular',
    color: '#7d6b8f',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  dateBadge: {
    width: 52,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeWeekday: {
    fontSize: typeScale.xs,
    fontFamily: 'Handlee_400Regular',
    color: '#8a4fa3',
    letterSpacing: 0.5,
  },
  dateBadgeDay: {
    fontSize: typeScale['2xl'],
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    lineHeight: 28,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: typeScale.md,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  eventContact: {
    fontSize: typeScale.sm,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 2,
  },
  countdownPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e8f9fb',
  },
  countdownPillToday: {
    backgroundColor: '#ca9ad6',
  },
  countdownText: {
    fontSize: typeScale.xs,
    fontFamily: 'Handlee_400Regular',
    color: '#1f6f7a',
  },
  countdownTextToday: {
    color: '#FFFFFF',
  },
  loadMoreBtn: {
    alignSelf: 'center',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 6,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#ca9ad6',
    backgroundColor: '#FFFFFF',
  },
  loadMoreText: {
    fontSize: typeScale.base,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  loadMoreSub: {
    fontSize: typeScale.xs,
    fontFamily: 'Handlee_400Regular',
    color: '#7d6b8f',
    marginTop: 2,
  },
  emptyLink: {
    marginTop: 12,
    fontSize: typeScale.base,
    fontFamily: 'Handlee_400Regular',
    color: '#8a4fa3',
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
    fontSize: typeScale.lg,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: typeScale.base,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
});

export default CalendarScreen;
