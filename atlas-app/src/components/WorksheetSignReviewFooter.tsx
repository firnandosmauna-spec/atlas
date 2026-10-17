import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  PenTool, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  X, 
  RotateCcw,
  Clock,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEngagementStore } from '../store/engagementStore';

export interface ReviewNoteItem {
  id: string;
  reviewer: string;
  date: string;
  comment: string;
  status: 'Open' | 'Resolved' | 'Reopened' | 'Closed';
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: string;
}

interface WorksheetSignReviewFooterProps {
  engagementId?: string;
  worksheetCode: string;
  worksheetName: string;
  defaultAuditor?: string;
  defaultReviewer?: string;
  notes: ReviewNoteItem[];
  onAddNote: (comment: string) => void;
  onResolveNote: (id: string, resolution: string) => void;
}

interface SignData {
  preparedBy: string;
  preparedDate: string;
  reviewedBy: string;
  reviewedDate: string;
  preparedSignature?: string;
  reviewedSignature?: string;
  isPreparedSigned: boolean;
  isReviewedSigned: boolean;
}

export const WorksheetSignReviewFooter: React.FC<WorksheetSignReviewFooterProps> = ({
  engagementId = '',
  worksheetCode,
  worksheetName,
  defaultAuditor = '',
  defaultReviewer = '',
  notes,
  onAddNote,
  onResolveNote
}) => {
  const { user } = useAuthStore();
  const addAuditLog = useEngagementStore((state) => state.addAuditLog);

  // Storage key per engagement and worksheet
  const storageKey = `atlas_sign_v1_${engagementId}_${worksheetCode}`;

  // Initial State from localStorage
  const [signData, setSignData] = useState<SignData>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      preparedBy: defaultAuditor || '',
      preparedDate: '',
      reviewedBy: defaultReviewer || '',
      reviewedDate: '',
      isPreparedSigned: false,
      isReviewedSigned: false,
    };
  });

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(signData));
    } catch {
      // ignore
    }
  }, [signData, storageKey]);

  // Update defaults if prop changes and field is empty
  useEffect(() => {
    setSignData(prev => ({
      ...prev,
      preparedBy: prev.preparedBy || defaultAuditor || '',
      reviewedBy: prev.reviewedBy || defaultReviewer || ''
    }));
  }, [defaultAuditor, defaultReviewer]);

  // Review Notes Collapse State
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [showAddNoteInput, setShowAddNoteInput] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Signature Modal State
  const [activeDrawRole, setActiveDrawRole] = useState<'prepared' | 'reviewed' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Quick sign as Penyusun
  const handleSignAsPrepared = () => {
    const signerName = user?.name || signData.preparedBy || 'Auditor';
    const today = new Date().toISOString().split('T')[0];
    setSignData(prev => ({
      ...prev,
      preparedBy: signerName,
      preparedDate: today,
      isPreparedSigned: true
    }));

    if (engagementId) {
      addAuditLog({
        engagementId,
        user: signerName,
        action: 'Signed Worksheet (Prepared)',
        module: worksheetCode,
        record: worksheetName,
      });
    }
  };

  // Quick sign as Reviewer
  const handleSignAsReviewed = () => {
    const reviewerName = user?.name || signData.reviewedBy || 'Reviewer';
    const today = new Date().toISOString().split('T')[0];
    setSignData(prev => ({
      ...prev,
      reviewedBy: reviewerName,
      reviewedDate: today,
      isReviewedSigned: true
    }));

    if (engagementId) {
      addAuditLog({
        engagementId,
        user: reviewerName,
        action: 'Signed Worksheet (Reviewed)',
        module: worksheetCode,
        record: worksheetName,
      });
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeDrawRole) return;
    const dataUrl = canvas.toDataURL('image/png');

    if (activeDrawRole === 'prepared') {
      setSignData(prev => ({
        ...prev,
        preparedSignature: dataUrl,
        isPreparedSigned: true,
        preparedDate: prev.preparedDate || new Date().toISOString().split('T')[0]
      }));
    } else {
      setSignData(prev => ({
        ...prev,
        reviewedSignature: dataUrl,
        isReviewedSigned: true,
        reviewedDate: prev.reviewedDate || new Date().toISOString().split('T')[0]
      }));
    }

    setActiveDrawRole(null);
  };

  const openNotesCount = notes.filter(n => n.status === 'Open').length;

  return (
    <div className="w-full space-y-4 pt-4 mt-8 border-t border-gray-200">
      
      {/* ============================================================== */}
      {/* 1. TANDA TANGAN & REVIU CARD                                   */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 transition-all">
        {/* Title */}
        <div className="pb-3 mb-4 border-b border-gray-900">
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            Tanda Tangan & Reviu
          </h3>
        </div>

        {/* 4 Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Disusun oleh */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Disusun oleh
            </label>
            <input 
              type="text" 
              placeholder="Nama penyusun"
              value={signData.preparedBy}
              onChange={(e) => setSignData(prev => ({ ...prev, preparedBy: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
            />
          </div>

          {/* Tanggal Disusun */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Tanggal Disusun
            </label>
            <input 
              type="date"
              value={signData.preparedDate}
              onChange={(e) => setSignData(prev => ({ ...prev, preparedDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
            />
          </div>

          {/* Direviu oleh */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Direviu oleh
            </label>
            <input 
              type="text" 
              placeholder="Nama reviewer"
              value={signData.reviewedBy}
              onChange={(e) => setSignData(prev => ({ ...prev, reviewedBy: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
            />
          </div>

          {/* Tanggal Direviu */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Tanggal Direviu
            </label>
            <input 
              type="date"
              value={signData.reviewedDate}
              onChange={(e) => setSignData(prev => ({ ...prev, reviewedDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
            />
          </div>
        </div>

        {/* TTD Status & Gambar TTD Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2.5 border-t border-gray-100 text-xs">
          {/* Penyusun TTD info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium">Penyusun:</span>
              {signData.preparedSignature ? (
                <div className="flex items-center gap-2">
                  <img 
                    src={signData.preparedSignature} 
                    alt="TTD Penyusun" 
                    className="h-7 max-w-[90px] border border-gray-200 rounded bg-white px-1 object-contain" 
                  />
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
                    <Check size={12} className="mr-0.5" /> Ada TTD
                  </span>
                </div>
              ) : signData.isPreparedSigned ? (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center">
                  <Check size={12} className="mr-1" /> TTD Digital ({signData.preparedBy})
                </span>
              ) : (
                <span className="text-gray-400">belum ada TTD</span>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setActiveDrawRole('prepared')}
              className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 active:scale-95 transition-all ml-1 cursor-pointer"
            >
              <PenTool size={13} />
              <span>Gambar TTD</span>
            </button>
          </div>

          {/* Reviewer TTD info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium">Reviewer:</span>
              {signData.reviewedSignature ? (
                <div className="flex items-center gap-2">
                  <img 
                    src={signData.reviewedSignature} 
                    alt="TTD Reviewer" 
                    className="h-7 max-w-[90px] border border-gray-200 rounded bg-white px-1 object-contain" 
                  />
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
                    <Check size={12} className="mr-0.5" /> Ada TTD
                  </span>
                </div>
              ) : signData.isReviewedSigned ? (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center">
                  <Check size={12} className="mr-1" /> TTD Digital ({signData.reviewedBy})
                </span>
              ) : (
                <span className="text-gray-400">belum ada TTD</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveDrawRole('reviewed')}
              className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 active:scale-95 transition-all ml-1 cursor-pointer"
            >
              <PenTool size={13} />
              <span>Gambar TTD</span>
            </button>
          </div>
        </div>

        {/* Quick Sign Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3">
          <button
            type="button"
            onClick={handleSignAsPrepared}
            className={`px-3.5 py-1.5 border rounded-lg text-xs font-semibold active:scale-95 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              signData.isPreparedSigned 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Check size={14} className={signData.isPreparedSigned ? 'text-emerald-600' : 'text-gray-500'} />
            <span>Tandatangani sbg Penyusun</span>
          </button>

          <button
            type="button"
            onClick={handleSignAsReviewed}
            className={`px-3.5 py-1.5 border rounded-lg text-xs font-semibold active:scale-95 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              signData.isReviewedSigned 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Check size={14} className={signData.isReviewedSigned ? 'text-emerald-600' : 'text-gray-500'} />
            <span>Tandatangani sbg Reviewer</span>
          </button>
        </div>

        {/* Info caption */}
        <p className="text-[11px] text-gray-500 mt-2.5 leading-relaxed">
          TTD digital tersimpan per KKP tahap ini dan muncul di dokumen laporan. Tanda tangan otomatis memakai nama akun login.
        </p>
      </div>

      {/* ============================================================== */}
      {/* 2. CATATAN REVIU (REVIEW NOTES) BAR                            */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
        {/* Accordion Header */}
        <div 
          onClick={() => setIsNotesOpen(!isNotesOpen)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors select-none"
        >
          <h4 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
            Catatan Reviu (Review Notes)
          </h4>

          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className="text-gray-500 hover:text-gray-700 p-0.5 cursor-pointer leading-none"
              aria-label="Toggle notes"
            >
              {isNotesOpen ? (
                <span className="text-[10px] leading-none">▲</span>
              ) : (
                <span className="text-[10px] leading-none">▼</span>
              )}
            </button>

            {/* Pill: 0 terbuka */}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              openNotesCount > 0 
                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {openNotesCount} terbuka
            </span>

            {/* + Catatan button */}
            <button
              type="button"
              onClick={() => {
                setIsNotesOpen(true);
                setShowAddNoteInput(true);
              }}
              className="bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Catatan</span>
            </button>
          </div>
        </div>

        {/* Accordion Expandable Content */}
        {isNotesOpen && (
          <div className="p-4 border-t border-gray-100 bg-slate-50/50 space-y-3 animate-in fade-in duration-150">
            {/* Input field to add note */}
            {showAddNoteInput && (
              <div className="bg-white border border-teal-200 rounded-lg p-3 shadow-xs space-y-2">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Ketik catatan reviu, instruksi perbaikan, atau pertanyaan..."
                  rows={2}
                  className="w-full text-xs p-2 border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 resize-none bg-white"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddNoteInput(false);
                      setNewNoteText('');
                    }}
                    className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newNoteText.trim()) return;
                      onAddNote(newNoteText);
                      setNewNoteText('');
                      setShowAddNoteInput(false);
                    }}
                    className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded active:scale-95 transition-all shadow-2xs"
                  >
                    Kirim Catatan
                  </button>
                </div>
              </div>
            )}

            {/* List of Notes */}
            {notes.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-500 bg-white rounded-lg border border-dashed border-gray-200">
                Belum ada catatan reviu untuk kertas kerja ini. Klik <strong>+ Catatan</strong> untuk menambahkan.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {notes.map(note => (
                  <div 
                    key={note.id} 
                    className={`bg-white border rounded-lg p-3 shadow-2xs transition-all ${
                      note.status === 'Open' ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">{note.reviewer}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Clock size={10} /> {note.date}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        note.status === 'Open' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {note.status === 'Open' ? 'Perlu Tindak Lanjut' : 'Terselesaikan'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">{note.comment}</p>

                    {/* Resolution Section */}
                    {note.status === 'Open' ? (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-2">
                        <input 
                          type="text" 
                          id={`input-resolve-${note.id}`}
                          placeholder="Tanggapan/tindak lanjut..." 
                          className="flex-1 text-[11px] px-2 py-1 border border-gray-200 rounded outline-none focus:border-teal-600 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`input-resolve-${note.id}`) as HTMLInputElement;
                            onResolveNote(note.id, input?.value || 'Telah disesuaikan.');
                          }}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all shrink-0"
                        >
                          <CheckCircle2 size={12} />
                          <span>Resolve</span>
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 pt-1.5 border-t border-gray-100 text-[11px] text-gray-500">
                        <span className="font-semibold text-emerald-700">Tindak Lanjut ({note.resolvedBy}):</span> "{note.resolution}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. DRAW SIGNATURE MODAL                                        */}
      {/* ============================================================== */}
      {activeDrawRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  Gambar Tanda Tangan ({activeDrawRole === 'prepared' ? 'Penyusun' : 'Reviewer'})
                </h4>
                <p className="text-[11px] text-gray-500">Gunakan mouse atau layar sentuh untuk menggambar tanda tangan</p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveDrawRole(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center">
              <div className="border-2 border-dashed border-gray-300 rounded-xl bg-slate-50/50 relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair bg-white"
                />
                <span className="absolute bottom-2 left-3 text-[10px] text-gray-400 select-none pointer-events-none">
                  Area Tanda Tangan
                </span>
              </div>

              <div className="flex items-center justify-between w-full mt-4">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                >
                  <RotateCcw size={13} />
                  <span>Hapus</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDrawRole(null)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={saveSignature}
                    className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold active:scale-95 transition-all shadow-xs"
                  >
                    Simpan TTD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorksheetSignReviewFooter;
