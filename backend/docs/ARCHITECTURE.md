# GiftBox4you - Application Architecture

## Overview

GiftBox4you is a personalized gifting application that helps users give thoughtful gifts by collecting preferences through questionnaires, managing gift circles, and tracking important dates.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│   │   iOS App       │    │   Android App   │    │   Web App       │        │
│   │  (React Native) │    │  (React Native) │    │  (Questionnaire)│        │
│   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘        │
│            │                      │                      │                  │
│            └──────────────────────┼──────────────────────┘                  │
│                                   │                                          │
│                                   ▼                                          │
│                          HTTPS / REST API                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      Express.js Server                               │   │
│   │                                                                      │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│   │  │  Auth    │  │  Users   │  │ Question │  │ Circles  │            │   │
│   │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │            │   │
│   │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │   │
│   │       │             │             │             │                   │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│   │  │ Events   │  │ Invites  │  │ Notifs   │  │ Discover │            │   │
│   │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │            │   │
│   │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │   │
│   │       │             │             │             │                   │   │
│   │       └─────────────┴─────────────┴─────────────┘                   │   │
│   │                            │                                         │   │
│   │                     ┌──────┴──────┐                                 │   │
│   │                     │ Middleware  │                                 │   │
│   │                     │ • Auth (JWT)│                                 │   │
│   │                     │ • Validation│                                 │   │
│   │                     │ • Rate Limit│                                 │   │
│   │                     └──────┬──────┘                                 │   │
│   │                            │                                         │   │
│   │                     ┌──────┴──────┐                                 │   │
│   │                     │ Controllers │                                 │   │
│   │                     └──────┬──────┘                                 │   │
│   │                            │                                         │   │
│   │                     ┌──────┴──────┐                                 │   │
│   │                     │   Models    │                                 │   │
│   │                     └─────────────┘                                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│   │   PostgreSQL    │    │  File Storage   │    │    Firebase     │        │
│   │   Database      │    │  (S3/Local)     │    │    FCM          │        │
│   │                 │    │                 │    │                 │        │
│   │  • Users        │    │  • Photos       │    │  • Push Notifs  │        │
│   │  • Questionnaire│    │  • Wishlist     │    │                 │        │
│   │  • Circles      │    │    Images       │    │                 │        │
│   │  • Events       │    │                 │    │                 │        │
│   │  • Invitations  │    │                 │    │                 │        │
│   │  • Notifications│    │                 │    │                 │        │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│   │   SMTP Server   │    │  Google Auth    │    │   Apple Auth    │        │
│   │   (Email)       │    │  (OAuth 2.0)    │    │  (Sign in)      │        │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

### 1. User Registration Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Mobile  │     │   API    │     │  Model   │     │ Database │
│   App    │     │  Server  │     │  Layer   │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  POST /register│                │                │
     │  {email, pass} │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ User.findByEmail()              │
     │                │───────────────>│                │
     │                │                │  SELECT        │
     │                │                │───────────────>│
     │                │                │   null         │
     │                │                │<───────────────│
     │                │  null          │                │
     │                │<───────────────│                │
     │                │                │                │
     │                │ User.create()  │                │
     │                │───────────────>│                │
     │                │                │  INSERT        │
     │                │                │───────────────>│
     │                │                │   user row     │
     │                │                │<───────────────│
     │                │  user object   │                │
     │                │<───────────────│                │
     │                │                │                │
     │                │ generateTokens()               │
     │                │──────┐         │                │
     │                │      │ JWT     │                │
     │                │<─────┘         │                │
     │                │                │                │
     │  {user, token} │                │                │
     │<───────────────│                │                │
     │                │                │                │
