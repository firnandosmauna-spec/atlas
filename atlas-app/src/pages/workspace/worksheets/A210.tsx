import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Engagement, Materiality } from '../../../store/engagementStore';
import { useEngagementStore } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Calculator, AlertCircle, Save, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';

const A210 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const updateEngagement = useEngagementStore(state => state.updateEngagement);
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Extract financial data from Trial Balance
  const tb = engagement.trialBalance || [];
  const financialData = useMemo(() => {
    const assets = tb.filter(a => a.group === 'Aset').reduce((sum, a) => sum + Math.abs(a.endingBalance), 0);
    const liabilities = tb.filter(a => a.group === 'Liabilitas').reduce((sum, a) => sum + Math.abs(a.endingBalance), 0);
    const revenue = tb.filter(a => a.group === 'Pendapatan').reduce((sum, a) => sum + Math.abs(a.endingBalance), 0);
    const cogs = tb.filter(a => a.group === 'Beban' && a.name.toLowerCase().includes('hpp')).reduce((sum, a) => sum + Math.abs(a.endingBalance), 0);
    const expenses = tb.filter(a => a.group === 'Beban' && !a.name.toLowerCase().includes('hpp')).reduce((sum, a) => sum + Math.abs(a.endingBalance), 0);
    
    return {
      totalAssets: assets,
      netAssets: assets - liabilities,
      totalRevenue: revenue,
      cogs: cogs,
      ebt: revenue - cogs - expenses, // Earnings Before Tax (Simplified)
      ebitda: revenue - cogs - (expenses * 0.8), // Approximation for EBITDA
      totalLiabilities: liabilities,
      netIncome: revenue - cogs - expenses,
    };
  }, [tb]);

  const defaultMateriality: Materiality = {
    basis: 'Total Aset',
    omPercentage: 1,
    pmPercentage: 75,
    thresholdPercentage: 3,
    specificMateriality: 0,
    rationale: '', // Legacy
    omRationale: '',
    pmRationale: '',
    overallMateriality: 0,
    performanceMateriality: 0,
    threshold: 0
  };

  // Convert old structure to new if needed
  const initialData = { ...defaultMateriality, ...(engagement.materiality || {}) };
  const [form, setForm] = useState<any>(initialData);
  const [kondisiEntitas, setKondisiEntitas] = useState("Normal");
  const [useSpecificMateriality, setUseSpecificMateriality] = useState(false);

  const getBasisAmount = () => {
    switch (form.basis) {
      case 'Total Aset': return financialData.totalAssets;
      case 'Aset Bersih': return financialData.netAssets;
      case 'Jumlah Pendapatan': return financialData.totalRevenue;
      case 'Jumlah HPP': return financialData.cogs;
      case 'Laba sebelum pajak': return Math.abs(financialData.ebt);
      case 'Laba sebelum bunga, pajak, penyusutan': return Math.abs(financialData.ebitda);
      case 'Total Liabilitas': return financialData.totalLiabilities;
      case 'Laba bersih setelah pajak': return Math.abs(financialData.netIncome);
      default: return 0;
    }
  };

  const basisAmount = getBasisAmount();
  const calculatedOM = basisAmount * (form.omPercentage / 100);
  const calculatedPM = calculatedOM * (form.pmPercentage / 100);
  const calculatedThreshold = calculatedPM * (form.thresholdPercentage / 100); // Threshold is based on PM as per image: "Biasanya 3% - 5% dari materialitas pelaksanaan"

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const isCompleted = form.omPercentage > 0 && form.pmPercentage > 0 && form.thresholdPercentage > 0 && 
                      form.omRationale.trim() !== "" && form.pmRationale.trim() !== "";

  const handleSave = () => {
    const updatedMateriality = {
      ...form,
      overallMateriality: calculatedOM,
      performanceMateriality: calculatedPM,
      threshold: calculatedThreshold
    };
    updateEngagement(engagement.id, { materiality: updatedMateriality });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const noTbWarning = tb.length === 0;

  return (
    <WorksheetContainer
      code="A.210"
      name="Materialitas Awal"
      purpose="Melakukan perhitungan dan pertimbangan dalam penetapan tingkat materialitas."
      status={isCompleted ? 'Completed' : 'In Progress'}
      reviewer={engagement.partnerName || 'Menunggu Reviewer'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6">
        
        {noTbWarning && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start">
            <AlertCircle className="text-amber-500 mr-3 shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-amber-800">Peringatan: Data Keuangan (Trial Balance) Belum Diunggah!</h3>
              <p className="text-sm text-amber-700 mt-1">Angka uraian laporan keuangan akan bernilai 0. Silakan unggah Data Keuangan (TB) di menu terkait.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Calculator size={20} className="mr-2 text-atlas-blue" />
              Penentuan Materialitas Awal
            </h2>
          </div>

          <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <label className="font-bold text-gray-700 text-sm">Kondisi Entitas:</label>
              <select 
                className="border border-gray-300 rounded-lg p-2 text-sm focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                value={kondisiEntitas}
                onChange={(e) => setKondisiEntitas(e.target.value)}
              >
                <option value="Normal">Normal</option>
                <option value="Baru Mulai Operasi">Baru Mulai Operasi</option>
                <option value="Laba Berfluktuasi">Laba Berfluktuasi</option>
                <option value="Menjelang Pailit">Menjelang Pailit</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse border border-gray-200">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700 w-12 text-center border-r border-gray-200">No</th>
                    <th className="px-4 py-3 font-bold text-gray-700 border-r border-gray-200">Uraian</th>
                    <th className="px-4 py-3 font-bold text-gray-700 w-48 text-right border-r border-gray-200">Nilai (Rp)</th>
                    <th className="px-4 py-3 font-bold text-gray-700 w-64 border-r border-gray-200">Masukan auditor</th>
                    <th className="px-4 py-3 font-bold text-gray-700 w-48 text-right border-r border-gray-200">Materialitas (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-200">1</td>
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">Total Aset</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(financialData.totalAssets)}</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td><td className="bg-gray-50"></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-200">2</td>
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">Aset Bersih</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(financialData.netAssets)}</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td><td className="bg-gray-50"></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-200">3</td>
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">Jumlah Pendapatan</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(financialData.totalRevenue)}</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td><td className="bg-gray-50"></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-200">4</td>
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">Jumlah HPP</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(financialData.cogs)}</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td><td className="bg-gray-50"></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-200">5</td>
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">Laba sebelum pajak</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(Math.abs(financialData.ebt))}</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td><td className="bg-gray-50"></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-200">6</td>
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">Laba sebelum bunga, pajak, penyusutan...</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(Math.abs(financialData.ebitda))}</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td><td className="bg-gray-50"></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-200">7</td>
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">Total Liabilitas</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(financialData.totalLiabilities)}</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td><td className="bg-gray-50"></td>
                  </tr>
                  <tr className="hover:bg-gray-50 border-b-4 border-gray-300">
                    <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-200">8</td>
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">Laba bersih setelah pajak dari operasi normal</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600 border-r border-gray-200">{formatCurrency(Math.abs(financialData.netIncome))}</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td><td className="bg-gray-50"></td>
                  </tr>

                  {/* Section 9: Overall Materiality */}
                  <tr className="bg-orange-50">
                    <td className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-200" rowSpan={3}>9</td>
                    <td className="px-4 py-3 font-bold text-gray-800 border-r border-gray-200" colSpan={2}>Penentuan Materialitas Keseluruhan</td>
                    <td className="p-2 border-r border-gray-200">
                      <select 
                        className="w-full border border-orange-300 rounded p-1 text-xs focus:border-atlas-blue outline-none bg-white font-bold"
                        value={form.basis}
                        onChange={(e) => setForm({...form, basis: e.target.value})}
                      >
                        <option value="Total Aset">Total Aset</option>
                        <option value="Aset Bersih">Aset Bersih</option>
                        <option value="Jumlah Pendapatan">Jumlah Pendapatan</option>
                        <option value="Laba sebelum pajak">Laba sebelum pajak</option>
                        <option value="Total Liabilitas">Total Liabilitas</option>
                      </select>
                    </td>
                    <td className="bg-gray-50 border-r border-gray-200"></td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200" colSpan={2}>Margin (%)</td>
                    <td className="p-2 border-r border-gray-200">
                      <div className="flex items-center">
                        <input 
                          type="number" step="0.1" 
                          className="w-20 border border-orange-300 rounded p-1 text-xs text-center outline-none bg-white font-bold"
                          value={form.omPercentage}
                          onChange={(e) => setForm({...form, omPercentage: parseFloat(e.target.value) || 0})}
                        />
                        <span className="ml-1 text-xs font-bold">%</span>
                      </div>
                    </td>
                    <td className="bg-gray-50 border-r border-gray-200"></td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200" colSpan={2}>
                      <span className="text-red-500 font-bold">* </span>Pertimbangan profesional memilih acuan
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      <textarea 
                        className="w-full border border-orange-300 rounded p-1 text-xs outline-none bg-white min-h-[40px]"
                        value={form.omRationale}
                        onChange={(e) => setForm({...form, omRationale: e.target.value})}
                        placeholder="Alasan penentuan acuan..."
                      ></textarea>
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-lg text-gray-800 bg-orange-100">{formatCurrency(calculatedOM)}</td>
                  </tr>

                  {/* Section 10: Performance Materiality */}
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-200" rowSpan={3}>10</td>
                    <td className="px-4 py-3 font-bold text-gray-800 border-r border-gray-200" colSpan={2}>Penentuan Materialitas Pelaksanaan</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td>
                    <td className="bg-gray-50"></td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200" colSpan={2}>Margin (Biasanya 50% - 80% dari materialitas keseluruhan)</td>
                    <td className="p-2 border-r border-gray-200">
                      <div className="flex items-center">
                        <input 
                          type="number" step="1" 
                          className="w-20 border border-green-300 rounded p-1 text-xs text-center outline-none bg-white font-bold"
                          value={form.pmPercentage}
                          onChange={(e) => setForm({...form, pmPercentage: parseFloat(e.target.value) || 0})}
                        />
                        <span className="ml-1 text-xs font-bold">%</span>
                      </div>
                    </td>
                    <td className="bg-gray-50"></td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200" colSpan={2}>
                      <span className="text-red-500 font-bold">* </span>Pertimbangan profesional
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      <textarea 
                        className="w-full border border-green-300 rounded p-1 text-xs outline-none bg-white min-h-[40px]"
                        value={form.pmRationale}
                        onChange={(e) => setForm({...form, pmRationale: e.target.value})}
                        placeholder="Alasan penentuan margin..."
                      ></textarea>
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-lg text-gray-800 bg-green-100">{formatCurrency(calculatedPM)}</td>
                  </tr>

                  {/* Section 11: Threshold */}
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-200" rowSpan={2}>11</td>
                    <td className="px-4 py-3 font-bold text-gray-800 border-r border-gray-200" colSpan={2}>Ambang Batas Nilai Yang Tidak Dikoreksi</td>
                    <td className="bg-gray-50 border-r border-gray-200"></td>
                    <td className="bg-gray-50"></td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200" colSpan={2}>Margin (Biasanya 3% - 5% dari materialitas pelaksanaan)</td>
                    <td className="p-2 border-r border-gray-200">
                      <div className="flex items-center">
                        <input 
                          type="number" step="0.1" 
                          className="w-20 border border-blue-300 rounded p-1 text-xs text-center outline-none bg-white font-bold"
                          value={form.thresholdPercentage}
                          onChange={(e) => setForm({...form, thresholdPercentage: parseFloat(e.target.value) || 0})}
                        />
                        <span className="ml-1 text-xs font-bold">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-lg text-gray-800 bg-blue-100">{formatCurrency(calculatedThreshold)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-atlas-blue rounded focus:ring-atlas-blue border-gray-300"
                  checked={useSpecificMateriality}
                  onChange={(e) => setUseSpecificMateriality(e.target.checked)}
                />
                <span>Apakah terdapat pertimbangan specific materiality?</span>
              </label>
              
              {useSpecificMateriality && (
                <div className="mt-4 p-4 border border-red-200 bg-red-50/30 rounded-xl flex items-center justify-between animate-in fade-in">
                  <span className="text-sm font-bold text-red-600">Tentukan Specific Materiality</span>
                  <button className="bg-white border border-red-300 text-red-600 px-4 py-1.5 rounded font-bold text-sm hover:bg-red-50 transition-colors">
                    Mapping Materialitas Saldo Akun
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 border border-red-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-center">
              <h4 className="text-sm font-bold text-red-600 mb-4 text-center border-b border-red-100 pb-2">Simpulan</h4>
              <div className="text-center">
                {isCompleted ? (
                  <div className="text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100 inline-block">Materialitas sudah ditentukan</div>
                ) : (
                  <div className="text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 inline-block">Materialitas Belum Ditentukan</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="text-sm font-bold text-gray-700">Status KKP</div>
              {isCompleted ? (
                <div className="bg-green-50 border border-green-400 text-green-700 font-black px-4 py-1.5 rounded-lg text-sm uppercase shadow-sm">
                  Completed
                </div>
              ) : (
                <div className="bg-red-50 border border-red-400 text-red-600 font-black px-4 py-1.5 rounded-lg text-sm uppercase shadow-sm">
                  Incompleted
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}`)} className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2 flex items-center transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Kembali ke Index
          </button>
          <button 
            onClick={handleSave} 
            className="bg-atlas-blue text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-800 transition-colors flex items-center"
          >
            {isSaved ? <CheckCircle2 size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
            {isSaved ? 'Tersimpan' : 'Simpan Materialitas'}
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A210;
