import React from 'react';
import type { Account } from '../../store/engagementStore';
import { 
  Building2, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calculator
} from 'lucide-react';

interface Props {
  accounts: Account[];
  activeStatement: 'NERACA' | 'LABA_RUGI' | 'ARUS_KAS' | 'PERUBAHAN_EKUITAS';
  clientName: string;
  period: string;
  currency: string;
  unit: string;
  accountingStandard: string;
  onGoToTB?: () => void;
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Math.abs(val));
};

export const CommercialFinancialStatements: React.FC<Props> = ({
  accounts,
  activeStatement,
  clientName,
  period,
  currency,
  unit,
  accountingStandard,
  onGoToTB
}) => {
  // Empty state guard - reset bersih tanpa data mock
  if (!accounts || accounts.length === 0) {
    const statementTitles: Record<string, string> = {
      NERACA: 'Laporan Posisi Keuangan (Neraca)',
      LABA_RUGI: 'Laporan Laba Rugi dan Penghasilan Komprehensif Lain',
      ARUS_KAS: 'Laporan Arus Kas',
      PERUBAHAN_EKUITAS: 'Laporan Perubahan Ekuitas'
    };

    return (
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-3 font-sans">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Calculator size={26} />
        </div>
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
          Belum Ada Data Akun di Neraca Saldo
        </h3>
        <p className="text-xs text-slate-500 max-w-md leading-relaxed">
          {statementTitles[activeStatement] || 'Laporan Keuangan'} otomatis akan disusun setelah Anda memasukkan atau mengimpor data akun pada tab <strong>Neraca Saldo (Trial Balance)</strong>.
        </p>
        {onGoToTB && (
          <button 
            type="button"
            onClick={onGoToTB}
            className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Buka Neraca Saldo (Trial Balance)
          </button>
        )}
      </div>
    );
  }

  // --- Calculations for Commercial Accounts ---
  // 1. Aset Lancar & Tidak Lancar
  const asetLancar = accounts.filter(a => 
    a.group === 'Aset Lancar' || 
    (a.group === 'Aset' && (a.subGroup?.toLowerCase().includes('lancar') || a.name?.toLowerCase().includes('kas') || a.name?.toLowerCase().includes('piutang') || a.name?.toLowerCase().includes('persediaan')))
  );
  const totalAsetLancar = asetLancar.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.debit - a.credit), 0);

  const asetTidakLancar = accounts.filter(a => 
    a.group === 'Aset Tetap' || 
    a.group === 'Aset Tidak Lancar' || 
    (a.group === 'Aset' && !asetLancar.some(al => al.id === a.id))
  );
  const totalAsetTidakLancar = asetTidakLancar.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.debit - a.credit), 0);
  const totalAset = totalAsetLancar + totalAsetTidakLancar;

  // 2. Liabilitas Jangka Pendek & Panjang
  const liabilitasPendek = accounts.filter(a => 
    a.group === 'Liabilitas Jangka Pendek' || 
    a.subGroup?.toLowerCase().includes('pendek') || 
    (a.group === 'Liabilitas' && (a.name?.toLowerCase().includes('utang usaha') || a.name?.toLowerCase().includes('utang bank jk pendek') || a.name?.toLowerCase().includes('utang pajak') || a.name?.toLowerCase().includes('akrual')))
  );
  const totalLiabilitasPendek = liabilitasPendek.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.credit - a.debit), 0);

  const liabilitasPanjang = accounts.filter(a => 
    a.group === 'Liabilitas Jangka Panjang' || 
    a.subGroup?.toLowerCase().includes('panjang') || 
    (a.group === 'Liabilitas' && !liabilitasPendek.some(lp => lp.id === a.id))
  );
  const totalLiabilitasPanjang = liabilitasPanjang.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.credit - a.debit), 0);
  const totalLiabilitas = totalLiabilitasPendek + totalLiabilitasPanjang;

  // 3. Ekuitas
  const ekuitasAccounts = accounts.filter(a => 
    a.group === 'Ekuitas' || 
    a.group?.toLowerCase().includes('modal')
  );
  const totalEkuitas = ekuitasAccounts.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.credit - a.debit), 0);
  const totalLiabilitasDanEkuitas = totalLiabilitas + totalEkuitas;
  const isNeracaBalanced = Math.abs(totalAset - totalLiabilitasDanEkuitas) < 1;

  // 4. Laba Rugi
  const pendapatanAccounts = accounts.filter(a => 
    a.group === 'Pendapatan' || 
    a.group === 'Pendapatan Usaha' || 
    a.subGroup?.toLowerCase().includes('pendapatan')
  );
  const totalPendapatan = pendapatanAccounts.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.credit - a.debit), 0);

  const hppAccounts = accounts.filter(a => 
    a.group === 'Beban Pokok Pendapatan (HPP)' || 
    a.name?.toLowerCase().includes('hpp') || 
    a.name?.toLowerCase().includes('pokok')
  );
  const totalHPP = hppAccounts.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.debit - a.credit), 0);
  const labaBruto = totalPendapatan - totalHPP;

  const bebanOperasional = accounts.filter(a => 
    (a.group === 'Beban' || a.group === 'Beban Operasional') && 
    !hppAccounts.some(h => h.id === a.id)
  );
  const totalBebanOperasional = bebanOperasional.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.debit - a.credit), 0);
  const labaOperasi = labaBruto - totalBebanOperasional;

  const pendapatanLain = accounts.filter(a => a.group === 'Pendapatan Lain-lain');
  const totalPendapatanLain = pendapatanLain.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.credit - a.debit), 0);

  const bebanLain = accounts.filter(a => a.group === 'Beban Lain-lain');
  const totalBebanLain = bebanLain.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.debit - a.credit), 0);

  const labaSebelumPajak = labaOperasi + totalPendapatanLain - totalBebanLain;
  const bebanPajak = labaSebelumPajak > 0 ? labaSebelumPajak * 0.22 : 0;
  const labaBersih = labaSebelumPajak - bebanPajak;

  // 5. Arus Kas
  const kasAccounts = accounts.filter(a => a.name.toLowerCase().includes('kas') || a.name.toLowerCase().includes('bank'));
  const saldoAkhirKas = kasAccounts.reduce((sum, a) => sum + Math.abs(a.endingBalance || a.debit - a.credit), 0);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col font-sans">
      
      {/* ── HEADER FORMAL LAPORAN KEUANGAN ── */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 p-4 sm:p-5 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-1">
          <Building2 size={13} />
          <span>STANDAR AKUNTANSI KEUANGAN ({accountingStandard || 'SAK EP / SAK UMUM'})</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
          {clientName || 'ENTITAS PERIKATAN'}
        </h2>
        <h3 className="text-xs sm:text-sm font-bold text-atlas-blue uppercase tracking-wider">
          {activeStatement === 'NERACA' && 'Laporan Posisi Keuangan (Neraca)'}
          {activeStatement === 'LABA_RUGI' && 'Laporan Laba Rugi dan Penghasilan Komprehensif Lain'}
          {activeStatement === 'ARUS_KAS' && 'Laporan Arus Kas'}
          {activeStatement === 'PERUBAHAN_EKUITAS' && 'Laporan Perubahan Ekuitas'}
        </h3>
        <p className="text-[11px] text-slate-500">
          Per 31 Desember {period || '2025'} | Mata Uang: {currency} ({unit})
        </p>
      </div>

      {/* ── KONTEN STATEMENTS SESUAI TAB ── */}
      <div className="p-4 sm:p-6 space-y-5 text-xs">

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* 1. LAPORAN POSISI KEUANGAN (NERACA)                                    */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeStatement === 'NERACA' && (
          <div className="space-y-4">
            
            {/* Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Total Aset</span>
                <span className="text-base sm:text-lg font-bold text-blue-900 mt-0.5 block font-mono">
                  Rp {formatRupiah(totalAset)}
                </span>
                <span className="text-[10px] text-blue-600">Aset Lancar + Aset Tidak Lancar</span>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Total Liabilitas</span>
                <span className="text-base sm:text-lg font-bold text-amber-900 mt-0.5 block font-mono">
                  Rp {formatRupiah(totalLiabilitas)}
                </span>
                <span className="text-[10px] text-amber-700">Jangka Pendek + Jangka Panjang</span>
              </div>

              <div className={`border rounded-lg p-3 ${isNeracaBalanced ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900' : 'bg-rose-50/60 border-rose-200/80 text-rose-900'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  {isNeracaBalanced ? 'Neraca Seimbang' : 'Neraca Belum Seimbang'}
                </span>
                <span className="text-base sm:text-lg font-bold mt-0.5 block font-mono">
                  Rp {formatRupiah(totalLiabilitasDanEkuitas)}
                </span>
                <span className="text-[10px]">
                  {isNeracaBalanced ? 'Aset = Liabilitas + Ekuitas' : `Selisih: Rp ${formatRupiah(Math.abs(totalAset - totalLiabilitasDanEkuitas))}`}
                </span>
              </div>
            </div>

            {/* Table Neraca */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4 w-28">Kode Akun</th>
                    <th className="py-2.5 px-4">Pos-Pos Keuangan</th>
                    <th className="py-2.5 px-4 w-36 text-right">Rincian (Rp)</th>
                    <th className="py-2.5 px-4 w-40 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* ASET LANCAR */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>ASET LANCAR</td>
                  </tr>
                  {asetLancar.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(Math.abs(acc.endingBalance || acc.debit - acc.credit))}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  {asetLancar.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-2.5 px-4 pl-8 text-slate-400 italic">
                        Tidak ada akun aset lancar
                      </td>
                    </tr>
                  )}
                  <tr className="bg-blue-50/40 font-bold text-blue-900 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>JUMLAH ASET LANCAR</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(totalAsetLancar)}</td>
                  </tr>

                  {/* ASET TIDAK LANCAR */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>ASET TIDAK LANCAR / ASET TETAP</td>
                  </tr>
                  {asetTidakLancar.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(Math.abs(acc.endingBalance || acc.debit - acc.credit))}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  {asetTidakLancar.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-2.5 px-4 pl-8 text-slate-400 italic">
                        Tidak ada akun aset tidak lancar
                      </td>
                    </tr>
                  )}
                  <tr className="bg-blue-50/40 font-bold text-blue-900 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>JUMLAH ASET TIDAK LANCAR</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(totalAsetTidakLancar)}</td>
                  </tr>

                  {/* TOTAL ASET */}
                  <tr className="bg-blue-900 text-white font-bold text-xs">
                    <td className="py-3 px-4" colSpan={3}>TOTAL ASET</td>
                    <td className="py-3 px-4 text-right font-mono text-cyan-300">Rp {formatRupiah(totalAset)}</td>
                  </tr>

                  {/* LIABILITAS JANGKA PENDEK */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>LIABILITAS JANGKA PENDEK</td>
                  </tr>
                  {liabilitasPendek.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(Math.abs(acc.endingBalance || acc.credit - acc.debit))}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  <tr className="bg-amber-50/40 font-bold text-amber-950 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>JUMLAH LIABILITAS JANGKA PENDEK</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(totalLiabilitasPendek)}</td>
                  </tr>

                  {/* LIABILITAS JANGKA PANJANG */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>LIABILITAS JANGKA PANJANG</td>
                  </tr>
                  {liabilitasPanjang.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(Math.abs(acc.endingBalance || acc.credit - acc.debit))}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  <tr className="bg-amber-50/40 font-bold text-amber-950 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>JUMLAH LIABILITAS JANGKA PANJANG</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(totalLiabilitasPanjang)}</td>
                  </tr>

                  {/* EKUITAS */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>EKUITAS</td>
                  </tr>
                  {ekuitasAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(Math.abs(acc.endingBalance || acc.credit - acc.debit))}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/40 font-bold text-emerald-950 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>JUMLAH EKUITAS</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(totalEkuitas)}</td>
                  </tr>

                  {/* TOTAL LIABILITAS & EKUITAS */}
                  <tr className="bg-slate-900 text-white font-bold text-xs">
                    <td className="py-3 px-4" colSpan={3}>TOTAL LIABILITAS DAN EKUITAS</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">Rp {formatRupiah(totalLiabilitasDanEkuitas)}</td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* 2. LAPORAN LABA RUGI                                                  */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeStatement === 'LABA_RUGI' && (
          <div className="space-y-4">
            
            {/* Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Pendapatan Usaha</span>
                <span className="text-base sm:text-lg font-bold text-emerald-900 mt-0.5 block font-mono">
                  Rp {formatRupiah(totalPendapatan)}
                </span>
                <span className="text-[10px] text-emerald-700">Total Penjualan / Jasa</span>
              </div>

              <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Laba Bruto</span>
                <span className="text-base sm:text-lg font-bold text-blue-900 mt-0.5 block font-mono">
                  {labaBruto < 0 ? `(Rp ${formatRupiah(labaBruto)})` : `Rp ${formatRupiah(labaBruto)}`}
                </span>
                <span className="text-[10px] text-blue-700">Pendapatan - HPP</span>
              </div>

              <div className={`border rounded-lg p-3 ${labaBersih >= 0 ? 'bg-purple-50/60 border-purple-200/80 text-purple-900' : 'bg-rose-50/60 border-rose-200/80 text-rose-900'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  {labaBersih >= 0 ? 'Laba Bersih Tahun Berjalan' : 'Rugi Bersih Tahun Berjalan'}
                </span>
                <span className="text-base sm:text-lg font-bold mt-0.5 block font-mono">
                  {labaBersih < 0 ? `(Rp ${formatRupiah(labaBersih)})` : `Rp ${formatRupiah(labaBersih)}`}
                </span>
                <span className="text-[10px]">Setelah Pajak Penghasilan</span>
              </div>
            </div>

            {/* Table Laba Rugi */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4 w-28">Kode Akun</th>
                    <th className="py-2.5 px-4">Uraian Laba Rugi</th>
                    <th className="py-2.5 px-4 w-36 text-right">Rincian (Rp)</th>
                    <th className="py-2.5 px-4 w-40 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* PENDAPATAN */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>PENDAPATAN USAHA</td>
                  </tr>
                  {pendapatanAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(Math.abs(acc.endingBalance || acc.credit - acc.debit))}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/40 font-bold text-emerald-950 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>TOTAL PENDAPATAN USAHA</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(totalPendapatan)}</td>
                  </tr>

                  {/* HPP */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>BEBAN POKOK PENDAPATAN (HPP)</td>
                  </tr>
                  {hppAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-rose-700">
                        ({formatRupiah(Math.abs(acc.endingBalance || acc.debit - acc.credit))})
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  <tr className="bg-rose-50/40 font-bold text-rose-950 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>TOTAL BEBAN POKOK PENDAPATAN</td>
                    <td className="py-2 px-4 text-right font-mono text-rose-700">(Rp {formatRupiah(totalHPP)})</td>
                  </tr>

                  {/* LABA BRUTO */}
                  <tr className="bg-blue-50/60 font-bold text-blue-950 border-t-2 border-slate-300">
                    <td className="py-2.5 px-4" colSpan={3}>LABA BRUTO (GROSS PROFIT)</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      {labaBruto < 0 ? `(Rp ${formatRupiah(labaBruto)})` : `Rp ${formatRupiah(labaBruto)}`}
                    </td>
                  </tr>

                  {/* BEBAN OPERASIONAL */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={4}>BEBAN OPERASIONAL / UMUM & ADMINISTRASI</td>
                  </tr>
                  {bebanOperasional.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-mono text-[11px] text-slate-500">{acc.code || '-'}</td>
                      <td className="py-2 px-4 pl-8 text-slate-800 font-medium">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono text-rose-700">
                        ({formatRupiah(Math.abs(acc.endingBalance || acc.debit - acc.credit))})
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    </tr>
                  ))}
                  <tr className="bg-rose-50/40 font-bold text-rose-950 border-t border-slate-200">
                    <td className="py-2 px-4" colSpan={3}>TOTAL BEBAN OPERASIONAL</td>
                    <td className="py-2 px-4 text-right font-mono text-rose-700">(Rp {formatRupiah(totalBebanOperasional)})</td>
                  </tr>

                  {/* LABA OPERASIONAL */}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                    <td className="py-2.5 px-4" colSpan={3}>LABA / (RUGI) USAHA</td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {labaOperasi < 0 ? `(Rp ${formatRupiah(labaOperasi)})` : `Rp ${formatRupiah(labaOperasi)}`}
                    </td>
                  </tr>

                  {/* LABA BERSIH */}
                  <tr className="bg-slate-900 text-white font-bold text-xs">
                    <td className="py-3 px-4" colSpan={3}>LABA / (RUGI) BERSIH TAHUN BERJALAN</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      {labaBersih < 0 ? `(Rp ${formatRupiah(labaBersih)})` : `Rp ${formatRupiah(labaBersih)}`}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* 3. LAPORAN ARUS KAS                                                   */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeStatement === 'ARUS_KAS' && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Aktivitas Arus Kas</th>
                    <th className="py-2.5 px-4 w-44 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={2}>I. ARUS KAS DARI AKTIVITAS OPERASI</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Penerimaan dari Pelanggan</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(totalPendapatan)}</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Pembayaran kepada Pemasok & Karyawan</td>
                    <td className="py-2 px-4 text-right font-mono text-rose-700">({formatRupiah(totalHPP + totalBebanOperasional)})</td>
                  </tr>
                  <tr className="bg-emerald-50/40 font-bold text-emerald-950 border-t border-slate-200">
                    <td className="py-2 px-4 pl-8">Arus Kas Bersih dari Aktivitas Operasi</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(labaOperasi)}</td>
                  </tr>

                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={2}>II. ARUS KAS DARI AKTIVITAS INVESTASI</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Perolehan Aset Tetap</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-500">Rp 0</td>
                  </tr>

                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-4" colSpan={2}>III. ARUS KAS DARI AKTIVITAS PENDANAAN</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8">Penerimaan Modal / Pinjaman Bank</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-500">Rp 0</td>
                  </tr>

                  <tr className="bg-slate-900 text-white font-bold text-xs">
                    <td className="py-3 px-4">SALDO AKHIR KAS DAN SETARA KAS</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">Rp {formatRupiah(saldoAkhirKas)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* 4. LAPORAN PERUBAHAN EKUITAS                                          */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeStatement === 'PERUBAHAN_EKUITAS' && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Komponen Ekuitas</th>
                    <th className="py-2.5 px-4 w-44 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8 font-medium">Saldo Awal Ekuitas</td>
                    <td className="py-2 px-4 text-right font-mono">Rp {formatRupiah(totalEkuitas)}</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8 font-medium">Laba / (Rugi) Bersih Periode Berjalan</td>
                    <td className="py-2 px-4 text-right font-mono text-emerald-700">Rp {formatRupiah(labaBersih)}</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-4 pl-8 font-medium">Dividen / Prive</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-500">Rp 0</td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-bold text-xs">
                    <td className="py-3 px-4">SALDO AKHIR EKUITAS PER 31 DESEMBER</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">Rp {formatRupiah(totalEkuitas + labaBersih)}</td>
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
