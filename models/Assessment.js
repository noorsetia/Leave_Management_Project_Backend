const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  leaveRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveRequest',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Quiz Questions and Answers
  quizQuestions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    studentAnswer: Number,
    isCorrect: Boolean,
  }],
  quizScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  quizPassingScore: {
    type: Number,
    default: 60,
  },
  quizSubmittedAt: {
    type: Date,
  },
  // Coding Test
  codingProblem: {
    title: String,
    description: String,
    testCases: [{
      input: String,
      expectedOutput: String,
    }],
  },
  codingSubmission: {
    code: String,
    language: String,
    submittedAt: Date,
  },
  codingScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  codingPassingScore: {
    type: Number,
    default: 50,
  },
  codingTestResults: [{
    testCase: Number,
    passed: Boolean,
    output: String,
  }],
  // Overall Assessment
  passed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate if assessment is passed
assessmentSchema.methods.calculatePassed = function() {
  const quizPassed = this.quizScore >= this.quizPassingScore;
  const codingPassed = this.codingScore >= this.codingPassingScore;
  this.passed = quizPassed && codingPassed;
  return this.passed;
};

module.exports = mongoose.model('Assessment', assessmentSchema);
