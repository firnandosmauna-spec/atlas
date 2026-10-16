import { supabase } from '../lib/supabaseClient';
import type { PmpjClientRegister, PmpjTransactionMonitoring } from '../types/pmpj';

const STORAGE_KEY_REGISTERS = 'atlas_pmpj_registers';
const STORAGE_KEY_MONITORING = 'atlas_pmpj_monitoring';

/**
 * Fetch all PMPJ registers from Supabase
 */
export const fetchCloudPmpjRegisters = async (): Promise<PmpjClientRegister[] | null> => {
  try {
    const { data, error } = await supabase
      .from('pmpj_registers')
      .select('id, data, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('[PMPJ Sync] Fetch registers notice:', error.message);
      return null;
    }

    if (!data) return [];
    return data
      .map((row: any) => row.data as PmpjClientRegister)
      .filter(Boolean);
  } catch (err: any) {
    console.warn('[PMPJ Sync] Fetch registers error:', err?.message || err);
    return null;
  }
};

/**
 * Upsert a single PMPJ register to Supabase
 */
export const upsertCloudPmpjRegister = async (record: PmpjClientRegister): Promise<boolean> => {
  if (!record || !record.id) return false;

  try {
    const payload = {
      id: record.id,
      client_id: record.clientId,
      engagement_id: record.engagementId,
      client_name: record.clientName || 'Unnamed Client',
      user_type: record.userType,
      service_type: record.serviceType,
      is_pmpj_active: Boolean(record.isPmpjActive),
      cdd_status: record.cddStatus,
      internal_risk: record.internalRisk,
      acceptance_decision: record.acceptanceDecision,
      reviewer: record.reviewer,
      data: record,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('pmpj_registers')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[PMPJ Sync] Upsert register error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[PMPJ Sync] Upsert register exception:', err?.message || err);
    return false;
  }
};

/**
 * Delete a PMPJ register from Supabase
 */
export const deleteCloudPmpjRegister = async (id: string): Promise<boolean> => {
  if (!id) return false;
  try {
    const { error } = await supabase
      .from('pmpj_registers')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[PMPJ Sync] Delete register notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[PMPJ Sync] Delete register exception:', err?.message || err);
    return false;
  }
};

/**
 * Fetch all PMPJ transaction monitoring records from Supabase
 */
export const fetchCloudPmpjMonitoring = async (): Promise<PmpjTransactionMonitoring[] | null> => {
  try {
    const { data, error } = await supabase
      .from('pmpj_monitoring')
      .select('id, data, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('[PMPJ Sync] Fetch monitoring notice:', error.message);
      return null;
    }

    if (!data) return [];
    return data
      .map((row: any) => row.data as PmpjTransactionMonitoring)
      .filter(Boolean);
  } catch (err: any) {
    console.warn('[PMPJ Sync] Fetch monitoring error:', err?.message || err);
    return null;
  }
};

/**
 * Upsert a transaction monitoring record to Supabase
 */
export const upsertCloudPmpjMonitoring = async (record: PmpjTransactionMonitoring): Promise<boolean> => {
  if (!record || !record.id) return false;

  try {
    const payload = {
      id: record.id,
      monitoring_id: record.monitoringId,
      client_id: record.clientId,
      client_name: record.clientName || 'Unnamed Client',
      date: record.date,
      amount: record.amount,
      is_suspicious: Boolean(record.isSuspicious),
      alert_menular: record.alertMenular,
      follow_up_status: record.followUpStatus,
      reviewer: record.reviewer,
      data: record,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('pmpj_monitoring')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[PMPJ Sync] Upsert monitoring error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[PMPJ Sync] Upsert monitoring exception:', err?.message || err);
    return false;
  }
};

/**
 * Delete a transaction monitoring record from Supabase
 */
export const deleteCloudPmpjMonitoring = async (id: string): Promise<boolean> => {
  if (!id) return false;
  try {
    const { error } = await supabase
      .from('pmpj_monitoring')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[PMPJ Sync] Delete monitoring notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[PMPJ Sync] Delete monitoring exception:', err?.message || err);
    return false;
  }
};

/**
 * Synchronize both Registers and Monitoring between localStorage and Supabase
 */
export const syncPmpjBidirectional = async (
  localRegisters: PmpjClientRegister[],
  localMonitoring: PmpjTransactionMonitoring[]
): Promise<{
  registers: PmpjClientRegister[];
  monitoring: PmpjTransactionMonitoring[];
  syncedWithCloud: boolean;
}> => {
  let finalRegisters = [...localRegisters];
  let finalMonitoring = [...localMonitoring];
  let syncedWithCloud = false;

  // 1. Sync Registers
  const cloudRegs = await fetchCloudPmpjRegisters();
  if (cloudRegs !== null) {
    syncedWithCloud = true;
    const mergedMap = new Map<string, PmpjClientRegister>();
    // First fill with local
    finalRegisters.forEach(r => mergedMap.set(r.id, r));
    // Overwrite/add with cloud
    cloudRegs.forEach(r => mergedMap.set(r.id, r));
    finalRegisters = Array.from(mergedMap.values());

    // Upload any local items not yet in cloud
    for (const localItem of localRegisters) {
      if (!cloudRegs.some(c => c.id === localItem.id)) {
        await upsertCloudPmpjRegister(localItem);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY_REGISTERS, JSON.stringify(finalRegisters));
    } catch (e) {
      // ignore localStorage quota error
    }
  }

  // 2. Sync Monitoring
  const cloudMon = await fetchCloudPmpjMonitoring();
  if (cloudMon !== null) {
    syncedWithCloud = true;
    const mergedMonMap = new Map<string, PmpjTransactionMonitoring>();
    finalMonitoring.forEach(m => mergedMonMap.set(m.id, m));
    cloudMon.forEach(m => mergedMonMap.set(m.id, m));
    finalMonitoring = Array.from(mergedMonMap.values());

    // Upload any local items not yet in cloud
    for (const localMon of localMonitoring) {
      if (!cloudMon.some(c => c.id === localMon.id)) {
        await upsertCloudPmpjMonitoring(localMon);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY_MONITORING, JSON.stringify(finalMonitoring));
    } catch (e) {
      // ignore
    }
  }

  return {
    registers: finalRegisters,
    monitoring: finalMonitoring,
    syncedWithCloud
  };
};
