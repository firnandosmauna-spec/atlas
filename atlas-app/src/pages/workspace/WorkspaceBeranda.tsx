import { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Engagement } from '../../store/engagementStore';
import { useEngagementStore } from '../../store/engagementStore';
import { useAuthStore } from '../../store/authStore';
import { useAccountingStandardStore } from '../../store/accountingStandardStore';
import { Users, Building, FileSpreadsheet, Save, CheckCircle, Edit2, X, Plus, Trash2, AlertTriangle } from 'lucide-react';
import EngagementFormModal from '../../components/EngagementFormModal';
import { getSynchronizedKAPUsersSync } from '../../utils/userManagement';

// ─── Field renderers ────────────────────────────────────────────────
const FieldRow = ({
  label,
  value,
  editing,
  editNode,
}: {
  label: string;
  value: React.ReactNode;
  editing: boolean;
  editNode?: React.ReactNode;
}) => (
  <div className="py-3 border-b border-gray-100 last:border-0">
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    {editing && editNode ? editNode : (
      <p className="text-sm font-medium text-gray-900">{value || <span className="text-gray-400 italic">—</span>}</p>
    )}
  </div>
);

const inputCls = 'w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none bg-white';
const selectCls = `${inputCls}`;

// ─── Helpers ────────────────────────────────────────────────────────
const ENGAGEMENT_TYPE_LABELS: Record<string, string> = {
  'First Year': 'Perikatan Tahun Pertama',
  'Recurring': 'Perikatan Berkelanjutan (Recurring)',
};
const STANDARD_LABELS: Record<string, string> = {
  SAK_UMUM: 'SAK Umum (PSAK)',
  SAK_ETAP: 'SAK ETAP',
  SAK_EMKM: 'SAK EMKM',
  PSAK_SYARIAH: 'PSAK Syariah',
  SAP: 'SAP (Pemerintah)',
};
const UNIT_LABELS: Record<string, string> = {
  Full: 'Penuh (Full)',
  Thousands: 'Ribuan (Rp 000)',
  Millions: 'Jutaan (Rp 000.000)',
};

// ─── Dynamic Audit Team Types & Helpers ──────────────────────────────
export interface DynamicAuditTeamMember {
  id: string;
  name: string;
  role: string;
  responsibility: string;
  email?: string;
}

export const ROLE_OPTIONS = [
  'Ketua Tim',
  'Supervisor',
  'Auditor',
  'Partner',
  'Manager',
  'Tenaga Ahli / Spesialis'
] as const;

export const getDefaultResponsibility = (role: string): string => {
  switch (role) {
    case 'Partner':
      return 'Penanggung jawab akhir atas perikatan audit, perumusan opini audit, dan penandatanganan Laporan Auditor Independen.';
    case 'Manager':
      return 'Manajemen operasional perikatan, review menyeluruh kertas kerja, alokasi anggaran jam jasa, dan koordinasi dengan entitas.';
    case 'Supervisor':
      return 'Supervisi teknis metodologi SPAP, review kualitas pengujian substantif dan kepatuhan prosedur di lapangan.';
    case 'Ketua Tim':
      return 'Memimpin pelaksanaan audit lapangan harian, mengarahkan anggota tim, dan mengkoordinasikan konfirmasi serta temuan.';
    case 'Auditor':
      return 'Pelaksanaan pengujian substantif saldo akun, uji pengendalian internal, pengumpulan bukti audit, dan dokumentasi KKP.';
    case 'Tenaga Ahli / Spesialis':
      return 'Pemberian evaluasi teknis spesifik (aktuaria, penilaian aset/properti, forensik IT, atau perpajakan kompleks).';
    default:
      return 'Pelaksanaan prosedur audit perikatan sesuai penugasan.';
  }
};

