import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

const AdminStudents = () => {
  const { darkMode } = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: 'student123', userId: '', department: 'Computer Science', semester: 5, section: 'A' });

  const fetchStudents = async () => {
    try {
      const res = await studentAPI.getAll({ search });
      setStudents(res.data.data);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editStudent) {
        await studentAPI.update(editStudent._id, form);
        toast.success('Student updated');
      } else {
        await studentAPI.create(form);
        toast.success('Student created');
      }
      setShowModal(false);
      setEditStudent(null);
      setForm({ name: '', email: '', password: 'student123', userId: '', department: 'Computer Science', semester: 5, section: 'A' });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentAPI.delete(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch { toast.error('Delete failed'); }
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setForm({ name: s.name, email: s.email, userId: s.userId, department: s.department, semester: s.semester, section: s.section });
    setShowModal(true);
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{students.length} students registered</p>
        </div>
        <button onClick={() => { setEditStudent(null); setForm({ name: '', email: '', password: 'student123', userId: '', department: 'Computer Science', semester: 5, section: 'A' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
          <HiOutlinePlus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <HiOutlineMagnifyingGlass className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border`} />
      </div>

      {/* Table */}
      <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
              <tr>
                {['Name', 'Student ID', 'Email', 'Dept', 'Sem', 'Section', 'Face', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No students found</td></tr>
              ) : students.map(s => (
                <tr key={s._id} className={`${darkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">{s.name?.charAt(0)}</div>
                      <span className="text-sm font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{s.userId}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
                  <td className="px-4 py-3 text-sm">{s.department}</td>
                  <td className="px-4 py-3 text-sm">{s.semester}</td>
                  <td className="px-4 py-3 text-sm">{s.section}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${s.faceRegistered ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {s.faceRegistered ? 'Registered' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-violet-500/10 text-violet-400"><HiOutlinePencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editStudent ? 'Edit Student' : 'Add Student'}</h2>
              <button onClick={() => { setShowModal(false); setEditStudent(null); }} className="p-2 rounded-lg hover:bg-gray-800"><HiOutlineXMark className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <input className={inputClass} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Student ID</label>
                  <input className={inputClass} value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email</label>
                <input type="email" className={inputClass} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              {!editStudent && (
                <div>
                  <label className="block text-xs font-medium mb-1">Password</label>
                  <input className={inputClass} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Department</label>
                  <input className={inputClass} value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Semester</label>
                  <input type="number" min="1" max="8" className={inputClass} value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Section</label>
                  <input className={inputClass} value={form.section} onChange={e => setForm({...form, section: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                {editStudent ? 'Update Student' : 'Create Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
