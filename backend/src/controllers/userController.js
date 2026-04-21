const User = require('../models/User');

/**
 * Update user profile
 * PUT /api/users/me
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, birthday, avatarType, showBirthYear } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (birthday !== undefined) updates.birthday = birthday;
    if (avatarType !== undefined) updates.avatarType = avatarType;
    if (showBirthYear !== undefined) updates.showBirthYear = showBirthYear;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
};

/**
 * Upload profile photo
 * POST /api/users/me/photo
 */
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // In production, upload to S3/Firebase and get URL
    // For now, store local path
    const photoUrl = `/uploads/${req.file.filename}`;

    await User.findByIdAndUpdate(req.userId, { profilePhoto: photoUrl });

    res.json({
      message: 'Photo uploaded',
      photoUrl
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      error: 'Failed to upload photo'
    });
  }
};

/**
 * Mark onboarding as seen
 * PUT /api/users/me/onboarding-seen
 */
exports.markOnboardingSeen = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { onboardingSeen: true });

    res.json({
      message: 'Onboarding marked as seen'
    });
  } catch (error) {
    console.error('Mark onboarding error:', error);
    res.status(500).json({
      error: 'Failed to update onboarding status'
    });
  }
};

/**
 * Update settings
 * PUT /api/users/me/settings
 */
exports.updateSettings = async (req, res) => {
  try {
    const { showBirthYear, pushToken } = req.body;

    const updates = {};
    if (showBirthYear !== undefined) updates.showBirthYear = showBirthYear;
    if (pushToken !== undefined) updates.pushToken = pushToken;

    await User.findByIdAndUpdate(req.userId, { $set: updates });

    res.json({
      message: 'Settings updated'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      error: 'Failed to update settings'
    });
  }
};

/**
 * Delete account
 * DELETE /api/users/me
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        error: 'Please confirm deletion by typing DELETE'
      });
    }

    // Delete user and related data
    const GiftCircle = require('../models/GiftCircle');
    const Event = require('../models/Event');
    const Invitation = require('../models/Invitation');
    const Notification = require('../models/Notification');
    const Questionnaire = require('../models/Questionnaire');

    await Promise.all([
      GiftCircle.deleteMany({ owner: req.userId }),
      Event.deleteMany({ user: req.userId }),
      Invitation.deleteMany({ inviter: req.userId }),
      Notification.deleteMany({ user: req.userId }),
      Questionnaire.deleteOne({ user: req.userId }),
      User.findByIdAndDelete(req.userId)
    ]);

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Failed to delete account'
    });
  }
};

/**
 * Get dashboard stats
 * GET /api/dashboard/stats
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await User.getStats(req.userId);

    res.json({
      upcomingEventsCount: stats.upcoming_events_count,
      contactsCount: stats.contacts_count,
      giftsGivenCount: stats.gifts_given_count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get stats'
    });
  }
};

/**
 * Get anniversaries
 * GET /api/anniversaries
 */
exports.getAnniversaries = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('anniversaries');

    res.json({
      anniversaries: user?.anniversaries || []
    });
  } catch (error) {
    console.error('Get anniversaries error:', error);
    res.status(500).json({
      error: 'Failed to get anniversaries'
    });
  }
};

/**
 * Add anniversary
 * POST /api/anniversaries
 */
exports.addAnniversary = async (req, res) => {
  try {
    const { date, title } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check limit (max 3)
    if (user.anniversaries && user.anniversaries.length >= 3) {
      return res.status(400).json({
        error: 'Maximum 3 anniversaries allowed'
      });
    }

    user.anniversaries.push({ date, title });
    await user.save();

    const newAnniversary = user.anniversaries[user.anniversaries.length - 1];

    res.status(201).json({
      anniversary: newAnniversary
    });
  } catch (error) {
    console.error('Add anniversary error:', error);
    res.status(500).json({
      error: 'Failed to add anniversary'
    });
  }
};

/**
 * Delete anniversary
 * DELETE /api/anniversaries/:id
 */
exports.deleteAnniversary = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.userId,
      { $pull: { anniversaries: { _id: req.params.id } } }
    );

    res.json({
      message: 'Anniversary deleted'
    });
  } catch (error) {
    console.error('Delete anniversary error:', error);
    res.status(500).json({
      error: 'Failed to delete anniversary'
    });
  }
};