export const getRoleBadgeStyle = (role: string): string => {
  switch (role) {
    case 'Partner':
      return 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
    case 'Manager':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
    case 'Supervisor':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold';
    case 'Ketua Tim':
      return 'bg-blue-50 text-blue-800 border-blue-200 font-semibold';
    case 'Auditor':
      return 'bg-slate-50 text-slate-700 border-slate-200 font-medium';
    case 'Tenaga Ahli / Spesialis':
      return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// ─── Section Card ────────────────────────────────────────────────────
const SectionCard = ({
  number,
  icon,
  title,
  editing,
  canEdit = true,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  editing: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) => (
  <div className="border border-gray-200 bg-white">
    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-bold text-gray-400">{number}</span>
        {icon}
        <h2 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <X size={12} /> Batal
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-gray-900 hover:bg-gray-700 transition-colors"
            >
              <Save size={12} /> Simpan
            </button>
          </>
        ) : (
          canEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Edit2 size={12} /> Edit
            </button>
          )
        )}
      </div>
    </div>
    <div className="px-5">{children}</div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────
const WorkspaceBeranda = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const { engagements, updateEngagement, deleteEngagement } = useEngagementStore();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuthStore();
  const canEdit = hasPermission('fill_worksheet');
  const canDelete = hasPermission('delete_engagement') || !user || ['admin', 'partner', 'partner/akuntan publik', 'manager', 'supervisor', 'ketua tim', 'auditor'].includes((user?.role || '').toLowerCase());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { standards, getStandardName } = useAccountingStandardStore();

  const handleDeleteEngagement = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteEngagement(engagement.id);
      setIsDeleteModalOpen(false);
      navigate('/engagements', { replace: true });
    } catch (err) {
      console.error('Gagal menghapus perikatan:', err);
      alert('Gagal menghapus perikatan. Silakan periksa koneksi atau coba kembali.');
      setIsDeleting(false);
    }
  };

  // ── Section 1: Dynamic Audit Team Management ──
  const [editAuditor, setEditAuditor] = useState(false);
  const [savedAuditor, setSavedAuditor] = useState(false);
  const kapUsers = useMemo(() => getSynchronizedKAPUsersSync(), []);

  const getInitialTeam = (): DynamicAuditTeamMember[] => {
    if (engagement.teamMembers && engagement.teamMembers.length > 0) {
      return engagement.teamMembers.map(tm => ({
        id: tm.id || String(Date.now() + Math.random()),
        name: tm.name || '',
        role: tm.role || 'Auditor',
        responsibility: (tm as any).responsibility || getDefaultResponsibility(tm.role || 'Auditor'),
        email: tm.email || '',
      }));
    }

    const defaultList: DynamicAuditTeamMember[] = [];
    if (engagement.partnerName) {
      defaultList.push({
        id: 'p-1',
        name: engagement.partnerName,
        role: 'Partner',
        responsibility: getDefaultResponsibility('Partner'),
        email: 'partner@kap.com'
      });
    } else {
      defaultList.push({
        id: 'p-1',
        name: 'Drs. Fridolinus Peno, Ak., M.M., CA., CPA.',
        role: 'Partner',
        responsibility: getDefaultResponsibility('Partner'),
        email: 'partner@kap.com'
      });
    }

    if (engagement.managerName) {
      defaultList.push({
        id: 'm-1',
        name: engagement.managerName,
        role: 'Manager',
        responsibility: getDefaultResponsibility('Manager'),
        email: 'manager@kap.com'
      });
    }

    if (engagement.supervisorName) {
      defaultList.push({
        id: 's-1',
        name: engagement.supervisorName,
        role: 'Supervisor',
        responsibility: getDefaultResponsibility('Supervisor'),
        email: 'supervisor@kap.com'
      });
    }

    if (engagement.auditorName) {
      defaultList.push({
        id: 'k-1',
        name: engagement.auditorName,
        role: 'Ketua Tim',
        responsibility: getDefaultResponsibility('Ketua Tim'),
        email: 'auditor@kap.com'
      });
    } else {
      defaultList.push({
        id: 'k-1',
        name: 'Dwi Safitriana, S.E., M.Ak.',
        role: 'Ketua Tim',
        responsibility: getDefaultResponsibility('Ketua Tim'),
        email: 'dwisafitriana@kap.com'
      });
    }

    defaultList.push({
      id: 'a-1',
      name: 'Rudi Substantif, S.Ak.',
      role: 'Auditor',
      responsibility: getDefaultResponsibility('Auditor'),
      email: 'rudi.substantif@kap.com'
    });

    return defaultList;
  };

  const [teamList, setTeamList] = useState<DynamicAuditTeamMember[]>(getInitialTeam);
  const [draftTeamList, setDraftTeamList] = useState<DynamicAuditTeamMember[]>(getInitialTeam);

  const handleStartEdit = () => {
    setDraftTeamList(JSON.parse(JSON.stringify(teamList)));
    setEditAuditor(true);
  };

  const handleCancelEdit = () => {
    setDraftTeamList(JSON.parse(JSON.stringify(teamList)));
    setEditAuditor(false);
  };

  const handleRoleChange = (index: number, newRole: string) => {
    setDraftTeamList(prev => {
      const updated = [...prev];
      const prevRole = updated[index].role;
      updated[index].role = newRole;
      if (!updated[index].responsibility || updated[index].responsibility === getDefaultResponsibility(prevRole)) {
        updated[index].responsibility = getDefaultResponsibility(newRole);
      }
      return updated;
    });
  };

  const handleNameChange = (index: number, newName: string) => {
    setDraftTeamList(prev => {
      const updated = [...prev];
      updated[index].name = newName;
      const matchedUser = kapUsers.find(u => u.full_name === newName);
      if (matchedUser && matchedUser.email) {
        updated[index].email = matchedUser.email;
      }
      return updated;
    });
  };

  const handleResponsibilityChange = (index: number, newResp: string) => {
    setDraftTeamList(prev => {
      const updated = [...prev];
      updated[index].responsibility = newResp;
      return updated;
    });
  };

  const handleAddMember = (defaultRole: string = 'Auditor') => {
    const newMember: DynamicAuditTeamMember = {
      id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      role: defaultRole,
      responsibility: getDefaultResponsibility(defaultRole),
      email: ''
    };
    setDraftTeamList(prev => [...prev, newMember]);
  };

  const handleDeleteMember = (index: number) => {
    if (draftTeamList.length <= 1) {
      alert('Minimal harus ada 1 personil dalam tim perikatan.');
      return;
    }
    const member = draftTeamList[index];
    if (window.confirm(`Hapus "${member.name || 'personil ini'}" dari tim audit perikatan ini?`)) {
      setDraftTeamList(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveAuditor = () => {
    const invalid = draftTeamList.some(m => !m.name.trim());
    if (invalid) {
      alert('Mohon lengkapi nama seluruh personil tim audit sebelum menyimpan.');
      return;
    }

    setTeamList(draftTeamList);

    const partner = draftTeamList.find(m => m.role === 'Partner')?.name || engagement.partnerName;
    const manager = draftTeamList.find(m => m.role === 'Manager')?.name || engagement.managerName;
    const supervisor = draftTeamList.find(m => m.role === 'Supervisor')?.name || '';
    const ketuaOrAuditor = draftTeamList.find(m => m.role === 'Ketua Tim')?.name || 
                           draftTeamList.find(m => m.role === 'Auditor')?.name || 
                           engagement.auditorName;

    updateEngagement(engagement.id, {
      partnerName: partner,
      managerName: manager,
      supervisorName: supervisor,
      auditorName: ketuaOrAuditor,
      teamMembers: draftTeamList.map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        email: m.email,
        responsibility: m.responsibility
      }))
    });

    setEditAuditor(false);
    setSavedAuditor(true);
    setTimeout(() => setSavedAuditor(false), 2500);
  };

  // ── Section 2: Identitas Klien ──
  const [editKlien, setEditKlien] = useState(false);
  const [klienForm, setKlienForm] = useState({
    clientName: engagement.clientName || '',
    clientAddress: (engagement as any).clientAddress || '',
    clientIndustry: (engagement as any).clientIndustry || '',
    auditPeriod: engagement.auditPeriod || '',
  });
  const [savedKlien, setSavedKlien] = useState(false);

  const handleSaveKlien = () => {
    updateEngagement(engagement.id, {
      clientName: klienForm.clientName,
      auditPeriod: klienForm.auditPeriod,
    } as any);
    setEditKlien(false);
    setSavedKlien(true);
    setTimeout(() => setSavedKlien(false), 2000);
  };

  // ── Section 3: Informasi Perikatan ──
  const [editPerikatan, setEditPerikatan] = useState(false);
  const [perikatanForm, setPerikatanForm] = useState({
    id: engagement.id || '',
    engagementType: engagement.engagementType || 'Recurring',
    accountingStandard: engagement.accountingStandard || 'SAK_UMUM',
    fiscalYear: engagement.fiscalYear || '',
    currency: engagement.currency || 'IDR',
    presentationUnit: engagement.presentationUnit || 'Full',
    startDate: engagement.startDate || '',
    targetDate: engagement.targetDate || '',
  });
  const [savedPerikatan, setSavedPerikatan] = useState(false);

  const handleSavePerikatan = () => {
    const cleanId = (perikatanForm.id || '').trim();
    if (!cleanId) {
      alert('Nomor Perikatan tidak boleh kosong.');
      return;
    }

    if (cleanId.toLowerCase() !== engagement.id.toLowerCase()) {
      const isDuplicate = engagements.some(e => e.id.toLowerCase() === cleanId.toLowerCase());
      if (isDuplicate) {
        alert(`Nomor perikatan "${cleanId}" sudah digunakan oleh perikatan lain. Mohon gunakan nomor unik.`);
        return;
      }
    }

    updateEngagement(engagement.id, {
      ...perikatanForm,
      id: cleanId
    } as any);

    setEditPerikatan(false);
    setSavedPerikatan(true);
    setTimeout(() => setSavedPerikatan(false), 2000);

    if (cleanId !== engagement.id) {
      navigate(`/workspace/${cleanId}`, { replace: true });
    }
  };

  return (
    <div className="w-full space-y-0">

      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-1">Beranda Perikatan</p>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Data Master Perikatan</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Data identitas yang digunakan sebagai referensi otomatis di seluruh kertas kerja.
            Nomor Perikatan: <span className="font-mono font-semibold text-gray-700">{engagement.id}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasPermission('create_engagement') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-atlas-blue hover:bg-blue-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 rounded cursor-pointer min-h-[44px]"
              title="Buat perikatan audit baru"
            >
              <Plus size={15} />
              <span>Buat Engagement Baru</span>
            </button>
          )}

          <div className="bg-white border border-gray-200 px-4 py-2.5 flex flex-col min-w-[180px]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Overall Progress</span>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 w-28">
                <div 
                  className="h-1.5 bg-gray-900 transition-all duration-500" 
                  style={{ width: `${engagement.progress || 0}%` }}
                />
              </div>
              <span className="text-base font-bold text-gray-900 leading-none">{engagement.progress || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. Modul Identitas Auditor & Susunan Tim Perikatan Dinamis ── */}
      <div className="mb-6">
        <div className="border border-gray-200 bg-white rounded-xl shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="bg-slate-50/80 px-5 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-bold text-gray-400">1.</span>
              <Users size={16} className="text-atlas-blue shrink-0" />
              <h2 className="text-sm font-bold tracking-tight text-gray-900 uppercase truncate">
                Identitas Auditor & Susunan Tim Perikatan
              </h2>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {editAuditor ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    <X size={13} /> Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAuditor}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded transition-colors shadow-2xs"
                  >
                    <Save size={13} /> Simpan Susunan Tim
                  </button>
                </>
              ) : (
                canEdit && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-atlas-blue bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                  >
                    <Edit2 size={13} /> Kelola Susunan Tim
                  </button>
                )
              )}
            </div>
          </div>

          {/* Section Body */}
          <div className="p-5">
            {editAuditor ? (
              /* ── Mode Edit Tim Dinamis ── */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Daftar Anggota & Penugasan Peran
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddMember('Auditor')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                      title="Tambah anggota auditor pelaksana"
                    >
                      <Plus size={12} /> + Auditor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMember('Supervisor')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded border border-cyan-200 transition-colors"
                      title="Tambah pengawas teknis"
                    >
                      <Plus size={12} /> + Supervisor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMember('Ketua Tim')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      title="Tambah ketua tim lapangan"
                    >
                      <Plus size={12} /> + Ketua Tim
                    </button>
                  </div>
                </div>

                {/* Table of Members being edited */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left text-xs divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3 w-64">Personil KAP</th>
                        <th className="py-2.5 px-3 w-48">Peran / Fungsi Dinamis</th>
                        <th className="py-2.5 px-3">Tanggung Jawab & Uraian Tugas</th>
                        <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {draftTeamList.map((member, idx) => (
                        <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-gray-400 font-medium">
                            {idx + 1}
                          </td>

                          {/* Personil Name Selection / Manual input */}
                          <td className="py-3 px-3 space-y-1.5">
                            <select
                              value={kapUsers.some(u => u.full_name === member.name) ? member.name : 'CUSTOM'}
                              onChange={(e) => {
                                if (e.target.value !== 'CUSTOM') {
                                  handleNameChange(idx, e.target.value);
                                }
                              }}
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                            >
                              <option value="">-- Pilih dari Master Staf KAP --</option>
                              {kapUsers.map(u => (
                                <option key={u.id} value={u.full_name}>
                                  {u.full_name} ({u.roles?.name || 'Staf'})
                                </option>
                              ))}
                              <option value="CUSTOM">-- Ketik Nama Manual / Kustom --</option>
                            </select>

                            {/* Manual Text input if not in standard list or custom */}
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => handleNameChange(idx, e.target.value)}
                              placeholder="Nama lengkap personil..."
                              className="w-full border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-900 bg-slate-50 focus:bg-white focus:border-atlas-blue outline-none"
                            />
                          </td>

                          {/* Dynamic Role Dropdown */}
                          <td className="py-3 px-3 align-top">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(idx, e.target.value)}
                              className={`w-full border rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 transition-all ${getRoleBadgeStyle(member.role)}`}
                            >
                              {ROLE_OPTIONS.map(role => (
                                <option key={role} value={role} className="bg-white text-gray-900 font-normal">
                                  {role}
                                </option>
                              ))}
                            </select>
                            <span className="block text-[10px] text-gray-400 mt-1 italic">
                              *Dapat diubah kapan saja
                            </span>
                          </td>

                          {/* Responsibility input */}
                          <td className="py-3 px-3 align-top space-y-1">
                            <input
                              type="text"
                              value={member.responsibility}
                              onChange={(e) => handleResponsibilityChange(idx, e.target.value)}
                              placeholder="Uraian tanggung jawab perikatan..."
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                            />
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span>Email: {member.email || '—'}</span>
                              <button
                                type="button"
                                onClick={() => handleResponsibilityChange(idx, getDefaultResponsibility(member.role))}
                                className="text-atlas-blue hover:underline"
                              >
                                Reset Deskripsi Standar
                              </button>
                            </div>
                          </td>

                          {/* Delete button */}
                          <td className="py-3 px-3 text-center align-top pt-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(idx)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Hapus personil ini dari tim"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddMember('Auditor')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-atlas-blue bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                  >
                    <Plus size={14} /> Tambah Personil Tim Lainnya
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAuditor}
                      className="px-5 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Save size={14} /> Simpan Susunan Tim
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Mode Tampilan Normal (Ramping & Modern) ── */
              <div className="space-y-3">
                {/* Summary Chips Minimalis */}
                <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-500 mr-1">
                    Komposisi Tim ({teamList.length}):
                  </span>
                  {ROLE_OPTIONS.map(role => {
                    const count = teamList.filter(m => m.role === role).length;
                    if (count === 0) return null;
                    return (
                      <span key={role} className={`text-[11px] px-2.5 py-0.5 rounded-md border font-medium ${getRoleBadgeStyle(role)}`}>
                        {count} {role}
                      </span>
                    );
                  })}
                </div>

                {/* Modern Ramping Table */}
                <div className="overflow-x-auto border border-gray-200/80 rounded-lg shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[620px]">
                    <thead>
                      <tr className="bg-slate-50/90 text-gray-500 font-semibold uppercase text-[10px] tracking-wider border-b border-gray-200/80">
                        <th className="py-2.5 px-3.5 w-[28%]">Personil</th>
                        <th className="py-2.5 px-3 w-[20%]">Peran Perikatan</th>
                        <th className="py-2.5 px-3.5 w-[37%]">Tanggung Jawab Utama</th>
                        <th className="py-2.5 px-3.5 w-[15%] text-right">Kontak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {teamList.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                                {member.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'AU'}
                              </div>
                              <span className="font-semibold text-gray-900 truncate" title={member.name}>
                                {member.name || 'Nama Belum Ditentukan'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-md border ${getRoleBadgeStyle(member.role)}`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-gray-600 line-clamp-1 leading-relaxed text-[11px]">
                            {member.responsibility || getDefaultResponsibility(member.role)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right text-gray-400 text-[11px] font-mono truncate">
                            {member.email || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {savedAuditor && (
              <div className="mt-4 flex items-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
                <CheckCircle size={14} className="text-emerald-600" /> 
                <span>Susunan tim audit perikatan berhasil disimpan dan disinkronkan ke seluruh kertas kerja.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Identitas Klien ── */}
      <div className="mb-6">
        <SectionCard
          number="2."
          icon={<Building size={15} className="text-gray-600" />}
          title="Identitas Klien"
          editing={editKlien}
          canEdit={canEdit}
          onEdit={() => setEditKlien(true)}
          onCancel={() => { setEditKlien(false); setKlienForm({ clientName: engagement.clientName, clientAddress: (engagement as any).clientAddress || '', clientIndustry: (engagement as any).clientIndustry || '', auditPeriod: engagement.auditPeriod }); }}
          onSave={handleSaveKlien}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <FieldRow
              label="Nama Entitas / Klien"
              value={klienForm.clientName}
              editing={editKlien}
              editNode={<input className={inputCls} value={klienForm.clientName} onChange={e => setKlienForm(f => ({ ...f, clientName: e.target.value }))} />}
            />
            <FieldRow
              label="Periode Laporan Keuangan yang Diaudit"
              value={klienForm.auditPeriod}
              editing={editKlien}
              editNode={<input className={inputCls} value={klienForm.auditPeriod} onChange={e => setKlienForm(f => ({ ...f, auditPeriod: e.target.value }))} placeholder="Mis: 31 Desember 2023" />}
            />
            <FieldRow
              label="Alamat Lengkap Klien"
              value={klienForm.clientAddress || <span className="text-gray-400 italic text-sm">Belum diisi</span>}
              editing={editKlien}
              editNode={<input className={inputCls} value={klienForm.clientAddress} onChange={e => setKlienForm(f => ({ ...f, clientAddress: e.target.value }))} placeholder="Jalan, Kota, Provinsi, Kode Pos" />}
            />
            <FieldRow
              label="Bidang Usaha / Industri"
              value={klienForm.clientIndustry || <span className="text-gray-400 italic text-sm">Belum diisi</span>}
              editing={editKlien}
              editNode={<input className={inputCls} value={klienForm.clientIndustry} onChange={e => setKlienForm(f => ({ ...f, clientIndustry: e.target.value }))} placeholder="Mis: Manufaktur, Jasa, Perdagangan" />}
            />
          </div>

          {savedKlien && (
            <div className="flex items-center gap-2 py-2 text-sm text-green-700">
              <CheckCircle size={14} /> Data klien tersimpan
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── 3. Informasi Perikatan ── */}
      <div className="mb-6">
        <SectionCard
          number="3."
          icon={<FileSpreadsheet size={15} className="text-gray-600" />}
          title="Informasi Perikatan"
          editing={editPerikatan}
          canEdit={canEdit}
          onEdit={() => setEditPerikatan(true)}
          onCancel={() => { setEditPerikatan(false); }}
          onSave={handleSavePerikatan}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <FieldRow
              label="Nomor Perikatan (ID Engagement)"
              value={
                <span className="font-mono font-bold text-gray-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  {perikatanForm.id || engagement.id}
                </span>
              }
              editing={editPerikatan}
              editNode={
                <div>
                  <input
                    type="text"
                    className={inputCls + " font-mono font-bold text-slate-900"}
                    value={perikatanForm.id}
                    onChange={e => setPerikatanForm(f => ({ ...f, id: e.target.value }))}
                    placeholder="Contoh: ENG-2025-001 atau 001/KAP-FP/2025"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Dapat disunting manual sesuai format penomoran internal KAP.</p>
                </div>
              }
            />
            <FieldRow
              label="Jenis Perikatan"
              value={ENGAGEMENT_TYPE_LABELS[perikatanForm.engagementType] || perikatanForm.engagementType}
              editing={editPerikatan}
              editNode={
                <select className={selectCls} value={perikatanForm.engagementType} onChange={e => setPerikatanForm(f => ({ ...f, engagementType: e.target.value as any }))}>
                  <option value="First Year">Perikatan Tahun Pertama</option>
                  <option value="Recurring">Perikatan Berkelanjutan (Recurring)</option>
                </select>
              }
            />
            <FieldRow
              label="Standar Akuntansi yang Berlaku (Aplikasi PELITA)"
              value={
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{getStandardName(perikatanForm.accountingStandard) || STANDARD_LABELS[perikatanForm.accountingStandard] || perikatanForm.accountingStandard}</span>
                  {standards.find(s => s.code === perikatanForm.accountingStandard)?.pelitaCategory && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      PELITA: {standards.find(s => s.code === perikatanForm.accountingStandard)?.pelitaCategory}
                    </span>
                  )}
                </div>
              }
              editing={editPerikatan}
              editNode={
                <select className={selectCls} value={perikatanForm.accountingStandard} onChange={e => setPerikatanForm(f => ({ ...f, accountingStandard: e.target.value as any }))}>
                  {standards.filter(s => s.isActive || s.code === perikatanForm.accountingStandard).map(std => (
                    <option key={std.code} value={std.code}>
                      {std.name} {std.pelitaCategory ? `— [PELITA: ${std.pelitaCategory}]` : (std.category ? `(${std.category})` : '')}
                    </option>
                  ))}
                </select>
              }
            />
            <FieldRow
              label="Tahun Buku / Fiscal Year"
              value={perikatanForm.fiscalYear}
              editing={editPerikatan}
              editNode={<input className={inputCls} value={perikatanForm.fiscalYear} onChange={e => setPerikatanForm(f => ({ ...f, fiscalYear: e.target.value }))} placeholder="Mis: 2023" />}
            />
            <FieldRow
              label="Mata Uang Pelaporan"
              value={perikatanForm.currency}
              editing={editPerikatan}
              editNode={
                <select className={selectCls} value={perikatanForm.currency} onChange={e => setPerikatanForm(f => ({ ...f, currency: e.target.value as any }))}>
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="USD">USD (Dollar AS)</option>
                  <option value="Other">Lainnya</option>
                </select>
              }
            />
            <FieldRow
              label="Satuan Penyajian"
              value={UNIT_LABELS[perikatanForm.presentationUnit] || perikatanForm.presentationUnit}
              editing={editPerikatan}
              editNode={
                <select className={selectCls} value={perikatanForm.presentationUnit} onChange={e => setPerikatanForm(f => ({ ...f, presentationUnit: e.target.value as any }))}>
                  <option value="Full">Penuh (Full)</option>
                  <option value="Thousands">Ribuan (Rp 000)</option>
                  <option value="Millions">Jutaan (Rp 000.000)</option>
                </select>
              }
            />
            <FieldRow
              label="Tanggal Mulai Penugasan"
              value={perikatanForm.startDate}
              editing={editPerikatan}
              editNode={<input type="date" className={inputCls} value={perikatanForm.startDate} onChange={e => setPerikatanForm(f => ({ ...f, startDate: e.target.value }))} />}
            />
            <FieldRow
              label="Target Penyelesaian"
              value={perikatanForm.targetDate}
              editing={editPerikatan}
              editNode={<input type="date" className={inputCls} value={perikatanForm.targetDate} onChange={e => setPerikatanForm(f => ({ ...f, targetDate: e.target.value }))} />}
            />
          </div>

          {savedPerikatan && (
            <div className="flex items-center gap-2 py-2 text-sm text-green-700">
              <CheckCircle size={14} /> Data perikatan tersimpan
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Zona Pengelolaan & Hapus Perikatan ── */}
      {canDelete && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-red-600" /> Hapus Perikatan Ini
            </h3>
            <p className="text-xs text-red-700/80 mt-1 max-w-xl leading-relaxed">
              Menghapus perikatan <strong>{engagement.id}</strong> ({engagement.clientName}) secara permanen dari basis data lokal dan Supabase Cloud. Seluruh kertas kerja dan data audit terkait akan dibersihkan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="shrink-0 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Trash2 size={15} />
            <span>Hapus Perikatan</span>
          </button>
        </div>
      )}

      {/* ── Progress Perjalanan Audit (Stepper) ── */}
      <div className="mb-10 mt-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Progress Perjalanan Audit</p>
        
        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-4 left-4 right-4 w-[calc(100%-32px)] h-1 bg-gray-200 rounded-full" />
          
          {/* Foreground Progress Line (Assuming up to A.2 is in progress) */}
          <div className="absolute top-4 left-4 w-[35%] h-1 bg-atlas-blue rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,102,204,0.4)]" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                id: 'pra', code: 'A.1', name: 'Pra-Perikatan', desc: 'Client Acceptance & Independence', status: 'Completed',
                tasks: ['A.110 Analisis Penerimaan', 'A.120 Alokasi Jam Jasa', 'A.130 Surat Perikatan']
              },
              { 
                id: 'risk_ass', code: 'A.2', name: 'Risk Assessment', desc: 'Materiality & Risk Planning', status: 'In Progress',
                tasks: ['A.210 Materialitas', 'A.220 Pemahaman Bisnis', 'A.230 Penilaian Risiko']
              },
              { 
                id: 'risk_res', code: 'B', name: 'Risk Response', desc: 'Audit Evidence & Testing', status: 'Pending',
                tasks: ['B.100 Uji Pengendalian', 'B.200 Prosedur Substantif', 'B.300 Bukti Audit']
              },
              { 
                id: 'comp', code: 'C', name: 'Completing & Reporting', desc: 'Final Review & Audit Report', status: 'Pending',
                tasks: ['C.100 Evaluasi Temuan', 'C.200 Kelangsungan Usaha', 'C.300 Laporan Auditor']
              },
            ].map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center md:items-start relative group">
                {/* Step Circle */}
                <div className={`w-9 h-9 rounded-full border-4 border-white flex items-center justify-center shrink-0 mb-4 transition-all duration-300 md:ml-4 shadow-sm ${
                  step.status === 'Completed' ? 'bg-atlas-blue text-white' : 
                  step.status === 'In Progress' ? 'bg-white border-2 border-atlas-blue text-atlas-blue ring-2 ring-atlas-blue/20' : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step.status === 'Completed' ? <CheckCircle size={14} className="stroke-[3]" /> : <span className="text-[11px] font-black">{step.code}</span>}
                </div>
                
                {/* Step Content Card */}
                <div className={`w-full bg-white border rounded-xl p-4 transition-all duration-300 ${
                  step.status === 'Completed' ? 'border-atlas-blue/30 shadow-sm hover:border-atlas-blue/50' : 
                  step.status === 'In Progress' ? 'border-atlas-blue shadow-md ring-1 ring-atlas-blue/10' : 
                  'border-gray-200 opacity-75 group-hover:opacity-100'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{step.code}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      step.status === 'Completed' ? 'text-atlas-blue' :
                      step.status === 'In Progress' ? 'text-atlas-blue' :
                      'text-gray-400'
                    }`}>{step.status}</span>
                  </div>
                  <h3 className={`text-sm font-bold mb-1 ${step.status === 'Pending' ? 'text-gray-600' : 'text-gray-900'}`}>{step.name}</h3>
                  <p className="text-[11px] text-gray-500 leading-tight mb-3">{step.desc}</p>
                  
                  <ul className="space-y-1.5 mt-3 pt-3 border-t border-gray-100">
                    {step.tasks.map((task, i) => (
                      <li key={i} className={`text-[10px] font-medium flex items-start gap-1.5 leading-snug ${step.status === 'Pending' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                          step.status === 'Completed' ? 'bg-atlas-blue' : 
                          step.status === 'In Progress' ? 'bg-atlas-blue' : 'bg-gray-300'
                        }`}></div>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EngagementFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={null}
        />
      )}

      {/* Modal Konfirmasi Hapus Perikatan dari Workspace */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">
                    Konfirmasi Hapus Perikatan
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tindakan ini permanen dan akan menghapus data di Supabase Cloud.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Perikatan:</span>
                  <span className="font-semibold text-gray-800">{engagement.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama Klien:</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[200px]" title={engagement.clientName}>
                    {engagement.clientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Periode:</span>
                  <span className="text-gray-700">{engagement.auditPeriod || engagement.fiscalYear}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus perikatan ini? Anda akan dialihkan kembali ke halaman Manajemen Engagement setelah proses selesai.
              </p>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteEngagement}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm min-h-[44px] flex items-center justify-center space-x-1.5"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      <span>Ya, Hapus Perikatan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceBeranda;