```

### 2. Invitation & Web Questionnaire Flow

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ User A  │   │   API   │   │  Email  │   │ User B  │   │   Web   │
│ (Inviter)│   │ Server  │   │ Service │   │(Invitee)│   │  Form   │
└────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
     │             │             │             │             │
     │ POST /invitations         │             │             │
     │ {name, email}             │             │             │
     │────────────>│             │             │             │
     │             │             │             │             │
     │             │ Create invitation         │             │
     │             │ Generate token            │             │
     │             │─────────────┐             │             │
     │             │             │             │             │
     │             │ Send email  │             │             │
     │             │────────────>│             │             │
     │             │             │             │             │
     │             │             │ Email with  │             │
     │             │             │ invite link │             │
     │             │             │────────────>│             │
     │             │             │             │             │
     │ {invitation}│             │             │ Click link  │
     │<────────────│             │             │────────────>│
     │             │             │             │             │
     │             │ GET /invitations/web/:token             │
     │             │<────────────────────────────────────────│
     │             │             │             │             │
     │             │ Validate, return inviter info           │
     │             │────────────────────────────────────────>│
     │             │             │             │             │
     │             │             │             │  Fill form  │
     │             │             │             │             │
     │             │ POST /invitations/web/:token/respond    │
     │             │ {name, email, questionnaire}            │
     │             │<────────────────────────────────────────│
     │             │             │             │             │
     │             │ Create user │             │             │
     │             │ Save questionnaire        │             │
     │             │ Add to User A's circle    │             │
     │             │ Add User A to User B's circle           │
     │             │ Notify User A             │             │
     │             │─────────────┐             │             │
     │             │             │             │             │
     │ Notification│             │             │             │
     │ "B accepted"│             │             │             │
     │<────────────│             │             │             │
     │             │             │             │ Success     │
     │             │────────────────────────────────────────>│
     │             │             │             │             │
```

### 3. Gift Circle Preferences Flow

```
┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐
│ User A  │        │   API   │        │ Models  │        │ Database│
│(Viewer) │        │ Server  │        │         │        │         │
└────┬────┘        └────┬────┘        └────┬────┘        └────┬────┘
     │                  │                  │                  │
     │ GET /circles/:id/preferences        │                  │
     │─────────────────>│                  │                  │
     │                  │                  │                  │
     │                  │ Verify ownership │                  │
     │                  │ GiftCircle.findById()               │
     │                  │─────────────────>│                  │
     │                  │                  │  SELECT          │
     │                  │                  │─────────────────>│
     │                  │                  │  circle data     │
     │                  │                  │<─────────────────│
     │                  │                  │                  │
     │                  │ Get member's questionnaire          │
     │                  │ Questionnaire.getFormattedPreferences()
     │                  │─────────────────>│                  │
     │                  │                  │  SELECT          │
     │                  │                  │─────────────────>│
     │                  │                  │  preferences     │
     │                  │                  │<─────────────────│
     │                  │                  │                  │
     │                  │ Get wishlist links                  │
     │                  │─────────────────>│                  │
     │                  │                  │  SELECT          │
     │                  │                  │─────────────────>│
     │                  │                  │  links           │
     │                  │                  │<─────────────────│
     │                  │                  │                  │
     │ {contact, preferences, links}       │                  │
     │<─────────────────│                  │                  │
     │                  │                  │                  │
     │  Display preferences in app         │                  │
     │  • Personal style                   │                  │
     │  • Favorite colors                  │                  │
     │  • Gift types                       │                  │
     │  • Food preferences                 │                  │
     │  • Wishlist links                   │                  │
     │                  │                  │                  │
```

