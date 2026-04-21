const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Notification Content
  type: {
    type: String,
    required: true,
    enum: [
      'event_reminder',
      'invitation_accepted',
      'invitation_received',
      'circle_added',
      'questionnaire_reminder',
      'preference_updated',
      'profile_incomplete',
      'new_friend',
      'milestone'
    ]
  },
  title: { type: String, required: true },
  body: { type: String },

  // Related Data
  relatedType: { type: String },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  data: { type: mongoose.Schema.Types.Mixed },

  // Status
  isRead: { type: Boolean, default: false },
  isPushed: { type: Boolean, default: false }

}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
notificationSchema.index({ user: 1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Static: Find by user with pagination
notificationSchema.statics.findByUser = async function(userId, options = {}) {
  const { page = 1, limit = 20, unreadOnly = false } = options;
  const skip = (page - 1) * limit;

  let query = this.find({ user: userId });

  if (unreadOnly) {
    query = query.where('isRead').equals(false);
  }

  const [notifications, total] = await Promise.all([
    query.sort({ createdAt: -1 }).skip(skip).limit(limit),
    this.countDocuments(unreadOnly ? { user: userId, isRead: false } : { user: userId })
  ]);

  return {
    notifications,
    total,
    page,
    limit
  };
};

// Static: Get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ user: userId, isRead: false });
};

// Static: Mark as read
notificationSchema.statics.markRead = async function(id, userId) {
  return this.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { new: true }
  );
};

// Static: Mark all as read
notificationSchema.statics.markAllRead = async function(userId) {
  const result = await this.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
  return result.modifiedCount;
};

// Static: Delete old notifications
notificationSchema.statics.deleteOld = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({ createdAt: { $lt: cutoffDate } });
  return result.deletedCount;
};

// Static: Get unpushed notifications
notificationSchema.statics.getUnpushed = async function() {
  return this.aggregate([
    { $match: { isPushed: false } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    { $match: { 'userInfo.pushToken': { $ne: null } } },
    { $limit: 100 }
  ]);
};

// Static: Mark as pushed
notificationSchema.statics.markPushed = async function(id) {
  return this.findByIdAndUpdate(id, { isPushed: true });
};

// ═══════════════════════════════════════════════════════════════
// Notification Type Helpers
// ═══════════════════════════════════════════════════════════════

notificationSchema.statics.createEventReminder = async function(userId, event, daysUntil) {
  return this.create({
    user: userId,
    type: 'event_reminder',
    title: `${event.title} in ${daysUntil} day${daysUntil > 1 ? 's' : ''}!`,
    body: 'Start planning the perfect gift',
    relatedType: 'event',
    relatedId: event._id || event.id
  });
};

notificationSchema.statics.createInvitationAccepted = async function(userId, inviteeName, circleId) {
  return this.create({
    user: userId,
    type: 'invitation_accepted',
    title: `${inviteeName} accepted your invitation!`,
    body: 'View their gift preferences now',
    relatedType: 'circle',
    relatedId: circleId,
    data: { inviteeName }
  });
};

notificationSchema.statics.createProfileIncomplete = async function(userId, section) {
  return this.create({
    user: userId,
    type: 'profile_incomplete',
    title: 'Complete your profile',
    body: `Add your ${section} preferences to help friends find perfect gifts`,
    relatedType: 'questionnaire'
  });
};

notificationSchema.statics.createNewFriend = async function(userId, friendName, friendId) {
  return this.create({
    user: userId,
    type: 'new_friend',
    title: `${friendName} joined GiftBox!`,
    body: 'Add them to your gift circle',
    relatedType: 'user',
    relatedId: friendId
  });
};

notificationSchema.statics.createCircleAdded = async function(userId, adderName, adderId) {
  return this.create({
    user: userId,
    type: 'circle_added',
    title: `${adderName} added you to their Gift Circle`,
    body: 'You can now see their gift preferences',
    relatedType: 'user',
    relatedId: adderId
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
