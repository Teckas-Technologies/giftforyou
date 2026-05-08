# GiftBox4you - Schema Diagram (Simple View)

## Main Entities Relationship

```
                                    ┌─────────────────┐
                                    │                 │
                                    │      USERS      │
                                    │                 │
                                    │  id vishal@gmail│
                                    │  name, birthday │
                                    │  profile_photo  │
                                    │                 │
                                    └────────┬────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
              ▼                              ▼                              ▼
    ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
    │                 │            │                 │            │                 │
    │ QUESTIONNAIRES  │            │  GIFT_CIRCLES   │            │  INVITATIONS    │
    │                 │            │   (Contacts)    │            │                 │
    │ - activities    │            │                 │            │ - invitee_name  │
    │ - style         │            │ - owner_id ─────┼────────────│ - inviter_id    │
    │ - colors        │            │ - member_id ◄───┼─ links to  │ - token         │
    │ - food          │            │   (if user)     │   user     │ - status        │
    │ - gifts         │            │ - guest_name    │            │ - message       │
    │ - wishlist      │            │ - guest_email   │            │                 │
    │                 │            │ - relationship  │            └─────────────────┘
    └─────────────────┘            │ - status        │
                                   │                 │
                                   └────────┬────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │                 │
                                   │     EVENTS      │
                                   │                 │
                                   │ - title         │
                                   │ - event_type    │
                                   │ - event_date    │
                                   │ - is_recurring  │
                                   │ - reminders     │
                                   │                 │
                                   └─────────────────┘
```

---

## Contact Connection Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   USER A (You - App User)                                                    │
│   ════════════════════════                                                   │
│                                                                              │
│   Your Account                                                               │
│   ┌──────────────────┐                                                       │
│   │ id: user_123     │                                                       │
│   │ name: "Vishal"   │                                                       │
│   │ email: v@g.com   │                                                       │
│   └──────────────────┘                                                       │
│            │                                                                 │
│            │ owns                                                            │
│            ▼                                                                 │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │                         YOUR CONTACTS                                │   │
│   │                      (gift_circles table)                            │   │
│   │                                                                      │   │
│   │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │   │
│   │  │ CONTACT 1       │  │ CONTACT 2       │  │ CONTACT 3       │      │   │
│   │  │ ─────────────── │  │ ─────────────── │  │ ─────────────── │      │   │
│   │  │ Raj (Friend)    │  │ Mom (Family)    │  │ Priya (Friend)  │      │   │
│   │  │                 │  │                 │  │                 │      │   │
│   │  │ member_id: ──────┼──┼─► Has Account  │  │ member_id: NULL │      │   │
│   │  │   user_456      │  │    user_789     │  │ guest_email:    │      │   │
│   │  │                 │  │                 │  │  priya@g.com    │      │   │
│   │  │ status:         │  │ status:         │  │                 │      │   │
│   │  │  'accepted'     │  │  'accepted'     │  │ status:         │      │   │
│   │  │                 │  │                 │  │  'pending'      │      │   │
│   │  │ ✅ Can see      │  │ ✅ Can see      │  │                 │      │   │
│   │  │ preferences     │  │ preferences     │  │ ⏳ Waiting for  │      │   │
│   │  │                 │  │                 │  │ invite accept   │      │   │
│   │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │   │
│   │                                                                      │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   USER B (Raj - Your Friend)                                                 │
│   ══════════════════════════                                                 │
│                                                                              │
│   His Account                                                                │
│   ┌──────────────────┐       His Questionnaire                               │
│   │ id: user_456     │       ┌──────────────────────────────┐                │
│   │ name: "Raj"      │──────►│ Likes: Tech, Gaming          │                │
│   │ email: r@g.com   │       │ Colors: Blue, Black          │                │
│   └──────────────────┘       │ Food: Pizza, Sushi           │                │
│            │                 │ Gifts: Gadgets, Experiences  │                │
│            │ owns            └──────────────────────────────┘                │
│            ▼                          ▲                                      │
│   ┌─────────────────┐                 │                                      │
│   │ HIS CONTACTS    │                 │ You can see this because             │
│   │ ─────────────── │                 │ Raj is in your contacts              │
│   │ - You (Vishal)  │                 │ with member_id = user_456            │
│   │ - Others...     │                 │                                      │
│   └─────────────────┘                 │                                      │
│                                       │                                      │
└───────────────────────────────────────┼──────────────────────────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │  CONNECTION VIA member_id     │
                        │  in YOUR gift_circles table   │
                        └───────────────────────────────┘
```

---

## Invitation Flow

```
STEP 1: You Send Invitation
══════════════════════════════════════════════════════════════════

    YOU                          INVITATION
    ───                          ──────────
┌──────────┐    Creates     ┌─────────────────┐
│ Vishal   │ ────────────► │ inviter: you    │
│          │               │ invitee: Priya  │
└──────────┘               │ token: abc123   │
                           │ status: pending │
      │                    └─────────────────┘
      │
      │ Also Creates
      ▼
┌─────────────────┐
│ GIFT_CIRCLE     │
│ ─────────────── │
│ owner: you      │
│ guest: Priya    │
│ status: pending │
│ member_id: NULL │  ◄── No account yet
└─────────────────┘


STEP 2: Priya Opens Link & Fills Form
══════════════════════════════════════════════════════════════════

                    INVITATION                     PRIYA
                    ──────────                     ─────
               ┌─────────────────┐           ┌──────────────┐
               │ status: opened  │ ◄──────── │ Opens link   │
               │ opened_at: now  │           │ giftbox.com/ │
               └─────────────────┘           │ invite/abc123│
                                             └──────────────┘
                                                    │
                                                    │ Fills
                                                    │ questionnaire
                                                    ▼
                                             ┌──────────────┐
                                             │ Name: Priya  │
                                             │ Email: p@g   │
                                             │ Likes: Books │
                                             │ Colors: Pink │
                                             └──────────────┘


STEP 3: Priya Submits - Account Created & Linked
══════════════════════════════════════════════════════════════════

    NEW USER CREATED              INVITATION UPDATED
    ────────────────              ──────────────────
┌─────────────────────┐      ┌─────────────────────┐
│ id: user_999        │      │ status: completed   │
│ name: Priya         │      │ completed_at: now   │
│ email: p@gmail.com  │      └─────────────────────┘
└─────────────────────┘
         │
         │                   YOUR GIFT_CIRCLE UPDATED
         │                   ────────────────────────
         │              ┌─────────────────────────────┐
         └─────────────►│ owner: you                  │
           Linked!      │ member_id: user_999 ◄─ NEW! │
                        │ status: accepted    ◄─ NEW! │
                        │ guest_name: removed         │
                        └─────────────────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────────┐
                        │  ✅ YOU CAN NOW SEE         │
                        │  PRIYA'S PREFERENCES!       │
                        └─────────────────────────────┘
```

---

## Quick Reference

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | App accounts | id, email, name, birthday |
| **questionnaires** | Gift preferences | user_id, activities, colors, gifts |
| **gift_circles** | Your contacts | owner_id, member_id, guest_name, status |
| **invitations** | Invite links | inviter_id, token, status, expires_at |
| **events** | Birthdays, etc | user_id, circle_id, event_date, type |

---

## Status Values

### Gift Circle Status
- `pending` - Invited, waiting for response
- `accepted` - Registered user, linked
- `guest` - Manual entry, no invitation sent

### Invitation Status
- `pending` - Not opened yet
- `opened` - Link clicked
- `completed` - Questionnaire submitted
- `expired` - Past 30 days

---

*This diagram shows how users, contacts, and invitations connect in GiftBox4you*
