import { useQuery } from '@tanstack/react-query';
import { getEventDates, getEvents } from '../../services/api';
import { getDateParts, daysUntil as appDaysUntil } from '../../utils/date';

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

export interface CalendarEvents {
  // Day-of-month -> raw date entry from the API, for the calendar grid dots.
  eventDates: Record<number, any>;
  upcomingEvents: any[];
}

async function fetchCalendarEvents(year: number, month: number): Promise<CalendarEvents> {
  // Scoped to the month being VIEWED (not a global "next N upcoming from
  // today" list) — previously this used getUpcomingEvents(5), which never
  // changed no matter which month the grid was showing, so switching to an
  // empty future/past month kept showing whichever events were upcoming
  // from today's real date, and the empty state never triggered for a
  // genuinely empty month.
  const [datesRes, monthEventsRes] = await Promise.all([
    getEventDates(year, month + 1).catch(() => ({ dates: [] })),
    getEvents({ month: month + 1, year }).catch(() => ({ events: [] })),
  ]);

  const eventDates: Record<number, any> = {};
  if (datesRes.dates && Array.isArray(datesRes.dates)) {
    datesRes.dates.forEach((date: any) => {
      const parts = getDateParts(date.date || date);
      if (parts) eventDates[parts.day] = date;
    });
  }

  const upcomingEvents = (monthEventsRes.events || []).map((event: any) => ({
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
