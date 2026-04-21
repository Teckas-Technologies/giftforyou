const mongoose = require('mongoose');

const anniversarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true }
}, { _id: true });

const userSchema = new mongoose.Schema({
  // External Auth
  externalId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true },

  // Profile Info
  name: { type: String },
  profilePhoto: { type: String },
  avatarType: { type: String, enum: ['turtle', 'pig', 'cow', 'flowers', null] },
  birthday: { type: Date },
  showBirthYear: { type: Boolean, default: false },

  // Anniversaries (up to 3)
  anniversaries: {
    type: [anniversarySchema],
    validate: [arr => arr.length <= 3, 'Maximum 3 anniversaries allowed']
  },

  // App Status
  questionnaireCompleted: { type: Boolean, default: false },
  questionnaireCompletionPercent: { type: Number, default: 0, min: 0, max: 100 },
  onboardingSeen: { type: Boolean, default: false },
  pushToken: { type: String },

  // Timestamps
  lastLoginAt: { type: Date }
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
userSchema.index({ email: 1 });
userSchema.index({ externalId: 1 });

// Static Methods
userSchema.statics.findByExternalId = function(externalId) {
  return this.findOne({ externalId });
};

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.createFromExternalAuth = async function({ externalId, email, name, photo = null }) {
  const user = new this({
    externalId,
    email: email.toLowerCase(),
    name,
    profilePhoto: photo
  });
  return user.save();
};

userSchema.statics.getStats = async function(userId) {
  const GiftCircle = mongoose.model('GiftCircle');
  const Event = mongoose.model('Event');
  const Invitation = mongoose.model('Invitation');

  const [contactsCount, upcomingEventsCount, giftsGivenCount] = await Promise.all([
    GiftCircle.countDocuments({ owner: userId }),
    Event.countDocuments({ user: userId, eventDate: { $gte: new Date() } }),
    Invitation.countDocuments({ inviter: userId, status: 'completed' })
  ]);

  return {
    contacts_count: contactsCount,
    upcoming_events_count: upcomingEventsCount,
    gifts_given_count: giftsGivenCount
  };
};

// Instance Methods
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
