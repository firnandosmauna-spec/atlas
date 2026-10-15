import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, Users, ShieldAlert, 
  FileText, Copy, Printer, Check, RotateCcw,
  TrendingUp, Layers,
  BookOpen, Sliders, ArrowUpRight
} from 'lucide-react';
import { useAppConfigStore } from '../store/appConfigStore';

// ==========================================
// DATA MATRIKS BASE FEE (IMAGE 2)
// ==========================================
interface BaseFeeTier {
  code: string;
  minOmzet: number;
  maxOmzet: number;
  label: string;
  baseFee: number;
  baseHours: number;
  estimatedDays: string;
  teamComposition: string;
}

const BASE_FEE_MATRIX: BaseFeeTier[] = [
  { code: 'A1', minOmzet: 0, maxOmzet: 500000000, label: '≤ Rp500 juta', baseFee: 20000000, baseHours: 50, estimatedDays: '5-7 hari', teamComposition: '1 Senior + 1 Junior' },
  { code: 'A2', minOmzet: 500000001, maxOmzet: 1000000000, label: '> Rp500 juta - Rp1 miliar', baseFee: 22500000, baseHours: 60, estimatedDays: '6-8 hari', teamComposition: '1 Senior + 1 Junior' },
  { code: 'A3', minOmzet: 1000000001, maxOmzet: 5000000000, label: '> Rp1 - 5 miliar', baseFee: 27500000, baseHours: 75, estimatedDays: '7-10 hari', teamComposition: '1 Senior + 1-2 Junior' },
  { code: 'A4', minOmzet: 5000000001, maxOmzet: 10000000000, label: '> Rp5 - 10 miliar', baseFee: 30000000, baseHours: 90, estimatedDays: '8-12 hari', teamComposition: '1 Senior + 2 Junior' },
  { code: 'A5', minOmzet: 10000000001, maxOmzet: 25000000000, label: '> Rp10 - 25 miliar', baseFee: 35000000, baseHours: 110, estimatedDays: '10-14 hari', teamComposition: '1 Senior + 2 Junior' },
  { code: 'A6', minOmzet: 25000000001, maxOmzet: 50000000000, label: '> Rp25 - 50 miliar', baseFee: 42500000, baseHours: 140, estimatedDays: '12-16 hari', teamComposition: '1 Senior + 2 Junior' },
  { code: 'A7', minOmzet: 5000000001, maxOmzet: 100000000000, label: '> Rp50 - 100 miliar', baseFee: 50000000, baseHours: 180, estimatedDays: '14-20 hari', teamComposition: '1 Supervisor/Senior + 2 Junior' },
  { code: 'A8', minOmzet: 100000000001, maxOmzet: 250000000000, label: '> Rp100 - 250 miliar', baseFee: 65000000, baseHours: 240, estimatedDays: '18-25 hari', teamComposition: '1 Supervisor + 1 Senior + 2 Junior' },
  { code: 'A9', minOmzet: 250000000001, maxOmzet: 500000000000, label: '> Rp250 - 500 miliar', baseFee: 80000000, baseHours: 300, estimatedDays: '20-30 hari', teamComposition: '1 Supervisor + 1 Senior + 2-3 Junior' },
  { code: 'A10', minOmzet: 500000000001, maxOmzet: 1000000000000, label: '> Rp500 miliar - Rp1 triliun', baseFee: 100000000, baseHours: 380, estimatedDays: '25-35 hari', teamComposition: '1 Manager/Supervisor + 1 Senior + 3 Junior' },
  { code: 'A11', minOmzet: 1000000000001, maxOmzet: 2500000000000, label: '> Rp1 - 2,5 triliun', baseFee: 140000000, baseHours: 500, estimatedDays: '30-45 hari', teamComposition: '1 Manager + 1 Supervisor + 2 Senior + 3 Junior' },
  { code: 'A12', minOmzet: 2500000000001, maxOmzet: 5000000000000, label: '> Rp2,5 - 5 triliun', baseFee: 200000000, baseHours: 700, estimatedDays: '40-55 hari', teamComposition: '1 Manager + 1 Supervisor + 2 Senior + 4 Junior' },
  { code: 'A13', minOmzet: 5000000000001, maxOmzet: 10000000000000, label: '> Rp5 - 10 triliun', baseFee: 275000000, baseHours: 900, estimatedDays: '50-70 hari', teamComposition: '1 Manager + 1 Supervisor + 2-3 Senior + 4 Junior' },
  { code: 'A14', minOmzet: 10000000000001, maxOmzet: Infinity, label: '> Rp10 triliun', baseFee: 350000000, baseHours: 1200, estimatedDays: 'Case by case', teamComposition: 'Ditentukan berdasarkan risk assessment' },
];

// ==========================================
// DATA TARIF PDP IAPI NO. 3 TAHUN 2024 (IMAGE 4)
// ==========================================
interface TeamRateDefinition {
  level: string;
  defaultAllocation: number; // in percent
  hbrJabodetabek: number;
  hbrLuarJabodetabek: number;
}

const DEFAULT_TEAM_RATES: TeamRateDefinition[] = [
  { level: 'Partner', defaultAllocation: 8, hbrJabodetabek: 1850000, hbrLuarJabodetabek: 1480000 },
  { level: 'Manager', defaultAllocation: 10, hbrJabodetabek: 860000, hbrLuarJabodetabek: 615000 },
  { level: 'Supervisor', defaultAllocation: 12, hbrJabodetabek: 370000, hbrLuarJabodetabek: 245000 },
  { level: 'Senior', defaultAllocation: 30, hbrJabodetabek: 185000, hbrLuarJabodetabek: 155000 },
  { level: 'Junior', defaultAllocation: 40, hbrJabodetabek: 125000, hbrLuarJabodetabek: 87500 },
];

const formatNumberWithDots = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '' || val === 0) return '';
  const numStr = val.toString().replace(/\D/g, '');
  if (!numStr) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numStr));
};

const parseNumberFromDots = (val: string): number => {
  const cleanStr = val.replace(/\D/g, '');
  return cleanStr ? parseInt(cleanStr, 10) : 0;
};

interface MoneyInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className,
  id,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawCursor = input.selectionStart || 0;
    const currentVal = input.value;
    const digitsBeforeCursor = currentVal.slice(0, rawCursor).replace(/\D/g, '').length;
    
    const num = parseNumberFromDots(currentVal);
    onChange(num);

    const formatted = num ? formatNumberWithDots(num) : '';
    requestAnimationFrame(() => {
      if (document.activeElement !== input) return;
      let newCursor = 0;
      let digitCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          digitCount++;
        }
        if (digitCount >= digitsBeforeCursor) {
          newCursor = i + 1;
          break;
        }
      }
      if (digitCount < digitsBeforeCursor) {
        newCursor = formatted.length;
      }
      input.setSelectionRange(newCursor, newCursor);
    });
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={value ? formatNumberWithDots(value) : ''}
      onChange={handleChange}
      className={className}
    />
  );
};

