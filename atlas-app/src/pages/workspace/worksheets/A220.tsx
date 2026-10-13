import React, { useState } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import type { Engagement } from "../../../store/engagementStore";
import WorksheetContainer from "../../../components/WorksheetContainer";
import { CheckCircle2, AlertCircle, FileText, ArrowRight, ArrowLeft } from "lucide-react";

const A220: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();

  const [kesimpulan, setKesimpulan] = useState("");

  // In a real application, the completion status of A.220.1 and A.220.2 would be tracked in global state.
  // We mock them as completed here for the demo's happy path, or incomplete if we want to show warnings.
  const isA2201Completed = false; 
  const isA2202Completed = false;

  const isCompleted = kesimpulan.trim() !== "";

  return (
    <WorksheetContainer
      code="A.220"
      name="Prosedur Analitis Awal"
      purpose="Melakukan prosedur analitis awal atas laporan keuangan klien sebagai bagian dari prosedur penilaian risiko."
      status={isCompleted ? "Completed" : "In Progress"}
      reviewer={engagement.partnerName || "Menunggu Reviewer"}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6">
        
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Kertas kerja ini digunakan untuk melakukan prosedur analitis awal atas laporan keuangan klien sebagai bagian dari prosedur penilaian risiko.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Prosedur analitis awal merupakan salah satu prosedur untuk menilai kemungkinan adanya risiko salah saji dari suatu akun. Kertas kerja ini merupakan kontrol atas isian kertas kerja pendukungnya.
          </p>
        </div>

        {/* Tabel Kertas Kerja Pendukung */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FileText size={20} className="mr-2 text-atlas-blue" />
              Indeks Kertas Kerja Pendukung
            </h2>
          </div>
          <div className="p-0">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-gray-700 w-32 border-r border-gray-200">Indeks</th>
                  <th className="px-6 py-3 font-bold text-gray-700 border-r border-gray-200">Keterangan</th>
                  <th className="px-6 py-3 font-bold text-gray-700 w-32 text-center border-r border-gray-200">Status</th>
                  <th className="px-6 py-3 font-bold text-gray-700 w-32 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-atlas-blue border-r border-gray-200">A.220.1</td>
                  <td className="px-6 py-4 text-gray-700 border-r border-gray-200">Analisis perbandingan data antar periode</td>
                  <td className="px-6 py-4 text-center border-r border-gray-200">
                    {isA2201Completed ? (
                      <span className="inline-flex items-center text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                        <CheckCircle2 size={14} className="mr-1" /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">
                        <AlertCircle size={14} className="mr-1" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link to={`/workspace/${engagement.id}/worksheet/a2201`} className="inline-flex items-center text-xs font-bold bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-atlas-blue hover:text-white hover:border-atlas-blue transition-colors">
                      Buka <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-atlas-blue border-r border-gray-200">A.220.2</td>
                  <td className="px-6 py-4 text-gray-700 border-r border-gray-200">Analisis rasio keuangan</td>
                  <td className="px-6 py-4 text-center border-r border-gray-200">
                    {isA2202Completed ? (
                      <span className="inline-flex items-center text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                        <CheckCircle2 size={14} className="mr-1" /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">
                        <AlertCircle size={14} className="mr-1" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link to={`/workspace/${engagement.id}/worksheet/a2202`} className="inline-flex items-center text-xs font-bold bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-atlas-blue hover:text-white hover:border-atlas-blue transition-colors">
                      Buka <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Kesimpulan (Gambar 31) */}
        <div className="bg-cyan-50/50 rounded-2xl border border-cyan-100 overflow-hidden shadow-sm p-6">
          <label className="block text-sm font-bold text-red-500 mb-2 italic">Kesimpulan</label>
          <textarea 
            className="w-full border border-gray-300 bg-[#fde68a] rounded-xl p-4 text-gray-800 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none min-h-[150px] shadow-inner font-medium"
            placeholder="Ketik kesimpulan auditor di sini..."
            value={kesimpulan}
            onChange={(e) => setKesimpulan(e.target.value)}
          ></textarea>
          <p className="text-xs text-red-500 italic mt-2">
            (Isilah kesimpulan berdasarkan hasil analisis A.220.1 dan A.220.2)
          </p>
        </div>

        <div className="mt-8 border border-red-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-center">
          <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Status KKP A.220</h4>
          <div className="text-center">
            {isCompleted ? (
              <div className="text-green-600 font-bold bg-green-50 px-6 py-2 rounded-lg border border-green-200 inline-block text-lg shadow-sm">
                Completed
              </div>
            ) : (
              <div className="text-red-500 font-bold bg-red-50 px-6 py-2 rounded-lg border border-red-200 inline-block text-lg shadow-sm">
                Incompleted
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

export default A220;
