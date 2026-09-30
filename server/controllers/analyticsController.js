const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const Subject = require('../models/Subject');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const { role } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (role === 'admin') {
      const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
      const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
      const totalSubjects = await Subject.countDocuments({ isActive: true });

      const todayAttendance = await Attendance.countDocuments({
        date: { $gte: today, $lt: tomorrow }
      });
      const todayPresent = await Attendance.countDocuments({
        date: { $gte: today, $lt: tomorrow },
        status: 'present'
      });

      // Overall attendance percentage
      const totalRecords = await Attendance.countDocuments();
      const totalPresent = await Attendance.countDocuments({ status: 'present' });
      const avgAttendance = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

      // Attendance trend (last 7 days)
      const trend = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        const dayTotal = await Attendance.countDocuments({ date: { $gte: d, $lt: nextD } });
        const dayPresent = await Attendance.countDocuments({ date: { $gte: d, $lt: nextD }, status: 'present' });

        trend.push({
          date: d.toISOString().split('T')[0],
          day: d.toLocaleDateString('en', { weekday: 'short' }),
          total: dayTotal,
          present: dayPresent,
          percentage: dayTotal > 0 ? Math.round((dayPresent / dayTotal) * 100) : 0
        });
      }

      // Low attendance students
      const threshold = parseInt(process.env.ATTENDANCE_THRESHOLD) || 75;
      const students = await User.find({ role: 'student', isActive: true }).select('name userId department semester section');
      const lowAttendanceStudents = [];

      for (const student of students) {
        const sTotal = await Attendance.countDocuments({ student: student._id });
        const sPresent = await Attendance.countDocuments({ student: student._id, status: 'present' });
        const pct = sTotal > 0 ? Math.round((sPresent / sTotal) * 100) : 100;
        if (pct < threshold && sTotal > 0) {
          lowAttendanceStudents.push({ student, percentage: pct, total: sTotal, present: sPresent });
        }
      }

      // Recent activity
      const recentActivity = await Attendance.find()
        .populate('student', 'name userId')
        .populate('subject', 'subjectName')
        .sort({ createdAt: -1 })
        .limit(10);

      // Active sessions
      const activeSessions = await AttendanceSession.countDocuments({ status: 'active' });

      res.json({
        success: true,
        data: {
          totalStudents,
          totalTeachers,
          totalSubjects,
          todayAttendance,
          todayPresent,
          avgAttendance,
          trend,
          lowAttendanceStudents: lowAttendanceStudents.slice(0, 10),
          recentActivity,
          activeSessions,
          threshold
        }
      });
    } else if (role === 'teacher') {
      const subjects = await Subject.find({ teacher: req.user._id });
      const subjectIds = subjects.map(s => s._id);

      const todayAttendance = await Attendance.countDocuments({
        teacher: req.user._id,
        date: { $gte: today, $lt: tomorrow }
      });
      const todayPresent = await Attendance.countDocuments({
        teacher: req.user._id,
        date: { $gte: today, $lt: tomorrow },
        status: 'present'
      });

      const activeSessions = await AttendanceSession.find({
        teacher: req.user._id,
        status: 'active'
      }).populate('subject', 'subjectName subjectCode');

      // Subject-wise stats
      const subjectStats = [];
      for (const sub of subjects) {
        const sTotal = await Attendance.countDocuments({ subject: sub._id });
        const sPresent = await Attendance.countDocuments({ subject: sub._id, status: 'present' });
        subjectStats.push({
          subject: sub,
          total: sTotal,
          present: sPresent,
          percentage: sTotal > 0 ? Math.round((sPresent / sTotal) * 100) : 0
        });
      }

      const recentRecords = await Attendance.find({ teacher: req.user._id })
        .populate('student', 'name userId')
        .populate('subject', 'subjectName')
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        success: true,
        data: {
          totalSubjects: subjects.length,
          todayAttendance,
          todayPresent,
          activeSessions,
          subjectStats,
          recentRecords
        }
      });
    } else if (role === 'student') {
      const totalClasses = await Attendance.countDocuments({ student: req.user._id });
      const presentClasses = await Attendance.countDocuments({ student: req.user._id, status: 'present' });
      const absentClasses = await Attendance.countDocuments({ student: req.user._id, status: 'absent' });
      const overallPercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

      // Subject-wise breakdown
      const records = await Attendance.find({ student: req.user._id })
        .populate('subject', 'subjectName subjectCode');

      const subjectMap = {};
      records.forEach(r => {
        if (!r.subject) return;
        const key = r.subject._id.toString();
        if (!subjectMap[key]) {
          subjectMap[key] = { subject: r.subject, total: 0, present: 0, absent: 0 };
        }
        subjectMap[key].total++;
        subjectMap[key][r.status]++;
      });

      const subjectStats = Object.values(subjectMap).map(s => ({
        ...s,
        percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
      }));

      // Attendance trend (last 30 days)
      const trend = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        const dayRecords = await Attendance.find({
          student: req.user._id,
          date: { $gte: d, $lt: nextD }
        });

        if (dayRecords.length > 0) {
          const dayPresent = dayRecords.filter(r => r.status === 'present').length;
          trend.push({
            date: d.toISOString().split('T')[0],
            total: dayRecords.length,
            present: dayPresent,
            percentage: Math.round((dayPresent / dayRecords.length) * 100)
          });
        }
      }

      const threshold = parseInt(process.env.ATTENDANCE_THRESHOLD) || 75;
      const warnings = subjectStats
        .filter(s => s.percentage < threshold)
        .map(s => ({
          subject: s.subject.subjectName,
          percentage: s.percentage,
          message: `Your attendance in ${s.subject.subjectName} is ${s.percentage}%, below the required ${threshold}%.`
        }));

      res.json({
        success: true,
        data: {
          totalClasses,
          presentClasses,
          absentClasses,
          overallPercentage,
          subjectStats,
          trend,
          warnings,
          threshold
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get student analytics
// @route   GET /api/analytics/student/:id
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId).select('name userId department semester section');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const records = await Attendance.find({ student: studentId })
      .populate('subject', 'subjectName subjectCode')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;

    // Subject-wise
    const subjectMap = {};
    records.forEach(r => {
      if (!r.subject) return;
      const key = r.subject._id.toString();
      if (!subjectMap[key]) {
        subjectMap[key] = { subject: r.subject, total: 0, present: 0, absent: 0 };
      }
      subjectMap[key].total++;
      subjectMap[key][r.status]++;
    });

    const subjectStats = Object.values(subjectMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));

    // Monthly trend
    const monthlyMap = {};
    records.forEach(r => {
      const month = new Date(r.date).toLocaleDateString('en', { year: 'numeric', month: 'short' });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, total: 0, present: 0 };
      }
      monthlyMap[month].total++;
      if (r.status === 'present') monthlyMap[month].present++;
    });

    const monthlyTrend = Object.values(monthlyMap).map(m => ({
      ...m,
      percentage: m.total > 0 ? Math.round((m.present / m.total) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        student,
        overall: { total, present, absent, percentage: total > 0 ? Math.round((present / total) * 100) : 0 },
        subjectStats,
        monthlyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subject analytics
// @route   GET /api/analytics/subject/:id
exports.getSubjectAnalytics = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const subject = await Subject.findById(subjectId).populate('teacher', 'name');
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const records = await Attendance.find({ subject: subjectId })
      .populate('student', 'name userId')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;

    // Student-wise
    const studentMap = {};
    records.forEach(r => {
      if (!r.student) return;
      const key = r.student._id.toString();
      if (!studentMap[key]) {
        studentMap[key] = { student: r.student, total: 0, present: 0, absent: 0 };
      }
      studentMap[key].total++;
      studentMap[key][r.status]++;
    });

    const studentStats = Object.values(studentMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));

    // Daily trend
    const dailyMap = {};
    records.forEach(r => {
      const day = new Date(r.date).toISOString().split('T')[0];
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, total: 0, present: 0 };
      }
      dailyMap[day].total++;
      if (r.status === 'present') dailyMap[day].present++;
    });

    const dailyTrend = Object.values(dailyMap)
      .map(d => ({ ...d, percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: {
        subject,
        overall: { total, present, absent: total - present, percentage: total > 0 ? Math.round((present / total) * 100) : 0 },
        studentStats,
        dailyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get smart insights
// @route   GET /api/analytics/insights
exports.getSmartInsights = async (req, res, next) => {
  try {
    const threshold = parseInt(process.env.ATTENDANCE_THRESHOLD) || 75;
    const insights = [];

    // Find students with decreasing attendance
    const students = await User.find({ role: 'student', isActive: true }).select('name userId');

    for (const student of students) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentRecords = await Attendance.find({
        student: student._id,
        date: { $gte: thirtyDaysAgo }
      });
      const olderRecords = await Attendance.find({
        student: student._id,
        date: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
      });

      if (recentRecords.length > 0 && olderRecords.length > 0) {
        const recentPct = Math.round((recentRecords.filter(r => r.status === 'present').length / recentRecords.length) * 100);
        const olderPct = Math.round((olderRecords.filter(r => r.status === 'present').length / olderRecords.length) * 100);

        if (recentPct < olderPct - 5) {
          insights.push({
            type: 'declining',
            severity: 'warning',
            student: student,
            message: `${student.name}'s attendance has decreased from ${olderPct}% to ${recentPct}% over the last month.`
          });
        }

        if (recentPct < threshold && recentPct >= threshold - 10) {
          insights.push({
            type: 'at_risk',
            severity: 'error',
            student: student,
            message: `${student.name} is at risk of falling below the ${threshold}% attendance threshold (currently ${recentPct}%).`
          });
        }
      }

      // Frequently absent
      const totalRecords = await Attendance.countDocuments({ student: student._id });
      const absentCount = await Attendance.countDocuments({ student: student._id, status: 'absent' });
      if (totalRecords > 5 && (absentCount / totalRecords) > 0.4) {
        insights.push({
          type: 'frequent_absent',
          severity: 'error',
          student: student,
          message: `${student.name} has been absent in ${Math.round((absentCount / totalRecords) * 100)}% of classes.`
        });
      }
    }

    // Subjects with low attendance
    const subjects = await Subject.find({ isActive: true });
    for (const subject of subjects) {
      const sTotal = await Attendance.countDocuments({ subject: subject._id });
      const sPresent = await Attendance.countDocuments({ subject: subject._id, status: 'present' });
      const sPct = sTotal > 0 ? Math.round((sPresent / sTotal) * 100) : 100;

      if (sTotal > 5 && sPct < 60) {
        insights.push({
          type: 'low_subject',
          severity: 'warning',
          subject: subject,
          message: `${subject.subjectName} has an unusually low attendance rate of ${sPct}%.`
        });
      }
    }

    res.json({
      success: true,
      data: insights.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
};
