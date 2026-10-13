import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { Engagement } from "../../../store/engagementStore";
import { useEngagementStore } from "../../../store/engagementStore";
import WorksheetContainer from "../../../components/WorksheetContainer";
import { CheckCircle2, AlertCircle, Calculator, FileText, ArrowLeft, Save } from "lucide-react";

const A2101: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const updateEngagement = useEngagementStore(state => state.updateEngagement);
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);

  // We will assume specific materiality is stored in the engagement object.
  // For demo purposes, we will mock it if it doesn't exist.
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [smOMMargin, setSmOMMargin] = useState<number>(0);
  const [smPMMargin, setSmPMMargin] = useState<number>(0);
  const [rationale, setRationale] = useState<string>("");

  const tb = engagement.trialBalance || [];
  
  // Ambil saldo untuk base specific materiality (jika akun terpilih)
  const selectedTbItem = tb.find(item => item.name === selectedAccount);
  const baseValue = selectedTbItem ? Math.abs(selectedTbItem.endingBalance) : 0;

  const calculatedSM_OM = baseValue * (smOMMargin / 100);
  const calculatedSM_PM = calculatedSM_OM * (smPMMargin / 100);

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(val);

  // Condition for completion
  const isCompleted = selectedAccount !== "" && smOMMargin > 0 && smPMMargin > 0 && rationale.trim() !== "";

  const handleSave = () => {
    // In a real scenario, we'd save this to the engagement store
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="A.210.1"
      name="Mapping Akun-akun Material"
      purpose="Melakukan perhitungan dan pertimbangan dalam menetapkan materialitas secara spesifik untuk jenis transaksi atau saldo akun tertentu."
      status={isCompleted ? "Completed" : "In Progress"}
      reviewer={engagement.partnerName || "Menunggu Reviewer"}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6">
        
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Kertas kerja ini digunakan untuk melakukan perhitungan dan pertimbangan dalam menetapkan materialitas secara spesifik untuk jenis transaksi, saldo akun, atau pengungkapan tertentu.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed bg-blue-50 border-l-4 border-atlas-blue p-4 rounded-r-lg">
            Jika Anda menentukan salah satu akun sebagai <i>specific materiality</i>, silakan pilih akun tertentu menggunakan <i>dropdown</i> pada kolom <b>Nama Akun</b>. Kemudian secara otomatis pada tabel "Data Saldo Laporan Keuangan" dalam kolom "Mapping (SM)" akan keluar huruf <b>"M"</b> yang mengindikasikan bahwa akun tersebut material setelah dipertimbangkan.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FileText size={20} className="mr-2 text-atlas-blue" />
              Pemilihan Akun Specific Materiality
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <label className="font-bold text-gray-700 text-sm whitespace-nowrap">Pilih Nama Akun:</label>
              <select 
                className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option value="">-- Pilih Akun --</option>
                {tb.map((item, idx) => (
                  <option key={idx} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700 border-r border-gray-200 w-16 text-center">No</th>
                    <th className="px-4 py-3 font-bold text-gray-700 border-r border-gray-200">Nama Akun</th>
                    <th className="px-4 py-3 font-bold text-gray-700 w-48 text-right border-r border-gray-200">Saldo Akhir (Rp)</th>
                    <th className="px-4 py-3 font-bold text-gray-700 w-32 text-center text-xs">Mapping (SM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tb.length > 0 ? (
                    tb.map((item, idx) => {
                      const isSelected = item.name === selectedAccount;
                      return (
                        <tr key={idx} className={`${isSelected ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-200">{idx + 1}</td>
                          <td className={`px-4 py-2 border-r border-gray-200 ${isSelected ? 'font-bold text-amber-800' : 'text-gray-700'}`}>
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-gray-600 border-r border-gray-200">
                            {formatCurrency(Math.abs(item.endingBalance))}
                          </td>
                          <td className="px-4 py-2 text-center font-bold">
                            {isSelected ? (
                              <span className="bg-amber-500 text-white px-3 py-1 rounded text-xs">M</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Data Trial Balance kosong. Silakan unggah trial balance terlebih dahulu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Specific Materiality Setup */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Calculator size={20} className="mr-2 text-atlas-blue" />
              Tabel Specific Materiality
            </h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse border border-gray-200">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700 w-12 text-center border-r border-gray-200">No</th>
                    <th className="px-4 py-3 font-bold text-gray-700 border-r border-gray-200">Keterangan</th>
                    <th className="px-4 py-3 font-bold text-gray-700 w-48 text-right border-r border-gray-200">Nilai Akun (Rp)</th>
                    <th className="px-4 py-3 font-bold text-gray-700 w-64 border-r border-gray-200 text-center">Tingkat Margin (%)</th>
                    <th className="px-4 py-3 font-bold text-gray-700 w-48 text-right border-r border-gray-200">Nilai SM (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-orange-50">
                    <td className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-200">1</td>
                    <td className="px-4 py-3 font-bold text-gray-800 border-r border-gray-200">
                      Specific Overall Materiality (SM OM)
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600 border-r border-gray-200 font-bold">
                      {formatCurrency(baseValue)}
                    </td>
                    <td className="p-2 border-r border-gray-200 flex items-center justify-center">
                      <input 
                        type="number" step="0.1" 
                        className="w-20 border border-orange-300 rounded p-1 text-xs text-center outline-none bg-white font-bold"
                        value={smOMMargin}
                        onChange={(e) => setSmOMMargin(parseFloat(e.target.value) || 0)}
                        disabled={!selectedAccount}
                      />
                      <span className="ml-1 text-xs font-bold">%</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-lg text-gray-800 bg-orange-100">
                      {formatCurrency(calculatedSM_OM)}
                    </td>
                  </tr>

                  <tr className="bg-green-50">
                    <td className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-200">2</td>
                    <td className="px-4 py-3 font-bold text-gray-800 border-r border-gray-200">
                      Specific Performance Materiality (SM PM)
                      <p className="text-xs text-gray-500 font-normal mt-1">(Dihitung dari nilai SM OM)</p>
                    </td>
                    <td className="bg-gray-50 border-r border-gray-200"></td>
                    <td className="p-2 border-r border-gray-200 flex items-center justify-center h-full min-h-[50px]">
                      <input 
                        type="number" step="1" 
                        className="w-20 border border-green-300 rounded p-1 text-xs text-center outline-none bg-white font-bold"
                        value={smPMMargin}
                        onChange={(e) => setSmPMMargin(parseFloat(e.target.value) || 0)}
                        disabled={!selectedAccount}
                      />
                      <span className="ml-1 text-xs font-bold">%</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-lg text-gray-800 bg-green-100">
                      {formatCurrency(calculatedSM_PM)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <span className="text-red-500">*</span> Pertimbangan Profesional Penentuan Specific Materiality
              </label>
              <textarea 
                className="w-full border border-gray-300 rounded-xl p-4 text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none min-h-[100px]"
                placeholder="Jelaskan rasionalisasi mengapa akun tersebut material dan membutuhkan SM khusus..."
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                disabled={!selectedAccount}
              ></textarea>
            </div>
            
            <div className="mt-8 border border-red-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-center">
              <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Status KKP Specific Materiality</h4>
              <div className="text-center">
                {isCompleted ? (
                  <div className="text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100 inline-block">
                    Completed
                  </div>
                ) : (
                  <div className="text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 inline-block">
                    Incompleted
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/a210`)} className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2 flex items-center transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Kembali ke Materialitas Awal (A.210)
          </button>
          <button 
            onClick={handleSave} 
            disabled={!isCompleted}
            className={`px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors flex items-center ${isCompleted ? 'bg-atlas-blue text-white hover:bg-blue-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {isSaved ? <CheckCircle2 size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
            {isSaved ? 'Tersimpan' : 'Simpan SM'}
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A2101;
