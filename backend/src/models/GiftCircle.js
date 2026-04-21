const mongoose = require('mongoose');

const giftCircleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // For guest users (no account)
  guestName: { type: String },
  guestEmail: { type: String, lowercase: true },

  // Relationship
  relationship: { type: String, enum: ['Family', 'Friend', 'Colleague', 'Partner', 'Other'] },
  nickname: { type: String },
  notes: { type: String },

  // Status
  status: { type: String, enum: ['pending', 'accepted', 'guest'], default: 'pending' },

  // Auto-add settings
  autoAdded: { type: Boolean, default: false }

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

// Compound indexes
giftCircleSchema.index({ owner: 1, member: 1 }, { unique: true, sparse: true });
giftCircleSchema.index({ owner: 1, guestEmail: 1 }, { unique: true, sparse: true });
giftCircleSchema.index({ owner: 1 });
giftCircleSchema.index({ member: 1 });
giftCircleSchema.index({ status: 1 });

// Static: Find by owner with populated member
giftCircleSchema.statics.findByOwner = async function(ownerId, options = {}) {
  const { search, relationship, status } = options;

  let query = this.find({ owner: ownerId });

  if (relationship) {
    query = query.where('relationship').equals(relationship);
  }

  if (status) {
    query = query.where('status').equals(status);
  }

  const circles = await query
    .populate('member', 'name email profilePhoto avatarType birthday questionnaireCompleted')
    .sort({ createdAt: -1 });

  let results = circles.map(circle => {
    const obj = circle.toJSON();
    return {
      id: obj.id,
      relationship: obj.relationship,
      nickname: obj.nickname,
      notes: obj.notes,
      status: obj.status,
      autoAdded: obj.autoAdded,
      createdAt: obj.createdAt,
      member: obj.member ? {
        id: obj.member._id || obj.member.id,
        name: obj.member.name,
        email: obj.member.email,
        photo: obj.member.profilePhoto,
        avatar: obj.member.avatarType,
        birthday: obj.member.birthday,
        questionnaireCompleted: obj.member.questionnaireCompleted
      } : {
        name: obj.guestName,
        email: obj.guestEmail,
        isGuest: true
      }
    };
  });

  // Filter by search if provided
  if (search) {
    const searchLower = search.toLowerCase();
    results = results.filter(r =>
      r.member.name?.toLowerCase().includes(searchLower) ||
      r.nickname?.toLowerCase().includes(searchLower)
    );
  }

  return results;
};

// Static: Check if exists
giftCircleSchema.statics.exists = async function(ownerId, memberId = null, guestEmail = null) {
  if (memberId) {
    const count = await this.countDocuments({ owner: ownerId, member: memberId });
    return count > 0;
  }
  if (guestEmail) {
    const count = await this.countDocuments({ owner: ownerId, guestEmail: guestEmail.toLowerCase() });
    return count > 0;
  }
  return false;
};

// Static: Get grouped by relationship
giftCircleSchema.statics.getGroupedByRelationship = async function(ownerId) {
  const contacts = await this.findByOwner(ownerId);

  const grouped = {
    Family: [],
    Friend: [],
    Colleague: [],
    Partner: [],
    Other: []
  };

  for (const contact of contacts) {
    const rel = contact.relationship || 'Other';
    if (grouped[rel]) {
      grouped[rel].push(contact);
    } else {
      grouped.Other.push(contact);
    }
  }

  return grouped;
};

// Static: Get count
giftCircleSchema.statics.getCount = async function(ownerId) {
  return this.countDocuments({ owner: ownerId });
};

// Static: Link guest to user
giftCircleSchema.statics.linkGuestToUser = async function(guestEmail, userId) {
  return this.updateMany(
    { guestEmail: guestEmail.toLowerCase(), member: null },
    {
      member: userId,
      guestName: null,
      guestEmail: null,
      status: 'accepted'
    }
  );
};

const GiftCircle = mongoose.model('GiftCircle', giftCircleSchema);

module.exports = GiftCircle;
