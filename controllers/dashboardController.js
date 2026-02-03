const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const DailyAttendance = require('../models/DailyAttendance');

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

    // Today's attendance statistics
    const todayAttendance = await DailyAttendance.find({
      date: today,
      teacher: req.user.id
    });

    const attendanceStats = {
      total: todayAttendance.length,
      present: todayAttendance.filter(a => a.status === 'present').length,
      absent: todayAttendance.filter(a => a.status === 'absent').length,
      late: todayAttendance.filter(a => a.status === 'late').length,
      excused: todayAttendance.filter(a => a.status === 'excused').length,
    };

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      todayRequests,
      totalStudents,
      approvalRate,
      attendanceStats,
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

    // Get attendance from old model
    const attendance = await Attendance.findOne({ student: studentId });
    const attendancePercentage = attendance?.percentage || 0;

    // Get daily attendance statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyAttendance = await DailyAttendance.find({
      student: studentId,
      date: { $gte: thirtyDaysAgo }
    });

    const attendanceStats = {
      total: dailyAttendance.length,
      present: dailyAttendance.filter(a => a.status === 'present').length,
      absent: dailyAttendance.filter(a => a.status === 'absent').length,
      late: dailyAttendance.filter(a => a.status === 'late').length,
      excused: dailyAttendance.filter(a => a.status === 'excused').length,
      percentage: dailyAttendance.length > 0 
        ? Math.round((dailyAttendance.filter(a => a.status === 'present').length / dailyAttendance.length) * 100)
        : attendancePercentage
    };

    // Recent requests (last 5)
    const recentRequests = leaveRequests.slice(0, 5);

    // Recent attendance (last 10 days)
    const recentAttendance = await DailyAttendance.find({ student: studentId })
      .sort({ date: -1 })
      .limit(10)
      .populate('teacher', 'name')
      .select('date status subject class remarks');

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      attendancePercentage: attendanceStats.percentage,
      attendanceStats,
      recentRequests,
      recentAttendance,
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
