const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Create a new leave request
// @route   POST /api/leave
// @access  Private (Student only)
exports.createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, description, startDate, endDate } = req.body;

    // Validation
    if (!leaveType || !description || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: leaveType, description, startDate, endDate' 
      });
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ 
        message: 'Only students can apply for leave' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ 
        message: 'Start date cannot be in the past' 
      });
    }

    if (end < start) {
      return res.status(400).json({ 
        message: 'End date must be after or equal to start date' 
      });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await LeaveRequest.findOne({
      student: req.user._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        message: 'You already have a leave request for this period' 
      });
    }

    // Get student's attendance
    const attendance = await Attendance.findOne({ student: req.user._id });

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      student: req.user._id,
      leaveType,
      description,
      startDate: start,
      endDate: end,
      attendancePercentage: attendance ? attendance.attendancePercentage : 0,
      attendanceEligible: attendance ? attendance.isEligible : false,
    });

    // Populate student details
    await leaveRequest.populate('student', 'name email role');

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest: {
        id: leaveRequest._id,
        leaveType: leaveRequest.leaveType,
        description: leaveRequest.description,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        numberOfDays: leaveRequest.numberOfDays,
        status: leaveRequest.status,
        student: leaveRequest.student,
        createdAt: leaveRequest.createdAt,
      }
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ 
      message: error.message || 'Error creating leave request' 
    });
  }
};

// @desc    Get all leave requests for logged-in student
// @route   GET /api/leave/my-leaves
// @access  Private (Student only)
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ student: req.user._id })
      .populate('reviewedBy', 'name email')
      .sort('-createdAt');

    res.json({
      count: leaveRequests.length,
      leaveRequests
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ 
      message: error.message || 'Error fetching leave requests' 
    });
  }
};

// @desc    Get all leave requests (for teachers)
// @route   GET /api/leave
// @access  Private (Teacher only)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const leaveRequests = await LeaveRequest.find(filter)
      .populate('student', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort('-createdAt');

    res.json({
      count: leaveRequests.length,
      leaveRequests
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ 
      message: error.message || 'Error fetching leave requests' 
    });
  }
};

// @desc    Get single leave request
// @route   GET /api/leave/:id
// @access  Private
exports.getLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate('student', 'name email role')
      .populate('reviewedBy', 'name email');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if user has access to this leave request
    if (req.user.role === 'student' && leaveRequest.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You do not have access to this leave request' 
      });
    }

    res.json({ leaveRequest });
  } catch (error) {
    console.error('Get leave request error:', error);
    res.status(500).json({ 
      message: error.message || 'Error fetching leave request' 
    });
  }
};

// @desc    Update leave request status (approve/reject)
// @route   PUT /api/leave/:id/status
// @access  Private (Teacher only)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, teacherRemarks } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Please provide a valid status (approved or rejected)' 
      });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ 
        message: `This leave request has already been ${leaveRequest.status}` 
      });
    }

    leaveRequest.status = status;
    leaveRequest.reviewedBy = req.user._id;
    leaveRequest.reviewedAt = Date.now();
    if (teacherRemarks) {
      leaveRequest.teacherRemarks = teacherRemarks;
    }

    await leaveRequest.save();
    await leaveRequest.populate('student', 'name email role');
    await leaveRequest.populate('reviewedBy', 'name email');

    res.json({
      message: `Leave request ${status} successfully`,
      leaveRequest
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ 
      message: error.message || 'Error updating leave status' 
    });
  }
};

// @desc    Delete leave request (student can delete only pending requests)
// @route   DELETE /api/leave/:id
// @access  Private (Student only)
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if student owns this request
    if (leaveRequest.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You do not have permission to delete this request' 
      });
    }

    // Only pending requests can be deleted
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot delete a leave request that is already ${leaveRequest.status}` 
      });
    }

    await leaveRequest.deleteOne();

    res.json({ 
      message: 'Leave request deleted successfully' 
    });
  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({ 
      message: error.message || 'Error deleting leave request' 
    });
  }
};

// @desc    Get leave statistics for student
// @route   GET /api/leave/stats
// @access  Private (Student only)
exports.getLeaveStats = async (req, res) => {
  try {
    const stats = await LeaveRequest.aggregate([
      { $match: { student: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalDaysRequested: 0,
      totalDaysApproved: 0
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats.totalDaysRequested += stat.totalDays;
      
      if (stat._id === 'pending') {
        formattedStats.pending = stat.count;
      } else if (stat._id === 'approved') {
        formattedStats.approved = stat.count;
        formattedStats.totalDaysApproved = stat.totalDays;
      } else if (stat._id === 'rejected') {
        formattedStats.rejected = stat.count;
      }
    });

    res.json({ stats: formattedStats });
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({ 
      message: error.message || 'Error fetching leave statistics' 
    });
  }
};
