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
  Users2, 
  Building2, 
  Calendar,
  ShieldCheck,
  Check,
  FileCheck2
} from 'lucide-react';

export type PihakBerelasiItem = {
  id: string;
  identitas: string;
  sifatHubungan: string;
  melakukanTransaksi: 'Ya' | 'Tidak';
  nominalTransaksi?: string;
  keterangan?: string;
};

export type ProsedurItem = {
  id: string;
  no: string;
  isParent: boolean;
  prosedur: string;
  pelaksanaan: string;
  referensi: string;
};

const B220: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Data Pihak Berelasi yang teridentifikasi
  const [pihakBerelasi, setPihakBerelasi] = useState<PihakBerelasiItem[]>(() => {
    const saved = (engagement as any)?.worksheetB220?.pihakBerelasi;
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return [
      {
        id: '1',
        identitas: 'PT Induk Nusantara Sejahtera (Holding)',
        sifatHubungan: 'Entitas Induk Pemegang Saham Pengendali (75%)',
        melakukanTransaksi: 'Ya',
        nominalTransaksi: 'Rp 450.000.000',
        keterangan: 'Jasa manajemen & pinjaman subordinasi jangka panjang'
      },
      {
        id: '2',
        identitas: 'Bapak Hendra Kusuma (Komisaris Utama)',
        sifatHubungan: 'Personil Manajemen Kunci (KMP)',
        melakukanTransaksi: 'Ya',
        nominalTransaksi: 'Rp 180.000.000',
        keterangan: 'Remunerasi dan sewa gedung kantor operasional'
      }
    ];
  });

  const [prosedur, setProsedur] = useState<ProsedurItem[]>([
    { id: '1', no: '1', isParent: true, prosedur: 'Mengidentifikasi penilaian risiko salah saji material berkaitan dengan hubungan dan transaksi pihak berelasi dengan melakukan:', pelaksanaan: '', referensi: '' },
    { id: '1a', no: 'a.', isParent: false, prosedur: 'Konfirmasi atau diskusi tentang sifat transaksi dengan pihak perantara yang sesuai (seperti bank, konsultan hukum, penjamin).', pelaksanaan: 'Telah dikonfirmasi', referensi: 'KKP B.220-1' },
    { id: '1b', no: 'b.', isParent: false, prosedur: 'Analisis catatan akuntansi untuk transaksi dengan pihak berelasi yang baru teridentifikasi.', pelaksanaan: 'Telah dianalisis', referensi: 'KKP B.220-2' },
    { id: '1c', no: 'c.', isParent: false, prosedur: 'Mengonfirmasikan tujuan, hal spesifik, dan kondisi atau jumlah transfer dengan pihak berelasi.', pelaksanaan: 'Sesuai perjanjian', referensi: 'KKP B.220-3' },
    { id: '1d', no: 'd.', isParent: false, prosedur: 'Mengevaluasi apakah transaksi pihak berelasi dicatat dan diungkapkan secara tepat sesuai kerangka akuntansi.', pelaksanaan: 'Diungkapkan memadai', referensi: 'KKP B.220-4' },
    { id: '1e', no: 'e.', isParent: false, prosedur: 'Memeriksa kontrak atau perjanjian signifikan dengan pihak berelasi.', pelaksanaan: 'Telah diperiksa', referensi: 'KKP B.220-5' },
    { id: '2', no: '2', isParent: true, prosedur: 'Mengidentifikasi transaksi pihak berelasi yang belum ditemukan atau belum diungkapkan sebelumnya:', pelaksanaan: '', referensi: '' },
    { id: '2a', no: 'a.', isParent: false, prosedur: 'Mengomunikasikan informasi pihak berelasi yang relevan kepada seluruh anggota tim perikatan audit.', pelaksanaan: 'Telah dibagikan', referensi: 'Notulen Tim' },
    { id: '2b', no: 'b.', isParent: false, prosedur: 'Meminta konfirmasi tertulis manajemen mengenai kelengkapan identifikasi seluruh pihak berelasi.', pelaksanaan: 'Tercantum di LRM', referensi: 'KKP B.250' }
  ]);

  const [simpulan, setSimpulan] = useState(
    (engagement as any)?.worksheetB220?.simpulan || 
    'Hubungan dan transaksi dengan pihak berelasi telah diidentifikasi dan diungkapkan secara tepat dalam catatan atas laporan keuangan sesuai dengan SAK yang berlaku.'
  );

  const handleAdd = () => {
    setPihakBerelasi([
      ...pihakBerelasi,
      {
        id: Date.now().toString(),
        identitas: '',
        sifatHubungan: '',
        melakukanTransaksi: 'Ya',
        nominalTransaksi: '',
        keterangan: ''
      }
    ]);
  };

  const handleDelete = (id: string) => {
    setPihakBerelasi(pihakBerelasi.filter(p => p.id !== id));
  };

  const handleUpdatePihak = (id: string, field: keyof PihakBerelasiItem, value: any) => {
    setPihakBerelasi(pihakBerelasi.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleUpdateProsedur = (id: string, field: keyof ProsedurItem, value: string) => {
    setProsedur(prosedur.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <WorksheetContainer
      code="B.220"
      name="Pihak Berelasi"
      purpose="Identifikasi hubungan serta pengujian transaksi dengan pihak berelasi sesuai standar audit SA 550."
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
                  B.220
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  SA 550
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Pihak Berelasi & Transaksi Afiliasi
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Prosedur pemahaman hubungan dan transaksi dengan pihak berelasi untuk memastikan tidak adanya benturan kepentingan, penilaian wajar (arm's length), serta kelengkapan pengungkapan CALK.
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
              <Users2 size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Pihak Berelasi:</span> <span className="font-semibold text-slate-800">{pihakBerelasi.length} Entitas/Individu</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Pengungkapan:</span> <span className="font-semibold text-emerald-700">Telah Memadai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Daftar Pihak Berelasi Teridentifikasi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Daftar Pihak Berelasi yang Teridentifikasi
              </h2>
              <p className="text-xs text-slate-500">
                Pihak berelasi mencakup pemegang saham pengendali, entitas anak/asosiasi, serta personil manajemen kunci.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Pihak Berelasi</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 min-w-[220px]">Identitas Pihak Berelasi</th>
                  <th className="py-3 px-3 min-w-[200px]">Sifat Hubungan Relasi</th>
                  <th className="py-3 px-3 text-center w-28">Transaksi</th>
                  <th className="py-3 px-3 min-w-[150px]">Estimasi Nilai Transaksi</th>
                  <th className="py-3 px-3 min-w-[200px]">Keterangan / Sifat Transaksi</th>
                  <th className="py-3 px-3 text-center w-12">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pihakBerelasi.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      Belum ada pihak berelasi yang didaftarkan. Klik tombol "Tambah Pihak Berelasi" di atas.
                    </td>
                  </tr>
                ) : (
                  pihakBerelasi.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.identitas}
                          onChange={(e) => handleUpdatePihak(item.id, 'identitas', e.target.value)}
                          placeholder="Nama badan usaha / perorangan..."
                          className="w-full text-xs font-semibold text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:border-atlas-blue outline-none py-1"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.sifatHubungan}
                          onChange={(e) => handleUpdatePihak(item.id, 'sifatHubungan', e.target.value)}
                          placeholder="Hubungan relasi..."
                          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <select
                          value={item.melakukanTransaksi}
                          onChange={(e) => handleUpdatePihak(item.id, 'melakukanTransaksi', e.target.value as any)}
                          className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                        >
                          <option value="Ya">Ada</option>
                          <option value="Tidak">Tidak Ada</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.nominalTransaksi || ''}
                          onChange={(e) => handleUpdatePihak(item.id, 'nominalTransaksi', e.target.value)}
                          placeholder="Rp..."
                          className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.keterangan || ''}
                          onChange={(e) => handleUpdatePihak(item.id, 'keterangan', e.target.value)}
                          placeholder="Keterangan transaksi..."
                          className="w-full text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
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

        {/* Tabel Checklist Prosedur Audit Pihak Berelasi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70">
            <h2 className="text-sm font-bold text-slate-800">
              Pelaksanaan Prosedur Audit Hubungan & Transaksi Pihak Berelasi (SA 550)
            </h2>
            <p className="text-xs text-slate-500">
              Verifikasi pelaksanaan prosedur pengujian serta dokumentasi referensi kertas kerja pendukung.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {prosedur.map((p) => {
              if (p.isParent) {
                return (
                  <div key={p.id} className="px-5 py-3 bg-slate-50/90 font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-atlas-blue">{p.no}</span>
                    <span>{p.prosedur}</span>
                  </div>
                );
              }

              return (
                <div key={p.id} className="px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3 flex-1 pr-4">
                    <span className="w-5 font-bold text-slate-400 shrink-0">{p.no}</span>
                    <span className="text-slate-700 leading-relaxed">{p.prosedur}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <input
                      type="text"
                      value={p.pelaksanaan}
                      onChange={(e) => handleUpdateProsedur(p.id, 'pelaksanaan', e.target.value)}
                      placeholder="Hasil pelaksanaan..."
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:border-atlas-blue w-40 sm:w-48"
                    />

                    <input
                      type="text"
                      value={p.referensi}
                      onChange={(e) => handleUpdateProsedur(p.id, 'referensi', e.target.value)}
                      placeholder="Ref. KKP..."
                      className="text-xs font-mono font-semibold text-atlas-blue bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white w-28"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Simpulan Akhir Auditor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Simpulan Auditor atas Hubungan & Transaksi Pihak Berelasi</span>
            </h3>
            <span className="text-[11px] text-slate-400">SA 550 Paragraf 26-27</span>
          </div>
          <textarea
            value={simpulan}
            onChange={(e) => setSimpulan(e.target.value)}
            rows={3}
            placeholder="Tuliskan simpulan auditor terkait keterbukaan dan pengungkapan transaksi pihak berelasi..."
            className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
          />
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b210`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.210</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b230`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lanjut ke B.230</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan KKP B.220"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Kertas kerja Pihak Berelasi berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B220;
