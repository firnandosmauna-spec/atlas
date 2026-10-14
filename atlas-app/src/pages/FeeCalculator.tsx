import React, { useState, useMemo } from 'react';
import { 
  Calculator, Users, DollarSign, ShieldAlert, 
  FileText, Copy, Printer, Check, RotateCcw, Plus, Trash2, 
  Building2, TrendingUp, HelpCircle
} from 'lucide-react';
import { useAppConfigStore } from '../store/appConfigStore';
import { useEngagementStore } from '../store/engagementStore';

interface TeamMemberRate {
  id: string;
  role: string;
  ratePerHour: number;
  planningHours: number;
  testingHours: number;
  reportingHours: number;
}

interface OperationalExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
}

const INITIAL_TEAM: TeamMemberRate[] = [
  { id: '1', role: 'Partner / Penanggung Jawab', ratePerHour: 0, planningHours: 0, testingHours: 0, reportingHours: 0 },
  { id: '2', role: 'Manajer / Reviewer', ratePerHour: 0, planningHours: 0, testingHours: 0, reportingHours: 0 },
  { id: '3', role: 'Senior Auditor / Ketua Tim', ratePerHour: 0, planningHours: 0, testingHours: 0, reportingHours: 0 },
  { id: '4', role: 'Junior Auditor / Anggota', ratePerHour: 0, planningHours: 0, testingHours: 0, reportingHours: 0 },
];

