import { supabase } from '../lib/supabaseClient';
import type { Engagement } from '../store/engagementStore';

export interface CloudSyncResult {
  success: boolean;
  engagements: Engagement[];
  message?: string;
  error?: string;
}

/**
 * Fetch all engagements stored in Supabase atlas_engagements table.
 */
export const fetchCloudEngagements = async (): Promise<Engagement[] | null> => {
  try {
    const { data, error } = await supabase
      .from('atlas_engagements')
      .select('id, data, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Fetch cloud engagements notice:', error.message);
      return null;
    }

    if (!data) return [];

    return data
      .map((row: any) => {
        if (row.data) {
          return {
            ...row.data,
            id: row.id || row.data.id,
          } as Engagement;
        }
        return null;
      })
      .filter((e): e is Engagement => Boolean(e));
  } catch (err: any) {
    console.warn('Cloud engagement fetch error (offline / fallback to local):', err?.message || err);
    return null;
  }
};

/**
 * Upsert a single engagement to Supabase atlas_engagements.
 */
export const upsertCloudEngagement = async (engagement: Engagement): Promise<boolean> => {
  if (!engagement || !engagement.id) return false;
  unmarkEngagementAsDeleted(engagement.id);

  try {
    const payload = {
      id: engagement.id,
      client_name: engagement.clientName || 'Unnamed Client',
      fiscal_year: engagement.fiscalYear || new Date().getFullYear().toString(),
      engagement_type: engagement.engagementType || 'First Year',
      status: engagement.status || 'Draft',
      progress: typeof engagement.progress === 'number' ? engagement.progress : 0,
      data: engagement,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('atlas_engagements')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[CloudSync] Upsert error to Supabase:', error.message, error);
      return false;
    }

    console.log(`[CloudSync] Berhasil tersimpan di Supabase Cloud: ${engagement.id} (${engagement.clientName})`);
    return true;
  } catch (err: any) {
    console.error('[CloudSync] Upsert exception:', err?.message || err);
    return false;
  }
};

const DELETED_ENGAGEMENTS_KEY = 'atlas_deleted_engagements';

export const getDeletedEngagementIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_ENGAGEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const markEngagementAsDeleted = (id: string): void => {
  if (!id) return;
  try {
    const ids = getDeletedEngagementIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(DELETED_ENGAGEMENTS_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.warn('[CloudSync] Failed to mark engagement as deleted in storage:', err);
  }
};

export const unmarkEngagementAsDeleted = (id: string): void => {
  if (!id) return;
  try {
    const ids = getDeletedEngagementIds().filter(i => i !== id);
    localStorage.setItem(DELETED_ENGAGEMENTS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('[CloudSync] Failed to unmark engagement from deleted in storage:', err);
  }
};

/**
 * Delete an engagement from Supabase atlas_engagements.
 */
export const deleteCloudEngagement = async (id: string): Promise<boolean> => {
  if (!id) return false;
  markEngagementAsDeleted(id);

  try {
    const { error } = await supabase
      .from('atlas_engagements')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[CloudSync] Delete notice:', error.message);
      return false;
    }

    console.log(`[CloudSync] Berhasil menghapus dari Supabase Cloud: ${id}`);
    return true;
  } catch (err: any) {
    console.warn('[CloudSync] Delete error:', err?.message || err);
    return false;
  }
};

/**
 * Bidirectional sync between local store and Supabase cloud.
 * 1. Checks memory list AND direct localStorage cache.
 * 2. Pulls cloud engagements from Supabase.
 * 3. Uploads all local engagements missing from cloud.
 * 4. Returns the merged list of engagements.
 */
export const syncEngagementsBidirectional = async (
  localEngagements: Engagement[]
): Promise<CloudSyncResult> => {
  const deletedIds = getDeletedEngagementIds();

  // 1. Gather all local engagements from memory and localStorage fallback (excluding tombstoned items)
  const localList: Engagement[] = [...(localEngagements || [])].filter(e => !deletedIds.includes(e.id));
  
  try {
    const rawLocal = localStorage.getItem('atlas_engagements_store');
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      const storedList = parsed?.state?.engagements;
      if (Array.isArray(storedList)) {
        for (const item of storedList) {
          if (item && item.id && !deletedIds.includes(item.id) && !localList.some(l => l.id === item.id)) {
            localList.push(item);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Error reading local storage during sync:', err);
  }

  // 2. Fetch cloud engagements
  const cloudEngs = await fetchCloudEngagements();

  // If cloud table is not reachable (e.g. table not created yet or network offline)
  if (cloudEngs === null) {
    return {
      success: false,
      engagements: localList,
      error: 'Tabel Supabase belum dibuat atau koneksi offline. Menjalankan mode offline.',
    };
  }

  // 3. Map cloud engagements by ID (filtering out any deleted ones and triggering cleanup)
  const map = new Map<string, Engagement>();
  const lingeringDeletes: Promise<boolean>[] = [];

  for (const eng of cloudEngs) {
    if (!eng.id) continue;
    if (deletedIds.includes(eng.id)) {
      lingeringDeletes.push(deleteCloudEngagement(eng.id));
      continue;
    }
    map.set(eng.id, eng);
  }

  if (lingeringDeletes.length > 0) {
    Promise.allSettled(lingeringDeletes).catch(() => {});
  }

  // 4. Push any local engagement not yet present in cloud
  const pushPromises: Promise<boolean>[] = [];
  for (const localEng of localList) {
    if (!localEng.id) continue;
    if (!map.has(localEng.id)) {
      map.set(localEng.id, localEng);
      pushPromises.push(upsertCloudEngagement(localEng));
    }
  }

  if (pushPromises.length > 0) {
    console.log(`[CloudSync] Mengunggah ${pushPromises.length} perikatan lokal ke Supabase...`);
    await Promise.allSettled(pushPromises);
  }

  const merged = Array.from(map.values());
  return {
    success: true,
    engagements: merged,
    message: `Sinkronisasi selesai. ${merged.length} perikatan aktif.`,
  };
};
