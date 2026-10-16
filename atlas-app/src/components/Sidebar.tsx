import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Briefcase, AlertTriangle, CheckSquare, FileText, Settings, ShieldAlert, ShieldCheck, FolderOpen, LogOut, X, Calculator, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppConfigStore } from '../store/appConfigStore';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps = {}) => {
  const { hasPermission, logout } = useAuthStore();
  const { appName, appShortName } = useAppConfigStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Beranda' },
    { to: '/portofolio', icon: <FileText size={20} />, label: 'Portofolio Klien' },
    { to: '/engagements', icon: <FolderOpen size={20} />, label: 'Manajemen Engagement' },
    { to: '/fee-calculator', icon: <Calculator size={20} />, label: 'Kalkulator Fee Audit' },
    { to: '/pmpj', icon: <ShieldCheck size={20} />, label: 'Modul PMPJ (AML/KYC)' },
  ];

  return (
    <aside 
      className={`bg-atlas-blue text-white flex flex-col shrink-0 z-50
        fixed inset-y-0 left-0 shadow-2xl lg:shadow-none lg:static
        transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width,transform]
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isOpen ? 'lg:w-64' : 'lg:w-20'}
      `}
    >
      {/* Header / Brand Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-blue-800/80 bg-blue-950/20">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-900/90 border border-blue-700/80 flex items-center justify-center shrink-0 shadow-inner text-cyan-300 font-extrabold text-xs transition-transform duration-300 hover:scale-105">
            {appShortName?.slice(0, 2) || 'AT'}
          </div>

          <div className={`flex flex-col transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'}`}>
            <h1 
              className={`font-bold uppercase tracking-wider text-white truncate ${
                (appName?.length || 0) > 16 ? 'text-xs tracking-tight' : 'text-sm tracking-wide'
              }`}
              title={appName}
            >
              {appName || 'ATLAS AUDIT'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-[10px] font-medium text-blue-200/80 tracking-normal">Sistem Aktif</span>
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup navigasi"
          className="lg:hidden text-blue-200 hover:text-white p-2 rounded-lg hover:bg-blue-800/80 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-x-hidden overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `relative group flex items-center px-3.5 py-3 rounded-xl transition-all duration-200 ease-out ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-800/95 via-blue-800/90 to-blue-900/70 text-white font-semibold shadow-sm border border-blue-700/60' 
                  : 'text-blue-100/90 hover:text-white hover:bg-blue-800/50 hover:translate-x-1 active:scale-[0.98]'
              } ${!isOpen ? 'justify-center lg:px-0' : 'space-x-3'}`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active neon accent pill */}
                {isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-in fade-in duration-300" />
                )}

                {/* Icon with smooth micro-animation */}
                <div className={`shrink-0 transition-transform duration-200 ${isActive ? 'text-cyan-300 scale-105' : 'group-hover:scale-110 group-hover:text-cyan-200'}`}>
                  {item.icon}
                </div>

                {/* Label with smooth width & opacity fade */}
                <span className={`transition-all duration-300 whitespace-nowrap text-sm ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                  {item.label}
                </span>

                {/* Collapsed Mode Floating Tooltip */}
                {!isOpen && (
                  <div className="hidden lg:flex items-center absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900/95" />
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Admin Panel Section */}
        <div className="pt-5 mt-5 border-t border-blue-800/60">
          <p className={`px-3 text-[11px] font-semibold text-blue-300/80 uppercase tracking-wider mb-2 transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden mb-0'}`}>
            Admin Panel
          </p>
          <NavLink
            to="/admin"
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `relative group flex items-center px-3.5 py-3 rounded-xl transition-all duration-200 ease-out ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-700/90 to-indigo-800/80 text-white font-semibold shadow-sm border border-indigo-600/70' 
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/40 hover:translate-x-1 active:scale-[0.98]'
              } ${!isOpen ? 'justify-center lg:px-0' : 'space-x-3'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-300 rounded-full shadow-[0_0_8px_rgba(165,180,252,0.8)] animate-in fade-in duration-300" />
                )}
                <div className={`shrink-0 transition-transform duration-200 ${isActive ? 'text-indigo-200 scale-105' : 'group-hover:scale-110 group-hover:text-indigo-100'}`}>
                  <ShieldAlert size={20} />
                </div>
                <span className={`transition-all duration-300 whitespace-nowrap text-sm ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                  Manajemen Sistem
                </span>
                {!isOpen && (
                  <div className="hidden lg:flex items-center absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
                    Manajemen Sistem
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900/95" />
                  </div>
                )}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Footer Actions (Settings & Logout) */}
      <div className="p-3 border-t border-blue-800/80 space-y-1 bg-blue-950/20">
        <NavLink 
          to="/settings"
          onClick={() => onClose?.()}
          className={({ isActive }) =>
            `relative group flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-200 ease-out min-h-[44px] ${
              isActive 
                ? 'bg-blue-800/90 text-white font-semibold border border-blue-700/60 shadow-xs' 
                : 'text-blue-200 hover:text-white hover:bg-blue-800/50 hover:translate-x-1 active:scale-[0.98]'
            } ${!isOpen ? 'justify-center lg:px-0' : 'space-x-3'}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              )}
              <div className="shrink-0 group-hover:rotate-45 group-hover:scale-105 transition-transform duration-300 text-blue-200 group-hover:text-white">
                <Settings size={20} />
              </div>
              <span className={`transition-all duration-300 whitespace-nowrap text-sm ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                Pengaturan
              </span>
              {!isOpen && (
                <div className="hidden lg:flex items-center absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
                  Pengaturan
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900/95" />
                </div>
              )}
            </>
          )}
        </NavLink>

        <button 
          type="button"
          onClick={handleLogout}
          title="Keluar"
          aria-label="Keluar dari akun"
          className={`relative group flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-200 ease-out text-red-200 hover:text-white hover:bg-red-600/30 hover:border-red-500/40 border border-transparent hover:translate-x-1 active:scale-[0.98] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 min-h-[44px] ${!isOpen ? 'justify-center lg:px-0' : 'space-x-3'}`}
        >
          <div className="shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200">
            <LogOut size={20} />
          </div>
          <span className={`transition-all duration-300 whitespace-nowrap text-sm ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>
            Keluar
          </span>
          {!isOpen && (
            <div className="hidden lg:flex items-center absolute left-full ml-3 px-3 py-1.5 bg-red-950/95 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-xl border border-red-800/80 whitespace-nowrap z-50 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
              Keluar
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-red-950/95" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

