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
  text: string;
  hint: string;
  refIndex?: string;
  refDesc?: string;
}

const QUESTIONS_CONFIG: QuestionItem[] = [
  {
    id: '1',
    number: '1',
    text: 'Apakah terdapat reputasi buruk pada pribadi dan bisnis dari pemilik utama, manajemen kunci dan pihak yang bertanggung jawab atas tata kelola klien?',
    hint: 'Meneliti rekam jejak etika bisnis, riwayat kepailitan/fraud, sanksi otoritas pasar modal, atau keterlibatan sengketa hukum dari pemegang saham pengendali dan manajemen kunci.',
  },
  {
    id: '2',
    number: '2',
    text: 'Apakah terdapat ketidak wajaran sifat operasi klien, termasuk praktik bisnisnya?',
    hint: 'Transaksi berputar tidak lazim, entitas tujuan khusus (SPE) tidak berdasar ekonomi substansial, atau struktur transaksi lintas yurisdiksi suaka pajak (tax haven).',
  },
  {
    id: '3',
    number: '3',
    text: 'Apakah terdapat informasi kurang baik yang berhubungan dengan perilaku pemilik utama, manajemen kunci dan pihak yang bertanggung jawab atas tata kelola klien terhadap hal-hal tertentu seperti interpretasi yang agresif terhadap standar akuntansi dan lingkungan pengendalian internal?',
    hint: 'Kecenderungan menekan pengakuan laba prematur, meremehkan temuan pengendalian internal, atau mengabaikan tata kelola korporasi yang baik (GCG).',
  },
  {
    id: '4',
    number: '4',
    text: 'Apakah klien secara agresif berusaha menekan fee jasa profesional KAP serendah mungkin?',
    hint: 'Upaya pembatasan kompensasi fee profesional di bawah standar wajar yang berisiko mengurangi kedalaman prosedur pengujian dan alokasi jam kerja tim audit.',
  },
  {
    id: '5',
    number: '5',
    text: 'Apakah terdapat indikasi terjadinya pembatasan lingkup pekerjaan yang tidak wajar?',
    hint: 'Pembatasan akses bukti dokumen audit, pembatasan konfirmasi pihak ketiga, larangan wawancara personel kunci, atau penentuan tenggat waktu pelaporan yang tidak realistis.',
  },
  {
    id: '6',
    number: '6',
    text: 'Apakah terdapat indikasi bahwa klien mungkin terlibat dalam pencucian uang dan terorisme sebagaimana yang dimaksud PMK No 55/PMK.01/2017 (yang telah diubah dengan PMK 155/PMK.01/2017)?',
    hint: 'Penerapan Prinsip Mengenali Pengguna Jasa (PMPJ) untuk mendeteksi transaksi keuangan mencurigakan, Beneficial Ownership tersembunyi, serta risiko Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme (TPPT).',
    refIndex: 'A.1102.1',
    refDesc: 'KKP Pendukung Analisis TPPU & TPPT PMK 55/2017',
  },
  {
    id: '7',
    number: '7',
    text: 'Apakah terdapat identitas dan reputasi buruk atas bisnis dari pihak-pihak yang mempunyai hubungan istimewa?',
    hint: 'Transaksi bernilai material dengan pihak berelasi yang memiliki catatan wanprestasi, investigasi penegak hukum, sengketa pajak, atau transaksi non-arm’s length.',
  },
  {
    id: '8',
    number: '8',
    text: 'Apakah terdapat dua auditor independen untuk melakukan audit atas laporan keuangan pada periode yang sama?',
    hint: 'Kecuali perikatan audit bersama (joint audit) yang sah secara regulasi, keberadaan auditor lain berpotensi mengindikasikan upaya perburuan opini (opinion shopping).',
  },
  {
    id: '9',
    number: '9',
    text: 'Apakah terdapat alasan yang tidak wajar atas penunjukan dan penggantian KAP sebelumnya?',
    hint: 'Penggantian auditor pendahulu yang dilatarbelakangi perselisihan prinsip akuntansi, pembatasan lingkup pengujian, atau modifikasi opini periode terdahulu.',
  },
];

const DEFAULT_ANSWERS: Record<string, 'Ya' | 'Tidak' | ''> = {
  '1': 'Tidak',
  '2': 'Tidak',
  '3': 'Tidak',
  '4': 'Tidak',
  '5': 'Tidak',
  '6': 'Ya',
  '7': 'Ya',
  '8': 'Tidak',
  '9': 'Tidak',
};

const DEFAULT_REASON =
  'walaupun berdasarkan pemberitaan di internet, salah satu direksi memiliki keluarga yang terdapat pelanggaran terhadap hukum, tapi tidak ada pemberitaan yang menunjukan peran dari direksi yang telah melakukan pelanggaran hukum bersama dengan keluarganya tersebut.\nWalaupun dirut termasuk dalam pengurus partai besar Lembu Perjuangan, tapi dirut belum pernah menjadi wakil rakyat daerah/pusat';

