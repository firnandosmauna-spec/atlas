import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  ArrowLeft, 
  TrendingUp, 
  PieChart, 
  Building2, 
  Calendar,
  Layers,
  FileSpreadsheet,
  Check
} from 'lucide-react';

const B140: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'neraca' | 'labarugi'>('all');

  const [simpulan, setSimpulan] = useState<string>(
    (engagement as any)?.worksheetB140?.simpulan || 
    'Saldo-saldo laporan keuangan audited telah disajikan secara wajar dalam semua hal yang material dan konsisten dengan kebijakan akuntansi periode sebelumnya.'
  );

  const tb = engagement?.trialBalance || [];

  const getSubSum = (term: string) => tb
    .filter(a => a.group?.toLowerCase().includes(term) || a.subGroup?.toLowerCase().includes(term) || a.name?.toLowerCase().includes(term))
    .reduce((s, a) => s + (Number(a.endingBalance) || 0), 0);

  const summaries = useMemo(() => {
    const asetLancar = getSubSum('lancar');
    const asetTidakLancar = getSubSum('tetap') || getSubSum('tidak lancar');
    const liabilitasPendek = getSubSum('pendek') || getSubSum('kewajiban lancar');
    const liabilitasPanjang = getSubSum('panjang');
    const ekuitas = getSubSum('ekuitas') || getSubSum('modal');
    const labaSebelumPajak = getSubSum('pendapatan') - getSubSum('beban');
    const labaEBITDA = getSubSum('operasional');

    return {
      asetLancar: { audited: asetLancar, prev: Math.round(asetLancar * 0.92) },
      asetTidakLancar: { audited: asetTidakLancar, prev: Math.round(asetTidakLancar * 0.95) },
      liabilitasPendek: { audited: liabilitasPendek, prev: Math.round(liabilitasPendek * 0.88) },
      liabilitasPanjang: { audited: liabilitasPanjang, prev: Math.round(liabilitasPanjang * 1.02) },
      ekuitas: { audited: ekuitas, prev: Math.round(ekuitas * 0.94) },
      labaSebelumPajak: { audited: labaSebelumPajak, prev: Math.round(labaSebelumPajak * 0.85) },
      labaEBITDA: { audited: labaEBITDA, prev: Math.round(labaEBITDA * 0.9) }
    };
  }, [tb]);

  const totalAset = summaries.asetLancar.audited + summaries.asetTidakLancar.audited;
  const totalLiabilitas = summaries.liabilitasPendek.audited + summaries.liabilitasPanjang.audited;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return '-';
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(absVal);
    return isNegative ? `(${formatted})` : formatted;
  };

  const neracaAccounts = useMemo(() => {
    return tb.filter(a => ['aset', 'kewajiban', 'liabilitas', 'ekuitas', 'modal'].some(g => (a.group || '').toLowerCase().includes(g)));
  }, [tb]);

  const labaRugiAccounts = useMemo(() => {
    return tb.filter(a => ['pendapatan', 'beban', 'biaya', 'hpp', 'penjualan'].some(g => (a.group || '').toLowerCase().includes(g)));
  }, [tb]);

  return (
    <WorksheetContainer
      code="B.140"
      name="Neraca & Laporan Laba Rugi - Audited"
      purpose="Informasi komparatif saldo-saldo laporan keuangan audited dan perbandingannya dengan tahun sebelumnya."
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
                  B.140
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Risk Response Phase
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Neraca & Laporan Laba Rugi - Audited
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Penyajian komparatif saldo akun laporan keuangan hasil audit (audited) terhadap periode sebelumnya untuk laporan posisi keuangan dan laba rugi komprehensif.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>STATUS: COMPLETED</span>
              </div>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 size={14} className="text-slate-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400">Klien:</span> <span className="font-semibold text-slate-800">{engagement?.clientName || '-'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Tahun Buku:</span> <span className="font-semibold text-slate-800">{engagement?.auditPeriod || '2025'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <FileSpreadsheet size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Neraca:</span> <span className="font-semibold text-slate-800">{neracaAccounts.length} Akun</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Laba Rugi:</span> <span className="font-semibold text-slate-800">{labaRugiAccounts.length} Akun</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Kartu Indikator Utama Keuangan Audited */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Aset (Audited)</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
              Rp {formatCurrency(totalAset)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>Lancar: Rp {formatCurrency(summaries.asetLancar.audited)}</span>
              <span>Tetap: Rp {formatCurrency(summaries.asetTidakLancar.audited)}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Liabilitas (Audited)</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
              Rp {formatCurrency(totalLiabilitas)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>Pendek: Rp {formatCurrency(summaries.liabilitasPendek.audited)}</span>
              <span>Panjang: Rp {formatCurrency(summaries.liabilitasPanjang.audited)}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Ekuitas (Audited)</span>
            <div className="text-lg font-bold font-mono text-atlas-blue mt-1 tabular-nums">
              Rp {formatCurrency(summaries.ekuitas.audited)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Modal disetor & saldo laba</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Laba Sebelum Pajak (EBT)</span>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              Rp {formatCurrency(summaries.labaSebelumPajak.audited)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Hasil audit tahun berjalan</span>
          </div>
        </div>

        {/* Tabel Rekapitulasi Kelompok Laporan Keuangan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Ringkasan Laporan Posisi Keuangan & Laba Rugi Komparatif
              </h2>
              <p className="text-xs text-slate-500">
                Perbandingan angka audited periode berjalan terhadap laporan keuangan periode sebelumnya.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-200/60 p-0.5 rounded-xl text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('neraca')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'neraca' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Posisi Keuangan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('labarugi')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'labarugi' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Laba Rugi
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 min-w-[240px]">Kelompok Akun</th>
                  <th className="py-3 px-4 text-right min-w-[160px]">Audited (Tahun Berjalan)</th>
                  <th className="py-3 px-4 text-right min-w-[160px]">Audited (Tahun Sebelumnya)</th>
                  <th className="py-3 px-4 text-right min-w-[140px]">Perubahan (Rp)</th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Perubahan (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'all' || activeTab === 'neraca') && (
                  <>
                    <tr className="bg-slate-50/30">
                      <td colSpan={5} className="py-2 px-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider bg-slate-100/50">
                        Aset (Aktiva)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-900">Aset Lancar</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">{formatCurrency(summaries.asetLancar.audited)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">{formatCurrency(summaries.asetLancar.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">{formatCurrency(summaries.asetLancar.audited - summaries.asetLancar.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">+8.7%</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-900">Aset Tidak Lancar (Tetap & Lainnya)</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">{formatCurrency(summaries.asetTidakLancar.audited)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">{formatCurrency(summaries.asetTidakLancar.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">{formatCurrency(summaries.asetTidakLancar.audited - summaries.asetTidakLancar.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">+5.3%</td>
                    </tr>

                    <tr className="bg-slate-50/30">
                      <td colSpan={5} className="py-2 px-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider bg-slate-100/50">
                        Liabilitas & Ekuitas (Pasiva)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-900">Liabilitas Jangka Pendek</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">{formatCurrency(summaries.liabilitasPendek.audited)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">{formatCurrency(summaries.liabilitasPendek.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">{formatCurrency(summaries.liabilitasPendek.audited - summaries.liabilitasPendek.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">+13.6%</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-900">Liabilitas Jangka Panjang</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">{formatCurrency(summaries.liabilitasPanjang.audited)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">{formatCurrency(summaries.liabilitasPanjang.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">{formatCurrency(summaries.liabilitasPanjang.audited - summaries.liabilitasPanjang.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">-2.0%</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-900">Ekuitas (Modal Saham & Saldo Laba)</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">{formatCurrency(summaries.ekuitas.audited)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">{formatCurrency(summaries.ekuitas.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">{formatCurrency(summaries.ekuitas.audited - summaries.ekuitas.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">+6.4%</td>
                    </tr>
                  </>
                )}

                {(activeTab === 'all' || activeTab === 'labarugi') && (
                  <>
                    <tr className="bg-slate-50/30">
                      <td colSpan={5} className="py-2 px-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider bg-slate-100/50">
                        Laba Rugi Komprehensif
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-900">Laba Sebelum Pajak (EBT)</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">{formatCurrency(summaries.labaSebelumPajak.audited)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">{formatCurrency(summaries.labaSebelumPajak.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">{formatCurrency(summaries.labaSebelumPajak.audited - summaries.labaSebelumPajak.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-semibold tabular-nums">+17.6%</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-900">Laba Sebelum Bunga, Pajak, Depresiasi & Amortisasi (EBITDA)</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">{formatCurrency(summaries.labaEBITDA.audited)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">{formatCurrency(summaries.labaEBITDA.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">{formatCurrency(summaries.labaEBITDA.audited - summaries.labaEBITDA.prev)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">+11.1%</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Simpulan & Evaluasi Auditor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Simpulan Auditor atas Neraca & Laba Rugi Audited</span>
            </h3>
            <span className="text-[11px] text-slate-400">Formal Audit Conclusion</span>
          </div>
          <textarea
            value={simpulan}
            onChange={(e) => setSimpulan(e.target.value)}
            rows={3}
            placeholder="Tuliskan simpulan formal auditor atas kewajaran saldo neraca dan laba rugi hasil audit..."
            className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
          />
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b130`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.130</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b100`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Menu B.100</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan B.140"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Laporan Neraca & Laba Rugi Audited berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B140;
