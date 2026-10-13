import React, { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { Engagement } from "../../../store/engagementStore";
import WorksheetContainer from "../../../components/WorksheetContainer";
import { CheckCircle2, AlertCircle, FileText, Upload, ShieldAlert, ArrowLeft, Download, Trash2 } from "lucide-react";

const A130: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();

  // Kriteria Surat Perikatan (SA 210)
  const [criteria, setCriteria] = useState([
    { id: 1, text: "Tujuan dan ruang lingkup audit atas laporan keuangan", answer: "" },
    { id: 2, text: "Tanggung jawab auditor", answer: "" },
    { id: 3, text: "Tanggung jawab manajemen", answer: "" },
    { id: 4, text: "Identifikasi kerangka pelaporan keuangan yang berlaku untuk penyusunan laporan keuangan", answer: "" },
    { id: 5, text: "Suatu pengacuan ke bentuk dan isi laporan yang diharapkan akan dikeluarkan oleh auditor", answer: "" },
  ]);

  const [modificationReason, setModificationReason] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleUpdateAnswer = (id: number, value: string) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, answer: value } : c));
  };

  const isAllAnswered = criteria.every(c => c.answer !== "");
  const hasNoAnswers = criteria.some(c => c.answer === "Tidak");
  
  // Logic untuk simpulan
  // Memadai jika: Semua dijawab "Ya"
  // Tidak Memadai jika: Belum lengkap ATAU ada yang dijawab "Tidak"
  const isMemadai = isAllAnswered && !hasNoAnswers;
  
  // Perlu penjelasan modifikasi jika: ada yang dijawab "Tidak"
  const needsModification = hasNoAnswers;

  // Status KKP = Completed jika (Memadai dan file terupload) ATAU (Tidak Memadai, alasan modifikasi terisi, dan file terupload)
  const isCompleted = isAllAnswered && 
                      (isMemadai || (!isMemadai && modificationReason.trim() !== "")) &&
                      uploadedFile !== null;

  return (
    <WorksheetContainer
      code="A.130"
      name="Surat Perikatan"
      purpose="Menganalisis surat perikatan yang akan ditandatangani oleh KAP dengan klien untuk memastikan kesesuaian dengan standar."
      status={isCompleted ? "Completed" : "In Progress"}
      reviewer={engagement.managerName || "Menunggu Reviewer"}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6">
        
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 shadow-sm">
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Standar Auditing yang Relevan</h3>
              <ul className="text-sm text-gray-700 font-medium space-y-1">
                <li className="flex items-start"><ShieldAlert size={16} className="mr-2 text-atlas-blue shrink-0 mt-0.5" /> SA 210 : Persetujuan atas Ketentuan Perikatan Audit</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
              Kertas kerja ini untuk menganalisis surat perikatan yang akan ditandatangani oleh KAP dengan klien. Terdapat beberapa pertanyaan sebagai kontrol untuk memastikan bahwa isi dan kelengkapan surat perikatan yang dibuat telah sesuai dengan standar yang berlaku.
            </p>
          </div>
          
          <div className="md:w-1/3 bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center items-center text-center">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status KKP</h4>
            {isCompleted ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 size={32} className="text-green-500 mb-2" />
                <span className="text-green-700 font-black text-lg">COMPLETED</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AlertCircle size={32} className="text-amber-500 mb-2" />
                <span className="text-amber-700 font-black text-lg">INCOMPLETED</span>
              </div>
            )}
          </div>
        </div>

        {/* Analisis Kriteria */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FileText size={20} className="mr-2 text-atlas-blue" />
              Kontrol Kelengkapan Surat Perikatan
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-600 w-16 text-center">No</th>
                  <th className="px-6 py-4 font-bold text-gray-600">Kriteria Surat Perikatan</th>
                  <th className="px-6 py-4 font-bold text-gray-600 w-48 text-center bg-blue-50/50">Tercantum (Ya/Tidak)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {criteria.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{item.text}</td>
                    <td className="px-6 py-4 bg-blue-50/20">
                      <select 
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-atlas-blue/20 outline-none text-center font-bold shadow-sm ${
                          item.answer === "Ya" ? "bg-green-100 border-green-300 text-green-700" : 
                          item.answer === "Tidak" ? "bg-red-100 border-red-300 text-red-700" : 
                          "border-gray-300 bg-white"
                        }`}
                        value={item.answer}
                        onChange={(e) => handleUpdateAnswer(item.id, e.target.value)}
                      >
                        <option value="" disabled>-</option>
                        <option value="Ya">Ya</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dokumen & Simpulan (Gambar 23) */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <CheckCircle2 size={20} className="mr-2 text-atlas-blue" />
              Dokumentasi & Simpulan
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Contoh Format */}
              <div className="border border-red-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between">
                <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Contoh Format Surat Perikatan</h4>
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                  <Download size={18} />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Lampiran Surat */}
              <div className="border border-red-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between">
                <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Lampiran Surat Perikatan Audit</h4>
                {uploadedFile ? (
                  <div className="w-full flex items-center justify-between bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
                    <span className="text-sm truncate pr-2 font-medium">{uploadedFile.name}</span>
                    <button onClick={() => setUploadedFile(null)} className="text-green-600 hover:text-green-800 shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 text-gray-500 py-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Upload size={20} className="mb-2" />
                    <span className="text-sm font-medium">Upload File</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setUploadedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Simpulan Kotak */}
              <div className="border border-red-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-center">
                <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Simpulan</h4>
                <div className="text-center">
                  {!isAllAnswered ? (
                    <div className="text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 inline-block">Surat Perikatan Tidak Memadai</div>
                  ) : isMemadai ? (
                    <div className="text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100 inline-block">Surat Perikatan Memadai</div>
                  ) : (
                    <div className="text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 inline-block">Surat Perikatan Tidak Memadai</div>
                  )}
                </div>
              </div>

            </div>

            {/* Kotak Penjelasan Modifikasi */}
            {needsModification && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-red-600 mb-2">Jelaskan bagaimana KAP memodifikasi surat perikatan</label>
                <textarea 
                  className="w-full border-2 border-yellow-400 bg-yellow-100/50 rounded-xl p-4 text-gray-800 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none min-h-[120px] shadow-sm"
                  placeholder="Kriteria surat perikatan tidak lengkap. Jelaskan modifikasi yang dilakukan..."
                  value={modificationReason}
                  onChange={(e) => setModificationReason(e.target.value)}
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}`)} className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2 flex items-center transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Kembali ke Index
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A130;
