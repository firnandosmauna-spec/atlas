import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';

type PihakBerelasiItem = {
  id: string;
  identitas: string;
  sifatHubungan: string;
  melakukanTransaksi: string;
};

type ProsedurItem = {
  id: string;
  no: string;
  isParent: boolean;
  prosedur: string;
  pelaksanaan: string;
  referensi: string;
};

const B220 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Data dari A.230.3 (Read-only)
  const pihakBerelasiAwal: PihakBerelasiItem[] = [];

  // Data tambahan dari hasil prosedur B.220 (Editable)
  const [pihakBerelasiTambahan, setPihakBerelasiTambahan] = useState<PihakBerelasiItem[]>([]);

  const [prosedur, setProsedur] = useState<ProsedurItem[]>([
    { id: '1', no: '1', isParent: true, prosedur: 'Mengidentifikasi penilaian risiko salah saji material yang berkaitan dengan hubungan dan transaksi pihak berelasi dengan melakukan:', pelaksanaan: '', referensi: '' },
    { id: '1a', no: 'a.', isParent: false, prosedur: 'Konfirmasi atau diskusi tentang sifat transaksi dengan pihak perantara yang sesuai (seperti bank, konsultan hukum, penjamin).', pelaksanaan: '', referensi: '' },
    { id: '1b', no: 'b.', isParent: false, prosedur: 'Analisis catatan akuntansi untuk transaksi dengan pihak berelasi yang baru teridentifikasi.', pelaksanaan: '', referensi: '' },
    { id: '1c', no: 'c.', isParent: false, prosedur: 'Mengonfirmasikan tujuan, hal spesifik, dan kondisi atau jumlah transfer dengan pihak berelasi.', pelaksanaan: '', referensi: '' },
    { id: '1d', no: 'd.', isParent: false, prosedur: 'Mengevaluasi apakah transaksi pihak berelasi dicatat dan diungkapkan secara tepat.', pelaksanaan: '', referensi: '' },
    { id: '1e', no: 'e.', isParent: false, prosedur: 'Memeriksa kontrak dengan pihak berelasi yang signifikan.', pelaksanaan: '', referensi: '' },
    { id: '2', no: '2', isParent: true, prosedur: 'Mengidentifikasi transaksi pihak berelasi yang belum ditemukan, belum diungkapkan, atau signifikan.', pelaksanaan: '', referensi: '' },
    { id: '2a', no: 'a.', isParent: false, prosedur: 'Mengomunikasikan informasi yang relevan kepada anggota tim perikatan lainnya.', pelaksanaan: '', referensi: '' },
    { id: '2b', no: 'b.', isParent: true, prosedur: 'Ketentuan kerangka pelaporan keuangan yang berlaku yang digunakan pihak berelasi:', pelaksanaan: '', referensi: '' },
    { id: '2b_i', no: '(i)', isParent: false, prosedur: 'Meminta manajemen untuk mengidentifikasi semua transaksi dengan pihak berelasi yang baru diketahui untuk evaluasi lebih lanjut.', pelaksanaan: '', referensi: '' },
    { id: '2b_ii', no: '(ii)', isParent: false, prosedur: 'Meminta keterangan mengapa entitas yang mengontrol hubungan dan transaksi pihak berelasi gagal untuk menemukan dan mengungkapkan.', pelaksanaan: '', referensi: '' },
  ]);

  const [simpulan, setSimpulan] = useState('');
  const [alasan, setAlasan] = useState('');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUpdateTambahan = (id: string, field: keyof PihakBerelasiItem, value: string) => {
    setPihakBerelasiTambahan(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddTambahan = () => {
    setPihakBerelasiTambahan([...pihakBerelasiTambahan, { id: Date.now().toString(), identitas: '', sifatHubungan: '', melakukanTransaksi: '' }]);
  };

  const handleDeleteTambahan = (id: string) => {
    setPihakBerelasiTambahan(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateProsedur = (id: string, field: keyof ProsedurItem, value: string) => {
    setProsedur(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Check if all non-parent procedures have a "pelaksanaan" value and a simpulan is selected
  const isAllProceduresFilled = prosedur.filter(p => !p.isParent).every(p => p.pelaksanaan !== '');
  const isSimpulanFilled = simpulan !== '';
  const status = (isAllProceduresFilled && isSimpulanFilled) ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="B.220"
      name="Transaksi dengan Pihak Berelasi"
      purpose="Identifikasi, pemahaman, dan pengujian atas transaksi dengan pihak-pihak berelasi."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Pada kertas kerja ini auditor melakukan identifikasi dan pemahaman atas pihak-pihak yang dikategorikan sebagai pihak berelasi serta sifat transaksinya. Auditor diharuskan untuk melakukan prosedur pengujian tertentu jika nilainya material dan/atau signifikan.</p>
        </div>

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: B.220</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Transaksi dengan Pihak Berelasi</div>
            </div>
            
            <div className="mt-6 flex flex-col items-start space-y-2">
              <span className="font-bold text-gray-800 text-[10px]">Simpulan</span>
              <div className="w-full space-y-2">
                <select 
                  className="w-full max-w-xl border border-green-500 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                  value={simpulan}
                  onChange={(e) => {
                    setSimpulan(e.target.value);
                    if (e.target.value !== 'Bukti audit tidak cukup dan tepat serta penilaian transaksi pihak berelasi belum memadai') {
                      setAlasan('');
                    }
                  }}
                >
                  <option value="">- Pilih Simpulan -</option>
                  <option value="Bukti audit cukup dan tepat serta Penilaian transaksi pihak berelasi memadai">Bukti audit cukup dan tepat serta Penilaian transaksi pihak berelasi memadai.</option>
                  <option value="Bukti audit tidak cukup dan tepat serta penilaian transaksi pihak berelasi belum memadai">Bukti audit tidak cukup dan tepat serta penilaian transaksi pihak berelasi belum memadai</option>
                </select>
                
                {simpulan === 'Bukti audit tidak cukup dan tepat serta penilaian transaksi pihak berelasi belum memadai' && (
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

        {/* Tabel Identifikasi Pihak Berelasi (Kiri & Kanan) */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <div className="bg-blue-900 text-white font-bold py-1.5 px-4 text-[10px] tracking-widest border-b border-blue-950 uppercase">
             1. Identifikasi Pihak Berelasi
          </div>
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr>
                <th colSpan={4} className="px-2 py-1.5 border border-gray-400 font-bold text-center bg-gray-100 text-red-600">
                  Informasi dari Pemahaman Lingkungan dan Bisnis Entitas (A.230.3)
                </th>
                <th colSpan={5} className="px-2 py-1.5 border border-gray-400 font-bold text-center bg-yellow-50 text-blue-800">
                  Hasil dari Pelaksanaan Prosedur Identifikasi Pihak Berelasi
                </th>
              </tr>
              <tr className="bg-cyan-100">
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-8">No</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-48">Identitas Pihak Berelasi (termasuk Pendahulunya dan Periode Sebelumnya)</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-32">Sifat Hubungan Pihak Berelasi</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-32">Apakah Entitas Melakukan Transaksi pada Periode tersebut dan Apa Jenis dan Tujuan Transaksinya</th>
                
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-8">No</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-48">Identitas Pihak Berelasi (termasuk Pendahulunya dan Periode Sebelumnya)</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-32">Sifat Hubungan Pihak Berelasi</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-32">Apakah Entitas Melakukan Transaksi pada Periode tersebut dan Apa Jenis dan Tujuan Transaksinya</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-10">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {Math.max(pihakBerelasiAwal.length, pihakBerelasiTambahan.length) === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-gray-500 bg-gray-50">
                    Belum ada data pihak berelasi. Klik tombol <strong>"+ Tambah Temuan Pihak Berelasi"</strong> di bawah untuk menambahkan.
                  </td>
                </tr>
              ) : (
                Array.from({ length: Math.max(pihakBerelasiAwal.length, pihakBerelasiTambahan.length) }).map((_, index) => {
                const awal = pihakBerelasiAwal[index];
                const tambahan = pihakBerelasiTambahan[index];

                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    {/* Kiri (Read-only) */}
                    <td className="border border-gray-400 bg-gray-50 text-center p-1.5 text-gray-600">{awal ? index + 1 : ''}</td>
                    <td className="border border-gray-400 bg-gray-50 p-1.5 text-gray-700">{awal?.identitas || ''}</td>
                    <td className="border border-gray-400 bg-gray-50 p-1.5 text-gray-700">{awal?.sifatHubungan || ''}</td>
                    <td className="border border-gray-400 bg-gray-50 p-1.5 text-center text-gray-700">{awal?.melakukanTransaksi || ''}</td>

                    {/* Kanan (Editable) */}
                    <td className="border border-gray-400 bg-white text-center p-1.5 text-blue-800 font-bold">{tambahan ? (pihakBerelasiAwal.length + index + 1) : ''}</td>
                    <td className="border border-gray-400 bg-white p-0">
                      {tambahan && (
                        <input type="text" className="w-full h-full p-2 outline-none bg-transparent font-medium" value={tambahan.identitas} onChange={e => handleUpdateTambahan(tambahan.id, 'identitas', e.target.value)} />
                      )}
                    </td>
                    <td className="border border-gray-400 bg-white p-0">
                      {tambahan && (
                        <input type="text" className="w-full h-full p-2 outline-none bg-transparent" value={tambahan.sifatHubungan} onChange={e => handleUpdateTambahan(tambahan.id, 'sifatHubungan', e.target.value)} />
                      )}
                    </td>
                    <td className="border border-gray-400 bg-white p-0">
                      {tambahan && (
                        <select className="w-full h-full p-2 outline-none bg-transparent text-center" value={tambahan.melakukanTransaksi} onChange={e => handleUpdateTambahan(tambahan.id, 'melakukanTransaksi', e.target.value)}>
                          <option value=""></option>
                          <option value="Ya">Ya</option>
                          <option value="Tidak">Tidak</option>
                        </select>
                      )}
                    </td>
                    <td className="border border-gray-400 bg-gray-50 text-center p-1">
                      {tambahan && (
                        <button onClick={() => handleDeleteTambahan(tambahan.id)} className="text-red-500 hover:text-red-700 bg-white p-1 rounded shadow-sm border border-red-100"><Trash2 size={12} /></button>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
          <div className="p-2 border-t border-gray-300 bg-gray-50 flex justify-end">
             <button onClick={handleAddTambahan} className="flex items-center text-[10px] bg-blue-700 text-white px-3 py-1.5 rounded shadow hover:bg-blue-800">
               <Plus size={12} className="mr-1" /> Tambah Temuan Pihak Berelasi
             </button>
          </div>
        </div>

        {/* Tabel Prosedur yang dilakukan */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm mt-6">
          <div className="bg-blue-900 text-white font-bold py-1.5 px-4 text-[10px] tracking-widest border-b border-blue-950 uppercase">
             2. Prosedur yang Dilakukan
          </div>
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-cyan-100">
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-12">No.</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-[500px]">Prosedur yang Dilakukan</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-40">Pelaksanaan Prosedur</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-32">REFERENSI</th>
              </tr>
            </thead>
            <tbody>
              {prosedur.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.isParent ? 'bg-gray-100 font-bold' : 'bg-white'}`}>
                  <td className="border border-gray-400 p-2 text-center text-gray-700">{item.no}</td>
                  <td className={`border border-gray-400 p-2 text-gray-800 ${!item.isParent && item.no.includes('.') ? 'pl-6' : ''} ${!item.isParent && item.no.includes('(') ? 'pl-10' : ''}`}>
                    {item.prosedur}
                  </td>
                  <td className={`border border-gray-400 p-0 ${item.isParent ? 'bg-gray-100' : 'bg-green-50'}`}>
                    {!item.isParent && (
                      <select 
                        className="w-full h-full p-2 outline-none bg-transparent font-medium text-center text-gray-700" 
                        value={item.pelaksanaan} 
                        onChange={e => handleUpdateProsedur(item.id, 'pelaksanaan', e.target.value)}
                      >
                        <option value=""></option>
                        <option value="dilaksanakan">dilaksanakan</option>
                        <option value="tidak dilaksanakan">tidak dilaksanakan</option>
                        <option value="tidak berlaku">tidak berlaku</option>
                      </select>
                    )}
                  </td>
                  <td className={`border border-gray-400 p-0 ${item.isParent ? 'bg-gray-100' : 'bg-white'}`}>
                    {!item.isParent && (
                      <input 
                        type="text" 
                        className="w-full h-full p-2 outline-none bg-transparent text-center text-red-600 font-bold" 
                        value={item.referensi} 
                        onChange={e => handleUpdateProsedur(item.id, 'referensi', e.target.value)} 
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
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b210`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.210
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan B.220
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c110`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.110 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B220;
