import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';

const PraPerikatan = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const isA110Done = Boolean(engagement.worksheetA110?.decision);
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
    { id: '3', code: 'A.130', name: 'Surat Perikatan', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '4', code: 'A.140', name: 'Surat Tugas', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '5', code: 'A.150', name: 'Pernyataan Independensi', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '6', code: 'A.160', name: 'Komunikasi Tim Perikatan', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
  ];

  if (engagement.engagementType === 'First Year') {
    worksheets.push({ id: '7', code: 'A.170', name: 'Perikatan Tahun Pertama', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' });
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
