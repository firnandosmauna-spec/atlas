import { useState } from 'react';
import { Outlet, useParams, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEngagementStore } from '../store/engagementStore';
import { useAuthStore } from '../store/authStore';
import {
  Home, Briefcase, AlertTriangle, CheckSquare, FileText,
  ArrowLeft, Building2, Menu, X, Database, LogOut, FolderOpen
} from 'lucide-react';
import WorkspaceTopBar from '../components/WorkspaceTopBar';

const WorkspaceLayout = () => {
  const { id } = useParams<{ id: string }>();
  const { engagements } = useEngagementStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const engagement = engagements.find(e => e.id === id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const isWorksheet = location.pathname.includes('/worksheet/');

  // Floating tooltip state positioned via getBoundingClientRect (avoids all overflow clipping)
  const [tooltip, setTooltip] = useState<{
    label: string;
    top: number;
    left: number;
  } | null>(null);

  const handleMouseEnter = (label: string, e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const handleLogout = async () => {
    handleMouseLeave();
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

      {/* Sidebar - Collapses to icon-only mode (lg:w-20) instead of hiding completely on desktop */}
      <aside 
        className={`bg-slate-900 text-white flex flex-col shrink-0 z-30
          fixed inset-y-0 left-0 shadow-2xl lg:shadow-none lg:static
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width,transform]
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >

        {/* Top Bar */}
        <div className={`h-14 flex items-center border-b border-slate-800 bg-slate-950 shrink-0 px-3 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <NavLink 
            to="/dashboard"
            title="Dashboard Utama"
            onClick={() => {
              handleMouseLeave();
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            onMouseEnter={(e) => handleMouseEnter('Dashboard Utama', e)}
            onMouseLeave={handleMouseLeave}
            className={`flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-white py-1.5 rounded-lg hover:bg-slate-800 hover:translate-x-0.5 active:scale-95 transition-all duration-200 min-h-[44px] ${
              isSidebarOpen ? 'px-2' : 'justify-center w-full px-0'
            }`}
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0" />
            <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden hidden'}`}>
              Dashboard Utama
            </span>
          </NavLink>
          {isSidebarOpen && (
            <button 
              type="button"
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 active:scale-95 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center" 
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Tutup navigasi"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Quick Main App Nav (Dashboard & Engagements) */}
        <div className={`p-2 border-b border-slate-800 bg-slate-950/40 space-y-1 shrink-0 ${isSidebarOpen ? '' : 'flex flex-col items-center'}`}>
          <NavLink
            to="/dashboard"
            title="Dashboard Utama"
            onClick={() => {
              handleMouseLeave();
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            onMouseEnter={(e) => handleMouseEnter('Dashboard Utama', e)}
            onMouseLeave={handleMouseLeave}
            className={`group flex items-center rounded-lg transition-all duration-200 min-h-[40px] text-xs font-semibold text-blue-300 hover:text-white hover:bg-slate-800 active:scale-95 ${
              isSidebarOpen ? 'gap-2.5 px-3 py-2 w-full hover:translate-x-1' : 'justify-center w-10 h-10 p-0'
            }`}
          >
            <Home size={16} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden hidden'}`}>
              Dashboard Utama
            </span>
          </NavLink>
          <NavLink
            to="/engagements"
            title="Daftar Perikatan"
            onClick={() => {
              handleMouseLeave();
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            onMouseEnter={(e) => handleMouseEnter('Daftar Perikatan', e)}
            onMouseLeave={handleMouseLeave}
            className={`group flex items-center rounded-lg transition-all duration-200 min-h-[40px] text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 ${
              isSidebarOpen ? 'gap-2.5 px-3 py-2 w-full hover:translate-x-1' : 'justify-center w-10 h-10 p-0'
            }`}
          >
            <FolderOpen size={16} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden hidden'}`}>
              Daftar Perikatan
            </span>
          </NavLink>
        </div>

        {/* Client Info */}
        <div 
          className={`border-b border-slate-800 shrink-0 bg-slate-950/20 transition-all duration-200 ${
            isSidebarOpen ? 'px-4 py-3' : 'px-2 py-2.5 flex flex-col items-center justify-center'
          }`}
          title={`${engagement.clientName} (${engagement.id} · ${engagement.auditPeriod})`}
          onMouseEnter={(e) => !isSidebarOpen && handleMouseEnter(`${engagement.clientName} (${engagement.auditPeriod})`, e)}
          onMouseLeave={handleMouseLeave}
        >
          {isSidebarOpen ? (
            <>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Klien Aktif</p>
              <p className="text-sm font-semibold text-white truncate leading-tight" title={engagement.clientName}>
                {engagement.clientName}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{engagement.id} · {engagement.auditPeriod}</p>
            </>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-cyan-300 font-bold text-xs shadow-inner cursor-pointer">
              {engagement.clientName?.slice(0, 2).toUpperCase() || 'KL'}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">

          {/* General links */}
          {topNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              onClick={() => {
                handleMouseLeave();
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onMouseEnter={(e) => handleMouseEnter(item.label, e)}
              onMouseLeave={handleMouseLeave}
              className={({ isActive }) =>
                `relative group flex items-center rounded-lg transition-all duration-200 ease-out min-h-[44px] ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 active:scale-95'
                } ${isSidebarOpen ? 'gap-2.5 px-3 py-2.5 hover:translate-x-1' : 'justify-center px-0'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  )}
                  <div className={`shrink-0 transition-transform duration-200 ${isActive ? 'text-cyan-300' : 'group-hover:scale-110 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </div>
                  <span className={`truncate text-sm transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden hidden'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* Divider + Kertas Kerja label */}
          <div className={`mt-3 mb-1.5 transition-all duration-200 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
            {isSidebarOpen ? (
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Kertas Kerja</p>
            ) : (
              <div className="h-px bg-slate-800 w-full my-1" />
            )}
          </div>

          {/* Audit Cycle phases */}
          {cycleNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={`${item.code} - ${item.label}`}
              onClick={() => {
                handleMouseLeave();
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onMouseEnter={(e) => handleMouseEnter(`${item.code} · ${item.label}`, e)}
              onMouseLeave={handleMouseLeave}
              className={({ isActive }) =>
                `relative group flex items-center rounded-lg transition-all duration-200 ease-out min-h-[44px] ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-blue-600/95 to-blue-700/80 text-white font-semibold shadow-sm border border-blue-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 active:scale-95'
                } ${isSidebarOpen ? 'gap-2.5 px-3 py-2.5 hover:translate-x-1' : 'justify-center px-0'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(103,232,249,0.9)] animate-in fade-in duration-300" />
                  )}
                  <span className={`text-[10px] font-bold w-7 shrink-0 text-center py-1 rounded transition-colors ${
                    isActive 
                      ? 'bg-blue-800/80 text-cyan-200 border border-blue-400/40' 
                      : 'bg-slate-800/80 text-slate-300 border border-slate-700/60 group-hover:border-slate-600 group-hover:text-white'
                  }`}>
                    {item.code}
                  </span>
                  <span className={`truncate text-xs transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden hidden'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status strip at bottom */}
        <div 
          className={`border-t border-slate-800 shrink-0 bg-slate-950/20 transition-all duration-200 ${
            isSidebarOpen ? 'px-4 py-3' : 'px-2 py-2.5 flex flex-col items-center justify-center'
          }`}
          title={`Progress Perikatan: ${engagement.progress || 0}%`}
          onMouseEnter={(e) => !isSidebarOpen && handleMouseEnter(`Progress: ${engagement.progress || 0}%`, e)}
          onMouseLeave={handleMouseLeave}
        >
          {isSidebarOpen ? (
            <>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Progress Perikatan</span>
                <span className="text-[10px] font-bold text-cyan-300">{engagement.progress || 0}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full w-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{ width: `${engagement.progress || 0}%` }}
                />
              </div>
            </>
          ) : (
            <span className="text-[10px] font-bold text-cyan-300 font-mono">
              {engagement.progress || 0}%
            </span>
          )}
        </div>

        {/* Workspace Sidebar Logout button */}
        <div className={`p-2 border-t border-slate-800 shrink-0 bg-slate-950/40 ${isSidebarOpen ? '' : 'flex justify-center'}`}>
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar dari Workspace"
            aria-label="Keluar dari akun"
            onMouseEnter={(e) => handleMouseEnter('Keluar dari Workspace', e)}
            onMouseLeave={handleMouseLeave}
            className={`group flex items-center rounded-lg hover:translate-x-1 active:scale-95 transition-all duration-200 text-xs font-medium text-red-400 hover:text-white hover:bg-red-600/30 hover:border-red-500/40 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 min-h-[44px] ${
              isSidebarOpen ? 'gap-2.5 w-full px-3 py-2' : 'justify-center w-10 h-10 p-0'
            }`}
          >
            <LogOut size={16} className="shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden hidden'}`}>
              Keluar
            </span>
          </button>
        </div>

        {/* Global Fixed Floating Tooltip on Icon/Menu Hover */}
        {tooltip && (
          <div 
            style={{ 
              top: `${tooltip.top}px`, 
              left: `${tooltip.left}px` 
            }}
            className="fixed -translate-y-1/2 z-[9999] pointer-events-none flex items-center"
          >
            <div className="relative px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-2xl border border-slate-700/80 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1.5">
              <span>{tooltip.label}</span>
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900/95" />
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Exactly ONE Top Bar: Consolidates global header, breadcrumbs, and worksheet actions/code */}
        <WorkspaceTopBar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          engagement={engagement}
        />

        <main className={`flex-1 min-w-0 relative flex flex-col ${
          isWorksheet 
            ? 'overflow-hidden p-0' 
            : 'overflow-y-auto p-3 sm:p-6 lg:p-8 scroll-smooth'
        }`}>
          <div className="flex-1 w-full max-w-full h-full flex flex-col">
            <Outlet context={{ engagement }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
