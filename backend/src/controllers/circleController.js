const GiftCircle = require('../models/GiftCircle');
const Questionnaire = require('../models/Questionnaire');
const Event = require('../models/Event');
const User = require('../models/User');
const FriendSuggestion = require('../models/FriendSuggestion');

/**
 * Get all contacts in circle
 * GET /api/circles
 */
exports.getCircles = async (req, res) => {
  try {
    const { search, relationship, status } = req.query;

    const contacts = await GiftCircle.findByOwner(req.userId, {
      search,
      relationship,
      status
    });

    res.json({
      contacts,
      total: contacts.length
    });
  } catch (error) {
    console.error('Get circles error:', error);
    res.status(500).json({
      error: 'Failed to get contacts'
    });
  }
};

/**
 * Get contacts grouped by relationship
 * GET /api/circles/grouped
 */
exports.getCirclesGrouped = async (req, res) => {
  try {
    const grouped = await GiftCircle.getGroupedByRelationship(req.userId);

    res.json({
      groups: grouped
    });
  } catch (error) {
    console.error('Get grouped circles error:', error);
    res.status(500).json({
      error: 'Failed to get contacts'
    });
  }
};

/**
 * Get single contact
 * GET /api/circles/:id
 */
exports.getCircle = async (req, res) => {
  try {
    const circle = await GiftCircle.findById(req.params.id)
      .populate('member', 'name email profilePhoto avatarType birthday');

    if (!circle) {
      return res.status(404).json({
        error: 'Contact not found'
      });
    }

    // Check ownership
    if (!circle.owner.equals(req.userId)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    res.json({
      contact: circle
    });
  } catch (error) {
    console.error('Get circle error:', error);
    res.status(500).json({
      error: 'Failed to get contact'
    });
  }
};

/**
 * Get contact's preferences
 * GET /api/circles/:id/preferences
 */
exports.getContactPreferences = async (req, res) => {
  try {
    const circle = await GiftCircle.findById(req.params.id)
      .populate('member', 'name email profilePhoto avatarType birthday showBirthYear');

    if (!circle) {
      return res.status(404).json({
        error: 'Contact not found'
      });
    }

    // Check ownership
    if (!circle.owner.equals(req.userId)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    // If guest user, no preferences available
    if (!circle.member) {
      return res.json({
        contact: {
          name: circle.guestName,
          email: circle.guestEmail,
          isGuest: true
        },
        preferences: null,
        message: 'This contact has not filled out their preferences yet'
      });
    }

    const member = circle.member;

    // Get preferences
    const preferences = await Questionnaire.getFormattedPreferences(member._id);

    // Get upcoming events for this contact
    const upcomingEvents = await Event.find({
      circle: circle._id,
      eventDate: { $gte: new Date() }
    }).sort({ eventDate: 1 });

    res.json({
      contact: {
        id: member._id,
        name: member.name,
        email: member.email,
        photo: member.profilePhoto,
        avatar: member.avatarType,
        birthday: member.showBirthYear ? member.birthday :
          member.birthday ? member.birthday.toISOString().replace(/^\d{4}/, '****') : null,
        relationship: circle.relationship,
        nickname: circle.nickname
      },
      preferences,
      upcomingEvents
    });
  } catch (error) {
    console.error('Get contact preferences error:', error);
    res.status(500).json({
      error: 'Failed to get preferences'
    });
  }
};

/**
 * Add contact to circle
 * POST /api/circles
 */
exports.addToCircle = async (req, res) => {
  try {
    const { memberId, guestName, guestEmail, relationship, nickname } = req.body;

    // Validate - need either memberId or guest info
    if (!memberId && !guestEmail) {
      return res.status(400).json({
        error: 'Please provide member ID or guest email'
      });
    }

    // Check if already exists
    const exists = await GiftCircle.exists(req.userId, memberId, guestEmail);
    if (exists) {
      return res.status(400).json({
        error: 'Contact already in your circle'
      });
    }

    // Can't add yourself
    if (memberId && memberId.toString() === req.userId.toString()) {
      return res.status(400).json({
        error: 'Cannot add yourself to your circle'
      });
    }

    // Create circle entry
    const circle = await GiftCircle.create({
      owner: req.userId,
      member: memberId || undefined,
      guestName: !memberId ? guestName : undefined,
      guestEmail: !memberId ? guestEmail : undefined,
      relationship,
      nickname,
      status: memberId ? 'accepted' : 'guest'
    });

    // If member has birthday, create birthday event
    if (memberId) {
      const member = await User.findById(memberId);
      if (member && member.birthday) {
        await Event.createBirthdayEvent(
          req.userId,
          circle._id,
          memberId,
          member.name,
          member.birthday
        );
      }
    }

    res.status(201).json({
      message: 'Contact added to circle',
      contact: circle
    });
  } catch (error) {
    console.error('Add to circle error:', error);
    res.status(500).json({
      error: 'Failed to add contact'
    });
  }
};

/**
 * Quick add from suggestions
 * POST /api/circles/quick-add/:userId
 */
exports.quickAdd = async (req, res) => {
  try {
    const { userId } = req.params;
    const { relationship } = req.body;

    // Check if already in circle
    const exists = await GiftCircle.exists(req.userId, userId);
    if (exists) {
      return res.status(400).json({
        error: 'Already in your circle'
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Add to circle
    const circle = await GiftCircle.create({
      owner: req.userId,
      member: userId,
      relationship: relationship || 'Friend',
      status: 'accepted'
    });

    // Create birthday event if available
    if (user.birthday) {
      await Event.createBirthdayEvent(
        req.userId,
        circle._id,
        userId,
        user.name,
        user.birthday
      );
    }

    // Dismiss suggestion
    await FriendSuggestion.dismiss(req.userId, userId);

    res.status(201).json({
      message: 'Contact added',
      contact: circle
    });
  } catch (error) {
    console.error('Quick add error:', error);
    res.status(500).json({
      error: 'Failed to add contact'
    });
  }
};

/**
 * Update contact
 * PUT /api/circles/:id
 */
exports.updateCircle = async (req, res) => {
  try {
    const circle = await GiftCircle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({
        error: 'Contact not found'
      });
    }

    if (!circle.owner.equals(req.userId)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    const { relationship, nickname, notes } = req.body;
    const updates = {};
    if (relationship !== undefined) updates.relationship = relationship;
    if (nickname !== undefined) updates.nickname = nickname;
    if (notes !== undefined) updates.notes = notes;

    const updated = await GiftCircle.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('member', 'name email profilePhoto avatarType');

    res.json({
      message: 'Contact updated',
      contact: updated
    });
  } catch (error) {
    console.error('Update circle error:', error);
    res.status(500).json({
      error: 'Failed to update contact'
    });
  }
};

/**
 * Remove contact from circle
 * DELETE /api/circles/:id
 */
exports.removeFromCircle = async (req, res) => {
  try {
    const circle = await GiftCircle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({
        error: 'Contact not found'
      });
    }

    if (!circle.owner.equals(req.userId)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    // Delete related events
    await Event.deleteMany({ circle: circle._id });

    // Delete the circle entry
    await GiftCircle.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Contact removed from circle'
    });
  } catch (error) {
    console.error('Remove from circle error:', error);
    res.status(500).json({
      error: 'Failed to remove contact'
    });
  }
};

/**
 * Get people you may know
 * GET /api/discover/people-you-may-know
 */
exports.getPeopleYouMayKnow = async (req, res) => {
  try {
    const suggestions = await FriendSuggestion.getSuggestions(req.userId);

    res.json({
      suggestions: suggestions.map(s => ({
        suggestionId: s._id,
        user: s.suggestedUser ? {
          id: s.suggestedUser._id,
          name: s.suggestedUser.name,
          photo: s.suggestedUser.profilePhoto,
          avatar: s.suggestedUser.avatarType
        } : null,
        mutualFriend: s.mutualFriend?.name || null,
        reason: s.connectionReason
      }))
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get suggestions'
    });
  }
};

/**
 * Dismiss suggestion
 * POST /api/discover/dismiss/:userId
 */
exports.dismissSuggestion = async (req, res) => {
  try {
    await FriendSuggestion.dismiss(req.userId, req.params.userId);

    res.json({
      message: 'Suggestion dismissed'
    });
  } catch (error) {
    console.error('Dismiss suggestion error:', error);
    res.status(500).json({
      error: 'Failed to dismiss suggestion'
    });
  }
};
