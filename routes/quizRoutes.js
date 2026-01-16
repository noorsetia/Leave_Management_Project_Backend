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

// Teacher routes
router.post('/create', restrictTo('teacher'), createQuiz);
router.get('/teacher/all', restrictTo('teacher'), getAllQuizzesForTeacher);
router.put('/:id', restrictTo('teacher'), updateQuiz);
router.delete('/:id', restrictTo('teacher'), deleteQuiz);

module.exports = router;
