import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  RotateCcw, 
  Check, 
  X, 
  Info, 
  Eye, 
  ArrowRight, 
  Building2, 
  User, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import type { PmpjClientRegister, PmpjTransactionMonitoring, PmpjSummaryMetrics } from '../types/pmpj';
import { INITIAL_PMPJ_REGISTERS, INITIAL_PMPJ_MONITORING } from '../constants/initialPmpjData';
import { 
  calculatePmkScope, 
  calculateIsPmpjActive, 
  calculateCddStatus, 
  calculateRetentionUntil, 
  calculateAlertMenular, 
  formatRupiahPmpj 
} from '../utils/pmpjCalculations';

const STORAGE_KEY_PMPJ_REGISTERS = 'atlas_pmpj_registers';
const STORAGE_KEY_PMPJ_MONITORING = 'atlas_pmpj_monitoring';

const Pmpj: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'register' | 'pemantauan'>('ringkasan');
  const [registers, setRegisters] = useState<PmpjClientRegister[]>([]);
  const [monitoringList, setMonitoringList] = useState<PmpjTransactionMonitoring[]>([]);
  
  // Search & Filters for Register
  const [registerSearch, setRegisterSearch] = useState('');
  const [filterUserType, setFilterUserType] = useState('Semua');
  const [filterRisk, setFilterRisk] = useState('Semua');
  const [filterCdd, setFilterCdd] = useState('Semua');

  // Search & Filters for Monitoring
  const [monitoringSearch, setMonitoringSearch] = useState('');
  const [filterTkm, setFilterTkm] = useState('Semua');

  // Modals
  const [isAddRegisterOpen, setIsAddRegisterOpen] = useState(false);
  const [editingRegister, setEditingRegister] = useState<PmpjClientRegister | null>(null);
  const [isAddMonitoringOpen, setIsAddMonitoringOpen] = useState(false);
  const [viewingRegisterDetail, setViewingRegisterDetail] = useState<PmpjClientRegister | null>(null);

  // New Register Form State
  const [regForm, setRegForm] = useState<Partial<PmpjClientRegister>>({
    clientId: '',
    engagementId: '',
    startDate: new Date().toISOString().split('T')[0],
    clientName: '',
    userType: 'Korporasi',
    serviceType: 'Audit Umum Laporan Keuangan',
    isForUserInterest: true,
    triggerBusinessRelation: true,
    triggerLargeTx: true,
    triggerSuspiciousTx: false,
    triggerDoubtfulInfo: false,
    legalIdentity: '',
    birthOrEstablishment: '',
    addressContact: '',
    businessSector: '',
    fundSource: '',
    txPurpose: '',
    representativeDoc: '',
    boInfo: '',
    docStatus: 'Lengkap',
    isDirectMeeting: true,
    verificationStatus: 'Terverifikasi',
    internalRisk: 'Sedang',
    acceptanceDecision: 'Diterima',
    followUpMitigation: '',
    relationEndDate: '2026-12-31',
    reviewer: 'Fridolinus Peno',
    reviewDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // New Monitoring Form State
  const [monForm, setMonForm] = useState<Partial<PmpjTransactionMonitoring>>({
    monitoringId: '',
    clientId: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    amount: 100000000,
    paymentMethod: 'Transfer Bank',
    counterparty: '',
    purpose: '',
    matchesCddProfile: true,
    isSuspicious: false,
    inPmpjScope: true,
    followUpStatus: 'Normal',
    reviewer: 'Fridolinus Peno',
    reviewerDecision: 'Diterima',
    isRelationTerminated: false,
    ppatkReportStatus: 'Tidak Perlu',
    ppatkRefNumber: '',
    reviewDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // 1. Load initial data from localStorage or fallback
  useEffect(() => {
    try {
      const storedRegs = localStorage.getItem(STORAGE_KEY_PMPJ_REGISTERS);
      if (storedRegs) {
        setRegisters(JSON.parse(storedRegs));
      } else {
        setRegisters(INITIAL_PMPJ_REGISTERS);
        localStorage.setItem(STORAGE_KEY_PMPJ_REGISTERS, JSON.stringify(INITIAL_PMPJ_REGISTERS));
      }

      const storedMon = localStorage.getItem(STORAGE_KEY_PMPJ_MONITORING);
      if (storedMon) {
        setMonitoringList(JSON.parse(storedMon));
      } else {
        setMonitoringList(INITIAL_PMPJ_MONITORING);
        localStorage.setItem(STORAGE_KEY_PMPJ_MONITORING, JSON.stringify(INITIAL_PMPJ_MONITORING));
      }
    } catch (e) {
      console.error('Error loading PMPJ data', e);
      setRegisters(INITIAL_PMPJ_REGISTERS);
      setMonitoringList(INITIAL_PMPJ_MONITORING);
    }
  }, []);

  // 2. Save updates to localStorage
  const saveRegistersToStorage = (updated: PmpjClientRegister[]) => {
    setRegisters(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PMPJ_REGISTERS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const saveMonitoringToStorage = (updated: PmpjTransactionMonitoring[]) => {
    setMonitoringList(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PMPJ_MONITORING, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Kembalikan data PMPJ ke data contoh awal KAP Fridolinus Peno?')) {
      saveRegistersToStorage(INITIAL_PMPJ_REGISTERS);
      saveMonitoringToStorage(INITIAL_PMPJ_MONITORING);
    }
  };

  // 3. Compute Summary Metrics (Image 1)
  const summaryMetrics: PmpjSummaryMetrics = useMemo(() => {
    const totalRegisteredUsers = registers.length;
    const activePmpjCount = registers.filter(r => r.isPmpjActive).length;
    const incompleteCddCount = registers.filter(r => r.cddStatus === 'Belum Lengkap').length;
    const highRiskCount = registers.filter(r => r.internalRisk === 'Tinggi').length;
    const openAlertsCount = monitoringList.filter(m => m.alertMenular !== 'NORMAL' && m.followUpStatus !== 'Selesai').length;

    return {
      totalRegisteredUsers,
      activePmpjCount,
      incompleteCddCount,
      highRiskCount,
      openAlertsCount
    };
  }, [registers, monitoringList]);

  // 4. Save/Submit Register Item
  const handleSaveRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.clientName) return;

    const pmkScope = calculatePmkScope(regForm.serviceType || '', !!regForm.isForUserInterest);
    const isPmpjActive = calculateIsPmpjActive({
      pmkScope,
      triggerBusinessRelation: !!regForm.triggerBusinessRelation,
      triggerLargeTx: !!regForm.triggerLargeTx,
      triggerSuspiciousTx: !!regForm.triggerSuspiciousTx,
      triggerDoubtfulInfo: !!regForm.triggerDoubtfulInfo
    });

    const cddStatus = calculateCddStatus({
      legalIdentity: regForm.legalIdentity || '',
      fundSource: regForm.fundSource || '',
      txPurpose: regForm.txPurpose || '',
      docStatus: regForm.docStatus || 'Lengkap',
      isDirectMeeting: regForm.isDirectMeeting ?? true,
      internalRisk: regForm.internalRisk || 'Sedang'
    });

    const retentionUntil = calculateRetentionUntil(regForm.relationEndDate || '');

    const newRecord: PmpjClientRegister = {
      id: editingRegister ? editingRegister.id : `reg-${Date.now()}`,
      clientId: regForm.clientId || `KLN-${String(registers.length + 1).padStart(3, '0')}`,
      engagementId: regForm.engagementId || `ENG-2026-${String(registers.length + 1).padStart(3, '0')}`,
      startDate: regForm.startDate || new Date().toISOString().split('T')[0],
      clientName: regForm.clientName || '',
      userType: regForm.userType || 'Korporasi',
      serviceType: regForm.serviceType || 'Audit Umum Laporan Keuangan',
      isForUserInterest: regForm.isForUserInterest ?? true,
      pmkScope,
      triggerBusinessRelation: !!regForm.triggerBusinessRelation,
      triggerLargeTx: !!regForm.triggerLargeTx,
      triggerSuspiciousTx: !!regForm.triggerSuspiciousTx,
      triggerDoubtfulInfo: !!regForm.triggerDoubtfulInfo,
      isPmpjActive,
      cddStatus,
      legalIdentity: regForm.legalIdentity || '',
      birthOrEstablishment: regForm.birthOrEstablishment || '',
      addressContact: regForm.addressContact || '',
      businessSector: regForm.businessSector || '',
      fundSource: regForm.fundSource || '',
      txPurpose: regForm.txPurpose || '',
      representativeDoc: regForm.representativeDoc || '',
      boInfo: regForm.boInfo || '',
      docStatus: regForm.docStatus || 'Lengkap',
      isDirectMeeting: regForm.isDirectMeeting ?? true,
      verificationStatus: regForm.verificationStatus || 'Terverifikasi',
      internalRisk: regForm.internalRisk || 'Sedang',
      acceptanceDecision: regForm.acceptanceDecision || 'Diterima',
      followUpMitigation: regForm.followUpMitigation || '',
      relationEndDate: regForm.relationEndDate || '',
      retentionUntil,
      reviewer: regForm.reviewer || 'Fridolinus Peno',
      reviewDate: regForm.reviewDate || new Date().toISOString().split('T')[0],
      notes: regForm.notes || ''
    };

    if (editingRegister) {
      saveRegistersToStorage(registers.map(r => r.id === editingRegister.id ? newRecord : r));
    } else {
      saveRegistersToStorage([newRecord, ...registers]);
    }

    setIsAddRegisterOpen(false);
    setEditingRegister(null);
  };

  // 5. Delete Register Item
  const handleDeleteRegister = (id: string) => {
    if (window.confirm('Hapus baris data register PMPJ ini?')) {
      saveRegistersToStorage(registers.filter(r => r.id !== id));
    }
  };

  // 6. Save Monitoring Item
  const handleSaveMonitoring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monForm.clientName || !monForm.amount) return;

    const alertMenular = calculateAlertMenular({
      amount: Number(monForm.amount),
      paymentMethod: monForm.paymentMethod || 'Transfer Bank',
      matchesCddProfile: monForm.matchesCddProfile ?? true,
      isSuspicious: !!monForm.isSuspicious,
      inPmpjScope: monForm.inPmpjScope ?? true
    });

    const newRecord: PmpjTransactionMonitoring = {
      id: `mon-${Date.now()}`,
      monitoringId: monForm.monitoringId || `PMT-${String(monitoringList.length + 1).padStart(3, '0')}`,
      clientId: monForm.clientId || 'KLN-001',
      clientName: monForm.clientName || '',
      date: monForm.date || new Date().toISOString().split('T')[0],
      amount: Number(monForm.amount),
      paymentMethod: monForm.paymentMethod || 'Transfer Bank',
      counterparty: monForm.counterparty || '',
      purpose: monForm.purpose || '',
      matchesCddProfile: monForm.matchesCddProfile ?? true,
      isSuspicious: !!monForm.isSuspicious,
      inPmpjScope: monForm.inPmpjScope ?? true,
      alertMenular,
      followUpStatus: monForm.followUpStatus || 'Normal',
      reviewer: monForm.reviewer || 'Fridolinus Peno',
      reviewerDecision: monForm.reviewerDecision || 'Diterima',
      isRelationTerminated: !!monForm.isRelationTerminated,
      ppatkReportStatus: monForm.ppatkReportStatus || 'Tidak Perlu',
      ppatkRefNumber: monForm.ppatkRefNumber || '-',
      reviewDate: monForm.reviewDate || new Date().toISOString().split('T')[0],
      notes: monForm.notes || ''
    };

    saveMonitoringToStorage([newRecord, ...monitoringList]);
    setIsAddMonitoringOpen(false);
  };

  // 7. Filtered Registers
  const filteredRegisters = useMemo(() => {
    return registers.filter(r => {
      const matchSearch = !registerSearch.trim() || 
        r.clientName.toLowerCase().includes(registerSearch.toLowerCase()) ||
        r.clientId.toLowerCase().includes(registerSearch.toLowerCase()) ||
        r.engagementId.toLowerCase().includes(registerSearch.toLowerCase());
      
      const matchType = filterUserType === 'Semua' || r.userType === filterUserType;
      const matchRisk = filterRisk === 'Semua' || r.internalRisk === filterRisk;
      const matchCdd = filterCdd === 'Semua' || r.cddStatus === filterCdd;

      return matchSearch && matchType && matchRisk && matchCdd;
    });
  }, [registers, registerSearch, filterUserType, filterRisk, filterCdd]);

  // 8. Filtered Monitoring
  const filteredMonitoring = useMemo(() => {
    return monitoringList.filter(m => {
      const matchSearch = !monitoringSearch.trim() || 
        m.clientName.toLowerCase().includes(monitoringSearch.toLowerCase()) ||
        m.counterparty.toLowerCase().includes(monitoringSearch.toLowerCase()) ||
        m.monitoringId.toLowerCase().includes(monitoringSearch.toLowerCase());

      const matchTkm = filterTkm === 'Semua' || 
        (filterTkm === 'TKM' && m.isSuspicious) ||
        (filterTkm === 'Alert' && m.alertMenular !== 'NORMAL');

      return matchSearch && matchTkm;
    });
  }, [monitoringList, monitoringSearch, filterTkm]);

  // Open Edit Modal
  const openEditModal = (r: PmpjClientRegister) => {
    setEditingRegister(r);
    setRegForm({ ...r });
    setIsAddRegisterOpen(true);
  };

  return (
    <div className="w-full font-sans min-w-0 space-y-3.5 pb-12">
      
      {/* HEADER SECTION (EXCEL / KAP WORKBOOK STYLE MODERN) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
              PMPJ KAP FRIDOLINUS PENO
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80 font-mono">
              PMK No. 55/PMK.01/2017 & PPATK
            </span>
          </div>
          <p className="text-xs text-slate-500 italic mt-0.5">
            Ringkasan register dan pemantauan PMPJ. Mulai dari Register PMPJ.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetData}
            title="Kembalikan data default KAP Fridolinus Peno"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          {activeTab === 'register' && (
            <button
              type="button"
              onClick={() => {
                setEditingRegister(null);
                setRegForm({
                  clientId: `KLN-${String(registers.length + 1).padStart(3, '0')}`,
                  engagementId: `ENG-2026-${String(registers.length + 1).padStart(3, '0')}`,
                  startDate: new Date().toISOString().split('T')[0],
                  clientName: '',
                  userType: 'Korporasi',
                  serviceType: 'Audit Umum Laporan Keuangan',
                  isForUserInterest: true,
                  triggerBusinessRelation: true,
                  triggerLargeTx: true,
                  triggerSuspiciousTx: false,
                  triggerDoubtfulInfo: false,
                  legalIdentity: '',
                  birthOrEstablishment: '',
                  addressContact: '',
                  businessSector: '',
                  fundSource: '',
                  txPurpose: '',
                  representativeDoc: '',
                  boInfo: '',
                  docStatus: 'Lengkap',
                  isDirectMeeting: true,
                  verificationStatus: 'Terverifikasi',
                  internalRisk: 'Sedang',
                  acceptanceDecision: 'Diterima',
                  followUpMitigation: '',
                  relationEndDate: '2026-12-31',
                  reviewer: 'Fridolinus Peno',
                  reviewDate: new Date().toISOString().split('T')[0],
                  notes: ''
                });
                setIsAddRegisterOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
            >
              <Plus size={14} />
              <span>+ Register Klien Baru</span>
            </button>
          )}

          {activeTab === 'pemantauan' && (
            <button
              type="button"
              onClick={() => {
                setMonForm({
                  monitoringId: `PMT-${String(monitoringList.length + 1).padStart(3, '0')}`,
                  clientId: registers[0]?.clientId || 'KLN-001',
                  clientName: registers[0]?.clientName || '',
                  date: new Date().toISOString().split('T')[0],
                  amount: 100000000,
                  paymentMethod: 'Tunai',
                  counterparty: '',
                  purpose: '',
                  matchesCddProfile: false,
                  isSuspicious: true,
                  inPmpjScope: true,
                  followUpStatus: 'Klarifikasi Klien',
                  reviewer: 'Fridolinus Peno',
                  reviewerDecision: 'Minta Bukti Tambahan',
                  isRelationTerminated: false,
                  ppatkReportStatus: 'Draft GRIPS',
                  ppatkRefNumber: '',
                  reviewDate: new Date().toISOString().split('T')[0],
                  notes: ''
                });
                setIsAddMonitoringOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
            >
              <Plus size={14} />
              <span>+ Catat Transaksi Terpantau</span>
            </button>
          )}
        </div>
      </div>

      {/* SEGMENTED TAB CONTROL BAR */}
      <div className="flex p-1 bg-slate-200/50 rounded-xl border border-slate-200/70 overflow-x-auto scrollbar-none text-xs font-medium gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('ringkasan')}
          className={`flex items-center gap-2 py-1.5 px-4 rounded-lg whitespace-nowrap transition-all text-xs font-semibold ${
            activeTab === 'ringkasan'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Info size={14} className={activeTab === 'ringkasan' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Ringkasan & Panduan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 py-1.5 px-4 rounded-lg whitespace-nowrap transition-all text-xs font-semibold ${
            activeTab === 'register'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <FileSpreadsheet size={14} className={activeTab === 'register' ? 'text-indigo-600' : 'text-slate-400'} />
          <span>Register Pengguna Jasa PMPJ ({registers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pemantauan')}
          className={`flex items-center gap-2 py-1.5 px-4 rounded-lg whitespace-nowrap transition-all text-xs font-semibold ${
            activeTab === 'pemantauan'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <ShieldCheck size={14} className={activeTab === 'pemantauan' ? 'text-rose-600' : 'text-slate-400'} />
          <span>Pemantauan Transaksi & Tindak Lanjut ({monitoringList.length})</span>
          {summaryMetrics.openAlertsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
              {summaryMetrics.openAlertsCount} Alert
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RINGKASAN & PANDUAN PMPJ (SESUAI GAMBAR 1) */}
      {/* ========================================================================= */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-3.5">
          
          {/* Card Ringkasan & Cara Pakai */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            
            {/* Table Header Biru Dongker Gelap Sesuai Gambar 1 */}
            <div className="bg-[#1e3a6a] text-white px-4 py-2 text-xs font-bold tracking-wider">
              Ringkasan
            </div>

            {/* TABEL RINGKASAN INDIKATOR (GAMBAR 1) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1e3a6a] text-white border-t border-blue-900 text-xs font-bold">
                    <th className="px-4 py-2 w-2/3 border-r border-blue-800">Indikator</th>
                    <th className="px-4 py-2 w-1/3 text-center">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800">Pengguna jasa terdaftar</td>
                    <td className="px-4 py-2 text-center font-bold font-mono text-slate-900 bg-sky-50/40">
                      {summaryMetrics.totalRegisteredUsers}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800">PMPJ aktif</td>
                    <td className="px-4 py-2 text-center font-bold font-mono text-slate-900 bg-sky-50/40">
                      {summaryMetrics.activePmpjCount}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800">CDD belum lengkap</td>
                    <td className={`px-4 py-2 text-center font-bold font-mono bg-sky-50/40 ${summaryMetrics.incompleteCddCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {summaryMetrics.incompleteCddCount}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800">Risiko tinggi</td>
                    <td className={`px-4 py-2 text-center font-bold font-mono bg-sky-50/40 ${summaryMetrics.highRiskCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {summaryMetrics.highRiskCount}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800">Alert transaksi terbuka</td>
                    <td className={`px-4 py-2 text-center font-bold font-mono bg-sky-50/40 ${summaryMetrics.openAlertsCount > 0 ? 'text-rose-700 font-black' : 'text-slate-900'}`}>
                      {summaryMetrics.openAlertsCount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TABEL CARA PAKAI (GAMBAR 1) */}
            <div className="bg-[#d9e5f5] text-slate-900 px-4 py-1.5 text-xs font-bold border-t border-slate-300">
              Cara pakai
            </div>

            <div className="p-3.5 sm:p-5 space-y-2 text-xs text-slate-800 bg-white">
              <div className="flex items-start gap-4 py-1 border-b border-slate-100">
                <span className="w-6 font-bold text-slate-900 shrink-0 font-mono text-sm text-right">1</span>
                <p className="leading-relaxed">Isi satu baris per pengguna jasa/perikatan.</p>
              </div>

              <div className="flex items-start gap-4 py-1 border-b border-slate-100">
                <span className="w-6 font-bold text-slate-900 shrink-0 font-mono text-sm text-right">2</span>
                <p className="leading-relaxed">Pilih jenis jasa dan tandai pemicu. Kolom ruang lingkup dan PMPJ aktif terhitung otomatis.</p>
              </div>

              <div className="flex items-start gap-4 py-1 border-b border-slate-100">
                <span className="w-6 font-bold text-slate-900 shrink-0 font-mono text-sm text-right">3</span>
                <p className="leading-relaxed">Lengkapi identitas, sumber dana, tujuan, BO/wakil, dan verifikasi.</p>
              </div>

              <div className="flex items-start gap-4 py-1 border-b border-slate-100">
                <span className="w-6 font-bold text-slate-900 shrink-0 font-mono text-sm text-right">4</span>
                <p className="leading-relaxed">Tetapkan risiko internal dan keputusan penerimaan.</p>
              </div>

              <div className="flex items-start gap-4 py-1">
                <span className="w-6 font-bold text-slate-900 shrink-0 font-mono text-sm text-right">5</span>
                <p className="leading-relaxed">Catat transaksi yang perlu dipantau di tab Pemantauan.</p>
              </div>
            </div>

            {/* YELLOW WARNING NOTE SESUAI GAMBAR 1 */}
            <div className="bg-[#fef3c7] text-[#92400e] px-4 py-3 text-xs font-medium border-t border-amber-300 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>
                Batasi akses workbook. Simpan dokumen identitas dan laporan sensitif pada repositori KAP yang disetujui.
              </span>
            </div>

          </div>

          {/* QUICK SHORTCUTS CARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div 
              onClick={() => setActiveTab('register')}
              className="bg-white hover:bg-slate-50 p-4 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                    Buka Register Pengguna Jasa
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {registers.length} Pengguna Jasa Terdaftar · Form CDD Lengkap
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <div 
              onClick={() => setActiveTab('pemantauan')}
              className="bg-white hover:bg-slate-50 p-4 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-rose-600 transition-colors">
                    Buka Pemantauan Transaksi & LTKM
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {monitoringList.length} Transaksi Terpantau · Pelaporan PPATK GRIPS
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REGISTER PENGGUNA JASA PMPJ (SESUAI GAMBAR 2, 3, 4) */}
      {/* ========================================================================= */}
      {activeTab === 'register' && (
        <div className="space-y-3.5">
          
          {/* Subtitle Instruksi Persis Gambar 2 */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-3 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
              <Info size={13} className="text-blue-600" />
              <span>Petunjuk Pengisian Register PMPJ</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              Satu baris per pengguna jasa/perikatan. Kolom kuning (<span className="bg-[#fef9c3] px-1 py-0.2 rounded border border-amber-300 font-semibold text-slate-800">kuning</span>) diisi manual. Kolom biru (<span className="bg-[#e0f2fe] px-1 py-0.2 rounded border border-sky-300 font-semibold text-slate-800">biru</span>) dihitung otomatis oleh sistem. Untuk lebih detil (BO/wakil), cantumkan nama dan dasar kendali/posisi dalam kolom informasi BO.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2 text-slate-400" size={13} />
              <input 
                type="text" 
                value={registerSearch}
                onChange={e => setRegisterSearch(e.target.value)}
                placeholder="Cari ID, Klien, atau Perikatan..." 
                className="w-full pl-7 pr-2.5 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 font-medium">Bentuk:</span>
                <select 
                  value={filterUserType} 
                  onChange={e => setFilterUserType(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  <option value="Semua">Semua Bentuk</option>
                  <option value="Korporasi">Korporasi</option>
                  <option value="Perorangan">Perorangan</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 font-medium">Risiko:</span>
                <select 
                  value={filterRisk} 
                  onChange={e => setFilterRisk(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  <option value="Semua">Semua Risiko</option>
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 font-medium">Status CDD:</span>
                <select 
                  value={filterCdd} 
                  onChange={e => setFilterCdd(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  <option value="Semua">Semua CDD</option>
                  <option value="Lengkap">Lengkap</option>
                  <option value="Belum Lengkap">Belum Lengkap</option>
                  <option value="Ditingkatkan (EDD)">EDD</option>
                </select>
              </div>
            </div>
          </div>

          {/* MAIN REGISTER MASTER SPREADSHEET TABLE (GAMBAR 2, 3, 4) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            
            {/* Header Biru Dongker Gelap Sesuai Gambar 2 */}
            <div className="bg-[#1e3a6a] text-white px-3.5 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black tracking-wider uppercase">
                  REGISTER PENGGUNA JASA PMPJ
                </h2>
                <span className="text-[10px] text-blue-200 uppercase font-mono font-medium block">
                  IDENTIFIKASI, PEMICU, DAN KEPUTUSAN
                </span>
              </div>
              <span className="text-[10px] bg-blue-800/80 px-2 py-0.5 rounded border border-blue-700 font-mono">
                {filteredRegisters.length} Baris
              </span>
            </div>

            {/* Scrollable Spreadsheet Table with Color Coding */}
            <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead className="sticky top-0 z-20 bg-[#1e3a6a] text-white text-[10px] font-bold uppercase tracking-wider divide-x divide-blue-800">
                  <tr>
                    {/* Sticky Column: ID & Nama */}
                    <th className="px-3 py-2.5 sticky left-0 z-30 bg-[#1e3a6a] border-r border-blue-800 shadow-xs">Aksi</th>
                    <th className="px-3 py-2.5 sticky left-[60px] z-30 bg-[#1e3a6a] border-r border-blue-800 shadow-xs">ID Klien</th>
                    <th className="px-3 py-2.5">ID Perikatan</th>
                    <th className="px-3 py-2.5">Tanggal Mulai</th>
                    <th className="px-3 py-2.5 sticky left-[130px] z-30 bg-[#1e3a6a] border-r border-blue-800 shadow-xs">Nama Pengguna Jasa</th>
                    <th className="px-3 py-2.5">Jenis Pengguna</th>
                    <th className="px-3 py-2.5">Jenis Jasa</th>
                    <th className="px-3 py-2.5">Untuk/Kepentingan?</th>
                    
                    {/* Kolom Biru Otomatis (Gambar 2) */}
                    <th className="px-3 py-2.5 bg-sky-900/90 text-sky-100">Ruang Lingkup PMK Pasal 2 (Auto)</th>
                    <th className="px-3 py-2.5">Pemicu Hubungan Usaha</th>
                    <th className="px-3 py-2.5">Pemicu Transaksi ≥ Rp100 Jt</th>
                    <th className="px-3 py-2.5">Pemicu Transaksi Mencurigakan</th>
                    <th className="px-3 py-2.5">Pemicu Ragu Informasi</th>
                    <th className="px-3 py-2.5 bg-sky-900/90 text-sky-100">PMPJ Aktif (Auto)</th>
                    <th className="px-3 py-2.5 bg-sky-900/90 text-sky-100">Status CDD (Auto)</th>
                    
                    {/* Gambar 3: Identitas Legal & Lapangan */}
                    <th className="px-3 py-2.5">Identitas / Data Legal</th>
                    <th className="px-3 py-2.5">Tempat-Tgl Lahir / Pendirian</th>
                    <th className="px-3 py-2.5">Alamat dan Kontak</th>
                    <th className="px-3 py-2.5">Pekerjaan / Bidang Usaha</th>
                    <th className="px-3 py-2.5">Sumber Dana</th>
                    <th className="px-3 py-2.5">Tujuan Transaksi</th>
                    <th className="px-3 py-2.5">Wakil & Dokumen Wewenang</th>
                    <th className="px-3 py-2.5">Informasi BO & Kendali</th>
                    <th className="px-3 py-2.5">Status Dokumen</th>
                    <th className="px-3 py-2.5 text-center">Pertemuan Langsung Awal</th>
                    <th className="px-3 py-2.5">Status Verifikasi</th>
                    <th className="px-3 py-2.5">Risiko Internal</th>

                    {/* Gambar 4: Keputusan & Retensi */}
                    <th className="px-3 py-2.5">Keputusan Penerimaan</th>
                    <th className="px-3 py-2.5">Tindak Lanjut / Mitigasi</th>
                    <th className="px-3 py-2.5">Tanggal Akhir Hubungan</th>
                    <th className="px-3 py-2.5 bg-sky-900/90 text-sky-100">Simpan Dokumen Sampai (Auto)</th>
                    <th className="px-3 py-2.5">Reviewer</th>
                    <th className="px-3 py-2.5">Tanggal Review</th>
                    <th className="px-3 py-2.5">Catatan</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 font-sans">
                  {filteredRegisters.length === 0 ? (
                    <tr>
                      <td colSpan={33} className="p-8 text-center text-slate-500 text-xs">
                        Belum ada data register PMPJ. Klik "+ Register Klien Baru" untuk menambahkan.
                      </td>
                    </tr>
                  ) : (
                    filteredRegisters.map((reg) => (
                      <tr key={reg.id} className="hover:bg-amber-50/40 transition-colors">
                        
                        {/* Aksi Sticky */}
                        <td className="px-2 py-1.5 sticky left-0 z-10 bg-white border-r border-slate-200">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(reg)}
                              title="Edit Register"
                              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteRegister(reg.id)}
                              title="Hapus"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>

                        {/* ID Klien Sticky */}
                        <td className="px-3 py-1.5 font-mono font-bold text-slate-900 sticky left-[60px] z-10 bg-white border-r border-slate-200">
                          {reg.clientId}
                        </td>

                        <td className="px-3 py-1.5 font-mono text-slate-600 bg-[#fefce8]">
                          {reg.engagementId}
                        </td>

                        <td className="px-3 py-1.5 font-mono text-slate-600 bg-[#fefce8]">
                          {reg.startDate}
                        </td>

                        {/* Nama Pengguna Jasa Sticky */}
                        <td className="px-3 py-1.5 font-bold text-slate-900 sticky left-[130px] z-10 bg-white border-r border-slate-200 shadow-2xs">
                          {reg.clientName}
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {reg.userType}
                          </span>
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8] text-slate-800">
                          {reg.serviceType}
                        </td>

                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {reg.isForUserInterest ? (
                            <span className="text-emerald-700 font-bold">Ya</span>
                          ) : (
                            <span className="text-slate-400">Tidak</span>
                          )}
                        </td>

                        {/* Kolom Biru: Ruang Lingkup PMK Pasal 2 (Auto) */}
                        <td className="px-3 py-1.5 font-bold bg-[#e0f2fe] text-blue-900">
                          {reg.pmkScope}
                        </td>

                        {/* Pemicu-pemicu */}
                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {reg.triggerBusinessRelation ? <span className="text-emerald-600 font-bold">Ya</span> : '-'}
                        </td>
                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {reg.triggerLargeTx ? <span className="text-amber-700 font-bold">Ya (≥100Jt)</span> : '-'}
                        </td>
                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {reg.triggerSuspiciousTx ? <span className="text-rose-600 font-bold">Ya (TKM)</span> : '-'}
                        </td>
                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {reg.triggerDoubtfulInfo ? <span className="text-rose-600 font-bold">Ya</span> : '-'}
                        </td>

                        {/* Kolom Biru: PMPJ Aktif (Auto) */}
                        <td className="px-3 py-1.5 font-bold text-center bg-[#e0f2fe]">
                          {reg.isPmpjActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Aktif
                            </span>
                          ) : (
                            <span className="text-slate-400">Tidak Aktif</span>
                          )}
                        </td>

                        {/* Kolom Biru: Status CDD (Auto) */}
                        <td className="px-3 py-1.5 font-bold bg-[#e0f2fe]">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            reg.cddStatus === 'Lengkap' ? 'bg-emerald-100 text-emerald-800' :
                            reg.cddStatus === 'Ditingkatkan (EDD)' ? 'bg-purple-100 text-purple-800' :
                            reg.cddStatus === 'Sederhana' ? 'bg-blue-100 text-blue-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {reg.cddStatus}
                          </span>
                        </td>

                        {/* Legal Data */}
                        <td className="px-3 py-1.5 font-mono text-[11px] text-slate-700 bg-[#fefce8]">
                          {reg.legalIdentity || '-'}
                        </td>

                        <td className="px-3 py-1.5 text-slate-700 bg-[#fefce8]">
                          {reg.birthOrEstablishment || '-'}
                        </td>

                        <td className="px-3 py-1.5 text-slate-700 bg-[#fefce8] max-w-xs truncate" title={reg.addressContact}>
                          {reg.addressContact || '-'}
                        </td>

                        <td className="px-3 py-1.5 text-slate-700 bg-[#fefce8]">
                          {reg.businessSector || '-'}
                        </td>

                        <td className="px-3 py-1.5 text-slate-700 bg-[#fefce8]">
                          {reg.fundSource || '-'}
                        </td>

                        <td className="px-3 py-1.5 text-slate-700 bg-[#fefce8]">
                          {reg.txPurpose || '-'}
                        </td>

                        <td className="px-3 py-1.5 text-slate-700 bg-[#fefce8]">
                          {reg.representativeDoc || '-'}
                        </td>

                        <td className="px-3 py-1.5 text-slate-700 bg-[#fefce8] max-w-xs truncate" title={reg.boInfo}>
                          {reg.boInfo || '-'}
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8]">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            reg.docStatus === 'Lengkap' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {reg.docStatus}
                          </span>
                        </td>

                        {/* Pertemuan Langsung Awal (Gambar 3 - dengan ikon peringatan jika non tatap muka) */}
                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {reg.isDirectMeeting ? (
                            <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              Tatap Muka
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-2xs animate-pulse">
                              <AlertTriangle size={13} className="text-amber-700" />
                              <span>Non Tatap Muka (EDD)</span>
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8] font-medium text-slate-800">
                          {reg.verificationStatus}
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8]">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            reg.internalRisk === 'Rendah' ? 'bg-emerald-100 text-emerald-800' :
                            reg.internalRisk === 'Sedang' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800 font-black'
                          }`}>
                            {reg.internalRisk}
                          </span>
                        </td>

                        {/* Keputusan Penerimaan (Gambar 4) */}
                        <td className="px-3 py-1.5 bg-[#fefce8] font-semibold text-slate-900">
                          {reg.acceptanceDecision}
                        </td>

                        <td className="px-3 py-1.5 text-slate-600 bg-[#fefce8] max-w-xs truncate" title={reg.followUpMitigation}>
                          {reg.followUpMitigation || '-'}
                        </td>

                        <td className="px-3 py-1.5 font-mono text-slate-600 bg-[#fefce8]">
                          {reg.relationEndDate || '-'}
                        </td>

                        {/* Kolom Biru: Simpan Dokumen Sampai (Auto: Tanggal Akhir + 5 Thn) */}
                        <td className="px-3 py-1.5 font-bold font-mono bg-[#e0f2fe] text-blue-900">
                          {reg.retentionUntil}
                        </td>

                        <td className="px-3 py-1.5 font-medium text-slate-800 bg-[#fefce8]">
                          {reg.reviewer}
                        </td>

                        <td className="px-3 py-1.5 font-mono text-slate-600 bg-[#fefce8]">
                          {reg.reviewDate}
                        </td>

                        <td className="px-3 py-1.5 text-slate-500 italic bg-[#fefce8] max-w-xs truncate" title={reg.notes}>
                          {reg.notes || '-'}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PEMANTAUAN TRANSAKSI DAN TINDAK LANJUT (SESUAI GAMBAR 5) */}
      {/* ========================================================================= */}
      {activeTab === 'pemantauan' && (
        <div className="space-y-3.5">
          
          {/* Subtitle Instruksi Persis Gambar 5 */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-3 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-rose-600" />
              <span>Petunjuk Pemantauan Transaksi Keuangan</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              Catatan transaksi yang dipantau selama perikatan. Tindak lanjuti jika ada indikasi TKM (Transaksi Keuangan Mencurigakan). Dapat dilaporkan ke PPATK melalui aplikasi GRIPS jika telah sesuai kriteria pelaporan.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2 text-slate-400" size={13} />
              <input 
                type="text" 
                value={monitoringSearch}
                onChange={e => setMonitoringSearch(e.target.value)}
                placeholder="Cari ID Pemantauan, Klien, Pihak Terkait..." 
                className="w-full pl-7 pr-2.5 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Filter Alert:</span>
              <select 
                value={filterTkm} 
                onChange={e => setFilterTkm(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="Semua">Semua Transaksi</option>
                <option value="Alert">Alert Terbuka</option>
                <option value="TKM">Hanya TKM (Mencurigakan)</option>
              </select>
            </div>
          </div>

          {/* MAIN PEMANTAUAN TABLE (GAMBAR 5) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            
            {/* Header Biru Dongker Gelap Sesuai Gambar 5 */}
            <div className="bg-[#1e3a6a] text-white px-3.5 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black tracking-wider uppercase">
                  PEMANTAUAN TRANSAKSI DAN TINDAK LANJUT
                </h2>
                <span className="text-[10px] text-blue-200 uppercase font-mono block">
                  Log Transaksi Finansial, Deteksi TKM & Laporan PPATK
                </span>
              </div>
              <span className="text-[10px] bg-blue-800/80 px-2 py-0.5 rounded border border-blue-700 font-mono">
                {filteredMonitoring.length} Transaksi
              </span>
            </div>

            {/* Scrollable Table */}
            <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead className="sticky top-0 z-20 bg-[#1e3a6a] text-white text-[10px] font-bold uppercase tracking-wider divide-x divide-blue-800">
                  <tr>
                    <th className="px-3 py-2.5 sticky left-0 z-30 bg-[#1e3a6a] border-r border-blue-800">Aksi</th>
                    <th className="px-3 py-2.5 sticky left-[50px] z-30 bg-[#1e3a6a] border-r border-blue-800">ID Pemantauan</th>
                    <th className="px-3 py-2.5">ID Klien</th>
                    <th className="px-3 py-2.5 sticky left-[150px] z-30 bg-[#1e3a6a] border-r border-blue-800">Nama Pengguna Jasa</th>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5 text-right">Nilai (Rp Ekuivalen)</th>
                    <th className="px-3 py-2.5">Cara Pembayaran</th>
                    <th className="px-3 py-2.5">Pihak Pembayar/Penerima</th>
                    <th className="px-3 py-2.5">Tujuan/Keterangan</th>
                    <th className="px-3 py-2.5 text-center">Sesuai Profil/CDD</th>
                    <th className="px-3 py-2.5 text-center">Mencurigakan?</th>
                    <th className="px-3 py-2.5 text-center">Dalam Ruang Lingkup PMPJ?</th>
                    
                    {/* Kolom Biru: Alert Menular (Auto) */}
                    <th className="px-3 py-2.5 bg-sky-900/90 text-sky-100 text-center">Alert Menular (Auto)</th>

                    <th className="px-3 py-2.5">Status Tindak Lanjut</th>
                    <th className="px-3 py-2.5">Reviewer</th>
                    <th className="px-3 py-2.5">Keputusan Reviewer</th>
                    <th className="px-3 py-2.5 text-center">Hubungan Diakhiri?</th>
                    <th className="px-3 py-2.5">Status Pelaporan PPATK</th>
                    <th className="px-3 py-2.5">Referensi Pelaporan Terkait</th>
                    <th className="px-3 py-2.5">Tanggal Review</th>
                    <th className="px-3 py-2.5">Catatan</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 font-sans">
                  {filteredMonitoring.length === 0 ? (
                    <tr>
                      <td colSpan={21} className="p-8 text-center text-slate-500 text-xs">
                        Belum ada data pemantauan transaksi. Klik "+ Catat Transaksi Terpantau" untuk memulai.
                      </td>
                    </tr>
                  ) : (
                    filteredMonitoring.map((mon) => (
                      <tr key={mon.id} className="hover:bg-amber-50/40 transition-colors">
                        
                        {/* Aksi */}
                        <td className="px-2 py-1.5 sticky left-0 z-10 bg-white border-r border-slate-200">
                          <button
                            onClick={() => {
                              if (window.confirm('Hapus catatan pemantauan transaksi ini?')) {
                                saveMonitoringToStorage(monitoringList.filter(m => m.id !== mon.id));
                              }
                            }}
                            title="Hapus"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>

                        <td className="px-3 py-1.5 font-mono font-bold text-slate-900 sticky left-[50px] z-10 bg-white border-r border-slate-200">
                          {mon.monitoringId}
                        </td>

                        <td className="px-3 py-1.5 font-mono text-slate-600 bg-[#fefce8]">
                          {mon.clientId}
                        </td>

                        <td className="px-3 py-1.5 font-bold text-slate-900 sticky left-[150px] z-10 bg-white border-r border-slate-200 shadow-2xs">
                          {mon.clientName}
                        </td>

                        <td className="px-3 py-1.5 font-mono text-slate-600 bg-[#fefce8]">
                          {mon.date}
                        </td>

                        <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-900 bg-[#fefce8]">
                          Rp {formatRupiahPmpj(mon.amount)}
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8]">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            mon.paymentMethod === 'Tunai' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {mon.paymentMethod}
                          </span>
                        </td>

                        <td className="px-3 py-1.5 text-slate-800 bg-[#fefce8] max-w-xs truncate" title={mon.counterparty}>
                          {mon.counterparty}
                        </td>

                        <td className="px-3 py-1.5 text-slate-700 bg-[#fefce8] max-w-xs truncate" title={mon.purpose}>
                          {mon.purpose}
                        </td>

                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {mon.matchesCddProfile ? (
                            <span className="text-emerald-700 font-bold">Sesuai</span>
                          ) : (
                            <span className="text-rose-600 font-black">Tidak Sesuai</span>
                          )}
                        </td>

                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {mon.isSuspicious ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">
                              Ya (TKM)
                            </span>
                          ) : (
                            <span className="text-slate-400">Tidak</span>
                          )}
                        </td>

                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {mon.inPmpjScope ? <span className="text-blue-700 font-bold">Ya</span> : 'Tidak'}
                        </td>

                        {/* Kolom Biru: Alert Menular (Auto) */}
                        <td className="px-3 py-1.5 font-bold text-center bg-[#e0f2fe]">
                          {mon.alertMenular === 'ALERT TKM' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black animate-pulse shadow-2xs">
                              <AlertTriangle size={12} />
                              ALERT TKM
                            </span>
                          ) : mon.alertMenular === 'PERIKSA EDD' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                              PERIKSA EDD
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">NORMAL</span>
                          )}
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8] font-medium text-slate-800">
                          {mon.followUpStatus}
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8] text-slate-700 font-medium">
                          {mon.reviewer}
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8] font-bold text-slate-900">
                          {mon.reviewerDecision}
                        </td>

                        <td className="px-3 py-1.5 text-center bg-[#fefce8]">
                          {mon.isRelationTerminated ? (
                            <span className="text-rose-600 font-bold">Ya</span>
                          ) : (
                            <span className="text-slate-400">Tidak</span>
                          )}
                        </td>

                        <td className="px-3 py-1.5 bg-[#fefce8]">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            mon.ppatkReportStatus === 'Dilaporkan (LTKM)' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            mon.ppatkReportStatus === 'Draft GRIPS' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {mon.ppatkReportStatus}
                          </span>
                        </td>

                        <td className="px-3 py-1.5 font-mono text-[11px] text-slate-600 bg-[#fefce8]">
                          {mon.ppatkRefNumber || '-'}
                        </td>

                        <td className="px-3 py-1.5 font-mono text-slate-600 bg-[#fefce8]">
                          {mon.reviewDate}
                        </td>

                        <td className="px-3 py-1.5 text-slate-500 italic bg-[#fefce8] max-w-xs truncate" title={mon.notes}>
                          {mon.notes || '-'}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT REGISTER PENGGUNA JASA PMPJ */}
      {/* ========================================================================= */}
      {isAddRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            
            <div className="sticky top-0 bg-[#1e3a6a] text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-900 z-10">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-sky-300" />
                <h3 className="font-bold text-sm tracking-tight">
                  {editingRegister ? 'Edit Register Pengguna Jasa PMPJ' : 'Form Register Pengguna Jasa PMPJ Baru'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsAddRegisterOpen(false); setEditingRegister(null); }}
                className="text-blue-200 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRegister} className="p-5 space-y-4 text-xs">
              
              {/* Bagian 1: Identifikasi Klien */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-600" />
                  1. Identifikasi Pengguna Jasa & Perikatan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ID Klien</label>
                    <input 
                      type="text" 
                      value={regForm.clientId} 
                      onChange={e => setRegForm({...regForm, clientId: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                      placeholder="KLN-001"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ID Perikatan</label>
                    <input 
                      type="text" 
                      value={regForm.engagementId} 
                      onChange={e => setRegForm({...regForm, engagementId: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                      placeholder="ENG-2026-001"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Mulai Hubungan</label>
                    <input 
                      type="date" 
                      value={regForm.startDate} 
                      onChange={e => setRegForm({...regForm, startDate: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Pengguna</label>
                    <select 
                      value={regForm.userType} 
                      onChange={e => setRegForm({...regForm, userType: e.target.value as any})}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                    >
                      <option value="Korporasi">Korporasi</option>
                      <option value="Perorangan">Perorangan</option>
                      <option value="Badan Hukum Lain">Badan Hukum Lain</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Pengguna Jasa <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={regForm.clientName} 
                      onChange={e => setRegForm({...regForm, clientName: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900" 
                      placeholder="Contoh: PT Sumber Energi Mandiri"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Jasa</label>
                    <input 
                      type="text" 
                      value={regForm.serviceType} 
                      onChange={e => setRegForm({...regForm, serviceType: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium" 
                      placeholder="Contoh: Audit Umum Laporan Keuangan"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Pemicu & Ruang Lingkup PMK */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-600" />
                  2. Pemicu & Ruang Lingkup PMK No. 55/PMK.01/2017
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={regForm.triggerBusinessRelation}
                      onChange={e => setRegForm({...regForm, triggerBusinessRelation: e.target.checked})}
                      className="rounded text-blue-600"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Pemicu Hubungan Usaha</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={regForm.triggerLargeTx}
                      onChange={e => setRegForm({...regForm, triggerLargeTx: e.target.checked})}
                      className="rounded text-blue-600"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Transaksi ≥ Rp100 Juta</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={regForm.triggerSuspiciousTx}
                      onChange={e => setRegForm({...regForm, triggerSuspiciousTx: e.target.checked})}
                      className="rounded text-blue-600"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Indikasi Transaksi Mencurigakan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={regForm.triggerDoubtfulInfo}
                      onChange={e => setRegForm({...regForm, triggerDoubtfulInfo: e.target.checked})}
                      className="rounded text-blue-600"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Pemicu Ragu Informasi</span>
                  </label>
                </div>
              </div>

              {/* Bagian 3: Data Legal, BO & CDD */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                  <User size={14} className="text-blue-600" />
                  3. Dokumen Legalitas, Sumber Dana & Beneficial Owner (BO)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Identitas / Data Legal (NIK/NPWP/NIB)</label>
                    <input 
                      type="text" 
                      value={regForm.legalIdentity} 
                      onChange={e => setRegForm({...regForm, legalIdentity: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="NPWP: 01.xxx / NIB: xxx"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tempat-Tgl Lahir / Pendirian</label>
                    <input 
                      type="text" 
                      value={regForm.birthOrEstablishment} 
                      onChange={e => setRegForm({...regForm, birthOrEstablishment: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Jakarta, 12 Mei 2012"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pekerjaan / Bidang Usaha</label>
                    <input 
                      type="text" 
                      value={regForm.businessSector} 
                      onChange={e => setRegForm({...regForm, businessSector: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Pertambangan Batubara"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alamat dan Kontak</label>
                    <input 
                      type="text" 
                      value={regForm.addressContact} 
                      onChange={e => setRegForm({...regForm, addressContact: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Alamat kantor, nomor telp, email"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sumber Dana</label>
                    <input 
                      type="text" 
                      value={regForm.fundSource} 
                      onChange={e => setRegForm({...regForm, fundSource: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Hasil operasional / investasi"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tujuan Hubungan Transaksi</label>
                    <input 
                      type="text" 
                      value={regForm.txPurpose} 
                      onChange={e => setRegForm({...regForm, txPurpose: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Audit Tahunan Statutory"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Wakil & Dokumen Wewenang</label>
                    <input 
                      type="text" 
                      value={regForm.representativeDoc} 
                      onChange={e => setRegForm({...regForm, representativeDoc: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Nama Direktur / Akta Notaris"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Informasi BO & Dasar Kendali</label>
                    <input 
                      type="text" 
                      value={regForm.boInfo} 
                      onChange={e => setRegForm({...regForm, boInfo: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Pemilik manfaat akhir >25%"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 4: Verifikasi & Keputusan */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-blue-600" />
                  4. Verifikasi, Penilaian Risiko & Keputusan Penerimaan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status Dokumen</label>
                    <select 
                      value={regForm.docStatus} 
                      onChange={e => setRegForm({...regForm, docStatus: e.target.value as any})}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    >
                      <option value="Lengkap">Lengkap</option>
                      <option value="Dalam Proses">Dalam Proses</option>
                      <option value="Kurang">Kurang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pertemuan Langsung Awal</label>
                    <select 
                      value={regForm.isDirectMeeting ? 'Tatap Muka' : 'Non Tatap Muka'} 
                      onChange={e => setRegForm({...regForm, isDirectMeeting: e.target.value === 'Tatap Muka'})}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    >
                      <option value="Tatap Muka">Tatap Muka Langsung</option>
                      <option value="Non Tatap Muka">Non Tatap Muka (Wajib EDD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Risiko Internal</label>
                    <select 
                      value={regForm.internalRisk} 
                      onChange={e => setRegForm({...regForm, internalRisk: e.target.value as any})}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      <option value="Rendah">Rendah</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Tinggi">Tinggi (Wajib EDD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Keputusan Penerimaan</label>
                    <select 
                      value={regForm.acceptanceDecision} 
                      onChange={e => setRegForm({...regForm, acceptanceDecision: e.target.value as any})}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    >
                      <option value="Diterima">Diterima</option>
                      <option value="Diterima dengan Syarat">Diterima dengan Syarat</option>
                      <option value="Ditolak">Ditolak</option>
                      <option value="Hubungan Diakhiri">Hubungan Diakhiri</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tindak Lanjut / Mitigasi</label>
                    <input 
                      type="text" 
                      value={regForm.followUpMitigation} 
                      onChange={e => setRegForm({...regForm, followUpMitigation: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Langkah mitigasi risiko atau pemantauan"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Akhir Hubungan</label>
                    <input 
                      type="date" 
                      value={regForm.relationEndDate} 
                      onChange={e => setRegForm({...regForm, relationEndDate: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reviewer KAP</label>
                    <input 
                      type="text" 
                      value={regForm.reviewer} 
                      onChange={e => setRegForm({...regForm, reviewer: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium" 
                      placeholder="Fridolinus Peno"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddRegisterOpen(false); setEditingRegister(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  {editingRegister ? 'Simpan Perubahan Register' : 'Tambahkan ke Register PMPJ'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CATAT TRANSAKSI PEMANTAUAN BARU */}
      {/* ========================================================================= */}
      {isAddMonitoringOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="sticky top-0 bg-[#1e3a6a] text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-900 z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-rose-400" />
                <h3 className="font-bold text-sm tracking-tight">
                  Form Catatan Pemantauan Transaksi & Indikasi TKM
                </h3>
              </div>
              <button 
                onClick={() => setIsAddMonitoringOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMonitoring} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">ID Pemantauan</label>
                  <input 
                    type="text" 
                    value={monForm.monitoringId} 
                    onChange={e => setMonForm({...monForm, monitoringId: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pilih Pengguna Jasa</label>
                  <select
                    value={monForm.clientId}
                    onChange={e => {
                      const selected = registers.find(r => r.clientId === e.target.value);
                      setMonForm({
                        ...monForm,
                        clientId: e.target.value,
                        clientName: selected?.clientName || ''
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  >
                    {registers.map(r => (
                      <option key={r.id} value={r.clientId}>
                        {r.clientId} - {r.clientName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Transaksi</label>
                  <input 
                    type="date" 
                    value={monForm.date} 
                    onChange={e => setMonForm({...monForm, date: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nilai Transaksi (Rp Ekuivalen) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={monForm.amount} 
                    onChange={e => setMonForm({...monForm, amount: Number(e.target.value)})}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900" 
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                    Rp {formatRupiahPmpj(Number(monForm.amount || 0))}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cara Pembayaran</label>
                  <select 
                    value={monForm.paymentMethod} 
                    onChange={e => setMonForm({...monForm, paymentMethod: e.target.value as any})}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="Tunai">Tunai (Cash)</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Kliring">Kliring / RTGS</option>
                    <option value="Cek / Bilyet Giro">Cek / Bilyet Giro</option>
                    <option value="Aset Kripto / Lainnya">Aset Kripto / Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pihak Pembayar / Penerima</label>
                  <input 
                    type="text" 
                    value={monForm.counterparty} 
                    onChange={e => setMonForm({...monForm, counterparty: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                    placeholder="Nama pihak lawan transaksi"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tujuan / Uraian Transaksi</label>
                  <input 
                    type="text" 
                    value={monForm.purpose} 
                    onChange={e => setMonForm({...monForm, purpose: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                    placeholder="Uraian peruntukan transaksi finansial"
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={monForm.matchesCddProfile}
                      onChange={e => setMonForm({...monForm, matchesCddProfile: e.target.checked})}
                      className="rounded text-blue-600"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Sesuai Profil/CDD</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={monForm.isSuspicious}
                      onChange={e => setMonForm({...monForm, isSuspicious: e.target.checked})}
                      className="rounded text-rose-600"
                    />
                    <span className="text-[11px] font-bold text-rose-700">Mencurigakan? (TKM)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status Tindak Lanjut</label>
                  <select 
                    value={monForm.followUpStatus} 
                    onChange={e => setMonForm({...monForm, followUpStatus: e.target.value as any})}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Klarifikasi Klien">Klarifikasi Klien</option>
                    <option value="Diteruskan ke Partner">Diteruskan ke Partner</option>
                    <option value="Disiapkan LTKM">Disiapkan LTKM</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Keputusan Reviewer</label>
                  <select 
                    value={monForm.reviewerDecision} 
                    onChange={e => setMonForm({...monForm, reviewerDecision: e.target.value as any})}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="Diterima">Diterima</option>
                    <option value="Minta Bukti Tambahan">Minta Bukti Tambahan</option>
                    <option value="Tolak Transaksi">Tolak Transaksi</option>
                    <option value="Rekomendasi Lapor PPATK">Rekomendasi Lapor PPATK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status Pelaporan PPATK</label>
                  <select 
                    value={monForm.ppatkReportStatus} 
                    onChange={e => setMonForm({...monForm, ppatkReportStatus: e.target.value as any})}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-rose-700"
                  >
                    <option value="Tidak Perlu">Tidak Perlu</option>
                    <option value="Draft GRIPS">Draft GRIPS</option>
                    <option value="Dilaporkan (LTKM)">Dilaporkan (LTKM)</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Referensi Pelaporan Terkait</label>
                  <input 
                    type="text" 
                    value={monForm.ppatkRefNumber} 
                    onChange={e => setMonForm({...monForm, ppatkRefNumber: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono" 
                    placeholder="GRIPS-2026-TKM-xxx"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMonitoringOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Simpan Catatan Pemantauan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Pmpj;
