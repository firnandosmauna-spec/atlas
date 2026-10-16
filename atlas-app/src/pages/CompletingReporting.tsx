import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';
import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';

const CompletingReporting = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const worksheets: WorksheetInfo[] = [
    { id: '1', code: 'C.110', name: 'Penilaian Materialitas Final', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '2', code: 'C.120', name: 'Prosedur Analitis Final', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '3', code: 'C.200', name: `Review Pengungkapan LK${engagement.accountingStandard === 'SAK_UMUM' ? ' (SAK Umum Konvergensi IFRS)' : ''}`, status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '4', code: 'C.300', name: 'Penelaahan Mutu', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '5', code: 'C.400', name: 'Evaluasi Bukti Audit', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '6', code: 'C.510', name: 'Review LAI', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '7', code: 'C.520', name: 'Audit Final Memorandum', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '8', code: 'C.530', name: 'Laporan Auditor Independen Final', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
  ];

  return (
    <WorksheetList
      stageCode="FASE C"
      stageName="Completing & Reporting"
      description="Tahap penyelesaian audit dan perumusan opini atas laporan keuangan. Mencakup evaluasi salah saji, peristiwa kemudian, going concern, representasi manajemen, komunikasi dengan TCWG, dan penerbitan Laporan Auditor Independen."
      worksheets={worksheets}
    />
  );
};

export default CompletingReporting;
