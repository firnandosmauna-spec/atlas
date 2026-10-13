import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft } from 'lucide-react';

const B110 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [labaRugiTahunBerjalan, setLabaRugiTahunBerjalan] = useState('');
  const [ekuitasLainnya, setEkuitasLainnya] = useState('');

  const tb = engagement.trialBalance || [
    { name: "Kas dan Setara Kas", group: "Aset", endingBalance: 1500000000 },
    { name: "Piutang Usaha", group: "Aset", endingBalance: 2500000000 },
    { name: "Persediaan", group: "Aset", endingBalance: 3000000000 },
    { name: "Aset Tetap", group: "Aset", endingBalance: 12000000000 },
    { name: "Hutang Usaha", group: "Kewajiban", endingBalance: -4000000000 },
    { name: "Modal Saham", group: "Ekuitas", endingBalance: -10000000000 },
    { name: "Laba Ditahan", group: "Ekuitas", endingBalance: -2000000000 },
    { name: "Pendapatan Jasa", group: "Pendapatan", endingBalance: -8000000000 },
    { name: "Beban Gaji", group: "Beban", endingBalance: 3000000000 },
    { name: "Beban Operasional", group: "Beban", endingBalance: 2000000000 },
  ];

  // Dummy CAJE data (in real app, this should come from B130)
  const cajeData: Record<string, { debet: number, kredit: number }> = {
    "Piutang Usaha": { debet: 50000000, kredit: 0 },
    "Pendapatan Jasa": { debet: 0, kredit: 50000000 },
  };

  const formatCurrency = (val: number) => {
    if (val === 0) return '-';
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(absVal);
    return isNegative ? `(${formatted})` : formatted;
  };

  const calculateAuditBalance = (group: string, bookBalance: number, debet: number, kredit: number) => {
    // Normal balance logic (simplified)
    const isDebitNormal = ['Aset', 'Beban'].includes(group);
    if (isDebitNormal) {
      return bookBalance + debet - kredit;
    } else {
      return bookBalance - debet + kredit; // Since liability/equity/revenue are stored as negative or we treat credit as positive here? Let's just do mathematical addition if TB uses signs.
    }
  };

  const tableData = useMemo(() => {
    return tb.map((item, index) => {
      const caje = cajeData[item.name] || { debet: 0, kredit: 0 };
      // Assuming endingBalance is already properly signed (+ for Dr, - for Cr)
      const auditBalance = item.endingBalance + caje.debet - caje.kredit;
      
      // Determine Lead Schedule (dummy logic)
      let ls = 'A';
      if (item.group === 'Kewajiban') ls = 'C';
      if (item.group === 'Ekuitas') ls = 'E';
      if (item.group === 'Pendapatan') ls = 'PL1';
      if (item.group === 'Beban') ls = 'PL2';

      return {
        noAkun: `100${index + 1}`,
        namaAkun: item.name,
        saldoBook: item.endingBalance,
        ls: ls,
        cajeDebet: caje.debet,
        cajeKredit: caje.kredit,
        saldoAudit: auditBalance
      };
    });
  }, [tb]);

  const totalAsetAudit = tableData.filter(d => ['Aset'].includes(tb.find(t => t.name === d.namaAkun)?.group || '')).reduce((sum, d) => sum + d.saldoAudit, 0);
  const totalPasivaAudit = tableData.filter(d => ['Kewajiban', 'Ekuitas'].includes(tb.find(t => t.name === d.namaAkun)?.group || '')).reduce((sum, d) => sum + Math.abs(d.saldoAudit), 0);
  
  // Dummy selisih neraca
  const selisihNeraca = totalAsetAudit - totalPasivaAudit;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="B.110"
      name="Worksheet Trial Balance (WTB)"
      purpose="Rangkuman angka laporan keuangan dari angka saldo awal sampai dengan angka final hasil audit."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Info Box */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini merupakan rangkuman angka laporan keuangan dari angka saldo awal sampai dengan angka final hasil audit setelah terdapat penyesuaian CAJE/PAJE.</p>
        </div>

        {/* Top Dropdowns */}
        <div className="bg-green-100/50 border border-green-500 p-3 w-max">
          <div className="font-bold text-gray-800 mb-2 border-b border-green-600 pb-1">
            Pilihlah akun yang sesuai dengan Laba/Rugi tahun berjalan dan Ekuitas lainnya/OCI:
          </div>
          <div className="grid grid-cols-[180px_20px_300px] gap-y-2 items-center font-medium">
            <div>Laba/Rugi Tahun Berjalan</div>
            <div className="text-center">:</div>
            <div>
              <select className="w-full border border-gray-400 outline-none p-1 bg-white" value={labaRugiTahunBerjalan} onChange={e => setLabaRugiTahunBerjalan(e.target.value)}>
                <option value="">- Pilih Akun -</option>
                {tb.filter(t => t.group === 'Ekuitas').map(t => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
                <option value="auto_laba_ditahan">Laba Ditahan</option>
              </select>
            </div>

            <div>Ekuitas lainnya/OCI</div>
            <div className="text-center">:</div>
            <div>
              <select className="w-full border border-gray-400 outline-none p-1 bg-white" value={ekuitasLainnya} onChange={e => setEkuitasLainnya(e.target.value)}>
                <option value="">- Pilih Akun -</option>
                {tb.filter(t => t.group === 'Ekuitas').map(t => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
                <option value="none">Tidak Ada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main WTB Table */}
        <div className="bg-white border border-blue-900 overflow-x-auto shadow-sm mt-4">
          <div className="bg-blue-900 text-white font-bold py-1 px-2 text-[10px] uppercase tracking-wider text-center border-b border-blue-950">
            WORKSHEET TRIAL BALANCE
          </div>
          
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-3 border border-gray-300 font-bold text-red-700 text-center w-24 align-middle" rowSpan={2}>NO AKUN</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-red-700 text-center w-64 align-middle" rowSpan={2}>NAMA AKUN</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-red-700 text-center w-32 align-middle" rowSpan={2}>SALDO PER BOOK</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-red-700 text-center w-24 align-middle leading-tight" rowSpan={2}>Lead Schedule</th>
                <th className="px-2 py-1 border border-gray-300 font-bold text-red-700 text-center" colSpan={2}>JURNAL KOREKSI/REKLASIFIKASI</th>
                <th className="px-2 py-3 border border-gray-300 font-bold text-red-700 text-center w-32 align-middle" rowSpan={2}>SALDO PER AUDIT</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border border-gray-300 font-bold text-red-700 text-center w-28">DEBET</th>
                <th className="px-2 py-1 border border-gray-300 font-bold text-red-700 text-center w-28">KREDIT</th>
              </tr>
            </thead>
            <tbody>
              {/* Control Balance Row (Neraca check) */}
              <tr>
                <td colSpan={6} className="bg-white border-0 border-r border-gray-300"></td>
                <td className="px-2 py-1 border border-gray-300 bg-cyan-100 text-right font-mono font-bold text-cyan-900" title="Selisih Aset dan Pasiva (Seharusnya 0)">
                  {selisihNeraca === 0 ? '-' : formatCurrency(selisihNeraca)}
                </td>
              </tr>

              {/* Data Rows */}
              {tableData.map((row) => (
                <tr key={row.noAkun} className="hover:bg-slate-50 transition-colors">
                  <td className="px-2 py-1 border border-gray-300 text-center font-mono text-gray-700">{row.noAkun}</td>
                  <td className="px-2 py-1 border border-gray-300 font-bold text-gray-800">{row.namaAkun}</td>
                  <td className="px-2 py-1 border border-gray-300 text-right font-mono">{formatCurrency(row.saldoBook)}</td>
                  <td className="px-2 py-1 border border-gray-300 text-center font-bold text-blue-700 underline cursor-pointer hover:bg-blue-50 transition-colors">{row.ls}</td>
                  <td className="px-2 py-1 border border-gray-300 text-right font-mono text-gray-600">{formatCurrency(row.cajeDebet)}</td>
                  <td className="px-2 py-1 border border-gray-300 text-right font-mono text-gray-600">{formatCurrency(row.cajeKredit)}</td>
                  <td className="px-2 py-1 border border-gray-300 text-right font-mono font-bold">{formatCurrency(row.saldoAudit)}</td>
                </tr>
              ))}
              
              {/* Grand Totals */}
              <tr className="bg-gray-200/60 font-bold">
                <td colSpan={2} className="px-2 py-2 border border-gray-300 text-right">TOTAL</td>
                <td className="px-2 py-2 border border-gray-300 text-right font-mono">{formatCurrency(tableData.reduce((s, d) => s + d.saldoBook, 0))}</td>
                <td className="px-2 py-2 border border-gray-300 bg-gray-100"></td>
                <td className="px-2 py-2 border border-gray-300 text-right font-mono">{formatCurrency(tableData.reduce((s, d) => s + d.cajeDebet, 0))}</td>
                <td className="px-2 py-2 border border-gray-300 text-right font-mono">{formatCurrency(tableData.reduce((s, d) => s + d.cajeKredit, 0))}</td>
                <td className="px-2 py-2 border border-gray-300 text-right font-mono">{formatCurrency(tableData.reduce((s, d) => s + d.saldoAudit, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="w-32 border border-gray-400 mt-4 text-center">
          <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
          <div className="bg-cyan-200 text-cyan-900 font-bold py-1.5 text-[10px]">Incompleted</div>
        </div>

        {/* Action */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b100`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke Indeks B.100
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
          >
            {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Simpan WTB
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B110;
