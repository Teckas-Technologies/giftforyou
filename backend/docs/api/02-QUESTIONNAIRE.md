# Questionnaire API

## Overview

The Questionnaire API manages user gift preferences based on the 35-question survey. This is the core feature that enables thoughtful gifting.

---

## Purpose

When a user fills out their questionnaire, their friends and family can see their preferences and give better gifts. The questionnaire covers:

- **Basic Info**: Name, photo, birthday, anniversaries
- **Lifestyle**: Activities, hobbies
- **Personal Style**: Fashion preferences, colors
- **Values**: Causes they care about
- **Flowers**: Flower preferences
- **Food**: Cuisines, restaurants, desserts
- **Gift Types**: Preferred gift categories
- **Entertainment**: Movies, music
- **Wishlist**: Links and sizes

---

## Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/questionnaire` | Yes | Get my questionnaire |
| PUT | `/api/questionnaire` | Yes | Save questionnaire |
| GET | `/api/questionnaire/completion` | Yes | Get completion status |
| GET | `/api/wishlist/links` | Yes | Get my wishlist links |
| POST | `/api/wishlist/links` | Yes | Add wishlist link |
| DELETE | `/api/wishlist/links/:id` | Yes | Delete wishlist link |
| GET | `/api/registries` | Yes | Get my registries |
| POST | `/api/registries` | Yes | Add registry |
| PUT | `/api/registries/:id` | Yes | Update registry |
| DELETE | `/api/registries/:id` | Yes | Delete registry |

---

## 1. Get My Questionnaire

Retrieve all questionnaire responses with completion status.

### Request

```http
GET /api/questionnaire
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "basicInfo": {
    "name": "Sarah Johnson",
    "birthday": "1990-03-15",
    "profilePhoto": "/uploads/profile-123.jpg",
    "avatarType": null
  },
  "questionnaire": {
    "favorite_activities": ["Hiking", "Travelling", "Movies"],
    "activity_details": "I love hiking in mountains and watching sci-fi movies",
    "personal_style": "Minimalist",
    "personal_style_other": null,
    "favorite_colors": ["Blue", "Green"],
    "favorite_colors_other": null,
    "likes_surprises": "Yes, love them",
    "causes_values": ["Eco-friendly", "Handmade"],
    "causes_other": null,
    "favorite_flower": "Sunflower",
    "flower_details": "Love sunflower arrangements with daisies",
    "favorite_cuisines": ["Italian", "Japanese"],
    "favorite_restaurant": "Olive Garden",
    "cuisine_other": null,
    "favorite_meal": "Chicken Alfredo",
    "favorite_desserts": ["Chocolate", "Ice Cream"],
    "dessert_details": "Dark chocolate and mint ice cream",
    "gift_types": ["Experiences & Events", "Books & Learning"],
    "gift_details": "Would love cooking classes or spa days",
    "movie_genre": "Comedy",
    "favorite_movies": "The Office, Parks and Rec",
    "music_genre": "Pop",
    "favorite_artists": "Taylor Swift, Ed Sheeran",
    "wishlist_text": "New yoga mat, wireless earbuds",
    "clothing_sizes": "Top: M, Pants: 8, Shoes: 7.5, Ring: 6"
  },
  "completionPercent": 80,
  "sections": {
    "basic_info": { "completed": true, "fields": [] },
    "lifestyle": { "completed": true, "fields": ["favorite_activities"] },
    "style": { "completed": true, "fields": ["personal_style", "favorite_colors", "likes_surprises"] },
    "values": { "completed": true, "fields": ["causes_values"] },
    "flowers": { "completed": true, "fields": ["favorite_flower"] },
    "food": { "completed": true, "fields": ["favorite_cuisines"] },
    "gifts": { "completed": true, "fields": ["gift_types"] },
    "entertainment": { "completed": true, "fields": ["music_genre"] },
    "wishlist": { "completed": false, "fields": ["wishlist_text"] }
  }
}
```

### How It Works

```
1. Get user's basic profile info (name, photo, birthday)
2. Get questionnaire responses from questionnaire_responses table
3. Calculate completion percentage for each section
4. Return all data for display in Profile screen
```

---

## 2. Save Questionnaire

Save or update questionnaire responses. Can save one section at a time or all at once.

### Request

