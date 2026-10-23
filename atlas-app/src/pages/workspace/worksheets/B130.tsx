import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  AlertCircle, 
  FileText, 
  Scale, 
  DollarSign, 
  ShieldAlert,
  Info
} from 'lucide-react';

export type JournalEntry = {
  id: string;
  ref: string;
  noAkun: string;
  namaAkun: string;
  keterangan: string;
  dibukukanD: number;
  dibukukanK: number;
  tdkDibukukanD: number;
  tdkDibukukanK: number;
  kelompok: string;
  kelemahanPI: 'Ya' | 'Tidak';
  kecurangan: 'Ya' | 'Tidak';
};

const KELOMPOK_OPTIONS = [
  'Aset Lancar',
  'Aset Tidak Lancar',
  'Liabilitas Jangka Pendek',
  'Liabilitas Jangka Panjang',
  'Ekuitas',
  'Pendapatan',
  'Beban Pokok Pendapatan',
  'Beban Operasional'
];

const B130: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Resume State
  const [simpulanPAJE, setSimpulanPAJE] = useState<string>(
    (engagement as any)?.worksheetB130?.simpulan || 'Tidak Material'
  );

  // Journal Entries State with sensible default demo data if empty
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const savedEntries = (engagement as any)?.worksheetB130?.entries;
    if (savedEntries && Array.isArray(savedEntries)) return savedEntries;
    return [
      {
        id: '1',
        ref: 'CAJE-01',
        noAkun: '1110.01',
        namaAkun: 'Kas Kecil Kantor Pusat',
        keterangan: 'Koreksi pencatatan pengeluaran kas kecil yang belum dibukukan pada akhir periode',
        dibukukanD: 15000000,
        dibukukanK: 0,
        tdkDibukukanD: 0,
        tdkDibukukanK: 0,
        kelompok: 'Aset Lancar',
        kelemahanPI: 'Tidak',
        kecurangan: 'Tidak'
      },
      {
        id: '2',
        ref: 'CAJE-01',
        noAkun: '6100.12',
        namaAkun: 'Beban Operasional Lainnya',
        keterangan: 'Lawan akun pengeluaran kas kecil',
        dibukukanD: 0,
        dibukukanK: 15000000,
        tdkDibukukanD: 0,
        tdkDibukukanK: 0,
        kelompok: 'Beban Operasional',
        kelemahanPI: 'Tidak',
        kecurangan: 'Tidak'
      }
    ];
  });

  const handleUpdate = (id: string, field: keyof JournalEntry, value: any) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  const handleAdd = () => {
    const newId = Date.now().toString();
    setEntries(prev => [
      ...prev,
      {
        id: newId,
        ref: `PAJE-0${prev.length + 1}`,
        noAkun: '',
        namaAkun: '',
        keterangan: '',
        dibukukanD: 0,
        dibukukanK: 0,
        tdkDibukukanD: 0,
        tdkDibukukanK: 0,
        kelompok: 'Aset Lancar',
        kelemahanPI: 'Tidak',
        kecurangan: 'Tidak'
      }
    ]);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return '-';
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(val);
  };

  const parseNumberInput = (val: string) => {
    const clean = val.replace(/\D/g, '');
    const num = parseInt(clean, 10);
    return isNaN(num) ? 0 : num;
  };

  // Totals
  const totalDibukukanD = useMemo(() => entries.reduce((s, e) => s + (Number(e.dibukukanD) || 0), 0), [entries]);
  const totalDibukukanK = useMemo(() => entries.reduce((s, e) => s + (Number(e.dibukukanK) || 0), 0), [entries]);
  const totalTdkDibukukanD = useMemo(() => entries.reduce((s, e) => s + (Number(e.tdkDibukukanD) || 0), 0), [entries]);
  const totalTdkDibukukanK = useMemo(() => entries.reduce((s, e) => s + (Number(e.tdkDibukukanK) || 0), 0), [entries]);

  const overallMateriality = engagement?.materiality?.overallMateriality || 150000000;
  const performanceMateriality = engagement?.materiality?.performanceMateriality || 112500000;

  const netTdkDibukukan = Math.abs(totalTdkDibukukanD - totalTdkDibukukanK);
  const exceedsMateriality = netTdkDibukukan > performanceMateriality;

  return (
    <WorksheetContainer
      code="B.130"
      name="CAJE / PAJE"
      purpose="Dokumentasi usulan jurnal penyesuaian (CAJE/PAJE) dan evaluasi dampaknya terhadap kewajaran laporan keuangan."
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
                  B.130
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Risk Response Phase
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  CAJE & PAJE (Jurnal Penyesuaian Audit)
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Dokumentasi seluruh salah saji yang diidentifikasi selama pelaksanaan prosedur audit, dipisahkan antara yang telah dibukukan oleh klien (CAJE) dan usulan yang tidak dibukukan (PAJE).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>STATUS: COMPLETED</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-atlas-blue shrink-0"></div>
              <div>
                <span className="text-slate-400">Total CAJE (Dibukukan):</span>{' '}
                <span className="font-semibold text-slate-800">Rp {formatCurrency(totalDibukukanD)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></div>
              <div>
                <span className="text-slate-400">Total PAJE (Tidak Dibukukan):</span>{' '}
                <span className="font-semibold text-slate-800">Rp {formatCurrency(totalTdkDibukukanD)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
              <div>
                <span className="text-slate-400">Performance Mat.:</span>{' '}
                <span className="font-semibold text-slate-800">Rp {formatCurrency(performanceMateriality)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${exceedsMateriality ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
              <div>
                <span className="text-slate-400">Evaluasi PAJE:</span>{' '}
                <span className={`font-semibold ${exceedsMateriality ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {exceedsMateriality ? 'Melebihi Toleransi' : 'Di Bawah Toleransi'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Penjelasan & Materiality Evaluation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Acuan Materialitas */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Acuan Materialitas Perikatan
              </h2>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Overall Materiality</span>
                  <span className="font-semibold text-slate-800">Ambang Batas Menyeluruh</span>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  Rp {formatCurrency(overallMateriality)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Performance Materiality</span>
                  <span className="font-semibold text-slate-800">Ambang Pelaksanaan Pengujian</span>
                </div>
                <div className="font-mono font-bold text-atlas-blue text-sm">
                  Rp {formatCurrency(performanceMateriality)}
                </div>
              </div>
            </div>
          </div>

          {/* Card Simpulan PAJE & Dampak Terhadap Opini */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-atlas-blue" size={18} />
                <h2 className="text-sm font-bold text-slate-800">
                  Simpulan PAJE yang Tidak Dibukukan
                </h2>
              </div>
              <span className="text-xs text-slate-500">Evaluasi SA 450</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Simpulan Dampak Salah Saji Tidak Dikoreksi:
                </label>
                <select
                  value={simpulanPAJE}
                  onChange={(e) => setSimpulanPAJE(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all cursor-pointer"
                >
                  <option value="Tidak Material">Tidak Material (Salah saji tidak mempengaruhi kewajaran laporan keuangan)</option>
                  <option value="Material">Material (Salah saji mempengaruhi kewajaran laporan keuangan dan berpotensi modifikasi opini)</option>
                </select>
              </div>

              {simpulanPAJE === 'Material' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Perhatian:</strong> Dampak salah saji yang tidak dibukukan ini tergolong material. Hal ini wajib dikomunikasikan secara tertulis kepada Pihak yang Bertanggung Jawab atas Tata Kelola (TCWG) dan menjadi pertimbangan utama dalam perumusan opini pada Laporan Auditor Independen.
                  </p>
                </div>
              )}

              {simpulanPAJE === 'Tidak Material' && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Salah saji yang tidak dikoreksi secara individual maupun agregat berada di bawah tingkat materialitas pelaksanaan, sehingga tidak mendistorsi penyajian wajar laporan keuangan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabel Jurnal Penyesuaian Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Daftar Jurnal Penyesuaian (CAJE & PAJE)
              </h2>
              <p className="text-xs text-slate-500">
                Input rincian debet dan kredit usulan jurnal audit beserta identifikasi kelemahan sistem pengendalian internal.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Jurnal</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 w-24">Ref. Jurnal</th>
                  <th className="py-3 px-3 min-w-[200px]">Akun & Keterangan</th>
                  <th className="py-3 px-3 w-32">Kelompok</th>
                  <th className="py-3 px-3 text-right min-w-[120px]">Dibukukan (D)</th>
                  <th className="py-3 px-3 text-right min-w-[120px]">Dibukukan (K)</th>
                  <th className="py-3 px-3 text-right min-w-[120px]">Tdk Dibukukan (D)</th>
                  <th className="py-3 px-3 text-right min-w-[120px]">Tdk Dibukukan (K)</th>
                  <th className="py-3 px-3 text-center w-20">Kelemahan PI</th>
                  <th className="py-3 px-3 text-center w-12">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                      Belum ada jurnal penyesuaian yang dimasukkan. Klik tombol "Tambah Jurnal" di atas untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={entry.ref}
                          onChange={(e) => handleUpdate(entry.id, 'ref', e.target.value)}
                          placeholder="Ref..."
                          className="w-full font-mono text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white focus:border-atlas-blue"
                        />
                      </td>
                      <td className="py-2.5 px-3 space-y-1">
                        <input
                          type="text"
                          value={entry.namaAkun}
                          onChange={(e) => handleUpdate(entry.id, 'namaAkun', e.target.value)}
                          placeholder="Nama Akun..."
                          className="w-full text-xs font-semibold text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:border-atlas-blue outline-none py-0.5 placeholder:text-slate-400"
                        />
                        <input
                          type="text"
                          value={entry.keterangan}
                          onChange={(e) => handleUpdate(entry.id, 'keterangan', e.target.value)}
                          placeholder="Keterangan penyesuaian..."
                          className="w-full text-[11px] text-slate-500 bg-transparent border-0 outline-none py-0.5 placeholder:text-slate-400"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={entry.kelompok}
                          onChange={(e) => handleUpdate(entry.id, 'kelompok', e.target.value)}
                          className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-1 outline-none focus:bg-white"
                        >
                          {KELOMPOK_OPTIONS.map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={entry.dibukukanD ? formatCurrency(entry.dibukukanD) : ''}
                          onChange={(e) => handleUpdate(entry.id, 'dibukukanD', parseNumberInput(e.target.value))}
                          placeholder="0"
                          className="w-full text-right font-mono text-xs text-atlas-blue font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white focus:border-atlas-blue"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={entry.dibukukanK ? formatCurrency(entry.dibukukanK) : ''}
                          onChange={(e) => handleUpdate(entry.id, 'dibukukanK', parseNumberInput(e.target.value))}
                          placeholder="0"
                          className="w-full text-right font-mono text-xs text-indigo-600 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white focus:border-atlas-blue"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={entry.tdkDibukukanD ? formatCurrency(entry.tdkDibukukanD) : ''}
                          onChange={(e) => handleUpdate(entry.id, 'tdkDibukukanD', parseNumberInput(e.target.value))}
                          placeholder="0"
                          className="w-full text-right font-mono text-xs text-amber-700 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white focus:border-atlas-blue"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={entry.tdkDibukukanK ? formatCurrency(entry.tdkDibukukanK) : ''}
                          onChange={(e) => handleUpdate(entry.id, 'tdkDibukukanK', parseNumberInput(e.target.value))}
                          placeholder="0"
                          className="w-full text-right font-mono text-xs text-rose-700 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white focus:border-atlas-blue"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <select
                          value={entry.kelemahanPI}
                          onChange={(e) => handleUpdate(entry.id, 'kelemahanPI', e.target.value as any)}
                          className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 outline-none focus:bg-white"
                        >
                          <option value="Tidak">Tidak</option>
                          <option value="Ya">Ya</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                          title="Hapus Jurnal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              
              {entries.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-200 text-xs">
                    <td colSpan={3} className="py-3 px-3 text-slate-900 uppercase tracking-wider text-[11px]">
                      TOTAL SALDO JURNAL
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-atlas-blue tabular-nums">
                      {formatCurrency(totalDibukukanD)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-600 tabular-nums">
                      {formatCurrency(totalDibukukanK)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-700 tabular-nums">
                      {formatCurrency(totalTdkDibukukanD)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-700 tabular-nums">
                      {formatCurrency(totalTdkDibukukanK)}
                    </td>
                    <td colSpan={2}></td>
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
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b120`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.120</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b140`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lanjut ke B.140</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan CAJE/PAJE"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Data jurnal penyesuaian (CAJE/PAJE) berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B130;
