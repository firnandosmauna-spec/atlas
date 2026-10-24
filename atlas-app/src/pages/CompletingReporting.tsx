import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';
import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';
import { getWorksheetProgress } from '../services/worksheetProgressService';

const CompletingReporting = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const items = [
    { id: '1', code: 'C.110', name: 'Penilaian Materialitas Final' },
    { id: '2', code: 'C.120', name: 'Prosedur Analitis Final' },
    { id: '3', code: 'C.200', name: `Review Pengungkapan LK${engagement.accountingStandard === 'SAK_UMUM' ? ' (SAK Umum Konvergensi IFRS)' : ''}` },
    { id: '4', code: 'C.300', name: 'Penelaahan Mutu' },
    { id: '5', code: 'C.400', name: 'Evaluasi Bukti Audit' },
    { id: '6', code: 'C.510', name: 'Review LAI' },
    { id: '7', code: 'C.520', name: 'Audit Final Memorandum' },
    { id: '8', code: 'C.530', name: 'Laporan Auditor Independen Final' },
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
      stageCode="FASE C"
      stageName="Completing & Reporting"
      description="Tahap penyelesaian audit dan perumusan opini atas laporan keuangan. Mencakup evaluasi salah saji, peristiwa kemudian, going concern, representasi manajemen, komunikasi dengan TCWG, dan penerbitan Laporan Auditor Independen."
      worksheets={worksheets}
    />
  );
};

export default CompletingReporting;