```http
PUT /api/questionnaire
Authorization: Bearer <token>
Content-Type: application/json

{
  "favoriteActivities": ["Hiking", "Travelling", "Movies", "Food"],
  "activityDetails": "I love hiking in mountains with friends",
  "personalStyle": "Minimalist",
  "favoriteColors": ["Blue", "Green", "Purple"],
  "likesSurprises": "Yes, love them"
}
```

### Response (200 OK)

```json
{
  "message": "Questionnaire saved",
  "questionnaire": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "favorite_activities": ["Hiking", "Travelling", "Movies", "Food"],
    "activity_details": "I love hiking in mountains with friends",
    "personal_style": "Minimalist",
    "favorite_colors": ["Blue", "Green", "Purple"],
    "likes_surprises": "Yes, love them",
    "updated_at": "2024-01-15T14:30:00.000Z"
  },
  "completionPercent": 45
}
```

### Field Mapping (camelCase → snake_case)

| Request Field | Database Column |
|---------------|-----------------|
| favoriteActivities | favorite_activities |
| activityDetails | activity_details |
| personalStyle | personal_style |
| personalStyleOther | personal_style_other |
| favoriteColors | favorite_colors |
| favoriteColorsOther | favorite_colors_other |
| likesSurprises | likes_surprises |
| causesValues | causes_values |
| causesOther | causes_other |
| favoriteFlower | favorite_flower |
| flowerDetails | flower_details |
| favoriteCuisines | favorite_cuisines |
| favoriteRestaurant | favorite_restaurant |
| cuisineOther | cuisine_other |
| favoriteMeal | favorite_meal |
| favoriteDesserts | favorite_desserts |
| dessertDetails | dessert_details |
| giftTypes | gift_types |
| giftDetails | gift_details |
| movieGenre | movie_genre |
| favoriteMovies | favorite_movies |
| musicGenre | music_genre |
| favoriteArtists | favorite_artists |
| wishlistText | wishlist_text |
| clothingSizes | clothing_sizes |

### How It Works

```
1. Receive questionnaire data (partial or complete)
2. Convert camelCase field names to snake_case
3. Check if user has existing questionnaire record
   → If yes: UPDATE existing record
   → If no: INSERT new record
4. Recalculate completion percentage
5. Update user's questionnaire_completion_percent
6. Mark questionnaire_completed = true if 100%
7. Return updated questionnaire and completion percent
```

---

## 3. Get Completion Status

Get detailed completion status for each section.

### Request

```http
GET /api/questionnaire/completion
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "completionPercent": 75,
  "sections": {
    "basic_info": {
      "completed": true,
      "fields": []
    },
    "lifestyle": {
      "completed": true,
      "fields": ["favorite_activities"]
    },
    "style": {
      "completed": true,
      "fields": ["personal_style", "favorite_colors", "likes_surprises"]
    },
    "values": {
      "completed": true,
      "fields": ["causes_values"]
    },
    "flowers": {
      "completed": false,
      "fields": ["favorite_flower"]
    },
    "food": {
      "completed": true,
      "fields": ["favorite_cuisines"]
    },
    "gifts": {
      "completed": true,
      "fields": ["gift_types"]
    },
    "entertainment": {
      "completed": false,
      "fields": ["music_genre"]
    },
    "wishlist": {
      "completed": false,
      "fields": ["wishlist_text"]
    }
  }
}
```

### Purpose

Used in Profile screen to show:
- Overall progress bar
- Which sections are complete (✓) vs incomplete (○)
- Help users know what to fill out next

---

## 4. Wishlist Links

### Add Wishlist Link

```http
POST /api/wishlist/links
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://amazon.com/hz/wishlist/ls/ABC123",
  "title": "Amazon Wishlist",
  "linkType": "amazon"
}
```

### Response (201 Created)

```json
{
  "link": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://amazon.com/hz/wishlist/ls/ABC123",
    "title": "Amazon Wishlist",
    "link_type": "amazon",
    "created_at": "2024-01-15T14:30:00.000Z"
  }
}
```

### Get Wishlist Links

```http
GET /api/wishlist/links
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "links": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "url": "https://amazon.com/hz/wishlist/ls/ABC123",
      "title": "Amazon Wishlist",
      "link_type": "amazon"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "url": "https://etsy.com/people/sarah/favorites",
      "title": "Etsy Favorites",
      "link_type": "etsy"
    }
  ]
}
```

### Limit

Maximum 3 wishlist links per user (as per requirements).

---

## 5. Registries

