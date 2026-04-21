const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// ═══════════════════════════════════════════════════════════════
// Auth Validators
// ═══════════════════════════════════════════════════════════════

const registerValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  handleValidation
];

const loginValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidation
];

const socialAuthValidator = [
  body('token')
    .notEmpty().withMessage('Social auth token is required'),
  handleValidation
];

// ═══════════════════════════════════════════════════════════════
// User Validators
// ═══════════════════════════════════════════════════════════════

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('birthday')
    .optional()
    .isISO8601().withMessage('Birthday must be a valid date'),
  body('avatarType')
    .optional()
    .isIn(['turtle', 'pig', 'cow', 'flower1', 'flower2', 'custom'])
    .withMessage('Invalid avatar type'),
  handleValidation
];

// ═══════════════════════════════════════════════════════════════
// Questionnaire Validators
// ═══════════════════════════════════════════════════════════════

const questionnaireValidator = [
  body('favoriteActivities')
    .optional()
    .isArray().withMessage('Favorite activities must be an array'),
  body('personalStyle')
    .optional()
    .isIn(['Minimalist', 'Vintage', 'Modern', 'Bohemian', 'Classic', 'Colorful', 'Other'])
    .withMessage('Invalid personal style'),
  body('favoriteColors')
    .optional()
    .isArray().withMessage('Favorite colors must be an array'),
  body('likesSurprises')
    .optional()
    .isIn(['Yes, love them', 'I prefer to know ahead of time'])
    .withMessage('Invalid surprise preference'),
  body('causesValues')
    .optional()
    .isArray().withMessage('Causes/values must be an array'),
  body('favoriteFlower')
    .optional()
    .isIn(['Rose', 'Tulip', 'Lavender', 'Sunflower', 'Orchid', 'Lily', 'Daisy', 'Peony', 'Cherry Blossom', 'Hydrangea', 'Other'])
    .withMessage('Invalid flower selection'),
  body('favoriteCuisines')
    .optional()
    .isArray().withMessage('Favorite cuisines must be an array'),
  body('favoriteDesserts')
    .optional()
    .isArray().withMessage('Favorite desserts must be an array'),
  body('giftTypes')
    .optional()
    .isArray().withMessage('Gift types must be an array'),
  body('movieGenre')
    .optional()
    .isIn(['Action', 'Comedy', 'Crime', 'Drama', 'Thriller', 'Documentary', 'Other'])
    .withMessage('Invalid movie genre'),
  body('musicGenre')
    .optional()
    .isIn(['Hip-Hop', 'Pop', 'Rock', 'Country', 'Classical', 'Other'])
    .withMessage('Invalid music genre'),
  handleValidation
];

// ═══════════════════════════════════════════════════════════════
// Circle Validators
// ═══════════════════════════════════════════════════════════════

const addToCircleValidator = [
  body('memberId')
    .optional()
    .isUUID().withMessage('Invalid member ID'),
  body('guestName')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('guestEmail')
    .optional()
    .isEmail().withMessage('Please provide a valid email'),
  body('relationship')
    .optional()
    .isIn(['Family', 'Friend', 'Colleague', 'Partner', 'Other'])
    .withMessage('Invalid relationship type'),
  handleValidation
];

const updateCircleValidator = [
  param('id')
    .isUUID().withMessage('Invalid circle ID'),
  body('relationship')
    .optional()
    .isIn(['Family', 'Friend', 'Colleague', 'Partner', 'Other'])
    .withMessage('Invalid relationship type'),
  body('nickname')
    .optional()
    .trim(),
  handleValidation
];

// ═══════════════════════════════════════════════════════════════
// Invitation Validators
// ═══════════════════════════════════════════════════════════════

const createInvitationValidator = [
  body('inviteeName')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('inviteeEmail')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('personalMessage')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Message too long'),
  body('relationship')
    .optional()
    .isIn(['Family', 'Friend', 'Colleague', 'Partner', 'Other'])
    .withMessage('Invalid relationship type'),
  handleValidation
];

const webQuestionnaireValidator = [
  param('token')
    .notEmpty().withMessage('Invitation token is required'),
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email'),
  body('questionnaire')
    .isObject().withMessage('Questionnaire data is required'),
  handleValidation
];

// ═══════════════════════════════════════════════════════════════
// Event Validators
// ═══════════════════════════════════════════════════════════════

const createEventValidator = [
  body('title')
    .trim()
    .isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
  body('eventType')
    .isIn(['birthday', 'anniversary', 'wedding', 'baby_shower', 'custom'])
    .withMessage('Invalid event type'),
  body('eventDate')
    .isISO8601().withMessage('Event date must be a valid date'),
  body('circleId')
    .optional()
    .isUUID().withMessage('Invalid circle ID'),
  body('reminderDays')
    .optional()
    .isArray().withMessage('Reminder days must be an array'),
  handleValidation
];

const updateEventValidator = [
  param('id')
    .isUUID().withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
  body('eventDate')
    .optional()
    .isISO8601().withMessage('Event date must be a valid date'),
  handleValidation
];

// ═══════════════════════════════════════════════════════════════
// Common Validators
// ═══════════════════════════════════════════════════════════════

const uuidParamValidator = [
  param('id')
    .isUUID().withMessage('Invalid ID format'),
  handleValidation
];

const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidation
];

module.exports = {
  handleValidation,
  registerValidator,
  loginValidator,
  socialAuthValidator,
  updateProfileValidator,
  questionnaireValidator,
  addToCircleValidator,
  updateCircleValidator,
  createInvitationValidator,
  webQuestionnaireValidator,
  createEventValidator,
  updateEventValidator,
  uuidParamValidator,
  paginationValidator
};
