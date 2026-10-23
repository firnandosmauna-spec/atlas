import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEngagementStore } from '../../store/engagementStore';
import type { Engagement, Account } from '../../store/engagementStore';
import { 
  Upload, 
  Plus, 
  Save, 
  ArrowLeft, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Calculator, 
  Trash2,
  Sparkles,
  Building2,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Layers,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import ExcelImportModal from '../../components/ExcelImportModal';
import ExportMenu from '../../components/ExportMenu';
import { GovernmentFinancialStatements } from '../../components/financial-statements/GovernmentFinancialStatements';
import { CommercialFinancialStatements } from '../../components/financial-statements/CommercialFinancialStatements';
import { 
  SAP_GROUPS, 
  SAP_SUBGROUPS, 
  SAP_SAMPLE_TRIAL_BALANCE,
  calculateLO,
  calculateLRA,
  calculateLAK,
  calculateLPSAL
} from '../../utils/sapFinancialStatements';

type ActiveTab = 'TB' | 'LO' | 'LRA' | 'LAK' | 'LPSAL' | 'NERACA' | 'LABA_RUGI' | 'ARUS_KAS' | 'PERUBAHAN_EKUITAS';

const COMMERCIAL_GROUPS = [
  'Aset Lancar',
  'Aset Tetap',
  'Aset Tidak Lancar Lainnya',
  'Liabilitas Jangka Pendek',
  'Liabilitas Jangka Panjang',
  'Ekuitas',
  'Pendapatan Usaha',
  'Beban Pokok Pendapatan (HPP)',
  'Beban Operasional',
  'Pendapatan Lain-lain',
  'Beban Lain-lain'
];

const ALL_SAP_GROUPS = [
  ...SAP_GROUPS,
  'Aset Lancar',
  'Aset Tetap',
  'Liabilitas',
  'Pendapatan',
  'Beban'
];

// Contoh template komersial SAK EP lengkap & seimbang (Manufaktur / Perdagangan)
const COMMERCIAL_SAMPLE_TRIAL_BALANCE: Account[] = [
  { id: 'com-1', code: '1110', name: 'Kas dan Setara Kas', group: 'Aset Lancar', subGroup: 'Kas & Bank', statementType: 'Neraca', debit: 650000000, credit: 0, endingBalance: 650000000 },
  { id: 'com-2', code: '1120', name: 'Piutang Usaha', group: 'Aset Lancar', subGroup: 'Piutang', statementType: 'Neraca', debit: 620000000, credit: 0, endingBalance: 620000000 },
  { id: 'com-3', code: '1130', name: 'Persediaan Barang Jadi & Bahan Baku', group: 'Aset Lancar', subGroup: 'Persediaan', statementType: 'Neraca', debit: 580000000, credit: 0, endingBalance: 580000000 },
  { id: 'com-4', code: '1210', name: 'Aset Tetap - Bangunan & Mesin Pabrik', group: 'Aset Tetap', subGroup: 'Aset Tetap', statementType: 'Neraca', debit: 1850000000, credit: 0, endingBalance: 1850000000 },
  { id: 'com-5', code: '1220', name: 'Akumulasi Penyusutan Aset Tetap', group: 'Aset Tetap', subGroup: 'Akumulasi Penyusutan', statementType: 'Neraca', debit: 0, credit: 350000000, endingBalance: -350000000 },
  { id: 'com-6', code: '2110', name: 'Utang Usaha (Pemasok)', group: 'Liabilitas Jangka Pendek', subGroup: 'Utang Usaha', statementType: 'Neraca', debit: 0, credit: 420000000, endingBalance: -420000000 },
  { id: 'com-7', code: '2120', name: 'Utang Pajak (PPh & PPN)', group: 'Liabilitas Jangka Pendek', subGroup: 'Utang Pajak', statementType: 'Neraca', debit: 0, credit: 80000000, endingBalance: -80000000 },
  { id: 'com-8', code: '2210', name: 'Utang Bank Jangka Panjang', group: 'Liabilitas Jangka Panjang', subGroup: 'Utang Bank', statementType: 'Neraca', debit: 0, credit: 650000000, endingBalance: -650000000 },
  { id: 'com-9', code: '3110', name: 'Modal Saham Disetor', group: 'Ekuitas', subGroup: 'Modal Saham', statementType: 'Neraca', debit: 0, credit: 1500000000, endingBalance: -1500000000 },
  { id: 'com-10', code: '3210', name: 'Saldo Laba Tahun Lalu', group: 'Ekuitas', subGroup: 'Saldo Laba', statementType: 'Neraca', debit: 0, credit: 300000000, endingBalance: -300000000 },
  { id: 'com-11', code: '4110', name: 'Pendapatan Usaha / Penjualan', group: 'Pendapatan Usaha', subGroup: 'Penjualan', statementType: 'Laba Rugi', debit: 0, credit: 2400000000, endingBalance: -2400000000 },
  { id: 'com-12', code: '5110', name: 'Beban Pokok Pendapatan (HPP)', group: 'Beban Pokok Pendapatan (HPP)', subGroup: 'HPP', statementType: 'Laba Rugi', debit: 1450000000, credit: 0, endingBalance: 1450000000 },
  { id: 'com-13', code: '5210', name: 'Beban Gaji & Upah Karyawan', group: 'Beban Operasional', subGroup: 'Beban Operasional', statementType: 'Laba Rugi', debit: 380000000, credit: 0, endingBalance: 380000000 },
  { id: 'com-14', code: '5220', name: 'Beban Operasional & Administrasi Umum', group: 'Beban Operasional', subGroup: 'Beban Operasional', statementType: 'Laba Rugi', debit: 170000000, credit: 0, endingBalance: 170000000 },
];

const TrialBalance: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const updateEngagement = useEngagementStore(state => state.updateEngagement);
  
  const isSAP = engagement.accountingStandard === 'SAP';
  const availableGroups = isSAP ? ALL_SAP_GROUPS : COMMERCIAL_GROUPS;

  const [activeTab, setActiveTab] = useState<ActiveTab>('TB');
  const [accounts, setAccounts] = useState<Account[]>(engagement.trialBalance || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Math.abs(val));
  };

  const handleSave = () => {
    updateEngagement(engagement.id, { trialBalance: accounts });
    setIsSaved(true);
    showToast('Seluruh data Neraca Saldo dan pemetaan Laporan Keuangan berhasil disimpan!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetData = () => {
    setShowResetModal(true);
  };

  const confirmResetData = () => {
    setAccounts([]);
    updateEngagement(engagement.id, { trialBalance: [] });
    setShowResetModal(false);
    showToast('Seluruh data Neraca Saldo dan Laporan Keuangan berhasil dibersihkan (reset bersih)!');
  };

  const handleOpenImport = () => {
    setShowImport(true);
  };

  const handleAddManual = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      code: '',
      name: '',
      group: isSAP ? 'Pendapatan-LO' : 'Aset Lancar',
      subGroup: isSAP ? 'Pendapatan Asli Daerah (PAD) - LO' : 'Kas & Bank',
      statementType: isSAP ? 'LO' : 'Neraca',
      debit: 0,
      credit: 0,
      endingBalance: 0,
      budget: 0
    };
    setAccounts([newAccount, ...accounts]);
  };

  const handleLoadTemplate = () => {
    if (isSAP) {
      setAccounts(SAP_SAMPLE_TRIAL_BALANCE);
      showToast('Template contoh SAP PP 71/2010 (LO, LRA, LAK, LPSAL) berhasil dimuat!');
    } else {
      setAccounts(COMMERCIAL_SAMPLE_TRIAL_BALANCE);
      showToast(`Template contoh standar ${engagement.accountingStandard || 'SAK EP'} berhasil dimuat!`);
    }
  };

  const handleEditAccount = (id: string, field: keyof Account, value: any) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const updated = { ...acc, [field]: value };
        if (field === 'debit' || field === 'credit') {
          updated.endingBalance = (Number(updated.debit) || 0) - (Number(updated.credit) || 0);
        }
        if (field === 'group') {
          if (isSAP) {
            const defaultSub = SAP_SUBGROUPS[value]?.[0] || '';
            updated.subGroup = defaultSub;
            if (value === 'Pendapatan-LO' || value === 'Beban-LO') updated.statementType = 'LO';
            else if (value === 'Pendapatan-LRA' || value === 'Belanja-LRA' || value === 'Pembiayaan-LRA') updated.statementType = 'LRA';
            else if (value === 'Arus Kas / Transitoris') updated.statementType = 'LAK';
            else if (value === 'Saldo Anggaran Lebih') updated.statementType = 'LPSAL';
            else updated.statementType = 'Neraca';
          } else {
            if (value.includes('Aset') || value.includes('Liabilitas') || value === 'Ekuitas') {
              updated.statementType = 'Neraca';
            } else if (value.includes('Pendapatan') || value.includes('Beban') || value.includes('HPP')) {
              updated.statementType = 'Laba Rugi';
            }
          }
        }
        return updated;
      }
      return acc;
    }));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  // Calculations for Summary
  const totalDebit = accounts.reduce((sum, acc) => sum + (Number(acc.debit) || 0), 0);
  const totalCredit = accounts.reduce((sum, acc) => sum + (Number(acc.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 1;
  
  // SAP metrics
  const lo = calculateLO(accounts);
  const lra = calculateLRA(accounts);

  // Commercial metrics
  const commercialPendapatan = accounts.filter(a => a.group?.toLowerCase().includes('pendapatan')).reduce((sum, a) => sum + Math.abs(a.endingBalance || a.credit - a.debit), 0);
  const commercialBeban = accounts.filter(a => a.group?.toLowerCase().includes('beban') || a.group?.toLowerCase().includes('hpp')).reduce((sum, a) => sum + Math.abs(a.endingBalance || a.debit - a.credit), 0);
  const commercialNetProfit = commercialPendapatan - commercialBeban;

  // Segmented Navigation Tabs
  const sapTabs = [
    { id: 'TB' as ActiveTab, label: 'Neraca Saldo (Trial Balance)', icon: Calculator, count: accounts.length },
    { id: 'LO' as ActiveTab, label: 'LO (Laporan Operasional)', icon: TrendingUp, badge: 'Akrual' },
    { id: 'LRA' as ActiveTab, label: 'LRA (Realisasi Anggaran)', icon: BarChart3, badge: 'Kas' },
    { id: 'LAK' as ActiveTab, label: 'LAK (Laporan Arus Kas)', icon: DollarSign, badge: 'Direct' },
    { id: 'LPSAL' as ActiveTab, label: 'LPSAL (Perubahan SAL)', icon: FileText, badge: 'SiLPA' },
  ];

  const commercialTabs = [
    { id: 'TB' as ActiveTab, label: 'Neraca Saldo (Trial Balance)', icon: Calculator, count: accounts.length },
    { id: 'NERACA' as ActiveTab, label: 'Laporan Posisi Keuangan (Neraca)', icon: Building2, badge: 'SAK' },
    { id: 'LABA_RUGI' as ActiveTab, label: 'Laporan Laba Rugi', icon: TrendingUp, badge: 'Komprehensif' },
    { id: 'ARUS_KAS' as ActiveTab, label: 'Laporan Arus Kas', icon: DollarSign, badge: 'Kas' },
    { id: 'PERUBAHAN_EKUITAS' as ActiveTab, label: 'Laporan Perubahan Ekuitas', icon: FileText, badge: 'Ekuitas' },
  ];

  const tabs = isSAP ? sapTabs : commercialTabs;

  return (
    <div className="h-full flex flex-col -m-6 bg-slate-50 font-sans">
      
      {/* ── TOP HEADER BAR ── */}
      <div className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 shrink-0 z-10 sticky top-0 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={() => navigate('..')} 
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Kembali ke Workspace"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Financial Statement & Trial Balance
              </h1>
              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                isSAP 
                  ? 'bg-blue-50 text-blue-800 border-blue-200' 
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}>
                {isSAP ? 'STANDAR: SAP PP 71/2010' : `STANDAR: ${engagement.accountingStandard || 'SAK EP'}`}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              {engagement.clientName} | Periode: {engagement.auditPeriod || engagement.fiscalYear || '2025'} 
              <span className="mx-1.5 text-slate-300">|</span> Standar: <strong className="text-slate-800">{engagement.accountingStandard || 'SAK EP'}</strong>
              <span className="mx-1.5 text-slate-300">|</span> Mata Uang: <strong className="text-slate-800">{engagement.currency}</strong> ({engagement.presentationUnit})
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap">
          {/* Reset / Bersihkan Data Mock */}
          <button 
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Reset dan bersihkan seluruh data akun Neraca Saldo dan Laporan Keuangan"
          >
            <Trash2 size={14} className="text-rose-600" />
            <span>Reset / Bersihkan Data</span>
          </button>

          {/* Muat Template Contoh */}
          <button 
            type="button"
            onClick={handleLoadTemplate} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-atlas-blue border border-blue-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title={isSAP ? "Muat data contoh neraca saldo SAP lengkap untuk LO, LRA, LAK, dan LPSAL" : "Muat contoh neraca saldo standar komersial"}
          >
            <Sparkles size={14} className="text-blue-600" />
            <span className="hidden sm:inline">Contoh Template</span>
            <span className="sm:hidden">Template</span>
          </button>

          <button 
            type="button"
            onClick={handleOpenImport} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200"
          >
            <Upload size={14} />
            <span>Import Excel</span>
          </button>

          <button 
            type="button"
            onClick={handleAddManual} 
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah Akun</span>
          </button>

          <ExportMenu worksheetCode="TrialBalance" clientName={engagement?.clientName} />

          <button 
            type="button"
            onClick={handleSave} 
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isSaved ? <CheckCircle size={15} /> : <Save size={15} />}
            <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
          </button>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="mx-6 sm:mx-8 mt-3 bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in duration-150">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── WARNINGS & ALERTS ── */}
      <div className="px-6 sm:px-8 pt-3 shrink-0 space-y-2">
        {accounts.length > 0 && !isBalanced && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-3 sm:p-3.5 rounded-r-lg flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={17} />
            <div>
              <h3 className="font-bold text-rose-900 text-xs">Peringatan: Neraca Saldo Belum Seimbang (Unbalanced)!</h3>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                Total Debit (Rp {formatCurrency(totalDebit)}) tidak sama dengan Total Kredit (Rp {formatCurrency(totalCredit)}). Selisih: <strong>Rp {formatCurrency(Math.abs(totalDebit - totalCredit))}</strong>. Pastikan seluruh transaksi dan saldo penutup telah seimbang sebelum melakukan prosedur audit materialitas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── SEGMENTED NAVIGATION TABS ── */}
      <div className="px-6 sm:px-8 pt-3 shrink-0">
        <div className="flex p-1 bg-slate-200/60 rounded-xl border border-slate-200/80 overflow-x-auto scrollbar-none gap-1 text-xs font-medium">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-lg whitespace-nowrap transition-all text-xs font-semibold cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-atlas-blue' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                    isActive ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {typeof tab.count === 'number' && (
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 space-y-4">
        
        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: TRIAL BALANCE (INPUT & MAPPING DATA)                          */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'TB' && (
          <div className="space-y-4">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
              <div className="bg-white border border-slate-200/90 rounded-lg p-2.5 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Debit</span>
                <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block font-mono">
                  Rp {formatCurrency(totalDebit)}
                </span>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-lg p-2.5 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Kredit</span>
                <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block font-mono">
                  Rp {formatCurrency(totalCredit)}
                </span>
              </div>

              {isSAP ? (
                <>
                  <div className="bg-white border border-slate-200/90 rounded-lg p-2.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Surplus/(Defisit) LO</span>
                    <span className={`text-sm sm:text-base font-bold mt-0.5 block font-mono ${lo.surplusDefisitAkhir >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      Rp {formatCurrency(lo.surplusDefisitAkhir)}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-lg p-2.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SiLPA LRA</span>
                    <span className="text-sm sm:text-base font-bold text-purple-700 mt-0.5 block font-mono">
                      Rp {formatCurrency(lra.silpa)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white border border-slate-200/90 rounded-lg p-2.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pendapatan Usaha</span>
                    <span className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5 block font-mono">
                      Rp {formatCurrency(commercialPendapatan)}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-lg p-2.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Laba / (Rugi) Bersih</span>
                    <span className={`text-sm sm:text-base font-bold mt-0.5 block font-mono ${commercialNetProfit >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                      Rp {formatCurrency(commercialNetProfit)}
                    </span>
                  </div>
                </>
              )}

              <div className={`col-span-2 lg:col-span-1 rounded-lg p-2.5 flex items-center justify-center font-bold text-xs uppercase tracking-wider border ${
                accounts.length === 0
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : isBalanced 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {accounts.length === 0 ? 'DATA BERSIH (0 AKUN)' : isBalanced ? '✓ NERACA SEIMBANG' : '⚠ TIDAK SEIMBANG'}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-slate-200/90 rounded-lg p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari kode akun, nama akun, atau jenis laporan..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/60 focus:bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-atlas-blue"
                />
              </div>

              {accounts.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Menampilkan <strong>{accounts.length}</strong> akun</span>
                  <button 
                    onClick={handleResetData}
                    className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline text-[11px]"
                  >
                    Bersihkan Semua
                  </button>
                </div>
              )}
            </div>

            {/* Main Table Trial Balance */}
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[950px]">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-3.5 py-2.5 w-32">Kode Akun</th>
                      <th className="px-3.5 py-2.5">Nama Akun</th>
                      <th className="px-3.5 py-2.5 w-36">{isSAP ? 'Laporan SAP' : 'Jenis Laporan'}</th>
                      <th className="px-3.5 py-2.5 w-48">Kelompok (Group)</th>
                      <th className="px-3.5 py-2.5 w-44">Sub Kelompok</th>
                      <th className="px-3.5 py-2.5 w-32 text-right">Debit (Rp)</th>
                      <th className="px-3.5 py-2.5 w-32 text-right">Kredit (Rp)</th>
                      <th className="px-3.5 py-2.5 w-36 text-right">Saldo Akhir</th>
                      <th className="px-3.5 py-2.5 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accounts.filter(a => 
                      a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      a.code.includes(searchTerm) ||
                      (a.statementType && a.statementType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (a.group && a.group.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-3.5 py-2 font-mono font-bold text-slate-900">
                          <input 
                            type="text" 
                            value={acc.code} 
                            onChange={e => handleEditAccount(acc.id, 'code', e.target.value)}
                            placeholder="Kode"
                            className="w-full bg-transparent outline-none border-b border-transparent focus:border-atlas-blue font-mono text-xs"
                          />
                        </td>
                        <td className="px-3.5 py-2 font-medium text-slate-800">
                          <input 
                            type="text" 
                            value={acc.name} 
                            onChange={e => handleEditAccount(acc.id, 'name', e.target.value)}
                            placeholder="Nama Akun"
                            className="w-full bg-transparent outline-none border-b border-transparent focus:border-atlas-blue text-xs font-semibold"
                          />
                        </td>
                        <td className="px-3.5 py-2">
                          <select 
                            className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] font-bold focus:border-atlas-blue outline-none bg-slate-50/60"
                            value={acc.statementType || (isSAP ? 'LO' : 'Neraca')}
                            onChange={(e) => handleEditAccount(acc.id, 'statementType', e.target.value)}
                          >
                            {isSAP ? (
                              <>
                                <option value="LO">LO (Operasional)</option>
                                <option value="LRA">LRA (Anggaran)</option>
                                <option value="LAK">LAK (Arus Kas)</option>
                                <option value="LPSAL">LPSAL (SAL)</option>
                                <option value="Neraca">Neraca</option>
                              </>
                            ) : (
                              <>
                                <option value="Neraca">Neraca (Posisi Keuangan)</option>
                                <option value="Laba Rugi">Laporan Laba Rugi</option>
                                <option value="Arus Kas">Laporan Arus Kas</option>
                                <option value="Perubahan Ekuitas">Perubahan Ekuitas</option>
                              </>
                            )}
                          </select>
                        </td>
                        <td className="px-3.5 py-2">
                          <select 
                            className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] focus:border-atlas-blue outline-none bg-slate-50/60 font-medium"
                            value={acc.group}
                            onChange={(e) => handleEditAccount(acc.id, 'group', e.target.value)}
                          >
                            <option value="">-- Pilih Group --</option>
                            {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </td>
                        <td className="px-3.5 py-2">
                          <input 
                            type="text"
                            value={acc.subGroup || ''}
                            onChange={(e) => handleEditAccount(acc.id, 'subGroup', e.target.value)}
                            placeholder="Sub Kelompok"
                            className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] focus:border-atlas-blue outline-none bg-transparent"
                          />
                        </td>
                        <td className="px-3.5 py-2 text-right">
                          <input 
                            type="number" 
                            value={acc.debit === 0 ? '' : acc.debit} 
                            onChange={e => handleEditAccount(acc.id, 'debit', Number(e.target.value))}
                            placeholder="0"
                            className="w-full text-right bg-transparent outline-none font-mono text-xs focus:border-b focus:border-atlas-blue text-slate-800"
                          />
                        </td>
                        <td className="px-3.5 py-2 text-right">
                          <input 
                            type="number" 
                            value={acc.credit === 0 ? '' : acc.credit} 
                            onChange={e => handleEditAccount(acc.id, 'credit', Number(e.target.value))}
                            placeholder="0"
                            className="w-full text-right bg-transparent outline-none font-mono text-xs focus:border-b focus:border-atlas-blue text-slate-800"
                          />
                        </td>
                        <td className={`px-3.5 py-2 text-right font-mono font-bold text-xs ${acc.endingBalance < 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                          {formatCurrency(acc.endingBalance)} {acc.endingBalance < 0 ? '(Cr)' : '(Dr)'}
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          <button 
                            type="button"
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus baris"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {accounts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-6 py-14 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center space-y-2.5">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <Calculator size={24} />
                            </div>
                            <p className="font-bold text-slate-900 text-sm">Belum Ada Akun di Neraca Saldo</p>
                            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                              Neraca Saldo saat ini bersih tanpa data mock. Klik <strong>"Tambah Akun"</strong> untuk input manual, gunakan <strong>"Import Excel"</strong> untuk mengunggah neraca saldo klien, atau klik <strong>"Contoh Template"</strong> untuk melihat format standar.
                            </p>
                            <div className="pt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleAddManual}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                + Tambah Akun Manual
                              </button>
                              <button
                                type="button"
                                onClick={handleOpenImport}
                                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                Import Excel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TABS 2+: GOVERNMENT FINANCIAL STATEMENTS (SAP)                       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab !== 'TB' && isSAP && (
          <GovernmentFinancialStatements 
            accounts={accounts}
            activeStatement={activeTab as 'LO' | 'LRA' | 'LAK' | 'LPSAL'}
            clientName={engagement.clientName}
            period={engagement.auditPeriod || engagement.fiscalYear || '2025'}
            currency={engagement.currency || 'IDR'}
            unit={engagement.presentationUnit || 'Full'}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TABS 2+: COMMERCIAL FINANCIAL STATEMENTS (SAK / SAK EP / ETAP / EMKM) */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab !== 'TB' && !isSAP && (
          <CommercialFinancialStatements 
            accounts={accounts}
            activeStatement={activeTab as 'NERACA' | 'LABA_RUGI' | 'ARUS_KAS' | 'PERUBAHAN_EKUITAS'}
            clientName={engagement.clientName}
            period={engagement.auditPeriod || engagement.fiscalYear || '2025'}
            currency={engagement.currency || 'IDR'}
            unit={engagement.presentationUnit || 'Full'}
            accountingStandard={engagement.accountingStandard || 'SAK EP'}
            onGoToTB={() => setActiveTab('TB')}
          />
        )}

      </div>

      {/* ── RESET DATA CONFIRMATION MODAL ── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reset / Bersihkan Seluruh Data?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tindakan ini akan <strong>menghapus seluruh {accounts.length} akun Neraca Saldo</strong> dan mengosongkan seluruh pemetaan Laporan Keuangan pada perikatan <strong>{engagement.clientName}</strong>. Data mock / pengujian akan dibersihkan kembali ke status kosong.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmResetData}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Ya, Bersihkan Semua Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXCEL IMPORT MODAL ── */}
      <ExcelImportModal 
        isOpen={showImport} 
        onClose={() => setShowImport(false)} 
        onImportComplete={(data) => {
          setShowImport(false);
          setDuplicateWarning(true);
          showToast('File Excel/CSV berhasil diimpor!');
          setTimeout(() => setDuplicateWarning(false), 5000);
        }}
        title="Import Data Trial Balance & Laporan Keuangan"
      />

    </div>
  );
};

export default TrialBalance;
