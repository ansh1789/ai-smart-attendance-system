import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineBookOpen, HiOutlineClipboardDocumentCheck, HiOutlineCamera, HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const { darkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard().then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Teacher Dashboard</h1><p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Welcome back</p></div>
        <Link to="/teacher/take-attendance" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:-translate-y-0.5">
          <HiOutlineCamera className="w-4 h-4" /> Start Attendance
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: HiOutlineBookOpen, title: 'My Subjects', value: data?.totalSubjects || 0, gradient: 'from-emerald-600 to-teal-600' },
          { icon: HiOutlineClipboardDocumentCheck, title: "Today's Attendance", value: data?.todayPresent || 0, gradient: 'from-violet-600 to-indigo-600' },
          { icon: HiOutlineArrowTrendingUp, title: 'Active Sessions', value: data?.activeSessions?.length || 0, gradient: 'from-amber-500 to-orange-600' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4 shadow-lg`}><s.icon className="w-5 h-5 text-white" /></div>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{s.title}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Subject Stats */}
      {data?.subjectStats && data.subjectStats.length > 0 && (
        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-semibold mb-4">Subject-wise Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.subjectStats.map(s => ({ name: s.subject?.subjectCode || '', percentage: s.percentage, present: s.present, total: s.total }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} />
              <YAxis stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px' }} />
              <Bar dataKey="percentage" fill="#10b981" radius={[8, 8, 0, 0]} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Records */}
      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-semibold mb-4">Recent Attendance Records</h3>
        <div className="space-y-2">
          {data?.recentRecords?.length > 0 ? data.recentRecords.map((r, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${r.status === 'present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div><p className="text-sm font-medium">{r.student?.name}</p><p className="text-xs text-gray-500">{r.subject?.subjectName}</p></div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${r.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{r.status}</span>
            </div>
          )) : <p className="text-sm text-gray-500">No recent records</p>}
        </div>
      </div>
    </div>
  );
};
export default TeacherDashboard;
