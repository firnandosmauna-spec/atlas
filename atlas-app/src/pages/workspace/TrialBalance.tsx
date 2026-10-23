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
  CheckCircle2
} from 'lucide-react';
import ExcelImportModal from '../../components/ExcelImportModal';
import ExportMenu from '../../components/ExportMenu';
import { GovernmentFinancialStatements } from '../../components/financial-statements/GovernmentFinancialStatements';
import { 
  SAP_GROUPS, 
  SAP_SUBGROUPS, 
  SAP_SAMPLE_TRIAL_BALANCE,
  calculateLO,
  calculateLRA,
  calculateLAK,
  calculateLPSAL
} from '../../utils/sapFinancialStatements';

type ActiveTab = 'TB' | 'LO' | 'LRA' | 'LAK' | 'LPSAL';

const ALL_GROUPS = [
  ...SAP_GROUPS,
  'Aset Lancar',
  'Aset Tetap',
  'Liabilitas',
  'Pendapatan',
  'Beban'
];

const TrialBalance: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const updateEngagement = useEngagementStore(state => state.updateEngagement);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('TB');
  const [accounts, setAccounts] = useState<Account[]>(engagement.trialBalance || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [showImport, setShowImport] = useState(false);
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

  const handleOpenImport = () => {
    setShowImport(true);
  };

  const handleAddManual = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      code: '',
      name: '',
      group: 'Pendapatan-LO',
      subGroup: 'Pendapatan Asli Daerah (PAD) - LO',
      statementType: 'LO',
      debit: 0,
      credit: 0,
      endingBalance: 0,
      budget: 0
    };
    setAccounts([newAccount, ...accounts]);
  };

  const handleLoadSAPTemplate = () => {
    setAccounts(SAP_SAMPLE_TRIAL_BALANCE);
    showToast('Template standar SAP (PP 71/2010) dengan laporan LO, LRA, LAK, dan LPSAL berhasil dimuat!');
  };

  const handleEditAccount = (id: string, field: keyof Account, value: any) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const updated = { ...acc, [field]: value };
        if (field === 'debit' || field === 'credit') {
          updated.endingBalance = (Number(updated.debit) || 0) - (Number(updated.credit) || 0);
        }
        if (field === 'group') {
          const defaultSub = SAP_SUBGROUPS[value]?.[0] || '';
          updated.subGroup = defaultSub;
          if (value === 'Pendapatan-LO' || value === 'Beban-LO') updated.statementType = 'LO';
          else if (value === 'Pendapatan-LRA' || value === 'Belanja-LRA' || value === 'Pembiayaan-LRA') updated.statementType = 'LRA';
          else if (value === 'Arus Kas / Transitoris') updated.statementType = 'LAK';
          else if (value === 'Saldo Anggaran Lebih') updated.statementType = 'LPSAL';
          else updated.statementType = 'Neraca';
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
  const totalDebit = accounts.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = accounts.reduce((sum, acc) => sum + acc.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 1;
  
  const lo = calculateLO(accounts);
  const lra = calculateLRA(accounts);
  const lak = calculateLAK(accounts, lra);
  const lpsal = calculateLPSAL(accounts, lra.silpa);

  const tabs: { id: ActiveTab; label: string; icon: any; count?: number; badge?: string }[] = [
    { id: 'TB', label: 'Neraca Saldo (Trial Balance)', icon: Calculator, count: accounts.length },
    { id: 'LO', label: 'LO (Laporan Operasional)', icon: TrendingUp, badge: 'Akrual' },
    { id: 'LRA', label: 'LRA (Realisasi Anggaran)', icon: BarChart3, badge: 'Kas' },
    { id: 'LAK', label: 'LAK (Laporan Arus Kas)', icon: DollarSign, badge: 'Direct' },
    { id: 'LPSAL', label: 'LPSAL (Perubahan SAL)', icon: FileText, badge: 'SiLPA' },
  ];

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
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                SAP PP 71/2010 & PELITA
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              {engagement.clientName} | Periode: {engagement.auditPeriod || engagement.fiscalYear || '2025'} 
              <span className="mx-1.5 text-slate-300">|</span> Standar: <strong className="text-slate-800">{engagement.accountingStandard || 'SAP'}</strong>
              <span className="mx-1.5 text-slate-300">|</span> Mata Uang: <strong className="text-slate-800">{engagement.currency}</strong> ({engagement.presentationUnit})
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap">
          <button 
            onClick={handleLoadSAPTemplate} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-atlas-blue border border-blue-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Muat data contoh neraca saldo SAP lengkap untuk LO, LRA, LAK, dan LPSAL"
          >
            <Sparkles size={14} className="text-blue-600" />
            <span className="hidden sm:inline">Muat Template SAP</span>
            <span className="sm:hidden">Template SAP</span>
          </button>

          <button 
            onClick={handleOpenImport} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200"
          >
            <Upload size={14} />
            <span>Import Excel</span>
          </button>

          <button 
            onClick={handleAddManual} 
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah Akun</span>
          </button>

          <ExportMenu worksheetCode="TrialBalance" clientName={engagement?.clientName} />

          <button 
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
        {!isBalanced && (
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

      {/* ── SEGMENTED NAVIGATION TABS (TB, LO, LRA, LAK, LPSAL) ── */}
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

              <div className={`col-span-2 lg:col-span-1 rounded-lg p-2.5 flex items-center justify-center font-bold text-xs uppercase tracking-wider border ${
                isBalanced 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {isBalanced ? '✓ NERACA SEIMBANG' : '⚠ TIDAK SEIMBANG'}
              </div>
            </div>

            {/* Filter Search */}
            <div className="flex items-center space-x-3 bg-white p-2.5 border border-slate-200/90 rounded-lg shadow-2xs">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari kode akun, nama akun, atau jenis laporan (LO, LRA, LAK, LPSAL)..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/60 focus:bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-atlas-blue"
                />
              </div>
            </div>

            {/* Main Table Trial Balance */}
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[950px]">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-3.5 py-2.5 w-32">Kode Akun</th>
                      <th className="px-3.5 py-2.5">Nama Akun</th>
                      <th className="px-3.5 py-2.5 w-36">Laporan SAP</th>
                      <th className="px-3.5 py-2.5 w-44">Kelompok (Group)</th>
                      <th className="px-3.5 py-2.5 w-48">Sub Kelompok</th>
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
                      (a.statementType && a.statementType.toLowerCase().includes(searchTerm.toLowerCase()))
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
                            value={acc.statementType || 'LO'}
                            onChange={(e) => handleEditAccount(acc.id, 'statementType', e.target.value)}
                          >
                            <option value="LO">LO (Operasional)</option>
                            <option value="LRA">LRA (Anggaran)</option>
                            <option value="LAK">LAK (Arus Kas)</option>
                            <option value="LPSAL">LPSAL (SAL)</option>
                            <option value="Neraca">Neraca</option>
                          </select>
                        </td>
                        <td className="px-3.5 py-2">
                          <select 
                            className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] focus:border-atlas-blue outline-none bg-slate-50/60"
                            value={acc.group}
                            onChange={(e) => handleEditAccount(acc.id, 'group', e.target.value)}
                          >
                            <option value="">-- Pilih Group --</option>
                            {ALL_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
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
                        <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Calculator size={28} className="text-slate-300" />
                            <p className="font-bold text-slate-800 text-sm">Belum Ada Akun di Neraca Saldo</p>
                            <p className="text-xs text-slate-400 max-w-md">
                              Klik tombol <strong>"Muat Template SAP"</strong> di kanan atas untuk memuat akun standar lengkap SAP PP 71/2010 (LO, LRA, LAK, LPSAL), atau gunakan Import Excel untuk mengunggah neraca saldo klien.
                            </p>
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
        {/* TABS 2-5: GOVERNMENT FINANCIAL STATEMENTS (LO, LRA, LAK, LPSAL)     */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab !== 'TB' && (
          <GovernmentFinancialStatements 
            accounts={accounts}
            activeStatement={activeTab}
            clientName={engagement.clientName}
            period={engagement.auditPeriod || engagement.fiscalYear || '2025'}
            currency={engagement.currency || 'IDR'}
            unit={engagement.presentationUnit || 'Full'}
          />
        )}

      </div>

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
