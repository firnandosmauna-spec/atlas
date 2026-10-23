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
  FileText, 
  Building2, 
  Calendar,
  Scale,
  ShieldCheck,
  Check,
  Paperclip
} from 'lucide-react';

export type ProsedurItem = {
  id: string;
  no: string;
  isParent: boolean;
  uraian: string;
  pelaksanaan: string;
  simpulan: string;
};

const B280: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [items, setItems] = useState<ProsedurItem[]>([
    { id: '1', no: '1', isParent: false, uraian: 'Peroleh pemahaman dan dokumentasikan kebijakan serta prosedur manajemen dalam mengidentifikasi dan mengevaluasi komitmen serta liabilitas kontinjensi.', pelaksanaan: 'Telah dipahami', simpulan: 'Memadai' },
    { id: '2', no: '2', isParent: false, uraian: 'Review laporan keuangan periode sebelumnya terkait kontinjensi atau komitmen yang memerlukan penyelesaian pada periode berjalan.', pelaksanaan: 'Telah direview', simpulan: 'Selesai' },
    { id: '3', no: '3', isParent: false, uraian: 'Lakukan wawancara dan diskusi dengan manajemen mengenai potensi adanya sengketa hukum atau klaim pihak ketiga yang belum diungkapkan.', pelaksanaan: 'Diskusi dengan Legal Manager', simpulan: 'Tidak Ada Sengketa' },
    { id: '4', no: '4', isParent: false, uraian: 'Review notulen rapat Direksi dan Dewan Komisaris terkait komitmen kontrak pengadaan bernilai besar atau perjanjian penjaminan (guarantee).', pelaksanaan: 'Notulen telah diperiksa', simpulan: 'Memadai' },
    { id: '5', no: '5', isParent: false, uraian: 'Review rincian akun biaya jasa hukum (legal fee) untuk mengidentifikasi konsultan hukum yang menangani perkara entitas.', pelaksanaan: 'Buku besar legal fee diperiksa', simpulan: 'Wajar' },
    { id: '6', no: '6', isParent: false, uraian: 'Kirimkan surat konfirmasi tertulis langsung kepada konsultan hukum entitas (inquiry of client’s lawyer).', pelaksanaan: 'Surat jawaban telah diterima', simpulan: 'Clean / Bebas Perkara' },
    { id: '7', no: '7', isParent: false, uraian: 'Evaluasi kecukupan polis asuransi aset dan operasional entitas terhadap risiko bencana atau gangguan bisnis.', pelaksanaan: 'Polis aktif diperiksa', simpulan: 'Pertanggungan Cukup' },
    { id: '8', no: '8', isParent: true, uraian: 'Pemeriksaan dokumen spesifik pendukung evaluasi Liabilitas Kontinjensi:', pelaksanaan: '', simpulan: '' },
    { id: '8a', no: 'a', isParent: false, uraian: 'Surat ketetapan pajak (SKP) dan potensi sengketa keberatan/banding pajak di Pengadilan Pajak.', pelaksanaan: 'SKP nihil / setuju', simpulan: 'Tidak Ada Utang Pajak' },
    { id: '8b', no: 'b', isParent: false, uraian: 'Garansi bank, endorsement pinjaman pihak ketiga, atau perjanjian indemnity yang diterbitkan perusahaan.', pelaksanaan: 'Konfirmasi bank tuntas', simpulan: 'Tidak Ada Default' },
    { id: '9', no: '9', isParent: true, uraian: 'Pemeriksaan dokumen pendukung evaluasi Komitmen Material:', pelaksanaan: '', simpulan: '' },
    { id: '9a', no: 'a', isParent: false, uraian: 'Perjanjian sewa pembiayaan / komitmen sewa guna usaha jangka panjang (PSAK 73).', pelaksanaan: 'Kontrak sewa dicatat sesuai SAK', simpulan: 'Memadai' },
    { id: '9b', no: 'b', isParent: false, uraian: 'Komitmen belanja modal (Capital Expenditure / Capex) atas perolehan aset tetap yang belum diselesaikan.', pelaksanaan: 'Tercantum di CALK', simpulan: 'Diungkapkan' },
  ]);

  const [simpulanAkhir, setSimpulanAkhir] = useState(
    (engagement as any)?.worksheetB280?.simpulanAkhir || 
    'Seluruh komitmen dan liabilitas kontinjensi yang ada telah diidentifikasi dan diungkapkan secara memadai dalam catatan atas laporan keuangan sesuai PSAK 57 dan PSAK 73.'
  );

  const handleUpdate = (id: string, field: keyof ProsedurItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <WorksheetContainer
      code="B.280"
      name="Komitmen dan Kontinjensi"
      purpose="Identifikasi, pengujian, dan evaluasi pengungkapan komitmen dan liabilitas kontinjensi sesuai PSAK 57 & SA 501."
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
                  B.280
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  PSAK 57 & SA 501
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Audit Komitmen & Liabilitas Kontinjensi
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Prosedur evaluasi komprehensif terhadap klaim hukum yang belum tuntas, sengketa pajak, garansi utang pihak ketiga, serta komitmen belanja modal yang mengikat di masa depan.
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
              <Scale size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Konfirmasi Hukum:</span> <span className="font-semibold text-emerald-700">Telah Diterima</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Pengungkapan:</span> <span className="font-semibold text-emerald-700">Lengkap di CALK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Checklist Prosedur Audit Komitmen & Kontinjensi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70">
            <h2 className="text-sm font-bold text-slate-800">
              Program Pemeriksaan Komitmen & Liabilitas Kontinjensi
            </h2>
            <p className="text-xs text-slate-500">
              Lakukan konfirmasi pihak ketiga, pemeriksaan biaya penasihat hukum, dan penelaahan kontrak material.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {items.map((item) => {
              if (item.isParent) {
                return (
                  <div key={item.id} className="px-5 py-3 bg-slate-50/90 font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-atlas-blue font-bold">{item.no}.</span>
                    <span>{item.uraian}</span>
                  </div>
                );
              }

              return (
                <div key={item.id} className="px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3 flex-1 pr-4">
                    <span className="w-5 font-bold text-slate-400 shrink-0">{item.no}.</span>
                    <span className="text-slate-800 font-medium leading-relaxed">{item.uraian}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <input
                      type="text"
                      value={item.pelaksanaan}
                      onChange={(e) => handleUpdate(item.id, 'pelaksanaan', e.target.value)}
                      placeholder="Pelaksanaan prosedur..."
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:border-atlas-blue w-40 sm:w-48"
                    />

                    <input
                      type="text"
                      value={item.simpulan}
                      onChange={(e) => handleUpdate(item.id, 'simpulan', e.target.value)}
                      placeholder="Simpulan..."
                      className="text-xs font-semibold text-emerald-800 bg-emerald-50/60 border border-emerald-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white w-32"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Simpulan Formal Auditor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Simpulan Formal Auditor atas Komitmen & Kontinjensi</span>
            </h3>
            <span className="text-[11px] text-slate-400">PSAK 57 & CALK</span>
          </div>
          <textarea
            value={simpulanAkhir}
            onChange={(e) => setSimpulanAkhir(e.target.value)}
            rows={3}
            placeholder="Tuliskan simpulan formal auditor terkait kepatuhan pencatatan dan pengungkapan komitmen/kontinjensi..."
            className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
          />
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b270`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.270</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b100`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Menu B.100</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
              <span>{isSaved ? "Tersimpan" : "Simpan KKP B.280"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Kertas kerja Komitmen & Kontinjensi berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B280;
