import { useState, useEffect } from 'react';
import { reportAPI, subjectAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineDocumentArrowDown, HiOutlineTableCells } from 'react-icons/hi2';

const AdminReports = () => {
  const { darkMode } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({ subjectId: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    subjectAPI.getAll().then(res => setSubjects(res.data.data)).catch(() => {});
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getReport(filters);
      setReportData(res.data.data);
    } catch { toast.error('Failed to generate report'); }
    finally { setLoading(false); }
  };

  const downloadCSV = async () => {
    try {
      const res = await reportAPI.exportCSV(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', 'attendance_report.csv');
      document.body.appendChild(link); link.click(); link.remove();
      toast.success('CSV downloaded');
    } catch { toast.error('CSV export failed'); }
  };

  const downloadPDF = async () => {
    try {
      const res = await reportAPI.exportPDF(filters);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', 'attendance_report.pdf');
      document.body.appendChild(link); link.click(); link.remove();
      toast.success('PDF downloaded');
    } catch { toast.error('PDF export failed'); }
  };

  const inputClass = `px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Reports</h1>

      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-semibold mb-4">Report Filters</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          <select className={inputClass} value={filters.subjectId} onChange={e => setFilters({...filters, subjectId: e.target.value})}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
          </select>
          <input type="date" className={inputClass} value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          <input type="date" className={inputClass} value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          <button onClick={generateReport} disabled={loading} className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <>
          <div className="flex gap-3">
            <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              <HiOutlineTableCells className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              <HiOutlineDocumentArrowDown className="w-4 h-4" /> Export PDF
            </button>
          </div>

          <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
                  <tr>{['Student', 'Student ID', 'Present', 'Absent', 'Total', 'Percentage'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {reportData.reportData?.map((r, i) => (
                    <tr key={i} className={`${darkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-4 py-3 text-sm font-medium">{r.student?.name}</td>
                      <td className="px-4 py-3 text-sm">{r.student?.userId}</td>
                      <td className="px-4 py-3 text-sm text-emerald-400">{r.present}</td>
                      <td className="px-4 py-3 text-sm text-red-400">{r.absent}</td>
                      <td className="px-4 py-3 text-sm">{r.total}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${r.percentage >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{r.percentage}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AdminReports;
