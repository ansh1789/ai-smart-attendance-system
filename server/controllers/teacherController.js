const User = require('../models/User');

// @desc    Get all teachers
// @route   GET /api/teachers
exports.getTeachers = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const filter = { role: 'teacher' };
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await User.find(filter).sort({ name: 1 });
    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Create teacher
// @route   POST /api/teachers
exports.createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, userId, department } = req.body;
    const teacher = await User.create({
      name, email,
      password: password || 'teacher123',
      role: 'teacher',
      userId, department
    });
    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
exports.updateTeacher = async (req, res, next) => {
  try {
    const { name, email, userId, department, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (userId !== undefined) update.userId = userId;
    if (department !== undefined) update.department = department;
    if (isActive !== undefined) update.isActive = isActive;

    const teacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'teacher' },
      update,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findOneAndDelete({ _id: req.params.id, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    next(error);
  }
};
