import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';

type PakarUmum = {
  id: string;
  nama: string;
  bidang: string;
  aset: string;
  kontrak: string;
};

type PakarFaktor = {
  id: string;
  no: string;
  faktor: string;
  penjelasan: string;
};

const B270 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [menggunakanPakar, setMenggunakanPakar] = useState('');

  // Tabel Informasi Umum Pakar
  const [pakarUmum, setPakarUmum] = useState<PakarUmum[]>([
    { id: '1', nama: '', bidang: '', aset: '', kontrak: '' }
  ]);

  // Bagian 1
  const [bagian1, setBagian1] = useState<PakarFaktor[]>([
    { id: 'b1_1', no: '1', faktor: 'Bagaimana terdapat pengetahuan atau pengalaman sebelumnya yang dimiliki manajemen terkait hal yang dipertimbangkan untuk menggunakan pakar manajemen?', penjelasan: '' },
    { id: 'b1_2', no: '2', faktor: 'Bagaimana pakar manajemen memiliki kompetensi dan kapabilitas yang relevan?', penjelasan: '' },
    { id: 'b1_3', no: '3', faktor: 'Bagaimana pakar manajemen bertindak objektif berkaitan dengan pekerjaan pakar manajemen?', penjelasan: '' },
    { id: 'b1_4', no: '4', faktor: 'Apakah pakar tersebut menjadi subjek kebijakan dan prosedur pengendalian mutu?', penjelasan: '' },
  ]);

  // Bagian 2
  const [bagian2, setBagian2] = useState<PakarFaktor[]>([
    { id: 'b2_1', no: '1', faktor: 'Apakah pakar manajemen tersebut memiliki keanggotaan dari anggota profesi tertentu atau persyaratannya diakui oleh suatu badan pengatur independen atau industri tertentu?', penjelasan: '' },
    { id: 'b2_2', no: '2', faktor: 'Apakah manajemen memiliki pengalaman sebelumnya atau pernah berdiskusi dengan pekerjaan pakar?', penjelasan: '' },
    { id: 'b2_3', no: '3', faktor: 'Apakah pakar manajemen memiliki jurnal atau buku atau karya ilmiah yang diterbitkan / referensi ilmiah lainnya?', penjelasan: '' },
    { id: 'b2_4', no: '4', faktor: 'Apakah pakar manajemen dalam melaksanakan pekerjaannya harus mengikuti standar etika atau standar profesional lainnya?', penjelasan: '' },
  ]);

  // Simpulan
  const [simpulan, setSimpulan] = useState('');
  const [penjelasanSimpulan, setPenjelasanSimpulan] = useState('');

  const handleUpdateUmum = (id: string, field: keyof PakarUmum, value: string) => {
    setPakarUmum(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddUmum = () => {
    const newId = Date.now().toString();
    setPakarUmum([...pakarUmum, { id: newId, nama: '', bidang: '', aset: '', kontrak: '' }]);
  };

  const handleRemoveUmum = (id: string) => {
    if (pakarUmum.length > 1) {
      setPakarUmum(pakarUmum.filter(item => item.id !== id));
    }
  };

  const handleUpdateFaktor = (id: string, field: keyof PakarFaktor, value: string, isBagian1: boolean) => {
    if (isBagian1) {
      setBagian1(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    } else {
      setBagian2(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isSimpulanFilled = simpulan !== '';
  const status = isSimpulanFilled ? 'Completed' : 'Incompleted';

  const renderFaktorRows = (items: PakarFaktor[], isBagian1: boolean) => {
    return items.map((item) => (
      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
        <td className="border border-gray-400 bg-gray-50 text-center font-bold text-gray-600 p-2 align-top">{item.no}</td>
        <td className="border border-gray-400 bg-white p-2 text-gray-800 leading-relaxed align-top">{item.faktor}</td>
        <td className="border border-gray-400 bg-orange-50/50 p-0 align-top">
          <textarea 
            className="w-full h-full min-h-[50px] p-2 outline-none bg-transparent resize-none leading-tight" 
            value={item.penjelasan} 
            onChange={e => handleUpdateFaktor(item.id, 'penjelasan', e.target.value, isBagian1)} 
          />
        </td>
      </tr>
    ));
  };

  return (
    <WorksheetContainer
      code="B.270"
      name="Penggunaan Pakar Manajemen"
      purpose="Mengidentifikasi dan mengevaluasi penggunaan pakar manajemen dalam penyusunan laporan keuangan (SA 500)."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Pada kertas kerja ini auditor melakukan identifikasi atas penggunaan pakar manajemen dalam penyusunan laporan keuangan. Berdasarkan <strong>SA 500</strong>, prosedur yang harus dicakup diantaranya: 1. Penentuan Kebutuhan, 2. Evaluasi Kompetensi, 3. Ruang Lingkup, 4. Evaluasi Kecukupan.</p>
        </div>

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: B.270</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Penggunaan Pakar Manajemen</div>
            </div>
            
            <div className="mt-6 flex flex-col items-start space-y-2">
              <span className="font-bold text-gray-800 text-[10px]">Apakah klien menggunakan pakar manajemen?</span>
              <select 
                className="w-full max-w-xl border border-blue-400 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                value={menggunakanPakar}
                onChange={(e) => {
                  setMenggunakanPakar(e.target.value);
                  if (e.target.value === 'TIDAK') {
                    setSimpulan('TIDAK RELEVAN');
                  } else {
                    setSimpulan('');
                  }
                }}
              >
                <option value="">- Pilih YA/TIDAK -</option>
                <option value="YA">YA</option>
                <option value="TIDAK">TIDAK</option>
              </select>

              <span className="font-bold text-gray-800 text-[10px] mt-2 block">Simpulan</span>
              <div className="w-full space-y-2">
                <select 
                  className="w-full max-w-xl border border-green-500 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                  value={simpulan}
                  onChange={(e) => {
                    setSimpulan(e.target.value);
                    if (e.target.value !== 'TIDAK MEMADAI') {
                      setPenjelasanSimpulan('');
                    }
                  }}
                >
                  <option value="">- Pilih Simpulan -</option>
                  <option value="MEMADAI">MEMADAI</option>
                  <option value="TIDAK MEMADAI">TIDAK MEMADAI</option>
                  <option value="TIDAK RELEVAN">TIDAK RELEVAN</option>
                </select>

                {simpulan === 'TIDAK MEMADAI' && (
                  <div className="w-full max-w-xl bg-yellow-50 border border-yellow-300 p-2 shadow-inner rounded-sm mt-2">
                    <label className="block text-red-600 font-bold mb-1 text-[10px] uppercase">Jelaskan penyebab pekerjaan pakar manajemen tidak memadai dan bagaimana respon auditor atas hal tersebut</label>
                    <textarea 
                      className="w-full bg-white border border-yellow-300 outline-none p-2 resize-none min-h-[50px] text-xs"
                      value={penjelasanSimpulan}
                      onChange={(e) => setPenjelasanSimpulan(e.target.value)}
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

        {/* Conditional Rendering of Tables based on menggunakanPakar */}
        {menggunakanPakar === 'YA' && (
          <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
            {/* Tabel Informasi Umum */}
            <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm mt-6">
              <div className="bg-blue-900 text-white font-bold py-1.5 px-4 text-[10px] tracking-widest border-b border-blue-950 uppercase flex justify-between items-center">
                 <span>Informasi umum Pakar Manajemen</span>
                 <button onClick={handleAddUmum} className="flex items-center text-blue-200 hover:text-white text-[9px] bg-blue-800 px-2 py-0.5 rounded">
                   <Plus size={10} className="mr-1" /> Tambah Pakar
                 </button>
              </div>
              <table className="w-max min-w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-cyan-100">
                    <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-8">No</th>
                    <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-64">Nama Pakar (Individu/Organisasi)</th>
                    <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-48">Bidang Keahlian</th>
                    <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-48">Aset/Pengungkapan</th>
                    <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-64">Siapa yang mengikat kontrak dengan pakar?</th>
                    <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-10">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pakarUmum.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-gray-400 bg-gray-50 text-center font-bold text-gray-600 p-2">{index + 1}</td>
                      <td className="border border-gray-400 bg-orange-50/50 p-0">
                         <input type="text" className="w-full h-full min-h-[30px] p-2 outline-none bg-transparent" value={item.nama} onChange={e => handleUpdateUmum(item.id, 'nama', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 bg-orange-50/50 p-0">
                         <input type="text" className="w-full h-full min-h-[30px] p-2 outline-none bg-transparent" value={item.bidang} onChange={e => handleUpdateUmum(item.id, 'bidang', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 bg-orange-50/50 p-0">
                         <input type="text" className="w-full h-full min-h-[30px] p-2 outline-none bg-transparent" value={item.aset} onChange={e => handleUpdateUmum(item.id, 'aset', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 bg-orange-50/50 p-0">
                         <input type="text" className="w-full h-full min-h-[30px] p-2 outline-none bg-transparent" value={item.kontrak} onChange={e => handleUpdateUmum(item.id, 'kontrak', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 bg-white p-0 text-center">
                        <button onClick={() => handleRemoveUmum(item.id)} className="text-red-500 hover:text-red-700 p-2" disabled={pakarUmum.length === 1}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabel Analisis Bagian 1 & 2 */}
            <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm mt-6">
              <table className="w-max min-w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-cyan-100">
                    <th className="px-2 py-2.5 border border-gray-400 font-bold text-center text-cyan-900 w-10">No</th>
                    <th className="px-2 py-2.5 border border-gray-400 font-bold text-center text-cyan-900 w-[600px]">Faktor/aspek Yang Dipertimbangkan</th>
                    <th className="px-2 py-2.5 border border-gray-400 font-bold text-center text-cyan-900 w-[500px]">Penjelasan/Referensi ke pengujian yang dilakukan</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Bagian 1 */}
                  <tr>
                    <td colSpan={3} className="border border-gray-400 bg-blue-900 text-white font-bold py-1.5 px-2 text-[10px] tracking-widest uppercase">
                      Bagian 1: Penentuan Kebutuhan Pakar Manajemen
                    </td>
                  </tr>
                  {renderFaktorRows(bagian1, true)}

                  {/* Bagian 2 */}
                  <tr>
                    <td colSpan={3} className="border border-gray-400 bg-blue-900 text-white font-bold py-1.5 px-2 text-[10px] tracking-widest uppercase mt-4">
                      Bagian 2: Evaluasi atas kompetensi, kapabilitas dan objektivitas pakar manajemen
                    </td>
                  </tr>
                  {renderFaktorRows(bagian2, false)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b260`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.260
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan B.270
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b280`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut B.280 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B270;
