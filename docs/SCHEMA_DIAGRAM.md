# GiftBox4you - Database Schema Diagram

## Complete Entity Relationship

```
                                    ┌─────────────────────────────────────┐
                                    │              USERS                   │
                                    │  ─────────────────────────────────  │
                                    │  id (PK), external_id, email        │
                                    │  name, birthday, profile_photo      │
                                    │  avatar_type, show_birth_year       │
                                    │  profile_completed                  │
                                    │  questionnaire_completed            │
                                    │  questionnaire_completion_percent   │
                                    │  onboarding_seen, push_token        │
                                    └──────────────────┬──────────────────┘
                                                       │
       ┌───────────────┬───────────────┬───────────────┼───────────────┬───────────────┬───────────────┐
       │               │               │               │               │               │               │
       ▼               ▼               ▼               ▼               ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│QUESTIONNAIRE│ │GIFT_CIRCLES │ │ INVITATIONS │ │   EVENTS    │ │NOTIFICATIONS│ │USER_PUSH    │ │USER_        │
│     (1:1)   │ │  (1:N)      │ │   (1:N)     │ │   (1:N)     │ │   (1:N)     │ │TOKENS (1:1) │ │ANNIVERSARIES│
└─────────────┘ └──────┬──────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │   (1:N)     │
       │               │                                                                        └─────────────┘
       │               │
       ▼               ▼
┌─────────────┐ ┌─────────────┐
│WISHLIST_    │ │  EVENTS     │
│LINKS (1:N)  │ │  (via       │
├─────────────┤ │  circle_id) │
│REGISTRIES   │ └─────────────┘
│   (1:N)     │
└─────────────┘
```

---

## All Tables with Columns

