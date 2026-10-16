import WorksheetList from '../components/WorksheetList';
import type { WorksheetInfo } from '../components/WorksheetList';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../store/engagementStore';

const RiskAssessment = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const worksheets: WorksheetInfo[] = [
    { id: '1', code: 'A.210', name: 'Materialitas Awal', status: (engagement.materiality?.overallMateriality && engagement.materiality.overallMateriality > 0) ? 'Completed' : 'Not Started', progress: (engagement.materiality?.overallMateriality && engagement.materiality.overallMateriality > 0) ? 100 : 0, reviewer: (engagement.materiality?.overallMateriality && engagement.materiality.overallMateriality > 0) ? (engagement.partnerName || 'Partner') : null, lastUpdated: (engagement.materiality?.overallMateriality && engagement.materiality.overallMateriality > 0) ? 'Baru saja' : '-' },
    { id: '2', code: 'A.220', name: 'Prosedur Analitis Awal', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '3', code: 'A.230', name: 'Pemahaman Entitas dan Lingkungan', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '4', code: 'A.240', name: 'Inherent Risk', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '5', code: 'A.250', name: 'Control Risk', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '6', code: 'A.260', name: 'ROMM', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
    { id: '7', code: 'A.270', name: 'Komunikasi Dengan TCWG dan SPI', status: 'Not Started', progress: 0, reviewer: null, lastUpdated: '-' },
  ];

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
