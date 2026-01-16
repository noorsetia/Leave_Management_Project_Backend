const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedAnswer: {
      type: Number,
      required: true,
    },
  }],
  score: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
  earnedPoints: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  timeTaken: {
    type: Number, // in seconds
  },
  startedAt: {
    type: Date,
    required: true,
  },
  submittedAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
quizAttemptSchema.index({ student: 1, quiz: 1 });
quizAttemptSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
