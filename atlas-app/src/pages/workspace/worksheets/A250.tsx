import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { ArrowRight, Save, CheckCircle2 } from 'lucide-react';

const A250 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [kesimpulanAkhir, setKesimpulanAkhir] = useState('');

  const cycles = [
    { id: 'A.250.1', title: 'Entity Level', conclusion: 'Belum Dinilai' },
    { id: 'A.250.2', title: 'Uraian Siklus Penjualan, Piutang Usaha, dan Penerimaan', conclusion: 'Belum Dinilai' },
    { id: 'A.250.3', title: 'Uraian Siklus Pembelian Persediaan, Hutang, dan Pengeluaran', conclusion: 'Belum Dinilai' },
    { id: 'A.250.4', title: 'Uraian Penyimpanan dan Pengendalian Kas', conclusion: 'Belum Dinilai' },
  ];

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="A.250"
      name="Control Risk"
      purpose="Identifikasi risiko pengendalian (control risk) dari klien pada tingkat laporan keuangan dan akun."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-4 text-xs">
        {/* Title Banner */}
        <div className="bg-atlas-blue text-white text-center py-2 font-bold uppercase tracking-wider text-sm rounded shadow-sm">
          CONTROL RISK
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-full">
          {/* Left Info Panel */}
          <div className="bg-cyan-50 p-4 border border-cyan-100 rounded-lg flex-1 flex flex-col space-y-2 font-medium">
            <div className="flex items-center justify-between border-b border-cyan-200 pb-1">
              <span className="text-gray-600">Nama Klien</span>
              <span className="text-gray-900">{engagement.clientName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-cyan-200 pb-1">
              <span className="text-gray-600">Jenis Usaha</span>
              <span className="text-gray-900">{engagement.businessSector || engagement.industry || '-'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-cyan-200 pb-1">
              <span className="text-gray-600">Periode Berakhir</span>
              <span className="text-gray-900">{engagement.period || new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-cyan-200 pb-1">
              <span className="text-gray-600">Standar Akuntansi</span>
              <span className="text-gray-900">{engagement.accountingStandard || engagement.standard || 'SAK Umum'}</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-gray-600">Status KKP</span>
              <span className="text-red-500 font-bold">Incompleted</span>
            </div>
          </div>

          {/* Right Sub-Worksheets Conclusions */}
          <div className="bg-cyan-50 p-4 border border-cyan-100 rounded-lg flex-[2]">
            <h3 className="font-bold text-red-600 mb-2 text-center">Kesimpulan Sub Kertas Kerja</h3>
            <table className="w-full text-[10px] text-left border-collapse border border-cyan-300 bg-white">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="px-2 py-1 border border-cyan-300 w-16">Indeks</th>
                  <th className="px-2 py-1 border border-cyan-300">Deskripsi Siklus / Level</th>
                  <th className="px-2 py-1 border border-cyan-300 w-32">Kesimpulan</th>
                  <th className="px-2 py-1 border border-cyan-300 w-12 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-200">
                {cycles.map(cycle => (
                  <tr key={cycle.id} className="hover:bg-cyan-50">
                    <td className="px-2 py-1.5 border border-cyan-300 font-bold text-atlas-blue">{cycle.id}</td>
                    <td className="px-2 py-1.5 border border-cyan-300 text-gray-800">{cycle.title}</td>
                    <td className="px-2 py-1.5 border border-cyan-300 text-gray-600 font-medium">{cycle.conclusion}</td>
                    <td className="px-2 py-1.5 border border-cyan-300 text-center">
                      <button 
                        onClick={() => navigate(`/workspace/${engagement.id}/worksheet/${cycle.id.replace(/\./g, '').toLowerCase()}`)}
                        className="text-white bg-atlas-blue hover:bg-blue-800 rounded px-2 py-0.5"
                        title="Buka Kertas Kerja"
                      >
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final Conclusion Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg overflow-hidden">
          <div className="bg-cyan-100 px-4 py-2 border-b border-cyan-200">
            <h3 className="font-bold text-red-600 italic">Kesimpulan dan Status KKP</h3>
          </div>
          <div className="p-4 bg-yellow-50/50">
            <textarea
              className="w-full bg-yellow-100 border border-yellow-300 outline-none p-3 resize-none min-h-[100px] text-gray-800 focus:border-yellow-500 rounded"
              placeholder="Tulis kesimpulan manual mengenai kemungkinan salah saji material berdasarkan analisis kertas kerja A.250.1 s.d. A.250.12..."
              value={kesimpulanAkhir}
              onChange={e => setKesimpulanAkhir(e.target.value)}
            />
            <p className="text-[9px] text-red-500 mt-1 italic">
              *Telah mencakup kemungkinan salah saji material berdasakan analisis dari A.250.1 s.d A.250.12
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors text-xs"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan KKP A.250
          </button>
        </div>
      </div>
    </WorksheetContainer>
  );
};

export default A250;
