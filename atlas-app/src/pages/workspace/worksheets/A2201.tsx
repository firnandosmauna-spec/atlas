import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { Engagement } from "../../../store/engagementStore";
import WorksheetContainer from "../../../components/WorksheetContainer";
import { CheckCircle2, AlertCircle, FileText, ArrowLeft, Calculator, Save } from "lucide-react";

const A2201: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);
  
  // States
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [industryAvg, setIndustryAvg] = useState<{ [key: string]: number }>({});
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [conclusion, setConclusion] = useState<string>("");

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(val);

  // Mock Data for comparison
  const data = [
    { id: "A", title: "ASET", current: 5000000000, prior: 4500000000 },
    { id: "L", title: "LIABILITAS", current: 2000000000, prior: 2200000000 },
    { id: "E", title: "EKUITAS", current: 3000000000, prior: 2300000000 },
    { id: "R", title: "PENDAPATAN", current: 12000000000, prior: 10500000000 },
    { id: "C", title: "BEBAN POKOK", current: 7000000000, prior: 6500000000 },
    { id: "P", title: "LABA BERSIH", current: 2500000000, prior: 2000000000 },
  ];

  const handleIndustryAvgChange = (id: string, val: string) => {
    setIndustryAvg(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };

  const handleRemarkChange = (id: string, val: string) => {
    setRemarks(prev => ({ ...prev, [id]: val }));
  };

  const isCompleted = conclusion !== "" && Object.keys(remarks).length >= data.length;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="A.220.1"
      name="Analisis Perbandingan Data Antar-Periode"
      purpose="Membandingkan data laporan keuangan antara tahun berjalan dengan tahun sebelumnya serta analisis dengan industri sejenis."
      status={isCompleted ? "Completed" : "In Progress"}
      reviewer={engagement.partnerName || "Menunggu Reviewer"}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6">
        
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed">
            Kertas kerja ini berisi perbandingan data laporan keuangan antara tahun sebelum dengan tahun berjalan serta analisis dengan industri sejenis.
          </p>
        </div>

        {/* Tabel Analisis */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Calculator size={20} className="mr-2 text-atlas-blue" />
              Kertas Kerja Analisis Perbandingan
            </h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-bold text-gray-700">Tahun Buku:</label>
              <select 
                className="bg-green-100 border border-green-300 text-green-900 font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-green-400"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="2024">2024 (Berjalan)</option>
                <option value="2023">2023 (Berjalan)</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto p-0">
            <table className="w-full text-sm text-left border-collapse border-b border-gray-200">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-bold text-gray-700 border-r border-gray-200">Uraian Laporan Keuangan</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-right border-r border-gray-200">Tahun Berjalan (Rp)</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-right border-r border-gray-200">Tahun Sebelumnya (Rp)</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-right border-r border-gray-200">Naik / (Turun) Rp</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-center border-r border-gray-200">%</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-center border-r border-gray-200 w-24">Rata2 Industri (%)</th>
                  <th className="px-4 py-3 font-bold text-gray-700 w-64">Keterangan Mengenai Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, idx) => {
                  const diffRp = item.current - item.prior;
                  const diffPct = (diffRp / item.prior) * 100;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-800 border-r border-gray-200">{item.title}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(item.current)}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(item.prior)}</td>
                      <td className={`px-4 py-3 text-right font-mono border-r border-gray-200 ${diffRp < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                        {diffRp < 0 ? `(${formatCurrency(Math.abs(diffRp))})` : formatCurrency(diffRp)}
                      </td>
                      <td className={`px-4 py-3 text-center font-mono border-r border-gray-200 ${diffPct < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                        {diffPct.toFixed(2)}%
                      </td>
                      <td className="p-2 border-r border-gray-200 text-center">
                        <input 
                          type="number" step="0.1" 
                          className="w-full border border-gray-300 rounded p-1.5 text-xs text-center outline-none focus:border-atlas-blue"
                          placeholder="0.0"
                          value={industryAvg[item.id] || ''}
                          onChange={(e) => handleIndustryAvgChange(item.id, e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <textarea 
                          className="w-full border border-yellow-300 bg-yellow-50 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-yellow-400 min-h-[60px]"
                          placeholder="Analisis perubahan..."
                          value={remarks[item.id] || ''}
                          onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                        ></textarea>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simpulan Dropdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-3">Simpulan Hasil Analisis Perbandingan:</label>
          <select 
            className="w-full md:w-2/3 border border-gray-300 rounded-lg p-3 text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none bg-blue-50/30"
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
          >
            <option value="">-- Pilih Simpulan --</option>
            <option value="wajar">Fluktuasi wajar dan sesuai dengan pemahaman bisnis</option>
            <option value="risiko">Terdapat fluktuasi tidak wajar yang mengindikasikan risiko salah saji material</option>
            <option value="lainnya">Lainnya (Butuh investigasi lebih lanjut)</option>
          </select>
        </div>

        {/* Status */}
        <div className="mt-8 border border-red-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-center">
          <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Status KKP A.220.1</h4>
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
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/a220`)} className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2 flex items-center transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Kembali ke A.220
          </button>
          <button 
            onClick={handleSave} 
            disabled={!isCompleted}
            className={`px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors flex items-center ${isCompleted ? 'bg-atlas-blue text-white hover:bg-blue-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {isSaved ? <CheckCircle2 size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
            {isSaved ? 'Tersimpan' : 'Simpan KKP'}
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A2201;
