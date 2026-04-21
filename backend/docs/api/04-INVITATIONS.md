# Invitations API

## Overview

The Invitation system allows users to invite friends and family to join their Gift Circle. Invitees can fill out a questionnaire via web (without downloading the app) or by installing the app.

---

## How Invitations Work

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INVITATION FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   STEP 1: Sarah sends invitation                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Sarah (App) ──► POST /api/invitations                              │   │
│   │                  { name: "Mom", email: "mom@email.com" }            │   │
│   │                                                                      │   │
│   │  Server generates unique token: "abc123xyz"                         │   │
│   │  Server sends email to mom@email.com                                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│   STEP 2: Mom receives email                                                │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  📧 "Sarah invited you to her Gift Circle!"                         │   │
│   │                                                                      │   │
│   │  [Click here to fill out questionnaire]                             │   │
│   │   ↓                                                                  │   │
│   │  https://giftbox4you.com/invite/abc123xyz                           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│   STEP 3: Mom opens web questionnaire                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  GET /api/invitations/web/abc123xyz                                 │   │
│   │  → Validates token, marks as "opened"                               │   │
│   │  → Returns inviter info ("Sarah invited you")                       │   │
│   │                                                                      │   │
│   │  Web Form:                                                           │   │
│   │  ┌───────────────────────────────────────────────┐                  │   │
│   │  │ Name: [Mary Johnson        ]                  │                  │   │
│   │  │ Email: [mom@email.com      ]                  │                  │   │
│   │  │                                               │                  │   │
│   │  │ Favorite Colors: [x] Blue [x] Purple [ ] Red  │                  │   │
│   │  │ Gift Types: [x] Books [x] Home [ ] Tech       │                  │   │
│   │  │ ...                                           │                  │   │
│   │  │                                               │                  │   │
│   │  │        [Submit Questionnaire]                 │                  │   │
│   │  └───────────────────────────────────────────────┘                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│   STEP 4: Mom submits questionnaire                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  POST /api/invitations/web/abc123xyz/respond                        │   │
│   │  { name, email, questionnaire: {...} }                              │   │
│   │                                                                      │   │
│   │  Server:                                                             │   │
│   │  1. Creates user account for Mom (or links to existing)            │   │
│   │  2. Saves questionnaire responses                                   │   │
│   │  3. Adds Mom to Sarah's circle                                      │   │
│   │  4. Adds Sarah to Mom's circle (mutual!)                           │   │
│   │  5. Marks invitation as "completed"                                 │   │
│   │  6. Sends notification to Sarah                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│   STEP 5: Sarah gets notified                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  🔔 "Mom accepted your invitation!"                                 │   │
│   │  Sarah can now view Mom's gift preferences                          │   │
│   │  Mom can now view Sarah's gift preferences                          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/invitations` | Yes | Get my sent invitations |
| POST | `/api/invitations` | Yes | Send new invitation |
| PUT | `/api/invitations/:id/resend` | Yes | Resend invitation |
| DELETE | `/api/invitations/:id` | Yes | Cancel invitation |
| GET | `/api/invitations/web/:token` | No | Validate invite (web) |
| POST | `/api/invitations/web/:token/respond` | No | Submit questionnaire (web) |

---

## 1. Get My Invitations

List all invitations I've sent.

### Request

```http
GET /api/invitations
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter: pending, opened, completed, expired |

### Response (200 OK)

```json
{
  "invitations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "token": "abc123xyz",
      "invitee_name": "Mom",
      "invitee_email": "mom@email.com",
      "personal_message": "Hey Mom! Fill this out so I can get you better gifts!",
      "relationship": "Family",
      "status": "completed",
      "sent_count": 1,
      "sent_at": "2024-01-10T10:00:00.000Z",
      "opened_at": "2024-01-10T14:30:00.000Z",
      "completed_at": "2024-01-10T15:00:00.000Z",
      "expires_at": "2024-02-09T10:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440031",
      "token": "def456abc",
      "invitee_name": "John",
      "invitee_email": "john@email.com",
      "personal_message": null,
      "relationship": "Friend",
      "status": "pending",
      "sent_count": 2,
      "sent_at": "2024-01-12T09:00:00.000Z",
      "opened_at": null,
      "completed_at": null,
      "expires_at": "2024-02-11T09:00:00.000Z",
      "last_resent_at": "2024-01-15T09:00:00.000Z"
    }
  ],
  "stats": {
    "total": 5,
    "pending": 2,
    "opened": 1,
    "completed": 2,
    "expired": 0
  }
}
```

### Invitation Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Email sent, not opened yet |
| `opened` | Link clicked, form viewed |
| `completed` | Questionnaire submitted |
| `expired` | 30 days passed, token invalid |

---

## 2. Send Invitation

Send invitation email to someone.

### Request

```http
POST /api/invitations
Authorization: Bearer <token>
Content-Type: application/json

