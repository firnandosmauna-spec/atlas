import React, { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, Database, ChevronRight } from 'lucide-react';

const LeadSchedule = ({ indeks = 'A' }: { indeks?: string }) => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [resumeSAP, setResumeSAP] = useState('');
  const [simpulan, setSimpulan] = useState('');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Determine account group based on Indeks
  let group = '';
  if (indeks.toUpperCase() === 'A') group = 'Aset';
  if (indeks.toUpperCase() === 'C') group = 'Kewajiban';
  if (indeks.toUpperCase() === 'E') group = 'Ekuitas';
  if (indeks.toUpperCase() === 'PL1') group = 'Pendapatan';
  if (indeks.toUpperCase() === 'PL2') group = 'Beban';

  // Filter trial balance
  const tb = engagement.trialBalance || [];
  const tbFiltered = tb.filter(t => (t.group || '').toLowerCase() === group.toLowerCase() || ((t as any).subGroup || (t as any).kelompok || '').toLowerCase().includes(group.toLowerCase()));

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Math.abs(val));

  return (
    <WorksheetContainer
      code={`LS-${indeks.toUpperCase()}`}
      name={`Lead Schedule ${indeks.toUpperCase()}`}
      purpose={`Rincian dan pengujian substantif untuk akun dengan indeks ${indeks.toUpperCase()}`}
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Info Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama KAP</div><div className="text-gray-900">: -</div>
              <div>Nama AP</div><div className="text-gray-900">: -</div>
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Alamat Klien</div><div className="text-gray-900">: -</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: {indeks.toUpperCase()}</div>
              <div>Nama KKP</div><div className="text-gray-900">: Lead Schedule - {group || 'Akun'}</div>
            </div>
            
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/bp-${indeks.toLowerCase()}`)}
              className="mt-4 bg-teal-600 text-white font-bold py-1 px-3 rounded shadow hover:bg-teal-700"
            >
              BANK PROSEDUR
            </button>
          </div>

          <div className="w-full md:w-72 bg-white border border-gray-300 p-2 rounded text-[10px]">
             <div className="flex justify-between items-center mb-1">
               <span>Disiapkan oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-24 px-1 py-0.5" defaultValue={engagement.auditorName || ''} />
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
               <input type="text" className="border border-red-300 bg-red-50 w-24 px-1 py-0.5" defaultValue={engagement.managerName || ''} />
             </div>
          </div>
        </div>

        {/* Audit Parameters & Planning */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-2 font-bold text-gray-800">
            <div className="grid grid-cols-[200px_auto] items-center">
              <div>PILIHAN JENIS MATERIALITAS</div>
              <div className="text-red-600 underline cursor-pointer">Performance Materiality</div>
            </div>
            <div className="grid grid-cols-[200px_auto] items-center">
              <div>ASERSI</div>
              <div className="text-blue-600">C/E/A/V/P/D</div>
            </div>
            <div className="grid grid-cols-[200px_auto] items-center">
              <div>ROMM</div>
              <div className="text-green-600">L</div>
            </div>
            <div className="grid grid-cols-[200px_auto] items-center">
              <div>SIGNIFIKANSI AKUN (MS/MTS/TMS)</div>
              <div className="text-green-600">TMS</div>
            </div>
            <div className="grid grid-cols-[200px_auto] items-center">
              <div>MATERIALITAS AKUN (MATERIAL/TIDAK MATERIAL)</div>
              <div className="text-green-600">TM</div>
            </div>
            <div className="grid grid-cols-[200px_auto] items-center">
              <div>RESUME SUBTANTIF ANALITICAL PROCEDURES</div>
              <div>
                <select className="border border-gray-400 bg-green-50 p-1 font-bold text-green-700 outline-none" value={resumeSAP} onChange={e => setResumeSAP(e.target.value)}>
                  <option value="">-</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="NO">NO</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white border border-gray-400">
            <div className="bg-gray-100 border-b border-gray-400 p-1 text-center font-bold text-[10px]">RENCANA SAMPLE (formula sesuai contoh ISA GUIDE VOL 2 hal 231)</div>
            <table className="w-full text-[9px] text-center">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-400">
                  <th className="border-r border-gray-400 py-1">Risk Level of ROMM</th>
                  <th className="border-r border-gray-400 py-1">Assurance of Substantif Analitical Procedures</th>
                  <th className="py-1 text-red-600">Range (Confidence Factor)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td rowSpan={2} className="border border-gray-400 font-bold bg-white">High</td><td className="border border-gray-400">High</td><td className="border border-gray-400 font-bold bg-white">1.0 - 2.1</td></tr>
                <tr><td className="border border-gray-400 bg-gray-50">Moderate</td><td className="border border-gray-400 font-bold bg-white">2.1 - 3</td></tr>
                <tr className="bg-yellow-200/50"><td className="border border-gray-400 font-bold">Moderate</td><td className="border border-gray-400 font-bold">No</td><td className="border border-gray-400 font-bold text-red-600">3</td></tr>
                {/* Simplified for demo */}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sample Calculation */}
        <div className="border border-blue-900 bg-white shadow-sm flex flex-col md:flex-row items-center p-2 text-[10px]">
          <div className="flex-1 grid grid-cols-[180px_auto] gap-y-1 font-bold text-gray-800">
            <div>Performance Materiality</div>
            <div className="bg-gray-100 border border-gray-300 px-2 flex justify-end">-</div>
            <div>Specific item subject to separate eval (If any)</div>
            <div className="bg-yellow-100 border border-yellow-400 px-2 flex justify-end text-red-600">0</div>
            <div>Range (Confidence Factor)</div>
            <div className="bg-yellow-100 border border-yellow-400 px-2 flex justify-end text-red-600">3</div>
            <div>Sample Interval</div>
            <div className="bg-gray-100 border border-gray-300 px-2 flex justify-end">-</div>
            <div>Sample Size</div>
            <div className="bg-gray-100 border border-gray-300 px-2 flex justify-end">-</div>
          </div>
          <div className="px-4 text-red-500 font-black"><ChevronRight size={32} /></div>
          <div className="flex-1 grid grid-cols-[200px_auto] gap-y-1 font-bold">
            <div>Akun yang mempertimbangkan specific materiality:</div>
            <div className="bg-gray-100 border border-gray-300 p-1"></div>
            <div>Specific (Rincian akun):</div>
            <div className="bg-gray-100 border border-gray-300 p-1"></div>
          </div>
        </div>

        {/* Account Details Table */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm mt-4">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-3 border border-gray-300 font-bold text-center w-24 align-middle" rowSpan={2}>NO AKUN</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-center w-64 align-middle" rowSpan={2}>NAMA AKUN</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-center w-32 align-middle" rowSpan={2}>SALDO PER BOOK</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-center w-24 align-middle leading-tight" rowSpan={2}>Supporting Schedule</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-center w-24 align-middle leading-tight" rowSpan={2}>Referensi Jurnal</th>
                <th className="px-2 py-1 border border-gray-300 font-bold text-red-700 text-center" colSpan={2}>JURNAL KOREKSI/REKLASIFIKASI</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-center w-24 align-middle leading-tight" rowSpan={2}>Supporting Schedule</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-center w-32 align-middle" rowSpan={2}>SALDO PER AUDIT</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border border-gray-300 font-bold text-red-700 text-center w-28">DEBET</th>
                <th className="px-2 py-1 border border-gray-300 font-bold text-red-700 text-center w-28">KREDIT</th>
              </tr>
            </thead>
            <tbody>
              {tbFiltered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400 bg-gray-50 italic">
                    Belum ada akun {group ? `kelompok ${group}` : ''} pada Trial Balance. Silakan import atau input akun pada menu Trial Balance.
                  </td>
                </tr>
              ) : (
                tbFiltered.map((item, idx) => {
                  const code = (item as any).code || (item as any).accountCode || `100${idx + 1}`;
                  const name = item.name || (item as any).accountName || '-';
                  const balance = (item as any).finalBalanceDebit || (item as any).finalBalanceCredit || item.endingBalance || 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-1 border border-gray-300 text-center font-mono text-gray-700">{code}</td>
                      <td className="px-2 py-1 border border-gray-300 font-bold text-gray-800">{name}</td>
                      <td className="px-2 py-1 border border-gray-300 text-right font-mono">{formatCurrency(balance)}</td>
                      <td className="px-2 py-1 border border-gray-300 bg-white"></td>
                      <td className="px-2 py-1 border border-gray-300 bg-white"></td>
                      <td className="px-2 py-1 border border-gray-300 text-right font-mono text-gray-600">-</td>
                      <td className="px-2 py-1 border border-gray-300 text-right font-mono text-gray-600">-</td>
                      <td className="px-2 py-1 border border-gray-300 bg-white"></td>
                      <td className="px-2 py-1 border border-gray-300 text-right font-mono font-bold">{formatCurrency(balance)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Simpulan */}
        <div className="bg-white border border-gray-400 p-4 mt-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <span className="font-bold w-24 text-red-600 mt-1">Simpulan</span>
            <div className="flex-1 space-y-2 w-full max-w-xl">
              <select 
                className="w-full bg-green-100 border border-green-400 outline-none p-2 font-bold text-gray-800"
                value={simpulan}
                onChange={e => setSimpulan(e.target.value)}
              >
                <option value="">- Pilih Simpulan -</option>
                <option value="Wajar">Wajar</option>
                <option value="Tidak Wajar">Tidak Wajar</option>
                <option value="Wajar Tanpa Pengecualian">Wajar Tanpa Pengecualian</option>
                <option value="Wajar Dengan Pengecualian">Wajar Dengan Pengecualian</option>
              </select>

              {/* Kotak Kuning Kondisional untuk ketidakwajaran */}
              {simpulan.includes('Tidak') || simpulan.includes('Pengecualian') ? (
                <div className="bg-yellow-100 border border-yellow-400 p-2 mt-2 shadow-inner">
                  <label className="block text-red-600 font-bold text-[10px] mb-1 italic">Penjelasan Ketidakwajaran / Pengecualian:</label>
                  <textarea 
                    className="w-full h-24 bg-white border border-gray-300 outline-none p-2 resize-none text-[11px]"
                    placeholder="Jelaskan alasan akun disimpulkan tidak wajar atau memiliki pengecualian..."
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="w-32 border border-gray-400 mt-4 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b120`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.120
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan Lead Schedule {indeks.toUpperCase()}
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default LeadSchedule;
