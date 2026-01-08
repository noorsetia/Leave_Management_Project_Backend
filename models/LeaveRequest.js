const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for leave'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'approved', 'rejected'],
    default: 'pending',
  },
  // Quiz Test Results
  quizScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  quizPassed: {
    type: Boolean,
    default: false,
  },
  quizAttempted: {
    type: Boolean,
    default: false,
  },
  // Coding Test Results
  codingScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  codingPassed: {
    type: Boolean,
    default: false,
  },
  codingAttempted: {
    type: Boolean,
    default: false,
  },
  // Attendance
  attendancePercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  attendanceEligible: {
    type: Boolean,
    default: false,
  },
  // Teacher Review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  teacherRemarks: {
    type: String,
    trim: true,
  },
  reviewedAt: {
    type: Date,
  },
  // AI Generated Report
  aiReport: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
leaveRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if all tests are passed
leaveRequestSchema.methods.areTestsPassed = function() {
  return this.quizPassed && this.codingPassed && this.attendanceEligible;
};

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
