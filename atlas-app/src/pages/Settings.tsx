import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Lock, Save, LogOut, ShieldCheck, Mail } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [noAp, setNoAp] = useState('');
  const [noIndukKap, setNoIndukKap] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Fungsi ubah password disimulasikan. (Akan terhubung dengan Supabase auth.updateUser)');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Pengaturan Aplikasi</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola profil pengguna, identitas lisensi KAP, dan keamanan sesi Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column (Navigation/Info) */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-atlas-blue text-white rounded-full mx-auto mb-4 text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-800 text-lg">{user?.name || 'Auditor'}</div>
              <div className="text-sm text-gray-500 flex items-center justify-center mt-1">
                <ShieldCheck size={14} className="mr-1 text-green-600" /> {user?.role || 'Auditor'}
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center mt-1">
                <Mail size={12} className="mr-1" /> {user?.email || '-'}
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors rounded border border-red-200"
              >
                <LogOut size={16} className="mr-2" />
                Keluar Aplikasi (Logout)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Forms) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <div className="bg-white rounded shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <User size={18} className="text-atlas-blue mr-2" />
              <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Profil Auditor & Lisensi</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nomor Ijin Akuntan Publik (AP)</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm"
                      placeholder="Contoh: 0001"
                      value={noAp}
                      onChange={e => setNoAp(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Diisi tanpa "AP", akan tersinkronisasi ke Kertas Kerja C.530</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nomor Induk KAP</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm"
                      placeholder="Contoh: 26.2.1974"
                      value={noIndukKap}
                      onChange={e => setNoIndukKap(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Sesuai data di web PPPK Kementerian Keuangan</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end">
                  <button 
                    type="submit"
                    className="flex items-center px-6 py-2.5 bg-atlas-blue text-white font-bold hover:bg-blue-800 transition-colors shadow-sm text-sm"
                  >
                    {isSaved ? <Save size={16} className="mr-2" /> : <Save size={16} className="mr-2" />}
                    {isSaved ? 'Tersimpan!' : 'Simpan Profil'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Form */}
          <div className="bg-white rounded shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <Lock size={18} className="text-gray-600 mr-2" />
              <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Keamanan Akun</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password Saat Ini</label>
                  <input 
                    type="password"
                    required
                    className="w-full border border-gray-300 p-2.5 outline-none focus:border-gray-800 text-sm"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password Baru</label>
                  <input 
                    type="password"
                    required
                    className="w-full border border-gray-300 p-2.5 outline-none focus:border-gray-800 text-sm"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="flex items-center px-6 py-2.5 border border-gray-800 text-gray-800 font-bold hover:bg-gray-100 transition-colors shadow-sm text-sm"
                  >
                    Perbarui Password
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
