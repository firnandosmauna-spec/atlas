import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';

type JournalEntry = {
  id: string;
  ref: string;
  noAkun: string;
  namaAkun: string;
  keterangan: string;
  dibukukanD: number;
  dibukukanK: number;
  tdkDibukukanD: number;
  tdkDibukukanK: number;
  kelompok: string;
  kelemahanPI: string;
  kecurangan: string;
};

const B130 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Resume State
  const [simpulanPAJE, setSimpulanPAJE] = useState('');

  // Journal Entries State
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const handleUpdate = (id: string, field: keyof JournalEntry, value: any) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  const handleAdd = () => {
    const newId = Date.now().toString();
    setEntries([...entries, { id: newId, ref: '', noAkun: '', namaAkun: '', keterangan: '', dibukukanD: 0, dibukukanK: 0, tdkDibukukanD: 0, tdkDibukukanK: 0, kelompok: '', kelemahanPI: '', kecurangan: '' }]);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return '';
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(val);
  };

  const parseCurrencyInput = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  // Calculate Totals for Resume
  const totalDibukukanD = entries.reduce((s, e) => s + e.dibukukanD, 0);
  const totalDibukukanK = entries.reduce((s, e) => s + e.dibukukanK, 0);
  const totalTdkDibukukanD = entries.reduce((s, e) => s + e.tdkDibukukanD, 0);
  const totalTdkDibukukanK = entries.reduce((s, e) => s + e.tdkDibukukanK, 0);

  const performanceMateriality = engagement.materiality?.performanceMateriality || 0;

  return (
    <WorksheetContainer
      code="B.130"
      name="CAJE / PAJE"
      purpose="Menuangkan jurnal-jurnal penyesuaian (CAJE/PAJE) dan mengevaluasi dampaknya."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Info Box */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p className="mb-2">Kertas kerja ini digunakan untuk menuangkan jurnal-jurnal yang diidentifikasi selama proses audit yang dikategorikan menjadi:</p>
          <ol className="list-decimal list-inside ml-2 space-y-1">
            <li><strong>Client Adjustment Journal Entry (CAJE)</strong>: Jurnal penyesuaian yang berasal dari klien.</li>
            <li><strong>Proposed Adjustment Journal Entry (PAJE)</strong>: Jurnal penyesuaian yang diusulkan oleh auditor untuk dibukukan berdasarkan hasil audit.</li>
          </ol>
        </div>

        {/* Bagian 1: Simpulan dan Resume */}
        <div className="bg-white border border-blue-900 shadow-sm mt-4">
          <div className="bg-blue-900 text-white font-bold py-1.5 px-4 text-xs uppercase tracking-widest border-b border-blue-950 flex justify-between items-center">
            <span>Simpulan dan Resume CAJE/PAJE</span>
            <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded shadow text-[10px] flex items-center">
              SIMPAN
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              <div className="flex-1 space-y-2">
                <div className="flex">
                  <div className="w-32 font-bold text-gray-700">PILIHAN JENIS MATERIALITAS</div>
                  <div className="font-bold text-red-600 ml-4 underline">Performance Materiality</div>
                </div>
                <div className="flex items-center">
                  <div className="w-48 font-bold text-red-600 italic text-[10px]">Materialitas Keseluruhan:</div>
                  <input type="text" readOnly className="border border-red-300 bg-red-50 p-1 w-32 text-right font-mono text-red-700" value="75.000.000" />
                </div>
                <div className="flex items-center">
                  <div className="w-48 font-bold text-red-600 italic text-[10px]">Performance Materiality:</div>
                  <input type="text" readOnly className="border border-red-300 bg-red-50 p-1 w-32 text-right font-mono text-red-700" value="50.000.000" />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="font-bold text-green-700">Simpulan PAJE yang Tidak Dibukukan:</label>
                <select 
                  className="w-full mt-1 border border-green-500 bg-green-50 p-2 outline-none font-bold text-gray-800"
                  value={simpulanPAJE}
                  onChange={e => setSimpulanPAJE(e.target.value)}
                >
                  <option value="">- Pilih Simpulan -</option>
                  <option value="Material">Material</option>
                  <option value="Tidak Material">Tidak Material</option>
                </select>
                {simpulanPAJE === 'Material' && (
                  <div className="mt-2 bg-yellow-100 border border-yellow-400 p-2 shadow-inner text-red-700 font-bold text-[10px] italic">
                    Dampak material ini akan menjadi dasar penentuan opini. Harap berikan penjelasan lebih lanjut pada laporan audit.
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-max min-w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-cyan-100">
                    <th className="border border-cyan-400 px-2 py-2 text-center text-cyan-900 w-28">ASET LANCAR</th>
                    <th className="border border-cyan-400 px-2 py-2 text-center text-cyan-900 w-28 text-red-600">ASET TIDAK LANCAR</th>
                    <th className="border border-cyan-400 px-2 py-2 text-center text-cyan-900 w-28">TOTAL ASET</th>
                    <th className="border border-cyan-400 px-2 py-2 text-center text-cyan-900 w-28 text-red-600">KEWAJIBAN JANGKA PENDEK</th>
                    <th className="border border-cyan-400 px-2 py-2 text-center text-cyan-900 w-28 text-red-600">KEWAJIBAN JANGKA PANJANG</th>
                    <th className="border border-cyan-400 px-2 py-2 text-center text-cyan-900 w-28">TOTAL EKUITAS</th>
                    <th className="border border-cyan-400 px-2 py-2 text-center text-cyan-900 w-28">EKUITAS</th>
                    <th className="border border-cyan-400 px-2 py-2 text-center text-cyan-900 w-28 text-red-600">PENDAPATAN</th>
                    <th className="border border-cyan-400 px-2 py-2 text-center text-cyan-900 w-28 text-red-600">BEBAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-cyan-400 px-2 py-2 bg-white text-right font-mono">10.000.000</td>
                    <td className="border border-cyan-400 px-2 py-2 bg-white text-right font-mono">0</td>
                    <td className="border border-cyan-400 px-2 py-2 bg-white text-right font-mono">10.000.000</td>
                    <td className="border border-cyan-400 px-2 py-2 bg-white text-right font-mono">0</td>
                    <td className="border border-cyan-400 px-2 py-2 bg-white text-right font-mono">0</td>
                    <td className="border border-cyan-400 px-2 py-2 bg-white text-right font-mono">0</td>
                    <td className="border border-cyan-400 px-2 py-2 bg-white text-right font-mono">0</td>
                    <td className="border border-cyan-400 px-2 py-2 bg-white text-right font-mono">10.000.000</td>
                    <td className="border border-cyan-400 px-2 py-2 bg-white text-right font-mono">0</td>
                  </tr>
                  {/* Persentase terhadap PM */}
                  <tr className="bg-gray-50 font-bold">
                    <td className="border border-cyan-400 px-2 py-1 text-center">20%</td>
                    <td className="border border-cyan-400 px-2 py-1 text-center">0%</td>
                    <td className="border border-cyan-400 px-2 py-1 text-center">20%</td>
                    <td className="border border-cyan-400 px-2 py-1 text-center">0%</td>
                    <td className="border border-cyan-400 px-2 py-1 text-center">0%</td>
                    <td className="border border-cyan-400 px-2 py-1 text-center">0%</td>
                    <td className="border border-cyan-400 px-2 py-1 text-center">0%</td>
                    <td className="border border-cyan-400 px-2 py-1 text-center">20%</td>
                    <td className="border border-cyan-400 px-2 py-1 text-center">0%</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-[10px] text-gray-500 mt-1 italic">
                *Tabel di atas menampilkan resume dampak salah saji (PAJE) yang tidak dibukukan terhadap pos-pos laporan keuangan.
              </div>
            </div>
          </div>
        </div>

        {/* Bagian 2: Input CAJE/PAJE */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm mt-6">
          <div className="bg-gray-100 border-b border-gray-400 p-2 font-bold text-xs">
            Rincian CAJE/PAJE
          </div>
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-[#fff9e6]">
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-12 align-middle" rowSpan={2}>Ref</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-24 align-middle" rowSpan={2}>NO. AKUN</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-48 align-middle" rowSpan={2}>NAMA AKUN</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-56 align-middle" rowSpan={2}>Keterangan</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600" colSpan={2}>DIBUKUKAN</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600" colSpan={2}>TIDAK DIBUKUKAN / SALAH SAJI</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-32 align-middle" rowSpan={2}>KELOMPOK LAPORAN KEUANGAN</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-24 align-middle" rowSpan={2}>Kelemahan Pengendalian Internal</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-24 align-middle" rowSpan={2}>Adanya Kecurangan</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-10 align-middle" rowSpan={2}>Aksi</th>
              </tr>
              <tr className="bg-[#fff9e6]">
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600 w-28">D</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600 w-28">K</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600 w-28">D</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600 w-28">K</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-xs text-gray-500 bg-gray-50">
                    Belum ada jurnal penyesuaian (CAJE/PAJE). Klik tombol <strong>"+ Tambah Baris Jurnal"</strong> di bawah untuk menambahkan.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="p-0 border border-gray-400 bg-white">
                    <input type="text" className="w-full h-full p-1.5 outline-none text-center bg-transparent" value={entry.ref} onChange={e => handleUpdate(entry.id, 'ref', e.target.value)} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-orange-100/30">
                    <input type="text" className="w-full h-full p-1.5 outline-none text-center bg-transparent" value={entry.noAkun} onChange={e => handleUpdate(entry.id, 'noAkun', e.target.value)} placeholder="Kode" />
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <input type="text" className="w-full h-full p-1.5 outline-none bg-transparent" value={entry.namaAkun} onChange={e => handleUpdate(entry.id, 'namaAkun', e.target.value)} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <textarea className="w-full h-full min-h-[30px] p-1.5 outline-none bg-transparent resize-none leading-tight" value={entry.keterangan} onChange={e => handleUpdate(entry.id, 'keterangan', e.target.value)} />
                  </td>
                  {/* Dibukukan */}
                  <td className="p-0 border border-gray-400 bg-yellow-50">
                    <input type="text" className="w-full h-full p-1.5 outline-none text-right font-mono bg-transparent" value={formatCurrency(entry.dibukukanD)} onChange={e => handleUpdate(entry.id, 'dibukukanD', parseCurrencyInput(e.target.value))} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-yellow-50">
                    <input type="text" className="w-full h-full p-1.5 outline-none text-right font-mono bg-transparent" value={formatCurrency(entry.dibukukanK)} onChange={e => handleUpdate(entry.id, 'dibukukanK', parseCurrencyInput(e.target.value))} />
                  </td>
                  {/* Tidak Dibukukan */}
                  <td className="p-0 border border-gray-400 bg-yellow-100/50">
                    <input type="text" className="w-full h-full p-1.5 outline-none text-right font-mono bg-transparent" value={formatCurrency(entry.tdkDibukukanD)} onChange={e => handleUpdate(entry.id, 'tdkDibukukanD', parseCurrencyInput(e.target.value))} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-yellow-100/50">
                    <input type="text" className="w-full h-full p-1.5 outline-none text-right font-mono bg-transparent" value={formatCurrency(entry.tdkDibukukanK)} onChange={e => handleUpdate(entry.id, 'tdkDibukukanK', parseCurrencyInput(e.target.value))} />
                  </td>
                  <td className="p-0 border border-gray-400 bg-white">
                    <select className="w-full h-full p-1.5 outline-none bg-transparent text-center" value={entry.kelompok} onChange={e => handleUpdate(entry.id, 'kelompok', e.target.value)}>
                      <option value=""></option>
                      <option value="ASET LANCAR">ASET LANCAR</option>
                      <option value="KEWAJIBAN">KEWAJIBAN</option>
                      <option value="PENDAPATAN">PENDAPATAN</option>
                      <option value="BEBAN">BEBAN</option>
                    </select>
                  </td>
                  <td className="p-0 border border-gray-400 bg-green-100/50">
                    <select className="w-full h-full p-1.5 outline-none bg-transparent text-center" value={entry.kelemahanPI} onChange={e => handleUpdate(entry.id, 'kelemahanPI', e.target.value)}>
                      <option value=""></option>
                      <option value="YA">YA</option>
                      <option value="TIDAK">TIDAK</option>
                    </select>
                  </td>
                  <td className="p-0 border border-gray-400 bg-green-100/50">
                    <select className="w-full h-full p-1.5 outline-none bg-transparent text-center" value={entry.kecurangan} onChange={e => handleUpdate(entry.id, 'kecurangan', e.target.value)}>
                      <option value=""></option>
                      <option value="YA">YA</option>
                      <option value="TIDAK">TIDAK</option>
                    </select>
                  </td>
                  <td className="p-1 border border-gray-400 bg-gray-50 text-center">
                    <button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-700 bg-white p-1 rounded shadow-sm border border-red-100"><Trash2 size={12} /></button>
                  </td>
                </tr>
              )))}
              
              {/* Grand Totals */}
              <tr className="bg-gray-200/80 font-bold">
                <td colSpan={4} className="px-2 py-2 border border-gray-400 text-center">JUMLAH</td>
                <td className="px-2 py-2 border border-gray-400 text-right font-mono text-red-700">{formatCurrency(totalDibukukanD)}</td>
                <td className="px-2 py-2 border border-gray-400 text-right font-mono text-red-700">{formatCurrency(totalDibukukanK)}</td>
                <td className="px-2 py-2 border border-gray-400 text-right font-mono text-red-700">{formatCurrency(totalTdkDibukukanD)}</td>
                <td className="px-2 py-2 border border-gray-400 text-right font-mono text-red-700">{formatCurrency(totalTdkDibukukanK)}</td>
                <td colSpan={4} className="border border-gray-400 bg-gray-300/30"></td>
              </tr>
            </tbody>
          </table>
          
          <div className="p-2 border-t border-gray-300 bg-gray-50 flex justify-end">
             <button onClick={handleAdd} className="flex items-center text-[10px] bg-cyan-600 text-white px-3 py-1.5 rounded shadow hover:bg-cyan-700">
               <Plus size={12} className="mr-1" /> Tambah Baris Jurnal
             </button>
          </div>
        </div>

        <div className="w-32 border border-gray-400 mt-6 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b120`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.120
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan B.130
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b140`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut B.140 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B130;
