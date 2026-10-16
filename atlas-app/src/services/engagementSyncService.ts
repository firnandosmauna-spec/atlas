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
      console.warn('Cloud engagement upsert notice:', error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn('Cloud engagement upsert error:', err?.message || err);
    return false;
  }
};

/**
 * Delete an engagement from Supabase atlas_engagements.
 */
export const deleteCloudEngagement = async (id: string): Promise<boolean> => {
  if (!id) return false;

  try {
    const { error } = await supabase
      .from('atlas_engagements')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Cloud engagement delete notice:', error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn('Cloud engagement delete error:', err?.message || err);
    return false;
  }
};

/**
 * Bidirectional sync between local store and Supabase cloud.
 * 1. Pulls cloud engagements.
 * 2. Uploads any local engagements not yet in cloud.
 * 3. Returns the merged list of engagements.
 */
export const syncEngagementsBidirectional = async (
  localEngagements: Engagement[]
): Promise<CloudSyncResult> => {
  const cloudEngs = await fetchCloudEngagements();

  // If cloud table is not reachable (e.g. table not created yet or network offline)
  if (cloudEngs === null) {
    return {
      success: false,
      engagements: localEngagements,
      error: 'Tabel Supabase belum dibuat atau koneksi offline. Menjalankan mode offline.',
    };
  }

  // Map cloud engagements by ID
  const map = new Map<string, Engagement>();
  for (const eng of cloudEngs) {
    if (eng.id) map.set(eng.id, eng);
  }

  // Check for local engagements not in cloud or newer, and push them
  const pushPromises: Promise<boolean>[] = [];
  for (const localEng of localEngagements) {
    if (!localEng.id) continue;
    if (!map.has(localEng.id)) {
      // Not yet in cloud, push it
      map.set(localEng.id, localEng);
      pushPromises.push(upsertCloudEngagement(localEng));
    }
  }

  if (pushPromises.length > 0) {
    await Promise.allSettled(pushPromises);
  }

  const merged = Array.from(map.values());
  return {
    success: true,
    engagements: merged,
    message: `Sinkronisasi selesai. ${merged.length} perikatan aktif.`,
  };
};
