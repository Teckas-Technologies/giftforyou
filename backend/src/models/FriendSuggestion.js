const mongoose = require('mongoose');

const friendSuggestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  suggestedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mutualFriend: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  connectionReason: { type: String },
  isDismissed: { type: Boolean, default: false }
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
friendSuggestionSchema.index({ user: 1 });
friendSuggestionSchema.index({ user: 1, suggestedUser: 1 }, { unique: true });

// Static: Get suggestions for user
friendSuggestionSchema.statics.getSuggestions = async function(userId, limit = 10) {
  return this.find({ user: userId, isDismissed: false })
    .populate('suggestedUser', 'name profilePhoto avatarType')
    .populate('mutualFriend', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static: Dismiss suggestion
friendSuggestionSchema.statics.dismiss = async function(userId, suggestedUserId) {
  return this.updateOne(
    { user: userId, suggestedUser: suggestedUserId },
    { isDismissed: true }
  );
};

const FriendSuggestion = mongoose.model('FriendSuggestion', friendSuggestionSchema);

module.exports = FriendSuggestion;
