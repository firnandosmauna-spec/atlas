import { useState, useRef, useEffect, useMemo } from 'react';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import type { Engagement, WorksheetA110 } from '../../../store/engagementStore';
import { useEngagementStore } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import A110ImportModal from '../../../components/A110ImportModal';
import { 
  exportA110ToExcel, 
  exportA110ToJSON 
} from '../../../utils/a110ExcelService';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Save, 
  Upload, 
  Download, 
  Printer, 
  ExternalLink, 
  FileSpreadsheet, 
  Building2, 
  ChevronDown, 
  Check, 
  X,
  FileText,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export interface SAChecklistItem {
  id: string;
  code: string;
  title: string;
  description: string;
}

export const RELEVANT_SA_STANDARDS: SAChecklistItem[] = [
  {
    id: 'spm1',
    code: 'SPM 1',
    title: 'Standar Pengendalian Mutu No 1',
    description: 'Sistem pengendalian mutu KAP atas penugasan audit dan asurans'
  },
  {
    id: 'sa210',
    code: 'SA 210',
    title: 'SA 210 : Persetujuan Atas Ketentuan Perikatan Audit',
    description: 'Prakondisi suatu audit dan kesepahaman ketentuan penugasan'
  },
  {
    id: 'sa220',
    code: 'SA 220',
    title: 'SA 220 : Pengendalian Mutu Audit atas Laporan keuangan',
    description: 'Tanggung jawab rekan perikatan atas kualitas dan review mutu audit'
  },
  {
    id: 'sa300',
    code: 'SA 300',
    title: 'SA 300 : Perencanaan Suatu Audit atas Laporan Keuangan',
    description: 'Penyusunan strategi menyeluruh dan rencana audit yang terarah'
  }
];

export const STANDARD_INDUSTRIES = [
  'Pertanian, Kehutanan, dan Perikanan',
  'Pertambangan dan Penggalian',
  'Industri Pengolahan / Manufaktur',
  'Pengadaan Listrik, Gas, Uap/Air Panas, dan Udara Dingin',
  'Pengelolaan Air, Air Limbah, Pengelolaan Sampah & Daur Ulang',
  'Konstruksi',
  'Perdagangan Besar dan Eceran; Reparasi Mobil dan Sepeda Motor',
  'Pengangkutan dan Pergudangan / Logistik',
  'Penyediaan Akomodasi dan Penyediaan Makan Minum (Perhotelan & F&B)',
  'Informasi dan Komunikasi / Teknologi & Startup',
  'Aktivitas Keuangan dan Asuransi (Perbankan, Pembiayaan, Asuransi)',
  'Real Estat / Properti',
  'Aktivitas Profesional, Ilmiah, dan Teknis (Konsultan, Hukum, dll)',
  'Aktivitas Penyewaan, Ketenagakerjaan, Agen Perjalanan & Penunjang Usaha',
  'Administrasi Pemerintahan, Pertahanan, dan Jaminan Sosial Wajib',
  'Pendidikan',
  'Aktivitas Kesehatan Manusia dan Aktivitas Sosial / Rumah Sakit & Farmasi',
  'Kesenian, Hiburan, dan Rekreasi',
  'Aktivitas Jasa Lainnya',
  'Organisasi Nirlaba / Yayasan / Lembaga Keagamaan',
  'Badan Layanan Umum (BLU) / BUMD / BUMN'
];

export const PREVIOUS_REPORTING_CRITERIA_OPTIONS = [
  'Entitas berdiri sejak lama dan Laporan keuangan periode sebelumnya tersedia dan telah diaudit auditor independen lain atau auditor yang bersangkutan',
  'Entitas berdiri sejak lama dan Laporan keuangan periode sebelumnya tersedia dan telah diaudit oleh KAP yang sama (perikatan berulang)',
  'Entitas baru berdiri dan laporan keuangan periode sebelumnya belum pernah diaudit',
  'Laporan keuangan periode sebelumnya terdapat opini modifikasian / salah saji material',
  'Terdapat pembatasan lingkup audit pada periode audit sebelumnya',
  'Laporan keuangan periode sebelumnya tidak tersedia atau tidak diaudit'
];

