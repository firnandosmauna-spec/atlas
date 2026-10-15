import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAppConfigStore } from '../store/appConfigStore';
import { 
  User, Lock, Save, LogOut, ShieldCheck, 
  Building2, RotateCcw, Check, Sliders, BookOpen
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
    const finalAppName = appNameInput.trim() || 'SMART AUDIT PRO';
    const finalAppShortName = appShortNameInput.trim() || 'SAP';
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
    setAppNameInput('SMART AUDIT PRO');
    setAppShortNameInput('SAP');
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
    { id: 'branding' as const, label: 'Identitas & Nama Aplikasi', icon: Building2, color: 'text-blue-600' },
    { id: 'profile' as const, label: 'Profil Auditor & Lisensi', icon: User, color: 'text-indigo-600' },
    { id: 'security' as const, label: 'Keamanan Akun', icon: Lock, color: 'text-slate-600' },
  ];

  return (
    <div className="w-full font-sans min-w-0 space-y-3.5">
      
      {/* HEADER UTAMA: FULL FRAME & RAMPING */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:px-5 sm:py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sliders size={16} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Pengaturan Sistem
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
                Identitas, Profil & Keamanan
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Kelola identitas aplikasi, profil lisensi KAP, dan akses keamanan akun Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px] shadow-2xs">
            Versi: <span className="font-semibold text-slate-900">{config.version || '1.0.0'}</span>
          </div>
        </div>
      </div>

      {/* SEGMENTED TAB CONTROL BAR */}
      <div className="flex p-1 bg-slate-200/50 rounded-xl border border-slate-200/70 overflow-x-auto scrollbar-none text-xs font-medium gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg whitespace-nowrap transition-all text-xs font-medium ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Icon size={14} className={isActive ? tab.color : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT GRID: FULL FRAME MAX WIDTH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* KOLOM KIRI: STATUS AKUN & INFORMASI SISTEM (4 COLS on lg, 3 COLS on xl) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
          
          {/* Kartu Profil Singkat */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="bg-slate-50/90 border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 tracking-tight">Akun Pengguna</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Online
              </span>
            </div>

            <div className="p-3.5 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm border border-slate-700 shrink-0 shadow-2xs">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 truncate">
                    {user?.name || 'Auditor'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                    {user?.email || 'auditor@kap.com'}
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Peran:</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[10px]">
                    <ShieldCheck size={11} className="mr-1 text-emerald-600" />
                    {user?.role || 'Auditor'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Aplikasi:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[130px] font-mono text-[10px]" title={config.appName}>
                    {config.appShortName || 'SAP'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/60 rounded-lg border border-rose-200 transition-colors shadow-2xs"
                >
                  <LogOut size={13} />
                  <span>Keluar Aplikasi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Kartu Ringkasan Regulasi */}
          <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-3 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
              <BookOpen size={13} className="text-blue-600" />
              <span>Standar SPAP & KAP</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Identitas aplikasi dan profil auditor disinkronkan secara terintegrasi ke seluruh kertas kerja audit (A110–C530).
            </p>
          </div>

        </div>

        {/* KOLOM KANAN: KONTEN TAB AKTIF (8 COLS on lg, 9 COLS on xl) */}
        <div className="lg:col-span-8 xl:col-span-9">
          
          {/* TAB 1: IDENTITAS & NAMA APLIKASI */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 rounded-full bg-blue-600"></div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-800 tracking-tight">
                      Identitas & Nama Aplikasi
                    </h2>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/70">
                  Parameter Tampilan
                </span>
              </div>

              <div className="p-3.5 sm:p-5 space-y-3.5 text-xs">
                {isBrandingSaved && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Perubahan identitas aplikasi berhasil disimpan dan langsung diterapkan ke seluruh sistem.</span>
                  </div>
                )}

                <form onSubmit={handleSaveBranding} className="space-y-3.5">
                  
                  {/* Grid Baris 1: Nama Utama & Singkatan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nama Aplikasi Utama <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-semibold"
                        value={appNameInput}
                        onChange={e => setAppNameInput(e.target.value)}
                        placeholder="Contoh: SMART AUDIT PRO"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Tampil pada header bilah samping, tab browser, dan halaman login.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Singkatan / Kode <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        maxLength={10}
                        className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 uppercase"
                        value={appShortNameInput}
                        onChange={e => setAppShortNameInput(e.target.value)}
                        placeholder="Contoh: SAP"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Tampil saat bilah samping diciutkan.
                      </span>
                    </div>
                  </div>

                  {/* Grid Baris 2: Instansi & Slogan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nama Instansi / KAP
                      </label>
                      <input 
                        type="text"
                        className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                        value={institutionInput}
                        onChange={e => setInstitutionInput(e.target.value)}
                        placeholder="Contoh: P2PK Kementerian Keuangan / KAP Fridolinus Peno"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Otoritas kerangka kerja audit atau entitas KAP pelaksana.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Subjudul / Slogan Aplikasi
                      </label>
                      <input 
                        type="text"
                        className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                        value={taglineInput}
                        onChange={e => setTaglineInput(e.target.value)}
                        placeholder="Contoh: Audit Tool & Linked Archive System"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Deskripsi pengenal yang tampil pada judul tab dan laporan.
                      </span>
                    </div>
                  </div>

                  {/* Pratinjau Langsung (Live Preview) Full Frame */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Pratinjau Tampilan Visual
                      </span>
                      <span className="text-[10px] font-mono text-blue-600 font-semibold">
                        Real-Time Preview
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Sidebar Preview */}
                      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-2xs">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Bilah Samping (Sidebar)</div>
                        <div className="text-sm font-black tracking-wide mt-1 truncate uppercase font-sans text-white">
                          {appNameInput || 'SMART AUDIT PRO'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                          <span>Kode Ciut: <span className="text-amber-400 font-bold">{appShortNameInput || 'SAP'}</span></span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">Aktif</span>
                        </div>
                      </div>

                      {/* Header Preview */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Header & Dokumen</div>
                        <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                          {appNameInput || 'SMART AUDIT PRO'} <span className="text-slate-400 font-normal">·</span> <span className="text-xs text-slate-600 font-normal">{taglineInput || 'Audit Tool'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 truncate font-mono">
                          {institutionInput || 'P2PK Kementerian Keuangan'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <button 
                      type="button"
                      onClick={handleResetBranding}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs rounded-lg border border-slate-200 transition-colors shadow-2xs"
                    >
                      <RotateCcw size={13} className="text-slate-400" />
                      <span>Kembalikan ke Default</span>
                    </button>

                    <button 
                      type="submit"
                      className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                    >
                      <Save size={13} />
                      <span>{isBrandingSaved ? 'Tersimpan' : 'Simpan Perubahan Identitas'}</span>
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL AUDITOR & LISENSI KAP */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 rounded-full bg-indigo-600"></div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-800 tracking-tight">
                      Profil Auditor & Lisensi KAP
                    </h2>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/70">
                  Data SPAP & PPPK
                </span>
              </div>

              <div className="p-3.5 sm:p-5 space-y-3.5 text-xs">
                {isProfileSaved && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Profil auditor dan lisensi KAP berhasil disimpan.</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Lengkap Auditor <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-semibold"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Contoh: Fridolinus Peno, CPA"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nomor Ijin Akuntan Publik (AP)
                      </label>
                      <input 
                        type="text"
                        className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                        placeholder="Contoh: AP.0001"
                        value={noAp}
                        onChange={e => setNoAp(e.target.value)}
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                        Disinkronkan otomatis ke Kertas Kerja C.530.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nomor Induk KAP
                      </label>
                      <input 
                        type="text"
                        className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                        placeholder="Contoh: 26.2.1974"
                        value={noIndukKap}
                        onChange={e => setNoIndukKap(e.target.value)}
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                        Sesuai data resmi di situs PPPK Kementerian Keuangan.
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit"
                      className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                    >
                      <Save size={13} />
                      <span>{isProfileSaved ? 'Tersimpan' : 'Simpan Profil Auditor'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: KEAMANAN AKUN */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 rounded-full bg-slate-600"></div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-800 tracking-tight">
                      Keamanan & Kata Sandi
                    </h2>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/70">
                  Kredensial
                </span>
              </div>

              <div className="p-3.5 sm:p-5 space-y-3.5 text-xs">
                {isPasswordSaved && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Kata sandi berhasil diperbarui dengan aman.</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="password"
                        required
                        className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Kata Sandi Baru <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="password"
                        required
                        className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit"
                      className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                    >
                      <Save size={13} />
                      <span>Perbarui Kata Sandi</span>
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
