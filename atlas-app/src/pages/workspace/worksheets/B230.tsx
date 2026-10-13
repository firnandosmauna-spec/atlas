import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type SubsequentEventItem = {
  id: string;
  no: string;
  kondisi: string;
  yaTidak: string;
  debet: string;
  kredit: string;
  pengungkapan: string;
  frasa: string;
  referensi: string;
};

const B230 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [penyesuai, setPenyesuai] = useState<SubsequentEventItem[]>([
    { id: 'p1', no: '1', kondisi: 'Apakah terdapat penyelesaian kasus pengadilan setelah periode pelaporan yang memutuskan bahwa entitas memiliki kewajiban kini pada akhir periode pelaporan?', yaTidak: '', debet: '', kredit: '', pengungkapan: '', frasa: '', referensi: '' },
    { id: 'p2', no: '2', kondisi: 'Apakah terdapat informasi yang mengindikasikan adanya impairment nilai aset pada akhir periode pelaporan atau perlunya penyesuaian atas jumlah yang sebelumnya telah diakui sebagai rugi penurunan nilai aset?', yaTidak: '', debet: '', kredit: '', pengungkapan: '', frasa: '', referensi: '' },
    { id: 'p3', no: '3', kondisi: 'Apakah terdapat penentuan setelah periode pelaporan atas biaya perolehan aset yang dibeli atau hasil penjualan aset yang dijual sebelum akhir periode pelaporan?', yaTidak: '', debet: '', kredit: '', pengungkapan: '', frasa: '', referensi: '' },
    { id: 'p4', no: '4', kondisi: 'Apakah terdapat pembayaran bagi laba atau bonus setelah periode pelaporan jika entitas memiliki kewajiban hukum atau kewajiban konstruktif kini pada akhir periode pelaporan?', yaTidak: '', debet: '', kredit: '', pengungkapan: '', frasa: '', referensi: '' },
  ]);

  const [nonPenyesuai, setNonPenyesuai] = useState<SubsequentEventItem[]>([
    { id: 'np6', no: '6', kondisi: 'Apakah terdapat kombinasi bisnis signifikan atau pelepasan entitas anak yang signifikan setelah periode pelaporan?', yaTidak: '', debet: '', kredit: '', pengungkapan: '', frasa: '', referensi: '' },
    { id: 'np7', no: '7', kondisi: 'Apakah terdapat pengumuman untuk menghentikan suatu operasi?', yaTidak: '', debet: '', kredit: '', pengungkapan: '', frasa: '', referensi: '' },
    { id: 'np8', no: '8', kondisi: 'Apakah telah terjadi atau rencana pembelian aset yang signifikan?', yaTidak: '', debet: '', kredit: '', pengungkapan: '', frasa: '', referensi: '' },
    { id: 'np9', no: '9', kondisi: 'Apakah terdapat pengklasifikasian aset sebagai aset dimiliki untuk dijual sesuai PSAK 58?', yaTidak: '', debet: '', kredit: '', pengungkapan: '', frasa: '', referensi: '' },
    { id: 'np10', no: '10', kondisi: 'Apakah telah terjadi atau rencana pelepasan aset lain yang signifikan?', yaTidak: '', debet: '', kredit: '', pengungkapan: '', frasa: '', referensi: '' },
  ]);

  const [simpulan, setSimpulan] = useState('');
  const [alasan, setAlasan] = useState('');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUpdate = (
    id: string, 
    field: keyof SubsequentEventItem, 
    value: string, 
    isPenyesuai: boolean
  ) => {
    if (isPenyesuai) {
      setPenyesuai(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    } else {
      setNonPenyesuai(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    }
  };

  const isSimpulanFilled = simpulan !== '';
  const status = isSimpulanFilled ? 'Completed' : 'Incompleted';

  const renderTableRows = (items: SubsequentEventItem[], isPenyesuai: boolean) => {
    return items.map((item) => {
      const pajeText = item.yaTidak === 'Ya' ? 'CAJE/PAJE' : '';
      
      return (
        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
          <td className="border border-gray-400 bg-gray-50 text-center font-bold text-gray-600 p-2">{item.no}</td>
          <td className="border border-gray-400 bg-white p-2 text-gray-800 leading-tight pr-4">{item.kondisi}</td>
          <td className="border border-gray-400 bg-white p-0">
            <select 
              className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent text-center font-bold text-gray-800" 
              value={item.yaTidak} 
              onChange={e => handleUpdate(item.id, 'yaTidak', e.target.value, isPenyesuai)}
            >
              <option value=""></option>
              <option value="Ya">Ya</option>
              <option value="Tidak">Tidak</option>
            </select>
          </td>
          <td className="border border-gray-400 bg-orange-50/50 p-0">
            <input type="text" className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent text-right" placeholder="0" value={item.debet} onChange={e => handleUpdate(item.id, 'debet', e.target.value, isPenyesuai)} />
          </td>
          <td className="border border-gray-400 bg-orange-50/50 p-0">
            <input type="text" className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent text-right" placeholder="0" value={item.kredit} onChange={e => handleUpdate(item.id, 'kredit', e.target.value, isPenyesuai)} />
          </td>
          <td className="border border-gray-400 bg-green-50/50 p-0">
            <select 
              className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent text-center" 
              value={item.pengungkapan} 
              onChange={e => handleUpdate(item.id, 'pengungkapan', e.target.value, isPenyesuai)}
            >
              <option value=""></option>
              <option value="Ya">Ya</option>
              <option value="Tidak">Tidak</option>
            </select>
          </td>
          <td className="border border-gray-400 bg-gray-50 text-center font-bold text-red-600 p-2">{pajeText}</td>
          <td className="border border-gray-400 bg-orange-50/50 p-0">
            <textarea className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" value={item.frasa} onChange={e => handleUpdate(item.id, 'frasa', e.target.value, isPenyesuai)} />
          </td>
          <td className="border border-gray-400 bg-white p-0">
            <input type="text" className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent text-center text-red-600 font-bold" value={item.referensi} onChange={e => handleUpdate(item.id, 'referensi', e.target.value, isPenyesuai)} />
          </td>
        </tr>
      );
    });
  };

  return (
    <WorksheetContainer
      code="B.230"
      name="Peristiwa Kemudian"
      purpose="Identifikasi atas peristiwa-peristiwa setelah tanggal neraca dan menganalisis dampaknya."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Pada kertas kerja ini auditor melakukan identifikasi atas peristiwa-peristiwa setelah tanggal neraca dan menganalisis lebih lanjut apakah mempengaruhi laporan keuangan dan pengungkapannya.</p>
          <p className="mt-2">Berdasarkan SA 560 Peristiwa Kemudian, terdapat 2 jenis peristiwa yang harus dipertimbangkan: <br/>1. Peristiwa penyesuai setelah periode pelaporan <br/>2. Peristiwa non-penyesuai setelah periode pelaporan yang umumnya dibuat pengungkapan</p>
        </div>

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: B.230</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Peristiwa Kemudian</div>
            </div>
            
            <div className="mt-6 flex flex-col items-start space-y-2">
              <span className="font-bold text-gray-800 text-[10px]">Simpulan</span>
              <div className="w-full space-y-2">
                <select 
                  className="w-full max-w-xl border border-green-500 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                  value={simpulan}
                  onChange={(e) => {
                    setSimpulan(e.target.value);
                    if (e.target.value !== 'Bukti audit tidak cukup dan tepat serta Evaluasi Peristiwa Kemudian tidak memadai') {
                      setAlasan('');
                    }
                  }}
                >
                  <option value="">- Pilih Simpulan -</option>
                  <option value="Bukti audit cukup dan tepat serta evaluasi peristiwa kemudian memadai.">Bukti audit cukup dan tepat serta evaluasi peristiwa kemudian memadai.</option>
                  <option value="Bukti audit tidak cukup dan tepat serta Evaluasi Peristiwa Kemudian tidak memadai">Bukti audit tidak cukup dan tepat serta Evaluasi Peristiwa Kemudian tidak memadai</option>
                </select>
                
                {simpulan === 'Bukti audit tidak cukup dan tepat serta Evaluasi Peristiwa Kemudian tidak memadai' && (
                  <div className="w-full max-w-xl bg-yellow-50 border border-yellow-300 p-2 shadow-inner rounded-sm">
                    <label className="block text-red-600 font-bold mb-1 text-[10px] uppercase">Jelaskan ketidakcukupan/ketidakmemadaian bukti audit</label>
                    <textarea 
                      className="w-full bg-white border border-yellow-300 outline-none p-2 resize-none min-h-[50px] text-xs"
                      value={alasan}
                      onChange={(e) => setAlasan(e.target.value)}
                      placeholder="Masukkan penjelasan detail..."
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-32 border border-gray-400 mt-4 text-center bg-white">
              <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
              <div className={`font-bold py-1.5 text-[10px] ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
                {status}
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

        {/* Tables Container - Max Width w-max min-w-full */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-cyan-100">
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-8">No</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-96">Kondisi Subsequent</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-24">Ya / Tidak</th>
                <th colSpan={3} className="px-2 py-1 border border-gray-400 font-bold text-center text-cyan-900">Dampak terhadap akun LK</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-24">PAJE</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-64">Frasa pengungkapan</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-24">REFERENSI</th>
              </tr>
              <tr className="bg-cyan-100">
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-cyan-900 w-32">DEBET</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-cyan-900 w-32">KREDIT</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-cyan-900 w-24">Pengungkapan</th>
              </tr>
            </thead>
            <tbody>
              {/* Grup 1: Penyesuai */}
              <tr>
                <td colSpan={9} className="border border-gray-400 bg-blue-900 text-white font-bold py-1.5 px-2 text-[10px] tracking-widest uppercase">
                  1. Peristiwa penyesuai setelah periode pelaporan yang mensyaratkan entitas untuk melakukan penyesuaian jumlah diakui dalam laporan keuangan
                </td>
              </tr>
              {renderTableRows(penyesuai, true)}

              {/* Grup 2: Non-Penyesuai */}
              <tr>
                <td colSpan={9} className="border border-gray-400 bg-blue-900 text-white font-bold py-1.5 px-2 text-[10px] tracking-widest uppercase">
                  2. Peristiwa non-penyesuai setelah periode pelaporan yang umumnya dibuat pengungkapan
                </td>
              </tr>
              {renderTableRows(nonPenyesuai, false)}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b220`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.220
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan B.230
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b290`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut B.290 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B230;
