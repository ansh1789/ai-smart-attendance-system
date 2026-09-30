const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
exports.getStudents = async (req, res, next) => {
  try {
    const { department, semester, section, search } = req.query;
    const filter = { role: 'student' };

    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (section) filter.section = section;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(filter)
      .select('-faceEmbedding')
      .sort({ name: 1 });

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
exports.getStudent = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' })
      .select('-faceEmbedding');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student
// @route   POST /api/students
exports.createStudent = async (req, res, next) => {
  try {
    const { name, email, password, userId, department, semester, section } = req.body;

    const student = await User.create({
      name, email,
      password: password || 'student123',
      role: 'student',
      userId, department, semester, section
    });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
exports.updateStudent = async (req, res, next) => {
  try {
    const { name, email, userId, department, semester, section, isActive } = req.body;
    const update = {};

    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (userId !== undefined) update.userId = userId;
    if (department !== undefined) update.department = department;
    if (semester !== undefined) update.semester = semester;
    if (section !== undefined) update.section = section;
    if (isActive !== undefined) update.isActive = isActive;

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      update,
      { new: true, runValidators: true }
    ).select('-faceEmbedding');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};
