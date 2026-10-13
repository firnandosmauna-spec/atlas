import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowRight } from 'lucide-react';

const A270 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [kesimpulanAkhir, setKesimpulanAkhir] = useState('');

  // Pilihan komunikasi
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="A.270"
      name="Komunikasi dengan TCWG dan SPI"
      purpose="Mengidentifikasi dan mengomunikasikan risk assessment kepada pihak yang tepat (TCWG dan SPI)."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Info Box */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p className="mb-2">Kertas kerja ini digunakan untuk mengidentifikasi dan mengomunikasikan kepada pihak yang tepat tentang <i>risk assessment</i> yang telah dilakukan oleh auditor dalam rangka pelaksanaan audit.</p>
          <p>Bentuk komunikasi pada tahapan ini akan bergantung pada struktur organisasi yang dimiliki oleh klien. Terdapat 2 jenis pilihan komunikasi yaitu:</p>
          <ol className="list-decimal list-inside ml-2 mt-1 font-medium">
            <li>Komunikasi dengan pihak yang bertanggung jawab atas tata kelola (TCWG)</li>
            <li>Komunikasi dengan Satuan Pengendalian Intern (SPI)</li>
          </ol>
        </div>

        {/* Master Control Table */}
        <div className="bg-white border border-gray-400 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cyan-100/50">
                <th className="px-3 py-2 border border-gray-400 font-bold text-gray-800 text-center w-12">No</th>
                <th className="px-3 py-2 border border-gray-400 font-bold text-gray-800">Bentuk Komunikasi</th>
                <th className="px-3 py-2 border border-gray-400 font-bold text-center w-32">Pilihan (Ya/Tidak)</th>
                <th className="px-3 py-2 border border-gray-400 font-bold text-center w-64">Kertas Kerja Pendukung</th>
              </tr>
            </thead>
            <tbody>
              {/* Pertanyaan 1 */}
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-3 border border-gray-400 text-center font-bold">1</td>
                <td className="px-3 py-3 border border-gray-400 font-medium">Komunikasi dengan pihak yang bertanggung jawab atas tata kelola</td>
                <td className="px-0 py-0 border border-gray-400 bg-yellow-50 text-center">
                  <select 
                    className="w-full h-full min-h-[44px] bg-transparent outline-none font-bold text-center cursor-pointer"
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="Ya">Ya</option>
                    <option value="Tidak">Tidak</option>
                  </select>
                </td>
                <td className="px-3 py-3 border border-gray-400 align-middle">
                  {q1 === 'Ya' ? (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-atlas-blue text-[10px]">A.270.1 Ceklist Komunikasi TCWG</span>
                      <button 
                        onClick={() => navigate(`/workspace/${engagement.id}/worksheet/a2701`)}
                        className="bg-atlas-blue text-white p-1 rounded hover:bg-blue-800"
                        title="Buka Kertas Kerja A.270.1"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-[10px]">- KKP Pendukung Tidak Aktif -</span>
                  )}
                </td>
              </tr>
              
              {/* Pertanyaan 2 */}
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-3 border border-gray-400 text-center font-bold">2</td>
                <td className="px-3 py-3 border border-gray-400 font-medium">Komunikasi dengan Satuan Pengendalian Intern (Internal Auditor)</td>
                <td className="px-0 py-0 border border-gray-400 bg-yellow-50 text-center">
                  <select 
                    className="w-full h-full min-h-[44px] bg-transparent outline-none font-bold text-center cursor-pointer"
                    value={q2}
                    onChange={(e) => setQ2(e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="Ya">Ya</option>
                    <option value="Tidak">Tidak</option>
                  </select>
                </td>
                <td className="px-3 py-3 border border-gray-400 align-middle">
                  {q2 === 'Ya' ? (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-atlas-blue text-[10px]">A.270.2 Ceklist Penggunaan Hasil SPI</span>
                      <button 
                        onClick={() => navigate(`/workspace/${engagement.id}/worksheet/a2702`)}
                        className="bg-atlas-blue text-white p-1 rounded hover:bg-blue-800"
                        title="Buka Kertas Kerja A.270.2"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-[10px]">- KKP Pendukung Tidak Aktif -</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Final Conclusion Box */}
        <div className="bg-white border border-gray-400 overflow-hidden shadow-sm mt-8">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-400">
            <h3 className="font-bold text-gray-800 italic">Kesimpulan dan Status KKP</h3>
          </div>
          <div className="p-0 bg-yellow-100/50">
            <textarea
              className="w-full bg-transparent outline-none p-4 resize-none min-h-[120px] text-gray-800 font-medium"
              placeholder="Tulis kesimpulan manual mengenai komunikasi dengan pihak TCWG dan SPI berdasarkan analisis kertas kerja pendukung..."
              value={kesimpulanAkhir}
              onChange={e => setKesimpulanAkhir(e.target.value)}
            />
          </div>
        </div>

        <div className="w-32 border border-gray-400 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors text-xs"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan KKP A.270
          </button>
        </div>
      </div>
    </WorksheetContainer>
  );
};

export default A270;
