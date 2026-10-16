import React, { useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2 } from 'lucide-react';

const B100 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [kesimpulanLead, setKesimpulanLead] = useState('');
  const [kesimpulanCaje, setKesimpulanCaje] = useState('');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const menuItems = [
    { no: '1.', title: 'Worksheet Trial Balance', index: 'B.110', path: 'b110' },
    { no: '2.', title: 'Mapping Prosedur dan Lead Schedule', index: 'B.120', path: 'b120' },
    { no: '3.', title: 'CAJE/PAJE', index: 'B.130', path: 'b130' },
    { no: '4.', title: 'Neraca dan Laporan Laba Rugi - Audited', index: 'B.140', path: 'b140' }
  ];

  return (
    <WorksheetContainer
      code="B.100"
      name="Worksheet"
      purpose="Menu utama pengolahan angka laporan keuangan dan kesimpulan gabungan audit."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Info Box */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini akan digunakan sebagai media informasi pengolahan angka laporan keuangan berupa informasi saldo awal, jurnal penyesuaian, serta angka final laporan keuangan setelah diaudit.</p>
        </div>

        {/* Menu Board (menyerupai Gambar 42) */}
        <div className="bg-cyan-100/30 border border-cyan-400 p-6 rounded shadow-sm">
          <h2 className="text-center font-bold text-lg mb-6 tracking-widest text-gray-800">WORKSHEET</h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Kiri: Info Klien */}
            <div className="flex-1 max-w-sm">
              <div className="grid grid-cols-[150px_auto] gap-y-2 text-xs font-bold text-gray-700">
                <div className="text-red-700">Nama Klien *</div>
                <div className="text-gray-900 bg-white border border-gray-300 px-2 py-1">: {engagement.clientName}</div>
                
                <div className="text-red-700">Jenis usaha *</div>
                <div className="text-gray-900 bg-white border border-gray-300 px-2 py-1">: {engagement.businessSector || 'Perdagangan'}</div>
                
                <div className="text-red-700">Periode Interim Berjalan *</div>
                <div className="text-gray-900 bg-white border border-gray-300 px-2 py-1">: -</div>
                
                <div className="text-red-700">Periode Berjalan *</div>
                <div className="text-gray-900 bg-white border border-gray-300 px-2 py-1">: {engagement.period || new Date().getFullYear()}</div>
                
                <div className="text-red-700">Periode Pembanding *</div>
                <div className="text-gray-900 bg-white border border-gray-300 px-2 py-1">: {parseInt(engagement.period) ? parseInt(engagement.period) - 1 : (new Date().getFullYear() - 1)}</div>
                
                <div className="text-red-700">SAK yang digunakan *</div>
                <div className="text-gray-900 bg-white border border-gray-300 px-2 py-1">: {engagement.accountingStandard || 'SAK Umum'}</div>
                
                <div className="text-red-700">Aktivitas *</div>
                <div className="text-gray-900 bg-white border border-gray-300 px-2 py-1">: Audit</div>
              </div>
              <div className="mt-4 text-[10px] text-gray-500">* otomatis</div>
            </div>

            {/* Kanan: Daftar Indeks */}
            <div className="flex-1">
              <div className="flex justify-end text-red-600 font-bold mb-2">Indeks</div>
              <div className="space-y-2 text-sm font-medium text-gray-700">
                {menuItems.map(item => (
                  <div key={item.index} className="flex justify-between items-center group">
                    <span className="w-8">{item.no}</span>
                    <span className="flex-1">{item.title}</span>
                    <Link to={`/workspace/${engagement.id}/worksheet/${item.path}`} className="text-teal-600 underline hover:text-teal-800 transition-colors">
                      {item.index}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text Areas */}
          <div className="mt-10 space-y-6">
            <div>
              <label className="block text-red-600 font-bold italic mb-2 text-sm">Kesimpulan Mapping Lead Schedule</label>
              <textarea 
                className="w-full h-32 border border-gray-300 rounded shadow-inner p-3 outline-none focus:border-cyan-500 resize-none font-medium text-gray-800 bg-white"
                value={kesimpulanLead}
                onChange={(e) => setKesimpulanLead(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-red-600 font-bold italic mb-2 text-sm">Kesimpulan CAJE/PAJE</label>
              <textarea 
                className="w-full h-32 border border-gray-300 rounded shadow-inner p-3 outline-none focus:border-cyan-500 resize-none font-medium text-gray-800 bg-white"
                value={kesimpulanCaje}
                onChange={(e) => setKesimpulanCaje(e.target.value)}
              />
            </div>
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
            Simpan KKP B.100
          </button>
        </div>
      </div>
    </WorksheetContainer>
  );
};

export default B100;
