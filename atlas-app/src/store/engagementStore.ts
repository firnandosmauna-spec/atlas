import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  upsertCloudEngagement, 
  deleteCloudEngagement, 
  syncEngagementsBidirectional 
} from '../services/engagementSyncService';

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
  omRationale?: string;
  pmRationale?: string;
  kondisiEntitas?: string;
  useSpecificMateriality?: boolean;
  specificMaterialityAccount?: string;
  specificMaterialityOMMargin?: number;
  specificMaterialityPMMargin?: number;
  specificMaterialityRationale?: string;
  specificMaterialityOM?: number;
  specificMaterialityPM?: number;
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
  isSyncing: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string | null;
  syncError: string | null;
  syncWithCloud: () => Promise<void>;
  addEngagement: (engagement: Engagement) => Promise<void>;
  updateEngagement: (id: string, updatedData: Partial<Engagement>) => Promise<void>;
  duplicateEngagement: (id: string) => Promise<void>;
  archiveEngagement: (id: string) => Promise<void>;
  deleteEngagement: (id: string) => Promise<void>;
  openEngagement: (id: string) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addAttachment: (attachment: Omit<Attachment, 'id' | 'uploadedDate'>) => void;
  removeAttachment: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

export const DEFAULT_MASTER_ENGAGEMENTS: Engagement[] = [];

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set, get) => ({
      engagements: DEFAULT_MASTER_ENGAGEMENTS,
      activeEngagementId: null,
      auditLogs: [],
      attachments: [],
      notifications: [],
      reviewNotes: [],
      isSyncing: false,
      syncStatus: 'idle',
      lastSyncedAt: null,
      syncError: null,

      syncWithCloud: async () => {
        set({ isSyncing: true, syncStatus: 'syncing', syncError: null });
        try {
          const currentEngagements = get().engagements;
          const result = await syncEngagementsBidirectional(currentEngagements);
          if (result.success) {
            set({
              engagements: result.engagements,
              isSyncing: false,
              syncStatus: 'synced',
              lastSyncedAt: new Date().toISOString(),
              syncError: null,
            });
          } else {
            set({
              isSyncing: false,
              syncStatus: 'error',
              syncError: result.error || 'Sinkronisasi cloud gagal',
            });
          }
        } catch (err: any) {
          set({
            isSyncing: false,
            syncStatus: 'error',
            syncError: err?.message || 'Terjadi kesalahan sinkronisasi',
          });
        }
      },

      addEngagement: async (engagement) => {
        set((state) => ({ 
          engagements: [engagement, ...state.engagements] 
        }));
        try {
          const ok = await upsertCloudEngagement(engagement);
          if (ok) {
            set({ syncStatus: 'synced', lastSyncedAt: new Date().toISOString() });
          }
        } catch (e) {
          console.error('[CloudSync] addEngagement sync error:', e);
        }
      },

      updateEngagement: async (id, updatedData) => {
        let updatedItem: Engagement | undefined;
        set((state) => {
          const updatedList = state.engagements.map((eng) => {
            if (eng.id === id) {
              updatedItem = { ...eng, ...updatedData };
              return updatedItem;
            }
            return eng;
          });
          return { engagements: updatedList };
        });
        if (updatedItem) {
          try {
            const ok = await upsertCloudEngagement(updatedItem);
            if (ok) {
              set({ syncStatus: 'synced', lastSyncedAt: new Date().toISOString() });
            }
          } catch (e) {
            console.error('[CloudSync] updateEngagement sync error:', e);
          }
        }
      },

      duplicateEngagement: async (id) => {
        const engToDuplicate = get().engagements.find(e => e.id === id);
        if (!engToDuplicate) return;
        
        const duplicated: Engagement = {
          ...engToDuplicate,
          id: `ENG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          clientName: `${engToDuplicate.clientName} (Copy)`,
          status: 'Draft',
          progress: 0
        };
        set((state) => ({ engagements: [duplicated, ...state.engagements] }));
        try {
          await upsertCloudEngagement(duplicated);
        } catch (e) {
          console.error('[CloudSync] duplicateEngagement error:', e);
        }
      },

      archiveEngagement: async (id) => {
        let archivedItem: Engagement | undefined;
        set((state) => {
          const list = state.engagements.map((eng) => {
            if (eng.id === id) {
              archivedItem = { ...eng, status: 'Archived' as const };
              return archivedItem;
            }
            return eng;
          });
          return { engagements: list };
        });
        if (archivedItem) {
          try {
            await upsertCloudEngagement(archivedItem);
          } catch (e) {
            console.error('[CloudSync] archiveEngagement error:', e);
          }
        }
      },

      deleteEngagement: async (id) => {
        set((state) => ({
          engagements: state.engagements.filter(e => e.id !== id),
          activeEngagementId: state.activeEngagementId === id ? null : state.activeEngagementId,
          auditLogs: state.auditLogs.filter(l => l.engagementId !== id),
          attachments: state.attachments.filter(a => a.engagementId !== id),
          reviewNotes: state.reviewNotes.filter(r => r.engagementId !== id)
        }));
        try {
          await deleteCloudEngagement(id);
        } catch (e) {
          console.error('[CloudSync] deleteEngagement error:', e);
        }
      },

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
      version: 5,
      migrate: (persistedState: any) => {
        if (!persistedState) {
          return { engagements: [], auditLogs: [], attachments: [], notifications: [], reviewNotes: [] };
        }
        const mockIds = [
          'ENG-2024-001', 'ENG-2025-DEMO', 'ENG-2018-001', 'ENG-2018-002', 'ENG-2018-003', 'ENG-2018-004',
          'ENG-2026-618', 'ENG-2026-001'
        ];
        const existingEngs = (persistedState.engagements || [])
          .filter((e: any) => !mockIds.includes(e.id))
          .map((e: any) => {
            if (e.materiality && e.materiality.omPercentage === 1 && e.materiality.pmPercentage === 75 && (!e.materiality.omRationale || e.materiality.omRationale.trim() === '')) {
              const { materiality, ...rest } = e;
              return rest;
            }
            return e;
          });
        return {
          ...persistedState,
          engagements: existingEngs,
          auditLogs: (persistedState.auditLogs || []).filter((l: any) => !mockIds.includes(l.engagementId)),
          attachments: (persistedState.attachments || []).filter((a: any) => !mockIds.includes(a.engagementId)),
          reviewNotes: (persistedState.reviewNotes || []).filter((r: any) => !mockIds.includes(r.engagementId)),
          notifications: (persistedState.notifications || []).filter((n: any) => !n.id?.startsWith('n'))
        };
      }
    }
  )
);
