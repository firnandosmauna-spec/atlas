import type { Engagement, WorksheetA110 } from '../store/engagementStore';

export type WorksheetProgressStatus = 'Full' | 'Belum Full' | 'Belum Dimulai';

export interface WorksheetProgressResult {
  code: string;
  normalizedCode: string;
  name: string;
  progress: number; // 0 - 100
  status: WorksheetProgressStatus;
  isFull: boolean;
  summary: string;
  lastUpdated?: string;
  reviewer?: string | null;
  statusBadge: {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    dotColor: string;
  };
}

/**
 * Normalizes worksheet code (e.g. 'A.110' -> 'A110', 'a110' -> 'A110')
 */
export const normalizeWorksheetCode = (code: string): string => {
  return code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

/**
 * Calculates progress for Worksheet A.110 (Analisis Penerimaan & Keberlanjutan Hubungan Klien)
 */
export const calculateA110Progress = (engagement?: Engagement | null): WorksheetProgressResult => {
  const normCode = 'A110';
  const name = 'Analisis Penerimaan dan Keberlanjutan Hubungan dengan Klien';

  if (!engagement || !engagement.worksheetA110) {
    return {
      code: 'A.110',
      normalizedCode: normCode,
      name,
      progress: 0,
      status: 'Belum Dimulai',
      isFull: false,
      summary: 'Belum diisi (0%)',
      lastUpdated: '-',
      reviewer: null,
      statusBadge: {
        label: 'Belum Dimulai',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        dotColor: 'bg-slate-400',
      },
    };
  }

  const ws = engagement.worksheetA110;
  
  // Scoring checkpoints for A.110 (Total 100):
  // 1. Profil Klien & Tata Kelola: 20 pts
  let score = 0;
  const hasProfile = Boolean(ws.industry && ws.boardOfDirectors && ws.usagePurpose);
  if (hasProfile) score += 20;
  else if (ws.industry || ws.boardOfDirectors || ws.usagePurpose) score += 10;

  // 2. Analisis Risiko Entitas & Standar Akuntansi: 20 pts
  const hasRisks = Boolean(ws.industryRisk && ws.ownershipRisk && ws.accountingStandardRisk);
  if (hasRisks) score += 20;
  else if (ws.industryRisk || ws.ownershipRisk || ws.accountingStandardRisk) score += 10;

  // 3. Evaluasi Sub-KKP A.1101 - A.1104: 25 pts
  const isFirstYear = engagement.engagementType === 'First Year';
  const evals = ws.evaluations || {};
  const hasSubEvals = 
    Boolean(evals['A.1101']) &&
    Boolean(evals['A.1102']) &&
    Boolean(evals['A.1103']) &&
    (!isFirstYear || Boolean(evals['A.1104']));

  if (hasSubEvals) {
    score += 25;
  } else {
    const filledCount = ['A.1101', 'A.1102', 'A.1103', isFirstYear ? 'A.1104' : null]
      .filter(Boolean)
      .filter(k => Boolean(evals[k as string])).length;
    score += Math.round((filledCount / (isFirstYear ? 4 : 3)) * 25);
  }

  // 4. Standar SA Checklist (SPM 1, SA 210, SA 220, SA 300): 15 pts
  const sa = ws.saChecklist || {};
  const saCount = ['spm1', 'sa210', 'sa220', 'sa300'].filter(k => sa[k] === true).length;
  if (saCount === 4) score += 15;
  else score += Math.round((saCount / 4) * 15);

  // 5. Keputusan Penerimaan (Decision Accept/Reject) & Mitigasi: 20 pts
  const isMitigationFilled = ws.overallRisk === 'high' ? (ws.anomalyExplanation || ws.riskMitigationExplanation || '').trim().length > 0 : true;
  if (ws.decision && isMitigationFilled) {
    score += 20;
  } else if (ws.decision) {
    score += 10;
  }

  // Explicit Full check
  const isExplicitComplete = ws.isCompleted === true;
  const isLogicallyComplete = score >= 95 && ws.decision === 'Accept' && saCount === 4;
  const isFull = isExplicitComplete || isLogicallyComplete;
  const finalProgress = isFull ? 100 : Math.min(score, 90);

  let status: WorksheetProgressStatus = 'Belum Dimulai';
  if (isFull) {
    status = 'Full';
  } else if (finalProgress > 0) {
    status = 'Belum Full';
  }

  const statusBadge = isFull
    ? {
        label: 'Full (100%)',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
      }
    : finalProgress > 0
    ? {
        label: `Belum Full (${finalProgress}%)`,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        dotColor: 'bg-amber-500 animate-pulse',
      }
    : {
        label: 'Belum Dimulai',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        dotColor: 'bg-slate-400',
      };

  return {
    code: 'A.110',
    normalizedCode: normCode,
    name,
    progress: finalProgress,
    status,
    isFull,
    summary: isFull
      ? 'Kertas kerja A.110 Full / Lengkap'
      : finalProgress > 0
      ? `Sedang berjalan: ${finalProgress}% terisi`
      : 'Belum dimulai',
    lastUpdated: isFull ? 'Lengkap & Tersimpan' : finalProgress > 0 ? 'Draf berjalan' : '-',
    reviewer: isFull ? (engagement.managerName || 'Manager') : null,
    statusBadge,
  };
};

/**
 * Universal evaluator for any ATLAS worksheet code
 */
export const getWorksheetProgress = (
  engagement?: Engagement | null,
  rawCode: string = ''
): WorksheetProgressResult => {
  const norm = normalizeWorksheetCode(rawCode);

  if (!engagement) {
    return {
      code: rawCode,
      normalizedCode: norm,
      name: rawCode,
      progress: 0,
      status: 'Belum Dimulai',
      isFull: false,
      summary: 'Tidak ada perikatan aktif',
      lastUpdated: '-',
      reviewer: null,
      statusBadge: {
        label: 'Belum Dimulai',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        dotColor: 'bg-slate-400',
      },
    };
  }

  // Specialized: A.110
  if (norm === 'A110') {
    return calculateA110Progress(engagement);
  }

  // Pre-Engagement Sub/Sister Worksheets
  if (norm === 'A120') {
    const ws = (engagement as any).worksheetA120;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 60 : 0;
    return makeResult(rawCode, norm, 'Alokasi Jam Jasa dan Perencanaan Lainnya', progress, isFull, engagement);
  }

  if (norm === 'A130') {
    const ws = engagement.worksheetA130;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Surat Perikatan', progress, isFull, engagement);
  }

  if (norm === 'A140') {
    const ws = engagement.worksheetA140;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Surat Tugas', progress, isFull, engagement);
  }

  if (norm === 'A150') {
    const ws = engagement.worksheetA150;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Pernyataan Independensi', progress, isFull, engagement);
  }

  if (norm === 'A160') {
    const ws = engagement.worksheetA160;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Komunikasi Tim Perikatan', progress, isFull, engagement);
  }

  if (norm === 'A170') {
    const isFirstYear = engagement.engagementType === 'First Year';
    if (!isFirstYear) {
      return {
        code: rawCode,
        normalizedCode: norm,
        name: 'Perikatan Tahun Pertama (Tidak Berlaku)',
        progress: 100,
        status: 'Full',
        isFull: true,
        summary: 'Tidak dipersyaratkan (Audit Berulang)',
        lastUpdated: 'Otomatis',
        reviewer: null,
        statusBadge: {
          label: 'N/A (Selesai)',
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-600',
          borderColor: 'border-slate-200',
          dotColor: 'bg-slate-400',
        },
      };
    }
    const ws = engagement.worksheetA170;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Perikatan Tahun Pertama', progress, isFull, engagement);
  }

  // Phase A.2: Risk Assessment
  if (norm === 'A210' || norm === 'A2101') {
    const mat = engagement.materiality;
    const isFull = Boolean(mat && mat.overallMateriality && mat.overallMateriality > 0);
    const progress = isFull ? 100 : mat ? 40 : 0;
    return makeResult(rawCode, norm, 'Materialitas Awal', progress, isFull, engagement);
  }

  if (norm === 'A220' || norm === 'A2201' || norm === 'A2202') {
    const ws = (engagement as any).worksheetA220;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Prosedur Analitis Awal', progress, isFull, engagement);
  }

  if (norm === 'A230') {
    const ws = (engagement as any).worksheetA230;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Pemahaman Entitas dan Lingkungan', progress, isFull, engagement);
  }

  if (norm === 'A240') {
    const risks = engagement.risks || [];
    const hasInherentRisks = risks.some(r => r.inherentRisk);
    const isFull = hasInherentRisks;
    const progress = isFull ? 100 : risks.length > 0 ? 50 : 0;
    return makeResult(rawCode, norm, 'Inherent Risk (IR)', progress, isFull, engagement);
  }

  if (norm === 'A250' || norm === 'A2501' || norm === 'A2502') {
    const ws = (engagement as any).worksheetA250;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Control Risk (CR)', progress, isFull, engagement);
  }

  if (norm === 'A260') {
    const ws = (engagement as any).worksheetA260;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Komunikasi Dengan TCWG dan SPI', progress, isFull, engagement);
  }

  if (norm === 'A270' || norm === 'A2701' || norm === 'A2702') {
    const ws = (engagement as any).worksheetA270;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Risk of Material Misstatement (RoMM)', progress, isFull, engagement);
  }

  if (norm === 'A280') {
    const ws = (engagement as any).worksheetA280;
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Audit Strategy Memorandum Update', progress, isFull, engagement);
  }

  // Phase B: Risk Response
  if (norm === 'B100') {
    const procs = engagement.procedures || [];
    const completedProcs = procs.filter(p => p.status === 'Completed').length;
    const isFull = procs.length > 0 && completedProcs === procs.length;
    const progress = procs.length > 0 ? Math.round((completedProcs / procs.length) * 100) : 0;
    return makeResult(rawCode, norm, 'Audit Procedures & Worksheets Lead', progress, isFull, engagement);
  }

  if (norm.startsWith('B2')) {
    const key = `worksheet${norm}`;
    const ws = (engagement as any)[key];
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, `Respon Risiko Area Khusus ${norm}`, progress, isFull, engagement);
  }

  // Phase C: Completing & Reporting
  if (norm === 'C530') {
    const ws = (engagement as any).worksheetC530;
    const isFull = Boolean(ws?.isCompleted || ws?.kesimpulan);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, 'Laporan Auditor Independen Final', progress, isFull, engagement);
  }

  if (norm.startsWith('C')) {
    const key = `worksheet${norm}`;
    const ws = (engagement as any)[key];
    const isFull = Boolean(ws?.isCompleted);
    const progress = isFull ? 100 : ws ? 50 : 0;
    return makeResult(rawCode, norm, `Completing & Reporting ${norm}`, progress, isFull, engagement);
  }

  // Phase D: General
  if (norm === 'D100') {
    const tb = engagement.trialBalance || [];
    const isFull = tb.length > 0;
    const progress = isFull ? 100 : 0;
    return makeResult(rawCode, norm, 'Input Laporan Keuangan (Trial Balance)', progress, isFull, engagement);
  }

  if (norm === 'D200' || norm === 'D300' || norm === 'D400') {
    // Reference sheets are always accessible
    return makeResult(rawCode, norm, `Referensi Umum ${norm}`, 100, true, engagement);
  }

  // Generic fallback
  const genericWs = (engagement as any)[`worksheet${norm}`];
  const isFull = Boolean(genericWs?.isCompleted);
  const progress = isFull ? 100 : genericWs ? 50 : 0;
  return makeResult(rawCode, norm, rawCode, progress, isFull, engagement);
};

