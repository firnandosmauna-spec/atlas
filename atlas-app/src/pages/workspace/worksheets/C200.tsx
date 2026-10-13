import React from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

const C200 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();

  // The status is completed if the sub-worksheet C.220 is completed.
  // For now we mock it as incompleted until user visits C.220.
  const status = 'Incompleted';

  return (
    <WorksheetContainer
      code="C.200"
      name="Review Pengungkapan LK"
      purpose="Memastikan bahwa pengungkapan laporan keuangan telah memenuhi persyaratan dalam SAK yang berlaku/relevan."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini digunakan untuk membantu auditor dalam memastikan bahwa pengungkapan laporan keuangan telah memenuhi persyaratan dalam SAK yang berlaku/relevan.</p>
        </div>

        {/* Dashboard C.200 */}
        <div className="bg-cyan-50 border border-cyan-200 shadow-sm p-4 text-gray-800 rounded relative">
          <h2 className="text-center font-bold text-lg text-gray-800 uppercase mb-6 border-b border-gray-300 pb-2">REVIEW PENGUNGKAPAN LAPORAN KEUANGAN</h2>
          
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
            <div className="flex items-center gap-2">
               <div className="bg-white border border-gray-300 px-2 py-1 flex-1">SAK ETAP</div>
               <Link 
                 to={`/workspace/${engagement.id}/worksheet/c220`}
                 className="bg-red-600 hover:bg-red-700 text-white w-8 h-6 flex items-center justify-center rounded-sm transition-colors shadow-sm"
                 title="Buka C.220 (SAK ETAP)"
               >
                 <ExternalLink size={12} />
               </Link>
            </div>
          </div>
          <div className="text-[10px] text-gray-500 italic mt-1">* : Otomatis</div>

          <div className="mt-8 border border-gray-300 bg-white p-4">
             <div className="font-bold text-red-600 italic text-[11px] mb-2">Kesimpulan dan status KKP</div>
             <div className="bg-gray-50 border border-gray-200 p-4 text-gray-600 font-medium h-24 flex items-center justify-center italic">
                (Otomatis terisi dari KKP C.220 Review Pengungkapan Laporan Keuangan)
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c120`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.120
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c300`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.300 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C200;
