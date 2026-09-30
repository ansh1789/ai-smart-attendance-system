import { Link } from 'react-router-dom';
import { HiOutlineCpuChip, HiOutlineCamera, HiOutlineChartBar, HiOutlineShieldCheck, HiOutlineAcademicCap, HiOutlineBolt } from 'react-icons/hi2';

const Landing = () => {
  const features = [
    { icon: HiOutlineCamera, title: 'AI Face Recognition', desc: 'Automated student identification using advanced face detection and embedding comparison technology.' },
    { icon: HiOutlineBolt, title: 'Real-time Attendance', desc: 'Instant attendance marking with live camera feed and immediate student verification.' },
    { icon: HiOutlineChartBar, title: 'Smart Analytics', desc: 'Data-driven insights, attendance trends, and risk indicators to improve student engagement.' },
    { icon: HiOutlineShieldCheck, title: 'Secure & Private', desc: 'JWT authentication, encrypted embeddings, role-based access control, and privacy-first design.' },
    { icon: HiOutlineAcademicCap, title: 'Multi-Role System', desc: 'Dedicated dashboards for administrators, teachers, and students with role-based features.' },
    { icon: HiOutlineCpuChip, title: 'PDF & CSV Reports', desc: 'Generate comprehensive attendance reports with export to PDF and CSV formats.' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <HiOutlineCpuChip className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg">AI Smart Attendance</span>
        </div>
        <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5">
          Login →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-8">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          AI-Powered Attendance System
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Smart Attendance</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Monitoring System</span>
        </h1>
        <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Automate attendance tracking with AI-powered face recognition. Built for educational institutions seeking modern, efficient, and secure solutions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl font-semibold hover:shadow-xl hover:shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5">
            Get Started
          </Link>
          <a href="#features" className="px-8 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300">
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-20 max-w-lg mx-auto">
          {[['99.2%', 'Accuracy'], ['< 1s', 'Recognition'], ['3 Roles', 'Admin/Teacher/Student']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{val}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Everything you need for a modern, intelligent attendance management system.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mb-4 group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-all">
                <f.icon className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8 text-center">
        <p className="text-sm text-gray-500">© 2025 AI Smart Attendance System. Built for B.Tech Final Year Project.</p>
      </footer>
    </div>
  );
};

export default Landing;
