import React, { useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  FileSpreadsheet, 
  FolderGit2, 
  Scale, 
  TrendingUp, 
  Building2, 
  Calendar, 
  Check, 
  ChevronRight,
  ShieldAlert,
  FileCheck2,
  FileText
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
    setTimeout(() => setIsSaved(false), 2500);
  };

  const primaryMenuItems = [
    { 
      no: '1', 
      title: 'Worksheet Trial Balance (WTB)', 
      index: 'B.110', 
      path: 'b110',
      desc: 'Rekonsiliasi saldo buku, penyesuaian CAJE/PAJE, hingga angka final per audit.',
      icon: FileSpreadsheet
    },
    { 
      no: '2', 
      title: 'Mapping Prosedur & Lead Schedule', 
      index: 'B.120', 
      path: 'b120',
      desc: 'Pemetaan akun material dan signifikan ke Lead Schedule serta kesimpulan akun.',
      icon: Layers
    },
    { 
      no: '3', 
      title: 'CAJE / PAJE', 
      index: 'B.130', 
      path: 'b130',
      desc: 'Dokumentasi jurnal penyesuaian audit dan evaluasi batas toleransi materialitas.',
      icon: Scale
    },
    { 
      no: '4', 
      title: 'Neraca & Laba Rugi - Audited', 
      index: 'B.140', 
      path: 'b140',
      desc: 'Laporan keuangan komparatif hasil audit dan perbandingannya dengan tahun lalu.',
      icon: TrendingUp
    }
  ];

  const substantiveProcedures = [
    { code: 'B.210', title: 'Estimasi Akuntansi', path: 'b210', standard: 'SA 540' },
    { code: 'B.220', title: 'Pihak Berelasi', path: 'b220', standard: 'SA 550' },
    { code: 'B.230', title: 'Peristiwa Setelah Tanggal Neraca', path: 'b230', standard: 'SA 560' },
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
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Banner Ringkasan Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-atlas-blue border border-blue-200">
                  B.100
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Risk Response Phase
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Worksheet & Pelaksanaan Audit
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Modul utama pengolahan angka laporan keuangan audit, pemetaan Lead Schedule, penginputan jurnal penyesuaian CAJE/PAJE, serta prosedur audit substantif lainnya.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>STATUS: COMPLETED</span>
              </div>
            </div>
          </div>

          {/* Profil Entitas Klien */}
          <div className="pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
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
                <span className="text-slate-400">Aktivitas:</span> <span className="font-semibold text-slate-800">Audit Lap. Keuangan</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Menu Utama Worksheet (B.110 - B.140) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="text-atlas-blue" size={18} />
              <span>Kertas Kerja Pengolahan Angka Keuangan</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">B.110 s/d B.140</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryMenuItems.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.index}
                  onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/${item.path}`)}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-atlas-blue/60 hover:shadow-sm transition-all cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-atlas-blue flex items-center justify-center shrink-0 group-hover:bg-atlas-blue group-hover:text-white transition-all">
                      <IconComp size={20} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700">
                          {item.index}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-atlas-blue transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-atlas-blue transition-all shrink-0">
                    <ArrowRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prosedur Substantif Spesifik (B.210 - B.280) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileCheck2 className="text-atlas-blue" size={18} />
                <span>Prosedur Audit Substantif Tambahan</span>
              </h2>
              <p className="text-xs text-slate-500">
                Pengujian spesifik sesuai standar audit (SA) terkait estimasi, pihak berelasi, going concern, dan konfirmasi.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">B.210 s/d B.280</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {substantiveProcedures.map((proc) => (
              <div
                key={proc.code}
                onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/${proc.path}`)}
                className="group p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/60 hover:bg-white hover:border-atlas-blue/60 hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-atlas-blue">{proc.code}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{proc.standard}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-atlas-blue transition-colors">
                    {proc.title}
                  </h4>
                </div>

                <div className="mt-3 flex items-center justify-end text-[11px] font-semibold text-atlas-blue group-hover:translate-x-0.5 transition-transform">
                  <span>Buka KKP</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kesimpulan Gabungan Mapping & Jurnal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800">
              Kesimpulan Mapping Lead Schedule
            </h3>
            <textarea
              value={kesimpulanLead}
              onChange={(e) => setKesimpulanLead(e.target.value)}
              rows={3}
              placeholder="Tuliskan kesimpulan atas mapping prosedur..."
              className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800">
              Kesimpulan Evaluasi CAJE/PAJE
            </h3>
            <textarea
              value={kesimpulanCaje}
              onChange={(e) => setKesimpulanCaje(e.target.value)}
              rows={3}
              placeholder="Tuliskan kesimpulan evaluasi salah saji CAJE/PAJE..."
              className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>Kembali ke Beranda Workspace</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow"
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
