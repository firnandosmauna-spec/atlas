import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngagementStore } from '../store/engagementStore';
import type { Engagement } from '../store/engagementStore';
import { useAuthStore } from '../store/authStore';
import { Plus, MoreVertical, Copy, Archive, Edit2, FolderOpen, Search, Filter } from 'lucide-react';
import EngagementFormModal from '../components/EngagementFormModal';

const Engagements = () => {
  const { engagements, duplicateEngagement, archiveEngagement, openEngagement } = useEngagementStore();
  const { hasPermission } = useAuthStore();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState<Engagement | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const filteredEngagements = engagements.filter(eng => 
    eng.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    eng.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenWorkspace = (id: string) => {
    openEngagement(id);
    navigate(`/workspace/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Archived': return 'bg-slate-200 text-slate-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Manajemen Engagement</h1>
          <p className="text-xs sm:text-sm text-gray-500">Kelola seluruh perikatan audit, klien, dan tim dalam satu tempat.</p>
        </div>
        {hasPermission('create_engagement') && (
          <button 
            onClick={() => { setEditingEngagement(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto bg-atlas-blue hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center min-h-[44px]"
          >
            <Plus size={18} className="mr-2" /> Buat Engagement
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-gray-50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID atau Klien..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-atlas-blue focus:border-atlas-blue outline-none"
            />
          </div>
          <button className="flex items-center justify-center text-gray-600 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors min-h-[44px]">
            <Filter size={16} className="mr-2" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500 bg-white">
                <th className="px-6 py-4 font-semibold">Engagement ID / Klien</th>
                <th className="px-6 py-4 font-semibold">Tipe & Standar</th>
                <th className="px-6 py-4 font-semibold">Periode Audit</th>
                <th className="px-6 py-4 font-semibold">Tim (P/M/A)</th>
                <th className="px-6 py-4 font-semibold">Progress</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEngagements.map((eng) => (
                <tr key={eng.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleOpenWorkspace(eng.id)}
                      className="text-left block group"
                    >
                      <div className="font-bold text-gray-800 group-hover:text-atlas-blue group-hover:underline">{eng.id}</div>
                      <div className="text-sm text-gray-500 group-hover:text-gray-700">{eng.clientName}</div>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800 font-medium">{eng.engagementType}</div>
                    <div className="text-xs text-gray-500">{eng.accountingStandard}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>Tahun Buku: <span className="font-medium text-gray-800">{eng.fiscalYear}</span></div>
                    <div className="text-xs text-gray-400">{eng.auditPeriod}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 space-y-1">
                    <div><span className="font-bold text-gray-800">P:</span> {eng.partnerName}</div>
                    <div><span className="font-bold text-gray-800">M:</span> {eng.managerName}</div>
                    <div><span className="font-bold text-gray-800">A:</span> {eng.auditorName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${eng.progress === 100 ? 'bg-green-500' : 'bg-atlas-blue'}`} 
                          style={{ width: `${eng.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">{eng.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(eng.status)}`}>
                      {eng.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === eng.id ? null : eng.id)}
                      className="p-2 text-gray-400 hover:text-atlas-blue hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {/* Action Dropdown Menu */}
                    {openDropdownId === eng.id && (
                      <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden text-left">
                        <button 
                          onClick={() => { handleOpenWorkspace(eng.id); setOpenDropdownId(null); }}
                          className="w-full px-4 py-3 flex items-center space-x-2 hover:bg-gray-50 text-sm text-gray-700"
                        >
                          <FolderOpen size={16} className="text-blue-500" /> <span>Buka Workspace</span>
                        </button>
                        <button 
                          onClick={() => { setEditingEngagement(eng); setIsModalOpen(true); setOpenDropdownId(null); }}
                          className="w-full px-4 py-3 flex items-center space-x-2 hover:bg-gray-50 text-sm text-gray-700 border-t border-gray-100"
                        >
                          <Edit2 size={16} className="text-amber-500" /> <span>Edit Engagement</span>
                        </button>
                        <button 
                          onClick={() => { duplicateEngagement(eng.id); setOpenDropdownId(null); }}
                          className="w-full px-4 py-3 flex items-center space-x-2 hover:bg-gray-50 text-sm text-gray-700 border-t border-gray-100"
                        >
                          <Copy size={16} className="text-emerald-500" /> <span>Duplikat</span>
                        </button>
                        <button 
                          onClick={() => { archiveEngagement(eng.id); setOpenDropdownId(null); }}
                          className="w-full px-4 py-3 flex items-center space-x-2 hover:bg-red-50 text-sm text-red-600 border-t border-gray-100"
                        >
                          <Archive size={16} /> <span>Arsipkan</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredEngagements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada engagement yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EngagementFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingEngagement} 
        />
      )}
    </div>
  );
};

export default Engagements;
