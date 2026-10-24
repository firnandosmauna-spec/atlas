import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';
import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';
import { getWorksheetProgress } from '../services/worksheetProgressService';

const General = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const items = [
    { id: '1', code: 'D.100', name: 'INPUT LAPORAN KEUANGAN (TB)' },
    { id: '2', code: 'D.200', name: 'LAMPIRAN' },
    { id: '3', code: 'D.300', name: 'SINGKATAN' },
    { id: '4', code: 'D.400', name: 'PETUNJUK PENGISIAN SINGKAT' },
  ];

  const worksheets: WorksheetInfo[] = items.map(item => {
    const prog = getWorksheetProgress(engagement, item.code);
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      status: prog.status,
      progress: prog.progress,
      reviewer: prog.reviewer,
      lastUpdated: prog.lastUpdated || '-',
    };
  });

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
