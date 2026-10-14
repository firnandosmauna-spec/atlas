import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAppConfigStore } from '../store/appConfigStore';
import { 
  User, Lock, Save, LogOut, ShieldCheck, Mail, 
  Building2, RotateCcw, Check, Sparkles
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const config = useAppConfigStore();

  const [activeTab, setActiveTab] = useState<'branding' | 'profile' | 'security'>('branding');

  // App Branding States
  const [appNameInput, setAppNameInput] = useState(config.appName);
  const [appShortNameInput, setAppShortNameInput] = useState(config.appShortName);
  const [taglineInput, setTaglineInput] = useState(config.tagline);
  const [institutionInput, setInstitutionInput] = useState(config.institutionName);
  const [isBrandingSaved, setIsBrandingSaved] = useState(false);

  // Profile States
  const [fullName, setFullName] = useState(user?.name || '');
  const [noAp, setNoAp] = useState('');
  const [noIndukKap, setNoIndukKap] = useState('');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Password States
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
    setTimeout(() => setIsBrandingSaved(false), 2500);
  };

  const handleResetBranding = () => {
    config.resetConfig();
    setAppNameInput('ATLAS Web');
    setAppShortNameInput('ATLAS');
    setTaglineInput('Audit Tool & Linked Archive System');
    setInstitutionInput('P2PK Kementerian Keuangan');

    setIsBrandingSaved(true);
    setTimeout(() => setIsBrandingSaved(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setIsPasswordSaved(false), 2500);
  };

  const tabs = [
    { id: 'branding' as const, label: 'Nama Aplikasi', icon: <Building2 size={16} /> },
    { id: 'profile' as const, label: 'Profil Auditor', icon: <User size={16} /> },
    { id: 'security' as const, label: 'Keamanan Akun', icon: <Lock size={16} /> },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto font-sans min-w-0">
      
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Pengaturan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola identitas aplikasi, profil lisensi KAP, dan akses keamanan akun Anda.
        </p>
      </div>

      {/* Modern Minimalist Segmented Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6 sm:mb-8 overflow-x-auto scrollbar-none border border-slate-200/60 max-w-full sm:max-w-fit">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all min-h-[44px] whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Minimal Profile & System State (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* User Summary Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center font-bold text-base border border-slate-200 shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900 text-sm truncate">
                  {user?.name || 'Auditor'}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email || 'auditor@kap.com'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Peran Sistem:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                <ShieldCheck size={12} className="mr-1 text-emerald-600" />
                {user?.role || 'Auditor'}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Nama Aplikasi:</span>
              <span className="font-medium text-slate-800 truncate max-w-[140px]" title={config.appName}>
                {config.appName}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50/60 rounded-lg border border-red-200/80 transition-colors"
              >
                <LogOut size={15} />
                Keluar Aplikasi
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Active Tab Content (8 cols) */}
        <div className="lg:col-span-8">
          
          {/* TAB 1: NAMA APLIKASI (BRANDING) */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">
                    Identitas & Nama Aplikasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sesuaikan nama yang ditampilkan di bilah samping, bilah atas, dan judul tab.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {isBrandingSaved && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-6 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    Perubahan nama aplikasi berhasil disimpan dan diterapkan seketika.
                  </div>
                )}

                <form onSubmit={handleSaveBranding} className="space-y-5">
                  
                  {/* Nama Aplikasi Utama */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nama Aplikasi Utama <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                      value={appNameInput}
                      onChange={e => setAppNameInput(e.target.value)}
                      placeholder="Contoh: ATLAS Web atau SMART AUDIT KAP"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Nama utama pada bilah navigasi kiri, tab peramban, dan halaman masuk.
                    </p>
                  </div>

                  {/* Singkatan & Instansi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Singkatan / Kode Pendek <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        maxLength={10}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                        value={appShortNameInput}
                        onChange={e => setAppShortNameInput(e.target.value)}
                        placeholder="Contoh: ATLAS"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Digunakan pada bilah samping ringkas dan perangkat seluler.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Instansi / KAP
                      </label>
                      <input 
                        type="text"
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                        value={institutionInput}
                        onChange={e => setInstitutionInput(e.target.value)}
                        placeholder="Contoh: P2PK Kementerian Keuangan"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Nama KAP atau otoritas kerangka kerja audit.
                      </p>
                    </div>
                  </div>

                  {/* Slogan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subjudul / Slogan Aplikasi
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                      value={taglineInput}
                      onChange={e => setTaglineInput(e.target.value)}
                      placeholder="Contoh: Audit Tool & Linked Archive System"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Deskripsi pelengkap yang tampil di halaman masuk dan judul dokumen.
                    </p>
                  </div>

                  {/* Minimalist Live Preview */}
                  <div className="pt-2">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Pratinjau Langsung</span>
                      <span className="text-[11px] text-slate-400 font-normal">Pembaruan otomatis</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Sidebar Preview */}
                      <div className="bg-slate-900 text-white p-3.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Bilah Samping</div>
                        <div className="text-sm font-bold tracking-wide mt-1 truncate uppercase">
                          {appNameInput || 'ATLAS Web'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Singkatan: <span className="font-mono text-white font-semibold">{appShortNameInput || 'ATLAS'}</span>
                        </div>
                      </div>

                      {/* Header Preview */}
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                        <div className="text-[10px] text-slate-500 uppercase font-medium">Tab Dokumen</div>
                        <div className="text-sm font-semibold text-slate-900 mt-1 truncate">
                          {appNameInput || 'ATLAS Web'} · {taglineInput || 'Audit System'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 truncate">
                          {institutionInput || 'P2PK Kementerian Keuangan'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button 
                      type="button"
                      onClick={handleResetBranding}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs sm:text-sm rounded-lg border border-slate-200 transition-colors"
                    >
                      <RotateCcw size={14} className="text-slate-400" />
                      Kembalikan ke Default
                    </button>

                    <button 
                      type="submit"
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                    >
                      <Save size={15} />
                      {isBrandingSaved ? 'Tersimpan' : 'Simpan Nama Aplikasi'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL AUDITOR */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm">
                  Profil Auditor & Lisensi KAP
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informasi data lisensi resmi untuk sinkronisasi otomatis ke kertas kerja audit.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                {isProfileSaved && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-6 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    Profil auditor berhasil disimpan.
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nama Lengkap Auditor
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nomor Ijin Akuntan Publik (AP)
                      </label>
                      <input 
                        type="text"
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                        placeholder="Contoh: 0001"
                        value={noAp}
                        onChange={e => setNoAp(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Akan disinkronkan ke Kertas Kerja C.530.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nomor Induk KAP
                      </label>
                      <input 
                        type="text"
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                        placeholder="Contoh: 26.2.1974"
                        value={noIndukKap}
                        onChange={e => setNoIndukKap(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sesuai data resmi di situs PPPK Kementerian Keuangan.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                    >
                      <Save size={15} />
                      {isProfileSaved ? 'Tersimpan' : 'Simpan Profil'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: KEAMANAN AKUN */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm">
                  Keamanan & Kata Sandi
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui kata sandi secara berkala untuk menjaga keamanan akses akun audit Anda.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                {isPasswordSaved && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-6 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    Kata sandi berhasil diperbarui.
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Kata Sandi Saat Ini
                    </label>
                    <input 
                      type="password"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Kata Sandi Baru
                    </label>
                    <input 
                      type="password"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                    >
                      <Save size={15} />
                      Perbarui Kata Sandi
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
