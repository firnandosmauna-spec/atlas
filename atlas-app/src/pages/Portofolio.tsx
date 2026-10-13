import { useEngagementStore } from '../store/engagementStore';
import { Briefcase, Building2, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Portofolio = () => {
  const { engagements } = useEngagementStore();

  // Statistics
  const totalKlien = new Set(engagements.map(e => e.clientName)).size;
  const totalPerikatan = engagements.length;
  const selesai = engagements.filter(e => e.status === 'Completed' || e.progress === 100).length;
  const aktif = totalPerikatan - selesai;

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-4 border-b border-gray-200 gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Portofolio Klien & Perikatan</h1>
          <p className="text-xs text-gray-600 mt-0.5">Ringkasan seluruh aktivitas perikatan KAP Anda.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-3 border border-gray-200 flex items-center gap-3">
          <div className="bg-blue-50 p-2.5">
            <Building2 className="text-blue-700" size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Klien</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{totalKlien}</p>
          </div>
        </div>

        <div className="bg-white p-3 border border-gray-200 flex items-center gap-3">
          <div className="bg-gray-50 p-2.5">
            <Briefcase className="text-gray-700" size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Perikatan</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{totalPerikatan}</p>
          </div>
        </div>

        <div className="bg-white p-3 border border-gray-200 flex items-center gap-3">
          <div className="bg-amber-50 p-2.5">
            <Clock className="text-amber-700" size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sedang Berjalan</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{aktif}</p>
          </div>
        </div>

        <div className="bg-white p-3 border border-gray-200 flex items-center gap-3">
          <div className="bg-emerald-50 p-2.5">
            <CheckCircle className="text-emerald-700" size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Selesai</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{selesai}</p>
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white border border-gray-200 flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <FileText size={14} className="text-gray-700" />
          <h2 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Rincian Portofolio</h2>
        </div>
        
        {engagements.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Belum ada data perikatan.
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_rgba(229,231,235,1)]">
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-bold">Klien</th>
                  <th className="px-4 py-2.5 font-bold">Kode Perikatan</th>
                  <th className="px-4 py-2.5 font-bold">Tahun Buku</th>
                  <th className="px-4 py-2.5 font-bold">Jenis Perikatan</th>
                  <th className="px-4 py-2.5 font-bold">Standar Akuntansi</th>
                  <th className="px-4 py-2.5 font-bold">Tim</th>
                  <th className="px-4 py-2.5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px]">
                {engagements.map((eng) => (
                  <tr key={eng.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{eng.clientName}</td>
                    <td className="px-4 py-2.5 text-gray-600 font-mono text-[11px]">{eng.id}</td>
                    <td className="px-4 py-2.5 text-gray-700">{eng.fiscalYear}</td>
                    <td className="px-4 py-2.5 text-gray-700">{eng.engagementType}</td>
                    <td className="px-4 py-2.5 text-gray-700">{eng.accountingStandard}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <span className="text-gray-900"><span className="text-gray-400 font-medium">P:</span> {eng.partnerName || '-'}</span>
                        <span className="text-gray-900"><span className="text-gray-400 font-medium">M:</span> {eng.managerName || '-'}</span>
                        <span className="text-gray-900"><span className="text-gray-400 font-medium">S:</span> {eng.auditorName || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right align-middle">
                      <div className="flex flex-col items-end justify-center gap-1.5 h-full">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider inline-block ${
                          eng.status === 'Completed' || eng.progress === 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {eng.progress === 100 ? 'Completed' : (eng.status || 'Active')}
                        </span>
                        <div className="w-20 bg-gray-200 h-1">
                        <div 
                          className={`h-1 ${eng.progress === 100 ? 'bg-emerald-500' : 'bg-atlas-blue'}`}
                          style={{ width: `${eng.progress}%` }}
                        />
                      </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portofolio;
