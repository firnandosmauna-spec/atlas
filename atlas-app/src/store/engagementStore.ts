import { create } from 'zustand';

export interface Account {
  id: string;
  code: string;
  name: string;
  group: string;
  subGroup: string;
  debit: number;
  credit: number;
  endingBalance: number;
}

export interface Materiality {
  overallMateriality: number;
  performanceMateriality: number;
  specificMateriality: number;
  threshold: number;
  basis: string;
  omPercentage: number;
  pmPercentage: number;
  thresholdPercentage: number;
  rationale: string;
}

export interface ComprehensiveRisk {
  id: string;
  riskId: string;
  description: string;
  account: string;
  assertion: string;
  inherentRisk: 'High' | 'Moderate' | 'Low' | '';
  controlRisk: 'High' | 'Moderate' | 'Low' | '';
  significantRisk: boolean;
  fraudConsideration: boolean;
  riskAssessment: string;
  rationale: string;
  relatedProcedure: string;
}

export interface AuditProcedure {
  id: string;
  procedureId: string;
  riskId: string;
  account: string;
  assertion: string;
  auditObjective: string;
  procedure: string;
  population: string;
  sample: string;
  sampleSize: number;
  evidence: string;
  result: string;
  exception: string;
  conclusion: 'Satisfactory' | 'Needs Adjustment' | 'Material Misstatement' | '';
  preparedBy: string;
  reviewedBy: string;
}

export interface WorksheetA110 {
  industry: string;
  boardOfDirectors: string;
  usagePurpose: string;
  evaluations: Record<string, 'low' | 'high' | ''>;
  overallRisk: 'low' | 'medium' | 'high' | null;
  anomalyExplanation: string;
  decision: 'Accept' | 'Reject' | null;
  decisionReason: string;
  status: 'In Progress' | 'Pending Review' | 'Approved' | 'Needs Revision';
}

export interface Engagement {
  id: string;
  clientId: string;
  clientName: string;
  clientAddress?: string;
  clientIndustry?: string;
  auditPeriod: string;
  fiscalYear: string;
  engagementType: 'First Year' | 'Recurring';
  accountingStandard: 'SAK_UMUM' | 'SAK_ETAP' | 'SAK_EMKM' | 'PSAK_SYARIAH' | 'SAP';
  currency: 'IDR' | 'USD' | 'Other';
  presentationUnit: 'Full' | 'Thousands' | 'Millions';
  partnerId: string;
  partnerName: string;
  managerId: string;
  managerName: string;
  auditorId: string;
  auditorName: string;
  startDate: string;
  targetDate: string;
  status: 'Draft' | 'Active' | 'Pending Review' | 'Completed' | 'Overdue' | 'Archived';
  progress: number;
  trialBalance?: Account[];
  materiality?: Materiality;
  risks?: ComprehensiveRisk[];
  procedures?: AuditProcedure[];
  worksheetA110?: WorksheetA110;
}

export interface ReviewNote {
  id: string;
  engagementId: string;
  worksheetId: string;
  reviewer: string;
  date: string;
  comment: string;
  status: 'Open' | 'Resolved' | 'Reopened' | 'Closed';
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: string;
}

export interface AuditLog {
  id: string;
  engagementId: string;
  user: string;
  timestamp: string;
  action: string;
  module: string;
  record: string;
  oldValue?: string;
  newValue?: string;
}

export interface Attachment {
  id: string;
  engagementId: string;
  worksheetId: string;
  procedureId?: string;
  fileName: string;
  fileType: string;
  size: number;
  uploadedBy: string;
  uploadedDate: string;
  description: string;
  url?: string;
}

export interface Notification {
  id: string;
  type: 'assignment' | 'review_request' | 'review_complete' | 'revision' | 'overdue' | 'approval';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  link?: string;
}

