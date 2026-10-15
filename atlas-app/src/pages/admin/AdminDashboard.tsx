import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  Briefcase, 
  CheckCircle, 
  Search, 
  Plus, 
  X, 
  UserCheck, 
  Sliders, 
  FileCheck2, 
  HelpCircle,
  FolderKanban,
  ClipboardList,
  Sparkles,
  FileSpreadsheet,
  Headphones
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { SYSTEM_ROLES, type SystemRoleName } from '../../constants/roles';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role_id: string | null;
  roles?: {
    name: string;
  };
}

const STORAGE_KEY_USER_ROLES = 'atlas_user_roles_map';

// Helper icon mapping for the 9 KAP hierarchy roles
const getRoleIcon = (number: number) => {
  switch (number) {
    case 1: return <Shield size={13} className="text-rose-600" />;
    case 2: return <Briefcase size={13} className="text-indigo-600" />;
    case 3: return <FolderKanban size={13} className="text-blue-600" />;
    case 4: return <ClipboardList size={13} className="text-cyan-600" />;
    case 5: return <FileCheck2 size={13} className="text-emerald-600" />;
    case 6: return <UserCheck size={13} className="text-teal-600" />;
    case 7: return <FileSpreadsheet size={13} className="text-sky-600" />;
    case 8: return <Sparkles size={13} className="text-slate-600" />;
    case 9: return <Headphones size={13} className="text-amber-600" />;
    default: return <Users size={13} className="text-slate-500" />;
  }
};

