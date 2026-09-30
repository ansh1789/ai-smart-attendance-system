import { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const StudentAttendance = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      attendanceAPI.getStudentAttendance(user._id)
        .then(res => setData(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Attendance Records</h1>
      
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : data?.records?.length === 0 ? (
        <p className="text-gray-500">No attendance records found.</p>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <tr>
                  {['Subject', 'Teacher', 'Date', 'Time', 'Status', 'Method'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {data.records.slice(0, 100).map(r => (
                  <tr key={r._id} className={`${darkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3 text-sm font-medium">{r.subject?.subjectName}</td>
                    <td className="px-4 py-3 text-sm">{r.teacher?.name}</td>
                    <td className="px-4 py-3 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">{r.time}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${r.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.attendanceMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
