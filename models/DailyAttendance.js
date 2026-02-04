const mongoose = require('mongoose');

const dailyAttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: false
  },
  period: {
    type: String,
    required: false
  },
  remarks: {
    type: String,
    maxlength: 200
  },
  timeMarked: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance entry per student per day
dailyAttendanceSchema.index({ student: 1, date: 1, class: 1 }, { unique: true });

// Indexes for efficient queries
dailyAttendanceSchema.index({ teacher: 1, date: 1 });
dailyAttendanceSchema.index({ student: 1, date: 1 });
dailyAttendanceSchema.index({ class: 1, date: 1 });

module.exports = mongoose.model('DailyAttendance', dailyAttendanceSchema);