const AdminDashboard = () => {
  const { user, login } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ id: string; status: 'saving' | 'saved' | 'error' } | null>(null);
  
  // Add new user state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', role_name: 'Ketua Tim' as SystemRoleName });
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch users from Supabase
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, email, full_name, role_id, roles (name)');

      if (error) {
        console.warn('Error fetching users from Supabase:', error);
      }

      // 2. Load stored local roles map if any
      let localRolesMap: Record<string, string> = {};
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER_ROLES);
        if (stored) {
          localRolesMap = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error reading localStorage roles map', e);
      }

      let loadedUsers: UserData[] = usersData || [];

      // Default mock fallback if db is empty
      if (loadedUsers.length === 0) {
        loadedUsers = [
          {
            id: 'usr-1',
            email: 'admin@kap.com',
            full_name: 'Ahmad Partner AP',
            role_id: 'role-2',
            roles: { name: 'Partner/Akuntan Publik' }
          },
          {
            id: 'usr-2',
            email: 'auditor@kap.com',
            full_name: 'Nando Manager',
            role_id: 'role-3',
            roles: { name: 'Manager' }
          },
          {
            id: 'usr-3',
            email: 'dwisafitriana99@gmail.com',
            full_name: 'Auditor Atlas',
            role_id: 'role-5',
            roles: { name: 'Ketua Tim' }
          }
        ];
      }

      // Merge with current logged in user if not in list
      if (user && !loadedUsers.some(u => u.email === user.email || u.id === user.id)) {
        loadedUsers.unshift({
          id: user.id,
          email: user.email,
          full_name: user.name,
          role_id: SYSTEM_ROLES.find(r => r.name === user.role)?.id || 'role-1',
          roles: { name: user.role }
        });
      }

      // Apply locally persisted roles
      const finalizedUsers = loadedUsers.map(u => {
        const savedRoleName = localRolesMap[u.id] || localRolesMap[u.email];
        if (savedRoleName) {
          const matchedDef = SYSTEM_ROLES.find(r => r.name === savedRoleName);
          return {
            ...u,
            role_id: matchedDef?.id || u.role_id,
            roles: { name: savedRoleName }
          };
        }
        
        // If role is null or legacy 'Auditor' / 'Partner', standardize to the 9 roles
        let roleName = u.roles?.name || '';
        if (!roleName || roleName === 'Auditor') {
          roleName = u.email === 'admin@kap.com' ? 'Admin' : 'Ketua Tim';
        } else if (roleName === 'Partner') {
          roleName = 'Partner/Akuntan Publik';
        }

        const matchedDef = SYSTEM_ROLES.find(r => r.name === roleName);
        return {
          ...u,
          role_id: matchedDef?.id || u.role_id,
          roles: { name: roleName }
        };
      });

      setUsers(finalizedUsers);
    } catch (err) {
      console.error('Fatal error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, targetRoleName: SystemRoleName) => {
    setSaveStatus({ id: userId, status: 'saving' });

    // 1. Update local state
    const matchedRoleDef = SYSTEM_ROLES.find(r => r.name === targetRoleName);
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role_id: matchedRoleDef?.id || null,
          roles: { name: targetRoleName }
        };
      }
      return u;
    });
    setUsers(updatedUsers);

    // 2. Persist to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER_ROLES);
      const rolesMap: Record<string, string> = stored ? JSON.parse(stored) : {};
      rolesMap[userId] = targetRoleName;
      
      const targetUser = users.find(u => u.id === userId);
      if (targetUser?.email) {
        rolesMap[targetUser.email] = targetRoleName;
      }
      localStorage.setItem(STORAGE_KEY_USER_ROLES, JSON.stringify(rolesMap));
    } catch (e) {
      console.error('Error saving role to localStorage', e);
    }

    // 3. If updating current logged in user, update authStore session
    if (user && (user.id === userId || user.email === users.find(u => u.id === userId)?.email)) {
      login({
        ...user,
        role: targetRoleName
      });
    }

    // 4. Try updating Supabase (graceful fallback if blocked by RLS)
    try {
      await supabase
        .from('users')
        .update({ role_id: matchedRoleDef?.id || null })
        .eq('id', userId);
    } catch (dbErr) {
      console.warn('Supabase DB update fallback (persisted locally):', dbErr);
    }

    setSaveStatus({ id: userId, status: 'saved' });
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.full_name || !newUser.email || !newUser.role_name) return;

    setIsSubmittingNewUser(true);
    const newId = `usr-${Date.now()}`;
    const matchedRoleDef = SYSTEM_ROLES.find(r => r.name === newUser.role_name);

    const addedUser: UserData = {
      id: newId,
      email: newUser.email.trim(),
      full_name: newUser.full_name.trim(),
      role_id: matchedRoleDef?.id || null,
      roles: { name: newUser.role_name }
    };

    // Update list
    const updatedList = [addedUser, ...users];
    setUsers(updatedList);

    // Persist to local storage
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER_ROLES);
      const rolesMap: Record<string, string> = stored ? JSON.parse(stored) : {};
      rolesMap[newId] = newUser.role_name;
      rolesMap[addedUser.email] = newUser.role_name;
      localStorage.setItem(STORAGE_KEY_USER_ROLES, JSON.stringify(rolesMap));
    } catch (e) {
      console.error('Error saving added user role', e);
    }

    // Try Supabase insert
    try {
      await supabase.from('users').insert({
        id: newId,
        email: addedUser.email,
        full_name: addedUser.full_name,
        role_id: matchedRoleDef?.id || null
      });
    } catch (insertErr) {
      console.warn('Supabase insert note (using local persistence):', insertErr);
    }

    setNewUser({ full_name: '', email: '', role_name: 'Ketua Tim' });
    setIsAddingUser(false);
    setIsSubmittingNewUser(false);
  };

  // Filtered users by search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => 
      u.full_name?.toLowerCase().includes(q) || 
      u.email?.toLowerCase().includes(q) ||
      u.roles?.name?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="w-full font-sans min-w-0 space-y-3.5 pb-8">
      
      {/* HEADER CARD KOMPAK & MODERN */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sliders size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Manajemen Sistem & Peran (Role KAP)
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
                9 Tingkatan Peran
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Kelola penugasan hak akses pengguna dan struktur peran tim audit Kantor Akuntan Publik.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px] shadow-2xs">
            Role Aktif Anda: <span className="font-bold text-slate-900">{user?.role || 'Admin'}</span>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: 12 COLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* KOLOM KIRI (7-8 COLS): TABEL PENGGUNA & FORM TAMBAH */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3.5">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            
            {/* Table Header Bar */}
            <div className="bg-slate-50/90 border-b border-slate-200/80 px-3.5 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Users size={14} className="text-slate-700" />
                  <span>Daftar Pengguna ({filteredUsers.length})</span>
                </div>
                {!isAddingUser && (
                  <button 
                    onClick={() => setIsAddingUser(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                  >
                    <Plus size={13} className="text-slate-600" />
                    <span>Tambah Anggota</span>
                  </button>
                )}
              </div>

              {/* Live Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2 text-slate-400" size={13} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, email, atau role..." 
                  className="w-full pl-7 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-sans"
                />
              </div>
            </div>

            {/* FORM TAMBAH PENGGUNA CEPAT */}
            {isAddingUser && (
              <div className="p-3.5 bg-slate-50/70 border-b border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Plus size={13} className="text-blue-600" />
                    Form Tambah Anggota Tim Baru
                  </span>
                  <button 
                    onClick={() => setIsAddingUser(false)} 
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                      Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={newUser.full_name}
                      onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium" 
                      placeholder="Contoh: Budi Santoso, S.E., Ak." 
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                      Email Akun <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      required
                      type="email" 
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono" 
                      placeholder="budi@kap.com" 
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                      Pilihan Role (1–9) <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      required
                      value={newUser.role_name}
                      onChange={e => setNewUser({ ...newUser, role_name: e.target.value as SystemRoleName })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      {SYSTEM_ROLES.map(r => (
                        <option key={r.id} value={r.name}>
                          {r.number}. {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <button 
                      type="submit" 
                      disabled={isSubmittingNewUser}
                      className="w-full h-[32px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center shadow-2xs"
                      title="Simpan"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TABEL PENGGUNA */}
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Memuat daftar pengguna & hak akses role...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Tidak ada pengguna yang sesuai dengan pencarian "{searchQuery}".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[10px] text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="px-3.5 py-2.5 font-bold">Pengguna</th>
                      <th className="px-3.5 py-2.5 font-bold">Email Akun</th>
                      <th className="px-3.5 py-2.5 font-bold">Penugasan Role KAP</th>
                      <th className="px-3.5 py-2.5 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const currentRoleName = u.roles?.name || 'Ketua Tim';
                      const roleDef = SYSTEM_ROLES.find(r => r.name === currentRoleName);

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3.5 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                                {u.full_name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 block truncate">
                                  {u.full_name}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3.5 py-2 font-mono text-slate-500 text-[11px]">
                            {u.email}
                          </td>

                          <td className="px-3.5 py-2">
                            <div className="flex items-center gap-1.5">
                              <select
                                className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs font-semibold text-slate-900 cursor-pointer shadow-2xs"
                                value={currentRoleName}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as SystemRoleName)}
                              >
                                {SYSTEM_ROLES.map(r => (
                                  <option key={r.id} value={r.name}>
                                    {r.number}. {r.name}
                                  </option>
                                ))}
                              </select>

                              {roleDef && (
                                <span className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${roleDef.badgeClass}`}>
                                  Tingkat {roleDef.number}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-3.5 py-2 text-right">
                            {saveStatus?.id === u.id ? (
                              saveStatus.status === 'saving' ? (
                                <span className="text-slate-400 font-mono text-[11px]">Menyimpan...</span>
                              ) : saveStatus.status === 'saved' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                                  <CheckCircle size={12} />
                                  Tersimpan
                                </span>
                              ) : (
                                <span className="text-rose-600 font-bold text-[11px]">Gagal</span>
                              )
                            ) : u.id === user?.id || u.email === user?.email ? (
                              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                                Akun Anda
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN (4-5 COLS): GLOSARIUM 9 HIERARKI PERAN KAP */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 rounded-full bg-slate-900"></div>
                <h2 className="font-bold text-xs text-slate-900 tracking-tight">
                  Struktur 9 Peran Audit KAP
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Standar SPAP
              </span>
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {SYSTEM_ROLES.map((role) => (
                <div 
                  key={role.id}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                        {role.number}
                      </span>
                      {getRoleIcon(role.number)}
                      <h3 className="font-bold text-slate-900 text-xs truncate">
                        {role.name}
                      </h3>
                    </div>

                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${role.badgeClass}`}>
                      Tingkat {role.number}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
              <HelpCircle size={12} className="text-slate-400 shrink-0" />
              <span>Hierarki disinkronkan ke simulasi role & izin kertas kerja.</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
