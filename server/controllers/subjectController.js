const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
exports.getSubjects = async (req, res, next) => {
  try {
    const { teacher, semester, section, department, search } = req.query;
    const filter = {};
    if (teacher) filter.teacher = teacher;
    if (semester) filter.semester = parseInt(semester);
    if (section) filter.section = section;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } }
      ];
    }

    // If teacher role, only show their subjects
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    const subjects = await Subject.find(filter)
      .populate('teacher', 'name email userId')
      .sort({ subjectName: 1 });

    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teacher', 'name email userId');
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subject
// @route   POST /api/subjects
exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    const populated = await Subject.findById(subject._id).populate('teacher', 'name email userId');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('teacher', 'name email userId');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};
