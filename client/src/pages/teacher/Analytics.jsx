import { useState, useEffect } from 'react';
import { analyticsAPI, subjectAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TeacherAnalytics = () => {
  const { darkMode } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { subjectAPI.getAll().then(res => setSubjects(res.data.data)).catch(() => {}); }, []);

  const loadAnalytics = async (id) => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getSubjectAnalytics(id);
      setSubjectData(res.data.data);
    } catch { console.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedSubject) loadAnalytics(selectedSubject); }, [selectedSubject]);

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Analytics</h1>
      <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
        className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200'} border`}>
        <option value="">Select Subject</option>
        {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>)}
      </select>

      {loading && <div className="flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}

      {subjectData && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <h3 className="font-semibold mb-4">Overall: {subjectData.overall?.percentage}%</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={[{ name: 'Present', value: subjectData.overall?.present }, { name: 'Absent', value: subjectData.overall?.absent }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {[0, 1].map(i => <Cell key={i} fill={COLORS[i]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>

          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <h3 className="font-semibold mb-4">Student-wise Attendance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectData.studentStats?.slice(0, 10).map(s => ({ name: s.student?.name?.split(' ')[0], pct: s.percentage }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937' : '#e5e7eb'} />
                <XAxis dataKey="name" fontSize={10} stroke={darkMode ? '#6b7280' : '#9ca3af'} />
                <YAxis fontSize={10} stroke={darkMode ? '#6b7280' : '#9ca3af'} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px' }} />
                <Bar dataKey="pct" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {subjectData.dailyTrend?.length > 0 && (
            <div className={`lg:col-span-2 rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h3 className="font-semibold mb-4">Daily Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectData.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937' : '#e5e7eb'} />
                  <XAxis dataKey="date" fontSize={10} stroke={darkMode ? '#6b7280' : '#9ca3af'} />
                  <YAxis fontSize={10} stroke={darkMode ? '#6b7280' : '#9ca3af'} />
                  <Tooltip contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default TeacherAnalytics;
