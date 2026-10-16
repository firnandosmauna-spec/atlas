import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

import type { SystemRoleName } from '../constants/roles';

export type Role = 
  | SystemRoleName
  // Legacy aliases for backward compatibility:
  | 'Partner' 
  | 'Auditor' 
  | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  noAp?: string;
  noIndukKap?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  initialize: () => Promise<void>;
}

// Permissions mapped by role
const rolePermissions: Record<Role, string[]> = {
  'Admin': [
    'create_engagement',
    'delete_engagement',
    'manage_users',
    'manage_roles',
    'manage_organizations',
    'view_all_engagements',
    'manage_app_config'
  ],
  'Partner/Akuntan Publik': [
    'create_engagement',
    'delete_engagement',
    'view_assigned_engagements',
    'perform_review',
    'give_approval',
    'view_audit_status',
    'view_final_report',
    'sign_audit_report'
  ],
  'Partner': [
    'create_engagement',
    'delete_engagement',
    'view_assigned_engagements',
    'perform_review',
    'give_approval',
    'view_audit_status',
    'view_final_report',
    'sign_audit_report'
  ],
  'Manager': [
    'view_assigned_engagements',
    'review_auditor_work',
    'give_review_notes',
    'request_revision',
    'give_approval_stage',
    'manage_team_schedule'
  ],
  'Supervisor': [
    'view_assigned_engagements',
    'review_auditor_work',
    'give_review_notes',
    'request_revision',
    'supervise_audit_execution'
  ],
  'Ketua Tim': [
    'create_engagement',
    'delete_engagement',
    'fill_worksheet',
    'upload_evidence',
    'perform_risk_assessment',
    'execute_audit_procedure',
    'fill_working_paper',
    'give_review_notes'
  ],
  'Anggota Tim 1': [
    'fill_worksheet',
    'upload_evidence',
    'perform_risk_assessment',
    'execute_audit_procedure',
    'fill_working_paper'
  ],
  'Anggota Tim 2': [
    'fill_worksheet',
    'upload_evidence',
    'perform_risk_assessment',
    'execute_audit_procedure',
    'fill_working_paper'
  ],
  'Anggota Tim dst': [
    'fill_worksheet',
    'upload_evidence',
    'execute_audit_procedure',
    'fill_working_paper'
  ],
  'Tenaga Pendukung': [
    'upload_evidence',
    'view_readonly_data',
    'input_basic_data'
  ],
  'Auditor': [
    'create_engagement',
    'delete_engagement',
    'fill_worksheet',
    'upload_evidence',
    'perform_risk_assessment',
    'execute_audit_procedure',
    'fill_working_paper'
  ],
  'Viewer': [
    'view_readonly_data'
  ]
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return rolePermissions[user.role]?.includes(permission) || false;
  },
  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch custom user data
        const { data: userData } = await supabase
          .from('users')
          .select('id, email, full_name, no_ap, no_induk_kap, phone, roles (name)')
          .eq('id', session.user.id)
          .maybeSingle();
          
        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: userData?.full_name || 'User',
            role: (userData?.roles?.name as any) || 'Auditor',
            organizationId: 'kap-123',
            noAp: userData?.no_ap || '',
            noIndukKap: userData?.no_induk_kap || '',
            phone: userData?.phone || ''
          },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, full_name, no_ap, no_induk_kap, phone, roles (name)')
            .eq('id', session.user.id)
            .maybeSingle();
            
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: userData?.full_name || 'User',
              role: (userData?.roles?.name as any) || 'Auditor',
              organizationId: 'kap-123',
              noAp: userData?.no_ap || '',
              noIndukKap: userData?.no_induk_kap || '',
              phone: userData?.phone || ''
            },
            isAuthenticated: true
          });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, isAuthenticated: false });
        }
      });
      
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
