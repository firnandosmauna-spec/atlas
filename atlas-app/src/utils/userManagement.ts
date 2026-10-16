import { SYSTEM_ROLES, type SystemRoleName } from '../constants/roles';
import { supabase } from '../lib/supabaseClient';

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  role_id: string | null;
  role_name?: string;
  password?: string;
  is_active?: boolean;
  isSyncedWithCloud?: boolean;
  roles?: {
    name: string;
  };
}

export const STORAGE_KEY_ADMIN_USERS = 'atlas_admin_users_list';
export const STORAGE_KEY_USER_ROLES = 'atlas_user_roles_map';

export const DEFAULT_INITIAL_USERS: UserData[] = [
  {
    id: '148b975e-2e29-4101-a6d3-b19b3e3847fd',
    email: 'admin@kap.com',
    full_name: 'Ahmad Partner AP',
    role_id: '11111111-1111-1111-1111-111111111101',
    password: 'password123',
    roles: { name: 'Admin' }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'partner@kap.com',
    full_name: 'Drs. Fridolinus Peno, Ak., M.M., CA., CPA.',
    role_id: '11111111-1111-1111-1111-111111111102',
    password: 'Audit2026!',
    roles: { name: 'Partner/Akuntan Publik' }
  },
  {
    id: '49cfea98-0d37-4ed7-a859-19edf1ddc0e1',
    email: 'auditor@kap.com',
    full_name: 'Nando Manager, S.E., M.Ak.',
    role_id: '11111111-1111-1111-1111-111111111103',
    password: 'Audit2026!',
    roles: { name: 'Manager' }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    email: 'supervisor@kap.com',
    full_name: 'Bambang Supervisor, S.E., Ak.',
    role_id: '11111111-1111-1111-1111-111111111104',
    password: 'Audit2026!',
    roles: { name: 'Supervisor' }
  },
  {
    id: 'c9027978-43fd-43fb-aa79-c8e92237c872',
    email: 'dwisafitriana99@gmail.com',
    full_name: 'Dwi Safitriana (Auditor Atlas)',
    role_id: '11111111-1111-1111-1111-111111111105',
    password: 'dwisafitriana',
    roles: { name: 'Ketua Tim' }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    email: 'rudi.substantif@kap.com',
    full_name: 'Rudi Substantif, S.Ak.',
    role_id: '11111111-1111-1111-1111-111111111106',
    password: 'Audit2026!',
    roles: { name: 'Anggota Tim 1' }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    email: 'siti.rahma@kap.com',
    full_name: 'Siti Rahma, S.E., M.Ak.',
    role_id: '11111111-1111-1111-1111-111111111107',
    password: 'Audit2026!',
    roles: { name: 'Anggota Tim 2' }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    email: 'budi.pratama@kap.com',
    full_name: 'Budi Pratama, S.E.',
    role_id: '11111111-1111-1111-1111-111111111108',
    password: 'Audit2026!',
    roles: { name: 'Anggota Tim dst' }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000009',
    email: 'hendra.support@kap.com',
    full_name: 'Hendra IT Specialist',
    role_id: '11111111-1111-1111-1111-111111111109',
    password: 'Audit2026!',
    roles: { name: 'Tenaga Pendukung' }
  }
];

/**
 * Synchronous fetch from localStorage to ensure instant rendering with zero delay.
 * Automatically seeds default master users if storage is empty, and merges any missing roles.
 */
export const getSynchronizedKAPUsersSync = (): UserData[] => {
  let cachedUsers: UserData[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_USERS);
    if (raw) {
      cachedUsers = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading localStorage admin users', e);
  }

  let rolesMap: Record<string, string> = {};
  try {
    const rawRoles = localStorage.getItem(STORAGE_KEY_USER_ROLES);
    if (rawRoles) {
      rolesMap = JSON.parse(rawRoles);
    }
  } catch (e) {
    console.error('Error reading localStorage roles map', e);
  }

  // If no cached users found, seed with default initial users
  if (!cachedUsers || cachedUsers.length === 0) {
    cachedUsers = [...DEFAULT_INITIAL_USERS];
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(cachedUsers));
    } catch (e) {
      console.error('Error saving initial users to localStorage', e);
    }
  } else {
    // If cache exists but misses any of the 9 roles, merge missing defaults
    const missingRoles = DEFAULT_INITIAL_USERS.filter(def => 
      !cachedUsers.some(u => u.roles?.name === def.roles?.name || (u.email && def.email && u.email.toLowerCase() === def.email.toLowerCase()))
    );
    if (missingRoles.length > 0) {
      cachedUsers = [...cachedUsers, ...missingRoles];
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(cachedUsers));
      } catch (e) {
        console.error('Error merging missing role users to localStorage', e);
      }
    }
  }

  // Normalize role assignments based on rolesMap and SYSTEM_ROLES
  return cachedUsers.map(user => {
    const assignedRole = rolesMap[user.id] || (user.email ? rolesMap[user.email.toLowerCase()] : undefined);
    if (assignedRole) {
      const match = SYSTEM_ROLES.find(r => r.name === assignedRole);
      return {
        ...user,
        role_id: match ? match.id : user.role_id,
        roles: { name: assignedRole }
      };
    }
    // Ensure role name matches one of the 9 SYSTEM_ROLES if possible
    const currentRoleName = user.roles?.name || '';
    const match = SYSTEM_ROLES.find(r => r.name === currentRoleName || r.id === user.role_id);
    if (match) {
      return {
        ...user,
        role_id: match.id,
        roles: { name: match.name }
      };
    }
    return user;
  });
};

