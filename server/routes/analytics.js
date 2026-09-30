const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics, getStudentAnalytics, getSubjectAnalytics, getSmartInsights
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/insights', getSmartInsights);
router.get('/student/:id', getStudentAnalytics);
router.get('/subject/:id', getSubjectAnalytics);

module.exports = router;
