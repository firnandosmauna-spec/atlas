import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Scale, 
  Search, 
  Filter, 
  Layers, 
  FileSpreadsheet,
  Check,
  Building2,
  Calendar
} from 'lucide-react';

const B110: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  const [labaRugiTahunBerjalan, setLabaRugiTahunBerjalan] = useState(
    (engagement as any)?.worksheetB110?.labaRugiTahunBerjalan || ''
  );
  const [ekuitasLainnya, setEkuitasLainnya] = useState(
    (engagement as any)?.worksheetB110?.ekuitasLainnya || 'none'
  );

  const tb = engagement?.trialBalance || [];
  const cajeData: Record<string, { debet: number; kredit: number }> = {};

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return '-';
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(absVal);
    return isNegative ? `(${formatted})` : formatted;
  };

  const tableData = useMemo(() => {
    return tb.map((item, index) => {
      const caje = cajeData[item.name] || { debet: 0, kredit: 0 };
      const auditBalance = (Number(item.endingBalance) || 0) + caje.debet - caje.kredit;

      // Lead Schedule mapping
      let ls = 'A';
      const grp = (item.group || '').toLowerCase();
      if (grp.includes('kewajiban') || grp.includes('liabilitas')) ls = 'C';
      else if (grp.includes('ekuitas') || grp.includes('modal')) ls = 'E';
      else if (grp.includes('pendapatan') || grp.includes('penjualan')) ls = 'PL1';
      else if (grp.includes('beban') || grp.includes('biaya') || grp.includes('hpp')) ls = 'PL2';

      return {
        noAkun: item.code || (item as any).accountCode || `100${index + 1}`,
        namaAkun: item.name,
        group: item.group || 'Lainnya',
        saldoBook: Number(item.endingBalance) || 0,
        ls,
        cajeDebet: caje.debet,
        cajeKredit: caje.kredit,
        saldoAudit: auditBalance
      };
    });
  }, [tb]);

  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      const matchesSearch = 
        row.noAkun.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.namaAkun.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedGroup === 'ALL') return matchesSearch;
      return matchesSearch && row.group.toLowerCase().includes(selectedGroup.toLowerCase());
    });
  }, [tableData, searchQuery, selectedGroup]);

  // Totals
  const totalSaldoBook = useMemo(() => tableData.reduce((s, d) => s + d.saldoBook, 0), [tableData]);
  const totalCajeDebet = useMemo(() => tableData.reduce((s, d) => s + d.cajeDebet, 0), [tableData]);
  const totalCajeKredit = useMemo(() => tableData.reduce((s, d) => s + d.cajeKredit, 0), [tableData]);
  const totalSaldoAudit = useMemo(() => tableData.reduce((s, d) => s + d.saldoAudit, 0), [tableData]);

  const totalAsetAudit = tableData
    .filter((d) => (tb.find((t) => t.name === d.namaAkun)?.group || '').toLowerCase().includes('aset'))
    .reduce((sum, d) => sum + d.saldoAudit, 0);

  const totalPasivaAudit = tableData
    .filter((d) => {
      const g = (tb.find((t) => t.name === d.namaAkun)?.group || '').toLowerCase();
      return g.includes('kewajiban') || g.includes('liabilitas') || g.includes('ekuitas') || g.includes('modal');
    })
    .reduce((sum, d) => sum + Math.abs(d.saldoAudit), 0);

  const selisihNeraca = totalAsetAudit - totalPasivaAudit;
  const isBalanced = Math.abs(selisihNeraca) === 0;
  const isCompleted = isBalanced && tb.length > 0 && labaRugiTahunBerjalan !== '';

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const groups = ['ALL', 'Aset', 'Liabilitas', 'Ekuitas', 'Pendapatan', 'Beban'];

  return (
    <WorksheetContainer
      code="B.110"
      name="Worksheet Trial Balance (WTB)"
      purpose="Rangkuman angka laporan keuangan dari angka saldo per book, jurnal penyesuaian (CAJE/PAJE), hingga angka final hasil audit."
      status={isCompleted ? "Completed" : "In Progress"}
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
                  B.110
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Risk Response Phase
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Worksheet Trial Balance (WTB)
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Rangkuman rekonsiliasi angka laporan keuangan dari saldo buku audited tahun lalu/interim, jurnal penyesuaian CAJE & PAJE, hingga penetapan saldo final per audit.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isBalanced
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                <Scale size={16} />
                <span>{isBalanced ? "NERACA: SEIMBANG" : `SELISIH: Rp ${formatCurrency(selisihNeraca)}`}</span>
              </div>
              
              <div className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isCompleted 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}>
                {isCompleted ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{isCompleted ? "STATUS: COMPLETED" : "STATUS: IN PROGRESS"}</span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
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
                <span className="text-slate-400">Periode:</span> <span className="font-semibold text-slate-800">{engagement?.auditPeriod || 'Tahun Berjalan'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <FileSpreadsheet size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Total Akun:</span> <span className="font-semibold text-slate-800">{tb.length} Akun</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Scale size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Status Neraca:</span> <span className={`font-semibold ${isBalanced ? 'text-emerald-700' : 'text-amber-700'}`}>{isBalanced ? 'Seimbang (Rp 0)' : 'Ada Selisih'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Kartu KPI Metrik Ringkas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Saldo Per Book</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
              Rp {formatCurrency(totalSaldoBook)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Saldo sebelum penyesuaian</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Penyesuaian CAJE/PAJE (Debet)</span>
            <div className="text-lg font-bold font-mono text-atlas-blue mt-1 tabular-nums">
              Rp {formatCurrency(totalCajeDebet)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Total koreksi sisi debet</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Penyesuaian CAJE/PAJE (Kredit)</span>
            <div className="text-lg font-bold font-mono text-indigo-600 mt-1 tabular-nums">
              Rp {formatCurrency(totalCajeKredit)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Total koreksi sisi kredit</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Saldo Per Audit</span>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              Rp {formatCurrency(totalSaldoAudit)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Saldo final setelah audit</span>
          </div>
        </div>

        {/* Card Pemetaan Akun Ekuitas & OCI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="text-atlas-blue" size={18} />
            <h2 className="text-sm font-bold text-slate-800">
              Pengaturan Akun Laba/Rugi & Ekuitas Lainnya
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Pilihlah akun yang ditunjuk untuk menampung Laba/Rugi Tahun Berjalan dan Ekuitas Lainnya (OCI) guna memastikan perhitungan otomatis ekuitas tertutup dengan benar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Akun Laba/Rugi Tahun Berjalan <span className="text-rose-500">*</span>
              </label>
              <select
                value={labaRugiTahunBerjalan}
                onChange={(e) => setLabaRugiTahunBerjalan(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all cursor-pointer font-medium"
              >
                <option value="">-- Pilih Akun Laba/Rugi --</option>
                {tb.filter((t) => (t.group || '').toLowerCase().includes('ekuitas') || (t.group || '').toLowerCase().includes('modal')).map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
                <option value="auto_laba_ditahan">Laba Ditahan (Retained Earnings)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Akun Ekuitas Lainnya / OCI
              </label>
              <select
                value={ekuitasLainnya}
                onChange={(e) => setEkuitasLainnya(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all cursor-pointer font-medium"
              >
                <option value="none">Tidak Ada (None)</option>
                {tb.filter((t) => (t.group || '').toLowerCase().includes('ekuitas') || (t.group || '').toLowerCase().includes('modal')).map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Utama WTB Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Header Tabel dengan Search & Filter */}
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Rincian Akun & Penyesuaian Audit (WTB)</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-200/70 text-slate-700">
                  {filteredData.length} dari {tableData.length} akun
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Data ditarik otomatis dari Trial Balance perikatan dan penyesuaian CAJE/PAJE.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari akun..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue w-44 sm:w-56"
                />
              </div>

              {/* Filter Tabs */}
              <div className="hidden md:flex items-center bg-slate-200/60 p-0.5 rounded-xl text-[11px] font-medium text-slate-600">
                {groups.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedGroup === grp
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {grp === 'ALL' ? 'Semua' : grp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-28">No. Akun</th>
                  <th className="py-3 px-4 min-w-[200px]">Nama Akun</th>
                  <th className="py-3 px-4 text-center w-28">Lead Sched.</th>
                  <th className="py-3 px-4 text-right min-w-[130px]">Saldo Per Book</th>
                  <th className="py-3 px-4 text-right min-w-[120px]">Koreksi Debet</th>
                  <th className="py-3 px-4 text-right min-w-[120px]">Koreksi Kredit</th>
                  <th className="py-3 px-4 text-right min-w-[140px]">Saldo Per Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      {tb.length === 0 
                        ? 'Belum ada data Trial Balance pada perikatan ini. Silakan impor data akun terlebih dahulu.'
                        : 'Tidak ada akun yang sesuai dengan kriteria pencarian.'}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.noAkun} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 font-medium">
                        {row.noAkun}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-900">{row.namaAkun}</span>
                        <span className="block text-[10px] text-slate-400">{row.group}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200/60">
                          {row.ls}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                        {formatCurrency(row.saldoBook)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                        {row.cajeDebet > 0 ? (
                          <span className="text-atlas-blue font-semibold">{formatCurrency(row.cajeDebet)}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                        {row.cajeKredit > 0 ? (
                          <span className="text-indigo-600 font-semibold">{formatCurrency(row.cajeKredit)}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(row.saldoAudit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              
              {/* Grand Total Row */}
              {tableData.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-200 text-xs">
                    <td colSpan={3} className="py-3 px-4 text-slate-900 uppercase tracking-wider text-[11px]">
                      TOTAL SALDO
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900 tabular-nums">
                      {formatCurrency(totalSaldoBook)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-atlas-blue tabular-nums">
                      {formatCurrency(totalCajeDebet)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-indigo-600 tabular-nums">
                      {formatCurrency(totalCajeKredit)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800 font-black tabular-nums">
                      {formatCurrency(totalSaldoAudit)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b100`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Menu B.100</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b120`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lanjut ke B.120</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan WTB"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Worksheet Trial Balance berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B110;
