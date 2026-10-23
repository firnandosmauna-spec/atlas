import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';

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
    <WorksheetList
      stageCode="FASE A.1"
      stageName="Pra Perikatan"
      description="Evaluasi awal sebelum perikatan dimulai. Mencakup penerimaan klien, alokasi tim, surat perikatan, dan pemenuhan persyaratan independensi. Seluruh worksheet pada fase ini wajib diselesaikan sebelum memulai Risk Assessment."
      worksheets={worksheets}
    />
  );
};

export default PraPerikatan;
