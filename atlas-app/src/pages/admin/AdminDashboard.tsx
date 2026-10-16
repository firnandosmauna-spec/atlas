import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  Briefcase, 
  CheckCircle, 
  CheckCircle2,
  Check,
  Search, 
  Plus, 
  X, 
  UserCheck, 
  UserPlus,
  Sliders, 
  FileCheck2, 
  HelpCircle,
  FolderKanban,
  ClipboardList,
  Sparkles,
  FileSpreadsheet,
  Headphones,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  KeyRound,
  Edit3,
  Filter,
  AlertTriangle,
  Cloud,
  RefreshCw,
  ExternalLink,
  Database
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { SYSTEM_ROLES, type SystemRoleName } from '../../constants/roles';

import { 
  type UserData, 
  STORAGE_KEY_ADMIN_USERS, 
  STORAGE_KEY_USER_ROLES, 
  DEFAULT_INITIAL_USERS,
  syncAllUsersToSupabase
} from '../../utils/userManagement';

// Helper valid UUID v4 generator
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

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
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('Semua');
  const [saveStatus, setSaveStatus] = useState<{ id: string; status: 'saving' | 'saved' | 'error' } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cloud Sync state
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState({ total: 9, synced: 0 });
  
  // 1. CREATE State (Tambah Anggota)
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ 
    full_name: '', 
    email: '', 
    role_name: 'Ketua Tim' as SystemRoleName,
    password: 'Audit2026!'
  });
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);

  // 2. UPDATE State (Edit Anggota & Reset Sandi)
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    role_name: 'Ketua Tim' as SystemRoleName,
    newPassword: ''
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // 3. READ DETAIL State (Modal Detail Profil)
  const [detailUser, setDetailUser] = useState<UserData | null>(null);

  // 4. DELETE State (Modal Konfirmasi Hapus)
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);

  // Random Password Generator
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = 'KAP-';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password: rand + '!' }));
  };

  const generateEditRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = 'KAP-';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditForm(prev => ({ ...prev, newPassword: rand + '!' }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // READ: Fetch all users from cache & database
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Load locally cached users first
      let cachedUsers: UserData[] = [];
      try {
        const storedUsers = localStorage.getItem(STORAGE_KEY_ADMIN_USERS);
        if (storedUsers) {
          cachedUsers = JSON.parse(storedUsers);
        }
      } catch (e) {
        console.error('Error reading localStorage admin users', e);
      }

      // 2. Load stored local roles map
      let localRolesMap: Record<string, string> = {};
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER_ROLES);
        if (stored) {
          localRolesMap = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error reading localStorage roles map', e);
      }

      // 3. Fetch from Supabase
      let dbUsers: UserData[] = [];
      try {
        const { data: usersData, error } = await supabase
          .from('users')
          .select('id, email, full_name, role_id, is_active, roles (name)');

        if (!error && usersData && usersData.length > 0) {
          dbUsers = usersData;
        }
      } catch (dbErr) {
        console.warn('Supabase fetch notice (fallback to local):', dbErr);
      }

      // 4. Merge data: cached users have priority for locally added ones
      let combined: UserData[] = cachedUsers.length > 0 
        ? [...cachedUsers] 
        : (dbUsers.length > 0 ? [...dbUsers] : [...DEFAULT_INITIAL_USERS]);

      // Ensure all 9 standard default roles are present
      for (const defUser of DEFAULT_INITIAL_USERS) {
        if (!combined.some(u => u.roles?.name === defUser.roles?.name || (u.email && defUser.email && u.email.toLowerCase() === defUser.email.toLowerCase()))) {
          combined.push(defUser);
        }
      }

      // If db has users not present locally, add them
      for (const dbu of dbUsers) {
        if (!combined.some(u => u.id === dbu.id || (u.email && dbu.email && u.email.toLowerCase() === dbu.email.toLowerCase()))) {
          combined.push(dbu);
        }
      }

      // Merge current logged-in user if missing
      if (user && !combined.some(u => (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) || u.id === user.id)) {
        combined.unshift({
          id: user.id,
          email: user.email,
          full_name: user.name,
          role_id: SYSTEM_ROLES.find(r => r.name === user.role)?.id || '11111111-1111-1111-1111-111111111101',
          password: 'Audit2026!',
          roles: { name: user.role }
        });
      }

      // Apply roles map and role normalization & cloud sync badge
      const finalizedUsers = combined.map(u => {
        const dbMatch = dbUsers.find(d => 
          (u.email && d.email && d.email.toLowerCase() === u.email.toLowerCase()) || 
          d.id === u.id
        );
        const resolvedId = dbMatch ? dbMatch.id : u.id;
        const isSynced = !!dbMatch;

        const savedRoleName = localRolesMap[resolvedId] || (u.email ? localRolesMap[u.email.toLowerCase()] : undefined);
        if (savedRoleName) {
          const matchedDef = SYSTEM_ROLES.find(r => r.name === savedRoleName);
          return {
            ...u,
            id: resolvedId,
            role_id: matchedDef?.id || u.role_id,
            roles: { name: savedRoleName },
            isSyncedWithCloud: isSynced
          };
        }
        
        let roleName = u.roles?.name || dbMatch?.roles?.name || '';
        if (!roleName || roleName === 'Auditor') {
          roleName = u.email === 'admin@kap.com' ? 'Admin' : 'Ketua Tim';
        } else if (roleName === 'Partner') {
          roleName = 'Partner/Akuntan Publik';
        }

        const matchedDef = SYSTEM_ROLES.find(r => r.name === roleName);
        return {
          ...u,
          id: resolvedId,
          role_id: matchedDef?.id || u.role_id,
          roles: { name: roleName },
          isSyncedWithCloud: isSynced
        };
      });

      setUsers(finalizedUsers);
      const syncedCount = finalizedUsers.filter(u => u.isSyncedWithCloud).length;
      setCloudSyncStatus({ total: finalizedUsers.length, synced: syncedCount });
      
      // Update cache
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(finalizedUsers));
      } catch (e) {
        console.error('Error saving finalized users', e);
      }
    } catch (err) {
      console.error('Fatal error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // SYNC: Push all users to Supabase Cloud
  const handleSyncAllToSupabase = async () => {
    setIsSyncingCloud(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const result = await syncAllUsersToSupabase(users);
      if (result.failed === 0 && result.success > 0) {
        setSuccessMessage(`Berhasil menyinkronkan seluruh ${result.success} akun tim KAP ke database Supabase Cloud!`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else if (result.success > 0 && result.failed > 0) {
        setSuccessMessage(`${result.success} akun berhasil disinkronkan. ${result.failed} akun memerlukan eksekusi SQL di Supabase.`);
        setShowSqlModal(true);
      } else if (result.failed > 0) {
        setErrorMessage(`Gagal menyimpan ${result.failed} akun ke Supabase karena batasan foreign key/RLS. Buka panduan SQL berikut.`);
        setShowSqlModal(true);
      }
      await fetchData();
    } catch (err: any) {
      console.error('Error syncing all users to Supabase:', err);
      setErrorMessage('Terjadi kendala saat menghubungkan ke Supabase. Periksa skrip SQL.');
      setShowSqlModal(true);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // UPDATE: Inline Quick Role Change
  const handleRoleChange = async (userId: string, targetRoleName: SystemRoleName) => {
    setSaveStatus({ id: userId, status: 'saving' });

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

    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(updatedUsers));
      const stored = localStorage.getItem(STORAGE_KEY_USER_ROLES);
      const rolesMap: Record<string, string> = stored ? JSON.parse(stored) : {};
      rolesMap[userId] = targetRoleName;
      
      const targetUser = users.find(u => u.id === userId);
      if (targetUser?.email) {
        rolesMap[targetUser.email.toLowerCase()] = targetRoleName;
      }
      localStorage.setItem(STORAGE_KEY_USER_ROLES, JSON.stringify(rolesMap));
    } catch (e) {
      console.error('Error saving role to localStorage', e);
    }

    if (user && (user.id === userId || (user.email && users.find(u => u.id === userId)?.email.toLowerCase() === user.email.toLowerCase()))) {
      login({
        ...user,
        role: targetRoleName
      });
    }

    try {
      const { error: updErr } = await supabase
        .from('users')
        .update({ role_id: matchedRoleDef?.id || null })
        .eq('id', userId);

      if (updErr) {
        const targetUser = users.find(u => u.id === userId);
        if (targetUser?.email) {
          await supabase
            .from('users')
            .update({ role_id: matchedRoleDef?.id || null })
            .eq('email', targetUser.email.toLowerCase());
        }
      }
    } catch (dbErr) {
      console.warn('Supabase DB update fallback (persisted locally):', dbErr);
    }

    setSaveStatus({ id: userId, status: 'saved' });
    setTimeout(() => setSaveStatus(null), 2500);
  };

  // CREATE: Tambah Anggota Baru
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = newUser.full_name.trim();
    const email = newUser.email.trim().toLowerCase();
    const roleName = newUser.role_name;
    const password = newUser.password.trim() || 'Audit2026!';

    if (!fullName || !email || !roleName) {
      setErrorMessage('Mohon lengkapi Nama Lengkap, Email Akun, dan Pilihan Role.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi akun minimal 6 karakter.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Format email tidak valid (contoh: budi@kap.com).');
      return;
    }

    if (users.some(u => u.email && u.email.toLowerCase() === email)) {
      setErrorMessage(`Email "${email}" sudah terdaftar sebagai pengguna.`);
      return;
    }

    setIsSubmittingNewUser(true);
    setErrorMessage('');

    const newId = generateUUID();
    const matchedRoleDef = SYSTEM_ROLES.find(r => r.name === roleName);

    const addedUser: UserData = {
      id: newId,
      email: email,
      full_name: fullName,
      password: password,
      role_id: matchedRoleDef?.id || null,
      roles: { name: roleName },
      isSyncedWithCloud: false
    };

    const updatedList = [addedUser, ...users];
    setUsers(updatedList);

    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(updatedList));

      const storedRoles = localStorage.getItem(STORAGE_KEY_USER_ROLES);
      const rolesMap: Record<string, string> = storedRoles ? JSON.parse(storedRoles) : {};
      rolesMap[newId] = roleName;
      rolesMap[email] = roleName;
      localStorage.setItem(STORAGE_KEY_USER_ROLES, JSON.stringify(rolesMap));
    } catch (e) {
      console.error('Error saving added user to localStorage:', e);
    }

    try {
      await supabase.auth.signUp({
        email: email,
        password: password
      });
    } catch (authErr) {
      console.warn('Supabase auth signUp note (persisted locally):', authErr);
    }

    try {
      const { error: insertErr } = await supabase.from('users').insert({
        id: newId,
        email: email,
        full_name: fullName,
        role_id: matchedRoleDef?.id || null,
        is_active: true
      });
      if (insertErr) {
        console.warn('Supabase insert note (fallback to local storage):', insertErr.message);
        if (insertErr.code === '23503' || insertErr.code === '42501') {
          setShowSqlModal(true);
        }
      } else {
        setUsers(prev => prev.map(u => u.id === newId ? { ...u, isSyncedWithCloud: true } : u));
        setCloudSyncStatus(prev => ({ ...prev, total: prev.total + 1, synced: prev.synced + 1 }));
      }
    } catch (insertErr) {
      console.warn('Supabase insert note (offline/fallback):', insertErr);
    }

    setSuccessMessage(`Anggota tim "${fullName}" berhasil ditambahkan sebagai ${roleName}! Kata sandi: "${password}"`);
    setTimeout(() => setSuccessMessage(''), 6000);

    setNewUser({ full_name: '', email: '', role_name: 'Ketua Tim', password: 'Audit2026!' });
    setIsAddingUser(false);
    setIsSubmittingNewUser(false);
  };

  // UPDATE: Buka Modal Edit
  const handleOpenEdit = (u: UserData) => {
    setEditingUser(u);
    setEditForm({
      full_name: u.full_name,
      email: u.email,
      role_name: (u.roles?.name as SystemRoleName) || 'Ketua Tim',
      newPassword: u.password || 'Audit2026!'
    });
    setShowEditPassword(false);
  };

  // UPDATE: Simpan Perubahan Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const trimmedName = editForm.full_name.trim();
    const trimmedEmail = editForm.email.trim().toLowerCase();
    const newRole = editForm.role_name;
    const newPass = editForm.newPassword.trim();

    if (!trimmedName || !trimmedEmail) {
      alert('Nama Lengkap dan Email tidak boleh kosong.');
      return;
    }

    if (newPass && newPass.length < 6) {
      alert('Kata sandi minimal 6 karakter.');
      return;
    }

    // Check email conflict with other users
    if (users.some(u => u.id !== editingUser.id && u.email && u.email.toLowerCase() === trimmedEmail)) {
      alert(`Email "${trimmedEmail}" sudah digunakan oleh akun lain.`);
      return;
    }

    setIsSubmittingEdit(true);

    const matchedRoleDef = SYSTEM_ROLES.find(r => r.name === newRole);
    const updatedUsers = users.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          full_name: trimmedName,
          email: trimmedEmail,
          role_id: matchedRoleDef?.id || null,
          password: newPass || u.password,
          roles: { name: newRole }
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(updatedUsers));
      const stored = localStorage.getItem(STORAGE_KEY_USER_ROLES);
      const rolesMap: Record<string, string> = stored ? JSON.parse(stored) : {};
      rolesMap[editingUser.id] = newRole;
      rolesMap[trimmedEmail] = newRole;
      if (editingUser.email && editingUser.email.toLowerCase() !== trimmedEmail) {
        delete rolesMap[editingUser.email.toLowerCase()];
      }
      localStorage.setItem(STORAGE_KEY_USER_ROLES, JSON.stringify(rolesMap));
    } catch (e) {
      console.error('Error saving edited user to localStorage', e);
    }

    if (user && (user.id === editingUser.id || (user.email && user.email.toLowerCase() === editingUser.email.toLowerCase()))) {
      login({
        ...user,
        name: trimmedName,
        email: trimmedEmail,
        role: newRole
      });
    }

    try {
      const { error: updateErr } = await supabase
        .from('users')
        .update({
          full_name: trimmedName,
          email: trimmedEmail,
          role_id: matchedRoleDef?.id || null
        })
        .eq('id', editingUser.id);

      if (updateErr) {
        await supabase
          .from('users')
          .update({
            full_name: trimmedName,
            role_id: matchedRoleDef?.id || null
          })
          .eq('email', trimmedEmail);
      }
    } catch (err) {
      console.warn('Supabase update notice:', err);
    }

    setSuccessMessage(`Data anggota "${trimmedName}" berhasil diperbarui!`);
    setTimeout(() => setSuccessMessage(''), 4000);
    setEditingUser(null);
    setIsSubmittingEdit(false);
  };

  // DELETE: Buka Modal Konfirmasi Hapus
  const handleOpenDelete = (u: UserData) => {
    if (user && (user.id === u.id || (user.email && user.email.toLowerCase() === u.email.toLowerCase()))) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }
    setDeletingUser(u);
  };

  // DELETE: Eksekusi Hapus Anggota
  const confirmDelete = async () => {
    if (!deletingUser) return;
    const u = deletingUser;

    const updatedList = users.filter(item => item.id !== u.id);
    setUsers(updatedList);

    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(updatedList));

      const storedRoles = localStorage.getItem(STORAGE_KEY_USER_ROLES);
      if (storedRoles) {
        const rolesMap = JSON.parse(storedRoles);
        delete rolesMap[u.id];
        delete rolesMap[u.email.toLowerCase()];
        localStorage.setItem(STORAGE_KEY_USER_ROLES, JSON.stringify(rolesMap));
      }
    } catch (e) {
      console.error('Error deleting user from localStorage:', e);
    }

    try {
      await supabase.from('users').delete().eq('id', u.id);
    } catch (err) {
      console.warn('Supabase delete error (local updated):', err);
    }

    setSuccessMessage(`Anggota tim "${u.full_name}" berhasil dihapus.`);
    setTimeout(() => setSuccessMessage(''), 3500);
    setDeletingUser(null);
  };

  // READ: Metric Counts
  const roleMetrics = useMemo(() => {
    const total = users.length;
    const partners = users.filter(u => {
      const r = u.roles?.name;
      return r === 'Admin' || r === 'Partner/Akuntan Publik' || r === 'Manager';
    }).length;
    const fieldAuditors = users.filter(u => {
      const r = u.roles?.name;
      return r === 'Supervisor' || r === 'Ketua Tim' || r === 'Anggota Tim 1' || r === 'Anggota Tim 2' || r === 'Anggota Tim dst';
    }).length;
    const supportStaff = users.filter(u => u.roles?.name === 'Tenaga Pendukung').length;

    return { total, partners, fieldAuditors, supportStaff };
  }, [users]);

  // READ: Filtered users by search & role
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        u.full_name?.toLowerCase().includes(q) || 
        u.email?.toLowerCase().includes(q) ||
        u.roles?.name?.toLowerCase().includes(q);

      const matchRole = selectedRoleFilter === 'Semua' || u.roles?.name === selectedRoleFilter;

      return matchSearch && matchRole;
    });
  }, [users, searchQuery, selectedRoleFilter]);

  return (
    <div className="w-full font-sans min-w-0 space-y-3.5 pb-12">
      
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
                Lengkap CRUD & 9 Role
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Kelola penugasan akun, tambah anggota baru, edit profil, ubah peran, serta kontrol sandi tim audit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px] shadow-2xs">
            Role Aktif Anda: <span className="font-bold text-slate-900">{user?.role || 'Admin'}</span>
          </div>
        </div>
      </div>

      {/* METRIC STRIP: RINGKASAN TIM AUDIT */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mb-1">
            <span>Total Pengguna</span>
            <Users size={13} className="text-slate-400" />
          </div>
          <div className="text-lg font-black text-slate-900 font-mono">
            {roleMetrics.total}
          </div>
          <span className="text-[10px] text-slate-400">Akun terdaftar</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-700 text-[11px] font-medium mb-1">
            <span>Partner & Manager</span>
            <Briefcase size={13} className="text-indigo-500" />
          </div>
          <div className="text-lg font-black text-indigo-900 font-mono">
            {roleMetrics.partners}
          </div>
          <span className="text-[10px] text-indigo-500">Tingkat 1 – 3</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-[11px] font-medium mb-1">
            <span>Tim Lapangan</span>
            <FileCheck2 size={13} className="text-emerald-500" />
          </div>
          <div className="text-lg font-black text-emerald-900 font-mono">
            {roleMetrics.fieldAuditors}
          </div>
          <span className="text-[10px] text-emerald-500">Tingkat 4 – 8</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-[11px] font-medium mb-1">
            <span>Tenaga Pendukung</span>
            <Headphones size={13} className="text-amber-500" />
          </div>
          <div className="text-lg font-black text-amber-900 font-mono">
            {roleMetrics.supportStaff}
          </div>
          <span className="text-[10px] text-amber-500">Tingkat 9</span>
        </div>
      </div>

      {/* MAIN LAYOUT: 12 COLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* KOLOM KIRI (7-8 COLS): TABEL PENGGUNA & FORM TAMBAH */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3.5">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            
            {/* Table Header Bar with Search & Role Filter */}
            <div className="bg-slate-50/90 border-b border-slate-200/80 px-3.5 py-2.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start flex-wrap">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Users size={14} className="text-slate-700" />
                  <span>Daftar Pengguna ({filteredUsers.length})</span>
                </div>

                {/* Cloud Sync Status Indicator */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  cloudSyncStatus.synced === cloudSyncStatus.total && cloudSyncStatus.total > 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <Cloud size={12} className={cloudSyncStatus.synced === cloudSyncStatus.total ? 'text-emerald-600' : 'text-amber-600'} />
                  <span>{cloudSyncStatus.synced}/{cloudSyncStatus.total} di Supabase</span>
                </div>

                {/* Cloud Sync Button */}
                <button
                  type="button"
                  onClick={handleSyncAllToSupabase}
                  disabled={isSyncingCloud}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  title="Sinkronkan seluruh akun lokal ke database Supabase Cloud"
                >
                  <RefreshCw size={12} className={isSyncingCloud ? 'animate-spin text-blue-600' : 'text-slate-600'} />
                  <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Sinkronkan ke Supabase'}</span>
                </button>

                {!isAddingUser && (
                  <button 
                    onClick={() => {
                      setIsAddingUser(true);
                      setErrorMessage('');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-900 px-3 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Tambah Anggota</span>
                  </button>
                )}
              </div>

              {/* Controls: Search and Role Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-44">
                  <Filter className="absolute left-2.5 top-2 text-slate-400" size={12} />
                  <select
                    value={selectedRoleFilter}
                    onChange={e => setSelectedRoleFilter(e.target.value)}
                    className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer font-medium"
                  >
                    <option value="Semua">Semua Peran</option>
                    {SYSTEM_ROLES.map(r => (
                      <option key={r.id} value={r.name}>
                        {r.number}. {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1 md:w-48">
                  <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, email..." 
                    className="w-full pl-7 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            {/* NOTIFIKASI SUKSES */}
            {successMessage && (
              <div className="px-3.5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSuccessMessage('')} 
                  className="text-emerald-600 hover:text-emerald-800 p-0.5 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* CREATE: FORM TAMBAH PENGGUNA BARU */}
            {isAddingUser && (
              <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <UserPlus size={15} className="text-blue-600" />
                    Form Tambah Anggota Tim Baru
                  </span>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddingUser(false);
                      setErrorMessage('');
                    }} 
                    className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {errorMessage && (
                  <div className="mb-3 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleAddUser} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        required
                        type="text" 
                        value={newUser.full_name}
                        onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium placeholder:text-slate-400" 
                        placeholder="Contoh: Budi Santoso, S.E., Ak." 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Email Akun <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        required
                        type="email" 
                        value={newUser.email}
                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono placeholder:text-slate-400" 
                        placeholder="budi@kap.com" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Pilihan Role KAP (1–9) <span className="text-rose-500">*</span>
                      </label>
                      <select 
                        required
                        value={newUser.role_name}
                        onChange={e => setNewUser({ ...newUser, role_name: e.target.value as SystemRoleName })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                      >
                        {SYSTEM_ROLES.map(r => (
                          <option key={r.id} value={r.name}>
                            {r.number}. {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Kata Sandi (Password) <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                        >
                          Buat Acak
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          required
                          type={showNewUserPassword ? 'text' : 'password'} 
                          value={newUser.password}
                          onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono" 
                          placeholder="Minimal 6 karakter" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title={showNewUserPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                        >
                          {showNewUserPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Sandi awal login anggota (bisa diubah nanti di Pengaturan).
                      </span>
                    </div>
                  </div>

                  {/* Tombol Aksi Simpan & Batal yang Jelas */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAddingUser(false);
                        setErrorMessage('');
                      }}
                      className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Batal
                    </button>

                    <button 
                      type="submit" 
                      disabled={isSubmittingNewUser}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      {isSubmittingNewUser ? (
                        <span>Menyimpan...</span>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Simpan Anggota</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* READ: TABEL PENGGUNA */}
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Memuat daftar pengguna & hak akses role...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Tidak ada pengguna yang sesuai dengan kriteria pencarian/filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[10px] text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="px-3.5 py-2.5 font-bold">Pengguna</th>
                      <th className="px-3.5 py-2.5 font-bold">Email Akun</th>
                      <th className="px-3.5 py-2.5 font-bold">Penugasan Role KAP</th>
                      <th className="px-3.5 py-2.5 font-bold">Kata Sandi Awal</th>
                      <th className="px-3.5 py-2.5 font-bold text-center">Supabase Cloud</th>
                      <th className="px-3.5 py-2.5 font-bold text-center w-24">Aksi CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const currentRoleName = u.roles?.name || 'Ketua Tim';
                      const roleDef = SYSTEM_ROLES.find(r => r.name === currentRoleName);
                      const isCurrentUser = user && (u.id === user.id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));

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

                          <td className="px-3.5 py-2">
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-semibold tracking-wide">
                                {u.password || 'Audit2026!'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(u.password || 'Audit2026!');
                                  setSuccessMessage(`Kata sandi untuk ${u.full_name} (${u.password || 'Audit2026!'}) disalin ke clipboard!`);
                                  setTimeout(() => setSuccessMessage(''), 3000);
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                title="Salin kata sandi awal"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </td>

                          <td className="px-3.5 py-2 text-center">
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
                            ) : u.isSyncedWithCloud ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full" title="Akun ini tersimpan & tersinkron di tabel users Supabase">
                                <CheckCircle2 size={11} className="text-emerald-600" />
                                Tersimpan
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSyncAllToSupabase}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                                title="Klik untuk menyinkronkan ke Supabase"
                              >
                                <AlertTriangle size={11} className="text-amber-500" />
                                Hanya Lokal (Sinkronkan)
                              </button>
                            )}
                          </td>

                          {/* ACTION BUTTONS (CRUD: Read Detail, Update Edit, Delete) */}
                          <td className="px-3.5 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* READ: DETAIL */}
                              <button
                                type="button"
                                onClick={() => setDetailUser(u)}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title={`Lihat detail ${u.full_name}`}
                              >
                                <Eye size={13} />
                              </button>

                              {/* UPDATE: EDIT */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(u)}
                                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                                title={`Edit data & peran ${u.full_name}`}
                              >
                                <Edit3 size={13} />
                              </button>

                              {/* DELETE: HAPUS */}
                              {isCurrentUser ? (
                                <span className="w-5 text-slate-300 text-[10px] font-mono text-center">-</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDelete(u)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title={`Hapus ${u.full_name}`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
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

      {/* ========================================================================= */}
      {/* MODAL 1: UPDATE (EDIT DATA ANGGOTA & RESET KATA SANDI) */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <Edit3 size={15} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Data Anggota Tim</h3>
                  <p className="text-[11px] text-slate-500">Perbarui profil, penugasan peran, atau reset kata sandi akun.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingUser(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input 
                  required
                  type="text" 
                  value={editForm.full_name}
                  onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Akun <span className="text-rose-500">*</span>
                </label>
                <input 
                  required
                  type="email" 
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Penugasan Role KAP (1–9) <span className="text-rose-500">*</span>
                </label>
                <select 
                  required
                  value={editForm.role_name}
                  onChange={e => setEditForm({ ...editForm, role_name: e.target.value as SystemRoleName })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                >
                  {SYSTEM_ROLES.map(r => (
                    <option key={r.id} value={r.name}>
                      {r.number}. {r.name} — {r.shortDesc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Reset / Ubah Kata Sandi Akun
                  </label>
                  <button
                    type="button"
                    onClick={generateEditRandomPassword}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                  >
                    Buat Sandi Acak
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showEditPassword ? 'text' : 'password'} 
                    value={editForm.newPassword}
                    onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })}
                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono" 
                    placeholder="Kosongkan jika tidak ingin mengubah sandi" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showEditPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                  >
                    {showEditPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Anggota dapat langsung login menggunakan kata sandi yang baru diperbarui ini.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button 
                  type="submit" 
                  disabled={isSubmittingEdit}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {isSubmittingEdit ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: READ DETAIL (DETAIL PROFIL & TANGGUNG JAWAB PERAN) */}
      {/* ========================================================================= */}
      {detailUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <UserCheck size={15} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Detail Profil Anggota</h3>
                  <p className="text-[11px] text-slate-500">Informasi akun dan hak operasional dalam tim audit.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setDetailUser(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                  {detailUser.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{detailUser.full_name}</h4>
                  <p className="text-slate-500 font-mono text-[11px] truncate">{detailUser.email}</p>
                </div>
              </div>

              {(() => {
                const rName = detailUser.roles?.name || 'Ketua Tim';
                const rDef = SYSTEM_ROLES.find(r => r.name === rName);
                return (
                  <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peran Terdaftar</span>
                      {rDef && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rDef.badgeClass}`}>
                          Tingkat {rDef.number}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      {rDef && getRoleIcon(rDef.number)}
                      <span>{rName}</span>
                    </div>
                    {rDef && (
                      <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                        {rDef.description}
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Kata Sandi Akun</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(detailUser.password || 'Audit2026!');
                      alert('Kata sandi berhasil disalin!');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>Salin Sandi</span>
                  </button>
                </div>
                <div className="font-mono text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 font-bold">
                  {detailUser.password || 'Audit2026!'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const u = detailUser;
                    setDetailUser(null);
                    handleOpenEdit(u);
                  }}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Anggota</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailUser(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION (KONFIRMASI HAPUS ANGGOTA) */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2.5 bg-rose-50 text-rose-800">
              <AlertTriangle size={18} className="shrink-0 text-rose-600" />
              <h3 className="font-bold text-sm">Konfirmasi Hapus Anggota</h3>
            </div>

            <div className="p-4 space-y-3 text-xs text-slate-700">
              <p className="leading-relaxed">
                Apakah Anda yakin ingin menghapus akun anggota ini dari sistem KAP?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block">{deletingUser.full_name}</span>
                <span className="text-slate-500 font-mono text-[11px] block">{deletingUser.email}</span>
                <span className="text-[10px] text-slate-600 mt-1 inline-block bg-slate-200 px-1.5 py-0.5 rounded font-semibold">
                  {deletingUser.roles?.name || 'Anggota Tim'}
                </span>
              </div>
              <p className="text-[11px] text-rose-600 font-medium">
                Catatan: Akun ini tidak akan dapat login lagi ke sistem.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Hapus Anggota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SUPABASE SQL SYNC HELPER MODAL */}
      {/* ========================================================================= */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-blue-50 text-blue-900">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-blue-600" />
                <h3 className="font-bold text-sm">Sinkronisasi Akun Tim KAP ke Supabase</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 leading-relaxed">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-600 shrink-0" />
                  Mengapa sebagian akun belum tersimpan di Supabase?
                </p>
                <p className="text-[11px] text-amber-700">
                  Secara bawaan, Supabase menerapkan batasan relasi kaku (<code className="font-mono bg-amber-100 px-1 rounded">users_id_fkey</code>) dan tabel roles yang masih kosong. Untuk mengizinkan penyimpanan 9 akun KAP, skrip SQL perlu dieksekusi sekali di Supabase.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900">
                  Langkah Mudah (Hanya 1 Menit):
                </p>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-[11px]">
                  <li>Buka <strong>Supabase SQL Editor</strong> dengan tombol di bawah.</li>
                  <li>Buka file <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">supabase_sync_setup.sql</code> di proyek ini, lalu salin seluruh kodenya.</li>
                  <li>Tempel di SQL Editor Supabase, lalu klik <strong>Run</strong>.</li>
                  <li>Kembali ke halaman ini dan klik tombol <strong>"Sinkronkan ke Supabase"</strong>. Seluruh akun akan langsung berstatus hijau (Tersimpan)!</li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-2">
                <a
                  href="https://supabase.com/dashboard/project/oxnigsxfiionzgjvzykz/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
                >
                  <ExternalLink size={13} />
                  <span>Buka Supabase SQL Editor</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
