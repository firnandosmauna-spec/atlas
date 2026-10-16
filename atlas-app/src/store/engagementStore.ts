import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  supervisorId?: string;
  supervisorName?: string;
  auditorId: string;
  auditorName: string;
  teamMembers?: {
    id: string;
    name: string;
    role: string;
    email?: string;
  }[];
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

export const DEFAULT_MASTER_ENGAGEMENTS: Engagement[] = [
  {
    id: 'ENG-2026-001',
    clientId: 'CLI-001',
    clientName: 'PT Kertas Nusantara Sejahtera',
    clientAddress: 'Kawasan Industri MM2100, Blok B-12, Cikarang Barat, Jawa Barat',
    clientIndustry: 'Manufaktur & Pengolahan Kertas',
    auditPeriod: '2025-12-31',
    fiscalYear: '2025-12-31',
    engagementType: 'Recurring',
    accountingStandard: 'SAK_UMUM',
    currency: 'IDR',
    presentationUnit: 'Full',
    partnerId: 'usr-2',
    partnerName: 'Drs. Fridolinus Peno, Ak., M.M., CA., CPA.',
    managerId: 'usr-3',
    managerName: 'Nando Manager, S.E., M.Ak.',
    supervisorId: 'usr-4',
    supervisorName: 'Bambang Supervisor, S.E., Ak.',
    auditorId: 'usr-5',
    auditorName: 'Dwi Safitriana (Auditor Atlas)',
    teamMembers: [
      { id: 'usr-6', name: 'Rudi Substantif, S.Ak.', role: 'Anggota Tim 1', email: 'rudi.substantif@kap.com' },
      { id: 'usr-7', name: 'Siti Rahma, S.E., M.Ak.', role: 'Anggota Tim 2', email: 'siti.rahma@kap.com' }
    ],
    startDate: '2026-01-15',
    targetDate: '2026-04-30',
    status: 'Active',
    progress: 40
  }
];

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set) => ({
      engagements: DEFAULT_MASTER_ENGAGEMENTS,
      activeEngagementId: null,
      auditLogs: [],
      attachments: [],
      notifications: [],
      reviewNotes: [],

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

      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),

      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      }))
    }),
    {
      name: 'atlas_engagements_store',
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState) {
          return { engagements: DEFAULT_MASTER_ENGAGEMENTS, auditLogs: [], attachments: [], notifications: [], reviewNotes: [] };
        }
        const mockIds = ['ENG-2024-001', 'ENG-2025-DEMO', 'ENG-2018-001', 'ENG-2018-002', 'ENG-2018-003', 'ENG-2018-004'];
        const existingEngs = (persistedState.engagements || []).filter((e: any) => !mockIds.includes(e.id));
        return {
          ...persistedState,
          engagements: existingEngs.length > 0 ? existingEngs : DEFAULT_MASTER_ENGAGEMENTS,
          auditLogs: (persistedState.auditLogs || []).filter((l: any) => !mockIds.includes(l.engagementId)),
          attachments: (persistedState.attachments || []).filter((a: any) => !mockIds.includes(a.engagementId)),
          reviewNotes: (persistedState.reviewNotes || []).filter((r: any) => !mockIds.includes(r.engagementId)),
          notifications: (persistedState.notifications || []).filter((n: any) => !n.id?.startsWith('n'))
        };
      }
    }
  )
);
