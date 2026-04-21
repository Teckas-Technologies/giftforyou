const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');

const invitationSchema = new mongoose.Schema({
  inviter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Invitation Details
  token: { type: String, unique: true, required: true },
  inviteeName: { type: String },
  inviteeEmail: { type: String, required: true, lowercase: true },
  personalMessage: { type: String },
  relationship: { type: String },

  // Status
  status: {
    type: String,
    enum: ['pending', 'opened', 'completed', 'expired'],
    default: 'pending'
  },
  sentCount: { type: Number, default: 1 },

  // Dates
  sentAt: { type: Date, default: Date.now },
  openedAt: { type: Date },
  completedAt: { type: Date },
  expiresAt: { type: Date, required: true },
  lastResentAt: { type: Date }

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
invitationSchema.index({ token: 1 });
invitationSchema.index({ inviter: 1 });
invitationSchema.index({ inviteeEmail: 1 });
invitationSchema.index({ status: 1 });

// Static: Generate token
invitationSchema.statics.generateToken = function() {
  return uuidv4().replace(/-/g, '').substring(0, 20);
};

// Static: Find by token
invitationSchema.statics.findByToken = async function(token) {
  return this.findOne({ token }).populate('inviter', 'name email profilePhoto');
};

// Static: Find by inviter
invitationSchema.statics.findByInviter = async function(inviterId, status = null) {
  let query = this.find({ inviter: inviterId });

  if (status) {
    query = query.where('status').equals(status);
  }

  return query.sort({ createdAt: -1 });
};

// Static: Check if exists for email
invitationSchema.statics.existsForEmail = async function(inviterId, email) {
  const count = await this.countDocuments({
    inviter: inviterId,
    inviteeEmail: email.toLowerCase(),
    status: { $ne: 'expired' }
  });
  return count > 0;
};

// Static: Create invitation
invitationSchema.statics.createInvitation = async function({
  inviterId,
  inviteeName,
  inviteeEmail,
  personalMessage,
  relationship
}) {
  const invitation = new this({
    inviter: inviterId,
    token: this.generateToken(),
    inviteeName,
    inviteeEmail: inviteeEmail.toLowerCase(),
    personalMessage,
    relationship,
    expiresAt: dayjs().add(30, 'day').toDate()
  });

  return invitation.save();
};

// Static: Mark as opened
invitationSchema.statics.markOpened = async function(token) {
  return this.findOneAndUpdate(
    { token, status: 'pending' },
    { status: 'opened', openedAt: new Date() },
    { new: true }
  );
};

// Static: Mark as completed
invitationSchema.statics.markCompleted = async function(token) {
  return this.findOneAndUpdate(
    { token },
    { status: 'completed', completedAt: new Date() },
    { new: true }
  );
};

// Static: Resend invitation
invitationSchema.statics.resend = async function(id) {
  return this.findByIdAndUpdate(
    id,
    {
      $inc: { sentCount: 1 },
      lastResentAt: new Date(),
      status: 'pending',
      expiresAt: dayjs().add(30, 'day').toDate()
    },
    { new: true }
  );
};

// Static: Expire old invitations
invitationSchema.statics.expireOld = async function() {
  const result = await this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      status: { $nin: ['completed', 'expired'] }
    },
    { status: 'expired' }
  );
  return result.modifiedCount;
};

// Static: Validate token
invitationSchema.statics.validateToken = async function(token) {
  const invitation = await this.findByToken(token);

  if (!invitation) {
    return { valid: false, error: 'Invitation not found' };
  }

  if (invitation.status === 'expired') {
    return { valid: false, error: 'Invitation has expired' };
  }

  if (invitation.status === 'completed') {
    return { valid: false, error: 'Invitation already completed' };
  }

  if (dayjs(invitation.expiresAt).isBefore(dayjs())) {
    invitation.status = 'expired';
    await invitation.save();
    return { valid: false, error: 'Invitation has expired' };
  }

  return {
    valid: true,
    invitation: {
      inviterName: invitation.inviter.name,
      inviteeName: invitation.inviteeName,
      inviteeEmail: invitation.inviteeEmail,
      expiresAt: invitation.expiresAt
    }
  };
};

// Static: Get stats
invitationSchema.statics.getStats = async function(inviterId) {
  const stats = await this.aggregate([
    { $match: { inviter: new mongoose.Types.ObjectId(inviterId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        opened: { $sum: { $cond: [{ $eq: ['$status', 'opened'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || { total: 0, pending: 0, opened: 0, completed: 0, expired: 0 };
};

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;
