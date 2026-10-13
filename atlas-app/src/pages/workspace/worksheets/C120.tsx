import React, { useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

const C120 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [simpulan, setSimpulan] = useState('');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const status = simpulan !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="C.120"
      name="Prosedur Analitis Final"
      purpose="Melakukan prosedur analitis pada tahap akhir pelaksanaan audit. Terdiri dari analisis perbandingan data antar periode dan analisis rasio keuangan."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini digunakan untuk melakukan prosedur analitis pada tahap akhir pelaksanaan audit. Analisis terdiri dari analisis perbandingan data antar periode dan analisis rasio keuangan seperti pada prosedur analitis awal.</p>
        </div>

        {/* Dashboard C.120 */}
        <div className="bg-cyan-50 border border-cyan-200 shadow-sm p-4 text-gray-800 rounded">
          <h2 className="text-center font-bold text-lg text-gray-800 tracking-wider uppercase mb-6 border-b border-gray-300 pb-2">FINAL ANALITICAL PROCEDURE</h2>
          
          <div className="grid grid-cols-[200px_auto] gap-x-2 gap-y-2 text-xs font-bold items-center">
            <div className="text-red-700">Nama Klien *</div>
            <div className="bg-white border border-gray-300 px-2 py-1">{engagement.clientName}</div>
            
            <div className="text-red-700">Jenis usaha *</div>
            <div className="bg-white border border-gray-300 px-2 py-1">Perdagangan Besar</div>
            
            <div className="text-red-700">Periode Interim Berjalan *</div>
            <div className="bg-white border border-gray-300 px-2 py-1">-</div>
            
            <div className="text-red-700">Periode Berjalan *</div>
            <div className="bg-white border border-gray-300 px-2 py-1">31/12/{engagement.period}</div>
            
            <div className="text-red-700">Periode Perbandingan *</div>
            <div className="bg-white border border-gray-300 px-2 py-1">31/12/{parseInt(engagement.period) - 1}</div>
            
            <div className="text-red-700">SAK yang digunakan *</div>
            <div className="bg-white border border-gray-300 px-2 py-1">SAK ETAP</div>
            
            <div className="text-red-700 mt-4">Analisis LK Tahap Akhir *</div>
            <div className="mt-4 grid grid-cols-[300px_100px] gap-2 items-center">
               <div className="font-normal">1. Analisis perbandingan data antar periode</div>
               <Link to={`/workspace/${engagement.id}/worksheet/c1201`} className="text-center font-bold text-teal-600 bg-teal-50 border border-teal-300 px-2 py-0.5 hover:bg-teal-100 transition-colors">C.120.1</Link>
               
               <div className="font-normal">2. Analisis rasio keuangan</div>
               <Link to={`/workspace/${engagement.id}/worksheet/c1202`} className="text-center font-bold text-teal-600 bg-teal-50 border border-teal-300 px-2 py-0.5 hover:bg-teal-100 transition-colors">C.120.2</Link>
            </div>
          </div>
          <div className="text-[10px] text-gray-500 italic mt-1">* otomatis</div>

          <div className="mt-8 border border-gray-300 bg-white p-3">
             <div className="font-bold text-red-600 italic text-[11px] mb-2">Kesimpulan dan status KKP</div>
             <textarea 
               className="w-full bg-yellow-100 border border-yellow-400 outline-none p-3 resize-none min-h-[100px] font-medium text-gray-800"
               placeholder="Isilah kesimpulan berdasarkan hasil analisa C.120.1 dan C.120.2..."
               value={simpulan}
               onChange={(e) => setSimpulan(e.target.value)}
             ></textarea>
             <div className="text-[10px] text-red-500 italic mt-1">(Isilah kesimpulan berdasarkan hasil analisa C120.1 dan C120.2)</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c110`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.110
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.120
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

export default C120;
