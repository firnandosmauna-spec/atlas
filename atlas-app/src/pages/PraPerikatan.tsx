import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';
import { useOutletContext, Link } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';
import { Users, ArrowRight } from 'lucide-react';
import { getWorksheetProgress } from '../services/worksheetProgressService';

const PraPerikatan = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const progA110 = getWorksheetProgress(engagement, 'A.110');
  const progA120 = getWorksheetProgress(engagement, 'A.120');
  const progA130 = getWorksheetProgress(engagement, 'A.130');
  const progA140 = getWorksheetProgress(engagement, 'A.140');
  const progA150 = getWorksheetProgress(engagement, 'A.150');
  const progA160 = getWorksheetProgress(engagement, 'A.160');
  const progA170 = getWorksheetProgress(engagement, 'A.170');

  let worksheets: WorksheetInfo[] = [
    { 
      id: '1', 
      code: 'A.110', 
      name: 'Analisis Penerimaan dan Keberlanjutan Hubungan dengan Klien', 
      status: progA110.status, 
      progress: progA110.progress, 
      reviewer: progA110.reviewer, 
      lastUpdated: progA110.lastUpdated 
    },
    { 
      id: '2', 
      code: 'A.120', 
      name: 'Alokasi Jam Jasa dan Biaya', 
      status: progA120.status, 
      progress: progA120.progress, 
      reviewer: progA120.reviewer, 
      lastUpdated: progA120.lastUpdated 
    },
    { 
      id: '3', 
      code: 'A.130', 
      name: 'Surat Perikatan', 
      status: progA130.status, 
      progress: progA130.progress, 
      reviewer: progA130.reviewer, 
      lastUpdated: progA130.lastUpdated 
    },
    { 
      id: '4', 
      code: 'A.140', 
      name: 'Surat Tugas', 
      status: progA140.status, 
      progress: progA140.progress, 
      reviewer: progA140.reviewer, 
      lastUpdated: progA140.lastUpdated 
    },
    { 
      id: '5', 
      code: 'A.150', 
      name: 'Pernyataan Independensi', 
      status: progA150.status, 
      progress: progA150.progress, 
      reviewer: progA150.reviewer, 
      lastUpdated: progA150.lastUpdated 
    },
    { 
      id: '6', 
      code: 'A.160', 
      name: 'Komunikasi Tim Perikatan', 
      status: progA160.status, 
      progress: progA160.progress, 
      reviewer: progA160.reviewer, 
      lastUpdated: progA160.lastUpdated 
    },
  ];

  if (engagement.engagementType === 'First Year') {
    worksheets.push({ 
      id: '7', 
      code: 'A.170', 
      name: 'Perikatan Tahun Pertama', 
      status: progA170.status, 
      progress: progA170.progress, 
      reviewer: progA170.reviewer, 
      lastUpdated: progA170.lastUpdated 
    });
  }

  return (
    <div className="space-y-6">
      {/* Quick Access Card: Data Master Perikatan & Susunan Tim Audit */}
      <div className="p-4 bg-gradient-to-r from-blue-50/80 via-white to-slate-50 border border-blue-200/80 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-atlas-blue text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Data Master Perikatan & Susunan Tim Audit</h3>
              <span className="text-[10px] font-bold bg-blue-100 text-atlas-blue px-2 py-0.5 rounded-full">
                Modul Inti
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Atur identitas perikatan, entitas klien, dan penugasan peran dinamis personil tim (Ketua Tim, Supervisor, Auditor).
            </p>
          </div>
        </div>
        <Link
          to={`/workspace/${engagement.id}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-lg transition-colors shrink-0 shadow-2xs"
        >
          <span>Buka Data Master Perikatan</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <WorksheetList
        stageCode="FASE A.1"
        stageName="Pra Perikatan"
        description="Evaluasi awal sebelum perikatan dimulai. Mencakup penerimaan klien, alokasi tim, surat perikatan, dan pemenuhan persyaratan independensi. Seluruh worksheet pada fase ini wajib diselesaikan sebelum memulai Risk Assessment."
        worksheets={worksheets}
      />
    </div>
  );
};

export default PraPerikatan;
