import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../../services/api';
import { getDateParts, formatDate, daysUntil as appDaysUntil } from '../../utils/date';

// Shared prefix so callers can invalidate every cached month at once
// (React Query matches queryKeys by prefix) after an action that changes
// events, e.g. queryClient.invalidateQueries({ queryKey: CALENDAR_EVENTS_QUERY_KEY_PREFIX }).
export const CALENDAR_EVENTS_QUERY_KEY_PREFIX = ['calendar', 'events'];
export const eventsQueryKey = (year: number, month: number) => [
  ...CALENDAR_EVENTS_QUERY_KEY_PREFIX,
  year,
  month,
];

export const getEventEmoji = (eventType?: string) => {
  const emojis: Record<string, string> = {
    Birthday: '🎂',
    Anniversary: '💍',
    Wedding: '💒',
    Graduation: '🎓',
    Holiday: '🎉',
    Other: '🎁',
  };
  return (eventType && emojis[eventType]) || '🎁';
};

export const getDaysUntil = (dateStr?: string) => {
  const diffDays = appDaysUntil(dateStr);
  if (diffDays === null) return '';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `In ${diffDays} days`;
};

export const formatEventDate = (dateStr?: string) => {
  const p = getDateParts(dateStr);
  return p ? `${p.monthShort} ${p.day}` : '';
};

// API event -> the shape the calendar list cards render.
export const toCalendarEvent = (event: any) => {
  const eventDate = event.eventDate || event.event_date;
  const parts = getDateParts(eventDate);
  return {
    id: event.id || event._id,
    title: event.title,
    eventType: event.eventType || event.event_type,
    eventDate,
    date: formatEventDate(eventDate),
    day: parts?.day ?? '',
    weekday: formatDate(eventDate, { weekday: 'short' }).toUpperCase(),
    // "DECEMBER 2026" — used to group the All upcoming list by month
    monthKey: parts ? `${parts.year}-${parts.month}` : '',
    monthLabel: parts ? `${parts.monthLong} ${parts.year}`.toUpperCase() : '',
    monthIndex: parts ? parts.month - 1 : 0,
    year: parts?.year ?? 0,
    emoji: getEventEmoji(event.eventType || event.event_type),
    desc: getDaysUntil(eventDate),
    circleId: event.circleId || event.circle_id,
    contactName: event.contact?.name,
  };
};

export type CalendarEvent = ReturnType<typeof toCalendarEvent>;

export interface CalendarEvents {
  // Day-of-month -> raw date entry from the API, for the calendar grid dots.
  eventDates: Record<number, any>;
  upcomingEvents: CalendarEvent[];
}

async function fetchCalendarEvents(year: number, month: number): Promise<CalendarEvents> {
  // Scoped to the month being VIEWED (not a global "next N upcoming from
  // today" list) — previously this used getUpcomingEvents(5), which never
  // changed no matter which month the grid was showing, so switching to an
  // empty future/past month kept showing whichever events were upcoming
  // from today's real date, and the empty state never triggered for a
  // genuinely empty month.
  const monthEventsRes = await getEvents({ month: month + 1, year }).catch(() => ({
    events: [],
  }));
  const upcomingEvents = (monthEventsRes.events || []).map(toCalendarEvent);

  // Grid highlights come from the same events as the month list, so a day
  // in the list is always marked on the grid. (The separate
  // /events/calendar/:y/:m endpoint returns { day, eventType } objects,
  // which this used to read as dates — every lookup failed, so no event day
  // was ever highlighted.)
  const eventDates: Record<number, any> = {};
  upcomingEvents.forEach((event) => {
    const parts = getDateParts(event.eventDate);
    if (parts && parts.year === year && parts.month === month + 1) {
      eventDates[parts.day] = event.eventDate;
    }
  });

  return { eventDates, upcomingEvents };
}

/**
 * Event dates (for the calendar grid) + upcoming events for one month —
 * the single hook the screen reads it through. Replaces the old manual
 * useFocusEffect + `silent`-refetch + setInterval dance. Keyed by
 * year/month so switching months fetches fresh data instead of serving a
 * stale month from cache.
 */
export function useCalendarEvents(year: number, month: number) {
  return useQuery({
    queryKey: eventsQueryKey(year, month),
    queryFn: () => fetchCalendarEvents(year, month),
    refetchInterval: 30_000,
  });
}

/**
 * Every upcoming event from today onward (no month limit), oldest first.
 * Powers the "All upcoming" list under the calendar, so events in later
 * months show without paging the grid month by month. Lives under the same
 * key prefix, so existing invalidations after add/edit/delete refresh it.
 */
export function useAllUpcomingEvents() {
  return useQuery({
    queryKey: [...CALENDAR_EVENTS_QUERY_KEY_PREFIX, 'upcoming'],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const res = await getEvents({ upcoming: true });
      return (res?.events || []).map(toCalendarEvent);
    },
    refetchInterval: 30_000,
  });
}
