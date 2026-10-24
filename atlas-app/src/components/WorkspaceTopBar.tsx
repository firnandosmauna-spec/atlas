import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  ArrowLeft, 
  Check, 
  Save, 
  CheckCircle, 
  CheckCircle2, 
  MessageSquare, 
  Paperclip, 
  History, 
  Cloud, 
  RefreshCw, 
  AlertCircle, 
  Bell as BellIcon, 
  User as UserIcon, 
  ChevronDown, 
  Home, 
  FolderOpen, 
  Calculator, 
  Settings, 
  LogOut, 
  Info,
  Clock,
  Printer,
  Calendar
} from 'lucide-react';
import { useWorksheetHeaderStore } from '../store/worksheetHeaderStore';
import { useEngagementStore } from '../store/engagementStore';
import { useAuthStore } from '../store/authStore';
import type { Role, User } from '../store/authStore';
import ExportMenu from './ExportMenu';

interface WorkspaceTopBarProps {
  onToggleSidebar: () => void;
  engagement: {
    id: string;
    clientName: string;
    auditPeriod?: string;
  };
}

export const WorkspaceTopBar: React.FC<WorkspaceTopBarProps> = ({
  onToggleSidebar,
  engagement
}) => {
  const navigate = useNavigate();
  const headerData = useWorksheetHeaderStore((state) => state.headerData);
  const { user, login, logout } = useAuthStore();
  const { 
    isSyncing, 
    syncStatus, 
    syncWithCloud, 
    lastSyncedAt, 
    syncError,
    notifications,
    markNotificationAsRead 
  } = useEngagementStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowNotifications(false);
        setShowInfoPopover(false);
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

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    if (user) {
      const updatedUser: User = { ...user, role: newRole };
      login(updatedUser);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Not Started': return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Completed': return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'Uncompleted':
      case 'Incompleted': return 'bg-rose-100 text-rose-800 border border-rose-200';
      case 'Needs Revision': return 'bg-red-100 text-red-800 border border-red-200';
      case 'Reviewed': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Approved': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 z-30 relative shrink-0">
      
      {/* ============================================================== */}
      {/* 1. LEFT SECTION                                               */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        {/* Toggle Workspace Sidebar Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle menu sidebar"
          title="Buka/Tutup Sidebar"
          className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg border border-gray-200 transition-colors shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
        >
          <Menu size={18} />
        </button>

        {headerData ? (
          /* Worksheet Mode: Back Arrow + KKP Code + Title + Status */
          <>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 text-gray-600 hover:text-atlas-blue bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-lg transition-colors shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
              title="Kembali ke Halaman Sebelumnya"
              aria-label="Kembali"
            >
              <ArrowLeft size={16} />
            </button>

            {/* KKP Code Badge */}
            <span className="bg-atlas-blue text-white font-mono font-bold px-2.5 py-1 rounded-md text-xs tracking-wider shrink-0 shadow-2xs">
              {headerData.code}
            </span>

            {/* Worksheet Title & Purpose */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <h1 
                className="font-bold text-gray-900 text-xs sm:text-sm truncate tracking-tight"
                title={headerData.name}
              >
                {headerData.name}
              </h1>

              {/* Purpose Info Popover Button */}
              {headerData.purpose && (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowInfoPopover(!showInfoPopover)}
                    title="Informasi & Tujuan KKP"
                    aria-label="Informasi KKP"
                    className="p-1 text-gray-400 hover:text-atlas-blue hover:bg-blue-50 rounded transition-colors"
                  >
                    <Info size={15} />
                  </button>

                  {showInfoPopover && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowInfoPopover(false)} 
                      />
                      <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 text-xs text-gray-700 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                          <span className="font-bold text-gray-900 flex items-center gap-1.5">
                            <Info size={14} className="text-atlas-blue" />
                            Tujuan KKP {headerData.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowInfoPopover(false)}
                            className="text-gray-400 hover:text-gray-600 font-bold px-1"
                          >
                            &times;
                          </button>
                        </div>
                        <p className="italic leading-relaxed text-gray-600">
                          {headerData.purpose}
                        </p>
                        {headerData.lastUpdated && (
                          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock size={12} /> Terakhir diperbarui: {headerData.lastUpdated}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Status Pill */}
            <span className={`hidden md:inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${getStatusColor(headerData.status)}`}>
              {headerData.status}
            </span>

            {/* Reviewer Pill */}
            {headerData.reviewer && (
              <span className="hidden 2xl:inline-flex items-center text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0">
                <CheckCircle size={12} className="mr-1 text-green-600" /> {headerData.reviewer}
              </span>
            )}
          </>
        ) : (
          /* Non-Worksheet Mode: Breadcrumbs */
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 text-xs">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-1 px-2 py-1 text-atlas-blue hover:text-blue-800 hover:bg-blue-50 rounded font-semibold transition-colors shrink-0"
              title="Kembali ke Dashboard Utama"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>

            <span className="text-gray-300 shrink-0">/</span>

            <NavLink
              to="/engagements"
              className="text-gray-500 hover:text-gray-900 font-medium truncate max-w-[80px] sm:max-w-none shrink-0"
              title="Ke Daftar Perikatan"
            >
              Perikatan
            </NavLink>

            <span className="text-gray-300 shrink-0">/</span>

            <span className="text-gray-900 font-bold truncate text-xs sm:text-sm" title={engagement.clientName}>
              {engagement.clientName}
            </span>

            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200 shrink-0 ml-1">
              {engagement.id}
            </span>

            <span className="text-gray-300 shrink-0">/</span>

            <span className="text-atlas-blue font-bold text-xs sm:text-sm truncate">
              Data Master Perikatan
            </span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. RIGHT SECTION                                              */}
      {/* ============================================================== */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        
        {headerData ? (
          /* Worksheet Mode: Actions (Export, Save, Complete, Submit Review, Evidence, History) */
          <>
            <ExportMenu 
              worksheetCode={headerData.code} 
              clientName={headerData.clientName || engagement.clientName} 
            />

            {/* Print / Cetak Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-2.5 sm:px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-atlas-blue rounded-lg font-semibold active:scale-95 flex items-center transition-all text-xs min-h-[36px] shadow-2xs"
              title="Cetak Kertas Kerja ini (Print / PDF)"
            >
              <Printer size={14} className="mr-1 text-gray-600 shrink-0" />
              <span>Cetak</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={headerData.onSave}
              className={`px-2.5 sm:px-3 py-1.5 border rounded-lg font-semibold active:scale-95 flex items-center transition-all text-xs min-h-[36px] shadow-2xs ${
                headerData.saved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Simpan perubahan draf KKP"
            >
              {headerData.saved ? (
                <>
                  <Check size={14} className="mr-1 text-emerald-600 shrink-0" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <Save size={14} className="mr-1 text-gray-500 shrink-0" />
                  <span>Save</span>
                </>
              )}
            </button>

            {/* Complete Button */}
            {headerData.status !== 'Completed' && headerData.status !== 'Reviewed' && headerData.status !== 'Approved' && (
              <button
                type="button"
                onClick={() => headerData.onStatusChange('Completed')}
                className="hidden lg:flex px-2.5 sm:px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold active:scale-95 items-center transition-all text-xs min-h-[36px] shadow-2xs"
                title="Tandai Kertas Kerja Selesai"
              >
                <CheckCircle size={14} className="mr-1 text-emerald-600 shrink-0" />
                <span>Complete</span>
              </button>
            )}

            {/* Submit Review Button */}
            <button
              type="button"
              onClick={() => {
                headerData.onStatusChange('Reviewed');
                headerData.onTogglePanel('notes');
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-atlas-blue hover:bg-blue-800 text-white rounded-lg font-semibold active:scale-95 flex items-center transition-all text-xs min-h-[36px] shadow-xs"
              title="Ajukan Review & Buka Review Notes"
            >
              <MessageSquare size={14} className="mr-1 shrink-0" />
              <span className="hidden sm:inline">Submit&nbsp;</span>Review
              {headerData.unreadNotesCount && headerData.unreadNotesCount > 0 ? (
                <span className="ml-1.5 px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-bold">
                  {headerData.unreadNotesCount}
                </span>
              ) : null}
            </button>

            {/* Evidence Drawer Button */}
            <button
              type="button"
              onClick={() => headerData.onTogglePanel('evidence')}
              className={`hidden xl:flex px-2.5 py-1.5 border rounded-lg font-medium active:scale-95 items-center transition-all text-xs min-h-[36px] shadow-2xs ${
                headerData.activePanel === 'evidence'
                  ? 'bg-blue-50 border-blue-400 text-atlas-blue font-semibold ring-1 ring-blue-300'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Kelola Berkas Bukti (Evidence)"
            >
              <Paperclip size={14} className="mr-1 text-gray-500 shrink-0" />
              <span>Evidence</span>
            </button>

            {/* History / Audit Trail Button */}
            <button
              type="button"
              onClick={() => headerData.onTogglePanel('audit_trail')}
              className={`hidden 2xl:flex px-2.5 py-1.5 border rounded-lg font-medium active:scale-95 items-center transition-all text-xs min-h-[36px] shadow-2xs ${
                headerData.activePanel === 'audit_trail'
                  ? 'bg-blue-50 border-blue-400 text-atlas-blue font-semibold ring-1 ring-blue-300'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Riwayat Audit Trail KKP"
            >
              <History size={14} className="mr-1 text-gray-500 shrink-0" />
              <span>History</span>
            </button>

            {/* Subtle Divider */}
            <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block" />
          </>
        ) : (
          /* Non-Worksheet Mode: Role Switcher */
          <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-gray-500 mr-2 uppercase font-bold tracking-wider">Role:</span>
            <select 
              value={user?.role || ''} 
              onChange={handleRoleChange}
              className="bg-transparent border-none text-xs font-semibold text-atlas-blue focus:ring-0 cursor-pointer outline-none"
            >
              <option value="Admin">Admin</option>
              <option value="Partner/Akuntan Publik">Partner/AP</option>
              <option value="Manager">Manager</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Ketua Tim">Ketua Tim</option>
              <option value="Anggota Tim 1">Anggota Tim 1</option>
            </select>
          </div>
        )}

        {/* Cloud Sync Status Button */}
        <button
          type="button"
          onClick={() => syncWithCloud()}
          disabled={isSyncing}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-semibold transition-all min-h-[36px] ${
            isSyncing
              ? 'bg-blue-50 text-blue-700 border-blue-200 cursor-wait'
              : syncStatus === 'synced'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : syncStatus === 'error'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
          title={
            isSyncing 
              ? 'Sedang menyinkronkan data perikatan...' 
              : syncStatus === 'synced' 
                ? `Tersinkron dengan Cloud (${lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Baru saja'})` 
                : syncStatus === 'error' 
                  ? `Sinkronisasi terhambat: ${syncError || 'Klik untuk mencoba'}`
                  : 'Sinkronisasi dengan Supabase'
          }
        >
          {isSyncing ? (
            <RefreshCw size={14} className="animate-spin text-blue-600" />
          ) : syncStatus === 'synced' ? (
            <CheckCircle2 size={14} className="text-emerald-600" />
          ) : syncStatus === 'error' ? (
            <AlertCircle size={14} className="text-amber-600" />
          ) : (
            <Cloud size={14} className="text-gray-500" />
          )}
          {!headerData && (
            <span className="hidden md:inline">
              {isSyncing ? 'Sinkron...' : syncStatus === 'synced' ? 'Tersinkron' : 'Sync'}
            </span>
          )}
        </button>

        {/* Notification Bell (Visible in Non-Worksheet mode, or compact in Worksheet) */}
        {!headerData && (
          <div className="relative">
            <button 
              type="button"
              aria-label="Notifikasi"
              className={`p-2 rounded-lg transition-colors relative min-h-[38px] min-w-[38px] flex items-center justify-center ${showNotifications ? 'bg-blue-50 text-atlas-blue' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BellIcon size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
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
                              if (n.link) navigate(n.link);
                            }}
                          >
                            <h4 className={`text-xs ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* User Menu Avatar */}
        <div className="relative pl-1 sm:pl-2" ref={userMenuRef}>
          <button
            type="button"
            id="workspace-user-menu-button"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            aria-label="Menu pengguna"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              if (showNotifications) setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-blue min-h-[38px]"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-atlas-blue rounded-full flex items-center justify-center text-white shrink-0 text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={14} />}
            </div>
            {!headerData && (
              <div className="text-xs hidden md:block text-left">
                <p className="font-semibold text-gray-800 leading-tight truncate max-w-[100px]">{user?.name || 'User'}</p>
              </div>
            )}
            <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
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
                aria-labelledby="workspace-user-menu-button"
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-50 text-sm animate-in fade-in duration-150"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-slate-50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pengguna Aktif</p>
                  <p className="font-semibold text-gray-900 truncate mt-0.5">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.role || 'No Role'}</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/dashboard');
                    }}
                    className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left font-medium"
                  >
                    <Home size={15} className="mr-2.5 text-blue-600" />
                    <span>Dashboard Utama</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/engagements');
                    }}
                    className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                  >
                    <FolderOpen size={15} className="mr-2.5 text-amber-500" />
                    <span>Daftar Perikatan</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/fee-calculator');
                    }}
                    className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                  >
                    <Calculator size={15} className="mr-2.5 text-emerald-600" />
                    <span>Kalkulator Fee</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/kalender');
                    }}
                    className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                  >
                    <Calendar size={15} className="mr-2.5 text-blue-600" />
                    <span>Kalender Libur Nasional</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                  >
                    <Settings size={15} className="mr-2.5 text-gray-400" />
                    <span>Pengaturan Akun</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left font-semibold"
                  >
                    <LogOut size={15} className="mr-2.5 text-red-500" />
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

export default WorkspaceTopBar;
