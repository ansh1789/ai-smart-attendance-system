import { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const TeacherAttendance = () => {
  const { darkMode } = useTheme();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.getAll().then(res => setRecords(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance History</h1>
      <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
              <tr>{['Student', 'Subject', 'Date', 'Time', 'Status', 'Method', 'Confidence'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr> :
              records.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No records</td></tr> :
              records.slice(0, 100).map(r => (
                <tr key={r._id} className={`${darkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-3 text-sm font-medium">{r.student?.name}</td>
                  <td className="px-4 py-3 text-sm">{r.subject?.subjectName}</td>
                  <td className="px-4 py-3 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">{r.time}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${r.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{r.status}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs ${r.attendanceMethod === 'ai' ? 'bg-violet-500/10 text-violet-400' : 'text-gray-400'}`}>{r.attendanceMethod}</span></td>
                  <td className="px-4 py-3 text-sm">{r.recognitionConfidence ? `${Math.round(r.recognitionConfidence * 100)}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default TeacherAttendance;
