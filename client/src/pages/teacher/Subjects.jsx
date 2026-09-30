import { useState, useEffect } from 'react';
import { subjectAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const TeacherSubjects = () => {
  const { darkMode } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subjectAPI.getAll().then(res => setSubjects(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Subjects</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="text-gray-500">Loading...</p> : subjects.map(s => (
          <div key={s._id} className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'} hover:border-emerald-500/30 transition-all`}>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold">{s.subjectCode}</span>
            <h3 className="font-semibold text-lg mt-3">{s.subjectName}</h3>
            <div className={`mt-3 space-y-1 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <p>Semester {s.semester} | Section {s.section}</p>
              <p>{s.department}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TeacherSubjects;
