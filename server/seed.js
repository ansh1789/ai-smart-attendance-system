const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
const AttendanceSession = require('./models/AttendanceSession');
const Notification = require('./models/Notification');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-attendance';

const studentNames = [
  'Rahul Sharma', 'Aman Kumar', 'Priya Singh', 'Neha Gupta', 'Vikash Yadav',
  'Anjali Patel', 'Rohit Verma', 'Sneha Jain', 'Arjun Mehta', 'Kavita Rao',
  'Deepak Chauhan', 'Pooja Mishra', 'Saurabh Tiwari', 'Riya Agarwal', 'Mohit Pandey',
  'Shivani Dubey', 'Kunal Saxena', 'Megha Chaudhary', 'Akash Rathore', 'Divya Nair'
];

const teacherNames = [
  'Dr. Rajesh Kumar', 'Prof. Sunita Sharma', 'Dr. Amit Verma'
];

const subjectsData = [
  { subjectCode: 'CS501', subjectName: 'Database Management Systems', semester: 5, section: 'A', department: 'Computer Science' },
  { subjectCode: 'CS502', subjectName: 'Artificial Intelligence', semester: 5, section: 'A', department: 'Computer Science' },
  { subjectCode: 'CS503', subjectName: 'Computer Networks', semester: 5, section: 'A', department: 'Computer Science' },
  { subjectCode: 'CS504', subjectName: 'Software Engineering', semester: 5, section: 'A', department: 'Computer Science' },
  { subjectCode: 'CS505', subjectName: 'Operating Systems', semester: 5, section: 'A', department: 'Computer Science' }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Attendance.deleteMany({});
    await AttendanceSession.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartattendance.com',
      password: 'admin123',
      role: 'admin',
      userId: 'ADMIN001',
      department: 'Administration'
    });
    console.log('👤 Admin created');

    // Create teachers
    const teachers = [];
    for (let i = 0; i < teacherNames.length; i++) {
      const teacher = await User.create({
        name: teacherNames[i],
        email: `teacher${i + 1}@smartattendance.com`,
        password: 'teacher123',
        role: 'teacher',
        userId: `TCH${String(i + 1).padStart(3, '0')}`,
        department: 'Computer Science'
      });
      teachers.push(teacher);
    }
    console.log(`👨‍🏫 ${teachers.length} teachers created`);

    // Create students
    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
      const mockEmbedding = Array.from({ length: 128 }, () => Math.random() * 2 - 1);
      const student = await User.create({
        name: studentNames[i],
        email: `student${i + 1}@smartattendance.com`,
        password: 'student123',
        role: 'student',
        userId: `CS2025${String(i + 1).padStart(3, '0')}`,
        department: 'Computer Science',
        semester: 5,
        section: 'A',
        faceEmbedding: mockEmbedding,
        faceRegistered: true
      });
      students.push(student);
    }
    console.log(`🎓 ${students.length} students created`);

    // Create subjects
    const subjects = [];
    for (let i = 0; i < subjectsData.length; i++) {
      const subject = await Subject.create({
        ...subjectsData[i],
        teacher: teachers[i % teachers.length]._id
      });
      subjects.push(subject);
    }
    console.log(`📚 ${subjects.length} subjects created`);

    // Generate attendance records for the last 30 days
    console.log('📝 Generating attendance records...');
    let totalRecords = 0;

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      date.setHours(9, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // 2-3 subjects per day
      const daySubjects = subjects.slice(0, 2 + Math.floor(Math.random() * 2));

      for (const subject of daySubjects) {
        const session = await AttendanceSession.create({
          subject: subject._id,
          teacher: subject.teacher,
          date: date,
          startTime: new Date(date.getTime()),
          endTime: new Date(date.getTime() + 60 * 60 * 1000),
          status: 'completed',
          totalPresent: 0,
          totalAbsent: 0
        });

        let presentCount = 0;
        let absentCount = 0;

        for (const student of students) {
          // ~75-85% attendance rate on average
          const isPresent = Math.random() < 0.80;
          const status = isPresent ? 'present' : 'absent';
          const confidence = isPresent ? 0.75 + Math.random() * 0.2 : 0;

          await Attendance.create({
            student: student._id,
            subject: subject._id,
            teacher: subject.teacher,
            session: session._id,
            date: date,
            time: `${9 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            status,
            recognitionConfidence: parseFloat(confidence.toFixed(2)),
            attendanceMethod: isPresent ? 'ai' : 'manual'
          });

          if (isPresent) presentCount++;
          else absentCount++;
          totalRecords++;
        }

        session.totalPresent = presentCount;
        session.totalAbsent = absentCount;
        await session.save();
      }
    }
    console.log(`✅ ${totalRecords} attendance records created`);

    // Create sample notifications
    const threshold = parseInt(process.env.ATTENDANCE_THRESHOLD) || 75;
    for (const student of students.slice(0, 5)) {
      await Notification.create({
        user: student._id,
        title: 'Welcome to Smart Attendance',
        message: 'Your face has been registered successfully. You can now be automatically recognized during attendance.',
        type: 'success'
      });
    }

    await Notification.create({
      user: admin._id,
      title: 'System Ready',
      message: 'AI Smart Attendance Monitoring System has been configured with demo data.',
      type: 'info'
    });

    console.log('🔔 Sample notifications created');

    console.log('\n========================================');
    console.log('  🎉 Seed Data Created Successfully!');
    console.log('========================================');
    console.log('\n📋 Demo Login Credentials:');
    console.log('──────────────────────────────────');
    console.log('Admin:   admin@smartattendance.com / admin123');
    console.log('Teacher: teacher1@smartattendance.com / teacher123');
    console.log('Student: student1@smartattendance.com / student123');
    console.log('──────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
