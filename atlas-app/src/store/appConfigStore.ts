import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';

export interface AppConfigState {
  appName: string;
  appShortName: string;
  tagline: string;
  institutionName: string;
  version: string;
  isSyncedWithCloud?: boolean;
}

interface AppConfigActions {
  setAppName: (name: string) => void;
  setAppShortName: (shortName: string) => void;
  setTagline: (tagline: string) => void;
  setInstitutionName: (institutionName: string) => void;
  updateConfig: (config: Partial<AppConfigState>) => void;
  resetConfig: () => Promise<void>;
  fetchFromSupabase: () => Promise<void>;
  saveToSupabase: (config: Partial<AppConfigState>) => Promise<boolean>;
}

export type AppConfigStore = AppConfigState & AppConfigActions;

export const DEFAULT_APP_CONFIG: AppConfigState = {
  appName: 'AUDIT FLOW',
  appShortName: 'KAP Frido',
  tagline: 'Audit Tool & Linked Archive System - KAP Fridolinus Peno',
  institutionName: 'KAP Fridolinus Peno',
  version: '1.0.0',
  isSyncedWithCloud: false
};

export const useAppConfigStore = create<AppConfigStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_APP_CONFIG,
      setAppName: (appName: string) => set({ appName }),
      setAppShortName: (appShortName: string) => set({ appShortName }),
      setTagline: (tagline: string) => set({ tagline }),
      setInstitutionName: (institutionName: string) => set({ institutionName }),
      updateConfig: (config: Partial<AppConfigState>) =>
        set((state) => ({ ...state, ...config })),

      fetchFromSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('system_settings')
            .select('app_name, app_short_name, tagline, institution_name, version')
            .eq('id', 'default')
            .maybeSingle();

          if (data && !error) {
            set({
              appName: data.app_name || DEFAULT_APP_CONFIG.appName,
              appShortName: data.app_short_name || DEFAULT_APP_CONFIG.appShortName,
              tagline: data.tagline || DEFAULT_APP_CONFIG.tagline,
              institutionName: data.institution_name || DEFAULT_APP_CONFIG.institutionName,
              version: data.version || DEFAULT_APP_CONFIG.version,
              isSyncedWithCloud: true
            });
          }
        } catch (err) {
          console.warn('Notice loading system_settings from Supabase:', err);
        }
      },

      saveToSupabase: async (newConfig: Partial<AppConfigState>) => {
        const current = get();
        const merged = { ...current, ...newConfig };
        set(merged);

        try {
          const { error } = await supabase
            .from('system_settings')
            .upsert({
              id: 'default',
              app_name: merged.appName,
              app_short_name: merged.appShortName,
              tagline: merged.tagline,
              institution_name: merged.institutionName,
              version: merged.version,
              updated_at: new Date().toISOString()
            });

          if (!error) {
            set({ isSyncedWithCloud: true });
            return true;
          } else {
            console.warn('Supabase system_settings save notice:', error.message);
            return false;
          }
        } catch (err) {
          console.warn('Supabase system_settings save error:', err);
          return false;
        }
      },

      resetConfig: async () => {
        set({ ...DEFAULT_APP_CONFIG });
        try {
          await supabase.from('system_settings').upsert({
            id: 'default',
            app_name: DEFAULT_APP_CONFIG.appName,
            app_short_name: DEFAULT_APP_CONFIG.appShortName,
            tagline: DEFAULT_APP_CONFIG.tagline,
            institution_name: DEFAULT_APP_CONFIG.institutionName,
            version: DEFAULT_APP_CONFIG.version,
            updated_at: new Date().toISOString()
          });
          set({ isSyncedWithCloud: true });
        } catch (err) {
          console.warn('Reset config supabase notice:', err);
        }
      }
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
