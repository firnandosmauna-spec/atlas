import { FileText, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type WorksheetStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Needs Revision' | 'Reviewed' | 'Approved' | 'Uncompleted' | 'Full' | 'Belum Full';

export interface WorksheetInfo {
  id: string;
  code: string;
  name: string;
  status: WorksheetStatus;
  progress: number;
  reviewer: string | null;
  lastUpdated: string;
  description?: string;
}

interface WorksheetListProps {
  stageName?: string;
  description?: string;
  worksheets: WorksheetInfo[];
  stageCode?: string;
}

const STATUS_CONFIG: Record<WorksheetStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  'Not Started':   { label: 'Belum Dimulai', dot: 'bg-gray-300',    text: 'text-gray-500',   bg: 'bg-gray-50',    border: 'border-gray-200' },
  'In Progress':   { label: 'Belum Full (Berjalan)', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200' },
  'Needs Revision':{ label: 'Perlu Revisi',  dot: 'bg-red-500',     text: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200'  },
  'Reviewed':      { label: 'Direview',      dot: 'bg-purple-500',  text: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200'},
  'Approved':      { label: 'Disetujui',     dot: 'bg-green-500',   text: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200' },
  'Completed':     { label: 'Full (Selesai)', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'Full':          { label: 'Full (Selesai)', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'Uncompleted':   { label: 'Belum Full',   dot: 'bg-amber-500 animate-pulse',    text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'  },
  'Belum Full':    { label: 'Belum Full',   dot: 'bg-amber-500 animate-pulse',    text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'  },
};

const WorksheetList = ({ stageName, description, worksheets, stageCode }: WorksheetListProps) => {
  const navigate = useNavigate();

  const completedCount = worksheets.filter(w => w.status === 'Completed' || w.status === 'Approved' || w.status === 'Reviewed').length;
  const overallProgress = worksheets.length > 0 ? Math.round((completedCount / worksheets.length) * 100) : 0;

  const handleOpen = (ws: WorksheetInfo) => {
    // Use relative navigation from current route (e.g. from /workspace/:id/pra-perikatan)
    navigate(`../worksheet/${ws.code.replace(/\./g, '').toLowerCase()}`);
  };

  return (
    <div className="w-full max-w-full space-y-0">

      {/* Stage Header */}
      {stageName && (
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1 min-w-0">
              {stageCode && (
                <span className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-1.5 block">{stageCode}</span>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{stageName}</h1>
              {description && (
                <p className="text-gray-500 mt-2 max-w-5xl text-sm leading-relaxed">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-6 sm:gap-8 shrink-0 bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
              <div className="text-right">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}<span className="text-gray-400 font-normal text-lg">/{worksheets.length}</span></p>
              </div>
              <div className="w-28 sm:w-32">
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Progress</span>
                  <span className="text-xs font-bold text-gray-900">{overallProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${overallProgress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-cyan-500'}`}
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Worksheet Rows */}
      <div className="divide-y divide-gray-200 border border-gray-200 bg-white rounded-xl shadow-2xs overflow-hidden w-full">
        {worksheets.map((ws, index) => {
          const cfg = STATUS_CONFIG[ws.status] || STATUS_CONFIG['Not Started'];
          const isClickable = true;

          return (
            <div
              key={ws.id}
              onClick={() => isClickable && handleOpen(ws)}
              className={`group flex items-center gap-4 sm:gap-6 py-4 px-4 sm:px-6 transition-all ${isClickable ? 'cursor-pointer hover:bg-slate-50/80 hover:translate-x-0.5' : 'cursor-default opacity-60'}`}
            >
              {/* Number */}
              <span className="text-sm text-gray-400 font-mono font-semibold w-6 shrink-0 text-right">
                {(index + 1).toString().padStart(2, '0')}
              </span>

              {/* Code Badge */}
              <div className="w-20 shrink-0">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-md inline-block shadow-2xs">
                  {ws.code}
                </span>
              </div>

              {/* Name & Reviewer */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-atlas-blue transition-colors truncate text-sm sm:text-base">{ws.name}</p>
                <div className="flex items-center gap-4 mt-1">
                  {ws.reviewer ? (
                    <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <CheckCircle size={12} className="text-emerald-500" /> {ws.reviewer}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Belum ada reviewer</span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {ws.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="w-28 sm:w-36 shrink-0 hidden sm:block">
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${ws.progress === 100 ? 'bg-emerald-500' : ws.progress > 0 ? 'bg-blue-600' : 'bg-gray-200'}`}
                      style={{ width: `${ws.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-semibold w-8 text-right">{ws.progress}%</span>
                </div>
              </div>

              {/* Status */}
              <div className="w-36 sm:w-44 shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={18}
                className="text-gray-300 group-hover:text-atlas-blue group-hover:translate-x-1 transition-all shrink-0"
              />
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {worksheets.length === 0 && (
        <div className="py-20 text-center border border-dashed border-gray-200 rounded-xl bg-white">
          <FileText size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Tidak ada worksheet pada tahap ini</p>
        </div>
      )}
    </div>
  );
};

export default WorksheetList;
