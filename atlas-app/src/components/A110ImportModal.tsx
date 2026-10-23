import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  X, 
  RefreshCw,
  FileCode,
  ShieldCheck,
  Building,
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import type { WorksheetA110 } from '../store/engagementStore';
import { 
  parseA110File, 
  downloadA110ExcelTemplate, 
  downloadA110CSVTemplate 
} from '../utils/a110ExcelService';

interface A110ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedData: Partial<WorksheetA110>, fileName: string) => void;
  clientName: string;
  fiscalYear: string;
}

type ImportStep = 'upload' | 'preview' | 'success';

const A110ImportModal: React.FC<A110ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  clientName,
  fiscalYear
}) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Partial<WorksheetA110> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setErrorMsg(null);
    setParsedData(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const processFile = async (uploadedFile: File) => {
    setErrorMsg(null);
    setIsLoading(true);
    setFile(uploadedFile);

    try {
      const data = await parseA110File(uploadedFile);
      setParsedData(data);
      setStep('preview');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal membaca isi file. Pastikan format kolom sesuai template.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData || !file) return;
    onImportSuccess(parsedData, file.name);
    setStep('success');
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const getRiskBadge = (risk?: string) => {
    if (risk === 'high') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Tinggi (High)</span>;
    }
    if (risk === 'low') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Rendah (Low)</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Belum diisi</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-atlas-blue flex items-center justify-center font-bold">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 id="modal-title" className="text-base sm:text-lg font-bold text-slate-900">
                Import Data Kertas Kerja A.110
              </h2>
              <p className="text-xs text-slate-500">
                Analisis Penerimaan & Keberlanjutan Hubungan Klien
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="bg-white border-b border-slate-100 px-6 py-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <div className={`flex items-center gap-1.5 ${step === 'upload' ? 'text-atlas-blue font-bold' : (step !== 'upload' ? 'text-emerald-600' : '')}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] border ${step === 'upload' ? 'border-atlas-blue bg-blue-50 text-atlas-blue' : 'border-emerald-500 bg-emerald-50 text-emerald-600'}`}>
                {step !== 'upload' ? '✓' : '1'}
              </div>
              <span>Upload File</span>
            </div>
            <div className="flex-1 mx-3 h-px bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step === 'preview' ? 'text-atlas-blue font-bold' : (step === 'success' ? 'text-emerald-600' : '')}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] border ${step === 'preview' ? 'border-atlas-blue bg-blue-50 text-atlas-blue' : (step === 'success' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-300')}`}>
                {step === 'success' ? '✓' : '2'}
              </div>
              <span>Preview Data</span>
            </div>
            <div className="flex-1 mx-3 h-px bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step === 'success' ? 'text-emerald-600 font-bold' : ''}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] border ${step === 'success' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-300'}`}>
                3
              </div>
              <span>Selesai</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Drag and drop upload container */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
                  isDragging 
                    ? 'border-atlas-blue bg-blue-50/50 scale-[1.01]' 
                    : 'border-slate-300 hover:border-atlas-blue bg-white hover:bg-slate-50/60'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv,.json"
                  className="hidden" 
                />

                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-atlas-blue flex items-center justify-center mb-3">
                  <Upload size={28} />
                </div>

                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Pilih atau Tarik File ke Sini
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Mendukung format file <strong>Excel (.xlsx, .xls)</strong>, <strong>CSV (.csv)</strong>, dan <strong>JSON (.json)</strong>
                </p>

                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-atlas-blue hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs">
                  <FileSpreadsheet size={15} />
                  <span>Jelajahi File Komputer</span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Gagal Membaca File:</strong>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Download Template Strip */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Download size={14} className="text-atlas-blue" />
                      Belum memiliki format file?
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unduh template resmi A.110 yang telah disesuaikan dengan struktur ATLAS.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => downloadA110ExcelTemplate(clientName, fiscalYear)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span>Template Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadA110CSVTemplate()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText size={14} className="text-slate-600" />
                      <span>Template CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION */}
          {step === 'preview' && parsedData && (
            <div className="space-y-4">
              {/* File Info Banner */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{file?.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Ukuran: {((file?.size || 0) / 1024).toFixed(1)} KB | Format Terbaca
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                >
                  Ganti File
                </button>
              </div>

              {/* Preview Cards */}
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-2xs overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 font-bold text-slate-700 flex items-center justify-between">
                  <span>Hasil Pembacaan Data Kertas Kerja A.110</span>
                  <span className="text-[11px] font-normal text-slate-500">Silakan periksa sebelum menerapkan</span>
                </div>

                {/* Seksi 1: Klien */}
                <div className="p-3.5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Informasi Calon Klien & Perikatan
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Bidang Usaha / Industri:</span>
                      <strong className="text-slate-800 block text-xs mt-0.5">
                        {parsedData.industry || <span className="text-slate-400 italic">Tidak ada perubahan</span>}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Tujuan Penggunaan LK:</span>
                      <strong className="text-slate-800 block text-xs mt-0.5 truncate">
                        {parsedData.usagePurpose || <span className="text-slate-400 italic">Tidak ada perubahan</span>}
                      </strong>
                    </div>
                    <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Susunan Direksi & Dewan Komisaris:</span>
                      <div className="text-slate-800 text-xs mt-0.5 whitespace-pre-line">
                        {parsedData.boardOfDirectors || <span className="text-slate-400 italic">Tidak ada perubahan</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seksi 2: Evaluasi Kertas Kerja Pendukung */}
                <div className="p-3.5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Kontrol Evaluasi Kertas Kerja Pendukung
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50/50">
                      <span className="text-[10px] text-slate-500 block font-semibold">A.1101 (Isu Terdahulu)</span>
                      <div className="mt-1">{getRiskBadge(parsedData.evaluations?.['A.1101'])}</div>
                    </div>
                    <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50/50">
                      <span className="text-[10px] text-slate-500 block font-semibold">A.1102 (Integritas)</span>
                      <div className="mt-1">{getRiskBadge(parsedData.evaluations?.['A.1102'])}</div>
                    </div>
                    <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50/50">
                      <span className="text-[10px] text-slate-500 block font-semibold">A.1103 (Kompetensi)</span>
                      <div className="mt-1">{getRiskBadge(parsedData.evaluations?.['A.1103'])}</div>
                    </div>
                    <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50/50">
                      <span className="text-[10px] text-slate-500 block font-semibold">A.1104 (Auditor Lama)</span>
                      <div className="mt-1">{getRiskBadge(parsedData.evaluations?.['A.1104'])}</div>
                    </div>
                  </div>
                </div>

                {/* Seksi 3: Keputusan & Risiko */}
                <div className="p-3.5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Keputusan Penerimaan Klien
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold ${
                      parsedData.decision === 'Accept'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : parsedData.decision === 'Reject'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      {parsedData.decision === 'Accept' && <CheckCircle2 size={18} className="text-emerald-600" />}
                      {parsedData.decision === 'Reject' && <AlertTriangle size={18} className="text-rose-600" />}
                      <span>Keputusan: {parsedData.decision ? parsedData.decision.toUpperCase() : 'BELUM DITENTUKAN'}</span>
                    </div>

                    <div className="flex-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Alasan & Mitigasi: </strong>
                      <span>{parsedData.decisionReason || 'Tidak ada catatan alasan.'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <Check size={36} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Data Berhasil Diimpor!</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Seluruh isian Kertas Kerja A.110 telah diperbarui sesuai file dan tersimpan ke dalam penugasan audit.
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex justify-between items-center">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Batal
          </button>

          {step === 'preview' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Pilih File Lain
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-atlas-blue hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} />
                <span>Terapkan ke KKP A.110</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default A110ImportModal;
