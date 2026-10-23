import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Calculator, 
  Building2, 
  Calendar,
  Check,
  ShieldCheck
} from 'lucide-react';

export type EstimasiItem = {
  id: string;
  akun: string;
  tenagaAhli: string;
  metode: string;
  asumsi: string;
  pengendalian: string;
  levelNilaiWajar: string;
  referensi: string;
  catatan: string;
};

const B210: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [items, setItems] = useState<EstimasiItem[]>(() => {
    const saved = (engagement as any)?.worksheetB210?.items;
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return [
      {
        id: '1',
        akun: 'Cadangan Kerugian Penurunan Nilai (CKPN) Piutang',
        tenagaAhli: 'Internal Manajemen (Credit Risk Team)',
        metode: 'Expected Credit Loss (ECL) Matrix berdasarkan PSAK 71',
        asumsi: 'Data historis gagal bayar 3 tahun terakhir dan faktor makroekonomi forward-looking',
        pengendalian: 'Review bulanan oleh Komite Manajemen Risiko',
        levelNilaiWajar: 'Level 3',
        referensi: 'KKP B.220-CKPN',
        catatan: 'Telah dilakukan recalculation matrix dan asumsi dinilai wajar.'
      },
      {
        id: '2',
        akun: 'Penyusutan Aset Tetap & Nilai Residu',
        tenagaAhli: 'Tidak Menggunakan',
        metode: 'Metode Garis Lurus (Straight-line method)',
        asumsi: 'Masa manfaat ekonomis bangunan 20 tahun, kendaraan 5 tahun, peralatan 4 tahun',
        pengendalian: 'Otorisasi aktiva tetap oleh Direksi',
        levelNilaiWajar: 'Biaya Historis Teramortisasi',
        referensi: 'KKP B.270-AT',
        catatan: 'Konsisten dengan tahun sebelumnya, tidak terdapat indikasi keusangan signifikan.'
      }
    ];
  });

  const [simpulan, setSimpulan] = useState(
    (engagement as any)?.worksheetB210?.simpulan || 'Penggunaan Estimasi Akuntansi telah memadai'
  );
  const [alasan, setAlasan] = useState(
    (engagement as any)?.worksheetB210?.alasan || ''
  );

  const handleUpdate = (id: string, field: keyof EstimasiItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAdd = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        akun: '',
        tenagaAhli: 'Tidak Menggunakan',
        metode: '',
        asumsi: '',
        pengendalian: '',
        levelNilaiWajar: 'Level 2',
        referensi: '',
        catatan: ''
      }
    ]);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const isCompleted = simpulan !== '';

  return (
    <WorksheetContainer
      code="B.210"
      name="Estimasi Akuntansi"
      purpose="Identifikasi, pemahaman, dan evaluasi atas estimasi akuntansi serta nilai wajar yang digunakan manajemen sesuai SA 540."
      status={isCompleted ? 'Completed' : 'In Progress'}
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
                  B.210
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  SA 540
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Audit atas Estimasi Akuntansi & Nilai Wajar
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Evaluasi tingkat ketidakpastian estimasi, metode pengukuran, asumsi signifikan manajemen, serta kecukupan pengungkapan dalam laporan keuangan sesuai Standar Audit 540.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>STATUS: COMPLETED</span>
              </div>
            </div>
          </div>

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
                <span className="text-slate-400">Periode:</span> <span className="font-semibold text-slate-800">{engagement?.auditPeriod || '2025'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calculator size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Total Estimasi:</span> <span className="font-semibold text-slate-800">{items.length} Akun</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Simpulan:</span> <span className="font-semibold text-emerald-700">{simpulan.includes('telah') ? 'Memadai' : 'Perlu Perhatian'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Simpulan Evaluasi Estimasi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Simpulan Evaluasi atas Estimasi Akuntansi
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">SA 540 Paragraf 18-20</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Hasil Evaluasi Auditor terhadap Kewajaran Estimasi:
              </label>
              <select
                value={simpulan}
                onChange={(e) => {
                  setSimpulan(e.target.value);
                  if (e.target.value !== 'Penggunaan Estimasi Akuntansi belum sepenuhnya memadai') {
                    setAlasan('');
                  }
                }}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all cursor-pointer"
              >
                <option value="Penggunaan Estimasi Akuntansi telah memadai">
                  Penggunaan Estimasi Akuntansi telah memadai (Asumsi dan metode telah diuji dan dinilai wajar)
                </option>
                <option value="Penggunaan Estimasi Akuntansi belum sepenuhnya memadai">
                  Penggunaan Estimasi Akuntansi belum sepenuhnya memadai (Terdapat bias manajemen / dokumentasi pendukung belum memadai)
                </option>
              </select>
            </div>

            {simpulan === 'Penggunaan Estimasi Akuntansi belum sepenuhnya memadai' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <label className="block text-xs font-bold text-amber-900">
                  Jelaskan Aspek yang Belum Memadai & Rencana Tindak Lanjut:
                </label>
                <textarea
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  rows={3}
                  placeholder="Tuliskan catatan rinci mengenai estimasi yang memiliki bias atau risiko salah saji material..."
                  className="w-full text-xs text-slate-800 bg-white border border-amber-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabel Rincian Estimasi Akuntansi Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Daftar Akun yang Menggunakan Estimasi Akuntansi & Nilai Wajar
              </h2>
              <p className="text-xs text-slate-500">
                Dokumentasikan metode, asumsi, keterlibatan tenaga ahli, serta pengujian pengendalian internal.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Estimasi</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 min-w-[200px]">Akun / Pos Laporan</th>
                  <th className="py-3 px-3 min-w-[220px]">Metode Pengukuran & Asumsi</th>
                  <th className="py-3 px-3 min-w-[160px]">Tenaga Ahli</th>
                  <th className="py-3 px-3 w-32">Level Nilai Wajar</th>
                  <th className="py-3 px-3 min-w-[180px]">Pengendalian & Catatan Audit</th>
                  <th className="py-3 px-3 w-28">Ref. KKP</th>
                  <th className="py-3 px-3 text-center w-12">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      Belum ada estimasi akuntansi yang dicatat. Klik tombol "Tambah Estimasi" untuk menginput.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.akun}
                          onChange={(e) => handleUpdate(item.id, 'akun', e.target.value)}
                          placeholder="Nama akun estimasi..."
                          className="w-full font-semibold text-xs text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:border-atlas-blue outline-none py-1"
                        />
                      </td>
                      <td className="py-2.5 px-3 space-y-1">
                        <input
                          type="text"
                          value={item.metode}
                          onChange={(e) => handleUpdate(item.id, 'metode', e.target.value)}
                          placeholder="Metode pengukuran..."
                          className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                        />
                        <input
                          type="text"
                          value={item.asumsi}
                          onChange={(e) => handleUpdate(item.id, 'asumsi', e.target.value)}
                          placeholder="Asumsi signifikan..."
                          className="w-full text-[11px] text-slate-500 bg-transparent border-0 outline-none px-1 placeholder:text-slate-400"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.tenagaAhli}
                          onChange={(e) => handleUpdate(item.id, 'tenagaAhli', e.target.value)}
                          placeholder="Tenaga ahli..."
                          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={item.levelNilaiWajar}
                          onChange={(e) => handleUpdate(item.id, 'levelNilaiWajar', e.target.value)}
                          className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-1 outline-none focus:bg-white cursor-pointer"
                        >
                          <option value="Level 1">Level 1 (Harga Kuotasi)</option>
                          <option value="Level 2">Level 2 (Input Teramati)</option>
                          <option value="Level 3">Level 3 (Input Tidak Teramati)</option>
                          <option value="Biaya Historis Teramortisasi">Biaya Historis</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 space-y-1">
                        <input
                          type="text"
                          value={item.pengendalian}
                          onChange={(e) => handleUpdate(item.id, 'pengendalian', e.target.value)}
                          placeholder="Pengendalian internal..."
                          className="w-full text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                        />
                        <input
                          type="text"
                          value={item.catatan}
                          onChange={(e) => handleUpdate(item.id, 'catatan', e.target.value)}
                          placeholder="Catatan pengujian..."
                          className="w-full text-[11px] text-slate-500 bg-transparent border-0 outline-none px-1 placeholder:text-slate-400"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.referensi}
                          onChange={(e) => handleUpdate(item.id, 'referensi', e.target.value)}
                          placeholder="Ref KKP..."
                          className="w-full font-mono text-[11px] font-semibold text-atlas-blue bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                          title="Hapus Baris"
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
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b220`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lanjut ke B.220</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan KKP B.210"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Kertas kerja Estimasi Akuntansi berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B210;
