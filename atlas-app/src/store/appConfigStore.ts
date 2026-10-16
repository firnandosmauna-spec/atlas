import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppConfigState {
  appName: string;
  appShortName: string;
  tagline: string;
  institutionName: string;
  version: string;
}

interface AppConfigActions {
  setAppName: (name: string) => void;
  setAppShortName: (shortName: string) => void;
  setTagline: (tagline: string) => void;
  setInstitutionName: (institutionName: string) => void;
  updateConfig: (config: Partial<AppConfigState>) => void;
  resetConfig: () => void;
}

export type AppConfigStore = AppConfigState & AppConfigActions;

export const DEFAULT_APP_CONFIG: AppConfigState = {
  appName: 'AUDIT FLOW',
  appShortName: 'KAP Frido',
  tagline: 'Audit Tool & Linked Archive System - KAP Fridolinus Peno',
  institutionName: 'KAP Fridolinus Peno',
  version: '1.0.0'
};

export const useAppConfigStore = create<AppConfigStore>()(
  persist(
    (set) => ({
      ...DEFAULT_APP_CONFIG,
      setAppName: (appName: string) => set({ appName }),
      setAppShortName: (appShortName: string) => set({ appShortName }),
      setTagline: (tagline: string) => set({ tagline }),
      setInstitutionName: (institutionName: string) => set({ institutionName }),
      updateConfig: (config: Partial<AppConfigState>) =>
        set((state) => ({ ...state, ...config })),
      resetConfig: () => set(DEFAULT_APP_CONFIG)
    }),
    {
      name: 'atlas_app_config',
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState) return DEFAULT_APP_CONFIG;
        return {
          ...DEFAULT_APP_CONFIG,
          ...persistedState,
          appName: persistedState.appName === 'ATLAS' || !persistedState.appName ? 'AUDIT FLOW' : persistedState.appName,
          appShortName: persistedState.appShortName === 'ATLAS' || !persistedState.appShortName ? 'KAP Frido' : persistedState.appShortName
        };
      }
    }
  )
);
