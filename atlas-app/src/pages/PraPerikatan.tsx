import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';
import { useOutletContext, Link } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';
import { Users, ArrowRight } from 'lucide-react';

const PraPerikatan = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const isA110Done = Boolean(engagement.worksheetA110?.decision);
  const wsA130 = (engagement as any)?.worksheetA130;
  const isA130Done = wsA130 !== undefined ? wsA130.isCompleted === true : true;
  const statusA130: WorksheetStatus = isA130Done ? 'Completed' : 'Uncompleted';

  const wsA140 = (engagement as any)?.worksheetA140;
  const isA140Done = wsA140 !== undefined ? wsA140.isCompleted === true : true;
  const statusA140: WorksheetStatus = isA140Done ? 'Completed' : 'Uncompleted';

  const wsA150 = (engagement as any)?.worksheetA150;
  const isA150Done = wsA150 !== undefined ? wsA150.isCompleted === true : true;
  const statusA150: WorksheetStatus = isA150Done ? 'Completed' : 'Uncompleted';

  const wsA160 = (engagement as any)?.worksheetA160;
  const isA160Done = wsA160 !== undefined ? wsA160.isCompleted === true : true;
  const statusA160: WorksheetStatus = isA160Done ? 'Completed' : 'Uncompleted';

  const wsA170 = (engagement as any)?.worksheetA170;
  const isA170Done = wsA170 !== undefined ? wsA170.isCompleted === true : true;
  const statusA170: WorksheetStatus = isA170Done ? 'Completed' : 'Uncompleted';

  let worksheets: WorksheetInfo[] = [
    { 
      id: '1', 
      code: 'A.110', 
      name: 'Analisis Penerimaan dan Keberlanjutan Hubungan dengan Klien', 
      status: isA110Done ? 'Completed' : 'Not Started', 
      progress: isA110Done ? 100 : 0, 
      reviewer: isA110Done ? (engagement.managerName || 'Manager') : null, 
      lastUpdated: isA110Done ? 'Tersimpan' : '-' 
    },
    { id: '2', code: 'A.120', name: 'Alokasi Jam Jasa dan Biaya', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '3', code: 'A.130', name: 'Surat Perikatan', status: statusA130, progress: isA130Done ? 100 : (wsA130 ? 50 : 0), reviewer: isA130Done ? (engagement.managerName || 'Manager') : null, lastUpdated: wsA130 ? 'Tersimpan' : '-' },
    { id: '4', code: 'A.140', name: 'Surat Tugas', status: statusA140, progress: isA140Done ? 100 : (wsA140 ? 50 : 0), reviewer: isA140Done ? (engagement.managerName || 'Manager') : null, lastUpdated: wsA140 ? 'Tersimpan' : '-' },
    { id: '5', code: 'A.150', name: 'Pernyataan Independensi', status: statusA150, progress: isA150Done ? 100 : (wsA150 ? 50 : 0), reviewer: isA150Done ? (engagement.managerName || 'Manager') : null, lastUpdated: wsA150 ? 'Tersimpan' : '-' },
    { id: '6', code: 'A.160', name: 'Komunikasi Tim Perikatan', status: statusA160, progress: isA160Done ? 100 : (wsA160 ? 50 : 0), reviewer: isA160Done ? (engagement.managerName || 'Manager') : null, lastUpdated: wsA160 ? 'Tersimpan' : '-' },
  ];

  if (engagement.engagementType === 'First Year') {
    worksheets.push({ id: '7', code: 'A.170', name: 'Perikatan Tahun Pertama', status: statusA170, progress: isA170Done ? 100 : (wsA170 ? 50 : 0), reviewer: isA170Done ? (engagement.managerName || 'Manager') : null, lastUpdated: wsA170 ? 'Tersimpan' : '-' });
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