const A1102: React.FC = () => {
  const context = useOutletContext<{ engagement?: Engagement }>();
  const { id: paramId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const engagement = context?.engagement || engagements.find((e) => e.id === paramId) || engagements[0];
  const navigate = useNavigate();

  const wsA1102 = engagement?.worksheetA1102;
  const wsA110 = engagement?.worksheetA110;

  // Initialize state with stored data or defaults matching official ATLAS template
  const [answers, setAnswers] = useState<Record<string, 'Ya' | 'Tidak' | ''>>(() => {
    if (wsA1102?.answers && Object.keys(wsA1102.answers).length > 0) {
      return { ...wsA1102.answers };
    }
    return { ...DEFAULT_ANSWERS };
  });

  const [acceptanceReason, setAcceptanceReason] = useState<string>(() => {
    if (wsA1102?.acceptanceReason !== undefined) {
      return wsA1102.acceptanceReason;
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
  const totalQuestions = QUESTIONS_CONFIG.length;
  const answeredCount = useMemo(() => {
    return QUESTIONS_CONFIG.filter((q) => answers[q.id] === 'Ya' || answers[q.id] === 'Tidak').length;
  }, [answers]);

  const hasAnyYes = useMemo(() => {
    return QUESTIONS_CONFIG.some((q) => answers[q.id] === 'Ya');
  }, [answers]);

  // If there are "Ya" answers, acceptanceReason must be provided
  const isReasonValid = useMemo(() => {
    if (!hasAnyYes) return true;
    return acceptanceReason.trim().length > 0;
  }, [hasAnyYes, acceptanceReason]);

  const isCompleted = answeredCount === totalQuestions && isReasonValid;
  const statusKKP = isCompleted ? 'Completed' : 'Uncompleted';

  // Risk evaluation: Any "Ya" translates to high risk for integrity in A.110
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
      // 1. Prepare updated A.1102 data
      const updatedA1102 = {
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
          'A.1102': evaluatedRisk,
        },
      };

      await updateEngagement(engagement.id, {
        worksheetA1102: updatedA1102,
        worksheetA110: updatedA110,
      });

      setIsSaved(true);
      showToast('Kertas Kerja A.1102 berhasil disimpan & disinkronkan ke A.110!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving A.1102:', err);
      showToast('Gagal menyimpan kertas kerja. Coba lagi.');
    }
  };

  return (
    <WorksheetContainer
      code="A.1102"
      name="Integritas Manajemen"
      purpose="Mengevaluasi integritas manajemen calon klien, rekam jejak kepatuhan hukum, ketiadaan indikasi fraud, kepatuhan anti pencucian uang (PMK 55/2017), serta reputasi pihak berelasi sebelum menerima perikatan audit."
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
                SPM 1
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                SA 210
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                SA 220
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                PMK 55/2017
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Ceklis Pertanyaan Terkait Isu Integritas Manajemen
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Kertas kerja ini digunakan untuk meneliti integritas calon klien, reputasi jajaran manajemen kunci, pihak berelasi, serta kepatuhan pencegahan tindak pidana pencucian uang sesuai standar SPM 1 dan SA 210.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Answered Progress */}
            <div className="text-left sm:text-right px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="text-[11px] font-semibold text-slate-500">Progress Evaluasi</div>
              <div className="text-sm font-bold text-slate-800">
                {answeredCount} dari {totalQuestions} dijawab ({Math.round((answeredCount / totalQuestions) * 100)}%)
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
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">Risiko Integritas</span>
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
                Daftar Pertanyaan Terkait Isu Integritas Manajemen
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Hasil Analisis (Pilih Ya atau Tidak)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {QUESTIONS_CONFIG.map((item) => {
              const answer = answers[item.id] || '';

              return (
                <div
                  key={item.id}
                  className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/60 bg-white"
                >
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-600 shrink-0 text-sm">
                      {item.number}.
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {item.text}
                        </span>
                        {item.refIndex && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-atlas-blue bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200"
                            title={item.refDesc}
                          >
                            <span>{item.refIndex}</span>
                            <ExternalLink size={11} />
                          </span>
                        )}
                      </div>
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
                        title="Pilih Ya (Terdapat isu integritas)"
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
            Jika terindikasi isu reputasi, keterlibatan perkara hukum pihak terkait, atau hubungan afiliasi, uraikan telaah obyektif KAP, bukti verifikasi independen (background check), pembatasan independensi, serta alasan profesional KAP tetap menerima perikatan audit.
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
                  'walaupun berdasarkan pemberitaan di internet, salah satu direksi memiliki keluarga yang terdapat pelanggaran terhadap hukum, tapi tidak ada pemberitaan yang menunjukan peran dari direksi yang telah melakukan pelanggaran hukum bersama dengan keluarganya tersebut.\nWalaupun dirut termasuk dalam pengurus partai besar Lembu Perjuangan, tapi dirut belum pernah menjadi wakil rakyat daerah/pusat'
                )
              }
              className="text-[11px] font-medium text-slate-600 hover:text-atlas-blue bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors text-left"
            >
              Keluarga Direksi &amp; Afiliasi Parpol (Default ATLAS)
            </button>
            <button
              type="button"
              onClick={() =>
                setAcceptanceReason(
                  'KAP telah melakukan uji tuntas independen (due diligence) terhadap jajaran manajemen kunci dan pemegang saham. Tidak ditemukan catatan hukum pidana langsung maupun intervensi terhadap independensi tim perikatan audit.'
                )
              }
              className="text-[11px] font-medium text-slate-600 hover:text-atlas-blue bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors text-left"
            >
              Uji Tuntas Independen Bersih (Due Diligence)
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
              placeholder="Tuliskan alasan profesional KAP tetap menerima perikatan terkait isu integritas manajemen di sini..."
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
              Alasan KAP wajib dicantumkan sebelum KKP A.1102 dapat diselesaikan (Completed).
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
                Menyimpan kertas kerja ini akan otomatis memperbarui evaluasi item 5 (Integritas Manajemen) pada KKP A.110 menjadi{' '}
                <strong className={evaluatedRisk === 'high' ? 'text-rose-700' : 'text-emerald-700'}>
                  {evaluatedRisk.toUpperCase()}
                </strong>{' '}
                serta menyelaraskan status kelengkapan perikatan.
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

export default A1102;
