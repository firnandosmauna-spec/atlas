import React, { useState } from "react";
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

const A150: React.FC = () => {
  const context = useOutletContext<{ engagement?: Engagement }>();
  const { id: paramId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const updateEngagement = useEngagementStore((state) => state.updateEngagement);
  const engagement = context?.engagement || engagements.find((e) => e.id === paramId) || engagements[0];
  const navigate = useNavigate();

  // Load existing saved worksheet data if any
  const wsData = (engagement as any)?.worksheetA150 || {};

  // Form state - 4 kriteria SA 220 & SPM 1
  const [answers, setAnswers] = useState<Record<string, string>>({
    qa: wsData.answers?.qa ?? "Ya",
    qb: wsData.answers?.qb ?? "Ya",
    qc: wsData.answers?.qc ?? "Ya",
    qd: wsData.answers?.qd ?? "Ya",
  });

  const [contohFiles, setContohFiles] = useState<string[]>(
    wsData.contohFiles ?? []
  );

  const [lampiranFiles, setLampiranFiles] = useState<string[]>(
    wsData.lampiranFiles ?? [
      "Surat Pernyataan Independensi Tim Perikatan",
      "Evaluasi_ancaman_independensi.pdf",
    ]
  );

  const [simpulanManual, setSimpulanManual] = useState<string>(
    wsData.simpulan ?? "Pernyataan Independensi Memadai"
  );

  const [catatanPenjelasan, setCatatanPenjelasan] = useState<string>(
    wsData.catatanPenjelasan ?? ""
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      const hasNo = Object.values(next).some((ans) => ans === "Tidak");
      const allFilled = Object.values(next).every((ans) => ans !== "");
      if (allFilled) {
        setSimpulanManual(hasNo ? "Pernyataan Independensi Tidak Memadai" : "Pernyataan Independensi Memadai");
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
    const file = new Blob([`Pernyataan Independensi: ${fileName}\n\nDokumen resmi independensi Tim Perikatan KAP.`], {
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
        worksheetA150: {
          answers,
          contohFiles,
          lampiranFiles,
          simpulan: simpulanManual,
          catatanPenjelasan,
          isCompleted,
          status: statusKKP,
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
      code="A.150"
      name="Pernyataan Independensi"
      purpose="Menganalisis independensi KAP dan Tim Perikatan terhadap klien sebelum pelaksanaan audit sesuai SA 220 dan Kode Etik Profesi."
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
                SA 220 / SPM 1
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Evaluasi Pernyataan Independensi Tim Perikatan
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Pastikan seluruh anggota tim perikatan telah menandatangani konfirmasi independensi bebas benturan kepentingan terhadap entitas klien.
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

        {/* Card Kuesioner Kontrol Kriteria */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-atlas-blue" size={18} />
              <h2 className="text-sm font-bold text-slate-800">
                Pastikan dalam Form Independensi, setidaknya tersaji:
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
                <span className="text-slate-700 font-medium">Nama klien dalam Form Independensi sesuai dengan yang direncanakan</span>
              </div>
              {renderToggle("qa")}
            </div>

            {/* b */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">b.</span>
                <span className="text-slate-700 font-medium">Nama Tim Perikatan yang tertera dalam Form Independensi sesuai dengan surat tugas</span>
              </div>
              {renderToggle("qb")}
            </div>

            {/* c */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">c.</span>
                <span className="text-slate-700 font-medium">Seluruh Tim Perikatan telah menandatangani Form Independensi</span>
              </div>
              {renderToggle("qc")}
            </div>

            {/* d */}
            <div className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3 pr-4">
                <span className="w-5 font-bold text-slate-400 shrink-0">d.</span>
                <span className="text-slate-700 font-medium">Form Independensi tertanggal sebelum atau pada tanggal perikatan dimulai</span>
              </div>
              {renderToggle("qd")}
            </div>
          </div>
        </div>

        {/* 3 Kotak Dokumentasi & Simpulan Modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Contoh Format Pernyataan Independensi */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-atlas-blue rounded-lg">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Contoh Format Independensi</h3>
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

          {/* Card 2: Lampiran Surat Pernyataan Independensi */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Paperclip size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Lampiran KKP Independensi</h3>
                    <p className="text-[11px] text-slate-500">Dokumen tanda tangan tim</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {lampiranFiles.length} Berkas
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
                <span>Upload Lampiran Independensi</span>
                <input type="file" className="hidden" onChange={handleAddLampiranFile} />
              </label>
            </div>
          </div>

          {/* Card 3: Simpulan Independensi */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Simpulan Evaluasi</h3>
                    <p className="text-[11px] text-slate-500">Penilaian independensi perikatan</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-600">
                  Status Kelayakan Independensi
                </label>
                <select
                  value={simpulanManual}
                  onChange={(e) => setSimpulanManual(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-purple-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                >
                  <option value="Pernyataan Independensi Memadai">
                    Pernyataan Independensi Memadai
                  </option>
                  <option value="Pernyataan Independensi Tidak Memadai">
                    Pernyataan Independensi Tidak Memadai
                  </option>
                </select>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                  {simpulanManual.includes("Tidak") ? (
                    <span className="text-rose-600 font-medium">
                      ⚠️ Terdapat potensi ancaman independensi atau formulir belum lengkap ditandatangani. Tindakan pencegahan / mitigasi wajib didokumentasikan.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      ✓ Seluruh anggota tim perikatan terkonfirmasi independen dan bebas dari benturan kepentingan sesuai SA 220.
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

        {/* Card Catatan & Penjelasan Auditor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Catatan / Penjelasan Evaluasi Independensi</span>
              <span className="text-[11px] font-normal text-slate-400">
                (Identifikasi ancaman telaah pribadi, advokasi, atau kedekatan personal)
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">Opsional / Sesuai Kondisi</span>
          </div>
          <textarea
            value={catatanPenjelasan}
            onChange={(e) => setCatatanPenjelasan(e.target.value)}
            rows={3}
            placeholder="Tuliskan catatan pendukung mengenai konfirmasi independensi, kepemilikan saham, relasi keluarga, atau evaluasi ancaman lainnya bila ada..."
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
            <span>{isSaved ? "Tersimpan" : "Simpan KKP A.150"}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {isSaved && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>Pernyataan Independensi berhasil disimpan.</span>
        </div>
      )}
    </WorksheetContainer>
  );
};

export default A150;