const FeeCalculator: React.FC = () => {
  const { appName, institutionName } = useAppConfigStore();
  const { engagements } = useEngagementStore();

  // General Client & Engagement Information (tanpa data mock)
  const [clientName, setClientName] = useState('');
  const [engagementType, setEngagementType] = useState<'Tahun Pertama' | 'Perikatan Berulang'>('Perikatan Berulang');
  const [accountingStandard, setAccountingStandard] = useState('SAK Umum');
  const [annualRevenue, setAnnualRevenue] = useState<number>(0);
  const [totalAssets, setTotalAssets] = useState<number>(0);

  // Active Tab: team, benchmark, expenses, proposal
  const [activeTab, setActiveTab] = useState<'team' | 'benchmark' | 'expenses' | 'proposal'>('team');

  // Team & Billing Rates
  const [teamMembers, setTeamMembers] = useState<TeamMemberRate[]>(INITIAL_TEAM);

  // Operational Expenses (OPE) - kosong tanpa mock data
  const [expenses, setExpenses] = useState<OperationalExpense[]>([]);

  // Risk Multipliers & Tax
  const [inherentRiskLevel, setInherentRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [internalControlQuality, setInternalControlQuality] = useState<'good' | 'moderate' | 'weak'>('good');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(11); // 11% or 12%
  const [applyWht23, setApplyWht23] = useState<boolean>(true); // PPh 23 (2%)

  // UI States
  const [isCopied, setIsCopied] = useState(false);

  // Reset form to clean state
  const handleReset = () => {
    setClientName('');
    setEngagementType('Perikatan Berulang');
    setAccountingStandard('SAK Umum');
    setAnnualRevenue(0);
    setTotalAssets(0);
    setTeamMembers(INITIAL_TEAM.map(m => ({ ...m })));
    setExpenses([]);
    setInherentRiskLevel('low');
    setInternalControlQuality('good');
    setDiscountPercent(0);
    setVatRate(11);
    setApplyWht23(true);
  };

  // Risk multiplier factor calculation
  const riskMultiplier = useMemo(() => {
    let factor = 1.0;
    if (engagementType === 'Tahun Pertama') factor += 0.15; // +15% untuk verifikasi saldo awal
    if (inherentRiskLevel === 'medium') factor += 0.05;
    if (inherentRiskLevel === 'high') factor += 0.15;
    if (internalControlQuality === 'moderate') factor += 0.05;
    if (internalControlQuality === 'weak') factor += 0.15;
    return parseFloat(factor.toFixed(2));
  }, [engagementType, inherentRiskLevel, internalControlQuality]);

  // Calculations
  const calculations = useMemo(() => {
    let totalPlanningHours = 0;
    let totalTestingHours = 0;
    let totalReportingHours = 0;
    let basePersonnelCost = 0;

    teamMembers.forEach(member => {
      const memberHours = member.planningHours + member.testingHours + member.reportingHours;
      totalPlanningHours += member.planningHours;
      totalTestingHours += member.testingHours;
      totalReportingHours += member.reportingHours;
      basePersonnelCost += (memberHours * member.ratePerHour);
    });

    const totalHours = totalPlanningHours + totalTestingHours + totalReportingHours;

    // Adjusted personnel cost with risk multiplier
    const adjustedPersonnelCost = Math.round(basePersonnelCost * riskMultiplier);

    // Operational expenses (OPE)
    const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);

    // Gross Audit Fee before discount
    const grossFee = adjustedPersonnelCost + totalExpenses;

    // Discount
    const discountAmount = Math.round((grossFee * discountPercent) / 100);
    const netAuditFee = grossFee - discountAmount;

    // Taxes
    const vatAmount = Math.round((netAuditFee * vatRate) / 100);
    const wht23Amount = applyWht23 ? Math.round(netAuditFee * 0.02) : 0;

    // Final invoice billed to client (Net Fee + PPN)
    const totalInvoice = netAuditFee + vatAmount;

    // Cash received by KAP after PPh 23 deduction
    const cashReceived = totalInvoice - wht23Amount;

    // Benchmark comparison (Indikator Panduan IAPI berbasis Aset/Omset)
    const benchmarkBase = Math.max(annualRevenue, totalAssets);
    let benchmarkMin = 0;
    let benchmarkRec = 0;
    let benchmarkMax = 0;

    if (benchmarkBase > 0) {
      if (benchmarkBase < 10000000000) {
        // < 10M
        benchmarkMin = 20000000;
        benchmarkRec = 35000000;
        benchmarkMax = 55000000;
      } else if (benchmarkBase < 50000000000) {
        // 10M - 50M
        benchmarkMin = 45000000;
        benchmarkRec = 75000000;
        benchmarkMax = 120000000;
      } else if (benchmarkBase < 250000000000) {
        // 50M - 250M
        benchmarkMin = 90000000;
        benchmarkRec = 160000000;
        benchmarkMax = 250000000;
      } else {
        // > 250M
        benchmarkMin = 180000000;
        benchmarkRec = 320000000;
        benchmarkMax = 650000000;
      }
    }

    return {
      totalPlanningHours,
      totalTestingHours,
      totalReportingHours,
      totalHours,
      basePersonnelCost,
      adjustedPersonnelCost,
      totalExpenses,
      grossFee,
      discountAmount,
      netAuditFee,
      vatAmount,
      wht23Amount,
      totalInvoice,
      cashReceived,
      benchmarkBase,
      benchmarkMin,
      benchmarkRec,
      benchmarkMax,
    };
  }, [teamMembers, expenses, riskMultiplier, discountPercent, vatRate, applyWht23, annualRevenue, totalAssets]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  };

  const handleAddMember = () => {
    const newMember: TeamMemberRate = {
      id: Date.now().toString(),
      role: 'Auditor Tambahan / Spesialis',
      ratePerHour: 0,
      planningHours: 0,
      testingHours: 0,
      reportingHours: 0
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    if (teamMembers.length <= 1) return;
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleUpdateMember = (id: string, field: keyof TeamMemberRate, value: any) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleAddExpense = () => {
    const newExp: OperationalExpense = {
      id: Date.now().toString(),
      category: 'Biaya Lapangan / Transportasi',
      description: '',
      amount: 0
    };
    setExpenses([...expenses, newExp]);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleUpdateExpense = (id: string, field: keyof OperationalExpense, value: any) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleCopyProposal = () => {
    const text = `
RINGKASAN PENAWARAN IMBALAN JASA (FEE) AUDIT
Kantor Akuntan Publik: ${institutionName || 'KAP Independen'}
Klien: ${clientName.trim() ? clientName : '[Belum Diisi]'}
Tipe Perikatan: ${engagementType} (${accountingStandard})

RINCIAN PERHITUNGAN:
1. Total Alokasi Jam Kerja: ${calculations.totalHours} Jam
   - Perencanaan: ${calculations.totalPlanningHours} Jam
   - Pengujian Substantif: ${calculations.totalTestingHours} Jam
   - Pelaporan & Penyelesaian: ${calculations.totalReportingHours} Jam
2. Biaya Personel Tim Audit: ${formatRupiah(calculations.adjustedPersonnelCost)}
3. Biaya Operasional / OPE: ${formatRupiah(calculations.totalExpenses)}
4. Faktor Risiko & Kompleksitas: ${riskMultiplier}x

RINGKASAN BIAYA & PERPAJAKAN:
- Nilai Imbalan Jasa Audit (Netto): ${formatRupiah(calculations.netAuditFee)}
- PPN (${vatRate}%): ${formatRupiah(calculations.vatAmount)}
${applyWht23 ? `- Potongan PPh 23 (2%): -${formatRupiah(calculations.wht23Amount)}` : ''}
- Total Nilai Tagihan Kontrak: ${formatRupiah(calculations.totalInvoice)}

Termin Pembayaran:
- Termin I (30% saat penandatanganan perikatan): ${formatRupiah(calculations.totalInvoice * 0.3)}
- Termin II (50% saat penyerahan draft laporan): ${formatRupiah(calculations.totalInvoice * 0.5)}
- Termin III (20% saat penyerahan laporan final): ${formatRupiah(calculations.totalInvoice * 0.2)}
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans min-w-0">
      
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Calculator size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Kalkulator Fee Audit
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kalkulator perhitungan imbalan jasa audit independen berdasarkan jam kerja tim, alokasi risiko, dan regulasi IAPI.
          </p>
        </div>

        {/* Action button header */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors min-h-[44px]"
            title="Bersihkan seluruh isian form ke nilai awal"
          >
            <RotateCcw size={15} />
            <span>Reset Form</span>
          </button>

          <button
            type="button"
            onClick={handleCopyProposal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors min-h-[44px]"
            title="Salin rekapitulasi proposal"
          >
            {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span>{isCopied ? 'Tersalin' : 'Salin Rekap'}</span>
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors min-h-[44px]"
          >
            <Printer size={16} />
            <span>Cetak Proposal</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calculator (8 cols) and Sticky Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Client & Engagement Parameters */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
              <Building2 size={16} className="text-slate-500" />
              Identitas Klien & Kerangka Perikatan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Entitas / Klien
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                  placeholder="Masukkan nama klien / perusahaan..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe Perikatan
                </label>
                <select
                  value={engagementType}
                  onChange={(e: any) => setEngagementType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                >
                  <option value="Perikatan Berulang">Perikatan Berulang (Recurring)</option>
                  <option value="Tahun Pertama">Tahun Pertama / Initial Audit (+15%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Standar Akuntansi
                </label>
                <select
                  value={accountingStandard}
                  onChange={(e) => setAccountingStandard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                >
                  <option value="SAK ETAP / EP">SAK ETAP / EP (Entitas Privat)</option>
                  <option value="SAK Umum">SAK Umum / PSAK Non-Tbk</option>
                  <option value="IFRS / PSAK Lengkap">IFRS / Emiten Terbuka (Tbk)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Muat dari Perikatan Aktif (Opsional)
                </label>
                <select
                  onChange={(e) => {
                    const found = engagements.find(eng => eng.id === e.target.value);
                    if (found) {
                      setClientName(found.clientName);
                      if (found.engagementType) {
                        setEngagementType(found.engagementType as any);
                      }
                      if (found.accountingStandard) {
                        setAccountingStandard(found.accountingStandard);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-colors"
                  defaultValue=""
                >
                  <option value="" disabled>-- Pilih perikatan yang tersimpan --</option>
                  {engagements.map(eng => (
                    <option key={eng.id} value={eng.id}>{eng.clientName} ({eng.id})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all min-h-[44px] whitespace-nowrap ${
                activeTab === 'team' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={16} />
              <span>Jam & Tim Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('benchmark')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all min-h-[44px] whitespace-nowrap ${
                activeTab === 'benchmark' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp size={16} />
              <span>Benchmark Aset/Omset</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all min-h-[44px] whitespace-nowrap ${
                activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign size={16} />
              <span>Biaya Operasional (OPE)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('proposal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all min-h-[44px] whitespace-nowrap ${
                activeTab === 'proposal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={16} />
              <span>Format Proposal</span>
            </button>
          </div>

          {/* TAB 1: TEAM & HOURS */}
          {activeTab === 'team' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Alokasi Waktu & Tarif Tim Audit</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Rincian jam kerja per tahapan audit dan tarif penagihan per jam (*billing rate*).</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors min-h-[36px]"
                >
                  <Plus size={14} />
                  <span>Tambah Personel</span>
                </button>
              </div>

              {/* Responsive Table for Team Members */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3 sm:px-4">Posisi Tim</th>
                      <th className="py-2.5 px-2 text-right">Tarif / Jam</th>
                      <th className="py-2.5 px-2 text-center" title="Pra-perikatan & Perencanaan">Planing</th>
                      <th className="py-2.5 px-2 text-center" title="Pengujian Substantif">Fieldwork</th>
                      <th className="py-2.5 px-2 text-center" title="Penyelesaian & Pelaporan">Laporan</th>
                      <th className="py-2.5 px-2 text-center font-bold">Total Jam</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamMembers.map((member) => {
                      const totalMemberHours = member.planningHours + member.testingHours + member.reportingHours;
                      const memberTotalCost = totalMemberHours * member.ratePerHour;
                      return (
                        <tr key={member.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 sm:px-4">
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                              className="w-full bg-transparent font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none"
                              placeholder="Nama peran / posisi"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              step="50000"
                              placeholder="0"
                              value={member.ratePerHour || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'ratePerHour', Number(e.target.value) || 0)}
                              className="w-24 text-right bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={member.planningHours || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'planningHours', Number(e.target.value) || 0)}
                              className="w-14 text-center bg-slate-50 px-1.5 py-1 rounded border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={member.testingHours || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'testingHours', Number(e.target.value) || 0)}
                              className="w-14 text-center bg-slate-50 px-1.5 py-1 rounded border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={member.reportingHours || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'reportingHours', Number(e.target.value) || 0)}
                              className="w-14 text-center bg-slate-50 px-1.5 py-1 rounded border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center font-semibold text-slate-800">
                            {totalMemberHours}j
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                            {formatRupiah(memberTotalCost)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="Hapus baris"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-900">
                      <td className="py-2.5 px-4">Total Biaya Personel</td>
                      <td></td>
                      <td className="py-2.5 px-2 text-center text-xs">{calculations.totalPlanningHours}j</td>
                      <td className="py-2.5 px-2 text-center text-xs">{calculations.totalTestingHours}j</td>
                      <td className="py-2.5 px-2 text-center text-xs">{calculations.totalReportingHours}j</td>
                      <td className="py-2.5 px-2 text-center text-blue-700">{calculations.totalHours}j</td>
                      <td className="py-2.5 px-3 text-right text-blue-700">{formatRupiah(calculations.basePersonnelCost)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Multiplier Adjustment Banner */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                <div>
                  Faktor Risiko & Kompleksitas: <span className="font-bold text-slate-900">{riskMultiplier}x</span>
                  <span className="text-slate-400 ml-1.5">({engagementType === 'Tahun Pertama' ? '+15% Tahun Pertama' : 'Perikatan Berulang'})</span>
                </div>
                <div className="font-semibold text-slate-900">
                  Biaya Personel Disesuaikan: <span className="text-blue-600 font-bold">{formatRupiah(calculations.adjustedPersonnelCost)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BENCHMARK IAPI */}
          {activeTab === 'benchmark' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Benchmark Fee Berbasis Ukuran Entitas (IAPI)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pedoman rentang imbalan jasa wajar menurut regulasi penentuan fee audit di Indonesia untuk menghindari perang tarif (*undercutting*).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Pendapatan / Omset Tahunan (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={annualRevenue || ''}
                    onChange={(e) => setAnnualRevenue(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">{formatRupiah(annualRevenue)}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Aset Entitas (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={totalAssets || ''}
                    onChange={(e) => setTotalAssets(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">{formatRupiah(totalAssets)}</span>
                </div>
              </div>

              {/* Benchmark Indicator Cards */}
              {calculations.benchmarkBase > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="text-[11px] text-slate-500 uppercase font-semibold">Batas Minimum (Floor)</div>
                      <div className="text-base font-bold text-slate-900 mt-1">{formatRupiah(calculations.benchmarkMin)}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Batas aman terendah SPM 1</div>
                    </div>

                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 ring-1 ring-blue-500/20">
                      <div className="text-[11px] text-blue-700 uppercase font-semibold">Rekomendasi Wajar</div>
                      <div className="text-base font-bold text-blue-900 mt-1">{formatRupiah(calculations.benchmarkRec)}</div>
                      <div className="text-[10px] text-blue-700/70 mt-1">Estimasi pasar kompetitif</div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="text-[11px] text-slate-500 uppercase font-semibold">Kompleksitas Tinggi</div>
                      <div className="text-base font-bold text-slate-900 mt-1">{formatRupiah(calculations.benchmarkMax)}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Audit multi-cabang/restrukturisasi</div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <HelpCircle size={15} />
                      Kesesuaian Tarif Tim Saat Ini
                    </div>
                    <p>
                      Perhitungan berbasis jam kerja Anda menghasilkan estimasi fee netto <span className="font-bold">{formatRupiah(calculations.netAuditFee)}</span>. 
                      {calculations.netAuditFee === 0 ? (
                        <span className="text-slate-600 ml-1">Silakan isi alokasi jam dan tarif tim pada tab pertama untuk membandingkan.</span>
                      ) : calculations.netAuditFee < calculations.benchmarkMin ? (
                        <span className="text-rose-700 font-semibold ml-1">Peringatan: Nilai ini berada di bawah batas minimum wajar IAPI.</span>
                      ) : calculations.netAuditFee > calculations.benchmarkMax ? (
                        <span className="text-amber-800 font-semibold ml-1">Nilai ini termasuk segmen premium / kompleksitas tinggi.</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold ml-1">Nilai ini sangat seimbang dan berada di rentang wajar standar pasar audit.</span>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
                  <div className="font-medium text-slate-700">Data Ukuran Entitas Belum Diisi</div>
                  <p>Silakan isi nilai omset tahunan atau total aset entitas klien pada kolom di atas untuk mengaktifkan perhitungan benchmark IAPI.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPERATIONAL EXPENSES (OPE) & RISK */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Biaya Operasional Langsung (Out of Pocket Expenses)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Biaya non-personel yang ditagihkan dalam pelaksanaan perikatan.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExpense}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors min-h-[36px]"
                  >
                    <Plus size={14} />
                    <span>Tambah Biaya</span>
                  </button>
                </div>

                {expenses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                    Belum ada rincian biaya operasional (OPE). Klik tombol "Tambah Biaya" di atas jika terdapat biaya perjalanan dinas lapangan, transportasi, atau konfirmasi pihak ketiga.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((exp) => (
                      <div key={exp.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/40">
                        <div className="w-full sm:w-1/3">
                          <input
                            type="text"
                            value={exp.category}
                            onChange={(e) => handleUpdateExpense(exp.id, 'category', e.target.value)}
                            className="w-full text-xs font-semibold text-slate-800 bg-white px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none"
                            placeholder="Kategori Biaya"
                          />
                        </div>
                        <div className="w-full sm:w-1/2">
                          <input
                            type="text"
                            value={exp.description}
                            onChange={(e) => handleUpdateExpense(exp.id, 'description', e.target.value)}
                            className="w-full text-xs text-slate-600 bg-white px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none"
                            placeholder="Deskripsi pengeluaran..."
                          />
                        </div>
                        <div className="w-full sm:w-36">
                          <input
                            type="number"
                            step="100000"
                            placeholder="0"
                            value={exp.amount || ''}
                            onChange={(e) => handleUpdateExpense(exp.id, 'amount', Number(e.target.value) || 0)}
                            className="w-full text-xs text-right font-mono font-medium text-slate-900 bg-white px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpense(exp.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 self-center"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-800">
                  <span>Total Biaya Operasional (OPE):</span>
                  <span className="text-sm font-bold text-slate-900">{formatRupiah(calculations.totalExpenses)}</span>
                </div>
              </div>

              {/* Risk Factors & Taxes Control */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm">Faktor Risiko & Ketentuan Pajak</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tingkat Risiko Bawaan Entitas
                    </label>
                    <select
                      value={inherentRiskLevel}
                      onChange={(e: any) => setInherentRiskLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none"
                    >
                      <option value="low">Rendah (Low Risk - Stabil)</option>
                      <option value="medium">Sedang (Moderate Risk - Dinamis)</option>
                      <option value="high">Tinggi (High Risk - Transaksi Rumit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kualitas Pengendalian Internal (SPI)
                    </label>
                    <select
                      value={internalControlQuality}
                      onChange={(e: any) => setInternalControlQuality(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none"
                    >
                      <option value="good">Efektif / Matang (Good SPI)</option>
                      <option value="moderate">Cukup Efektif (Moderate)</option>
                      <option value="weak">Kurang Terstruktur (Weak SPI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Diskon / Penyesuaian Komersial (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="0"
                        value={discountPercent || ''}
                        onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tarif PPN
                    </label>
                    <select
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none"
                    >
                      <option value={11}>PPN 11% (Ketentuan Berjalan)</option>
                      <option value={12}>PPN 12% (Rencana Penyesuaian)</option>
                      <option value={0}>Bebas PPN / Non-PKP (0%)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={applyWht23}
                      onChange={(e) => setApplyWht23(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span>Perhitungkan Pemotongan PPh 23 Jasa Audit (2%) oleh Klien</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FORMAL PROPOSAL PREVIEW */}
          {activeTab === 'proposal' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6 text-slate-800">
              {/* Proposal Header */}
              <div className="border-b border-slate-200 pb-5 text-center">
                <div className="text-xs uppercase font-bold text-slate-400 tracking-widest">{appName}</div>
                <h3 className="text-lg font-bold text-slate-900 uppercase mt-1">Penawaran Imbalan Jasa Audit Independen</h3>
                <p className="text-xs text-slate-500 mt-0.5">{institutionName || 'Kantor Akuntan Publik'} · Standar Profesional Akuntan Publik (SPAP)</p>
              </div>

              {/* Scope & Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Kepada Yth:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {clientName.trim() ? clientName : '[Nama Klien Belum Diisi]'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">Kerangka Audit:</span>
                  <span className="font-semibold text-slate-800">{accountingStandard} ({engagementType})</span>
                </div>
              </div>

              {/* Proposal Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-3">Uraian Ruang Lingkup</th>
                      <th className="p-3 text-center">Alokasi Waktu</th>
                      <th className="p-3 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">Jasa Personel Audit Independen</div>
                        <div className="text-slate-500 text-[11px]">Tim Partner, Manajer, Senior, dan Asisten Auditor ({riskMultiplier}x risk factor)</div>
                      </td>
                      <td className="p-3 text-center font-medium">{calculations.totalHours} Jam Kerja</td>
                      <td className="p-3 text-right font-medium">{formatRupiah(calculations.adjustedPersonnelCost)}</td>
                    </tr>
                    <tr>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">Biaya Pengeluaran Langsung (OPE)</div>
                        <div className="text-slate-500 text-[11px]">Transportasi, sampling fisik, surat konfirmasi pihak ketiga</div>
                      </td>
                      <td className="p-3 text-center text-slate-400">-</td>
                      <td className="p-3 text-right font-medium">{formatRupiah(calculations.totalExpenses)}</td>
                    </tr>
                    {discountPercent > 0 && (
                      <tr className="text-rose-700 bg-rose-50/40">
                        <td className="p-3 font-medium">Penyesuaian Komersial / Diskon ({discountPercent}%)</td>
                        <td className="p-3 text-center">-</td>
                        <td className="p-3 text-right">- {formatRupiah(calculations.discountAmount)}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="p-3">Total Fee Audit Netto (Sebelum PPN)</td>
                      <td className="p-3 text-center">{calculations.totalHours} Jam</td>
                      <td className="p-3 text-right text-blue-700">{formatRupiah(calculations.netAuditFee)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-600">PPN {vatRate}%</td>
                      <td></td>
                      <td className="p-3 text-right text-slate-700">{formatRupiah(calculations.vatAmount)}</td>
                    </tr>
                    {applyWht23 && (
                      <tr className="text-slate-500">
                        <td className="p-3">Estimasi Pemotongan PPh Pasal 23 (2%) oleh Klien</td>
                        <td></td>
                        <td className="p-3 text-right">({formatRupiah(calculations.wht23Amount)})</td>
                      </tr>
                    )}
                    <tr className="bg-blue-50/80 font-bold text-slate-900 text-sm">
                      <td className="p-3 text-blue-900">Total Tagihan Penagihan (Kontrak)</td>
                      <td></td>
                      <td className="p-3 text-right text-blue-900">{formatRupiah(calculations.totalInvoice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Terms */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="font-semibold text-slate-900">Rekomendasi Termin Pembayaran:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-semibold block text-slate-800">Termin I (30%)</span>
                    <span>{formatRupiah(calculations.totalInvoice * 0.3)}</span>
                    <span className="block text-[10px] text-slate-400">Saat penandatanganan</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-semibold block text-slate-800">Termin II (50%)</span>
                    <span>{formatRupiah(calculations.totalInvoice * 0.5)}</span>
                    <span className="block text-[10px] text-slate-400">Saat penyerahan draft</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-semibold block text-slate-800">Termin III (20%)</span>
                    <span>{formatRupiah(calculations.totalInvoice * 0.2)}</span>
                    <span className="block text-[10px] text-slate-400">Penerbitan final report</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Section: Sticky Fee Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Ringkasan Imbalan Jasa
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-2">
                {formatRupiah(calculations.totalInvoice)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Total kontrak tagihan (Termasuk PPN {vatRate}%)
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Waktu Audit:</span>
                <span className="font-semibold text-slate-900">{calculations.totalHours} Jam</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Biaya Personel Tim:</span>
                <span className="font-medium text-slate-900">{formatRupiah(calculations.adjustedPersonnelCost)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Biaya Langsung (OPE):</span>
                <span className="font-medium text-slate-900">{formatRupiah(calculations.totalExpenses)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-rose-600">
                  <span>Diskon Komersial ({discountPercent}%):</span>
                  <span>- {formatRupiah(calculations.discountAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-semibold text-slate-900">
                <span>Fee Audit Netto:</span>
                <span className="text-blue-600 font-bold">{formatRupiah(calculations.netAuditFee)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>PPN ({vatRate}%):</span>
                <span>{formatRupiah(calculations.vatAmount)}</span>
              </div>

              {applyWht23 && (
                <div className="flex justify-between items-center text-slate-500">
                  <span>Potongan PPh 23 (2%):</span>
                  <span>- {formatRupiah(calculations.wht23Amount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-emerald-700 bg-emerald-50/60 p-2 rounded">
                <span>Kas Diterima KAP:</span>
                <span className="font-bold">{formatRupiah(calculations.cashReceived)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleCopyProposal}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                <span>{isCopied ? 'Tersalin ke Clipboard' : 'Salin Penawaran Fee'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('proposal')}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
              >
                <FileText size={15} />
                <span>Lihat Proposal Lengkap</span>
              </button>
            </div>

          </div>

          {/* Tips Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <ShieldAlert size={14} className="text-blue-600" />
              Kepatuhan SPM 1 & IAPI
            </div>
            <p className="leading-relaxed">
              Penetapan imbalan jasa audit wajib mencerminkan alokasi jam kerja yang memadai agar mutu pelaksanaan audit memenuhi standar independensi dan kecukupan bukti.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FeeCalculator;
