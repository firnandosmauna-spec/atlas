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
  X,
  ArrowRight,
  MessageSquare,
  Compass
} from "lucide-react";

export interface SAChecklistItem {
  id: string;
  code: string;
  title: string;
}

export const RELEVANT_SA_A160: SAChecklistItem[] = [
  {
    id: 'sa300',
    code: 'SA 300',
    title: 'SA 300 : Perencanaan Suatu Audit atas Laporan Keuangan'
  }
];

const A160: React.FC = () => {
  const context = useOutletContext<{ engagement?: Engagement }>();
  const { id: paramId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const engagement = context?.engagement || engagements.find((e) => e.id === paramId) || engagements[0];
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"komunikasi" | "strategi">("komunikasi");

  // Load existing saved worksheet data if any
  const wsData = (engagement as any)?.worksheetA160 || {};

  // Form state - 8 kriteria Ceklis Komunikasi (a.1 - a.4, b.1 - b.4)
  const [answers, setAnswers] = useState<Record<string, string>>({
    qa1: wsData.answers?.qa1 ?? "Ya",
    qa2: wsData.answers?.qa2 ?? "Ya",
    qa3: wsData.answers?.qa3 ?? "Ya",
    qa4: wsData.answers?.qa4 ?? "Ya",
    qb1: wsData.answers?.qb1 ?? "Ya",
    qb2: wsData.answers?.qb2 ?? "Ya",
    qb3: wsData.answers?.qb3 ?? "Ya",
    qb4: wsData.answers?.qb4 ?? "Ya",
  });

  const [contohFiles, setContohFiles] = useState<string[]>(
    wsData.contohFiles ?? []
  );

  const [lampiranFiles, setLampiranFiles] = useState<string[]>(
    wsData.lampiranFiles ?? [
      "Notulen komunikasi tim_penilaian Resiko.pdf",
      "Memo_konsultasi.pdf",
      "Catatan komunikasi WA Group.pdf",
    ]
  );

  const [simpulanManual, setSimpulanManual] = useState<string>(
    wsData.simpulan ?? "Komunikasi Memadai"
  );

  const [catatanPenjelasan, setCatatanPenjelasan] = useState<string>(
    wsData.catatanPenjelasan ?? ""
  );

  // State untuk Audit Strategi Memorandum (ASM)
  const [strategi, setStrategi] = useState({
    karakteristik: wsData.strategi?.karakteristik ?? "",
    tujuan: wsData.strategi?.tujuan ?? "",
    faktor: wsData.strategi?.faktor ?? "",
    sumberDaya: wsData.strategi?.sumberDaya ?? "",
    riskAssessment: wsData.strategi?.riskAssessment ?? "",
    prosedurLanjutan: wsData.strategi?.prosedurLanjutan ?? "",
  });

  const [isSaved, setIsSaved] = useState(false);

  // SA Checklist State (berfungsi menentukan kelengkapan KKP Complete vs Uncompleted)
  const [saChecklist, setSaChecklist] = useState<Record<string, boolean>>(() => {
    if (wsData.saChecklist && typeof wsData.saChecklist === 'object') {
      return {
        sa300: wsData.saChecklist.sa300 ?? true
      };
    }
    return {
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

  const isAllSAChecked = useMemo(() => {
    return RELEVANT_SA_A160.every(item => saChecklist[item.id] === true);
  }, [saChecklist]);

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      const hasNo = Object.values(next).some((ans) => ans === "Tidak");
      const allFilled = Object.values(next).every((ans) => ans !== "");
      if (allFilled) {
        setSimpulanManual(hasNo ? "Komunikasi Tidak Memadai" : "Komunikasi Memadai");
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
    const file = new Blob([`Komunikasi Tim Perikatan: ${fileName}\n\nDokumen notulen / memo komunikasi tim perikatan audit.`], {
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
        worksheetA160: {
          answers,
          contohFiles,
          lampiranFiles,
          simpulan: simpulanManual,
          catatanPenjelasan,
          strategi,
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
      code="A.160"
      name="Komunikasi Tim Perikatan"
      purpose="Mengidentifikasi komunikasi dan konsultasi tim perikatan serta menyusun strategi audit secara keseluruhan (Audit Strategi Memorandum)."
      status={statusKKP}
      reviewer={engagement?.managerName || "Menunggu Reviewer"}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation Tabs Minimalis Modern */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
            <button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "komunikasi"
                  ? "bg-white text-atlas-blue shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("komunikasi")}
            >
              <MessageSquare size={14} />
              <span>Ceklis Komunikasi Tim Perikatan</span>
            </button>
            <button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "strategi"
                  ? "bg-white text-atlas-blue shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("strategi")}
            >
              <Compass size={14} />
              <span>Strategi Audit Keseluruhan (ASM)</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            Standar Audit: <span className="font-semibold text-slate-700">SA 300</span>
          </div>
        </div>

        {activeTab === "komunikasi" ? (
          /* TAB 1: CEKLIS KOMUNIKASI ANTARA TIM PERIKATAN */
          <div className="space-y-6">
            {/* Banner Ringkasan Modern */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200">
                      SA 300
                    </span>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                      Ceklis Komunikasi Antara Tim Perikatan
                    </h1>
                  </div>
                  <p className="text-xs text-slate-500">
                    Evaluasi kesepahaman ruang lingkup, jadwal, kompetensi industri, serta rekaman konsultasi dan notulen internal tim audit.
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
                  {RELEVANT_SA_A160.map((item) => {
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
                    Ceklis Evaluasi Komunikasi & Konsultasi Tim
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Hasil Analisis (Ya / Tidak)
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-sm text-slate-800">
                {/* Bagian A */}
                <div className="px-6 py-2.5 bg-slate-100/50 font-bold text-xs text-slate-700 flex items-center gap-2">
                  <span className="w-5 text-atlas-blue">a.</span>
                  <span>Kesepahaman Tim Perikatan atas :</span>
                </div>

                {/* a.1 */}
                <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-10">
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-400 shrink-0">a.1</span>
                    <span className="text-slate-700 font-medium">Apakah Tim Perikatan memahami ruang lingkup pekerjaan yang akan dilaksanakan?</span>
                  </div>
                  {renderToggle("qa1")}
                </div>

                {/* a.2 */}
                <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-10">
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-400 shrink-0">a.2</span>
                    <span className="text-slate-700 font-medium">Apakah Tim Perikatan memahami periode pelaksanaan audit?</span>
                  </div>
                  {renderToggle("qa2")}
                </div>

                {/* a.3 */}
                <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-10">
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-400 shrink-0">a.3</span>
                    <span className="text-slate-700 font-medium">Apakah Tim Perikatan memiliki keahlian dan ketrampilan yang memadai?</span>
                  </div>
                  {renderToggle("qa3")}
                </div>

                {/* a.4 */}
                <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-10">
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-400 shrink-0">a.4</span>
                    <span className="text-slate-700 font-medium">Apakah Tim Perikatan memahami hal-hal khusus untuk industri klien?</span>
                  </div>
                  {renderToggle("qa4")}
                </div>

                {/* Bagian B */}
                <div className="px-6 py-2.5 bg-slate-100/50 font-bold text-xs text-slate-700 flex items-center gap-2">
                  <span className="w-5 text-atlas-blue">b.</span>
                  <span>Konsultasi selama Perikatan :</span>
                </div>

                {/* b.1 */}
                <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-10">
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-400 shrink-0">b.1</span>
                    <span className="text-slate-700 font-medium">Permasalahan yang diajukan</span>
                  </div>
                  {renderToggle("qb1")}
                </div>

                {/* b.2 */}
                <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-10">
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-400 shrink-0">b.2</span>
                    <span className="text-slate-700 font-medium">Data yang tersedia</span>
                  </div>
                  {renderToggle("qb2")}
                </div>

                {/* b.3 */}
                <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-10">
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-400 shrink-0">b.3</span>
                    <span className="text-slate-700 font-medium">Saran / tindakan / simpulan</span>
                  </div>
                  {renderToggle("qb3")}
                </div>

                {/* b.4 */}
                <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-10">
                  <div className="flex items-start gap-3 pr-4">
                    <span className="w-6 font-bold text-slate-400 shrink-0">b.4</span>
                    <span className="text-slate-700 font-medium">Paraf / tandatangan Tim</span>
                  </div>
                  {renderToggle("qb4")}
                </div>
              </div>
            </div>

            {/* 3 Kotak Dokumentasi & Simpulan Modern */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Contoh format komunikasi */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-atlas-blue rounded-lg">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">Contoh Format Komunikasi</h3>
                        <p className="text-[11px] text-slate-500">Template baku KAP</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 min-h-[90px]">
                    {contohFiles.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 italic">
                        Belum ada contoh format diunggah
                      </div>
                    ) : (
                      contohFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors group"
                        >
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file)}
                            className="text-xs font-medium text-atlas-blue hover:underline truncate flex items-center gap-1.5 text-left"
                            title={file}
                          >
                            <Download size={13} className="shrink-0 text-slate-400" />
                            <span className="truncate">{file}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteContoh(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus file"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-atlas-blue bg-blue-50 hover:bg-blue-100/70 rounded-xl cursor-pointer transition-colors">
                    <Plus size={14} />
                    <span>Tambah Format Contoh</span>
                    <input type="file" className="hidden" onChange={handleAddContohFile} />
                  </label>
                </div>
              </div>

              {/* Card 2: Lampiran Komunikasi Tim Perikatan */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Paperclip size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">Lampiran Komunikasi Tim</h3>
                        <p className="text-[11px] text-slate-500">Notulen, memo, & risalah diskusi</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {lampiranFiles.length} Dokumen
                    </span>
                  </div>

                  <div className="space-y-2 min-h-[90px]">
                    {lampiranFiles.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 italic">
                        Belum ada lampiran diunggah
                      </div>
                    ) : (
                      lampiranFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors group"
                        >
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file)}
                            className="text-xs font-medium text-emerald-800 hover:underline truncate flex items-center gap-1.5 text-left"
                            title={file}
                          >
                            <Download size={13} className="shrink-0 text-slate-400" />
                            <span className="truncate">{file}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLampiran(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus lampiran"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 rounded-xl cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>Upload Lampiran Komunikasi</span>
                    <input type="file" className="hidden" onChange={handleAddLampiranFile} />
                  </label>
                </div>
              </div>

              {/* Card 3: Simpulan */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">Simpulan Komunikasi</h3>
                        <p className="text-[11px] text-slate-500">Kecukupan koordinasi perikatan</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-slate-600">
                      Status Kecukupan Komunikasi
                    </label>
                    <select
                      value={simpulanManual}
                      onChange={(e) => setSimpulanManual(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-purple-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                    >
                      <option value="Komunikasi Memadai">
                        Komunikasi Memadai
                      </option>
                      <option value="Komunikasi Tidak Memadai">
                        Komunikasi Tidak Memadai
                      </option>
                    </select>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                      {simpulanManual.includes("Tidak") ? (
                        <span className="text-rose-600 font-medium">
                          ⚠️ Komunikasi antar anggota tim belum optimal. Diperlukan pertemuan briefing tambahan untuk menyamakan persepsi prosedur.
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          ✓ Komunikasi, konsultasi, dan kesepahaman ruang lingkup serta risiko perikatan terkoordinasi secara efektif sesuai SA 220.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Otomatis terbarui saat kriteria dijawab
                </div>
              </div>
            </div>

            {/* Card Catatan / Penjelasan Modern */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>Catatan / Risalah Diskusi Tim Perikatan</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    (Poin krusial hasil diskusi perencanaan atau tindak lanjut konsultasi)
                  </span>
                </h3>
                <span className="text-[11px] text-slate-400">Opsional</span>
              </div>
              <textarea
                value={catatanPenjelasan}
                onChange={(e) => setCatatanPenjelasan(e.target.value)}
                rows={3}
                placeholder="Tuliskan poin penting diskusi tim, isu akuntansi pelik yang dikonsultasikan, atau instruksi khusus perikatan audit..."
                className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
              />
            </div>

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/workspace/${engagement?.id || ""}`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Index</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("strategi")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-atlas-blue bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100/70 transition-colors"
                >
                  <span>Ke Strategi Audit Keseluruhan</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
                >
                  {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
                  <span>{isSaved ? "Tersimpan" : "Simpan KKP A.160"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: AUDIT STRATEGI MEMORANDUM (ASM) - MODERN MINIMALIST */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200">
                    SA 300
                  </span>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Compass className="text-atlas-blue" size={18} />
                    <span>Audit Strategi Memorandum (ASM)</span>
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Dokumentasi strategi audit menyeluruh yang menetapkan ruang lingkup, saat, dan arah audit untuk memandu penyusunan rencana audit detail.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("komunikasi")}
                className="text-xs font-semibold text-atlas-blue hover:text-blue-800 flex items-center gap-1.5 self-start sm:self-center"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Ceklis Komunikasi</span>
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  1. Karakteristik-Karakteristik Perikatan
                </label>
                <textarea
                  className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all min-h-[75px]"
                  value={strategi.karakteristik}
                  onChange={(e) => setStrategi({ ...strategi, karakteristik: e.target.value })}
                  placeholder="Karakteristik kerangka pelaporan keuangan, regulasi industri klien, ketersediaan tenaga ahli, lokasi cabang operasi..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  2. Tujuan Pelaporan, Saat Audit, dan Sifat Komunikasi
                </label>
                <textarea
                  className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all min-h-[75px]"
                  value={strategi.tujuan}
                  onChange={(e) => setStrategi({ ...strategi, tujuan: e.target.value })}
                  placeholder="Jadwal penyampaian laporan audit, rapat berkala dengan pihak yang bertanggung jawab atas tata kelola (TCWG), koordinasi interim & final..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  3. Faktor Signifikan, Aktivitas Perikatan Awal, dan Pengetahuan dari Perikatan Lain
                </label>
                <textarea
                  className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all min-h-[75px]"
                  value={strategi.faktor}
                  onChange={(e) => setStrategi({ ...strategi, faktor: e.target.value })}
                  placeholder="Hasil prosedur penerimaan/keberlanjutan klien, penentuan materialitas awal, transaksi signifikan dengan pihak berelasi..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  4. Sifat, Saat, dan Luas Sumber Daya
                </label>
                <textarea
                  className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all min-h-[75px]"
                  value={strategi.sumberDaya}
                  onChange={(e) => setStrategi({ ...strategi, sumberDaya: e.target.value })}
                  placeholder="Alokasi personil perikatan untuk area berisiko tinggi, pelibatan reviewer independen (EQCR), pembagian jam jasa per fase..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-blue-50 text-atlas-blue rounded-md">
                    <FileText size={14} />
                  </span>
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Rencana Prosedur Audit Spesifik
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Sifat, Saat, dan Luas Prosedur Risk Assessment
                    </label>
                    <textarea
                      className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all min-h-[90px]"
                      value={strategi.riskAssessment}
                      onChange={(e) => setStrategi({ ...strategi, riskAssessment: e.target.value })}
                      placeholder="Prosedur pemahaman bisnis entitas, evaluasi sistem pengendalian internal (SPI), prosedur analitis awal..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Sifat, Saat, dan Luas Prosedur Lanjutan
                    </label>
                    <textarea
                      className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all min-h-[90px]"
                      value={strategi.prosedurLanjutan}
                      onChange={(e) => setStrategi({ ...strategi, prosedurLanjutan: e.target.value })}
                      placeholder="Uji pengendalian (TOC) dan uji substantif (TOD/SAP) atas asersi akun signifikan dan pengungkapan laporan keuangan..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab("komunikasi")}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Ceklis Komunikasi</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
              >
                {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
                <span>{isSaved ? "Tersimpan" : "Simpan Strategi Audit"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifikasi Simpan */}
      {isSaved && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>Data Komunikasi Tim Perikatan berhasil disimpan.</span>
        </div>
      )}
    </WorksheetContainer>
  );
};

export default A160;
