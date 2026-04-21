# Discover & Suggestions API

## Overview

The Discover API provides "People You May Know" suggestions based on mutual connections. This helps users grow their Gift Circle by connecting with friends of friends.

---

## How Suggestions Work

```
┌─────────────────────────────────────────────────────────────────┐
│                  PEOPLE YOU MAY KNOW ALGORITHM                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Sarah's Circle:                                                │
│   ┌─────────────┐                                                │
│   │    Sarah    │                                                │
│   └──────┬──────┘                                                │
│          │                                                       │
│    ┌─────┴─────┐                                                │
│    │           │                                                │
│   Mom         Dad                                                │
│    │           │                                                │
│    │     ┌─────┴─────┐                                          │
│    │     │           │                                          │
│    └────►Aunt Jane   Uncle Bob  ◄── These are suggestions!     │
│          (Mom's      (Dad's                                      │
│           contact)    contact)                                   │
│                                                                  │
│   Logic:                                                         │
│   1. Get all contacts in Sarah's circle                         │
│   2. For each contact, get THEIR contacts                       │
│   3. Filter out people already in Sarah's circle                │
│   4. Filter out Sarah herself                                    │
│   5. Rank by number of mutual connections                       │
│   6. Return top suggestions                                      │
│                                                                  │
│   Result: "You may know Aunt Jane (1 mutual: Mom)"              │
│           "You may know Uncle Bob (1 mutual: Dad)"              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/discover/people-you-may-know` | Yes | Get suggestions |
| POST | `/api/discover/dismiss/:userId` | Yes | Dismiss suggestion |
| GET | `/api/discover/search` | Yes | Search users |

---

## 1. Get People You May Know

Get suggested people based on mutual connections.

### Request

```http
GET /api/discover/people-you-may-know
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | Maximum suggestions |

### Response (200 OK)

```json
{
  "suggestions": [
    {
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440070",
        "name": "Jane Wilson",
        "email": "jane@example.com",
        "photo": "/uploads/jane.jpg",
        "avatar": null,
        "questionnaire_completed": true
      },
      "mutualConnections": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Mary Johnson",
          "relationship": "Family"
        }
      ],
      "mutualCount": 1,
      "suggestedRelationship": "Family"
    },
    {
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440071",
        "name": "Bob Smith",
        "email": "bob@example.com",
        "photo": null,
        "avatar": "turtle",
        "questionnaire_completed": true
      },
      "mutualConnections": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "Robert Johnson",
          "relationship": "Family"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "name": "Jessica Miller",
          "relationship": "Friend"
        }
      ],
      "mutualCount": 2,
      "suggestedRelationship": "Friend"
    }
  ],
  "total": 2
}
```

### Algorithm Details

```sql
-- SQL representation of the algorithm

WITH my_contacts AS (
  -- Get all user IDs in my circle
  SELECT member_id
  FROM gift_circles
  WHERE owner_id = :myUserId
),
contacts_of_contacts AS (
  -- Get contacts of my contacts
  SELECT
    gc.member_id as suggested_user_id,
    gc.owner_id as mutual_connection_id,
    gc.relationship
  FROM gift_circles gc
  WHERE gc.owner_id IN (SELECT member_id FROM my_contacts)
    AND gc.member_id != :myUserId
    AND gc.member_id NOT IN (SELECT member_id FROM my_contacts)
    AND gc.member_id NOT IN (
      SELECT user_id FROM friend_suggestions
      WHERE suggested_to = :myUserId AND dismissed = true
    )
)
SELECT
  suggested_user_id,
  COUNT(*) as mutual_count,
  array_agg(mutual_connection_id) as mutual_ids
FROM contacts_of_contacts
GROUP BY suggested_user_id
ORDER BY mutual_count DESC
LIMIT :limit;
```

### Suggested Relationship Logic

The `suggestedRelationship` is determined by:
1. If all mutual connections have same relationship → use that
2. If mixed → use "Friend" as default

---

## 2. Dismiss Suggestion

Hide a suggestion (user not interested).

### Request

```http
POST /api/discover/dismiss/550e8400-e29b-41d4-a716-446655440070
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Suggestion dismissed"
}
```

### How It Works

```
1. Create record in friend_suggestions table:
   - suggested_to = current user
   - user_id = dismissed user
   - dismissed = true
   - dismissed_at = now()

2. This user won't appear in future suggestions

3. Can be reset by deleting the record (admin only)
```

---

## 3. Search Users

Search for users to add to circle.

### Request

```http
GET /api/discover/search?q=john
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (min 2 chars) |
| limit | number | No | Max results (default 20) |

### Response (200 OK)

```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440072",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "photo": "/uploads/john.jpg",
      "avatar": null,
      "is_in_circle": false,
      "has_pending_invitation": false
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440073",
      "name": "Johnny Smith",
      "email": "johnny@example.com",
      "photo": null,
      "avatar": "pig",
      "is_in_circle": true,
      "has_pending_invitation": false
    }
  ],
  "total": 2
}
```

### Search Logic

```
1. Search by name (case-insensitive, partial match)
2. Search by email (exact match for privacy)
3. Exclude current user from results
4. Mark if already in circle
5. Mark if has pending invitation
```

### Privacy Note

- Only basic profile info is returned
- Email is partially hidden: j***@example.com
- Full email only shown if already in circle

---

## Friend Suggestions Table

