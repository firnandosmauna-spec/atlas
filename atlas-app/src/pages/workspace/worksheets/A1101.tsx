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
  ExternalLink
} from 'lucide-react';

interface QuestionItem {
  id: string;
  number: string;
  subNumber?: string;
  text: string;
  hint: string;
  isParent?: boolean;
}

const CHECKLIST_CONFIG: QuestionItem[] = [
  {
    id: '1_parent',
    number: '1',
    text: 'Apakah terdapat isu mengenai kelangsungan usaha yang tersaji:',
    hint: 'Evaluasi keterjadian keraguan substansial atas kemampuan entitas mempertahankan kelangsungan usahanya (Going Concern - SA 570).',
    isParent: true,
  },
  {
    id: '1a',
    number: '1',
    subNumber: 'a',
    text: 'Pada catatan atas Laporan Keuangan sebelumnya',
    hint: 'Catatan atas Laporan Keuangan (CALK) memuat pengungkapan kondisi/peristiwa ketidakpastian material terkait kelangsungan usaha atau defisiensi modal.',
  },
  {
    id: '1b',
    number: '1',
    subNumber: 'b',
    text: 'Pada opini auditor sebelumnya',
    hint: 'Laporan auditor independen periode lalu memuat paragraf penekanan suatu hal (Emphasis of Matter) atau modifikasi opini terkait going concern.',
  },
  {
    id: '2',
    number: '2',
    text: 'Apakah terdapat isu mengenai restrukturisasi keuangan?',
    hint: 'Entitas sedang atau pernah dalam proses restrukturisasi utang perbankan, penundaan kewajiban pembayaran utang (PKPU), default bunga pinjaman, atau renegosiasi kredit.',
  },
  {
    id: '3',
    number: '3',
    text: 'Apakah terdapat isu mengenai kerugian yang berlanjut?',
    hint: 'Entitas mengalami rugi operasional dan/atau rugi bersih berturut-turut dalam beberapa tahun buku terakhir atau memiliki arus kas negatif dari aktivitas operasional.',
  },
  {
    id: '4',
    number: '4',
    text: 'Apakah terdapat isu mengenai penyajian kembali (restated) atas laporan keuangan?',
    hint: 'Penyajian kembali (restatement) atas laporan keuangan periode sebelumnya karena koreksi kesalahan material (SA 710) atau perubahan kebijakan akuntansi retrospektif.',
  },
  {
    id: '5',
    number: '5',
    text: 'Apakah Opini auditor periode lalu (jika ada) menyatakan opini selain wajar tanpa pengecualian?',
    hint: 'Opini auditor independen periode sebelumnya adalah Wajar Dengan Pengecualian (WDP/Qualified), Tidak Wajar (TW/Adverse), atau Tidak Memberikan Pendapat (TMP/Disclaimer).',
  },
];

const EVALUATED_QUESTION_IDS = ['1a', '1b', '2', '3', '4', '5'];

const DEFAULT_ANSWERS: Record<string, 'Ya' | 'Tidak' | ''> = {
  '1a': 'Ya',
  '1b': 'Tidak',
  '2': 'Ya',
  '3': 'Ya',
  '4': 'Tidak',
  '5': 'Tidak',
};

const DEFAULT_REASON =
  'KAP akan menambahkan ahli yg berpengalaman dalam mengevaluasi imbalan paska kerja.\nAkan dilibatkan seorang EQCR untuk membantu analisis rencana manajemen terkait isu going concern';

