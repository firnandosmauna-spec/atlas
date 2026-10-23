import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink,
  Plus,
  Trash2,
  Building2,
  Coins,
  ShieldCheck,
  FileText,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export interface AuditProcedure {
  no: number;
  category: 'Prosedur Analitis Substantif' | 'Pemeriksaan Fisik Kas (Cash Count)' | 'Konfirmasi Bank (SA 505)' | 'Pengujian Rekonsiliasi & Pisah Batas';
  text: string;
  asersi: string;
}

export interface BankConfirmationItem {
  id: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  bookBalance: number;
  confirmedBalance: number;
  status: 'Cocok (Match)' | 'Selisih Direkonsiliasi' | 'Belum Diterima' | 'Konfirmasi Tidak Dijawab';
  keterangan: string;
}

export interface CashCountRecord {
  location: string;
  custodian: string;
  countDate: string;
  physicalBalance: number;
  bookBalance: number;
  status: 'Sesuai' | 'Selisih Lebih (Surplus)' | 'Selisih Kurang (Shortage)';
  notes: string;
}

const DEFAULT_PROCEDURES: AuditProcedure[] = [
  {
    no: 1,
    category: 'Prosedur Analitis Substantif',
    text: 'Membandingkan saldo kas dan bank tahun berjalan dengan periode sebelumnya serta menguji kewajaran fluktuasi bulanan.',
    asersi: 'Keberadaan (E), Kelengkapan (C)'
  },
  {
    no: 2,
    category: 'Prosedur Analitis Substantif',
    text: 'Mengevaluasi rasio kas (cash ratio) dan menghubungkan pergerakan kas dengan laporan arus kas operasional.',
    asersi: 'Penilaian & Alokasi (V)'
  },
  {
    no: 3,
    category: 'Pemeriksaan Fisik Kas (Cash Count)',
    text: 'Melakukan pemeriksaan fisik kas (cash count) mendadak atas kas kecil dan kas di brankas per tanggal neraca didampingi pemegang kas.',
    asersi: 'Keberadaan (E), Hak & Kewajiban (R)'
  },
  {
    no: 4,
    category: 'Pemeriksaan Fisik Kas (Cash Count)',
    text: 'Memeriksa bon sementara (IOU) atau bukti pengeluaran kas yang belum diganti (reimburse) dan memastikan pisah batas yang tepat.',
    asersi: 'Kelengkapan (C), Pisah Batas'
  },
  {
    no: 5,
    category: 'Konfirmasi Bank (SA 505)',
    text: 'Mengirimkan surat konfirmasi bank independen secara langsung ke seluruh bank rekanan klien (termasuk rekening saldo nihil dan rekening ditutup).',
    asersi: 'Keberadaan (E), Hak & Kewajiban (R), Kelengkapan (C)'
  },
  {
    no: 6,
    category: 'Konfirmasi Bank (SA 505)',
    text: 'Mencocokkan jawaban konfirmasi bank dengan catatan pembukuan klien dan mengidentifikasi rekening jaminan pinjaman / fasilitas kredit.',
    asersi: 'Kelengkapan (C), Penilaian & Alokasi (V)'
  },
  {
    no: 7,
    category: 'Pengujian Rekonsiliasi & Pisah Batas',
    text: 'Melakukan pengujian rekonsiliasi bank per tanggal neraca, menguji setoran dalam perjalanan (deposits in transit) dan cek beredar (outstanding checks) ke rekening koran bulan berikutnya.',
    asersi: 'Keberadaan (E), Kelengkapan (C), Penilaian & Alokasi (V)'
  },
  {
    no: 8,
    category: 'Pengujian Rekonsiliasi & Pisah Batas',
    text: 'Memeriksa pisah batas (cut-off) transaksi penerimaan dan pengeluaran kas 5 hari sebelum dan sesudah tanggal laporan keuangan.',
    asersi: 'Pisah Batas, Kelengkapan (C)'
  },
  {
    no: 9,
    category: 'Pengujian Rekonsiliasi & Pisah Batas',
    text: 'Memverifikasi ada tidaknya kas yang dibatasi penggunaannya (restricted cash, dana jaminan, rekening escrow) dan kelayakan pengungkapannya pada CALK.',
    asersi: 'Penyajian & Pengungkapan (P&D)'
  }
];

