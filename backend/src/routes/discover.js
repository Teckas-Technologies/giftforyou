const express = require('express');
const router = express.Router();
const circleController = require('../controllers/circleController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Discovery
router.get('/people-you-may-know', circleController.getPeopleYouMayKnow);
router.post('/dismiss/:userId', circleController.dismissSuggestion);

module.exports = router;
