# Events & Calendar API

## Overview

The Events API manages important dates like birthdays, anniversaries, and special occasions. Events can be associated with contacts in your circle or be personal reminders.

---

## Purpose

```
┌─────────────────────────────────────────────────────────────────┐
│                        CALENDAR FEATURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Sarah's Calendar View:                                         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  JANUARY 2024                                            │   │
│   │  ┌───┬───┬───┬───┬───┬───┬───┐                          │   │
│   │  │ S │ M │ T │ W │ T │ F │ S │                          │   │
│   │  ├───┼───┼───┼───┼───┼───┼───┤                          │   │
│   │  │   │   │   │   │   │   │   │                          │   │
│   │  │   │   │ 9 │   │   │🎂│   │  ← Dad's Birthday (12th)  │   │
│   │  │   │   │   │   │💍│   │   │  ← Anniversary (18th)     │   │
│   │  │   │   │   │   │   │   │🎁│  ← Mom's Birthday (27th)  │   │
│   │  └───┴───┴───┴───┴───┴───┴───┘                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Upcoming Events:                                               │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  🎂 Dad's Birthday - Jan 12 (3 days away)               │   │
│   │     └── [View Dad's Preferences] [Set Reminder]         │   │
│   │                                                          │   │
│   │  💍 Wedding Anniversary - Jan 18 (9 days away)          │   │
│   │     └── [Add Gift Ideas] [Set Reminder]                 │   │
│   │                                                          │   │
│   │  🎁 Mom's Birthday - Jan 27 (18 days away)              │   │
│   │     └── [View Mom's Preferences] [Set Reminder]         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/events` | Yes | Get all my events |
| GET | `/api/events/upcoming` | Yes | Get upcoming events |
| GET | `/api/events/month/:year/:month` | Yes | Get events for month |
| GET | `/api/events/:id` | Yes | Get single event |
| POST | `/api/events` | Yes | Create new event |
| PUT | `/api/events/:id` | Yes | Update event |
| DELETE | `/api/events/:id` | Yes | Delete event |

---

## 1. Get All Events

Get all events including birthdays and custom events.

### Request

```http
GET /api/events
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by event_type (birthday, anniversary, holiday, custom) |
| contactId | string | Filter by associated contact |

### Response (200 OK)

```json
{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "title": "Mom's Birthday",
      "event_type": "birthday",
      "event_date": "2024-05-20",
      "is_recurring": true,
      "reminder_days": 7,
      "notes": "She mentioned wanting gardening books",
      "created_at": "2024-01-10T10:00:00.000Z",
      "contact": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Mary Johnson",
        "photo": "/uploads/mary.jpg",
        "relationship": "Family"
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440041",
      "title": "Wedding Anniversary",
      "event_type": "anniversary",
      "event_date": "2024-06-15",
      "is_recurring": true,
      "reminder_days": 14,
      "notes": "10 year anniversary!",
      "created_at": "2024-01-10T10:00:00.000Z",
      "contact": null
    }
  ],
  "total": 2
}
```

---

## 2. Get Upcoming Events

Get events happening soon (within specified days).

### Request

```http
GET /api/events/upcoming
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | number | 30 | Events within this many days |
| limit | number | 10 | Maximum events to return |

### Example

```http
GET /api/events/upcoming?days=14&limit=5
```

### Response (200 OK)

```json
{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "title": "Dad's Birthday",
      "event_type": "birthday",
      "event_date": "2024-01-15",
      "days_until": 3,
      "is_recurring": true,
      "contact": {
        "id": "...",
        "name": "Robert Johnson",
        "photo": "/uploads/dad.jpg",
        "has_preferences": true
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440041",
      "title": "Best Friend's Birthday",
      "event_type": "birthday",
      "event_date": "2024-01-22",
      "days_until": 10,
      "is_recurring": true,
      "contact": {
        "id": "...",
        "name": "Jessica Smith",
        "photo": null,
        "has_preferences": true
      }
    }
  ],
  "total": 2
}
```

### Purpose

Used on Home screen to show upcoming events card and on Calendar screen header.

---

## 3. Get Events for Month

Get all events for a specific month (calendar view).

### Request

```http
GET /api/events/month/2024/01
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "year": 2024,
  "month": 1,
  "events": [
    {
      "id": "...",
      "title": "Dad's Birthday",
      "event_type": "birthday",
      "event_date": "2024-01-15",
      "day": 15,
      "contact": {
        "name": "Robert Johnson",
        "photo": "/uploads/dad.jpg"
      }
    },
    {
      "id": "...",
      "title": "Team Lunch",
      "event_type": "custom",
      "event_date": "2024-01-20",
      "day": 20,
      "contact": null
    }
  ],
  "eventsByDay": {
    "15": [{ "id": "...", "title": "Dad's Birthday", "type": "birthday" }],
    "20": [{ "id": "...", "title": "Team Lunch", "type": "custom" }]
  }
}
```

### Purpose

Powers the calendar grid view with dots on days that have events.

---

## 4. Create Event

Create a new event or reminder.

### Request