const FeeCalculator: React.FC = () => {
  const { appName, institutionName } = useAppConfigStore();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix' | 'adjustments' | 'rates' | 'guideline' | 'proposal'>('calculator');

  // =========================================================
  // INPUT DATA CALON KLIEN (IMAGE 1) DENGAN PERMANENT STORAGE
  // =========================================================
  const getSavedDraft = () => {
    try {
      const saved = localStorage.getItem('atlas_fee_calc_draft');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };
  const initialDraft = getSavedDraft();

  const [clientName, setClientName] = useState<string>(initialDraft?.clientName ?? '');
  const [fiscalYear, setFiscalYear] = useState<number>(initialDraft?.fiscalYear ?? 2026);
  const [annualRevenue, setAnnualRevenue] = useState<number>(initialDraft?.annualRevenue ?? 0);
  const [totalAssets, setTotalAssets] = useState<number>(initialDraft?.totalAssets ?? 0);
  const [transactionVolume, setTransactionVolume] = useState<number>(initialDraft?.transactionVolume ?? 0);
  const [branchCount, setBranchCount] = useState<number>(initialDraft?.branchCount ?? 1);
  
  // Dropdown Conditions (Image 3)
  const [inventoryCondition, setInventoryCondition] = useState<string>(initialDraft?.inventoryCondition ?? 'Tidak material / tidak ada');
  const [industryComplexity, setIndustryComplexity] = useState<string>(initialDraft?.industryComplexity ?? 'Rendah');
  const [bookkeepingQuality, setBookkeepingQuality] = useState<string>(initialDraft?.bookkeepingQuality ?? 'Normal');
  const [engagementRisk, setEngagementRisk] = useState<string>(initialDraft?.engagementRisk ?? 'Rendah');
  const [firstYearAudit, setFirstYearAudit] = useState<string>(initialDraft?.firstYearAudit ?? 'Tidak');
  const [deadlineDays, setDeadlineDays] = useState<number>(initialDraft?.deadlineDays ?? 60);
  
  // Pricing Parameters
  const [hbrZone, setHbrZone] = useState<'Jabodetabek' | 'Luar Jabodetabek'>(initialDraft?.hbrZone ?? 'Luar Jabodetabek');
  const [bufferPercent, setBufferPercent] = useState<number>(initialDraft?.bufferPercent ?? 10);
  const [vatPercent, setVatPercent] = useState<number>(initialDraft?.vatPercent ?? 0);
  const [outOfPocketExpenses, setOutOfPocketExpenses] = useState<number>(initialDraft?.outOfPocketExpenses ?? 0);

  // Editable Rates & Allocation Settings (Image 4) - Tersimpan Permanen di Browser
  const [teamRates, setTeamRates] = useState<TeamRateDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('atlas_fee_calc_team_rates');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TEAM_RATES;
  });
  const [internalCostFactor, setInternalCostFactor] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('atlas_fee_calc_internal_factor');
      if (saved) return Number(saved) || 60;
    } catch {}
    return 60;
  });

  // UI Feedback
  const [isCopied, setIsCopied] = useState(false);

  // Auto-save rates ke localStorage secara permanen
  useEffect(() => {
    try {
      localStorage.setItem('atlas_fee_calc_team_rates', JSON.stringify(teamRates));
    } catch {}
  }, [teamRates]);

  useEffect(() => {
    try {
      localStorage.setItem('atlas_fee_calc_internal_factor', internalCostFactor.toString());
    } catch {}
  }, [internalCostFactor]);

  // Auto-save formulir aktif
  useEffect(() => {
    try {
      const draft = {
        clientName,
        fiscalYear,
        annualRevenue,
        totalAssets,
        transactionVolume,
        branchCount,
        inventoryCondition,
        industryComplexity,
        bookkeepingQuality,
        engagementRisk,
        firstYearAudit,
        deadlineDays,
        hbrZone,
        bufferPercent,
        vatPercent,
        outOfPocketExpenses,
      };
      localStorage.setItem('atlas_fee_calc_draft', JSON.stringify(draft));
    } catch {}
  }, [
    clientName, fiscalYear, annualRevenue, totalAssets, transactionVolume,
    branchCount, inventoryCondition, industryComplexity, bookkeepingQuality,
    engagementRisk, firstYearAudit, deadlineDays, hbrZone, bufferPercent,
    vatPercent, outOfPocketExpenses
  ]);

  // =========================================================
  // RESET & LOAD EXAMPLE (DEMO / VERIFIKASI DARI IMAGE 1)
  // =========================================================
  const handleReset = () => {
    setClientName('');
    setFiscalYear(2026);
    setAnnualRevenue(0);
    setTotalAssets(0);
    setTransactionVolume(0);
    setBranchCount(1);
    setInventoryCondition('Tidak material / tidak ada');
    setIndustryComplexity('Rendah');
    setBookkeepingQuality('Normal');
    setEngagementRisk('Rendah');
    setFirstYearAudit('Tidak');
    setDeadlineDays(60);
    setHbrZone('Luar Jabodetabek');
    setBufferPercent(10);
    setVatPercent(0);
    setOutOfPocketExpenses(0);
    try {
      localStorage.removeItem('atlas_fee_calc_draft');
    } catch {}
  };

  const handleResetRates = () => {
    setTeamRates(DEFAULT_TEAM_RATES);
    setInternalCostFactor(60);
    try {
      localStorage.removeItem('atlas_fee_calc_team_rates');
      localStorage.removeItem('atlas_fee_calc_internal_factor');
    } catch {}
  };

  const handleLoadExample = () => {
    // Sesuai contoh pada Image 1 (PT ABC)
    setClientName('Contoh PT ABC');
    setFiscalYear(2026);
    setAnnualRevenue(180000000000); // 180 Miliar
    setTotalAssets(300000000000);   // 300 Miliar
    setTransactionVolume(1500);     // 1.500 transaksi
    setBranchCount(4);              // 4 lokasi/cabang
    setInventoryCondition('Material, 2-5 gudang');
    setIndustryComplexity('Menengah');
    setBookkeepingQuality('Normal');
    setEngagementRisk('Moderate');
    setFirstYearAudit('Ya');
    setDeadlineDays(30);
    setHbrZone('Luar Jabodetabek');
    setBufferPercent(10);
    setVatPercent(0);
    setOutOfPocketExpenses(0);
    setInternalCostFactor(60);
  };

  // =========================================================
  // 1. EVALUASI BASE FEE & JAM AUDIT DASAR (IMAGE 2)
  // =========================================================
  const baseFeeEvaluation = useMemo(() => {
    if (annualRevenue <= 0) {
      return {
        tier: null,
        baseFee: 0,
        baseHours: 0,
        estimatedDays: '-',
        teamComposition: '-',
      };
    }

    const tier = BASE_FEE_MATRIX.find(t => annualRevenue >= t.minOmzet && annualRevenue <= t.maxOmzet) 
      || BASE_FEE_MATRIX[BASE_FEE_MATRIX.length - 1];

    return {
      tier,
      baseFee: tier.baseFee,
      baseHours: tier.baseHours,
      estimatedDays: tier.estimatedDays,
      teamComposition: tier.teamComposition,
    };
  }, [annualRevenue]);

  // =========================================================
  // 2. EVALUASI 9 FAKTOR PENYESUAIAN (IMAGE 3)
  // =========================================================
  const adjustments = useMemo(() => {
    // 1. Aset
    let assetAdj = 0;
    if (totalAssets > 5000000000000) assetAdj = 30;
    else if (totalAssets > 1000000000000) assetAdj = 25;
    else if (totalAssets > 500000000000) assetAdj = 20;
    else if (totalAssets > 100000000000) assetAdj = 15;
    else if (totalAssets > 25000000000) assetAdj = 10;
    else if (totalAssets > 5000000000) assetAdj = 5;
    else assetAdj = 0;

    // 2. Transaksi
    let transAdj = 0;
    if (transactionVolume > 10000) transAdj = 30;
    else if (transactionVolume >= 5001) transAdj = 20;
    else if (transactionVolume >= 2001) transAdj = 15;
    else if (transactionVolume >= 501) transAdj = 10;
    else if (transactionVolume >= 100) transAdj = 5;
    else transAdj = 0;

    // 3. Cabang
    let branchAdj = 0;
    if (branchCount > 20) branchAdj = 30;
    else if (branchCount >= 11) branchAdj = 20;
    else if (branchCount >= 6) branchAdj = 15;
    else if (branchCount >= 4) branchAdj = 10;
    else if (branchCount >= 2) branchAdj = 5;
    else branchAdj = 0;

    // 4. Persediaan
    let invAdj = 0;
    switch (inventoryCondition) {
      case 'Material, 1 lokasi': invAdj = 5; break;
      case 'Material, 2-5 gudang': invAdj = 10; break;
      case 'Banyak SKU / slow moving': invAdj = 15; break;
      case 'Kompleks / multi lokasi': invAdj = 25; break;
      default: invAdj = 0;
    }

    // 5. Industri
    let indAdj = 0;
    switch (industryComplexity) {
      case 'Menengah': indAdj = 10; break;
      case 'Menengah-Tinggi': indAdj = 20; break;
      case 'Tinggi': indAdj = 30; break;
      case 'Sangat Tinggi / Regulasi Ketat': indAdj = 45; break;
      default: indAdj = 0;
    }

    // 6. Pembukuan
    let bookAdj = 0;
    switch (bookkeepingQuality) {
      case 'Sangat rapi': bookAdj = -5; break;
      case 'Rekonsiliasi belum lengkap': bookAdj = 10; break;
      case 'Banyak akun unreconciled': bookAdj = 15; break;
      case 'Tidak rapi': bookAdj = 25; break;
      case 'LK belum selesai': bookAdj = 30; break;
      default: bookAdj = 0;
    }

    // 7. Risiko
    let riskAdj = 0;
    switch (engagementRisk) {
      case 'Moderate': riskAdj = 10; break;
      case 'Moderate-High': riskAdj = 20; break;
      case 'High': riskAdj = 30; break;
      case 'Very High': riskAdj = 50; break;
      default: riskAdj = 0;
    }

    // 8. First Year
    let firstYearAdj = 0;
    switch (firstYearAudit) {
      case 'Ya': firstYearAdj = 10; break;
      case 'Ya - Saldo Awal Kompleks': firstYearAdj = 20; break;
      default: firstYearAdj = 0;
    }

    // 9. Deadline
    let deadlineAdj = 0;
    if (deadlineDays < 7) deadlineAdj = 45;
    else if (deadlineDays <= 13) deadlineAdj = 30;
    else if (deadlineDays <= 20) deadlineAdj = 20;
    else if (deadlineDays <= 30) deadlineAdj = 10;
    else if (deadlineDays <= 60) deadlineAdj = 5;
    else deadlineAdj = 0;

    const totalAdj = assetAdj + transAdj + branchAdj + invAdj + indAdj + bookAdj + riskAdj + firstYearAdj + deadlineAdj;
    const cappedAdj = Math.min(totalAdj, 150); // Maksimal 150% sesuai spreadsheet

    return {
      assetAdj,
      transAdj,
      branchAdj,
      invAdj,
      indAdj,
      bookAdj,
      riskAdj,
      firstYearAdj,
      deadlineAdj,
      totalAdj,
      cappedAdj,
    };
  }, [totalAssets, transactionVolume, branchCount, inventoryCondition, industryComplexity, bookkeepingQuality, engagementRisk, firstYearAudit, deadlineDays]);

  // =========================================================
  // 3. ESTIMASI JAM & BENCHMARK TIM HBR (IMAGE 1 & IMAGE 4)
  // =========================================================
  const teamCalculations = useMemo(() => {
    const baseHours = baseFeeEvaluation.baseHours;
    // Jam Audit Setelah Penyesuaian = Jam Audit Dasar * (1 + Adjustment Digunakan)
    const adjustedHours = Math.round(baseHours * (1 + adjustments.cappedAdj / 100) * 10) / 10;

    let totalHbrFee = 0;

    const breakdown = teamRates.map((role) => {
      // Alokasi Jam (Gunakan jam eksak untuk perkalian nilai HBR seperti di Excel)
      const roleHoursRaw = adjustedHours * (role.defaultAllocation / 100);
      const roleHours = Math.round(roleHoursRaw * 10) / 10;
      const ratePerHour = hbrZone === 'Jabodetabek' ? role.hbrJabodetabek : role.hbrLuarJabodetabek;
      const roleTotalHbr = Math.round(roleHoursRaw * ratePerHour);

      totalHbrFee += roleTotalHbr;

      return {
        ...role,
        allocatedHours: roleHours,
        effectiveRate: ratePerHour,
        totalHbrAmount: roleTotalHbr,
      };
    });

    const indicativeInternalCost = Math.round(totalHbrFee * (internalCostFactor / 100));

    return {
      baseHours,
      adjustedHours,
      breakdown,
      totalHbrFee,
      indicativeInternalCost,
    };
  }, [baseFeeEvaluation.baseHours, adjustments.cappedAdj, teamRates, hbrZone, internalCostFactor]);

  // =========================================================
  // 4. HASIL AKHIR & RINGKASAN KEPUTUSAN (IMAGE 1)
  // =========================================================
  const results = useMemo(() => {
    const baseFee = baseFeeEvaluation.baseFee;
    
    // Fee Matriks = Base Fee * (1 + Adjustment Digunakan)
    const feeMatriks = Math.round(baseFee * (1 + adjustments.cappedAdj / 100));
    
    // Benchmark Fee Berbasis HBR
    const benchmarkFeeHbr = teamCalculations.totalHbrFee;

    // Fee Normal mengambil nilai yang lebih tinggi antara Fee Matriks vs Benchmark HBR
    const feeNormal = Math.max(feeMatriks, benchmarkFeeHbr);
    const feeMinimumInternal = feeNormal;

    // Fee Penawaran (+ buffer)
    // Sesuai sheet: untuk angka contoh (129.115.200 + 10% = 142.026.720), sheet membulatkan ke atas ke juta terdekat = 143.000.000
    const rawFeePenawaran = feeNormal * (1 + bufferPercent / 100);
    const feePenawaran = rawFeePenawaran > 0 ? Math.ceil(rawFeePenawaran / 1000000) * 1000000 : 0;

    // Subtotal = Fee Penawaran + Out of Pocket Expenses
    const subtotal = feePenawaran + outOfPocketExpenses;

    // PPN
    const ppnAmount = Math.round(subtotal * (vatPercent / 100));

    // TOTAL PENAWARAN
    const totalPenawaran = subtotal + ppnAmount;

    // Margin Kontribusi = TOTAL PENAWARAN - Estimasi Biaya Internal
    const contributionMargin = totalPenawaran > 0 
      ? totalPenawaran - teamCalculations.indicativeInternalCost 
      : 0;

    // Margin %
    const marginPercent = totalPenawaran > 0 
      ? Math.round((contributionMargin / totalPenawaran) * 1000) / 10 
      : 0;

    return {
      feeMatriks,
      benchmarkFeeHbr,
      feeMinimumInternal,
      feeNormal,
      feePenawaran,
      subtotal,
      ppnAmount,
      totalPenawaran,
      contributionMargin,
      marginPercent,
    };
  }, [baseFeeEvaluation.baseFee, adjustments.cappedAdj, teamCalculations.totalHbrFee, teamCalculations.indicativeInternalCost, bufferPercent, outOfPocketExpenses, vatPercent]);

  // Currency Formatter
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  };

  // Copy Summary
  const handleCopySummary = () => {
    const text = `
KALKULATOR FEE AUDIT (MODEL KAP FRIDOLINUS PENO - 2026)
Entitas: ${clientName || '[Nama Calon Klien Belum Diisi]'} | Tahun Buku: ${fiscalYear}
Zona HBR: ${hbrZone} | Buffer: ${bufferPercent}%

1. PARAMETER KLIEN & TIER:
- Omzet Tahunan: ${formatRupiah(annualRevenue)} (${baseFeeEvaluation.tier?.code || '-'})
- Total Aset: ${formatRupiah(totalAssets)}
- Volume Transaksi: ${transactionVolume.toLocaleString('id-ID')} / bulan
- Jumlah Lokasi / Cabang: ${branchCount} lokasi
- Total Adjustment: ${adjustments.totalAdj}% (Digunakan: ${adjustments.cappedAdj}%)

2. HASIL PERHITUNGAN:
- Base Fee Matriks: ${formatRupiah(baseFeeEvaluation.baseFee)}
- Fee Matriks: ${formatRupiah(results.feeMatriks)}
- Jam Audit Total: ${teamCalculations.adjustedHours} Jam
- Benchmark Fee Berbasis HBR: ${formatRupiah(results.benchmarkFeeHbr)}
- Fee Normal: ${formatRupiah(results.feeNormal)}
- Fee Penawaran (+ Buffer ${bufferPercent}%): ${formatRupiah(results.feePenawaran)}
- Out-of-Pocket Expenses: ${formatRupiah(outOfPocketExpenses)}
- PPN (${vatPercent}%): ${formatRupiah(results.ppnAmount)}
- TOTAL PENAWARAN: ${formatRupiah(results.totalPenawaran)}

3. RINGKASAN PROFITABILITAS:
- Estimasi Biaya Internal (${internalCostFactor}%): ${formatRupiah(teamCalculations.indicativeInternalCost)}
- Margin Kontribusi: ${formatRupiah(results.contributionMargin)} (${results.marginPercent}%)
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="w-full font-sans min-w-0 space-y-3.5">
      
      {/* HEADER UTAMA: FULL FRAME & MODERN RAMPING */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:px-5 sm:py-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calculator size={16} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Kalkulator Fee Audit
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80">
                Model KAP Fridolinus Peno · 2026
              </span>
              <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                PDP IAPI No. 3/2024
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Estimasi fee audit berbasis matriks omzet dan benchmark tarif jam kerja tim audit.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadExample}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            title="Isi data sesuai contoh PT ABC pada spreadsheet untuk memverifikasi rumus"
          >
            <ArrowUpRight size={13} className="text-blue-600" />
            <span>Contoh PT ABC</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            title="Bersihkan seluruh isian form ke nilai awal"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{isCopied ? 'Tersalin' : 'Salin Rekap'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <Printer size={13} />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION: SEGMENTED CONTROLS */}
      <div className="flex p-1 bg-slate-200/50 rounded-xl border border-slate-200/70 overflow-x-auto scrollbar-none text-xs font-medium gap-1">
        {[
          { id: 'calculator', label: 'Kalkulator & Rekapitulasi', icon: Sliders, color: 'text-blue-600' },
          { id: 'matrix', label: 'Matriks Base Fee (Omzet)', icon: Layers, color: 'text-amber-600' },
          { id: 'adjustments', label: '9 Faktor Penyesuaian', icon: TrendingUp, color: 'text-emerald-600' },
          { id: 'rates', label: 'Tarif HBR & Alokasi Tim', icon: Users, color: 'text-indigo-600' },
          { id: 'guideline', label: 'Panduan & Kebijakan', icon: BookOpen, color: 'text-rose-600' },
          { id: 'proposal', label: 'Format Surat Proposal', icon: FileText, color: 'text-slate-600' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg whitespace-nowrap transition-all text-xs font-medium ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Icon size={14} className={isActive ? tab.color : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: KALKULATOR UTAMA */}
      {activeTab === 'calculator' && (
        <div className="space-y-3.5">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            
            {/* KOLOM KIRI: INPUT DATA CALON KLIEN */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 rounded-full bg-blue-600"></div>
                  <span className="font-bold text-xs text-slate-800 tracking-tight">Input Data Calon Klien</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/70">
                  Parameter Audit
                </span>
              </div>

              <div className="p-3.5 sm:p-4 space-y-3 text-xs">
                
                {/* Nama Entitas */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Entitas</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
                    placeholder="Contoh: PT ABC / Nama Calon Klien"
                  />
                </div>

                {/* Tahun Buku & Zona HBR */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tahun Buku</label>
                    <input
                      type="number"
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(Number(e.target.value) || 2026)}
                      className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Zona HBR</label>
                    <select
                      value={hbrZone}
                      onChange={(e: any) => setHbrZone(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-medium"
                    >
                      <option value="Luar Jabodetabek">Luar Jabodetabek</option>
                      <option value="Jabodetabek">Jabodetabek</option>
                    </select>
                  </div>
                </div>

                {/* Subheading: Skala Finansial */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Skala Finansial & Operasional</span>
                </div>

                {/* Omzet Tahunan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Omzet Tahunan (Rp)</label>
                    {baseFeeEvaluation.tier && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        Tier {baseFeeEvaluation.tier.code}
                      </span>
                    )}
                  </div>
                  <MoneyInput
                    placeholder="0"
                    value={annualRevenue}
                    onChange={setAnnualRevenue}
                    className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">{formatRupiah(annualRevenue)}</span>
                </div>

                {/* Total Aset */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Total Aset (Rp)</label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">+{adjustments.assetAdj}%</span>
                  </div>
                  <MoneyInput
                    placeholder="0"
                    value={totalAssets}
                    onChange={setTotalAssets}
                    className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">{formatRupiah(totalAssets)}</span>
                </div>

                {/* Volume Transaksi & Cabang */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">Transaksi/Bln</label>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">+{adjustments.transAdj}%</span>
                    </div>
                    <MoneyInput
                      placeholder="0"
                      value={transactionVolume}
                      onChange={setTransactionVolume}
                      className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">Lokasi Cabang</label>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">+{adjustments.branchAdj}%</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={branchCount}
                      onChange={(e) => setBranchCount(Number(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Subheading: Kompleksitas & Risiko */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Kompleksitas & Risiko</span>
                </div>

                {/* Kondisi Persediaan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Kondisi Persediaan</label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">+{adjustments.invAdj}%</span>
                  </div>
                  <select
                    value={inventoryCondition}
                    onChange={(e) => setInventoryCondition(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  >
                    <option value="Tidak material / tidak ada">Tidak material / tidak ada (0%)</option>
                    <option value="Material, 1 lokasi">Material, 1 lokasi (+5%)</option>
                    <option value="Material, 2-5 gudang">Material, 2-5 gudang (+10%)</option>
                    <option value="Banyak SKU / slow moving">Banyak SKU / slow moving (+15%)</option>
                    <option value="Kompleks / multi lokasi">Kompleks / multi lokasi (+25%)</option>
                  </select>
                </div>

                {/* Kompleksitas Industri */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Kompleksitas Industri</label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">+{adjustments.indAdj}%</span>
                  </div>
                  <select
                    value={industryComplexity}
                    onChange={(e) => setIndustryComplexity(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  >
                    <option value="Rendah">Rendah - Jasa/perdagangan sederhana (0%)</option>
                    <option value="Menengah">Menengah - Distributor, travel, hotel, RS kecil (+10%)</option>
                    <option value="Menengah-Tinggi">Menengah-Tinggi - Konstruksi, developer, RS besar (+20%)</option>
                    <option value="Tinggi">Tinggi - Manufaktur, tambang, shipping, grup (+30%)</option>
                    <option value="Sangat Tinggi / Regulasi Ketat">Sangat Tinggi / Regulasi Ketat - Bank, emiten (+45%)</option>
                  </select>
                </div>

                {/* Kualitas Pembukuan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Kualitas Pembukuan</label>
                    <span className={`text-[10px] font-semibold px-1 rounded ${adjustments.bookAdj < 0 ? 'text-blue-700 bg-blue-50' : 'text-emerald-700 bg-emerald-50'}`}>
                      {adjustments.bookAdj > 0 ? `+${adjustments.bookAdj}` : adjustments.bookAdj}%
                    </span>
                  </div>
                  <select
                    value={bookkeepingQuality}
                    onChange={(e) => setBookkeepingQuality(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  >
                    <option value="Sangat rapi">Sangat rapi - Closing & rekonsiliasi baik (-5%)</option>
                    <option value="Normal">Normal (0%)</option>
                    <option value="Rekonsiliasi belum lengkap">Rekonsiliasi belum lengkap (+10%)</option>
                    <option value="Banyak akun unreconciled">Banyak akun unreconciled (+15%)</option>
                    <option value="Tidak rapi">Tidak rapi (+25%)</option>
                    <option value="LK belum selesai">LK belum selesai (+30%)</option>
                  </select>
                </div>

                {/* Risiko Engagement & First-Year */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">Risiko Perikatan</label>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">+{adjustments.riskAdj}%</span>
                    </div>
                    <select
                      value={engagementRisk}
                      onChange={(e) => setEngagementRisk(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    >
                      <option value="Rendah">Rendah (0%)</option>
                      <option value="Moderate">Moderate (+10%)</option>
                      <option value="Moderate-High">Moderate-High (+20%)</option>
                      <option value="High">High (+30%)</option>
                      <option value="Very High">Very High (+50%)</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">Tahun Pertama</label>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">+{adjustments.firstYearAdj}%</span>
                    </div>
                    <select
                      value={firstYearAudit}
                      onChange={(e) => setFirstYearAudit(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    >
                      <option value="Tidak">Tidak - Klien Berulang (0%)</option>
                      <option value="Ya">Ya - First Year (+10%)</option>
                      <option value="Ya - Saldo Awal Kompleks">Ya - Saldo Awal (+20%)</option>
                    </select>
                  </div>
                </div>

                {/* Deadline sejak data lengkap */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Batas Waktu Sejak Data Lengkap</label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">+{adjustments.deadlineAdj}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={deadlineDays}
                      onChange={(e) => setDeadlineDays(Number(e.target.value) || 30)}
                      className="w-20 px-2.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                    <span className="text-slate-500 text-xs font-medium">Hari</span>
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      ({deadlineDays <= 7 ? '<7 hari (+45%)' : deadlineDays <= 13 ? '7-13 hr (+30%)' : deadlineDays <= 20 ? '14-20 hr (+20%)' : deadlineDays <= 30 ? '21-30 hr (+10%)' : deadlineDays <= 60 ? '31-60 hr (+5%)' : '>60 hr (0%)'})
                    </span>
                  </div>
                </div>

                {/* Subheading: Parameter Penawaran */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Parameter Penawaran & Pajak</span>
                </div>

                {/* Buffer, PPN, dan OPE */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Buffer</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={bufferPercent}
                        onChange={(e) => setBufferPercent(Number(e.target.value) || 0)}
                        className="w-full pl-2 pr-5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                      <span className="absolute right-2 top-1.5 text-slate-400 text-xs pointer-events-none">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">PPN</label>
                    <select
                      value={vatPercent}
                      onChange={(e) => setVatPercent(Number(e.target.value))}
                      className="w-full px-1.5 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    >
                      <option value={0}>0%</option>
                      <option value={11}>11%</option>
                      <option value={12}>12%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">OPE (Rp)</label>
                    <MoneyInput
                      placeholder="0"
                      value={outOfPocketExpenses}
                      onChange={setOutOfPocketExpenses}
                      className="w-full px-2 py-1.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* KOLOM KANAN: HASIL PERHITUNGAN & RINGKASAN EKSEKUTIF */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3.5">
              
              {/* HERO EXECUTIVE CARD */}
              <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 shadow-2xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Ringkasan Keputusan Fee Audit
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Rekomendasi Final Quotation · KAP Fridolinus Peno
                    </div>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {clientName || 'Calon Klien'} · TA {fiscalYear}
                  </span>
                </div>

                <div className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Penawaran Audit (Include Buffer, PPN & OPE)
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-0.5 tracking-tight font-mono">
                      {formatRupiah(results.totalPenawaran)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    Fee Normal: <span className="font-semibold text-white">{formatRupiah(results.feeNormal)}</span>
                  </div>
                </div>

                {/* 4 KPI MINI PILLS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-sans">Benchmark HBR</div>
                    <div className="font-bold text-slate-100 mt-0.5 text-xs sm:text-[13px]">{formatRupiah(results.benchmarkFeeHbr)}</div>
                  </div>
                  <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-sans">Biaya Internal ({internalCostFactor}%)</div>
                    <div className="font-bold text-slate-100 mt-0.5 text-xs sm:text-[13px]">{formatRupiah(teamCalculations.indicativeInternalCost)}</div>
                  </div>
                  <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-sans">Margin Kontribusi</div>
                    <div className="font-bold text-emerald-400 mt-0.5 text-xs sm:text-[13px]">{formatRupiah(results.contributionMargin)}</div>
                  </div>
                  <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-sans">Margin Persentase</div>
                    <div className="font-bold text-amber-300 mt-0.5 text-xs sm:text-[13px]">{results.marginPercent}%</div>
                  </div>
                </div>
              </div>

              {/* DUAL MODEL COMPARATOR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Model A: Fee Matriks */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  results.feeMatriks >= results.benchmarkFeeHbr
                    ? 'bg-amber-50/70 border-amber-300 shadow-2xs ring-1 ring-amber-400/30'
                    : 'bg-white border-slate-200/90 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-800">Fee Matriks Omzet</span>
                    {results.feeMatriks >= results.benchmarkFeeHbr ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white tracking-wider uppercase">
                        Terpilih Acuan
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Lebih Rendah</span>
                    )}
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                    {formatRupiah(results.feeMatriks)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-mono">
                    <span>Base Tier {baseFeeEvaluation.tier?.code || '-'}: {formatRupiah(baseFeeEvaluation.baseFee)}</span>
                    <span className="font-semibold text-amber-800">Adj: +{adjustments.cappedAdj}%</span>
                  </div>
                </div>

                {/* Model B: Benchmark HBR */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  results.benchmarkFeeHbr > results.feeMatriks
                    ? 'bg-blue-50/70 border-blue-300 shadow-2xs ring-1 ring-blue-400/30'
                    : 'bg-white border-slate-200/90 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-800">Benchmark HBR IAPI</span>
                    {results.benchmarkFeeHbr > results.feeMatriks ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white tracking-wider uppercase">
                        Terpilih Acuan
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Lebih Rendah</span>
                    )}
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                    {formatRupiah(results.benchmarkFeeHbr)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-mono">
                    <span>Alokasi Jam: {teamCalculations.adjustedHours.toFixed(1)}j</span>
                    <span className="font-semibold text-blue-800">Zona: {hbrZone}</span>
                  </div>
                </div>
              </div>

              {/* RINCIAN PERHITUNGAN & 9 PENYESUAIAN */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="bg-slate-50/90 border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-3.5 rounded-full bg-amber-500"></div>
                    <span className="font-bold text-xs text-slate-800 tracking-tight">
                      Komponen Penyesuaian & Rincian Finansial
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Maks. 150% Cap
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 space-y-3 text-xs">
                  
                  {/* 9 FAKTOR BADGE CHIPS GRID */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      9 Faktor Penyesuaian Komersial & Risiko:
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[11px]">
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 flex justify-between items-center">
                        <span className="text-slate-500">Aset:</span>
                        <span className="font-mono font-bold text-slate-800">+{adjustments.assetAdj}%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 flex justify-between items-center">
                        <span className="text-slate-500">Transaksi:</span>
                        <span className="font-mono font-bold text-slate-800">+{adjustments.transAdj}%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 flex justify-between items-center">
                        <span className="text-slate-500">Cabang:</span>
                        <span className="font-mono font-bold text-slate-800">+{adjustments.branchAdj}%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 flex justify-between items-center">
                        <span className="text-slate-500">Persediaan:</span>
                        <span className="font-mono font-bold text-slate-800">+{adjustments.invAdj}%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 flex justify-between items-center">
                        <span className="text-slate-500">Industri:</span>
                        <span className="font-mono font-bold text-slate-800">+{adjustments.indAdj}%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 flex justify-between items-center">
                        <span className="text-slate-500">Pembukuan:</span>
                        <span className={`font-mono font-bold ${adjustments.bookAdj < 0 ? 'text-blue-700' : 'text-slate-800'}`}>
                          {adjustments.bookAdj > 0 ? `+${adjustments.bookAdj}` : adjustments.bookAdj}%
                        </span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 flex justify-between items-center">
                        <span className="text-slate-500">Risiko:</span>
                        <span className="font-mono font-bold text-slate-800">+{adjustments.riskAdj}%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 flex justify-between items-center">
                        <span className="text-slate-500">First-Year:</span>
                        <span className="font-mono font-bold text-slate-800">+{adjustments.firstYearAdj}%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 flex justify-between items-center col-span-2 sm:col-span-2">
                        <span className="text-slate-500">Deadline:</span>
                        <span className="font-mono font-bold text-slate-800">+{adjustments.deadlineAdj}%</span>
                      </div>
                    </div>
                  </div>

                  {/* ACCUMULATOR PROGRESS BAR & CAP */}
                  <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/70 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span className="font-semibold text-amber-950">
                          Total Akumulasi: <span className="font-mono">{adjustments.totalAdj}%</span>
                        </span>
                        <span className="text-amber-800 font-bold font-mono text-xs">
                          Diterapkan: {adjustments.cappedAdj}% {adjustments.totalAdj > 150 ? '(Capped 150%)' : ''}
                        </span>
                      </div>
                      <div className="w-full bg-amber-200/70 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-amber-600 h-1.5 rounded-full transition-all" 
                          style={{ width: `${Math.min((adjustments.cappedAdj / 150) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* FINANCIAL BREAKDOWN LIST */}
                  <div className="space-y-1.5 font-mono text-xs pt-1 border-t border-slate-100">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100/70 text-slate-600">
                      <span>Base Fee Berdasarkan Omzet:</span>
                      <span className="font-semibold text-slate-900">{formatRupiah(baseFeeEvaluation.baseFee)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-100/70 text-slate-600">
                      <span>Fee Matriks (Base Fee × (1 + {adjustments.cappedAdj}%)):</span>
                      <span className="font-semibold text-slate-800">{formatRupiah(results.feeMatriks)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-100/70 text-slate-600">
                      <span>Benchmark Fee Berbasis HBR ({teamCalculations.adjustedHours.toFixed(1)} Jam):</span>
                      <span className="font-semibold text-slate-800">{formatRupiah(results.benchmarkFeeHbr)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-100/70 text-slate-500">
                      <span>Fee Minimum Internal (Floor):</span>
                      <span className="font-semibold">{formatRupiah(results.feeMinimumInternal)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 px-2 bg-blue-50/80 rounded border border-blue-200/80 text-blue-900 font-bold">
                      <span className="font-sans">Fee Normal (Tertinggi Matriks vs HBR):</span>
                      <span className="text-sm">{formatRupiah(results.feeNormal)}</span>
                    </div>

                    {bufferPercent > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100/70 text-slate-600">
                        <span>Buffer Penawaran (+{bufferPercent}%):</span>
                        <span>{formatRupiah(results.feePenawaran - results.feeNormal)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-1 border-b border-slate-100/70 text-slate-800 font-bold">
                      <span>Fee Penawaran Jasa:</span>
                      <span className="text-slate-900">{formatRupiah(results.feePenawaran)}</span>
                    </div>

                    {outOfPocketExpenses > 0 && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100/70 text-slate-600">
                        <span>Out-of-Pocket Expenses (OPE):</span>
                        <span>{formatRupiah(outOfPocketExpenses)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-1 border-b border-slate-100/70 text-slate-600">
                      <span>Subtotal Jasa & OPE:</span>
                      <span>{formatRupiah(results.subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-100/70 text-slate-500">
                      <span>PPN ({vatPercent}%):</span>
                      <span>{formatRupiah(results.ppnAmount)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-slate-900 font-black text-sm">
                      <span className="font-sans">TOTAL PENAWARAN:</span>
                      <span className="text-blue-700 text-base">{formatRupiah(results.totalPenawaran)}</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* TABEL ALOKASI JAM & BENCHMARK TIM (FULL FRAME) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="bg-slate-50/90 border-b border-slate-200/80 px-3.5 py-2.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 rounded-full bg-indigo-600"></div>
                <div>
                  <span className="font-bold text-xs text-slate-800 tracking-tight">
                    Estimasi Jam & Benchmark Tim (PDP IAPI No. 3 Tahun 2024)
                  </span>
                  <span className="ml-2 text-[10px] text-slate-500 font-medium">
                    Zona: {hbrZone} · Biaya Internal: {internalCostFactor}%
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Jam Dasar: {teamCalculations.baseHours}j → Jam Disesuaikan: <span className="text-slate-900 font-bold">{teamCalculations.adjustedHours.toFixed(1)}j</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2 px-3.5">Level Personel</th>
                    <th className="py-2 px-3 text-center">Alokasi (%)</th>
                    <th className="py-2 px-3 text-center">Alokasi Jam</th>
                    <th className="py-2 px-3.5 text-right">Tarif HBR / Jam ({hbrZone})</th>
                    <th className="py-2 px-3.5 text-right font-bold text-slate-800">Nilai HBR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {teamCalculations.breakdown.map((row) => (
                    <tr key={row.level} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3.5 font-sans font-semibold text-slate-900">{row.level}</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-700">{row.defaultAllocation}%</td>
                      <td className="py-2 px-3 text-center text-slate-800 font-bold">{row.allocatedHours.toFixed(1)}j</td>
                      <td className="py-2 px-3.5 text-right text-slate-700">{formatRupiah(row.effectiveRate)}</td>
                      <td className="py-2 px-3.5 text-right font-bold text-slate-900">{formatRupiah(row.totalHbrAmount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/80 border-t-2 border-slate-200 font-mono text-xs font-bold text-slate-900">
                  <tr>
                    <td className="py-2.5 px-3.5 font-sans">Total Jam & Benchmark HBR</td>
                    <td className="py-2.5 px-3 text-center">100%</td>
                    <td className="py-2.5 px-3 text-center text-blue-700">{teamCalculations.adjustedHours.toFixed(1)}j</td>
                    <td></td>
                    <td className="py-2.5 px-3.5 text-right text-blue-700">{formatRupiah(teamCalculations.totalHbrFee)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between gap-1.5">
              <div>
                *Catatan: Margin indikatif karena 'Biaya Internal' memakai asumsi faktor <span className="font-semibold text-slate-700">{internalCostFactor}%</span> dari HBR IAPI.
              </div>
              <div className="font-semibold text-slate-800 font-mono">
                Estimasi Biaya Internal Total: <span className="text-amber-800">{formatRupiah(teamCalculations.indicativeInternalCost)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MATRIKS BASE FEE BERDASARKAN OMZET */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 sm:px-5 sm:py-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/90 text-slate-900">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3.5 rounded-full bg-amber-500"></div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Matriks Base Fee Audit Berdasarkan Omzet · 2026</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Tabel referensi dasar penentuan base fee dan jam audit dasar berdasarkan tier omzet tahunan klien.</p>
              </div>
            </div>
            {baseFeeEvaluation.tier && (
              <span className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold font-mono">
                Tier Terpilih: {baseFeeEvaluation.tier.code} ({baseFeeEvaluation.tier.label})
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-3.5">Kode</th>
                  <th className="py-2.5 px-3">Rentang Omzet Tahunan</th>
                  <th className="py-2.5 px-4 text-right">Base Fee</th>
                  <th className="py-2.5 px-3 text-center">Jam Dasar</th>
                  <th className="py-2.5 px-3 text-center">Hari Tim</th>
                  <th className="py-2.5 px-4">Komposisi Tim Minimum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {BASE_FEE_MATRIX.map((tier) => {
                  const isActive = baseFeeEvaluation.tier?.code === tier.code;
                  return (
                    <tr 
                      key={tier.code} 
                      className={`transition-colors ${
                        isActive ? 'bg-amber-50/90 font-bold text-amber-950 ring-1 ring-amber-300' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-3.5 font-sans font-bold">{tier.code}</td>
                      <td className="py-2.5 px-3 font-sans">{tier.label}</td>
                      <td className="py-2.5 px-4 text-right font-bold">{formatRupiah(tier.baseFee)}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-700">{tier.baseHours}j</td>
                      <td className="py-2.5 px-3 text-center font-sans text-slate-600">{tier.estimatedDays}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-700">{tier.teamComposition}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-[11px] text-slate-500">
            Catatan: Matriks base fee ini merupakan alat estimasi internal KAP, bukan tarif baku mengikat IAPI. Fee final dikonfirmasi dengan budget jam, risiko, dan professional judgment.
          </div>
        </div>
      )}

      {/* TAB 3: TABEL 9 FAKTOR PENYESUAIAN */}
      {activeTab === 'adjustments' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 sm:px-5 sm:py-3 border-b border-slate-200/80 bg-slate-50/90 text-slate-900 flex items-center gap-2">
            <div className="w-1.5 h-3.5 rounded-full bg-emerald-600"></div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Faktor Penyesuaian Fee Audit (9 Adjustment Factors)</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Pedoman persentase penyesuaian komersial & operasional audit berdasarkan parameter risiko.</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            
            {/* Faktor 1: ASET */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-white shadow-2xs hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>1. Faktor Aset</span>
                <span className="text-[10px] text-slate-400 font-normal">Kuantitatif</span>
              </h3>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li className="flex justify-between"><span>≤ Rp5 miliar:</span> <span className="font-bold text-slate-900">0%</span></li>
                <li className="flex justify-between"><span>&gt; Rp5 - 25 miliar:</span> <span className="font-bold text-slate-900">+5%</span></li>
                <li className="flex justify-between"><span>&gt; Rp25 - 100 miliar:</span> <span className="font-bold text-slate-900">+10%</span></li>
                <li className="flex justify-between"><span>&gt; Rp100 - 500 miliar:</span> <span className="font-bold text-slate-900">+15%</span></li>
                <li className="flex justify-between"><span>&gt; Rp500 miliar - Rp1 T:</span> <span className="font-bold text-slate-900">+20%</span></li>
                <li className="flex justify-between"><span>&gt; Rp1 - 5 triliun:</span> <span className="font-bold text-slate-900">+25%</span></li>
                <li className="flex justify-between"><span>&gt; Rp5 triliun:</span> <span className="font-bold text-slate-900">+30%</span></li>
              </ul>
            </div>

            {/* Faktor 2: TRANSAKSI */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-white shadow-2xs hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>2. Volume Transaksi</span>
                <span className="text-[10px] text-slate-400 font-normal">Per Bulan</span>
              </h3>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li className="flex justify-between"><span>&lt; 100 / bulan:</span> <span className="font-bold text-slate-900">0%</span></li>
                <li className="flex justify-between"><span>100 - 500 / bulan:</span> <span className="font-bold text-slate-900">+5%</span></li>
                <li className="flex justify-between"><span>501 - 2.000 / bulan:</span> <span className="font-bold text-slate-900">+10%</span></li>
                <li className="flex justify-between"><span>2.001 - 5.000 / bulan:</span> <span className="font-bold text-slate-900">+15%</span></li>
                <li className="flex justify-between"><span>5.001 - 10.000 / bln:</span> <span className="font-bold text-slate-900">+20%</span></li>
                <li className="flex justify-between"><span>&gt; 10.000 / bulan:</span> <span className="font-bold text-slate-900">+30%</span></li>
              </ul>
            </div>

            {/* Faktor 3: CABANG */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-white shadow-2xs hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>3. Lokasi / Cabang</span>
                <span className="text-[10px] text-slate-400 font-normal">Penyebaran</span>
              </h3>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li className="flex justify-between"><span>1 lokasi:</span> <span className="font-bold text-slate-900">0%</span></li>
                <li className="flex justify-between"><span>2 - 3 lokasi:</span> <span className="font-bold text-slate-900">+5%</span></li>
                <li className="flex justify-between"><span>4 - 5 lokasi:</span> <span className="font-bold text-slate-900">+10%</span></li>
                <li className="flex justify-between"><span>6 - 10 lokasi:</span> <span className="font-bold text-slate-900">+15%</span></li>
                <li className="flex justify-between"><span>11 - 20 lokasi:</span> <span className="font-bold text-slate-900">+20%</span></li>
                <li className="flex justify-between"><span>&gt; 20 lokasi:</span> <span className="font-bold text-slate-900">+30%</span></li>
              </ul>
            </div>

            {/* Faktor 4: PERSEDIAAN */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-white shadow-2xs hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>4. Kondisi Persediaan</span>
                <span className="text-[10px] text-slate-400 font-normal">Stock Opname</span>
              </h3>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li className="flex justify-between"><span>Tidak material / nihil:</span> <span className="font-bold text-slate-900">0%</span></li>
                <li className="flex justify-between"><span>Material, 1 lokasi:</span> <span className="font-bold text-slate-900">+5%</span></li>
                <li className="flex justify-between"><span>Material, 2-5 gudang:</span> <span className="font-bold text-slate-900">+10%</span></li>
                <li className="flex justify-between"><span>Banyak SKU / slow moving:</span> <span className="font-bold text-slate-900">+15%</span></li>
                <li className="flex justify-between"><span>Kompleks / multi lokasi:</span> <span className="font-bold text-slate-900">+25%</span></li>
              </ul>
            </div>

            {/* Faktor 5: INDUSTRI */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-white shadow-2xs hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>5. Kompleksitas Industri</span>
                <span className="text-[10px] text-slate-400 font-normal">Regulasi</span>
              </h3>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li className="flex justify-between"><span>Rendah (Jasa sederhana):</span> <span className="font-bold text-slate-900">0%</span></li>
                <li className="flex justify-between"><span>Menengah (Distributor, hotel):</span> <span className="font-bold text-slate-900">+10%</span></li>
                <li className="flex justify-between"><span>Menengah-Tinggi (Konstruksi):</span> <span className="font-bold text-slate-900">+20%</span></li>
                <li className="flex justify-between"><span>Tinggi (Manufaktur, tambang):</span> <span className="font-bold text-slate-900">+30%</span></li>
                <li className="flex justify-between"><span>Sangat Tinggi (Bank, emiten):</span> <span className="font-bold text-slate-900">+45%</span></li>
              </ul>
            </div>

            {/* Faktor 6: PEMBUKUAN */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-white shadow-2xs hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>6. Kualitas Pembukuan</span>
                <span className="text-[10px] text-slate-400 font-normal">Kerapian</span>
              </h3>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li className="flex justify-between"><span>Sangat rapi:</span> <span className="font-bold text-emerald-700">-5%</span></li>
                <li className="flex justify-between"><span>Normal:</span> <span className="font-bold text-slate-900">0%</span></li>
                <li className="flex justify-between"><span>Rekonsiliasi belum lengkap:</span> <span className="font-bold text-slate-900">+10%</span></li>
                <li className="flex justify-between"><span>Banyak akun unreconciled:</span> <span className="font-bold text-slate-900">+15%</span></li>
                <li className="flex justify-between"><span>Tidak rapi:</span> <span className="font-bold text-slate-900">+25%</span></li>
                <li className="flex justify-between"><span>LK belum selesai:</span> <span className="font-bold text-slate-900">+30%</span></li>
              </ul>
            </div>

            {/* Faktor 7: RISIKO */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-white shadow-2xs hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>7. Risiko Perikatan</span>
                <span className="text-[10px] text-slate-400 font-normal">Engagement</span>
              </h3>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li className="flex justify-between"><span>Rendah:</span> <span className="font-bold text-slate-900">0%</span></li>
                <li className="flex justify-between"><span>Moderate:</span> <span className="font-bold text-slate-900">+10%</span></li>
                <li className="flex justify-between"><span>Moderate-High:</span> <span className="font-bold text-slate-900">+20%</span></li>
                <li className="flex justify-between"><span>High (Going concern/fraud):</span> <span className="font-bold text-slate-900">+30%</span></li>
                <li className="flex justify-between"><span>Very High (Evaluasi Klien):</span> <span className="font-bold text-rose-700">+50%</span></li>
              </ul>
            </div>

            {/* Faktor 8: FIRST YEAR */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-white shadow-2xs hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>8. First-Year Audit</span>
                <span className="text-[10px] text-slate-400 font-normal">Saldo Awal</span>
              </h3>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li className="flex justify-between"><span>Tidak (Recurring client):</span> <span className="font-bold text-slate-900">0%</span></li>
                <li className="flex justify-between"><span>Ya (First-year normal):</span> <span className="font-bold text-slate-900">+10%</span></li>
                <li className="flex justify-between"><span>Ya - Saldo Awal Kompleks:</span> <span className="font-bold text-slate-900">+20%</span></li>
              </ul>
            </div>

            {/* Faktor 9: DEADLINE */}
            <div className="border border-slate-200/80 rounded-xl p-3 bg-white shadow-2xs hover:border-slate-300 transition-all">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>9. Batas Waktu (Deadline)</span>
                <span className="text-[10px] text-slate-400 font-normal">Sejak Data Lengkap</span>
              </h3>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li className="flex justify-between"><span>&gt; 60 hari:</span> <span className="font-bold text-slate-900">0%</span></li>
                <li className="flex justify-between"><span>31 - 60 hari:</span> <span className="font-bold text-slate-900">+5%</span></li>
                <li className="flex justify-between"><span>21 - 30 hari:</span> <span className="font-bold text-slate-900">+10%</span></li>
                <li className="flex justify-between"><span>14 - 20 hari:</span> <span className="font-bold text-slate-900">+20%</span></li>
                <li className="flex justify-between"><span>7 - 13 hari:</span> <span className="font-bold text-slate-900">+30%</span></li>
                <li className="flex justify-between"><span>&lt; 7 hari (Urgent):</span> <span className="font-bold text-rose-700">+45%</span></li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: TARIF HBR & ALOKASI TIM EDITABLE */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 sm:px-5 sm:py-3 border-b border-slate-200/80 bg-slate-50/90 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3.5 rounded-full bg-indigo-600"></div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Tarif Per Jam & Alokasi Tim (PDP IAPI No. 3 Tahun 2024)</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Benchmark minimum imbalan jasa audit menurut regulasi dewan pengurus IAPI.</p>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={handleResetRates}
                className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium transition-colors shadow-2xs"
                title="Kembalikan tarif ke standar PDP IAPI No. 3 Tahun 2024"
              >
                Reset Standar IAPI
              </button>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-[11px]">
                <span className="text-slate-600 font-medium">Biaya Internal:</span>
                <input
                  type="number"
                  min="30"
                  max="90"
                  value={internalCostFactor}
                  onChange={(e) => setInternalCostFactor(Number(e.target.value) || 60)}
                  className="w-12 text-center bg-slate-50 border border-slate-200 rounded py-0.5 font-mono font-bold text-slate-900 focus:outline-none"
                />
                <span className="text-slate-500 font-mono">%</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Level Personel</th>
                  <th className="py-2.5 px-3 text-center">Alokasi (%)</th>
                  <th className="py-2.5 px-4 text-right">HBR Jabodetabek</th>
                  <th className="py-2.5 px-4 text-right">HBR Luar Jabodetabek</th>
                  <th className="py-2.5 px-4 text-right">Biaya Internal (Luar)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {teamRates.map((row, idx) => (
                  <tr key={row.level} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-sans font-bold text-slate-900">{row.level}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={row.defaultAllocation}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setTeamRates(prev => prev.map((r, i) => i === idx ? { ...r, defaultAllocation: val } : r));
                          }}
                          className="w-12 text-center bg-slate-50 border border-slate-200 rounded px-1 py-0.5 font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                        <span className="text-slate-500">%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <MoneyInput
                        value={row.hbrJabodetabek}
                        onChange={(val) => {
                          setTeamRates(prev => prev.map((r, i) => i === idx ? { ...r, hbrJabodetabek: val } : r));
                        }}
                        className="w-28 text-right bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <MoneyInput
                        value={row.hbrLuarJabodetabek}
                        onChange={(val) => {
                          setTeamRates(prev => prev.map((r, i) => i === idx ? { ...r, hbrLuarJabodetabek: val } : r));
                        }}
                        className="w-28 text-right bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-600 font-semibold">
                      {formatRupiah(Math.round(row.hbrLuarJabodetabek * (internalCostFactor / 100)))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-[11px] text-slate-500">
            Catatan: HBR merupakan acuan minimum sesuai PDP IAPI No. 3 Tahun 2024. Faktor biaya internal {internalCostFactor}% merupakan estimasi awal untuk simulasi margin penugasan.
          </div>
        </div>
      )}

      {/* TAB 5: PANDUAN PENGGUNAAN & PRINSIP KEBIJAKAN */}
      {activeTab === 'guideline' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 space-y-5 text-xs text-slate-700">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="w-1.5 h-3.5 rounded-full bg-rose-600"></div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Panduan Penggunaan Kalkulator Fee Audit</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Standar Operasional Prosedur penentuan penawaran imbalan jasa audit pada KAP.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Langkah Operasional Penentuan Fee:</h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li><strong>Langkah 1:</strong> Isi identitas calon klien dan tahun buku penugasan audit.</li>
              <li><strong>Langkah 2:</strong> Masukkan omzet tahunan, total aset, volume transaksi bulanan, dan jumlah cabang untuk menentukan tier dasar dan penyesuaian kuantitatif.</li>
              <li><strong>Langkah 3:</strong> Tentukan kondisi persediaan, kompleksitas industri, pembukuan, risiko perikatan, dan status first-year audit untuk menentukan faktor pengali kualitatif.</li>
              <li><strong>Langkah 4:</strong> Masukkan batas waktu deadline, zona HBR, buffer penawaran, PPN, dan estimasi Out-of-Pocket Expenses (OPE).</li>
              <li><strong>Langkah 5:</strong> Tinjau Fee Matriks dan Benchmark Fee HBR (Prinsip: Fee normal otomatis mengambil nilai yang lebih tinggi untuk menjamin kecukupan alokasi jam kerja).</li>
              <li><strong>Langkah 6:</strong> Tinjau Total Penawaran dan margin indikatif terhadap struktur biaya internal KAP.</li>
              <li><strong>Langkah 7:</strong> Sesuaikan alokasi jam / tarif HBR / biaya internal bila kebijakan KAP memiliki ketentuan khusus.</li>
            </ol>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2 text-amber-950">
            <h3 className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-900">
              <ShieldAlert size={14} />
              Prinsip Kebijakan Internal KAP:
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-900/90">
              <li>Matriks omzet hanya alat estimasi awal; keputusan fee final harus didukung budget jam kerja yang memadai.</li>
              <li>Jika benchmark HBR berbasis jam lebih tinggi daripada fee matriks, model fee normal mengambil nilai yang lebih tinggi.</li>
              <li>Adjustment total untuk perhitungan matriks dibatasi maksimal 150%; untuk kasus risiko ekstrem wajib dilakukan evaluasi penerimaan klien secara terpisah.</li>
              <li>Pekerjaan rekonstruksi pembukuan / penyusunan laporan keuangan terpisah dari jasa audit independen.</li>
              <li>Out-of-pocket expenses (OPE) dicatat terpisah agar harga jasa profesional tetap transparan dan akuntabel.</li>
              <li>Simulasi margin memakai faktor biaya internal {internalCostFactor}% dari HBR sebagai nilai acuan baku default.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 6: FORMAT SURAT PROPOSAL FORMAL */}
      {activeTab === 'proposal' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-8 space-y-5 text-slate-800 text-xs">
          <div className="border-b border-slate-200 pb-4 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{appName}</div>
            <h3 className="text-base font-bold text-slate-900 uppercase mt-0.5">Penawaran Imbalan Jasa Audit Independen</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{institutionName || 'Kantor Akuntan Publik'} · Standar Profesional Akuntan Publik (SPAP)</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Kepada Yth:</span>
              <span className="font-bold text-slate-900 text-sm">{clientName || '[Nama Calon Klien Belum Diisi]'}</span>
              <span className="block text-slate-500 text-[11px]">Tahun Buku {fiscalYear}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-medium text-[11px]">Kategori Penugasan:</span>
              <span className="font-semibold text-slate-800">{firstYearAudit.startsWith('Ya') ? 'Tahun Pertama (Initial)' : 'Perikatan Berulang'}</span>
              <span className="block text-slate-500 text-[11px]">Zona Tarif: {hbrZone}</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/70 border-b border-slate-200 font-semibold text-slate-700 text-[11px]">
                <tr>
                  <th className="p-3">Uraian Ruang Lingkup Jasa</th>
                  <th className="p-3 text-center">Estimasi Jam Tim</th>
                  <th className="p-3 text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                <tr>
                  <td className="p-3 font-sans">
                    <div className="font-semibold text-slate-900">Imbalan Jasa Audit Laporan Keuangan Independen</div>
                    <div className="text-slate-500 text-[11px]">Berdasarkan Base Fee Omzet Tier {baseFeeEvaluation.tier?.code || '-'} dan PDP IAPI No. 3/2024 (Adj {adjustments.cappedAdj}%)</div>
                  </td>
                  <td className="p-3 text-center font-bold text-blue-700">{teamCalculations.adjustedHours.toFixed(1)} Jam</td>
                  <td className="p-3 text-right font-medium text-slate-900">{formatRupiah(results.feeNormal)}</td>
                </tr>
                {bufferPercent > 0 && (
                  <tr>
                    <td className="p-3 font-sans">
                      <div className="font-semibold text-slate-900">Buffer Penyesuaian Ruang Lingkup & Risiko ({bufferPercent}%)</div>
                    </td>
                    <td className="p-3 text-center text-slate-400">-</td>
                    <td className="p-3 text-right font-medium text-slate-900">{formatRupiah(results.feePenawaran - results.feeNormal)}</td>
                  </tr>
                )}
                {outOfPocketExpenses > 0 && (
                  <tr>
                    <td className="p-3 font-sans">
                      <div className="font-semibold text-slate-900">Biaya Pengeluaran Langsung (Out-of-Pocket Expenses / OPE)</div>
                    </td>
                    <td className="p-3 text-center text-slate-400">-</td>
                    <td className="p-3 text-right font-medium text-slate-900">{formatRupiah(outOfPocketExpenses)}</td>
                  </tr>
                )}
                {vatPercent > 0 && (
                  <tr>
                    <td className="p-3 font-sans text-slate-600">Pajak Pertambahan Nilai (PPN {vatPercent}%)</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                    <td className="p-3 text-right text-slate-700">{formatRupiah(results.ppnAmount)}</td>
                  </tr>
                )}
                <tr className="bg-amber-50/70 font-bold text-slate-900 text-sm">
                  <td className="p-3 text-amber-950 font-sans">TOTAL PENAWARAN AUDIT</td>
                  <td className="p-3 text-center text-blue-800">{teamCalculations.adjustedHours.toFixed(1)} Jam</td>
                  <td className="p-3 text-right text-amber-900 font-black">{formatRupiah(results.totalPenawaran)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2">
            <div className="font-semibold text-slate-900 text-xs">Rekomendasi Termin Pembayaran:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <span className="font-bold block text-slate-900 font-sans">Termin I (30%)</span>
                <span className="font-bold text-slate-800">{formatRupiah(Math.round(results.totalPenawaran * 0.3))}</span>
                <span className="block text-[10px] text-slate-400 font-sans mt-0.5">Penandatanganan Surat Perikatan</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <span className="font-bold block text-slate-900 font-sans">Termin II (50%)</span>
                <span className="font-bold text-slate-800">{formatRupiah(Math.round(results.totalPenawaran * 0.5))}</span>
                <span className="block text-[10px] text-slate-400 font-sans mt-0.5">Penyerahan Draft Laporan Auditor</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <span className="font-bold block text-slate-900 font-sans">Termin III (20%)</span>
                <span className="font-bold text-slate-800">{formatRupiah(Math.round(results.totalPenawaran * 0.2))}</span>
                <span className="block text-[10px] text-slate-400 font-sans mt-0.5">Penyerahan Final Audit Report</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeeCalculator;
