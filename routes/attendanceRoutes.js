const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getClassAttendance,
  getStudentsForAttendance,
  getStudentAttendance,
  getAttendanceSummary,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Mark attendance (Teacher only)
router.post('/mark', protect, restrictTo('teacher'), markAttendance);

// Get students for attendance marking (Teacher only)
router.get('/students', protect, restrictTo('teacher'), getStudentsForAttendance);

// Get class attendance for a specific date (Teacher only)
router.get('/class', protect, restrictTo('teacher'), getClassAttendance);

// Get attendance summary (Teacher only)
router.get('/summary', protect, restrictTo('teacher'), getAttendanceSummary);

// Get student attendance report
router.get('/student/:studentId', protect, getStudentAttendance);

// Update attendance record (Teacher only)
router.put('/:id', protect, restrictTo('teacher'), updateAttendance);

// Delete attendance record (Teacher only)
router.delete('/:id', protect, restrictTo('teacher'), deleteAttendance);

module.exports = router;
