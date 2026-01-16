const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
  },
  points: {
    type: Number,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['JavaScript', 'React', 'Node.js', 'Database', 'General', 'Python', 'DSA'],
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  questions: [quizQuestionSchema],
  duration: {
    type: Number, // in minutes
    default: 30,
  },
  passingScore: {
    type: Number,
    default: 60, // percentage
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, q) => sum + q.points, 0);
});

module.exports = mongoose.model('Quiz', quizSchema);
