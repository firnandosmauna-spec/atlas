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
  Clock, 
  Building2, 
  Calendar,
  ShieldCheck,
  FileCheck2,
  Check
} from 'lucide-react';

export type SubsequentEventItem = {
  id: string;
  no: string;
  kondisi: string;
  yaTidak: 'Ya' | 'Tidak' | '';
  debet?: string;
  kredit?: string;
  pengungkapan: 'Ya' | 'Tidak' | 'N/A';
  frasa: string;
  referensi: string;
};

const B230: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'penyesuai' | 'nonpenyesuai'>('all');

  const [penyesuai, setPenyesuai] = useState<SubsequentEventItem[]>([
    { id: 'p1', no: '1', kondisi: 'Apakah terdapat penyelesaian kasus pengadilan setelah periode pelaporan yang memutuskan bahwa entitas memiliki kewajiban kini pada akhir periode pelaporan?', yaTidak: 'Tidak', debet: '', kredit: '', pengungkapan: 'N/A', frasa: 'Tidak ada kasus hukum material yang terselesaikan setelah tanggal neraca.', referensi: 'KKP B.280' },
    { id: 'p2', no: '2', kondisi: 'Apakah terdapat informasi baru yang mengindikasikan adanya impairment nilai aset pada akhir periode pelaporan atau perlunya penyesuaian atas cadangan penurunan nilai?', yaTidak: 'Tidak', debet: '', kredit: '', pengungkapan: 'N/A', frasa: 'Kolektibilitas piutang dan nilai persediaan stabil.', referensi: 'KKP B.210' },
    { id: 'p3', no: '3', kondisi: 'Apakah terdapat penentuan setelah periode pelaporan atas biaya perolehan aset yang dibeli atau hasil penjualan aset yang dijual sebelum akhir periode pelaporan?', yaTidak: 'Tidak', debet: '', kredit: '', pengungkapan: 'N/A', frasa: 'Semua transaksi aset telah tercatat tuntas per 31 Desember.', referensi: 'KKP B.270' },
    { id: 'p4', no: '4', kondisi: 'Apakah terdapat pembagian laba atau bonus setelah periode pelaporan jika entitas memiliki kewajiban hukum atau konstruktif kini pada akhir periode pelaporan?', yaTidak: 'Tidak', debet: '', kredit: '', pengungkapan: 'N/A', frasa: 'Tantiem dan bonus disetujui dalam RUPS setelah tanggal laporan.', referensi: 'Notulen RUPS' }
  ]);

  const [nonPenyesuai, setNonPenyesuai] = useState<SubsequentEventItem[]>([
    { id: 'np1', no: '1', kondisi: 'Apakah terdapat kombinasi bisnis signifikan, akuisisi, atau pelepasan entitas anak yang signifikan setelah periode pelaporan?', yaTidak: 'Tidak', debet: '', kredit: '', pengungkapan: 'N/A', frasa: 'Tidak ada rencana merger atau akuisisi material.', referensi: 'Konfirmasi Direksi' },
    { id: 'np2', no: '2', kondisi: 'Apakah terdapat pengumuman formal untuk menghentikan suatu lini operasi bisnis utama?', yaTidak: 'Tidak', debet: '', kredit: '', pengungkapan: 'N/A', frasa: 'Operasi seluruh lini bisnis berjalan normal.', referensi: 'Notulen BOD' },
    { id: 'np3', no: '3', kondisi: 'Apakah telah terjadi atau direncanakan pembelian atau komitmen aset tetap dalam jumlah signifikan?', yaTidak: 'Tidak', debet: '', kredit: '', pengungkapan: 'N/A', frasa: 'Capex tahun berjalan sesuai anggaran belanja modal.', referensi: 'Anggaran 2026' },
    { id: 'np4', no: '4', kondisi: 'Apakah terdapat fluktuasi luar biasa kurs mata uang asing atau perubahan signifikan nilai wajar instrumen keuangan?', yaTidak: 'Tidak', debet: '', kredit: '', pengungkapan: 'N/A', frasa: 'Eksposur valas dalam batas lindung nilai wajar.', referensi: 'Rekening Koran' }
  ]);

  const [simpulan, setSimpulan] = useState(
    (engagement as any)?.worksheetB230?.simpulan || 
    'Tidak terdapat peristiwa setelah tanggal neraca (subsequent events) yang memerlukan penyesuaian atas angka laporan keuangan maupun pengungkapan tambahan dalam CALK.'
  );

  const handleUpdate = (id: string, field: keyof SubsequentEventItem, value: any, isPenyesuai: boolean) => {
    if (isPenyesuai) {
      setPenyesuai(penyesuai.map(item => item.id === id ? { ...item, [field]: value } : item));
    } else {
      setNonPenyesuai(nonPenyesuai.map(item => item.id === id ? { ...item, [field]: value } : item));
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <WorksheetContainer
      code="B.230"
      name="Peristiwa Setelah Tanggal Neraca"
      purpose="Identifikasi dan evaluasi peristiwa kemudian (subsequent events) sesuai Standar Audit SA 560."
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
                  B.230
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  SA 560
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Peristiwa Setelah Tanggal Neraca (Subsequent Events)
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Evaluasi peristiwa antara tanggal laporan posisi keuangan dengan tanggal laporan auditor independen, dipisahkan antara peristiwa penyesuai (adjusting events) dan peristiwa non-penyesuai (disclosure only).
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
              <Clock size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Tenggat Uji:</span> <span className="font-semibold text-slate-800">Tanggal Opini LAI</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Dampak:</span> <span className="font-semibold text-emerald-700">Tidak Ada Salah Saji</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Evaluasi Peristiwa Kemudian */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Pemeriksaan Kondisi & Kejadian Setelah Periode Pelaporan
              </h2>
              <p className="text-xs text-slate-500">
                Tentukan apakah peristiwa memerlukan usulan jurnal penyesuaian (CAJE) atau pengungkapan tambahan (Disclosure).
              </p>
            </div>

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
                onClick={() => setActiveTab('penyesuai')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'penyesuai' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Peristiwa Penyesuai
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('nonpenyesuai')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'nonpenyesuai' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Peristiwa Non-Penyesuai
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Bagian 1: Peristiwa Penyesuai */}
            {(activeTab === 'all' || activeTab === 'penyesuai') && (
              <div>
                <div className="px-5 py-2.5 bg-slate-100/60 font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Bagian 1 : Peristiwa yang Memerlukan Penyesuaian Angka (Adjusting Events)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Kondisi yang telah ada pada tanggal neraca</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {penyesuai.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2.5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="w-5 font-bold text-slate-400 shrink-0">{item.no}.</span>
                          <span className="text-slate-800 font-medium leading-relaxed">{item.kondisi}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={item.yaTidak}
                            onChange={(e) => handleUpdate(item.id, 'yaTidak', e.target.value as any, true)}
                            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 outline-none focus:bg-white"
                          >
                            <option value="Tidak">Tidak Ada</option>
                            <option value="Ya">Ada Peristiwa</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pl-7">
                        <input
                          type="text"
                          value={item.frasa}
                          onChange={(e) => handleUpdate(item.id, 'frasa', e.target.value, true)}
                          placeholder="Penjelasan hasil prosedur audit..."
                          className="md:col-span-2 text-xs text-slate-700 bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
                        />
                        <input
                          type="text"
                          value={item.referensi}
                          onChange={(e) => handleUpdate(item.id, 'referensi', e.target.value, true)}
                          placeholder="Ref. KKP..."
                          className="text-xs font-mono text-atlas-blue font-semibold bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bagian 2: Peristiwa Non-Penyesuai */}
            {(activeTab === 'all' || activeTab === 'nonpenyesuai') && (
              <div>
                <div className="px-5 py-2.5 bg-slate-100/60 font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Bagian 2 : Peristiwa yang Memerlukan Pengungkapan CALK (Non-Adjusting Events)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Kondisi yang timbul setelah tanggal neraca</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {nonPenyesuai.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2.5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="w-5 font-bold text-slate-400 shrink-0">{item.no}.</span>
                          <span className="text-slate-800 font-medium leading-relaxed">{item.kondisi}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={item.yaTidak}
                            onChange={(e) => handleUpdate(item.id, 'yaTidak', e.target.value as any, false)}
                            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 outline-none focus:bg-white"
                          >
                            <option value="Tidak">Tidak Ada</option>
                            <option value="Ya">Ada Peristiwa</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pl-7">
                        <input
                          type="text"
                          value={item.frasa}
                          onChange={(e) => handleUpdate(item.id, 'frasa', e.target.value, false)}
                          placeholder="Penjelasan pengungkapan CALK..."
                          className="md:col-span-2 text-xs text-slate-700 bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
                        />
                        <input
                          type="text"
                          value={item.referensi}
                          onChange={(e) => handleUpdate(item.id, 'referensi', e.target.value, false)}
                          placeholder="Ref. KKP..."
                          className="text-xs font-mono text-atlas-blue font-semibold bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Simpulan Auditor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Simpulan Auditor atas Subsequent Events (SA 560)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Formal Audit Conclusion</span>
          </div>
          <textarea
            value={simpulan}
            onChange={(e) => setSimpulan(e.target.value)}
            rows={3}
            placeholder="Tuliskan simpulan formal auditor terkait peristiwa setelah tanggal neraca..."
            className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
          />
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b220`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.220</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b240`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lanjut ke B.240</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan KKP B.230"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Kertas kerja Subsequent Events berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B230;
