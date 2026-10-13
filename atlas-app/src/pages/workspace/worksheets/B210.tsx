import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, Plus, Trash2 } from 'lucide-react';

type EstimasiItem = {
  id: string;
  akun: string;
  tenagaAhli: string;
  metode: string;
  asumsi: string;
  pengendalian: string;
  levelNilaiWajar: string;
  referensi: string;
  catatan: string;
};

const B210 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [items, setItems] = useState<EstimasiItem[]>([
    { id: '1', akun: 'Aset Tetap Berwujud', tenagaAhli: 'KJPP XYZ', metode: 'Revaluasi', asumsi: 'Nilai Pasar', pengendalian: 'Review Manajemen', levelNilaiWajar: 'Level 2', referensi: 'A.100', catatan: 'Memadai' },
    { id: '2', akun: 'Imbalan Pascakerja', tenagaAhli: 'Aktuaris ABC', metode: 'Projected Unit Credit', asumsi: 'Tingkat diskonto 7%', pengendalian: 'Otorisasi Direktur', levelNilaiWajar: 'Level 3', referensi: 'B.150', catatan: 'Memadai' },
    { id: '3', akun: 'Penyusutan Aset', tenagaAhli: '-', metode: 'Garis Lurus', asumsi: 'Masa manfaat 5 tahun', pengendalian: 'Review Otomatis Sistem', levelNilaiWajar: '-', referensi: '-', catatan: 'Sesuai kebijakan akuntansi' },
    { id: '4', akun: 'Cadangan penurunan nilai piutang', tenagaAhli: '-', metode: 'ECL', asumsi: 'Historical loss rate', pengendalian: 'Persetujuan CFO', levelNilaiWajar: '-', referensi: '-', catatan: 'Sesuai PSAK 71' },
    { id: '5', akun: 'Impairment nilai goodwill / aset', tenagaAhli: 'Appraisal Independen', metode: 'DCF', asumsi: 'Growth rate 5%', pengendalian: 'Review Board', levelNilaiWajar: 'Level 3', referensi: '-', catatan: 'Asumsi agresif, perlu pendalaman' },
    { id: '6', akun: 'Penurunan nilai Persediaan', tenagaAhli: '-', metode: 'NRV', asumsi: 'Harga jual terakhir', pengendalian: 'Stock opname tahunan', levelNilaiWajar: '-', referensi: '-', catatan: 'Memadai' },
  ]);

  const [simpulan, setSimpulan] = useState('');
  const [alasan, setAlasan] = useState('');

  const handleUpdate = (id: string, field: keyof EstimasiItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAdd = () => {
    setItems([...items, { id: Date.now().toString(), akun: '', tenagaAhli: '', metode: '', asumsi: '', pengendalian: '', levelNilaiWajar: '', referensi: '', catatan: '' }]);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const status = simpulan !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="B.210"
      name="Estimasi Akuntansi"
      purpose="Identifikasi dan pemahaman atas estimasi akuntansi yang digunakan oleh manajemen."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Info Box */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Pada kertas kerja ini auditor harus melakukan identifikasi dan pemahaman atas estimasi akuntansi yang digunakan oleh manajemen dalam penyusunan laporan keuangan berdasarkan ketentuan dalam SA 540 <i>Audit atas Estimasi Akuntansi, termasuk Estimasi Akuntansi Nilai Wajar, dan Pengungkapan yang Bersangkutan</i>.</p>
        </div>

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Alamat Klien</div><div className="text-gray-900">: -</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: B.210</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Estimasi Akuntansi</div>
            </div>
            
            <div className="mt-6 flex flex-col items-start space-y-2">
              <span className="font-bold text-gray-800 text-[10px]">Simpulan</span>
              <div className="w-full space-y-2">
                <select 
                  className="w-full max-w-md border border-green-500 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                  value={simpulan}
                  onChange={(e) => {
                    setSimpulan(e.target.value);
                    if (e.target.value !== 'Penggunaan Estimasi Akuntansi belum sepenuhnya memadai') {
                      setAlasan('');
                    }
                  }}
                >
                  <option value="">- Pilih Simpulan -</option>
                  <option value="Penggunaan Estimasi Akuntansi telah memadai">Penggunaan Estimasi Akuntansi telah memadai</option>
                  <option value="Penggunaan Estimasi Akuntansi belum sepenuhnya memadai">Penggunaan Estimasi Akuntansi belum sepenuhnya memadai</option>
                </select>
                
                {simpulan === 'Penggunaan Estimasi Akuntansi belum sepenuhnya memadai' && (
                  <div className="w-full max-w-xl bg-yellow-50 border border-yellow-300 p-2 shadow-inner rounded-sm">
                    <label className="block text-red-600 font-bold mb-1 text-[10px] uppercase">Jelaskan alasan hal tersebut belum memadai</label>
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

        {/* Tabel Estimasi */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-cyan-100">
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-8">No</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-48">Akun Estimasi Manajemen</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-40">Penggunaan Tenaga Ahli</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-40">Metode yang digunakan</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-40">Dasar Asumsi</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-40">Pengendalian yang relevan</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-32">Level Nilai Wajar</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-24">Referensi KKP</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-64">CATATAN</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-10">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-gray-400 bg-gray-50 text-center font-bold p-0 text-gray-500">
                    <div className="w-full h-full p-1.5 flex items-center justify-center">{index + 1}</div>
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <input type="text" className="w-full h-full p-2 outline-none bg-transparent font-bold text-gray-800" value={item.akun} onChange={e => handleUpdate(item.id, 'akun', e.target.value)} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <textarea className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" value={item.tenagaAhli} onChange={e => handleUpdate(item.id, 'tenagaAhli', e.target.value)} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <textarea className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" value={item.metode} onChange={e => handleUpdate(item.id, 'metode', e.target.value)} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <textarea className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" value={item.asumsi} onChange={e => handleUpdate(item.id, 'asumsi', e.target.value)} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <textarea className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" value={item.pengendalian} onChange={e => handleUpdate(item.id, 'pengendalian', e.target.value)} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <textarea className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight text-center" value={item.levelNilaiWajar} onChange={e => handleUpdate(item.id, 'levelNilaiWajar', e.target.value)} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <input type="text" className="w-full h-full p-2 outline-none bg-transparent text-center text-red-600 font-bold" value={item.referensi} onChange={e => handleUpdate(item.id, 'referensi', e.target.value)} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-yellow-50/30">
                    <textarea className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight text-gray-700 italic" value={item.catatan} onChange={e => handleUpdate(item.id, 'catatan', e.target.value)} />
                  </td>
                  <td className="p-1 border border-gray-400 bg-gray-50 text-center">
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 bg-white p-1 rounded shadow-sm border border-red-100"><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-2 border-t border-gray-300 bg-gray-50 flex justify-end">
             <button onClick={handleAdd} className="flex items-center text-[10px] bg-cyan-600 text-white px-3 py-1.5 rounded shadow hover:bg-cyan-700">
               <Plus size={12} className="mr-1" /> Tambah Baris Estimasi
             </button>
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 pt-4 border-t border-gray-200">
           <p className="text-gray-500 font-bold italic">NOTE:</p>
           <p className="text-gray-500 italic mt-1">Jika terdapat penggunaan tenaga ahli, maka penjelasan lebih lanjut dapat dirujuk ke kertas kerja pengujian B.260 atau B.270.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b140`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.140
          </button>
          
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan B.210
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B210;