### 1. USERS (Core)
```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
├─────────────────────────────────────────────────────────────┤
│ id                    UUID (PK)                             │
│ external_id           TEXT (Supabase Auth link)             │
│ email                 TEXT (UNIQUE)                         │
│ name                  TEXT                                  │
│ profile_photo         TEXT                                  │
│ avatar_type           TEXT (turtle/pig/cow/flowers)         │
│ birthday              DATE                                  │
│ show_birth_year       BOOLEAN                               │
│ profile_completed     BOOLEAN                               │
│ questionnaire_completed BOOLEAN                             │
│ questionnaire_completion_percent INTEGER (0-100)            │
│ onboarding_seen       BOOLEAN                               │
│ push_token            TEXT                                  │
│ last_login_at         TIMESTAMPTZ                           │
│ created_at            TIMESTAMPTZ                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. QUESTIONNAIRES (1:1 with Users)
```
┌─────────────────────────────────────────────────────────────┐
│                     QUESTIONNAIRES                           │
├─────────────────────────────────────────────────────────────┤
│ id                    UUID (PK)                             │
│ user_id               UUID (FK → users.id) UNIQUE           │
│ ─────────────────────────────────────────────────────────── │
│ favorite_activities   TEXT[]                                │
│ activity_details      TEXT                                  │
│ personal_style        TEXT                                  │
│ personal_style_other  TEXT                                  │
│ favorite_colors       TEXT[]                                │
│ favorite_colors_other TEXT                                  │
│ likes_surprises       TEXT                                  │
│ causes_values         TEXT[]                                │
│ causes_other          TEXT                                  │
│ favorite_flower       TEXT[]                                │
│ flower_details        TEXT                                  │
│ favorite_cuisines     TEXT[]                                │
│ favorite_restaurant   TEXT                                  │
│ cuisine_other         TEXT                                  │
│ favorite_meal         TEXT                                  │
│ favorite_desserts     TEXT[]                                │
│ dessert_details       TEXT                                  │
│ gift_types            TEXT[]                                │
│ gift_details          TEXT                                  │
│ movie_genre           TEXT                                  │
│ favorite_movies       TEXT                                  │
│ music_genre           TEXT                                  │
│ favorite_artists      TEXT                                  │
│ wishlist_text         TEXT                                  │
│ clothing_sizes        TEXT                                  │
└─────────────────────────────────────────────────────────────┘
```

### 3. GIFT_CIRCLES (Contacts - 1:N with Users)
```
┌─────────────────────────────────────────────────────────────┐
│                      GIFT_CIRCLES                            │
├─────────────────────────────────────────────────────────────┤
│ id                    UUID (PK)                             │
│ owner_id              UUID (FK → users.id) NOT NULL         │
│ member_id             UUID (FK → users.id) NULLABLE         │
│ ─────────────────────────────────────────────────────────── │
│ guest_name            TEXT (if no account)                  │
│ guest_email           TEXT (if no account)                  │
│ ─────────────────────────────────────────────────────────── │
│ relationship          TEXT (Family/Friend/Colleague/        │
│                             Partner/Other)                  │
│ nickname              TEXT                                  │
│ notes                 TEXT                                  │
│ status                TEXT (pending/accepted/guest)         │
│ auto_added            BOOLEAN                               │
├─────────────────────────────────────────────────────────────┤
│ UNIQUE(owner_id, member_id)                                 │
│ UNIQUE(owner_id, guest_email)                               │
└─────────────────────────────────────────────────────────────┘
```

### 4. INVITATIONS (1:N with Users)
```
┌─────────────────────────────────────────────────────────────┐
│                      INVITATIONS                             │
├─────────────────────────────────────────────────────────────┤
│ id                    UUID (PK)                             │
│ inviter_id            UUID (FK → users.id) NOT NULL         │
│ ─────────────────────────────────────────────────────────── │
│ invitee_name          TEXT NOT NULL                         │
│ invitee_email         TEXT (optional)                       │
│ personal_message      TEXT                                  │
│ relationship          TEXT                                  │
│ ─────────────────────────────────────────────────────────── │
│ token                 TEXT (UNIQUE) - invite link           │
│ status                TEXT (pending/opened/completed/       │
│                             expired)                        │
│ ─────────────────────────────────────────────────────────── │
│ sent_count            INTEGER                               │
│ last_sent_at          TIMESTAMPTZ                           │
│ opened_at             TIMESTAMPTZ                           │
│ completed_at          TIMESTAMPTZ                           │
│ expires_at            TIMESTAMPTZ (default: 30 days)        │
└─────────────────────────────────────────────────────────────┘
```

### 5. EVENTS (1:N with Users & Gift_Circles)
```
┌─────────────────────────────────────────────────────────────┐
│                        EVENTS                                │
├─────────────────────────────────────────────────────────────┤
│ id                    UUID (PK)                             │
│ user_id               UUID (FK → users.id) NOT NULL         │
│ circle_id             UUID (FK → gift_circles.id)           │
│ contact_id            UUID (FK → users.id)                  │
│ registry_id           UUID (FK → registries.id)             │
│ ─────────────────────────────────────────────────────────── │
│ title                 TEXT NOT NULL                         │
│ event_type            TEXT (birthday/anniversary/holiday/   │
│                             wedding/baby_shower/graduation/ │
│                             other)                          │
│ event_date            DATE NOT NULL                         │
│ description           TEXT                                  │
│ ─────────────────────────────────────────────────────────── │
│ is_recurring          BOOLEAN                               │
│ reminder_enabled      BOOLEAN                               │
│ reminder_days         INTEGER[] (default: [7, 1])           │
│ last_reminder_sent    DATE                                  │
└─────────────────────────────────────────────────────────────┘
```

### 6. NOTIFICATIONS (1:N with Users)
```
┌─────────────────────────────────────────────────────────────┐
│                     NOTIFICATIONS                            │
├─────────────────────────────────────────────────────────────┤
│ id                    UUID (PK)                             │
│ user_id               UUID (FK → users.id) NOT NULL         │
│ ─────────────────────────────────────────────────────────── │
│ type                  TEXT (event_reminder/                 │
│                             invitation_accepted/            │
│                             invitation_received/            │
│                             circle_added/                   │
│                             questionnaire_reminder/         │
│                             preference_updated/             │
│                             profile_incomplete/             │
│                             new_friend/milestone)           │
│ title                 TEXT NOT NULL                         │
│ body                  TEXT                                  │
│ ─────────────────────────────────────────────────────────── │
│ related_type          TEXT                                  │
│ related_id            UUID                                  │
│ data                  JSONB                                 │
│ ─────────────────────────────────────────────────────────── │
│ is_read               BOOLEAN                               │
│ is_pushed             BOOLEAN                               │
└─────────────────────────────────────────────────────────────┘
```

### 7. Supporting Tables

```
┌─────────────────────────────────────────────────────────────┐
│                   USER_ANNIVERSARIES                         │
├─────────────────────────────────────────────────────────────┤
│ id          UUID (PK)                                       │
│ user_id     UUID (FK → users.id)                            │
│ title       TEXT NOT NULL                                   │
│ date        DATE NOT NULL                                   │
│ (Max 3 per user)                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    WISHLIST_LINKS                            │
├─────────────────────────────────────────────────────────────┤
│ id          UUID (PK)                                       │
│ user_id     UUID (FK → users.id)                            │
│ url         TEXT NOT NULL                                   │
│ title       TEXT                                            │
│ link_type   TEXT                                            │
│ (Max 3 per user)                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      REGISTRIES                              │
├─────────────────────────────────────────────────────────────┤
│ id            UUID (PK)                                     │
│ user_id       UUID (FK → users.id)                          │
│ url           TEXT NOT NULL                                 │
│ title         TEXT                                          │
│ registry_type TEXT (wedding/baby/birthday/other)            │
│ details       TEXT                                          │
│ expiry_date   DATE                                          │
│ is_active     BOOLEAN                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   USER_PUSH_TOKENS                           │
├─────────────────────────────────────────────────────────────┤
│ id          UUID (PK)                                       │
│ user_id     UUID (FK → users.id) UNIQUE                     │
│ push_token  TEXT NOT NULL                                   │
│ device_type TEXT (android/ios)                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  FRIEND_SUGGESTIONS                          │
├─────────────────────────────────────────────────────────────┤
│ id                UUID (PK)                                 │
│ user_id           UUID (FK → users.id)                      │
│ suggested_user_id UUID (FK → users.id)                      │
│ mutual_friend_id  UUID (FK → users.id)                      │
│ connection_reason TEXT                                      │
│ is_dismissed      BOOLEAN                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Foreign Key Relationships

