import { useState, useRef, useEffect, useMemo } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import type { Engagement, WorksheetA110 } from '../../../store/engagementStore';
import { useEngagementStore } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import A110ImportModal from '../../../components/A110ImportModal';
import { 
  exportA110ToExcel, 
  exportA110ToJSON, 
  downloadA110ExcelTemplate, 
  downloadA110CSVTemplate 
} from '../../../utils/a110ExcelService';
import { 
  AlertCircle, 
  CheckCircle, 
  CheckCircle2,
  ShieldAlert, 
  FileSearch, 
  Scale, 
  ChevronDown, 
  Check, 
  X,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Printer,
  Save
} from 'lucide-react';

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

const A110 = () => {
  const context = useOutletContext<{ engagement?: Engagement }>() || {};
  const { id: paramId } = useParams<{ id: string }>();
  const storeEngagements = useEngagementStore(state => state.engagements);
  const engagement = context.engagement || storeEngagements.find(e => e.id === paramId);

  const updateEngagement = useEngagementStore(state => state.updateEngagement);
  const addAuditLog = useEngagementStore(state => state.addAuditLog);
  
  const wsData = engagement?.worksheetA110 || {};
  const [activeTab, setActiveTab] = useState('info');
  const [decision, setDecision] = useState<'Accept' | 'Reject' | null>(wsData.decision || null);
  const [industry, setIndustry] = useState(wsData.industry || engagement?.clientIndustry || '');
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const industryDropdownRef = useRef<HTMLDivElement>(null);
  const industryInputRef = useRef<HTMLInputElement>(null);

  const [alamat, setAlamat] = useState(wsData.boardOfDirectors || '');
  const [usagePurpose, setUsagePurpose] = useState(wsData.usagePurpose || '');
  const [anomalyExplanation, setAnomalyExplanation] = useState(wsData.anomalyExplanation || '');
  const [reason, setReason] = useState(wsData.decisionReason || '');
  const [evals, setEvals] = useState<Record<string, 'low' | 'high' | ''>>({
    'A.1101': wsData.evaluations?.['A.1101'] || '',
    'A.1102': wsData.evaluations?.['A.1102'] || '',
    'A.1103': wsData.evaluations?.['A.1103'] || '',
    'A.1104': wsData.evaluations?.['A.1104'] || ''
  });

  // Export & Import states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (industryDropdownRef.current && !industryDropdownRef.current.contains(target)) {
        setIsIndustryDropdownOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(target)) {
        setIsExportMenuOpen(false);
      }
      if (templateMenuRef.current && !templateMenuRef.current.contains(target)) {
        setIsTemplateMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsIndustryDropdownOpen(false);
        setIsExportMenuOpen(false);
        setIsTemplateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered industry options for combobox
  const filteredIndustries = useMemo(() => {
    if (!industry.trim()) return STANDARD_INDUSTRIES;
    const query = industry.toLowerCase();
    const matches = STANDARD_INDUSTRIES.filter(item => item.toLowerCase().includes(query));
    return matches;
  }, [industry]);

  const handleSelectIndustry = (selected: string) => {
    setIndustry(selected);
    setIsIndustryDropdownOpen(false);
  };

  // Overall Risk auto-computation
  const calculatedOverallRisk: 'low' | 'high' = useMemo(() => {
    const list = Object.values(evals);
    if (list.some(val => val === 'high')) {
      return 'high';
    }
    return 'low';
  }, [evals]);

  const tabs = [
    { id: 'info', name: 'Informasi Klien & Perikatan', icon: <FileSearch size={16} /> },
    { id: 'eval', name: 'Evaluasi & Risiko', icon: <ShieldAlert size={16} /> },
    { id: 'keputusan', name: 'Kesimpulan & Keputusan', icon: <Scale size={16} /> },
  ];

  const handleValidate = () => {
    const missing = [];
    if (!industry.trim()) missing.push('Bidang Usaha / Industri');
    if (!alamat.trim()) missing.push('Susunan Dewan Komisaris & Direksi Utama');
    if (!decision) missing.push('Keputusan Penerimaan Klien (Tab 3)');
    return missing;
  };

  // Snapshot current state for export
  const getCurrentData = () => ({
    industry,
    boardOfDirectors: alamat,
    usagePurpose,
    evaluations: evals,
    overallRisk: calculatedOverallRisk,
    anomalyExplanation,
    decision,
    decisionReason: reason,
    status: wsData.status || 'In Progress',
    preparedBy: engagement?.auditorName || 'Senior Auditor',
    reviewedBy: engagement?.managerName || 'Audit Manager',
    auditPeriod: engagement?.auditPeriod || engagement?.fiscalYear || '2025',
    accountingStandard: engagement?.accountingStandard || 'SAK EP'
  });

  // Export handlers
  const handleExportExcel = () => {
    if (!engagement) return;
    setIsExportMenuOpen(false);
    try {
      exportA110ToExcel(engagement, getCurrentData());
      showToast('Kertas Kerja A.110 berhasil diekspor ke format Excel (.xlsx)');
    } catch (err: any) {
      alert(`Gagal mengekspor Excel: ${err?.message || 'Terjadi kesalahan sistem'}`);
    }
  };

  const handleExportJSON = () => {
    if (!engagement) return;
    setIsExportMenuOpen(false);
    try {
      exportA110ToJSON(engagement, getCurrentData());
      showToast('Data A.110 berhasil diekspor ke file JSON (.json)');
    } catch (err: any) {
      alert(`Gagal mengekspor JSON: ${err?.message || 'Terjadi kesalahan sistem'}`);
    }
  };

  const handlePrint = () => {
    setIsExportMenuOpen(false);
    window.print();
  };

  // Quick save draft
  const handleSaveDraft = () => {
    if (!engagement) return;
    const updatedA110: WorksheetA110 = {
      industry,
      boardOfDirectors: alamat,
      usagePurpose,
      evaluations: evals,
      overallRisk: calculatedOverallRisk,
      anomalyExplanation,
      decision,
      decisionReason: reason,
      status: wsData.status || 'In Progress'
    };

    updateEngagement(engagement.id, {
      worksheetA110: updatedA110,
      clientIndustry: industry
    });

    addAuditLog({
      engagementId: engagement.id,
      user: engagement.auditorName || 'Auditor',
      action: 'Saved Draft',
      module: 'A.110',
      record: 'Perubahan data Kertas Kerja A.110 tersimpan'
    });

    setIsSaved(true);
    showToast('Perubahan Kertas Kerja A.110 berhasil disimpan!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Import handler from modal
  const handleImportSuccess = (imported: Partial<WorksheetA110>, fileName: string) => {
    if (!engagement) return;

    if (imported.industry !== undefined) setIndustry(imported.industry);
    if (imported.boardOfDirectors !== undefined) setAlamat(imported.boardOfDirectors);
    if (imported.usagePurpose !== undefined) setUsagePurpose(imported.usagePurpose);
    if (imported.evaluations) {
      setEvals(prev => ({ ...prev, ...imported.evaluations }));
    }
    if (imported.anomalyExplanation !== undefined) setAnomalyExplanation(imported.anomalyExplanation);
    if (imported.decision !== undefined) setDecision(imported.decision);
    if (imported.decisionReason !== undefined) setReason(imported.decisionReason);

    // Persist immediately to engagement store
    const mergedA110: WorksheetA110 = {
      industry: imported.industry !== undefined ? imported.industry : industry,
      boardOfDirectors: imported.boardOfDirectors !== undefined ? imported.boardOfDirectors : alamat,
      usagePurpose: imported.usagePurpose !== undefined ? imported.usagePurpose : usagePurpose,
      evaluations: imported.evaluations ? { ...evals, ...imported.evaluations } : evals,
      overallRisk: imported.overallRisk || calculatedOverallRisk,
      anomalyExplanation: imported.anomalyExplanation !== undefined ? imported.anomalyExplanation : anomalyExplanation,
      decision: imported.decision !== undefined ? imported.decision : decision,
      decisionReason: imported.decisionReason !== undefined ? imported.decisionReason : reason,
      status: (imported.status as any) || wsData.status || 'In Progress'
    };

    updateEngagement(engagement.id, {
      worksheetA110: mergedA110,
      clientIndustry: mergedA110.industry
    });

    addAuditLog({
      engagementId: engagement.id,
      user: engagement.auditorName || 'Auditor',
      action: 'Imported Data',
      module: 'A.110 Analisis Penerimaan',
      record: `Data diimpor dari file: ${fileName}`
    });

    showToast(`Data Kertas Kerja A.110 berhasil diimpor dari ${fileName}!`);
  };

  const handleAjukanReview = () => {
    if (!engagement) return;
    const updatedA110: WorksheetA110 = {
      industry,
      boardOfDirectors: alamat,
      usagePurpose,
      evaluations: evals,
      overallRisk: calculatedOverallRisk,
      anomalyExplanation,
      decision,
      decisionReason: reason,
      status: 'Pending Review'
    };

    updateEngagement(engagement.id, {
      worksheetA110: updatedA110,
      clientIndustry: industry,
      status: 'Pending Review'
    });

    addAuditLog({
      engagementId: engagement.id,
      user: engagement.auditorName || 'Auditor',
      action: 'Submitted for Review',
      module: 'A.110 Analisis Penerimaan',
      record: 'Status updated to Pending Review'
    });

    showToast('Kertas kerja berhasil diajukan! Notifikasi dikirim ke Partner untuk direview.');
  };

  if (!engagement) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-atlas-blue mx-auto mb-4" />
        <p>Memuat data perikatan...</p>
      </div>
    );
  }

  return (
    <WorksheetContainer
      code="A.110"
      name="Analisis Penerimaan Klien (Client Acceptance)"
      purpose="Modul evaluasi terpadu penerimaan calon klien berdasarkan risiko, independensi, dan benturan kepentingan."
      status={wsData.status || 'In Progress'}
      reviewer={engagement.managerName || 'Menunggu Reviewer'}
      lastUpdated="Baru saja"
      validateCompletion={handleValidate}
    >
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── TOOLBAR: EXPORT, IMPORT, & ACTION STRIP ── */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 mb-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-atlas-blue border border-blue-200">
            KKP A.110
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Analisis Penerimaan & Keberlanjutan Hubungan Klien
          </span>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          
          {/* Template Menu */}
          <div className="relative inline-block text-left" ref={templateMenuRef}>
            <button
              type="button"
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Unduh format template untuk pengisian data A.110"
            >
              <Download size={14} className="text-slate-500" />
              <span>Unduh Template</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform duration-150 ${isTemplateMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTemplateMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-1.5 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 bg-slate-50 rounded-t-xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pilihan Format Template
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      downloadA110ExcelTemplate(engagement.clientName, engagement.fiscalYear);
                      showToast('Template Excel (.xlsx) berhasil diunduh!');
                    }}
                    className="flex w-full items-center px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors cursor-pointer font-medium"
                  >
                    <FileSpreadsheet className="mr-2.5 text-emerald-600" size={16} />
                    <span>Template Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      downloadA110CSVTemplate();
                      showToast('Template CSV (.csv) berhasil diunduh!');
                    }}
                    className="flex w-full items-center px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors cursor-pointer font-medium"
                  >
                    <FileText className="mr-2.5 text-blue-600" size={16} />
                    <span>Template CSV (.csv)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Button */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Import data A.110 dari file Excel (.xlsx), CSV (.csv), atau JSON (.json)"
          >
            <Upload size={14} className="text-emerald-700" />
            <span>Import Data</span>
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative inline-block text-left" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-3.5 py-1.5 bg-atlas-blue hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Ekspor seluruh data kertas kerja A.110"
            >
              <Download size={14} />
              <span>Export A.110</span>
              <ChevronDown size={12} className={`text-blue-200 transition-transform duration-150 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-1.5 w-60 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2.5 bg-slate-50 rounded-t-xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Format Ekspor KKP A.110
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="flex w-full items-center px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors cursor-pointer font-medium"
                  >
                    <FileSpreadsheet className="mr-3 text-emerald-600" size={17} />
                    <div className="text-left">
                      <div className="font-semibold">Excel Workbook (.xlsx)</div>
                      <div className="text-[10px] text-slate-400">Termasuk lembar data & format import</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="flex w-full items-center px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors cursor-pointer font-medium"
                  >
                    <FileCode className="mr-3 text-purple-600" size={17} />
                    <div className="text-left">
                      <div className="font-semibold">Data JSON (.json)</div>
                      <div className="text-[10px] text-slate-400">Format cadangan & integrasi sistem</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex w-full items-center px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors cursor-pointer font-medium border-t border-slate-100"
                  >
                    <Printer className="mr-3 text-slate-600" size={17} />
                    <div className="text-left">
                      <div className="font-semibold">Cetak Kertas Kerja (Print / PDF)</div>
                      <div className="text-[10px] text-slate-400">Tata letak standar pengarsipan audit</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className={`px-3.5 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
              isSaved 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title="Simpan perubahan draf isian saat ini"
          >
            {isSaved ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Save size={14} className="text-slate-500" />}
            <span>{isSaved ? 'Tersimpan' : 'Simpan Draf'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex overflow-x-auto mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-blue-50 text-atlas-blue shadow-sm font-bold' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab 1: Informasi Klien & Perikatan */}
        {activeTab === 'info' && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Informasi Calon Klien & Manajemen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Entitas</label>
                  <input type="text" defaultValue={engagement.clientName} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 focus:outline-none" readOnly />
                </div>

                {/* Combobox: Bidang Usaha / Industri (Dropdown & Manual Input) */}
                <div className="relative" ref={industryDropdownRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="industry-input" className="block text-sm font-bold text-gray-700">
                      Bidang Usaha / Industri <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">Pilih dropdown atau ketik manual</span>
                  </div>

                  <div className="relative flex items-center">
                    <input 
                      id="industry-input"
                      ref={industryInputRef}
                      type="text" 
                      list="industry-options-datalist"
                      value={industry} 
                      onChange={(e) => {
                        setIndustry(e.target.value);
                        setIsIndustryDropdownOpen(true);
                      }}
                      onFocus={() => setIsIndustryDropdownOpen(true)}
                      placeholder="Pilih atau ketik bidang usaha..." 
                      className="w-full border border-gray-300 rounded-lg pl-3 pr-16 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-colors"
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={isIndustryDropdownOpen}
                      aria-controls="industry-options-list"
                    />

                    {/* Action buttons inside right of input */}
                    <div className="absolute right-1 flex items-center space-x-0.5">
                      {industry && (
                        <button
                          type="button"
                          onClick={() => {
                            setIndustry('');
                            industryInputRef.current?.focus();
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                          title="Hapus isian"
                          aria-label="Hapus isian bidang usaha"
                        >
                          <X size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsIndustryDropdownOpen(prev => !prev)}
                        className="p-2 text-gray-400 hover:text-atlas-blue hover:bg-blue-50 rounded-md transition-colors"
                        title="Tampilkan daftar opsi industri"
                        aria-label="Buka menu pilihan bidang usaha"
                      >
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isIndustryDropdownOpen ? 'rotate-180 text-atlas-blue' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Fallback Native Datalist for Browser Accessibility */}
                  <datalist id="industry-options-datalist">
                    {STANDARD_INDUSTRIES.map(item => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>

                  {/* Custom Accessible Dropdown Menu */}
                  {isIndustryDropdownOpen && (
                    <div 
                      id="industry-options-list"
                      role="listbox"
                      className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto text-sm divide-y divide-gray-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="p-2 bg-gray-50/80 sticky top-0 border-b border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        <span>Pilihan Standar ({filteredIndustries.length})</span>
                        {industry && <span className="text-atlas-blue lowercase font-medium">isi manual aktif</span>}
                      </div>

                      {filteredIndustries.length > 0 ? (
                        filteredIndustries.map((item) => {
                          const isSelected = industry.trim().toLowerCase() === item.toLowerCase();
                          return (
                            <button
                              key={item}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelectIndustry(item)}
                              className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors min-h-[40px] cursor-pointer ${
                                isSelected 
                                  ? 'bg-blue-50/80 text-atlas-blue font-bold' 
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <span className="truncate pr-2">{item}</span>
                              {isSelected && <Check size={16} className="text-atlas-blue shrink-0" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-500 space-y-1">
                          <p className="font-medium text-gray-700">Tidak ada dalam daftar standar</p>
                          <p className="text-gray-400">
                            Isian manual Anda <span className="font-semibold text-gray-800">"{industry}"</span> akan tetap disimpan.
                          </p>
                        </div>
                      )}

                      {/* Manual Entry Hint Footer */}
                      <div className="p-2.5 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between border-t border-gray-100">
                        <span>Bisa ketik nama bidang usaha kustom apa saja</span>
                        <button
                          type="button"
                          onClick={() => setIsIndustryDropdownOpen(false)}
                          className="text-atlas-blue font-bold hover:underline cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Susunan Dewan Komisaris & Direksi Utama <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    value={alamat} 
                    onChange={(e) => setAlamat(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:border-atlas-blue outline-none" 
                    rows={3} 
                    placeholder="Sebutkan nama dan jabatan eksekutif kunci, misalnya: Direktur Utama: Bpk. Andi, Komisaris: Ibu Dewi..."
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Informasi Perikatan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Perikatan</label>
                  <input 
                    type="text" 
                    value={engagement.engagementType === 'First Year' ? 'Perikatan Tahun Pertama' : 'Perikatan Berkelanjutan (Recurring)'} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 focus:outline-none" 
                    readOnly 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Standar Akuntansi yang Digunakan</label>
                  <input type="text" defaultValue={engagement.accountingStandard} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 focus:outline-none" readOnly />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tujuan Penggunaan Laporan Keuangan</label>
                  <textarea 
                    value={usagePurpose}
                    onChange={(e) => setUsagePurpose(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:border-atlas-blue outline-none" 
                    rows={2} 
                    placeholder="Mis: Untuk pertanggungjawaban RUPS pemegang saham, pengajuan fasilitas kredit perbankan, tender proyek, dll..."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                type="button"
                onClick={() => setActiveTab('eval')} 
                className="bg-atlas-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Lanjut ke Evaluasi Risiko &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Evaluasi & Risiko (Kontrol Kertas Kerja Pendukung) */}
        {activeTab === 'eval' && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Kontrol Isian Kertas Kerja Pendukung</h2>
              <p className="text-sm text-gray-600 mb-6">
                Kertas kerja ini merupakan kontrol atas isian 4 (empat) kertas kerja pendukung. Auditor harus melengkapi evaluasi kertas kerja pendukung berikut sebelum mengambil keputusan.
              </p>
              
              <div className="space-y-4">
                {/* A.1101 */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h3 className="font-bold text-gray-800"><span className="text-atlas-blue mr-2">A.1101</span> Isu Pelaporan Keuangan Terdahulu</h3>
                    <p className="text-xs text-gray-500 mt-1">Mengevaluasi isu-isu pelaporan keuangan pada periode sebelumnya.</p>
                  </div>
                  <div className="flex space-x-3 shrink-0 items-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${evals['A.1101'] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {evals['A.1101'] ? 'Completed' : 'Draft'}
                    </span>
                    <select 
                      value={evals['A.1101']} 
                      onChange={(e) => setEvals({...evals, 'A.1101': e.target.value as 'low' | 'high'})}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-atlas-blue font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="">-- Pilih Risiko --</option>
                      <option value="low">Risiko Rendah</option>
                      <option value="high">Risiko Tinggi</option>
                    </select>
                  </div>
                </div>

                {/* A.1102 */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group hover:border-atlas-blue transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <span className="text-atlas-blue mr-2">A.1102</span> Integritas Manajemen
                      <a href={`/workspace/${engagement.id}/worksheet/a1102`} className="ml-3 text-xs bg-gray-100 hover:bg-atlas-blue hover:text-white text-gray-600 px-2 py-1 rounded transition-colors font-medium">Buka Kertas Kerja &rarr;</a>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Mengevaluasi integritas manajemen, termasuk indikasi pencucian uang/ilegal.</p>
                  </div>
                  <div className="flex space-x-3 shrink-0 items-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${evals['A.1102'] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {evals['A.1102'] ? 'Completed' : 'Draft'}
                    </span>
                    <select 
                      value={evals['A.1102']} 
                      onChange={(e) => setEvals({...evals, 'A.1102': e.target.value as 'low' | 'high'})}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-atlas-blue font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="">-- Pilih Risiko --</option>
                      <option value="low">Risiko Rendah</option>
                      <option value="high">Risiko Tinggi</option>
                    </select>
                  </div>
                </div>

                {/* A.1103 */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group hover:border-atlas-blue transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <span className="text-atlas-blue mr-2">A.1103</span> Kompetensi, Waktu, & Independensi Personel KAP
                      <a href={`/workspace/${engagement.id}/worksheet/a1103`} className="ml-3 text-xs bg-gray-100 hover:bg-atlas-blue hover:text-white text-gray-600 px-2 py-1 rounded transition-colors font-medium">Buka Kertas Kerja &rarr;</a>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Mengevaluasi kompetensi tim, ketersediaan waktu, dan benturan kepentingan.</p>
                  </div>
                  <div className="flex space-x-3 shrink-0 items-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${evals['A.1103'] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {evals['A.1103'] ? 'Completed' : 'Draft'}
                    </span>
                    <select 
                      value={evals['A.1103']} 
                      onChange={(e) => setEvals({...evals, 'A.1103': e.target.value as 'low' | 'high'})}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-atlas-blue font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="">-- Pilih Risiko --</option>
                      <option value="low">Risiko Rendah</option>
                      <option value="high">Risiko Tinggi</option>
                    </select>
                  </div>
                </div>

                {/* A.1104 - Conditional based on Engagement Type */}
                {engagement.engagementType === 'First Year' ? (
                  <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group hover:border-atlas-blue transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center">
                        <span className="text-atlas-blue mr-2">A.1104</span> Komunikasi dengan Auditor Pendahulu
                        <a href={`/workspace/${engagement.id}/worksheet/a1104`} className="ml-3 text-xs bg-gray-100 hover:bg-atlas-blue hover:text-white text-gray-600 px-2 py-1 rounded transition-colors font-medium">Buka Kertas Kerja &rarr;</a>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Wajib untuk perikatan tahun pertama.</p>
                    </div>
                    <div className="flex space-x-3 shrink-0 items-center">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${evals['A.1104'] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {evals['A.1104'] ? 'Completed' : 'Draft'}
                      </span>
                      <select 
                        value={evals['A.1104']} 
                        onChange={(e) => setEvals({...evals, 'A.1104': e.target.value as 'low' | 'high'})}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-atlas-blue font-bold text-gray-700 cursor-pointer"
                      >
                        <option value="">-- Pilih Risiko --</option>
                        <option value="low">Risiko Rendah</option>
                        <option value="high">Risiko Tinggi</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm opacity-60 group hover:border-atlas-blue transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-500 flex items-center">
                        <span className="text-gray-400 mr-2">A.1104</span> Komunikasi dengan Auditor Pendahulu
                        <a href={`/workspace/${engagement.id}/worksheet/a1104`} className="ml-3 text-xs bg-gray-100 hover:bg-atlas-blue hover:text-white text-gray-600 px-2 py-1 rounded transition-colors font-medium">Buka Kertas Kerja &rarr;</a>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Tidak relevan (Bukan Perikatan Tahun Pertama).</p>
                    </div>
                    <div className="flex space-x-3 shrink-0 items-center">
                      <span className="text-xs font-bold px-3 py-1 bg-gray-200 text-gray-500 rounded-full">N/A</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">4. Simpulan Risiko & Penjelasan Anomali</h2>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-blue-900">Tingkat Risiko Perikatan secara Keseluruhan (Overall Engagement Risk)</p>
                    <p className="text-xs text-blue-800 mt-1">Dihitung otomatis berdasarkan hasil pengisian kertas kerja pendukung di atas.</p>
                  </div>
                  <div className={`px-6 py-2 rounded-lg font-black border shrink-0 text-base shadow-sm ${
                    calculatedOverallRisk === 'high' 
                      ? 'bg-rose-50 border-rose-300 text-rose-700' 
                      : 'bg-white border-blue-200 text-atlas-blue'
                  }`}>
                    {calculatedOverallRisk === 'high' ? 'TINGGI (HIGH)' : 'RENDAH (LOW)'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Penjelasan Jawaban Anomali <span className="text-xs font-normal text-gray-500 ml-1">(Wajib diisi jika terdapat risiko tinggi atau kondisi khusus)</span>
                  </label>
                  <textarea 
                    value={anomalyExplanation}
                    onChange={(e) => setAnomalyExplanation(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-4 text-gray-700 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none min-h-[100px] bg-red-50/20" 
                    placeholder="Jelaskan alasan auditor jika mengisi dengan jawaban anomali atau risiko tinggi pada kertas kerja pendukung..."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button 
                type="button"
                onClick={() => setActiveTab('info')} 
                className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2 cursor-pointer"
              >
                &larr; Kembali
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('keputusan')} 
                className="bg-atlas-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Lanjut ke Keputusan Akhir &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Keputusan Akhir */}
        {activeTab === 'keputusan' && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">5. Keputusan Penerimaan Klien (Accept/Reject)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button 
                  type="button"
                  onClick={() => setDecision('Accept')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all cursor-pointer ${decision === 'Accept' ? 'border-green-500 bg-green-50 shadow-md ring-4 ring-green-500/20' : 'border-gray-200 hover:border-green-300'}`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${decision === 'Accept' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <CheckCircle size={20} />
                    </div>
                    <span className={`text-xl font-black ${decision === 'Accept' ? 'text-green-700' : 'text-gray-700'}`}>ACCEPT (Terima)</span>
                  </div>
                  <p className="text-sm text-gray-600">Risiko dapat dikelola, tim independen dan kompeten. Perikatan dapat dilaksanakan.</p>
                </button>

                <button 
                  type="button"
                  onClick={() => setDecision('Reject')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all cursor-pointer ${decision === 'Reject' ? 'border-red-500 bg-red-50 shadow-md ring-4 ring-red-500/20' : 'border-gray-200 hover:border-red-300'}`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${decision === 'Reject' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <AlertCircle size={20} />
                    </div>
                    <span className={`text-xl font-black ${decision === 'Reject' ? 'text-red-700' : 'text-gray-700'}`}>REJECT (Tolak)</span>
                  </div>
                  <p className="text-sm text-gray-600">Terdapat benturan kepentingan atau risiko yang tidak dapat dimitigasi. Perikatan ditolak.</p>
                </button>
              </div>

              {decision === 'Accept' && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl animate-in fade-in duration-300">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <FileSearch size={18} />
                    Langkah Selanjutnya: Input Data Laporan Keuangan
                  </h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Anda telah memutuskan untuk menerima klien ini. Pengisian data laporan keuangan pada template berikut akan digunakan seterusnya secara otomatis dalam mendukung tahapan audit selanjutnya.
                  </p>
                  <a 
                    href={`/workspace/${engagement.id}/worksheet/d100`}
                    className="inline-flex items-center gap-2 bg-white text-atlas-blue font-bold px-5 py-2.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    Buka Template Laporan Keuangan &rarr;
                  </a>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Keputusan & Mitigasi (Jika Ada)</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-4 text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none min-h-[120px]" 
                    placeholder="Contoh: Kami memutuskan menerima perikatan ini dengan pertimbangan mitigasi risiko..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start space-x-4">
              <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800">Ketentuan Workflow Persetujuan</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Draft ini akan diajukan kepada <strong>{engagement.partnerName || 'Partner'}</strong> untuk direview. 
                  Jika disetujui status akan berubah menjadi <strong>Approved</strong>. Jika ditolak akan dikembalikan menjadi <strong>Needs Revision</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                type="button"
                onClick={() => setActiveTab('eval')} 
                className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2 cursor-pointer"
              >
                &larr; Kembali
              </button>
              <button 
                type="button"
                onClick={handleAjukanReview}
                disabled={!decision || wsData.status === 'Pending Review' || wsData.status === 'Approved'}
                className={`px-8 py-3 rounded-lg font-bold text-white shadow-sm transition-colors cursor-pointer ${
                  decision && wsData.status !== 'Pending Review' && wsData.status !== 'Approved'
                    ? 'bg-atlas-blue hover:bg-blue-800' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {wsData.status === 'Pending Review' ? 'Menunggu Review' : wsData.status === 'Approved' ? 'Telah Disetujui' : 'Ajukan Review'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── IMPORT MODAL ── */}
      <A110ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        clientName={engagement.clientName}
        fiscalYear={engagement.auditPeriod || engagement.fiscalYear || '2025'}
      />
    </WorksheetContainer>
  );
};

export default A110;
