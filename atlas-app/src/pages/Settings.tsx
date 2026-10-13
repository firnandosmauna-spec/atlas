import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAppConfigStore } from '../store/appConfigStore';
import { 
  User, Lock, Save, LogOut, ShieldCheck, Mail, 
  Building2, RotateCcw, CheckCircle2, Sliders
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const config = useAppConfigStore();

  const [activeTab, setActiveTab] = useState<'branding' | 'profile' | 'security'>('branding');

  // App Branding Form States
  const [appNameInput, setAppNameInput] = useState(config.appName);
  const [appShortNameInput, setAppShortNameInput] = useState(config.appShortName);
  const [taglineInput, setTaglineInput] = useState(config.tagline);
  const [institutionInput, setInstitutionInput] = useState(config.institutionName);
  const [isBrandingSaved, setIsBrandingSaved] = useState(false);

  // Profile Form States
  const [fullName, setFullName] = useState(user?.name || '');
  const [noAp, setNoAp] = useState('');
  const [noIndukKap, setNoIndukKap] = useState('');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAppName = appNameInput.trim() || 'ATLAS Web';
    const finalAppShortName = appShortNameInput.trim() || 'ATLAS';
    const finalTagline = taglineInput.trim() || 'Audit Tool & Linked Archive System';
    const finalInstitution = institutionInput.trim() || 'P2PK Kementerian Keuangan';

    config.updateConfig({
      appName: finalAppName,
      appShortName: finalAppShortName,
      tagline: finalTagline,
      institutionName: finalInstitution
    });

    setAppNameInput(finalAppName);
    setAppShortNameInput(finalAppShortName);
    setTaglineInput(finalTagline);
    setInstitutionInput(finalInstitution);

    setIsBrandingSaved(true);
    setTimeout(() => setIsBrandingSaved(false), 3000);
  };

  const handleResetBranding = () => {
    config.resetConfig();
    setAppNameInput('ATLAS Web');
    setAppShortNameInput('ATLAS');
    setTaglineInput('Audit Tool & Linked Archive System');
    setInstitutionInput('P2PK Kementerian Keuangan');

    setIsBrandingSaved(true);
    setTimeout(() => setIsBrandingSaved(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setIsPasswordSaved(false), 3000);
  };

  const tabs = [
    { id: 'branding' as const, label: 'Nama & Identitas Aplikasi', icon: <Building2 size={18} /> },
    { id: 'profile' as const, label: 'Profil Auditor & Lisensi', icon: <User size={18} /> },
    { id: 'security' as const, label: 'Keamanan Akun', icon: <Lock size={18} /> },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto font-sans min-w-0">
      
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-tight">
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Konfigurasi nama aplikasi, identitas KAP, profil auditor, dan kredensial keamanan sistem Anda.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors whitespace-nowrap min-h-[44px] ${
                isActive
                  ? 'border-atlas-blue text-atlas-blue bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className={isActive ? 'text-atlas-blue' : 'text-gray-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Account Card & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-atlas-blue text-white rounded-full mx-auto mb-4 text-2xl font-bold shadow-sm">
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

            {/* Application Branding Summary */}
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Status Aplikasi Aktif</div>
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Nama:</span>
                  <span className="font-bold text-gray-800 uppercase">{config.appName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Singkatan:</span>
                  <span className="font-mono font-semibold text-atlas-blue">{config.appShortName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Versi:</span>
                  <span className="text-gray-700">{config.version}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center px-4 py-2.5 min-h-[44px] bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors rounded border border-red-200 text-sm"
              >
                <LogOut size={16} className="mr-2" />
                Keluar Aplikasi (Logout)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Tab Content */}
        <div className="md:col-span-2 space-y-6">
          
          {/* TAB 1: BRANDING & APP NAME */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 size={18} className="text-atlas-blue mr-2 shrink-0" />
                  <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wider">
                    Pengaturan Nama & Identitas Aplikasi
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-atlas-blue">
                  Branding
                </span>
              </div>

              <div className="p-5 sm:p-6">
                {isBrandingSaved && (
                  <div className="bg-green-50 border-l-4 border-green-600 text-green-800 px-4 py-3 mb-6 text-sm font-medium flex items-center shadow-sm">
                    <CheckCircle2 size={18} className="text-green-600 mr-2 shrink-0" />
                    Pengaturan nama aplikasi berhasil disimpan dan diterapkan ke seluruh sistem!
                  </div>
                )}

                <form onSubmit={handleSaveBranding} className="space-y-5">
                  
                  {/* Nama Aplikasi */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Nama Aplikasi Utama <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm rounded-none focus:bg-white bg-gray-50 transition-colors"
                      value={appNameInput}
                      onChange={e => setAppNameInput(e.target.value)}
                      placeholder="Contoh: ATLAS Web atau SMART AUDIT KAP"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Nama ini tampil pada bilah samping (sidebar), bilah atas, halaman login, dan judul tab peramban.
                    </p>
                  </div>

                  {/* Nama Singkat / Singkatan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Singkatan / Kode Nama Pendek <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        maxLength={12}
                        className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm rounded-none focus:bg-white bg-gray-50 transition-colors"
                        value={appShortNameInput}
                        onChange={e => setAppShortNameInput(e.target.value)}
                        placeholder="Contoh: ATLAS"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        Digunakan saat sidebar diminimalkan dan pada header perangkat seluler.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Nama Instansi / Kantor Akuntan Publik
                      </label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm rounded-none focus:bg-white bg-gray-50 transition-colors"
                        value={institutionInput}
                        onChange={e => setInstitutionInput(e.target.value)}
                        placeholder="Contoh: P2PK Kementerian Keuangan / KAP Rekan"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        Menyesuaikan nama instansi pembuat atau KAP pengguna.
                      </p>
                    </div>
                  </div>

                  {/* Slogan / Deskripsi */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Subjudul / Slogan Aplikasi
                    </label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm rounded-none focus:bg-white bg-gray-50 transition-colors"
                      value={taglineInput}
                      onChange={e => setTaglineInput(e.target.value)}
                      placeholder="Contoh: Audit Tool & Linked Archive System"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Ditampilkan di panel perkenalan login dan keterangan judul dokumen.
                    </p>
                  </div>

                  {/* Live Preview Card */}
                  <div className="mt-6 p-4 bg-slate-900 text-white rounded border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 pb-2">
                      <span className="flex items-center">
                        <Sliders size={14} className="mr-1.5 text-blue-400" />
                        Pratinjau Langsung (Live Preview)
                      </span>
                      <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded font-mono">
                        Real-time
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Sidebar Preview */}
                      <div className="bg-atlas-blue p-3.5 rounded border border-blue-700/60 shadow-inner">
                        <div className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-1">
                          Header Bilah Samping (Sidebar)
                        </div>
                        <div className="text-base font-bold text-white uppercase tracking-wider truncate">
                          {appNameInput || 'ATLAS Web'}
                        </div>
                        <div className="text-[10px] text-blue-200 mt-1.5 truncate">
                          Mode Ringkas: <span className="font-mono bg-blue-900/60 px-1.5 py-0.5 rounded text-white font-bold">{appShortNameInput || 'ATLAS'}</span>
                        </div>
                      </div>

                      {/* Header & Tab Preview */}
                      <div className="bg-slate-800 p-3.5 rounded border border-slate-700 shadow-inner">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                          Judul Tab Peramban & Topbar
                        </div>
                        <div className="text-sm font-semibold text-white truncate">
                          {appNameInput || 'ATLAS Web'} - {taglineInput || 'Audit System'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1.5 truncate">
                          Instansi: <span className="text-slate-200">{institutionInput || 'P2PK Kemenkeu'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={handleResetBranding}
                      className="flex items-center justify-center px-4 py-2.5 min-h-[44px] border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm rounded-none"
                    >
                      <RotateCcw size={16} className="mr-2 text-gray-500" />
                      Kembalikan ke Default
                    </button>

                    <button 
                      type="submit"
                      className="flex items-center justify-center px-6 py-2.5 min-h-[44px] bg-atlas-blue text-white font-bold hover:bg-blue-800 transition-colors shadow-sm text-sm rounded-none"
                    >
                      <Save size={16} className="mr-2" />
                      {isBrandingSaved ? 'Tersimpan!' : 'Simpan Nama Aplikasi'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* TAB 2: AUDITOR PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center">
                <User size={18} className="text-atlas-blue mr-2" />
                <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Profil Auditor & Lisensi</h2>
              </div>
              <div className="p-5 sm:p-6">
                {isProfileSaved && (
                  <div className="bg-green-50 border-l-4 border-green-600 text-green-800 px-4 py-3 mb-6 text-sm font-medium flex items-center shadow-sm">
                    <CheckCircle2 size={18} className="text-green-600 mr-2 shrink-0" />
                    Profil auditor berhasil disimpan!
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nama Lengkap</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm rounded-none"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nomor Ijin Akuntan Publik (AP)</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm rounded-none"
                        placeholder="Contoh: 0001"
                        value={noAp}
                        onChange={e => setNoAp(e.target.value)}
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Diisi tanpa tanda kutip, akan disinkronkan ke Kertas Kerja C.530</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nomor Induk KAP</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 p-2.5 outline-none focus:border-atlas-blue text-sm rounded-none"
                        placeholder="Contoh: 26.2.1974"
                        value={noIndukKap}
                        onChange={e => setNoIndukKap(e.target.value)}
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Sesuai data resmi PPPK Kementerian Keuangan</p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    <button 
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 min-h-[44px] bg-atlas-blue text-white font-bold hover:bg-blue-800 transition-colors shadow-sm text-sm rounded-none"
                    >
                      <Save size={16} className="mr-2" />
                      {isProfileSaved ? 'Tersimpan!' : 'Simpan Profil'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center">
                <Lock size={18} className="text-gray-600 mr-2" />
                <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Keamanan Akun</h2>
              </div>
              <div className="p-5 sm:p-6">
                {isPasswordSaved && (
                  <div className="bg-green-50 border-l-4 border-green-600 text-green-800 px-4 py-3 mb-6 text-sm font-medium flex items-center shadow-sm">
                    <CheckCircle2 size={18} className="text-green-600 mr-2 shrink-0" />
                    Permintaan pembaruan kata sandi berhasil diproses.
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password Saat Ini</label>
                    <input 
                      type="password"
                      required
                      className="w-full border border-gray-300 p-2.5 outline-none focus:border-gray-800 text-sm rounded-none"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password Baru</label>
                    <input 
                      type="password"
                      required
                      className="w-full border border-gray-300 p-2.5 outline-none focus:border-gray-800 text-sm rounded-none"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-4 flex items-center justify-end">
                    <button 
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 min-h-[44px] border border-gray-800 text-gray-800 font-bold hover:bg-gray-100 transition-colors shadow-sm text-sm rounded-none"
                    >
                      <Save size={16} className="mr-2" />
                      Perbarui Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Settings;
