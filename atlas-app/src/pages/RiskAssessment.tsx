import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';
import { getWorksheetProgress } from '../services/worksheetProgressService';

const RiskAssessment = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const codes = [
    { id: '1', code: 'A.210', name: 'Materialitas Awal' },
    { id: '2', code: 'A.220', name: 'Prosedur Analitis Awal' },
    { id: '3', code: 'A.230', name: 'Pemahaman Entitas dan Lingkungan' },
    { id: '4', code: 'A.240', name: 'Inherent Risk' },
    { id: '5', code: 'A.250', name: 'Control Risk' },
    { id: '6', code: 'A.260', name: 'Komunikasi Dengan TCWG dan SPI' },
    { id: '7', code: 'A.270', name: 'Risk of Material Misstatement (RoMM)' },
    { id: '8', code: 'A.280', name: 'Audit Strategy Memorandum Update' },
  ];

  const worksheets: WorksheetInfo[] = codes.map(item => {
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
      stageCode="FASE A.2"
      stageName="Risk Assessment"
      description="Penilaian risiko untuk mengidentifikasi dan menilai risiko salah saji material pada tingkat laporan keuangan dan asersi. Termasuk pemahaman entitas, prosedur analitis awal, dan penilaian risiko bawaan serta risiko pengendalian."
      worksheets={worksheets}
    />
  );
};

export default RiskAssessment;
