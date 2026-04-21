# GiftBox4you Backend API

Backend API server for the GiftBox4you mobile application.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** External service (pass user via headers)
- **Email:** Nodemailer
- **Push Notifications:** Firebase Cloud Messaging

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB 6.0 or higher (or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas connection string in .env
   ```

4. **Start the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Authentication

This API uses external authentication. Pass the following headers with authenticated requests:

| Header | Required | Description |
|--------|----------|-------------|
| `x-user-id` | Yes | External user ID from auth service |
| `x-user-email` | On first request | User's email (for auto-registration) |
| `x-user-name` | On first request | User's display name |

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/me` | Update profile |
| POST | `/api/users/me/photo` | Upload profile photo |
| PUT | `/api/users/me/onboarding-seen` | Mark onboarding seen |
| GET | `/api/dashboard/stats` | Get dashboard stats |

### Questionnaire
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questionnaire` | Get questionnaire |
| PUT | `/api/questionnaire` | Save questionnaire |
| GET | `/api/questionnaire/completion` | Get completion status |

### Gift Circles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/circles` | Get all contacts |
| GET | `/api/circles/:id` | Get contact |
| GET | `/api/circles/:id/preferences` | Get contact preferences |
| POST | `/api/circles` | Add contact |
| PUT | `/api/circles/:id` | Update contact |
| DELETE | `/api/circles/:id` | Remove contact |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/upcoming` | Get upcoming events |
| GET | `/api/events/:id` | Get event |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

### Invitations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invitations` | Get sent invitations |
| POST | `/api/invitations` | Send invitation |
| PUT | `/api/invitations/:id/resend` | Resend invitation |
| DELETE | `/api/invitations/:id` | Delete invitation |
| GET | `/api/invitations/web/:token` | Validate web invite |
| POST | `/api/invitations/web/:token/respond` | Submit web questionnaire |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Discovery
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discover/people-you-may-know` | Get suggestions |
| POST | `/api/discover/dismiss/:userId` | Dismiss suggestion |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── questionnaireController.js
│   │   ├── circleController.js
│   │   ├── eventController.js
│   │   ├── invitationController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js          # External auth middleware
│   │   └── validation.js    # Request validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Questionnaire.js
│   │   ├── GiftCircle.js
│   │   ├── Event.js
│   │   ├── Invitation.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── users.js
│   │   ├── questionnaire.js
│   │   ├── circles.js
│   │   ├── events.js
│   │   ├── invitations.js
│   │   ├── notifications.js
│   │   └── discover.js
│   ├── services/
│   │   └── emailService.js
│   └── app.js               # Main application
├── uploads/                 # Uploaded files
├── package.json
├── .env.example
└── README.md
```

## Documentation

Detailed API documentation is available in the `docs/` folder:

### Architecture
- [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) - System architecture, data flows, and deployment diagrams

### API Reference
| Document | Description |
|----------|-------------|
| [02-QUESTIONNAIRE.md](docs/api/02-QUESTIONNAIRE.md) | Gift preferences, wishlist links, registries |
| [03-CIRCLES.md](docs/api/03-CIRCLES.md) | Contact management, viewing preferences |
| [04-INVITATIONS.md](docs/api/04-INVITATIONS.md) | Sending invites, web questionnaire flow |
| [05-EVENTS.md](docs/api/05-EVENTS.md) | Calendar, birthdays, reminders |
| [06-NOTIFICATIONS.md](docs/api/06-NOTIFICATIONS.md) | Push notifications, in-app alerts |
| [07-USERS.md](docs/api/07-USERS.md) | Profile management, settings, avatars |
| [08-DISCOVER.md](docs/api/08-DISCOVER.md) | People you may know, user search |

Each API document includes:
- Endpoint details with request/response examples
- Flow diagrams showing how features work
- Mobile app usage code samples
- Error handling and edge cases

## Database Collections

MongoDB collections (auto-created by Mongoose):
- `users` - User accounts and profiles
- `questionnaires` - Gift preference responses
- `giftcircles` - Contact relationships
- `events` - Birthdays and reminders
- `invitations` - Invitation tokens
- `notifications` - In-app notifications

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/giftbox4you |
| `SMTP_HOST` | Email SMTP host | smtp.gmail.com |
| `SMTP_PORT` | Email SMTP port | 587 |
| `SMTP_USER` | Email username | - |
| `SMTP_PASSWORD` | Email password | - |
| `WEB_APP_URL` | Frontend URL | - |

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test
```

## Deployment

### Railway/Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Docker
```bash
docker build -t giftbox-api .
docker run -p 3000:3000 --env-file .env giftbox-api
```

## License

ISC
