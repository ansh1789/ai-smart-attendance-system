const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Start attendance session
// @route   POST /api/attendance/start-session
exports.startSession = async (req, res, next) => {
  try {
    const { subjectId } = req.body;
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Check for already active session for this subject by this teacher
    const activeSession = await AttendanceSession.findOne({
      subject: subjectId,
      teacher: req.user._id,
      status: 'active'
    });
    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: 'An active session already exists for this subject',
        data: activeSession
      });
    }

    const session = await AttendanceSession.create({
      subject: subjectId,
      teacher: req.user._id,
      date: new Date(),
      startTime: new Date(),
      status: 'active'
    });

    const populated = await AttendanceSession.findById(session._id)
      .populate('subject', 'subjectName subjectCode semester section')
      .populate('teacher', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop attendance session
// @route   PUT /api/attendance/end-session/:sessionId
exports.endSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = 'completed';
    session.endTime = new Date();

    // Count present/absent
    const presentCount = await Attendance.countDocuments({
      session: session._id,
      status: 'present'
    });
    const absentCount = await Attendance.countDocuments({
      session: session._id,
      status: 'absent'
    });

    session.totalPresent = presentCount;
    session.totalAbsent = absentCount;
    await session.save();

    // Get subject info for notifications
    const subject = await Subject.findById(session.subject);

    // Mark absent students who were not marked present
    const allStudents = await User.find({
      role: 'student',
      semester: subject.semester,
      section: subject.section,
      department: subject.department,
      isActive: true
    });

    const markedStudents = await Attendance.find({ session: session._id }).distinct('student');
    const absentStudents = allStudents.filter(
      s => !markedStudents.some(ms => ms.toString() === s._id.toString())
    );

    // Create absent records
    for (const student of absentStudents) {
      await Attendance.create({
        student: student._id,
        subject: session.subject,
        teacher: req.user._id,
        session: session._id,
        date: session.date,
        time: new Date().toLocaleTimeString(),
        status: 'absent',
        recognitionConfidence: 0,
        attendanceMethod: 'manual'
      });
    }

    // Check and send low attendance notifications
    const threshold = parseInt(process.env.ATTENDANCE_THRESHOLD) || 75;
    for (const student of allStudents) {
      const totalClasses = await Attendance.countDocuments({
        student: student._id,
        subject: session.subject
      });
      const presentClasses = await Attendance.countDocuments({
        student: student._id,
        subject: session.subject,
        status: 'present'
      });
      const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

      if (percentage < threshold) {
        await Notification.create({
          user: student._id,
          title: 'Low Attendance Warning',
          message: `Your attendance in ${subject.subjectName} is ${percentage}%, which is below the required ${threshold}%.`,
          type: 'warning'
        });
      }
    }

    const populated = await AttendanceSession.findById(session._id)
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance (AI or manual)
// @route   POST /api/attendance/mark
exports.markAttendance = async (req, res, next) => {
  try {
    const { studentId, sessionId, status, recognitionConfidence, attendanceMethod } = req.body;

    const session = await AttendanceSession.findById(sessionId);
    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'No active session found' });
    }

    // Check for duplicate
    const existing = await Attendance.findOne({ student: studentId, session: sessionId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this student in this session'
      });
    }

    const subject = await Subject.findById(session.subject);
    const student = await User.findById(studentId);

    const attendance = await Attendance.create({
      student: studentId,
      subject: session.subject,
      teacher: req.user._id,
      session: sessionId,
      date: session.date,
      time: new Date().toLocaleTimeString(),
      status: status || 'present',
      recognitionConfidence: recognitionConfidence || 0,
      attendanceMethod: attendanceMethod || 'manual'
    });

    // Send notification to student
    if (student) {
      await Notification.create({
        user: student._id,
        title: 'Attendance Marked',
        message: `You have been marked ${status || 'present'} for ${subject ? subject.subjectName : 'class'}.`,
        type: 'success'
      });
    }

    const populated = await Attendance.findById(attendance._id)
      .populate('student', 'name userId profileImage')
      .populate('subject', 'subjectName subjectCode');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
exports.getAttendance = async (req, res, next) => {
  try {
    const { subject, student, session, date, startDate, endDate, status } = req.query;
    const filter = {};

    if (subject) filter.subject = subject;
    if (student) filter.student = student;
    if (session) filter.session = session;
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      filter.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999))
      };
    }
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Role-based filtering
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    const records = await Attendance.find(filter)
      .populate('student', 'name userId email department semester section')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name')
      .populate('session', 'startTime endTime status')
      .sort({ date: -1, time: -1 })
      .limit(500);

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/student/:id
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const records = await Attendance.find({ student: studentId })
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name')
      .sort({ date: -1 });

    // Calculate subject-wise stats
    const subjectMap = {};
    records.forEach(r => {
      const key = r.subject._id.toString();
      if (!subjectMap[key]) {
        subjectMap[key] = {
          subject: r.subject,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      subjectMap[key].total++;
      subjectMap[key][r.status]++;
    });

    const subjectStats = Object.values(subjectMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;

    res.json({
      success: true,
      data: {
        records,
        subjectStats,
        overall: {
          total,
          present,
          absent,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a subject
// @route   GET /api/attendance/subject/:id
exports.getSubjectAttendance = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const records = await Attendance.find({ subject: subjectId })
      .populate('student', 'name userId email')
      .sort({ date: -1 });

    // Calculate student-wise stats
    const studentMap = {};
    records.forEach(r => {
      const key = r.student._id.toString();
      if (!studentMap[key]) {
        studentMap[key] = {
          student: r.student,
          total: 0,
          present: 0,
          absent: 0
        };
      }
      studentMap[key].total++;
      studentMap[key][r.status]++;
    });

    const studentStats = Object.values(studentMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));

    res.json({
      success: true,
      data: { records, studentStats }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
exports.updateAttendance = async (req, res, next) => {
  try {
    const { status } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, attendanceMethod: 'manual' },
      { new: true }
    ).populate('student', 'name userId')
     .populate('subject', 'subjectName subjectCode');

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active sessions
// @route   GET /api/attendance/sessions
exports.getSessions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const sessions = await AttendanceSession.find(filter)
      .populate('subject', 'subjectName subjectCode semester section')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};
