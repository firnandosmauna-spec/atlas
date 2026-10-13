import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';
import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';

const General = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const worksheets: WorksheetInfo[] = [
    { id: '1', code: 'D.100', name: 'INPUT LAPORAN KEUANGAN', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '2', code: 'D.200', name: 'LAMPIRAN', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '3', code: 'D.300', name: 'SINGKATAN', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
  ];

  return (
    <WorksheetList
      stageCode="FASE D"
      stageName="General"
      description="Menu umum yang mencakup input data laporan keuangan klien, lampiran dokumen, dan daftar singkatan yang digunakan selama proses audit."
      worksheets={worksheets}
    />
  );
};

export default General;
