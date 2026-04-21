/**
 * GiftBox4you API Server
 * Main application entry point
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Database connection
const { connectDB } = require('./config/database');

// Import routes
const userRoutes = require('./routes/users');
const questionnaireRoutes = require('./routes/questionnaire');
const circleRoutes = require('./routes/circles');
const eventRoutes = require('./routes/events');
const invitationRoutes = require('./routes/invitations');
const notificationRoutes = require('./routes/notifications');
const discoverRoutes = require('./routes/discover');

// Initialize express app
const app = express();

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.WEB_APP_URL, /\.giftbox4you\.com$/]
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-id', 'x-user-email', 'x-user-name'],
  credentials: true
}));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discover', discoverRoutes);

// Dashboard stats (shortcut)
app.get('/api/dashboard/stats', require('./middleware/auth').authenticate, require('./controllers/userController').getDashboardStats);

// API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'GiftBox4you API',
    version: '1.0.0',
    description: 'Backend API for GiftBox4you mobile application',
    authentication: 'External auth service - pass x-user-id, x-user-email, x-user-name headers',
    endpoints: {
      users: {
        'GET /api/users/profile': 'Get my profile',
        'PUT /api/users/profile': 'Update profile',
        'POST /api/users/profile/photo': 'Upload profile photo',
        'PUT /api/users/onboarding-seen': 'Mark onboarding seen',
        'GET /api/dashboard/stats': 'Get dashboard statistics'
      },
      questionnaire: {
        'GET /api/questionnaire': 'Get my questionnaire',
        'PUT /api/questionnaire': 'Save questionnaire',
        'GET /api/questionnaire/completion': 'Get completion status'
      },
      circles: {
        'GET /api/circles': 'Get all contacts',
        'POST /api/circles': 'Add contact',
        'GET /api/circles/:id/preferences': 'Get contact preferences',
        'DELETE /api/circles/:id': 'Remove contact'
      },
      events: {
        'GET /api/events': 'Get all events',
        'GET /api/events/upcoming': 'Get upcoming events',
        'POST /api/events': 'Create event',
        'PUT /api/events/:id': 'Update event',
        'DELETE /api/events/:id': 'Delete event'
      },
      invitations: {
        'GET /api/invitations': 'Get sent invitations',
        'POST /api/invitations': 'Send invitation',
        'PUT /api/invitations/:id/resend': 'Resend invitation',
        'GET /api/invitations/web/:token': 'Validate web invitation',
        'POST /api/invitations/web/:token/respond': 'Submit web questionnaire'
      },
      notifications: {
        'GET /api/notifications': 'Get notifications',
        'PUT /api/notifications/:id/read': 'Mark as read',
        'PUT /api/notifications/read-all': 'Mark all as read'
      },
      discover: {
        'GET /api/discover/people-you-may-know': 'Get friend suggestions'
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'Maximum file size is 5MB'
    });
  }

  if (err.message === 'Only images are allowed') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image files (jpg, png, gif, webp) are allowed'
    });
  }

  // Validation errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.stack
  });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎁 GiftBox4you API Server                                ║
║                                                            ║
║   Server running on port ${PORT}                              ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(38)}║
║   Database: MongoDB                                        ║
║                                                            ║
║   Endpoints:                                               ║
║   • Health:  http://localhost:${PORT}/health                  ║
║   • API:     http://localhost:${PORT}/api                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
