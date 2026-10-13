import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import EngagementFormModal from '../components/EngagementFormModal';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowRight,
  Activity,
  ListTodo,
  BellRing,
  ShieldCheck,
  Target,
  Search,
  FileCheck
} from 'lucide-react';

// Mock Data
const engagements = [
  { id: 'ENG-2018-001', name: 'Audit Umum 2018', client: 'PT Kertas Makmur', period: '31 Des 2018', partner: 'Agus T.', manager: 'Budi S.', progress: 75, status: 'Active', phase: 'B' },
  { id: 'ENG-2018-002', name: 'Audit Kepatuhan', client: 'CV Maju Jaya', period: '30 Nov 2018', partner: 'Arie W.', manager: 'Siti N.', progress: 90, status: 'Pending Review', phase: 'C' },
  { id: 'ENG-2018-003', name: 'Audit Umum 2018', client: 'PT Angin Ribut', period: '31 Des 2018', partner: 'Agus T.', manager: 'Joko P.', progress: 100, status: 'Completed', phase: 'C' },
  { id: 'ENG-2018-004', name: 'Investigasi Khusus', client: 'PT Sentosa', period: '31 Okt 2018', partner: 'Triyanto', manager: 'Budi S.', progress: 40, status: 'Overdue', phase: 'A.1' },
];

const recentActivities = [
  { id: 1, user: 'Siti N.', action: 'mengunggah bukti audit', target: 'Kas dan Setara Kas', time: '2 jam yang lalu' },
  { id: 2, user: 'Budi S.', action: 'memberikan review note', target: 'Materialitas Awal', time: '4 jam yang lalu' },
  { id: 3, user: 'Joko P.', action: 'menyelesaikan kertas kerja', target: 'Risk Assessment', time: '1 hari yang lalu' },
];

const reviewTasks = [
  { id: 1, title: 'Review A.110 Analisis Penerimaan', client: 'PT Kertas Makmur', dueDate: 'Hari ini' },
  { id: 2, title: 'Review C.120 Prosedur Analitis Final', client: 'CV Maju Jaya', dueDate: 'Besok' },
];

const Dashboard = () => {
  const { hasPermission } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredEngagements = activeFilter 
    ? engagements.filter(eng => eng.phase === activeFilter)
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Dashboard Utama</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-lg leading-relaxed">
            Pemantauan seluruh perikatan dan aktivitas tim. Saat ini terdapat <strong className="text-gray-900">12 perikatan aktif</strong> dan <strong className="text-red-600">2 terlambat</strong> (overdue).
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-6 pr-6 border-r border-gray-300">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Menunggu Review</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Selesai Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
          {hasPermission('create_engagement') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-atlas-blue hover:bg-blue-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap"
            >
              + Buat Engagement
            </button>
          )}
        </div>
      </div>

      {/* ── Progress Perjalanan Audit / Siklus Audit (Stepper) ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Siklus & Metodologi Audit (ATLAS)</p>
            <p className="text-xs text-gray-400 mt-1">Klik pada tahapan di bawah ini untuk memfilter daftar perikatan.</p>
          </div>
          <div className="flex items-center space-x-3">
            {activeFilter && (
              <button 
                onClick={() => setActiveFilter(null)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full transition-colors border border-blue-100 uppercase tracking-wider cursor-pointer"
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
          {/* Background Line */}
          <div className="absolute top-5 left-4 right-4 w-[calc(100%-32px)] h-1 bg-gray-200 rounded-full" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                id: 'pra', code: 'A.1', name: 'Pra-Perikatan', desc: 'Client Acceptance & Independence', color: 'bg-blue-600', icon: ShieldCheck, count: engagements.filter(e => e.phase === 'A.1').length,
                tasks: ['A.110 Analisis Penerimaan', 'A.120 Alokasi Jam Jasa', 'A.130 Surat Perikatan']
              },
              { 
                id: 'risk_ass', code: 'A.2', name: 'Risk Assessment', desc: 'Materiality & Risk Planning', color: 'bg-indigo-600', icon: Target, count: engagements.filter(e => e.phase === 'A.2').length,
                tasks: ['A.210 Materialitas', 'A.220 Pemahaman Bisnis', 'A.230 Penilaian Risiko']
              },
              { 
                id: 'risk_res', code: 'B', name: 'Risk Response', desc: 'Audit Evidence & Testing', color: 'bg-purple-600', icon: Search, count: engagements.filter(e => e.phase === 'B').length,
                tasks: ['B.100 Uji Pengendalian', 'B.200 Prosedur Substantif', 'B.300 Bukti Audit']
              },
              { 
                id: 'comp', code: 'C', name: 'Completing & Reporting', desc: 'Final Review & Audit Report', color: 'bg-green-600', icon: FileCheck, count: engagements.filter(e => e.phase === 'C').length,
                tasks: ['C.100 Evaluasi Temuan', 'C.200 Kelangsungan Usaha', 'C.300 Laporan Auditor']
              },
            ].map((step, idx) => {
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
            <Link to="/engagements" className="text-xs text-atlas-blue font-bold uppercase hover:underline tracking-wider">Lihat Semua</Link>
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
                      Tidak ada perikatan yang sedang berada di tahap {activeFilter}.
                    </td>
                  </tr>
                ) : (
                  filteredEngagements.map((eng) => (
                  <tr key={eng.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 border-r border-gray-100">
                      <Link to={`/workspace/${eng.id}`} className="block group">
                        <span className="font-bold text-gray-900 group-hover:text-atlas-blue transition-colors text-sm">{eng.name}</span>
                        <span className="text-xs text-gray-500 mt-1 block">{eng.client}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600 border-r border-gray-100">{eng.period}</td>
                    <td className="px-6 py-4 text-xs text-gray-600 border-r border-gray-100">
                      <div className="flex flex-col gap-1.5">
                        <span><span className="font-bold text-gray-900 w-4 inline-block">P:</span> {eng.partner}</span>
                        <span><span className="font-bold text-gray-900 w-4 inline-block">M:</span> {eng.manager}</span>
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
                )))}
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
              {reviewTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer bg-white group">
                  <div>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-atlas-blue transition-colors">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{task.client}</p>
                  </div>
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-1 border border-red-200 uppercase tracking-wider">{task.dueDate}</span>
                </div>
              ))}
              <div className="p-4 bg-gray-50">
                <button className="w-full py-2 border border-gray-300 text-xs text-center text-gray-800 font-bold hover:bg-gray-100 uppercase tracking-widest transition-colors shadow-sm bg-white">
                  Lihat Semua
                </button>
              </div>
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
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gray-300">
                {recentActivities.map((act) => (
                  <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-2.5 h-2.5 rounded-none bg-atlas-blue shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ring-4 ring-white shadow-sm"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 border border-gray-200 shadow-sm hover:border-atlas-blue transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-gray-900">{act.user}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{act.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{act.action} pada <span className="font-bold text-gray-900">{act.target}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {isModalOpen && (
        <EngagementFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
