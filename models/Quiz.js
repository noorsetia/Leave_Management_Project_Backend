const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  // Question type: 'mcq' or 'coding'
  type: {
    type: String,
    enum: ['mcq', 'coding'],
    default: 'mcq',
  },
  // Options are only applicable for MCQ questions
  options: [{
    type: String,
  }],
  // For MCQ: index of correctAnswer; for coding questions this can be omitted
  correctAnswer: {
    type: Number,
    min: 0,
  },
  // For coding questions you may include starter code or tests
  starterCode: {
    type: String,
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
  class: {
    type: String,
    enum: [
      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
      'BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year',
      'MCA 1st Year', 'MCA 2nd Year',
      'BTech 1st Year', 'BTech 2nd Year', 'BTech 3rd Year', 'BTech 4th Year'
    ],
  },
  subject: {
    type: String,
    enum: [
      'Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 
      'Physics', 'Chemistry', 'Biology', 'Programming',
      'Data Structures', 'Database Management', 'Operating Systems', 'Computer Networks',
      'Web Development', 'Software Engineering', 'Object Oriented Programming',
      'Java Programming', 'Python Programming', 'C Programming', 'C++ Programming'
    ],
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
