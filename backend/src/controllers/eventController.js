const Event = require('../models/Event');

/**
 * Get all events
 * GET /api/events
 */
exports.getEvents = async (req, res) => {
  try {
    const { month, year, upcoming } = req.query;

    const events = await Event.findByUser(req.userId, {
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      upcoming: upcoming === 'true'
    });

    res.json({
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Failed to get events'
    });
  }
};

/**
 * Get upcoming events
 * GET /api/events/upcoming
 */
exports.getUpcomingEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const events = await Event.getUpcoming(req.userId, limit);

    res.json({
      events
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      error: 'Failed to get upcoming events'
    });
  }
};

/**
 * Get events by date
 * GET /api/events/date/:date
 */
exports.getEventsByDate = async (req, res) => {
  try {
    const events = await Event.findByDate(req.userId, req.params.date);

    res.json({
      events
    });
  } catch (error) {
    console.error('Get events by date error:', error);
    res.status(500).json({
      error: 'Failed to get events'
    });
  }
};

/**
 * Get event dates for calendar
 * GET /api/events/calendar/:year/:month
 */
exports.getEventDates = async (req, res) => {
  try {
    const { year, month } = req.params;
    const dates = await Event.getEventDates(req.userId, parseInt(month), parseInt(year));

    res.json({
      dates
    });
  } catch (error) {
    console.error('Get event dates error:', error);
    res.status(500).json({
      error: 'Failed to get event dates'
    });
  }
};

/**
 * Get single event
 * GET /api/events/:id
 */
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('contact', 'name profilePhoto avatarType')
      .populate('circle', 'nickname guestName');

    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    if (!event.user.equals(req.userId)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    res.json({
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      error: 'Failed to get event'
    });
  }
};

/**
 * Create event
 * POST /api/events
 */
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      eventType,
      eventDate,
      description,
      circleId,
      contactId,
      isRecurring,
      reminderDays,
      registryId
    } = req.body;

    const event = await Event.create({
      user: req.userId,
      title,
      eventType,
      eventDate,
      description,
      circle: circleId,
      contact: contactId,
      registry: registryId,
      isRecurring: isRecurring !== false,
      reminderDays: reminderDays || [7, 1]
    });

    res.status(201).json({
      message: 'Event created',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      error: 'Failed to create event'
    });
  }
};

/**
 * Update event
 * PUT /api/events/:id
 */
exports.updateEvent = async (req, res) => {
  try {
    const existingEvent = await Event.findById(req.params.id);

    if (!existingEvent) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    if (!existingEvent.user.equals(req.userId)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    const {
      title,
      eventType,
      eventDate,
      description,
      isRecurring,
      reminderDays,
      reminderEnabled
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (eventType !== undefined) updates.eventType = eventType;
    if (eventDate !== undefined) updates.eventDate = eventDate;
    if (description !== undefined) updates.description = description;
    if (isRecurring !== undefined) updates.isRecurring = isRecurring;
    if (reminderDays !== undefined) updates.reminderDays = reminderDays;
    if (reminderEnabled !== undefined) updates.reminderEnabled = reminderEnabled;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('contact', 'name profilePhoto avatarType');

    res.json({
      message: 'Event updated',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      error: 'Failed to update event'
    });
  }
};

/**
 * Delete event
 * DELETE /api/events/:id
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    if (!event.user.equals(req.userId)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Event deleted'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      error: 'Failed to delete event'
    });
  }
};
