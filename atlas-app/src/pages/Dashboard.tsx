import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEngagementStore } from '../store/engagementStore';
import type { Engagement, ReviewNote } from '../store/engagementStore';
import EngagementFormModal from '../components/EngagementFormModal';
import { 
  Activity,
  ListTodo,
  BellRing,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  FolderKanban,
  Info
} from 'lucide-react';

interface AtlasModuleItem {
  code: string;
  title: string;
  isItalic?: boolean;
  route: string;
}

interface AtlasColumn {
  id: string;
  code: string;
  title: string;
  phaseKey: string;
  items: AtlasModuleItem[];
}

const ATLAS_AUDIT_INDEX: AtlasColumn[] = [
  {
    id: 'a1',
    code: 'A1',
    title: 'PRE-ENGAGEMENT',
    phaseKey: 'A.1',
    items: [
      { code: 'A110', title: 'Analisis Penerimaan dan Keberlanjutan Hubungan dengan Klien', route: 'worksheet/a110' },
      { code: 'A120', title: 'Alokasi Jam Jasa dan Perencanaan Lainnya', route: 'worksheet/a120' },
      { code: 'A130', title: 'Surat Perikatan', route: 'worksheet/a130' },
      { code: 'A140', title: 'Surat Tugas', route: 'worksheet/a140' },
      { code: 'A150', title: 'Pernyataan Independensi', route: 'worksheet/a150' },
      { code: 'A160', title: 'Komunikasi Tim Perikatan', route: 'worksheet/a160' },
      { code: 'A170', title: 'Perikatan Tahun Pertama', route: 'worksheet/a170' },
    ]
  },
  {
    id: 'a2',
    code: 'A2',
    title: 'RISK ASSESSMENT',
    phaseKey: 'A.2',
    items: [
      { code: 'A210', title: 'Materialitas Awal', route: 'worksheet/a210' },
      { code: 'A220', title: 'Prosedur Analitis Awal dan Audit Strategy Memorandum Awal', route: 'worksheet/a220' },
      { code: 'A230', title: 'Pemahaman Entitas dan Lingkungan', route: 'worksheet/a230' },
      { code: 'A240', title: 'Inherent Risk (IR)', isItalic: true, route: 'worksheet/a240' },
      { code: 'A250', title: 'Control Risk (CR)', isItalic: true, route: 'worksheet/a250' },
      { code: 'A260', title: 'Komunikasi Dengan TCWG dan SPI', route: 'worksheet/a260' },
      { code: 'A270', title: 'Risk of Material Misstatement (RoMM)', isItalic: true, route: 'worksheet/a270' },
      { code: 'A280', title: 'Audit Strategy Memorandum Update', isItalic: true, route: 'worksheet/a280' },
    ]
  },
  {
    id: 'b',
    code: 'B',
    title: 'RISK RESPONSE',
    phaseKey: 'B',
    items: [
      { code: 'B100', title: 'Worksheets', isItalic: true, route: 'worksheet/b100' },
      { code: 'B210', title: 'Estimasi Akuntansi', route: 'worksheet/b210' },
      { code: 'B220', title: 'Transaksi dengan Pihak Berelasi', route: 'worksheet/b220' },
      { code: 'B230', title: 'Peristiwa Kemudian', route: 'worksheet/b230' },
      { code: 'B240', title: 'Kelangsungan Usaha', route: 'worksheet/b240' },
      { code: 'B250', title: 'Representasi Manajemen', route: 'worksheet/b250' },
      { code: 'B260', title: 'Pakar Auditor', route: 'worksheet/b260' },
      { code: 'B270', title: 'Pakar Manajemen', route: 'worksheet/b270' },
      { code: 'B280', title: 'Komitmen dan Kontinjensi', route: 'worksheet/b280' },
    ]
  },
  {
    id: 'c',
    code: 'C',
    title: 'COMPLETING AND REPORTING',
    phaseKey: 'C',
    items: [
      { code: 'C110', title: 'Penilaian Materialitas Akhir', route: 'worksheet/c110' },
      { code: 'C120', title: 'Prosedur Analitis Akhir', route: 'worksheet/c120' },
      { code: 'C200', title: 'Reviu Pengungkapan LK', route: 'worksheet/c200' },
      { code: 'C300', title: 'Penelaahan Mutu', route: 'worksheet/c300' },
      { code: 'C400', title: 'Evaluasi Bukti Audit', route: 'worksheet/c400' },
      { code: 'C510', title: 'Reviu LAI', route: 'worksheet/c510' },
      { code: 'C520', title: 'Audit Final Memorandum', isItalic: true, route: 'worksheet/c520' },
      { code: 'C530', title: 'Laporan Auditor Independen Final', route: 'worksheet/c530' },
    ]
  },
  {
    id: 'd',
    code: 'D',
    title: 'GENERAL',
    phaseKey: 'D',
    items: [
      { code: 'D100', title: 'Input Laporan Keuangan', route: 'trial-balance' },
      { code: 'D200', title: 'Lampiran', route: 'general' },
      { code: 'D300', title: 'Singkatan', route: 'general' },
      { code: 'D400', title: 'Petunjuk Pengisian Singkat', route: 'general' },
    ]
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const { 
    engagements = [], 
    auditLogs = [], 
    reviewNotes = [], 
    isSyncing, 
    syncStatus, 
    syncWithCloud 
  } = useEngagementStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [selectedEngagementId, setSelectedEngagementId] = useState<string>(() => {
    const saved = localStorage.getItem('atlas_dashboard_selected_eng');
    if (saved && engagements.some(e => e.id === saved)) return saved;
    return engagements[0]?.id || '';
  });

  useEffect(() => {
    if (engagements.length > 0) {
      if (!selectedEngagementId || !engagements.some(e => e.id === selectedEngagementId)) {
        setSelectedEngagementId(engagements[0].id);
      }
    }
  }, [engagements, selectedEngagementId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSelectEngagement = (id: string) => {
    setSelectedEngagementId(id);
    localStorage.setItem('atlas_dashboard_selected_eng', id);
  };

  const selectedEngagement = engagements.find(e => e.id === selectedEngagementId) || engagements[0];

  const handleItemClick = (item: AtlasModuleItem) => {
    if (engagements.length === 0) {
      showToast('Belum ada perikatan audit. Buat perikatan baru terlebih dahulu.');
      return;
    }
    const targetEngagement = selectedEngagement || engagements[0];
    if (!targetEngagement) {
      showToast('Pilih perikatan terlebih dahulu.');
      return;
    }
    navigate(`/workspace/${targetEngagement.id}/${item.route}`);
  };

  const matchesItem = (item: AtlasModuleItem) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return item.code.toLowerCase().includes(q) || item.title.toLowerCase().includes(q);
  };

  const openReviewNotes = (reviewNotes || []).filter(
    (note: ReviewNote) => note.status === 'Open' || note.status === 'Reopened'
  );

  const getEngagementPhase = (eng: Engagement): string => {
    if (eng.progress >= 85 || eng.status === 'Completed') return 'C';
    if (eng.progress >= 50) return 'B';
    if (eng.progress >= 25) return 'A.2';
    return 'A.1';
  };

  const activeCount = engagements.filter(e => e.status === 'Active').length;
  const overdueCount = engagements.filter(e => e.status === 'Overdue').length;
  const pendingReviewCount = engagements.filter(e => e.status === 'Pending Review').length;
  const completedCount = engagements.filter(e => e.status === 'Completed' || e.progress === 100).length;

  const filteredEngagements = activeFilter 
    ? engagements.filter(eng => getEngagementPhase(eng) === activeFilter)
    : engagements;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-blue-50 text-atlas-blue border-blue-200';
      case 'Pending Review': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'Overdue': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'Overdue') return 'bg-red-600';
    if (progress === 100) return 'bg-green-600';
    return 'bg-atlas-blue';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 pb-6 border-b border-gray-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight uppercase">Dashboard Utama</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-lg leading-relaxed">
            {engagements.length === 0 ? (
              <span>Pemantauan seluruh perikatan dan aktivitas tim audit KAP. Belum ada perikatan aktif yang dibuat.</span>
            ) : (
              <span>
                Pemantauan seluruh perikatan dan aktivitas tim. Saat ini terdapat{' '}
                <strong className="text-gray-900">{activeCount} perikatan aktif</strong>
                {overdueCount > 0 ? (
                  <> dan <strong className="text-red-600">{overdueCount} terlambat</strong> (overdue).</>
                ) : (
                  <> dan tidak ada perikatan yang terlambat.</>
                )}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 border-r border-gray-300">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Menunggu Review</p>
              <p className="text-2xl font-bold text-gray-900">{pendingReviewCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Selesai</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
          <button
            onClick={() => syncWithCloud()}
            disabled={isSyncing}
            className={`px-3.5 py-2 text-xs font-bold transition-all shadow-xs whitespace-nowrap min-h-[44px] flex items-center justify-center rounded border gap-1.5 cursor-pointer disabled:cursor-wait ${
              isSyncing 
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : syncStatus === 'synced'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Sinkronisasi data perikatan dengan database Supabase Cloud"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-blue-600' : 'text-gray-500'} />
            <span>{isSyncing ? 'Menyinkronkan...' : syncStatus === 'synced' ? 'Tersinkron Cloud' : 'Sinkronkan Cloud'}</span>
          </button>
          {hasPermission('create_engagement') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-atlas-blue hover:bg-blue-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap min-h-[44px] flex items-center justify-center rounded cursor-pointer"
            >
              + Buat Engagement
            </button>
          )}
        </div>
      </div>

      {/* ── MATRIKS INDEKS KERTAS KERJA AUDIT (ATLAS) ── */}
      <div className="mb-10 bg-[#0e1f3b] rounded-xl border border-[#1e3a66] shadow-xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-5 py-4 border-b border-[#1c3861] bg-[#0a182e] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0">
              <FolderKanban size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  Matriks Kertas Kerja Audit (ATLAS)
                </h2>
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded">
                  36 Modul Lengkap
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Indeks kertas kerja audit standar IAPI. Pilih perikatan dan klik pada modul untuk langsung membuka kertas kerja.
              </p>
            </div>
          </div>

          {/* Right Controls: Engagement Picker & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[210px] flex-1 sm:flex-initial">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari (A210, Materialitas, B100)..."
                className="w-full bg-[#0d2242] border border-[#204170] text-xs text-white placeholder-slate-400 pl-8 pr-3 py-2 rounded focus:outline-none focus:border-yellow-400 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Engagement Selector */}
            {engagements.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Perikatan Tujuan</label>
                  <select
                    value={selectedEngagementId}
                    onChange={(e) => handleSelectEngagement(e.target.value)}
                    className="bg-[#0d2242] border border-[#204170] text-xs font-semibold text-yellow-300 px-3 py-1.5 rounded focus:outline-none focus:border-yellow-400 cursor-pointer max-w-[250px] truncate"
                  >
                    {engagements.map((eng) => (
                      <option key={eng.id} value={eng.id} className="bg-[#0e1f3b] text-white">
                        [{eng.id}] {eng.clientName} ({eng.progress}%)
                      </option>
                    ))}
                  </select>
                </div>
                {selectedEngagement && (
                  <button
                    onClick={() => navigate(`/workspace/${selectedEngagement.id}`)}
                    className="self-end px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold text-xs rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                    title="Buka Beranda Workspace Perikatan Ini"
                  >
                    <span>Workspace</span>
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic bg-[#0d2242] px-3 py-2 rounded border border-[#204170]">
                Belum ada perikatan aktif
              </div>
            )}
          </div>
        </div>

        {/* Active Phase Filter Notice (if any) */}
        {activeFilter && (
          <div className="px-5 py-2 bg-yellow-400/10 border-b border-yellow-400/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-yellow-300">
              <Filter size={13} />
              <span>Filter tabel perikatan aktif: <strong>Fase {activeFilter}</strong></span>
            </div>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-[11px] font-bold text-yellow-400 hover:text-yellow-200 underline cursor-pointer"
            >
              Tampilkan Semua Perikatan
            </button>
          </div>
        )}

        {/* 5-Column Matrix Grid */}
        <div className="p-4 sm:p-5 overflow-x-auto">
          <div className="min-w-[980px] grid grid-cols-5 gap-4">
            {ATLAS_AUDIT_INDEX.map((col) => {
              const isColumnActive = activeFilter === col.phaseKey;
              return (
                <div key={col.id} className="flex flex-col">
                  {/* Column Header */}
                  <div 
                    onClick={() => setActiveFilter(isColumnActive ? null : col.phaseKey)}
                    className={`pb-1.5 mb-2.5 border-b-2 flex items-baseline justify-between cursor-pointer group transition-colors ${
                      isColumnActive 
                        ? 'border-yellow-300 text-yellow-300' 
                        : 'border-[#f5c242] text-[#f5c242] hover:text-yellow-300'
                    }`}
                    title={`Klik untuk memfilter perikatan di tahap ${col.code}`}
                  >
                    <div className="flex items-baseline gap-2 font-bold tracking-wider">
                      <span className="text-sm font-extrabold">{col.code}</span>
                      <span className="italic text-xs uppercase tracking-tight">{col.title}</span>
                    </div>
                    <span className="text-[10px] text-yellow-400/60 group-hover:text-yellow-300 transition-colors">
                      {col.items.length}
                    </span>
                  </div>

                  {/* Column Items */}
                  <div className="space-y-0.5">
                    {col.items.map((item) => {
                      const isMatch = matchesItem(item);
                      const hasSearch = searchQuery.trim().length > 0;
                      
                      return (
                        <div
                          key={item.code}
                          onClick={() => handleItemClick(item)}
                          className={`flex items-start gap-2.5 py-1.5 px-2 rounded border-b border-[#1b3558]/70 hover:bg-[#16335d] transition-all cursor-pointer group relative ${
                            hasSearch && isMatch ? 'bg-[#183968] ring-1 ring-yellow-400/60' : ''
                          } ${hasSearch && !isMatch ? 'opacity-25' : 'opacity-100'}`}
                          title={`Buka ${item.code} - ${item.title}`}
                        >
                          {/* Code */}
                          <span className="font-bold text-[#f5c242] group-hover:text-yellow-300 text-xs shrink-0 w-11 tracking-wider transition-colors pt-0.5">
                            {item.code}
                          </span>

                          {/* Title */}
                          <span className={`text-slate-100 group-hover:text-white text-xs leading-snug transition-colors flex-1 ${
                            item.isItalic ? 'italic' : ''
                          }`}>
                            {item.title}
                          </span>

                          {/* Hover Arrow */}
                          <ChevronRight 
                            size={12} 
                            className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" 
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-5 py-2.5 bg-[#0a182e] border-t border-[#1c3861] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Perikatan aktif: <strong className="text-white">{selectedEngagement ? `${selectedEngagement.clientName} (${selectedEngagement.id})` : 'Belum Dipilih'}</strong>
            </span>
          </div>
          <div className="text-slate-400 text-right">
            <span>Klik modul kertas kerja untuk membuka lembar kerja secara instan</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Engagement Table */}
        <div className="xl:col-span-2 border border-gray-300 bg-white shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Daftar Perikatan Audit</h3>
            <Link to="/engagements" className="text-xs text-atlas-blue font-bold uppercase hover:underline tracking-wider min-h-[44px] flex items-center">
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-[10px] text-gray-500 uppercase tracking-widest bg-gray-50">
                  <th className="px-6 py-3 font-bold border-r border-gray-200">Engagement & Klien</th>
                  <th className="px-6 py-3 font-bold border-r border-gray-200">Periode</th>
                  <th className="px-6 py-3 font-bold border-r border-gray-200">Tim (P/M)</th>
                  <th className="px-6 py-3 font-bold border-r border-gray-200">Progress</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEngagements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                      {engagements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-4">
                          <FolderOpen size={36} className="text-gray-300 mb-2" />
                          <p className="font-semibold text-gray-800 text-sm">Belum ada perikatan audit</p>
                          <p className="text-xs text-gray-500 mt-1 mb-4">Tambahkan perikatan audit baru untuk mulai mengelola kertas kerja dan tim.</p>
                          {hasPermission('create_engagement') && (
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="bg-atlas-blue hover:bg-blue-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm min-h-[44px] flex items-center justify-center rounded"
                            >
                              <Plus size={14} className="mr-1.5" /> Buat Engagement
                            </button>
                          )}
                        </div>
                      ) : (
                        `Tidak ada perikatan yang sedang berada di tahap ${activeFilter}.`
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredEngagements.map((eng) => (
                    <tr key={eng.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 border-r border-gray-100">
                        <Link to={`/workspace/${eng.id}`} className="block group">
                          <span className="font-bold text-gray-900 group-hover:text-atlas-blue transition-colors text-sm">{eng.id}</span>
                          <span className="text-xs text-gray-500 mt-1 block">{eng.clientName}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600 border-r border-gray-100">
                        {eng.auditPeriod || `Tahun Buku ${eng.fiscalYear}`}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 border-r border-gray-100">
                        <div className="flex flex-col gap-1.5">
                          <span><span className="font-bold text-gray-900 w-4 inline-block">P:</span> {eng.partnerName || '-'}</span>
                          <span><span className="font-bold text-gray-900 w-4 inline-block">M:</span> {eng.managerName || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-100">
                        <div className="flex flex-col space-y-1.5">
                          <span className="text-[10px] font-bold text-gray-900">{eng.progress}% Selesai</span>
                          <div className="w-full bg-gray-200 h-1.5 rounded-none">
                            <div 
                              className={`h-1.5 ${getProgressColor(eng.progress, eng.status)}`} 
                              style={{ width: `${eng.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(eng.status)}`}>
                          {eng.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          
          {/* Review Tasks & Status Approval */}
          <div className="border border-gray-300 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-300 flex items-center space-x-2 bg-gray-50">
              <ListTodo size={14} className="text-gray-900" />
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Review & Approval</h3>
            </div>
            <div className="p-0 divide-y divide-gray-200">
              {openReviewNotes.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Tidak ada catatan review yang menunggu persetujuan.
                </div>
              ) : (
                openReviewNotes.map((task) => {
                  const relatedEng = engagements.find(e => e.id === task.engagementId);
                  return (
                    <div key={task.id} className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer bg-white group">
                      <div>
                        <p className="text-sm font-bold text-gray-800 group-hover:text-atlas-blue transition-colors">{task.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">{relatedEng?.clientName || task.engagementId} ({task.worksheetId})</p>
                      </div>
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-1 border border-red-200 uppercase tracking-wider">{task.reviewer}</span>
                    </div>
                  );
                })
              )}
              {openReviewNotes.length > 0 && (
                <div className="p-4 bg-gray-50">
                  <Link 
                    to="/engagements"
                    className="block w-full py-2 border border-gray-300 text-xs text-center text-gray-800 font-bold hover:bg-gray-100 uppercase tracking-widest transition-colors shadow-sm bg-white min-h-[44px] flex items-center justify-center"
                  >
                    Lihat Semua
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity & Notification */}
          <div className="border border-gray-300 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-2">
                <Activity size={14} className="text-gray-900" />
                <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Aktivitas Terkini</h3>
              </div>
              <BellRing size={14} className="text-gray-400" />
            </div>
            <div className="p-6">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Belum ada log aktivitas yang tercatat.
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gray-300">
                  {auditLogs.slice(0, 5).map((act) => (
                    <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-2.5 h-2.5 rounded-none bg-atlas-blue shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ring-4 ring-white shadow-sm"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 border border-gray-200 shadow-sm hover:border-atlas-blue transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-gray-900">{act.user}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{act.action} pada <span className="font-bold text-gray-900">{act.module}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <Info size={16} className="text-yellow-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {isModalOpen && (
        <EngagementFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          initialData={null}
        />
      )}
    </div>
  );
};

export default Dashboard;