const makeResult = (
  rawCode: string,
  normCode: string,
  name: string,
  progress: number,
  isFull: boolean,
  engagement: Engagement
): WorksheetProgressResult => {
  let status: WorksheetProgressStatus = 'Belum Dimulai';
  if (isFull || progress === 100) {
    status = 'Full';
  } else if (progress > 0) {
    status = 'Belum Full';
  }

  const statusBadge = isFull || progress === 100
    ? {
        label: 'Full (100%)',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
      }
    : progress > 0
    ? {
        label: `Belum Full (${progress}%)`,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        dotColor: 'bg-amber-500 animate-pulse',
      }
    : {
        label: 'Belum Dimulai',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        dotColor: 'bg-slate-400',
      };

  return {
    code: rawCode,
    normalizedCode: normCode,
    name,
    progress: isFull ? 100 : progress,
    status,
    isFull: isFull || progress === 100,
    summary: isFull || progress === 100
      ? 'Kertas kerja Full / Lengkap (100%)'
      : progress > 0
      ? `Sedang berjalan (${progress}%)`
      : 'Belum dimulai (0%)',
    lastUpdated: isFull ? 'Lengkap' : progress > 0 ? 'Draf berjalan' : '-',
    reviewer: isFull ? (engagement.managerName || 'Manager') : null,
    statusBadge,
  };
};

