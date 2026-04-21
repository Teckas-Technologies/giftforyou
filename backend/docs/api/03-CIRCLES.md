# Gift Circles API

## Overview

Gift Circles are the core relationship feature. A "circle" is your network of people whose gift preferences you can view, and who can view yours.

---

## Purpose

```
┌─────────────────────────────────────────────────────────────────┐
│                        GIFT CIRCLE CONCEPT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Sarah's Circle:                                                │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  👩 Mom (Family)         → Can view Mom's preferences   │   │
│   │  👨 Dad (Family)         → Can view Dad's preferences   │   │
│   │  👫 Best Friend (Friend) → Can view friend's prefs      │   │
│   │  👔 Colleague (Work)     → Pending invitation           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   When Sarah views Mom's preferences, she sees:                  │
│   • Favorite colors: Blue, Purple                               │
│   • Gift types: Books, Home decor                               │
│   • Wishlist links                                               │
│   • Upcoming birthday                                            │
│                                                                  │
│   This helps Sarah buy perfect gifts for Mom! 🎁                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/circles` | Yes | Get all contacts |
| GET | `/api/circles/grouped` | Yes | Get contacts by relationship |
| GET | `/api/circles/:id` | Yes | Get single contact |
| GET | `/api/circles/:id/preferences` | Yes | View contact's preferences |
| POST | `/api/circles` | Yes | Add contact to circle |
| POST | `/api/circles/quick-add/:userId` | Yes | Quick add from suggestions |
| PUT | `/api/circles/:id` | Yes | Update contact |
| DELETE | `/api/circles/:id` | Yes | Remove from circle |

---

## 1. Get All Contacts

Get all contacts in your gift circle.

### Request

```http
GET /api/circles
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name/nickname |
| relationship | string | Filter by relationship type |
| status | string | Filter by status (pending/accepted/guest) |

### Example

```http
GET /api/circles?relationship=Family&status=accepted
```

### Response (200 OK)

```json
{
  "contacts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "relationship": "Family",
      "nickname": "Mommy",
      "notes": "Loves gardening",
      "status": "accepted",
      "auto_added": false,
      "created_at": "2024-01-10T10:00:00.000Z",
      "member": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Mary Johnson",
        "email": "mary@example.com",
        "photo": "/uploads/mary.jpg",
        "avatar": null,
        "birthday": "1965-05-20",
        "questionnaire_completed": true
      },
      "upcoming_event": {
        "title": "Mom's Birthday",
        "event_date": "2024-05-20",
        "event_type": "birthday"
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "relationship": "Friend",
      "nickname": null,
      "notes": null,
      "status": "guest",
      "auto_added": false,
      "created_at": "2024-01-12T14:00:00.000Z",
      "member": {
        "name": "John Smith",
        "email": "john@example.com",
        "is_guest": true
      },
      "upcoming_event": null
    }
  ],
  "total": 2
}
```

### Contact Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Invitation sent but not accepted |
| `accepted` | User accepted invitation, can view preferences |
| `guest` | Added manually without invitation |

---

## 2. Get Contacts Grouped by Relationship

### Request

```http
GET /api/circles/grouped
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "groups": {
    "Family": [
      {
        "id": "...",
        "member": { "name": "Mom", ... },
        "relationship": "Family"
      },
      {
        "id": "...",
        "member": { "name": "Dad", ... },
        "relationship": "Family"
      }
    ],
    "Friend": [
      {
        "id": "...",
        "member": { "name": "Best Friend", ... },
        "relationship": "Friend"
      }
    ],
    "Colleague": [],
    "Other": []
  }
}
```

### Purpose

Used in Circles screen to display contacts organized by category.

---

## 3. Get Contact's Preferences

View a contact's gift preferences (the main purpose of the app!).

### Request

```http
GET /api/circles/:id/preferences
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "contact": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Mary Johnson",
    "email": "mary@example.com",
    "photo": "/uploads/mary.jpg",
    "avatar": null,
    "birthday": "****-05-20",
    "relationship": "Family",
    "nickname": "Mommy"
  },
  "preferences": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "favorite_activities": ["Gardening", "Reading", "Cooking"],
    "activity_details": "Loves growing roses and reading mystery novels",
    "personal_style": "Classic",
    "favorite_colors": ["Blue", "Purple", "White"],
    "likes_surprises": "Yes, love them",
    "causes_values": ["Eco-friendly", "Locally sourced"],
    "favorite_flower": "Rose",
    "flower_details": "Red and pink roses, loves arrangements with baby's breath",
    "favorite_cuisines": ["Italian", "French"],
    "favorite_restaurant": "Olive Garden",
    "favorite_meal": "Chicken Parmesan",
    "favorite_desserts": ["Cake", "Fruity"],
    "dessert_details": "Loves lemon cake and fruit tarts",
    "gift_types": ["Books & Learning", "Home & Living", "Beauty & Self Care"],
    "gift_details": "Would love new gardening books or spa gift cards",
    "music_genre": "Classical",
    "favorite_artists": "Andrea Bocelli, Yo-Yo Ma",
    "wishlist_text": "New gardening gloves, book by Agatha Christie",
    "clothing_sizes": "Top: L, Shoes: 8",
    "wishlist_links": [
      {
        "id": "...",
        "url": "https://amazon.com/wishlist/...",
        "title": "Amazon Wishlist"
      }
    ],
    "registries": []
  },
  "upcomingEvents": [
    {
      "id": "...",
      "title": "Mom's Birthday",
      "event_type": "birthday",
      "event_date": "2024-05-20"
    }
  ]
}
```

### Privacy Notes

- Birth year is hidden if contact set `show_birth_year = false`
- Only circle members can view preferences
- If contact hasn't filled questionnaire, preferences will be limited

### Guest Contact Response

```json
{
  "contact": {
    "name": "John Smith",
    "email": "john@example.com",
    "isGuest": true
  },
  "preferences": null,
  "message": "This contact has not filled out their preferences yet"
}
```

---

## 4. Add Contact to Circle

### Option A: Add Existing User

```http
POST /api/circles
Authorization: Bearer <token>
Content-Type: application/json

