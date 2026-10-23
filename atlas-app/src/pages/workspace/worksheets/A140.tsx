import React, { useState, useMemo } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import type { Engagement } from "../../../store/engagementStore";
import { useEngagementStore } from "../../../store/engagementStore";
import WorksheetContainer from "../../../components/WorksheetContainer";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Upload, 
  Plus, 
  Trash2, 
  Download,
  Users,
  UserPlus,
  RefreshCw,
  Copy,
  Clock,
  ShieldCheck,
  Paperclip,
  FileText,
  Check,
  X
} from "lucide-react";

interface PhaseHours {
  planning: number;
  riskResponse: number;
  reporting: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  rate: number;
  autoHours: PhaseHours;
  manualHours: PhaseHours;
}

const A140: React.FC = () => {
  const context = useOutletContext<{ engagement?: Engagement }>();
  const { id: paramId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const engagement = context?.engagement || engagements.find((e) => e.id === paramId) || engagements[0];
  const navigate = useNavigate();

  const wsA140 = (engagement as any)?.worksheetA140 || {};
  const wsA120 = (engagement as any)?.worksheetA120 || {};

  // 1. Kriteria Surat Tugas (a s.d. e)
  const [answers, setAnswers] = useState<Record<string, string>>({
    qa: wsA140.answers?.qa ?? "Tidak",
    qb: wsA140.answers?.qb ?? "Ya",
    qc: wsA140.answers?.qc ?? "Ya",
    qd: wsA140.answers?.qd ?? "Ya",
    qe: wsA140.answers?.qe ?? "Tidak",
  });

  const [contohFiles, setContohFiles] = useState<string[]>(
    wsA140.contohFiles ?? []
  );

  const [lampiranFiles, setLampiranFiles] = useState<string[]>(
    wsA140.lampiranFiles ?? ["Surat_Tugas.pdf"]
  );

  const [simpulanManual, setSimpulanManual] = useState<string>(
    wsA140.simpulan ?? "Surat Tugas Tidak Memadai"
  );

  const [modificationReason, setModificationReason] = useState<string>(
    wsA140.modificationReason ?? ""
  );

  const [isSaved, setIsSaved] = useState(false);

  // 2. Rencana Alokasi Jam Jasa per Tim (Tetap dipertahankan secara utuh)
  const [teamData, setTeamData] = useState<TeamMember[]>(() => {
    if (wsA140.teamData && Array.isArray(wsA140.teamData) && wsA140.teamData.length > 0) {
      return wsA140.teamData;
    }
    if (wsA120.teamData && Array.isArray(wsA120.teamData) && wsA120.teamData.length > 0) {
      return wsA120.teamData;
    }
    const list: TeamMember[] = [
      { 
        id: '1', name: engagement?.partnerName || 'Partner', role: 'Partner', rate: 2500000, 
        autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
        manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
      },
      { 
        id: '2', name: engagement?.managerName || 'Manager', role: 'Manager', rate: 1500000, 
        autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
        manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
      },
    ];

    if (engagement?.supervisorName) {
      list.push({
        id: 'sub-sup', name: engagement.supervisorName, role: 'Supervisor', rate: 1200000,
        autoHours: { planning: 0, riskResponse: 0, reporting: 0 },
        manualHours: { planning: 0, riskResponse: 0, reporting: 0 }
      });
    }

    list.push({ 
      id: '3', name: engagement?.auditorName || 'Ketua Tim', role: 'Ketua Tim', rate: 800000, 
      autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
      manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
    });

    if (engagement?.teamMembers && engagement.teamMembers.length > 0) {
      engagement.teamMembers.forEach((tm, idx) => {
        list.push({
          id: tm.id || `tm-${idx + 4}`,
          name: tm.name,
          role: tm.role || 'Anggota Tim',
          rate: tm.role?.includes('Pendukung') ? 350000 : 500000,
          autoHours: { planning: 0, riskResponse: 0, reporting: 0 },
          manualHours: { planning: 0, riskResponse: 0, reporting: 0 }
        });
      });
    } else {
      list.push({ 
        id: '4', name: 'Anggota Tim 1', role: 'Anggota Tim', rate: 500000, 
        autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
        manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
      });
    }
    return list;
  });

  const totals = useMemo(() => {
    let manualTotal = { planning: 0, riskResponse: 0, reporting: 0, all: 0 };
    teamData.forEach(member => {
      manualTotal.planning += (member.manualHours?.planning || 0);
      manualTotal.riskResponse += (member.manualHours?.riskResponse || 0);
      manualTotal.reporting += (member.manualHours?.reporting || 0);
    });
    manualTotal.all = manualTotal.planning + manualTotal.riskResponse + manualTotal.reporting;
    return { manualTotal };
  }, [teamData]);

  const totalEffectiveHours = useMemo(() => {
    if (wsA120.totalEffectiveHours) return wsA120.totalEffectiveHours;
    if (wsA120.startDate && wsA120.endDate) {
      const sDate = new Date(wsA120.startDate);
      const eDate = new Date(wsA120.endDate);
      const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const holidays = wsA120.totalHolidays || 0;
      const totalDays = Math.max(0, diffDays - holidays);
      return totalDays * 8;
    }
    return totals.manualTotal.all || 0;
  }, [wsA120, totals.manualTotal.all]);

  const handleAddMember = () => {
    const newId = `tm-${Date.now()}`;
    const newCount = teamData.length + 1;
    const newMember: TeamMember = {
      id: newId,
      name: `Anggota Tim ${newCount}`,
      role: 'Anggota Tim',
      rate: 500000,
      autoHours: { planning: 0, riskResponse: 0, reporting: 0 },
      manualHours: { planning: 0, riskResponse: 0, reporting: 0 }
    };
    setTeamData([...teamData, newMember]);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (teamData.length <= 1) {
      alert("Minimal harus ada 1 anggota tim dalam surat tugas.");
      return;
    }
    if (window.confirm(`Hapus ${name} dari daftar tim surat tugas?`)) {
      setTeamData(teamData.filter(m => m.id !== id));
    }
  };

  const handleUpdateName = (id: string, name: string) => {
    setTeamData(prev => prev.map(m => m.id === id ? { ...m, name } : m));
  };

  const handleUpdateRole = (id: string, role: string) => {
    const defaultRates: Record<string, number> = {
      'Partner': 2500000,
      'Manager': 1500000,
      'Supervisor': 1200000,
      'Ketua Tim': 800000,
      'Anggota Tim': 500000,
      'Tenaga Pendukung': 350000
    };
    setTeamData(prev => prev.map(m => m.id === id ? { ...m, role, rate: defaultRates[role] || 500000 } : m));
  };

  const handleUpdateManualHours = (id: string, phase: keyof PhaseHours, val: string) => {
    const num = parseFloat(val) || 0;
    setTeamData(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          manualHours: {
            ...m.manualHours,
            [phase]: num
          }
        };
      }
      return m;
    }));
  };

  const handleDistributeEffectiveHours = () => {
    if (totalEffectiveHours <= 0) return;
    const count = teamData.length;
    if (count === 0) return;

    const perPerson = totalEffectiveHours / count;
    const plan = Math.round((perPerson * 0.3) * 10) / 10;
    const risk = Math.round((perPerson * 0.5) * 10) / 10;
    const rep = Math.round((perPerson - plan - risk) * 10) / 10;

    setTeamData(prev => prev.map(m => ({
      ...m,
      manualHours: {
        planning: plan,
        riskResponse: risk,
        reporting: rep
      }
    })));
  };

  const handleSyncFromA120 = () => {
    const a120Team = wsA120.teamData;
    if (a120Team && Array.isArray(a120Team) && a120Team.length > 0) {
      setTeamData(JSON.parse(JSON.stringify(a120Team)));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } else {
      alert("Belum ada data susunan tim tersimpan di KKP A.120.");
    }
  };

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      const hasNo = Object.values(next).some((ans) => ans === "Tidak");
      const allFilled = Object.values(next).every((ans) => ans !== "");
      if (allFilled) {
        setSimpulanManual(hasNo ? "Surat Tugas Tidak Memadai" : "Surat Tugas Memadai");
      }
      return next;
    });
  };

  const totalCriteria = Object.keys(answers).length;
  const answeredCount = Object.values(answers).filter((val) => val !== "").length;
  const isAllAnswered = answeredCount === totalCriteria;
  const hasNoAnswers = Object.values(answers).some((val) => val === "Tidak");
  const isMemadai = isAllAnswered && !hasNoAnswers;
  const isCompleted = isAllAnswered && !hasNoAnswers;
  const statusKKP = isCompleted ? "Completed" : "Uncompleted";

  const handleAddContohFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setContohFiles((prev) => [...prev, fileName]);
    }
  };

  const handleDeleteContoh = (index: number) => {
    setContohFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddLampiranFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setLampiranFiles((prev) => [...prev, fileName]);
    }
  };

  const handleDeleteLampiran = (index: number) => {
    setLampiranFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadFile = (fileName: string) => {
    const element = document.createElement("a");
    const file = new Blob([`Surat Tugas Audit: ${fileName}\n\nDokumen resmi penugasan Tim Perikatan KAP.`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = fileName.endsWith(".pdf") ? fileName.replace(".pdf", ".txt") : `${fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadTemplate = () => {
    const lines = [
      `KANTOR AKUNTAN PUBLIK`,
      `SURAT TUGAS AUDIT LAPORAN KEUANGAN`,
      `Nomor: ST/${new Date().getFullYear()}/${engagement?.id || '001'}`,
      `----------------------------------------------------------------------`,
      `Klien               : ${engagement?.clientName || 'PT Klien'}`,
      `Tahun Buku          : ${engagement?.fiscalYear || '2025'}`,
      `Standar Akuntansi   : ${engagement?.accountingStandard || 'SAK UMUM'}`,
      `Periode Pelaksanaan : ${wsA120.startDate || 'Sesuai Jadwal'} s/d ${wsA120.endDate || 'Selesai'}`,
      `----------------------------------------------------------------------`,
      `SUSUNAN TIM AUDIT & ALOKASI JAM KERJA:`,
      ...teamData.map((m, idx) => {
        const total = (m.manualHours.planning + m.manualHours.riskResponse + m.manualHours.reporting).toFixed(1);
        return `${idx + 1}. ${m.name.padEnd(25)} [${m.role.padEnd(16)}] : Plan ${m.manualHours.planning}j | Risk ${m.manualHours.riskResponse}j | Rep ${m.manualHours.reporting}j | Total: ${total}j`;
      }),
      `----------------------------------------------------------------------`,
      `TOTAL JAM JASA AUDIT TIM : ${totals.manualTotal.all.toFixed(1)} Jam`,
      `----------------------------------------------------------------------`,
      ``,
      `Tugas dan Tanggung Jawab:`,
      `1. Melaksanakan prosedur audit sesuai standar auditing yang ditetapkan IAPI.`,
      `2. Menjaga kerahasiaan data dan informasi perikatan audit klien.`,
      `3. Menyelesaikan kertas kerja audit sesuai alokasi waktu yang telah ditetapkan.`,
      ``,
      `Dikeluarkan pada tanggal: ${new Date().toLocaleDateString('id-ID')}`,
      `Pimpinan KAP / Partner In Charge,`,
      ``,
      ``,
      `(${engagement?.partnerName || 'Partner In Charge'})`
    ];

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Surat_Tugas_${(engagement?.clientName || 'Klien').replace(/\s+/g, '_')}_${engagement?.fiscalYear || '2025'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (engagement?.id) {
      updateEngagement(engagement.id, {
        worksheetA140: {
          answers,
          contohFiles,
          lampiranFiles,
          simpulan: simpulanManual,
          modificationReason,
          teamData,
          isCompleted,
          status: statusKKP,
        },
        worksheetA120: {
          ...((engagement as any).worksheetA120 || {}),
          teamData,
        }
      } as any);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const renderToggle = (key: string) => {
    const currentVal = answers[key];
    return (
      <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
        <button
          type="button"
          onClick={() => handleAnswerChange(key, "Ya")}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            currentVal === "Ya"
              ? "bg-emerald-600 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Check size={12} className={currentVal === "Ya" ? "opacity-100" : "opacity-0"} />
          <span>Ya</span>
        </button>
        <button
          type="button"
          onClick={() => handleAnswerChange(key, "Tidak")}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            currentVal === "Tidak"
              ? "bg-rose-600 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <X size={12} className={currentVal === "Tidak" ? "opacity-100" : "opacity-0"} />
          <span>Tidak</span>
        </button>
      </div>
    );
  };

  return (
    <WorksheetContainer
      code="A.140"
      name="Surat Tugas"
      purpose="Mengecek kelengkapan surat tugas untuk Tim Perikatan yang akan melaksanakan audit untuk memastikan kesesuaian dengan standar."
      status={statusKKP}
      reviewer={engagement?.managerName || "Menunggu Reviewer"}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Banner Ringkasan Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200">
                SPM 1 / SA 220
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Evaluasi & Alokasi Surat Tugas Tim Perikatan
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Verifikasi kelengkapan formal surat tugas dan kelola alokasi jam jasa personil yang tersinkronisasi dengan KKP A.120.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500">Kriteria Terpenuhi</div>
              <div className="text-sm font-bold text-slate-800">
                {answeredCount} dari {totalCriteria} kriteria ({Math.round((answeredCount / totalCriteria) * 100)}%)
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              isCompleted 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              {isCompleted ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{isCompleted ? "STATUS: COMPLETED" : "STATUS: UNCOMPLETED"}</span>
            </div>
          </div>
        </div>

        {/* 1. Kuesioner Kelengkapan Surat Tugas */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Pastikan dalam Surat Tugas, setidaknya tersaji:
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Hasil Analisis</span>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">a.</span>
                <span className="text-slate-700 font-medium">Tujuan surat tugas sesuai nama klien</span>
              </div>
              {renderToggle("qa")}
            </div>

            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">b.</span>
                <span className="text-slate-700 font-medium">Penanggalan Surat sesuai dengan tanggal Perikatan</span>
              </div>
              {renderToggle("qb")}
            </div>

            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">c.</span>
                <span className="text-slate-700 font-medium">Penomoran surat sesuai dengan tertib administrasi yang berlaku</span>
              </div>
              {renderToggle("qc")}
            </div>

            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">d.</span>
                <span className="text-slate-700 font-medium">Nama Tim Perikatan sesuai dengan nama personel KAP yang dipilih</span>
              </div>
              {renderToggle("qd")}
            </div>

            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">e.</span>
                <span className="text-slate-700 font-medium">Periode pelaksanaan perikatan sesuai dengan rencana</span>
              </div>
              {renderToggle("qe")}
            </div>
          </div>
        </div>

        {/* 3 Kotak: Contoh Format, Lampiran, Simpulan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Contoh Format */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-50 text-atlas-blue rounded-lg">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Contoh Format Surat Tugas
                  </h3>
                  <p className="text-[11px] text-slate-500">Format draf resmi penugasan tim</p>
                </div>
              </div>

              <div className="space-y-1.5 min-h-[60px]">
                {contohFiles.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Belum ada file contoh ditambahkan.</p>
                ) : (
                  contohFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 group">
                      <span
                        onClick={() => handleDownloadFile(file)}
                        className="text-xs text-atlas-blue font-medium hover:underline cursor-pointer truncate max-w-[180px]"
                        title={file}
                      >
                        {file}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteContoh(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Unduh Draf</span>
              </button>
              <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-atlas-blue bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors">
                <Plus size={13} />
                <span>Tambah Contoh</span>
                <input type="file" className="hidden" onChange={handleAddContohFile} />
              </label>
            </div>
          </div>

          {/* Card 2: Lampiran Surat Tugas */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Paperclip size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Lampiran Surat Tugas
                  </h3>
                  <p className="text-[11px] text-slate-500">Berkas surat tugas bertandatangan</p>
                </div>
              </div>

              <div className="space-y-1.5 min-h-[60px]">
                {lampiranFiles.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Belum ada berkas lampiran diunggah.</p>
                ) : (
                  lampiranFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 group">
                      <span
                        onClick={() => handleDownloadFile(file)}
                        className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer truncate max-w-[180px]"
                        title={file}
                      >
                        {file}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteLampiran(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3">
              <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-all">
                <Upload size={14} />
                <span>Upload Surat Tugas</span>
                <input type="file" className="hidden" onChange={handleAddLampiranFile} />
              </label>
            </div>
          </div>

          {/* Card 3: Simpulan */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${isMemadai ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Simpulan
                  </h3>
                  <p className="text-[11px] text-slate-500">Evaluasi formal surat tugas</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border bg-slate-50/70 border-slate-200 mb-2">
                <div className="text-xs text-slate-500 font-medium mb-1">Status Simpulan:</div>
                <select
                  value={simpulanManual}
                  onChange={(e) => setSimpulanManual(e.target.value)}
                  className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${
                    simpulanManual.includes("Tidak")
                      ? "border-rose-300 text-rose-700"
                      : "border-emerald-300 text-emerald-700"
                  }`}
                >
                  <option value="Surat Tugas Memadai">Surat Tugas Memadai</option>
                  <option value="Surat Tugas Tidak Memadai">Surat Tugas Tidak Memadai</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 italic">
              {isMemadai 
                ? "✓ Seluruh 5 kriteria formal surat tugas telah terpenuhi secara memadai."
                : "⚠ Terdapat kriteria yang belum terpenuhi, wajib menjelaskan prosedur modifikasi di bawah."}
            </div>
          </div>
        </div>

        {/* Card Catatan / Penjelasan Modifikasi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Jelaskan bagaimana KAP memodifikasi surat tugas
          </label>
          <textarea
            value={modificationReason}
            onChange={(e) => setModificationReason(e.target.value)}
            placeholder="Tuliskan alasan modifikasi, mitigasi risiko, atau penyesuaian susunan tim audit di sini..."
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 outline-none focus:border-atlas-blue focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 transition-all min-h-[90px] resize-y placeholder:text-slate-400"
          />
        </div>

        {/* SECTION 2: Rencana Alokasi Jam Jasa per Tim (DIJAGA SECARA UTUH) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Users className="mr-2 text-atlas-blue" size={18} /> Rencana Alokasi Jam Jasa per Tim
                </h2>
                <span className="text-xs font-bold text-atlas-blue bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Total: {totals.manualTotal.all.toFixed(1)} Jam
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Alokasikan jam kerja personil untuk setiap tahapan audit. Terhubung dan tersinkronisasi otomatis dengan KKP A.120.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncFromA120}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                title="Tarik susunan dan alokasi jam tim terbaru dari KKP A.120"
              >
                <RefreshCw size={13} />
                <span>Sinkronisasi A.120</span>
              </button>
              {totalEffectiveHours > 0 && (
                <button
                  type="button"
                  onClick={handleDistributeEffectiveHours}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                  title="Bagi alokasi jam kerja efektif ke seluruh personil tim secara proporsional"
                >
                  <Copy size={13} />
                  <span>Distribusi Jam Efektif ({totalEffectiveHours.toFixed(1)} Jam)</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Tambah Personil</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-3 py-3 border-r border-slate-200 text-center w-12">No</th>
                  <th className="px-4 py-3 border-r border-slate-200 min-w-[200px]">Nama Personil</th>
                  <th className="px-3 py-3 border-r border-slate-200 w-44 text-center">Peran Tim</th>
                  <th className="px-3 py-3 border-r border-slate-200 text-center w-32 bg-amber-50/50 text-amber-900">
                    Planning (Jam)
                  </th>
                  <th className="px-3 py-3 border-r border-slate-200 text-center w-32 bg-amber-50/50 text-amber-900">
                    Risk Resp. (Jam)
                  </th>
                  <th className="px-3 py-3 border-r border-slate-200 text-center w-32 bg-amber-50/50 text-amber-900">
                    Reporting (Jam)
                  </th>
                  <th className="px-3 py-3 border-r border-slate-200 text-center w-28 bg-blue-50/60 text-atlas-blue font-bold">
                    Total Jam
                  </th>
                  <th className="px-2 py-3 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamData.map((member, idx) => {
                  const memberTotalHours = (member.manualHours?.planning || 0) + (member.manualHours?.riskResponse || 0) + (member.manualHours?.reporting || 0);
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3 py-2.5 text-center border-r border-slate-100 text-slate-400 font-medium text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 border-r border-slate-100">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleUpdateName(member.id, e.target.value)}
                          placeholder="Nama Personil..."
                          className="w-full px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 focus:border-atlas-blue rounded-lg text-xs font-semibold text-slate-800 outline-none transition-colors"
                        />
                      </td>
                      <td className="px-3 py-2 border-r border-slate-100">
                        <select 
                          className="w-full text-center border border-slate-200 hover:border-slate-300 focus:border-atlas-blue rounded-lg text-xs font-semibold text-slate-700 outline-none p-1.5 bg-white cursor-pointer"
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        >
                          <option value="Partner">Partner</option>
                          <option value="Manager">Manager</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Ketua Tim">Ketua Tim</option>
                          <option value="Anggota Tim">Anggota Tim</option>
                          <option value="Tenaga Pendukung">Tenaga Pendukung</option>
                        </select>
                      </td>

                      <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/20">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.5" 
                          className="w-full p-1.5 border border-amber-200 hover:border-amber-300 focus:border-amber-500 rounded-lg text-center text-xs font-bold text-slate-800 outline-none transition-colors" 
                          value={member.manualHours.planning || ''} 
                          onChange={(e) => handleUpdateManualHours(member.id, 'planning', e.target.value)} 
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/20">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.5" 
                          className="w-full p-1.5 border border-amber-200 hover:border-amber-300 focus:border-amber-500 rounded-lg text-center text-xs font-bold text-slate-800 outline-none transition-colors" 
                          value={member.manualHours.riskResponse || ''} 
                          onChange={(e) => handleUpdateManualHours(member.id, 'riskResponse', e.target.value)} 
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/20">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.5" 
                          className="w-full p-1.5 border border-amber-200 hover:border-amber-300 focus:border-amber-500 rounded-lg text-center text-xs font-bold text-slate-800 outline-none transition-colors" 
                          value={member.manualHours.reporting || ''} 
                          onChange={(e) => handleUpdateManualHours(member.id, 'reporting', e.target.value)} 
                          placeholder="0"
                        />
                      </td>

                      <td className="px-3 py-2.5 border-r border-slate-100 text-center font-mono font-bold text-atlas-blue bg-blue-50/30 text-xs">
                        {memberTotalHours.toFixed(2)}
                      </td>

                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          disabled={teamData.length <= 1}
                          title={teamData.length <= 1 ? 'Minimal 1 personil tim' : `Hapus ${member.name}`}
                          className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                            teamData.length <= 1 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                          }`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr className="font-bold text-xs text-slate-800">
                  <td colSpan={3} className="px-4 py-3 text-right border-r border-slate-200 uppercase tracking-wider text-slate-600">
                    Total Alokasi Jam Jasa Tim
                  </td>
                  <td className="px-2 py-3 text-center font-mono font-bold text-amber-900 border-r border-slate-200 bg-amber-50/40">
                    {totals.manualTotal.planning.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-center font-mono font-bold text-amber-900 border-r border-slate-200 bg-amber-50/40">
                    {totals.manualTotal.riskResponse.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-center font-mono font-bold text-amber-900 border-r border-slate-200 bg-amber-50/40">
                    {totals.manualTotal.reporting.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-center font-mono font-black text-xs text-atlas-blue border-r border-slate-200 bg-blue-100/50">
                    {totals.manualTotal.all.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-center text-slate-400">-</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-atlas-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Baris Personil</span>
            </button>
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock size={13} className="text-atlas-blue" />
              Susunan personil dan jam kerja tersinkronisasi otomatis dengan <strong>KKP A.120</strong>.
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <button 
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ""}`)} 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Index</span>
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 transition-all shadow-xs cursor-pointer"
          >
            {isSaved ? <CheckCircle2 size={15} className="text-emerald-300" /> : <Save size={15} />}
            <span>{isSaved ? "Tersimpan" : "Simpan KKP A.140"}</span>
          </button>
        </div>

      </div>

      {/* Toast Notifikasi Simpan */}
      {isSaved && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>Surat Tugas dan alokasi tim perikatan berhasil disimpan.</span>
        </div>
      )}
    </WorksheetContainer>
  );
};

export default A140;
