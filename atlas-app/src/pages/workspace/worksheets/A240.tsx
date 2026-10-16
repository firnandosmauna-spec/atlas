import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { AlertTriangle, CheckCircle2, Save, ArrowLeft } from 'lucide-react';

const A240 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  
  const [isSaved, setIsSaved] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // --- State untuk Tingkat Laporan Keuangan ---
  const [fsFactors, setFsFactors] = useState({
    fraud: false,
    internalControl: false,
    businessEnvironment: false,
    overrideManagement: false,
    other: false,
    otherText: ''
  });
  const [fsRiskLevel, setFsRiskLevel] = useState('');
  const [fsRiskDesc, setFsRiskDesc] = useState('');

  // State untuk Tingkat Akun
  const tb = engagement.trialBalance || [];

  // Inisialisasi state per baris akun
  const [accLevelData, setAccLevelData] = useState<{
    [key: string]: {
      ir1: boolean; ir2: boolean; ir3: boolean; ir4: boolean; ir5: boolean;
      sr1: boolean; sr2: boolean; sr3: boolean; sr4: boolean; sr5: boolean; sr6: boolean; sr7: string;
      likelihood: string; magnitude: string; keterangan: string;
    }
  }>({});

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Math.abs(val));

  const handleAccChange = (accountName: string, field: string, value: any) => {
    setAccLevelData(prev => ({
      ...prev,
      [accountName]: {
        ...(prev[accountName] || {
          ir1: false, ir2: false, ir3: false, ir4: false, ir5: false,
          sr1: false, sr2: false, sr3: false, sr4: false, sr5: false, sr6: false, sr7: '',
          likelihood: '', magnitude: '', keterangan: ''
        }),
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    // Evaluasi completion (sederhana: jika level laporan keuangan diisi)
    if (fsRiskLevel !== '' && fsRiskDesc !== '') {
      setIsCompleted(true);
    }
  };

  // Kalkulasi Otomatis Tingkat Akun
  const calculateIR = (likelihood: string, magnitude: string) => {
    if (!likelihood || !magnitude) return '';
    if (likelihood === 'H' && magnitude === 'H') return 'H';
    if (likelihood === 'L' && magnitude === 'L') return 'L';
    return 'M';
  };

  const isSignificantRisk = (accData: any) => {
    if (!accData) return false;
    const isHighHigh = accData.likelihood === 'H' && accData.magnitude === 'H';
    const hasSrFactor = accData.sr1 || accData.sr2 || accData.sr3 || accData.sr4 || accData.sr5 || accData.sr6 || accData.sr7;
    return isHighHigh && hasSrFactor;
  };

  return (
    <WorksheetContainer
      code="A.240"
      name="Inherent Risk"
      purpose="Melakukan identifikasi risiko bawaan (inherent risk) pada tingkat laporan keuangan dan tingkat akun."
      status={isCompleted ? "Completed" : "In Progress"}
      reviewer={engagement.partnerName || "Menunggu Reviewer"}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6">
        
        {/* Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed m-0">
            Kertas kerja ini digunakan untuk melakukan identifikasi risiko bawaan (inherent risk) klien. Risiko bawaan diidentifikasi dan dinilai pada <b>tingkat laporan keuangan</b> dan pada <b>tingkat akun</b>.
          </p>
        </div>

        {/* 1. Tingkat Laporan Keuangan */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-800 m-0">1. Tingkat Laporan Keuangan</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-xs text-left border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th colSpan={2} className="bg-black text-white px-2 py-1.5 font-bold text-center border border-gray-400">FINANCIAL STATEMENT LEVEL</th>
                  <th colSpan={2} className="bg-red-50 text-red-700 px-2 py-1.5 font-bold text-center border border-red-300 uppercase">OVERALL RISK ASSESSMENT</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1.5 font-bold text-gray-700 border border-gray-300 text-center w-24">Level</th>
                  <th className="px-2 py-1.5 font-bold text-gray-700 border border-gray-300 text-center">Faktor Penyebab Yang Menjadi Pertimbangan</th>
                  <th className="px-2 py-1.5 font-bold text-red-700 border border-red-300 text-center w-40">Risk Material Misstatement (H/M/L)</th>
                  <th className="px-2 py-1.5 font-bold text-red-700 border border-red-300 text-center w-64">Description Risk Material Misstatement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 border border-gray-300 bg-gray-50 text-center font-medium" rowSpan={5}>
                    Financial Statement Level
                  </td>
                  <td className="px-2 py-1 border border-gray-300 bg-yellow-100 hover:bg-yellow-200 transition-colors">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2" checked={fsFactors.fraud} onChange={(e) => setFsFactors({...fsFactors, fraud: e.target.checked})} />
                      Faktor kecurangan yang teridentifikasi (lihat A230.8)
                    </label>
                  </td>
                  <td className="px-2 py-2 border border-red-300 bg-orange-50" rowSpan={5}>
                    <select 
                      className="w-full border border-gray-300 p-1 rounded outline-none focus:border-red-500 font-bold text-center"
                      value={fsRiskLevel} onChange={(e) => setFsRiskLevel(e.target.value)}
                    >
                      <option value="">-</option>
                      <option value="H" className="text-red-600 font-bold">High (H)</option>
                      <option value="M" className="text-amber-600 font-bold">Medium (M)</option>
                      <option value="L" className="text-green-600 font-bold">Low (L)</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 border border-red-300 bg-orange-50" rowSpan={5}>
                    <textarea 
                      className="w-full h-full min-h-[120px] border border-gray-300 p-2 rounded outline-none focus:border-red-500 text-xs resize-none"
                      placeholder="Jelaskan rasionalisasi tingkat risiko laporan keuangan secara menyeluruh..."
                      value={fsRiskDesc} onChange={(e) => setFsRiskDesc(e.target.value)}
                    ></textarea>
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-1 border border-gray-300 bg-cyan-100 hover:bg-cyan-200 transition-colors">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2" checked={fsFactors.internalControl} onChange={(e) => setFsFactors({...fsFactors, internalControl: e.target.checked})} />
                      Faktor pengendalian internal yang kurang memadai (lihat A230)
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-1 border border-gray-300 bg-yellow-100 hover:bg-yellow-200 transition-colors">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2" checked={fsFactors.businessEnvironment} onChange={(e) => setFsFactors({...fsFactors, businessEnvironment: e.target.checked})} />
                      Faktor perubahan lingkungan bisnis yang signifikan (lihat A230)
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-1 border border-gray-300 bg-cyan-100 hover:bg-cyan-200 transition-colors">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2" checked={fsFactors.overrideManagement} onChange={(e) => setFsFactors({...fsFactors, overrideManagement: e.target.checked})} />
                      Faktor adanya override management (lihat A230.7)
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-1 border border-gray-300 bg-yellow-100 hover:bg-yellow-200 transition-colors flex items-center">
                    <label className="flex items-center cursor-pointer whitespace-nowrap">
                      <input type="checkbox" className="mr-2" checked={fsFactors.other} onChange={(e) => setFsFactors({...fsFactors, other: e.target.checked})} />
                      Faktor Lainnya
                    </label>
                    <input 
                      type="text" 
                      className="ml-2 flex-1 border-b border-gray-400 bg-transparent text-xs outline-none focus:border-black px-1 disabled:opacity-50" 
                      disabled={!fsFactors.other}
                      value={fsFactors.otherText} onChange={(e) => setFsFactors({...fsFactors, otherText: e.target.value})}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Tingkat Akun */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-800 m-0">2. Tingkat Akun</h2>
            <span className="text-[10px] text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">Geser tabel ke kanan untuk melihat seluruh kolom</span>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-max text-[10px] text-left border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th colSpan={17} className="bg-red-700 text-white px-2 py-1 font-bold text-center border border-red-800">ACCOUNT LEVEL</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="px-2 py-2 border border-gray-300 text-center align-middle font-bold" rowSpan={2} style={{minWidth: '200px'}}>Laporan Keuangan (Nama Akun)</th>
                  <th className="px-2 py-2 border border-gray-300 text-center align-middle font-bold" rowSpan={2} style={{minWidth: '100px'}}>Saldo Rp</th>
                  <th className="px-2 py-1 border border-gray-300 text-center font-bold bg-cyan-100 text-cyan-900" colSpan={5}>Mengidentifikasi Risiko Bawaan (IR)</th>
                  <th className="px-2 py-1 border border-gray-300 text-center font-bold bg-blue-100 text-blue-900" colSpan={7}>Apakah Merupakan Risiko Signifikan?</th>
                  <th className="px-2 py-2 border border-gray-300 text-center align-middle font-bold bg-yellow-100 w-16" rowSpan={2}>Likelihood (H/L)</th>
                  <th className="px-2 py-2 border border-gray-300 text-center align-middle font-bold bg-yellow-100 w-16" rowSpan={2}>Magnitude (H/L)</th>
                  <th className="px-2 py-2 border border-gray-300 text-center align-middle font-bold text-red-600 bg-red-50 w-16" rowSpan={2}>IR (H/M/L)</th>
                  <th className="px-2 py-2 border border-gray-300 text-center align-middle font-bold bg-slate-200" rowSpan={2}>Termasuk Risiko Signifikan (Otomatis)</th>
                  <th className="px-2 py-2 border border-gray-300 text-center align-middle font-bold" rowSpan={2} style={{minWidth: '200px'}}>Keterangan / Pertimbangan</th>
                </tr>
                {/* Kolom Checklist */}
                <tr className="bg-gray-50 text-[9px] text-center font-medium leading-tight">
                  <th className="px-1 py-1 border border-gray-300 bg-cyan-50 w-16">Transaksi Sering Terjadi</th>
                  <th className="px-1 py-1 border border-gray-300 bg-cyan-50 w-16">Salah saji dikoreksi thn lalu</th>
                  <th className="px-1 py-1 border border-gray-300 bg-cyan-50 w-16">Rentan prbhn lkngn bisnis</th>
                  <th className="px-1 py-1 border border-gray-300 bg-cyan-50 w-16">Ada kontijensi teridentifikasi</th>
                  <th className="px-1 py-1 border border-gray-300 bg-cyan-50 w-16">Berdampak pd kerugian</th>
                  
                  <th className="px-1 py-1 border border-gray-300 bg-blue-50 w-16">Perhatian Khusus</th>
                  <th className="px-1 py-1 border border-gray-300 bg-blue-50 w-16">Rumit/ Kompleks</th>
                  <th className="px-1 py-1 border border-gray-300 bg-blue-50 w-16">Signifikan dgn pihak berelasi</th>
                  <th className="px-1 py-1 border border-gray-300 bg-blue-50 w-16">Diukur dgn Estimasi</th>
                  <th className="px-1 py-1 border border-gray-300 bg-blue-50 w-16">Signifikan tidak rutin</th>
                  <th className="px-1 py-1 border border-gray-300 bg-blue-50 w-16">Rentan Fraud Risk</th>
                  <th className="px-1 py-1 border border-gray-300 bg-blue-50 w-24">Faktor Risiko Signifikan Lain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tb.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="px-4 py-8 text-center text-sm text-gray-500 bg-gray-50">
                      Belum ada data akun Trial Balance pada perikatan ini. Silakan input akun di menu Trial Balance terlebih dahulu.
                    </td>
                  </tr>
                ) : (
                  tb.map((item, idx) => {
                  const data = accLevelData[item.name] || {};
                  const calcIR = calculateIR(data.likelihood, data.magnitude);
                  const isSig = isSignificantRisk(data);

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-2 py-1.5 border border-gray-300 font-bold text-gray-800 truncate" title={item.name}>{item.name}</td>
                      <td className="px-2 py-1.5 border border-gray-300 text-right font-mono text-gray-600">{formatCurrency(item.endingBalance)}</td>
                      
                      {/* IR factors */}
                      <td className="px-1 py-1 border border-gray-300 text-center bg-cyan-50/30 hover:bg-cyan-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'ir1', !data.ir1)}>
                        {data.ir1 && <CheckCircle2 size={12} className="mx-auto text-cyan-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-cyan-50/30 hover:bg-cyan-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'ir2', !data.ir2)}>
                        {data.ir2 && <CheckCircle2 size={12} className="mx-auto text-cyan-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-cyan-50/30 hover:bg-cyan-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'ir3', !data.ir3)}>
                        {data.ir3 && <CheckCircle2 size={12} className="mx-auto text-cyan-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-cyan-50/30 hover:bg-cyan-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'ir4', !data.ir4)}>
                        {data.ir4 && <CheckCircle2 size={12} className="mx-auto text-cyan-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-cyan-50/30 hover:bg-cyan-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'ir5', !data.ir5)}>
                        {data.ir5 && <CheckCircle2 size={12} className="mx-auto text-cyan-600" />}
                      </td>

                      {/* SR factors */}
                      <td className="px-1 py-1 border border-gray-300 text-center bg-blue-50/30 hover:bg-blue-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'sr1', !data.sr1)}>
                        {data.sr1 && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-blue-50/30 hover:bg-blue-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'sr2', !data.sr2)}>
                        {data.sr2 && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-blue-50/30 hover:bg-blue-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'sr3', !data.sr3)}>
                        {data.sr3 && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-blue-50/30 hover:bg-blue-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'sr4', !data.sr4)}>
                        {data.sr4 && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-blue-50/30 hover:bg-blue-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'sr5', !data.sr5)}>
                        {data.sr5 && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-blue-50/30 hover:bg-blue-100 cursor-pointer" onClick={() => handleAccChange(item.name, 'sr6', !data.sr6)}>
                        {data.sr6 && <CheckCircle2 size={12} className="mx-auto text-blue-600" />}
                      </td>
                      <td className="px-1 py-1 border border-gray-300 text-center bg-blue-50/30 p-0">
                        <input type="text" className="w-full h-full bg-transparent outline-none px-1 py-1 text-center" value={data.sr7 || ''} onChange={(e) => handleAccChange(item.name, 'sr7', e.target.value)} />
                      </td>

                      {/* Dropdowns H/L */}
                      <td className="px-1 py-1 border border-gray-300 bg-yellow-50/50 p-0">
                        <select className="w-full h-full bg-transparent outline-none font-bold text-center cursor-pointer appearance-none" value={data.likelihood || ''} onChange={(e) => handleAccChange(item.name, 'likelihood', e.target.value)}>
                          <option value="">-</option>
                          <option value="H" className="text-red-600">H</option>
                          <option value="L" className="text-green-600">L</option>
                        </select>
                      </td>
                      <td className="px-1 py-1 border border-gray-300 bg-yellow-50/50 p-0">
                        <select className="w-full h-full bg-transparent outline-none font-bold text-center cursor-pointer appearance-none" value={data.magnitude || ''} onChange={(e) => handleAccChange(item.name, 'magnitude', e.target.value)}>
                          <option value="">-</option>
                          <option value="H" className="text-red-600">H</option>
                          <option value="L" className="text-green-600">L</option>
                        </select>
                      </td>

                      {/* Auto Calcs */}
                      <td className={`px-1 py-1 border border-gray-300 text-center font-bold ${calcIR === 'H' ? 'bg-red-100 text-red-700' : calcIR === 'M' ? 'bg-amber-100 text-amber-700' : calcIR === 'L' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {calcIR || '-'}
                      </td>
                      <td className={`px-1 py-1 border border-gray-300 text-center font-bold ${isSig ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {isSig ? 'YA' : 'TIDAK'}
                      </td>

                      {/* Keterangan */}
                      <td className="px-1 py-1 border border-gray-300 bg-white p-0">
                        <textarea className="w-full h-full min-h-[30px] bg-transparent outline-none px-2 py-1 resize-none" placeholder="..." value={data.keterangan || ''} onChange={(e) => handleAccChange(item.name, 'keterangan', e.target.value)}></textarea>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-2">
          <button onClick={() => navigate(`/workspace/${engagement.id}`)} className="text-gray-500 text-sm font-bold hover:text-gray-800 px-3 py-1.5 flex items-center transition-colors">
            <ArrowLeft size={14} className="mr-1.5" /> Kembali ke Index
          </button>
          <button 
            onClick={handleSave} 
            className={`px-6 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center text-sm bg-atlas-blue text-white hover:bg-blue-800`}
          >
            {isSaved ? <CheckCircle2 size={16} className="mr-1.5" /> : <Save size={16} className="mr-1.5" />}
            {isSaved ? 'Tersimpan' : 'Simpan KKP A.240'}
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A240;
