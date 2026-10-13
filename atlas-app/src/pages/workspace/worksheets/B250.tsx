import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type RepresentationItem = {
  id: string;
  no: string;
  kondisi: string;
  yaTidak: string;
  komentar: string;
  lampiran: string;
};

const B250 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [items, setItems] = useState<RepresentationItem[]>([
    { id: '1', no: '1', kondisi: 'Apakah manajemen telah menyediakan representasi tertulis bahwa mereka telah memenuhi tanggung jawab mereka dalam menyusun laporan keuangan sesuai dengan kerangka pelaporan keuangan yang berlaku, termasuk, apabila relevan, penyajian yang wajar, seperti yang disetujui dalam ketentuan perikatan audit?', yaTidak: '', komentar: '', lampiran: '' },
    { id: '2', no: '2', kondisi: 'Apakah Representasi tertulis telah disiapkan dalam bentuk surat representasi yang ditujukan kepada auditor?', yaTidak: '', komentar: '', lampiran: '' },
    { id: '3', no: '3', kondisi: 'Apakah representasi tertulis tersebut telah menjelaskan bahwa manajemen telah menyediakan semua informasi relevan dan akses sesuai dengan yang disetujui dalam ketentuan perikatan audit; serta semua transaksi telah dicatat dan dicerminkan dalam laporan keuangan?', yaTidak: '', komentar: '', lampiran: '' },
    { id: '4', no: '4', kondisi: 'Apakah tanggung jawab manajemen telah dijelaskan dalam representasi tertulis sesuai dengan tanggung jawab yang terdapat di dalam ketentuan perikatan audit?', yaTidak: '', komentar: '', lampiran: '' },
    { id: '5', no: '5', kondisi: 'Apakah tanggal representasi tertulis telah sama dengan tanggal laporan auditor atas laporan keuangan?', yaTidak: '', komentar: '', lampiran: '' },
    { id: '6', no: '6', kondisi: 'Apakah representasi tertulis telah mencakup seluruh laporan keuangan dan periode yang dirujuk di dalam laporan?', yaTidak: '', komentar: '', lampiran: '' },
    { id: '7', no: '7', kondisi: 'Apakah dapat dipastikan bahwa opini auditor tidak dapat dinyatakan, dan laporan auditor tidak dapat diberi tanggal, sebelum tanggal representasi tertulis?', yaTidak: '', komentar: '', lampiran: '' },
    { id: '8', no: '8', kondisi: 'Jika relevan, apakah terdapat satu atau lebih asersi spesifik di dalam laporan keuangan, dimana auditor harus meminta tambahan representasi untuk mendukung bukti audit lain yang relevan dengan laporan keuangan sesuai dengan Standar Audit relevan lainnya?', yaTidak: '', komentar: '', lampiran: '' },
  ]);

  const [simpulanOtomatis, setSimpulanOtomatis] = useState('');
  const [penjelasan, setPenjelasan] = useState('');

  // Hitung status pengisian
  const isAllAnswered = items.every(item => item.yaTidak !== '');
  const hasTidak = items.some(item => item.yaTidak === 'TIDAK');

  useEffect(() => {
    if (isAllAnswered) {
      if (hasTidak) {
        setSimpulanOtomatis('Representasi manajemen tidak memadai');
      } else {
        setSimpulanOtomatis('Representasi manajemen telah memadai');
      }
    } else {
      setSimpulanOtomatis('');
    }
  }, [items, isAllAnswered, hasTidak]);

  const status = isAllAnswered ? 'Completed' : 'Incompleted';

  const handleUpdate = (id: string, field: keyof RepresentationItem, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="B.250"
      name="Representasi Manajemen"
      purpose="Mengidentifikasi apakah auditor telah memperoleh surat representasi tertulis dari manajemen sesuai SA 580."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini digunakan untuk mengidentifikasi apakah auditor telah memperoleh surat representasi dari manajemen dan isinya telah sesuai dengan <strong>SA 580 Representasi Tertulis</strong>.</p>
          <p className="mt-2 text-gray-600 text-xs">Representasi tertulis diperoleh menjelang akhir atau mendekati, tetapi tidak sesudah, tanggal laporan auditor atas laporan keuangan. Pernyataan tertulis mencakup seluruh laporan keuangan dan seluruh periode yang disebutkan dalam laporan keuangan.</p>
        </div>

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm flex flex-col justify-between">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: B.250</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Representasi Manajemen</div>
            </div>
            
            <div className="mt-4 flex gap-6">
              <div className="w-32 border border-gray-400 text-center bg-white shadow-sm">
                <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
                <div className={`font-bold py-1.5 text-[10px] ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
                  {status}
                </div>
              </div>

              {/* Simpulan Otomatis Area */}
              <div className="flex-1 border border-gray-400 text-center bg-white shadow-sm">
                <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold text-gray-700">Simpulan Otomatis</div>
                <div className={`font-bold py-1.5 text-[10px] ${
                  simpulanOtomatis === 'Representasi manajemen telah memadai' ? 'bg-green-100 text-green-800' :
                  simpulanOtomatis === 'Representasi manajemen tidak memadai' ? 'bg-red-100 text-red-800' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {simpulanOtomatis || '- Silakan isi seluruh baris pertanyaan terlebih dahulu -'}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-96 bg-white border border-gray-300 p-3 rounded shadow-sm text-[10px]">
             <div className="flex justify-between items-center mb-1">
               <span>Disiapkan oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" defaultValue={engagement.auditorName || "Auditor"} />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal mulai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
             <div className="flex justify-between items-center mb-1 pb-2 border-b border-gray-200">
               <span>Tanggal selesai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
             
             <div className="flex justify-between items-center mt-2 mb-1">
               <span>Direview oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" defaultValue={engagement.managerName || "Manager"} />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal mulai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal selesai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
          </div>
        </div>

        {/* Tabel Utama */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="px-2 py-2.5 border border-gray-400 font-bold text-center w-10">NO</th>
                <th className="px-2 py-2.5 border border-gray-400 font-bold text-center w-[500px]">KONDISI</th>
                <th className="px-2 py-2.5 border border-gray-400 font-bold text-center w-32">YA/TIDAK</th>
                <th className="px-2 py-2.5 border border-gray-400 font-bold text-center w-72">KOMENTAR</th>
                <th className="px-2 py-2.5 border border-gray-400 font-bold text-center w-32">LAMPIRAN</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-gray-400 bg-gray-50 text-center font-bold text-gray-600 p-2 align-top">{item.no}</td>
                  <td className="border border-gray-400 bg-white p-2 text-gray-800 leading-relaxed align-top">{item.kondisi}</td>
                  <td className="border border-gray-400 bg-green-50/50 p-0 align-top">
                    <select 
                      className={`w-full h-full min-h-[50px] p-2 outline-none bg-transparent font-bold text-center ${
                        item.yaTidak === 'YA' ? 'text-green-700' :
                        item.yaTidak === 'TIDAK' ? 'text-red-700' : 'text-gray-700'
                      }`}
                      value={item.yaTidak} 
                      onChange={e => handleUpdate(item.id, 'yaTidak', e.target.value)}
                    >
                      <option value=""></option>
                      <option value="YA">YA</option>
                      <option value="TIDAK">TIDAK</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </td>
                  <td className="border border-gray-400 bg-orange-50/50 p-0 align-top">
                    <textarea 
                      className="w-full h-full min-h-[50px] p-2 outline-none bg-transparent resize-none leading-tight" 
                      value={item.komentar} 
                      onChange={e => handleUpdate(item.id, 'komentar', e.target.value)} 
                    />
                  </td>
                  <td className="border border-gray-400 bg-white p-0 align-top">
                    <input 
                      type="text" 
                      className="w-full h-full min-h-[50px] p-2 outline-none bg-transparent text-center text-red-600 font-bold" 
                      value={item.lampiran} 
                      onChange={e => handleUpdate(item.id, 'lampiran', e.target.value)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic Warning Box */}
        {simpulanOtomatis === 'Representasi manajemen tidak memadai' && (
          <div className="w-full bg-yellow-50 border-2 border-yellow-400 p-4 shadow-sm rounded-sm mt-4 animate-in fade-in slide-in-from-top-2">
            <label className="block text-red-600 font-bold mb-2 uppercase text-[10px]">
              Terdapat ketidaksesuaian atau representasi belum memadai. Jelaskan alasan hal tersebut pada kotak di bawah ini:
            </label>
            <textarea 
              className="w-full bg-white border border-yellow-400 outline-none p-3 resize-none min-h-[80px]"
              value={penjelasan}
              onChange={(e) => setPenjelasan(e.target.value)}
              placeholder="Masukkan rincian ketidaksesuaian/alasan belum memadai berdasarkan butir-butir SA 580..."
            ></textarea>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b240`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.240
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan B.250
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b260`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut B.260 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B250;
