import React, { useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';

type MemoItem = {
  id: string;
  deskripsi: string;
  referensi: string;
  hasilAnalisis: string;
  isCustom?: boolean;
};

const C520 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [simpulan, setSimpulan] = useState('');
  const [penjelasan, setPenjelasan] = useState('');

  const [items, setItems] = useState<MemoItem[]>([
    { id: '1', deskripsi: 'Fraud atau indikasi fraud', referensi: 'A230.7, B250', hasilAnalisis: '' },
    { id: '2', deskripsi: 'Informasi terkait ketidakpatuhan terhadap hukum dan peraturan yang berlaku', referensi: 'A250.4', hasilAnalisis: '' },
    { id: '3', deskripsi: 'Transaksi tidak biasa (unusual transaction) dengan pihak yang memiliki hubungan istimewa', referensi: 'B220', hasilAnalisis: '' },
    { id: '4', deskripsi: 'Perkara hukum yang sedang dihadapi klien', referensi: 'B230', hasilAnalisis: '' },
    { id: '5', deskripsi: 'Kondisi yang dapat mempengaruhi keberlangsungan usaha (going concern)', referensi: 'B240', hasilAnalisis: '' },
    { id: '6', deskripsi: 'Konsultasi/keterlibatan spesialis lain di luar divisi audit', referensi: 'B260, B270', hasilAnalisis: '' },
    { id: '7', deskripsi: 'Keberadaan komitmen dan kontinjensi', referensi: 'B280', hasilAnalisis: '' },
    { id: '8', deskripsi: 'Defisiensi signifikan dalam pengendalian internal', referensi: 'A250.1', hasilAnalisis: '' },
    { id: '9', deskripsi: 'Overall materiality, performance materiality, specific materiality', referensi: 'A210', hasilAnalisis: '' },
    { id: '10', deskripsi: 'Summary audit difference', referensi: 'B130', hasilAnalisis: '' },
    { id: '11', deskripsi: 'Analytical procedures', referensi: 'A220', hasilAnalisis: '' },
    { id: '12', deskripsi: 'Opini audit (yang dipilih Auditor)', referensi: 'C400', hasilAnalisis: '' },
  ]);

  const handleUpdate = (id: string, field: keyof MemoItem, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddCustom = () => {
    const newId = `custom-${Date.now()}`;
    setItems([...items, { id: newId, deskripsi: '', referensi: '', hasilAnalisis: '', isCustom: true }]);
  };

  const handleRemoveCustom = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const status = simpulan !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="C.520"
      name="Audit Final Memorandum"
      purpose="Mensarikan hasil-hasil audit signifikan yang ditemukan oleh auditor selama pelaksanaan audit."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Instructions */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini digunakan untuk mensarikan hasil-hasil audit signifikan yang ditemukan oleh auditor selama pelaksanaan audit. Anda dapat menambahkan isu signifikan lainnya pada baris kustom di bagian bawah.</p>
        </div>

        {/* Tabel Audit Final Memorandum */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="px-2 py-2 border-r border-gray-400 font-bold text-center w-[500px] align-middle text-gray-800">Deskripsi</th>
                <th className="px-2 py-2 border-r border-gray-400 font-bold text-center w-32 align-middle text-gray-800">Referensi</th>
                <th className="px-2 py-2 font-bold text-center w-[600px] align-middle text-gray-800">Hasil Analisis</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-gray-300">
                  <td className={`border-r border-gray-300 ${item.isCustom ? 'bg-orange-50 p-0' : 'bg-white p-2'}`}>
                    {item.isCustom ? (
                      <div className="flex w-full h-full">
                        <button 
                          onClick={() => handleRemoveCustom(item.id)}
                          className="px-2 py-2 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center border-r border-orange-200"
                          title="Hapus baris ini"
                        >
                          <Trash2 size={12} />
                        </button>
                        <textarea 
                          className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight placeholder:italic" 
                          value={item.deskripsi} 
                          onChange={e => handleUpdate(item.id, 'deskripsi', e.target.value)} 
                          placeholder="Deskripsi isu audit signifikan..."
                        />
                      </div>
                    ) : (
                      <span className="text-gray-800 font-medium">{item.deskripsi}</span>
                    )}
                  </td>
                  
                  <td className={`border-r border-gray-300 text-center ${item.isCustom ? 'bg-orange-50 p-0' : 'bg-white p-2'}`}>
                    {item.isCustom ? (
                      <input 
                        type="text"
                        className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent text-center text-red-600 font-bold placeholder:italic placeholder:font-normal" 
                        value={item.referensi} 
                        onChange={e => handleUpdate(item.id, 'referensi', e.target.value)} 
                        placeholder="Ref..."
                      />
                    ) : (
                      <span className="text-red-600 font-bold">{item.referensi}</span>
                    )}
                  </td>
                  
                  <td className="bg-orange-100 p-0">
                    <textarea 
                      className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" 
                      value={item.hasilAnalisis} 
                      onChange={e => handleUpdate(item.id, 'hasilAnalisis', e.target.value)} 
                    />
                  </td>
                </tr>
              ))}
              <tr className="bg-white">
                <td colSpan={3} className="p-2 border-t border-gray-400">
                  <button 
                    onClick={handleAddCustom}
                    className="flex items-center text-atlas-blue font-bold hover:text-blue-800 transition-colors"
                  >
                    <Plus size={14} className="mr-1" /> Tambah Isu Signifikan Lainnya
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Panel Kesimpulan */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white border border-gray-300 p-3 rounded shadow-sm">
             <div className="flex gap-4 items-start">
               <div className="flex flex-col space-y-1 w-64">
                 <span className="font-bold text-gray-800 text-[10px]">Kesimpulan</span>
                 <select 
                   className="w-full border border-green-500 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                   value={simpulan}
                   onChange={(e) => {
                     setSimpulan(e.target.value);
                     if (e.target.value !== 'Audit final memorandum tidak memadai') {
                       setPenjelasan('');
                     }
                   }}
                 >
                   <option value="">- Pilih -</option>
                   <option value="Audit final memorandum memadai">Audit final memorandum memadai</option>
                   <option value="Audit final memorandum tidak memadai">Audit final memorandum tidak memadai</option>
                 </select>
               </div>
               
               <div className="w-32 border border-gray-400 text-center bg-white self-end mb-0.5">
                 <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
                 <div className={`font-bold py-1.5 text-[10px] ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
                   {status}
                 </div>
               </div>
             </div>

             {simpulan === 'Audit final memorandum tidak memadai' && (
               <div className="mt-3 bg-yellow-50 border border-yellow-300 p-2 shadow-inner rounded-sm">
                 <label className="block text-red-600 font-bold mb-1 text-[10px] uppercase">Jelaskan!</label>
                 <textarea 
                   className="w-full bg-white border border-yellow-300 outline-none p-2 resize-none min-h-[50px] text-xs"
                   value={penjelasan}
                   onChange={(e) => setPenjelasan(e.target.value)}
                   placeholder="Jelaskan mengapa audit final memorandum tidak memadai..."
                 ></textarea>
               </div>
             )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c510`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.510
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.520
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c530`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.530 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C520;
