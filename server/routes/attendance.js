const express = require('express');
const router = express.Router();
const {
  startSession, endSession, markAttendance,
  getAttendance, getStudentAttendance, getSubjectAttendance,
  updateAttendance, getSessions
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/start-session', authorize('teacher', 'admin'), startSession);
router.put('/end-session/:sessionId', authorize('teacher', 'admin'), endSession);
router.post('/mark', authorize('teacher', 'admin'), markAttendance);
router.get('/sessions', getSessions);
router.get('/', getAttendance);
router.get('/student/:id', getStudentAttendance);
router.get('/subject/:id', getSubjectAttendance);
router.put('/:id', authorize('teacher', 'admin'), updateAttendance);

module.exports = router;