{
  "inviteeName": "Mom",
  "inviteeEmail": "mom@email.com",
  "personalMessage": "Hey Mom! Fill this out so I can get you better gifts for your birthday!",
  "relationship": "Family"
}
```

### Response (201 Created)

```json
{
  "message": "Invitation sent",
  "invitation": {
    "id": "550e8400-e29b-41d4-a716-446655440032",
    "token": "xyz789abc",
    "invitee_name": "Mom",
    "invitee_email": "mom@email.com",
    "status": "pending",
    "expires_at": "2024-02-15T10:00:00.000Z",
    "inviteLink": "https://giftbox4you.com/invite/xyz789abc"
  }
}
```

### Error Responses

```json
// 400 - Already invited
{
  "error": "Already invited",
  "message": "An invitation has already been sent to this email"
}

// 400 - Already in circle
{
  "error": "Already in circle",
  "message": "This person is already in your gift circle"
}
```

### Email Sent

The server sends an email like this:

```
Subject: 🎁 Sarah invited you to her Gift Circle!

Hi Mom,

Sarah wants to give you perfect gifts! To make that happen,
they need to know your preferences.

"Hey Mom! Fill this out so I can get you better gifts for
your birthday!"
— Sarah

Just answer a few quick questions so Sarah knows what makes
you smile.

[Fill Out Questionnaire]

What's in it for you?
• Once you accept, you'll also see Sarah's preferences
• You can invite your own friends
• Update your preferences anytime

This invitation expires in 30 days.
```

---

## 3. Resend Invitation

Resend invitation email (if they didn't receive or lost it).

### Request

```http
PUT /api/invitations/:id/resend
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Invitation resent",
  "sentCount": 3
}
```

### How It Works

```
1. Find invitation by ID
2. Verify you own this invitation
3. Increment sent_count
4. Update last_resent_at
5. Reset expiry to 30 days from now
6. If was expired, change status back to pending
7. Resend email
```

---

## 4. Delete Invitation

Cancel/delete an invitation.

### Request

```http
DELETE /api/invitations/:id
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Invitation deleted"
}
```

---

## Web Questionnaire (Public Endpoints)

These endpoints are used by the web form that invitees see.

### 5. Validate Invitation Token

Called when invitee opens the link.

### Request

```http
GET /api/invitations/web/abc123xyz
```

### Response (200 OK) - Valid Token

```json
{
  "valid": true,
  "invitation": {
    "inviter_name": "Sarah Johnson",
    "invitee_name": "Mom",
    "invitee_email": "mom@email.com",
    "expires_at": "2024-02-15T10:00:00.000Z"
  }
}
```

### Response (400 Bad Request) - Invalid/Expired

```json
{
  "error": "Invitation has expired"
}
```

```json
{
  "error": "Invitation not found"
}
```

```json
{
  "error": "Invitation already completed"
}
```

### How It Works

```
1. Find invitation by token
2. Check if exists
3. Check if already completed
4. Check if expired
5. Mark status as "opened" (first view)
6. Return inviter info for display
```

---

### 6. Submit Web Questionnaire

Submit the questionnaire from the web form.

### Request

```http
POST /api/invitations/web/abc123xyz/respond
Content-Type: application/json