```sql
CREATE TABLE friend_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggested_to UUID REFERENCES users(id),      -- Who sees suggestion
  user_id UUID REFERENCES users(id),           -- Suggested user
  source VARCHAR(50),                          -- How suggested
  mutual_count INTEGER DEFAULT 0,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMP,
  added_at TIMESTAMP,                          -- If they added them
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Source Types

| Source | Description |
|--------|-------------|
| `mutual_connections` | Friends of friends |
| `same_circle` | In same person's circle |
| `imported_contacts` | From phone contacts (future) |

---

## People You May Know Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    PEOPLE YOU MAY KNOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Photo]  Jane Wilson                          [+ Add]  │   │
│  │           1 mutual connection: Mom              [✕]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Photo]  Bob Smith                            [+ Add]  │   │
│  │           2 mutual connections: Dad, Jessica    [✕]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Photo]  Mike Johnson                         [+ Add]  │   │
│  │           1 mutual connection: Dad              [✕]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                      [See All Suggestions]                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

[+ Add] → POST /api/circles/quick-add/:userId
[✕]     → POST /api/discover/dismiss/:userId
```

---

## Mobile App Usage

```javascript
// components/PeopleYouMayKnow.js

const PeopleYouMayKnow = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await api.get('/discover/people-you-may-know?limit=5');
      setSuggestions(response.data.suggestions);
    } finally {
      setLoading(false);
    }
  };

  const quickAdd = async (userId, relationship) => {
    try {
      await api.post(`/circles/quick-add/${userId}`, { relationship });

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => s.user.id !== userId));

      Alert.alert('Success', 'Added to your circle!');
    } catch (error) {
      if (error.response?.data?.error === 'Contact already in your circle') {
        // Already added - just remove from list
        setSuggestions(prev => prev.filter(s => s.user.id !== userId));
      } else {
        Alert.alert('Error', 'Failed to add contact');
      }
    }
  };

  const dismiss = async (userId) => {
    try {
      await api.post(`/discover/dismiss/${userId}`);
      setSuggestions(prev => prev.filter(s => s.user.id !== userId));
    } catch (error) {
      console.error('Failed to dismiss:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <Title>People You May Know</Title>
      </CardHeader>

      {suggestions.map(suggestion => (
        <SuggestionRow key={suggestion.user.id}>
          <Avatar
            source={suggestion.user.photo || suggestion.user.avatar}
            size={50}
          />

          <Info>
            <Name>{suggestion.user.name}</Name>
            <Mutuals>
              {suggestion.mutualCount} mutual:{' '}
              {suggestion.mutualConnections.map(m => m.name).join(', ')}
            </Mutuals>
          </Info>

          <Actions>
            <AddButton
              onPress={() => quickAdd(
                suggestion.user.id,
                suggestion.suggestedRelationship
              )}
            >
              + Add
            </AddButton>
            <DismissButton onPress={() => dismiss(suggestion.user.id)}>
              ✕
            </DismissButton>
          </Actions>
        </SuggestionRow>
      ))}

      <SeeAllLink onPress={() => navigate('AllSuggestions')}>
        See All Suggestions
      </SeeAllLink>
    </Card>
  );
};
```

### Search Screen

```javascript
// screens/SearchUsersScreen.js

const SearchUsersScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const searchUsers = async (q) => {
    setSearching(true);
    try {
      const response = await api.get(`/discover/search?q=${encodeURIComponent(q)}`);
      setResults(response.data.users);
    } finally {
      setSearching(false);
    }
  };

  const addToCircle = async (user) => {
    navigate('AddContact', {
      prefill: {
        memberId: user.id,
        name: user.name,
        email: user.email
      }
    });
  };

  return (
    <View>
      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name or email..."
        autoFocus
      />

      {searching && <ActivityIndicator />}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <UserRow
            user={item}
            onPress={() => addToCircle(item)}
            disabled={item.is_in_circle}
            badge={
              item.is_in_circle ? 'In Circle' :
              item.has_pending_invitation ? 'Invited' :
              null
            }
          />
        )}
        ListEmptyComponent={
          query.length >= 2 && !searching ? (
            <EmptyState>No users found matching "{query}"</EmptyState>
          ) : null
        }
      />
    </View>
  );
};
```

---

## Home Screen Integration

The People You May Know card appears on the home screen:

```javascript
// screens/HomeScreen.js

const HomeScreen = () => {
  return (
    <ScrollView>
      {/* Welcome Header */}
      <WelcomeHeader />

      {/* Quick Actions */}
      <QuickActions />

      {/* Upcoming Events */}
      <UpcomingEventsCard />

      {/* People You May Know */}
      <PeopleYouMayKnow />

      {/* Recent Activity */}
      <RecentActivity />
    </ScrollView>
  );
};
```

---

## Edge Cases

### No Mutual Connections

If user has no contacts, or contacts have no other contacts:

```json
{
  "suggestions": [],
  "total": 0,
  "message": "Add more people to your circle to see suggestions"
}
```

### All Suggestions Dismissed

```json
{
  "suggestions": [],
  "total": 0,
  "message": "No new suggestions. Check back later!"
}
```

### New User

For users with empty circles, show a different prompt:

```javascript
if (circleCount === 0) {
  return (
    <Card>
      <Title>Build Your Circle</Title>
      <Text>
        Start by inviting friends and family to join your Gift Circle.
        Once they accept, we'll suggest more people you may know!
      </Text>
      <Button onPress={() => navigate('InviteScreen')}>
        Send First Invitation
      </Button>
    </Card>
  );
}
```

