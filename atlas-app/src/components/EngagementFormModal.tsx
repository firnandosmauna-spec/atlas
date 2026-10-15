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
  Plus
} from 'lucide-react';
import { useEngagementStore } from '../store/engagementStore';
import type { Engagement } from '../store/engagementStore';
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

  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<{ id: string; name: string; role: string; email?: string }[]>([]);

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

  const onSubmit = (data: Engagement) => {
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
      updateEngagement(initialData.id, payload);
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
      addEngagement(newEng);
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
  };

  const handleNavigateAdmin = () => {
    onClose();
    navigate('/admin');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 shadow-2xl rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col font-sans overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-atlas-blue flex items-center justify-center">
              <FolderKanban size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-gray-900 uppercase">
                {initialData ? 'Edit Master Perikatan' : 'Buat Engagement Baru'}
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Setup Master Data Perikatan & Susunan Tim Audit SPAP</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-200/60 rounded-lg transition-colors"
            title="Tutup"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            
            {/* ── 1. Identitas Klien ── */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <Briefcase size={14} className="text-blue-600" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Identitas Klien</h3>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Nama Entitas Klien <span className="text-red-500">*</span>
                </label>
                <input 
                  {...register('clientName', { required: true })} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-sm" 
                  placeholder="Contoh: PT Kertas Nusantara Sejahtera" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Alamat Lengkap Klien</label>
                <input 
                  {...register('clientAddress' as any)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-sm" 
                  placeholder="Jalan, Kawasan Industri, Kota, Provinsi" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Bidang Usaha / Sektor Industri</label>
                <input 
                  {...register('clientIndustry' as any)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-sm" 
                  placeholder="Contoh: Manufaktur, Perdagangan, Jasa Keuangan" 
                />
              </div>
            </div>

            {/* ── 2. Informasi Perikatan ── */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <ClipboardList size={14} className="text-emerald-600" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Informasi Perikatan</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Periode Audit</label>
                  <input 
                    type="date"
                    {...register('auditPeriod')} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Tahun Buku</label>
                  <input 
                    type="date"
                    {...register('fiscalYear')} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-sm" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Jenis Perikatan</label>
                  <select 
                    {...register('engagementType')} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-sm"
                  >
                    <option value="First Year">Tahun Pertama (First Year)</option>
                    <option value="Recurring">Berkelanjutan (Recurring)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Standar Akuntansi</label>
                  <select 
                    {...register('accountingStandard')} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-sm"
                  >
                    <option value="SAK_UMUM">SAK Umum</option>
                    <option value="SAK_ETAP">SAK ETAP</option>
                    <option value="SAK_EMKM">SAK EMKM</option>
                    <option value="PSAK_SYARIAH">PSAK Syariah</option>
                    <option value="SAP">SAP (Standar Akuntansi Pemerintahan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Mata Uang</label>
                  <select 
                    {...register('currency')} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-sm"
                  >
                    <option value="IDR">IDR (Rupiah Indonesia)</option>
                    <option value="USD">USD (Dolar Amerika Serikat)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Satuan Pembukuan</label>
                  <select 
                    {...register('presentationUnit')} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-sm"
                  >
                    <option value="Full">Penuh (Satuan Utuh)</option>
                    <option value="Thousands">Ribuan (000)</option>
                    <option value="Millions">Jutaan (000.000)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── 3. Susunan Tim Perikatan Audit (Role KAP SPAP) ── */}
            <div className="space-y-5 md:col-span-2 bg-slate-50/70 border border-slate-200/80 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-atlas-blue" />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Susunan Tim Perikatan Audit (Sinkronisasi Role KAP)
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Daftar pengguna dan penugasan peran diambil langsung dari master Manajemen Sistem & Peran.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Partner / Akuntan Publik */}
                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Briefcase size={13} className="text-indigo-600" />
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Partner / AP <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-1">Penanggung jawab perikatan & LAI</p>
                  <select 
                    {...register('partnerName', { required: true })} 
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all bg-white font-medium"
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
                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <FolderKanban size={13} className="text-blue-600" />
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Manager <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-1">Manajer perikatan & reviu strategi</p>
                  <select 
                    {...register('managerName', { required: true })} 
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all bg-white font-medium"
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
                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <ClipboardList size={13} className="text-cyan-600" />
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Supervisor
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-1">Supervisi teknis metodologi & SPM</p>
                  <select 
                    {...register('supervisorName')} 
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs text-gray-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none transition-all bg-white font-medium"
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
                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <FileCheck2 size={13} className="text-emerald-600" />
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Ketua Tim <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-1">Auditor in-charge pimpinan lapangan</p>
                  <select 
                    {...register('auditorName', { required: true })} 
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all bg-white font-medium"
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

              {/* Additional Field Auditors & Support Staff Section (Role 6, 7, 8, 9) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Alokasi Anggota Tim Lapangan & Tenaga Pendukung
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Tugaskan staf auditor (Anggota Tim 1, 2, dst) dan Tenaga Pendukung yang bertugas pada perikatan ini.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-atlas-blue border border-blue-200">
                    {selectedTeamMembers.length} Ditugaskan
                  </span>
                </div>

                {additionalStaffOptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {additionalStaffOptions.map(user => {
                      const isSelected = selectedTeamMembers.some(m => m.id === user.id || m.name === user.full_name);
                      const roleDef = SYSTEM_ROLES.find(r => r.name === user.roles?.name);
                      return (
                        <div
                          key={user.id}
                          onClick={() => toggleTeamMember(user)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start space-x-2.5 ${
                            isSelected 
                              ? 'bg-blue-50/70 border-atlas-blue shadow-xs' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-atlas-blue border-atlas-blue text-white' 
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">
                              {user.full_name}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate mb-1">
                              {user.email}
                            </div>
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              roleDef?.badgeClass || 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {user.roles?.name || 'Anggota Tim'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-gray-300 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">
                      Belum ada Anggota Tim 1, 2, dst atau Tenaga Pendukung di master pengguna.
                    </p>
                    <button
                      type="button"
                      onClick={handleNavigateAdmin}
                      className="mt-1.5 inline-flex items-center text-xs font-medium text-atlas-blue hover:underline"
                    >
                      <Plus size={12} className="mr-1" /> Tambah Anggota di Manajemen Sistem & Peran
                    </button>
                  </div>
                )}
              </div>

            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 bg-white z-10">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px] flex items-center justify-center"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-xs font-bold bg-atlas-blue hover:bg-blue-800 text-white rounded-lg transition-colors shadow-sm min-h-[44px] flex items-center justify-center"
            >
              {initialData ? 'Simpan Perubahan Perikatan' : 'Buat Engagement Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EngagementFormModal;