interface EngagementState {
  engagements: Engagement[];
  activeEngagementId: string | null;
  auditLogs: AuditLog[];
  attachments: Attachment[];
  notifications: Notification[];
  reviewNotes: ReviewNote[];
  addEngagement: (engagement: Engagement) => void;
  updateEngagement: (id: string, updatedData: Partial<Engagement>) => void;
  duplicateEngagement: (id: string) => void;
  archiveEngagement: (id: string) => void;
  openEngagement: (id: string) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addAttachment: (attachment: Omit<Attachment, 'id' | 'uploadedDate'>) => void;
  removeAttachment: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

export const useEngagementStore = create<EngagementState>((set, get) => ({
  engagements: [
    {
      id: 'ENG-2024-001',
      clientId: 'C-004',
      clientName: 'PT Perdagangan Indonesia',
      clientAddress: 'Jl. Raya Pondok Indah No 1 Jakarta Selatan',
      clientIndustry: 'Perdagangan',
      auditPeriod: '1 Januari - 31 Desember 2024',
      fiscalYear: '2024',
      engagementType: 'First Year',
      accountingStandard: 'SAK_ETAP',
      currency: 'IDR',
      presentationUnit: 'Full',
      partnerId: 'P-3',
      partnerName: 'Herika',
      managerId: 'M-3',
      managerName: 'Agung',
      auditorId: 'A-3',
      auditorName: 'Edi',
      startDate: '2024-10-01',
      targetDate: '2025-03-31',
      status: 'Active',
      progress: 0,
      worksheetA110: {
        industry: 'Perdagangan',
        boardOfDirectors: 'Direktur Utama: Bp Deni',
        usagePurpose: 'Keperluan internal dan pelaporan statutory',
        evaluations: {
          'A.1101': 'low',
          'A.1102': 'low',
          'A.1103': 'low',
          'A.1104': 'high'
        },
        overallRisk: 'medium',
        anomalyExplanation: 'Risiko A.1104 dinilai tinggi karena AP tahun sebelumnya tidak membalas surat keberatan profesi dari AP Pengganti.',
        decision: 'Accept',
        decisionReason: 'KAP Herika & Rekan memutuskan untuk menerima penugasan atas perikatan jasa audit PT Perdagangan Indonesia periode 1 Januari - 31 Desember 2024 dan rencana untuk melakukan mitigasi risiko dengan cara melakukan pengujian saldo awal.',
        status: 'In Progress'
      }
    },
    {
      id: 'ENG-2025-DEMO',
      clientId: 'C-003',
      clientName: 'PT Contoh Indonesia',
      auditPeriod: '1 Jan 2025 - 31 Des 2025',
      fiscalYear: '2025',
      engagementType: 'First Year',
      accountingStandard: 'SAK_UMUM',
      currency: 'IDR',
      presentationUnit: 'Full',
      partnerId: 'P-1',
      partnerName: 'Budi Partner, CPA',
      managerId: 'M-1',
      managerName: 'Siti Manager, CA',
      auditorId: 'A-1',
      auditorName: 'Andi Auditor',
      startDate: '2025-10-01',
      targetDate: '2026-03-31',
      status: 'Active',
      progress: 35,
      trialBalance: [
        { id: 't1', code: '1100', name: 'Kas di Bank', group: 'Aset', subGroup: 'Aset Lancar', debit: 1500000000, credit: 0, endingBalance: 1500000000 },
        { id: 't2', code: '1200', name: 'Piutang Usaha', group: 'Aset', subGroup: 'Aset Lancar', debit: 3200000000, credit: 200000000, endingBalance: 3000000000 },
        { id: 't3', code: '2100', name: 'Utang Usaha', group: 'Liabilitas', subGroup: 'Liabilitas Jangka Pendek', debit: 50000000, credit: 1250000000, endingBalance: -1200000000 },
        { id: 't4', code: '4100', name: 'Pendapatan Penjualan', group: 'Pendapatan', subGroup: 'Pendapatan Usaha', debit: 0, credit: 8500000000, endingBalance: -8500000000 },
        { id: 't5', code: '5100', name: 'Beban Pokok Penjualan', group: 'Beban', subGroup: 'Beban Pokok Penjualan', debit: 4200000000, credit: 0, endingBalance: 4200000000 },
      ],
      materiality: {
        overallMateriality: 250000000,
        performanceMateriality: 187500000,
        specificMateriality: 50000000,
        threshold: 12500000,
        basis: 'Total Aset',
        omPercentage: 1.5,
        pmPercentage: 75,
        thresholdPercentage: 5,
        rationale: 'Klien merupakan entitas komersial stabil dengan risiko bawaan moderat.'
      },
      risks: [
        {
          id: 'r1', riskId: 'RSK-01', description: 'Risiko pengakuan pendapatan fiktif (Fraud Risk).', account: 'Pendapatan Penjualan', assertion: 'Occurrence (O)',
          inherentRisk: 'High', controlRisk: 'Moderate', significantRisk: true, fraudConsideration: true, riskAssessment: 'High', rationale: 'Tekanan target.', relatedProcedure: 'PRC-01'
        },
        {
          id: 'r2', riskId: 'RSK-02', description: 'Risiko piutang tak tertagih yang tidak dicadangkan.', account: 'Piutang Usaha', assertion: 'Valuation (V)',
          inherentRisk: 'Moderate', controlRisk: 'Low', significantRisk: false, fraudConsideration: false, riskAssessment: 'Moderate', rationale: 'Umur piutang memburuk.', relatedProcedure: 'PRC-02'
        }
      ],
      procedures: [
        {
          id: 'p1', procedureId: 'PRC-01', riskId: 'RSK-01', account: 'Pendapatan', assertion: 'O', auditObjective: 'Memastikan pendapatan benar terjadi.',
          procedure: 'Lakukan vouching sampel faktur penjualan ke surat jalan dan penerimaan kas.', population: '8500 faktur', sample: 'Acak', sampleSize: 45,
          evidence: 'ATT-1', result: 'Ditemukan 1 faktur tanpa surat jalan.', exception: 'Faktur INV-999', conclusion: 'Needs Adjustment', preparedBy: 'Andi', reviewedBy: 'Siti'
        }
      ],
      worksheetA110: {
        industry: '',
        boardOfDirectors: '',
        usagePurpose: '',
        evaluations: {
          'A.1101': '',
          'A.1102': '',
          'A.1103': '',
          'A.1104': '',
        },
        overallRisk: null,
        anomalyExplanation: '',
        decision: null,
        decisionReason: '',
        status: 'In Progress'
      }
    },
    {
      id: 'ENG-2018-001',
      clientId: 'C-001',
      clientName: 'PT Kertas Makmur',
      auditPeriod: '1 Jan 2018 - 31 Des 2018',
      fiscalYear: '2018',
      engagementType: 'First Year',
      accountingStandard: 'SAK_UMUM',
      currency: 'IDR',
      presentationUnit: 'Full',
      partnerId: 'P-1',
      partnerName: 'Agus T.',
      managerId: 'M-1',
      managerName: 'Budi S.',
      auditorId: 'A-1',
      auditorName: 'Rina',
      startDate: '2018-10-01',
      targetDate: '2019-02-28',
      status: 'Active',
      progress: 75
    },
    {
      id: 'ENG-2018-002',
      clientId: 'C-002',
      clientName: 'CV Maju Jaya',
      auditPeriod: '1 Jan 2018 - 30 Nov 2018',
      fiscalYear: '2018',
      engagementType: 'Recurring',
      accountingStandard: 'SAK_ETAP',
      currency: 'IDR',
      presentationUnit: 'Thousands',
      partnerId: 'P-2',
      partnerName: 'Arie W.',
      managerId: 'M-2',
      managerName: 'Siti N.',
      auditorId: 'A-2',
      auditorName: 'Tono',
      startDate: '2018-09-15',
      targetDate: '2019-01-15',
      status: 'Pending Review',
      progress: 90
    }
  ],
  activeEngagementId: null,

  addEngagement: (engagement) => set((state) => ({ 
    engagements: [engagement, ...state.engagements] 
  })),

  updateEngagement: (id, updatedData) => set((state) => ({
    engagements: state.engagements.map((eng) => 
      eng.id === id ? { ...eng, ...updatedData } : eng
    )
  })),

  duplicateEngagement: (id) => set((state) => {
    const engToDuplicate = state.engagements.find(e => e.id === id);
    if (!engToDuplicate) return state;
    
    const duplicated: Engagement = {
      ...engToDuplicate,
      id: `ENG-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      clientName: `${engToDuplicate.clientName} (Copy)`,
      status: 'Draft',
      progress: 0
    };
    return { engagements: [duplicated, ...state.engagements] };
  }),

  archiveEngagement: (id) => set((state) => ({
    engagements: state.engagements.map((eng) => 
      eng.id === id ? { ...eng, status: 'Archived' } : eng
    )
  })),

  openEngagement: (id) => set({ activeEngagementId: id }),
  
  auditLogs: [
    {
      id: 'AL-001',
      engagementId: 'ENG-2025-DEMO',
      user: 'System',
      timestamp: new Date().toISOString(),
      action: 'Created',
      module: 'Engagement',
      record: 'PT Contoh Indonesia',
      newValue: 'Draft'
    }
  ],
  
  addAuditLog: (log) => set((state) => ({
    auditLogs: [
      {
        ...log,
        id: `AL-${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      ...state.auditLogs
    ]
  })),

  attachments: [
    {
      id: 'ATT-1',
      engagementId: 'ENG-2025-DEMO',
      worksheetId: 'A.110',
      fileName: 'Draft_Laporan_Keuangan_2025.pdf',
      fileType: 'pdf',
      size: 2450000,
      uploadedBy: 'Andi Auditor',
      uploadedDate: '2025-10-15T09:30:00Z',
      description: 'Laporan Keuangan Unaudited dari Klien'
    }
  ],

  addAttachment: (attachment) => set((state) => ({
    attachments: [
      ...state.attachments,
      {
        ...attachment,
        id: `ATT-${Date.now()}`,
        uploadedDate: new Date().toISOString()
      }
    ]
  })),

  removeAttachment: (id) => set((state) => ({
    attachments: state.attachments.filter(a => a.id !== id)
  })),

  reviewNotes: [
    {
      id: 'RN-1',
      engagementId: 'ENG-2025-DEMO',
      worksheetId: 'A.110',
      reviewer: 'Siti Manager, CA',
      date: '2025-10-16T14:00:00Z',
      comment: 'Tolong pastikan susunan direksi terbaru sudah dilampirkan bukti RUPS-nya.',
      status: 'Open'
    },
    {
      id: 'RN-2',
      engagementId: 'ENG-2025-DEMO',
      worksheetId: 'A.210',
      reviewer: 'Budi Partner, CPA',
      date: '2025-10-20T10:15:00Z',
      comment: 'Benchmark materialitas menggunakan Total Aset sudah tepat.',
      status: 'Closed',
      resolution: 'Telah disetujui.',
      resolvedBy: 'Siti Manager, CA',
      resolvedDate: '2025-10-21T09:00:00Z'
    }
  ],

  notifications: [
    {
      id: 'n1',
      type: 'assignment',
      title: 'Worksheet Assigned',
      message: 'Anda ditugaskan untuk melengkapi A.240 Inherent Risk.',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      link: '/workspace/ENG-2023-001/worksheet/a240'
    },
    {
      id: 'n2',
      type: 'revision',
      title: 'Revision Requested',
      message: 'Manager Budi S. meminta revisi pada modul B.140 TOC.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false,
      link: '/workspace/ENG-2023-001/worksheet/b140'
    },
    {
      id: 'n3',
      type: 'review_complete',
      title: 'Review Completed',
      message: 'Kertas Kerja B.210 Kas telah disetujui.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
      link: '/workspace/ENG-2023-001/worksheet/b210'
    },
    {
      id: 'n4',
      type: 'overdue',
      title: 'Overdue Task',
      message: 'C.530 Draft Laporan telah melewati tenggat waktu.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      isRead: false,
      link: '/workspace/ENG-2023-001/worksheet/c530'
    }
  ],

  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
  })),

  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  }))
}));
