const DailyAttendance = require('../models/DailyAttendance');
const User = require('../models/User');

// @desc    Mark attendance for multiple students
// @route   POST /api/attendance/mark
// @access  Private (Teacher only)
exports.markAttendance = async (req, res) => {
  try {
    const { attendanceRecords, date, class: className } = req.body;

    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ message: 'Attendance records are required' });
    }

    if (!date || !className) {
      return res.status(400).json({ message: 'Date and class are required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    const errors = [];

    for (const record of attendanceRecords) {
      try {
        const { studentId, status, remarks } = record;

        // Validate student exists
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
          errors.push({ studentId, error: 'Invalid student' });
          continue;
        }

        // Update or create attendance record
        const attendanceRecord = await DailyAttendance.findOneAndUpdate(
          {
            student: studentId,
            date: attendanceDate,
            class: className
          },
          {
            student: studentId,
            teacher: req.user.id,
            date: attendanceDate,
            status: status,
            class: className,
            remarks: remarks || '',
            lastModified: Date.now(),
            modifiedBy: req.user.id
          },
          {
            new: true,
            upsert: true,
            runValidators: true
          }
        ).populate('student', 'name email');

        results.push(attendanceRecord);
      } catch (error) {
        errors.push({ studentId: record.studentId, error: error.message });
      }
    }

    res.status(200).json({
      message: 'Attendance marked successfully',
      results,
      errors: errors.length > 0 ? errors : undefined,
      totalMarked: results.length,
      totalErrors: errors.length
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

// @desc    Get attendance for a specific date and class
// @route   GET /api/attendance/class
// @access  Private (Teacher only)
exports.getClassAttendance = async (req, res) => {
  try {
    const { date, class: className } = req.query;

    if (!date || !className) {
      return res.status(400).json({ message: 'Date and class are required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await DailyAttendance.find({
      date: attendanceDate,
      class: className
    })
      .populate('student', 'name email avatar')
      .populate('teacher', 'name')
      .sort({ 'student.name': 1 });

    res.status(200).json({
      attendance,
      date: attendanceDate,
      class: className,
      total: attendance.length
    });
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

// @desc    Get all students in a class for attendance marking
// @route   GET /api/attendance/students
// @access  Private (Teacher only)
exports.getStudentsForAttendance = async (req, res) => {
  try {
    const { class: className, date } = req.query;

    if (!className) {
      return res.status(400).json({ message: 'Class is required' });
    }

    // Get all students in the specified class
    const students = await User.find({
      role: 'student',
      class: className
    }).select('name email avatar class isCustomAdded').sort({ name: 1 });

    // If date is provided, get existing attendance for that date
    let existingAttendance = [];
    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      existingAttendance = await DailyAttendance.find({
        date: attendanceDate,
        class: className
      });
    }

    // Merge students with their attendance status
    const studentsWithAttendance = students.map(student => {
      const attendance = existingAttendance.find(
        a => a.student.toString() === student._id.toString()
      );

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        class: student.class,
        isCustomAdded: student.isCustomAdded || false,
        status: attendance ? attendance.status : null,
        remarks: attendance ? attendance.remarks : '',
        markedAt: attendance ? attendance.timeMarked : null
      };
    });

    res.status(200).json({
      students: studentsWithAttendance,
      total: students.length,
      marked: existingAttendance.length
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// @desc    Get attendance report for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, subject } = req.query;

    const query = { student: studentId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (subject) {
      query.subject = subject;
    }

    const attendance = await DailyAttendance.find(query)
      .populate('teacher', 'name')
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    stats.percentage = stats.total > 0
      ? Math.round(((stats.present + stats.late) / stats.total) * 100)
      : 0;

    res.status(200).json({
      attendance,
      stats
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Error fetching student attendance', error: error.message });
  }
};

// @desc    Get attendance summary for a class
// @route   GET /api/attendance/summary
// @access  Private (Teacher only)
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { class: className, startDate, endDate, subject } = req.query;

    if (!className || !startDate || !endDate) {
      return res.status(400).json({ message: 'Class, start date, and end date are required' });
    }

    const query = {
      class: className,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (subject) {
      query.subject = subject;
    }

    const attendance = await DailyAttendance.find(query)
      .populate('student', 'name email');

    // Group by student
    const studentAttendance = {};

    attendance.forEach(record => {
      const studentId = record.student._id.toString();
      
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          student: record.student,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }

      studentAttendance[studentId].total++;
      studentAttendance[studentId][record.status]++;
    });

    // Calculate percentages
    const summary = Object.values(studentAttendance).map(data => ({
      ...data,
      percentage: data.total > 0
        ? Math.round(((data.present + data.late) / data.total) * 100)
        : 0
    })).sort((a, b) => a.student.name.localeCompare(b.student.name));

    res.status(200).json({
      summary,
      class: className,
      period: { startDate, endDate },
      totalStudents: summary.length
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Error fetching attendance summary', error: error.message });
  }
};

// @desc    Update single attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Teacher only)
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const attendance = await DailyAttendance.findById(id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    attendance.status = status || attendance.status;
    attendance.remarks = remarks !== undefined ? remarks : attendance.remarks;
    attendance.lastModified = Date.now();
    attendance.modifiedBy = req.user.id;

    await attendance.save();

    const updated = await DailyAttendance.findById(id)
      .populate('student', 'name email avatar')
      .populate('teacher', 'name');

    res.status(200).json({
      message: 'Attendance updated successfully',
      attendance: updated
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Error updating attendance', error: error.message });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Teacher only)
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await DailyAttendance.findById(id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await attendance.deleteOne();

    res.status(200).json({
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Error deleting attendance', error: error.message });
  }
};

// @desc    Add custom student to a class
// @route   POST /api/attendance/students/add
// @access  Private (Teacher only)
exports.addCustomStudent = async (req, res) => {
  try {
    const { name, email, class: className } = req.body;

    if (!name || !email || !className) {
      return res.status(400).json({ message: 'Name, email, and class are required' });
    }

    // Check if student with this email already exists
    const existingStudent = await User.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Create new student
    const student = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'student',
      class: className,
      isCustomAdded: true,
      provider: 'local',
      password: Math.random().toString(36).slice(-8) // Random temporary password
    });

    res.status(201).json({
      message: 'Student added successfully',
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        class: student.class,
        isCustomAdded: student.isCustomAdded
      }
    });
  } catch (error) {
    console.error('Add custom student error:', error);
    res.status(500).json({ message: 'Error adding student', error: error.message });
  }
};

// @desc    Remove custom student
// @route   DELETE /api/attendance/students/:studentId
// @access  Private (Teacher only)
exports.removeCustomStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.isCustomAdded) {
      return res.status(403).json({ message: 'Cannot remove enrolled students. Only custom-added students can be removed.' });
    }

    // Delete the student
    await User.findByIdAndDelete(studentId);

    // Also delete all their attendance records
    await DailyAttendance.deleteMany({ student: studentId });

    res.status(200).json({
      message: 'Student removed successfully'
    });
  } catch (error) {
    console.error('Remove custom student error:', error);
    res.status(500).json({ message: 'Error removing student', error: error.message });
  }
};
