import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck, 
  Info,
  Calendar,
  Layers,
  Sparkles,
  Building2,
  ExternalLink
} from 'lucide-react';
import { 
  useAccountingStandardStore, 
  type AccountingStandard,
  DEFAULT_ACCOUNTING_STANDARDS 
} from '../store/accountingStandardStore';

interface StandardFormData {
  code: string;
  name: string;
  description: string;
  category: string;
  effectiveYear: string;
  notes: string;
  isActive: boolean;
  pelitaRef: string;
  pelitaCategory: string;
  pelitaNote: string;
}

const CATEGORY_OPTIONS = [
  'Entitas Privat',
  'Umum',
  'Syariah',
  'Pemerintahan',
  'Kustom'
];

const PELITA_CATEGORY_OPTIONS = [
  'Entitas Privat / Non Go-Public',
  'Emiten / Perusahaan Terbuka (Go-Public)',
  'Usaha Mikro, Kecil & Menengah (UMKM)',
  'Lembaga & Transaksi Berbasis Syariah',
  'PMA / Multinasional / Non-Domestik',
  'Instansi Pemerintah / BLU / BUMD',
  'Standar Khusus / Lainnya'
];

export const MasterAccountingStandardsTab: React.FC = () => {
  const { 
    standards, 
    addStandard, 
    updateStandard, 
    toggleStandardActive, 
    deleteStandard, 
    resetToDefault 
  } = useAccountingStandardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [filterPelitaOnly, setFilterPelitaOnly] = useState(false);

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AccountingStandard | null>(null);
  const [formData, setFormData] = useState<StandardFormData>({
    code: '',
    name: '',
    description: '',
    category: 'Entitas Privat',
    effectiveYear: 'Berlaku Efektif',
    notes: '',
    isActive: true,
    pelitaRef: 'PELITA-SAK-EP',
    pelitaCategory: 'Entitas Privat / Non Go-Public',
    pelitaNote: 'Rujukan resmi Aplikasi PELITA Kemenkeu'
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Confirm delete or reset modal states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Success message toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered standards
  const filteredStandards = useMemo(() => {
    return standards.filter((std) => {
      const matchSearch = 
        std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (std.pelitaCategory && std.pelitaCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (std.pelitaRef && std.pelitaRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (std.notes && std.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = 
        selectedCategory === 'ALL' || std.category === selectedCategory;

      const matchStatus = 
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && std.isActive) ||
        (selectedStatus === 'INACTIVE' && !std.isActive);

      const matchPelita = !filterPelitaOnly || std.isPelitaCompliant;

      return matchSearch && matchCategory && matchStatus && matchPelita;
    });
  }, [standards, searchQuery, selectedCategory, selectedStatus, filterPelitaOnly]);

  // Statistics
  const totalCount = standards.length;
  const activeCount = standards.filter((s) => s.isActive).length;
  const customCount = standards.filter((s) => !s.isSystemDefault).length;
  const pelitaCount = standards.filter((s) => s.isPelitaCompliant).length;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      category: 'Entitas Privat',
      effectiveYear: 'Berlaku Efektif',
      notes: '',
      isActive: true,
      pelitaRef: 'PELITA-SAK-KUSTOM',
      pelitaCategory: 'Entitas Privat / Non Go-Public',
      pelitaNote: 'Disesuaikan dengan pelaporan Aplikasi PELITA PPPK Kemenkeu'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (std: AccountingStandard) => {
    setEditingItem(std);
    setFormData({
      code: std.code,
      name: std.name,
      description: std.description,
      category: std.category,
      effectiveYear: std.effectiveYear || 'Berlaku Efektif',
      notes: std.notes || '',
      isActive: std.isActive,
      pelitaRef: std.pelitaRef || 'PELITA-SAK',
      pelitaCategory: std.pelitaCategory || 'Entitas Privat / Non Go-Public',
      pelitaNote: std.pelitaNote || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.code.trim()) {
      setFormError('Kode standar akuntansi wajib diisi (contoh: SAK_EP, SAK_IFRS).');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Nama lengkap standar akuntansi wajib diisi.');
      return;
    }

    if (editingItem) {
      const res = updateStandard(editingItem.id, {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        effectiveYear: formData.effectiveYear,
        notes: formData.notes,
        isActive: formData.isActive,
        pelitaRef: formData.pelitaRef,
        pelitaCategory: formData.pelitaCategory,
        pelitaNote: formData.pelitaNote
      });

      if (!res.success) {
        setFormError(res.message);
        return;
      }
      showToast(res.message);
    } else {
      const res = addStandard({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        effectiveYear: formData.effectiveYear,
        notes: formData.notes,
        isActive: formData.isActive,
        pelitaRef: formData.pelitaRef,
        pelitaCategory: formData.pelitaCategory,
        pelitaNote: formData.pelitaNote,
        isPelitaCompliant: true
      });

      if (!res.success) {
        setFormError(res.message);
        return;
      }
      showToast(res.message);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = (id: string) => {
    const res = deleteStandard(id);
    setDeleteConfirmId(null);
    showToast(res.message);
  };

  const handleResetDefaults = () => {
    resetToDefault();
    setIsResetConfirmOpen(false);
    showToast('Seluruh daftar Standar Akuntansi berhasil diselaraskan ke default resmi Aplikasi PELITA Kemenkeu & SPAP IAI.');
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Entitas Privat':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Umum':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Syariah':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Pemerintahan':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      
      {/* HEADER SECTION WITH KEMENKEU PELITA BRANDING */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-4 rounded-full bg-blue-700"></div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                Master Standar Akuntansi Keuangan (SAK)
              </h2>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                Aplikasi PELITA Kemenkeu RI
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Pilihan Form +Engagement
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Standar pelaporan keuangan terintegrasi dengan klasifikasi Pusat Pembinaan Profesi Keuangan (PPPK) Kemenkeu untuk penerbitan QR Code LAI dan Laporan Kegiatan Usaha KAP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Kembalikan opsi ke default resmi Aplikasi PELITA Kemenkeu & SPAP"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset Default PELITA</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-atlas-blue hover:bg-blue-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah Standar Baru</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-5 space-y-4 text-xs">
        
        {/* BANNER PENJELASAN SINKRONISASI APLIKASI PELITA KEMENKEU */}
        <div className="bg-linear-to-r from-blue-50/80 via-slate-50/70 to-emerald-50/60 border border-blue-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Building2 size={16} />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-900">
                  Rujukan Resmi: Aplikasi PELITA (PPPK Kementerian Keuangan RI)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                  pelita.kemenkeu.go.id
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Aplikasi ini mengadopsi standar akuntansi baru <strong>SAK EP (Standar Akuntansi Keuangan Entitas Privat)</strong> yang wajib berlaku per <strong>1 Januari 2025</strong> menggantikan SAK ETAP, serta memetakan secara presisi klasifikasi standar untuk kewajiban input data klien audit, pencatatan jam audit, dan pengesahan QR Code Laporan Auditor Independen (LAI).
              </p>
            </div>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in duration-150">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Standar</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">{totalCount}</span>
            <span className="text-[10px] text-slate-500">Tercatat dalam sistem KAP</span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Standar Aktif</span>
            <span className="text-lg font-bold text-emerald-900 mt-0.5 block">{activeCount}</span>
            <span className="text-[10px] text-emerald-700">Muncul di formulir +Engagement</span>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Standar PELITA Kemenkeu</span>
            <span className="text-lg font-bold text-blue-900 mt-0.5 block">{pelitaCount}</span>
            <span className="text-[10px] text-blue-700">Sesuai nomenklatur PPPK Kemenkeu</span>
          </div>

          <div className="bg-purple-50/60 border border-purple-200/80 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Standar Baru 2025</span>
            <span className="text-xs font-bold text-purple-900 mt-0.5 block truncate">SAK EP Aktif</span>
            <span className="text-[10px] text-purple-700 truncate block">Pengganti SAK ETAP per 1 Jan 2025</span>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-slate-50/80 border border-slate-200/90 rounded-lg p-2.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode (misal SAK_EP), nama standar, atau kategori PELITA..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-atlas-blue focus:border-atlas-blue shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterPelitaOnly(!filterPelitaOnly)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                filterPelitaOnly 
                  ? 'bg-blue-700 text-white border-blue-700 shadow-2xs' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              🏛️ Khusus PELITA Kemenkeu
            </button>

            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-md px-2 py-1 shadow-2xs">
              <Filter size={12} className="text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kategori SAK</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-md px-2 py-1 shadow-2xs">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="text-xs bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif di +Engagement</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE / LIST OF STANDARDS */}
        <div className="border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Kode & Nama Standar</th>
                  <th className="py-2.5 px-3">Kategori SAK</th>
                  <th className="py-2.5 px-3">Klasifikasi Aplikasi PELITA Kemenkeu</th>
                  <th className="py-2.5 px-3">Masa Berlaku</th>
                  <th className="py-2.5 px-3">Status di +Engagement</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {filteredStandards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-1.5">
                        <AlertCircle size={20} className="text-slate-400" />
                        <p className="font-semibold text-slate-700">Tidak ada standar akuntansi yang cocok</p>
                        <p className="text-[11px] text-slate-400">Coba ubah kata kunci pencarian atau matikan filter</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStandards.map((std) => (
                    <tr 
                      key={std.id}
                      className={`hover:bg-slate-50/80 transition-colors ${!std.isActive ? 'opacity-65 bg-slate-50/40' : ''}`}
                    >
                      {/* Kode & Nama */}
                      <td className="py-2.5 px-3 align-top">
                        <div className="flex items-start gap-2">
                          <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/90 shrink-0">
                            {std.code}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{std.name}</span>
                              {std.isSystemDefault ? (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  Bawaan IAI / PELITA
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  Kustom KAP
                                </span>
                              )}
                              {std.code === 'SAK_EP' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Standar Baru 2025
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                              {std.description || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-2.5 px-3 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${getCategoryBadgeClass(std.category)}`}>
                          {std.category}
                        </span>
                      </td>

                      {/* Klasifikasi Aplikasi PELITA Kemenkeu */}
                      <td className="py-2.5 px-3 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                              <Building2 size={10} className="text-blue-700" />
                              {std.pelitaCategory || 'Standar Pelaporan PELITA'}
                            </span>
                            {std.pelitaRef && (
                              <span className="font-mono text-[9px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                {std.pelitaRef}
                              </span>
                            )}
                          </div>
                          {std.pelitaNote && (
                            <p className="text-[10px] text-slate-500 leading-tight">
                              {std.pelitaNote}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Masa Berlaku */}
                      <td className="py-2.5 px-3 align-top text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-[11px]">
                          <Calendar size={11} className="text-slate-400" />
                          <span>{std.effectiveYear || 'Berlaku Efektif'}</span>
                        </div>
                      </td>

                      {/* Status Aktif Toggle */}
                      <td className="py-2.5 px-3 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleStandardActive(std.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            std.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                          title={std.isActive ? 'Klik untuk menonaktifkan dari form +Engagement' : 'Klik untuk mengaktifkan di form +Engagement'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${std.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                          <span>{std.isActive ? 'Aktif di Form' : 'Nonaktif'}</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-2.5 px-3 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(std)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                            title="Edit Standar Akuntansi"
                          >
                            <Edit3 size={13} />
                          </button>

                          {!std.isSystemDefault ? (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(std.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title="Hapus Standar Kustom"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <span 
                              className="p-1.5 text-slate-300 cursor-not-allowed" 
                              title="Standar resmi Aplikasi PELITA Kemenkeu & SPAP tidak dapat dihapus (dapat dinonaktifkan jika tidak digunakan)"
                            >
                              <ShieldCheck size={13} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INFORMATIONAL GUIDELINE TERINTEGRASI PELITA */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-[11px] text-slate-600 flex items-start gap-2.5">
          <Info size={15} className="text-atlas-blue shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">
              Integrasi Otomatis dengan Aplikasi PELITA Kementerian Keuangan & Kertas Kerja ATLAS:
            </p>
            <p className="text-slate-500 leading-relaxed">
              Seluruh standar akuntansi yang berstatus <strong>Aktif</strong> otomatis muncul di menu dropdown formulir 
              <strong> + Buat Engagement</strong> dan halaman <strong>Workspace Beranda</strong>. Klasifikasi ini menjamin bahwa saat Laporan Auditor Independen (LAI) diterbitkan dan dilaporkan ke portal resmi <strong>PELITA Kemenkeu</strong>, kode kerangka pelaporan keuangan (SAK EP, SAK Umum, SAK EMKM, SAS, dll) telah sesuai dengan regulasi Pusat Pembinaan Profesi Keuangan (PPPK) Kemenkeu RI.
            </p>
          </div>
        </div>

      </div>

      {/* ── MODAL TAMBAH / EDIT STANDAR ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-sans">
            
            <div className="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50/90">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                  <BookOpen size={14} />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
                    {editingItem ? 'Edit Standar Akuntansi' : 'Tambah Standar Akuntansi Baru'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {editingItem ? `Perbarui informasi ${editingItem.code}` : 'Tambahkan kerangka pelaporan keuangan baru yang selaras dengan Aplikasi PELITA'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto max-h-[80vh]">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-2xs">
                  <AlertCircle size={14} className="text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Kode Standar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    placeholder="Contoh: SAK_EP, SAK_IFRS"
                    disabled={editingItem?.isSystemDefault}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-2xs disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {editingItem?.isSystemDefault && (
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Kode bawaan sistem tidak dapat diubah</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Kategori SAK <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all bg-white shadow-2xs cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Nama Lengkap Standar Akuntansi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: SAK Entitas Privat (SAK EP)"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-2xs"
                />
              </div>

              {/* FIELD KHUSUS APLIKASI PELITA KEMENKEU */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
                  <Building2 size={13} className="text-blue-700" />
                  <span>Penyelarasan Aplikasi PELITA Kemenkeu RI</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Klasifikasi Entitas di PELITA
                    </label>
                    <select
                      value={formData.pelitaCategory}
                      onChange={(e) => setFormData({ ...formData, pelitaCategory: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 text-xs focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none bg-white shadow-2xs cursor-pointer"
                    >
                      {PELITA_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Kode Rujukan PELITA
                    </label>
                    <input
                      type="text"
                      value={formData.pelitaRef}
                      onChange={(e) => setFormData({ ...formData, pelitaRef: e.target.value })}
                      placeholder="Mis: PELITA-SAK-EP"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none bg-white shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Masa Berlaku / Tanggal Efektif / Regulasi
                </label>
                <input
                  type="text"
                  value={formData.effectiveYear}
                  onChange={(e) => setFormData({ ...formData, effectiveYear: e.target.value })}
                  placeholder="Contoh: 1 Jan 2025 atau Kepmen No. X"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Deskripsi / Ruang Lingkup Standar
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Penjelasan entitas pengguna standar ini atau aturan perikatan..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-2xs resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Catatan Tambahan untuk Auditor
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contoh: Standar Baru Pengganti SAK ETAP, perhatikan PSAK transisi..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-all shadow-2xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-atlas-blue focus:ring-atlas-blue border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Aktifkan untuk Formulir +Engagement</span>
                    <span className="text-[10px] text-slate-500 block">Jika dicentang, opsi ini akan muncul di dropdown pemilihan standar</span>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-atlas-blue hover:bg-blue-800 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={13} />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambahkan Standar'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-sm p-4 sm:p-5 text-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 size={18} />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-sm text-slate-900">Hapus Standar Akuntansi?</h4>
              <p className="text-slate-500 text-[11px]">
                Standar kustom ini akan dihapus dari sistem. Perikatan yang telah dibuat sebelumnya tetap menyimpan data standar yang dipilih.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI RESET DEFAULT ── */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-sm p-4 sm:p-5 text-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-200">
              <RotateCcw size={18} />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-sm text-slate-900">Kembalikan ke Standar Resmi Aplikasi PELITA?</h4>
              <p className="text-slate-500 text-[11px]">
                Daftar standar akuntansi akan direset ke konfigurasi resmi Aplikasi PELITA PPPK Kementerian Keuangan RI (SAK EP 2025, SAK Umum / Full IFRS, SAK ETAP Transisi, SAK EMKM, PSAK Syariah, SAK Internasional, dan SAP).
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
              >
                Ya, Reset ke Standar PELITA
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
