import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type ProsedurItem = {
  id: string;
  no: string;
  isParent: boolean;
  uraian: string;
  pelaksanaan: string;
  simpulan: string;
};

const B280 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [items, setItems] = useState<ProsedurItem[]>([
    { id: '1', no: '1', isParent: false, uraian: 'Peroleh pemahaman dan dokumentasikan kebijakan serta prosedur pengungkapan oleh manajemen dalam mengidentifikasi dan mengevaluasi komitmen dan kontinjensi.', pelaksanaan: '', simpulan: '' },
    { id: '2', no: '2', isParent: false, uraian: 'Review laporan keuangan periode sebelumnya terkait kontinjensi atau komitmen untuk menyelesaikannya.', pelaksanaan: '', simpulan: '' },
    { id: '3', no: '3', isParent: false, uraian: 'Diskusikan dengan manajemen kemungkinan adanya komitmen atau kontinjensi yang membutuhkan pengungkapan laporan keuangan. Dokumentasikan ringkasan diskusi.', pelaksanaan: '', simpulan: '' },
    { id: '4', no: '4', isParent: false, uraian: 'Review notulen di meeting terkait kontrak atau bentuk dokumentasi lainnya terkait pelaksanaan komitmen atau kontinjensi.', pelaksanaan: '', simpulan: '' },
    { id: '5', no: '5', isParent: false, uraian: 'Review rincian untuk biaya ahli hukum pada periode yang diaudit dan perhatikan liabilitas kontinjensi.', pelaksanaan: '', simpulan: '' },
    { id: '6', no: '6', isParent: false, uraian: 'Peroleh konfirmasi tertulis dari pengacara perusahaan terkait tagihan yang sedang diproses untuk posisi indikasi sumber liabilitas kontinjensi lain.', pelaksanaan: '', simpulan: '' },
    { id: '7', no: '7', isParent: false, uraian: 'Diskusikan dengan manajemen terkait adanya asuransi untuk melindungi perusahaan dari kemungkinan risiko bisnis terkait operasional perusahaan.', pelaksanaan: '', simpulan: '' },
    { id: '8', no: '8', isParent: true, uraian: 'Periksa dokumen hal-hal berikut ini dalam menilai liabilitas kontinjensi:', pelaksanaan: '', simpulan: '' },
    { id: '8a', no: 'a', isParent: false, uraian: 'Tagihan yang diterbitkan oleh pengacara', pelaksanaan: '', simpulan: '' },
    { id: '8b', no: 'b', isParent: false, uraian: 'Tagihan yang mungkin tidak dikeluarkan oleh pengacara', pelaksanaan: '', simpulan: '' },
    { id: '8c', no: 'c', isParent: false, uraian: 'Assessment pajak', pelaksanaan: '', simpulan: '' },
    { id: '8d', no: 'd', isParent: false, uraian: 'Kontrak pengadaan yang sedang dinegosiasi ulang', pelaksanaan: '', simpulan: '' },
    { id: '8e', no: 'e', isParent: false, uraian: 'Discounted receivable with recourse', pelaksanaan: '', simpulan: '' },
    { id: '8f', no: 'f', isParent: false, uraian: 'Endorsement, garansi, dan indemnities', pelaksanaan: '', simpulan: '' },
    { id: '8g', no: 'g', isParent: false, uraian: 'Pembayaran kembali atas bantuan pemerintah', pelaksanaan: '', simpulan: '' },
    { id: '9', no: '9', isParent: true, uraian: 'Periksa dokumen hal-hal berikut ini terkait komitmen:', pelaksanaan: '', simpulan: '' },
    { id: '9a', no: 'a', isParent: false, uraian: 'Komitmen leasing', pelaksanaan: '', simpulan: '' },
    { id: '9b', no: 'b', isParent: false, uraian: 'Komitmen penjualan atau pembelian pada harga atau kurs tetap', pelaksanaan: '', simpulan: '' },
    { id: '9c', no: 'c', isParent: false, uraian: 'Kewajiban kontraktual untuk membeli aset tetap', pelaksanaan: '', simpulan: '' },
  ]);

  const [lampiran, setLampiran] = useState('');
  const [simpulanAkhir, setSimpulanAkhir] = useState('');
  const [penjelasan, setPenjelasan] = useState('');

  const handleUpdate = (id: string, field: keyof ProsedurItem, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isSimpulanFilled = simpulanAkhir !== '';
  const status = isSimpulanFilled ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="B.280"
      name="Komitmen dan Kontinjensi"
      purpose="Melakukan prosedur untuk menilai ada tidaknya komitmen dan kontinjensi yang perlu diungkapkan dalam laporan keuangan."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Pada kertas kerja ini auditor melakukan prosedur untuk menilai ada tidaknya <strong>komitmen dan kontinjensi</strong> yang perlu diungkapkan dalam laporan keuangan.</p>
        </div>

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: B.280</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Komitmen dan Kontinjensi</div>
            </div>
            
            <div className="mt-6 flex flex-col items-start space-y-2">
              <span className="font-bold text-gray-800 text-[10px]">Simpulan KKP</span>
              <div className="w-full space-y-2">
                <select 
                  className="w-full max-w-xl border border-green-500 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                  value={simpulanAkhir}
                  onChange={(e) => {
                    setSimpulanAkhir(e.target.value);
                    if (e.target.value !== 'Bukti audit tidak cukup dan tepat serta Penilaian komitmen dan kontinjensi tidak memadai') {
                      setPenjelasan('');
                    }
                  }}
                >
                  <option value="">- Pilih Simpulan -</option>
                  <option value="Bukti audit cukup dan tepat serta Penilaian komitmen dan kontinjensi memadai">Bukti audit cukup dan tepat serta Penilaian komitmen dan kontinjensi memadai</option>
                  <option value="Bukti audit tidak cukup dan tepat serta Penilaian komitmen dan kontinjensi tidak memadai">Bukti audit tidak cukup dan tepat serta Penilaian komitmen dan kontinjensi tidak memadai</option>
                </select>

                {simpulanAkhir === 'Bukti audit tidak cukup dan tepat serta Penilaian komitmen dan kontinjensi tidak memadai' && (
                  <div className="w-full max-w-xl bg-yellow-50 border border-yellow-300 p-2 shadow-inner rounded-sm mt-2">
                    <label className="block text-red-600 font-bold mb-1 text-[10px] uppercase">Jelaskan ketidakcukupan bukti audit atau tidak memadainya penilaian komitmen dan kontinjensi tersebut</label>
                    <textarea 
                      className="w-full bg-white border border-yellow-300 outline-none p-2 resize-none min-h-[50px] text-xs"
                      value={penjelasan}
                      onChange={(e) => setPenjelasan(e.target.value)}
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

        {/* Tabel Utama */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm flex flex-col md:flex-row items-stretch">
          <div className="flex-1 overflow-x-auto border-r border-gray-400">
            <table className="w-max min-w-full text-left border-collapse text-[10px] h-full">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-2 py-2 border-b border-gray-400 font-bold text-center w-10">No</th>
                  <th className="px-2 py-2 border-b border-gray-400 font-bold text-center w-[500px]">Uraian</th>
                  <th className="px-2 py-2 border-b border-gray-400 font-bold text-center w-36">Pelaksanaan Prosedur</th>
                  <th className="px-2 py-2 border-b border-gray-400 font-bold text-center w-48">Simpulan</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className={`border-b border-gray-300 bg-white p-2 text-center font-bold ${item.isParent ? 'text-gray-900' : 'text-gray-600 pl-4'}`}>{item.no}</td>
                    <td className={`border-b border-gray-300 bg-white p-2 leading-tight ${item.isParent ? 'font-bold' : 'pl-6'}`}>{item.uraian}</td>
                    <td className="border-b border-l border-gray-300 bg-green-50/50 p-0">
                      {!item.isParent && (
                        <select 
                          className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent font-medium text-center text-gray-700" 
                          value={item.pelaksanaan} 
                          onChange={e => handleUpdate(item.id, 'pelaksanaan', e.target.value)}
                        >
                          <option value=""></option>
                          <option value="Dilaksanakan">Dilaksanakan</option>
                          <option value="Tidak Dilaksanakan">Tidak Dilaksanakan</option>
                          <option value="Tidak Berlaku">Tidak Berlaku</option>
                        </select>
                      )}
                    </td>
                    <td className="border-b border-l border-gray-300 bg-orange-50/50 p-0">
                      {!item.isParent && (
                        <textarea 
                          className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight" 
                          value={item.simpulan} 
                          onChange={e => handleUpdate(item.id, 'simpulan', e.target.value)} 
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="w-full md:w-64 bg-gray-50 flex flex-col p-2">
             <label className="font-bold text-red-600 uppercase text-[10px] mb-2 border-b border-gray-300 pb-1">LAMPIRAN</label>
             <textarea 
               className="w-full flex-1 min-h-[200px] border border-gray-300 bg-white outline-none p-2 resize-none text-[10px]"
               placeholder="Referensi KKP / Lampiran dokumen..."
               value={lampiran}
               onChange={(e) => setLampiran(e.target.value)}
             ></textarea>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
           <p className="text-gray-500 font-bold italic">Catatan:</p>
           <p className="text-gray-500 italic mt-1">Auditor harus mempertimbangkan dalam proses pelaporan apakah terdapat komitmen dan kontinjensi yang harus diusulkan untuk diungkapkan atau menilai kecukupan pengungkapan terkait komitmen dan kontinjensi apakah telah memadai.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b270`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.270
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan B.280
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

export default B280;
