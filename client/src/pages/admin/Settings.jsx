import { useTheme } from '../../context/ThemeContext';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';

const AdminSettings = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><HiOutlineCog6Tooth className="w-5 h-5" /> System Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
            <div><p className="text-sm font-medium">Dark Mode</p><p className="text-xs text-gray-500">Toggle between light and dark themes</p></div>
            <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-violet-600' : 'bg-gray-300'} relative`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="p-4 rounded-xl bg-gray-800/30">
            <p className="text-sm font-medium">Attendance Threshold</p>
            <p className="text-xs text-gray-500 mb-2">Minimum attendance percentage (configured in server .env)</p>
            <p className="text-lg font-bold text-violet-400">75%</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-800/30">
            <p className="text-sm font-medium">AI Confidence Threshold</p>
            <p className="text-xs text-gray-500 mb-2">Minimum confidence for face recognition</p>
            <p className="text-lg font-bold text-emerald-400">70%</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-800/30">
            <p className="text-sm font-medium">AI Service Status</p>
            <p className="text-xs text-gray-500 mb-2">Python FastAPI face recognition service</p>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-sm text-emerald-400">Connected (http://localhost:8000)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminSettings;
