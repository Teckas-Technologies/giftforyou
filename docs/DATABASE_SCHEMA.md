# GiftBox4you - Database Schema Documentation

## Overview

This document describes the database architecture of GiftBox4you, explaining how users, contacts, invitations, and questionnaires are interconnected.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   USERS                                      │
│  Primary entity - represents registered app users                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  id (PK), email, name, birthday, profile_photo, avatar_type                 │
│  questionnaire_completed, questionnaire_completion_percent                   │
│  profile_completed, onboarding_seen, push_token                             │
└─────────────────────────────────────────────────────────────────────────────┘
        │                    │                    │                    │
        │ 1:1                │ 1:N                │ 1:N                │ 1:N
        ▼                    ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│QUESTIONNAIRES│    │ GIFT_CIRCLES │    │ INVITATIONS  │    │    EVENTS    │
│              │    │  (Contacts)  │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
        │                    │
        │ 1:N                │ 1:N
        ▼                    ▼
┌──────────────┐    ┌──────────────┐
│WISHLIST_LINKS│    │    EVENTS    │
│  REGISTRIES  │    │              │
└──────────────┘    └──────────────┘
```

---

## Table Descriptions

### 1. USERS (Core Entity)

The central table that stores all registered user accounts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `external_id` | TEXT | Links to Supabase Auth |
| `email` | TEXT | User's email (unique) |
| `name` | TEXT | Display name |
| `birthday` | DATE | User's birthday |
| `profile_photo` | TEXT | URL to profile image |
| `avatar_type` | TEXT | Avatar style preference |
| `show_birth_year` | BOOLEAN | Privacy setting |
| `profile_completed` | BOOLEAN | Has completed profile setup |
| `questionnaire_completed` | BOOLEAN | Has completed questionnaire |
| `questionnaire_completion_percent` | INTEGER | 0-100% completion |
| `onboarding_seen` | BOOLEAN | Has seen onboarding |
| `push_token` | TEXT | For push notifications |
| `created_at` | TIMESTAMP | Account creation date |
| `last_login_at` | TIMESTAMP | Last login timestamp |

---

### 2. QUESTIONNAIRES (User Preferences)

Stores gift preferences for each user. One-to-one relationship with Users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `user_id` | UUID (FK) | References users.id |
| `favorite_activities` | TEXT[] | Array of activities |
| `personal_style` | TEXT | Style preference |
| `favorite_colors` | TEXT[] | Array of colors |
| `likes_surprises` | TEXT | Yes/No preference |
| `causes_values` | TEXT[] | Values they care about |
| `favorite_flower` | TEXT[] | Flower preferences |
| `favorite_cuisines` | TEXT[] | Food preferences |
| `favorite_restaurant` | TEXT | Restaurant name |
| `favorite_desserts` | TEXT[] | Dessert preferences |
| `gift_types` | TEXT[] | Preferred gift categories |
| `movie_genre` | TEXT | Favorite movie type |
| `music_genre` | TEXT | Favorite music type |
| `wishlist_text` | TEXT | Free-form wishlist |
| `clothing_sizes` | TEXT | Size information |

**Relationship:** `user_id` → `users.id` (ON DELETE CASCADE)

---

### 3. GIFT_CIRCLES (Contacts)

Stores contacts/connections for each user. Supports both registered users and guests.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `owner_id` | UUID (FK) | User who owns this contact |
| `member_id` | UUID (FK) | If contact is a registered user |
| `guest_name` | TEXT | Name (if not registered) |
| `guest_email` | TEXT | Email (if not registered) |
| `guest_birthday` | DATE | Birthday (if not registered) |
| `relationship` | TEXT | Family/Friend/Colleague/Partner/Other |
| `nickname` | TEXT | Custom display name |
| `notes` | TEXT | Personal notes |
| `status` | TEXT | pending/accepted/guest |
| `auto_added` | BOOLEAN | Was auto-created |
| `created_at` | TIMESTAMP | When contact was added |

**Relationships:**
- `owner_id` → `users.id` (ON DELETE CASCADE)
- `member_id` → `users.id` (ON DELETE SET NULL)

**Unique Constraints:**
- `(owner_id, member_id)` - One contact per registered user
- `(owner_id, guest_email)` - One contact per guest email

---

### 4. INVITATIONS

Stores invitation links sent to invite people to fill questionnaires.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `inviter_id` | UUID (FK) | User who sent invitation |
| `invitee_name` | TEXT | Name of person invited |
| `invitee_email` | TEXT | Email (optional) |
| `token` | TEXT | Unique invite link token |
| `personal_message` | TEXT | Custom message |
| `status` | TEXT | pending/opened/completed/expired |
| `expires_at` | TIMESTAMP | Expiration (30 days default) |
| `opened_at` | TIMESTAMP | When link was opened |
| `completed_at` | TIMESTAMP | When questionnaire submitted |
| `sent_count` | INTEGER | Times resent |
| `last_sent_at` | TIMESTAMP | Last send date |

**Relationship:** `inviter_id` → `users.id` (ON DELETE CASCADE)

---

### 5. EVENTS

Stores events/occasions for users and their contacts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `user_id` | UUID (FK) | User who owns this event |
| `circle_id` | UUID (FK) | Related contact (optional) |
| `contact_id` | UUID (FK) | Related user (optional) |
| `registry_id` | UUID (FK) | Related registry (optional) |
| `title` | TEXT | Event name |
| `event_type` | TEXT | birthday/anniversary/wedding/etc |
| `event_date` | DATE | When event occurs |
| `description` | TEXT | Event details |
| `is_recurring` | BOOLEAN | Repeats annually |
| `reminder_enabled` | BOOLEAN | Send reminders |
| `reminder_days` | INTEGER[] | Days before to remind |

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `circle_id` → `gift_circles.id` (ON DELETE SET NULL)
- `contact_id` → `users.id` (ON DELETE SET NULL)

---

### 6. Supporting Tables

#### WISHLIST_LINKS
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `user_id` | UUID (FK) | References users.id |
| `url` | TEXT | Link URL |
| `title` | TEXT | Display name |
| `link_type` | TEXT | amazon/target/other |

**Limit:** Maximum 3 links per user

#### REGISTRIES
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `user_id` | UUID (FK) | References users.id |
| `url` | TEXT | Registry URL |
| `title` | TEXT | Registry name |
| `registry_type` | TEXT | wedding/baby/birthday |
| `details` | TEXT | Additional info |
| `expiry_date` | DATE | When registry expires |
| `is_active` | BOOLEAN | Currently active |

#### USER_ANNIVERSARIES
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `user_id` | UUID (FK) | References users.id |
| `title` | TEXT | Anniversary name |
| `anniversary_date` | DATE | The date |

**Limit:** Maximum 3 anniversaries per user

---

## Contact Types & States

### Three Types of Contacts

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GIFT_CIRCLES (Contacts)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TYPE 1: REGISTERED USER                                            │
│  ────────────────────────                                           │
│  • member_id = user.id (links to their account)                     │
│  • Can view their filled questionnaire                              │
│  • Status: 'accepted'                                               │
│  • Example: Friend who has the app installed                        │
│                                                                     │
│  TYPE 2: PENDING GUEST (Invited)                                    │
│  ───────────────────────────────                                    │
│  • member_id = NULL                                                 │
│  • guest_name, guest_email stored                                   │
│  • Status: 'pending'                                                │
│  • Waiting for them to accept invitation                            │
│  • Example: Sent invite link, waiting for response                  │
│                                                                     │
│  TYPE 3: MANUAL GUEST (No Invitation)                               │
│  ─────────────────────────────────────                              │
│  • member_id = NULL                                                 │
│  • guest_name, guest_email, guest_birthday stored                   │
│  • Status: 'guest'                                                  │
│  • Manually added without sending invitation                        │
│  • Example: Added mom's birthday without inviting her               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## User Journey Flows

### Flow 1: Inviting a Friend

```
USER A (Has App)
    │
    ├──► 1. Taps "Invite Friend"
    │
    ├──► 2. Enters friend's name & email
    │       Creates INVITATION record
    │       Creates GIFT_CIRCLE with status='pending'
    │
    ├──► 3. Friend receives link (email/WhatsApp/SMS)
    │
    │           FRIEND (No Account Yet)
    │               │
    │               ├──► 4. Opens invitation link
    │               │       INVITATION.status = 'opened'
    │               │
    │               ├──► 5. Fills questionnaire form
    │               │
    │               └──► 6. Submits with name & email
    │                       • New USER record created
    │                       • QUESTIONNAIRE saved
    │                       • INVITATION.status = 'completed'
    │                       • GIFT_CIRCLE.member_id = new user.id
    │                       • GIFT_CIRCLE.status = 'accepted'
    │
    └──► 7. User A can now see friend's preferences!
