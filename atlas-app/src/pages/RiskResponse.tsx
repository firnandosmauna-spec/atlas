import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';
import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';

const RiskResponse = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  let worksheets: WorksheetInfo[] = [
    { id: '1', code: 'B.100', name: 'WORKSHEET', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '2', code: 'B.210', name: 'Estimasi Akuntansi', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '3', code: 'B.220', name: 'Transaksi dengan Pihak Berelasi', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '4', code: 'B.230', name: 'Peristiwa Kemudian', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '5', code: 'B.240', name: 'Kelangsungan Usaha', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '6', code: 'B.250', name: 'Representasi Manajemen', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '7', code: 'B.260', name: 'Pakar Auditor', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '8', code: 'B.270', name: 'Pakar Manajemen', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '9', code: 'B.280', name: 'Komitmen dan Kontijensi', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
  ];

  if (engagement.accountingStandard === 'SAK_UMUM') {
    worksheets.push({ id: '14', code: 'B.290', name: 'Informasi Segmen', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' });
  }

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
