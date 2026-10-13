import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

const C110 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Data State for the Matrix
  // In a real app, this might be fetched from A.210 and updated here.
  const [data, setData] = useState({
    audited: { acuanSaldo: 0, mkMargin: 0, mk: 0, mpMargin: 0, mp: 0, ambangMargin: 0, ambang: 0 },
    unaudited: { acuanSaldo: 0, mkMargin: 0, mk: 0, mpMargin: 0, mp: 0, ambangMargin: 0, ambang: 0 },
    interim: { acuanSaldo: 0, mkMargin: 0, mk: 0, mpMargin: 0, mp: 0, ambangMargin: 0, ambang: 0 }
  });

  const [kesimpulan, setKesimpulan] = useState('');

  const handleUpdate = (type: 'audited' | 'unaudited' | 'interim', field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: numValue
      }
    }));
  };

  const calculateSelisih = (field: keyof typeof data.audited) => {
    return data.audited[field] - data.unaudited[field];
  };

  const calculatePersen = (field: keyof typeof data.audited) => {
    if (data.unaudited[field] === 0) return 0;
    return (calculateSelisih(field) / data.unaudited[field]) * 100;
  };

  const formatNumber = (num: number) => {
    if (num === 0) return '-';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatPercent = (num: number) => {
    if (num === 0) return '0%';
    return `${num.toFixed(2)}%`;
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Status completed if there is any conclusion or if selisih is 0
  const isStatusCompleted = true; // In the manual, C110 is auto-calculated. Only needs filling if there's material diff. We'll default to Completed if no difference, else check kesimpulan.

  const hasMaterialDiff = calculateSelisih('mk') !== 0; // simplified check
  const status = (!hasMaterialDiff || kesimpulan !== '') ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="C.110"
      name="Penilaian Materialitas Final"
      purpose="Menganalisis materialitas pada tahap akhir audit setelah seluruh penyesuaian audit yang relevan di-posting."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini digunakan untuk menganalisis materialitas pada tahap akhir audit setelah seluruh penyesuaian audit yang relevan di-posting. Kertas kerja ini akan otomatis terisi ketika seluruh tahapan audit sebelumnya telah diselesaikan. Apabila terdapat perbedaan hasil antara materialitas audited dengan materialitas unaudited yang bersifat material, maka auditor harus memberikan penjelasan terkait perbedaan tersebut pada kolom <strong>"Kesimpulan atas adanya selisih penilaian kembali tingkat materialitas yang material"</strong>.</p>
        </div>

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: C.110</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Penilaian Materialitas Final</div>
            </div>
            
            <div className="w-32 border border-gray-400 mt-6 text-center bg-white">
              <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
              <div className={`font-bold py-1.5 text-[10px] ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
                {status}
              </div>
            </div>
          </div>

          <div className="w-full md:w-96 bg-white border border-gray-300 p-3 rounded shadow-sm text-[10px]">
             <div className="flex justify-between items-center mb-1">
               <span>Disiapkan oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" defaultValue={engagement.auditorName || "Auditor"} />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal mulai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
             <div className="flex justify-between items-center mb-1 pb-2 border-b border-gray-200">
               <span>Tanggal selesai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
             
             <div className="flex justify-between items-center mt-2 mb-1">
               <span>Direview oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" defaultValue={engagement.managerName || "Manager"} />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal mulai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal selesai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
          </div>
        </div>

        {/* Tabel Materialitas */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr>
                <th className="px-2 py-2 border border-gray-400 bg-white w-80"></th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center bg-cyan-300 text-cyan-900 w-32">AUDITED</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center bg-yellow-300 text-yellow-900 w-32">UNAUDITED</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center bg-red-500 text-white w-32">INTERIM</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center bg-gray-100 w-32">SELISIH (AUDITED VS UNAUDITED)</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center bg-gray-100 w-16">(%)</th>
              </tr>
            </thead>
            <tbody>
              {/* Materialitas Keseluruhan */}
              <tr>
                <td className="border border-gray-400 bg-gray-50 px-2 py-1 font-bold" colSpan={6}>Penentuan Materialitas Keseluruhan</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-white px-2 py-1 pl-4">Acuan saldo</td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.audited.acuanSaldo || ''} onChange={(e) => handleUpdate('audited', 'acuanSaldo', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.unaudited.acuanSaldo || ''} onChange={(e) => handleUpdate('unaudited', 'acuanSaldo', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.interim.acuanSaldo || ''} onChange={(e) => handleUpdate('interim', 'acuanSaldo', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatNumber(calculateSelisih('acuanSaldo'))}</td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatPercent(calculatePersen('acuanSaldo'))}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-white px-2 py-1 pl-4">Margin (%)</td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.audited.mkMargin || ''} onChange={(e) => handleUpdate('audited', 'mkMargin', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.unaudited.mkMargin || ''} onChange={(e) => handleUpdate('unaudited', 'mkMargin', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.interim.mkMargin || ''} onChange={(e) => handleUpdate('interim', 'mkMargin', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatNumber(calculateSelisih('mkMargin'))}</td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatPercent(calculatePersen('mkMargin'))}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-white px-2 py-1 pl-4 font-bold text-red-600">Materialitas keseluruhan</td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 font-bold outline-none bg-transparent" value={data.audited.mk || ''} onChange={(e) => handleUpdate('audited', 'mk', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 font-bold outline-none bg-transparent" value={data.unaudited.mk || ''} onChange={(e) => handleUpdate('unaudited', 'mk', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 font-bold outline-none bg-transparent" value={data.interim.mk || ''} onChange={(e) => handleUpdate('interim', 'mk', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1 font-bold">{formatNumber(calculateSelisih('mk'))}</td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1 font-bold">{formatPercent(calculatePersen('mk'))}</td>
              </tr>

              {/* Materialitas Pelaksanaan */}
              <tr>
                <td className="border border-gray-400 bg-gray-50 px-2 py-1 font-bold mt-2" colSpan={6}>Penentuan Materialitas Pelaksanaan</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-white px-2 py-1 pl-4">Margin (%) (umumnya 50% - 80% dari materialitas keseluruhan)</td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.audited.mpMargin || ''} onChange={(e) => handleUpdate('audited', 'mpMargin', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.unaudited.mpMargin || ''} onChange={(e) => handleUpdate('unaudited', 'mpMargin', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.interim.mpMargin || ''} onChange={(e) => handleUpdate('interim', 'mpMargin', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatNumber(calculateSelisih('mpMargin'))}</td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatPercent(calculatePersen('mpMargin'))}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-white px-2 py-1 pl-4">Materialitas pelaksanaan</td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.audited.mp || ''} onChange={(e) => handleUpdate('audited', 'mp', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.unaudited.mp || ''} onChange={(e) => handleUpdate('unaudited', 'mp', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.interim.mp || ''} onChange={(e) => handleUpdate('interim', 'mp', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatNumber(calculateSelisih('mp'))}</td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatPercent(calculatePersen('mp'))}</td>
              </tr>

              {/* Ambang Batas */}
              <tr>
                <td className="border border-gray-400 bg-gray-50 px-2 py-1 font-bold mt-2" colSpan={6}>Ambang Batas Nilai Yang Tidak Dikoreksi</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-white px-2 py-1 pl-4">Margin (%) (umumnya 3% - 5% dari materialitas pelaksanaan)</td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.audited.ambangMargin || ''} onChange={(e) => handleUpdate('audited', 'ambangMargin', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.unaudited.ambangMargin || ''} onChange={(e) => handleUpdate('unaudited', 'ambangMargin', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.interim.ambangMargin || ''} onChange={(e) => handleUpdate('interim', 'ambangMargin', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatNumber(calculateSelisih('ambangMargin'))}</td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatPercent(calculatePersen('ambangMargin'))}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-white px-2 py-1 pl-4">Nilai salah saji yang tidak dikoreksi</td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.audited.ambang || ''} onChange={(e) => handleUpdate('audited', 'ambang', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.unaudited.ambang || ''} onChange={(e) => handleUpdate('unaudited', 'ambang', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-orange-50/50 p-0">
                  <input type="number" className="w-full text-right p-1 outline-none bg-transparent" value={data.interim.ambang || ''} onChange={(e) => handleUpdate('interim', 'ambang', e.target.value)} />
                </td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatNumber(calculateSelisih('ambang'))}</td>
                <td className="border border-gray-400 bg-gray-100 text-right p-1">{formatPercent(calculatePersen('ambang'))}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="p-2 border-t border-gray-400 bg-gray-50">
            <label className="block text-red-600 font-bold mb-1 text-[10px] uppercase">Kesimpulan atas adanya selisih penilaian kembali tingkat materialitas yang material</label>
            <textarea 
              className="w-full bg-yellow-100 border border-yellow-400 outline-none p-2 resize-none min-h-[60px] text-[10px]"
              value={kesimpulan}
              onChange={(e) => setKesimpulan(e.target.value)}
              placeholder="Masukkan penjelasan jika terdapat selisih materialitas yang material..."
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b290`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.290
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.110
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c530`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.530 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C110;
