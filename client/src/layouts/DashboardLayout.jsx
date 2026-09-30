import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineAcademicCap, HiOutlineBookOpen,
  HiOutlineClipboardDocumentCheck, HiOutlineChartBar, HiOutlineDocumentText,
  HiOutlineBell, HiOutlineCog6Tooth, HiOutlineArrowRightOnRectangle,
  HiOutlineSun, HiOutlineMoon, HiOutlineBars3, HiOutlineXMark,
  HiOutlineCamera, HiOutlineUserCircle, HiOutlineCpuChip,
  HiOutlineClipboardDocumentList, HiOutlineFaceSmile
} from 'react-icons/hi2';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const base = `/${user?.role}`;
    if (user?.role === 'admin') {
      return [
        { to: `${base}/dashboard`, icon: HiOutlineHome, label: 'Dashboard' },
        { to: `${base}/students`, icon: HiOutlineAcademicCap, label: 'Students' },
        { to: `${base}/teachers`, icon: HiOutlineUsers, label: 'Teachers' },
        { to: `${base}/subjects`, icon: HiOutlineBookOpen, label: 'Subjects' },
        { to: `${base}/attendance`, icon: HiOutlineClipboardDocumentCheck, label: 'Attendance' },
        { to: `${base}/analytics`, icon: HiOutlineChartBar, label: 'Analytics' },
        { to: `${base}/reports`, icon: HiOutlineDocumentText, label: 'Reports' },
        { to: `${base}/notifications`, icon: HiOutlineBell, label: 'Notifications' },
        { to: `${base}/settings`, icon: HiOutlineCog6Tooth, label: 'Settings' },
      ];
    }
    if (user?.role === 'teacher') {
      return [
        { to: `${base}/dashboard`, icon: HiOutlineHome, label: 'Dashboard' },
        { to: `${base}/subjects`, icon: HiOutlineBookOpen, label: 'My Subjects' },
        { to: `${base}/take-attendance`, icon: HiOutlineCamera, label: 'Take Attendance' },
        { to: `${base}/attendance`, icon: HiOutlineClipboardDocumentCheck, label: 'History' },
        { to: `${base}/analytics`, icon: HiOutlineChartBar, label: 'Analytics' },
        { to: `${base}/reports`, icon: HiOutlineDocumentText, label: 'Reports' },
        { to: `${base}/profile`, icon: HiOutlineUserCircle, label: 'Profile' },
      ];
    }
    return [
      { to: `${base}/dashboard`, icon: HiOutlineHome, label: 'Dashboard' },
      { to: `${base}/attendance`, icon: HiOutlineClipboardDocumentCheck, label: 'My Attendance' },
      { to: `${base}/face-registration`, icon: HiOutlineFaceSmile, label: 'Face Registration' },
      { to: `${base}/notifications`, icon: HiOutlineBell, label: 'Notifications' },
      { to: `${base}/profile`, icon: HiOutlineUserCircle, label: 'Profile' },
    ];
  };

  const navItems = getNavItems();

  const roleColors = {
    admin: 'from-violet-600 to-indigo-600',
    teacher: 'from-emerald-600 to-teal-600',
    student: 'from-blue-600 to-cyan-600'
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-72 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r`}>
        
        {/* Logo */}
        <div className={`h-16 flex items-center gap-3 px-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[user?.role] || roleColors.admin} flex items-center justify-center shadow-lg`}>
            <HiOutlineCpuChip className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">AI Attendance</h1>
            <p className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Smart System</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1">
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? `bg-gradient-to-r ${roleColors[user?.role] || roleColors.admin} text-white shadow-lg`
                  : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColors[user?.role] || roleColors.admin} flex items-center justify-center text-white text-sm font-bold`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
              <p className={`text-xs capitalize ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className={`sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 border-b backdrop-blur-xl
          ${darkMode ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <HiOutlineBars3 className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold capitalize">{user?.role} Panel</h2>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[user?.role] || roleColors.admin} flex items-center justify-center text-white text-xs font-bold`}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </button>

              {profileOpen && (
                <div className={`absolute right-0 top-12 w-48 rounded-xl shadow-2xl border py-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors`}
                  >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
