import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type DataRasio = {
  id: string;
  nama: string;
  unaudited: number;
  audited: number;
  auditedPrev: number;
};

type SimpulanRasio = {
  id: string;
  jenis: string;
  analisisAwal: number;
  analisisFinal: number;
  periodeSebelumnya: number;
  rataIndustri: number;
  analisis: string;
};

const C1202 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [simpulan, setSimpulan] = useState('');
  const [penjelasan, setPenjelasan] = useState('');

  const [dataAkun, setDataAkun] = useState<DataRasio[]>([
    { id: '1', nama: 'ASET', unaudited: 0, audited: 0, auditedPrev: 0 },
    { id: '2', nama: 'EKUITAS_ASET_BERSIH', unaudited: 0, audited: 0, auditedPrev: 0 },
    { id: '3', nama: 'PENDAPATAN', unaudited: 0, audited: 0, auditedPrev: 0 },
    { id: '4', nama: 'HPP', unaudited: 0, audited: 0, auditedPrev: 0 },
    { id: '5', nama: 'LABA SBLM PAJAK', unaudited: 0, audited: 0, auditedPrev: 0 },
    { id: '6', nama: 'EBITDA', unaudited: 0, audited: 0, auditedPrev: 0 },
    { id: '7', nama: 'LIABILITAS', unaudited: 0, audited: 0, auditedPrev: 0 },
    { id: '8', nama: 'EBT', unaudited: 0, audited: 0, auditedPrev: 0 },
  ]);

  const [dataRasio, setDataRasio] = useState<SimpulanRasio[]>([
    { id: 'r1', jenis: 'Rasio Lancar', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r2', jenis: 'Rasio Kas', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r3', jenis: 'Rasio Cepat', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r4', jenis: 'Perputaran Persediaan', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r5', jenis: 'Perputaran Piutang Usaha', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r6', jenis: 'Perputaran Total Aset', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r7', jenis: 'Rasio Utang terhadap Ekuitas', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r8', jenis: 'Rasio Utang terhadap Total Aset', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r9', jenis: 'Laba Kotor terhadap Penjualan', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r10', jenis: 'Laba Bersih terhadap Penjualan', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r11', jenis: 'Return on Assets (ROA)', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
    { id: 'r12', jenis: 'Return on Equity (ROE)', analisisAwal: 0, analisisFinal: 0, periodeSebelumnya: 0, rataIndustri: 0, analisis: '' },
  ]);

  const handleUpdateAkun = (id: string, field: keyof DataRasio, value: string) => {
    setDataAkun(prev => prev.map(item => item.id === id ? { ...item, [field]: parseFloat(value) || 0 } : item));
  };

  const handleUpdateRasio = (id: string, field: keyof SimpulanRasio, value: string) => {
    setDataRasio(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'analisis') {
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
      code="C.120.2"
      name="Analisis Rasio Keuangan"
      purpose="Melakukan analisis atas rasio keuangan auditee baik berupa rasio likuiditas, rasio aktivitas, rasio solvabilitas, dan rasio profitabilitas."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Header */}
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

        {/* Tabel Data Akun */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <div className="font-bold text-red-600 px-2 py-2 border-b border-gray-400 bg-gray-50">Data yang digunakan untuk penghitungan rasio</div>
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center bg-white w-64"></th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center bg-gray-100 w-48">UNAUDITED<br/><span className="text-[9px] font-normal">31 Desember {engagement.period}</span></th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center bg-gray-100 w-48">AUDITED<br/><span className="text-[9px] font-normal">31 Desember {engagement.period}</span></th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center bg-gray-100 w-48">AUDITED PREVIOUS<br/><span className="text-[9px] font-normal">31 Desember {parseInt(engagement.period) - 1}</span></th>
              </tr>
            </thead>
            <tbody>
              {dataAkun.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-gray-400 bg-white px-2 py-1 font-bold text-red-700">{item.nama}</td>
                  <td className="border border-gray-400 bg-white px-2 py-1 text-right text-red-600">{formatNumber(item.unaudited)}</td>
                  <td className="border border-gray-400 bg-white px-2 py-1 text-right text-red-600">{formatNumber(item.audited)}</td>
                  <td className="border border-gray-400 bg-white px-2 py-1 text-right text-red-600">{formatNumber(item.auditedPrev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabel Rasio */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm mt-6">
          <div className="font-bold text-red-600 px-2 py-2 border-b border-gray-400 bg-gray-50">SIMPULAN HASIL PROSEDUR ANALITIS FINAL</div>
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-64 align-middle bg-white">Jenis Rasio</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-green-700 bg-white">Hasil Analisis Awal</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600 bg-white">Hasil Analisis Final</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center text-red-600 bg-white">Periode Sebelumnya</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-24 align-middle bg-white">Rata2<br/>Industri</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-red-600 w-[400px] align-middle bg-white">ANALISIS</th>
              </tr>
              <tr>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center bg-gray-100 text-red-600 w-32">31 Desember {engagement.period}</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center bg-gray-100 text-red-600 w-32">31 Desember {engagement.period}</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center bg-gray-100 text-red-600 w-32">31 Desember {parseInt(engagement.period) - 1}</th>
              </tr>
            </thead>
            <tbody>
              {dataRasio.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-gray-400 bg-white px-2 py-1 text-gray-700">{item.jenis}</td>
                  <td className="border border-gray-400 bg-green-50 px-2 py-1 text-right text-gray-600">{item.analisisAwal}</td>
                  <td className="border border-gray-400 bg-orange-100 p-0">
                    <input type="number" step="0.01" className="w-full text-right p-1 outline-none bg-transparent" value={item.analisisFinal || ''} onChange={e => handleUpdateRasio(item.id, 'analisisFinal', e.target.value)} />
                  </td>
                  <td className="border border-gray-400 bg-gray-50 px-2 py-1 text-right text-gray-600">{item.periodeSebelumnya}</td>
                  <td className="border border-gray-400 bg-orange-100 p-0">
                    <input type="number" step="0.01" className="w-full text-right p-1 outline-none bg-transparent" value={item.rataIndustri || ''} onChange={e => handleUpdateRasio(item.id, 'rataIndustri', e.target.value)} />
                  </td>
                  <td className="border border-gray-400 bg-orange-100 p-0">
                    <textarea 
                      className="w-full h-full min-h-[35px] p-1 outline-none bg-transparent resize-none leading-tight" 
                      value={item.analisis} 
                      onChange={e => handleUpdateRasio(item.id, 'analisis', e.target.value)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c1201`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.120.1
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.120.2
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c200`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.200 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C1202;
