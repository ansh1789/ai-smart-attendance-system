const express = require('express');
const router = express.Router();
const { registerFace, recognizeFace } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/register-face', authorize('admin', 'student'), registerFace);
router.post('/recognize-face', authorize('teacher', 'admin'), recognizeFace);

module.exports = router;
