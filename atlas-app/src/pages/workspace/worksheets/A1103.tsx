import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate, useParams, Link } from 'react-router-dom';
import type { Engagement, PersonnelA1103 } from '../../../store/engagementStore';
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
  Users,
  Clock,
  GraduationCap,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  Lock
} from 'lucide-react';

const DEFAULT_PERSONNEL: PersonnelA1103[] = [
  {
    id: 'p1',
    no: 1,
    nama: 'Agus',
    jabatan: 'Partner',
    lampiranKompetensi: 'CV_dan_sertifikat PPL1',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 10,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Tidak',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Tidak',
    independensi: 'Independen',
    dipilih: 'Ya',
    peran: 'Partner'
  },
  {
    id: 'p2',
    no: 2,
    nama: 'Arie',
    jabatan: 'Partner',
    lampiranKompetensi: 'CV_dan_sertifikat PPL2',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 8,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Tidak',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Tidak',
    independensi: 'Independen',
    dipilih: 'Tidak',
    peran: 'Reviewer'
  },
  {
    id: 'p3',
    no: 3,
    nama: 'Triyanto',
    jabatan: 'Manager',
    lampiranKompetensi: 'CV_dan_sertifikat PPL3',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 6,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Tidak',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Tidak',
    independensi: 'Independen',
    dipilih: 'Ya',
    peran: 'Manager'
  },
  {
    id: 'p4',
    no: 4,
    nama: 'Eko',
    jabatan: 'Manager',
    lampiranKompetensi: 'CV_dan_sertifikat PPL4',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 6,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Tidak Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Tidak',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Tidak',
    independensi: 'Independen',
    dipilih: 'Tidak',
    peran: 'Manager'
  },
  {
    id: 'p5',
    no: 5,
    nama: 'Adib',
    jabatan: 'Staf',
    lampiranKompetensi: 'CV_dan_sertifikat PPL5',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 4,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Tidak',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Tidak',
    independensi: 'Independen',
    dipilih: 'Ya',
    peran: 'Ketua Tim'
  },
  {
    id: 'p6',
    no: 6,
    nama: 'Joko',
    jabatan: 'Staf',
    lampiranKompetensi: 'CV_dan_sertifikat PPL6',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 4,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Tidak',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Tidak',
    independensi: 'Independen',
    dipilih: 'Ya',
    peran: 'Anggota Tim'
  },
  {
    id: 'p7',
    no: 7,
    nama: 'Yoga',
    jabatan: 'Staf',
    lampiranKompetensi: 'CV_dan_sertifikat PPL7',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 4,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Tidak',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Tidak',
    independensi: 'Independen',
    dipilih: 'Ya',
    peran: 'Anggota Tim'
  },
  {
    id: 'p8',
    no: 8,
    nama: 'Isyana',
    jabatan: 'Staf',
    lampiranKompetensi: 'CV_dan_sertifikat PPL8',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 4,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Tidak',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Tidak',
    independensi: 'Independen',
    dipilih: 'Ya',
    peran: 'Anggota Tim'
  },
  {
    id: 'p9',
    no: 9,
    nama: 'Septin',
    jabatan: 'Staf',
    lampiranKompetensi: 'CV_dan_sertifikat PPL9',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 4,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Ya',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Tidak',
    independensi: 'Independen',
    dipilih: 'Tidak',
    peran: 'Staf'
  },
  {
    id: 'p10',
    no: 10,
    nama: 'Gerry',
    jabatan: 'Staf',
    lampiranKompetensi: 'CV_dan_sertifikat PPL10',
    lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
    pengalamanTahun: 4,
    pemahamanEntitas: 'Memadai',
    pemahamanStandarAudit: 'Memadai',
    pemahamanPeraturan: 'Memadai',
    pemahamanTI: 'Memadai',
    pemahamanStandarAkuntansi: 'Memadai',
    pemahamanKebijakanKAP: 'Memadai',
    cuti: 'Tidak',
    resign: 'Tidak',
    phk: 'Tidak',
    akhirMasaKerja: 'Tidak',
    perikatanLain: 'Tidak',
    lainnya: 'Ya',
    independensi: 'Independen',
    dipilih: 'Tidak',
    peran: 'Staf'
  }
];

