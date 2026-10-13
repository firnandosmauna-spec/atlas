import { useState } from 'react';
import { Outlet, useParams, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useEngagementStore } from '../store/engagementStore';
import { useAuthStore } from '../store/authStore';
import {
  Home, Briefcase, AlertTriangle, CheckSquare, FileText,
  ArrowLeft, Building2, Menu, X, Database, LogOut
} from 'lucide-react';
import Header from '../components/Header';

const WorkspaceLayout = () => {
  const { id } = useParams<{ id: string }>();
  const { engagements } = useEngagementStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const engagement = engagements.find(e => e.id === id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!engagement) {
    return <Navigate to="/engagements" />;
  }

  const topNavItems = [
    { to: `/workspace/${id}`, icon: <Home size={16} />, label: 'Beranda', end: true },
    { to: `/workspace/${id}/trial-balance`, icon: <Database size={16} />, label: 'Data Keuangan (TB)' },
  ];

  const cycleNavItems = [
    { to: `/workspace/${id}/pra-perikatan`,  code: 'A.1', label: 'Pra Perikatan',          icon: <Briefcase size={15} />  },
    { to: `/workspace/${id}/risk-assessment`, code: 'A.2', label: 'Risk Assessment',         icon: <AlertTriangle size={15} /> },
    { to: `/workspace/${id}/risk-response`,   code: 'B',   label: 'Risk Response',           icon: <CheckSquare size={15} /> },
    { to: `/workspace/${id}/completing`,      code: 'C',   label: 'Completing & Reporting',  icon: <FileText size={15} />   },
    { to: `/workspace/${id}/general`,         code: 'D',   label: 'General',                 icon: <Database size={15} />   },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[240px] bg-slate-900 text-white flex flex-col h-full z-30 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-[240px]'}`}>

        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <NavLink to="/engagements" className="text-slate-500 hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </NavLink>
            <div className="flex items-center gap-1.5">
              <Building2 size={16} className="text-slate-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-300">Workspace</span>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Client Info */}
        <div className="px-4 py-3 border-b border-slate-800 shrink-0">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Klien</p>
          <p className="text-sm font-semibold text-white truncate leading-tight" title={engagement.clientName}>
            {engagement.clientName}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{engagement.id} · {engagement.auditPeriod}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-0.5">

          {/* General links */}
          {topNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors rounded min-h-[44px] ${
                  isActive
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Divider + Audit Cycle label */}
          <div className="mt-4 mb-2 px-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Siklus Audit</p>
          </div>

          {/* Audit Cycle phases */}
          {cycleNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors group rounded min-h-[44px] ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold border-l-2 border-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border-l-2 border-transparent'
                }`
              }
            >
              <span className={`text-[10px] font-bold w-6 shrink-0 text-center`}>
                {item.code}
              </span>
              <span className="truncate text-xs">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Status strip at bottom */}
        <div className="px-4 py-3 border-t border-slate-800 shrink-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Progress Perikatan</span>
            <span className="text-[10px] font-bold text-slate-300">{engagement.progress || 0}%</span>
          </div>
          <div className="h-1 bg-slate-700 w-full">
            <div
              className="h-1 bg-blue-500 transition-all duration-500"
              style={{ width: `${engagement.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Workspace Sidebar Logout button */}
        <div className="p-2 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar"
            aria-label="Keluar dari akun"
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-400 hover:text-red-200 hover:bg-red-950/40 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 min-h-[44px]"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Breadcrumb */}
        <div className="bg-white px-3 sm:px-6 py-2.5 border-b border-gray-200 flex items-center text-xs z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Buka menu navigasi"
            className="lg:hidden mr-3 p-1.5 text-gray-500 hover:text-gray-800 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu size={18} />
          </button>
          <span className="text-gray-400 font-medium">Workspace</span>
          <span className="mx-1.5 text-gray-300">/</span>
          <span className="text-gray-700 font-semibold truncate max-w-[200px] sm:max-w-xs">{engagement.clientName}</span>
        </div>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 relative scroll-smooth flex flex-col">
          <div className="flex-1 w-full max-w-full">
            <Outlet context={{ engagement }} />
          </div>
          <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 pb-2">
            Aplikasi ini adalah implementasi web independen berdasarkan dokumentasi ATLAS dan bukan merupakan produk resmi P2PK Kementerian Keuangan.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
