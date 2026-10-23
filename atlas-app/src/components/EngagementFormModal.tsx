import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Briefcase, 
  FolderKanban, 
  ClipboardList, 
  FileCheck2, 
  UserCheck, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  Check,
  Plus,
  Maximize2,
  Minimize2,
  X,
  Sliders
} from 'lucide-react';
import { useEngagementStore } from '../store/engagementStore';
import type { Engagement } from '../store/engagementStore';
import { useAccountingStandardStore } from '../store/accountingStandardStore';
import { SYSTEM_ROLES } from '../constants/roles';
import { 
  getSynchronizedKAPUsersSync, 
  getSynchronizedKAPUsers, 
  type UserData,
  getPartners,
  getManagers,
  getSupervisors,
  getLeadAuditors,
  getAdditionalTeamMembers
} from '../utils/userManagement';

interface EngagementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Engagement | null;
}

const EngagementFormModal = ({ isOpen, onClose, initialData = null }: EngagementFormModalProps) => {
  const { addEngagement, updateEngagement, addAuditLog } = useEngagementStore();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<{ id: string; name: string; role: string; email?: string }[]>([]);

  const { standards } = useAccountingStandardStore();
  const availableStandards = useMemo(() => {
    const active = standards.filter(s => s.isActive);
    if (initialData?.accountingStandard && !active.some(s => s.code === initialData.accountingStandard)) {
      const match = standards.find(s => s.code === initialData.accountingStandard);
      if (match) return [...active, match];
      return [
        ...active,
        {
          id: 'legacy',
          code: initialData.accountingStandard,
          name: initialData.accountingStandard,
          description: 'Standar Akuntansi Perikatan',
          category: 'Lainnya',
          isActive: true,
          isSystemDefault: false
        }
      ];
    }
    return active;
  }, [standards, initialData]);

  // Synchronize users immediately and asynchronously when modal is opened
  useEffect(() => {
    if (isOpen) {
      // 1. Instant sync from local cache
      const cached = getSynchronizedKAPUsersSync();
      setAllUsers(cached);

      // 2. Pre-populate assigned team members if editing
      if (initialData?.teamMembers && Array.isArray(initialData.teamMembers)) {
        setSelectedTeamMembers(initialData.teamMembers);
      } else {
        setSelectedTeamMembers([]);
      }

      // 3. Background sync with database
      getSynchronizedKAPUsers().then(synced => {
        if (synced && synced.length > 0) {
          setAllUsers(synced);
        }
      }).catch(err => {
        console.warn('Sync KAP users error (using cached):', err);
      });
    }
  }, [isOpen, initialData]);

  // Group users based on the 9 KAP SPAP Roles
  const partnerOptions = useMemo(() => getPartners(allUsers), [allUsers]);
  const managerOptions = useMemo(() => getManagers(allUsers), [allUsers]);
  const supervisorOptions = useMemo(() => getSupervisors(allUsers), [allUsers]);
  const leadAuditorOptions = useMemo(() => getLeadAuditors(allUsers), [allUsers]);
  const additionalStaffOptions = useMemo(() => getAdditionalTeamMembers(allUsers), [allUsers]);

  const { register, handleSubmit, reset } = useForm<Engagement>({
    defaultValues: initialData || {
      status: 'Draft',
      progress: 0,
      engagementType: 'First Year',
      accountingStandard: 'SAK_UMUM',
      currency: 'IDR',
      presentationUnit: 'Full',
      partnerName: '',
      managerName: '',
      supervisorName: '',
      auditorName: ''
    }
  });

  // Reset form values if initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          status: 'Draft',
          progress: 0,
          engagementType: 'First Year',
          accountingStandard: 'SAK_UMUM',
          currency: 'IDR',
          presentationUnit: 'Full',
          partnerName: partnerOptions[0]?.full_name || '',
          managerName: managerOptions[0]?.full_name || '',
          supervisorName: supervisorOptions[0]?.full_name || '',
          auditorName: leadAuditorOptions[0]?.full_name || '',
        });
      }
    }
  }, [isOpen, initialData, reset, partnerOptions, managerOptions, supervisorOptions, leadAuditorOptions]);

  // Toggle selection for additional field team members (Anggota Tim 1, 2, dst, Tenaga Pendukung)
  const toggleTeamMember = (user: UserData) => {
    const roleName = user.roles?.name || 'Anggota Tim';
    const exists = selectedTeamMembers.some(m => m.id === user.id || m.name === user.full_name);
    if (exists) {
      setSelectedTeamMembers(prev => prev.filter(m => m.id !== user.id && m.name !== user.full_name));
    } else {
      setSelectedTeamMembers(prev => [
        ...prev,
        {
          id: user.id,
          name: user.full_name,
          role: roleName,
          email: user.email
        }
      ]);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: Engagement) => {
    setIsSubmitting(true);
    try {
      const selectedPartner = allUsers.find(u => u.full_name === data.partnerName);
      const selectedManager = allUsers.find(u => u.full_name === data.managerName);
      const selectedSupervisor = allUsers.find(u => u.full_name === data.supervisorName);
      const selectedAuditor = allUsers.find(u => u.full_name === data.auditorName);

      const payload: Engagement = {
        ...data,
        partnerId: selectedPartner?.id || data.partnerId || '',
        managerId: selectedManager?.id || data.managerId || '',
        supervisorId: selectedSupervisor?.id || data.supervisorId || '',
        auditorId: selectedAuditor?.id || data.auditorId || '',
        teamMembers: selectedTeamMembers,
      };

      if (initialData) {
        await updateEngagement(initialData.id, payload);
        addAuditLog({
          engagementId: initialData.id,
          user: payload.partnerName || 'User',
          action: 'Memperbarui Perikatan',
          module: 'Engagement',
          record: payload.clientName,
        });
      } else {
        const year = data.fiscalYear ? new Date(data.fiscalYear).getFullYear() : new Date().getFullYear();
        const newEng: Engagement = {
          ...payload,
          id: data.id || `ENG-${year}-${Math.floor(100 + Math.random() * 900)}`,
          status: 'Draft',
          progress: 0,
        };
        await addEngagement(newEng);
        addAuditLog({
          engagementId: newEng.id,
          user: newEng.partnerName || 'User',
          action: 'Membuat Perikatan',
          module: 'Engagement',
          record: newEng.clientName,
          newValue: 'Draft'
        });
      }
      onClose();
    } catch (err) {
      console.error('Error submitting engagement form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateAdmin = () => {
    onClose();
    navigate('/admin');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        className={`bg-white border border-slate-200/90 shadow-2xl rounded-2xl w-full flex flex-col font-sans overflow-hidden transition-all duration-200 ${
          isExpanded 
            ? 'max-w-[98vw] h-[96vh]' 
            : 'max-w-6xl xl:max-w-7xl max-h-[92vh]'
        }`}
      >
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50/90 backdrop-blur-xs sticky top-0 z-10 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-atlas-blue border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <FolderKanban size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
                  {initialData ? 'Edit Master Perikatan' : 'Buat Engagement Baru'}
                </h2>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-atlas-blue border border-blue-200">
                  SPAP & Standar KAP
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  KAP FRIDOLINUS PENO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Setup Master Data Perikatan, Standar Akuntansi & Susunan 9 Role Tim Audit SPAP
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 ml-3">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-500 hover:text-slate-800 p-2 hover:bg-slate-200/60 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title={isExpanded ? 'Kecilkan Tampilan (Default Max-Width)' : 'Perluas Penuh Layar (Full Width)'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-200/60 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title="Tutup"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-100/30">
          
          {/* Top Section: 2 Balanced Cards Side by Side (5 cols vs 7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* ── 1. Identitas Klien ── */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Briefcase size={13} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Identitas Klien</h3>
                    <p className="text-[10px] text-slate-500">Profil legalitas entitas yang diaudit</p>
                  </div>
                </div>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Nama Entitas Klien <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...register('clientName', { required: true })} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-2xs" 
                      placeholder="Contoh: PT Kertas Nusantara Sejahtera" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Alamat Lengkap Klien
                    </label>
                    <input 
                      {...register('clientAddress' as any)} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-2xs" 
                      placeholder="Jalan, Kawasan Industri, Kota, Provinsi" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Bidang Usaha / Sektor Industri
                    </label>
                    <input 
                      {...register('clientIndustry' as any)} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-2xs" 
                      placeholder="Contoh: Manufaktur, Perdagangan, Jasa Keuangan, Konstruksi" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-600 flex items-center space-x-2 mt-2">
                <Shield size={13} className="text-atlas-blue shrink-0" />
                <span>Terhubung otomatis dengan modul <strong>PMPJ & CDD KAP</strong>.</span>
              </div>
            </div>

            {/* ── 2. Informasi Perikatan ── */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ClipboardList size={13} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ketentuan & Standar Perikatan</h3>
                  <p className="text-[10px] text-slate-500">Periode audit, kerangka akuntansi & mata uang</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Periode Audit</label>
                  <input 
                    type="date"
                    {...register('auditPeriod')} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-2xs" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Tahun Buku</label>
                  <input 
                    type="date"
                    {...register('fiscalYear')} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-2xs" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Jenis Perikatan</label>
                  <select 
                    {...register('engagementType')} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-2xs"
                  >
                    <option value="First Year">Tahun Pertama (First Year)</option>
                    <option value="Recurring">Berkelanjutan (Recurring)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Standar Akuntansi <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/settings?tab=standards');
                      }}
                      className="text-[10px] text-atlas-blue hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      title="Buka Pengaturan Master Standar Akuntansi KAP"
                    >
                      <Sliders size={10} />
                      <span>Kelola Standar</span>
                    </button>
                  </div>
                  <select 
                    {...register('accountingStandard')} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-2xs cursor-pointer"
                  >
                    {availableStandards.map((std) => (
                      <option key={std.code} value={std.code}>
                        {std.name} {std.pelitaCategory ? `— [PELITA: ${std.pelitaCategory}]` : (std.category ? `(${std.category})` : '')}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 shrink-0">
                      Aplikasi PELITA Kemenkeu
                    </span>
                    <span className="truncate">Sesuai klasifikasi resmi pelaporan PPPK Kemenkeu & QR Code LAI</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Mata Uang</label>
                  <select 
                    {...register('currency')} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-2xs"
                  >
                    <option value="IDR">IDR (Rupiah Indonesia)</option>
                    <option value="USD">USD (Dolar Amerika Serikat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Satuan Pembukuan</label>
                  <select 
                    {...register('presentationUnit')} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-2xs"
                  >
                    <option value="Full">Penuh (Satuan Utuh)</option>
                    <option value="Thousands">Ribuan (000)</option>
                    <option value="Millions">Jutaan (000.000)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* ── 3. Susunan Tim Perikatan Audit (Sinkronisasi 9 Role KAP SPAP) ── */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Users size={15} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Susunan Tim Perikatan Audit (Role KAP SPAP)
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Sinkron Realtime
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Daftar personel & peran diambil dari master Manajemen Sistem & Peran KAP.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNavigateAdmin}
                className="inline-flex items-center text-xs font-medium text-atlas-blue hover:text-blue-800 bg-white border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
              >
                <ExternalLink size={12} className="mr-1.5" />
                Kelola Anggota & Peran KAP
              </button>
            </div>
            
            {/* 4 Core Roles Grid */}
            <div>
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>1. Penanggung Jawab & Pengendali Teknis Perikatan</span>
                <span className="text-[10px] text-slate-400 font-normal">(4 Tingkat Utama SPAP)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Partner / Akuntan Publik */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Briefcase size={13} className="text-indigo-600" />
                      <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Partner / AP <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">Role 2</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">Penanggung jawab perikatan & penandatangan LAI</p>
                  <select 
                    {...register('partnerName', { required: true })} 
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all bg-white font-medium shadow-2xs"
                    required
                  >
                    <option value="">-- Pilih Partner --</option>
                    {partnerOptions.length > 0 && (
                      <optgroup label="Partner / AP Terdaftar">
                        {partnerOptions.map(p => (
                          <option key={p.id} value={p.full_name}>
                            {p.full_name} ({p.roles?.name})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {allUsers.filter(u => !partnerOptions.some(p => p.id === u.id)).length > 0 && (
                      <optgroup label="Anggota Lainnya">
                        {allUsers.filter(u => !partnerOptions.some(p => p.id === u.id)).map(u => (
                          <option key={u.id} value={u.full_name}>
                            {u.full_name} ({u.roles?.name || 'Anggota'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* 2. Manager */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <FolderKanban size={13} className="text-blue-600" />
                      <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Manager <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Role 3</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">Manajer perikatan & reviu strategi audit</p>
                  <select 
                    {...register('managerName', { required: true })} 
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all bg-white font-medium shadow-2xs"
                    required
                  >
                    <option value="">-- Pilih Manager --</option>
                    {managerOptions.length > 0 && (
                      <optgroup label="Manager Terdaftar">
                        {managerOptions.map(m => (
                          <option key={m.id} value={m.full_name}>
                            {m.full_name} ({m.roles?.name})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {allUsers.filter(u => !managerOptions.some(m => m.id === u.id)).length > 0 && (
                      <optgroup label="Anggota Lainnya">
                        {allUsers.filter(u => !managerOptions.some(m => m.id === u.id)).map(u => (
                          <option key={u.id} value={u.full_name}>
                            {u.full_name} ({u.roles?.name || 'Anggota'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* 3. Supervisor */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5 hover:border-cyan-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <ClipboardList size={13} className="text-cyan-600" />
                      <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Supervisor
                      </label>
                    </div>
                    <span className="text-[9px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">Role 4</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">Supervisi teknis metodologi & SPM KAP</p>
                  <select 
                    {...register('supervisorName')} 
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none transition-all bg-white font-medium shadow-2xs"
                  >
                    <option value="">-- Pilih Supervisor (Opsional) --</option>
                    {supervisorOptions.length > 0 && (
                      <optgroup label="Supervisor Terdaftar">
                        {supervisorOptions.map(s => (
                          <option key={s.id} value={s.full_name}>
                            {s.full_name} ({s.roles?.name})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {allUsers.filter(u => !supervisorOptions.some(s => s.id === u.id)).length > 0 && (
                      <optgroup label="Anggota Lainnya">
                        {allUsers.filter(u => !supervisorOptions.some(s => s.id === u.id)).map(u => (
                          <option key={u.id} value={u.full_name}>
                            {u.full_name} ({u.roles?.name || 'Anggota'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* 4. Ketua Tim (In-Charge) */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <FileCheck2 size={13} className="text-emerald-600" />
                      <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Ketua Tim <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Role 5</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">Auditor in-charge pimpinan audit lapangan</p>
                  <select 
                    {...register('auditorName', { required: true })} 
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all bg-white font-medium shadow-2xs"
                    required
                  >
                    <option value="">-- Pilih Ketua Tim --</option>
                    {leadAuditorOptions.length > 0 && (
                      <optgroup label="Ketua Tim Terdaftar">
                        {leadAuditorOptions.map(l => (
                          <option key={l.id} value={l.full_name}>
                            {l.full_name} ({l.roles?.name})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {allUsers.filter(u => !leadAuditorOptions.some(l => l.id === u.id)).length > 0 && (
                      <optgroup label="Anggota Lainnya">
                        {allUsers.filter(u => !leadAuditorOptions.some(l => l.id === u.id)).map(u => (
                          <option key={u.id} value={u.full_name}>
                            {u.full_name} ({u.roles?.name || 'Anggota'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Field Auditors & Support Staff Section (Role 6, 7, 8, 9) */}
            <div className="pt-2 border-t border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    2. Alokasi Anggota Tim Lapangan & Tenaga Pendukung (Role 6 s.d. 9)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Pilih staf auditor lapangan (Anggota Tim 1, 2, dst) serta Tenaga Pendukung yang bertugas pada perikatan ini.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-atlas-blue border border-blue-200 self-start sm:self-auto shadow-2xs">
                  {selectedTeamMembers.length} Personel Ditugaskan
                </span>
              </div>

              {additionalStaffOptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
                  {additionalStaffOptions.map(user => {
                    const isSelected = selectedTeamMembers.some(m => m.id === user.id || m.name === user.full_name);
                    const roleDef = SYSTEM_ROLES.find(r => r.name === user.roles?.name);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleTeamMember(user)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-2.5 select-none ${
                          isSelected 
                            ? 'bg-blue-50/80 border-atlas-blue text-atlas-blue shadow-xs ring-1 ring-atlas-blue/30' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected 
                            ? 'bg-atlas-blue border-atlas-blue text-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {user.full_name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mb-1.5">
                            {user.email}
                          </div>
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            roleDef?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {user.roles?.name || 'Anggota Tim'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">
                    Belum ada staf Anggota Tim 1, 2, dst atau Tenaga Pendukung di master pengguna.
                  </p>
                  <button
                    type="button"
                    onClick={handleNavigateAdmin}
                    className="mt-2 inline-flex items-center text-xs font-semibold text-atlas-blue hover:underline"
                  >
                    <Plus size={12} className="mr-1" /> Tambah Anggota di Manajemen Sistem & Peran
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sticky bottom-0 bg-white z-20 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 px-4 sm:px-5 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <Shield size={14} className="text-slate-400 shrink-0" />
              <span>Status perikatan awal adalah <strong>Draft</strong>. Parameter dan susunan tim dapat diperbarui sewaktu-waktu.</span>
            </div>
            
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors min-h-[38px] flex items-center justify-center shadow-2xs"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold bg-atlas-blue hover:bg-blue-800 disabled:opacity-70 text-white rounded-lg transition-colors shadow-xs min-h-[38px] flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-wait"
              >
                <FolderKanban size={14} className={isSubmitting ? 'animate-pulse' : ''} />
                <span>
                  {isSubmitting 
                    ? 'Menyimpan & Menyinkronkan...' 
                    : initialData 
                      ? 'Simpan Perubahan Perikatan' 
                      : 'Buat Engagement Baru'
                  }
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EngagementFormModal;
