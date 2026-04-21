# Notifications API

## Overview

The Notifications API manages in-app notifications and push notification delivery. Notifications keep users informed about invitations, event reminders, and circle activity.

---

## Notification Types

```
┌─────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION TYPES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔔 invitation_accepted                                          │
│     "Mom accepted your invitation!"                              │
│     → Tap to view Mom's preferences                              │
│                                                                  │
│  📧 invitation_received                                          │
│     "Sarah invited you to join their Gift Circle"                │
│     → Tap to accept/view invitation                              │
│                                                                  │
│  🎂 event_reminder                                                │
│     "Dad's Birthday is in 7 days!"                               │
│     → Tap to view Dad's preferences                              │
│                                                                  │
│  👋 circle_added                                                  │
│     "John added you to their Gift Circle"                        │
│     → Tap to view John's profile                                 │
│                                                                  │
│  📝 questionnaire_reminder                                        │
│     "Complete your questionnaire to help friends find gifts"     │
│     → Tap to continue questionnaire                              │
│                                                                  │
│  🎁 preference_updated                                            │
│     "Mom updated their gift preferences"                         │
│     → Tap to see what's new                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/notifications` | Yes | Get all notifications |
| GET | `/api/notifications/unread-count` | Yes | Get unread count |
| PUT | `/api/notifications/:id/read` | Yes | Mark as read |
| PUT | `/api/notifications/read-all` | Yes | Mark all as read |
| DELETE | `/api/notifications/:id` | Yes | Delete notification |
| POST | `/api/notifications/register-push` | Yes | Register push token |

---

## 1. Get All Notifications

Get user's notifications with pagination.

### Request

```http
GET /api/notifications
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| unread | boolean | - | Filter unread only |

### Example

```http
GET /api/notifications?page=1&limit=10&unread=true
```

### Response (200 OK)

```json
{
  "notifications": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "type": "invitation_accepted",
      "title": "Invitation Accepted",
      "message": "Mom accepted your invitation!",
      "data": {
        "userId": "550e8400-e29b-41d4-a716-446655440001",
        "userName": "Mary Johnson",
        "circleId": "550e8400-e29b-41d4-a716-446655440010"
      },
      "is_read": false,
      "created_at": "2024-01-15T14:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440051",
      "type": "event_reminder",
      "title": "Birthday Reminder",
      "message": "Dad's Birthday is in 7 days!",
      "data": {
        "eventId": "550e8400-e29b-41d4-a716-446655440040",
        "eventType": "birthday",
        "contactId": "550e8400-e29b-41d4-a716-446655440011"
      },
      "is_read": false,
      "created_at": "2024-01-15T08:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440052",
      "type": "questionnaire_reminder",
      "title": "Complete Your Profile",
      "message": "Help your friends find perfect gifts - complete your questionnaire!",
      "data": {
        "completionPercent": 45
      },
      "is_read": true,
      "created_at": "2024-01-14T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "unreadCount": 2
}
```

---

## 2. Get Unread Count

Get count of unread notifications (for badge display).

### Request

```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "unreadCount": 5
}
```

### Purpose

Used to display notification badge on app icon and notification bell icon.

---

## 3. Mark as Read

Mark a single notification as read.

### Request

```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": "550e8400-e29b-41d4-a716-446655440050",
    "is_read": true,
    "read_at": "2024-01-15T15:00:00.000Z"
  }
}
```

---

## 4. Mark All as Read

Mark all notifications as read.

### Request

```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

## 5. Delete Notification

Delete a notification.

### Request

```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Notification deleted"
}
```

---

## 6. Register Push Token

Register device push notification token.

### Request

