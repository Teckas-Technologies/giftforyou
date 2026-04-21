const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { createEventValidator, updateEventValidator, uuidParamValidator } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Events
router.get('/', eventController.getEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/date/:date', eventController.getEventsByDate);
router.get('/calendar/:year/:month', eventController.getEventDates);
router.get('/:id', uuidParamValidator, eventController.getEvent);
router.post('/', createEventValidator, eventController.createEvent);
router.put('/:id', updateEventValidator, eventController.updateEvent);
router.delete('/:id', uuidParamValidator, eventController.deleteEvent);

module.exports = router;