```
users.id
    │
    ├──► questionnaires.user_id (1:1, CASCADE)
    │
    ├──► user_anniversaries.user_id (1:N, CASCADE)
    │
    ├──► wishlist_links.user_id (1:N, CASCADE)
    │
    ├──► registries.user_id (1:N, CASCADE)
    │
    ├──► gift_circles.owner_id (1:N, CASCADE) ──► Who OWNS the contact
    │
    ├──► gift_circles.member_id (N:1, SET NULL) ──► Contact's user account
    │
    ├──► invitations.inviter_id (1:N, CASCADE)
    │
    ├──► events.user_id (1:N, CASCADE)
    │
    ├──► events.contact_id (N:1, SET NULL)
    │
    ├──► notifications.user_id (1:N, CASCADE)
    │
    ├──► user_push_tokens.user_id (1:1, CASCADE)
    │
    └──► friend_suggestions.user_id (1:N, CASCADE)

gift_circles.id
    │
    └──► events.circle_id (1:N, SET NULL)

registries.id
    │
    └──► events.registry_id (1:N, SET NULL)
```

---

## Contact Types (Gift Circles)

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTACT TYPES                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TYPE 1: REGISTERED USER (has app account)                  │
│  ─────────────────────────────────────────                  │
│  • member_id = points to users.id                           │
│  • guest_name = NULL                                        │
│  • guest_email = NULL                                       │
│  • status = 'accepted'                                      │
│  • CAN see their questionnaire/preferences                  │
│                                                             │
│  TYPE 2: PENDING GUEST (invited, waiting)                   │
│  ────────────────────────────────────────                   │
│  • member_id = NULL                                         │
│  • guest_name = "John Doe"                                  │
│  • guest_email = "john@email.com"                           │
│  • status = 'pending'                                       │
│  • Invitation sent, waiting for response                    │
│                                                             │
│  TYPE 3: MANUAL GUEST (added without invite)                │
│  ──────────────────────────────────────────                 │
│  • member_id = NULL                                         │
│  • guest_name = "Mom"                                       │
│  • guest_email = optional                                   │
│  • status = 'guest'                                         │
│  • Manually added, no invitation sent                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Invitation Flow

