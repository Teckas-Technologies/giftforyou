# Users & Profile API

## Overview

The Users API manages user profiles, settings, and account information. This includes profile photos, avatars, privacy settings, and account deletion.

---

## Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/users/profile` | Yes | Get my full profile |
| PUT | `/api/users/profile` | Yes | Update profile |
| POST | `/api/users/profile/photo` | Yes | Upload profile photo |
| DELETE | `/api/users/profile/photo` | Yes | Remove profile photo |
| PUT | `/api/users/profile/avatar` | Yes | Set avatar |
| PUT | `/api/users/settings` | Yes | Update settings |
| PUT | `/api/users/onboarding-seen` | Yes | Mark onboarding complete |
| POST | `/api/users/anniversaries` | Yes | Add anniversary |
| DELETE | `/api/users/anniversaries/:id` | Yes | Delete anniversary |
| DELETE | `/api/users/account` | Yes | Delete account |

---

## 1. Get My Profile

Get complete user profile with all details.

### Request

```http
GET /api/users/profile
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "sarah@example.com",
    "name": "Sarah Johnson",
    "profile_photo": "/uploads/profile-123.jpg",
    "avatar_type": null,
    "birthday": "1990-03-15",
    "show_birth_year": false,
    "auth_provider": "email",
    "questionnaire_completed": true,
    "questionnaire_completion_percent": 85,
    "onboarding_seen": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "last_login_at": "2024-01-15T08:30:00.000Z"
  },
  "anniversaries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440060",
      "title": "Wedding Anniversary",
      "date": "2015-06-20",
      "created_at": "2024-01-10T10:00:00.000Z"
    }
  ],
  "stats": {
    "circleCount": 12,
    "eventsCount": 8,
    "invitationsSent": 5,
    "invitationsAccepted": 3
  }
}
```

---

## 2. Update Profile

Update user profile information.

### Request

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sarah M. Johnson",
  "birthday": "1990-03-15",
  "showBirthYear": false
}
```

### Updatable Fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Display name |
| birthday | date | Birthday (YYYY-MM-DD) |
| showBirthYear | boolean | Whether to show birth year to contacts |

### Response (200 OK)

```json
{
  "message": "Profile updated",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sarah M. Johnson",
    "birthday": "1990-03-15",
    "show_birth_year": false,
    "updated_at": "2024-01-15T14:00:00.000Z"
  }
}
```

---

## 3. Upload Profile Photo

Upload a new profile photo.

### Request

```http
POST /api/users/profile/photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: [binary file]
```

### File Requirements

- Max size: 5MB
- Formats: JPEG, PNG, GIF, WEBP
- Recommended: Square image (will be displayed as circle)

### Response (200 OK)

```json
{
  "message": "Photo uploaded",
  "profilePhoto": "/uploads/profile-550e8400-1705312800.jpg"
}
```

### How It Works

```
1. Receive multipart form data
2. Validate file type and size
3. Generate unique filename: profile-{userId}-{timestamp}.{ext}
4. Save to /uploads directory
5. Delete old profile photo if exists
6. Update user record with new photo path
7. Return new photo URL
```

---

## 4. Remove Profile Photo

Delete profile photo and optionally set avatar.

### Request

```http
DELETE /api/users/profile/photo
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Photo removed"
}
```

---

## 5. Set Avatar

Set a predefined avatar instead of photo.

### Request

```http
PUT /api/users/profile/avatar
Authorization: Bearer <token>
Content-Type: application/json

{
  "avatarType": "turtle"
}
```

### Available Avatars

| Type | Description |
|------|-------------|
| `turtle` | Green turtle character |
| `pig` | Pink pig character |
| `cow` | Brown cow character |
| `flowers` | Flower bouquet |
| `null` | Remove avatar (use photo) |

### Response (200 OK)

```json
{
  "message": "Avatar updated",
  "avatarType": "turtle"
}
```

### Avatar vs Photo Logic

```
Display Priority:
1. If profile_photo exists → show photo
2. Else if avatar_type exists → show avatar
3. Else → show default placeholder

When setting avatar:
- Sets avatar_type
- Does NOT delete profile_photo (can switch back)