export const DEFAULT_ATLAS_MODULE_CODES: string[] = [
  'A110', 'A120', 'A130', 'A140', 'A150', 'A160', 'A170',
  'A210', 'A220', 'A230', 'A240', 'A250', 'A260', 'A270', 'A280',
  'B100', 'B210', 'B220', 'B230', 'B240', 'B250', 'B260', 'B270', 'B280',
  'C110', 'C120', 'C200', 'C300', 'C400', 'C510', 'C520', 'C530',
  'D100', 'D200', 'D300', 'D400'
];

/**
 * Returns a summary of counts (Total, Full, Belum Full, Belum Dimulai) across all 36 ATLAS modules
 */
export const getMatrixProgressSummary = (
  engagement?: Engagement | null,
  moduleCodes: string[] = DEFAULT_ATLAS_MODULE_CODES
) => {
  if (!engagement || moduleCodes.length === 0) {
    return {
      total: moduleCodes.length,
      fullCount: 0,
      inProgressCount: 0,
      notStartedCount: moduleCodes.length,
      averageProgress: 0,
    };
  }

  let totalScore = 0;
  let fullCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;

  moduleCodes.forEach(code => {
    const res = getWorksheetProgress(engagement, code);
    totalScore += res.progress;
    if (res.isFull) fullCount++;
    else if (res.progress > 0) inProgressCount++;
    else notStartedCount++;
  });

  const averageProgress = Math.round(totalScore / (moduleCodes.length || 1));

  return {
    total: moduleCodes.length,
    fullCount,
    inProgressCount,
    notStartedCount,
    averageProgress,
  };
};

