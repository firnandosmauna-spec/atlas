import { create } from 'zustand';

export interface WorksheetHeaderData {
  code: string;
  name: string;
  purpose?: string;
  status: string;
  reviewer?: string | null;
  lastUpdated?: string;
  saved: boolean;
  activePanel: 'none' | 'evidence' | 'notes' | 'audit_trail';
  unreadNotesCount?: number;
  clientName?: string;
  onSave: () => void;
  onStatusChange: (newStatus: string) => void;
  onTogglePanel: (panel: 'evidence' | 'notes' | 'audit_trail') => void;
  validateCompletion?: () => string[];
}

interface WorksheetHeaderStore {
  headerData: WorksheetHeaderData | null;
  setHeaderData: (data: WorksheetHeaderData | null) => void;
  clearHeaderData: () => void;
}

export const useWorksheetHeaderStore = create<WorksheetHeaderStore>((set) => ({
  headerData: null,
  setHeaderData: (data) =>
    set((state) => {
      if (!data && !state.headerData) return state;
      if (
        data &&
        state.headerData &&
        data.code === state.headerData.code &&
        data.name === state.headerData.name &&
        data.status === state.headerData.status &&
        data.saved === state.headerData.saved &&
        data.activePanel === state.headerData.activePanel &&
        data.unreadNotesCount === state.headerData.unreadNotesCount &&
        data.reviewer === state.headerData.reviewer &&
        data.lastUpdated === state.headerData.lastUpdated &&
        data.purpose === state.headerData.purpose &&
        data.clientName === state.headerData.clientName
      ) {
        // Return existing state to prevent redundant re-renders
        return state;
      }
      return { headerData: data };
    }),
  clearHeaderData: () =>
    set((state) => {
      if (state.headerData === null) return state;
      return { headerData: null };
    }),
}));
