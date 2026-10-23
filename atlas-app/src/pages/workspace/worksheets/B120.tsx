import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink,
  BookOpenCheck,
  FileCheck2,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Search,
  X,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

export type AccountCategory = 'Aset' | 'Liabilitas' | 'Ekuitas' | 'Laba Rugi';

export interface AccountItem {
  id: string;
  no: number;
  name: string;
  category: AccountCategory;
  index: string;
  route: string;
  kesimpulan: string;
  keterangan: string;
}

const DEFAULT_ACCOUNTS: AccountItem[] = [
  { id: 'acc-1', no: 1, name: 'Kas dan setara kas', category: 'Aset', index: 'I', route: 'b210', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-2', no: 2, name: 'Piutang usaha', category: 'Aset', index: 'II', route: 'b220', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-3', no: 3, name: 'Uang muka dan beban dibayar dimuka', category: 'Aset', index: 'III', route: 'b230', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-4', no: 4, name: 'Persediaan', category: 'Aset', index: 'IV', route: 'b240', kesimpulan: 'Akun tersebut belum sepenuhnya disajikan secara wajar', keterangan: 'Terdapat selisih fisik stok opname' },
  { id: 'acc-5', no: 5, name: 'Investasi', category: 'Aset', index: 'V', route: 'b250', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-6', no: 6, name: 'Properti Investasi', category: 'Aset', index: 'VI', route: 'b260', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-7', no: 7, name: 'Aset tetap', category: 'Aset', index: 'VII', route: 'b270', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-8', no: 8, name: 'Aset takberwujud', category: 'Aset', index: 'VIII', route: 'b280', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-9', no: 9, name: 'Utang usaha', category: 'Liabilitas', index: 'IX', route: 'b280', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-10', no: 10, name: 'Utang pajak', category: 'Liabilitas', index: 'X', route: 'b280', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-11', no: 11, name: 'Utang Bank Jangka Pendek', category: 'Liabilitas', index: 'XI', route: 'b280', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-12', no: 12, name: 'Modal disetor', category: 'Ekuitas', index: 'XII', route: 'b280', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-13', no: 13, name: 'Saldo laba', category: 'Ekuitas', index: 'XIII', route: 'b280', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-14', no: 14, name: 'Penjualan barang dagangan', category: 'Laba Rugi', index: 'XIV', route: 'b280', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-15', no: 15, name: 'Beban pokok pendapatan', category: 'Laba Rugi', index: 'XV', route: 'b280', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
  { id: 'acc-16', no: 16, name: 'Beban administrasi dan umum', category: 'Laba Rugi', index: 'XVI', route: 'b280', kesimpulan: 'Akun tersebut telah disajikan secara wajar', keterangan: '' },
];

const KESIMPULAN_OPTIONS = [
  'Akun tersebut telah disajikan secara wajar',
  'Akun tersebut belum sepenuhnya disajikan secara wajar',
  'Akun tersebut tidak disajikan secara wajar',
  'Belum dilakukan prosedur audit',
];

const WORKSHEET_ROUTES = [
  { value: 'b210', label: 'B.210 - Estimasi Akuntansi & Nilai Wajar' },
  { value: 'b220', label: 'B.220 - Hubungan & Transaksi Pihak Berelasi' },
  { value: 'b230', label: 'B.230 - Peristiwa Setelah Tanggal Neraca' },
  { value: 'b240', label: 'B.240 - Kelangsungan Usaha (Going Concern)' },
  { value: 'b250', label: 'B.250 - Surat Representasi Manajemen' },
  { value: 'b260', label: 'B.260 - Penggunaan Pakar Auditor' },
  { value: 'b270', label: 'B.270 - Penggunaan Pakar Manajemen' },
  { value: 'b280', label: 'B.280 - Komitmen dan Kontinjensi' },
  { value: 'trial-balance', label: 'Trial Balance' },
];

const CATEGORIES: AccountCategory[] = ['Aset', 'Liabilitas', 'Ekuitas', 'Laba Rugi'];

const B120: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Storage keys
  const accountsStorageKey = `atlas_b120_accounts_${engagement?.id || 'default'}`;
  const simpulanStorageKey = `atlas_b120_simpulan_${engagement?.id || 'default'}`;

  // Simpulan Akhir state
  const [simpulanAkhir, setSimpulanAkhir] = useState(() => {
    try {
      const saved = localStorage.getItem(simpulanStorageKey);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'Semua akun material telah dipetakan ke dalam Lead Schedule dan dilakukan pengujian substantif sesuai dengan tingkat risiko yang ditetapkan.';
  });

  // Accounts state with backwards-compatibility migration
  const [accounts, setAccounts] = useState<AccountItem[]>(() => {
    try {
      const savedAccounts = localStorage.getItem(accountsStorageKey);
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Check legacy rowStates
      const legacyKey = `atlas_b120_${engagement?.id || 'default'}`;
      const legacySaved = localStorage.getItem(legacyKey);
      if (legacySaved) {
        const legacyRowStates = JSON.parse(legacySaved);
        return DEFAULT_ACCOUNTS.map((acc) => ({
          ...acc,
          kesimpulan: legacyRowStates[acc.no]?.kesimpulan || acc.kesimpulan,
          keterangan: legacyRowStates[acc.no]?.keterangan || acc.keterangan,
        }));
      }
    } catch {
      // ignore
    }
    return DEFAULT_ACCOUNTS;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<AccountItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<AccountCategory>('Aset');
  const [formIndex, setFormIndex] = useState('');
  const [formRoute, setFormRoute] = useState('b210');
  const [formKesimpulan, setFormKesimpulan] = useState(KESIMPULAN_OPTIONS[0]);
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formError, setFormError] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(accountsStorageKey, JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }, [accounts, accountsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(simpulanStorageKey, simpulanAkhir);
    } catch {
      // ignore
    }
  }, [simpulanAkhir, simpulanStorageKey]);

  // Statistics calculation
  const stats = useMemo(() => {
    const wajar = accounts.filter(a => a.kesimpulan.includes('telah disajikan')).length;
    const belumSepenuhnya = accounts.filter(a => a.kesimpulan.includes('belum sepenuhnya')).length;
    const tidakWajar = accounts.filter(a => a.kesimpulan.includes('tidak disajikan')).length;
    const belumAudit = accounts.filter(a => a.kesimpulan.includes('Belum dilakukan')).length;
    return { wajar, belumSepenuhnya, tidakWajar, belumAudit, total: accounts.length };
  }, [accounts]);

  // Filtered accounts list
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesCategory = selectedCategory === 'Semua' || acc.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.index.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.keterangan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [accounts, selectedCategory, searchQuery]);

  // Open modal for Adding
  const openAddModal = () => {
    setFormName('');
    setFormCategory('Aset');
    // Suggest next roman numeral or number index
    setFormIndex('');
    setFormRoute('b210');
    setFormKesimpulan(KESIMPULAN_OPTIONS[0]);
    setFormKeterangan('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open modal for Editing
  const openEditModal = (acc: AccountItem) => {
    setEditingAccount(acc);
    setFormName(acc.name);
    setFormCategory(acc.category);
    setFormIndex(acc.index);
    setFormRoute(acc.route);
    setFormKesimpulan(acc.kesimpulan);
    setFormKeterangan(acc.keterangan);
    setFormError('');
  };

  // Handle Save Add
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Nama akun wajib diisi.');
      return;
    }
    if (!formIndex.trim()) {
      setFormError('Indeks Lead Schedule wajib diisi (misal: I, II, VII-A).');
      return;
    }

    const newItem: AccountItem = {
      id: `acc-${Date.now()}`,
      no: accounts.length + 1,
      name: formName.trim(),
      category: formCategory,
      index: formIndex.trim().toUpperCase(),
      route: formRoute,
      kesimpulan: formKesimpulan,
      keterangan: formKeterangan.trim(),
    };

    setAccounts(prev => [...prev, newItem]);
    setIsAddModalOpen(false);
    triggerAutoSaveToast();
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    if (!formName.trim()) {
      setFormError('Nama akun wajib diisi.');
      return;
    }
    if (!formIndex.trim()) {
      setFormError('Indeks Lead Schedule wajib diisi.');
      return;
    }

    setAccounts(prev => prev.map(item => {
      if (item.id === editingAccount.id) {
        return {
          ...item,
          name: formName.trim(),
          category: formCategory,
          index: formIndex.trim().toUpperCase(),
          route: formRoute,
          kesimpulan: formKesimpulan,
          keterangan: formKeterangan.trim(),
        };
      }
      return item;
    }));

    setEditingAccount(null);
    triggerAutoSaveToast();
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingAccount) return;
    setAccounts(prev => {
      const filtered = prev.filter(item => item.id !== deletingAccount.id);
      // Re-number sequence
      return filtered.map((item, idx) => ({ ...item, no: idx + 1 }));
    });
    setDeletingAccount(null);
    triggerAutoSaveToast();
  };

  // Handle Reset to Default
  const handleConfirmReset = () => {
    setAccounts(DEFAULT_ACCOUNTS);
    setIsResetConfirmOpen(false);
    triggerAutoSaveToast();
  };

  // Inline Quick Update on table
  const handleQuickUpdate = (id: string, field: 'kesimpulan' | 'keterangan', value: string) => {
    setAccounts(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const triggerAutoSaveToast = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  return (
    <WorksheetContainer
      code="B.120"
      name="Procedures Mapping & Lead Schedule"
      purpose="Memetakan akun yang material dan signifikan ke dalam Lead Schedule serta merangkum kesimpulan audit per akun."
      status="Completed"
      reviewer={engagement?.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Banner Ringkasan Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200">
                  B.120
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Risk Response Phase
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Procedures Mapping & Lead Schedule
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Penetapan alur audit substantif melalui pemetaan akun-akun material dan akun signifikan ke indeks Lead Schedule dan perumusan simpulan audit per akun. Dilengkapi dengan pengelolaan akun dinamis (CRUD).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>STATUS: COMPLETED</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
              <div>
                <span className="text-slate-400">Wajar:</span> <span className="font-semibold text-slate-800">{stats.wajar} Akun</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></div>
              <div>
                <span className="text-slate-400">Belum Sepenuhnya:</span> <span className="font-semibold text-slate-800">{stats.belumSepenuhnya} Akun</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></div>
              <div>
                <span className="text-slate-400">Tidak Wajar:</span> <span className="font-semibold text-slate-800">{stats.tidakWajar} Akun</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"></div>
              <div>
                <span className="text-slate-400">Belum Selesai:</span> <span className="font-semibold text-slate-800">{stats.belumAudit} Akun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Kriteria & Tombol Akses Bank Prosedur Modern */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Kriteria Pemetaan Akun */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Kriteria Pemetaan Akun ke Lead Schedule
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Akun-akun yang ditampilkan pada tabel di bawah ini merupakan akun yang wajib dirumuskan prosedur auditnya berdasarkan salah satu kriteria berikut:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-atlas-blue font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span className="text-slate-700">Akun dengan nilai <strong>Material</strong> dan tergolong <strong>Akun Signifikan</strong></span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-atlas-blue font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span className="text-slate-700">Akun dengan nilai <strong>Material</strong> dan tergolong <strong>Tidak Signifikan</strong></span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-atlas-blue font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span className="text-slate-700">Akun dengan nilai <strong>Tidak Material</strong> namun tergolong <strong>Akun Signifikan</strong></span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-atlas-blue font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                <span className="text-slate-700">Akun yang dipersyaratkan oleh <strong>Specific Materiality</strong></span>
              </div>
            </div>
          </div>

          {/* Card Akses Bank Prosedur Audit */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="text-blue-400" size={20} />
                <h3 className="text-sm font-bold tracking-tight text-white">Bank Prosedur Audit</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Koleksi terstandarisasi prosedur pengujian audit untuk asersi kelengkapan, keberadaan, hak dan kewajiban, serta penilaian & alokasi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/bank-prosedur`)}
              className="mt-4 w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Buka Bank Prosedur</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Tabel Pemetaan Akun Modern dengan Fasilitas CRUD */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          {/* Header & CRUD Toolbar */}
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Daftar Akun, Indeks Lead Schedule & Simpulan Audit
                </h2>
                <p className="text-xs text-slate-500">
                  Kelola pemetaan akun, ubah indeks Lead Schedule, atau tambahkan akun baru sesuai struktur laporan keuangan klien.
                </p>
              </div>

              {/* Action Buttons: Add Account & Reset */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
                  title="Kembalikan daftar akun ke daftar standar 16 akun"
                >
                  <RotateCcw size={13} className="text-slate-400" />
                  <span className="hidden sm:inline">Reset Standar</span>
                </button>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm"
                >
                  <Plus size={15} />
                  <span>Tambah Akun</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/50">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['Semua', ...CATEGORIES].map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count = cat === 'Semua' ? accounts.length : accounts.filter(a => a.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-atlas-blue text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama akun atau indeks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[200px]">Rincian Akun</th>
                  <th className="py-3 px-4 text-center w-28">Indeks Lead</th>
                  <th className="py-3 px-4 min-w-[280px]">Kesimpulan Audit</th>
                  <th className="py-3 px-4 min-w-[220px]">Keterangan / Temuan</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <FolderOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">Tidak ada akun yang sesuai kriteria.</p>
                      <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau klik "+ Tambah Akun".</p>
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => {
                    const isWajar = account.kesimpulan.includes('telah disajikan');
                    const isBelumSepenuhnya = account.kesimpulan.includes('belum sepenuhnya');
                    const isTidakWajar = account.kesimpulan.includes('tidak disajikan');

                    return (
                      <tr key={account.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-400">
                          {account.no}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-900">{account.name}</div>
                          <span className="text-[10px] text-slate-400">{account.category}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <Link
                            to={`/workspace/${engagement?.id}/worksheet/${account.route}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono bg-blue-50 text-atlas-blue border border-blue-200 hover:bg-atlas-blue hover:text-white transition-all shadow-2xs"
                            title={`Buka Lead Schedule ${account.name} (${account.index})`}
                          >
                            <span>{account.index}</span>
                            <ExternalLink size={12} className="opacity-70" />
                          </Link>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              isWajar ? 'bg-emerald-500' : isBelumSepenuhnya ? 'bg-amber-500' : isTidakWajar ? 'bg-rose-500' : 'bg-slate-300'
                            }`}></div>
                            <select
                              value={account.kesimpulan}
                              onChange={(e) => handleQuickUpdate(account.id, 'kesimpulan', e.target.value)}
                              className={`w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all cursor-pointer ${
                                isWajar ? 'text-slate-800' : isBelumSepenuhnya ? 'text-amber-800 font-semibold' : 'text-rose-800 font-semibold'
                              }`}
                            >
                              {KESIMPULAN_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="text"
                            placeholder="Catatan hasil prosedur..."
                            value={account.keterangan}
                            onChange={(e) => handleQuickUpdate(account.id, 'keterangan', e.target.value)}
                            className="w-full text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all placeholder:text-slate-400"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(account)}
                              className="p-1.5 text-slate-400 hover:text-atlas-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Akun"
                              aria-label={`Edit akun ${account.name}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingAccount(account)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Akun"
                              aria-label={`Hapus akun ${account.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Simpulan Akhir Auditor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Simpulan Akhir Hasil Pemetaan & Evaluasi Lead Schedule</span>
            </h3>
            <span className="text-[11px] text-slate-400">Wajib Diisi</span>
          </div>
          <textarea
            value={simpulanAkhir}
            onChange={(e) => setSimpulanAkhir(e.target.value)}
            rows={2}
            placeholder="Tuliskan simpulan menyeluruh atas pemetaan prosedur audit..."
            className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
          />
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b110`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.110</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b130`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Lanjut ke B.130</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={triggerAutoSaveToast}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan Pemetaan"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Hasil pemetaan prosedur & lead schedule berhasil disimpan.</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL TAMBAH AKUN (CREATE)                              */}
        {/* ======================================================== */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-atlas-blue">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Tambah Akun Pemetaan Baru</h3>
                    <p className="text-xs text-slate-500">Tambahkan akun ke dalam Lead Schedule</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Akun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Piutang Karyawan / Beban Bunga"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kategori Laporan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as AccountCategory)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Indeks Lead Schedule <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: I-A, XVII"
                      value={formIndex}
                      onChange={(e) => setFormIndex(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kertas Kerja / Prosedur Terkait
                  </label>
                  <select
                    value={formRoute}
                    onChange={(e) => setFormRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue cursor-pointer"
                  >
                    {WORKSHEET_ROUTES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kesimpulan Awal Audit
                  </label>
                  <select
                    value={formKesimpulan}
                    onChange={(e) => setFormKesimpulan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue cursor-pointer"
                  >
                    {KESIMPULAN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Keterangan / Catatan Prosedur
                  </label>
                  <input
                    type="text"
                    placeholder="Catatan hasil pengujian awal (opsional)..."
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Simpan Akun
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL EDIT AKUN (UPDATE)                                */}
        {/* ======================================================== */}
        {editingAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-atlas-blue">
                    <Pencil size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Ubah Rincian Akun</h3>
                    <p className="text-xs text-slate-500">Edit informasi akun dan indeks Lead Schedule</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Akun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kategori Laporan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as AccountCategory)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Indeks Lead Schedule <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formIndex}
                      onChange={(e) => setFormIndex(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kertas Kerja / Prosedur Terkait
                  </label>
                  <select
                    value={formRoute}
                    onChange={(e) => setFormRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue cursor-pointer"
                  >
                    {WORKSHEET_ROUTES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kesimpulan Audit
                  </label>
                  <select
                    value={formKesimpulan}
                    onChange={(e) => setFormKesimpulan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue cursor-pointer"
                  >
                    {KESIMPULAN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Keterangan / Catatan Prosedur
                  </label>
                  <input
                    type="text"
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL KONFIRMASI HAPUS (DELETE)                         */}
        {/* ======================================================== */}
        {deletingAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-full bg-rose-50">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hapus Akun Pemetaan</h3>
                  <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Apakah Anda yakin ingin menghapus akun <strong>{deletingAccount.name}</strong> (Indeks: <strong>{deletingAccount.index}</strong>) dari daftar pemetaan?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingAccount(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Hapus Akun
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL KONFIRMASI RESET STANDAR                          */}
        {/* ======================================================== */}
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <div className="p-2.5 rounded-full bg-amber-50">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reset ke Akun Standar?</h3>
                  <p className="text-xs text-slate-500">Memulihkan 16 akun standar ATLAS</p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Daftar akun pemetaan akan diatur ulang ke 16 akun standar (Kas, Piutang, Persediaan, dst). Akun tambahan yang telah dibuat akan dihapus.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Reset Standar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B120;
