import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';

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
      badge: 'Trial Balance'
    },
    { 
      no: '2', 
      title: 'Mapping Prosedur & Lead Schedule', 
      index: 'B.120', 
      path: 'b120',
      desc: 'Pemetaan akun material dan signifikan ke Lead Schedule serta perumusan simpulan audit per akun.',
      badge: 'Lead Schedule'
    },
    { 
      no: '3', 
      title: 'Jurnal Penyesuaian (CAJE / PAJE)', 
      index: 'B.130', 
      path: 'b130',
      desc: 'Pencatatan usulan koreksi audit (CAJE) dan evaluasi salah saji yang tidak dikoreksi (PAJE).',
      badge: 'AJP Reklasifikasi'
    },
    { 
      no: '4', 
      title: 'Neraca & Laba Rugi Audited', 
      index: 'B.140', 
      path: 'b140',
      desc: 'Laporan keuangan komparatif hasil audit lengkap dengan evaluasi varians periode sebelumnya.',
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
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Banner Ringkasan Minimalis Tanpa Icon */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-blue-50 text-atlas-blue border border-blue-200">
                  B.100
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                  Risk Response Phase
                </span>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Worksheet & Pelaksanaan Audit
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                Pusat pengolahan angka keuangan audit, penyesuaian jurnal (CAJE/PAJE), pemetaan Lead Schedule, serta prosedur substantif.
              </p>
            </div>

            <div className="shrink-0">
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                STATUS: COMPLETED
              </span>
            </div>
          </div>

          {/* Profil Entitas Klien - Bersih Tanpa Icon */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Klien</span>
              <span className="font-semibold text-slate-800 text-xs truncate block mt-0.5">
                {engagement?.clientName || '-'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Periode Audit</span>
              <span className="font-semibold text-slate-800 text-xs block mt-0.5">
                {engagement?.auditPeriod || '2025'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Standar Akuntansi</span>
              <span className="font-semibold text-slate-800 text-xs block mt-0.5">
                {engagement?.accountingStandard || 'SAK Umum'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Jenis Penugasan</span>
              <span className="font-semibold text-slate-800 text-xs block mt-0.5">
                Pengolahan Angka Keuangan
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KERTAS KERJA PENGOLAHAN ANGKA KEUANGAN (BERSIH & LAPANG) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Kertas Kerja Pengolahan Angka Keuangan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Alur utama rekonsiliasi angka keuangan audit dari Trial Balance hingga Laporan Keuangan Audited
              </p>
            </div>
            <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              B.110 s/d B.140
            </span>
          </div>

          {/* Clean Row-based List (No Decorative Icons) */}
          <div className="divide-y divide-slate-100">
            {primaryMenuItems.map((item) => (
              <div
                key={item.index}
                onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/${item.path}`)}
                className="group px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-atlas-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {item.index}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-atlas-blue transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pr-4">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                    {item.badge}
                  </span>
                  <span className="text-xs font-bold text-atlas-blue group-hover:underline">
                    Buka KKP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prosedur Substantif Spesifik (B.210 - B.280) Bersih */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Prosedur Audit Substantif Tambahan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengujian spesifik estimasi akuntansi, pihak berelasi, kelangsungan usaha, dan konfirmasi
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">B.210 s/d B.280</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {substantiveProcedures.map((proc) => (
              <div
                key={proc.code}
                onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/${proc.path}`)}
                className="group p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-atlas-blue/60 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-atlas-blue">{proc.code}</span>
                    <span className="text-[10px] text-slate-500 font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">{proc.standard}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-atlas-blue transition-colors">
                    {proc.title}
                  </h4>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <span className="text-[11px] font-bold text-atlas-blue group-hover:underline">
                    Buka KKP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kesimpulan Gabungan Mapping & Jurnal Bersih */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kesimpulan Mapping Lead Schedule
            </h3>
            <textarea
              value={kesimpulanLead}
              onChange={(e) => setKesimpulanLead(e.target.value)}
              rows={3}
              placeholder="Tuliskan kesimpulan atas mapping prosedur..."
              className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kesimpulan Evaluasi CAJE/PAJE
            </h3>
            <textarea
              value={kesimpulanCaje}
              onChange={(e) => setKesimpulanCaje(e.target.value)}
              rows={3}
              placeholder="Tuliskan kesimpulan evaluasi salah saji CAJE/PAJE..."
              className="w-full text-xs text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-atlas-blue/20 focus:border-atlas-blue transition-all"
            />
          </div>
        </div>

        {/* Action Footer Bersih */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}`)}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Kembali ke Beranda Workspace
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
          >
            {isSaved ? "Tersimpan" : "Simpan KKP B.100"}
          </button>
        </div>

        {/* Toast Notifikasi Bersih */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-3 duration-200">
            Kertas kerja B.100 berhasil disimpan.
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default B100;
