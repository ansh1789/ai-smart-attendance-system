import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminTeachers from './pages/admin/Teachers';
import AdminSubjects from './pages/admin/Subjects';
import AdminAttendance from './pages/admin/Attendance';
import AdminAnalytics from './pages/admin/Analytics';
import AdminReports from './pages/admin/Reports';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherSubjects from './pages/teacher/Subjects';
import TakeAttendance from './pages/teacher/TakeAttendance';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherAnalytics from './pages/teacher/Analytics';
import TeacherReports from './pages/teacher/Reports';
import TeacherProfile from './pages/teacher/Profile';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import FaceRegistration from './pages/student/FaceRegistration';
import StudentNotifications from './pages/student/Notifications';
import StudentProfile from './pages/student/Profile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
};

function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="subjects" element={<TeacherSubjects />} />
        <Route path="take-attendance" element={<TakeAttendance />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="analytics" element={<TeacherAnalytics />} />
        <Route path="reports" element={<TeacherReports />} />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="face-registration" element={<FaceRegistration />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