When uploading photo:
- Sets profile_photo
- Sets avatar_type = null
```

---

## 6. Update Settings

Update user preferences and settings.

### Request

```http
PUT /api/users/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "pushNotifications": true,
  "emailNotifications": true,
  "reminderDays": 7
}
```

### Settings Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| pushNotifications | boolean | true | Enable push notifications |
| emailNotifications | boolean | true | Enable email notifications |
| reminderDays | number | 7 | Default reminder days for events |

### Response (200 OK)

```json
{
  "message": "Settings updated",
  "settings": {
    "pushNotifications": true,
    "emailNotifications": true,
    "reminderDays": 7
  }
}
```

---

## 7. Mark Onboarding Seen

Mark that user has completed onboarding flow.

### Request

```http
PUT /api/users/onboarding-seen
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Onboarding marked as seen"
}
```

### Purpose

After new user sees onboarding slides, this is called so they don't see them again.

---

## 8. Add Anniversary

Add a personal anniversary (wedding, etc).

### Request

```http
POST /api/users/anniversaries
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Wedding Anniversary",
  "date": "2015-06-20"
}
```

### Response (201 Created)

```json
{
  "anniversary": {
    "id": "550e8400-e29b-41d4-a716-446655440060",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Wedding Anniversary",
    "date": "2015-06-20",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### Limit

Maximum 3 anniversaries per user (per requirements).

---

## 9. Delete Anniversary

Delete an anniversary.

### Request

```http
DELETE /api/users/anniversaries/:id
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "message": "Anniversary deleted"
}
```

---

## 10. Delete Account

Permanently delete user account and all data.

### Request

```http
DELETE /api/users/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "confirmation": "DELETE"
}
```

### Response (200 OK)

```json
{
  "message": "Account deleted successfully"
}
```

### What Gets Deleted

```
1. User record
2. Questionnaire responses
3. All events created by user
4. All circle entries (as owner)
5. All sent invitations
6. All notifications
7. Profile photo file
8. Wishlist links and images
9. Registries

NOT deleted (for data integrity):
- Circle entries where user is member (marked as deleted)
- Invitation records (inviter can still see history)
```

### Confirmation Required

The request body must include `"confirmation": "DELETE"` to prevent accidental deletion.

---

## Profile Screen Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROFILE SCREEN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      [Photo/Avatar]                      │   │
│   │                        Sarah J.                          │   │
│   │                    sarah@example.com                     │   │
│   │                                                          │   │
│   │           Progress: ████████░░ 85% Complete             │   │
│   │                                                          │   │
│   │   ─────────────────────────────────────────────────────  │   │
│   │                                                          │   │
│   │   [Edit Profile]                                         │   │
│   │     • Name, Birthday, Photo                              │   │
│   │                                                          │   │
│   │   [My Preferences] ──► Questionnaire screen             │   │
│   │     • View/edit gift preferences                         │   │
│   │                                                          │   │
│   │   [Anniversaries]                                        │   │
│   │     • Wedding: June 20                                   │   │
│   │     • [+ Add Anniversary]                                │   │
│   │                                                          │   │
│   │   [Settings]                                             │   │
│   │     • Notifications                                      │   │
│   │     • Privacy                                            │   │
│   │                                                          │   │
│   │   [Logout]                                               │   │
│   │                                                          │   │
│   │   [Delete Account] ⚠️                                    │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mobile App Usage

```javascript
// screens/ProfileScreen.js

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      setProfile(prev => ({ ...prev, user: response.data.user }));
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const uploadPhoto = async (imageUri) => {
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg'
    });

    try {
      const response = await api.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, profile_photo: response.data.profilePhoto }
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo');
    }
  };

  const setAvatar = async (avatarType) => {
    try {
      await api.put('/users/profile/avatar', { avatarType });
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, avatar_type: avatarType, profile_photo: null }
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to set avatar');
    }
  };

  const deleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/users/account', {
                data: { confirmation: 'DELETE' }
              });
              // Clear local storage and navigate to login
              await AsyncStorage.clear();
              navigate('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView>
      {/* Profile Header */}
      <ProfileHeader
        photo={profile?.user.profile_photo}
        avatar={profile?.user.avatar_type}
        name={profile?.user.name}
        email={profile?.user.email}
        completionPercent={profile?.user.questionnaire_completion_percent}
        onPhotoPress={showPhotoOptions}
      />

      {/* Edit Profile */}
      <MenuSection title="Account">
        <MenuItem
          title="Edit Profile"
          onPress={() => navigate('EditProfile')}
        />
        <MenuItem
          title="My Preferences"
          subtitle={`${profile?.user.questionnaire_completion_percent}% complete`}
          onPress={() => navigate('Questionnaire')}
        />
      </MenuSection>

      {/* Anniversaries */}
      <MenuSection title="Anniversaries">
        {profile?.anniversaries.map(ann => (
          <AnniversaryItem
            key={ann.id}
            anniversary={ann}
            onDelete={() => deleteAnniversary(ann.id)}
          />
        ))}
        {profile?.anniversaries.length < 3 && (
          <MenuItem
            title="+ Add Anniversary"
            onPress={showAddAnniversaryModal}
          />
        )}
      </MenuSection>

      {/* Settings */}
      <MenuSection title="Settings">
        <MenuItem
          title="Notifications"
          onPress={() => navigate('NotificationSettings')}
        />
        <MenuItem
          title="Privacy"
          onPress={() => navigate('PrivacySettings')}
        />
      </MenuSection>

      {/* Account Actions */}
      <MenuSection>
        <MenuItem
          title="Logout"
          onPress={handleLogout}
        />
        <MenuItem
          title="Delete Account"
          titleStyle={{ color: 'red' }}
          onPress={deleteAccount}
        />
      </MenuSection>
    </ScrollView>
  );
};
```

### Photo Options Modal

```javascript
const showPhotoOptions = () => {
  ActionSheet.show({
    options: [
      { label: 'Take Photo', onPress: takePhoto },
      { label: 'Choose from Library', onPress: pickImage },
      { label: 'Choose Avatar', onPress: showAvatarPicker },
      { label: 'Remove Photo', onPress: removePhoto, destructive: true },
      { label: 'Cancel', cancel: true }
    ]
  });
};

const showAvatarPicker = () => {
  navigate('AvatarPicker', {
    onSelect: (avatarType) => {
      setAvatar(avatarType);
      goBack();
    }
  });
};
```

---

## Avatar Picker Screen

```javascript
// screens/AvatarPickerScreen.js

const avatars = [
  { type: 'turtle', label: 'Turtle', image: require('./assets/turtle.png') },
  { type: 'pig', label: 'Pig', image: require('./assets/pig.png') },
  { type: 'cow', label: 'Cow', image: require('./assets/cow.png') },
  { type: 'flowers', label: 'Flowers', image: require('./assets/flowers.png') }
];

const AvatarPickerScreen = ({ route }) => {
  const { onSelect } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose an Avatar</Text>
      <View style={styles.grid}>
        {avatars.map(avatar => (
          <TouchableOpacity
            key={avatar.type}
            style={styles.avatarOption}
            onPress={() => onSelect(avatar.type)}
          >
            <Image source={avatar.image} style={styles.avatarImage} />
            <Text>{avatar.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
```

