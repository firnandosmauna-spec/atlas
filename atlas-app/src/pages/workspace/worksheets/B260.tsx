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
  Briefcase, 
  Building2, 
  Calendar,
  ShieldCheck,
  Check,
  Award
} from 'lucide-react';

export type PakarUmum = {
  id: string;
  nama: string;
  bidang: string;
  aset: string;
  kontrak: string;
};

export type PakarFaktor = {
  id: string;
  no: string;
  faktor: string;
  penjelasan: string;
};

const B260: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [menggunakanPakar, setMenggunakanPakar] = useState<string>(
    (engagement as any)?.worksheetB260?.menggunakanPakar || 'Tidak'
  );

  const [pakarUmum, setPakarUmum] = useState<PakarUmum[]>([
    { id: '1', nama: 'KJPP Rinaldi & Rekan (Penilai Publik)', bidang: 'Penilaian Properti & Aset Tetap', aset: 'Tanah & Bangunan Pabrik Utama', kontrak: 'Surat Tugas Penilai No. ST-014/KAP/2025' }
  ]);

  const [bagian1, setBagian1] = useState<PakarFaktor[]>([
    { id: 'b1_1', no: '1', faktor: 'Bagaimana pengetahuan atau pengalaman sebelumnya yang dimiliki auditor terkait keahlian pakar?', penjelasan: 'Auditor telah beberapa kali bekerja sama dengan KJPP terkait untuk industri manufaktur serupa.' },
    { id: 'b1_2', no: '2', faktor: 'Apakah pakar auditor memiliki kompetensi, kapabilitas, dan sertifikasi profesional yang relevan?', penjelasan: 'Pakar terdaftar di MAPPI dan mengantongi izin resmi Kementerian Keuangan.' },
    { id: 'b1_3', no: '3', faktor: 'Apakah pakar auditor bertindak secara objektif dan independen terhadap entitas klien?', penjelasan: 'Telah diperoleh surat pernyataan independensi bebas dari benturan kepentingan finansial maupun hubungan kekeluargaan.' },
    { id: 'b1_4', no: '4', faktor: 'Apakah pekerjaan pakar menjadi subjek kebijakan dan prosedur pengendalian mutu KAP?', penjelasan: 'Seluruh kertas kerja perhitungan pakar di-review oleh Manajer Audit.' },
  ]);

  const [simpulan, setSimpulan] = useState(
    (engagement as any)?.worksheetB260?.simpulan || 
    'Tim audit perikatan memiliki kompetensi memadai dan bidang usaha entitas tidak memerlukan penggunaan tenaga pakar independen auditor (SA 620).'
  );

  const handleUpdateUmum = (id: string, field: keyof PakarUmum, value: string) => {
    setPakarUmum(pakarUmum.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAddUmum = () => {
    setPakarUmum([
      ...pakarUmum,
      { id: Date.now().toString(), nama: '', bidang: '', aset: '', kontrak: '' }
    ]);
  };

  const handleDeleteUmum = (id: string) => {
    setPakarUmum(pakarUmum.filter(p => p.id !== id));
  };

  const handleUpdateFaktor = (id: string, value: string) => {
    setBagian1(bagian1.map(b => b.id === id ? { ...b, penjelasan: value } : b));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <WorksheetContainer
      code="B.260"
      name="Penggunaan Pakar Auditor"
      purpose="Evaluasi kebutuhan, kompetensi, kapabilitas, dan kecukupan pekerjaan pakar auditor sesuai SA 620."
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
                  B.260
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  SA 620
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Penggunaan Pekerjaan Pakar Auditor (Auditor's Expert)
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Penetapan kebutuhan, penilaian kompetensi, objektivitas, serta evaluasi kecukupan bukti audit yang dihasilkan dari pekerjaan pakar auditor independen.
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
              <Award size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Status Pakar:</span> <span className="font-semibold text-slate-800">{menggunakanPakar === 'Ya' ? 'Menggunakan Pakar' : 'Tidak Menggunakan'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Evaluasi SA 620:</span> <span className="font-semibold text-emerald-700">Memadai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Keputusan Penggunaan Pakar Auditor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="text-atlas-blue" size={18} />
                <span>Keputusan Penggunaan Tenaga Pakar Auditor</span>
              </h2>
              <p className="text-xs text-slate-500">
                Apakah perikatan audit memerlukan keahlian spesifik di luar bidang akuntansi dan auditing (misal: aktuaris, penilai properti, ahli hukum)?
              </p>
            </div>

            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMenggunakanPakar('Tidak');
                  setSimpulan('Tim audit perikatan memiliki kompetensi memadai dan bidang usaha entitas tidak memerlukan penggunaan tenaga pakar independen auditor (SA 620).');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  menggunakanPakar === 'Tidak'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tidak Menggunakan
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenggunakanPakar('Ya');
                  setSimpulan('Pekerjaan pakar penilai telah dievaluasi dan dapat digunakan sebagai bukti audit yang cukup dan tepat untuk pos yang bersangkutan.');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  menggunakanPakar === 'Ya'
                    ? 'bg-atlas-blue text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menggunakan Pakar
              </button>
            </div>
          </div>

          {menggunakanPakar === 'Tidak' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Auditor menyimpulkan bahwa akun-akun dalam laporan keuangan klien tidak melibatkan penilaian nilai wajar yang sangat kompleks atau estimasi aktuarial rumit yang melampaui kompetensi tim audit internal KAP.
              </p>
            </div>
          )}
        </div>

        {/* Jika Menggunakan Pakar: Rincian Pakar & Evaluasi SA 620 */}
        {menggunakanPakar === 'Ya' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Daftar Tenaga Pakar Auditor yang Ditunjuk
                  </h2>
                  <p className="text-xs text-slate-500">
                    Informasi identitas pakar, bidang keahlian khusus, dan surat perikatan/kontrak penugasan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddUmum}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Pakar</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-3 min-w-[200px]">Nama Pakar / Badan Usaha</th>
                      <th className="py-3 px-3 min-w-[200px]">Bidang Keahlian</th>
                      <th className="py-3 px-3 min-w-[200px]">Akun / Aset yang Dinilai</th>
                      <th className="py-3 px-3 min-w-[200px]">Surat Perikatan / Kontrak</th>
                      <th className="py-3 px-3 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pakarUmum.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={p.nama}
                            onChange={(e) => handleUpdateUmum(p.id, 'nama', e.target.value)}
                            placeholder="Nama pakar..."
                            className="w-full font-semibold text-xs text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:border-atlas-blue outline-none py-1"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={p.bidang}
                            onChange={(e) => handleUpdateUmum(p.id, 'bidang', e.target.value)}
                            placeholder="Bidang keahlian..."
                            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={p.aset}
                            onChange={(e) => handleUpdateUmum(p.id, 'aset', e.target.value)}
                            placeholder="Objek penilaian..."
                            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={p.kontrak}
                            onChange={(e) => handleUpdateUmum(p.id, 'kontrak', e.target.value)}
                            placeholder="Nomor kontrak..."
                            className="w-full text-xs font-mono text-atlas-blue font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:bg-white"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteUmum(p.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                            title="Hapus Baris"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evaluasi Kompetensi & Objektivitas Pakar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70">
                <h2 className="text-sm font-bold text-slate-800">
                  Evaluasi Kompetensi, Kapabilitas & Objektivitas Pakar (SA 620 Paragraf 9)
                </h2>
                <p className="text-xs text-slate-500">
                  Verifikasi sertifikasi, izin praktik, reputasi profesional, serta independensi pakar dari entitas yang diaudit.
                </p>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {bagian1.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 font-bold text-slate-400 shrink-0">{item.no}.</span>
                      <span className="text-slate-800 font-medium leading-relaxed">{item.faktor}</span>
                    </div>
                    <div className="pl-7">
                      <input
                        type="text"
                        value={item.penjelasan}
                        onChange={(e) => handleUpdateFaktor(item.id, e.target.value)}
                        placeholder="Penjelasan hasil evaluasi auditor..."
                        className="w-full text-xs text-slate-700 bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:bg-white focus:border-atlas-blue"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Card Simpulan Formal Auditor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Simpulan Auditor atas SA 620</span>
            </h3>
            <span className="text-[11px] text-slate-400">Formal Audit Conclusion</span>
          </div>
          <textarea
            value={simpulan}
            onChange={(e) => setSimpulan(e.target.value)}
            rows={3}
            placeholder="Tuliskan simpulan auditor terkait penggunaan pakar auditor..."
            className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
          />
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b250`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.250</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b270`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lanjut ke B.270</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan KKP B.260"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Kertas kerja Pakar Auditor berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B260;
