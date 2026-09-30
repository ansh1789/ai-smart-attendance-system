const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

// @desc    Get attendance report data
// @route   GET /api/reports/attendance
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { subjectId, startDate, endDate, section, semester, department } = req.query;
    const filter = {};

    if (subjectId) filter.subject = subjectId;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    const records = await Attendance.find(filter)
      .populate('student', 'name userId department semester section')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name')
      .sort({ date: -1 });

    // Group by student
    const studentMap = {};
    records.forEach(r => {
      if (!r.student) return;
      const key = r.student._id.toString();
      if (!studentMap[key]) {
        studentMap[key] = {
          student: r.student,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      studentMap[key].total++;
      studentMap[key][r.status]++;
    });

    const reportData = Object.values(studentMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    })).sort((a, b) => a.student.name.localeCompare(b.student.name));

    let subject = null;
    if (subjectId) {
      subject = await Subject.findById(subjectId).populate('teacher', 'name');
    }

    res.json({
      success: true,
      data: {
        records,
        reportData,
        subject,
        dateRange: { startDate, endDate },
        totalRecords: records.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export attendance CSV
// @route   GET /api/reports/attendance/csv
exports.exportCSV = async (req, res, next) => {
  try {
    const { subjectId, startDate, endDate } = req.query;
    const filter = {};

    if (subjectId) filter.subject = subjectId;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (req.user.role === 'teacher') filter.teacher = req.user._id;

    const records = await Attendance.find(filter)
      .populate('student', 'name userId department semester section')
      .populate('subject', 'subjectName subjectCode')
      .sort({ date: -1 });

    // Build CSV
    const headers = 'Student Name,Student ID,Subject,Date,Time,Status,Confidence,Method\n';
    const rows = records.map(r => {
      const date = new Date(r.date).toLocaleDateString();
      return `"${r.student?.name || ''}","${r.student?.userId || ''}","${r.subject?.subjectName || ''}","${date}","${r.time}","${r.status}","${r.recognitionConfidence}","${r.attendanceMethod}"`;
    }).join('\n');

    const csv = headers + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export attendance PDF
// @route   GET /api/reports/attendance/pdf
exports.exportPDF = async (req, res, next) => {
  try {
    const { subjectId, startDate, endDate } = req.query;
    const filter = {};

    if (subjectId) filter.subject = subjectId;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (req.user.role === 'teacher') filter.teacher = req.user._id;

    const records = await Attendance.find(filter)
      .populate('student', 'name userId')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name')
      .sort({ 'student.name': 1, date: -1 });

    let subject = null;
    if (subjectId) {
      subject = await Subject.findById(subjectId).populate('teacher', 'name');
    }

    // Group by student for summary
    const studentMap = {};
    records.forEach(r => {
      if (!r.student) return;
      const key = r.student._id.toString();
      if (!studentMap[key]) {
        studentMap[key] = { name: r.student.name, userId: r.student.userId, total: 0, present: 0, absent: 0 };
      }
      studentMap[key].total++;
      studentMap[key][r.status]++;
    });

    const summaryData = Object.values(studentMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('AI Smart Attendance System', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Attendance Report', { align: 'center' });
    doc.moveDown();

    // Report info
    if (subject) {
      doc.fontSize(11).font('Helvetica-Bold').text(`Subject: `, { continued: true });
      doc.font('Helvetica').text(`${subject.subjectName} (${subject.subjectCode})`);
      doc.font('Helvetica-Bold').text(`Teacher: `, { continued: true });
      doc.font('Helvetica').text(`${subject.teacher?.name || 'N/A'}`);
    }
    if (startDate && endDate) {
      doc.font('Helvetica-Bold').text(`Period: `, { continued: true });
      doc.font('Helvetica').text(`${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);
    }
    doc.font('Helvetica-Bold').text(`Generated: `, { continued: true });
    doc.font('Helvetica').text(`${new Date().toLocaleString()}`);
    doc.moveDown();

    // Table header
    doc.font('Helvetica-Bold').fontSize(10);
    const tableTop = doc.y;
    const col1 = 50, col2 = 180, col3 = 280, col4 = 340, col5 = 400, col6 = 460;

    doc.text('Student Name', col1, tableTop);
    doc.text('Student ID', col2, tableTop);
    doc.text('Present', col3, tableTop);
    doc.text('Absent', col4, tableTop);
    doc.text('Total', col5, tableTop);
    doc.text('Percentage', col6, tableTop);

    doc.moveTo(col1, tableTop + 15).lineTo(540, tableTop + 15).stroke();

    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(9);

    summaryData.forEach((s, i) => {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      doc.text(s.name, col1, y, { width: 125 });
      doc.text(s.userId || 'N/A', col2, y);
      doc.text(String(s.present), col3, y);
      doc.text(String(s.absent), col4, y);
      doc.text(String(s.total), col5, y);
      doc.text(`${s.percentage}%`, col6, y);
      y += 18;
    });

    doc.moveDown(2);
    doc.fontSize(8).fillColor('#666').text('This report was generated by AI Smart Attendance Monitoring System', 50, y + 20, { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};