export const OWNERSHIP_STATUS_OPTIONS = [
  'Perusahaan Swasta Non-Go Public',
  'Perusahaan Terbuka (Tbk) / Emiten Publik',
  'Badan Usaha Milik Negara (BUMN) / BUMD',
  'Badan Layanan Umum (BLU) / Lembaga Pemerintah',
  'Organisasi Nirlaba / Yayasan / Koperasi'
];

const A110 = () => {
  const context = useOutletContext<{ engagement?: Engagement }>() || {};
  const { id: paramId } = useParams<{ id: string }>();
  const storeEngagements = useEngagementStore(state => state.engagements);
  const engagement = context.engagement || storeEngagements.find(e => e.id === paramId);

  const updateEngagement = useEngagementStore(state => state.updateEngagement);
  const addAuditLog = useEngagementStore(state => state.addAuditLog);
  
  const wsData = engagement?.worksheetA110 || {};

  // Form State matching ATLAS A.110 standard
  const [industry, setIndustry] = useState(wsData.industry || engagement?.clientIndustry || 'Industri Pengolahan / Manufaktur');
  const [industryRisk, setIndustryRisk] = useState<'low' | 'high'>(wsData.industryRisk || 'low');

  const [ownershipStatus, setOwnershipStatus] = useState(wsData.clientOwnershipStatus || 'Perusahaan Swasta Non-Go Public');
  const [ownershipRisk, setOwnershipRisk] = useState<'low' | 'high'>(wsData.ownershipRisk || 'low');

  const [accountingStandardRisk, setAccountingStandardRisk] = useState<'low' | 'high'>(wsData.accountingStandardRisk || 'high');

  const [prevCriteria, setPrevCriteria] = useState(
    wsData.previousReportingIssueCriteria || 
    'Entitas berdiri sejak lama dan Laporan keuangan periode sebelumnya tersedia dan telah diaudit auditor independen lain atau auditor yang bersangkutan'
  );

  const [evals, setEvals] = useState<Record<string, 'low' | 'high' | ''>>({
    'A.1101': wsData.evaluations?.['A.1101'] || 'high',
    'A.1102': wsData.evaluations?.['A.1102'] || 'high',
    'A.1103': wsData.evaluations?.['A.1103'] || 'low',
    'A.1104': wsData.evaluations?.['A.1104'] || (engagement?.engagementType === 'First Year' ? 'high' : 'low')
  });

  const [decision, setDecision] = useState<'Accept' | 'Reject' | null>(wsData.decision ?? 'Accept');
  
  const [mitigationExplanation, setMitigationExplanation] = useState(
    wsData.riskMitigationExplanation || 
    'KAP akan menambahkan ahli yg berpengalaman dalam penghitungan imbalan paska kerja.\nAkan dilibatkan seorang EQCR untuk membantu analisis rencana manajemen terkait isu going concern'
  );

  const [boardOfDirectors, setBoardOfDirectors] = useState(wsData.boardOfDirectors || 'Direktur Utama: Ir. Budi Santoso\nKomisaris Utama: Dr. Hendrawan');
  const [usagePurpose, setUsagePurpose] = useState(wsData.usagePurpose || 'Pertanggungjawaban RUPS dan Fasilitas Kredit Perbankan');

  // UI state
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const industryDropdownRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (industryDropdownRef.current && !industryDropdownRef.current.contains(target)) {
        setIsIndustryDropdownOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered industries
  const filteredIndustries = useMemo(() => {
    if (!industry.trim()) return STANDARD_INDUSTRIES;
    const query = industry.toLowerCase();
    return STANDARD_INDUSTRIES.filter(item => item.toLowerCase().includes(query));
  }, [industry]);

  // Overall Risk auto-computation: High if any of the 7 criteria is High
  const calculatedOverallRisk: 'low' | 'high' = useMemo(() => {
    const allRisks = [
      industryRisk,
      ownershipRisk,
      accountingStandardRisk,
      evals['A.1101'],
      evals['A.1102'],
      evals['A.1103'],
      engagement?.engagementType === 'First Year' ? evals['A.1104'] : 'low'
    ];
    if (allRisks.some(val => val === 'high')) {
      return 'high';
    }
    return 'low';
  }, [industryRisk, ownershipRisk, accountingStandardRisk, evals, engagement?.engagementType]);

  // SA Checklist State (berfungsi menentukan kelengkapan KKP Complete vs Uncompleted)
  const [saChecklist, setSaChecklist] = useState<Record<string, boolean>>(() => {
    if (wsData.saChecklist && typeof wsData.saChecklist === 'object') {
      return {
        spm1: wsData.saChecklist.spm1 ?? true,
        sa210: wsData.saChecklist.sa210 ?? true,
        sa220: wsData.saChecklist.sa220 ?? true,
        sa300: wsData.saChecklist.sa300 ?? true
      };
    }
    return {
      spm1: true,
      sa210: true,
      sa220: true,
      sa300: true
    };
  });

  const handleToggleSA = (id: string) => {
    setSaChecklist(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setIsSaved(false);
  };

  const handleSetAllSA = (checked: boolean) => {
    setSaChecklist({
      spm1: checked,
      sa210: checked,
      sa220: checked,
      sa300: checked
    });
    setIsSaved(false);
  };

  const checkedSACount = useMemo(() => {
    return RELEVANT_SA_STANDARDS.filter(item => saChecklist[item.id] === true).length;
  }, [saChecklist]);

  const isAllSAChecked = checkedSACount === RELEVANT_SA_STANDARDS.length;

  // Completion calculation for sync
  const isAllAnswered = 
    !!industryRisk && 
    !!ownershipRisk && 
    !!accountingStandardRisk && 
    !!evals['A.1101'] && 
    !!evals['A.1102'] && 
    !!evals['A.1103'] && 
    (engagement?.engagementType !== 'First Year' || !!evals['A.1104']);

  const isDecisionMade = decision !== null;
  const isMitigationFilled = calculatedOverallRisk === 'high' ? mitigationExplanation.trim().length > 0 : true;
  
  // Status is Completed when all answered, decision is Accept/Ya, mitigation is provided when high risk, AND all relevant SA standards are checked
  const isCompleted = isAllAnswered && isDecisionMade && isMitigationFilled && decision === 'Accept' && isAllSAChecked;
  const statusKKP = isCompleted ? 'Completed' : 'Uncompleted';

  // Handle Save
  const handleSave = () => {
    if (!engagement) return;

    const updatedA110: WorksheetA110 = {
      industry,
      boardOfDirectors,
      usagePurpose,
      evaluations: evals,
      overallRisk: calculatedOverallRisk,
      anomalyExplanation: mitigationExplanation,
      decision,
      decisionReason: mitigationExplanation,
      status: (statusKKP as any),
      clientOwnershipStatus: ownershipStatus,
      ownershipRisk,
      industryRisk,
      accountingStandardRisk,
      previousReportingIssueCriteria: prevCriteria,
      riskMitigationExplanation: mitigationExplanation,
      saChecklist,
      isCompleted
    };

    updateEngagement(engagement.id, {
      worksheetA110: updatedA110,
      clientIndustry: industry
    });

    addAuditLog({
      engagementId: engagement.id,
      user: engagement.auditorName || 'Auditor',
      action: 'Saved Worksheet',
      module: 'A.110 Analisis Penerimaan Klien',
      record: `Kertas kerja A.110 disimpan dengan status: ${statusKKP}`
    });

    setIsSaved(true);
    showToast('Kertas Kerja A.110 berhasil disimpan!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportExcel = () => {
    if (!engagement) return;
    setIsExportMenuOpen(false);
    try {
      exportA110ToExcel(engagement, {
        industry,
        boardOfDirectors,
        usagePurpose,
        evaluations: evals,
        overallRisk: calculatedOverallRisk,
        anomalyExplanation: mitigationExplanation,
        decision,
        decisionReason: mitigationExplanation,
        status: statusKKP,
        preparedBy: engagement.auditorName || 'Senior Auditor',
        reviewedBy: engagement.managerName || 'Audit Manager',
        auditPeriod: engagement.auditPeriod || engagement.fiscalYear || '2025',
        accountingStandard: engagement.accountingStandard || 'SAK EP'
      });
      showToast('Kertas Kerja A.110 berhasil diekspor ke Excel (.xlsx)');
    } catch (err: any) {
      alert(`Gagal mengekspor Excel: ${err?.message || 'Terjadi kesalahan'}`);
    }
  };

  const handleExportJSON = () => {
    if (!engagement) return;
    setIsExportMenuOpen(false);
    try {
      exportA110ToJSON(engagement, {
        industry,
        boardOfDirectors,
        usagePurpose,
        evaluations: evals,
        overallRisk: calculatedOverallRisk,
        anomalyExplanation: mitigationExplanation,
        decision,
        decisionReason: mitigationExplanation,
        status: statusKKP,
        preparedBy: engagement.auditorName,
        reviewedBy: engagement.managerName,
        auditPeriod: engagement.auditPeriod || '2025',
        accountingStandard: engagement.accountingStandard || 'SAK EP'
      });
      showToast('Data A.110 berhasil diekspor ke JSON (.json)');
    } catch (err: any) {
      alert(`Gagal mengekspor JSON: ${err?.message || 'Terjadi kesalahan'}`);
    }
  };

  if (!engagement) {
    return (
      <div className="p-8 text-center text-slate-500 font-sans">
        Data perikatan tidak ditemukan. Silakan kembali ke daftar perikatan.
      </div>
    );
  }

  return (
    <WorksheetContainer
      title="A.110 Analisis Risiko Penerimaan & Keberlanjutan Hubungan Klien"
      worksheetId="A.110"
      status={statusKKP}
      engagementId={engagement.id}
    >
      <div className="space-y-6 font-sans">
        
        {/* ── TOP ACTION BAR ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Indeks KKP:</span>
            <span className="px-2.5 py-1 bg-blue-50 text-atlas-blue font-bold text-xs rounded-md border border-blue-200">
              A.110
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-600 font-medium">SPM 1, SA 210, SA 220, SA 300</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export Menu */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                <Download size={14} />
                <span>Export</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 text-xs">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-600" />
                    <span>Export Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <FileText size={15} className="text-blue-600" />
                    <span>Export JSON (.json)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsExportMenuOpen(false); window.print(); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer border-t border-slate-100"
                  >
                    <Printer size={15} className="text-slate-600" />
                    <span>Cetak Kertas Kerja</span>
                  </button>
                </div>
              )}
            </div>

            {/* Import */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200"
            >
              <Upload size={14} />
              <span>Import</span>
            </button>

            {/* Simpan */}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              {isSaved ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Save size={15} />}
              <span>{isSaved ? 'Tersimpan' : 'Simpan Kertas Kerja'}</span>
            </button>
          </div>
        </div>

        {/* ── TOAST NOTIFICATION ── */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in duration-150">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── BANNER HEADER & STATUS ── */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  SPM 1, SA 210, SA 220, SA 300
                </span>
                <span className="text-slate-400 text-xs">|</span>
                <span className="text-xs text-slate-500 font-medium">Standar Pengendalian Mutu & Auditing</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
                ANALISIS RISIKO PENERIMAAN DAN KEBERLANJUTAN HUBUNGAN DENGAN KLIEN
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl">
                Evaluasi komprehensif atas integritas manajemen, standar pelaporan, independensi, serta kompetensi personel KAP untuk memutuskan penerimaan atau penolakan perikatan.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xs ${
                statusKKP === 'Completed' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {statusKKP === 'Completed' ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>STATUS: COMPLETED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-rose-600" />
                    <span>STATUS: UNCOMPLETED</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── SA YANG RELEVAN (SESUAI STANDAR LEMBAR KERJA ATLAS DENGAN FUNGSI CHECKLIST KERTAS KERJA) ── */}
          <div className="pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
            <div className="font-bold text-slate-800 sm:w-44 shrink-0 flex items-center justify-between sm:justify-start gap-2 pt-1.5">
              <span className="text-slate-900 font-bold">SA yang relevan</span>
              <span className="text-slate-600 font-bold">:</span>
            </div>

            {/* Checklist Items Container */}
            <div className="flex-1 space-y-1.5">
              {RELEVANT_SA_STANDARDS.map((item) => {
                const isChecked = !!saChecklist[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSA(item.id)}
                    className={`group flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none ${
                      isChecked 
                        ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70' 
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {/* Checkbox Icon Box */}
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                        isChecked 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' 
                          : 'bg-white border-slate-300 group-hover:border-slate-400'
                      }`}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>

                      <div className="leading-tight truncate">
                        {item.id === 'spm1' ? (
                          <span className={`font-medium ${isChecked ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                            Standar Pengendalian Mutu No 1
                          </span>
                        ) : (
                          <span className={isChecked ? 'text-slate-900' : 'text-slate-600'}>
                            <span className="font-semibold text-slate-900">{item.code}</span> : {item.title.split(' : ')[1]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Pill on the Right */}
                    <div className="shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isChecked 
                          ? 'bg-emerald-100/80 text-emerald-800' 
                          : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {isChecked ? (
                          <>
                            <Check size={10} className="text-emerald-700" />
                            <span>Memenuhi</span>
                          </>
                        ) : (
                          <>
                            <X size={10} className="text-slate-500" />
                            <span>Belum</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── TABEL UTAMA: 7 KRITERIA EVALUASI PENERIMAAN KLIEN ── */}
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Parameter / Kriteria Evaluasi Penerimaan</th>
                  <th className="py-3 px-4 w-40 text-center border-l border-slate-200">Referensi</th>
                  <th className="py-3 px-4 w-48 text-center border-l border-slate-200">Hasil Analisis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* 1. Jenis Usaha Klien */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-600">1</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">Jenis Usaha Klien <span className="text-rose-500">*</span></span>
                      <div className="relative w-full sm:w-80" ref={industryDropdownRef}>
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          onFocus={() => setIsIndustryDropdownOpen(true)}
                          className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 bg-slate-50/60 focus:bg-white focus:border-atlas-blue outline-none"
                          placeholder="Pilih atau ketik industri..."
                        />
                        {isIndustryDropdownOpen && (
                          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                            {filteredIndustries.map(item => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => { setIndustry(item); setIsIndustryDropdownOpen(false); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-slate-700 font-medium"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Home
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setIndustryRisk('low')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          industryRisk === 'low' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setIndustryRisk('high')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          industryRisk === 'high' 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </td>
                </tr>

                {/* 2. Status Kepemilikan Klien */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-600">2</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">Status Kepemilikan Klien <span className="text-rose-500">*</span></span>
                      <select
                        value={ownershipStatus}
                        onChange={(e) => setOwnershipStatus(e.target.value)}
                        className="w-full sm:w-80 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 bg-slate-50/60 focus:bg-white focus:border-atlas-blue outline-none font-medium"
                      >
                        {OWNERSHIP_STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Home
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setOwnershipRisk('low')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          ownershipRisk === 'low' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setOwnershipRisk('high')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          ownershipRisk === 'high' 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </td>
                </tr>

                {/* 3. Standar Akuntansi Keuangan */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-600">3</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-900 block">Standar Akuntansi Keuangan yang digunakan oleh klien <span className="text-rose-500">*</span></span>
                        <span className="text-[11px] text-slate-500">Kerangka pelaporan: <strong>{engagement.accountingStandard || 'SAK EP'}</strong></span>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded border border-slate-200 self-start sm:self-center">
                        {engagement.accountingStandard || 'SAK EP'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Home
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setAccountingStandardRisk('low')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          accountingStandardRisk === 'low' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountingStandardRisk('high')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          accountingStandardRisk === 'high' 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </td>
                </tr>

                {/* 4. Isu Pelaporan Keuangan terdahulu */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-600 align-top">4</td>
                  <td className="py-3.5 px-4 space-y-2">
                    <div>
                      <span className="font-semibold text-slate-900 block">Isu Pelaporan Keuangan terdahulu <span className="text-rose-500">*</span></span>
                    </div>
                    <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-2.5">
                      <span className="text-[11px] font-bold text-slate-500 italic block mb-1">Pilih kriteria evaluasi pelaporan terdahulu:</span>
                      <select
                        value={prevCriteria}
                        onChange={(e) => setPrevCriteria(e.target.value)}
                        className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:border-atlas-blue outline-none leading-relaxed font-medium"
                      >
                        {PREVIOUS_REPORTING_CRITERIA_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200 align-middle">
                    <Link
                      to={`/workspace/${engagement.id}/worksheet/a1101`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-atlas-blue hover:bg-blue-100 border border-blue-200 transition-colors"
                      title="Buka Kertas Kerja Pendukung A.1101"
                    >
                      <span>A1101</span>
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200 align-middle">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setEvals({...evals, 'A.1101': 'low'})}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          evals['A.1101'] === 'low' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvals({...evals, 'A.1101': 'high'})}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          evals['A.1101'] === 'high' 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </td>
                </tr>

                {/* 5. Integritas Manajemen */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-600">5</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">Integritas manajemen</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Mengevaluasi itikad baik pimpinan, rekam jejak kepatuhan hukum, dan ketiadaan indikasi fraud.</p>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <Link
                      to={`/workspace/${engagement.id}/worksheet/a1102`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-atlas-blue hover:bg-blue-100 border border-blue-200 transition-colors"
                      title="Buka Kertas Kerja Pendukung A.1102"
                    >
                      <span>A1102</span>
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setEvals({...evals, 'A.1102': 'low'})}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          evals['A.1102'] === 'low' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvals({...evals, 'A.1102': 'high'})}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          evals['A.1102'] === 'high' 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </td>
                </tr>

                {/* 6. Kompetensi & Independensi Personel KAP */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-600">6</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">
                      Kompetensi, Ketersediaan waktu, dan Independensi personel KAP untuk penunjukan Tim Perikatan
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Memastikan kecukupan kompetensi auditor, ketersediaan jam kerja, dan independensi tim audit.</p>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <Link
                      to={`/workspace/${engagement.id}/worksheet/a1103`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-atlas-blue hover:bg-blue-100 border border-blue-200 transition-colors"
                      title="Buka Kertas Kerja Pendukung A.1103"
                    >
                      <span>A1103</span>
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setEvals({...evals, 'A.1103': 'low'})}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          evals['A.1103'] === 'low' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvals({...evals, 'A.1103': 'high'})}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          evals['A.1103'] === 'high' 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </td>
                </tr>

                {/* 7. Komunikasi dengan Auditor Pendahulu */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-600">7</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <span className="font-semibold text-slate-900">Komunikasi dengan Auditor Pendahulu</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {engagement.engagementType === 'First Year' 
                            ? 'Wajib dilakukan konfirmasi profesional untuk perikatan tahun pertama.' 
                            : 'Perikatan berulang (Recurring engagement) — Tidak diwajibkan konfirmasi pendahulu.'}
                        </p>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold border border-slate-200">
                        {engagement.engagementType === 'First Year' ? 'Tahun Pertama' : 'Perikatan Berulang'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <Link
                      to={`/workspace/${engagement.id}/worksheet/a1104`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-atlas-blue hover:bg-blue-100 border border-blue-200 transition-colors"
                      title="Buka Kertas Kerja Pendukung A.1104"
                    >
                      <span>A1104</span>
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-200">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setEvals({...evals, 'A.1104': 'low'})}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          evals['A.1104'] === 'low' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvals({...evals, 'A.1104': 'high'})}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          evals['A.1104'] === 'high' 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </td>
                </tr>

                {/* ── SUMMARY ROW: RINGKASAN RISIKO PENERIMAAN ── */}
                <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-900">
                  <td className="py-3.5 px-4 text-center text-slate-300">★</td>
                  <td className="py-3.5 px-4" colSpan={2}>
                    <span className="uppercase tracking-wider">
                      Ringkasan Risiko Penerimaan dan Keberlanjutan Hubungan Dengan Klien
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center border-l border-slate-800">
                    <span className={`inline-block px-4 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider shadow-sm ${
                      calculatedOverallRisk === 'high' 
                        ? 'bg-rose-600 text-white ring-2 ring-rose-400' 
                        : 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                    }`}>
                      {calculatedOverallRisk === 'high' ? 'High' : 'Low'}
                    </span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* ── BAGIAN KEPUTUSAN PENERIMAAN KLIEN ── */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">
                APAKAH ANDA AKAN MENERIMA ATAU MELANJUTKAN HUBUNGAN DENGAN KLIEN ?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih keputusan perikatan berdasarkan hasil evaluasi risiko di atas dan pertimbangan profesional auditor.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {/* YA / TIDAK Buttons */}
              <div className="inline-flex rounded-lg border border-slate-300 p-1 bg-slate-100 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setDecision('Accept')}
                  className={`px-5 py-2 text-xs font-black rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    decision === 'Accept'
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Check size={14} />
                  <span>YA (TERIMA)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('Reject')}
                  className={`px-5 py-2 text-xs font-black rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    decision === 'Reject'
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <X size={14} />
                  <span>TIDAK (TOLAK)</span>
                </button>
              </div>

              {/* Template Laporan Keuangan Link */}
              <Link
                to={`/workspace/${engagement.id}/trial-balance`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-atlas-blue border border-blue-200 font-bold text-xs rounded-lg transition-colors shadow-2xs"
                title="Buka Modul Template Data Keuangan & Trial Balance"
              >
                <FileSpreadsheet size={15} className="text-atlas-blue" />
                <span>TEMPLATE LAPORAN KEUANGAN</span>
              </Link>
            </div>
          </div>

          {/* ── BAGIAN MITIGASI RISIKO ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                JELASKAN BAGAIMANA AUDITOR MELAKUKAN MITIGASI RISIKO ?
              </label>
              {calculatedOverallRisk === 'high' && (
                <span className="text-[11px] text-rose-600 font-bold">
                  * Wajib diisi karena terdapat parameter risiko tinggi (High)
                </span>
              )}
            </div>

            <textarea
              value={mitigationExplanation}
              onChange={(e) => setMitigationExplanation(e.target.value)}
              rows={4}
              placeholder="Jelaskan langkah mitigasi risiko, contoh: KAP akan menambahkan ahli berpengalaman dalam penghitungan aktuaria imbalan paska kerja. Akan dilibatkan seorang EQCR untuk membantu analisis rencana manajemen terkait isu going concern..."
              className="w-full border border-slate-200 rounded-lg p-3.5 text-xs text-slate-800 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none leading-relaxed bg-slate-50/40 focus:bg-white font-medium"
            />

            <p className="text-[11px] text-slate-500 italic pt-1">
              * Kesimpulan dapat diperoleh berdasarkan hasil analisis kertas kerja indeks A1101 s.d A1104.
            </p>
          </div>

          {/* ── SUSUNAN MANAJEMEN & INFORMASI PERIKATAN TAMBAHAN (COLLAPSIBLE / RINGKAS) ── */}
          <details className="pt-2 text-xs text-slate-600 border-t border-slate-100">
            <summary className="font-semibold text-slate-700 cursor-pointer hover:text-atlas-blue flex items-center gap-1.5 py-1">
              <Building2 size={14} />
              <span>Detail Informasi Manajemen & Dewan Direksi</span>
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Susunan Dewan Komisaris & Direksi Utama
                </label>
                <textarea
                  value={boardOfDirectors}
                  onChange={(e) => setBoardOfDirectors(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded p-2 text-xs text-slate-800 bg-slate-50/60 focus:bg-white focus:border-atlas-blue outline-none"
                  placeholder="Direktur Utama, Komisaris, dll..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tujuan Penggunaan Laporan Keuangan
                </label>
                <textarea
                  value={usagePurpose}
                  onChange={(e) => setUsagePurpose(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded p-2 text-xs text-slate-800 bg-slate-50/60 focus:bg-white focus:border-atlas-blue outline-none"
                  placeholder="Tujuan audit, fasilitas kredit, RUPS, dsb..."
                />
              </div>
            </div>
          </details>

        </div>

      </div>

      {/* ── IMPORT MODAL ── */}
      <A110ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(data, fileName) => {
          if (data.industry) setIndustry(data.industry);
          if (data.clientOwnershipStatus) setOwnershipStatus(data.clientOwnershipStatus);
          if (data.evaluations) setEvals(prev => ({ ...prev, ...data.evaluations }));
          if (data.decision) setDecision(data.decision);
          if (data.riskMitigationExplanation) setMitigationExplanation(data.riskMitigationExplanation);
          if (data.saChecklist) setSaChecklist(data.saChecklist);
          showToast(`Data A.110 berhasil diimpor dari ${fileName}!`);
        }}
        currentClientName={engagement.clientName}
      />
    </WorksheetContainer>
  );
};

export default A110;