```http
POST /api/notifications/register-push
Authorization: Bearer <token>
Content-Type: application/json

{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pushToken | string | Yes | FCM or Expo push token |
| platform | string | Yes | "ios" or "android" |

### Response (200 OK)

```json
{
  "message": "Push token registered"
}
```

### How It Works

```
1. Mobile app gets push token from FCM/Expo
2. App sends token to server
3. Server stores token in user record
4. When notification is created, server sends push via FCM
5. On logout, push token is cleared
```

---

## Push Notification Delivery

### Server-Side Push Logic

```javascript
// services/pushService.js

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendPushNotification = async (userId, notification) => {
  // Get user's push token
  const user = await User.findById(userId);
  if (!user || !user.push_token) return;

  const message = {
    token: user.push_token,
    notification: {
      title: notification.title,
      body: notification.message
    },
    data: {
      type: notification.type,
      notificationId: notification.id,
      ...notification.data
    },
    apns: {
      payload: {
        aps: {
          badge: await getUnreadCount(userId),
          sound: 'default'
        }
      }
    },
    android: {
      notification: {
        sound: 'default',
        channelId: 'giftbox_notifications'
      }
    }
  };

  try {
    await admin.messaging().send(message);
  } catch (error) {
    // Handle invalid token
    if (error.code === 'messaging/registration-token-not-registered') {
      await User.clearPushToken(userId);
    }
  }
};
```

---

## Notification Creation Triggers

### 1. Invitation Accepted

```javascript
// When invitee submits web questionnaire
async function onInvitationAccepted(invitation, newUser) {
  await Notification.create({
    userId: invitation.inviter_id,
    type: 'invitation_accepted',
    title: 'Invitation Accepted',
    message: `${newUser.name} accepted your invitation!`,
    data: {
      userId: newUser.id,
      userName: newUser.name,
      circleId: invitation.circle_id
    }
  });
}
```

### 2. Event Reminder (Scheduled Job)

```javascript
// Runs daily at 8 AM
async function sendEventReminders() {
  const today = new Date();

  // Find events where reminder should be sent
  const events = await Event.findUpcomingWithReminders();

  for (const event of events) {
    const daysUntil = daysBetween(today, event.event_date);

    if (daysUntil === event.reminder_days) {
      await Notification.create({
        userId: event.user_id,
        type: 'event_reminder',
        title: 'Upcoming Event',
        message: `${event.title} is in ${daysUntil} days!`,
        data: {
          eventId: event.id,
          eventType: event.event_type,
          contactId: event.contact_id
        }
      });
    }
  }
}
```

### 3. Circle Added

```javascript
// When someone adds you to their circle
async function onAddedToCircle(ownerId, memberId) {
  const owner = await User.findById(ownerId);

  await Notification.create({
    userId: memberId,
    type: 'circle_added',
    title: 'New Connection',
    message: `${owner.name} added you to their Gift Circle`,
    data: {
      userId: owner.id,
      userName: owner.name
    }
  });
}
```

### 4. Questionnaire Reminder (Scheduled Job)

```javascript
// Runs weekly for users with incomplete questionnaires
async function sendQuestionnaireReminders() {
  const incompleteUsers = await User.findWithIncompleteQuestionnaire();

  for (const user of incompleteUsers) {
    // Don't spam - check last reminder date
    const lastReminder = await Notification.findLastOfType(
      user.id,
      'questionnaire_reminder'
    );

    if (!lastReminder || daysSince(lastReminder.created_at) >= 7) {
      await Notification.create({
        userId: user.id,
        type: 'questionnaire_reminder',
        title: 'Complete Your Profile',
        message: 'Help your friends find perfect gifts!',
        data: {
          completionPercent: user.questionnaire_completion_percent
        }
      });
    }
  }
}
```

---

## Notification Data Schema

| Type | Data Fields |
|------|-------------|
| `invitation_accepted` | userId, userName, circleId |
| `invitation_received` | invitationId, inviterName |
| `event_reminder` | eventId, eventType, contactId, daysUntil |
| `circle_added` | userId, userName |
| `questionnaire_reminder` | completionPercent |
| `preference_updated` | userId, userName, circleId |

---

## Mobile App Usage

```javascript
// screens/NotificationsScreen.js

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await api.put(`/notifications/${notification.id}/read`);
    }

    // Navigate based on type
    switch (notification.type) {
      case 'invitation_accepted':
      case 'preference_updated':
        navigate('ContactPreferences', {
          circleId: notification.data.circleId
        });
        break;

      case 'event_reminder':
        navigate('EventDetail', {
          eventId: notification.data.eventId
        });
        break;

      case 'circle_added':
        navigate('ContactProfile', {
          userId: notification.data.userId
        });
        break;

      case 'questionnaire_reminder':
        navigate('Questionnaire');
        break;
    }
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    loadNotifications();
  };

  return (
    <View>
      <Header>
        <Title>Notifications</Title>
        <MarkAllReadButton onPress={markAllRead} />
      </Header>

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        refreshing={loading}
        onRefresh={loadNotifications}
      />
    </View>
  );
};
```

### Push Notification Handler

```javascript
// App.js or NotificationContext.js

import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const App = () => {
  useEffect(() => {
    registerForPushNotifications();
    setupNotificationListeners();
  }, []);

  const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const token = await Notifications.getExpoPushTokenAsync();

    // Send to server
    await api.post('/notifications/register-push', {
      pushToken: token.data,
      platform: Platform.OS
    });
  };

  const setupNotificationListeners = () => {
    // When notification is received while app is open
    Notifications.addNotificationReceivedListener(notification => {
      // Update badge count, show in-app notification
    });

    // When user taps notification
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      handleNotificationNavigation(data);
    });
  };

  return <AppNavigator />;
};
```

---

## Notification Badge Component

```javascript
// components/NotificationBadge.js

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();

    // Poll every minute
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    const response = await api.get('/notifications/unread-count');
    setUnreadCount(response.data.unreadCount);
  };

  if (unreadCount === 0) return null;

  return (
    <Badge>
      <Text>{unreadCount > 99 ? '99+' : unreadCount}</Text>
    </Badge>
  );
};
```

