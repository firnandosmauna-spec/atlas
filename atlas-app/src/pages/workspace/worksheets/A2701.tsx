import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, Paperclip } from 'lucide-react';

const A2701 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [kesimpulan, setKesimpulan] = useState('');

  const [items, setItems] = useState([
    { id: 1, pertanyaan: 'Apakah auditor telah mengomunikasikan tanggung jawab auditor dalam hubungannya dengan audit atas laporan keuangan?', jawaban: '', referensi: '' },
    { id: 2, pertanyaan: 'Apakah auditor telah mengomunikasikan ruang lingkup dan saat audit rencanan?', jawaban: '', referensi: '' },
    { id: 3, pertanyaan: 'Apakah auditor telah mengomunikasikan temuan signifikan dari audit?', jawaban: '', referensi: '' },
    { id: 4, pertanyaan: 'Apakah auditor telah mengomunikasikan hal-hal lain yang relevan (seperti independensi)?', jawaban: '', referensi: '' },
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
      code="A.270.1"
      name="Ceklist Komunikasi dengan TCWG"
      purpose="Mengidentifikasi dan mendokumentasikan komunikasi dengan Pihak yang Bertanggung Jawab atas Tata Kelola (TCWG)."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Info Box */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja pendukung ini digunakan untuk mengidentifikasi dan mengomunikasikan kepada pihak yang bertanggung jawab atas tata kelola tentang hal-hal yang dikomunikasikan terkait <i>risk assessment</i> yang telah dilakukan. Auditor mengisi menggunakan pilihan dropdown dan harus melampirkan dokumentasi terkait.</p>
        </div>

        {/* Tabel Ceklist */}
        <div className="bg-white border border-gray-400 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cyan-100/50">
                <th className="px-3 py-2 border border-gray-400 font-bold text-gray-800 text-center w-12">No</th>
                <th className="px-3 py-2 border border-gray-400 font-bold text-gray-800">Hal yang Dikomunikasikan</th>
                <th className="px-3 py-2 border border-gray-400 font-bold text-center w-32">Jawaban (Ya/Tidak)</th>
                <th className="px-3 py-2 border border-gray-400 font-bold text-center w-64">Referensi Kertas Kerja / Lampiran</th>
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
                      placeholder="Contoh: Lampiran A.1"
                      value={item.referensi} onChange={e => updateItem(item.id, 'referensi', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attachment Section */}
        <div className="bg-gray-50 border border-gray-300 p-4 rounded mt-4">
          <div className="font-bold mb-2 flex items-center"><Paperclip size={16} className="mr-2" /> Upload Dokumentasi Komunikasi</div>
          <input type="file" className="text-xs w-full" />
        </div>

        {/* Kesimpulan */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
          <span className="font-bold w-24">Simpulan</span>
          <input 
            type="text"
            className="flex-1 bg-green-100 border border-green-300 outline-none p-2 font-medium"
            value={kesimpulan}
            onChange={e => setKesimpulan(e.target.value)}
            placeholder="Tuliskan simpulan dokumentasi..."
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
            Simpan A.270.1
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A2701;