---

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐         ┌──────────────────────┐                          │
│   │   USERS     │────────>│ QUESTIONNAIRE_RESP   │                          │
│   │             │   1:1   │                      │                          │
│   │ • id (PK)   │         │ • user_id (FK)       │                          │
│   │ • email     │         │ • favorite_activities│                          │
│   │ • password  │         │ • personal_style     │                          │
│   │ • name      │         │ • favorite_colors    │                          │
│   │ • birthday  │         │ • gift_types         │                          │
│   │ • photo     │         │ • cuisines, etc...   │                          │
│   └──────┬──────┘         └──────────────────────┘                          │
│          │                                                                   │
│          │ 1:N                                                               │
│          ▼                                                                   │
│   ┌─────────────┐         ┌──────────────────────┐                          │
│   │ANNIVERSARIES│         │   WISHLIST_LINKS     │                          │
│   │             │         │                      │                          │
│   │ • user_id   │         │ • user_id (FK)       │                          │
│   │ • date      │         │ • url                │                          │
│   │ • label     │         │ • title              │                          │
│   └─────────────┘         └──────────────────────┘                          │
│          │                                                                   │
│          │                                                                   │
│   ┌──────┴──────┐                                                           │
│   │             │                                                           │
│   ▼             ▼                                                           │
│   ┌─────────────────────┐       ┌─────────────────────┐                     │
│   │    GIFT_CIRCLES     │       │    INVITATIONS      │                     │
│   │                     │       │                     │                     │
│   │ • owner_id (FK)     │       │ • inviter_id (FK)   │                     │
│   │ • member_id (FK)    │       │ • token (unique)    │                     │
│   │ • guest_name        │       │ • invitee_email     │                     │
│   │ • guest_email       │       │ • status            │                     │
│   │ • relationship      │       │ • expires_at        │                     │
│   │ • status            │       └──────────┬──────────┘                     │
│   └──────────┬──────────┘                  │                                │
│              │                             │                                │
│              │ 1:N                         │                                │
│              ▼                             │                                │
│   ┌─────────────────────┐                  │                                │
│   │      EVENTS         │                  │                                │
│   │                     │                  │                                │
│   │ • user_id (FK)      │                  │                                │
│   │ • circle_id (FK)    │                  │                                │
│   │ • event_type        │                  │                                │
│   │ • event_date        │                  │                                │
│   │ • reminder_days     │                  │                                │
│   └─────────────────────┘                  │                                │
│                                            │                                │
│   ┌─────────────────────┐       ┌──────────┴──────────┐                     │
│   │   NOTIFICATIONS     │       │  FRIEND_SUGGESTIONS │                     │
│   │                     │       │                     │                     │
│   │ • user_id (FK)      │       │ • user_id (FK)      │                     │
│   │ • type              │       │ • suggested_id (FK) │                     │
│   │ • title             │       │ • mutual_friend_id  │                     │
│   │ • is_read           │       │ • is_dismissed      │                     │
│   └─────────────────────┘       └─────────────────────┘                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. TRANSPORT SECURITY                                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  • HTTPS/TLS encryption for all API calls                             │  │
│  │  • Certificate pinning in mobile apps (optional)                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  2. AUTHENTICATION                                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  • JWT tokens for session management                                  │  │
│  │  • Access token (7 days) + Refresh token (30 days)                   │  │
│  │  • Password hashing with bcrypt (10 rounds)                          │  │
│  │  • OAuth 2.0 for Google/Apple Sign-In                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  3. AUTHORIZATION                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  • Resource ownership verification                                    │  │
│  │  • Circle membership validation for preferences access               │  │
│  │  • Token-based invitation validation                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  4. INPUT VALIDATION                                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  • express-validator for all inputs                                  │  │
│  │  • Email format validation                                           │  │
│  │  • UUID format validation for IDs                                    │  │
│  │  • Enum validation for fixed options                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  5. RATE LIMITING                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  • 100 requests per 15 minutes per IP                                │  │
│  │  • Protects against brute force and DDoS                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  6. DATA PROTECTION                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  • Birth year can be hidden from contacts                            │  │
│  │  • Preferences only visible to circle members                        │  │
│  │  • Invitation tokens are single-use and time-limited                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Mobile App Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REACT NATIVE APP STRUCTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   src/                                                                       │
│   ├── screens/              # UI Screens                                    │
│   │   ├── SplashScreen      → Check auth, navigate                         │
│   │   ├── OnboardingScreen  → CEO letter, app intro                        │
│   │   ├── LoginScreen       → Email/Google/Apple login                     │
│   │   ├── HomeScreen        → Dashboard, upcoming events                   │
│   │   ├── CalendarScreen    → Event calendar view                          │
│   │   ├── CirclesScreen     → Contact management                           │
│   │   ├── ContactDetailScreen → View preferences                           │
│   │   ├── InviteScreen      → Send invitations                             │
│   │   ├── ProfileScreen     → My questionnaire                             │
│   │   ├── QuestionnaireScreen → Edit preferences                           │
│   │   └── NotificationsScreen → Alerts & reminders                         │
│   │                                                                          │
│   ├── navigation/           # React Navigation                              │
│   │   ├── AppNavigator      → Main navigation container                    │
│   │   ├── AuthStack         → Login/Register flow                          │
│   │   ├── MainTabs          → Bottom tab navigation                        │
│   │   └── StackNavigators   → Screen stacks per tab                        │
│   │                                                                          │
│   ├── services/             # API & External Services                       │
│   │   ├── api.js            → Axios instance, interceptors                 │
│   │   ├── authService.js    → Login, register, tokens                      │
│   │   ├── circleService.js  → Circle CRUD operations                       │
│   │   ├── eventService.js   → Event management                             │
│   │   └── notificationService.js → Push notifications                      │
│   │                                                                          │
│   ├── store/                # State Management                              │
│   │   ├── AuthContext.js    → User authentication state                    │
│   │   └── AppContext.js     → Global app state                             │
│   │                                                                          │
│   ├── components/           # Reusable Components                           │
│   │   ├── EventCard         → Event display card                           │
│   │   ├── ContactCard       → Contact list item                            │
│   │   ├── PreferenceSection → Questionnaire section                        │
│   │   └── ...               → Other UI components                          │
│   │                                                                          │
│   └── theme/                # Styling                                       │
│       └── colors.js         → Color palette (Pink theme)                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Feature Modules

