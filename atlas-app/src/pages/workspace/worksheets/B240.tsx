import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  ShieldAlert, 
  Building2, 
  Calendar,
  Activity,
  Check,
  TrendingDown,
  FileCheck2
} from 'lucide-react';

export type RiskAssessmentItem = {
  id: string;
  no: string;
  prosedur: string;
  pelaksanaan: string;
  penjelasan: string;
  referensi: string;
};

export type IndikatorItem = {
  id: string;
  kategori: string;
  indikator: string;
  teridentifikasi: 'Ya' | 'Tidak';
  penjelasan: string;
};

const B240: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Altman Z-score manual inputs if needed
  const [zScoreValue, setZScoreValue] = useState<number>(3.15);

  const [riskItems, setRiskItems] = useState<RiskAssessmentItem[]>([
    { id: 'r1', no: '1.', prosedur: 'Melakukan evaluasi adanya indikasi permasalahan going concern dengan menggunakan analisis rasio keuangan dan hasil prosedur analitis akhir.', pelaksanaan: 'Telah dievaluasi', penjelasan: 'Rasio likuiditas dan solvabilitas berada pada tingkat aman.', referensi: 'KKP B.140' },
    { id: 'r2', no: '2.', prosedur: 'Mendapatkan dokumen pendukung yang relevan terkait rencana manajemen dalam merespons potensi isu kelangsungan usaha.', pelaksanaan: 'Telah dikonfirmasi', penjelasan: 'Rencana kerja dan anggaran perusahaan 2026 menunjukkan proyeksi laba positif.', referensi: 'RKAP 2026' },
    { id: 'r3', no: '3.', prosedur: 'Melakukan permintaan keterangan kepada manajemen mengenai kejadian atau kondisi di luar tanggal neraca yang dapat mempengaruhi kelangsungan usaha.', pelaksanaan: 'Telah dilaksanakan', penjelasan: 'Tidak terdapat pembatalan kontrak utama atau sengketa hukum kritis.', referensi: 'Notulen Direksi' },
    { id: 'r4', no: '4.', prosedur: 'Mengevaluasi kelayakan rencana manajemen jika terdapat ketidakpastian material terkait peristiwa atau kondisi kelangsungan usaha.', pelaksanaan: 'Tidak diperlukan', penjelasan: 'Tidak terdapat indikasi ketidakpastian material.', referensi: 'Memo Audit' }
  ]);

  const [indikatorItems, setIndikatorItems] = useState<IndikatorItem[]>([
    { id: 'i1', kategori: 'Finansial', indikator: 'Posisi liabilitas bersih atau liabilitas jangka pendek melebihi aset lancar (modal kerja negatif)', teridentifikasi: 'Tidak', penjelasan: 'Modal kerja bersih bernilai positif.' },
    { id: 'i2', kategori: 'Finansial', indikator: 'Arus kas operasi bernilai negatif dalam laporan arus kas historis atau prospektif', teridentifikasi: 'Tidak', penjelasan: 'Arus kas operasional positif ditopang penagihan piutang lancar.' },
    { id: 'i3', kategori: 'Operasi', indikator: 'Kehilangan pasar utama, pelanggan utama, lisensi penting, atau pemasok utama', teridentifikasi: 'Tidak', penjelasan: 'Diversifikasi pelanggan stabil, tidak ada konsentrasi ekstrem.' },
    { id: 'i4', kategori: 'Kepatuhan & Hukum', indikator: 'Ketidakpatuhan terhadap persyaratan permodalan atau regulasi hukum yang berlaku', teridentifikasi: 'Tidak', penjelasan: 'Seluruh izin operasional dan kepatuhan perpajakan aktif.' }
  ]);

  const [simpulan, setSimpulan] = useState(
    (engagement as any)?.worksheetB240?.simpulan || 
    'Penggunaan asumsi kelangsungan usaha (going concern) oleh manajemen dalam penyusunan laporan keuangan adalah tepat, dan tidak terdapat ketidakpastian material yang memerlukan pengungkapan khusus.'
  );

  const [rencanaManajemen, setRencanaManajemen] = useState(
    (engagement as any)?.worksheetB240?.rencanaManajemen || 
    'Manajemen memproyeksikan pertumbuhan penjualan 15% pada periode mendatang melalui ekspansi channel distribusi dan efisiensi biaya overhead operasional.'
  );

  const handleUpdateRisk = (id: string, field: keyof RiskAssessmentItem, value: string) => {
    setRiskItems(riskItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleUpdateIndikator = (id: string, field: keyof IndikatorItem, value: any) => {
    setIndikatorItems(indikatorItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const zStatus = useMemo(() => {
    if (zScoreValue >= 2.9) return { label: 'Zona Aman (Safe Zone)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (zScoreValue >= 1.23) return { label: 'Zona Abu-Abu (Grey Zone)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Zona Rentan (Distress Zone)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  }, [zScoreValue]);

  return (
    <WorksheetContainer
      code="B.240"
      name="Kelangsungan Usaha"
      purpose="Evaluasi ketepatan penggunaan asumsi kelangsungan usaha (going concern) sesuai Standar Audit SA 570."
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
                  B.240
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  SA 570
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Evaluasi Asumsi Kelangsungan Usaha (Going Concern)
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Evaluasi tanggung jawab auditor terkait penggunaan asumsi kelangsungan usaha oleh manajemen serta penilaian ada tidaknya ketidakpastian material terhadap kemampuan entitas mempertahankan kelangsungan usahanya.
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
                <span className="text-slate-400">Periode Uji:</span> <span className="font-semibold text-slate-800">12 Bulan ke Depan</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Activity size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Altman Z-Score:</span> <span className="font-semibold text-emerald-700">{zScoreValue} (Aman)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldAlert size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Ketidakpastian:</span> <span className="font-semibold text-emerald-700">Tidak Ada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Analisis Altman Z-Score Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Analisis Kuantitatif Altman Z-Score
              </h2>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${zStatus.color}`}>
              <span>{zStatus.label}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Model prediksi kesehatan finansial berbasis multi-rasio untuk mengukur probabilitas kebangkrutan entitas (Z &gt; 2.9 = Safe Zone, 1.23 - 2.9 = Grey Zone, Z &lt; 1.23 = Distress Zone).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Nilai Skor Z Kalkulasi</span>
              <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                {zScoreValue}
              </div>
              <span className="text-[10px] text-slate-400">Rasio solvabilitas kuat</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Kapasitas Arus Kas Operasi</span>
              <div className="text-xl font-bold font-mono text-slate-800 tabular-nums">
                Positif
              </div>
              <span className="text-[10px] text-slate-400">Mampu memenuhi kewajiban lancar</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Kepatuhan Debt Covenant</span>
              <div className="text-xl font-bold font-mono text-slate-800 tabular-nums">
                Terpenuhi
              </div>
              <span className="text-[10px] text-slate-400">Tidak ada default pinjaman perbankan</span>
            </div>
          </div>
        </div>

        {/* Tabel Evaluasi Indikator Keraguan Going Concern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70">
            <h2 className="text-sm font-bold text-slate-800">
              Pemeriksaan Indikator Finansial, Operasional & Kepatuhan (SA 570)
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi keberadaan peristiwa atau kondisi yang dapat menimbulkan keraguan signifikan atas kelangsungan usaha.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {indikatorItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {item.kategori}
                    </span>
                    <span className="font-semibold text-slate-900">{item.indikator}</span>
                  </div>
                  <input
                    type="text"
                    value={item.penjelasan}
                    onChange={(e) => handleUpdateIndikator(item.id, 'penjelasan', e.target.value)}
                    placeholder="Penjelasan analisis auditor..."
                    className="w-full text-[11px] text-slate-600 bg-transparent border-0 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400">Indikasi Masalah:</span>
                  <select
                    value={item.teridentifikasi}
                    onChange={(e) => handleUpdateIndikator(item.id, 'teridentifikasi', e.target.value as any)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Tidak">Tidak Ada</option>
                    <option value="Ya">Ada Indikasi</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Prosedur Audit & Simpulan Auditor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800">
              Rencana Manajemen (Management Plans) Menghadapi Risiko
            </h3>
            <textarea
              value={rencanaManajemen}
              onChange={(e) => setRencanaManajemen(e.target.value)}
              rows={3}
              placeholder="Dokumentasikan rencana strategis manajemen dalam menjaga kelangsungan usaha..."
              className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800">
              Simpulan Formal Auditor atas Kelangsungan Usaha
            </h3>
            <textarea
              value={simpulan}
              onChange={(e) => setSimpulan(e.target.value)}
              rows={3}
              placeholder="Tuliskan simpulan formal auditor terkait asumsi going concern..."
              className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b230`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.230</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b250`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lanjut ke B.250</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan KKP B.240"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Kertas kerja Kelangsungan Usaha berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B240;