const DEFAULT_BANK_ACCOUNTS: BankConfirmationItem[] = [
  {
    id: 'bank-1',
    bankName: 'PT Bank Mandiri (Persero) Tbk',
    accountNumber: '123-00-9876543-2',
    currency: 'IDR',
    bookBalance: 325450000,
    confirmedBalance: 325450000,
    status: 'Cocok (Match)',
    keterangan: 'Konfirmasi telah dikonfirmasi bank dan cocok 100%'
  },
  {
    id: 'bank-2',
    bankName: 'PT Bank Central Asia Tbk',
    accountNumber: '542-0198821',
    currency: 'IDR',
    bookBalance: 245800000,
    confirmedBalance: 247050000,
    status: 'Selisih Direkonsiliasi',
    keterangan: 'Terdapat biaya administrasi bank Rp 1.250.000 belum dicatat'
  },
  {
    id: 'bank-3',
    bankName: 'PT Bank Rakyat Indonesia Tbk',
    accountNumber: '0341-01-002198-50-3',
    currency: 'IDR',
    bookBalance: 65200000,
    confirmedBalance: 65200000,
    status: 'Cocok (Match)',
    keterangan: 'Rekening operasional payroll karyawan'
  },
  {
    id: 'bank-4',
    bankName: 'PT Bank Mandiri - Deposito 1 Bulan',
    accountNumber: '123-02-1100223-8',
    currency: 'IDR',
    bookBalance: 150000000,
    confirmedBalance: 150000000,
    status: 'Cocok (Match)',
    keterangan: 'Bunga 4.25% p.a., jatuh tempo rolling bulanan'
  }
];

