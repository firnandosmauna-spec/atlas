import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, Paperclip } from 'lucide-react';

const A2702 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [kesimpulan, setKesimpulan] = useState('');

  const [mengandalkanSPI, setMengandalkanSPI] = useState('');

  const [items, setItems] = useState([
    { id: 1, pertanyaan: 'Apakah auditor telah mengevaluasi objektivitas fungsi audit internal?', jawaban: '', referensi: '' },
    { id: 2, pertanyaan: 'Apakah auditor telah mengevaluasi kompetensi teknis auditor internal?', jawaban: '', referensi: '' },
    { id: 3, pertanyaan: 'Apakah auditor telah mengevaluasi apakah pekerjaan auditor internal dilaksanakan dengan kecermatan profesional?', jawaban: '', referensi: '' },
    { id: 4, pertanyaan: 'Apakah terdapat komunikasi yang efektif antara auditor internal dan eksternal?', jawaban: '', referensi: '' },
  ]);

  const updateItem = (id: number, field: string, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="A.270.2"
      name="Penggunaan Hasil Pekerjaan Auditor Internal"
      purpose="Mengidentifikasi dan mengevaluasi penggunaan hasil pekerjaan auditor internal (SPI) oleh auditor."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Info Box */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini digunakan untuk mengidentifikasi terkait penggunaan hasil pekerjaan auditor internal oleh auditor.</p>
          <p className="mt-2 text-red-700 font-bold">Instruksi:</p>
          <p>Tentukan apakah Anda mengandalkan hasil pekerjaan auditor internal. Jika <strong>Ya</strong>, jawab pertanyaan evaluasi yang muncul di bawah.</p>
        </div>

        {/* Master Control */}
        <div className="bg-white border border-gray-400 p-4 flex items-center shadow-sm">
          <span className="font-bold mr-4 text-sm">Apakah auditor mengandalkan hasil pekerjaan auditor internal?</span>
          <select 
            className="border border-gray-400 p-2 font-bold outline-none cursor-pointer w-32 bg-yellow-50 focus:bg-white"
            value={mengandalkanSPI}
            onChange={e => setMengandalkanSPI(e.target.value)}
          >
            <option value="">- Pilih -</option>
            <option value="Ya">Ya</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>

        {/* Tabel Ceklist (Hanya Muncul Jika Ya) */}
        {mengandalkanSPI === 'Ya' && (
          <div className="bg-white border border-gray-400 overflow-hidden shadow-sm mt-4 animate-in fade-in">
            <div className="bg-blue-900 text-white font-bold py-1 px-2 text-[10px] uppercase tracking-wider border-b border-blue-950">
              Evaluasi Penggunaan Hasil Pekerjaan SPI
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cyan-100/50">
                  <th className="px-3 py-2 border border-gray-400 font-bold text-gray-800 text-center w-12">No</th>
                  <th className="px-3 py-2 border border-gray-400 font-bold text-gray-800">Pertanyaan Evaluasi</th>
                  <th className="px-3 py-2 border border-gray-400 font-bold text-center w-32">Jawaban (Ya/Tidak)</th>
                  <th className="px-3 py-2 border border-gray-400 font-bold text-center w-64">Referensi / Lampiran</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 border border-gray-400 text-center font-bold">{idx + 1}</td>
                    <td className="px-3 py-2 border border-gray-400 font-medium">{item.pertanyaan}</td>
                    <td className="px-0 py-0 border border-gray-400 bg-yellow-50">
                      <select 
                        className="w-full h-full min-h-[44px] bg-transparent outline-none font-bold text-center cursor-pointer"
                        value={item.jawaban} onChange={e => updateItem(item.id, 'jawaban', e.target.value)}
                      >
                        <option value="">-</option>
                        <option value="Ya">Ya</option>
                        <option value="Tidak">Tidak</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </td>
                    <td className="px-0 py-0 border border-gray-400 bg-white">
                      <input 
                        type="text" 
                        className="w-full h-full min-h-[44px] bg-transparent outline-none px-2 font-mono text-xs"
                        placeholder="Contoh: Dokumen SPI"
                        value={item.referensi} onChange={e => updateItem(item.id, 'referensi', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Attachment Section */}
        <div className="bg-gray-50 border border-gray-300 p-4 rounded mt-4">
          <div className="font-bold mb-2 flex items-center"><Paperclip size={16} className="mr-2" /> Upload Dokumentasi Hasil SPI</div>
          <input type="file" className="text-xs w-full" disabled={mengandalkanSPI !== 'Ya'} />
        </div>

        {/* Kesimpulan */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
          <span className="font-bold w-24">Simpulan</span>
          <input 
            type="text"
            className="flex-1 bg-green-100 border border-green-300 outline-none p-2 font-medium"
            value={kesimpulan}
            onChange={e => setKesimpulan(e.target.value)}
            placeholder="Tuliskan simpulan..."
          />
        </div>

        <div className="w-32 border border-gray-400 mt-2 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        {/* Action */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/a270`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke A.270
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan A.270.2
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A2702;