### Module 1: Authentication
- User registration with email/password
- Social login (Google, Apple)
- JWT-based session management
- Password reset flow

### Module 2: Questionnaire System
- 35 questions across 9 categories
- Progress tracking (completion percentage)
- Conditional fields (e.g., "Other" options)
- Wishlist links and registry support

### Module 3: Gift Circles
- Add contacts (registered users or guests)
- Relationship categorization
- View contact preferences
- Automatic birthday event creation

### Module 4: Invitation System
- Generate unique invite links
- Email delivery with templates
- Web questionnaire for non-app users
- Status tracking (pending/opened/completed)
- Auto-add to each other's circles

### Module 5: Events & Calendar
- Birthday auto-detection from circles
- Custom event creation
- Recurring event support
- Reminder notifications (7 days, 1 day before)

### Module 6: Notifications
- Event reminders
- Invitation acceptance alerts
- Profile completion nudges
- Push notification support (FCM)

### Module 7: Discovery
- People You May Know suggestions
- Mutual friend connections
- Quick add to circle

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION DEPLOYMENT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐                                                       │
│   │   App Stores    │                                                       │
│   │  ┌───┐  ┌───┐  │                                                       │
│   │  │iOS│  │And│  │                                                       │
│   │  └─┬─┘  └─┬─┘  │                                                       │
│   └────┼──────┼────┘                                                       │
│        │      │                                                              │
│        └──┬───┘                                                              │
│           │                                                                  │
│           ▼                                                                  │
│   ┌─────────────────┐         ┌─────────────────┐                           │
│   │   CloudFlare    │         │    Firebase     │                           │
│   │   CDN / WAF     │         │   Hosting       │                           │
│   │                 │         │ (Web Questionnaire)                         │
│   └────────┬────────┘         └────────┬────────┘                           │
│            │                           │                                     │
│            └───────────┬───────────────┘                                     │
│                        │                                                     │
│                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Railway / Render / AWS                            │   │
│   │                                                                      │   │
│   │  ┌───────────────────┐    ┌───────────────────┐                     │   │
│   │  │   API Server      │    │   API Server      │  (Auto-scaling)     │   │
│   │  │   (Node.js)       │    │   (Node.js)       │                     │   │
│   │  └─────────┬─────────┘    └─────────┬─────────┘                     │   │
│   │            │                        │                                │   │
│   │            └────────────┬───────────┘                                │   │
│   │                         │                                            │   │
│   │                         ▼                                            │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │                    PostgreSQL                                  │  │   │
│   │  │                 (Managed Database)                             │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                        │                                                     │
│                        │                                                     │
│   ┌────────────────────┼────────────────────────────────────────────────┐   │
│   │                    ▼                                                │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │  │ AWS S3      │  │ SendGrid/   │  │  Firebase   │                 │   │
│   │  │ (Files)     │  │ Gmail SMTP  │  │  FCM        │                 │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   │                    External Services                                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
