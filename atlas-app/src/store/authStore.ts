import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export type Role = 'Admin' | 'Partner' | 'Manager' | 'Auditor' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
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

// Minimal mock permissions mapped by role
const rolePermissions: Record<Role, string[]> = {
  Admin: [
    'manage_users',
    'manage_roles',
    'manage_organizations',
    'view_all_engagements',
    'manage_app_config'
  ],
  Partner: [
    'view_assigned_engagements',
    'perform_review',
    'give_approval',
    'view_audit_status',
    'view_final_report'
  ],
  Manager: [
    'review_auditor_work',
    'give_review_notes',
    'request_revision',
    'give_approval_stage'
  ],
  Auditor: [
    'create_engagement',
    'fill_worksheet',
    'upload_evidence',
    'perform_risk_assessment',
    'execute_audit_procedure',
    'fill_working_paper'
  ],
  Viewer: [
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
          .select('id, email, full_name, roles (name)')
          .eq('id', session.user.id)
          .maybeSingle();
          
        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: userData?.full_name || 'User',
            role: (userData?.roles?.name as any) || 'Auditor',
            organizationId: 'kap-123'
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
            .select('id, email, full_name, roles (name)')
            .eq('id', session.user.id)
            .maybeSingle();
            
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: userData?.full_name || 'User',
              role: (userData?.roles?.name as any) || 'Auditor',
              organizationId: 'kap-123'
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
