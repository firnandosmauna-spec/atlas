import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight, Database } from 'lucide-react';

const B120 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [simpulanAkhir, setSimpulanAkhir] = useState('');

  // TB data mapping
  const tb = engagement.trialBalance || [];

  const [mappingData, setMappingData] = useState<Record<string, { kesimpulan: string, keterangan: string }>>({});

  const handleUpdate = (accountName: string, field: string, value: string) => {
    setMappingData(prev => ({
      ...prev,
      [accountName]: {
        ...(prev[accountName] || { kesimpulan: '', keterangan: '' }),
        [field]: value
      }
    }));
  };

  const getIndex = (group: string) => {
    if (group === 'Aset') return 'A';
    if (group === 'Kewajiban') return 'C';
    if (group === 'Ekuitas') return 'E';
    if (group === 'Pendapatan') return 'PL1';
    if (group === 'Beban') return 'PL2';
    return 'X';
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="B.120"
      name="Mapping Prosedur dan Lead Schedule"
      purpose="Memetakan akun yang material/signifikan ke dalam Lead Schedule dan merangkum kesimpulannya."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Top Info Box */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p className="font-bold mb-1">Akun yang muncul adalah yang memenuhi 3 (tiga) kriteria, sebagai berikut:</p>
          <ul className="list-[lower-alpha] list-inside ml-2 mb-2">
            <li>Akun yang memiliki nilai Material dan Akun Signifikan (MS); atau</li>
            <li>Akun yang memiliki nilai Material dan Akun Tidak Signifikan (MTS); atau</li>
            <li>Akun yang memiliki nilai Tidak Material dan Akun Signifikan (TMS).</li>
          </ul>
          <p className="text-gray-600 italic">Daftar akun ini akan muncul secara otomatis berdasarkan penilaian pada tahapan risk assessment.</p>
        </div>

        {/* Main Table Area */}
        <div className="bg-white border border-red-800 overflow-hidden shadow-sm mt-4">
          <div className="bg-red-800 text-white font-bold py-1 px-4 text-xs uppercase tracking-widest flex justify-between items-center border-b border-red-950">
            <span>MAPPING PROSEDUR DAN LEAD SCHEDULE</span>
            
            <button className="bg-yellow-400 text-yellow-900 px-3 py-0.5 rounded shadow text-[10px] font-extrabold flex items-center hover:bg-yellow-300">
              <Database size={12} className="mr-1" /> BANK PROSEDUR
            </button>
          </div>
          
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-[#4d6b38] text-white">
                <th className="px-3 py-2 border border-gray-400 font-bold text-center w-64 align-middle" rowSpan={2}>Nama Akun</th>
                <th className="px-3 py-1 border border-gray-400 font-bold text-center" colSpan={3}>Link to Lead Schedule and Audit Procedure</th>
              </tr>
              <tr className="bg-green-100 text-gray-800">
                <th className="px-2 py-1 border border-gray-400 font-bold text-center w-24">Indeks</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center w-[30%]">Kesimpulan</th>
                <th className="px-2 py-1 border border-gray-400 font-bold text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {tb.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 bg-gray-50">
                    Belum ada data akun Trial Balance pada perikatan ini.
                  </td>
                </tr>
              ) : (
                tb.map((item, idx) => {
                  const data = mappingData[item.name] || { kesimpulan: '', keterangan: '' };
                  const indeks = getIndex(item.group);
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-1.5 border border-gray-400 font-bold text-gray-800">{idx + 1}. {item.name}</td>
                      
                      {/* Index / Link to Lead Schedule */}
                      <td className="px-2 py-1 border border-gray-400 text-center bg-cyan-100/50">
                        <Link 
                          to={`/workspace/${engagement.id}/worksheet/ls-${indeks.toLowerCase()}`} 
                          className="font-bold text-blue-700 underline flex items-center justify-center gap-1 hover:text-blue-900"
                          title={`Buka Lead Schedule ${indeks}`}
                        >
                          {indeks}
                        </Link>
                      </td>
                      
                      {/* Kesimpulan */}
                      <td className="px-0 py-0 border border-gray-400 bg-white">
                        <textarea 
                          className="w-full h-full min-h-[36px] bg-transparent outline-none p-1.5 text-red-700 font-medium resize-none leading-tight"
                          value={data.kesimpulan}
                          onChange={(e) => handleUpdate(item.name, 'kesimpulan', e.target.value)}
                          placeholder="..."
                        />
                      </td>
                      
                      {/* Keterangan */}
                      <td className="px-0 py-0 border border-gray-400 bg-white">
                        <textarea 
                          className="w-full h-full min-h-[36px] bg-transparent outline-none p-1.5 text-red-700 font-medium resize-none leading-tight"
                          value={data.keterangan}
                          onChange={(e) => handleUpdate(item.name, 'keterangan', e.target.value)}
                          placeholder="..."
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Simpulan */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-6">
          <span className="font-bold text-red-600 italic w-32">Kesimpulan CAJE/PAJE:</span>
          <textarea 
            className="flex-1 bg-yellow-100 border border-yellow-400 outline-none p-3 font-medium min-h-[60px] resize-none"
            value={simpulanAkhir}
            onChange={e => setSimpulanAkhir(e.target.value)}
            placeholder="Tuliskan kesimpulan akhir secara keseluruhan..."
          />
        </div>

        <div className="w-32 border border-gray-400 mt-2 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        {/* Action */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b100`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.100
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan B.120
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b130`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut B.130 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B120;
