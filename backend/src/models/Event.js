const mongoose = require('mongoose');
const dayjs = require('dayjs');

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  circle: { type: mongoose.Schema.Types.ObjectId, ref: 'GiftCircle' },
  registry: { type: mongoose.Schema.Types.ObjectId, ref: 'Questionnaire' },

  // Event Info
  eventType: {
    type: String,
    required: true,
    enum: ['birthday', 'anniversary', 'holiday', 'custom']
  },
  title: { type: String, required: true },
  description: { type: String },
  eventDate: { type: Date, required: true },
  isRecurring: { type: Boolean, default: true },

  // Reminder Settings
  reminderDays: { type: [Number], default: [7, 1] },
  reminderEnabled: { type: Boolean, default: true }

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
eventSchema.index({ user: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ user: 1, eventDate: 1 });

// Virtual: days until event
eventSchema.virtual('daysUntil').get(function() {
  return dayjs(this.eventDate).diff(dayjs(), 'day');
});

// Static: Find by user
eventSchema.statics.findByUser = async function(userId, options = {}) {
  const { month, year, upcoming, limit } = options;

  let query = this.find({ user: userId });

  if (month !== undefined && year !== undefined) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    query = query.where('eventDate').gte(startDate).lte(endDate);
  }

  if (upcoming) {
    query = query.where('eventDate').gte(new Date());
  }

  query = query.sort({ eventDate: 1 });

  if (limit) {
    query = query.limit(limit);
  }

  const events = await query
    .populate('contact', 'name profilePhoto avatarType')
    .populate('circle', 'nickname guestName');

  return events.map(event => {
    const obj = event.toJSON();
    return {
      ...obj,
      contact: obj.contact ? {
        id: obj.contact._id || obj.contact.id,
        name: obj.contact.name || obj.circle?.nickname || obj.circle?.guestName,
        photo: obj.contact.profilePhoto,
        avatar: obj.contact.avatarType
      } : null,
      daysUntil: dayjs(obj.eventDate).diff(dayjs(), 'day')
    };
  });
};

// Static: Get upcoming events
eventSchema.statics.getUpcoming = async function(userId, limit = 5) {
  return this.findByUser(userId, { upcoming: true, limit });
};

// Static: Get events for specific date
eventSchema.statics.findByDate = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    user: userId,
    eventDate: { $gte: startOfDay, $lte: endOfDay }
  })
    .populate('contact', 'name profilePhoto')
    .sort({ title: 1 });
};

// Static: Get events needing reminders
eventSchema.statics.getEventsForReminders = async function() {
  const today = dayjs().startOf('day');

  return this.aggregate([
    {
      $match: {
        reminderEnabled: true,
        eventDate: { $gte: today.toDate() }
      }
    },
    {
      $addFields: {
        daysUntil: {
          $divide: [
            { $subtract: ['$eventDate', today.toDate()] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $match: {
        $expr: { $in: [{ $floor: '$daysUntil' }, '$reminderDays'] }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' }
  ]);
};

// Static: Get event dates for calendar
eventSchema.statics.getEventDates = async function(userId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const events = await this.find({
    user: userId,
    eventDate: { $gte: startDate, $lte: endDate }
  }).select('eventDate eventType');

  return events.map(e => ({
    day: new Date(e.eventDate).getDate(),
    eventType: e.eventType
  }));
};

// Static: Create birthday event
eventSchema.statics.createBirthdayEvent = async function(userId, circleId, contactId, contactName, birthday) {
  const today = dayjs();
  let nextBirthday = dayjs(birthday).year(today.year());
  if (nextBirthday.isBefore(today)) {
    nextBirthday = nextBirthday.add(1, 'year');
  }

  const event = new this({
    user: userId,
    contact: contactId,
    circle: circleId,
    eventType: 'birthday',
    title: `${contactName}'s Birthday`,
    eventDate: nextBirthday.toDate(),
    isRecurring: true,
    reminderDays: [7, 3, 1]
  });

  return event.save();
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
