const mongoose = require('mongoose');

const wishlistLinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String },
  linkType: { type: String }
}, { _id: true, timestamps: true });

const registrySchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String },
  registryType: { type: String, enum: ['wedding', 'baby', 'birthday', 'other'] },
  details: { type: String },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, { _id: true, timestamps: true });

const questionnaireSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // B. Lifestyle & Activities (Q6-7)
  favoriteActivities: [{ type: String }],
  activityDetails: { type: String },

  // C. Personal Style (Q8-11)
  personalStyle: { type: String },
  personalStyleOther: { type: String },
  favoriteColors: [{ type: String }],
  favoriteColorsOther: { type: String },
  likesSurprises: { type: String },

  // D. Values & Causes (Q12-13)
  causesValues: [{ type: String }],
  causesOther: { type: String },

  // E. Flowers (Q14-15)
  favoriteFlower: { type: String },
  flowerDetails: { type: String },

  // F. Food & Dining (Q16-21)
  favoriteCuisines: [{ type: String }],
  favoriteRestaurant: { type: String },
  cuisineOther: { type: String },
  favoriteMeal: { type: String },
  favoriteDesserts: [{ type: String }],
  dessertDetails: { type: String },

  // G. Gift Preferences (Q22-23)
  giftTypes: [{ type: String }],
  giftDetails: { type: String },

  // H. Entertainment (Q24-27)
  movieGenre: { type: String },
  favoriteMovies: { type: String },
  musicGenre: { type: String },
  favoriteArtists: { type: String },

  // I. Wishlist (Q28, Q33)
  wishlistText: { type: String },
  clothingSizes: { type: String },

  // Wishlist Links (up to 3)
  wishlistLinks: {
    type: [wishlistLinkSchema],
    validate: [arr => arr.length <= 3, 'Maximum 3 wishlist links allowed']
  },

  // Registries
  registries: [registrySchema]

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

// Index
questionnaireSchema.index({ user: 1 });

// Static: Find by user
questionnaireSchema.statics.findByUserId = function(userId) {
  return this.findOne({ user: userId });
};

// Static: Upsert questionnaire
questionnaireSchema.statics.upsert = async function(userId, data) {
  let questionnaire = await this.findOne({ user: userId });

  if (!questionnaire) {
    questionnaire = new this({ user: userId });
  }

  // Update fields
  const allowedFields = [
    'favoriteActivities', 'activityDetails',
    'personalStyle', 'personalStyleOther',
    'favoriteColors', 'favoriteColorsOther', 'likesSurprises',
    'causesValues', 'causesOther',
    'favoriteFlower', 'flowerDetails',
    'favoriteCuisines', 'favoriteRestaurant', 'cuisineOther',
    'favoriteMeal', 'favoriteDesserts', 'dessertDetails',
    'giftTypes', 'giftDetails',
    'movieGenre', 'favoriteMovies',
    'musicGenre', 'favoriteArtists',
    'wishlistText', 'clothingSizes'
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      questionnaire[field] = data[field];
    }
  }

  await questionnaire.save();

  // Update completion percentage
  await this.updateCompletionPercent(userId);

  return questionnaire;
};

// Static: Calculate completion percentage
questionnaireSchema.statics.updateCompletionPercent = async function(userId) {
  const questionnaire = await this.findOne({ user: userId });
  const User = mongoose.model('User');

  if (!questionnaire) {
    await User.findByIdAndUpdate(userId, {
      questionnaireCompletionPercent: 0,
      questionnaireCompleted: false
    });
    return 0;
  }

  const sections = {
    lifestyle: ['favoriteActivities'],
    style: ['personalStyle', 'favoriteColors', 'likesSurprises'],
    values: ['causesValues'],
    flowers: ['favoriteFlower'],
    food: ['favoriteCuisines'],
    gifts: ['giftTypes'],
    entertainment: ['musicGenre'],
    wishlist: ['wishlistText']
  };

  let completedSections = 0;
  const totalSections = Object.keys(sections).length;

  for (const requiredFields of Object.values(sections)) {
    const isComplete = requiredFields.every(field => {
      const value = questionnaire[field];
      if (Array.isArray(value)) return value.length > 0;
      return value && value.toString().trim().length > 0;
    });
    if (isComplete) completedSections++;
  }

  const percent = Math.round((completedSections / totalSections) * 100);

  await User.findByIdAndUpdate(userId, {
    questionnaireCompletionPercent: percent,
    questionnaireCompleted: percent === 100
  });

  return percent;
};

// Static: Get completion status
questionnaireSchema.statics.getCompletionStatus = async function(userId) {
  const questionnaire = await this.findOne({ user: userId });
  const User = mongoose.model('User');
  const user = await User.findById(userId);

  const sections = {
    basic_info: { completed: !!(user?.name && user?.birthday), fields: [] },
    lifestyle: { completed: false, fields: ['favoriteActivities'] },
    style: { completed: false, fields: ['personalStyle', 'favoriteColors', 'likesSurprises'] },
    values: { completed: false, fields: ['causesValues'] },
    flowers: { completed: false, fields: ['favoriteFlower'] },
    food: { completed: false, fields: ['favoriteCuisines'] },
    gifts: { completed: false, fields: ['giftTypes'] },
    entertainment: { completed: false, fields: ['musicGenre'] },
    wishlist: { completed: false, fields: ['wishlistText'] }
  };

  if (questionnaire) {
    for (const [sectionName, section] of Object.entries(sections)) {
      if (sectionName === 'basic_info') continue;

      section.completed = section.fields.every(field => {
        const value = questionnaire[field];
        if (Array.isArray(value)) return value.length > 0;
        return value && value.toString().trim().length > 0;
      });
    }
  }

  return sections;
};

// Static: Get formatted preferences
questionnaireSchema.statics.getFormattedPreferences = async function(userId) {
  const questionnaire = await this.findOne({ user: userId });
  if (!questionnaire) return null;

  return questionnaire.toJSON();
};

const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);

module.exports = Questionnaire;