type ActiveTab = 'kompetensi' | 'waktu' | 'ringkasan' | 'independensi';

const A1103: React.FC = () => {
  const context = useOutletContext<{ engagement?: Engagement }>();
  const { id: paramId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const engagement = context?.engagement || engagements.find((e) => e.id === paramId) || engagements[0];
  const navigate = useNavigate();

  const wsA1103 = engagement?.worksheetA1103;

  const [activeTab, setActiveTab] = useState<ActiveTab>('kompetensi');
  const [personnelList, setPersonnelList] = useState<PersonnelA1103[]>(() => {
    if (wsA1103?.personnelList && wsA1103.personnelList.length > 0) {
      return wsA1103.personnelList;
    }
    return DEFAULT_PERSONNEL;
  });

  const [temaPelatihan, setTemaPelatihan] = useState<string>(
    wsA1103?.temaPelatihan || 'Pembaruan Standar Akuntansi Keuangan SAK EP & PSAK 74 (Kontrak Asuransi)'
  );

  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to compute competency status for a person
  const getKompetensiStatus = (p: PersonnelA1103): 'Memadai' | 'Perlu update' => {
    const isAllAdequate =
      p.pemahamanEntitas === 'Memadai' &&
      p.pemahamanStandarAudit === 'Memadai' &&
      p.pemahamanPeraturan === 'Memadai' &&
      p.pemahamanTI === 'Memadai' &&
      p.pemahamanStandarAkuntansi === 'Memadai' &&
      p.pemahamanKebijakanKAP === 'Memadai';
    return isAllAdequate ? 'Memadai' : 'Perlu update';
  };

  // Helper to compute time availability status for a person
  const getKetersediaanWaktuStatus = (p: PersonnelA1103): 'Memadai' | 'Ada batasan waktu' => {
    const hasLimitation =
      p.cuti === 'Ya' ||
      p.resign === 'Ya' ||
      p.phk === 'Ya' ||
      p.akhirMasaKerja === 'Ya' ||
      p.perikatanLain === 'Ya' ||
      p.lainnya === 'Ya';
    return hasLimitation ? 'Ada batasan waktu' : 'Memadai';
  };

  // Team summary calculations
  const assignedTeam = useMemo(() => {
    return personnelList.filter((p) => p.dipilih === 'Ya');
  }, [personnelList]);

  // Evaluated risk: If any assigned team member has competency issues without mitigation or has independence issues
  const evaluatedRisk: 'high' | 'low' = useMemo(() => {
    const hasUnresolvedIssue = assignedTeam.some((p) => {
      const komp = getKompetensiStatus(p);
      const waktu = getKetersediaanWaktuStatus(p);
      return komp === 'Perlu update' || waktu === 'Ada batasan waktu' || p.independensi !== 'Independen';
    });
    return hasUnresolvedIssue ? 'high' : 'low';
  }, [assignedTeam]);

  // Status KKP calculation
  const isCompleted = useMemo(() => {
    if (personnelList.length === 0) return false;
    if (assignedTeam.length === 0) return false;
    // Check that at least Partner and Manager are chosen
    const hasPartner = assignedTeam.some((p) => p.jabatan === 'Partner' || p.peran === 'Partner');
    const hasManager = assignedTeam.some((p) => p.jabatan === 'Manager' || p.peran === 'Manager');
    return hasPartner && hasManager;
  }, [personnelList, assignedTeam]);

  const statusKKP = isCompleted ? 'Completed' : 'Uncompleted';

  const updatePersonnelField = <K extends keyof PersonnelA1103>(
    id: string,
    field: K,
    value: PersonnelA1103[K]
  ) => {
    setPersonnelList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setIsSaved(false);
  };

  const handleAddPersonnel = () => {
    const newNo = personnelList.length + 1;
    const newPerson: PersonnelA1103 = {
      id: `p_${Date.now()}`,
      no: newNo,
      nama: `Auditor Baru ${newNo}`,
      jabatan: 'Staf',
      lampiranKompetensi: `CV_dan_sertifikat PPL${newNo}`,
      lampiranWaktu: 'Evaluasi_pembagian_tugas.pdf',
      pengalamanTahun: 2,
      pemahamanEntitas: 'Memadai',
      pemahamanStandarAudit: 'Memadai',
      pemahamanPeraturan: 'Memadai',
      pemahamanTI: 'Memadai',
      pemahamanStandarAkuntansi: 'Memadai',
      pemahamanKebijakanKAP: 'Memadai',
      cuti: 'Tidak',
      resign: 'Tidak',
      phk: 'Tidak',
      akhirMasaKerja: 'Tidak',
      perikatanLain: 'Tidak',
      lainnya: 'Tidak',
      independensi: 'Independen',
      dipilih: 'Tidak',
      peran: 'Staf'
    };
    setPersonnelList([...personnelList, newPerson]);
    setIsSaved(false);
    showToast('Baris personel baru berhasil ditambahkan.');
  };

  const handleRemovePersonnel = (id: string) => {
    if (personnelList.length <= 1) return;
    setPersonnelList((prev) =>
      prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, no: idx + 1 }))
    );
    setIsSaved(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset seluruh data personel ke nilai awal referensi ATLAS?')) {
      setPersonnelList(DEFAULT_PERSONNEL);
      setIsSaved(false);
      showToast('Data berhasil direset ke standar ATLAS.');
    }
  };

  const handleSave = async () => {
    if (!engagement?.id) return;

    try {
      const updatedA1103 = {
        personnelList,
        temaPelatihan,
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
          'A.1103': evaluatedRisk,
        },
      };

      await updateEngagement(engagement.id, {
        worksheetA1103: updatedA1103,
        worksheetA110: updatedA110,
      });

      setIsSaved(true);
      showToast('Kertas Kerja A.1103 berhasil disimpan & disinkronkan ke A.110!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving A.1103:', err);
      showToast('Gagal menyimpan kertas kerja. Coba lagi.');
    }
  };

  return (
    <WorksheetContainer
      code="A.1103"
      name="Kompetensi, Ketersediaan Waktu, & Independensi Personel KAP"
      purpose="Mengevaluasi kompetensi teknis, kecukupan pengalaman, ketersediaan waktu kerja, serta kepatuhan independensi personel KAP sebelum menetapkan tim perikatan sesuai SA 220 dan SPM 1."
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

        {/* Top Summary Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200">
                SA 220
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                SPM 1
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                ISQM 1
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Kode Etik IAPI
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Evaluasi Sumber Daya Manusia &amp; Penugasan Tim Perikatan
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Mengevaluasi kompetensi teknis, ketersediaan alokasi waktu kerja, dan independensi personel KAP guna memastikan tim perikatan yang dibentuk memiliki kecukupan kapabilitas dan kepatuhan kode etik profesi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Personnel Count */}
            <div className="text-left sm:text-right px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="text-[11px] font-semibold text-slate-500">Tim Perikatan Terpilih</div>
              <div className="text-sm font-bold text-slate-800">
                {assignedTeam.length} dari {personnelList.length} Personel
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
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">Risiko Tim</span>
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

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('kompetensi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'kompetensi'
                  ? 'bg-atlas-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap size={15} />
              <span>1. Daftar &amp; Analisis Kompetensi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('waktu')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'waktu'
                  ? 'bg-atlas-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock size={15} />
              <span>2. Analisis Ketersediaan Waktu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ringkasan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ringkasan'
                  ? 'bg-atlas-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users size={15} />
              <span>3. Ringkasan &amp; Tim Terpilih</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('independensi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'independensi'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50/60'
              }`}
            >
              <Lock size={15} />
              <span>4. Evaluasi Independensi</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddPersonnel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-atlas-blue bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Plus size={14} />
            <span>Tambah Personel</span>
          </button>
        </div>

        {/* TAB 1: DAFTAR PERSONEL & ANALISIS KOMPETENSI */}
        {activeTab === 'kompetensi' && (
          <div className="space-y-6">
            {/* Section 1: Daftar Personel KAP */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="text-atlas-blue" size={18} />
                  <h2 className="text-sm font-bold text-slate-800">
                    Daftar Personel KAP &amp; Lampiran Dokumentasi
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {personnelList.length} Personel Terdaftar
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">No.</th>
                      <th className="px-4 py-3 min-w-[150px]">Nama</th>
                      <th className="px-4 py-3 min-w-[120px]">Jabatan</th>
                      <th className="px-4 py-3 min-w-[220px]">Lampiran Dokumentasi Kompetensi</th>
                      <th className="px-4 py-3 min-w-[220px]">Lampiran Dokumentasi Ketersediaan Waktu</th>
                      <th className="px-4 py-3 text-center w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personnelList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 text-center font-bold text-slate-400">{p.no}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <input
                            type="text"
                            value={p.nama}
                            onChange={(e) => updatePersonnelField(p.id, 'nama', e.target.value)}
                            className="w-full px-2 py-1 border border-transparent hover:border-slate-300 focus:border-atlas-blue rounded text-xs font-semibold text-slate-900 bg-transparent focus:bg-white outline-none"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={p.jabatan}
                            onChange={(e) => updatePersonnelField(p.id, 'jabatan', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-800 bg-white focus:border-atlas-blue outline-none"
                          >
                            <option value="Partner">Partner</option>
                            <option value="Manager">Manager</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Senior">Senior</option>
                            <option value="Staf">Staf</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-atlas-blue font-medium">
                            <FileText size={13} className="shrink-0 text-slate-400" />
                            <input
                              type="text"
                              value={p.lampiranKompetensi}
                              onChange={(e) => updatePersonnelField(p.id, 'lampiranKompetensi', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-blue-700 bg-white focus:border-atlas-blue outline-none underline underline-offset-2"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Upload size={13} className="shrink-0 text-slate-400" />
                            <input
                              type="text"
                              value={p.lampiranWaktu}
                              onChange={(e) => updatePersonnelField(p.id, 'lampiranWaktu', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-700 bg-white focus:border-atlas-blue outline-none"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePersonnel(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus personel"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Analisis Kompetensi Personel KAP terkait dengan Rencana Perikatan */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="text-atlas-blue" size={18} />
                  <h2 className="text-sm font-bold text-slate-800">
                    Analisis Kompetensi Personel KAP terkait dengan Rencana Perikatan
                  </h2>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Status otomatis &apos;Perlu update&apos; jika terdapat aspek &apos;Tidak Memadai&apos;
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="px-3 py-3 text-center w-10">No.</th>
                      <th className="px-3 py-3 min-w-[130px]">Nama</th>
                      <th className="px-3 py-3 text-center min-w-[130px] bg-slate-100/70">Kompetensi Personel</th>
                      <th className="px-3 py-3 text-center min-w-[90px] bg-amber-50/50">Pengalaman (Thn)</th>
                      <th className="px-2 py-3 text-center min-w-[120px]">Pemahaman Entitas</th>
                      <th className="px-2 py-3 text-center min-w-[120px]">Pemahaman Standar Audit</th>
                      <th className="px-2 py-3 text-center min-w-[120px]">Pemahaman Peraturan Klien</th>
                      <th className="px-2 py-3 text-center min-w-[120px]">Pemahaman IT Klien</th>
                      <th className="px-2 py-3 text-center min-w-[130px]">Pemahaman Standar Akuntansi</th>
                      <th className="px-2 py-3 text-center min-w-[130px]">Kebijakan &amp; Prosedur KAP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personnelList.map((p) => {
                      const kompStatus = getKompetensiStatus(p);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 py-3 text-center font-bold text-slate-400">{p.no}</td>
                          <td className="px-3 py-3 font-bold text-slate-900">{p.nama}</td>
                          <td className="px-3 py-3 text-center bg-slate-50/50">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                kompStatus === 'Memadai'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {kompStatus}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center bg-amber-50/30">
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={p.pengalamanTahun}
                              onChange={(e) =>
                                updatePersonnelField(p.id, 'pengalamanTahun', Number(e.target.value) || 0)
                              }
                              className="w-14 text-center px-1.5 py-1 border border-slate-200 rounded text-xs font-bold text-slate-800 bg-white outline-none focus:border-atlas-blue"
                            />
                          </td>
                          {/* 6 Aspects */}
                          {(
                            [
                              'pemahamanEntitas',
                              'pemahamanStandarAudit',
                              'pemahamanPeraturan',
                              'pemahamanTI',
                              'pemahamanStandarAkuntansi',
                              'pemahamanKebijakanKAP',
                            ] as const
                          ).map((field) => (
                            <td key={field} className="px-2 py-3 text-center">
                              <select
                                value={p[field]}
                                onChange={(e) =>
                                  updatePersonnelField(
                                    p.id,
                                    field,
                                    e.target.value as 'Memadai' | 'Tidak Memadai'
                                  )
                                }
                                className={`w-full px-2 py-1 rounded text-[11px] font-semibold text-center border outline-none ${
                                  p[field] === 'Memadai'
                                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                                    : 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                                }`}
                              >
                                <option value="Memadai">Memadai</option>
                                <option value="Tidak Memadai">Tidak Memadai</option>
                              </select>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANALISIS KETERSEDIAAN WAKTU */}
        {activeTab === 'waktu' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="text-atlas-blue" size={18} />
                  <h2 className="text-sm font-bold text-slate-800">
                    Analisis Ketersediaan Waktu Personel KAP terkait dengan Rencana Perikatan
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('independensi')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-atlas-blue hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <span>Ke Independensi</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="px-3 py-3 text-center w-10" rowSpan={2}>
                        No.
                      </th>
                      <th className="px-4 py-3 min-w-[140px]" rowSpan={2}>
                        Nama
                      </th>
                      <th className="px-4 py-3 text-center min-w-[150px] bg-slate-100/70" rowSpan={2}>
                        Ketersediaan Waktu Personel KAP
                      </th>
                      <th
                        className="px-4 py-2 text-center bg-slate-100/40 border-l border-slate-200"
                        colSpan={6}
                      >
                        Batasan waktu yang tersedia terkait perjanjian kerja antara Tim dengan KAP, karena:
                      </th>
                    </tr>
                    <tr className="border-t border-slate-200 text-slate-600 bg-slate-50/80">
                      <th className="px-2 py-2 text-center w-24 border-l border-slate-200">Cuti</th>
                      <th className="px-2 py-2 text-center w-24">Resign</th>
                      <th className="px-2 py-2 text-center w-24">PHK</th>
                      <th className="px-2 py-2 text-center w-28">Akhir Masa Kerja</th>
                      <th className="px-2 py-2 text-center w-28">Perikatan Lain</th>
                      <th className="px-2 py-2 text-center w-24">Lainnya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personnelList.map((p) => {
                      const waktuStatus = getKetersediaanWaktuStatus(p);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 py-3 text-center font-bold text-slate-400">{p.no}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{p.nama}</td>
                          <td className="px-4 py-3 text-center bg-slate-50/50">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                waktuStatus === 'Memadai'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {waktuStatus}
                            </span>
                          </td>

                          {/* 6 Limitation Reasons (Ya / Tidak) */}
                          {(
                            ['cuti', 'resign', 'phk', 'akhirMasaKerja', 'perikatanLain', 'lainnya'] as const
                          ).map((reason, rIdx) => (
                            <td
                              key={reason}
                              className={`px-2 py-3 text-center ${
                                rIdx === 0 ? 'border-l border-slate-200' : ''
                              }`}
                            >
                              <select
                                value={p[reason]}
                                onChange={(e) =>
                                  updatePersonnelField(p.id, reason, e.target.value as 'Ya' | 'Tidak')
                                }
                                className={`w-full px-2 py-1 rounded text-center text-xs font-bold border outline-none ${
                                  p[reason] === 'Ya'
                                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                                }`}
                              >
                                <option value="Tidak">Tidak</option>
                                <option value="Ya">Ya</option>
                              </select>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RINGKASAN & PENUGASAN TIM */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Ringkasan hasil analisis kompetensi dan ketersediaan waktu */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="text-atlas-blue" size={18} />
                    <h2 className="text-sm font-bold text-slate-800">
                      Ringkasan Hasil Analisis Kompetensi &amp; Ketersediaan Waktu
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Matriks Komparasi</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">No.</th>
                        <th className="px-4 py-3 min-w-[140px]">Nama</th>
                        <th className="px-4 py-3 text-center min-w-[130px]">Kompetensi</th>
                        <th className="px-4 py-3 text-center min-w-[140px]">Ketersediaan Waktu</th>
                        <th className="px-4 py-3 text-center min-w-[110px] bg-slate-100">Dipilih Tim</th>
                        <th className="px-4 py-3 min-w-[130px] bg-slate-100">Peran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {personnelList.map((p) => {
                        const komp = getKompetensiStatus(p);
                        const waktu = getKetersediaanWaktuStatus(p);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 text-center font-bold text-slate-400">{p.no}</td>
                            <td className="px-4 py-3 font-bold text-slate-900">{p.nama}</td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  komp === 'Memadai'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {komp}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  waktu === 'Memadai'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {waktu}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center bg-slate-50/40">
                              <select
                                value={p.dipilih}
                                onChange={(e) =>
                                  updatePersonnelField(p.id, 'dipilih', e.target.value as 'Ya' | 'Tidak')
                                }
                                className={`px-2 py-1 rounded text-xs font-bold border outline-none ${
                                  p.dipilih === 'Ya'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                <option value="Ya">Ya</option>
                                <option value="Tidak">Tidak</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 bg-slate-50/40">
                              <input
                                type="text"
                                value={p.peran}
                                onChange={(e) => updatePersonnelField(p.id, 'peran', e.target.value)}
                                className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-medium text-slate-800 bg-white outline-none focus:border-atlas-blue"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Col: Navigation & Decision Card */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Scale size={20} className="text-blue-300" />
                    <h3 className="text-sm font-bold tracking-tight">Kesiapan Tim Perikatan</h3>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Pastikan seluruh anggota tim inti (Partner, Manager, dan Senior) memiliki kompetensi memadai dan bebas dari kendala waktu kerja.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('independensi')}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-blue-950 bg-white hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Lanjut ke Evaluasi Independensi</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>

                {/* Training theme section */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-atlas-blue" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Tema Pendidikan &amp; Pelatihan Berkelanjutan (PPL)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Untuk personel yang berstatus &apos;Perlu update&apos;, tentukan tema pelatihan yang diwajibkan KAP:
                  </p>
                  <textarea
                    rows={3}
                    value={temaPelatihan}
                    onChange={(e) => setTemaPelatihan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-atlas-blue outline-none resize-none bg-slate-50/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EVALUASI INDEPENDENSI */}
        {activeTab === 'independensi' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="text-indigo-600" size={18} />
                  <h2 className="text-sm font-bold text-slate-800">
                    Evaluasi Kepatuhan Independensi Personel KAP (Kode Etik Profesi Akuntan Publik)
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Bebas dari Benturan Kepentingan &amp; Hubungan Afiliasi
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">No.</th>
                      <th className="px-4 py-3 min-w-[150px]">Nama Personel</th>
                      <th className="px-4 py-3 min-w-[120px]">Jabatan</th>
                      <th className="px-4 py-3 min-w-[200px]">Konfirmasi Kepentingan Finansial / Bisnis</th>
                      <th className="px-4 py-3 min-w-[200px]">Konfirmasi Hubungan Kekeluargaan</th>
                      <th className="px-4 py-3 text-center min-w-[140px] bg-slate-100">Status Independensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personnelList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 text-center font-bold text-slate-400">{p.no}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{p.nama}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{p.jabatan}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                            <Check size={12} /> Bebas kepentingan finansial
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                            <Check size={12} /> Bebas hubungan kekeluargaan
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center bg-slate-50/50">
                          <select
                            value={p.independensi}
                            onChange={(e) =>
                              updatePersonnelField(
                                p.id,
                                'independensi',
                                e.target.value as 'Independen' | 'Tidak Independen'
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                              p.independensi === 'Independen'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-rose-50 border-rose-300 text-rose-800'
                            }`}
                          >
                            <option value="Independen">Independen</option>
                            <option value="Tidak Independen">Tidak Independen</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Integration Insight to A.110 */}
        <div className="bg-blue-50/50 rounded-2xl border border-blue-200/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="text-atlas-blue shrink-0 mt-0.5" size={18} />
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-900">
                Sinkronisasi Otomatis ke Kertas Kerja Induk A.110
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Menyimpan kertas kerja ini akan otomatis memperbarui evaluasi item 6 (Kompetensi, Waktu, &amp; Independensi) pada KKP A.110 menjadi{' '}
                <strong className={evaluatedRisk === 'high' ? 'text-rose-700' : 'text-emerald-700'}>
                  {evaluatedRisk.toUpperCase()}
                </strong>{' '}
                dan mencatat susunan tim perikatan yang siap ditugaskan.
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

export default A1103;
