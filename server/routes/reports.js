const express = require('express');
const router = express.Router();
const { getAttendanceReport, exportCSV, exportPDF } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'teacher'));

router.get('/attendance', getAttendanceReport);
router.get('/attendance/csv', exportCSV);
router.get('/attendance/pdf', exportPDF);

module.exports = router;
