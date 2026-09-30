import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineUserCircle } from 'react-icons/hi2';

const Profile = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <div className={`rounded-2xl p-8 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-3xl font-bold mb-3">
            {user?.name?.charAt(0)}
          </div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <span className={`px-3 py-1 rounded-lg text-xs font-medium mt-1 capitalize ${user?.role === 'teacher' ? 'bg-emerald-500/10 text-emerald-400' : user?.role === 'admin' ? 'bg-violet-500/10 text-violet-400' : 'bg-blue-500/10 text-blue-400'}`}>{user?.role}</span>
        </div>
        <div className="space-y-4">
          {[
            ['Email', user?.email],
            ['User ID', user?.userId],
            ['Department', user?.department],
            ...(user?.role === 'student' ? [['Semester', user?.semester], ['Section', user?.section], ['Face Registered', user?.faceRegistered ? 'Yes ✓' : 'Not yet']] : [])
          ].map(([label, value]) => value ? (
            <div key={label} className={`flex justify-between items-center p-3 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ) : null)}
        </div>
      </div>
    </div>
  );
};
export default Profile;
