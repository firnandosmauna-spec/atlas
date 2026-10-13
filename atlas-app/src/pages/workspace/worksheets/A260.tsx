import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft } from 'lucide-react';

const A260 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [simpulan, setSimpulan] = useState('');

  // 1. Tingkat Laporan Keuangan
  const [fsFactors, setFsFactors] = useState({
    fraud: false,
    internalControl: false,
    businessEnvironment: false,
    overrideManagement: false,
    other: false,
    otherText: ''
  });
  const [fsRomm, setFsRomm] = useState('');
  const [fsDesc, setFsDesc] = useState('');

  // 2. Tingkat Asersi
  // Using Trial Balance
  const tb = engagement.trialBalance || [
    { name: "Kas dan Setara Kas", endingBalance: 1500000000 },
    { name: "Piutang Usaha", endingBalance: 2500000000 },
    { name: "Persediaan", endingBalance: 3000000000 },
    { name: "Aset Tetap", endingBalance: 12000000000 }
  ];

  const [accLevelData, setAccLevelData] = useState<any>({});

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Math.abs(val));

  const handleAccChange = (accountName: string, field: string, value: any) => {
    setAccLevelData((prev: any) => ({
      ...prev,
      [accountName]: {
        ...(prev[accountName] || {
          mtm: 'M',
          fraud: false,
          ir: '',
          cr: '',
          romm: '',
          sigRisk: false,
          saldoTransaksi: '',
          c: false, e: false, a: false, v: false, p: false,
          toc: false, ap: false, tod: false, interim: false, ye: false
        }),
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="A.260"
      name="Risiko Salah Saji Material"
      purpose="Penilaian risiko salah saji material pada tingkat laporan keuangan dan tingkat asersi."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed m-0">
            Penilaian risiko salah saji material dilakukan pada 2 (dua) tingkat, yakni di <b>tingkat laporan keuangan</b> dan di <b>tingkat asersi</b> untuk jenis transaksi, saldo akun, dan pengungkapan.
          </p>
        </div>

        {/* 1. Tingkat Laporan Keuangan */}
        <div className="bg-white rounded border border-blue-900 overflow-hidden shadow-sm">
          <div className="bg-blue-900 text-white font-bold py-1 px-2 text-[10px] uppercase tracking-wider text-center border-b border-blue-950">
            RISK OF MATERIAL MISSTATEMENT AT THE FINANCIAL STATEMENT LEVEL
          </div>
          <table className="w-full text-[10px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 border border-gray-300 font-bold text-center w-32" rowSpan={2}>Level</th>
                <th className="px-2 py-2 border border-gray-300 font-bold text-center" rowSpan={2}>Faktor Penyebab yang menjadi pertimbangan</th>
                <th className="px-2 py-1 border border-gray-300 font-bold text-center text-red-700 uppercase" colSpan={2}>OVERALL RISK ASSESSMENT</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border border-gray-300 font-bold text-center w-32">ROMM (H/M/L)</th>
                <th className="px-2 py-1 border border-gray-300 font-bold text-center w-64">Description ROMM</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-2 border border-gray-300 bg-gray-50 text-center font-bold" rowSpan={5}>
                  Financial Statement Level
                </td>
                <td className="px-1 py-1 border border-gray-300 bg-white">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="mr-2" checked={fsFactors.fraud} onChange={(e) => setFsFactors({...fsFactors, fraud: e.target.checked})} />
                    1. Faktor kecurangan yang teridentifikasi (A230.8)
                  </label>
                </td>
                <td className="px-1 py-1 border border-gray-300 bg-yellow-50 align-top" rowSpan={5}>
                  <select 
                    className="w-full border border-gray-300 p-1 outline-none focus:border-blue-500 font-bold text-center"
                    value={fsRomm} onChange={(e) => setFsRomm(e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="H" className="text-red-600 font-bold">High (H)</option>
                    <option value="M" className="text-amber-600 font-bold">Medium (M)</option>
                    <option value="L" className="text-green-600 font-bold">Low (L)</option>
                  </select>
                </td>
                <td className="px-1 py-1 border border-gray-300 bg-yellow-50 align-top" rowSpan={5}>
                  <textarea 
                    className="w-full h-full min-h-[90px] border border-gray-300 p-1.5 outline-none focus:border-blue-500 resize-none"
                    placeholder="..."
                    value={fsDesc} onChange={(e) => setFsDesc(e.target.value)}
                  ></textarea>
                </td>
              </tr>
              <tr>
                <td className="px-1 py-1 border border-gray-300 bg-white">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="mr-2" checked={fsFactors.internalControl} onChange={(e) => setFsFactors({...fsFactors, internalControl: e.target.checked})} />
                    2. Faktor pengendalian internal yang kurang memadai (A230)
                  </label>
                </td>
              </tr>
              <tr>
                <td className="px-1 py-1 border border-gray-300 bg-white">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="mr-2" checked={fsFactors.businessEnvironment} onChange={(e) => setFsFactors({...fsFactors, businessEnvironment: e.target.checked})} />
                    3. Faktor perubahan lingkungan bisnis yang signifikan (A230)
                  </label>
                </td>
              </tr>
              <tr>
                <td className="px-1 py-1 border border-gray-300 bg-white">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="mr-2" checked={fsFactors.overrideManagement} onChange={(e) => setFsFactors({...fsFactors, overrideManagement: e.target.checked})} />
                    4. Faktor adanya override management (A230.7)
                  </label>
                </td>
              </tr>
              <tr>
                <td className="px-1 py-1 border border-gray-300 bg-white flex items-center">
                  <label className="flex items-center cursor-pointer whitespace-nowrap">
                    <input type="checkbox" className="mr-2" checked={fsFactors.other} onChange={(e) => setFsFactors({...fsFactors, other: e.target.checked})} />
                    5. Faktor lainnya
                  </label>
                  <input 
                    type="text" 
                    className="ml-2 flex-1 border-b border-gray-300 bg-transparent outline-none focus:border-black px-1" 
                    disabled={!fsFactors.other}
                    value={fsFactors.otherText} onChange={(e) => setFsFactors({...fsFactors, otherText: e.target.value})}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Tingkat Asersi */}
        <div className="bg-white rounded border border-blue-900 overflow-x-auto shadow-sm mt-8">
          <div className="bg-blue-900 text-white font-bold py-1 px-2 text-[10px] uppercase tracking-wider text-center border-b border-blue-950">
            RISK OF MATERIAL MISSTATEMENT AT ASSERTION LEVEL
          </div>
          <table className="w-max min-w-full text-[9px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="px-2 py-2 border border-gray-300 font-bold text-center align-middle" rowSpan={3} style={{minWidth:'150px'}}>Nama Akun</th>
                <th className="px-2 py-2 border border-gray-300 font-bold text-center align-middle" rowSpan={3} style={{minWidth:'80px'}}>Saldo Rp</th>
                <th className="px-1 py-2 border border-gray-300 font-bold text-center align-middle w-10" rowSpan={3}>M/TM</th>
                <th className="px-1 py-2 border border-gray-300 font-bold text-center align-middle w-16" rowSpan={3}>Perencanaan Risiko Kecurangan (A240)</th>
                <th className="px-1 py-2 border border-gray-300 font-bold text-center align-middle w-12" rowSpan={3}>Inherent Risk Level (A240)</th>
                <th className="px-1 py-2 border border-gray-300 font-bold text-center align-middle w-12" rowSpan={3}>Control Risk Level (A250.2)</th>
                <th className="px-1 py-1 border border-gray-300 font-bold text-center uppercase" colSpan={7}>OVERALL RISK ASSESSMENT</th>
                <th className="px-1 py-1 border border-gray-300 font-bold text-center uppercase" colSpan={5}>Planned Response</th>
              </tr>
              <tr className="bg-gray-100 border-b border-gray-300 text-center">
                <th className="px-1 py-1 border border-gray-300 font-bold align-middle w-12" rowSpan={2}>ROMM (H/M/L) and Sig. Risk</th>
                <th className="px-1 py-1 border border-gray-300 font-bold text-center" colSpan={6}>ROMM PADA LEVEL ASERSI</th>
                <th className="px-1 py-1 border border-gray-300 font-bold align-middle w-10" rowSpan={2}>ToC</th>
                <th className="px-1 py-1 border border-gray-300 font-bold align-middle w-10" rowSpan={2}>AP</th>
                <th className="px-1 py-1 border border-gray-300 font-bold align-middle w-10" rowSpan={2}>ToD</th>
                <th className="px-1 py-1 border border-gray-300 font-bold align-middle w-12" rowSpan={2}>Interim</th>
                <th className="px-1 py-1 border border-gray-300 font-bold align-middle w-12" rowSpan={2}>YE</th>
              </tr>
              <tr className="bg-gray-50 border-b border-gray-300 text-center">
                <th className="px-1 py-1 border border-gray-300 font-medium w-24">SALDO TRANSAKSI</th>
                <th className="px-1 py-1 border border-gray-300 font-medium w-8">C</th>
                <th className="px-1 py-1 border border-gray-300 font-medium w-8">E</th>
                <th className="px-1 py-1 border border-gray-300 font-medium w-8">A</th>
                <th className="px-1 py-1 border border-gray-300 font-medium w-8">V</th>
                <th className="px-1 py-1 border border-gray-300 font-medium w-12">P/D</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tb.map((item, idx) => {
                const data = accLevelData[item.name] || { mtm: 'M', fraud: false, ir: '', cr: '', romm: '', sigRisk: false, saldoTransaksi: '', c: false, e: false, a: false, v: false, p: false, toc: false, ap: false, tod: false, interim: false, ye: false };

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 py-1 border border-gray-300 font-bold text-gray-800">{item.name}</td>
                    <td className="px-2 py-1 border border-gray-300 text-right font-mono text-gray-600">{formatCurrency(item.endingBalance)}</td>
                    <td className="px-1 py-1 border border-gray-300 text-center font-bold">
                      <select className="w-full bg-transparent outline-none text-center cursor-pointer" value={data.mtm} onChange={e => handleAccChange(item.name, 'mtm', e.target.value)}>
                        <option value="M">M</option>
                        <option value="TM">TM</option>
                      </select>
                    </td>
                    <td className="px-1 py-1 border border-gray-300 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleAccChange(item.name, 'fraud', !data.fraud)}>
                      {data.fraud && <CheckCircle2 size={12} className="mx-auto text-red-600" />}
                    </td>
                    <td className="px-1 py-1 border border-gray-300 p-0">
                      <select className="w-full h-full bg-transparent outline-none text-center font-bold cursor-pointer" value={data.ir} onChange={e => handleAccChange(item.name, 'ir', e.target.value)}>
                        <option value="">-</option>
                        <option value="H" className="text-red-600">H</option>
                        <option value="M" className="text-amber-600">M</option>
                        <option value="L" className="text-green-600">L</option>
                      </select>
                    </td>
                    <td className="px-1 py-1 border border-gray-300 p-0">
                      <select className="w-full h-full bg-transparent outline-none text-center font-bold cursor-pointer" value={data.cr} onChange={e => handleAccChange(item.name, 'cr', e.target.value)}>
                        <option value="">-</option>
                        <option value="H" className="text-red-600">H</option>
                        <option value="M" className="text-amber-600">M</option>
                        <option value="L" className="text-green-600">L</option>
                      </select>
                    </td>
                    <td className="px-1 py-1 border border-gray-300 p-0 bg-yellow-50">
                      <div className="flex flex-col items-center justify-center h-full gap-1">
                        <select className="bg-transparent outline-none font-bold text-center cursor-pointer" value={data.romm} onChange={e => handleAccChange(item.name, 'romm', e.target.value)}>
                          <option value="">-</option>
                          <option value="H" className="text-red-600">H</option>
                          <option value="M" className="text-amber-600">M</option>
                          <option value="L" className="text-green-600">L</option>
                        </select>
                        <label className="flex items-center text-[8px] cursor-pointer" title="Significant Risk?">
                          <input type="checkbox" className="mr-1 w-2 h-2" checked={data.sigRisk} onChange={e => handleAccChange(item.name, 'sigRisk', e.target.checked)} />
                          Sig. Risk
                        </label>
                      </div>
                    </td>
                    <td className="px-1 py-1 border border-gray-300 p-0 bg-green-50">
                      <select className="w-full h-full bg-transparent outline-none text-center cursor-pointer" value={data.saldoTransaksi} onChange={e => handleAccChange(item.name, 'saldoTransaksi', e.target.value)}>
                        <option value="">-</option>
                        <option value="L">L</option>
                        <option value="M">M</option>
                        <option value="H">H</option>
                        <option value="Y">Y</option>
                      </select>
                    </td>
                    
                    {/* Asersi */}
                    <td className="px-1 py-1 border border-gray-300 text-center bg-green-50/50 cursor-pointer hover:bg-green-100" onClick={() => handleAccChange(item.name, 'c', !data.c)}>
                      {data.c && <CheckCircle2 size={10} className="mx-auto text-green-700" />}
                    </td>
                    <td className="px-1 py-1 border border-gray-300 text-center bg-green-50/50 cursor-pointer hover:bg-green-100" onClick={() => handleAccChange(item.name, 'e', !data.e)}>
                      {data.e && <CheckCircle2 size={10} className="mx-auto text-green-700" />}
                    </td>
                    <td className="px-1 py-1 border border-gray-300 text-center bg-green-50/50 cursor-pointer hover:bg-green-100" onClick={() => handleAccChange(item.name, 'a', !data.a)}>
                      {data.a && <CheckCircle2 size={10} className="mx-auto text-green-700" />}
                    </td>
                    <td className="px-1 py-1 border border-gray-300 text-center bg-green-50/50 cursor-pointer hover:bg-green-100" onClick={() => handleAccChange(item.name, 'v', !data.v)}>
                      {data.v && <CheckCircle2 size={10} className="mx-auto text-green-700" />}
                    </td>
                    <td className="px-1 py-1 border border-gray-300 text-center bg-green-50/50 cursor-pointer hover:bg-green-100" onClick={() => handleAccChange(item.name, 'p', !data.p)}>
                      {data.p && <CheckCircle2 size={10} className="mx-auto text-green-700" />}
                    </td>

                    {/* Planned Response */}
                    <td className="px-1 py-1 border border-gray-300 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleAccChange(item.name, 'toc', !data.toc)}>
                      {data.toc && <CheckCircle2 size={10} className="mx-auto text-gray-800" />}
                    </td>
                    <td className="px-1 py-1 border border-gray-300 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleAccChange(item.name, 'ap', !data.ap)}>
                      {data.ap && <CheckCircle2 size={10} className="mx-auto text-gray-800" />}
                    </td>
                    <td className="px-1 py-1 border border-gray-300 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleAccChange(item.name, 'tod', !data.tod)}>
                      {data.tod && <CheckCircle2 size={10} className="mx-auto text-gray-800" />}
                    </td>
                    <td className="px-1 py-1 border border-gray-300 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleAccChange(item.name, 'interim', !data.interim)}>
                      {data.interim && <CheckCircle2 size={10} className="mx-auto text-gray-800" />}
                    </td>
                    <td className="px-1 py-1 border border-gray-300 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleAccChange(item.name, 'ye', !data.ye)}>
                      {data.ye && <CheckCircle2 size={10} className="mx-auto text-gray-800" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Simpulan */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
          <span className="font-bold w-24">Simpulan</span>
          <input 
            type="text"
            className="flex-1 bg-green-100 border border-green-300 outline-none p-2 font-medium"
            value={simpulan}
            onChange={e => setSimpulan(e.target.value)}
            placeholder="Tuliskan simpulan..."
          />
        </div>

        <div className="w-32 border border-gray-400 mt-2 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center pt-6">
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan A.260
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A260;
