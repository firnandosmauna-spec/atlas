import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell as BellIcon, User as UserIcon, ChevronDown, Menu, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEngagementStore } from '../store/engagementStore';
import type { Role, User } from '../store/authStore';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps = {}) => {
  const { user, login, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };
  const notifications = useEngagementStore(state => state.notifications);
  const markNotificationAsRead = useEngagementStore(state => state.markNotificationAsRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <UserIcon size={14} className="text-blue-500" />;
      case 'review_request': return <BellIcon size={14} className="text-yellow-500" />;
      case 'review_complete': return <BellIcon size={14} className="text-green-500" />;
      case 'revision': return <BellIcon size={14} className="text-orange-500" />;
      case 'overdue': return <BellIcon size={14} className="text-red-500" />;
      case 'approval': return <BellIcon size={14} className="text-purple-500" />;
      default: return <BellIcon size={14} className="text-gray-500" />;
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    // Mock updating the user role
    if (user) {
      const updatedUser: User = { ...user, role: newRole };
      login(updatedUser);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40 relative">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleSidebar}
            className="text-gray-500 hover:text-gray-900 focus:outline-none bg-gray-50 p-1.5 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 shrink-0">ATLAS</h2>
        </div>
        <GlobalSearch />
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1">
          <span className="text-xs text-gray-500 mr-2 uppercase font-bold tracking-wider">Simulate Role:</span>
          <select 
            value={user?.role || ''} 
            onChange={handleRoleChange}
            className="bg-transparent border-none text-sm font-semibold text-atlas-blue focus:ring-0 cursor-pointer outline-none"
          >
            <option value="Admin">Admin</option>
            <option value="Partner">Partner / Signing Partner</option>
            <option value="Manager">Manager / Reviewer</option>
            <option value="Auditor">Auditor / Team Member</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <div className="relative">
          <button 
            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-blue-50 text-atlas-blue' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <BellIcon size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                  {unreadCount > 0 && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {notifications.map(n => (
                        <li 
                          key={n.id} 
                          className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.link) window.location.href = n.link; // simple navigation
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`mt-0.5 p-1.5 rounded-full ${!n.isRead ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                              {getNotificationIcon(n.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className={`text-xs ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</h4>
                                <span className="text-[9px] text-gray-400">
                                  {new Date(n.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="relative border-l border-gray-200 pl-4" ref={userMenuRef}>
          <button
            type="button"
            id="user-menu-button"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            aria-label="Menu pengguna"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              if (showNotifications) setShowNotifications(false);
            }}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-blue min-h-[44px]"
          >
            <div className="w-8 h-8 bg-atlas-blue rounded-full flex items-center justify-center text-white shrink-0">
              <UserIcon size={16} />
            </div>
            <div className="text-sm hidden sm:block text-left">
              <p className="font-medium text-gray-700 leading-tight">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-500 leading-tight">{user?.role || 'No Role'}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                aria-labelledby="user-menu-button"
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-50 text-sm"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-slate-50">
                  <p className="text-[11px] text-gray-500 font-medium">Masuk sebagai</p>
                  <p className="font-semibold text-gray-900 truncate mt-0.5">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                  >
                    <Settings size={16} className="mr-3 text-gray-400" />
                    <span>Pengaturan Akun</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left font-medium"
                  >
                    <LogOut size={16} className="mr-3 text-red-500" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