```

### Flow 2: Adding Contact Manually

```
USER A
    │
    ├──► 1. Taps "Add Contact"
    │
    ├──► 2. Enters name, email, birthday
    │       Creates GIFT_CIRCLE with status='guest'
    │       member_id = NULL
    │
    ├──► 3. Optionally creates events (birthday, etc.)
    │
    └──► 4. Can later send invitation to link account
```

### Flow 3: Viewing Contact's Preferences

```
USER A
    │
    ├──► Opens contact from list
    │
    ├──► IF contact.member_id EXISTS:
    │       • Fetch member's QUESTIONNAIRE
    │       • Display all their preferences
    │       • Show wishlist links, registries
    │
    └──► IF contact is GUEST (member_id = NULL):
            • Only show manually entered info
            • Show "Invite to fill preferences" option
```

---

## Cascade Delete Rules

When a user is deleted, the following happens automatically:

| Parent Deleted | Child Table | Action |
|----------------|-------------|--------|
| User | Questionnaires | CASCADE (deleted) |
| User | Gift_Circles (as owner) | CASCADE (deleted) |
| User | Gift_Circles (as member) | SET NULL |
| User | Invitations | CASCADE (deleted) |
| User | Events | CASCADE (deleted) |
| User | Wishlist_Links | CASCADE (deleted) |
| User | Registries | CASCADE (deleted) |
| User | User_Anniversaries | CASCADE (deleted) |
| Gift_Circle | Events | SET NULL |

---

## API Endpoints Summary

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/setup` - Initial profile setup

### Questionnaire
- `GET /api/questionnaire` - Get my questionnaire
- `PUT /api/questionnaire` - Save questionnaire

### Contacts (Gift Circles)
- `GET /api/circles` - List all contacts
- `POST /api/circles` - Add contact
- `GET /api/circles/:id` - Get contact details
- `PUT /api/circles/:id` - Update contact
- `DELETE /api/circles/:id` - Remove contact

### Invitations
- `GET /api/invitations` - List sent invitations
- `POST /api/invitations` - Send new invitation
- `GET /api/invitations/validate/:token` - Validate invite link
- `POST /api/invitations/:token/submit` - Submit questionnaire via invite

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

---

## Security Notes

1. **Row Level Security (RLS):** Users can only access their own data
2. **Invitation Tokens:** Cryptographically random, expire after 30 days
3. **Cascade Deletes:** Ensure data cleanup when users are removed
4. **Email Uniqueness:** Prevents duplicate accounts

---

*Document Version: 1.0*
*Last Updated: May 2025*
