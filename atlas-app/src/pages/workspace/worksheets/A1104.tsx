import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate, useParams, Link } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import { useEngagementStore } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  Info,
  Scale,
  Sparkles,
  ExternalLink,
  Paperclip,
  Upload,
  Trash2,
  Plus
} from 'lucide-react';

interface QuestionConfig {
  id: string;
  number: string;
  subNumber?: string;
  text: string;
  hint: string;
  isParent?: boolean;
}

const QUESTIONS_CONFIG: QuestionConfig[] = [
  {
    id: '1',
    number: '1',
    text: 'Jika calon klien merupakan perikatan audit LK tahun pertama, apakah sudah dilakukan komunikasi dengan auditor pendahulu?',
    hint: 'KAP pengusul wajib meminta izin tertulis dari calon klien untuk berkomunikasi dengan auditor pendahulu sebelum menerima perikatan (SA 300 & SA 510).',
  },
  {
    id: '2',
    number: '2',
    text: 'Apakah balasan komunikasi dari auditor pendahulu sudah diterima?',
    hint: 'Konfirmasi tertulis resmi dari auditor pendahulu atas pertanyaan profesional yang diajukan oleh KAP.',
  },
  {
    id: '3_parent',
    number: '3',
    text: 'Dalam balasan komunikasi yang diberikan oleh auditor pendahulu:',
    hint: 'Evaluasi atas substansi tanggapan atau informasi profesional yang disampaikan oleh auditor pendahulu.',
    isParent: true,
  },
  {
    id: '3a',
    number: '3',
    subNumber: 'a',
    text: 'Apakah ada keberatan profesional atas penggantian auditor?',
    hint: 'Keberatan profesional terkait integritas manajemen, pembatasan ruang lingkup audit, ketidaksepakatan standar akuntansi, atau indikasi kecurangan.',
  },
  {
    id: '3b',
    number: '3',
    subNumber: 'b',
    text: 'Apakah terdapat permasalahan imbalan jasa yang belum diselesaikan oleh manajemen?',
    hint: 'Tunggakan fee jasa profesional audit periode sebelumnya yang belum dilunasi oleh entitas klien.',
  },
];

const EVALUATED_IDS = ['1', '2', '3a', '3b'];

const DEFAULT_ANSWERS: Record<string, 'Ya' | 'Tidak' | 'N/A' | ''> = {
  '1': 'Ya',
  '2': 'Tidak',
  '3a': 'Tidak',
  '3b': 'Tidak',
};

const DEFAULT_REASON =
  'Walaupun auditor pendahulu tidak memberikan surat balasan tapi mereka setuju untuk dilakukan review kertas dan tidak keberatan profesional dan fee auditor sudah dilunasi oleh manajemen';

const DEFAULT_LAMPIRAN = ['Surat_komunikasi_auditor_pendahulu.pdf'];

