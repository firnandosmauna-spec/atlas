import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Briefcase, AlertTriangle, CheckSquare, FileText, Settings, ShieldAlert, FolderOpen, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar = ({ isOpen = true }: SidebarProps = {}) => {
  const { hasPermission, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Beranda' },
    { to: '/portofolio', icon: <FileText size={20} />, label: 'Portofolio Klien' },
    { to: '/engagements', icon: <FolderOpen size={20} />, label: 'Manajemen Engagement' },
  ];

  return (
    <aside className={`bg-atlas-blue text-white flex flex-col transition-all duration-300 ease-in-out shrink-0 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="h-16 flex items-center justify-center border-b border-blue-800">
        <h1 className="text-2xl font-bold tracking-wider overflow-hidden">
          {isOpen ? (
            <>ATLAS<span className="text-atlas-accent font-light">WEB</span></>
          ) : (
            <>A<span className="text-atlas-accent font-light">W</span></>
          )}
        </h1>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-800 text-white font-medium' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <div className="shrink-0">{item.icon}</div>
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}

        <div className="pt-6 mt-6 border-t border-blue-800">
          <p className={`px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 transition-opacity duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            Admin Panel
          </p>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors overflow-hidden ${
                  isActive ? 'bg-indigo-700 text-white font-medium' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`
              }
            >
              <div className="shrink-0"><ShieldAlert size={20} /></div>
              <span className={`transition-opacity duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                Manajemen Sistem
              </span>
            </NavLink>
          </div>
      </nav>

      <div className="p-3 border-t border-blue-800 space-y-1">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg transition-colors overflow-hidden min-h-[44px] ${
              isActive ? 'bg-blue-800 text-white font-medium' : 'text-blue-200 hover:text-white hover:bg-blue-800'
            }`
          }
        >
          <div className="shrink-0"><Settings size={20} /></div>
          <span className={`transition-opacity duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            Pengaturan
          </span>
        </NavLink>

        <button 
          type="button"
          onClick={handleLogout}
          title="Keluar"
          aria-label="Keluar dari akun"
          className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg transition-colors overflow-hidden text-red-200 hover:text-white hover:bg-red-600/30 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 min-h-[44px]"
        >
          <div className="shrink-0"><LogOut size={20} /></div>
          <span className={`transition-opacity duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            Keluar
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
