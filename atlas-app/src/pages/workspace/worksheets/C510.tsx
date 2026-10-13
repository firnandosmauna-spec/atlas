import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type ReviewLAIItem = {
  id: string;
  no: string;
  uraian: string;
  kriteria: string;
  kondisi: string;
  keterangan: string;
  isHeader?: boolean;
  isSubHeader?: boolean;
};

const C510 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [kesimpulan, setKesimpulan] = useState('');

  const initialData: ReviewLAIItem[] = [
    { id: 'h1', no: '', uraian: 'BENTUK BAKU', kriteria: '', kondisi: '', keterangan: '', isHeader: true },
    { id: 'h2', no: '', uraian: 'LAPORAN AUDITOR INDEPENDEN', kriteria: '', kondisi: '', keterangan: '', isHeader: true },
    
    { id: 'sh1', no: '', uraian: 'Nomor', kriteria: '', kondisi: '', keterangan: '', isSubHeader: true },
    { id: '1', no: '1', uraian: 'Apakah laporan auditor sudah memuat nomor, Ketentuan register LAI sesuai dengan peraturan perundang-undangan', kriteria: '-', kondisi: '', keterangan: '' },
    
    { id: 'sh2', no: '', uraian: 'Judul', kriteria: '', kondisi: '', keterangan: '', isSubHeader: true },
    { id: '2', no: '2', uraian: 'Apakah laporan auditor telah memuat judul "laporan auditor independen"?', kriteria: 'SA 700:21', kondisi: '', keterangan: '' },
    
    { id: 'sh3', no: '', uraian: 'Pihak yang Dituju', kriteria: '', kondisi: '', keterangan: '', isSubHeader: true },
    { id: '3', no: '3', uraian: 'Apakah laporan auditor sudah ditujukan kepada pihak sesuai perikatan audit', kriteria: 'SA 700:22', kondisi: '', keterangan: '' },
    
    { id: 'sh4', no: '', uraian: 'Paragraf Pendahuluan', kriteria: '', kondisi: '', keterangan: '', isSubHeader: true },
    { id: '4', no: '4', uraian: 'Apakah pada alinea pembuka laporan auditor independen (LAI) telah memuat hal-hal berikut:\na. Menyebutkan identitas dari entitas yang laporan keuangannya diaudit;\nb. Menyebutkan bahwa laporan keuangan telah diaudit;\nc. Merinci identitas setiap laporan dalam laporan keuangan;\nd. Merujuk kepada ikhtisar kebijakan akuntansi signifikan dan informasi penjelasan lainnya;\ne. Menyebutkan tanggal atau periode yang dicakup oleh setiap laporan dalam laporan keuangan.', kriteria: 'SA 700:23', kondisi: '', keterangan: '' },
  ];

  const [items, setItems] = useState<ReviewLAIItem[]>(initialData);

  const handleUpdate = (id: string, field: keyof ReviewLAIItem, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const status = kesimpulan !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="C.510"
      name="Review LAI"
      purpose="Memastikan bahwa laporan auditor independen (LAI) yang akan diterbitkan telah memenuhi persyaratan SA 700, SA 705, dan SA 706."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Instructions */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini digunakan untuk memastikan bahwa laporan auditor independen yang akan diterbitkan telah memenuhi seluruh persyaratan yang diwajibkan oleh <span className="font-bold bg-yellow-200 px-1">SA 700, SA 705, dan SA 706</span> baik untuk laporan auditor independen tanpa modifikasi maupun yang mengandung modifikasi dan juga apabila ada penekanan suatu hal ataupun hal lain dalam laporan auditor independen.</p>
        </div>

        {/* Tabel Review LAI */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th rowSpan={2} className="px-2 py-2 border-r border-gray-400 font-bold text-center w-12 align-middle uppercase text-gray-800">No</th>
                <th rowSpan={2} className="px-2 py-2 border-r border-gray-400 font-bold text-center w-[500px] align-middle uppercase text-gray-800">Prosedur Audit / Deskripsi Singkat</th>
                <th rowSpan={2} className="px-2 py-2 border-r border-gray-400 font-bold text-center w-32 align-middle uppercase text-gray-800">Kriteria Standar Audit</th>
                <th colSpan={1} className="px-2 py-1 border-b border-r border-gray-400 font-bold text-center bg-green-50 text-green-800 w-48">Kondisi di Draft LAI</th>
                <th rowSpan={2} className="px-2 py-2 font-bold text-center w-64 align-middle uppercase text-gray-800">Keterangan</th>
              </tr>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="px-2 py-1 border-r border-gray-400 font-bold text-center bg-green-50 text-green-800 text-[9px] italic">Pilih Ketersediaan</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                if (item.isHeader) {
                  return (
                    <tr key={item.id} className="bg-gray-200 border-b border-gray-400">
                      <td colSpan={5} className="px-2 py-2 font-bold text-gray-800 uppercase">{item.uraian}</td>
                    </tr>
                  )
                }
                
                if (item.isSubHeader) {
                  return (
                    <tr key={item.id} className="bg-gray-50 border-b border-gray-300">
                      <td className="px-2 py-1 border-r border-gray-300"></td>
                      <td colSpan={4} className="px-2 py-1 font-bold text-gray-700">{item.uraian}</td>
                    </tr>
                  )
                }
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-gray-300">
                    <td className="bg-white p-2 text-center font-bold text-gray-700 border-r border-gray-300">
                      {item.no}
                    </td>
                    
                    <td className="bg-white p-2 text-gray-800 border-r border-gray-300 whitespace-pre-wrap leading-relaxed">
                      {item.uraian}
                    </td>
                    
                    <td className="bg-white p-2 text-center text-gray-700 font-medium border-r border-gray-300">
                      {item.kriteria}
                    </td>
                    
                    <td className="bg-green-100 p-0 border-r border-gray-300">
                      <select 
                        className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent font-medium text-center text-gray-800 focus:bg-green-200 transition-colors" 
                        value={item.kondisi} 
                        onChange={e => handleUpdate(item.id, 'kondisi', e.target.value)}
                      >
                        <option value=""></option>
                        <option value="Ada">Ada (V)</option>
                        <option value="Tidak Ada">Tidak Ada</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </td>
                    
                    <td className="bg-white p-0">
                      <textarea 
                        className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" 
                        value={item.keterangan} 
                        onChange={e => handleUpdate(item.id, 'keterangan', e.target.value)} 
                        placeholder="Tambahkan keterangan..."
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Kesimpulan */}
        <div className="bg-white border border-gray-400 p-4 shadow-sm">
           <div className="font-bold text-red-600 text-[10px] mb-2 uppercase">Kesimpulan atas Draft Laporan Auditor Independen</div>
           <div className="bg-yellow-100 p-0 border border-yellow-400 mb-4">
             <textarea 
               className="w-full min-h-[80px] p-3 outline-none bg-transparent resize-none text-gray-800 font-medium" 
               value={kesimpulan}
               onChange={e => setKesimpulan(e.target.value)}
               placeholder="Isilah kesimpulan hasil reviu secara manual..."
             />
           </div>
           
           <div className="grid grid-cols-[120px_200px] border border-gray-400 w-max">
             <div className="font-bold text-[10px] p-2 bg-gray-100 border-r border-gray-400">Status KKP</div>
             <div className={`font-bold p-2 text-[10px] text-center ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
               {status}
             </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c400`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.400
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.510
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c520`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.520 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C510;
