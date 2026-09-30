const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceSession',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  recognitionConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  attendanceMethod: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'ai'
  }
}, {
  timestamps: true
});

// Prevent duplicate attendance for same student in same session
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
