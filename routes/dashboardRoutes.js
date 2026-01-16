const express = require('express');
const router = express.Router();
const { getTeacherStats, getStudentStats } = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// @route   GET /api/dashboard/teacher-stats
// @desc    Get teacher dashboard statistics
// @access  Private (Teacher only)
router.get('/teacher-stats', restrictTo('teacher'), getTeacherStats);

// @route   GET /api/dashboard/student-stats
// @desc    Get student dashboard statistics
// @access  Private (Student only)
router.get('/student-stats', restrictTo('student'), getStudentStats);

module.exports = router;