```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mom's Birthday",
  "eventType": "birthday",
  "eventDate": "2024-05-20",
  "isRecurring": true,
  "reminderDays": 7,
  "notes": "Get her gardening supplies",
  "circleId": "550e8400-e29b-41d4-a716-446655440010"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Event title |
| eventType | string | Yes | birthday, anniversary, holiday, custom |
| eventDate | date | Yes | Date of event (YYYY-MM-DD) |
| isRecurring | boolean | No | Repeat yearly (default: true for birthday/anniversary) |
| reminderDays | number | No | Days before to send reminder (default: 7) |
| notes | string | No | Personal notes |
| circleId | string | No | Link to contact in circle |

### Response (201 Created)

```json
{
  "message": "Event created",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440042",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "circle_id": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Mom's Birthday",
    "event_type": "birthday",
    "event_date": "2024-05-20",
    "is_recurring": true,
    "reminder_days": 7,
    "notes": "Get her gardening supplies",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### Auto-Created Events

When a contact is added to your circle and they have a birthday, a birthday event is automatically created:

```
1. User adds Mom to circle
2. Mom's profile has birthday = "1965-05-20"
3. Server auto-creates:
   - Event: "Mom's Birthday"
   - Type: birthday
   - Date: Current year's May 20
   - Recurring: true
   - Reminder: 7 days
   - Linked to: circle entry
```

---

## 5. Update Event

Update an existing event.

### Request

```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "reminderDays": 14,
  "notes": "Updated notes - she wants the new novel by her favorite author"
}
```

### Response (200 OK)

```json
{
  "message": "Event updated",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440042",
    "title": "Mom's Birthday",
    "event_type": "birthday",
    "event_date": "2024-05-20",
    "is_recurring": true,
    "reminder_days": 14,
    "notes": "Updated notes - she wants the new novel by her favorite author",
    "updated_at": "2024-01-15T14:00:00.000Z"
  }
}
```

---

## 6. Delete Event

Delete an event.

### Request

```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Event deleted"
}
```

### Note

Auto-created birthday events are deleted when the contact is removed from circle.

---

## Event Types

| Type | Icon | Description | Auto-Recurring |
|------|------|-------------|----------------|
| `birthday` | 🎂 | Birthday celebration | Yes |
| `anniversary` | 💍 | Wedding/relationship anniversary | Yes |
| `holiday` | 🎄 | Holidays and special days | Yes |
| `custom` | 🎁 | User-created custom event | Configurable |

---

## Reminder System

```
┌─────────────────────────────────────────────────────────────────┐
│                      REMINDER FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Event: Mom's Birthday (May 20)                                 │
│   Reminder Days: 7                                               │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  May 13 (7 days before)                                 │   │
│   │  ┌─────────────────────────────────────────────────┐   │   │
│   │  │  🔔 Reminder: Mom's Birthday in 7 days!         │   │   │
│   │  │     Tap to view her gift preferences            │   │   │
│   │  └─────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Server runs daily job:                                         │
│   1. Find events where event_date - today = reminder_days       │
│   2. Create notification for each                                │
│   3. Send push notification if user has push_token              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Recurring Events Logic

For recurring events, the system calculates the next occurrence:

```javascript
// Get next occurrence of a recurring event
function getNextOccurrence(eventDate) {
  const today = new Date();
  const event = new Date(eventDate);

  // Set event to current year
  event.setFullYear(today.getFullYear());

  // If already passed this year, set to next year
  if (event < today) {
    event.setFullYear(today.getFullYear() + 1);
  }

  return event;
}

// Example:
// Today: Jan 15, 2024
// Event date: May 20 (any year)
// Next occurrence: May 20, 2024

// Today: June 1, 2024
// Event date: May 20 (any year)
// Next occurrence: May 20, 2025
```

---

## Mobile App Usage

```javascript
// screens/CalendarScreen.js

const CalendarScreen = () => {
  const [events, setEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [eventsByDay, setEventsByDay] = useState({});

  useEffect(() => {
    loadMonthEvents();
  }, [selectedMonth]);

  const loadMonthEvents = async () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;

    const response = await api.get(`/events/month/${year}/${month}`);
    setEvents(response.data.events);
    setEventsByDay(response.data.eventsByDay);
  };

  const createEvent = async (data) => {
    try {
      await api.post('/events', {
        title: data.title,
        eventType: data.type,
        eventDate: data.date,
        isRecurring: data.recurring,
        reminderDays: data.reminder,
        notes: data.notes,
        circleId: data.contactId
      });

      loadMonthEvents(); // Refresh
      Alert.alert('Success', 'Event created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
    }
  };

  return (
    <View>
      {/* Calendar Grid */}
      <Calendar
        currentMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        markedDates={eventsByDay}
        onDayPress={(day) => showEventsForDay(day)}
      />

      {/* Event List */}
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => navigateToEvent(item.id)}
          />
        )}
      />

      {/* Add Event FAB */}
      <FloatingButton onPress={showCreateEventModal} />
    </View>
  );
};
```

---

## Home Screen Integration

```javascript
// components/UpcomingEventsCard.js

const UpcomingEventsCard = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    const response = await api.get('/events/upcoming?days=30&limit=3');
    setEvents(response.data.events);
  };

  return (
    <Card>
      <CardTitle>Upcoming Events</CardTitle>
      {events.map(event => (
        <EventRow key={event.id}>
          <EventIcon type={event.event_type} />
          <View>
            <Text>{event.title}</Text>
            <Text>{event.days_until} days away</Text>
          </View>
          {event.contact?.has_preferences && (
            <Button onPress={() => viewPreferences(event.contact.id)}>
              View Preferences
            </Button>
          )}
        </EventRow>
      ))}
      <ViewAllLink onPress={() => navigate('Calendar')}>
        View All Events
      </ViewAllLink>
    </Card>
  );
};
```

