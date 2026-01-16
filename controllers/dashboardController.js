const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');

// Get teacher dashboard statistics
const getTeacherStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all leave requests
    const allRequests = await LeaveRequest.find().populate('student', 'name email');

    // Calculate statistics
    const totalRequests = allRequests.length;
    const pendingRequests = allRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = allRequests.filter(req => req.status === 'approved').length;
    const rejectedRequests = allRequests.filter(req => req.status === 'rejected').length;

    // Today's requests
    const todayRequests = allRequests.filter(req => {
      const requestDate = new Date(req.createdAt);
      requestDate.setHours(0, 0, 0, 0);
      return requestDate.getTime() === today.getTime();
    }).length;

    // Total students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Calculate approval rate
    const totalProcessed = approvedRequests + rejectedRequests;
    const approvalRate = totalProcessed > 0 
      ? Math.round((approvedRequests / totalProcessed) * 100) 
      : 0;

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      todayRequests,
      totalStudents,
      approvalRate,
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard statistics',
      error: error.message 
    });
  }
};

// Get student dashboard statistics
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student's leave requests
    const leaveRequests = await LeaveRequest.find({ student: studentId })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length;
    const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected').length;

    // Get attendance
    const attendance = await Attendance.findOne({ student: studentId });
    const attendancePercentage = attendance?.percentage || 0;

    // Recent requests (last 5)
    const recentRequests = leaveRequests.slice(0, 5);

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      attendancePercentage,
      recentRequests,
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard statistics',
      error: error.message 
    });
  }
};

module.exports = {
  getTeacherStats,
  getStudentStats,
};