/**
 * Asynchronous fetch that queries Supabase while using local cache as priority fallback.
 */
export const getSynchronizedKAPUsers = async (): Promise<UserData[]> => {
  const localUsers = getSynchronizedKAPUsersSync();
  
  try {
    const { data: dbUsers, error } = await supabase
      .from('users')
      .select('id, email, full_name, role_id, roles (name)');

    if (!error && dbUsers && dbUsers.length > 0) {
      // Merge with db users (local users take priority for name/role edits)
      const merged = [...localUsers];
      for (const dbu of dbUsers as UserData[]) {
        if (!merged.some(u => u.id === dbu.id || (u.email && dbu.email && u.email.toLowerCase() === dbu.email.toLowerCase()))) {
          merged.push(dbu);
        }
      }
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(merged));
      } catch (e) {
        console.error('Error saving merged users to localStorage', e);
      }
      return merged;
    }
  } catch (err) {
    console.warn('Supabase fetch notice (using synchronized local KAP users):', err);
  }

  return localUsers;
};

/**
 * Synchronizes all users and master roles into Supabase database.
 * Returns the number of successful syncs and any errors.
 */
export const syncAllUsersToSupabase = async (usersToSync: UserData[]): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> => {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  // 1. Try to seed roles if not already present
  try {
    const rolePayload = SYSTEM_ROLES.map(r => ({ id: r.id, name: r.name }));
    await supabase.from('roles').upsert(rolePayload, { onConflict: 'id' });
  } catch (rErr) {
    console.warn('Roles upsert notice:', rErr);
  }

  // 2. Fetch existing users from Supabase to match by email or id
  let existingDbUsers: any[] = [];
  try {
    const { data, error } = await supabase.from('users').select('id, email, full_name, role_id');
    if (!error && data) {
      existingDbUsers = data;
    }
  } catch (err) {
    console.warn('Error querying existing users:', err);
  }

  // 3. Upsert / update each user
  for (const u of usersToSync) {
    const matchedRole = SYSTEM_ROLES.find(r => r.name === u.roles?.name || r.id === u.role_id);
    const roleId = matchedRole ? matchedRole.id : u.role_id;
    const dbMatch = existingDbUsers.find(d => 
      (u.email && d.email && d.email.toLowerCase() === u.email.toLowerCase()) || 
      d.id === u.id
    );

    try {
      if (dbMatch) {
        // Update existing row
        const { error: updErr } = await supabase
          .from('users')
          .update({
            full_name: u.full_name,
            role_id: roleId,
            is_active: true
          })
          .eq('id', dbMatch.id);

        if (updErr) {
          failed++;
          errors.push(`${u.email || u.full_name}: ${updErr.message}`);
        } else {
          success++;
        }
      } else {
        // Insert new row
        const { error: insErr } = await supabase
          .from('users')
          .insert({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role_id: roleId,
            is_active: true
          });

        if (insErr) {
          failed++;
          errors.push(`${u.email || u.full_name}: ${insErr.message}`);
        } else {
          success++;
        }
      }
    } catch (err: any) {
      failed++;
      errors.push(`${u.email || u.full_name}: ${err?.message || 'Gagal tersambung'}`);
    }
  }

  return { success, failed, errors };
};

// --- Role filtering utilities based on the 9 KAP SPAP Roles ---

export const getPartners = (users: UserData[]): UserData[] => {
  return users.filter(u => {
    const r = u.roles?.name;
    return r === 'Partner/Akuntan Publik' || r === 'Admin' || r === 'Partner';
  });
};

export const getManagers = (users: UserData[]): UserData[] => {
  return users.filter(u => {
    const r = u.roles?.name;
    return r === 'Manager';
  });
};

export const getSupervisors = (users: UserData[]): UserData[] => {
  return users.filter(u => {
    const r = u.roles?.name;
    return r === 'Supervisor';
  });
};

export const getManagersAndSupervisors = (users: UserData[]): UserData[] => {
  return users.filter(u => {
    const r = u.roles?.name;
    return r === 'Manager' || r === 'Supervisor';
  });
};

export const getLeadAuditors = (users: UserData[]): UserData[] => {
  return users.filter(u => {
    const r = u.roles?.name;
    return r === 'Ketua Tim';
  });
};

export const getFieldAuditorsAndSupport = (users: UserData[]): UserData[] => {
  return users.filter(u => {
    const r = u.roles?.name;
    return (
      r === 'Anggota Tim 1' ||
      r === 'Anggota Tim 2' ||
      r === 'Anggota Tim dst' ||
      r === 'Tenaga Pendukung' ||
      r === 'Ketua Tim'
    );
  });
};

export const getAdditionalTeamMembers = (users: UserData[]): UserData[] => {
  return users.filter(u => {
    const r = u.roles?.name;
    return (
      r === 'Anggota Tim 1' ||
      r === 'Anggota Tim 2' ||
      r === 'Anggota Tim dst' ||
      r === 'Tenaga Pendukung'
    );
  });
};
