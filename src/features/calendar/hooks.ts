import { useQuery } from '@tanstack/react-query';
import { getEventDates, getUpcomingEvents } from '../../services/api';
import { getDateParts, daysUntil as appDaysUntil } from '../../utils/date';

export const eventsQueryKey = (year: number, month: number) => ['calendar', 'events', year, month];

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
  const [datesRes, upcomingRes] = await Promise.all([
    getEventDates(year, month + 1).catch(() => ({ dates: [] })),
    getUpcomingEvents(5).catch(() => ({ events: [] })),
  ]);

  const eventDates: Record<number, any> = {};
  if (datesRes.dates && Array.isArray(datesRes.dates)) {
    datesRes.dates.forEach((date: any) => {
      const parts = getDateParts(date.date || date);
      if (parts) eventDates[parts.day] = date;
    });
  }

  const upcomingEvents = (upcomingRes.events || []).map((event: any) => ({
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
