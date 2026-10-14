import React, { useState, useMemo } from 'react';
import { 
  Calculator, Users, DollarSign, ShieldAlert, 
  FileText, Copy, Printer, Check, RotateCcw,
  Building2, TrendingUp, HelpCircle, Layers,
  BookOpen, ChevronRight, Sliders, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { useAppConfigStore } from '../store/appConfigStore';
import { useEngagementStore } from '../store/engagementStore';

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
  { level: 'Senior', defaultAllocation: 30, hbrJabodetabek: 1850000 ? 185000 : 185000, hbrLuarJabodetabek: 155000 },
  { level: 'Junior', defaultAllocation: 40, hbrJabodetabek: 125000, hbrLuarJabodetabek: 87500 },
];

const FeeCalculator: React.FC = () => {
  const { appName, institutionName } = useAppConfigStore();
  const { engagements } = useEngagementStore();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix' | 'adjustments' | 'rates' | 'guideline' | 'proposal'>('calculator');

  // =========================================================
  // INPUT DATA CALON KLIEN (IMAGE 1)
  // =========================================================
  const [clientName, setClientName] = useState('');
  const [fiscalYear, setFiscalYear] = useState<number>(2026);
  const [annualRevenue, setAnnualRevenue] = useState<number>(0);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [transactionVolume, setTransactionVolume] = useState<number>(0);
  const [branchCount, setBranchCount] = useState<number>(1);
  
  // Dropdown Conditions (Image 3)
  const [inventoryCondition, setInventoryCondition] = useState<string>('Tidak material / tidak ada');
  const [industryComplexity, setIndustryComplexity] = useState<string>('Rendah');
  const [bookkeepingQuality, setBookkeepingQuality] = useState<string>('Normal');
  const [engagementRisk, setEngagementRisk] = useState<string>('Rendah');
  const [firstYearAudit, setFirstYearAudit] = useState<string>('Tidak');
  const [deadlineDays, setDeadlineDays] = useState<number>(60);
  
  // Pricing Parameters
  const [hbrZone, setHbrZone] = useState<'Jabodetabek' | 'Luar Jabodetabek'>('Luar Jabodetabek');
  const [bufferPercent, setBufferPercent] = useState<number>(10); // default 10%
  const [vatPercent, setVatPercent] = useState<number>(0); // 0%, 11%, 12%
  const [outOfPocketExpenses, setOutOfPocketExpenses] = useState<number>(0);

  // Editable Rates & Allocation Settings (Image 4)
  const [teamRates, setTeamRates] = useState<TeamRateDefinition[]>(DEFAULT_TEAM_RATES);
  const [internalCostFactor, setInternalCostFactor] = useState<number>(60); // default 60%

  // UI Feedback
  const [isCopied, setIsCopied] = useState(false);

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
    setInternalCostFactor(60);
    setTeamRates(DEFAULT_TEAM_RATES);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans min-w-0 space-y-6">
      
      {/* HEADER UTAMA MODEL 2026 */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-amber-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calculator size={14} />
              <span>Model Resmi KAP Fridolinus Peno · 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Kalkulator Fee Audit Berbasis Matriks Omzet & PDP IAPI No. 3/2024
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed italic">
              "Gunakan sebagai estimasi awal. Fee final wajib mempertimbangkan ruang lingkup, risiko, jam kerja, kompetensi tim, standar profesi, dan professional judgment."
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLoadExample}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-amber-200 bg-amber-900/50 hover:bg-amber-900/80 border border-amber-700/50 rounded-lg transition-colors min-h-[44px]"
              title="Isi data sesuai contoh PT ABC pada spreadsheet untuk memverifikasi rumus"
            >
              <ArrowUpRight size={15} />
              <span>Muat Contoh (PT ABC)</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors min-h-[44px]"
              title="Bersihkan seluruh isian form ke nilai awal"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors min-h-[44px]"
            >
              {isCopied ? <Check size={16} className="text-emerald-800" /> : <Copy size={16} />}
              <span>{isCopied ? 'Tersalin' : 'Salin Rekap'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors min-h-[44px]"
            >
              <Printer size={16} />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION: SPREADSHEET SHEETS */}
      <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none text-xs sm:text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'calculator' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders size={16} className="text-blue-600" />
          <span>Kalkulator & Rekapitulasi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers size={16} className="text-amber-600" />
          <span>Matriks Base Fee (Omzet)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('adjustments')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'adjustments' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp size={16} className="text-emerald-600" />
          <span>9 Faktor Penyesuaian</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'rates' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={16} className="text-purple-600" />
          <span>Tarif HBR & Alokasi Tim</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guideline')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'guideline' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen size={16} className="text-rose-600" />
          <span>Panduan & Kebijakan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('proposal')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all min-h-[44px] ${
            activeTab === 'proposal' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={16} className="text-slate-600" />
          <span>Format Surat Proposal</span>
        </button>
      </div>

      {/* TAB 1: KALKULATOR UTAMA (IMAGE 1) */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* KOLOM KIRI: INPUT DATA CALON KLIEN (5 COLS) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="bg-amber-900 text-white px-4 py-3 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Input Data Calon Klien</span>
                <span className="text-[11px] text-amber-200 font-normal">Sheet: Kalkulator Fee</span>
              </div>

              <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                
                {/* Nama Entitas */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Entitas</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Contoh: PT ABC / Nama Calon Klien"
                  />
                </div>

                {/* Tahun Buku & Zona HBR */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tahun Buku</label>
                    <input
                      type="number"
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(Number(e.target.value) || 2026)}
                      className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Zona HBR</label>
                    <select
                      value={hbrZone}
                      onChange={(e: any) => setHbrZone(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none font-medium"
                    >
                      <option value="Luar Jabodetabek">Luar Jabodetabek</option>
                      <option value="Jabodetabek">Jabodetabek</option>
                    </select>
                  </div>
                </div>

                {/* Omzet Tahunan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Omzet Tahunan (Rp)</label>
                    {baseFeeEvaluation.tier && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        Tier {baseFeeEvaluation.tier.code}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="1000000"
                    placeholder="0"
                    value={annualRevenue || ''}
                    onChange={(e) => setAnnualRevenue(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono font-semibold focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">{formatRupiah(annualRevenue)}</span>
                </div>

                {/* Total Aset */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Total Aset (Rp)</label>
                    <span className="text-[10px] font-medium text-emerald-700">Adj: +{adjustments.assetAdj}%</span>
                  </div>
                  <input
                    type="number"
                    step="1000000"
                    placeholder="0"
                    value={totalAssets || ''}
                    onChange={(e) => setTotalAssets(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono font-semibold focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">{formatRupiah(totalAssets)}</span>
                </div>

                {/* Volume Transaksi & Cabang */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Transaksi / Bulan <span className="text-[10px] font-normal text-emerald-700">(+{adjustments.transAdj}%)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={transactionVolume || ''}
                      onChange={(e) => setTransactionVolume(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Lokasi / Cabang <span className="text-[10px] font-normal text-emerald-700">(+{adjustments.branchAdj}%)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={branchCount}
                      onChange={(e) => setBranchCount(Number(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Kondisi Persediaan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kondisi Persediaan <span className="text-[10px] font-normal text-emerald-700">(+{adjustments.invAdj}%)</span>
                  </label>
                  <select
                    value={inventoryCondition}
                    onChange={(e) => setInventoryCondition(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none"
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kompleksitas Industri <span className="text-[10px] font-normal text-emerald-700">(+{adjustments.indAdj}%)</span>
                  </label>
                  <select
                    value={industryComplexity}
                    onChange={(e) => setIndustryComplexity(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none"
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kualitas Pembukuan <span className="text-[10px] font-normal text-emerald-700">({adjustments.bookAdj > 0 ? `+${adjustments.bookAdj}` : adjustments.bookAdj}%)</span>
                  </label>
                  <select
                    value={bookkeepingQuality}
                    onChange={(e) => setBookkeepingQuality(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none"
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Risiko Engagement <span className="text-[10px] font-normal text-emerald-700">(+{adjustments.riskAdj}%)</span>
                    </label>
                    <select
                      value={engagementRisk}
                      onChange={(e) => setEngagementRisk(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none"
                    >
                      <option value="Rendah">Rendah (0%)</option>
                      <option value="Moderate">Moderate (+10%)</option>
                      <option value="Moderate-High">Moderate-High (+20%)</option>
                      <option value="High">High (+30%)</option>
                      <option value="Very High">Very High (+50%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      First-Year Audit <span className="text-[10px] font-normal text-emerald-700">(+{adjustments.firstYearAdj}%)</span>
                    </label>
                    <select
                      value={firstYearAudit}
                      onChange={(e) => setFirstYearAudit(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none"
                    >
                      <option value="Tidak">Tidak - Klien Berulang (0%)</option>
                      <option value="Ya">Ya - First Year Normal (+10%)</option>
                      <option value="Ya - Saldo Awal Kompleks">Ya - Saldo Awal Kompleks (+20%)</option>
                    </select>
                  </div>
                </div>

                {/* Deadline sejak data lengkap */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Deadline Sejak Data Lengkap</label>
                    <span className="text-[10px] font-medium text-emerald-700">+{adjustments.deadlineAdj}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={deadlineDays}
                      onChange={(e) => setDeadlineDays(Number(e.target.value) || 30)}
                      className="w-24 px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none"
                    />
                    <span className="text-slate-500 text-xs">Hari</span>
                    <span className="text-[11px] text-slate-400">
                      ({deadlineDays <= 7 ? '<7 hari (+45%)' : deadlineDays <= 13 ? '7-13 hari (+30%)' : deadlineDays <= 20 ? '14-20 hari (+20%)' : deadlineDays <= 30 ? '21-30 hari (+10%)' : deadlineDays <= 60 ? '31-60 hari (+5%)' : '>60 hari (0%)'})
                    </span>
                  </div>
                </div>

                {/* Buffer, PPN, dan OPE */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Buffer Penawaran</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={bufferPercent}
                        onChange={(e) => setBufferPercent(Number(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded text-slate-900 text-xs font-mono focus:outline-none"
                      />
                      <span className="absolute right-2 top-1.5 text-slate-400 text-xs">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">PPN</label>
                    <select
                      value={vatPercent}
                      onChange={(e) => setVatPercent(Number(e.target.value))}
                      className="w-full px-1.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none"
                    >
                      <option value={0}>0%</option>
                      <option value={11}>11%</option>
                      <option value={12}>12%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Out-of-Pocket</label>
                    <input
                      type="number"
                      step="500000"
                      placeholder="0"
                      value={outOfPocketExpenses || ''}
                      onChange={(e) => setOutOfPocketExpenses(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded text-slate-900 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* KOLOM KANAN: HASIL PERHITUNGAN FEE & RINGKASAN KEPUTUSAN (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* RINGKASAN KEPUTUSAN (BIG CALLOUT CARD IMAGE 1) */}
              <div className="bg-amber-950 text-white p-5 rounded-2xl shadow-md border border-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-900/60 px-2.5 py-1 rounded border border-amber-800">
                    Ringkasan Keputusan Fee
                  </span>
                  <div className="text-xs text-amber-200 mt-2 font-medium">TOTAL PENAWARAN (FINAL QUOTATION)</div>
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-1 tracking-tight">
                    {formatRupiah(results.totalPenawaran)}
                  </div>
                </div>

                <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-800/80 text-xs space-y-1.5 w-full sm:w-auto shrink-0 font-mono">
                  <div className="flex justify-between gap-4 text-slate-300">
                    <span>Fee Normal:</span>
                    <span className="font-semibold text-white">{formatRupiah(results.feeNormal)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-slate-300">
                    <span>Benchmark HBR:</span>
                    <span className="font-semibold text-white">{formatRupiah(results.benchmarkFeeHbr)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-slate-300">
                    <span>Estimasi Biaya Internal:</span>
                    <span className="font-semibold text-white">{formatRupiah(teamCalculations.indicativeInternalCost)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-emerald-400 border-t border-amber-800/80 pt-1 font-bold">
                    <span>Margin Kontribusi:</span>
                    <span>{formatRupiah(results.contributionMargin)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-amber-300 font-bold">
                    <span>Margin %:</span>
                    <span>{results.marginPercent}%</span>
                  </div>
                </div>
              </div>

              {/* TABEL RINCIAN HASIL PERHITUNGAN FEE (IMAGE 1 TENGAH) */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="bg-slate-800 text-white px-4 py-2.5 font-semibold text-xs uppercase tracking-wider flex justify-between items-center">
                  <span>Hasil Perhitungan Fee & Faktor Penyesuaian</span>
                  <span className="text-slate-300 text-[11px]">Model: Omzet vs HBR</span>
                </div>

                <div className="p-4 sm:p-5 space-y-3 text-xs">
                  
                  {/* Base Fee */}
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Base Fee Berdasarkan Omzet</span>
                    <span className="font-mono font-bold text-slate-900">{formatRupiah(baseFeeEvaluation.baseFee)}</span>
                  </div>

                  {/* 9 Baris Adjustment */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1 text-[11px] text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                    <div>Adjustment Aset: <span className="font-semibold text-slate-900">{adjustments.assetAdj}%</span></div>
                    <div>Adjustment Transaksi: <span className="font-semibold text-slate-900">{adjustments.transAdj}%</span></div>
                    <div>Adjustment Cabang: <span className="font-semibold text-slate-900">{adjustments.branchAdj}%</span></div>
                    <div>Adjustment Persediaan: <span className="font-semibold text-slate-900">{adjustments.invAdj}%</span></div>
                    <div>Adjustment Industri: <span className="font-semibold text-slate-900">{adjustments.indAdj}%</span></div>
                    <div>Adjustment Pembukuan: <span className="font-semibold text-slate-900">{adjustments.bookAdj}%</span></div>
                    <div>Adjustment Risiko: <span className="font-semibold text-slate-900">{adjustments.riskAdj}%</span></div>
                    <div>Adjustment First-Year: <span className="font-semibold text-slate-900">{adjustments.firstYearAdj}%</span></div>
                    <div>Adjustment Deadline: <span className="font-semibold text-slate-900">{adjustments.deadlineAdj}%</span></div>
                  </div>

                  {/* Total & Capped Adjustment */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Total Adjustment Terakumulasi</span>
                    <span className="font-mono font-bold text-slate-800">{adjustments.totalAdj}%</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 bg-amber-50/50 px-2 rounded">
                    <div>
                      <span className="font-bold text-amber-900">Adjustment Digunakan (Maks. 150%)</span>
                      <div className="w-32 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className="bg-amber-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min((adjustments.cappedAdj / 150) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-mono font-black text-amber-900 text-sm">{adjustments.cappedAdj}%</span>
                  </div>

                  {/* Perbandingan Fee Matriks vs Benchmark HBR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="text-[11px] text-slate-500 font-medium">Fee Matriks (Base Fee × 1+Adj)</div>
                      <div className="text-base font-bold text-slate-800 mt-0.5">{formatRupiah(results.feeMatriks)}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Berbasis kapasitas omzet klien</div>
                    </div>

                    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 ring-1 ring-blue-500/20">
                      <div className="text-[11px] text-blue-700 font-medium">Benchmark Fee Berbasis HBR</div>
                      <div className="text-base font-bold text-blue-900 mt-0.5">{formatRupiah(results.benchmarkFeeHbr)}</div>
                      <div className="text-[10px] text-blue-600/70 mt-0.5">Berbasis tarif jam tim PDP IAPI</div>
                    </div>
                  </div>

                  {/* Kesimpulan Fee Normal */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 font-mono">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Fee Minimum Internal:</span>
                      <span className="font-semibold">{formatRupiah(results.feeMinimumInternal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-blue-800 bg-blue-50/70 px-2.5 py-1 rounded font-bold">
                      <span>Fee Normal (Ambil Nilai Tertinggi):</span>
                      <span>{formatRupiah(results.feeNormal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-800 font-bold pt-1">
                      <span>Fee Penawaran (+ buffer {bufferPercent}%):</span>
                      <span className="text-amber-800 text-sm">{formatRupiah(results.feePenawaran)}</span>
                    </div>

                    {outOfPocketExpenses > 0 && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Out-of-Pocket Expenses:</span>
                        <span>{formatRupiah(outOfPocketExpenses)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Subtotal Jasa:</span>
                      <span>{formatRupiah(results.subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-500">
                      <span>PPN ({vatPercent}%):</span>
                      <span>{formatRupiah(results.ppnAmount)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-900 font-black text-sm border-t border-slate-200 pt-2">
                      <span>TOTAL PENAWARAN:</span>
                      <span className="text-blue-700">{formatRupiah(results.totalPenawaran)}</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* TABEL ALOKASI JAM & BENCHMARK TIM (IMAGE 1 BAWAH & IMAGE 4) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="bg-slate-800 text-white px-4 py-3 font-semibold text-xs uppercase tracking-wider flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <span>Estimasi Jam & Benchmark Tim (PDP IAPI No. 3 Tahun 2024)</span>
                <span className="block sm:inline sm:ml-2 text-[11px] text-amber-300 font-normal">
                  Zona: {hbrZone} · Biaya Internal Indikatif: {internalCostFactor}%
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                Jam Dasar: {teamCalculations.baseHours}j → Jam Disesuaikan: <span className="text-white font-bold">{teamCalculations.adjustedHours}j</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                    <th className="py-2.5 px-4">Level Personel</th>
                    <th className="py-2.5 px-3 text-center">Alokasi (%)</th>
                    <th className="py-2.5 px-3 text-center">Alokasi Jam</th>
                    <th className="py-2.5 px-4 text-right">HBR / Jam ({hbrZone})</th>
                    <th className="py-2.5 px-4 text-right font-bold text-slate-800">Nilai HBR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {teamCalculations.breakdown.map((row) => (
                    <tr key={row.level} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">{row.level}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{row.defaultAllocation}%</td>
                      <td className="py-2.5 px-3 text-center text-slate-800 font-bold">{row.allocatedHours.toFixed(1)}</td>
                      <td className="py-2.5 px-4 text-right text-slate-700">{formatRupiah(row.effectiveRate)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatRupiah(row.totalHbrAmount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-mono text-xs font-bold text-slate-900">
                  <tr>
                    <td className="py-3 px-4 font-sans">Total Jam & Benchmark HBR</td>
                    <td className="py-3 px-3 text-center">100%</td>
                    <td className="py-3 px-3 text-center text-blue-700">{teamCalculations.adjustedHours.toFixed(1)}j</td>
                    <td></td>
                    <td className="py-3 px-4 text-right text-blue-700">{formatRupiah(teamCalculations.totalHbrFee)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-3 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between gap-2">
              <div>
                *Catatan: Margin bersifat indikatif karena 'Biaya Internal' memakai faktor <span className="font-semibold text-slate-800">{internalCostFactor}%</span> dari HBR sebagai asumsi awal.
              </div>
              <div className="font-semibold text-slate-900">
                Estimasi Biaya Internal Total: <span className="text-amber-800 font-mono">{formatRupiah(teamCalculations.indicativeInternalCost)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MATRIKS BASE FEE BERDASARKAN OMZET (IMAGE 2) */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-950 text-white">
            <div>
              <h2 className="text-base font-bold">Matriks Base Fee Audit Berdasarkan Omzet · 2026</h2>
              <p className="text-xs text-amber-200 mt-0.5">Tabel referensi dasar penentuan base fee dan jam audit dasar berdasarkan tier omzet tahunan klien.</p>
            </div>
            {baseFeeEvaluation.tier && (
              <span className="px-3 py-1 rounded bg-amber-500/30 border border-amber-400 text-amber-200 text-xs font-bold">
                Tier Terpilih: {baseFeeEvaluation.tier.code} ({baseFeeEvaluation.tier.label})
              </span>
            )}
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Rentang Omzet Tahunan</th>
                  <th className="py-2.5 px-4 text-right">Base Fee</th>
                  <th className="py-2.5 px-3 text-center">Jam Audit Dasar</th>
                  <th className="py-2.5 px-3 text-center">Estimasi Hari Tim</th>
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
                        isActive ? 'bg-amber-100/70 font-bold text-amber-950 ring-1 ring-amber-400' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-sans font-bold">{tier.code}</td>
                      <td className="py-2.5 px-3 font-sans">{tier.label}</td>
                      <td className="py-2.5 px-4 text-right">{formatRupiah(tier.baseFee)}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-700">{tier.baseHours}j</td>
                      <td className="py-2.5 px-3 text-center font-sans text-slate-600">{tier.estimatedDays}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-700">{tier.teamComposition}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 italic">
            Catatan: Matriks base fee ini merupakan kebijakan/alat estimasi internal KAP, bukan tarif baku IAPI. Fee final harus dikonfirmasi dengan budget jam, risiko, ruang lingkup, dan professional judgment.
          </div>
        </div>
      )}

      {/* TAB 3: TABEL 9 FAKTOR PENYESUAIAN (IMAGE 3) */}
      {activeTab === 'adjustments' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 bg-slate-800 text-white">
            <h2 className="text-base font-bold">Faktor Penyesuaian Fee Audit (Adjustment Factors)</h2>
            <p className="text-xs text-slate-300 mt-0.5">Pedoman persentase penyesuaian komersial & operasional audit berdasarkan kompleksitas penugasan.</p>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* Faktor 1: ASET */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">1. Faktor Aset</h3>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>≤ Rp5 miliar:</span> <span className="font-bold">0%</span></li>
                <li className="flex justify-between"><span>&gt; Rp5 - 25 miliar:</span> <span className="font-bold">+5%</span></li>
                <li className="flex justify-between"><span>&gt; Rp25 - 100 miliar:</span> <span className="font-bold">+10%</span></li>
                <li className="flex justify-between"><span>&gt; Rp100 - 500 miliar:</span> <span className="font-bold">+15%</span></li>
                <li className="flex justify-between"><span>&gt; Rp500 miliar - Rp1 triliun:</span> <span className="font-bold">+20%</span></li>
                <li className="flex justify-between"><span>&gt; Rp1 - 5 triliun:</span> <span className="font-bold">+25%</span></li>
                <li className="flex justify-between"><span>&gt; Rp5 triliun:</span> <span className="font-bold">+30%</span></li>
              </ul>
            </div>

            {/* Faktor 2: TRANSAKSI */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">2. Volume Transaksi / Bulan</h3>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>&lt; 100 / bulan:</span> <span className="font-bold">0%</span></li>
                <li className="flex justify-between"><span>100 - 500 / bulan:</span> <span className="font-bold">+5%</span></li>
                <li className="flex justify-between"><span>501 - 2.000 / bulan:</span> <span className="font-bold">+10%</span></li>
                <li className="flex justify-between"><span>2.001 - 5.000 / bulan:</span> <span className="font-bold">+15%</span></li>
                <li className="flex justify-between"><span>5.001 - 10.000 / bulan:</span> <span className="font-bold">+20%</span></li>
                <li className="flex justify-between"><span>&gt; 10.000 / bulan:</span> <span className="font-bold">+30%</span></li>
              </ul>
            </div>

            {/* Faktor 3: CABANG */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">3. Jumlah Lokasi / Cabang</h3>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>1 lokasi:</span> <span className="font-bold">0%</span></li>
                <li className="flex justify-between"><span>2 - 3 lokasi:</span> <span className="font-bold">+5%</span></li>
                <li className="flex justify-between"><span>4 - 5 lokasi:</span> <span className="font-bold">+10%</span></li>
                <li className="flex justify-between"><span>6 - 10 lokasi:</span> <span className="font-bold">+15%</span></li>
                <li className="flex justify-between"><span>11 - 20 lokasi:</span> <span className="font-bold">+20%</span></li>
                <li className="flex justify-between"><span>&gt; 20 lokasi:</span> <span className="font-bold">+30%</span></li>
              </ul>
            </div>

            {/* Faktor 4: PERSEDIAAN */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">4. Kondisi Persediaan</h3>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Tidak material / nihil:</span> <span className="font-bold">0%</span></li>
                <li className="flex justify-between"><span>Material, 1 lokasi:</span> <span className="font-bold">+5%</span></li>
                <li className="flex justify-between"><span>Material, 2-5 gudang:</span> <span className="font-bold">+10%</span></li>
                <li className="flex justify-between"><span>Banyak SKU / slow moving:</span> <span className="font-bold">+15%</span></li>
                <li className="flex justify-between"><span>Kompleks / multi lokasi:</span> <span className="font-bold">+25%</span></li>
              </ul>
            </div>

            {/* Faktor 5: INDUSTRI */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">5. Kompleksitas Industri</h3>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Rendah (Jasa sederhana):</span> <span className="font-bold">0%</span></li>
                <li className="flex justify-between"><span>Menengah (Distributor, hotel):</span> <span className="font-bold">+10%</span></li>
                <li className="flex justify-between"><span>Menengah-Tinggi (Konstruksi):</span> <span className="font-bold">+20%</span></li>
                <li className="flex justify-between"><span>Tinggi (Manufaktur, tambang):</span> <span className="font-bold">+30%</span></li>
                <li className="flex justify-between"><span>Sangat Tinggi (Bank, emiten):</span> <span className="font-bold">+45%</span></li>
              </ul>
            </div>

            {/* Faktor 6: PEMBUKUAN */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">6. Kualitas Pembukuan</h3>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Sangat rapi:</span> <span className="font-bold text-emerald-700">-5%</span></li>
                <li className="flex justify-between"><span>Normal:</span> <span className="font-bold">0%</span></li>
                <li className="flex justify-between"><span>Rekonsiliasi belum lengkap:</span> <span className="font-bold">+10%</span></li>
                <li className="flex justify-between"><span>Banyak akun unreconciled:</span> <span className="font-bold">+15%</span></li>
                <li className="flex justify-between"><span>Tidak rapi:</span> <span className="font-bold">+25%</span></li>
                <li className="flex justify-between"><span>LK belum selesai:</span> <span className="font-bold">+30%</span></li>
              </ul>
            </div>

            {/* Faktor 7: RISIKO */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">7. Risiko Engagement</h3>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Rendah:</span> <span className="font-bold">0%</span></li>
                <li className="flex justify-between"><span>Moderate:</span> <span className="font-bold">+10%</span></li>
                <li className="flex justify-between"><span>Moderate-High:</span> <span className="font-bold">+20%</span></li>
                <li className="flex justify-between"><span>High (Going concern/fraud):</span> <span className="font-bold">+30%</span></li>
                <li className="flex justify-between"><span>Very High (Evaluasi Klien):</span> <span className="font-bold">+50%</span></li>
              </ul>
            </div>

            {/* Faktor 8: FIRST YEAR */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">8. First-Year Audit</h3>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Tidak (Recurring client):</span> <span className="font-bold">0%</span></li>
                <li className="flex justify-between"><span>Ya (First-year normal):</span> <span className="font-bold">+10%</span></li>
                <li className="flex justify-between"><span>Ya - Saldo Awal Kompleks:</span> <span className="font-bold">+20%</span></li>
              </ul>
            </div>

            {/* Faktor 9: DEADLINE */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">9. Deadline Data Lengkap</h3>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>&gt; 60 hari:</span> <span className="font-bold">0%</span></li>
                <li className="flex justify-between"><span>31 - 60 hari:</span> <span className="font-bold">+5%</span></li>
                <li className="flex justify-between"><span>21 - 30 hari:</span> <span className="font-bold">+10%</span></li>
                <li className="flex justify-between"><span>14 - 20 hari:</span> <span className="font-bold">+20%</span></li>
                <li className="flex justify-between"><span>7 - 13 hari:</span> <span className="font-bold">+30%</span></li>
                <li className="flex justify-between"><span>&lt; 7 hari (Urgent):</span> <span className="font-bold text-rose-700">+45%</span></li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: TARIF HBR & ALOKASI TIM EDITABLE (IMAGE 4) */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 bg-slate-800 text-white flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold">Tarif Per Jam & Alokasi Tim (PDP IAPI No. 3 Tahun 2024)</h2>
              <p className="text-xs text-slate-300 mt-0.5">Benchmark minimum imbalan jasa audit menurut regulasi dewan pengurus IAPI.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span>Faktor Biaya Internal:</span>
              <input
                type="number"
                min="30"
                max="90"
                value={internalCostFactor}
                onChange={(e) => setInternalCostFactor(Number(e.target.value) || 60)}
                className="w-16 px-2 py-1 bg-white text-slate-900 rounded font-mono font-bold"
              />
              <span>%</span>
            </div>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="py-2.5 px-4">Level Personel</th>
                  <th className="py-2.5 px-3 text-center">Alokasi Jam (%)</th>
                  <th className="py-2.5 px-4 text-right">HBR Jabodetabek</th>
                  <th className="py-2.5 px-4 text-right">HBR Luar Jabodetabek</th>
                  <th className="py-2.5 px-4 text-right">Biaya Internal / Jam (Luar)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {teamRates.map((row, idx) => (
                  <tr key={row.level} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-sans font-bold text-slate-800">{row.level}</td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={row.defaultAllocation}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setTeamRates(prev => prev.map((r, i) => i === idx ? { ...r, defaultAllocation: val } : r));
                        }}
                        className="w-16 text-center bg-slate-50 border border-slate-300 rounded px-1.5 py-1 font-bold text-slate-900"
                      />
                      %
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <input
                        type="number"
                        step="10000"
                        value={row.hbrJabodetabek}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setTeamRates(prev => prev.map((r, i) => i === idx ? { ...r, hbrJabodetabek: val } : r));
                        }}
                        className="w-28 text-right bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <input
                        type="number"
                        step="10000"
                        value={row.hbrLuarJabodetabek}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setTeamRates(prev => prev.map((r, i) => i === idx ? { ...r, hbrLuarJabodetabek: val } : r));
                        }}
                        className="w-28 text-right bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-600">
                      {formatRupiah(Math.round(row.hbrLuarJabodetabek * (internalCostFactor / 100)))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
            Catatan: HBR pada kolom C-D merupakan benchmark minimum sesuai PDP IAPI No. 3 Tahun 2024. Faktor biaya internal {internalCostFactor}% hanya asumsi awal untuk simulasi margin dan wajib disesuaikan dengan struktur biaya aktual KAP.
          </div>
        </div>
      )}

      {/* TAB 5: PANDUAN PENGGUNAAN & PRINSIP KEBIJAKAN (IMAGE 5) */}
      {activeTab === 'guideline' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-6 text-xs text-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900">Panduan Penggunaan Kalkulator Fee Audit</h2>
            <p className="text-xs text-slate-500 mt-0.5">Standar Operasional Prosedur penentuan penawaran imbalan jasa audit pada KAP.</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Langkah Operasional Penentuan Fee:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Langkah 1:</strong> Isi identitas calon klien dan tahun buku penugasan audit.</li>
              <li><strong>Langkah 2:</strong> Masukkan omzet tahunan, total aset, volume transaksi bulanan, dan jumlah cabang untuk menentukan tier dasar dan penyesuaian kuantitatif.</li>
              <li><strong>Langkah 3:</strong> Tentukan kondisi persediaan, kompleksitas industri, pembukuan, risiko perikatan, dan status first-year audit untuk menentukan faktor pengali kualitatif.</li>
              <li><strong>Langkah 4:</strong> Masukkan batas waktu deadline, zona HBR, buffer penawaran, PPN, dan estimasi Out-of-Pocket Expenses (OPE).</li>
              <li><strong>Langkah 5:</strong> Tinjau Fee Matriks dan Benchmark Fee HBR (Prinsip: Fee normal otomatis mengambil nilai yang lebih tinggi untuk menjamin kecukupan alokasi jam kerja).</li>
              <li><strong>Langkah 6:</strong> Tinjau Total Penawaran dan margin indikatif terhadap struktur biaya internal KAP.</li>
              <li><strong>Langkah 7:</strong> Sesuaikan alokasi jam / tarif HBR / biaya internal bila kebijakan KAP memiliki ketentuan khusus.</li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2 text-amber-950">
            <h3 className="font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
              <ShieldAlert size={16} />
              Prinsip Kebijakan Internal KAP:
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Matriks omzet hanya alat estimasi awal; keputusan fee final harus didukung budget jam kerja yang memadai.</li>
              <li>Jika benchmark HBR berbasis jam lebih tinggi daripada fee matriks, model fee normal mengambil nilai yang lebih tinggi.</li>
              <li>Adjustment total untuk perhitungan matriks dibatasi maksimal 150%; untuk kasus risiko ekstrem wajib dilakukan evaluasi penerimaan klien secara terpisah.</li>
              <li>Pekerjaan rekonstruksi pembukuan / penyusunan laporan keuangan terpisah dari jasa audit independen.</li>
              <li>Out-of-pocket expenses (OPE) dicatat terpisah agar harga jasa profesional tetap transparan dan akuntabel.</li>
              <li>Simulasi margin memakai faktor biaya internal 60% dari HBR sebagai nilai acuan baku default.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 6: FORMAT SURAT PROPOSAL FORMAL */}
      {activeTab === 'proposal' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b border-slate-200 pb-5 text-center">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-widest">{appName}</div>
            <h3 className="text-lg font-bold text-slate-900 uppercase mt-1">Penawaran Imbalan Jasa Audit Independen</h3>
            <p className="text-xs text-slate-500 mt-0.5">{institutionName || 'Kantor Akuntan Publik'} · Standar Profesional Akuntan Publik (SPAP)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block font-medium">Kepada Yth:</span>
              <span className="font-bold text-slate-900 text-sm">{clientName || '[Nama Calon Klien Belum Diisi]'}</span>
              <span className="block text-slate-500">Tahun Buku {fiscalYear}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-medium">Kategori Penugasan:</span>
              <span className="font-semibold text-slate-800">{firstYearAudit.startsWith('Ya') ? 'Tahun Pertama (Initial)' : 'Perikatan Berulang'}</span>
              <span className="block text-slate-500">Zona Tarif: {hbrZone}</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="p-3">Uraian Ruang Lingkup Jasa</th>
                  <th className="p-3 text-center">Estimasi Jam Tim</th>
                  <th className="p-3 text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-3 font-sans">
                    <div className="font-semibold text-slate-900">Imbalan Jasa Audit Laporan Keuangan Independen</div>
                    <div className="text-slate-500 text-[11px]">Berdasarkan Base Fee Omzet Tier {baseFeeEvaluation.tier?.code || '-'} dan PDP IAPI No. 3/2024 (Adj {adjustments.cappedAdj}%)</div>
                  </td>
                  <td className="p-3 text-center font-bold text-blue-700">{teamCalculations.adjustedHours} Jam</td>
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
                <tr className="bg-amber-50 font-bold text-slate-900 text-sm">
                  <td className="p-3 text-amber-950 font-sans">TOTAL PENAWARAN AUDIT</td>
                  <td className="p-3 text-center text-blue-800">{teamCalculations.adjustedHours} Jam</td>
                  <td className="p-3 text-right text-amber-900 font-black">{formatRupiah(results.totalPenawaran)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="font-semibold text-slate-900">Rekomendasi Termin Pembayaran:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="font-bold block text-slate-900 font-sans">Termin I (30%)</span>
                <span>{formatRupiah(Math.round(results.totalPenawaran * 0.3))}</span>
                <span className="block text-[10px] text-slate-400 font-sans mt-0.5">Penandatanganan Surat Perikatan</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="font-bold block text-slate-900 font-sans">Termin II (50%)</span>
                <span>{formatRupiah(Math.round(results.totalPenawaran * 0.5))}</span>
                <span className="block text-[10px] text-slate-400 font-sans mt-0.5">Penyerahan Draft Laporan Auditor</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="font-bold block text-slate-900 font-sans">Termin III (20%)</span>
                <span>{formatRupiah(Math.round(results.totalPenawaran * 0.2))}</span>
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
