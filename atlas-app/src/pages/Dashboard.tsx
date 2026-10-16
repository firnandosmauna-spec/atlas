import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEngagementStore } from '../store/engagementStore';
import type { Engagement, ReviewNote } from '../store/engagementStore';
import EngagementFormModal from '../components/EngagementFormModal';
import { 
  Activity,
  ListTodo,
  BellRing,
  ShieldCheck,
  Target,
  Search,
  FileCheck,
  FolderOpen,
  Plus,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { hasPermission } = useAuthStore();
  const { 
    engagements = [], 
    auditLogs = [], 
    reviewNotes = [], 
    isSyncing, 
    syncStatus, 
    syncWithCloud 
  } = useEngagementStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const openReviewNotes = (reviewNotes || []).filter(
    (note: ReviewNote) => note.status === 'Open' || note.status === 'Reopened'
  );

  const getEngagementPhase = (eng: Engagement): string => {
    if (eng.progress >= 85 || eng.status === 'Completed') return 'C';
    if (eng.progress >= 50) return 'B';
    if (eng.progress >= 25) return 'A.2';
    return 'A.1';
  };

  const activeCount = engagements.filter(e => e.status === 'Active').length;
  const overdueCount = engagements.filter(e => e.status === 'Overdue').length;
  const pendingReviewCount = engagements.filter(e => e.status === 'Pending Review').length;
  const completedCount = engagements.filter(e => e.status === 'Completed' || e.progress === 100).length;

  const filteredEngagements = activeFilter 
    ? engagements.filter(eng => getEngagementPhase(eng) === activeFilter)
    : engagements;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-blue-50 text-atlas-blue border-blue-200';
      case 'Pending Review': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'Overdue': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'Overdue') return 'bg-red-600';
    if (progress === 100) return 'bg-green-600';
    return 'bg-atlas-blue';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 pb-6 border-b border-gray-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight uppercase">Dashboard Utama</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-lg leading-relaxed">
            {engagements.length === 0 ? (
              <span>Pemantauan seluruh perikatan dan aktivitas tim audit KAP. Belum ada perikatan aktif yang dibuat.</span>
            ) : (
              <span>
                Pemantauan seluruh perikatan dan aktivitas tim. Saat ini terdapat{' '}
                <strong className="text-gray-900">{activeCount} perikatan aktif</strong>
                {overdueCount > 0 ? (
                  <> dan <strong className="text-red-600">{overdueCount} terlambat</strong> (overdue).</>
                ) : (
                  <> dan tidak ada perikatan yang terlambat.</>
                )}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 border-r border-gray-300">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Menunggu Review</p>
              <p className="text-2xl font-bold text-gray-900">{pendingReviewCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Selesai</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
          <button
            onClick={() => syncWithCloud()}
            disabled={isSyncing}
            className={`px-3.5 py-2 text-xs font-bold transition-all shadow-xs whitespace-nowrap min-h-[44px] flex items-center justify-center rounded border gap-1.5 cursor-pointer disabled:cursor-wait ${
              isSyncing 
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : syncStatus === 'synced'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Sinkronisasi data perikatan dengan database Supabase Cloud"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-blue-600' : 'text-gray-500'} />
            <span>{isSyncing ? 'Menyinkronkan...' : syncStatus === 'synced' ? 'Tersinkron Cloud' : 'Sinkronkan Cloud'}</span>
          </button>
          {hasPermission('create_engagement') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-atlas-blue hover:bg-blue-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap min-h-[44px] flex items-center justify-center rounded cursor-pointer"
            >
              + Buat Engagement
            </button>
          )}
        </div>
      </div>

      {/* Progress Perjalanan Audit / Siklus Audit (Stepper) */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Siklus & Metodologi Audit (ATLAS)</p>
            <p className="text-xs text-gray-400 mt-1">Klik pada tahapan di bawah ini untuk memfilter daftar perikatan.</p>
          </div>
          <div className="flex items-center space-x-3">
            {activeFilter && (
              <button 
                onClick={() => setActiveFilter(null)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full transition-colors border border-blue-100 uppercase tracking-wider cursor-pointer min-h-[44px] flex items-center"
              >
                Tampilkan Semua
              </button>
            )}
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-600 rounded-sm animate-pulse"></span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Tracking</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          {/* Background Line - hidden on mobile when stacked */}
          <div className="hidden lg:block absolute top-5 left-4 right-4 w-[calc(100%-32px)] h-1 bg-gray-200 rounded-full" />
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                id: 'pra', code: 'A.1', name: 'Pra-Perikatan', desc: 'Client Acceptance & Independence', color: 'bg-blue-600', icon: ShieldCheck, count: engagements.filter(e => getEngagementPhase(e) === 'A.1').length,
                tasks: ['A.110 Analisis Penerimaan', 'A.120 Alokasi Jam Jasa', 'A.130 Surat Perikatan']
              },
              { 
                id: 'risk_ass', code: 'A.2', name: 'Risk Assessment', desc: 'Materiality & Risk Planning', color: 'bg-indigo-600', icon: Target, count: engagements.filter(e => getEngagementPhase(e) === 'A.2').length,
                tasks: ['A.210 Materialitas', 'A.220 Pemahaman Bisnis', 'A.230 Penilaian Risiko']
              },
              { 
                id: 'risk_res', code: 'B', name: 'Risk Response', desc: 'Audit Evidence & Testing', color: 'bg-purple-600', icon: Search, count: engagements.filter(e => getEngagementPhase(e) === 'B').length,
                tasks: ['B.100 Uji Pengendalian', 'B.200 Prosedur Substantif', 'B.300 Bukti Audit']
              },
              { 
                id: 'comp', code: 'C', name: 'Completing & Reporting', desc: 'Final Review & Audit Report', color: 'bg-green-600', icon: FileCheck, count: engagements.filter(e => getEngagementPhase(e) === 'C').length,
                tasks: ['C.100 Evaluasi Temuan', 'C.200 Kelangsungan Usaha', 'C.300 Laporan Auditor']
              },
            ].map((step) => {
              const Icon = step.icon;
              const isSelected = activeFilter === step.code;
              const isDimmed = activeFilter !== null && !isSelected;
              
              return (
                <div 
                  key={step.id} 
                  onClick={() => setActiveFilter(isSelected ? null : step.code)}
                  className={`flex flex-col items-center md:items-start relative group cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-50' : ''}`}
                >
                  {/* Step Circle */}
                  <div className={`w-11 h-11 rounded-full border-4 border-white flex items-center justify-center shrink-0 mb-4 transition-all duration-300 md:ml-4 shadow-sm z-10 ${
                    isSelected ? `${step.color} text-white shadow-md ring-4 ring-blue-500/20` : 
                    'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
                  }`}>
                    {isSelected ? <Icon size={18} strokeWidth={2.5} /> : <span className="text-sm font-black">{step.code}</span>}
                  </div>
                  
                  {/* Step Content Card */}
                  <div className={`w-full bg-white border rounded-xl p-4 transition-all duration-300 ${
                    isSelected ? 'border-blue-400 shadow-md ring-1 ring-blue-400/20 bg-blue-50/10' : 
                    'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{step.code}</span>
                        {step.count > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? step.color + ' text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {step.count}
                          </span>
                        )}
                      </div>
                      {!isSelected && (
                        <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
                          <Icon size={16} strokeWidth={2} />
                        </div>
                      )}
                    </div>
                    <h3 className={`text-sm font-bold mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>{step.name}</h3>
                    <p className="text-[11px] text-gray-500 leading-tight mb-4">{step.desc}</p>

                    {/* Task List */}
                    <ul className="space-y-1.5 pt-3 border-t border-gray-100">
                      {step.tasks.map((task, i) => (
                        <li key={i} className={`text-[10px] font-medium flex items-start gap-1.5 leading-snug ${isSelected ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${isSelected ? step.color.replace('bg-', 'bg-').replace('-600', '-500') : 'bg-gray-300 group-hover:bg-gray-400'}`}></div>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Engagement Table */}
        <div className="xl:col-span-2 border border-gray-300 bg-white shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Daftar Perikatan Audit</h3>
            <Link to="/engagements" className="text-xs text-atlas-blue font-bold uppercase hover:underline tracking-wider min-h-[44px] flex items-center">
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-[10px] text-gray-500 uppercase tracking-widest bg-gray-50">
                  <th className="px-6 py-3 font-bold border-r border-gray-200">Engagement & Klien</th>
                  <th className="px-6 py-3 font-bold border-r border-gray-200">Periode</th>
                  <th className="px-6 py-3 font-bold border-r border-gray-200">Tim (P/M)</th>
                  <th className="px-6 py-3 font-bold border-r border-gray-200">Progress</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEngagements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                      {engagements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-4">
                          <FolderOpen size={36} className="text-gray-300 mb-2" />
                          <p className="font-semibold text-gray-800 text-sm">Belum ada perikatan audit</p>
                          <p className="text-xs text-gray-500 mt-1 mb-4">Tambahkan perikatan audit baru untuk mulai mengelola kertas kerja dan tim.</p>
                          {hasPermission('create_engagement') && (
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="bg-atlas-blue hover:bg-blue-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm min-h-[44px] flex items-center justify-center rounded"
                            >
                              <Plus size={14} className="mr-1.5" /> Buat Engagement
                            </button>
                          )}
                        </div>
                      ) : (
                        `Tidak ada perikatan yang sedang berada di tahap ${activeFilter}.`
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredEngagements.map((eng) => (
                    <tr key={eng.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 border-r border-gray-100">
                        <Link to={`/workspace/${eng.id}`} className="block group">
                          <span className="font-bold text-gray-900 group-hover:text-atlas-blue transition-colors text-sm">{eng.id}</span>
                          <span className="text-xs text-gray-500 mt-1 block">{eng.clientName}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600 border-r border-gray-100">
                        {eng.auditPeriod || `Tahun Buku ${eng.fiscalYear}`}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 border-r border-gray-100">
                        <div className="flex flex-col gap-1.5">
                          <span><span className="font-bold text-gray-900 w-4 inline-block">P:</span> {eng.partnerName || '-'}</span>
                          <span><span className="font-bold text-gray-900 w-4 inline-block">M:</span> {eng.managerName || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-100">
                        <div className="flex flex-col space-y-1.5">
                          <span className="text-[10px] font-bold text-gray-900">{eng.progress}% Selesai</span>
                          <div className="w-full bg-gray-200 h-1.5 rounded-none">
                            <div 
                              className={`h-1.5 ${getProgressColor(eng.progress, eng.status)}`} 
                              style={{ width: `${eng.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(eng.status)}`}>
                          {eng.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          
          {/* Review Tasks & Status Approval */}
          <div className="border border-gray-300 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-300 flex items-center space-x-2 bg-gray-50">
              <ListTodo size={14} className="text-gray-900" />
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Review & Approval</h3>
            </div>
            <div className="p-0 divide-y divide-gray-200">
              {openReviewNotes.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Tidak ada catatan review yang menunggu persetujuan.
                </div>
              ) : (
                openReviewNotes.map((task) => {
                  const relatedEng = engagements.find(e => e.id === task.engagementId);
                  return (
                    <div key={task.id} className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer bg-white group">
                      <div>
                        <p className="text-sm font-bold text-gray-800 group-hover:text-atlas-blue transition-colors">{task.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">{relatedEng?.clientName || task.engagementId} ({task.worksheetId})</p>
                      </div>
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-1 border border-red-200 uppercase tracking-wider">{task.reviewer}</span>
                    </div>
                  );
                })
              )}
              {openReviewNotes.length > 0 && (
                <div className="p-4 bg-gray-50">
                  <Link 
                    to="/engagements"
                    className="block w-full py-2 border border-gray-300 text-xs text-center text-gray-800 font-bold hover:bg-gray-100 uppercase tracking-widest transition-colors shadow-sm bg-white min-h-[44px] flex items-center justify-center"
                  >
                    Lihat Semua
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity & Notification */}
          <div className="border border-gray-300 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-2">
                <Activity size={14} className="text-gray-900" />
                <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Aktivitas Terkini</h3>
              </div>
              <BellRing size={14} className="text-gray-400" />
            </div>
            <div className="p-6">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Belum ada log aktivitas yang tercatat.
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gray-300">
                  {auditLogs.slice(0, 5).map((act) => (
                    <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-2.5 h-2.5 rounded-none bg-atlas-blue shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ring-4 ring-white shadow-sm"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 border border-gray-200 shadow-sm hover:border-atlas-blue transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-gray-900">{act.user}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{act.action} pada <span className="font-bold text-gray-900">{act.module}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {isModalOpen && (
        <EngagementFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          initialData={null}
        />
      )}
    </div>
  );
};

export default Dashboard;
