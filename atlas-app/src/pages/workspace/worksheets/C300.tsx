import React, { useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type MutuItem = {
  id: string;
  indeks: string;
  namaIndeks: string;
  kesimpulan: string;
  penjelasanKesimpulan: string;
  saranReviewer: string;
  tindakLanjut: string;
  pereview: string;
  tanggal: string;
  isSectionHeader?: boolean;
};

const C300 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [simpulan, setSimpulan] = useState('');
  const [penjelasan, setPenjelasan] = useState('');
  const [lampiran, setLampiran] = useState('');

  const initialData: MutuItem[] = [
    { id: 'h1', indeks: '', namaIndeks: 'A. RISK ASSESSMENT', kesimpulan: '', penjelasanKesimpulan: '', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '', isSectionHeader: true },
    { id: '1', indeks: 'A110', namaIndeks: 'Analisis Penerimaan dan Keberlanjutan Hubungan dengan Klien', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '2', indeks: 'A120', namaIndeks: 'Alokasi Jam Jasa dan Perencanaan Lainnya', kesimpulan: 'Alokasi jam kerja belum memadai', penjelasanKesimpulan: 'Perlu penyesuaian jam kerja manajer', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '3', indeks: 'A130', namaIndeks: 'Surat Perikatan', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '4', indeks: 'A140', namaIndeks: 'Surat Tugas', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '5', indeks: 'A150', namaIndeks: 'Pernyataan Independensi', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '6', indeks: 'A160', namaIndeks: 'Komunikasi Tim Perikatan', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '7', indeks: 'A210', namaIndeks: 'Materialitas Awal', kesimpulan: 'Materialitas belum ditentukan', penjelasanKesimpulan: 'Specific Materiality Belum Ditentukan', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '8', indeks: 'A220', namaIndeks: 'Prosedur Analitis Awal', kesimpulan: 'Memadai', penjelasanKesimpulan: 'Prosedur awal sudah dilakukan dan tidak ditemukan salah saji', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '9', indeks: 'A230', namaIndeks: 'Pemahaman Entitas dan Lingkungannya', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    
    { id: 'h2', indeks: '', namaIndeks: 'B. RISK RESPONSE', kesimpulan: '', penjelasanKesimpulan: '', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '', isSectionHeader: true },
    { id: '10', indeks: 'B100', namaIndeks: 'Uji Pengendalian dan Substantif', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '11', indeks: 'B210', namaIndeks: 'Estimasi Akuntansi', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '12', indeks: 'B220', namaIndeks: 'Pihak Berelasi', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '13', indeks: 'B230', namaIndeks: 'Peristiwa Kemudian', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    
    { id: 'h3', indeks: '', namaIndeks: 'C. COMPLETING & REPORTING', kesimpulan: '', penjelasanKesimpulan: '', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '', isSectionHeader: true },
    { id: '14', indeks: 'C110', namaIndeks: 'Penilaian Materialitas Final', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '15', indeks: 'C120', namaIndeks: 'Prosedur Analitis Final', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
    { id: '16', indeks: 'C200', namaIndeks: 'Review Pengungkapan LK', kesimpulan: 'Memadai', penjelasanKesimpulan: '-', saranReviewer: '', tindakLanjut: '', pereview: '', tanggal: '' },
  ];

  const [data, setData] = useState<MutuItem[]>(initialData);

  const handleUpdate = (id: string, field: keyof MutuItem, value: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const status = simpulan !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="C.300"
      name="Penelaahan Mutu"
      purpose="Memastikan bahwa seluruh aspek tahapan audit mulai dari risk assessment, risk response, dan reporting telah diselesaikan dengan baik oleh pereviu."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Instructions */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini digunakan oleh pereviu untuk memastikan bahwa seluruh aspek tahapan audit mulai dari <span className="italic">risk assessment</span>, <span className="italic">risk response</span>, dan <span className="italic">reporting</span> telah diselesaikan dengan baik. Apabila masih terdapat isu yang belum terselesaikan dengan baik, maka pereviu akan memberikan respon/masukan untuk ditindaklanjuti. Pereviu selanjutnya akan memastikan agar tindak lanjut atas respon/masukan yang diberikan telah dilaksanakan secara memadai.</p>
        </div>

        {/* Action Panel */}
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
                     if (e.target.value !== 'Penelaahan mutu tidak memadai') {
                       setPenjelasan('');
                     }
                   }}
                 >
                   <option value="">- Pilih -</option>
                   <option value="Penelaahan mutu memadai">Penelaahan mutu memadai</option>
                   <option value="Penelaahan mutu tidak memadai">Penelaahan mutu tidak memadai</option>
                 </select>
               </div>
               
               <div className="w-32 border border-gray-400 text-center bg-white self-end mb-0.5">
                 <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
                 <div className={`font-bold py-1.5 text-[10px] ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
                   {status}
                 </div>
               </div>
             </div>

             {simpulan === 'Penelaahan mutu tidak memadai' && (
               <div className="mt-3 bg-yellow-50 border border-yellow-300 p-2 shadow-inner rounded-sm">
                 <label className="block text-red-600 font-bold mb-1 text-[10px] uppercase">Jelaskan!</label>
                 <textarea 
                   className="w-full bg-white border border-yellow-300 outline-none p-2 resize-none min-h-[50px] text-xs"
                   value={penjelasan}
                   onChange={(e) => setPenjelasan(e.target.value)}
                   placeholder="Jelaskan mengapa penelaahan mutu tidak memadai..."
                 ></textarea>
               </div>
             )}
          </div>
        </div>

        {/* Penelaahan Mutu Table */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="px-2 py-2 border-r border-gray-400 font-bold text-center w-16 align-middle uppercase text-gray-800">Indeks</th>
                <th className="px-2 py-2 border-r border-gray-400 font-bold text-center w-56 align-middle uppercase text-gray-800">Nama Indeks</th>
                <th className="px-2 py-2 border-r border-gray-400 font-bold text-center w-48 align-middle uppercase text-gray-800">Kesimpulan</th>
                <th className="px-2 py-2 border-r border-gray-400 font-bold text-center w-64 align-middle uppercase text-gray-800">Penjelasan Kesimpulan</th>
                <th className="px-2 py-2 border-r border-gray-400 font-bold text-center w-64 align-middle uppercase text-gray-800">Saran Reviewer</th>
                <th className="px-2 py-2 border-r border-gray-400 font-bold text-center w-64 align-middle uppercase text-gray-800">Tindak Lanjut Saran Reviewer</th>
                <th className="px-2 py-2 border-r border-gray-400 font-bold text-center w-32 align-middle uppercase text-gray-800">Pereview & Paraf</th>
                <th className="px-2 py-2 font-bold text-center w-32 align-middle uppercase text-gray-800">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                if (item.isSectionHeader) {
                  return (
                    <tr key={item.id} className="bg-gray-200 border-b border-gray-400">
                      <td colSpan={8} className="px-2 py-2 font-bold text-gray-800 uppercase">{item.namaIndeks}</td>
                    </tr>
                  )
                }
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-gray-300">
                    <td className="bg-white p-2 text-center font-bold text-atlas-blue hover:underline cursor-pointer border-r border-gray-300" onClick={() => navigate(`/workspace/${engagement.id}/worksheet/${item.indeks.toLowerCase()}`)}>
                      {item.indeks}
                    </td>
                    
                    <td className="bg-white p-2 text-gray-800 border-r border-gray-300">
                      {item.namaIndeks}
                    </td>
                    
                    <td className="bg-white p-2 text-gray-700 italic border-r border-gray-300">
                      {item.kesimpulan}
                    </td>
                    
                    <td className={`p-2 border-r border-gray-300 ${item.penjelasanKesimpulan === '-' || item.penjelasanKesimpulan === '' ? 'bg-white' : 'bg-gray-800 text-white font-medium'}`}>
                      {item.penjelasanKesimpulan}
                    </td>
                    
                    <td className="bg-orange-100 p-0 border-r border-gray-300">
                      <textarea 
                        className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" 
                        value={item.saranReviewer} 
                        onChange={e => handleUpdate(item.id, 'saranReviewer', e.target.value)} 
                        placeholder={item.penjelasanKesimpulan !== '-' && item.penjelasanKesimpulan !== '' ? 'Beri saran...' : 'N/A'}
                      />
                    </td>
                    
                    <td className="bg-orange-100 p-0 border-r border-gray-300">
                      <textarea 
                        className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" 
                        value={item.tindakLanjut} 
                        onChange={e => handleUpdate(item.id, 'tindakLanjut', e.target.value)} 
                        placeholder={item.penjelasanKesimpulan !== '-' && item.penjelasanKesimpulan !== '' ? 'Tindak lanjut...' : 'N/A'}
                      />
                    </td>
                    
                    <td className="bg-orange-100 p-0 border-r border-gray-300">
                      <input 
                        type="text"
                        className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent text-center" 
                        value={item.pereview} 
                        onChange={e => handleUpdate(item.id, 'pereview', e.target.value)} 
                      />
                    </td>
                    
                    <td className="bg-orange-100 p-0">
                      <input 
                        type="date"
                        className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent text-center uppercase text-[9px]" 
                        value={item.tanggal} 
                        onChange={e => handleUpdate(item.id, 'tanggal', e.target.value)} 
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Lampiran */}
        <div className="bg-white border border-gray-300 p-4 shadow-sm">
           <div className="font-bold text-red-600 text-[10px] mb-2 uppercase">Lampiran Kertas Kerja</div>
           <div className="bg-orange-100 p-0 border border-gray-300">
             <textarea 
               className="w-full min-h-[60px] p-2 outline-none bg-transparent resize-none" 
               value={lampiran}
               onChange={e => setLampiran(e.target.value)}
               placeholder="Lampirkan tautan atau link scan kertas kerja fisik yang telah diparaf di sini..."
             />
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c200`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.200
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.300
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c400`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.400 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C300;
