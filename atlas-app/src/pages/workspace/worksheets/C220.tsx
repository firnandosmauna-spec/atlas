import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type PengungkapanItem = {
  id: string;
  no: string;
  isHeader: boolean;
  uraian: string;
  sumber: string;
  ketersediaan: string;
  referensi: string;
  indentLevel: number;
};

const C220 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [simpulan, setSimpulan] = useState('');

  const [items, setItems] = useState<PengungkapanItem[]>([
    { id: 'h1', no: 'A', isHeader: true, uraian: 'Umum', sumber: '', ketersediaan: '', referensi: '', indentLevel: 0 },
    { id: '1', no: '1.', isHeader: false, uraian: 'Komponen laporan keuangan:', sumber: 'Bab 3.12', ketersediaan: '', referensi: '', indentLevel: 1 },
    { id: '1a', no: '(a)', isHeader: false, uraian: 'Neraca', sumber: '', ketersediaan: '', referensi: '', indentLevel: 2 },
    { id: '1b', no: '(b)', isHeader: false, uraian: 'Laporan laba rugi', sumber: '', ketersediaan: '', referensi: '', indentLevel: 2 },
    { id: '1c', no: '(c)', isHeader: false, uraian: 'Laporan perubahan ekuitas', sumber: '', ketersediaan: '', referensi: '', indentLevel: 2 },
    { id: '1ci', no: '(i)', isHeader: false, uraian: 'seluruh perubahan dalam ekuitas', sumber: '', ketersediaan: '', referensi: '', indentLevel: 3 },
    { id: '1cii', no: '(ii)', isHeader: false, uraian: 'perubahan ekuitas selain perubahan yang timbul dari transaksi dengan pemilik dalam kapasitasnya sebagai pemilik', sumber: '', ketersediaan: '', referensi: '', indentLevel: 3 },
    { id: '1d', no: '(d)', isHeader: false, uraian: 'Laporan arus kas', sumber: '', ketersediaan: '', referensi: '', indentLevel: 2 },
    { id: '1e', no: '(e)', isHeader: false, uraian: 'catatan atas laporan keuangan yang berisi ringkasan kebijakan akuntansi yang signifikan dan informasi penjelasan lainnya', sumber: '', ketersediaan: '', referensi: '', indentLevel: 2 },
    { id: '2', no: '2.', isHeader: false, uraian: 'Jika entitas hanya mengalami perubahan ekuitas yang muncul dari laba atau rugi pembayaran dividen, koreksi kesalahan periode lalu, dan perubahan kebijakan akuntansi selama periode pelaporan keuangan disajikan maka entitas dapat menyajikan laporan laba rugi dan saldo laba sebagai pengganti laporan laba rugi dan laporan perubahan ekuitas', sumber: 'Bab 3.15', ketersediaan: '', referensi: '', indentLevel: 1 },
  ]);

  const handleUpdate = (id: string, field: keyof PengungkapanItem, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const status = simpulan !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="C.220 B"
      name="Review Pengungkapan Laporan Keuangan Berdasarkan SAK ETAP"
      purpose="Checklist reviu pengisian Laporan Keuangan berdasarkan SAK ETAP."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: C.220 B</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Review Pengungkapan Berdasarkan SAK ETAP</div>
            </div>
            
            <div className="mt-6 flex flex-col items-start space-y-2">
              <span className="font-bold text-gray-800 text-[10px]">Kesimpulan</span>
              <div className="w-full space-y-2">
                <select 
                  className="w-full max-w-xl border border-green-500 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                  value={simpulan}
                  onChange={(e) => setSimpulan(e.target.value)}
                >
                  <option value="">- Pilih Kesimpulan -</option>
                  <option value="Telah diungkapkan secara memadai sesuai SAK ETAP">Telah diungkapkan secara memadai sesuai SAK ETAP</option>
                  <option value="Belum diungkapkan secara memadai sesuai SAK ETAP">Belum diungkapkan secara memadai sesuai SAK ETAP</option>
                </select>
              </div>
            </div>
            
            <div className="w-32 border border-gray-400 mt-4 text-center bg-white">
              <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
              <div className={`font-bold py-1.5 text-[10px] ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
                {status}
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Checklist */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-400">
                <th rowSpan={2} className="px-2 py-2 border-r border-gray-400 font-bold text-center w-10 align-middle">No</th>
                <th rowSpan={2} className="px-2 py-2 border-r border-gray-400 font-bold text-center w-[500px] align-middle">Uraian</th>
                <th rowSpan={2} className="px-2 py-2 border-r border-gray-400 font-bold text-center w-24 align-middle">Sumber</th>
                <th colSpan={1} className="px-2 py-1 border-b border-r border-gray-400 font-bold text-center bg-green-50 text-green-800 w-48">Catatan atas Laporan Keuangan</th>
                <th rowSpan={2} className="px-2 py-2 font-bold text-center w-48 align-middle">Refer ke CaLK</th>
              </tr>
              <tr className="bg-gray-50 border-b border-gray-400">
                 <th className="px-2 py-1 border-r border-gray-400 font-bold text-center bg-green-50 text-green-800 text-[9px] italic">Pilih Ketersediaan</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-gray-300">
                  <td className={`bg-white p-2 text-center font-bold border-r border-gray-300 ${item.isHeader ? 'text-red-600' : 'text-gray-700'}`}>{item.no}</td>
                  
                  <td className={`bg-white p-2 leading-relaxed border-r border-gray-300 ${item.isHeader ? 'font-bold text-red-600' : 'text-gray-800'}`} style={{ paddingLeft: `${item.indentLevel * 1.5 + 0.5}rem` }}>
                    {item.uraian}
                  </td>
                  
                  <td className="bg-white p-2 text-center font-bold text-gray-500 border-r border-gray-300">{item.sumber}</td>
                  
                  <td className="bg-orange-100 p-0 border-r border-gray-300">
                    {!item.isHeader && (
                      <select 
                        className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent font-medium text-center text-gray-700" 
                        value={item.ketersediaan} 
                        onChange={e => handleUpdate(item.id, 'ketersediaan', e.target.value)}
                      >
                        <option value=""></option>
                        <option value="Ada">Ada (V)</option>
                        <option value="Tidak Ada">Tidak Ada</option>
                        <option value="N/A">N/A</option>
                      </select>
                    )}
                  </td>
                  
                  <td className="bg-orange-100 p-0">
                    {!item.isHeader && (
                      <textarea 
                        className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" 
                        value={item.referensi} 
                        onChange={e => handleUpdate(item.id, 'referensi', e.target.value)} 
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c200`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.200 Dashboard
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.220 B
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c300`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.300 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C220;
