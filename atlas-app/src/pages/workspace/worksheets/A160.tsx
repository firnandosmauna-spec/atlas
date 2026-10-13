import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { Engagement } from "../../../store/engagementStore";
import WorksheetContainer from "../../../components/WorksheetContainer";
import { CheckCircle2, AlertCircle, FileText, Upload, ShieldAlert, ArrowLeft, Download, Trash2, ArrowRight } from "lucide-react";

const A160: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<"komunikasi" | "strategi">("komunikasi");

  // State untuk Kriteria Komunikasi (Bagian A)
  const [pemahaman, setPemahaman] = useState([
    { id: "a1", text: "Apakah Tim Perikatan memahami ruang lingkup pekerjaan yang akan dilaksanakan?", answer: "" },
    { id: "a2", text: "Apakah Tim Perikatan memahami periode pelaksanaan audit?", answer: "" },
    { id: "a3", text: "Apakah Tim Perikatan memiliki keahlian dan keterampilan yang memadai?", answer: "" },
    { id: "a4", text: "Apakah Tim Perikatan memahami hal-hal khusus untuk industri klien?", answer: "" },
  ]);

  // State untuk Konsultasi (Bagian B) - Input text
  const [konsultasi, setKonsultasi] = useState({
    b1: "", // Permasalahan yang disajikan
    b2: "", // Data yang tersedia
    b3: "", // Saran/tindakan/simpulan
    b4: "", // Para/Tanda tangan Tim (di system disimulasikan sebagai input text/nama)
  });

  const [modificationReason, setModificationReason] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // State untuk Audit Strategi Memorandum
  const [strategi, setStrategi] = useState({
    karakteristik: "",
    tujuan: "",
    faktor: "",
    sumberDaya: "",
    riskAssessment: "",
    prosedurLanjutan: ""
  });

  const handleUpdatePemahaman = (id: string, value: string) => {
    setPemahaman(prev => prev.map(c => c.id === id ? { ...c, answer: value } : c));
  };

  const isPemahamanAllAnswered = pemahaman.every(c => c.answer !== "");
  const hasPemahamanNo = pemahaman.some(c => c.answer === "Tidak");
  
  // Memadai jika A1-A4 dijawab "Ya"
  const isMemadai = isPemahamanAllAnswered && !hasPemahamanNo;
  const needsModification = hasPemahamanNo;

  const isStrategiFilled = Object.values(strategi).every(val => val.trim() !== "");

  // Status KKP = Completed jika (Memadai & file terupload & strategi terisi) ATAU (Tidak Memadai & modifikasi terisi & file & strategi)
  const isCompleted = isPemahamanAllAnswered && 
                      (isMemadai || (!isMemadai && modificationReason.trim() !== "")) &&
                      uploadedFile !== null &&
                      isStrategiFilled;

  return (
    <WorksheetContainer
      code="A.160"
      name="Komunikasi Tahap Pra Perikatan"
      purpose="Mengidentifikasi komunikasi dan konsultasi tim perikatan serta menyusun strategi audit secara keseluruhan (Audit Strategi Memorandum)."
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
                <li className="flex items-start"><ShieldAlert size={16} className="mr-2 text-atlas-blue shrink-0 mt-0.5" /> SA 300 : Perencanaan Suatu Audit atas Laporan Keuangan</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
              Kertas kerja ini digunakan untuk mengidentifikasi komunikasi dan konsultasi yang terjadi di antara tim perikatan dalam rangka proses pelaksanaan audit, serta mendokumentasikan Strategi Audit Memorandum.
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

        {/* Tab Navigation / Toggle View */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeView === "komunikasi" ? "border-atlas-blue text-atlas-blue" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveView("komunikasi")}
          >
            Siklus Komunikasi
          </button>
          <button 
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center ${activeView === "strategi" ? "border-atlas-blue text-atlas-blue" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveView("strategi")}
          >
            Strategi Audit Keseluruhan
            {!isStrategiFilled && <div className="ml-2 w-2 h-2 rounded-full bg-red-500"></div>}
          </button>
        </div>

        {activeView === "komunikasi" ? (
          <div className="animate-in fade-in duration-300 space-y-6">
            {/* Analisis Kriteria Komunikasi */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <FileText size={20} className="mr-2 text-atlas-blue" />
                  Siklus Komunikasi Antara Tim Perikatan
                </h2>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">a. Pemahaman Tim Perikatan atas:</h3>
                <div className="overflow-x-auto mb-8">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-bold text-gray-600 w-16 text-center">No</th>
                        <th className="px-4 py-3 font-bold text-gray-600">Pertanyaan Pemahaman</th>
                        <th className="px-4 py-3 font-bold text-gray-600 w-48 text-center bg-blue-50/50">Hasil Analisis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pemahaman.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-center font-bold text-gray-400">a.{idx + 1}</td>
                          <td className="px-4 py-3 text-gray-700 font-medium">{item.text}</td>
                          <td className="px-4 py-3 bg-blue-50/20">
                            <select 
                              className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-atlas-blue/20 outline-none text-center font-bold shadow-sm ${
                                item.answer === "Ya" ? "bg-green-100 border-green-300 text-green-700" : 
                                item.answer === "Tidak" ? "bg-red-100 border-red-300 text-red-700" : 
                                "border-gray-300 bg-white"
                              }`}
                              value={item.answer}
                              onChange={(e) => handleUpdatePemahaman(item.id, e.target.value)}
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

                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">b. Konsultasi selama Perikatan:</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                    <label className="text-sm font-semibold text-gray-700 md:col-span-1">b.1. Permasalahan yang disajikan</label>
                    <input type="text" className="md:col-span-3 border border-gray-300 rounded-lg p-2.5 text-sm focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none" value={konsultasi.b1} onChange={(e) => setKonsultasi({...konsultasi, b1: e.target.value})} placeholder="Deskripsikan masalah..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                    <label className="text-sm font-semibold text-gray-700 md:col-span-1">b.2. Data yang tersedia</label>
                    <input type="text" className="md:col-span-3 border border-gray-300 rounded-lg p-2.5 text-sm focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none" value={konsultasi.b2} onChange={(e) => setKonsultasi({...konsultasi, b2: e.target.value})} placeholder="Sumber data atau referensi..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                    <label className="text-sm font-semibold text-gray-700 md:col-span-1">b.3. Saran/Tindakan/Simpulan</label>
                    <input type="text" className="md:col-span-3 border border-gray-300 rounded-lg p-2.5 text-sm focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none" value={konsultasi.b3} onChange={(e) => setKonsultasi({...konsultasi, b3: e.target.value})} placeholder="Keputusan atau tindakan lanjutan..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                    <label className="text-sm font-semibold text-gray-700 md:col-span-1">b.4. Para Pihak / Tanda tangan Tim</label>
                    <input type="text" className="md:col-span-3 border border-gray-300 rounded-lg p-2.5 text-sm focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none" value={konsultasi.b4} onChange={(e) => setKonsultasi({...konsultasi, b4: e.target.value})} placeholder="Nama personel yang terlibat (misal: Partner, Manajer)..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Dokumen & Simpulan */}
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
                    <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Contoh Jurnal Komunikasi</h4>
                    <button className="w-full flex items-center justify-center space-x-2 bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                      <Download size={18} />
                      <span>Download Template</span>
                    </button>
                  </div>

                  {/* Lampiran */}
                  <div className="border border-red-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between">
                    <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Lampiran Jurnal Komunikasi</h4>
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
                  <div className="border border-red-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-center relative">
                    <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Simpulan</h4>
                    <div className="text-center">
                      {!isPemahamanAllAnswered ? (
                        <div className="text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 inline-block">Komunikasi Tidak Memadai</div>
                      ) : isMemadai ? (
                        <div className="text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100 inline-block">Komunikasi Memadai</div>
                      ) : (
                        <div className="text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 inline-block">Komunikasi Tidak Memadai</div>
                      )}
                    </div>

                    {/* Tombol ke Strategi - Gambar 26 */}
                    <div className="absolute -bottom-5 -right-2">
                      <button 
                        onClick={() => setActiveView("strategi")}
                        className="bg-atlas-blue text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-800 transition-colors flex items-center text-xs uppercase"
                      >
                        Strategi Audit Secara Keseluruhan <ArrowRight size={14} className="ml-1" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Kotak Penjelasan Modifikasi */}
                {needsModification && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-8">
                    <label className="block text-sm font-bold text-red-600 mb-2">Jelaskan alasan mengapa prosedur ini tidak diselesaikan!</label>
                    <textarea 
                      className="w-full border-2 border-yellow-400 bg-yellow-100/50 rounded-xl p-4 text-gray-800 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none min-h-[120px] shadow-sm"
                      placeholder="Tuliskan alasan modifikasi atau ketidakpatuhan prosedur..."
                      value={modificationReason}
                      onChange={(e) => setModificationReason(e.target.value)}
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <button onClick={() => navigate(`/workspace/${engagement.id}`)} className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2 flex items-center transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Kembali ke Index
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300 space-y-6">
            {/* AUDIT STRATEGI MEMORANDUM (Gambar 27) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center uppercase tracking-wide">
                  <FileText size={20} className="mr-2 text-atlas-blue" />
                  Audit Strategi Memorandum
                </h2>
                <span className="text-xs font-bold text-gray-500">Ref: SA 300</span>
              </div>
              
              <div className="p-6 space-y-6 bg-gray-50/30">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Karakteristik-Karakteristik Perikatan</label>
                  <textarea 
                    className="w-full border-2 border-yellow-300 bg-yellow-50 rounded-xl p-4 text-gray-800 focus:border-atlas-blue outline-none min-h-[80px]"
                    value={strategi.karakteristik}
                    onChange={(e) => setStrategi({...strategi, karakteristik: e.target.value})}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tujuan Pelaporan, Saat Audit, dan Sifat Komunikasi</label>
                  <textarea 
                    className="w-full border-2 border-yellow-300 bg-yellow-50 rounded-xl p-4 text-gray-800 focus:border-atlas-blue outline-none min-h-[80px]"
                    value={strategi.tujuan}
                    onChange={(e) => setStrategi({...strategi, tujuan: e.target.value})}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Faktor Signifikan, Aktivitas Perikatan Awal, dan Pengetahuan yang Diperoleh dari Perikatan Lain</label>
                  <textarea 
                    className="w-full border-2 border-yellow-300 bg-yellow-50 rounded-xl p-4 text-gray-800 focus:border-atlas-blue outline-none min-h-[80px]"
                    value={strategi.faktor}
                    onChange={(e) => setStrategi({...strategi, faktor: e.target.value})}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sifat, Saat, dan Luas Sumber Daya</label>
                  <textarea 
                    className="w-full border-2 border-yellow-300 bg-yellow-50 rounded-xl p-4 text-gray-800 focus:border-atlas-blue outline-none min-h-[80px]"
                    value={strategi.sumberDaya}
                    onChange={(e) => setStrategi({...strategi, sumberDaya: e.target.value})}
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-bold text-gray-800 uppercase text-center mb-6 tracking-widest bg-gray-100 py-2 rounded-lg">Perencanaan Audit</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Sifat, Saat, dan Luas Prosedur Risk Assessment</label>
                      <textarea 
                        className="w-full border-2 border-yellow-300 bg-yellow-50 rounded-xl p-4 text-gray-800 focus:border-atlas-blue outline-none min-h-[80px]"
                        value={strategi.riskAssessment}
                        onChange={(e) => setStrategi({...strategi, riskAssessment: e.target.value})}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Sifat, Saat, dan Luas Prosedur Lanjutan</label>
                      <textarea 
                        className="w-full border-2 border-yellow-300 bg-yellow-50 rounded-xl p-4 text-gray-800 focus:border-atlas-blue outline-none min-h-[80px]"
                        value={strategi.prosedurLanjutan}
                        onChange={(e) => setStrategi({...strategi, prosedurLanjutan: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setActiveView("komunikasi")} className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2 flex items-center transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Kembali ke Siklus Komunikasi
              </button>
            </div>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default A160;
