const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalClasses: {
    type: Number,
    default: 0,
    min: 0,
  },
  attendedClasses: {
    type: Number,
    default: 0,
    min: 0,
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  minimumRequired: {
    type: Number,
    default: 75,
  },
  isEligible: {
    type: Boolean,
    default: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Calculate attendance percentage before saving
attendanceSchema.pre('save', function() {
  if (this.totalClasses > 0) {
    this.attendancePercentage = Math.round((this.attendedClasses / this.totalClasses) * 100);
    this.isEligible = this.attendancePercentage >= this.minimumRequired;
  } else {
    this.attendancePercentage = 0;
    this.isEligible = false;
  }
  this.lastUpdated = Date.now();
});

// Method to add attendance
attendanceSchema.methods.markAttendance = async function(attended = true) {
  this.totalClasses += 1;
  if (attended) {
    this.attendedClasses += 1;
  }
  return await this.save();
};

module.exports = mongoose.model('Attendance', attendanceSchema);
