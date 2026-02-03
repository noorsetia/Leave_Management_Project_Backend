const mongoose = require('mongoose');

const attendanceSheetSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attendanceRecords: [{
    date: {
      type: Date,
      required: true
    },
    records: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['present', 'absent', 'late', 'excused'],
        default: 'absent'
      },
      remarks: {
        type: String,
        default: ''
      },
      markedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
attendanceSheetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
attendanceSheetSchema.index({ teacher: 1, class: 1, subject: 1 });
attendanceSheetSchema.index({ students: 1 });
attendanceSheetSchema.index({ 'attendanceRecords.date': 1 });

module.exports = mongoose.model('AttendanceSheet', attendanceSheetSchema);