const BankProsedur = ({ indeks = 'I' }: { indeks?: string }) => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'prosedur' | 'konfirmasi' | 'cashcount' | 'simpulan'>('prosedur');

  const storageKey = `atlas_kas_setara_kas_${engagement?.id || 'default'}`;

  // State management
  const [prosedurState, setProsedurState] = useState<Record<number, { status: string; pic: string; ref: string }>>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_prosedur`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const init: Record<number, { status: string; pic: string; ref: string }> = {};
    DEFAULT_PROCEDURES.forEach(p => {
      init[p.no] = {
        status: 'DILAKUKAN',
        pic: engagement?.auditorName || 'Auditor',
        ref: `KKP-KAS-${p.no}`
      };
    });
    return init;
  });

  const [bankConfirmations, setBankConfirmations] = useState<BankConfirmationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_bank`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_BANK_ACCOUNTS;
  });

  const [cashCountData, setCashCountData] = useState<CashCountRecord>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_cashcount`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      location: 'Kantor Pusat - Ruang Keuangan',
      custodian: 'Dewi Lestari (Kasir Utama)',
      countDate: new Date().toISOString().split('T')[0],
      physicalBalance: 15000000,
      bookBalance: 15000000,
      status: 'Sesuai',
      notes: 'Pemeriksaan fisik kas disaksikan oleh kasir dan auditor, tidak ditemukan selisih.'
    };
  });

  const [simpulan, setSimpulan] = useState(() => {
    return localStorage.getItem(`${storageKey}_simpulan`) || 'Akun tersebut telah disajikan secara wajar';
  });

  const [catatanSimpulan, setCatatanSimpulan] = useState(() => {
    return localStorage.getItem(`${storageKey}_catatan`) || 
      'Berdasarkan pengujian substantif atas kas dan setara kas yang meliputi pemeriksaan fisik kas, konfirmasi saldo bank secara langsung (SA 505), serta pengujian rekonsiliasi bank dan pisah batas, disimpulkan bahwa saldo kas dan setara kas per 31 Desember telah disajikan secara wajar dan bebas dari salah saji material.';
  });

  // Auto-persist
  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_prosedur`, JSON.stringify(prosedurState));
      localStorage.setItem(`${storageKey}_bank`, JSON.stringify(bankConfirmations));
      localStorage.setItem(`${storageKey}_cashcount`, JSON.stringify(cashCountData));
      localStorage.setItem(`${storageKey}_simpulan`, simpulan);
      localStorage.setItem(`${storageKey}_catatan`, catatanSimpulan);
    } catch {
      // ignore
    }
  }, [prosedurState, bankConfirmations, cashCountData, simpulan, catatanSimpulan, storageKey]);

  // Calculations
  const totalBukuBank = useMemo(() => {
    return bankConfirmations.reduce((sum, item) => sum + (Number(item.bookBalance) || 0), 0);
  }, [bankConfirmations]);

  const totalKonfirmasiBank = useMemo(() => {
    return bankConfirmations.reduce((sum, item) => sum + (Number(item.confirmedBalance) || 0), 0);
  }, [bankConfirmations]);

  const selisihBank = totalKonfirmasiBank - totalBukuBank;

  const handleUpdateProsedur = (no: number, field: string, value: string) => {
    setProsedurState(prev => ({
      ...prev,
      [no]: {
        ...(prev[no] || { status: 'DILAKUKAN', pic: '', ref: '' }),
        [field]: value
      }
    }));
  };

  const handleAddBank = () => {
    const newBank: BankConfirmationItem = {
      id: `bank-${Date.now()}`,
      bankName: 'Bank Baru',
      accountNumber: '000-00-00000',
      currency: 'IDR',
      bookBalance: 0,
      confirmedBalance: 0,
      status: 'Belum Diterima',
      keterangan: ''
    };
    setBankConfirmations(prev => [...prev, newBank]);
  };

  const handleDeleteBank = (id: string) => {
    setBankConfirmations(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateBank = (id: string, field: keyof BankConfirmationItem, val: any) => {
    setBankConfirmations(prev => prev.map(b => b.id === id ? { ...b, [field]: val } : b));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <WorksheetContainer
      code="B.210"
      name="Kas dan Setara Kas"
      purpose="Pelaksanaan program audit substantif kas dan setara kas (SA 500, SA 505) meliputi cash count, konfirmasi bank, dan rekonsiliasi."
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
                  Indeks I
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  SA 500 & SA 505
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Kas dan Setara Kas (Lead Schedule & Prosedur Audit)
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Pengujian keberadaan, kelengkapan, hak dan kewajiban, serta penilaian saldo kas dan rekening bank klien per tanggal neraca.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>STATUS: TERVERIFIKASI</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="p-2 rounded-lg bg-blue-100 text-atlas-blue shrink-0">
                <Building2 size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Total Saldo Bank (Per Buku)</p>
                <p className="font-bold text-slate-900 text-sm">{formatCurrency(totalBukuBank)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Total Hasil Konfirmasi Bank</p>
                <p className="font-bold text-emerald-700 text-sm">{formatCurrency(totalKonfirmasiBank)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <Coins size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Kas Fisik (Cash Count)</p>
                <p className="font-bold text-slate-900 text-sm">{formatCurrency(cashCountData.physicalBalance)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Modern */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('prosedur')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'prosedur'
                ? 'bg-atlas-blue text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText size={14} />
            <span>Program Prosedur Audit ({DEFAULT_PROCEDURES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('konfirmasi')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'konfirmasi'
                ? 'bg-atlas-blue text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 size={14} />
            <span>Konfirmasi Bank SA 505 ({bankConfirmations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cashcount')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cashcount'
                ? 'bg-atlas-blue text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Coins size={14} />
            <span>Berita Acara Cash Count</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simpulan')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simpulan'
                ? 'bg-atlas-blue text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Simpulan Auditor</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PROGRAM PROSEDUR AUDIT KAS                       */}
        {/* ======================================================== */}
        {activeTab === 'prosedur' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Pelaksanaan Prosedur Substantif Kas & Setara Kas
                </h2>
                <p className="text-xs text-slate-500">
                  Tentukan status pelaksanaan, inisial pemeriksa (PIC), dan indeks kertas kerja pendukung.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Total {DEFAULT_PROCEDURES.length} Langkah Prosedur
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 min-w-[340px]">Langkah Pengujian Audit</th>
                    <th className="py-3 px-4 min-w-[160px]">Asersi Audit</th>
                    <th className="py-3 px-4 min-w-[160px]">Status Pelaksanaan</th>
                    <th className="py-3 px-4 w-28">PIC</th>
                    <th className="py-3 px-4 w-32">Indeks KKP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DEFAULT_PROCEDURES.map((proc, idx) => {
                    const state = prosedurState[proc.no] || { status: 'DILAKUKAN', pic: '', ref: '' };
                    const isNewCategory = idx === 0 || DEFAULT_PROCEDURES[idx - 1].category !== proc.category;

                    return (
                      <React.Fragment key={proc.no}>
                        {isNewCategory && (
                          <tr className="bg-slate-50/90 font-bold text-atlas-blue text-[11px]">
                            <td colSpan={6} className="py-2.5 px-4">
                              {proc.category}
                            </td>
                          </tr>
                        )}
                        <tr className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                            {proc.no}
                          </td>
                          <td className="py-3 px-4 text-slate-800 font-medium leading-relaxed">
                            {proc.text}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                              {proc.asersi}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={state.status}
                              onChange={(e) => handleUpdateProsedur(proc.no, 'status', e.target.value)}
                              className={`w-full text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none border cursor-pointer transition-all ${
                                state.status === 'DILAKUKAN'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : state.status === 'TIDAK DILAKUKAN'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <option value="DILAKUKAN">DILAKUKAN</option>
                              <option value="TIDAK DILAKUKAN">TIDAK DILAKUKAN</option>
                              <option value="TIDAK RELEVAN">TIDAK RELEVAN</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={state.pic}
                              onChange={(e) => handleUpdateProsedur(proc.no, 'pic', e.target.value)}
                              placeholder="PIC"
                              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:bg-white focus:border-atlas-blue"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={state.ref}
                              onChange={(e) => handleUpdateProsedur(proc.no, 'ref', e.target.value)}
                              placeholder="Ref KKP"
                              className="w-full text-xs text-atlas-blue font-mono font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:bg-white focus:border-atlas-blue"
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: KONFIRMASI BANK SA 505                           */}
        {/* ======================================================== */}
        {activeTab === 'konfirmasi' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Daftar Rekening & Hasil Konfirmasi Bank (SA 505)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pencatatan konfirmasi independen langsung dari bank rekanan per 31 Desember.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddBank}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Rekening Bank</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 min-w-[200px]">Nama Bank Rekanan</th>
                      <th className="py-3 px-4 min-w-[140px]">Nomor Rekening</th>
                      <th className="py-3 px-4 min-w-[140px] text-right">Saldo Per Buku</th>
                      <th className="py-3 px-4 min-w-[140px] text-right">Saldo Konfirmasi</th>
                      <th className="py-3 px-4 min-w-[160px]">Status Hasil</th>
                      <th className="py-3 px-4 min-w-[200px]">Keterangan Rekonsiliasi</th>
                      <th className="py-3 px-4 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bankConfirmations.map((bank) => (
                      <tr key={bank.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={bank.bankName}
                            onChange={(e) => handleUpdateBank(bank.id, 'bankName', e.target.value)}
                            className="w-full font-semibold text-slate-900 bg-transparent border-0 border-b border-transparent focus:border-atlas-blue outline-none"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={bank.accountNumber}
                            onChange={(e) => handleUpdateBank(bank.id, 'accountNumber', e.target.value)}
                            className="w-full font-mono text-slate-600 bg-transparent border-0 border-b border-transparent focus:border-atlas-blue outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            value={bank.bookBalance}
                            onChange={(e) => handleUpdateBank(bank.id, 'bookBalance', Number(e.target.value))}
                            className="w-full text-right font-mono font-medium text-slate-900 bg-transparent border-0 border-b border-transparent focus:border-atlas-blue outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            value={bank.confirmedBalance}
                            onChange={(e) => handleUpdateBank(bank.id, 'confirmedBalance', Number(e.target.value))}
                            className="w-full text-right font-mono font-bold text-emerald-700 bg-transparent border-0 border-b border-transparent focus:border-atlas-blue outline-none"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={bank.status}
                            onChange={(e) => handleUpdateBank(bank.id, 'status', e.target.value as any)}
                            className="w-full text-xs font-semibold rounded-lg px-2.5 py-1.5 bg-slate-50 border border-slate-200 outline-none cursor-pointer"
                          >
                            <option value="Cocok (Match)">Cocok (Match)</option>
                            <option value="Selisih Direkonsiliasi">Selisih Direkonsiliasi</option>
                            <option value="Belum Diterima">Belum Diterima</option>
                            <option value="Konfirmasi Tidak Dijawab">Konfirmasi Tidak Dijawab</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={bank.keterangan}
                            onChange={(e) => handleUpdateBank(bank.id, 'keterangan', e.target.value)}
                            placeholder="Catatan rekonsiliasi..."
                            className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 outline-none focus:bg-white focus:border-atlas-blue"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteBank(bank.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Rekening"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                      <td colSpan={2} className="py-3 px-4 text-right uppercase text-[11px] tracking-wider">
                        Total Saldo Bank
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatCurrency(totalBukuBank)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">
                        {formatCurrency(totalKonfirmasiBank)}
                      </td>
                      <td colSpan={3} className="py-3 px-4 text-xs font-semibold">
                        {selisihBank !== 0 ? (
                          <span className="text-amber-700 flex items-center gap-1">
                            <AlertCircle size={14} /> Selisih: {formatCurrency(Math.abs(selisihBank))} (Lihat Rekonsiliasi)
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Seluruh konfirmasi bank cocok sempurna
                          </span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CASH COUNT / FISIK KAS                           */}
        {/* ======================================================== */}
        {activeTab === 'cashcount' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Coins size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Berita Acara Pemeriksaan Fisik Kas (Cash Count)
                </h2>
                <p className="text-xs text-slate-500">
                  Dokumentasi penghitungan fisik kas kecil dan uang tunai per tanggal neraca.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lokasi Penghitungan Kas</label>
                <input
                  type="text"
                  value={cashCountData.location}
                  onChange={(e) => setCashCountData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-atlas-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Pemegang Kas (Custodian)</label>
                <input
                  type="text"
                  value={cashCountData.custodian}
                  onChange={(e) => setCashCountData(prev => ({ ...prev, custodian: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-atlas-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Cash Count</label>
                <input
                  type="date"
                  value={cashCountData.countDate}
                  onChange={(e) => setCashCountData(prev => ({ ...prev, countDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-atlas-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Hasil Fisik</label>
                <select
                  value={cashCountData.status}
                  onChange={(e) => setCashCountData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-atlas-blue cursor-pointer"
                >
                  <option value="Sesuai">Sesuai (Balance)</option>
                  <option value="Selisih Lebih (Surplus)">Selisih Lebih (Surplus)</option>
                  <option value="Selisih Kurang (Shortage)">Selisih Kurang (Shortage)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Saldo Fisik Uang Tunai (Rp)</label>
                <input
                  type="number"
                  value={cashCountData.physicalBalance}
                  onChange={(e) => setCashCountData(prev => ({ ...prev, physicalBalance: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-atlas-blue font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Saldo Buku Kas (Rp)</label>
                <input
                  type="number"
                  value={cashCountData.bookBalance}
                  onChange={(e) => setCashCountData(prev => ({ ...prev, bookBalance: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-atlas-blue font-mono text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">Catatan & Temuan Fisik Kas</label>
              <textarea
                rows={3}
                value={cashCountData.notes}
                onChange={(e) => setCashCountData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-atlas-blue text-xs text-slate-800"
                placeholder="Tuliskan catatan pemeriksaan fisik kas..."
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SIMPULAN AUDITOR                                 */}
        {/* ======================================================== */}
        {activeTab === 'simpulan' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Simpulan Audit atas Kas dan Setara Kas
                </h2>
                <p className="text-xs text-slate-500">
                  Perumusan kesimpulan apakah akun telah disajikan secara wajar sesuai PSAK / SAK.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Wajib Diisi
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Keputusan Kesimpulan Audit
                </label>
                <select
                  value={simpulan}
                  onChange={(e) => setSimpulan(e.target.value)}
                  className="w-full max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-atlas-blue cursor-pointer"
                >
                  <option value="Akun tersebut telah disajikan secara wajar">
                    Akun tersebut telah disajikan secara wajar
                  </option>
                  <option value="Akun tersebut belum sepenuhnya disajikan secara wajar">
                    Akun tersebut belum sepenuhnya disajikan secara wajar
                  </option>
                  <option value="Akun tersebut tidak disajikan secara wajar">
                    Akun tersebut tidak disajikan secara wajar
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Uraian Pertimbangan & Dasar Kesimpulan Auditor
                </label>
                <textarea
                  rows={4}
                  value={catatanSimpulan}
                  onChange={(e) => setCatatanSimpulan(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-atlas-blue leading-relaxed"
                  placeholder="Uraikan justifikasi audit..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b120`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.120 (Lead Schedule)</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan Prosedur Kas"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Prosedur audit Kas dan Setara Kas berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default BankProsedur;