export interface KeyWorksheetSummary {
  a110: WorksheetProgressResult;
  a120: WorksheetProgressResult;
  a210: WorksheetProgressResult;
  b100: WorksheetProgressResult;
  c530: WorksheetProgressResult;
  d100: WorksheetProgressResult;
}

export const getKeyWorksheetsProgress = (engagement?: Engagement | null): KeyWorksheetSummary => {
  return {
    a110: getWorksheetProgress(engagement, 'A110'),
    a120: getWorksheetProgress(engagement, 'A120'),
    a210: getWorksheetProgress(engagement, 'A210'),
    b100: getWorksheetProgress(engagement, 'B100'),
    c530: getWorksheetProgress(engagement, 'C530'),
    d100: getWorksheetProgress(engagement, 'D100'),
  };
};

export interface EngagementMatrixCardData {
  engagement: Engagement;
  summary: {
    total: number;
    fullCount: number;
    inProgressCount: number;
    notStartedCount: number;
    averageProgress: number;
  };
  keyWorksheets: KeyWorksheetSummary;
}

export const getEngagementMatrixCardData = (
  engagement: Engagement,
  allModuleCodes: string[] = DEFAULT_ATLAS_MODULE_CODES
): EngagementMatrixCardData => {
  return {
    engagement,
    summary: getMatrixProgressSummary(engagement, allModuleCodes),
    keyWorksheets: getKeyWorksheetsProgress(engagement),
  };
};

