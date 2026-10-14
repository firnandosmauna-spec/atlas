import { useState } from 'react';
import { Outlet, useParams, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useEngagementStore } from '../store/engagementStore';
import { useAuthStore } from '../store/authStore';
import {
  Home, Briefcase, AlertTriangle, CheckSquare, FileText,
  ArrowLeft, Building2, Menu, X, Database, LogOut, FolderOpen
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
    { to: `/workspace/${id}`, icon: <Home size={16} />, label: 'Beranda Perikatan', end: true },
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
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-800 bg-slate-950 shrink-0">
          <NavLink 
            to="/dashboard"
            onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
            className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-white px-2 py-1.5 rounded hover:bg-slate-800 transition-colors min-h-[44px]"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft size={16} />
            <span>Dashboard Utama</span>
          </NavLink>
          <button 
            type="button"
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded min-h-[44px] min-w-[44px] flex items-center justify-center" 
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Tutup navigasi"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Main App Nav (Dashboard & Engagements) */}
        <div className="p-2 border-b border-slate-800 bg-slate-950/40 space-y-1 shrink-0">
          <NavLink
            to="/dashboard"
            onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-300 hover:text-white hover:bg-slate-800 rounded transition-colors min-h-[44px]"
          >
            <Home size={15} />
            <span>Dashboard Utama</span>
          </NavLink>
          <NavLink
            to="/engagements"
            onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors min-h-[44px]"
          >
            <FolderOpen size={15} />
            <span>Daftar Perikatan</span>
          </NavLink>
        </div>

        {/* Client Info */}
        <div className="px-4 py-3 border-b border-slate-800 shrink-0">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Klien Aktif</p>
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

        {/* Breadcrumb & Quick Back Navigation */}
        <div className="bg-white px-3 sm:px-6 py-2 border-b border-gray-200 flex items-center justify-between text-xs z-10 min-w-0">
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Buka menu navigasi lembar kerja"
              title="Menu Lembar Kerja"
              className="lg:hidden mr-2 p-1.5 text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 rounded min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            >
              <Menu size={18} />
            </button>

            {/* Direct Return to Dashboard Button */}
            <NavLink
              to="/dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-semibold transition-colors min-h-[44px] shrink-0"
              title="Kembali ke Dashboard Utama"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Dashboard Utama</span>
              <span className="sm:hidden">Dashboard</span>
            </NavLink>

            <span className="mx-1 text-gray-300 shrink-0">/</span>

            <NavLink
              to="/engagements"
              className="text-gray-500 hover:text-gray-900 font-medium truncate max-w-[70px] sm:max-w-none shrink-0"
              title="Ke Daftar Perikatan"
            >
              Perikatan
            </NavLink>

            <span className="mx-1 text-gray-300 shrink-0">/</span>

            <span className="text-gray-900 font-semibold truncate" title={engagement.clientName}>
              {engagement.clientName}
            </span>
          </div>

          <div className="hidden sm:flex items-center shrink-0 pl-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
              {engagement.id}
            </span>
          </div>
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
