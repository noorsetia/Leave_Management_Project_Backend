const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  getLeaveRequest,
  updateLeaveStatus,
  deleteLeaveRequest,
  getLeaveStats
} = require('../controllers/leaveController');
const { protect, isStudent, isTeacher } = require('../middleware/authMiddleware');

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Student routes
router.post('/', protect, isStudent, asyncHandler(createLeaveRequest));
router.get('/my-leaves', protect, isStudent, asyncHandler(getMyLeaveRequests));
router.get('/stats', protect, isStudent, asyncHandler(getLeaveStats));
router.delete('/:id', protect, isStudent, asyncHandler(deleteLeaveRequest));

// Teacher routes
router.get('/', protect, isTeacher, asyncHandler(getAllLeaveRequests));
router.put('/:id/status', protect, isTeacher, asyncHandler(updateLeaveStatus));

// Common routes (both student and teacher)
router.get('/:id', protect, asyncHandler(getLeaveRequest));

module.exports = router;
