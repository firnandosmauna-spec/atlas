import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type AkunData = {
  id: string;
  nama: string;
  saldoKini: number;
  analisisVertikalKini: number;
  saldoLalu: number;
  analisisVertikalLalu: number;
  rataIndustri: number;
  keterangan: string;
};

const C1201 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [simpulan, setSimpulan] = useState('');
  const [penjelasan, setPenjelasan] = useState('');

  const [data, setData] = useState<AkunData[]>([
    { id: '1', nama: 'Kas dan Setara Kas', saldoKini: 500000000, analisisVertikalKini: 0, saldoLalu: 450000000, analisisVertikalLalu: 0, rataIndustri: 0, keterangan: '' },
    { id: '2', nama: 'Piutang Usaha', saldoKini: 1200000000, analisisVertikalKini: 0, saldoLalu: 1100000000, analisisVertikalLalu: 0, rataIndustri: 0, keterangan: '' },
    { id: '3', nama: 'Persediaan', saldoKini: 800000000, analisisVertikalKini: 0, saldoLalu: 850000000, analisisVertikalLalu: 0, rataIndustri: 0, keterangan: '' },
    { id: '4', nama: 'Aset Tetap', saldoKini: 2500000000, analisisVertikalKini: 0, saldoLalu: 2600000000, analisisVertikalLalu: 0, rataIndustri: 0, keterangan: '' },
  ]);

  const handleUpdate = (id: string, field: keyof AkunData, value: string) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'keterangan' || field === 'nama') {
          return { ...item, [field]: value };
        }
        return { ...item, [field]: parseFloat(value) || 0 };
      }
      return item;
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const formatNumber = (num: number) => {
    if (num === 0) return '-';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const status = simpulan !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="C.120.1"
      name="Analisis Perbandingan Data Antar Periode"
      purpose="Melakukan analisis perbandingan vertikal dan horisontal atas data antar periode serta rata-rata industri."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white border border-gray-300 p-3 rounded shadow-sm">
             <div className="flex gap-4 items-start">
               <div className="flex flex-col space-y-1 w-64">
                 <span className="font-bold text-gray-800 text-[10px]">Simpulan</span>
                 <select 
                   className="w-full border border-green-500 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                   value={simpulan}
                   onChange={(e) => {
                     setSimpulan(e.target.value);
                     if (e.target.value !== 'Prosedur analisis final tidak memadai') {
                       setPenjelasan('');
                     }
                   }}
                 >
                   <option value="">- Pilih -</option>
                   <option value="Prosedur analisis final memadai">Prosedur analisis final memadai</option>
                   <option value="Prosedur analisis final tidak memadai">Prosedur analisis final tidak memadai</option>
                 </select>
               </div>
               
               <div className="w-32 border border-gray-400 text-center bg-white self-end mb-0.5">
                 <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
                 <div className={`font-bold py-1.5 text-[10px] ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
                   {status}
                 </div>
               </div>
             </div>

             {simpulan === 'Prosedur analisis final tidak memadai' && (
               <div className="mt-3 bg-yellow-50 border border-yellow-300 p-2 shadow-inner rounded-sm">
                 <label className="block text-red-600 font-bold mb-1 text-[10px] uppercase">Jelaskan!</label>
                 <textarea 
                   className="w-full bg-white border border-yellow-300 outline-none p-2 resize-none min-h-[50px] text-xs"
                   value={penjelasan}
                   onChange={(e) => setPenjelasan(e.target.value)}
                   placeholder="Jelaskan mengapa prosedur analisis tidak memadai..."
                 ></textarea>
               </div>
             )}
          </div>
        </div>

        <div className="flex gap-16 mt-4">
           <div className="text-[10px]">
              <div className="text-red-600">Data yang digunakan untuk perhitungan analisis vertikal</div>
              <div className="grid grid-cols-[100px_100px] gap-0 border border-gray-400 mt-1">
                 <div className="p-1 font-bold border-r border-gray-400">AKUN</div>
                 <div className="p-1 font-bold text-red-600 text-center">31 Januari 1900</div>
                 <div className="p-1 border-t border-gray-400 border-r text-red-600 font-bold">TOTAL ASET</div>
                 <div className="p-1 border-t border-gray-400 text-right">-</div>
                 <div className="p-1 border-t border-gray-400 border-r text-red-600 font-bold">PENDAPATAN</div>
                 <div className="p-1 border-t border-gray-400 text-right">-</div>
              </div>
           </div>
           
           <div className="text-[10px] flex items-end">
              <div className="grid grid-cols-[100px] gap-0 border border-gray-400 mt-1">
                 <div className="p-1 font-bold text-red-600 text-center">31 Januari 1900</div>
                 <div className="p-1 border-t border-gray-400 text-right">-</div>
                 <div className="p-1 border-t border-gray-400 text-right">-</div>
              </div>
           </div>
        </div>

        {/* Main Table */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-48 align-middle bg-white">Nama akun</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600 w-32 bg-white">Saldo Akhir Tahun Kini</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-24 align-middle bg-white">Analisis Vertikal</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600 w-32 bg-white">Saldo Periode Lalu</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-24 align-middle bg-white">Analisis Vertikal</th>
                <th colSpan={2} className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600 bg-white">Perubahan akhir periode (a - b)</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-24 align-middle bg-white">Rata2 Industri</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-[400px] align-middle bg-white">Keterangan mengenai perubahan antar periode dengan rata-rata industri untuk periode</th>
              </tr>
              <tr>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center bg-gray-100">31 Desember {engagement.period} (a)</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center bg-gray-100">31 Desember {parseInt(engagement.period) - 1} (b)</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center bg-gray-100 w-32">dalam Nilai</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center bg-gray-100 w-16">%</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const diffNilai = item.saldoKini - item.saldoLalu;
                const diffPersen = item.saldoLalu !== 0 ? (diffNilai / item.saldoLalu) * 100 : 0;
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-gray-400 bg-white px-2 py-1">{item.nama}</td>
                    <td className="border border-gray-400 bg-white px-2 py-1 text-right">{formatNumber(item.saldoKini)}</td>
                    <td className="border border-gray-400 bg-orange-100 p-0">
                      <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={item.analisisVertikalKini || ''} onChange={e => handleUpdate(item.id, 'analisisVertikalKini', e.target.value)} />
                    </td>
                    <td className="border border-gray-400 bg-white px-2 py-1 text-right">{formatNumber(item.saldoLalu)}</td>
                    <td className="border border-gray-400 bg-orange-100 p-0">
                      <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={item.analisisVertikalLalu || ''} onChange={e => handleUpdate(item.id, 'analisisVertikalLalu', e.target.value)} />
                    </td>
                    <td className="border border-gray-400 bg-gray-50 px-2 py-1 text-right">{formatNumber(diffNilai)}</td>
                    <td className="border border-gray-400 bg-gray-50 px-2 py-1 text-right">{diffPersen.toFixed(2)}%</td>
                    <td className="border border-gray-400 bg-orange-100 p-0">
                      <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={item.rataIndustri || ''} onChange={e => handleUpdate(item.id, 'rataIndustri', e.target.value)} />
                    </td>
                    <td className="border border-gray-400 bg-orange-100 p-0">
                      <textarea 
                        className="w-full h-full min-h-[30px] p-1 outline-none bg-transparent resize-none leading-tight" 
                        value={item.keterangan} 
                        onChange={e => handleUpdate(item.id, 'keterangan', e.target.value)} 
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c120`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.120 Dashboard
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.120.1
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c1202`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.120.2 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C1201;
