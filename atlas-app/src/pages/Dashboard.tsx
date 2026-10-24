import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEngagementStore } from '../store/engagementStore';
import type { Engagement, ReviewNote } from '../store/engagementStore';
import EngagementFormModal from '../components/EngagementFormModal';
import { 
  getWorksheetProgress, 
  getMatrixProgressSummary,
  getEngagementMatrixCardData
} from '../services/worksheetProgressService';
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
  Info,
  CheckCircle2
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

  const allModuleCodes = useMemo(() => {
    return ATLAS_AUDIT_INDEX.flatMap(col => col.items.map(item => item.code));
  }, []);

  const matrixSummary = useMemo(() => {
    return getMatrixProgressSummary(selectedEngagement, allModuleCodes);
  }, [selectedEngagement, allModuleCodes]);

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

      {/* ── KARTU METRIK KERTAS KERJA AUDIT UNTUK MASING-MASING PERIKATAN ── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 bg-atlas-blue rounded-xs inline-block" />
              Kartu Metrik Kertas Kerja Audit per Perikatan
              <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded">
                {engagements.length} Perikatan
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Pantau progres keterisian kertas kerja audit (Full vs Belum Full) untuk masing-masing perikatan. Klik kartu untuk menampilkan rincian 36 matriks kertas kerja di bawah.
            </p>
          </div>
        </div>

        {/* Grid Kartu Metrik Perikatan */}
        {engagements.length === 0 ? (
          <div className="p-8 bg-white border border-gray-200 text-center text-gray-500 text-xs rounded-xl">
            Belum ada perikatan audit yang dibuat. Buat perikatan baru untuk melihat kartu metrik.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {engagements.map((eng) => {
              const cardData = getEngagementMatrixCardData(eng, allModuleCodes);
              const isSelected = eng.id === selectedEngagementId;

              return (
                <div
                  key={eng.id}
                  onClick={() => handleSelectEngagement(eng.id)}
                  className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer bg-white group ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-gradient-to-b from-blue-50/20 to-white'
                      : 'border-gray-200 hover:border-gray-400 hover:shadow-xs'
                  }`}
                >
                  {/* Active Indicator Top Tag */}
                  {isSelected && (
                    <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Matriks Aktif Dipilih</span>
                    </div>
                  )}

                  <div>
                    {/* Header: Client & ID */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                            {eng.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(eng.status)}`}>
                            {eng.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 group-hover:text-atlas-blue transition-colors truncate mt-1.5" title={eng.clientName}>
                          {eng.clientName}
                        </h3>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {eng.clientIndustry || 'Umum'} · {eng.auditPeriod || `Tahun ${eng.fiscalYear}`} · {eng.accountingStandard || 'SAK EP'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Audit Bar */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Progres Audit Total
                        </span>
                        <span className="font-bold text-gray-900 font-mono text-xs">
                          {eng.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            eng.progress === 100
                              ? 'bg-emerald-500'
                              : eng.progress >= 50
                              ? 'bg-blue-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${eng.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrik Kertas Kerja (ATLAS 36 Modul) */}
                    <div className="mt-3.5 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                        <span>Status 36 Kertas Kerja:</span>
                        <span className="text-gray-900 font-mono font-black">{cardData.summary.averageProgress}% Keterisian</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-emerald-50 border border-emerald-200 rounded py-1.5 px-1">
                          <div className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wider">Full</div>
                          <div className="text-xs font-bold text-emerald-800 font-mono mt-0.5">{cardData.summary.fullCount} KKP</div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded py-1.5 px-1">
                          <div className="text-[9px] font-semibold text-amber-700 uppercase tracking-wider">Belum Full</div>
                          <div className="text-xs font-bold text-amber-800 font-mono mt-0.5">{cardData.summary.inProgressCount} KKP</div>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 rounded py-1.5 px-1">
                          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Belum Mulai</div>
                          <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{cardData.summary.notStartedCount} KKP</div>
                        </div>
                      </div>
                    </div>

                    {/* Indikator Modul Utama (Quick Glance) */}
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        Indikator Modul Utama:
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        {/* A.110 */}
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${cardData.keyWorksheets.a110.statusBadge.bgColor} ${cardData.keyWorksheets.a110.statusBadge.textColor} ${cardData.keyWorksheets.a110.statusBadge.borderColor}`}
                          title={`A.110 Analisis Penerimaan: ${cardData.keyWorksheets.a110.summary}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cardData.keyWorksheets.a110.statusBadge.dotColor}`} />
                          <span>A.110 ({cardData.keyWorksheets.a110.isFull ? 'Full' : `${cardData.keyWorksheets.a110.progress}%`})</span>
                        </span>

                        {/* A.120 */}
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${cardData.keyWorksheets.a120.statusBadge.bgColor} ${cardData.keyWorksheets.a120.statusBadge.textColor} ${cardData.keyWorksheets.a120.statusBadge.borderColor}`}
                          title={`A.120 Alokasi Jam: ${cardData.keyWorksheets.a120.summary}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cardData.keyWorksheets.a120.statusBadge.dotColor}`} />
                          <span>A.120 ({cardData.keyWorksheets.a120.isFull ? 'Full' : `${cardData.keyWorksheets.a120.progress}%`})</span>
                        </span>

                        {/* A.210 */}
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${cardData.keyWorksheets.a210.statusBadge.bgColor} ${cardData.keyWorksheets.a210.statusBadge.textColor} ${cardData.keyWorksheets.a210.statusBadge.borderColor}`}
                          title={`A.210 Materialitas: ${cardData.keyWorksheets.a210.summary}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cardData.keyWorksheets.a210.statusBadge.dotColor}`} />
                          <span>A.210 ({cardData.keyWorksheets.a210.isFull ? 'Full' : `${cardData.keyWorksheets.a210.progress}%`})</span>
                        </span>

                        {/* D.100 */}
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${cardData.keyWorksheets.d100.statusBadge.bgColor} ${cardData.keyWorksheets.d100.statusBadge.textColor} ${cardData.keyWorksheets.d100.statusBadge.borderColor}`}
                          title={`D.100 Trial Balance: ${cardData.keyWorksheets.d100.summary}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cardData.keyWorksheets.d100.statusBadge.dotColor}`} />
                          <span>D.100 ({cardData.keyWorksheets.d100.isFull ? 'Full' : `${cardData.keyWorksheets.d100.progress}%`})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-700'} flex items-center gap-1`}>
                      {isSelected ? '✓ Matriks Sedang Ditampilkan' : 'Klik untuk Tampilkan Matriks'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workspace/${eng.id}`);
                      }}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-900 rounded transition-colors"
                      title="Buka Workspace Perikatan Ini"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MATRIKS INDEKS KERTAS KERJA AUDIT (ATLAS) - DENGAN INDIKATOR BERJALAN DINAMIS PER PERIKATAN ── */}
      <div className="mb-8 bg-white border border-gray-300 shadow-xs">
        {/* Top Control Bar - Ramping & Sederhana */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              Matriks Kertas Kerja Audit (ATLAS)
              <span className="text-[10px] font-semibold text-gray-600 bg-white border border-gray-300 px-2 py-0.5">
                36 Modul
              </span>
            </h2>
            {selectedEngagement && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-100/80 text-blue-900 font-bold text-[10px] rounded border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Klien Aktif: <strong>{selectedEngagement.clientName}</strong> ({selectedEngagement.id})</span>
              </span>
            )}
          </div>

          {/* Right Controls: Engagement Picker & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari modul (A110, B100)..."
                className="w-full bg-white border border-gray-300 text-xs text-gray-900 placeholder-gray-400 pl-7 pr-6 py-1.5 focus:outline-none focus:border-gray-900 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 hover:text-gray-700"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Engagement Selector */}
            {engagements.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Perikatan:</span>
                <select
                  value={selectedEngagementId}
                  onChange={(e) => handleSelectEngagement(e.target.value)}
                  className="bg-white border border-gray-300 text-xs font-semibold text-gray-900 px-2.5 py-1.5 focus:outline-none focus:border-gray-900 cursor-pointer max-w-[220px] truncate"
                >
                  {engagements.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      [{eng.id}] {eng.clientName} ({eng.progress}%)
                    </option>
                  ))}
                </select>
                {selectedEngagement && (
                  <button
                    onClick={() => navigate(`/workspace/${selectedEngagement.id}`)}
                    className="px-2.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    title="Buka Workspace Perikatan Ini"
                  >
                    <span>Buka</span>
                    <ExternalLink size={11} />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">
                Belum ada perikatan aktif
              </div>
            )}
          </div>
        </div>

        {/* Live Indicator Progress Overview Strip for Selected Engagement */}
        {selectedEngagement && (
          <div className="px-5 py-2.5 bg-slate-50/80 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={13} className="text-blue-600" />
                Indikator Berjalan:
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Full: {matrixSummary.fullCount} KKP</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Belum Full: {matrixSummary.inProgressCount} KKP</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Belum Dimulai: {matrixSummary.notStartedCount} KKP</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-600 font-semibold">
                Keterisian: <strong className="text-gray-900 font-bold">{matrixSummary.averageProgress}%</strong>
              </span>
              <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    matrixSummary.averageProgress >= 80 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${matrixSummary.averageProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Phase Filter Notice (if any) */}
        {activeFilter && (
          <div className="px-5 py-1.5 bg-blue-50/70 border-b border-blue-200 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-blue-700" />
              <span>Memfilter perikatan di bawah: <strong>Fase {activeFilter}</strong></span>
            </div>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-950 underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* 5-Column Matrix Grid - Ramping, Putih, Font Hitam dengan Indikator Berjalan */}
        <div className="p-3 sm:p-4 overflow-x-auto bg-white">
          <div className="min-w-[960px] grid grid-cols-5 gap-3.5">
            {ATLAS_AUDIT_INDEX.map((col) => {
              const isColumnActive = activeFilter === col.phaseKey;
              return (
                <div key={col.id} className="flex flex-col">
                  {/* Column Header */}
                  <div 
                    onClick={() => setActiveFilter(isColumnActive ? null : col.phaseKey)}
                    className={`pb-1.5 mb-2 border-b-2 flex items-baseline justify-between cursor-pointer group transition-colors ${
                      isColumnActive 
                        ? 'border-blue-600 text-blue-700' 
                        : 'border-gray-900 text-gray-900 hover:text-blue-700'
                    }`}
                    title={`Klik untuk memfilter daftar perikatan pada tahap ${col.code}`}
                  >
                    <div className="flex items-baseline gap-1.5 font-bold tracking-tight">
                      <span className="text-xs font-black">{col.code}</span>
                      <span className="text-[11px] uppercase tracking-wider">{col.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-700 font-semibold">
                      {col.items.length}
                    </span>
                  </div>

                  {/* Column Items */}
                  <div className="divide-y divide-gray-100">
                    {col.items.map((item) => {
                      const isMatch = matchesItem(item);
                      const hasSearch = searchQuery.trim().length > 0;
                      const prog = getWorksheetProgress(selectedEngagement, item.code);
                      
                      return (
                        <div
                          key={item.code}
                          onClick={() => handleItemClick(item)}
                          className={`flex flex-col py-2 px-1.5 hover:bg-slate-50 transition-all cursor-pointer group text-left rounded border border-transparent hover:border-slate-200 ${
                            hasSearch && isMatch ? 'bg-blue-50/80 ring-1 ring-blue-300' : ''
                          } ${hasSearch && !isMatch ? 'opacity-30' : 'opacity-100'}`}
                          title={`${item.code} - ${item.title}\nStatus: ${prog.summary}`}
                        >
                          {/* Row 1: Code and Status Indicator Badge */}
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-bold text-gray-900 group-hover:text-blue-700 text-[11px] shrink-0 tracking-tight transition-colors">
                              {item.code}
                            </span>

                            {/* Status Indicator Badge */}
                            <span 
                              className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors shrink-0 ${prog.statusBadge.bgColor} ${prog.statusBadge.textColor} ${prog.statusBadge.borderColor}`}
                              title={prog.summary}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${prog.statusBadge.dotColor}`} />
                              <span>{prog.isFull ? 'Full' : prog.progress > 0 ? `${prog.progress}%` : '0%'}</span>
                            </span>
                          </div>

                          {/* Row 2: Title and Chevron */}
                          <div className="flex items-center justify-between gap-1 mt-1">
                            <span className={`text-gray-700 group-hover:text-gray-950 text-[10px] leading-snug line-clamp-2 transition-colors flex-1 ${
                              item.isItalic ? 'italic' : ''
                            }`}>
                              {item.title}
                            </span>
                            <ChevronRight 
                              size={12} 
                              className="text-gray-400 group-hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-0.5" 
                            />
                          </div>

                          {/* Row 3: Running Progress Bar Line */}
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ease-out ${
                                prog.isFull 
                                  ? 'bg-emerald-500' 
                                  : prog.progress > 0 
                                  ? 'bg-amber-500' 
                                  : 'bg-transparent'
                              }`}
                              style={{ width: `${prog.progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Bar - Ramping & Sederhana dengan Legend Indikator */}
        <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-600 gap-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <span>Perikatan aktif: <strong className="text-gray-900 font-semibold">{selectedEngagement ? `${selectedEngagement.clientName} (${selectedEngagement.id})` : 'Belum Dipilih'}</strong></span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Full (100% Selesai)
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Belum Full (Proses Berjalan)
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300" /> Belum Dimulai (0%)
              </span>
            </div>
          </div>
          <div className="text-gray-500 text-right text-[11px]">
            Klik kode atau nama modul untuk langsung membuka kertas kerja
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
                        {(() => {
                          const engSummary = getMatrixProgressSummary(eng, allModuleCodes);
                          return (
                            <div className="flex flex-col space-y-1.5 min-w-[150px]">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-bold text-gray-900 font-mono">{eng.progress}%</span>
                                <span className="text-[9px] text-gray-500 font-mono">
                                  {engSummary.fullCount} Full / {engSummary.inProgressCount} Berjalan
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(eng.progress, eng.status)}`} 
                                  style={{ width: `${eng.progress}%` }}
                                ></div>
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-medium">
                                <span className="text-emerald-700 font-bold">{engSummary.fullCount} Full</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-amber-700 font-semibold">{engSummary.inProgressCount} Belum Full</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-slate-400">{engSummary.notStartedCount} Kosong</span>
                              </div>
                            </div>
                          );
                        })()}
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
