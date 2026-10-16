import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { TrendingUp, TrendingDown, ArrowRight, Save, Activity } from 'lucide-react';

interface RatioAnalysis {
  id: string;
  name: string;
  group: string;
  pyValue: number;
  cyValue: number;
  expectation: string;
  explanation: string;
  conclusion: string;
}

const initialRatios: RatioAnalysis[] = [
  { id: '1', name: 'Revenue Growth', group: 'Profitabilitas', pyValue: 0, cyValue: 0, expectation: '', explanation: '', conclusion: '' },
  { id: '2', name: 'Gross Profit Margin', group: 'Profitabilitas', pyValue: 0, cyValue: 0, expectation: '', explanation: '', conclusion: '' },
  { id: '3', name: 'Operating Margin', group: 'Profitabilitas', pyValue: 0, cyValue: 0, expectation: '', explanation: '', conclusion: '' },
  { id: '4', name: 'Current Ratio', group: 'Likuiditas', pyValue: 0, cyValue: 0, expectation: '', explanation: '', conclusion: '' },
  { id: '5', name: 'Debt to Equity Ratio', group: 'Solvabilitas', pyValue: 0, cyValue: 0, expectation: '', explanation: '', conclusion: '' },
];

const A2202 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const [ratios, setRatios] = useState<RatioAnalysis[]>(initialRatios);

  const updateRatio = (id: string, field: keyof RatioAnalysis, value: string) => {
    setRatios(ratios.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const formatValue = (name: string, val: number) => {
    if (name.includes('Growth') || name.includes('Margin')) {
      return (val * (name.includes('Growth') ? 1 : 100)).toFixed(1) + '%';
    }
    if (name.includes('Ratio')) {
      return val.toFixed(2) + 'x';
    }
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(val);
  };

  return (
    <WorksheetContainer
      code="A.2202"
      name="Analisis Rasio & Prosedur Analitis"
      purpose="Membandingkan data Current Year, Prior Year, dan ekspektasi auditor untuk mengidentifikasi area risiko potensial."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Visual Dashboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 text-atlas-blue mb-6 border-b pb-4">
            <Activity size={20} />
            <h2 className="font-bold text-lg">Visualisasi Varians & Rasio Kunci</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ratios.map(ratio => {
              // Calculate percentage change for visuals
              let pctChange = 0;
              if (ratio.name.includes('Growth')) {
                pctChange = ((ratio.cyValue - ratio.pyValue) / ratio.pyValue) * 100;
              } else {
                pctChange = ((ratio.cyValue - ratio.pyValue) / ratio.pyValue) * 100;
              }
              
              const isPositive = pctChange >= 0;
              
              return (
                <div key={'viz-'+ratio.id} className="bg-slate-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{ratio.group}</div>
                    <div className="font-bold text-gray-800">{ratio.name}</div>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Current Year</div>
                      <div className="text-xl font-black text-atlas-blue">{formatValue(ratio.name, ratio.cyValue)}</div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                        {Math.abs(pctChange).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytical Procedures Matrix */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-bold text-gray-700 text-sm w-48">Rasio / Akun</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-sm w-32 text-right">Prior Year (PY)</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-sm w-32 text-right">Current Year (CY)</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-sm w-32 text-right">Variance (%)</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-sm w-64">Auditor Expectation</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-sm w-64">Explanation (Jika Fluktuasi Unik)</th>
                  <th className="px-4 py-3 font-bold text-gray-700 text-sm w-48">Conclusion / Risk Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ratios.map((ratio) => {
                  const pctChange = ((ratio.cyValue - ratio.pyValue) / ratio.pyValue) * 100;
                  const isPositive = pctChange >= 0;

                  return (
                    <tr key={ratio.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{ratio.name}</div>
                        <div className="text-xs text-gray-500">{ratio.group}</div>
                      </td>
                      <td className="p-4 text-right font-medium text-gray-600 bg-gray-50/50">
                        {formatValue(ratio.name, ratio.pyValue)}
                      </td>
                      <td className="p-4 text-right font-bold text-atlas-blue bg-blue-50/20">
                        {formatValue(ratio.name, ratio.cyValue)}
                      </td>
                      <td className="p-4 text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded font-bold text-sm ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
                        </div>
                      </td>
                      <td className="p-3">
                        <textarea 
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-atlas-blue outline-none resize-none bg-slate-50"
                          rows={2}
                          value={ratio.expectation}
                          onChange={(e) => updateRatio(ratio.id, 'expectation', e.target.value)}
                        />
                      </td>
                      <td className="p-3">
                        <textarea 
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-atlas-blue outline-none resize-none"
                          rows={2}
                          placeholder="Jelaskan alasan fluktuasi..."
                          value={ratio.explanation}
                          onChange={(e) => updateRatio(ratio.id, 'explanation', e.target.value)}
                        />
                      </td>
                      <td className="p-3">
                        <select 
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-atlas-blue outline-none font-medium"
                          value={ratio.conclusion}
                          onChange={(e) => updateRatio(ratio.id, 'conclusion', e.target.value)}
                        >
                          <option value="">-- Pilih Kesimpulan --</option>
                          <option value="Sesuai Ekspektasi">Sesuai Ekspektasi (Low Risk)</option>
                          <option value="Perlu Investigasi">Perlu Investigasi Lanjut</option>
                          <option value="Indikasi Salah Saji">Indikasi Salah Saji (High Risk)</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-3 bg-atlas-blue text-white rounded-lg font-bold hover:bg-blue-800 flex items-center shadow-lg transition-colors">
            <Save size={20} className="mr-2" /> Simpan Analisis
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A2202;
