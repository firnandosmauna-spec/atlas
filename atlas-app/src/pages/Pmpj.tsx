import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Check, 
  X, 
  Info, 
  Eye, 
  Building2, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  ChevronRight, 
  BookOpen,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Wallet,
  Scale,
  FileCheck
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
import { 
  syncPmpjBidirectional, 
  upsertCloudPmpjRegister, 
  deleteCloudPmpjRegister, 
  upsertCloudPmpjMonitoring, 
  deleteCloudPmpjMonitoring 
} from '../services/pmpjSyncService';

const STORAGE_KEY_PMPJ_REGISTERS = 'atlas_pmpj_registers';
const STORAGE_KEY_PMPJ_MONITORING = 'atlas_pmpj_monitoring';

const PMPJ_GUIDE_TOPICS = [
  {
    number: '01',
    topik: 'Ruang Lingkup Jasa',
    pasal: 'Pasal 2 PMK 55/PMK.01/2017',
    panduan: 'PMPJ wajib diterapkan untuk 5 jenis jasa yang tercantum dalam PMK (jual beli properti, pengelolaan uang/efek/rekening, pengelolaan perseroan, pendirian/pengoperasian badan hukum, dan transaksi atas nama pengguna jasa).'
  },
  {
    number: '02',
    topik: 'Pemicu Pelaksanaan (Trigger)',
    pasal: 'Kewajiban Pengujian',
    panduan: 'Tandai salah satu dari 4 kondisi: adanya hubungan usaha berkelanjutan, transaksi tunai/keuangan kumulatif minimal Rp100 juta, indikasi Transaksi Keuangan Mencurigakan (TKM), atau adanya keraguan atas kebenaran informasi pengguna jasa.'
  },
  {
    number: '03',
    topik: 'Uji Tuntas Pengguna Jasa (CDD)',
    pasal: 'Verifikasi & Beneficial Owner',
    panduan: 'Lengkapi identifikasi legalitas, alamat/kontak, bidang usaha, profil sumber dana, tujuan transaksi, wakil yang sah, serta Beneficial Ownership (BO) pemegang kendali akhir >25%. Tetapkan verifikasi tatap muka atau non-tatap muka.'
  },
  {
    number: '04',
    topik: 'Penetapan Profil Risiko',
    pasal: 'Klasifikasi Internal KAP',
    panduan: 'Tetapkan klasifikasi Rendah, Sedang, atau Tinggi berdasarkan pertimbangan profesional KAP. Pengguna jasa berisiko tinggi atau non-tatap muka wajib menerapkan Enhanced Due Diligence (EDD).'
  },
  {
    number: '05',
    topik: 'Pemantauan Berkelanjutan',
    pasal: 'Log Transaksi Finansial',
    panduan: 'Catat dan monitor penyimpangan pola transaksi, karakteristik pembayaran tunai, dan kesesuaian transaksi terhadap profil CDD yang telah ditetapkan selama masa penugasan.'
  },
  {
    number: '06',
    topik: 'Eskalasi & Pelaporan PPATK',
    pasal: 'Aplikasi GRIPS PPATK',
    panduan: 'Jika ditemukan transaksi yang patut diduga terkait tindak pidana pencucian uang/pendanaan terorisme atau pengguna menolak verifikasi, lakukan eskalasi ke Partner dan siapkan Laporan Transaksi Keuangan Mencurigakan (LTKM).'
  },
  {
    number: '07',
    topik: 'Retensi Dokumen Arsip',
    pasal: 'Kewajiban Minimal 5 Tahun',
    panduan: 'Seluruh berkas identitas, formulir CDD, dan kertas kerja PMPJ wajib disimpan minimal 5 tahun terhitung sejak tanggal berakhirnya hubungan usaha dengan pengguna jasa.'
  }
];

const OFFICIAL_REFERENCES = [
  {
    label: 'PMK No. 55/PMK.01/2017',
    desc: 'Prinsip Mengenali Pengguna Jasa Bagi Akuntan dan Akuntan Publik',
    url: 'https://jdih.kemenkeu.go.id/dok/55-pmk-01-2017'
  },
  {
    label: 'PMK No. 155/PMK.01/2017',
    desc: 'Perubahan PMK 55 Mengenai Prosedur Penerapan CDD & Pelaporan',
    url: 'https://jdih.kemenkeu.go.id/dok/155-pmk-01-2017'
  },
  {
    label: 'PPATK - Pelaporan Profesi (GRIPS)',
    desc: 'Panduan Pelaporan Pihak Pelapor Akuntan Publik ke PPATK',
    url: 'https://www.ppatk.go.id/pelaporan/read/50/'
  },
  {
    label: 'PPATK - Penilaian Risiko Nasional (NRA)',
    desc: 'Publikasi Tipologi dan Penilaian Risiko TPPU/TPPT Sektor Profesi',
    url: 'https://www.ppatk.go.id/dalam_negeri/read/1397/publikasi-penilaian-risiko.html'
  }
];