{
  "name": "Mary Johnson",
  "email": "mom@email.com",
  "questionnaire": {
    "favoriteActivities": ["Gardening", "Reading"],
    "personalStyle": "Classic",
    "favoriteColors": ["Blue", "Purple"],
    "likesSurprises": "Yes, love them",
    "favoriteFlower": "Rose",
    "favoriteCuisines": ["Italian", "French"],
    "giftTypes": ["Books & Learning", "Home & Living"],
    "musicGenre": "Classical"
  }
}
```

### Response (200 OK)

```json
{
  "message": "Thank you! Your preferences have been saved.",
  "isNewUser": true,
  "canDownloadApp": true
}
```

### How It Works (Detailed)

```
1. Validate token (same as GET)

2. Check if user exists with this email
   ├─ If exists: use that user account
   └─ If not: create new user with auth_provider = "guest"

3. Save questionnaire responses

4. Add invitee to inviter's circle:
   INSERT INTO gift_circles (
     owner_id = inviter_id,
     member_id = new_user_id,
     relationship = invitation.relationship,
     status = 'accepted',
     auto_added = true
   )

5. Add inviter to invitee's circle (mutual connection):
   INSERT INTO gift_circles (
     owner_id = new_user_id,
     member_id = inviter_id,
     relationship = 'Friend',
     status = 'accepted',
     auto_added = true
   )

6. Mark invitation as completed

7. Create notification for inviter:
   "Mom accepted your invitation!"

8. Return success with isNewUser flag
```

---

## Token Security

- Tokens are 20-character random alphanumeric strings
- Generated using UUID v4 (stripped of dashes)
- Each token is unique in database
- Tokens expire after 30 days
- Tokens are single-use (can't resubmit after completed)

---

## Mobile App Usage

```javascript
// screens/InviteScreen.js

const InviteScreen = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const response = await api.get('/invitations');
      setInvitations(response.data.invitations);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (data) => {
    try {
      const response = await api.post('/invitations', {
        inviteeName: data.name,
        inviteeEmail: data.email,
        personalMessage: data.message,
        relationship: data.relationship
      });

      Alert.alert('Success', 'Invitation sent!');
      loadInvitations(); // Refresh list

    } catch (error) {
      if (error.response?.data?.error === 'Already invited') {
        Alert.alert('Already Invited', 'You already sent an invitation to this email');
      } else {
        Alert.alert('Error', 'Failed to send invitation');
      }
    }
  };

  const resendInvitation = async (id) => {
    try {
      await api.put(`/invitations/${id}/resend`);
      Alert.alert('Success', 'Invitation resent!');
      loadInvitations();
    } catch (error) {
      Alert.alert('Error', 'Failed to resend');
    }
  };

  return (
    <View>
      {/* Invitation form */}
      <InviteForm onSubmit={sendInvitation} />

      {/* Pending invitations */}
      <Text>Pending Invitations</Text>
      {invitations.map(inv => (
        <InvitationCard
          key={inv.id}
          invitation={inv}
          onResend={() => resendInvitation(inv.id)}
        />
      ))}
    </View>
  );
};
```

---

## Web Questionnaire Page

The web questionnaire is a simple responsive page:

```
URL: https://giftbox4you.com/invite/:token

┌─────────────────────────────────────────────────────────┐
│                    🎁 GiftBox4you                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Hi Mom!                                                │
│                                                          │
│   Sarah invited you to join her Gift Circle.            │
│   Fill out this quick questionnaire so Sarah can        │
│   find perfect gifts for you!                           │
│                                                          │
│   ┌───────────────────────────────────────────────────┐ │
│   │ Your Name: [Mary Johnson           ]             │ │
│   │ Your Email: [mom@email.com         ]             │ │
│   └───────────────────────────────────────────────────┘ │
│                                                          │
│   What are your favorite activities?                     │
│   [ ] Hiking  [x] Gardening  [x] Reading  [ ] Sports    │
│                                                          │
│   Favorite Colors?                                       │
│   [x] Blue  [x] Purple  [ ] Red  [ ] Green              │
│                                                          │
│   ... more questions ...                                │
│                                                          │
│            [Submit Questionnaire]                       │
│                                                          │
│   ─────────────────────────────────────────────────     │
│   Want the full experience?                             │
│   [Download the App] [App Store] [Google Play]          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```
