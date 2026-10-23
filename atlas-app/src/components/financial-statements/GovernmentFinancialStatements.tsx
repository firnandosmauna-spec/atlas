import React from 'react';
import type { Account } from '../../store/engagementStore';
import { 
  calculateLO, 
  calculateLRA, 
  calculateLAK, 
  calculateLPSAL 
} from '../../utils/sapFinancialStatements';
import { 
  Building2, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Props {
  accounts: Account[];
  activeStatement: 'LO' | 'LRA' | 'LAK' | 'LPSAL';
  clientName: string;
  period: string;
  currency: string;
  unit: string;
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(val);
};

export const GovernmentFinancialStatements: React.FC<Props> = ({
  accounts,
  activeStatement,
  clientName,
  period,
  currency,
  unit
}) => {
  const lo = calculateLO(accounts);
  const lra = calculateLRA(accounts);
  const lak = calculateLAK(accounts, lra);
  const lpsal = calculateLPSAL(accounts, lra.silpa);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col font-sans">
      
      {/* ── HEADER FORMAL LAPORAN KEUANGAN ── */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 p-4 sm:p-5 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-1">
          <Building2 size={13} />
          <span>Standar Akuntansi Pemerintahan (SAP PP No. 71/2010)</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
          {clientName || 'PEMERINTAH DAERAH / ENTITAS BLU'}
        </h2>
        <h3 className="text-xs sm:text-sm font-bold text-atlas-blue uppercase tracking-wider">
          {activeStatement === 'LO' && 'Laporan Operasional (LO)'}
          {activeStatement === 'LRA' && 'Laporan Realisasi Anggaran (LRA)'}
          {activeStatement === 'LAK' && 'Laporan Arus Kas (LAK)'}
          {activeStatement === 'LPSAL' && 'Laporan Perubahan Saldo Anggaran Lebih (LPSAL)'}
        </h3>
        <p className="text-[11px] text-slate-500">
          Untuk Periode yang Berakhir per 31 Desember {period || '2025'} | Mata Uang: {currency} ({unit})
        </p>
      </div>

      {/* ── KONTEN STATEMENTS SESUAI TAB YANG AKTIF ── */}
      <div className="p-4 sm:p-6 space-y-5 text-xs">
        
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* 1. LAPORAN OPERASIONAL (LO)                                           */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeStatement === 'LO' && (
          <div className="space-y-4">
            
            {/* Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Total Pendapatan-LO</span>
                <span className="text-base sm:text-lg font-bold text-blue-900 mt-0.5 block">
                  Rp {formatRupiah(lo.totalPendapatan)}
                </span>
                <span className="text-[10px] text-blue-600">Hak pemerintah yang diakui penambah ekuitas</span>
              </div>

              <div className="bg-rose-50/60 border border-rose-200/80 rounded-lg p-3">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Total Beban-LO</span>
                <span className="text-base sm:text-lg font-bold text-rose-900 mt-0.5 block">
                  Rp {formatRupiah(lo.totalBeban)}
                </span>
                <span className="text-[10px] text-rose-600">Kewajiban pemerintah penurun ekuitas</span>
              </div>

              <div className={`border rounded-lg p-3 ${lo.surplusDefisitAkhir >= 0 ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900' : 'bg-amber-50/60 border-amber-200/80 text-amber-900'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider block">Surplus / (Defisit) - LO</span>
                <span className="text-base sm:text-lg font-bold mt-0.5 block">
                  {lo.surplusDefisitAkhir < 0 ? `(Rp ${formatRupiah(Math.abs(lo.surplusDefisitAkhir))})` : `Rp ${formatRupiah(lo.surplusDefisitAkhir)}`}
                </span>
                <span className="text-[10px]">
                  {lo.surplusDefisitAkhir >= 0 ? 'Surplus Operasional entitas' : 'Defisit Operasional entitas'}
                </span>
              </div>
            </div>

            {/* Table LO */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4 w-28">Kode Akun</th>
                    <th className="py-2.5 px-4">Uraian Akun Operasional</th>
                    <th className="py-2.5 px-4 w-36 text-right">Rincian (Rp)</th>
                    <th className="py-2.5 px-4 w-40 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* I. PENDAPATAN-LO */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>I. KEGIATAN OPERASIONAL - PENDAPATAN-LO</td>
                  </tr>
                  {lo.pendapatanAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(Math.abs(acc.endingBalance || acc.credit - acc.debit))}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  {lo.pendapatanAccounts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-center text-slate-400 italic">
                        Belum ada akun dipetakan ke Pendapatan-LO
                      </td>
                    </tr>
                  )}
                  <tr className="bg-blue-50/40 font-bold text-blue-900 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>JUMLAH PENDAPATAN-LO</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(lo.totalPendapatan)}</td>
                  </tr>

                  {/* II. BEBAN-LO */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>II. BEBAN-LO</td>
                  </tr>
                  {lo.bebanAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(Math.abs(acc.endingBalance || acc.debit - acc.credit))}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  {lo.bebanAccounts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-center text-slate-400 italic">
                        Belum ada akun dipetakan ke Beban-LO
                      </td>
                    </tr>
                  )}
                  <tr className="bg-rose-50/40 font-bold text-rose-900 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>JUMLAH BEBAN-LO</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(lo.totalBeban)}</td>
                  </tr>

                  {/* SURPLUS / DEFISIT AKHIR */}
                  <tr className="bg-slate-900 text-white font-bold text-xs">
                    <td className="py-3 px-4" colSpan={3}>
                      SURPLUS / (DEFISIT) DARI OPERASI - LO
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {lo.surplusDefisitAkhir < 0 
                        ? `(Rp ${formatRupiah(Math.abs(lo.surplusDefisitAkhir))})` 
                        : `Rp ${formatRupiah(lo.surplusDefisitAkhir)}`}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* 2. LAPORAN REALISASI ANGGARAN (LRA)                                   */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeStatement === 'LRA' && (
          <div className="space-y-4">
            
            {/* Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-2.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Pendapatan-LRA</span>
                <span className="text-base font-bold text-emerald-900 mt-0.5 block">
                  Rp {formatRupiah(lra.totalPendapatanRealisasi)}
                </span>
                <span className="text-[10px] text-emerald-700">Realisasi Pendapatan</span>
              </div>

              <div className="bg-rose-50/60 border border-rose-200/80 rounded-lg p-2.5">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Total Belanja-LRA</span>
                <span className="text-base font-bold text-rose-900 mt-0.5 block">
                  Rp {formatRupiah(lra.totalBelanjaRealisasi)}
                </span>
                <span className="text-[10px] text-rose-700">Operasi, Modal & Tak Terduga</span>
              </div>

              <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-2.5">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Pembiayaan Netto</span>
                <span className="text-base font-bold text-blue-900 mt-0.5 block">
                  Rp {formatRupiah(lra.pembiayaanNetto)}
                </span>
                <span className="text-[10px] text-blue-700">Penerimaan - Pengeluaran</span>
              </div>

              <div className={`border rounded-lg p-2.5 ${lra.silpa >= 0 ? 'bg-purple-50/60 border-purple-200/80 text-purple-900' : 'bg-red-50/60 border-red-200/80 text-red-900'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider block">SiLPA / (SiKPA)</span>
                <span className="text-base font-bold mt-0.5 block">
                  Rp {formatRupiah(lra.silpa)}
                </span>
                <span className="text-[10px]">Sisa Lebih Pembiayaan Anggaran</span>
              </div>
            </div>

            {/* Table LRA */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3 w-28">Kode Akun</th>
                      <th className="py-2.5 px-3">Uraian Realisasi Anggaran</th>
                      <th className="py-2.5 px-3 w-32 text-right">Anggaran (Rp)</th>
                      <th className="py-2.5 px-3 w-32 text-right">Realisasi (Rp)</th>
                      <th className="py-2.5 px-3 w-28 text-right">Selisih (Varian)</th>
                      <th className="py-2.5 px-3 w-20 text-center">% Real</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    
                    {/* I. PENDAPATAN-LRA */}
                    <tr className="bg-slate-50 font-bold text-slate-800">
                      <td className="py-2 px-3" colSpan={6}>1. PENDAPATAN-LRA</td>
                    </tr>
                    {lra.pendapatanAccounts.map(acc => {
                      const ang = acc.budget || Math.abs(acc.endingBalance || acc.credit);
                      const real = Math.abs(acc.endingBalance || acc.credit);
                      const selisih = real - ang;
                      const persen = ang > 0 ? (real / ang) * 100 : 100;
                      return (
                        <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                          <td className="py-2 px-3 pl-6 text-slate-800 font-medium">{acc.name}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700">{formatRupiah(ang)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatRupiah(real)}</td>
                          <td className={`py-2 px-3 text-right font-mono ${selisih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {formatRupiah(selisih)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-semibold text-slate-800">
                            {persen.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-emerald-50/40 font-bold text-emerald-950 border-t border-slate-200">
                      <td className="py-2 px-3" colSpan={2}>JUMLAH PENDAPATAN-LRA</td>
                      <td className="py-2 px-3 text-right font-mono">{formatRupiah(lra.totalPendapatanAnggaran)}</td>
                      <td className="py-2 px-3 text-right font-mono">Rp {formatRupiah(lra.totalPendapatanRealisasi)}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatRupiah(lra.totalPendapatanRealisasi - lra.totalPendapatanAnggaran)}</td>
                      <td className="py-2 px-3 text-center font-mono">
                        {lra.totalPendapatanAnggaran > 0 ? ((lra.totalPendapatanRealisasi / lra.totalPendapatanAnggaran) * 100).toFixed(1) : '100'}%
                      </td>
                    </tr>

                    {/* II. BELANJA-LRA */}
                    <tr className="bg-slate-50 font-bold text-slate-800">
                      <td className="py-2 px-3" colSpan={6}>2. BELANJA-LRA</td>
                    </tr>
                    {lra.belanjaAccounts.map(acc => {
                      const ang = acc.budget || Math.abs(acc.endingBalance || acc.debit);
                      const real = Math.abs(acc.endingBalance || acc.debit);
                      const selisih = ang - real;
                      const persen = ang > 0 ? (real / ang) * 100 : 100;
                      return (
                        <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                          <td className="py-2 px-3 pl-6 text-slate-800 font-medium">{acc.name}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700">{formatRupiah(ang)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatRupiah(real)}</td>
                          <td className={`py-2 px-3 text-right font-mono ${selisih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {formatRupiah(selisih)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-semibold text-slate-800">
                            {persen.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-rose-50/40 font-bold text-rose-950 border-t border-slate-200">
                      <td className="py-2 px-3" colSpan={2}>JUMLAH BELANJA-LRA</td>
                      <td className="py-2 px-3 text-right font-mono">{formatRupiah(lra.totalBelanjaAnggaran)}</td>
                      <td className="py-2 px-3 text-right font-mono">Rp {formatRupiah(lra.totalBelanjaRealisasi)}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatRupiah(lra.totalBelanjaAnggaran - lra.totalBelanjaRealisasi)}</td>
                      <td className="py-2 px-3 text-center font-mono">
                        {lra.totalBelanjaAnggaran > 0 ? ((lra.totalBelanjaRealisasi / lra.totalBelanjaAnggaran) * 100).toFixed(1) : '100'}%
                      </td>
                    </tr>

                    {/* SURPLUS / DEFISIT */}
                    <tr className="bg-amber-50/50 font-bold text-slate-900 border-t border-slate-300">
                      <td className="py-2 px-3" colSpan={2}>SURPLUS / (DEFISIT) LRA</td>
                      <td className="py-2 px-3 text-right font-mono">{formatRupiah(lra.surplusDefisitAnggaran)}</td>
                      <td className="py-2 px-3 text-right font-mono">Rp {formatRupiah(lra.surplusDefisitLRA)}</td>
                      <td className="py-2 px-3 text-right font-mono">-</td>
                      <td className="py-2 px-3 text-center font-mono">-</td>
                    </tr>

                    {/* III. PEMBIAYAAN */}
                    <tr className="bg-slate-50 font-bold text-slate-800">
                      <td className="py-2 px-3" colSpan={6}>3. PEMBIAYAAN DAERAH (NETTO)</td>
                    </tr>
                    <tr className="text-slate-700">
                      <td className="py-1.5 px-3 font-mono text-[11px] text-slate-400">6.1</td>
                      <td className="py-1.5 px-3 pl-6">Penerimaan Pembiayaan (Penggunaan SiLPA tahun lalu)</td>
                      <td className="py-1.5 px-3 text-right font-mono">{formatRupiah(lra.totalPenerimaanPembiayaan)}</td>
                      <td className="py-1.5 px-3 text-right font-mono">{formatRupiah(lra.totalPenerimaanPembiayaan)}</td>
                      <td className="py-1.5 px-3 text-right font-mono">0</td>
                      <td className="py-1.5 px-3 text-center font-mono">100%</td>
                    </tr>
                    <tr className="text-slate-700">
                      <td className="py-1.5 px-3 font-mono text-[11px] text-slate-400">6.2</td>
                      <td className="py-1.5 px-3 pl-6">Pengeluaran Pembiayaan (Penyertaan Modal)</td>
                      <td className="py-1.5 px-3 text-right font-mono">({formatRupiah(lra.totalPengeluaranPembiayaan)})</td>
                      <td className="py-1.5 px-3 text-right font-mono">({formatRupiah(lra.totalPengeluaranPembiayaan)})</td>
                      <td className="py-1.5 px-3 text-right font-mono">0</td>
                      <td className="py-1.5 px-3 text-center font-mono">100%</td>
                    </tr>

                    {/* SiLPA AKHIR */}
                    <tr className="bg-slate-900 text-white font-bold text-xs">
                      <td className="py-3 px-3" colSpan={3}>
                        SISA LEBIH / (KURANG) PEMBIAYAAN ANGGARAN (SiLPA / SiKPA)
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400">
                        Rp {formatRupiah(lra.silpa)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono" colSpan={2}>
                        Terhubung ke LPSAL
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* 3. LAPORAN ARUS KAS (LAK)                                             */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeStatement === 'LAK' && (
          <div className="space-y-4">
            
            {/* Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Arus Kas Operasi (Bersih)</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 mt-0.5 block">
                  Rp {formatRupiah(lak.arusKasBersihOperasi)}
                </span>
                <span className="text-[10px] text-emerald-700">Penerimaan vs Pengeluaran Operasi</span>
              </div>

              <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Kenaikan / (Penurunan) Kas</span>
                <span className="text-base sm:text-lg font-bold text-blue-900 mt-0.5 block">
                  {lak.kenaikanKas >= 0 ? `Rp ${formatRupiah(lak.kenaikanKas)}` : `(Rp ${formatRupiah(Math.abs(lak.kenaikanKas))})`}
                </span>
                <span className="text-[10px] text-blue-700">Net perubahan kas periode berjalan</span>
              </div>

              <div className="bg-slate-900 text-white rounded-lg p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-300">Saldo Akhir Kas & Setara Kas</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5 block">
                  Rp {formatRupiah(lak.saldoAkhirKas)}
                </span>
                <span className="text-[10px] text-slate-400">Cocok dengan Pos Kas di Neraca SAP</span>
              </div>
            </div>

            {/* Table LAK */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Aktivitas Arus Kas (Metode Langsung)</th>
                    <th className="py-2.5 px-4 w-44 text-right">Rincian (Rp)</th>
                    <th className="py-2.5 px-4 w-44 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* I. AKTIVITAS OPERASI */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={3}>I. ARUS KAS DARI AKTIVITAS OPERASI</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Arus Kas Masuk (Penerimaan Pajak, Retribusi & Transfer)</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-700">{formatRupiah(lak.arusKasMasukOperasi)}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Arus Kas Keluar (Pembayaran Pegawai, Barang & Beban Operasional)</td>
                    <td className="py-2 px-4 text-right font-mono text-rose-700">({formatRupiah(lak.arusKasKeluarOperasi)})</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="bg-emerald-50/40 font-bold text-emerald-950 border-t border-slate-200">
                    <td className="py-2 px-4 pl-8">Arus Kas Bersih dari Aktivitas Operasi</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(lak.arusKasBersihOperasi)}</td>
                  </tr>

                  {/* II. AKTIVITAS INVESTASI NON KEUANGAN */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={3}>II. ARUS KAS DARI AKTIVITAS INVESTASI NON KEUANGAN</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Pengeluaran Kas untuk Perolehan Aset Tetap (Belanja Modal)</td>
                    <td className="py-2 px-4 text-right font-mono text-rose-700">({formatRupiah(lak.arusKasKeluarInvestasi)})</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="bg-slate-50/60 font-bold text-slate-900 border-t border-slate-200">
                    <td className="py-2 px-4 pl-8">Arus Kas Bersih dari Aktivitas Investasi Non Keuangan</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    <td className="py-2 px-4 text-right font-mono text-rose-700">
                      (Rp {formatRupiah(Math.abs(lak.arusKasBersihInvestasi))})
                    </td>
                  </tr>

                  {/* III. AKTIVITAS PENDANAAN / PEMBIAYAAN */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={3}>III. ARUS KAS DARI AKTIVITAS PENDANAAN / PEMBIAYAAN</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Arus Kas Bersih dari Aktivitas Pendanaan (Pembiayaan Netto)</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(lak.arusKasBersihPendanaan)}</td>
                  </tr>

                  {/* IV. AKTIVITAS TRANSITORIS (PFK) */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={3}>IV. ARUS KAS DARI AKTIVITAS TRANSITORIS / NON ANGGARAN (PFK)</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Penerimaan Perhitungan Fihak Ketiga (PFK)</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-700">{formatRupiah(lak.pfkMasuk)}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Pengeluaran Perhitungan Fihak Ketiga (PFK)</td>
                    <td className="py-2 px-4 text-right font-mono text-rose-700">({formatRupiah(lak.pfkKeluar)})</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="bg-slate-50/60 font-bold text-slate-900 border-t border-slate-200">
                    <td className="py-2 px-4 pl-8">Arus Kas Bersih dari Aktivitas Transitoris</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(lak.arusKasBersihTransitoris)}</td>
                  </tr>

                  {/* REKONSILIASI KAS AKHIR */}
                  <tr className="bg-blue-50/50 font-bold text-blue-950 border-t border-slate-300">
                    <td className="py-2.5 px-4" colSpan={2}>KENAIKAN / (PENURUNAN) BERSIH KAS SELAMA PERIODE</td>
                    <td className="py-2.5 px-4 text-right font-mono">Rp {formatRupiah(lak.kenaikanKas)}</td>
                  </tr>
                  <tr className="text-slate-700 font-medium">
                    <td className="py-2 px-4" colSpan={2}>SALDO AWAL KAS DI KAS DAERAH / REKENING OPERASIONAL</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-800">Rp {formatRupiah(lak.saldoAwalKas)}</td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-bold text-xs">
                    <td className="py-3 px-4" colSpan={2}>
                      SALDO AKHIR KAS DI KAS DAERAH (PER 31 DESEMBER)
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      Rp {formatRupiah(lak.saldoAkhirKas)}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* 4. LAPORAN PERUBAHAN SALDO ANGGARAN LEBIH (LPSAL)                     */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeStatement === 'LPSAL' && (
          <div className="space-y-4">
            
            {/* Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">SAL Awal Tahun</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">
                  Rp {formatRupiah(lpsal.salAwal)}
                </span>
                <span className="text-[10px] text-slate-500">Saldo Anggaran Lebih awal periode</span>
              </div>

              <div className="bg-purple-50/60 border border-purple-200/80 rounded-lg p-3">
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">SiLPA Tahun Berjalan</span>
                <span className="text-base sm:text-lg font-bold text-purple-900 mt-0.5 block">
                  Rp {formatRupiah(lpsal.silpaTahunBerjalan)}
                </span>
                <span className="text-[10px] text-purple-700">Bersumber dari hasil hitung LRA</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-300 rounded-lg p-3">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">SAL Akhir Tahun</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 mt-0.5 block">
                  Rp {formatRupiah(lpsal.salAkhir)}
                </span>
                <span className="text-[10px] text-emerald-700">Saldo Anggaran Lebih per 31 Desember</span>
              </div>
            </div>

            {/* Table LPSAL */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4 w-12 text-center">No</th>
                    <th className="py-2.5 px-4">Uraian Perubahan Saldo Anggaran Lebih (SAL)</th>
                    <th className="py-2.5 px-4 w-48 text-right">Tahun {period || '2025'} (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 transition-colors font-medium text-slate-900">
                    <td className="py-2.5 px-4 text-center font-bold text-slate-500">1</td>
                    <td className="py-2.5 px-4">Saldo Anggaran Lebih (SAL) Awal</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      Rp {formatRupiah(lpsal.salAwal)}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors text-slate-700">
                    <td className="py-2.5 px-4 text-center font-bold text-slate-500">2</td>
                    <td className="py-2.5 px-4 pl-8">
                      Penggunaan SAL sebagai Penerimaan Pembiayaan Tahun Berjalan
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-rose-700">
                      (Rp {formatRupiah(lpsal.penggunaanSAL)})
                    </td>
                  </tr>

                  <tr className="bg-slate-50/70 font-bold text-slate-800 border-t border-slate-200">
                    <td className="py-2 px-4 text-center">3</td>
                    <td className="py-2 px-4">Subtotal (1 - 2)</td>
                    <td className="py-2 px-4 text-right font-mono">
                      Rp {formatRupiah(lpsal.subtotal)}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors text-slate-700">
                    <td className="py-2.5 px-4 text-center font-bold text-slate-500">4</td>
                    <td className="py-2.5 px-4 pl-8">
                      Sisa Lebih / (Kurang) Pembiayaan Anggaran (SiLPA / SiKPA) Tahun Berjalan
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-bold">
                      Rp {formatRupiah(lpsal.silpaTahunBerjalan)}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors text-slate-700">
                    <td className="py-2.5 px-4 text-center font-bold text-slate-500">5</td>
                    <td className="py-2.5 px-4 pl-8">
                      Koreksi Kesalahan Pembukuan Tahun-Tahun Sebelumnya
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                      Rp {formatRupiah(lpsal.koreksiPembukuan)}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors text-slate-700">
                    <td className="py-2.5 px-4 text-center font-bold text-slate-500">6</td>
                    <td className="py-2.5 px-4 pl-8">
                      Lain-lain
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                      Rp 0
                    </td>
                  </tr>

                  <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-900">
                    <td className="py-3 px-4 text-center text-emerald-400">7</td>
                    <td className="py-3 px-4">
                      SALDO ANGGARAN LEBIH (SAL) AKHIR PER 31 DESEMBER (3 + 4 + 5 + 6)
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      Rp {formatRupiah(lpsal.salAkhir)}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
