import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineCpuChip, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(`/${user.role}/dashboard`);
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { role: 'Admin', email: 'admin@smartattendance.com', password: 'admin123', color: 'from-violet-600 to-indigo-600' },
    { role: 'Teacher', email: 'teacher1@smartattendance.com', password: 'teacher123', color: 'from-emerald-600 to-teal-600' },
    { role: 'Student', email: 'student1@smartattendance.com', password: 'student123', color: 'from-blue-600 to-cyan-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <HiOutlineCpuChip className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to AI Smart Attendance System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-xl">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6">
          <p className="text-center text-gray-500 text-xs mb-3">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            {demoLogins.map((d) => (
              <button
                key={d.role}
                onClick={() => { setEmail(d.email); setPassword(d.password); }}
                className={`py-2 px-3 rounded-xl bg-gradient-to-r ${d.color} text-white text-xs font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
              >
                {d.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
