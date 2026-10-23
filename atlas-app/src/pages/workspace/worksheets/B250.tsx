import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Building2, 
  Calendar,
  ShieldCheck,
  Paperclip,
  Check,
  X
} from 'lucide-react';

export type RepresentationItem = {
  id: string;
  no: string;
  kondisi: string;
  yaTidak: 'YA' | 'TIDAK' | '';
  komentar: string;
};

const B250: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [items, setItems] = useState<RepresentationItem[]>([
    { id: '1', no: '1', kondisi: 'Apakah manajemen telah menyediakan representasi tertulis bahwa mereka telah memenuhi tanggung jawab dalam menyusun laporan keuangan sesuai dengan kerangka SAK yang berlaku?', yaTidak: 'YA', komentar: 'Tercantum secara eksplisit pada poin 1 Surat Representasi.' },
    { id: '2', no: '2', kondisi: 'Apakah representasi tertulis telah disiapkan dalam bentuk surat resmi berkop entitas dan ditujukan langsung kepada auditor/KAP?', yaTidak: 'YA', komentar: 'Surat representasi bernomor resmi ditujukan kepada Rekan Perikatan KAP.' },
    { id: '3', no: '3', kondisi: 'Apakah representasi tertulis menegaskan bahwa manajemen telah menyediakan seluruh data, catatan akuntansi, dan akses tidak terbatas sesuai ketentuan perikatan?', yaTidak: 'YA', komentar: 'Dikonfirmasi tidak ada pembatasan ruang lingkup data.' },
    { id: '4', no: '4', kondisi: 'Apakah tanggung jawab manajemen yang diuraikan selaras dengan ketentuan surat perikatan audit (SA 210)?', yaTidak: 'YA', komentar: 'Selaras dengan ketentuan Surat Perikatan A.130.' },
    { id: '5', no: '5', kondisi: 'Apakah tanggal surat representasi tertulis sama dengan tanggal laporan auditor independen atas laporan keuangan?', yaTidak: 'YA', komentar: 'Tanggal LRM dan Laporan Auditor Independen sinkron.' },
    { id: '6', no: '6', kondisi: 'Apakah representasi tertulis mencakup seluruh laporan keuangan dan periode audit yang dirujuk?', yaTidak: 'YA', komentar: 'Mencakup posisi keuangan, laba rugi, arus kas, dan CALK.' },
    { id: '7', no: '7', kondisi: 'Dapat dipastikan bahwa opini auditor tidak diterbitkan sebelum tanggal ditandatanganinya representasi tertulis?', yaTidak: 'YA', komentar: 'Tanda tangan Direksi diperoleh sebelum tanggal opini final.' },
    { id: '8', no: '8', kondisi: 'Apakah terdapat representasi spesifik tambahan yang diminta untuk mendukung asersi material tertentu (misal: sengketa hukum, komitmen, estimasi nilai wajar)?', yaTidak: 'YA', komentar: 'Representasi spesifik atas sengketa pajak dan CKPN telah disertakan.' },
  ]);

  const [lampiranFiles, setLampiranFiles] = useState<string[]>(['Surat_Representasi_Manajemen_Signed.pdf']);
  const [penjelasan, setPenjelasan] = useState(
    'Representasi tertulis manajemen telah diperoleh lengkap, ditandatangani oleh Direksi yang berwenang, dan memenuhi seluruh kriteria Standar Audit SA 580.'
  );

  const isAllAnswered = items.every(item => item.yaTidak !== '');
  const hasTidak = items.some(item => item.yaTidak === 'TIDAK');
  const simpulanOtomatis = hasTidak 
    ? 'Representasi manajemen belum sepenuhnya memadai' 
    : 'Representasi manajemen telah memadai';

  const handleUpdate = (id: string, field: keyof RepresentationItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <WorksheetContainer
      code="B.250"
      name="Representasi Manajemen"
      purpose="Pemeriksaan dan dokumentasi surat representasi tertulis manajemen (written representation) sesuai SA 580."
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
                  B.250
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  SA 580
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Evaluasi Surat Representasi Tertulis Manajemen
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Verifikasi kepatuhan dan keabsahan surat representasi manajemen sebagai bukti audit pendukung mengenai pemenuhan tanggung jawab penyusunan laporan keuangan dan kelengkapan informasi.
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
              <FileText size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Dokumen:</span> <span className="font-semibold text-slate-800">Tersedia & Bertanda Tangan</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Simpulan:</span> <span className="font-semibold text-emerald-700">Telah Memadai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Evaluasi Kriteria Representasi Manajemen (SA 580) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Checklist Evaluasi Ketentuan Pokok Surat Representasi Manajemen
              </h2>
              <p className="text-xs text-slate-500">
                Pastikan klausul wajib SA 580 tercantum dan ditandatangani oleh pejabat yang berwenang (Direksi).
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {items.filter(i => i.yaTidak === 'YA').length} dari {items.length} Memenuhi
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {items.map((item) => {
              const isChecked = item.yaTidak === 'YA';
              return (
                <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="w-5 font-bold text-slate-400 shrink-0">{item.no}.</span>
                      <span className="text-slate-800 font-medium leading-relaxed">{item.kondisi}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdate(item.id, 'yaTidak', isChecked ? 'TIDAK' : 'YA')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isChecked 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isChecked ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                        <span>{isChecked ? 'Memenuhi (YA)' : 'Belum (TIDAK)'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pl-7">
                    <input
                      type="text"
                      value={item.komentar}
                      onChange={(e) => handleUpdate(item.id, 'komentar', e.target.value)}
                      placeholder="Catatan / rujukan nomor paragraf surat representasi..."
                      className="w-full text-xs text-slate-700 bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:border-atlas-blue"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Lampiran Dokumen & Simpulan Formal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Paperclip className="text-atlas-blue" size={16} />
              <h3 className="text-xs font-bold text-slate-800">Lampiran Dokumen LRM</h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Salinan PDF Surat Representasi Manajemen bertandatangan basah / tersertifikasi elektronik.
            </p>
            <div className="space-y-1.5 pt-1">
              {lampiranFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-800">
                  <FileText size={14} className="text-atlas-blue shrink-0" />
                  <span className="truncate flex-1 font-medium">{file}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800">
              Simpulan Auditor atas Surat Representasi Tertulis Manajemen
            </h3>
            <textarea
              value={penjelasan}
              onChange={(e) => setPenjelasan(e.target.value)}
              rows={3}
              placeholder="Tuliskan simpulan auditor terkait surat representasi tertulis manajemen..."
              className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b240`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.240</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b260`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lanjut ke B.260</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan KKP B.250"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Kertas kerja Representasi Manajemen berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B250;
