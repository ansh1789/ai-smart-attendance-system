import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { HiOutlineLightBulb } from 'react-icons/hi2';

const AdminAnalytics = () => {
  const { darkMode } = useTheme();
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, insightRes] = await Promise.all([analyticsAPI.getDashboard(), analyticsAPI.getInsights()]);
        setData(dashRes.data.data);
        setInsights(insightRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Analytics</h1>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-semibold mb-4">Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937' : '#e5e7eb'} />
              <XAxis dataKey="day" stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} />
              <YAxis stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} />
              <Tooltip contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px' }} />
              <Bar dataKey="present" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="total" fill={darkMode ? '#374151' : '#e5e7eb'} radius={[4, 4, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-semibold mb-4">Attendance Percentage Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937' : '#e5e7eb'} />
              <XAxis dataKey="day" stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} />
              <YAxis stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart Insights */}
      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineLightBulb className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">Smart Attendance Insights</h3>
        </div>
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className={`p-4 rounded-xl border-l-4 ${
                insight.severity === 'error' ? 'border-red-500 bg-red-500/5' :
                insight.severity === 'warning' ? 'border-amber-500 bg-amber-500/5' :
                'border-blue-500 bg-blue-500/5'
              }`}>
                <p className="text-sm">{insight.message}</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Type: {insight.type?.replace('_', ' ')} | {insight.student?.name || insight.subject?.subjectName || ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No significant insights at this time. All attendance patterns appear normal.</p>
        )}
      </div>
    </div>
  );
};
export default AdminAnalytics;
