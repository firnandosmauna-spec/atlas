import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink,
  BookOpenCheck,
  Check,
  AlertCircle,
  FileCheck2,
  FolderGit2,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface AccountItem {
  no: number;
  name: string;
  category: 'Aset' | 'Liabilitas' | 'Ekuitas' | 'Laba Rugi';
  index: string;
  route: string;
  defaultKesimpulan: string;
}

const DEFAULT_ACCOUNTS: AccountItem[] = [
  { no: 1, name: 'Kas dan setara kas', category: 'Aset', index: 'I', route: 'b210', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 2, name: 'Piutang usaha', category: 'Aset', index: 'II', route: 'b220', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 3, name: 'Uang muka dan beban dibayar dimuka', category: 'Aset', index: 'III', route: 'b230', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 4, name: 'Persediaan', category: 'Aset', index: 'IV', route: 'b240', defaultKesimpulan: 'Akun tersebut belum sepenuhnya disajikan secara wajar' },
  { no: 5, name: 'Investasi', category: 'Aset', index: 'V', route: 'b250', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 6, name: 'Properti Investasi', category: 'Aset', index: 'VI', route: 'b260', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 7, name: 'Aset tetap', category: 'Aset', index: 'VII', route: 'b270', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 8, name: 'Aset takberwujud', category: 'Aset', index: 'VIII', route: 'b280', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 9, name: 'Utang usaha', category: 'Liabilitas', index: 'IX', route: 'b290', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 10, name: 'Utang pajak', category: 'Liabilitas', index: 'X', route: 'ls-x', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 11, name: 'Utang Bank Jangka Pendek', category: 'Liabilitas', index: 'XI', route: 'ls-xi', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 12, name: 'Modal disetor', category: 'Ekuitas', index: 'XII', route: 'ls-xii', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 13, name: 'Saldo laba', category: 'Ekuitas', index: 'XIII', route: 'ls-xiii', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 14, name: 'Penjualan barang dagangan', category: 'Laba Rugi', index: 'XIV', route: 'ls-xiv', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 15, name: 'Beban pokok pendapatan', category: 'Laba Rugi', index: 'XV', route: 'ls-xv', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 16, name: 'Beban administrasi dan umum', category: 'Laba Rugi', index: 'XVI', route: 'ls-xvi', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
];

const KESIMPULAN_OPTIONS = [
  'Akun tersebut telah disajikan secara wajar',
  'Akun tersebut belum sepenuhnya disajikan secara wajar',
  'Akun tersebut tidak disajikan secara wajar',
  'Belum dilakukan prosedur audit',
];

const B120: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [simpulanAkhir, setSimpulanAkhir] = useState('Semua akun material telah dipetakan ke dalam Lead Schedule dan dilakukan pengujian substantif sesuai dengan tingkat risiko yang ditetapkan.');

  // Storage key for persistent state
  const storageKey = `atlas_b120_${engagement?.id || 'default'}`;

  // Mapping state for Kesimpulan & Keterangan
  const [rowStates, setRowStates] = useState<Record<number, { kesimpulan: string; keterangan: string }>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    const initial: Record<number, { kesimpulan: string; keterangan: string }> = {};
    DEFAULT_ACCOUNTS.forEach(item => {
      initial[item.no] = {
        kesimpulan: item.defaultKesimpulan,
        keterangan: '',
      };
    });
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rowStates));
    } catch {
      // ignore
    }
  }, [rowStates, storageKey]);

  const handleUpdate = (no: number, field: 'kesimpulan' | 'keterangan', value: string) => {
    setRowStates(prev => ({
      ...prev,
      [no]: {
        ...(prev[no] || { kesimpulan: DEFAULT_ACCOUNTS.find(a => a.no === no)?.defaultKesimpulan || '', keterangan: '' }),
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const stats = useMemo(() => {
    const values = Object.values(rowStates);
    const wajar = values.filter(v => v.kesimpulan.includes('telah disajikan')).length;
    const belumSepenuhnya = values.filter(v => v.kesimpulan.includes('belum sepenuhnya')).length;
    const tidakWajar = values.filter(v => v.kesimpulan.includes('tidak disajikan')).length;
    const belumAudit = values.filter(v => v.kesimpulan.includes('Belum dilakukan')).length;
    return { wajar, belumSepenuhnya, tidakWajar, belumAudit };
  }, [rowStates]);

  return (
    <WorksheetContainer
      code="B.120"
      name="Procedures Mapping & Lead Schedule"
      purpose="Memetakan akun yang material dan signifikan ke dalam Lead Schedule serta merangkum kesimpulan audit per akun."
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
                  B.120
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Risk Response Phase
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Procedures Mapping & Lead Schedule
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Penetapan alur audit substantif melalui pemetaan akun-akun material dan akun signifikan ke indeks Lead Schedule dan perumusan simpulan audit per akun.
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
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
              <div>
                <span className="text-slate-400">Wajar:</span> <span className="font-semibold text-slate-800">{stats.wajar} Akun</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></div>
              <div>
                <span className="text-slate-400">Belum Sepenuhnya:</span> <span className="font-semibold text-slate-800">{stats.belumSepenuhnya} Akun</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></div>
              <div>
                <span className="text-slate-400">Tidak Wajar:</span> <span className="font-semibold text-slate-800">{stats.tidakWajar} Akun</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"></div>
              <div>
                <span className="text-slate-400">Belum Selesai:</span> <span className="font-semibold text-slate-800">{stats.belumAudit} Akun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Kriteria & Tombol Akses Bank Prosedur Modern */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Kriteria Pemetaan Akun */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Kriteria Pemetaan Akun ke Lead Schedule
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Akun-akun yang ditampilkan pada tabel di bawah ini merupakan akun yang wajib dirumuskan prosedur auditnya berdasarkan salah satu kriteria berikut:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-atlas-blue font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span className="text-slate-700">Akun dengan nilai <strong>Material</strong> dan tergolong <strong>Akun Signifikan</strong></span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-atlas-blue font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span className="text-slate-700">Akun dengan nilai <strong>Material</strong> dan tergolong <strong>Tidak Signifikan</strong></span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-atlas-blue font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span className="text-slate-700">Akun dengan nilai <strong>Tidak Material</strong> namun tergolong <strong>Akun Signifikan</strong></span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-atlas-blue font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                <span className="text-slate-700">Akun yang dipersyaratkan oleh <strong>Specific Materiality</strong></span>
              </div>
            </div>
          </div>

          {/* Card Akses Bank Prosedur Audit */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="text-blue-400" size={20} />
                <h3 className="text-sm font-bold tracking-tight text-white">Bank Prosedur Audit</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Koleksi terstandarisasi prosedur pengujian audit untuk asersi kelengkapan, keberadaan, hak dan kewajiban, serta penilaian & alokasi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/bank-prosedur`)}
              className="mt-4 w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Buka Bank Prosedur</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Tabel Pemetaan Akun Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Daftar Akun, Indeks Lead Schedule & Simpulan Audit
              </h2>
              <p className="text-xs text-slate-500">
                Klik pada tombol indeks untuk langsung membuka kertas kerja Lead Schedule / Prosedur terkait.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total {DEFAULT_ACCOUNTS.length} Akun
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[200px]">Rincian Akun</th>
                  <th className="py-3 px-4 text-center w-28">Indeks</th>
                  <th className="py-3 px-4 min-w-[280px]">Kesimpulan Audit</th>
                  <th className="py-3 px-4 min-w-[240px]">Keterangan / Temuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEFAULT_ACCOUNTS.map((account) => {
                  const state = rowStates[account.no] || {
                    kesimpulan: account.defaultKesimpulan,
                    keterangan: '',
                  };

                  const isWajar = state.kesimpulan.includes('telah disajikan');
                  const isBelumSepenuhnya = state.kesimpulan.includes('belum sepenuhnya');
                  const isTidakWajar = state.kesimpulan.includes('tidak disajikan');

                  return (
                    <tr key={account.no} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-400">
                        {account.no}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{account.name}</div>
                        <span className="text-[10px] text-slate-400">{account.category}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <Link
                          to={`/workspace/${engagement?.id}/worksheet/${account.route}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono bg-blue-50 text-atlas-blue border border-blue-200 hover:bg-atlas-blue hover:text-white transition-all shadow-2xs"
                          title={`Buka Lead Schedule ${account.name} (${account.index})`}
                        >
                          <span>{account.index}</span>
                          <ExternalLink size={12} className="opacity-70" />
                        </Link>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            isWajar ? 'bg-emerald-500' : isBelumSepenuhnya ? 'bg-amber-500' : isTidakWajar ? 'bg-rose-500' : 'bg-slate-300'
                          }`}></div>
                          <select
                            value={state.kesimpulan}
                            onChange={(e) => handleUpdate(account.no, 'kesimpulan', e.target.value)}
                            className={`w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all cursor-pointer ${
                              isWajar ? 'text-slate-800' : isBelumSepenuhnya ? 'text-amber-800 font-semibold' : 'text-rose-800 font-semibold'
                            }`}
                          >
                            {KESIMPULAN_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="Catatan hasil prosedur..."
                          value={state.keterangan}
                          onChange={(e) => handleUpdate(account.no, 'keterangan', e.target.value)}
                          className="w-full text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all placeholder:text-slate-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Simpulan Akhir Auditor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Simpulan Akhir Hasil Pemetaan & Evaluasi Lead Schedule</span>
            </h3>
            <span className="text-[11px] text-slate-400">Wajib Diisi</span>
          </div>
          <textarea
            value={simpulanAkhir}
            onChange={(e) => setSimpulanAkhir(e.target.value)}
            rows={2}
            placeholder="Tuliskan simpulan menyeluruh atas pemetaan prosedur audit..."
            className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
          />
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b110`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.110</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b130`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lanjut ke B.130</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan Pemetaan"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Hasil pemetaan prosedur & lead schedule berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B120;
