import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineBookOpen, HiOutlineClipboardDocumentCheck, HiOutlineExclamationTriangle, HiOutlineCalendar } from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const { darkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard().then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Student Dashboard</h1><p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Track your attendance performance</p></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: HiOutlineClipboardDocumentCheck, title: 'Overall Attendance', value: `${data?.overallPercentage || 0}%`, gradient: data?.overallPercentage >= (data?.threshold || 75) ? 'from-emerald-600 to-teal-600' : 'from-red-600 to-rose-600' },
          { icon: HiOutlineBookOpen, title: 'Total Classes', value: data?.totalClasses || 0, gradient: 'from-blue-600 to-cyan-600' },
          { icon: HiOutlineCalendar, title: 'Present', value: data?.presentClasses || 0, gradient: 'from-violet-600 to-indigo-600' },
          { icon: HiOutlineExclamationTriangle, title: 'Absent', value: data?.absentClasses || 0, gradient: 'from-amber-500 to-orange-600' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4 shadow-lg`}><s.icon className="w-5 h-5 text-white" /></div>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{s.title}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {data?.warnings && data.warnings.length > 0 && (
        <div className={`rounded-2xl p-6 border border-amber-500/30 ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-amber-600 dark:text-amber-400">Attendance Warnings</h3>
          </div>
          <div className="space-y-2">
            {data.warnings.map((w, i) => (
              <p key={i} className={`text-sm ${darkMode ? 'text-amber-200/70' : 'text-amber-800'}`}>{w.message}</p>
            ))}
          </div>
        </div>
      )}

      {data?.subjectStats && data.subjectStats.length > 0 && (
        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-semibold mb-4">Subject-wise Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.subjectStats.map(s => ({ name: s.subject?.subjectCode || '', percentage: s.percentage, present: s.present, total: s.total }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} />
              <YAxis stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px' }} />
              <Bar dataKey="percentage" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
export default StudentDashboard;
