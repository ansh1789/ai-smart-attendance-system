import { useState, useEffect } from 'react';
import { subjectAPI, teacherAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineXMark } from 'react-icons/hi2';

const AdminSubjects = () => {
  const { darkMode } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [form, setForm] = useState({ subjectCode: '', subjectName: '', teacher: '', semester: 5, section: 'A', department: 'Computer Science' });

  const fetchData = async () => {
    try {
      const [subRes, tchRes] = await Promise.all([subjectAPI.getAll(), teacherAPI.getAll()]);
      setSubjects(subRes.data.data);
      setTeachers(tchRes.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editSubject) { await subjectAPI.update(editSubject._id, form); toast.success('Updated'); }
      else { await subjectAPI.create(form); toast.success('Created'); }
      setShowModal(false); setEditSubject(null); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await subjectAPI.delete(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Subjects</h1><p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subjects.length} subjects</p></div>
        <button onClick={() => { setEditSubject(null); setForm({ subjectCode: '', subjectName: '', teacher: '', semester: 5, section: 'A', department: 'Computer Science' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
          <HiOutlinePlus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="text-gray-500">Loading...</p> : subjects.map(s => (
          <div key={s._id} className={`rounded-2xl p-5 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'} hover:border-violet-500/30 transition-all`}>
            <div className="flex items-start justify-between mb-3">
              <span className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-bold">{s.subjectCode}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditSubject(s); setForm({ subjectCode: s.subjectCode, subjectName: s.subjectName, teacher: s.teacher?._id, semester: s.semester, section: s.section, department: s.department }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-violet-500/10 text-violet-400"><HiOutlinePencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <h3 className="font-semibold text-sm mb-2">{s.subjectName}</h3>
            <div className={`space-y-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <p>Teacher: {s.teacher?.name || 'N/A'}</p>
              <p>Semester {s.semester} | Section {s.section}</p>
              <p>{s.department}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editSubject ? 'Edit Subject' : 'Add Subject'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-800"><HiOutlineXMark className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1">Code</label><input className={inputClass} value={form.subjectCode} onChange={e => setForm({...form, subjectCode: e.target.value})} required /></div>
                <div><label className="block text-xs font-medium mb-1">Name</label><input className={inputClass} value={form.subjectName} onChange={e => setForm({...form, subjectName: e.target.value})} required /></div>
              </div>
              <div><label className="block text-xs font-medium mb-1">Teacher</label>
                <select className={inputClass} value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} required>
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium mb-1">Semester</label><input type="number" min="1" max="8" className={inputClass} value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})} /></div>
                <div><label className="block text-xs font-medium mb-1">Section</label><input className={inputClass} value={form.section} onChange={e => setForm({...form, section: e.target.value})} /></div>
                <div><label className="block text-xs font-medium mb-1">Department</label><input className={inputClass} value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">{editSubject ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSubjects;
