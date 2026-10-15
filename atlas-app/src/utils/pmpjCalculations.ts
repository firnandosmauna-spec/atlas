import type { PmpjClientRegister, PmpjTransactionMonitoring } from '../types/pmpj';

export function calculatePmkScope(serviceType: string, isForUserInterest: boolean): 'Dalam Ruang Lingkup' | 'Luar Ruang Lingkup' {
  if (!serviceType) return 'Dalam Ruang Lingkup';
  const lower = serviceType.toLowerCase();
  if (lower.includes('pribadi') && !isForUserInterest) {
    return 'Luar Ruang Lingkup';
  }
  return 'Dalam Ruang Lingkup';
}

export function calculateIsPmpjActive(params: {
  pmkScope: 'Dalam Ruang Lingkup' | 'Luar Ruang Lingkup';
  triggerBusinessRelation: boolean;
  triggerLargeTx: boolean;
  triggerSuspiciousTx: boolean;
  triggerDoubtfulInfo: boolean;
}): boolean {
  return (
    params.pmkScope === 'Dalam Ruang Lingkup' ||
    params.triggerBusinessRelation ||
    params.triggerLargeTx ||
    params.triggerSuspiciousTx ||
    params.triggerDoubtfulInfo
  );
}

export function calculateCddStatus(params: {
  legalIdentity: string;
  fundSource: string;
  txPurpose: string;
  docStatus: 'Lengkap' | 'Kurang' | 'Dalam Proses';
  isDirectMeeting: boolean;
  internalRisk: 'Rendah' | 'Sedang' | 'Tinggi';
}): 'Lengkap' | 'Belum Lengkap' | 'Sederhana' | 'Ditingkatkan (EDD)' {
  if (!params.legalIdentity || !params.fundSource || !params.txPurpose || params.docStatus === 'Kurang') {
    return 'Belum Lengkap';
  }
  if (params.internalRisk === 'Tinggi' || !params.isDirectMeeting) {
    return 'Ditingkatkan (EDD)';
  }
  if (params.internalRisk === 'Rendah' && params.isDirectMeeting && params.docStatus === 'Lengkap') {
    return 'Sederhana';
  }
  return 'Lengkap';
}

export function calculateRetentionUntil(relationEndDate: string): string {
  if (!relationEndDate) return '-';
  try {
    const parts = relationEndDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      if (!isNaN(year)) {
        return `${year + 5}-${parts[1]}-${parts[2]}`;
      }
    }
  } catch {
    // fallback
  }
  return '-';
}

export function calculateAlertMenular(tx: {
  amount: number;
  paymentMethod: string;
  matchesCddProfile: boolean;
  isSuspicious: boolean;
  inPmpjScope: boolean;
}): 'ALERT TKM' | 'PERIKSA EDD' | 'NORMAL' {
  if (tx.isSuspicious) {
    return 'ALERT TKM';
  }
  if (!tx.matchesCddProfile || (tx.paymentMethod === 'Tunai' && tx.amount >= 100000000)) {
    return 'PERIKSA EDD';
  }
  return 'NORMAL';
}

export function formatRupiahPmpj(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return Math.round(val).toLocaleString('id-ID');
}
