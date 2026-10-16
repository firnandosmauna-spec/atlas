import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngagementStore } from '../store/engagementStore';
import type { Engagement } from '../store/engagementStore';
import { useAuthStore } from '../store/authStore';
import { Plus, MoreVertical, Copy, Archive, Edit2, FolderOpen, Search, Filter, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import EngagementFormModal from '../components/EngagementFormModal';

const Engagements = () => {
  const { engagements, duplicateEngagement, archiveEngagement, deleteEngagement, openEngagement } = useEngagementStore();
  const { hasPermission } = useAuthStore();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState<Engagement | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [engagementToDelete, setEngagementToDelete] = useState<Engagement | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Close menus & modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (engagementToDelete) setEngagementToDelete(null);
        if (openDropdownId) setOpenDropdownId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engagementToDelete, openDropdownId]);

  const confirmDelete = () => {
    if (!engagementToDelete) return;
    const clientName = engagementToDelete.clientName;
    const engId = engagementToDelete.id;
    deleteEngagement(engId);
    setEngagementToDelete(null);
    setSuccessToast(`Perikatan ${engId} (${clientName}) berhasil dihapus.`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

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
                    <div><span className="font-bold text-gray-800">P:</span> {eng.partnerName || '-'}</div>
                    <div><span className="font-bold text-gray-800">M:</span> {eng.managerName || '-'}</div>
                    {eng.supervisorName && (
                      <div><span className="font-bold text-cyan-700">S:</span> {eng.supervisorName}</div>
                    )}
                    <div><span className="font-bold text-gray-800">KT:</span> {eng.auditorName || '-'}</div>
                    {eng.teamMembers && eng.teamMembers.length > 0 && (
                      <div className="text-[10px] text-gray-500 font-medium">+{eng.teamMembers.length} staf tim</div>
                    )}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === eng.id ? null : eng.id);
                      }}
                      aria-label={`Menu opsi untuk perikatan ${eng.id}`}
                      className="p-2 text-gray-400 hover:text-atlas-blue hover:bg-blue-50 rounded-full transition-colors min-h-[40px] min-w-[40px] inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-blue"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {/* Action Dropdown Menu */}
                    {openDropdownId === eng.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10 bg-transparent" 
                          onClick={() => setOpenDropdownId(null)} 
                        />
                        <div className="absolute right-8 top-10 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden text-left">
                          <button 
                            onClick={() => { handleOpenWorkspace(eng.id); setOpenDropdownId(null); }}
                            className="w-full px-4 py-3 flex items-center space-x-2.5 hover:bg-gray-50 text-sm text-gray-700 min-h-[44px]"
                          >
                            <FolderOpen size={16} className="text-blue-500 shrink-0" /> <span>Buka Workspace</span>
                          </button>
                          <button 
                            onClick={() => { setEditingEngagement(eng); setIsModalOpen(true); setOpenDropdownId(null); }}
                            className="w-full px-4 py-3 flex items-center space-x-2.5 hover:bg-gray-50 text-sm text-gray-700 border-t border-gray-100 min-h-[44px]"
                          >
                            <Edit2 size={16} className="text-amber-500 shrink-0" /> <span>Edit Engagement</span>
                          </button>
                          <button 
                            onClick={() => { duplicateEngagement(eng.id); setOpenDropdownId(null); }}
                            className="w-full px-4 py-3 flex items-center space-x-2.5 hover:bg-gray-50 text-sm text-gray-700 border-t border-gray-100 min-h-[44px]"
                          >
                            <Copy size={16} className="text-emerald-500 shrink-0" /> <span>Duplikat</span>
                          </button>
                          <button 
                            onClick={() => { archiveEngagement(eng.id); setOpenDropdownId(null); }}
                            className="w-full px-4 py-3 flex items-center space-x-2.5 hover:bg-amber-50 text-sm text-amber-700 border-t border-gray-100 min-h-[44px]"
                          >
                            <Archive size={16} className="shrink-0" /> <span>Arsipkan</span>
                          </button>
                          {(hasPermission('delete_engagement') || !user || user.role === 'Admin' || user.role === 'Auditor') && (
                            <button 
                              onClick={() => { setEngagementToDelete(eng); setOpenDropdownId(null); }}
                              className="w-full px-4 py-3 flex items-center space-x-2.5 hover:bg-red-50 text-sm text-red-600 border-t border-gray-100 min-h-[44px] transition-colors"
                            >
                              <Trash2 size={16} className="shrink-0" /> <span>Hapus Perikatan</span>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredEngagements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-atlas-blue flex items-center justify-center mb-3">
                        <FolderOpen size={24} />
                      </div>
                      <p className="text-base font-semibold text-gray-800">Belum Ada Perikatan Audit</p>
                      <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
                        {searchTerm 
                          ? 'Tidak ada engagement yang sesuai dengan kata kunci pencarian.' 
                          : 'Mulai dengan membuat perikatan audit baru untuk mengelola kertas kerja dan tim perikatan.'}
                      </p>
                      {!searchTerm && hasPermission('create_engagement') && (
                        <button 
                          onClick={() => { setEditingEngagement(null); setIsModalOpen(true); }}
                          className="bg-atlas-blue hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center justify-center min-h-[44px]"
                        >
                          <Plus size={16} className="mr-1.5" /> Buat Engagement Pertama
                        </button>
                      )}
                    </div>
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

      {/* Modal Konfirmasi Hapus Perikatan */}
      {engagementToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id="modal-delete-title" className="text-base font-bold text-gray-900">
                    Konfirmasi Hapus Perikatan
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tindakan ini permanen dan tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Perikatan:</span>
                  <span className="font-semibold text-gray-800">{engagementToDelete.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama Klien:</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[200px]" title={engagementToDelete.clientName}>
                    {engagementToDelete.clientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipe / Standar:</span>
                  <span className="text-gray-700">{engagementToDelete.engagementType} - {engagementToDelete.accountingStandard}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-gray-700">{engagementToDelete.status}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus perikatan ini? Seluruh kertas kerja, daftar akun, dan catatan audit yang terkait akan dihapus secara permanen.
              </p>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEngagementToDelete(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm min-h-[44px] flex items-center justify-center space-x-1.5"
                >
                  <Trash2 size={15} />
                  <span>Ya, Hapus Perikatan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback Sukses */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}
    </div>
  );
};

export default Engagements;
