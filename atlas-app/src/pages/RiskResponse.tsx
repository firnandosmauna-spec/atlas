import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';
import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';
import { getWorksheetProgress } from '../services/worksheetProgressService';

const RiskResponse = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const baseItems = [
    { id: '1', code: 'B.100', name: 'WORKSHEET' },
    { id: '2', code: 'B.210', name: 'Estimasi Akuntansi' },
    { id: '3', code: 'B.220', name: 'Transaksi dengan Pihak Berelasi' },
    { id: '4', code: 'B.230', name: 'Peristiwa Kemudian' },
    { id: '5', code: 'B.240', name: 'Kelangsungan Usaha' },
    { id: '6', code: 'B.250', name: 'Representasi Manajemen' },
    { id: '7', code: 'B.260', name: 'Pakar Auditor' },
    { id: '8', code: 'B.270', name: 'Pakar Manajemen' },
    { id: '9', code: 'B.280', name: 'Komitmen dan Kontijensi' },
  ];

  if (engagement.accountingStandard === 'SAK_UMUM') {
    baseItems.push({ id: '14', code: 'B.290', name: 'Informasi Segmen' });
  }

  const worksheets: WorksheetInfo[] = baseItems.map(item => {
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
      stageCode="FASE B"
      stageName="Risk Response (Respon Risiko)"
      description="Pelaksanaan prosedur audit sebagai respons terhadap risiko yang dinilai. Mencakup uji pengendalian, program audit substantif, sampling, dan kertas kerja per akun laporan keuangan."
      worksheets={worksheets}
    />
  );
};

export default RiskResponse;