const A1104: React.FC = () => {
  const context = useOutletContext<{ engagement?: Engagement }>();
  const { id: paramId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const engagement = context?.engagement || engagements.find((e) => e.id === paramId) || engagements[0];
  const navigate = useNavigate();

  const wsA1104 = engagement?.worksheetA1104;

  const [answers, setAnswers] = useState<Record<string, 'Ya' | 'Tidak' | 'N/A' | ''>>(() => {
    if (wsA1104?.answers && Object.keys(wsA1104.answers).length > 0) {
      return { ...wsA1104.answers };
    }
    return { ...DEFAULT_ANSWERS };
  });

  const [lampiranFiles, setLampiranFiles] = useState<string[]>(() => {
    if (wsA1104?.lampiranFiles && wsA1104.lampiranFiles.length > 0) {
      return wsA1104.lampiranFiles;
    }
    return DEFAULT_LAMPIRAN;
  });

  const [newFileName, setNewFileName] = useState('');
  const [showAddFile, setShowAddFile] = useState(false);

  const [acceptanceReason, setAcceptanceReason] = useState<string>(() => {
    if (wsA1104?.acceptanceReason !== undefined) {
      return wsA1104.acceptanceReason;
    }
    return DEFAULT_REASON;
  });

  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Completion calculation
  const answeredCount = useMemo(() => {
    return EVALUATED_IDS.filter((id) => answers[id] === 'Ya' || answers[id] === 'Tidak' || answers[id] === 'N/A').length;
  }, [answers]);

  // Special condition: if reply not received (Q2 == 'Tidak') or objection exists (3a == 'Ya' or 3b == 'Ya'), reason is required
  const needsExplanation = useMemo(() => {
    return answers['2'] === 'Tidak' || answers['3a'] === 'Ya' || answers['3b'] === 'Ya' || answers['1'] === 'Tidak';
  }, [answers]);

  const isReasonValid = useMemo(() => {
    if (!needsExplanation) return true;
    return acceptanceReason.trim().length > 0;
  }, [needsExplanation, acceptanceReason]);

  const isCompleted = answeredCount === EVALUATED_IDS.length && isReasonValid;
  const statusKKP = isCompleted ? 'Completed' : 'Uncompleted';

  // Evaluated risk: If 3a == 'Ya' (objection) or 3b == 'Ya' (unpaid fee) without proper resolution -> High, else Low
  const evaluatedRisk: 'high' | 'low' = useMemo(() => {
    if (answers['3a'] === 'Ya' || answers['3b'] === 'Ya') return 'high';
    return 'low';
  }, [answers]);

  const handleToggle = (id: string, value: 'Ya' | 'Tidak') => {
    setAnswers((prev) => ({
      ...prev,
      [id]: prev[id] === value ? '' : value,
    }));
    setIsSaved(false);
  };

  const handleAddFile = () => {
    if (newFileName.trim()) {
      setLampiranFiles([...lampiranFiles, newFileName.trim()]);
      setNewFileName('');
      setShowAddFile(false);
      setIsSaved(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setLampiranFiles(lampiranFiles.filter((_, i) => i !== index));
    setIsSaved(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset semua jawaban ke default referensi ATLAS?')) {
      setAnswers({ ...DEFAULT_ANSWERS });
      setLampiranFiles(DEFAULT_LAMPIRAN);
      setAcceptanceReason(DEFAULT_REASON);
      setIsSaved(false);
      showToast('Jawaban berhasil direset ke nilai awal ATLAS.');
    }
  };

  const handleSave = async () => {
    if (!engagement?.id) return;

    try {
      const updatedA1104 = {
        answers,
        lampiranFiles,
        acceptanceReason,
        isCompleted,
        status: statusKKP,
      };

      const currentA110 = engagement.worksheetA110 || {
        industry: engagement.clientIndustry || '',
        boardOfDirectors: '',
        usagePurpose: '',
        evaluations: {},
        overallRisk: null,
        anomalyExplanation: '',
        decision: null,
        decisionReason: '',
        status: 'In Progress' as const,
      };

      const updatedA110 = {
        ...currentA110,
        evaluations: {
          ...currentA110.evaluations,
          'A.1104': evaluatedRisk,
        },
      };

      await updateEngagement(engagement.id, {
        worksheetA1104: updatedA1104,
        worksheetA110: updatedA110,
      });

      setIsSaved(true);
      showToast('Kertas Kerja A.1104 berhasil disimpan & disinkronkan ke A.110!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving A.1104:', err);
      showToast('Gagal menyimpan kertas kerja. Coba lagi.');
    }
  };

  return (
    <WorksheetContainer
      code="A.1104"
      name="Komunikasi dengan Auditor Pendahulu"
      purpose="Mendokumentasikan komunikasi profesional dengan auditor pendahulu pada perikatan audit tahun pertama sesuai SA 210, SA 300, dan SA 510 guna mengidentifikasi fakta atau kendala sebelum menerima penugasan."
      status={statusKKP}
      reviewer={engagement?.managerName || 'Menunggu Reviewer'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Top Modern Summary Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200">
                SA 210
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                SA 300
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                SA 510
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Perikatan Tahun Pertama
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Komunikasi dengan Auditor Pendahulu
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Kertas kerja ini digunakan untuk mendokumentasikan korespondensi profesional antara KAP dengan auditor independen periode sebelumnya guna memastikan tidak terdapat keberatan etis atau masalah honorarium yang belum diselesaikan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Answered Progress */}
            <div className="text-left sm:text-right px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="text-[11px] font-semibold text-slate-500">Progress Evaluasi</div>
              <div className="text-sm font-bold text-slate-800">
                {answeredCount} dari {EVALUATED_IDS.length} dijawab ({Math.round((answeredCount / EVALUATED_IDS.length) * 100)}%)
              </div>
            </div>

            {/* Evaluated Risk Badge */}
            <div className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${
              evaluatedRisk === 'high'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {evaluatedRisk === 'high' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">Risiko Komunikasi</span>
                <span>{evaluatedRisk === 'high' ? 'High Risk' : 'Low Risk'}</span>
              </div>
            </div>

            {/* Status KKP Badge */}
            <div className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {isCompleted ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">Status KKP</span>
                <span>{isCompleted ? 'Completed' : 'Uncompleted'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lampiran Kertas Kerja Card (Top Section matching Image) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Paperclip className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">Lampiran Kertas Kerja</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddFile(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-atlas-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <Plus size={13} />
              <span>Tambah Berkas</span>
            </button>
          </div>

          {/* Files List */}
          <div className="space-y-2">
            {lampiranFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-800 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-atlas-blue shrink-0" />
                  <span className="font-semibold text-slate-900">{file}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    PDF Terlampir
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Hapus berkas"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add file inline form */}
          {showAddFile && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Nama file lampiran (misal: Surat_Balasan_KAP_Terdahulu.pdf)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:border-atlas-blue outline-none"
              />
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleAddFile}
                  className="px-3 py-1.5 bg-atlas-blue text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Tambah
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFile(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Checklist Section: Komunikasi dengan Auditor Pendahulu */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Komunikasi dengan Auditor Pendahulu
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Hasil Analisis (Pilih Ya atau Tidak)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {QUESTIONS_CONFIG.map((item) => {
              if (item.isParent) {
                return (
                  <div key={item.id} className="px-6 py-3.5 bg-slate-50/50 flex items-start gap-3">
                    <span className="w-5 font-bold text-slate-600 shrink-0 text-sm">{item.number}.</span>
                    <div>
                      <span className="text-sm font-bold text-slate-900">{item.text}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.hint}</p>
                    </div>
                  </div>
                );
              }

              const answer = answers[item.id] || '';
              const isSubItem = Boolean(item.subNumber);

              return (
                <div
                  key={item.id}
                  className={`px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/60 ${
                    isSubItem ? 'pl-11 md:pl-12 bg-white' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-600 shrink-0 text-sm">
                      {isSubItem ? `${item.subNumber}.` : `${item.number}.`}
                    </span>
                    <div className="space-y-1">
                      <span className={`text-sm ${isSubItem ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'}`}>
                        {item.text}
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.hint}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {/* Status Pill for the answer */}
                    {item.id === '1' && answer === 'Ya' && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check size={12} />
                        Komunikasi Dilakukan
                      </span>
                    )}
                    {item.id === '2' && answer === 'Tidak' && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <AlertCircle size={12} />
                        Belum Ada Balasan
                      </span>
                    )}
                    {(item.id === '3a' || item.id === '3b') && answer === 'Tidak' && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check size={12} />
                        Tidak Ada Kendala
                      </span>
                    )}

                    {/* Toggle Controls */}
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id, 'Ya')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                          answer === 'Ya'
                            ? item.id === '1'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Pilih Ya"
                      >
                        <Check size={13} className={answer === 'Ya' ? 'opacity-100' : 'opacity-40'} />
                        Ya
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id, 'Tidak')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                          answer === 'Tidak'
                            ? item.id === '2'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Pilih Tidak"
                      >
                        <X size={13} className={answer === 'Tidak' ? 'opacity-100' : 'opacity-40'} />
                        Tidak
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Sebutkan alasan KAP tetap menerima perikatan tersebut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Sebutkan alasan KAP tetap menerima perikatan tersebut
              </h2>
            </div>
            {needsExplanation ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 w-fit">
                <AlertCircle size={12} />
                Wajib diisi karena belum ada surat balasan resmi
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1 w-fit">
                Opsional (Balasan diterima tanpa keberatan)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Jika auditor pendahulu belum memberikan surat balasan resmi atau terdapat kondisi khusus, uraikan hasil komunikasi alternatif (misal: penelaahan kertas kerja audit terdahulu, konfirmasi lisan, dan bukti pelunasan kewajiban fee oleh manajemen) sebagai dasar pertimbangan profesional KAP menerima perikatan.
          </p>

          {/* Quick Pre-fill Templates */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-atlas-blue" />
              Template Rekomendasi:
            </span>
            <button
              type="button"
              onClick={() =>
                setAcceptanceReason(
                  'Walaupun auditor pendahulu tidak memberikan surat balasan tapi mereka setuju untuk dilakukan review kertas dan tidak keberatan profesional dan fee auditor sudah dilunasi oleh manajemen'
                )
              }
              className="text-[11px] font-medium text-slate-600 hover:text-atlas-blue bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors text-left"
            >
              Review Kertas Kerja &amp; Fee Lunas (Default ATLAS)
            </button>
            <button
              type="button"
              onClick={() =>
                setAcceptanceReason(
                  'Auditor pendahulu telah memberikan konfirmasi tertulis bahwa tidak ada keberatan profesional dan seluruh kewajiban honorarium audit telah diselesaikan oleh manajemen secara penuh.'
                )
              }
              className="text-[11px] font-medium text-slate-600 hover:text-atlas-blue bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors text-left"
            >
              Balasan Tertulis Lengkap Tanpa Keberatan
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={acceptanceReason}
              onChange={(e) => {
                setAcceptanceReason(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Tuliskan pertimbangan profesional KAP tetap menerima perikatan audit di sini..."
              className={`w-full rounded-xl border p-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all resize-y ${
                needsExplanation && !acceptanceReason.trim()
                  ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-200 bg-slate-50/50 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue'
              }`}
            />
          </div>

          {needsExplanation && !acceptanceReason.trim() && (
            <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} />
              Alasan KAP wajib dicantumkan sebelum KKP A.1104 dapat diselesaikan (Completed).
            </p>
          )}
        </div>

        {/* Integration Insight to A.110 */}
        <div className="bg-blue-50/50 rounded-2xl border border-blue-200/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="text-atlas-blue shrink-0 mt-0.5" size={18} />
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-900">
                Sinkronisasi Otomatis ke Kertas Kerja Induk A.110
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Menyimpan kertas kerja ini akan otomatis memperbarui evaluasi item 7 (Komunikasi dengan Auditor Pendahulu) pada KKP A.110 menjadi{' '}
                <strong className={evaluatedRisk === 'high' ? 'text-rose-700' : 'text-emerald-700'}>
                  {evaluatedRisk.toUpperCase()}
                </strong>{' '}
                dan menyelaraskan status kelengkapan perikatan audit tahun pertama.
              </p>
            </div>
          </div>
          <Link
            to={`/workspace/${engagement?.id}/worksheet/a110`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-atlas-blue bg-white border border-blue-200 hover:bg-blue-50 transition-colors shrink-0"
          >
            <span>Buka KKP A.110</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        {/* Action Footer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/a110`)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Kembali ke KKP A.110</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Reset ke default ATLAS"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-atlas-blue hover:bg-blue-700'
              }`}
            >
              {isSaved ? <CheckCircle2 size={15} /> : <Save size={15} />}
              <span>{isSaved ? 'Tersimpan & Tersinkron' : 'Simpan Kertas Kerja'}</span>
            </button>
          </div>
        </div>
      </div>
    </WorksheetContainer>
  );
};

export default A1104;
