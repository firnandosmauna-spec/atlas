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

export const RELEVANT_SA_A170: SAChecklistItem[] = [
  {
    id: 'sa510',
    code: 'SA 510',
    title: 'SA 510 : Perikatan Audit Tahun Pertama - Saldo Awal'
  }
];

const A170: React.FC = () => {
  const context = useOutletContext<{ engagement?: Engagement }>();
  const { id: paramId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const engagement = context?.engagement || engagements.find((e) => e.id === paramId) || engagements[0];
  const navigate = useNavigate();

  // Load existing saved worksheet data if any
  const wsData = (engagement as any)?.worksheetA170 || {};

  // Form state
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: wsData.answers?.q1 ?? "Ya",
    q2a: wsData.answers?.q2a ?? "Tidak",
    q2b: wsData.answers?.q2b ?? "Ya",
    q2c: wsData.answers?.q2c ?? "Ya",
    q3: wsData.answers?.q3 ?? "Ya",
    q4: wsData.answers?.q4 ?? "Ya",
    q5: wsData.answers?.q5 ?? "Ya",
  });

  const [contohFiles, setContohFiles] = useState<string[]>(
    wsData.contohFiles ?? [
      "5. Kosistensi kebijjakan akuntansi.pdf",
      "6. komunikasi dengan manejmen_kebijakkan aku",
    ]
  );

  const [lampiranFiles, setLampiranFiles] = useState<string[]>(
    wsData.lampiranFiles ?? [
      "1. KKP perbandingan saldo awal dan saldo tahun audited",
      "2. KKP substantif akumulasi penyusutan aset tetap dengan m",
      "3. KKP subsequent collection test atas kewajaran akun Piutan",
      "4. KKP subsequent payment test atas kewajaran akun Utang",
    ]
  );

  const [simpulan, setSimpulan] = useState<string>(
    wsData.simpulan ?? "Secara umum Saldo Awal sudah wajar"
  );

  const [catatanPenjelasan, setCatatanPenjelasan] = useState<string>(
    wsData.catatanPenjelasan ?? ""
  );

  const [isSaved, setIsSaved] = useState(false);

  // SA Checklist State (berfungsi menentukan kelengkapan KKP Complete vs Uncompleted)
  const [saChecklist, setSaChecklist] = useState<Record<string, boolean>>(() => {
    if (wsData.saChecklist && typeof wsData.saChecklist === 'object') {
      return {
        sa510: wsData.saChecklist.sa510 ?? true
      };
    }
    return {
      sa510: true
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
    return RELEVANT_SA_A170.every(item => saChecklist[item.id] === true);
  }, [saChecklist]);

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      const hasReq2 = next.q2a === "Ya" || next.q2b === "Ya" || next.q2c === "Ya";
      const isCompliant = next.q1 === "Ya" && hasReq2 && next.q3 === "Ya" && next.q4 === "Ya";
      const allFilled = Object.values(next).every((v) => v !== "");
      if (allFilled) {
        if (!isCompliant) {
          setSimpulan("Tidak dapat memperoleh bukti audit yang cukup dan tepat atas Saldo Awal");
        } else {
          setSimpulan("Secara umum Saldo Awal sudah wajar");
        }
      }
      return next;
    });
  };

  // Logic Status KKP
  const totalCriteria = Object.keys(answers).length;
  const answeredCount = Object.values(answers).filter((val) => val !== "").length;
  const isAllAnswered = answeredCount === totalCriteria;
  const hasReq2 = answers.q2a === "Ya" || answers.q2b === "Ya" || answers.q2c === "Ya";
  const isCompliant = answers.q1 === "Ya" && hasReq2 && answers.q3 === "Ya" && answers.q4 === "Ya";
  const isWajar = simpulan === "Secara umum Saldo Awal sudah wajar";
  const isCompleted = isAllAnswered && isCompliant && isWajar && isAllSAChecked;
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
      setLampiranFiles((prev) => [...prev, `${prev.length + 1}. ${fileName}`]);
    }
  };

  const handleDeleteLampiran = (index: number) => {
    setLampiranFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadFile = (fileName: string) => {
    const element = document.createElement("a");
    const file = new Blob([`Dokumen Audit SA 510: ${fileName}\n\nIsi kertas kerja pendukung evaluasi saldo awal dan kebijakan akuntansi.`], {
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
        worksheetA170: {
          answers,
          contohFiles,
          lampiranFiles,
          simpulan,
          catatanPenjelasan,
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
      code="A.170"
      name="Perikatan Audit Tahun Pertama"
      purpose="Mengidentifikasi prosedur audit untuk perikatan tahun pertama, berfokus pada pengecekan saldo awal dan konsistensi kebijakan akuntansi."
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
                  SA 510
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Audit Saldo Awal Perikatan Pertama
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Evaluasi kewajaran saldo awal dan konsistensi penerapan kebijakan akuntansi dari periode sebelumnya ke periode berjalan.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-500">Progress Prosedur</div>
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
              {RELEVANT_SA_A170.map((item) => {
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
                Prosedur Audit Saldo Awal & Konsistensi Kebijakan Akuntansi
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Hasil Analisis (Ya / Tidak)
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-sm text-slate-800">
            {/* 1 */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3.5 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">1.</span>
                <span className="text-slate-700 font-medium">
                  Membaca laporan keuangan terkini dan laporan auditor terdahulu (jika ada), untuk informasi yang relevan dengan saldo awal
                </span>
              </div>
              {renderToggle("q1")}
            </div>

            {/* 2 Header */}
            <div className="px-6 py-2.5 bg-slate-100/50 font-bold text-xs text-slate-700 flex items-center gap-2">
              <span className="w-5 text-atlas-blue font-bold">2.</span>
              <span>Melakukan satu atau lebih prosedur berikut :</span>
            </div>

            {/* 2.a */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-11">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">a.</span>
                <span className="text-slate-700 font-medium">
                  Terdapat reviu kertas kerja auditor pendahulu, jika laporan keuangan tahun lalu telah diaudit
                </span>
              </div>
              {renderToggle("q2a")}
            </div>

            {/* 2.b */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-11">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">b.</span>
                <span className="text-slate-700 font-medium">
                  Terdapat evaluasi apakah prosedur audit dalam periode berjalan menyediakan bukti audit yang relevan dengan saldo awal
                </span>
              </div>
              {renderToggle("q2b")}
            </div>

            {/* 2.c */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors pl-11">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">c.</span>
                <span className="text-slate-700 font-medium">
                  Melakukan prosedur audit spesifik untuk memperoleh bukti yang terkait dengan saldo awal
                </span>
              </div>
              {renderToggle("q2c")}
            </div>

            {/* 3 */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3.5 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">3.</span>
                <span className="text-slate-700 font-medium">
                  Terdapat bukti audit yang cukup dan tepat bahwa saldo akhir periode lalu secara benar dipindahkan ke periode berjalan, atau, jika tepat, telah disajikan kembali?
                </span>
              </div>
              {renderToggle("q3")}
            </div>

            {/* 4 */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3.5 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">4.</span>
                <span className="text-slate-700 font-medium">
                  Terdapat bukti audit yang cukup dan tepat bahwa saldo awal telah mencerminkan penerapan kebijakan akuntansi yang semestinya
                </span>
              </div>
              {renderToggle("q4")}
            </div>

            {/* 5 */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3.5 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">5.</span>
                <span className="text-slate-700 font-medium">
                  Apakah saldo awal mengandung salah saji yang material?
                </span>
              </div>
              {renderToggle("q5")}
            </div>
          </div>
        </div>

        {/* 3 Kotak Dokumentasi & Simpulan Modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Contoh cek saldo awal */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-atlas-blue rounded-lg">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Contoh Format Cek Saldo Awal</h3>
                    <p className="text-[11px] text-slate-500">Panduan & referensi prosedur</p>
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

          {/* Card 2: Lampiran KKP cek saldo awal */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Paperclip size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Lampiran KKP Saldo Awal</h3>
                    <p className="text-[11px] text-slate-500">Kertas kerja pengujian substantif</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {lampiranFiles.length} KKP
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
                <span>Upload Lampiran KKP</span>
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
                    <h3 className="text-xs font-bold text-slate-800">Simpulan Saldo Awal</h3>
                    <p className="text-[11px] text-slate-500">Opini kelayakan saldo awal</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-600">
                  Hasil Evaluasi Saldo Awal
                </label>
                <select
                  value={simpulan}
                  onChange={(e) => setSimpulan(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-purple-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                >
                  <option value="Secara umum Saldo Awal sudah wajar">
                    Secara umum Saldo Awal sudah wajar
                  </option>
                  <option value="Saldo Awal mengandung salah saji material">
                    Saldo Awal mengandung salah saji material
                  </option>
                  <option value="Tidak dapat memperoleh bukti audit yang cukup dan tepat atas Saldo Awal">
                    Tidak dapat memperoleh bukti audit yang cukup dan tepat atas Saldo Awal
                  </option>
                </select>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                  {simpulan.includes("sudah wajar") ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Saldo awal telah ditelusuri ke laporan keuangan tahun lalu dan/atau pengujian substantif dengan kesimpulan wajar sesuai SA 510.
                    </span>
                  ) : simpulan.includes("salah saji") ? (
                    <span className="text-rose-600 font-medium">
                      ⚠️ Terdapat indikasi salah saji material pada saldo awal. Diperlukan penyesuaian retrospektif atau modifikasi opini audit.
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium">
                      ⚠️ Keterbatasan bukti audit atas saldo awal. Auditor harus mempertimbangkan dampak terhadap laporan auditor independen.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Evaluasi sesuai SA 510 Paragraf 6-13
            </div>
          </div>
        </div>

        {/* Card Catatan / Penjelasan Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Catatan & Pertimbangan Auditor atas Saldo Awal</span>
              <span className="text-[11px] font-normal text-slate-400">
                (Penjelasan rincian pengujian substantif, reviu auditor pendahulu, atau rekonsiliasi)
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">Opsional</span>
          </div>
          <textarea
            value={catatanPenjelasan}
            onChange={(e) => setCatatanPenjelasan(e.target.value)}
            rows={3}
            placeholder="Tuliskan catatan khusus terkait hasil perbandingan saldo awal dengan laporan audited tahun lalu, uji subsequent collection/payment, atau catatan penyesuaian..."
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

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
          >
            {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
            <span>{isSaved ? "Tersimpan" : "Simpan KKP A.170"}</span>
          </button>
        </div>
      </div>

      {/* Toast Notifikasi Simpan */}
      {isSaved && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>Evaluasi Saldo Awal Perikatan Pertama berhasil disimpan.</span>
        </div>
      )}
    </WorksheetContainer>
  );
};

export default A170;
