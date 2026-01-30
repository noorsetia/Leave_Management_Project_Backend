const express = require('express');
const router = express.Router();
const {
  getAllQuizzes,
  getQuiz,
  submitQuiz,
  getMyAttempts,
  getQuizResults,
  createQuiz,
  getAllQuizzesForTeacher,
  updateQuiz,
  deleteQuiz,
  executeCode,
  runTestCases,
  generateQuestions,
  evaluateCode,
  generateCodingQuestionAI,
  getHints,
  explainCodeAI,
} = require('../controllers/quizController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Student routes
router.get('/', restrictTo('student'), getAllQuizzes);
router.get('/my-attempts', restrictTo('student'), getMyAttempts);
router.get('/:id', restrictTo('student'), getQuiz);
router.post('/:id/submit', restrictTo('student'), submitQuiz);
router.get('/:id/results', restrictTo('student'), getQuizResults);

// Coding execution routes (students only)
router.post('/execute-code', restrictTo('student'), executeCode);
router.post('/run-tests', restrictTo('student'), runTestCases);

// Gemini AI routes (students)
router.post('/evaluate-code', restrictTo('student'), evaluateCode);
router.post('/get-hints', restrictTo('student'), getHints);
router.post('/explain-code', restrictTo('student'), explainCodeAI);

// Teacher routes
router.post('/create', restrictTo('teacher'), createQuiz);
router.get('/teacher/all', restrictTo('teacher'), getAllQuizzesForTeacher);
router.put('/:id', restrictTo('teacher'), updateQuiz);
router.delete('/:id', restrictTo('teacher'), deleteQuiz);

// Gemini AI routes (teachers only)
router.post('/generate-questions', restrictTo('teacher'), generateQuestions);
router.post('/generate-coding-question', restrictTo('teacher'), generateCodingQuestionAI);

module.exports = router;
