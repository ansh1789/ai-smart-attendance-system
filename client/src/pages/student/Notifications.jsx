import { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineInformationCircle, HiOutlineXCircle } from 'react-icons/hi2';

const NotificationsPage = () => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try { const res = await notificationAPI.getAll(); setNotifications(res.data.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const markAllRead = async () => {
    try { await notificationAPI.markAllAsRead(); fetch(); toast.success('All marked as read'); }
    catch { toast.error('Failed'); }
  };

  const markRead = async (id) => {
    try { await notificationAPI.markAsRead(id); fetch(); }
    catch {}
  };

  const icons = { success: HiOutlineCheckCircle, warning: HiOutlineExclamationTriangle, info: HiOutlineInformationCircle, error: HiOutlineXCircle };
  const colors = { success: 'text-emerald-400', warning: 'text-amber-400', info: 'text-blue-400', error: 'text-red-400' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1></div>
        <button onClick={markAllRead} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">Mark All Read</button>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-gray-500">Loading...</p> :
        notifications.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <HiOutlineBell className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) :
        notifications.map(n => {
          const Icon = icons[n.type] || HiOutlineInformationCircle;
          return (
            <div key={n._id} onClick={() => !n.read && markRead(n._id)}
              className={`rounded-xl p-4 cursor-pointer transition-all ${
                n.read ? (darkMode ? 'bg-gray-900/50 border border-gray-800/50' : 'bg-gray-50 border border-gray-200')
                : (darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm')
              }`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colors[n.type]}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${n.read ? 'opacity-60' : ''}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-violet-500" />}
                  </div>
                  <p className={`text-sm mt-0.5 ${n.read ? 'opacity-50' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{n.message}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default NotificationsPage;