For wedding, baby shower, and other gift registries.

### Add Registry

```http
POST /api/registries
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://registry.theknot.com/sarah-john",
  "title": "Sarah & John Wedding",
  "registryType": "wedding",
  "details": "Our wedding is on June 15, 2024",
  "expiryDate": "2024-07-15"
}
```

### Response (201 Created)

```json
{
  "registry": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "url": "https://registry.theknot.com/sarah-john",
    "title": "Sarah & John Wedding",
    "registry_type": "wedding",
    "details": "Our wedding is on June 15, 2024",
    "expiry_date": "2024-07-15",
    "is_active": true
  }
}
```

### Update Registry

```http
PUT /api/registries/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isActive": false
}
```

### Purpose

- Registry links are shown to contacts viewing your preferences
- After expiry date, registry is automatically deactivated
- Useful for time-limited events like weddings

---

## Questionnaire Categories Reference

Based on the requirements document, here are all the question categories:

### A. Basic Profile (Stored in `users` table)
1. Name
2. Email
3. Profile Photo (avatars available: turtle, pig, cow, flowers)
4. Birthday
5. Anniversaries (up to 3)

### B. Lifestyle & Activities
6. Favorite Activities (multi-select)
   - Hiking, Shopping, Travelling, Food, Sports, Exercise, Concerts, Picnics, Collector, Antiquing, Dining Out, Movies, Other
7. Activity Details (long text)

### C. Personal Style
8. Personal Style (single select)
   - Minimalist, Vintage, Modern, Bohemian, Classic, Colorful, Other
9. Other Style (conditional)
10. Favorite Colors (multi-select)
    - Blue, Green, Red, Purple, Black, Pink, Orange, Yellow, Teal, Other
11. Like Surprises (single select)
    - Yes love them, I prefer to know ahead

### D. Values & Causes
12. Causes/Values (multi-select)
    - Eco-friendly, Handmade, Locally sourced, Charitable giving, Other
13. Other Causes (conditional)

### E. Flowers
14. Favorite Flower (single select)
    - Rose, Tulip, Lavender, Sunflower, Orchid, Lily, Daisy, Peony, Cherry Blossom, Hydrangea, Other
15. Flower Arrangements (long text)

### F. Food & Dining
16. Favorite Cuisines (multi-select)
    - American, Barbecue, Chinese, French, Hamburger, Indian, Italian, Japanese, Mexican, Pizza, Seafood, Steak, Sushi, Thai, Other
17. Favorite Restaurant (text)
18. Other Cuisine (text)
19. Favorite Meal (long text)
20. Favorite Desserts (multi-select)
    - Chocolate, Candy, Ice Cream, Cookies, Cake, Fruity, Other
21. Dessert Details (long text)

### G. Gift Preferences
22. Gift Types (multi-select)
    - Experiences & Events, Jewelry & Accessories, Food & Drink, Beauty & Self Care, Tech & Gadgets, Books & Learning, Home & Living, Fashion & Clothing, Charitable Donations
23. Gift Details (long text)

### H. Entertainment
24. Movie Genre (single select)
    - Action, Comedy, Crime, Drama, Thriller, Documentary, Other
25. Favorite Movies (long text)
26. Music Genre (single select)
    - Hip-Hop, Pop, Rock, Country, Classical, Other
27. Favorite Artists (long text)

### I. Wishlist & Registry
28. Wishlist Text (long text)
29-31. Wishlist Links (URLs, max 3)
32. Reference Pictures (file upload)
33. Sizes (long text)
34. Registry Link (URL)
35. Registry Expiry (date)

---

## Mobile App Usage

```javascript
// screens/QuestionnaireScreen.js

const saveSection = async (section, data) => {
  try {
    const response = await api.put('/questionnaire', data);
    setCompletionPercent(response.data.completionPercent);
    showToast('Saved!');
  } catch (error) {
    showError('Failed to save');
  }
};

// Example: Save lifestyle section
const saveLifestyle = () => {
  saveSection('lifestyle', {
    favoriteActivities: selectedActivities,
    activityDetails: activityText
  });
};

// Example: Save food section
const saveFood = () => {
  saveSection('food', {
    favoriteCuisines: selectedCuisines,
    favoriteRestaurant: restaurant,
    favoriteMeal: meal,
    favoriteDesserts: selectedDesserts,
    dessertDetails: dessertText
  });
};
```
