import React, { useState } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import type { Engagement } from "../../../store/engagementStore";
import WorksheetContainer from "../../../components/WorksheetContainer";
import { CheckCircle2, AlertCircle, FileText, ArrowRight, ArrowLeft, Info } from "lucide-react";

const A230: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();

  const [kesimpulanMenyeluruh, setKesimpulanMenyeluruh] = useState("");

  // Mock statuses for supporting worksheets
  const subWorksheets = [
    { id: "A.230.1", title: "Informasi umum dan aspek legalitas", completed: false, conclusion: "" },
    { id: "A.230.2", title: "Struktur Organisasi dan Tanggung Jawab", completed: false, conclusion: "" },
    { id: "A.230.3", title: "Proses aktivitas bisnis utama", completed: false, conclusion: "" },
    { id: "A.230.4", title: "Pemahaman peraturan yang relevan", completed: false, conclusion: "" },
    { id: "A.230.5", title: "Pemahaman lingkungan bisnis", completed: false, conclusion: "" },
    { id: "A.230.6", title: "Analisis kelangsungan usaha", completed: false, conclusion: "" },
    { id: "A.230.7", title: "Pemahaman penyiapan dan penyusunan laporan keuangan", completed: false, conclusion: "" },
    { id: "A.230.8", title: "Analisis faktor kecurangan", completed: false, conclusion: "" },
  ];

  const isCompleted = kesimpulanMenyeluruh.trim() !== ""; 

  return (
    <WorksheetContainer
      code="A.230"
      name="Pemahaman Entitas dan Lingkungan"
      purpose="Melakukan prosedur pemahaman atas entitas beserta lingkungannya untuk mengidentifikasi risiko salah saji material."
      status={isCompleted ? "Completed" : "In Progress"}
      reviewer={engagement.partnerName || "Menunggu Reviewer"}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6">
        
        {/* Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed m-0">
            Kertas kerja ini digunakan untuk melakukan prosedur pemahaman atas entitas beserta lingkungannya. Terdapat 8 kertas kerja pendukung untuk mengisi bagian ini.
          </p>
        </div>

        {/* Tabel Kertas Kerja Pendukung */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center m-0">
              <FileText size={16} className="mr-2 text-atlas-blue" />
              Indeks Kertas Kerja Pendukung
            </h2>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 font-bold text-gray-700 w-24 border-r border-gray-200">Indeks</th>
                  <th className="px-4 py-2 font-bold text-gray-700 border-r border-gray-200">Keterangan</th>
                  <th className="px-4 py-2 font-bold text-gray-700 w-24 text-center border-r border-gray-200">Status</th>
                  <th className="px-4 py-2 font-bold text-gray-700 w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subWorksheets.map((ws) => (
                  <tr key={ws.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-2 font-bold text-atlas-blue border-r border-gray-200">{ws.id}</td>
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">{ws.title}</td>
                    <td className="px-4 py-2 text-center border-r border-gray-200">
                      {ws.completed ? (
                        <span className="inline-flex items-center text-green-700 font-bold bg-green-100 px-1.5 py-0.5 rounded text-[10px]">
                          <CheckCircle2 size={10} className="mr-1" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                          <AlertCircle size={10} className="mr-1" /> DRAFT
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button 
                        onClick={() => alert(`Sub-worksheet ${ws.id} dalam tahap pengembangan.`)}
                        className="inline-flex items-center text-[10px] font-bold bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-atlas-blue hover:text-white hover:border-atlas-blue transition-colors"
                      >
                        Buka <ArrowRight size={10} className="ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kesimpulan Otomatis Block (Matching Gambar 23) */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl overflow-hidden shadow-sm p-5">
          <label className="block text-sm font-bold text-red-600 mb-4 italic">Kesimpulan</label>
          
          <div className="space-y-3">
            {subWorksheets.map((ws) => (
              <div key={ws.id} className="flex items-center grid grid-cols-12 gap-2">
                <div className="col-span-5 flex items-center text-xs text-gray-700">
                  <span className="truncate">{ws.title}</span>
                </div>
                <div className="col-span-7 flex items-center relative">
                  <Info size={12} className="text-gray-400 absolute left-2" />
                  <input 
                    type="text" 
                    readOnly 
                    className="w-full border border-gray-300 rounded bg-white text-xs text-gray-800 py-1.5 pl-6 pr-2 shadow-inner"
                    value={ws.conclusion || ""}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-cyan-200 pt-5">
            <label className="block text-sm font-bold text-red-600 mb-2 italic">
              Kemungkinan Salah Saji Material
            </label>
            <textarea 
              className="w-full border border-gray-300 bg-[#fde68a] rounded-lg p-3 text-sm text-gray-800 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none min-h-[100px] shadow-inner font-medium leading-relaxed"
              value={kesimpulanMenyeluruh}
              onChange={(e) => setKesimpulanMenyeluruh(e.target.value)}
            ></textarea>
            <p className="text-[10px] text-red-500 italic mt-1.5">
              (Isilah kesimpulan kemungkinan salah saji material berdasarkan analisis dari A.230.1 s.d A.230.8)
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 border border-red-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center">
          <h4 className="text-xs font-bold text-red-600 mb-3 text-center border-b border-red-100 pb-2 uppercase tracking-wide">Status KKP A.230</h4>
          <div className="text-center">
            {isCompleted ? (
              <div className="text-green-700 font-bold bg-green-100 px-6 py-1.5 rounded-lg border border-green-200 inline-block text-sm shadow-sm uppercase tracking-wider">
                Completed
              </div>
            ) : (
              <div className="text-red-700 font-bold bg-red-100 px-6 py-1.5 rounded-lg border border-red-200 inline-block text-sm shadow-sm uppercase tracking-wider">
                Incompleted
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-2">
          <button onClick={() => navigate(`/workspace/${engagement.id}`)} className="text-gray-500 text-sm font-bold hover:text-gray-800 px-3 py-1.5 flex items-center transition-colors">
            <ArrowLeft size={14} className="mr-1.5" /> Kembali ke Index
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A230;