```
STEP 1: Send Invitation
═══════════════════════════════════════════════════════════════

  YOU (inviter)                    DATABASE
      │
      │  Create invitation
      ├─────────────────────────►  INVITATIONS
      │                            ├─ inviter_id: your_id
      │                            ├─ invitee_name: "Priya"
      │                            ├─ invitee_email: "p@g.com"
      │                            ├─ token: "abc123xyz"
      │                            └─ status: "pending"
      │
      │  Create contact
      └─────────────────────────►  GIFT_CIRCLES
                                   ├─ owner_id: your_id
                                   ├─ member_id: NULL
                                   ├─ guest_name: "Priya"
                                   ├─ guest_email: "p@g.com"
                                   └─ status: "pending"


STEP 2: Invitee Opens Link
═══════════════════════════════════════════════════════════════

  PRIYA                            DATABASE
      │
      │  Opens giftbox.com/invite/abc123xyz
      │
      └─────────────────────────►  INVITATIONS
                                   └─ status: "opened"
                                   └─ opened_at: NOW()


STEP 3: Invitee Submits Questionnaire
═══════════════════════════════════════════════════════════════

  PRIYA                            DATABASE
      │
      │  Submits form
      │
      ├─────────────────────────►  USERS (NEW)
      │                            ├─ id: new_user_id
      │                            ├─ name: "Priya"
      │                            └─ email: "p@g.com"
      │
      ├─────────────────────────►  QUESTIONNAIRES (NEW)
      │                            ├─ user_id: new_user_id
      │                            └─ (all preferences)
      │
      ├─────────────────────────►  INVITATIONS (UPDATE)
      │                            ├─ status: "completed"
      │                            └─ completed_at: NOW()
      │
      └─────────────────────────►  GIFT_CIRCLES (UPDATE)
                                   ├─ member_id: new_user_id ◄─ LINKED!
                                   ├─ status: "accepted"
                                   └─ guest_name: NULL (cleared)


RESULT: You can now see Priya's gift preferences!
```

---

## Status Values

| Table | Field | Values |
|-------|-------|--------|
| **gift_circles** | status | `pending`, `accepted`, `guest` |
| **invitations** | status | `pending`, `opened`, `completed`, `expired` |
| **users** | avatar_type | `turtle`, `pig`, `cow`, `flowers` |
| **gift_circles** | relationship | `Family`, `Friend`, `Colleague`, `Partner`, `Other` |
| **events** | event_type | `birthday`, `anniversary`, `holiday`, `wedding`, `baby_shower`, `graduation`, `other` |
| **registries** | registry_type | `wedding`, `baby`, `birthday`, `other` |

---

## Cascade Delete Rules

| When Deleted | These are also deleted |
|--------------|------------------------|
| **User** | questionnaires, user_anniversaries, wishlist_links, registries, gift_circles (as owner), invitations, events, notifications, user_push_tokens, friend_suggestions |
| **Gift Circle** | events.circle_id set to NULL |
| **Registry** | events.registry_id set to NULL |

---

*Document matches schema.sql as of May 2025*
