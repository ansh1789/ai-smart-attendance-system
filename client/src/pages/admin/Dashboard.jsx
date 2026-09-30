import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineAcademicCap, HiOutlineUsers, HiOutlineBookOpen, HiOutlineClipboardDocumentCheck, HiOutlineExclamationTriangle, HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ icon: Icon, title, value, subtitle, gradient, darkMode }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full -translate-y-8 translate-x-8`} />
    <div className="relative">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{subtitle}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { darkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsAPI.getDashboard();
        setData(res.data.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#ef4444', '#f59e0b'];
  const pieData = data ? [
    { name: 'Present', value: data.todayPresent || 0 },
    { name: 'Absent', value: Math.max(0, (data.todayAttendance || 0) - (data.todayPresent || 0)) },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Overview of the attendance monitoring system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiOutlineAcademicCap} title="Total Students" value={data?.totalStudents || 0} gradient="from-blue-600 to-cyan-600" darkMode={darkMode} />
        <StatCard icon={HiOutlineUsers} title="Total Teachers" value={data?.totalTeachers || 0} gradient="from-emerald-600 to-teal-600" darkMode={darkMode} />
        <StatCard icon={HiOutlineBookOpen} title="Total Subjects" value={data?.totalSubjects || 0} gradient="from-violet-600 to-indigo-600" darkMode={darkMode} />
        <StatCard icon={HiOutlineClipboardDocumentCheck} title="Avg. Attendance" value={`${data?.avgAttendance || 0}%`} subtitle={`Threshold: ${data?.threshold}%`} gradient="from-amber-500 to-orange-600" darkMode={darkMode} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Attendance Trend */}
        <div className={`lg:col-span-2 rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-semibold mb-4">Attendance Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data?.trend || []}>
              <defs>
                <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937' : '#e5e7eb'} />
              <XAxis dataKey="day" stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} />
              <YAxis stroke={darkMode ? '#6b7280' : '#9ca3af'} fontSize={12} />
              <Tooltip contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} />
              <Area type="monotone" dataKey="percentage" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorPct)" name="Attendance %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Stats Pie */}
        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-semibold mb-4">Today's Attendance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-500" /><span className="text-xs">Present</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs">Absent</span></div>
          </div>
        </div>
      </div>

      {/* Low Attendance & Recent */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Low Attendance Students */}
        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Low Attendance Students</h3>
          </div>
          {data?.lowAttendanceStudents?.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.lowAttendanceStudents.map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-red-400">{item.student?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.student?.name}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.student?.userId}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${item.percentage < 60 ? 'text-red-400' : 'text-amber-400'}`}>{item.percentage}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>All students are above the attendance threshold.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineArrowTrendingUp className="w-5 h-5 text-violet-500" />
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          {data?.recentActivity?.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.recentActivity.map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{item.student?.name || 'Unknown'}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.subject?.subjectName || ''}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${item.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
