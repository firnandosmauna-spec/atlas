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
  FileText,
  ShieldCheck,
  Paperclip,
  Check,
  X
} from "lucide-react";

export interface SAChecklistItem {
  id: string;
  code: string;
  title: string;
}

export const RELEVANT_SA_A130: SAChecklistItem[] = [
  {
    id: 'sa210',
    code: 'SA 210',
    title: 'SA 210 : Persetujuan atas Ketentuan Perikatan Audit'
  }
];

const A130: React.FC = () => {
  const context = useOutletContext<{ engagement?: Engagement }>();
  const { id: paramId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const engagement = context?.engagement || engagements.find((e) => e.id === paramId) || engagements[0];
  const navigate = useNavigate();

  const wsData = (engagement as any)?.worksheetA130 || {};

  // Form state - 15 kriteria pokok SA 210
  const [answers, setAnswers] = useState<Record<string, string>>({
    qa: wsData.answers?.qa ?? "Ya",
    qb: wsData.answers?.qb ?? "Ya",
    qc: wsData.answers?.qc ?? "Ya",
    qd1: wsData.answers?.qd1 ?? "Ya",
    qd2: wsData.answers?.qd2 ?? "Ya",
    qd3_1: wsData.answers?.qd3_1 ?? "Ya",
    qd3_2: wsData.answers?.qd3_2 ?? "Ya",
    qd3_3: wsData.answers?.qd3_3 ?? "Ya",
    qe: wsData.answers?.qe ?? "Ya",
    qf: wsData.answers?.qf ?? "Ya",
    qg: wsData.answers?.qg ?? "Ya",
    qh: wsData.answers?.qh ?? "Ya",
    qi: wsData.answers?.qi ?? "Ya",
    qj: wsData.answers?.qj ?? "Ya",
    qk: wsData.answers?.qk ?? "Ya",
  });

  const [contohFiles, setContohFiles] = useState<string[]>(
    wsData.contohFiles ?? []
  );

  const [lampiranFiles, setLampiranFiles] = useState<string[]>(
    wsData.lampiranFiles ?? ["Surat_Perikatan_PT_Makmur.pdf"]
  );

  const [simpulanManual, setSimpulanManual] = useState<string>(
    wsData.simpulan ?? "Surat Perikatan Memadai"
  );

  const [catatanPenjelasan, setCatatanPenjelasan] = useState<string>(
    wsData.catatanPenjelasan ?? wsData.modificationReason ?? ""
  );

  const [isSaved, setIsSaved] = useState(false);

  // SA Checklist State (berfungsi menentukan kelengkapan KKP Complete vs Uncompleted)
  const [saChecklist, setSaChecklist] = useState<Record<string, boolean>>(() => {
    if (wsData.saChecklist && typeof wsData.saChecklist === 'object') {
      return {
        sa210: wsData.saChecklist.sa210 ?? true
      };
    }
    return {
      sa210: true
    };
  });

  const handleToggleSA = (id: string) => {
    setSaChecklist(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setIsSaved(false);
  };

  const isAllSAChecked = useMemo(() => {
    return RELEVANT_SA_A130.every(item => saChecklist[item.id] === true);
  }, [saChecklist]);

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      const hasNo = Object.values(next).some((ans) => ans === "Tidak");
      const allFilled = Object.values(next).every((ans) => ans !== "");
      if (allFilled) {
        setSimpulanManual(hasNo ? "Surat Perikatan Tidak Memadai" : "Surat Perikatan Memadai");
      }
      return next;
    });
  };

  const totalCriteria = Object.keys(answers).length;
  const answeredCount = Object.values(answers).filter((val) => val !== "").length;
  const isAllAnswered = answeredCount === totalCriteria;
  const hasNoAnswers = Object.values(answers).some((val) => val === "Tidak");
  const isMemadai = isAllAnswered && !hasNoAnswers;
  const isCompleted = isAllAnswered && !hasNoAnswers && isAllSAChecked;
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
    const file = new Blob([`Dokumen Audit: ${fileName}\n\nSurat Perikatan Audit resmi sesuai standar SA 210.`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = fileName.endsWith(".pdf") ? fileName.replace(".pdf", ".txt") : `${fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSave = () => {
    if (engagement?.id) {
      updateEngagement(engagement.id, {
        worksheetA130: {
          answers,
          contohFiles,
          lampiranFiles,
          simpulan: simpulanManual,
          catatanPenjelasan,
          modificationReason: catatanPenjelasan,
          isCompleted,
          status: statusKKP,
          saChecklist,
        },
      } as any);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Helper render tombol toggle Ya / Tidak
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
      code="A.130"
      name="Surat Perikatan"
      purpose="Menganalisis surat perikatan audit yang ditandatangani KAP dengan klien untuk memastikan kesesuaian dengan standar SA 210."
      status={statusKKP}
      reviewer={engagement?.managerName || "Menunggu Reviewer"}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Banner Ringkasan Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200">
                  SA 210
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Evaluasi Kelengkapan Surat Perikatan
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Pastikan seluruh klausul pokok dan tanggung jawab manajemen telah termaktub secara tertulis dalam surat perikatan.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-500">Progress Evaluasi</div>
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

          {/* ── SA YANG RELEVAN (SESUAI STANDAR LEMBAR KERJA ATLAS DENGAN FUNGSI CHECKLIST KERTAS KERJA) ── */}
          <div className="pt-3.5 border-t border-slate-100 space-y-2.5 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <span className="text-slate-900 font-bold">SA yang relevan</span>
              <span className="text-slate-600 font-bold">:</span>
            </div>

            {/* Checklist Items Container (Full Width) */}
            <div className="w-full space-y-1.5">
              {RELEVANT_SA_A130.map((item) => {
                const isChecked = !!saChecklist[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSA(item.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none w-full ${
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
                        <span className={isChecked ? 'text-slate-900' : 'text-slate-600'}>
                          <span className="font-semibold text-slate-900">{item.code}</span> : {item.title.split(' : ')[1]}
                        </span>
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

        {/* Card Kuesioner Kontrol Kriteria */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Pastikan dalam Surat Perikatan, setidaknya tersaji:
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Hasil Analisis (Ya / Tidak)
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-sm text-slate-800">
            {/* a */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">a.</span>
                <span className="text-slate-700 font-medium">Penanggalan Surat sesuai dengan tanggal yang disepakati</span>
              </div>
              {renderToggle("qa")}
            </div>

            {/* b */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">b.</span>
                <span className="text-slate-700 font-medium">Penomoran surat sesuai dengan tertib administrasi yang berlaku</span>
              </div>
              {renderToggle("qb")}
            </div>

            {/* c */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">c.</span>
                <span className="text-slate-700 font-medium">Penjelasan tujuan dan ruang lingkup audit</span>
              </div>
              {renderToggle("qc")}
            </div>

            {/* d Header */}
            <div className="px-6 py-3 bg-slate-50/40 text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 font-bold text-slate-400">d.</span>
              <span>Persetujuan dan Pengakuan Tanggung Jawab Manajemen atas:</span>
            </div>

            {/* d.1 */}
            <div className="px-6 py-3.5 pl-12 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="font-semibold text-slate-400 text-xs shrink-0">d.1</span>
                <span className="text-slate-700 font-medium">Penyusunan laporan keuangan sesuai kerangka pelaporan keuangan yang berlaku</span>
              </div>
              {renderToggle("qd1")}
            </div>

            {/* d.2 */}
            <div className="px-6 py-3.5 pl-12 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="font-semibold text-slate-400 text-xs shrink-0">d.2</span>
                <span className="text-slate-700 font-medium">Pengendalian internal agar laporan keuangan bebas dari salah saji material</span>
              </div>
              {renderToggle("qd2")}
            </div>

            {/* d.3 Header */}
            <div className="px-6 py-2 pl-12 bg-slate-50/30 text-xs font-semibold text-slate-500">
              d.3 Memberikan kepada auditor akses:
            </div>

            {/* d.3 - 1 */}
            <div className="px-6 py-3 pl-16 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-2.5 pr-4">
                <span className="text-slate-300 font-bold">•</span>
                <span className="text-slate-700">Akses ke semua informasi yang relevan</span>
              </div>
              {renderToggle("qd3_1")}
            </div>

            {/* d.3 - 2 */}
            <div className="px-6 py-3 pl-16 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-2.5 pr-4">
                <span className="text-slate-300 font-bold">•</span>
                <span className="text-slate-700">Informasi tambahan yang diperlukan</span>
              </div>
              {renderToggle("qd3_2")}
            </div>

            {/* d.3 - 3 */}
            <div className="px-6 py-3 pl-16 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-2.5 pr-4">
                <span className="text-slate-300 font-bold">•</span>
                <span className="text-slate-700">Akses ke semua personil entitas</span>
              </div>
              {renderToggle("qd3_3")}
            </div>

            {/* e */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">e.</span>
                <span className="text-slate-700 font-medium">Bentuk komunikasi yang diharapkan dalam penyampaian hasil audit</span>
              </div>
              {renderToggle("qe")}
            </div>

            {/* f */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">f.</span>
                <span className="text-slate-700 font-medium">Ekspektasi penyampaian representasi tertulis dari manajemen</span>
              </div>
              {renderToggle("qf")}
            </div>

            {/* g */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">g.</span>
                <span className="text-slate-700 font-medium">Penyediaan draft laporan keuangan tepat waktu</span>
              </div>
              {renderToggle("qg")}
            </div>

            {/* h */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4 max-w-3xl">
                <span className="w-5 font-bold text-slate-400 shrink-0">h.</span>
                <span className="text-slate-700 font-medium leading-relaxed">
                  Pengacuan ke bentuk dan isi laporan yang akan dikeluarkan oleh auditor dan suatu pernyataan bahwa
                  dalam kondisi tertentu terdapat kemungkinan laporan yang dikeluarkan berbeda bentuk dan isinya dengan yang diharapkan.
                </span>
              </div>
              {renderToggle("qh")}
            </div>

            {/* i */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">i.</span>
                <span className="text-slate-700 font-medium">Klausul kerahasiaan kecuali diminta oleh Hukum/Regulator/Asosiasi Profesi</span>
              </div>
              {renderToggle("qi")}
            </div>

            {/* j */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">j.</span>
                <span className="text-slate-700 font-medium">Tidak menjanjikan opini wajar tanpa pengecualian</span>
              </div>
              {renderToggle("qj")}
            </div>

            {/* k */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">k.</span>
                <span className="text-slate-700 font-medium">Perhatian khusus terhadap peraturan perundang-undangan yang berlaku bagi klien</span>
              </div>
              {renderToggle("qk")}
            </div>
          </div>
        </div>

        {/* Grid 3 Kotak Dokumentasi & Simpulan Modern */}
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
                    Contoh Format
                  </h3>
                  <p className="text-[11px] text-slate-500">Format acuan resmi Surat Perikatan</p>
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

            <div className="pt-3 border-t border-slate-100 mt-3">
              <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-atlas-blue bg-blue-50/70 hover:bg-blue-100 border border-blue-200 cursor-pointer transition-all">
                <Plus size={14} />
                <span>Tambah File Contoh</span>
                <input type="file" className="hidden" onChange={handleAddContohFile} />
              </label>
            </div>
          </div>

          {/* Card 2: Lampiran Surat Perikatan */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Paperclip size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Lampiran Dokumen
                  </h3>
                  <p className="text-[11px] text-slate-500">Berkas surat perikatan bertandatangan</p>
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
                <span>Upload Surat Perikatan</span>
                <input type="file" className="hidden" onChange={handleAddLampiranFile} />
              </label>
            </div>
          </div>

          {/* Card 3: Simpulan Evaluasi */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${isMemadai ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Simpulan Evaluasi
                  </h3>
                  <p className="text-[11px] text-slate-500">Hasil telaah kesesuaian standar</p>
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
                  <option value="Surat Perikatan Memadai">Surat Perikatan Memadai</option>
                  <option value="Surat Perikatan Tidak Memadai">Surat Perikatan Tidak Memadai</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 italic">
              {isMemadai 
                ? "✓ Seluruh 15 kriteria pokok SA 210 telah terpenuhi secara memadai."
                : "⚠ Terdapat kriteria yang belum terpenuhi atau memerlukan modifikasi tertulis."}
            </div>
          </div>
        </div>

        {/* Card Catatan / Penjelasan Tambahan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Catatan Auditor / Penjelasan Modifikasi Surat Perikatan
          </label>
          <textarea
            value={catatanPenjelasan}
            onChange={(e) => setCatatanPenjelasan(e.target.value)}
            placeholder="Tuliskan catatan evaluasi prosedur, pengecualian, atau modifikasi klausul surat perikatan di sini..."
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 outline-none focus:border-atlas-blue focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 transition-all min-h-[90px] resize-y placeholder:text-slate-400"
          />
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
            <span>{isSaved ? "Tersimpan" : "Simpan KKP A.130"}</span>
          </button>
        </div>
      </div>

      {/* Toast Notifikasi Simpan */}
      {isSaved && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>Kertas Kerja A.130 berhasil disimpan.</span>
        </div>
      )}
    </WorksheetContainer>
  );
};

export default A130;
