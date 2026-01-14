const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['Sick Leave', 'Personal Leave', 'Family Emergency', 'Medical Leave', 'Other'],
    required: [true, 'Please select a leave type'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for your leave'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  reason: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  numberOfDays: {
    type: Number,
    min: 1,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
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

// Calculate number of days and update timestamp before saving
leaveRequestSchema.pre('save', function() {
  // Calculate number of days between start and end date
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const timeDiff = end.getTime() - start.getTime();
    this.numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end day
  }
  
  this.updatedAt = Date.now();
});

// Check if all tests are passed
leaveRequestSchema.methods.areTestsPassed = function() {
  return this.quizPassed && this.codingPassed && this.attendanceEligible;
};

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
