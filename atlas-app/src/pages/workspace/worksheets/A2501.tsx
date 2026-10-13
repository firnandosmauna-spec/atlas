import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft } from 'lucide-react';

const components = [
  { id: '1', title: 'Lingkungan Pengendalian', sub: [
    'Komunikasi dan penegakan integritas dan nilai etika',
    'Komitmen terhadap kompetensi',
    'Partisipasi oleh pihak yang bertanggungjawab atas tata kelola',
    'Filosofi dan gaya operasi manajemen',
    'Struktur organisasi',
    'Pemberian wewenang dan tanggung jawab',
    'Kebijakan dan praktik sumber daya manusia'
  ]},
  { id: '2', title: 'Proses Penilaian Risiko', sub: [] },
  { id: '3', title: 'Aktivitas Pengendalian', sub: [] },
  { id: '4', title: 'Informasi dan Komunikasi', sub: [] },
  { id: '5', title: 'Pemantauan atas Pengendalian', sub: [] }
];

const A2501 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  
  const [data, setData] = useState<any>({});
  const [deficiency, setDeficiency] = useState('');
  const [deficiencyConclusion, setDeficiencyConclusion] = useState('');
  
  const handleDataChange = (id: string, subIdx: number, field: string, value: string) => {
    const key = `${id}-${subIdx}`;
    setData({ ...data, [key]: { ...data[key], [field]: value } });
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="A.250.1"
      name="Control Risk - Entity Level"
      purpose="Menilai efektivitas pengendalian internal tingkat entitas menggunakan kerangka COSO (5 komponen)."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Lampiran Header */}
        <div className="bg-white border border-red-300 p-2">
          <span className="text-red-700 font-bold italic block mb-1">LAMPIRAN KERTAS KERJA</span>
          <textarea 
            className="w-full bg-transparent outline-none resize-none border-b border-gray-200 focus:border-red-500 h-16 text-gray-800"
            placeholder="Tulis/lampirkan detail tambahan di sini..."
          />
        </div>

        {/* Title Bar */}
        <div className="bg-black text-white text-center py-1.5 font-bold uppercase tracking-widest text-[11px]">
          ENTITY LEVEL
        </div>
        
        <div className="flex justify-end">
          <button className="bg-black text-yellow-400 font-bold px-4 py-1.5 text-[10px] uppercase border border-black hover:bg-gray-800">
            EVALUASI PEMAHAMAN PENGENDALIAN
          </button>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto border border-gray-400">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 border border-gray-400 text-red-700 font-bold text-center w-1/3">KOMPONEN PENGENDALIAN INTERNAL</th>
                <th className="px-2 py-2 border border-gray-400 text-red-700 font-bold text-center w-1/4">KESIMPULAN EVALUASI PEMAHAMAN PENGENDALIAN</th>
                <th className="px-2 py-2 border border-gray-400 text-red-700 font-bold text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp, i) => (
                <React.Fragment key={comp.id}>
                  <tr>
                    <td className="px-2 py-1 border border-gray-400 font-medium align-top">
                      <div className="flex">
                        <span className="w-4">{comp.id}</span>
                        <span>{comp.title}</span>
                      </div>
                    </td>
                    <td className="px-0 py-0 border border-gray-400 align-top">
                      {comp.sub.length === 0 && (
                        <input 
                          type="text" 
                          className="w-full h-full min-h-[28px] bg-transparent outline-none px-2"
                          value={data[`${comp.id}-0`]?.eval || ''}
                          onChange={e => handleDataChange(comp.id, 0, 'eval', e.target.value)}
                        />
                      )}
                    </td>
                    <td className="px-0 py-0 border border-gray-400 align-top bg-yellow-100/50">
                       {comp.sub.length === 0 && (
                        <textarea 
                          className="w-full h-full min-h-[28px] bg-yellow-100 outline-none px-2 py-1 resize-none"
                          value={data[`${comp.id}-0`]?.ket || ''}
                          onChange={e => handleDataChange(comp.id, 0, 'ket', e.target.value)}
                        />
                      )}
                    </td>
                  </tr>
                  {comp.sub.map((subItem, idx) => (
                    <tr key={`${comp.id}-${idx}`}>
                      <td className="px-2 py-1 border border-gray-400 pl-6 text-gray-700 align-top">
                        {subItem}
                      </td>
                      <td className="px-0 py-0 border border-gray-400 align-top">
                        <input 
                          type="text" 
                          className="w-full h-full min-h-[28px] bg-transparent outline-none px-2"
                          value={data[`${comp.id}-${idx+1}`]?.eval || ''}
                          onChange={e => handleDataChange(comp.id, idx+1, 'eval', e.target.value)}
                        />
                      </td>
                      <td className="px-0 py-0 border border-gray-400 align-top bg-yellow-100/50">
                        <textarea 
                          className="w-full h-full min-h-[28px] bg-yellow-100 outline-none px-2 py-1 resize-none"
                          value={data[`${comp.id}-${idx+1}`]?.ket || ''}
                          onChange={e => handleDataChange(comp.id, idx+1, 'ket', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Conclusion Sections */}
        <div className="mt-4 p-4 border border-red-500 bg-white space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="font-medium text-gray-800 flex-1">
              Apakah dari pemahaman diatas dapat teridentifikasi defisiensi dalam pengendalian internal ?
            </span>
            <select 
              className="w-full md:w-48 bg-green-100 border border-green-300 outline-none p-1.5 font-bold"
              value={deficiency}
              onChange={e => setDeficiency(e.target.value)}
            >
              <option value="">-</option>
              <option value="Ya">Ya</option>
              <option value="Tidak">Tidak</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-2">
          <span className="font-bold w-24">Simpulan</span>
          <input 
            type="text"
            className="flex-1 bg-green-100 border border-green-300 outline-none p-2"
            value={deficiencyConclusion}
            onChange={e => setDeficiencyConclusion(e.target.value)}
            placeholder="Simpulan otomatis/manual..."
          />
        </div>

        <div className="w-32 border border-gray-400 mt-4 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button onClick={() => navigate('/workspace/ENG-2025-DEMO/worksheet/a250')} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke A.250
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan A.250.1
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A2501;