{
  "memberId": "550e8400-e29b-41d4-a716-446655440001",
  "relationship": "Family",
  "nickname": "Mom"
}
```

### Option B: Add Guest (Manual Entry)

```http
POST /api/circles
Authorization: Bearer <token>
Content-Type: application/json

{
  "guestName": "John Smith",
  "guestEmail": "john@example.com",
  "relationship": "Friend"
}
```

### Response (201 Created)

```json
{
  "message": "Contact added to circle",
  "contact": {
    "id": "550e8400-e29b-41d4-a716-446655440015",
    "owner_id": "550e8400-e29b-41d4-a716-446655440000",
    "member_id": "550e8400-e29b-41d4-a716-446655440001",
    "relationship": "Family",
    "nickname": "Mom",
    "status": "accepted",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### Error Responses

```json
// 400 - Already in circle
{
  "error": "Contact already in your circle"
}

// 400 - Cannot add yourself
{
  "error": "Cannot add yourself to your circle"
}
```

### How It Works

```
1. Validate request (need memberId OR guestEmail)
2. Check if contact already exists in circle
3. Prevent adding yourself
4. Create circle entry with status:
   - "accepted" for existing users
   - "guest" for manual entries
5. If member has birthday, auto-create birthday event
6. Return new circle entry
```

---

## 5. Quick Add from Suggestions

Add someone from "People You May Know" quickly.

### Request

```http
POST /api/circles/quick-add/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "relationship": "Friend"
}
```

### Response (201 Created)

```json
{
  "message": "Contact added",
  "contact": {
    "id": "...",
    "member_id": "550e8400-e29b-41d4-a716-446655440001",
    "relationship": "Friend",
    "status": "accepted"
  }
}
```

### How It Works

```
1. Check if already in circle
2. Get user info
3. Add to circle with "Friend" relationship
4. Create birthday event if available
5. Dismiss the suggestion
6. Return new contact
```

---

## 6. Update Contact

Update relationship or nickname.

### Request

```http
PUT /api/circles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "relationship": "Family",
  "nickname": "Mommy",
  "notes": "Loves gardening and mystery novels"
}
```

### Response (200 OK)

```json
{
  "message": "Contact updated",
  "contact": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "relationship": "Family",
    "nickname": "Mommy",
    "notes": "Loves gardening and mystery novels"
  }
}
```

---

## 7. Remove from Circle

### Request

```http
DELETE /api/circles/:id
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Contact removed from circle"
}
```

### Note

This also deletes associated events for this contact.

---

## Relationship Types

| Type | Description |
|------|-------------|
| Family | Parents, siblings, relatives |
| Friend | Friends, close acquaintances |
| Colleague | Work contacts |
| Partner | Spouse, significant other |
| Other | Any other relationship |

---

## Circle Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         CIRCLE MANAGEMENT FLOW                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [Circles Screen]                                                          │
│        │                                                                    │
│        ├──── View Contacts ──── GET /api/circles                           │
│        │           │                                                        │
│        │           └──── [Contact Card]                                    │
│        │                      │                                             │
│        │                      ├── Tap ──── GET /api/circles/:id/preferences │
│        │                      │                  │                          │
│        │                      │                  └── [Preferences Screen]  │
│        │                      │                         • Colors            │
│        │                      │                         • Gift types        │
│        │                      │                         • Wishlist          │
│        │                      │                                             │
│        │                      └── Edit ── PUT /api/circles/:id             │
│        │                              │                                     │
│        │                              └── [Edit Modal]                     │
│        │                                    • Nickname                      │
│        │                                    • Relationship                  │
│        │                                                                    │
│        ├──── Add Contact ──── POST /api/circles                            │
│        │           │                                                        │
│        │           └── [Add Contact Screen]                                │
│        │                 • Search existing users                            │
│        │                 • OR enter name/email manually                     │
│        │                                                                    │
│        └──── People You May Know ──── GET /api/discover/people-you-may-know│
│                    │                                                        │
│                    └── Quick Add ── POST /api/circles/quick-add/:id        │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Mobile App Usage

```javascript
// services/circleService.js

export const circleService = {
  // Get all contacts
  async getContacts(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/circles?${params}`);
    return response.data.contacts;
  },

  // Get contact preferences (for viewing gifts ideas)
  async getPreferences(circleId) {
    const response = await api.get(`/circles/${circleId}/preferences`);
    return response.data;
  },

  // Add new contact
  async addContact(data) {
    const response = await api.post('/circles', data);
    return response.data.contact;
  },

  // Update contact
  async updateContact(id, data) {
    const response = await api.put(`/circles/${id}`, data);
    return response.data.contact;
  },

  // Remove contact
  async removeContact(id) {
    await api.delete(`/circles/${id}`);
  },

  // Quick add from suggestions
  async quickAdd(userId, relationship = 'Friend') {
    const response = await api.post(`/circles/quick-add/${userId}`, { relationship });
    return response.data.contact;
  }
};
```
