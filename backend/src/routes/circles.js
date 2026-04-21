const express = require('express');
const router = express.Router();
const circleController = require('../controllers/circleController');
const { authenticate } = require('../middleware/auth');
const { addToCircleValidator, updateCircleValidator, uuidParamValidator } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Circles
router.get('/', circleController.getCircles);
router.get('/grouped', circleController.getCirclesGrouped);
router.get('/:id', uuidParamValidator, circleController.getCircle);
router.get('/:id/preferences', uuidParamValidator, circleController.getContactPreferences);
router.post('/', addToCircleValidator, circleController.addToCircle);
router.post('/quick-add/:userId', circleController.quickAdd);
router.put('/:id', updateCircleValidator, circleController.updateCircle);
router.delete('/:id', uuidParamValidator, circleController.removeFromCircle);

module.exports = router;
