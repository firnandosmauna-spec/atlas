import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft } from 'lucide-react';

const B140 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Summary state (dummy values)
  const summaries = {
    asetLancar: { audited: 1005943170, prev: 1194943170 },
    asetTidakLancar: { audited: 809822960, prev: 682578110 },
    liabilitasPendek: { audited: -1885017500, prev: -1078657000 },
    liabilitasPanjang: { audited: -1381655000, prev: -82455000 },
    ekuitas: { audited: -813149340, prev: -719463790 },
    labaSebelumPajak: { audited: -937330540, prev: 18418707 },
    labaEBITDA: { audited: -936094590, prev: 184850 }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const formatCurrency = (val: number) => {
    if (val === 0) return '-';
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(absVal);
    return isNegative ? `(${formatted})` : formatted;
  };

  return (
    <WorksheetContainer
      code="B.140"
      name="Neraca dan Laporan Laba Rugi - Audited"
      purpose="Informasi saldo-saldo laporan keuangan audited dan perbandingannya dengan tahun sebelumnya."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Info Box */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini merupakan informasi dari saldo-saldo laporan keuangan <i>audited</i>. Pada bagian atas terdapat informasi saldo kelompok neraca dan laba rugi.</p>
        </div>

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Alamat Klien</div><div className="text-gray-900">: -</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: B.140</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Neraca dan Laporan Laba Rugi - Audited</div>
            </div>
            
            <div className="mt-6 flex flex-col md:flex-row gap-4 items-start">
              <span className="font-bold text-gray-800 text-[10px]">Simpulan</span>
              <textarea 
                className="flex-1 w-full bg-green-100 border border-green-300 outline-none p-2 font-medium min-h-[50px] resize-none"
              ></textarea>
            </div>
            
            <div className="w-32 border border-gray-400 mt-4 text-center bg-white">
              <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
              <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
            </div>
          </div>

          <div className="w-full md:w-96 bg-white border border-gray-300 p-3 rounded shadow-sm text-[10px]">
             <div className="flex justify-between items-center mb-1">
               <span>Disiapkan oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5" defaultValue="Auditor A" />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal mulai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5" />
             </div>
             <div className="flex justify-between items-center mb-1 pb-2 border-b border-gray-200">
               <span>Tanggal selesai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5" />
             </div>
             
             <div className="flex justify-between items-center mt-2 mb-1">
               <span>Direview oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5" defaultValue="Manager B" />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal mulai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5" />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal selesai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5" />
             </div>
          </div>
        </div>

        {/* Top Header Grid (Summary Laba Rugi / Neraca) */}
        <div className="bg-white border border-blue-900 shadow-sm mt-4">
          <div className="bg-blue-900 text-white font-bold py-1.5 px-4 text-xs tracking-widest border-b border-blue-950 flex justify-between items-center">
             <span>Laporan Posisi Keuangan dan Laba Rugi setelah koreksi</span>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 p-4 text-[10px] font-bold text-gray-700">
            {/* Laporan Posisi Keuangan Summary */}
            <div className="flex-1 space-y-1">
              <div className="grid grid-cols-[200px_120px_120px] gap-2 mb-1 border-b border-gray-300 pb-1 text-red-600 text-center">
                <div className="text-left"></div>
                <div>Audited</div>
                <div>Previous Year</div>
              </div>
              <div className="grid grid-cols-[200px_120px_120px] gap-2 hover:bg-slate-50">
                <div className="text-gray-800">ASET LANCAR</div>
                <div className="text-right font-mono bg-green-50 border border-green-200 px-1">{formatCurrency(summaries.asetLancar.audited)}</div>
                <div className="text-right font-mono border border-gray-200 px-1">{formatCurrency(summaries.asetLancar.prev)}</div>
              </div>
              <div className="grid grid-cols-[200px_120px_120px] gap-2 hover:bg-slate-50">
                <div className="text-gray-800">ASET TIDAK LANCAR</div>
                <div className="text-right font-mono bg-green-50 border border-green-200 px-1">{formatCurrency(summaries.asetTidakLancar.audited)}</div>
                <div className="text-right font-mono border border-gray-200 px-1">{formatCurrency(summaries.asetTidakLancar.prev)}</div>
              </div>
              <div className="grid grid-cols-[200px_120px_120px] gap-2 hover:bg-slate-50">
                <div className="text-gray-800">LIABILITAS JANGKA PENDEK</div>
                <div className="text-right font-mono bg-green-50 border border-green-200 px-1">{formatCurrency(summaries.liabilitasPendek.audited)}</div>
                <div className="text-right font-mono border border-gray-200 px-1">{formatCurrency(summaries.liabilitasPendek.prev)}</div>
              </div>
              <div className="grid grid-cols-[200px_120px_120px] gap-2 hover:bg-slate-50">
                <div className="text-gray-800">LIABILITAS JANGKA PANJANG</div>
                <div className="text-right font-mono bg-green-50 border border-green-200 px-1">{formatCurrency(summaries.liabilitasPanjang.audited)}</div>
                <div className="text-right font-mono border border-gray-200 px-1">{formatCurrency(summaries.liabilitasPanjang.prev)}</div>
              </div>
              <div className="grid grid-cols-[200px_120px_120px] gap-2 hover:bg-slate-50">
                <div className="text-gray-800">EKUITAS</div>
                <div className="text-right font-mono bg-green-50 border border-green-200 px-1">{formatCurrency(summaries.ekuitas.audited)}</div>
                <div className="text-right font-mono border border-gray-200 px-1">{formatCurrency(summaries.ekuitas.prev)}</div>
              </div>
            </div>

            {/* Laba Rugi Summary */}
            <div className="flex-1 space-y-1">
              <div className="grid grid-cols-[200px_120px_120px] gap-2 mb-1 border-b border-gray-300 pb-1 text-red-600 text-center">
                <div className="text-left"></div>
                <div>Audited</div>
                <div>Previous Year</div>
              </div>
              <div className="grid grid-cols-[200px_120px_120px] gap-2 hover:bg-slate-50">
                <div className="text-gray-800 whitespace-nowrap">Laba sebelum pajak</div>
                <div className="text-right font-mono bg-green-50 border border-green-200 px-1">{formatCurrency(summaries.labaSebelumPajak.audited)}</div>
                <div className="text-right font-mono border border-gray-200 px-1">{formatCurrency(summaries.labaSebelumPajak.prev)}</div>
              </div>
              <div className="grid grid-cols-[200px_120px_120px] gap-2 hover:bg-slate-50 mt-1">
                <div className="text-gray-800 whitespace-normal leading-tight">Laba sebelum bunga, pajak, penyusutan, dan amortisasi</div>
                <div className="text-right font-mono bg-green-50 border border-green-200 px-1">{formatCurrency(summaries.labaEBITDA.audited)}</div>
                <div className="text-right font-mono border border-gray-200 px-1">{formatCurrency(summaries.labaEBITDA.prev)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Laporan (Dua Kolom) */}
        <div className="flex flex-col lg:flex-row gap-8 bg-white border border-gray-400 p-6 shadow-sm overflow-x-auto text-[10px] font-bold">
          
          {/* Kolom Kiri (Neraca) */}
          <div className="flex-1 w-full min-w-[400px]">
             <div className="grid grid-cols-[auto_100px_100px] gap-2 text-red-600 text-center mb-2 border-b border-gray-300 pb-1">
                <div></div><div>Audited</div><div>Previous Year</div>
             </div>

             {/* ASET LANCAR */}
             <div className="mb-2">ASET LANCAR</div>
             <div className="space-y-1 pl-4 text-gray-700">
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Kas dan setara kas</div><div className="text-right font-mono">33.404.950</div><div className="text-right font-mono">33.104.950</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Piutang usaha</div><div className="text-right font-mono">801.000.720</div><div className="text-right font-mono">1.011.347.710</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Uang muka dan beban dibayar dimuka</div><div className="text-right font-mono">120.540.000</div><div className="text-right font-mono">120.540.000</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Pajak dibayar dimuka</div><div className="text-right font-mono">30.000.000</div><div className="text-right font-mono">29.950.000</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Persediaan</div><div className="text-right font-mono">3.000.000</div><div className="text-right font-mono">2.500.000</div>
               </div>
             </div>

             {/* ASET TIDAK LANCAR */}
             <div className="mt-4 mb-2">ASET TIDAK LANCAR</div>
             <div className="space-y-1 pl-4 text-gray-700">
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Aset tetap</div><div className="text-right font-mono">157.040.415</div><div className="text-right font-mono">148.050.415</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Akumulasi penyusutan</div><div className="text-right font-mono">15.555.555</div><div className="text-right font-mono">14.555.555</div>
               </div>
             </div>

             {/* LIABILITAS JANGKA PENDEK */}
             <div className="mt-4 mb-2">LIABILITAS JANGKA PENDEK</div>
             <div className="space-y-1 pl-4 text-gray-700">
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Hutang usaha</div><div className="text-right font-mono">(33.000.000)</div><div className="text-right font-mono">(32.000.000)</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Hutang pajak</div><div className="text-right font-mono">(51.750.500)</div><div className="text-right font-mono">(51.612.500)</div>
               </div>
             </div>

             {/* LIABILITAS JANGKA PANJANG */}
             <div className="mt-4 mb-2">LIABILITAS JANGKA PANJANG</div>
             <div className="space-y-1 pl-4 text-gray-700">
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Hutang bank jangka panjang</div><div className="text-right font-mono">(82.455.000)</div><div className="text-right font-mono">(82.455.000)</div>
               </div>
             </div>

             {/* EKUITAS */}
             <div className="mt-4 mb-2">EKUITAS</div>
             <div className="space-y-1 pl-4 text-gray-700">
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Modal disetor</div><div className="text-right font-mono">(140.000.000)</div><div className="text-right font-mono">(140.000.000)</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Saldo laba</div><div className="text-right font-mono">(673.149.340)</div><div className="text-right font-mono">(589.443.300)</div>
               </div>
             </div>
          </div>

          {/* Kolom Kanan (Laba Rugi) */}
          <div className="flex-1 w-full min-w-[400px]">
             <div className="grid grid-cols-[auto_100px_100px] gap-2 text-red-600 text-center mb-2 border-b border-gray-300 pb-1">
                <div></div><div>Audited</div><div>Previous Year</div>
             </div>
             
             <div className="space-y-1 text-gray-700 mt-6">
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Penjualan dan pendapatan</div><div className="text-right font-mono">(4.045.000.000)</div><div className="text-right font-mono">(3.744.000.000)</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Beban pokok pendapatan</div><div className="text-right font-mono">2.337.000.000</div><div className="text-right font-mono">2.126.000.000</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Biaya Gaji dan upah</div><div className="text-right font-mono">555.757.500</div><div className="text-right font-mono">555.502.500</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Beban administrasi dan umum</div><div className="text-right font-mono">29.200.000</div><div className="text-right font-mono">26.700.000</div>
               </div>
               
               <div className="mt-8"></div>
               
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Pendapatan non operasional</div><div className="text-right font-mono">(190.294.540)</div><div className="text-right font-mono">(3.440.000)</div>
               </div>
               <div className="grid grid-cols-[auto_100px_100px] gap-2 hover:bg-slate-50">
                  <div>Beban non operasional</div><div className="text-right font-mono">-</div><div className="text-right font-mono">-</div>
               </div>
             </div>
          </div>

        </div>

        <div className="w-32 border border-gray-400 mt-6 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b130`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.130
          </button>
          
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan B.140
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B140;