const Pmpj: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'register' | 'pemantauan' | 'panduan'>('ringkasan');
  const [registers, setRegisters] = useState<PmpjClientRegister[]>([]);
  const [monitoringList, setMonitoringList] = useState<PmpjTransactionMonitoring[]>([]);
  
  // View mode for register table: compact modern (recommended) vs full parameters table
  const [registerViewMode, setRegisterViewMode] = useState<'compact' | 'full'>('compact');

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
    paymentMethod: 'Tunai',
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

  // Cloud Sync State
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Load from LocalStorage + Cloud Sync
  useEffect(() => {
    let initialRegs: PmpjClientRegister[] = [];
    let initialMons: PmpjTransactionMonitoring[] = [];

    try {
      const mockRegIds = ['reg-001', 'reg-002', 'reg-003'];
      const mockMonIds = ['mon-001', 'mon-002', 'mon-003'];

      const storedRegs = localStorage.getItem(STORAGE_KEY_PMPJ_REGISTERS);
      if (storedRegs) {
        const parsed = JSON.parse(storedRegs);
        initialRegs = Array.isArray(parsed) ? parsed.filter((r: any) => !mockRegIds.includes(r.id)) : [];
        setRegisters(initialRegs);
      } else {
        setRegisters([]);
      }

      const storedMon = localStorage.getItem(STORAGE_KEY_PMPJ_MONITORING);
      if (storedMon) {
        const parsedMon = JSON.parse(storedMon);
        initialMons = Array.isArray(parsedMon) ? parsedMon.filter((m: any) => !mockMonIds.includes(m.id)) : [];
        setMonitoringList(initialMons);
      } else {
        setMonitoringList([]);
      }
    } catch (e) {
      console.error('Error loading local PMPJ data', e);
      setRegisters([]);
      setMonitoringList([]);
    }

    // Bidirectional Sync with Supabase Cloud
    setIsCloudSyncing(true);
    syncPmpjBidirectional(initialRegs, initialMons)
      .then((res) => {
        setRegisters(res.registers);
        setMonitoringList(res.monitoring);
        setIsCloudSynced(res.syncedWithCloud);
      })
      .catch((err) => {
        console.warn('[PMPJ] Supabase sync fallback to local:', err);
      })
      .finally(() => {
        setIsCloudSyncing(false);
      });
  }, []);

  // Save Helpers
  const saveRegistersToStorage = (updated: PmpjClientRegister[]) => {
    setRegisters(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PMPJ_REGISTERS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving registers to storage', e);
    }
  };

  const saveMonitoringToStorage = (updated: PmpjTransactionMonitoring[]) => {
    setMonitoringList(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PMPJ_MONITORING, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving monitoring to storage', e);
    }
  };

  // Reset Data to Initial KAP Fridolinus Peno Defaults
  const handleResetData = () => {
    if (window.confirm('Kembalikan data PMPJ ke data standar contoh KAP Fridolinus Peno?')) {
      saveRegistersToStorage(INITIAL_PMPJ_REGISTERS);
      saveMonitoringToStorage(INITIAL_PMPJ_MONITORING);
    }
  };

  // Executive Summary Metrics Calculation
  const summaryMetrics: PmpjSummaryMetrics = useMemo(() => {
    const totalRegisteredUsers = registers.length;
    const activePmpjCount = registers.filter(r => r.isPmpjActive).length;
    const incompleteCddCount = registers.filter(r => r.cddStatus === 'Belum Lengkap').length;
    const highRiskCount = registers.filter(r => r.internalRisk === 'Tinggi').length;
    const openAlertsCount = monitoringList.filter(m => m.alertMenular !== 'NORMAL').length;

    return {
      totalRegisteredUsers,
      activePmpjCount,
      incompleteCddCount,
      highRiskCount,
      openAlertsCount
    };
  }, [registers, monitoringList]);

  // Handle Save New or Edited Register
  const handleSaveRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.clientName || !regForm.clientName.trim()) {
      alert('Nama Pengguna Jasa wajib diisi.');
      return;
    }

    const pmkScope = calculatePmkScope(regForm.serviceType || '', regForm.isForUserInterest ?? true);
    const isPmpjActive = calculateIsPmpjActive({
      pmkScope,
      triggerBusinessRelation: regForm.triggerBusinessRelation ?? false,
      triggerLargeTx: regForm.triggerLargeTx ?? false,
      triggerSuspiciousTx: regForm.triggerSuspiciousTx ?? false,
      triggerDoubtfulInfo: regForm.triggerDoubtfulInfo ?? false,
    });

    const cddStatus = calculateCddStatus({
      docStatus: regForm.docStatus || 'Lengkap',
      isDirectMeeting: regForm.isDirectMeeting ?? true,
      verificationStatus: regForm.verificationStatus || 'Terverifikasi',
      internalRisk: regForm.internalRisk || 'Sedang',
      isPmpjActive
    });

    const retentionUntil = calculateRetentionUntil(regForm.relationEndDate || '2026-12-31');

    if (editingRegister) {
      // Update existing record
      const updatedRecord: PmpjClientRegister = {
        ...editingRegister,
        ...regForm,
        pmkScope,
        isPmpjActive,
        cddStatus,
        retentionUntil
      } as PmpjClientRegister;

      const updatedList = registers.map(item => item.id === editingRegister.id ? updatedRecord : item);
      saveRegistersToStorage(updatedList);
      upsertCloudPmpjRegister(updatedRecord);
      setEditingRegister(null);
    } else {
      // Create new record
      const newRecord: PmpjClientRegister = {
        id: `reg-${Date.now()}`,
        clientId: regForm.clientId || `KLN-${String(registers.length + 1).padStart(3, '0')}`,
        engagementId: regForm.engagementId || `ENG-2026-${String(registers.length + 1).padStart(3, '0')}`,
        startDate: regForm.startDate || new Date().toISOString().split('T')[0],
        clientName: regForm.clientName || '',
        userType: regForm.userType || 'Korporasi',
        serviceType: regForm.serviceType || 'Audit Umum Laporan Keuangan',
        isForUserInterest: regForm.isForUserInterest ?? true,
        pmkScope,
        triggerBusinessRelation: regForm.triggerBusinessRelation ?? true,
        triggerLargeTx: regForm.triggerLargeTx ?? true,
        triggerSuspiciousTx: regForm.triggerSuspiciousTx ?? false,
        triggerDoubtfulInfo: regForm.triggerDoubtfulInfo ?? false,
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
        relationEndDate: regForm.relationEndDate || '2026-12-31',
        retentionUntil,
        reviewer: regForm.reviewer || 'Fridolinus Peno',
        reviewDate: regForm.reviewDate || new Date().toISOString().split('T')[0],
        notes: regForm.notes || ''
      };
      saveRegistersToStorage([newRecord, ...registers]);
      upsertCloudPmpjRegister(newRecord);
    }

    setIsAddRegisterOpen(false);
  };

  // Delete Register Record
  const handleDeleteRegister = (id: string) => {
    if (window.confirm('Hapus baris data register PMPJ ini?')) {
      const updated = registers.filter(r => r.id !== id);
      saveRegistersToStorage(updated);
      deleteCloudPmpjRegister(id);
    }
  };

  // Handle Save New Transaction Monitoring Record
  const handleSaveMonitoring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monForm.clientName || !monForm.clientName.trim()) {
      alert('Nama Pengguna Jasa wajib dipilih.');
      return;
    }

    const alertMenular = calculateAlertMenular({
      isSuspicious: monForm.isSuspicious ?? false,
      matchesCddProfile: monForm.matchesCddProfile ?? true,
      amount: Number(monForm.amount || 0)
    });

    const newRecord: PmpjTransactionMonitoring = {
      id: `mon-${Date.now()}`,
      monitoringId: monForm.monitoringId || `PMT-${String(monitoringList.length + 1).padStart(3, '0')}`,
      clientId: monForm.clientId || 'KLN-001',
      clientName: monForm.clientName || '',
      date: monForm.date || new Date().toISOString().split('T')[0],
      amount: Number(monForm.amount || 0),
      paymentMethod: monForm.paymentMethod || 'Tunai',
      counterparty: monForm.counterparty || '',
      purpose: monForm.purpose || '',
      matchesCddProfile: monForm.matchesCddProfile ?? true,
      isSuspicious: monForm.isSuspicious ?? false,
      inPmpjScope: monForm.inPmpjScope ?? true,
      alertMenular,
      followUpStatus: monForm.followUpStatus || 'Normal',
      reviewer: monForm.reviewer || 'Fridolinus Peno',
      reviewerDecision: monForm.reviewerDecision || 'Diterima',
      isRelationTerminated: monForm.isRelationTerminated ?? false,
      ppatkReportStatus: monForm.ppatkReportStatus || 'Tidak Perlu',
      ppatkRefNumber: monForm.ppatkRefNumber || '',
      reviewDate: monForm.reviewDate || new Date().toISOString().split('T')[0],
      notes: monForm.notes || ''
    };

    saveMonitoringToStorage([newRecord, ...monitoringList]);
    upsertCloudPmpjMonitoring(newRecord);
    setIsAddMonitoringOpen(false);
  };

  // Filtered Registers
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

  // Filtered Monitoring
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

  // Open Detail Modal
  const openDetailModal = (r: PmpjClientRegister) => {
    setViewingRegisterDetail(r);
  };

  return (
    <div className="w-full font-sans min-w-0 space-y-5 pb-16">
      
      {/* ── HEADER BANNER: MODERN & MINIMALIST ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              PMPJ KAP Fridolinus Peno
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              PMK No. 55/PMK.01/2017 & PPATK
            </span>
            {isCloudSyncing ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Sinkron Cloud...
              </span>
            ) : isCloudSynced ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Supabase Terhubung
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">
            Sistem Pengendalian Mutu & Uji Tuntas Pengguna Jasa (Customer Due Diligence / CDD)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={handleResetData}
            title="Kembalikan data contoh awal"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
          >
            <RotateCcw size={13} className="text-slate-500" />
            <span>Reset Contoh</span>
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
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>Register Klien Baru</span>
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
                setIsAddMonitoringOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>Catat Transaksi Terpantau</span>
            </button>
          )}
        </div>
      </div>

      {/* ── SEGMENTED NAVIGATION TABS ── */}
      <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 overflow-x-auto scrollbar-none text-xs gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('ringkasan')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all text-xs font-semibold ${
            activeTab === 'ringkasan'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Layers size={14} className={activeTab === 'ringkasan' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Ringkasan & Metrik</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all text-xs font-semibold ${
            activeTab === 'register'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText size={14} className={activeTab === 'register' ? 'text-indigo-600' : 'text-slate-400'} />
          <span>Register Pengguna Jasa ({registers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pemantauan')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all text-xs font-semibold ${
            activeTab === 'pemantauan'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ShieldCheck size={14} className={activeTab === 'pemantauan' ? 'text-rose-600' : 'text-slate-400'} />
          <span>Pemantauan Transaksi ({monitoringList.length})</span>
          {summaryMetrics.openAlertsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
              {summaryMetrics.openAlertsCount} Alert
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('panduan')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all text-xs font-semibold ${
            activeTab === 'panduan'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BookOpen size={14} className={activeTab === 'panduan' ? 'text-emerald-600' : 'text-slate-400'} />
          <span>Panduan Singkat & Regulasi</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RINGKASAN & METRIK EKSEKUTIF (MODERN MINIMALIST STRIP) */}
      {/* ========================================================================= */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-5">
          
          {/* 5 Clean Minimalist Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Pengguna Jasa</span>
                <Building2 size={16} className="text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {summaryMetrics.totalRegisteredUsers}
              </div>
              <div className="text-[11px] text-slate-500">
                Terdaftar di Master KAP
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">PMPJ Aktif</span>
                <ShieldCheck size={16} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 font-mono">
                {summaryMetrics.activePmpjCount}
              </div>
              <div className="text-[11px] text-emerald-700/80 font-medium">
                Ruang Lingkup & Pemicu Terpenuhi
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">CDD Belum Lengkap</span>
                <AlertCircle size={16} className="text-amber-500" />
              </div>
              <div className={`text-2xl font-bold font-mono ${summaryMetrics.incompleteCddCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {summaryMetrics.incompleteCddCount}
              </div>
              <div className="text-[11px] text-slate-500">
                Perlu kelengkapan berkas
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Risiko Tinggi</span>
                <AlertTriangle size={16} className="text-purple-600" />
              </div>
              <div className={`text-2xl font-bold font-mono ${summaryMetrics.highRiskCount > 0 ? 'text-purple-700' : 'text-slate-800'}`}>
                {summaryMetrics.highRiskCount}
              </div>
              <div className="text-[11px] text-purple-700/80 font-medium">
                Wajib Enhanced Due Diligence (EDD)
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Alert Terbuka</span>
                <Clock size={16} className="text-rose-600" />
              </div>
              <div className={`text-2xl font-bold font-mono ${summaryMetrics.openAlertsCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {summaryMetrics.openAlertsCount}
              </div>
              <div className="text-[11px] text-slate-500">
                Perlu telaah / klarifikasi
              </div>
            </div>
          </div>

          {/* Alur Kerja PMPJ (Modern 5-Step Process) */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Alur Operasional Pengendalian Mutu & PMPJ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prosedur bertahap penerapan prinsip mengenali pengguna jasa pada KAP Fridolinus Peno
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                Standar SPM & PMK 55
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
              <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center font-mono">
                    1
                  </span>
                  <span className="text-xs font-bold text-slate-900">Registrasi Klien</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Catat satu baris per entitas atau perikatan dengan nomor ID unik dan data legalitas awal.
                </p>
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center font-mono">
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-900">Uji Ruang Lingkup</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pilih jenis jasa & evaluasi 4 kriteria pemicu. Status ruang lingkup & PMPJ aktif terhitung otomatis.
                </p>
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center font-mono">
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-900">Verifikasi CDD/BO</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Lengkapi identitas, sumber dana, tujuan transaksi, kuasa wakil, dan Beneficial Owner (BO) lebih dari 25%.
                </p>
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center font-mono">
                    4
                  </span>
                  <span className="text-xs font-bold text-slate-900">Evaluasi & Retensi</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tetapkan profil risiko internal & keputusan penerimaan. Masa simpan dokumen 5 tahun terhitung otomatis.
                </p>
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center font-mono">
                    5
                  </span>
                  <span className="text-xs font-bold text-slate-900">Pemantauan & TKM</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Catat transaksi finansial yang mencurigakan (TKM) dan teruskan laporan ke PPATK melalui aplikasi GRIPS.
                </p>
              </div>
            </div>

            {/* Subtle Alert Info */}
            <div className="mt-3 p-3 bg-amber-50/80 rounded-lg border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <Info size={15} className="text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Kerahasiaan & Kepatuhan:</strong> Seluruh berkas identitas dan laporan PMPJ bersifat rahasia dan wajib disimpan pada repositori arsip KAP terakreditasi sesuai ketentuan kerahasiaan jabatan profesi Akuntan Publik.
              </span>
            </div>
          </div>

          {/* Two Action Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setActiveTab('register')}
              className="bg-white hover:bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Buka Register Pengguna Jasa
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {registers.length} Klien terdaftar • Formulir CDD & Keputusan Penerimaan
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <div 
              onClick={() => setActiveTab('pemantauan')}
              className="bg-white hover:bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                    Buka Pemantauan Transaksi & LTKM
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {monitoringList.length} Transaksi tercatat • Deteksi Transaksi Mencurigakan
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REGISTER PENGGUNA JASA PMPJ (MODERN MINIMALIST TABLE) */}
      {/* ========================================================================= */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          
          {/* Controls: Search, Filters & View Mode Toggle */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            
            {/* Search Box */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                value={registerSearch}
                onChange={e => setRegisterSearch(e.target.value)}
                placeholder="Cari Nama Klien, ID, atau Perikatan..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select 
                value={filterUserType} 
                onChange={e => setFilterUserType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
              >
                <option value="Semua">Semua Bentuk</option>
                <option value="Korporasi">Korporasi</option>
                <option value="Perorangan">Perorangan</option>
                <option value="Badan Hukum Lain">Badan Hukum Lain</option>
              </select>

              <select 
                value={filterRisk} 
                onChange={e => setFilterRisk(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
              >
                <option value="Semua">Semua Risiko</option>
                <option value="Rendah">Risiko Rendah</option>
                <option value="Sedang">Risiko Sedang</option>
                <option value="Tinggi">Risiko Tinggi</option>
              </select>

              <select 
                value={filterCdd} 
                onChange={e => setFilterCdd(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
              >
                <option value="Semua">Semua Status CDD</option>
                <option value="Lengkap">CDD Lengkap</option>
                <option value="Belum Lengkap">Belum Lengkap</option>
                <option value="Ditingkatkan (EDD)">Ditingkatkan (EDD)</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRegisterViewMode('compact')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    registerViewMode === 'compact'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Ramping & Modern (Bebas Kolom Excel Menumpuk)"
                >
                  Ramping
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterViewMode('full')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    registerViewMode === 'full'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tabel Parameter Lengkap"
                >
                  Lengkap (33 Kolom)
                </button>
              </div>
            </div>

          </div>

          {/* MAIN REGISTER TABLE: CLEAN, BORDERLESS & BREATHABLE */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            
            {/* Table Header Bar */}
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Register Pengguna Jasa PMPJ
                </h3>
                <p className="text-[11px] text-slate-500">
                  {filteredRegisters.length} entitas terdaftar • Terhubung langsung dengan penilaian risiko internal KAP
                </p>
              </div>

              <div className="text-xs font-medium text-slate-500">
                Klik ikon <Eye size={12} className="inline text-blue-600 mx-0.5" /> untuk membuka rincian lengkap 33 parameter.
              </div>
            </div>

            {/* ── MODE 1: COMPACT MODERN VIEW (RECOMMENDED, FREE FROM EXCEL OVERLOAD) ── */}
            {registerViewMode === 'compact' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="px-4 py-3">Pengguna Jasa / Klien</th>
                      <th className="px-4 py-3">Perikatan & Jasa</th>
                      <th className="px-4 py-3 text-center">Status PMPJ</th>
                      <th className="px-4 py-3">Status CDD / EDD</th>
                      <th className="px-4 py-3">Profil Risiko</th>
                      <th className="px-4 py-3">Keputusan</th>
                      <th className="px-4 py-3">Reviewer & Retensi</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredRegisters.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                          Belum ada data register PMPJ yang sesuai kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredRegisters.map(reg => (
                        <tr 
                          key={reg.id} 
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => openDetailModal(reg)}
                        >
                          {/* 1. Pengguna Jasa */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700 transition-colors">
                              {reg.clientName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono text-slate-600 font-medium">{reg.clientId}</span>
                              <span>•</span>
                              <span>{reg.userType}</span>
                              {reg.businessSector && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[140px]" title={reg.businessSector}>
                                    {reg.businessSector}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* 2. Perikatan & Jasa */}
                          <td className="px-4 py-3.5 text-slate-700">
                            <div className="font-medium text-slate-900 text-[11px]">
                              {reg.serviceType}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                              {reg.engagementId} • Mulai: {reg.startDate}
                            </div>
                          </td>

                          {/* 3. Status PMPJ */}
                          <td className="px-4 py-3.5 text-center">
                            {reg.isPmpjActive ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                PMPJ Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                Tidak Aktif
                              </span>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {reg.pmkScope}
                            </div>
                          </td>

                          {/* 4. Status CDD */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                reg.cddStatus === 'Lengkap' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : reg.cddStatus === 'Ditingkatkan (EDD)'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {reg.cddStatus}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                              {reg.isDirectMeeting ? (
                                <span className="text-emerald-700 flex items-center gap-0.5">
                                  <Check size={11} /> Tatap Muka
                                </span>
                              ) : (
                                <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                                  <AlertTriangle size={11} /> Non-Tatap Muka
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. Profil Risiko */}
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              reg.internalRisk === 'Rendah'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : reg.internalRisk === 'Sedang'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200 font-black'
                            }`}>
                              {reg.internalRisk}
                            </span>
                          </td>

                          {/* 6. Keputusan Penerimaan */}
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-slate-900 text-xs">
                              {reg.acceptanceDecision}
                            </span>
                            {reg.followUpMitigation && (
                              <div className="text-[10px] text-slate-500 truncate max-w-[130px]" title={reg.followUpMitigation}>
                                {reg.followUpMitigation}
                              </div>
                            )}
                          </td>

                          {/* 7. Reviewer & Retensi */}
                          <td className="px-4 py-3.5 text-slate-700">
                            <div className="font-medium text-slate-900 text-xs">
                              {reg.reviewer}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Retensi: {reg.retentionUntil}
                            </div>
                          </td>

                          {/* 8. Aksi */}
                          <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openDetailModal(reg)}
                                title="Lihat Rincian Lengkap"
                                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModal(reg)}
                                title="Edit Data"
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRegister(reg.id)}
                                title="Hapus"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ── MODE 2: FULL 33-COLUMN PARAMETER TABLE (CLEAN MINIMALIST STYLING WITHOUT EXCEL CLUTTER) ── */
              <div className="overflow-x-auto max-h-[580px] scrollbar-thin">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead className="sticky top-0 z-20 bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5 sticky left-0 z-30 bg-slate-900 border-r border-slate-800 shadow-xs">Aksi</th>
                      <th className="px-3 py-2.5 sticky left-[60px] z-30 bg-slate-900 border-r border-slate-800 shadow-xs">ID Klien</th>
                      <th className="px-3 py-2.5">ID Perikatan</th>
                      <th className="px-3 py-2.5">Tanggal Mulai</th>
                      <th className="px-3 py-2.5 sticky left-[130px] z-30 bg-slate-900 border-r border-slate-800 shadow-xs">Nama Pengguna Jasa</th>
                      <th className="px-3 py-2.5">Jenis Pengguna</th>
                      <th className="px-3 py-2.5">Jenis Jasa</th>
                      <th className="px-3 py-2.5">Untuk Kepentingan?</th>
                      <th className="px-3 py-2.5 text-center">Ruang Lingkup PMK</th>
                      <th className="px-3 py-2.5 text-center">Pemicu Hubungan</th>
                      <th className="px-3 py-2.5 text-center">Transaksi ≥100Jt</th>
                      <th className="px-3 py-2.5 text-center">Indikasi TKM</th>
                      <th className="px-3 py-2.5 text-center">Ragu Info</th>
                      <th className="px-3 py-2.5 text-center">PMPJ Aktif</th>
                      <th className="px-3 py-2.5">Status CDD</th>
                      <th className="px-3 py-2.5">Identitas Legal</th>
                      <th className="px-3 py-2.5">Lahir / Pendirian</th>
                      <th className="px-3 py-2.5">Alamat & Kontak</th>
                      <th className="px-3 py-2.5">Bidang Usaha</th>
                      <th className="px-3 py-2.5">Sumber Dana</th>
                      <th className="px-3 py-2.5">Tujuan Transaksi</th>
                      <th className="px-3 py-2.5">Wakil Dokumen</th>
                      <th className="px-3 py-2.5">Informasi BO</th>
                      <th className="px-3 py-2.5">Status Dokumen</th>
                      <th className="px-3 py-2.5 text-center">Pertemuan Langsung</th>
                      <th className="px-3 py-2.5">Status Verifikasi</th>
                      <th className="px-3 py-2.5">Risiko Internal</th>
                      <th className="px-3 py-2.5">Keputusan</th>
                      <th className="px-3 py-2.5">Mitigasi</th>
                      <th className="px-3 py-2.5">Akhir Hubungan</th>
                      <th className="px-3 py-2.5">Simpan s/d</th>
                      <th className="px-3 py-2.5">Reviewer</th>
                      <th className="px-3 py-2.5">Tanggal Review</th>
                      <th className="px-3 py-2.5">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredRegisters.map(reg => (
                      <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-2.5 py-2 sticky left-0 z-10 bg-white border-r border-slate-100">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openDetailModal(reg)} title="Detail" className="p-1 text-slate-500 hover:text-blue-700 rounded">
                              <Eye size={13} />
                            </button>
                            <button onClick={() => openEditModal(reg)} title="Edit" className="p-1 text-slate-500 hover:text-slate-900 rounded">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => handleDeleteRegister(reg.id)} title="Hapus" className="p-1 text-slate-400 hover:text-rose-600 rounded">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>

                        <td className="px-3 py-2 font-mono font-bold text-slate-900 sticky left-[60px] z-10 bg-white border-r border-slate-100">
                          {reg.clientId}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">{reg.engagementId}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{reg.startDate}</td>
                        <td className="px-3 py-2 font-bold text-slate-900 sticky left-[130px] z-10 bg-white border-r border-slate-100">
                          {reg.clientName}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{reg.userType}</td>
                        <td className="px-3 py-2 text-slate-800">{reg.serviceType}</td>
                        <td className="px-3 py-2 text-center">{reg.isForUserInterest ? 'Ya' : 'Tidak'}</td>
                        <td className="px-3 py-2 text-center font-medium text-blue-700">{reg.pmkScope}</td>
                        <td className="px-3 py-2 text-center">{reg.triggerBusinessRelation ? 'Ya' : '-'}</td>
                        <td className="px-3 py-2 text-center">{reg.triggerLargeTx ? 'Ya' : '-'}</td>
                        <td className="px-3 py-2 text-center">{reg.triggerSuspiciousTx ? 'Ya' : '-'}</td>
                        <td className="px-3 py-2 text-center">{reg.triggerDoubtfulInfo ? 'Ya' : '-'}</td>
                        <td className="px-3 py-2 text-center font-bold">
                          {reg.isPmpjActive ? <span className="text-emerald-700">Aktif</span> : <span className="text-slate-400">Tidak</span>}
                        </td>
                        <td className="px-3 py-2 font-medium">{reg.cddStatus}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-600">{reg.legalIdentity || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{reg.birthOrEstablishment || '-'}</td>
                        <td className="px-3 py-2 text-slate-600 truncate max-w-xs">{reg.addressContact || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{reg.businessSector || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{reg.fundSource || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{reg.txPurpose || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{reg.representativeDoc || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{reg.boInfo || '-'}</td>
                        <td className="px-3 py-2">{reg.docStatus}</td>
                        <td className="px-3 py-2 text-center">{reg.isDirectMeeting ? 'Tatap Muka' : 'Non Tatap Muka'}</td>
                        <td className="px-3 py-2">{reg.verificationStatus}</td>
                        <td className="px-3 py-2 font-bold">{reg.internalRisk}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900">{reg.acceptanceDecision}</td>
                        <td className="px-3 py-2 text-slate-600">{reg.followUpMitigation || '-'}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{reg.relationEndDate || '-'}</td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">{reg.retentionUntil}</td>
                        <td className="px-3 py-2 text-slate-800">{reg.reviewer}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{reg.reviewDate}</td>
                        <td className="px-3 py-2 text-slate-500 italic truncate max-w-xs">{reg.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PEMANTAUAN TRANSAKSI & LTKM (CLEAN FINANCIAL MONITORING TABLE) */}
      {/* ========================================================================= */}
      {activeTab === 'pemantauan' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                value={monitoringSearch}
                onChange={e => setMonitoringSearch(e.target.value)}
                placeholder="Cari ID Pemantauan, Klien, Pihak Terkait..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Alert:</span>
              <select 
                value={filterTkm} 
                onChange={e => setFilterTkm(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
              >
                <option value="Semua">Semua Transaksi</option>
                <option value="Alert">Alert Terbuka</option>
                <option value="TKM">Hanya Indikasi TKM</option>
              </select>
            </div>
          </div>

          {/* Clean Modern Monitoring Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Log Pemantauan Transaksi & Deteksi TKM
                </h3>
                <p className="text-[11px] text-slate-500">
                  {filteredMonitoring.length} transaksi terpantau • Monitoring kesesuaian transaksi terhadap profil CDD
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="px-4 py-3">Transaksi & Tanggal</th>
                    <th className="px-4 py-3">Klien & Pihak Terkait</th>
                    <th className="px-4 py-3 text-right">Nilai Transaksi</th>
                    <th className="px-4 py-3">Metode Bayar</th>
                    <th className="px-4 py-3 text-center">Status Alert</th>
                    <th className="px-4 py-3">Tindak Lanjut & Keputusan</th>
                    <th className="px-4 py-3">Pelaporan PPATK</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredMonitoring.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                        Belum ada catatan pemantauan transaksi. Klik "+ Catat Transaksi Terpantau" untuk memulai.
                      </td>
                    </tr>
                  ) : (
                    filteredMonitoring.map(mon => (
                      <tr key={mon.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* 1. Transaksi & Tanggal */}
                        <td className="px-4 py-3.5">
                          <div className="font-mono font-bold text-slate-900 text-xs">
                            {mon.monitoringId}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {mon.date}
                          </div>
                        </td>

                        {/* 2. Klien & Pihak Terkait */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 text-xs">
                            {mon.clientName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={mon.counterparty}>
                            Lawan: {mon.counterparty || '-'}
                          </div>
                          {mon.purpose && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]" title={mon.purpose}>
                              {mon.purpose}
                            </div>
                          )}
                        </td>

                        {/* 3. Nilai Transaksi */}
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            Rp {formatRupiahPmpj(mon.amount)}
                          </span>
                        </td>

                        {/* 4. Metode Bayar */}
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            mon.paymentMethod === 'Tunai'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {mon.paymentMethod}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {mon.matchesCddProfile ? (
                              <span className="text-emerald-700">Sesuai CDD</span>
                            ) : (
                              <span className="text-rose-600 font-bold">Tidak Sesuai CDD</span>
                            )}
                          </div>
                        </td>

                        {/* 5. Status Alert */}
                        <td className="px-4 py-3.5 text-center">
                          {mon.alertMenular === 'ALERT TKM' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                              <AlertTriangle size={11} /> Alert TKM
                            </span>
                          ) : mon.alertMenular === 'PERIKSA EDD' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              Periksa EDD
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                              Normal
                            </span>
                          )}
                        </td>

                        {/* 6. Tindak Lanjut & Keputusan */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 text-xs">
                            {mon.reviewerDecision}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Status: {mon.followUpStatus} • {mon.reviewer}
                          </div>
                        </td>

                        {/* 7. Pelaporan PPATK */}
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            mon.ppatkReportStatus === 'Dilaporkan (LTKM)'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : mon.ppatkReportStatus === 'Draft GRIPS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {mon.ppatkReportStatus}
                          </span>
                          {mon.ppatkRefNumber && (
                            <div className="text-[10px] font-mono text-slate-500 mt-1">
                              Ref: {mon.ppatkRefNumber}
                            </div>
                          )}
                        </td>

                        {/* 8. Aksi */}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Hapus catatan pemantauan transaksi ini?')) {
                                saveMonitoringToStorage(monitoringList.filter(m => m.id !== mon.id));
                              }
                            }}
                            title="Hapus"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
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
      {/* TAB 4: PANDUAN SINGKAT PMPJ & RUJUKAN RESMI (CLEAN CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'panduan' && (
        <div className="space-y-5">
          
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Pedoman Operasional PMPJ Bagi Profesi Akuntan Publik
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kompilasi panduan teknis penerapan Prinsip Mengenali Pengguna Jasa sesuai PMK No. 55/PMK.01/2017 & standar PPATK.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {PMPJ_GUIDE_TOPICS.map(item => (
                <div key={item.number} className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Topik {item.number}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.pasal}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {item.topik}
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {item.panduan}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rujukan Resmi Grid */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Rujukan Resmi & Tautan Regulasi
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OFFICIAL_REFERENCES.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                      <span>{ref.label}</span>
                      <ArrowUpRight size={13} className="text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {ref.desc}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-3 p-3 bg-amber-50/80 rounded-lg border border-amber-200/80 flex items-start gap-2 text-xs text-amber-900">
              <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Regulasi:</strong> Kewajiban PMPJ berlaku spesifik untuk jenis jasa tertentu sesuai PMK No. 55/PMK.01/2017, bukan otomatis untuk setiap perikatan audit umum jika tidak memenuhi pemicu perikatan.
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DETAIL LENGKAP PROFIL & CDD PMPJ (STRUCTURED 33 PARAMETERS VIEW) */}
      {/* ========================================================================= */}
      {viewingRegisterDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col font-sans overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {viewingRegisterDetail.clientName}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                    {viewingRegisterDetail.clientId}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    viewingRegisterDetail.internalRisk === 'Rendah' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : viewingRegisterDetail.internalRisk === 'Sedang'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    Risiko {viewingRegisterDetail.internalRisk}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ID Perikatan: {viewingRegisterDetail.engagementId} • Mulai: {viewingRegisterDetail.startDate}
                </p>
              </div>

              <button 
                onClick={() => setViewingRegisterDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: 4 Structured Cards */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              
              {/* Bagian 1: Identitas Legal & Profil Usaha */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <Building2 size={14} className="text-blue-600" />
                  <span>1. Identitas Legalitas & Profil Usaha</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jenis Pengguna Jasa</span>
                    <span className="text-slate-900 font-medium">{viewingRegisterDetail.userType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jenis Jasa Perikatan</span>
                    <span className="text-slate-900 font-medium">{viewingRegisterDetail.serviceType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bidang Usaha / Sektor</span>
                    <span className="text-slate-900 font-medium">{viewingRegisterDetail.businessSector || '-'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Identitas Legal (NIK/NPWP/NIB)</span>
                    <span className="text-slate-900 font-mono font-medium">{viewingRegisterDetail.legalIdentity || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tempat-Tgl Lahir / Pendirian</span>
                    <span className="text-slate-900 font-medium">{viewingRegisterDetail.birthOrEstablishment || '-'}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Alamat dan Kontak</span>
                    <span className="text-slate-900 font-medium">{viewingRegisterDetail.addressContact || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Pengujian Pemicu PMK No. 55 */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>2. Pengujian Ruang Lingkup & Pemicu PMK 55/PMK.01/2017</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ruang Lingkup PMK Pasal 2</span>
                    <span className="font-semibold text-blue-700">{viewingRegisterDetail.pmkScope}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status PMPJ Aktif</span>
                    <span className={`font-bold ${viewingRegisterDetail.isPmpjActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {viewingRegisterDetail.isPmpjActive ? 'Ya (Aktif)' : 'Tidak Aktif'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Untuk Kepentingan Klien</span>
                    <span className="text-slate-900">{viewingRegisterDetail.isForUserInterest ? 'Ya' : 'Tidak'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hubungan Usaha Berkelanjutan</span>
                    <span className="text-slate-900">{viewingRegisterDetail.triggerBusinessRelation ? 'Ya' : 'Tidak'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Transaksi ≥ Rp100 Juta</span>
                    <span className="text-slate-900">{viewingRegisterDetail.triggerLargeTx ? 'Ya (Terpenuhi)' : 'Tidak'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Indikasi Transaksi Mencurigakan</span>
                    <span className="text-slate-900">{viewingRegisterDetail.triggerSuspiciousTx ? 'Ya (Indikasi TKM)' : 'Tidak'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Keraguan Informasi</span>
                    <span className="text-slate-900">{viewingRegisterDetail.triggerDoubtfulInfo ? 'Ya' : 'Tidak'}</span>
                  </div>
                </div>
              </div>

              {/* Bagian 3: CDD/EDD & Beneficial Ownership */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <User size={14} className="text-purple-600" />
                  <span>3. Uji Tuntas (CDD/EDD), Dokumen & Beneficial Owner (BO)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status CDD</span>
                    <span className="font-bold text-slate-900">{viewingRegisterDetail.cddStatus}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status Dokumen</span>
                    <span className="font-medium text-slate-900">{viewingRegisterDetail.docStatus}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pertemuan Langsung Awal</span>
                    <span className="font-medium text-slate-900">
                      {viewingRegisterDetail.isDirectMeeting ? 'Tatap Muka Langsung' : 'Non-Tatap Muka (Wajib EDD)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status Verifikasi</span>
                    <span className="font-medium text-slate-900">{viewingRegisterDetail.verificationStatus}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sumber Dana</span>
                    <span className="text-slate-900">{viewingRegisterDetail.fundSource || '-'}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tujuan Hubungan / Transaksi</span>
                    <span className="text-slate-900">{viewingRegisterDetail.txPurpose || '-'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wakil & Dokumen Wewenang</span>
                    <span className="text-slate-900">{viewingRegisterDetail.representativeDoc || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Informasi BO & Kendali</span>
                    <span className="text-slate-900">{viewingRegisterDetail.boInfo || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Bagian 4: Evaluasi Risiko, Keputusan & Retensi */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <CheckCircle2 size={14} className="text-indigo-600" />
                  <span>4. Evaluasi Risiko Internal, Keputusan & Retensi Arsip</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Penilaian Risiko Internal</span>
                    <span className="font-bold text-slate-900">{viewingRegisterDetail.internalRisk}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Keputusan Penerimaan</span>
                    <span className="font-bold text-emerald-800">{viewingRegisterDetail.acceptanceDecision}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Simpan Dokumen Sampai (Auto)</span>
                    <span className="font-mono font-bold text-slate-900">{viewingRegisterDetail.retentionUntil}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tindak Lanjut / Mitigasi</span>
                    <span className="text-slate-800">{viewingRegisterDetail.followUpMitigation || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reviewer KAP</span>
                    <span className="font-medium text-slate-900">{viewingRegisterDetail.reviewer}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tanggal Review</span>
                    <span className="font-mono text-slate-700">{viewingRegisterDetail.reviewDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tanggal Akhir Hubungan</span>
                    <span className="font-mono text-slate-700">{viewingRegisterDetail.relationEndDate}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Catatan Tambahan Reviewer</span>
                    <span className="text-slate-600 italic">{viewingRegisterDetail.notes || '-'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const reg = viewingRegisterDetail;
                  setViewingRegisterDetail(null);
                  openEditModal(reg);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <Edit3 size={13} /> Edit Data Ini
              </button>
              
              <button
                type="button"
                onClick={() => setViewingRegisterDetail(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM TAMBAH / EDIT REGISTER PENGGUNA JASA PMPJ */}
      {/* ========================================================================= */}
      {isAddRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col font-sans overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  {editingRegister ? 'Edit Register Pengguna Jasa PMPJ' : 'Tambah Register Pengguna Jasa Baru'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  PMK No. 55/PMK.01/2017 & Pengujian Customer Due Diligence (CDD)
                </p>
              </div>
              <button 
                onClick={() => { setIsAddRegisterOpen(false); setEditingRegister(null); }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRegister} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              
              {/* Bagian 1: Identifikasi Klien */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                      placeholder="KLN-001"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ID Perikatan</label>
                    <input 
                      type="text" 
                      value={regForm.engagementId} 
                      onChange={e => setRegForm({...regForm, engagementId: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                      placeholder="ENG-2026-001"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Mulai Hubungan</label>
                    <input 
                      type="date" 
                      value={regForm.startDate} 
                      onChange={e => setRegForm({...regForm, startDate: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Pengguna</label>
                    <select 
                      value={regForm.userType} 
                      onChange={e => setRegForm({...regForm, userType: e.target.value as any})}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
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
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900" 
                      placeholder="Contoh: PT Sumber Energi Mandiri"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Jasa</label>
                    <input 
                      type="text" 
                      value={regForm.serviceType} 
                      onChange={e => setRegForm({...regForm, serviceType: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium" 
                      placeholder="Contoh: Audit Umum Laporan Keuangan"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Pemicu & Ruang Lingkup PMK */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-600" />
                  2. Pemicu & Ruang Lingkup PMK No. 55/PMK.01/2017
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
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
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
                  <User size={14} className="text-blue-600" />
                  3. Dokumen Legalitas, Sumber Dana & Beneficial Owner (BO)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Identitas Legal (NIK/NPWP/NIB)</label>
                    <input 
                      type="text" 
                      value={regForm.legalIdentity} 
                      onChange={e => setRegForm({...regForm, legalIdentity: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="NPWP: 01.xxx / NIB: xxx"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tempat-Tgl Lahir / Pendirian</label>
                    <input 
                      type="text" 
                      value={regForm.birthOrEstablishment} 
                      onChange={e => setRegForm({...regForm, birthOrEstablishment: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Jakarta, 12 Mei 2012"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pekerjaan / Bidang Usaha</label>
                    <input 
                      type="text" 
                      value={regForm.businessSector} 
                      onChange={e => setRegForm({...regForm, businessSector: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Pertambangan Batubara"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alamat dan Kontak</label>
                    <input 
                      type="text" 
                      value={regForm.addressContact} 
                      onChange={e => setRegForm({...regForm, addressContact: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Alamat kantor, nomor telp, email"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sumber Dana</label>
                    <input 
                      type="text" 
                      value={regForm.fundSource} 
                      onChange={e => setRegForm({...regForm, fundSource: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Hasil operasional / investasi"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tujuan Hubungan Transaksi</label>
                    <input 
                      type="text" 
                      value={regForm.txPurpose} 
                      onChange={e => setRegForm({...regForm, txPurpose: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Audit Tahunan Statutory"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Wakil & Dokumen Wewenang</label>
                    <input 
                      type="text" 
                      value={regForm.representativeDoc} 
                      onChange={e => setRegForm({...regForm, representativeDoc: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Nama Direktur / Akta Notaris"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Informasi BO & Kendali</label>
                    <input 
                      type="text" 
                      value={regForm.boInfo} 
                      onChange={e => setRegForm({...regForm, boInfo: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Pemilik manfaat akhir >25%"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 4: Verifikasi & Keputusan */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-blue-600" />
                  4. Verifikasi, Penilaian Risiko & Keputusan Penerimaan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status Dokumen</label>
                    <select 
                      value={regForm.docStatus} 
                      onChange={e => setRegForm({...regForm, docStatus: e.target.value as any})}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
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
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
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
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
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
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
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
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                      placeholder="Langkah mitigasi risiko atau pemantauan berkala"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Akhir Hubungan</label>
                    <input 
                      type="date" 
                      value={regForm.relationEndDate} 
                      onChange={e => setRegForm({...regForm, relationEndDate: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reviewer KAP</label>
                    <input 
                      type="text" 
                      value={regForm.reviewer} 
                      onChange={e => setRegForm({...regForm, reviewer: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium" 
                      placeholder="Fridolinus Peno"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setIsAddRegisterOpen(false); setEditingRegister(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                >
                  {editingRegister ? 'Simpan Perubahan Register' : 'Tambahkan ke Register PMPJ'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CATAT TRANSAKSI PEMANTAUAN BARU */}
      {/* ========================================================================= */}
      {isAddMonitoringOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col font-sans overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  Form Catatan Pemantauan Transaksi & Indikasi TKM
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Monitoring kesesuaian transaksi terhadap profil CDD & Pelaporan PPATK
                </p>
              </div>
              <button 
                onClick={() => setIsAddMonitoringOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMonitoring} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">ID Pemantauan</label>
                  <input 
                    type="text" 
                    value={monForm.monitoringId} 
                    onChange={e => setMonForm({...monForm, monitoringId: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
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
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono" 
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900" 
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                    Rp {formatRupiahPmpj(Number(monForm.amount || 0))}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cara Pembayaran</label>
                  <select 
                    value={monForm.paymentMethod} 
                    onChange={e => setMonForm({...monForm, paymentMethod: e.target.value as any})}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                    placeholder="Nama pihak lawan transaksi"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tujuan / Uraian Transaksi</label>
                  <input 
                    type="text" 
                    value={monForm.purpose} 
                    onChange={e => setMonForm({...monForm, purpose: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" 
                    placeholder="Uraian peruntukan transaksi finansial"
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={monForm.matchesCddProfile}
                      onChange={e => setMonForm({...monForm, matchesCddProfile: e.target.checked})}
                      className="rounded text-blue-600"
                    />
                    <span className="text-[11px] font-medium text-slate-800">Sesuai Profil CDD</span>
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
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
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
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
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
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-rose-700"
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono" 
                    placeholder="GRIPS-2026-TKM-xxx"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
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
