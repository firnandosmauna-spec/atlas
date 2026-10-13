import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft } from 'lucide-react';

const A2502 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [simpulan, setSimpulan] = useState('');

  // Dummy uraian siklus from A.230.3
  const [rows, setRows] = useState([
    {
      id: '1',
      uraian: 'Penerimaan order pelanggan',
      risiko: '',
      wcgw: '',
      pelaksanaan: '',
      dokumentasi: '',
      akun: '',
      asersi: { C: false, E: false, A: false, V: false, P: false },
      mengandalkan: '',
      toc: '',
      result: ''
    },
    {
      id: '2',
      uraian: 'Pengecekan kredit dan persetujuan',
      risiko: '',
      wcgw: '',
      pelaksanaan: '',
      dokumentasi: '',
      akun: '',
      asersi: { C: false, E: false, A: false, V: false, P: false },
      mengandalkan: '',
      toc: '',
      result: ''
    }
  ]);

  const aktivitasPengendalianOpts = [
    'Otorisasi',
    'Penelaahan kinerja',
    'Pengelolaan informasi',
    'Pengendalian fisik',
    'Pemisahan tugas'
  ];

  const updateRow = (id: string, field: string, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const updateAsersi = (id: string, asersiKey: string, value: boolean) => {
    setRows(rows.map(r => r.id === id ? { ...r, asersi: { ...r.asersi, [asersiKey]: value } } : r));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="A.250.2"
      name="Uraian Siklus Penjualan, Piutang Usaha, dan Penerimaan"
      purpose="Identifikasi pengendalian internal, risiko, WCGW, asersi, dan pengujian pengendalian atas suatu siklus."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Top Header Panel (matching Gambar 37 top right) */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama KAP</div><div className="text-gray-900">: -</div>
              <div>Nama AP</div><div className="text-gray-900">: -</div>
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Alamat Klien</div><div className="text-gray-900">: -</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: A.250.2</div>
              <div>Nama KKP</div><div className="text-gray-900">: Uraian Siklus Penjualan, Piutang Usaha, dan Penerimaan</div>
            </div>
          </div>
          
          <div className="w-full md:w-72 bg-white border border-gray-300 p-2 rounded text-[10px]">
             <div className="flex justify-between items-center mb-1">
               <span>Disiapkan oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-24 px-1 py-0.5" defaultValue="Auditor A" />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal mulai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-24 px-1 py-0.5" />
             </div>
             <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
               <span>Tanggal selesai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-24 px-1 py-0.5" />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Direview oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-24 px-1 py-0.5" defaultValue="Manager B" />
             </div>
          </div>
        </div>

        {/* ACCOUNT LEVEL TABLE */}
        <div className="bg-white border border-green-800 overflow-x-auto shadow-sm">
          <div className="bg-green-800 text-white text-center py-1 font-bold text-[11px] uppercase tracking-widest border-b border-green-900">
            ACCOUNT LEVEL
          </div>
          <table className="w-max min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-100/50">
                <th className="px-2 py-2 border border-gray-400 text-blue-900 font-bold text-center w-64 align-middle" rowSpan={2}>Uraian Siklus Pengendalian Internal</th>
                <th className="px-2 py-2 border border-gray-400 text-blue-900 font-bold text-center w-48 align-middle" rowSpan={2}>Identifikasi Risiko</th>
                <th className="px-2 py-2 border border-gray-400 text-blue-900 font-bold text-center w-48 align-middle" rowSpan={2}>What Can Go Wrong (WCGW)</th>
                <th className="px-2 py-2 border border-gray-400 text-blue-900 font-bold text-center w-40 align-middle" rowSpan={2}>PELAKSANAAN AKTIVITAS PENGENDALIAN</th>
                <th className="px-2 py-2 border border-gray-400 text-blue-900 font-bold text-center w-48 align-middle" rowSpan={2}>DOKUMENTASI AKTIVITAS PENGENDALIAN</th>
                <th className="px-2 py-2 border border-gray-400 text-blue-900 font-bold text-center w-40 align-middle" rowSpan={2}>AKUN TERKAIT</th>
                <th className="px-1 py-1 border border-gray-400 text-blue-900 font-bold text-center" colSpan={5}>ASERSI</th>
                <th className="px-2 py-2 border border-gray-400 text-blue-900 font-bold text-center w-24 align-middle" rowSpan={2}>Akan Mengandalkan?</th>
                <th className="px-2 py-2 border border-gray-400 text-blue-900 font-bold text-center w-24 align-middle" rowSpan={2}>TOC</th>
                <th className="px-2 py-2 border border-gray-400 text-blue-900 font-bold text-center w-24 align-middle" rowSpan={2}>Result</th>
              </tr>
              <tr className="bg-blue-100/30 text-[9px] text-center">
                <th className="px-1 py-1 border border-gray-400 w-8">C</th>
                <th className="px-1 py-1 border border-gray-400 w-8">E</th>
                <th className="px-1 py-1 border border-gray-400 w-8">A</th>
                <th className="px-1 py-1 border border-gray-400 w-8">V</th>
                <th className="px-1 py-1 border border-gray-400 w-8">P/D</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 text-[10px]">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-2 py-1 border border-gray-400 align-top bg-white font-medium text-gray-800">
                    {idx + 1}. {row.uraian}
                  </td>
                  <td className="px-0 py-0 border border-gray-400 align-top bg-yellow-50">
                    <textarea 
                      className="w-full h-full min-h-[40px] bg-transparent outline-none p-1.5 resize-none"
                      value={row.risiko} onChange={(e) => updateRow(row.id, 'risiko', e.target.value)}
                    />
                  </td>
                  <td className="px-0 py-0 border border-gray-400 align-top bg-yellow-50">
                    <textarea 
                      className="w-full h-full min-h-[40px] bg-transparent outline-none p-1.5 resize-none"
                      value={row.wcgw} onChange={(e) => updateRow(row.id, 'wcgw', e.target.value)}
                    />
                  </td>
                  <td className="px-0 py-0 border border-gray-400 align-top bg-green-50">
                    <select 
                      className="w-full h-full min-h-[40px] bg-transparent outline-none p-1.5"
                      value={row.pelaksanaan} onChange={(e) => updateRow(row.id, 'pelaksanaan', e.target.value)}
                    >
                      <option value="">- Pilih Aktivitas -</option>
                      {aktivitasPengendalianOpts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="px-0 py-0 border border-gray-400 align-top bg-green-50">
                    <textarea 
                      className="w-full h-full min-h-[40px] bg-transparent outline-none p-1.5 resize-none"
                      value={row.dokumentasi} onChange={(e) => updateRow(row.id, 'dokumentasi', e.target.value)}
                    />
                  </td>
                  <td className="px-0 py-0 border border-gray-400 align-top bg-green-50">
                    <select 
                      className="w-full h-full min-h-[40px] bg-transparent outline-none p-1.5"
                      value={row.akun} onChange={(e) => updateRow(row.id, 'akun', e.target.value)}
                    >
                      <option value="">- Pilih Akun -</option>
                      {engagement.trialBalance?.map(tb => <option key={tb.name} value={tb.name}>{tb.name}</option>) || (
                        <>
                          <option value="Piutang Usaha">Piutang Usaha</option>
                          <option value="Pendapatan Usaha">Pendapatan Usaha</option>
                          <option value="Kas dan Setara Kas">Kas dan Setara Kas</option>
                        </>
                      )}
                    </select>
                  </td>
                  
                  {/* Asersi */}
                  <td className="px-1 py-1 border border-gray-400 align-middle text-center bg-white cursor-pointer hover:bg-gray-100" onClick={() => updateAsersi(row.id, 'C', !row.asersi.C)}>
                    {row.asersi.C && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                  </td>
                  <td className="px-1 py-1 border border-gray-400 align-middle text-center bg-white cursor-pointer hover:bg-gray-100" onClick={() => updateAsersi(row.id, 'E', !row.asersi.E)}>
                    {row.asersi.E && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                  </td>
                  <td className="px-1 py-1 border border-gray-400 align-middle text-center bg-white cursor-pointer hover:bg-gray-100" onClick={() => updateAsersi(row.id, 'A', !row.asersi.A)}>
                    {row.asersi.A && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                  </td>
                  <td className="px-1 py-1 border border-gray-400 align-middle text-center bg-white cursor-pointer hover:bg-gray-100" onClick={() => updateAsersi(row.id, 'V', !row.asersi.V)}>
                    {row.asersi.V && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                  </td>
                  <td className="px-1 py-1 border border-gray-400 align-middle text-center bg-white cursor-pointer hover:bg-gray-100" onClick={() => updateAsersi(row.id, 'P', !row.asersi.P)}>
                    {row.asersi.P && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                  </td>

                  <td className="px-0 py-0 border border-gray-400 align-top bg-white">
                    <select 
                      className="w-full h-full min-h-[40px] bg-transparent outline-none p-1 font-bold text-center"
                      value={row.mengandalkan} onChange={(e) => updateRow(row.id, 'mengandalkan', e.target.value)}
                    >
                      <option value="">-</option>
                      <option value="Ya">Ya</option>
                      <option value="Tidak">Tidak</option>
                    </select>
                  </td>
                  <td className="px-0 py-0 border border-gray-400 align-top bg-white">
                    <select 
                      className="w-full h-full min-h-[40px] bg-transparent outline-none p-1 font-bold text-center"
                      value={row.toc} 
                      onChange={(e) => {
                        updateRow(row.id, 'toc', e.target.value);
                        updateRow(row.id, 'result', e.target.value === 'Efektif' ? 'L' : e.target.value === 'Tidak Efektif' ? 'H' : '');
                      }}
                      disabled={row.mengandalkan !== 'Ya'}
                    >
                      <option value="">-</option>
                      <option value="Efektif">Efektif</option>
                      <option value="Tidak Efektif">Tidak Efektif</option>
                    </select>
                  </td>
                  <td className="px-0 py-0 border border-gray-400 align-middle bg-gray-50">
                    <div className={`w-full text-center font-bold ${row.result === 'L' ? 'text-green-600' : row.result === 'H' ? 'text-red-600' : 'text-gray-400'}`}>
                      {row.result || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Simpulan */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
          <span className="font-bold w-24">Simpulan</span>
          <input 
            type="text"
            className="flex-1 bg-green-100 border border-green-300 outline-none p-2 font-medium"
            value={simpulan}
            onChange={e => setSimpulan(e.target.value)}
            placeholder="Tuliskan simpulan dari pengujian siklus..."
          />
        </div>

        <div className="w-32 border border-gray-400 mt-2 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button onClick={() => navigate('/workspace/ENG-2025-DEMO/worksheet/a250')} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke A.250
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan A.250.2
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A2502;
