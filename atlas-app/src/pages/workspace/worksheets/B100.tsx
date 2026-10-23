import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  Layers, 
  FileSpreadsheet, 
  FolderGit2, 
  Scale, 
  TrendingUp, 
  Building2, 
  Calendar, 
  ChevronRight,
  FileCheck2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const B100: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [kesimpulanLead, setKesimpulanLead] = useState(
    (engagement as any)?.worksheetB100?.kesimpulanLead || 
    'Seluruh akun signifikan dan material telah berhasil dipetakan ke dalam Lead Schedule terkait dan dilakukan pengujian kepatuhan serta pengujian substantif.'
  );
  const [kesimpulanCaje, setKesimpulanCaje] = useState(
    (engagement as any)?.worksheetB100?.kesimpulanCaje || 
    'Semua penyesuaian audit yang teridentifikasi telah dievaluasi terhadap materialitas pelaksanaan dan tidak terdapat salah saji yang mendistorsi laporan keuangan secara material.'
  );

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  const primaryMenuItems = [
    { 
      no: '1', 
      title: 'Worksheet Trial Balance (WTB)', 
      index: 'B.110', 
      path: 'b110',
      desc: 'Rekonsiliasi saldo buku per klien, penyesuaian audit (AJP), hingga saldo final per audit.',
      icon: FileSpreadsheet,
      badge: 'Trial Balance'
    },
    { 
      no: '2', 
      title: 'Mapping Prosedur & Lead Schedule', 
      index: 'B.120', 
      path: 'b120',
      desc: 'Pemetaan akun material dan signifikan ke Lead Schedule serta perumusan simpulan audit per akun.',
      icon: Layers,
      badge: 'Lead Schedule'
    },
    { 
      no: '3', 
      title: 'Jurnal Penyesuaian (CAJE / PAJE)', 
      index: 'B.130', 
      path: 'b130',
      desc: 'Pencatatan usulan koreksi audit (CAJE) dan evaluasi salah saji yang tidak dikoreksi (PAJE).',
      icon: Scale,
      badge: 'AJP Reklasifikasi'
    },
    { 
      no: '4', 
      title: 'Neraca & Laba Rugi Audited', 
      index: 'B.140', 
      path: 'b140',
      desc: 'Laporan keuangan komparatif hasil audit lengkap dengan evaluasi varians periode sebelumnya.',
      icon: TrendingUp,
      badge: 'Lap. Keuangan'
    }
  ];

  const substantiveProcedures = [
    { code: 'B.210', title: 'Estimasi Akuntansi', path: 'b210', standard: 'SA 540' },
    { code: 'B.220', title: 'Pihak Berelasi', path: 'b220', standard: 'SA 550' },
    { code: 'B.230', title: 'Peristiwa Pasca Neraca', path: 'b230', standard: 'SA 560' },
    { code: 'B.240', title: 'Kelangsungan Usaha', path: 'b240', standard: 'SA 570' },
    { code: 'B.250', title: 'Representasi Manajemen', path: 'b250', standard: 'SA 580' },
    { code: 'B.260', title: 'Pakar Auditor', path: 'b260', standard: 'SA 620' },
    { code: 'B.270', title: 'Pakar Manajemen', path: 'b270', standard: 'SA 500' },
    { code: 'B.280', title: 'Komitmen & Kontinjensi', path: 'b280', standard: 'PSAK 57' },
  ];

  return (
    <WorksheetContainer
      code="B.100"
      name="Worksheet & Pelaksanaan Audit"
      purpose="Pusat navigasi pengolahan angka laporan keuangan, perumusan jurnal penyesuaian, dan prosedur audit substantif."
      status="Completed"
      reviewer={engagement?.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-5 max-w-7xl mx-auto">
        
        {/* Banner Ringkasan Ramping Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200">
                  B.100
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Risk Response Phase
                </span>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Worksheet & Pelaksanaan Audit
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Pusat pengolahan angka keuangan audit, penyesuaian jurnal (CAJE/PAJE), pemetaan Lead Schedule, serta prosedur substantif.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>STATUS: COMPLETED</span>
              </div>
            </div>
          </div>

          {/* Profil Entitas Klien Ramping */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 size={14} className="text-slate-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400">Klien:</span> <span className="font-semibold text-slate-800">{engagement?.clientName || '-'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Periode:</span> <span className="font-semibold text-slate-800">{engagement?.auditPeriod || '2025'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <FolderGit2 size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Standar:</span> <span className="font-semibold text-slate-800">{engagement?.accountingStandard || 'SAK Umum'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Scale size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400">Aktivitas:</span> <span className="font-semibold text-slate-800">Pengolahan Angka</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KERTAS KERJA PENGOLAHAN ANGKA KEUANGAN (RAMPING SEDERHANA) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-atlas-blue">
                <FileSpreadsheet size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Kertas Kerja Pengolahan Angka Keuangan
                </h2>
                <p className="text-[11px] text-slate-500">
                  Alur utama rekonsiliasi angka keuangan audit (B.110 s/d B.140)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              4 Modul KKP
            </span>
          </div>

          {/* Ramping Row-based Layout */}
          <div className="divide-y divide-slate-100">
            {primaryMenuItems.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.index}
                  onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/${item.path}`)}
                  className="group px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-atlas-blue group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                      <IconComp size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-atlas-blue">
                          {item.index}
                        </span>
                        <span className="text-slate-300">•</span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-atlas-blue transition-colors truncate">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-atlas-blue bg-blue-50/70 group-hover:bg-atlas-blue group-hover:text-white px-3 py-1.5 rounded-lg transition-all shadow-2xs">
                      <span>Buka KKP</span>
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prosedur Substantif Spesifik (B.210 - B.280) Ramping */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="text-atlas-blue" size={16} />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                Prosedur Audit Substantif Tambahan (B.210 s/d B.280)
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">8 Prosedur Spesifik</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {substantiveProcedures.map((proc) => (
              <div
                key={proc.code}
                onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/${proc.path}`)}
                className="group p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/60 hover:bg-white hover:border-atlas-blue/60 hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-atlas-blue">{proc.code}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{proc.standard}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-atlas-blue transition-colors line-clamp-1">
                    {proc.title}
                  </h4>
                </div>

                <div className="mt-2 flex items-center justify-end text-[10px] font-semibold text-atlas-blue group-hover:translate-x-0.5 transition-transform">
                  <span>Buka</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kesimpulan Gabungan Mapping & Jurnal Ramping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800">
              Kesimpulan Mapping Lead Schedule
            </h3>
            <textarea
              value={kesimpulanLead}
              onChange={(e) => setKesimpulanLead(e.target.value)}
              rows={2}
              placeholder="Tuliskan kesimpulan atas mapping prosedur..."
              className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800">
              Kesimpulan Evaluasi CAJE/PAJE
            </h3>
            <textarea
              value={kesimpulanCaje}
              onChange={(e) => setKesimpulanCaje(e.target.value)}
              rows={2}
              placeholder="Tuliskan kesimpulan evaluasi salah saji CAJE/PAJE..."
              className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <span>Kembali ke Beranda Workspace</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
          >
            {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
            <span>{isSaved ? "Tersimpan" : "Simpan KKP B.100"}</span>
          </button>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Kertas kerja B.100 berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B100;