const A1101: React.FC = () => {
  const context = useOutletContext<{ engagement?: Engagement }>();
  const { id: paramId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const engagement = context?.engagement || engagements.find((e) => e.id === paramId) || engagements[0];
  const navigate = useNavigate();

  const wsA1101 = engagement?.worksheetA1101;
  const wsA110 = engagement?.worksheetA110;

  // Initialize state with stored data or defaults matching official ATLAS template
  const [answers, setAnswers] = useState<Record<string, 'Ya' | 'Tidak' | ''>>(() => {
    if (wsA1101?.answers && Object.keys(wsA1101.answers).length > 0) {
      return { ...wsA1101.answers };
    }
    return { ...DEFAULT_ANSWERS };
  });

  const [acceptanceReason, setAcceptanceReason] = useState<string>(() => {
    if (wsA1101?.acceptanceReason !== undefined) {
      return wsA1101.acceptanceReason;
    }
    if (wsA110?.riskMitigationExplanation) {
      return wsA110.riskMitigationExplanation;
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
    return EVALUATED_QUESTION_IDS.filter((id) => answers[id] === 'Ya' || answers[id] === 'Tidak').length;
  }, [answers]);

  const hasAnyYes = useMemo(() => {
    return EVALUATED_QUESTION_IDS.some((id) => answers[id] === 'Ya');
  }, [answers]);

  // If there are "Ya" answers, acceptanceReason must be provided
  const isReasonValid = useMemo(() => {
    if (!hasAnyYes) return true;
    return acceptanceReason.trim().length > 0;
  }, [hasAnyYes, acceptanceReason]);

  const isCompleted = answeredCount === EVALUATED_QUESTION_IDS.length && isReasonValid;
  const statusKKP = isCompleted ? 'Completed' : 'Uncompleted';

  // Risk evaluation: Any "Ya" translates to high risk in A.110
  const evaluatedRisk: 'high' | 'low' = hasAnyYes ? 'high' : 'low';

  const handleToggle = (id: string, value: 'Ya' | 'Tidak') => {
    setAnswers((prev) => ({
      ...prev,
      [id]: prev[id] === value ? '' : value,
    }));
    setIsSaved(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset semua jawaban ke default referensi ATLAS?')) {
      setAnswers({ ...DEFAULT_ANSWERS });
      setAcceptanceReason(DEFAULT_REASON);
      setIsSaved(false);
      showToast('Jawaban berhasil direset ke nilai awal ATLAS.');
    }
  };

  const handleSave = async () => {
    if (!engagement?.id) return;

    try {
      // 1. Prepare updated A.1101 data
      const updatedA1101 = {
        answers,
        acceptanceReason,
        isCompleted,
        status: statusKKP,
      };

      // 2. Prepare synced A.110 evaluations
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
          'A.1101': evaluatedRisk,
        },
        riskMitigationExplanation: acceptanceReason,
      };

      await updateEngagement(engagement.id, {
        worksheetA1101: updatedA1101,
        worksheetA110: updatedA110,
      });

      setIsSaved(true);
      showToast('Kertas Kerja A.1101 berhasil disimpan & disinkronkan ke A.110!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving A.1101:', err);
      showToast('Gagal menyimpan kertas kerja. Coba lagi.');
    }
  };

  return (
    <WorksheetContainer
      code="A.1101"
      name="Isu Pelaporan Keuangan Terdahulu"
      purpose="Mengevaluasi isu pelaporan keuangan terdahulu entitas seperti kelangsungan usaha (going concern), restrukturisasi utang, kerugian berlanjut, restatement, dan opini audit periode lalu sesuai standar SA 210, SA 570, dan SA 705."
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                SA 570
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                SA 705
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Ceklis Pertanyaan Terkait Isu Pelaporan Keuangan Terdahulu
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Kertas kerja ini digunakan untuk meneliti riwayat isu pelaporan keuangan klien terdahulu guna mengukur risiko penerimaan/keberlanjutan perikatan dan menentukan prosedur mitigasi risiko yang memadai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Answered Progress */}
            <div className="text-left sm:text-right px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="text-[11px] font-semibold text-slate-500">Progress Evaluasi</div>
              <div className="text-sm font-bold text-slate-800">
                {answeredCount} dari {EVALUATED_QUESTION_IDS.length} dijawab ({Math.round((answeredCount / EVALUATED_QUESTION_IDS.length) * 100)}%)
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
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">Risiko A.1101</span>
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

        {/* Question Checklist Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Daftar Pertanyaan Terkait Isu Pelaporan Keuangan Terdahulu
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Hasil Analisis (Pilih Ya atau Tidak)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {CHECKLIST_CONFIG.map((item) => {
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
                    <span className="w-6 font-bold text-slate-500 shrink-0 text-sm">
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
                    {answer === 'Ya' && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <AlertCircle size={12} />
                        Isu Teridentifikasi
                      </span>
                    )}
                    {answer === 'Tidak' && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check size={12} />
                        Tidak Ada Isu
                      </span>
                    )}

                    {/* Toggle Controls */}
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id, 'Ya')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                          answer === 'Ya'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Pilih Ya (Terdapat isu)"
                      >
                        <Check size={13} className={answer === 'Ya' ? 'opacity-100' : 'opacity-40'} />
                        Ya
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id, 'Tidak')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                          answer === 'Tidak'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Pilih Tidak (Tidak terdapat isu)"
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
            {hasAnyYes ? (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 w-fit">
                <AlertCircle size={12} />
                Wajib diisi karena terdapat jawaban &quot;Ya&quot;
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1 w-fit">
                Opsional (Semua kriteria dijawab &quot;Tidak&quot;)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Jika terindikasi isu kelangsungan usaha, restrukturisasi, rugi berlanjut, restatement, atau modifikasi opini, uraikan pertimbangan profesional KAP, keterlibatan tenaga ahli (specialist), prosedur audit tambahan, serta penunjukan EQCR (Penelaah Mutu Perikatan) sebagai mitigasi risiko.
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
                  'KAP akan menambahkan ahli yg berpengalaman dalam mengevaluasi imbalan paska kerja.\nAkan dilibatkan seorang EQCR untuk membantu analisis rencana manajemen terkait isu going concern'
                )
              }
              className="text-[11px] font-medium text-slate-600 hover:text-atlas-blue bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors text-left"
            >
              Ahli Imbalan Kerja &amp; Pelibatan EQCR (Default ATLAS)
            </button>
            <button
              type="button"
              onClick={() =>
                setAcceptanceReason(
                  'Manajemen entitas telah menyusun rencana strategis dan cash flow projection 12 bulan ke depan yang telah disetujui dewan komisaris. Tim audit melibatkan senior manager dan EQCR untuk menguji asumsi kelangsungan usaha.'
                )
              }
              className="text-[11px] font-medium text-slate-600 hover:text-atlas-blue bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors text-left"
            >
              Mitigasi Cash Flow Projection &amp; Supervisi EQCR
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
              placeholder="Tuliskan alasan profesional KAP tetap menerima perikatan serta prosedur mitigasi risikonya di sini..."
              className={`w-full rounded-xl border p-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all resize-y ${
                hasAnyYes && !acceptanceReason.trim()
                  ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-200 bg-slate-50/50 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue'
              }`}
            />
          </div>

          {hasAnyYes && !acceptanceReason.trim() && (
            <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} />
              Alasan KAP wajib dicantumkan sebelum KKP A.1101 dapat diselesaikan (Completed).
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
                Menyimpan kertas kerja ini akan otomatis memperbarui evaluasi item 4 (Isu Pelaporan Keuangan Terdahulu) pada KKP A.110 menjadi{' '}
                <strong className={evaluatedRisk === 'high' ? 'text-rose-700' : 'text-emerald-700'}>
                  {evaluatedRisk.toUpperCase()}
                </strong>{' '}
                serta menyelaraskan catatan mitigasi perikatan.
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

export default A1101;
