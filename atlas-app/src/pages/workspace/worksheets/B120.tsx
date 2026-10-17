import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

interface AccountItem {
  no: number;
  name: string;
  index: string;
  route: string;
  defaultKesimpulan: string;
}

const DEFAULT_ACCOUNTS: AccountItem[] = [
  { no: 1, name: 'Kas dan setara kas', index: 'I', route: 'b210', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 2, name: 'Piutang usaha', index: 'II', route: 'b220', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 3, name: 'Uang muka dan beban dibayar dimuka', index: 'III', route: 'b230', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 4, name: 'Persediaan', index: 'IV', route: 'b240', defaultKesimpulan: 'Akun tersebut belum sepenuhnya disajikan secara wajar' },
  { no: 5, name: 'Investasi', index: 'V', route: 'b250', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 6, name: 'Properti Investasi', index: 'VI', route: 'b260', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 7, name: 'Aset tetap', index: 'VII', route: 'b270', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 8, name: 'Aset takberwujud', index: 'VIII', route: 'b280', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 9, name: 'Utang usaha', index: 'IX', route: 'b290', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 10, name: 'Utang pajak', index: 'X', route: 'ls-x', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 11, name: 'Utang Bank Jangka Pendek', index: 'XI', route: 'ls-xi', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 12, name: 'Modal disetor', index: 'XII', route: 'ls-xii', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 13, name: 'Saldo laba', index: 'XIII', route: 'ls-xiii', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 14, name: 'Penjualan barang dagangan', index: 'XIV', route: 'ls-xiv', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 15, name: 'Beban pokok pendapatan', index: 'XV', route: 'ls-xv', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
  { no: 16, name: 'Beban administrasi dan umum', index: 'XVI', route: 'ls-xvi', defaultKesimpulan: 'Akun tersebut telah disajikan secara wajar' },
];

const KESIMPULAN_OPTIONS = [
  'Akun tersebut telah disajikan secara wajar',
  'Akun tersebut belum sepenuhnya disajikan secara wajar',
  'Akun tersebut tidak disajikan secara wajar',
  'Belum dilakukan prosedur audit',
];

const B120: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [simpulanAkhir, setSimpulanAkhir] = useState('');

  // Storage key for persistent state
  const storageKey = `atlas_b120_${engagement?.id || 'default'}`;

  // Mapping state for Kesimpulan & Keterangan
  const [rowStates, setRowStates] = useState<Record<number, { kesimpulan: string; keterangan: string }>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    // Default initialization from DEFAULT_ACCOUNTS
    const initial: Record<number, { kesimpulan: string; keterangan: string }> = {};
    DEFAULT_ACCOUNTS.forEach(item => {
      initial[item.no] = {
        kesimpulan: item.defaultKesimpulan,
        keterangan: '',
      };
    });
    return initial;
  });

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rowStates));
    } catch {
      // ignore
    }
  }, [rowStates, storageKey]);

  const handleUpdate = (no: number, field: 'kesimpulan' | 'keterangan', value: string) => {
    setRowStates(prev => ({
      ...prev,
      [no]: {
        ...(prev[no] || { kesimpulan: DEFAULT_ACCOUNTS.find(a => a.no === no)?.defaultKesimpulan || '', keterangan: '' }),
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code="B.120"
      name="Procedures Mapping & Lead Schedule"
      purpose="Memetakan akun yang material dan signifikan ke dalam Lead Schedule serta merangkum kesimpulan audit."
      status="In Progress"
      reviewer={engagement?.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans max-w-full overflow-x-hidden">
        
        {/* ============================================================== */}
        {/* 1. TITLE (Matches official template: Red Italic Serif)         */}
        {/* ============================================================== */}
        <div className="text-center py-1">
          <h1 className="text-xl sm:text-2xl font-serif italic font-bold tracking-wider text-[#c00000] uppercase select-none">
            PROCEDURES MAPPING & LEAD SECHEDULE
          </h1>
        </div>

        {/* ============================================================== */}
        {/* 2. CRITERIA BOX & PROMINENT YELLOW "BANK PROCEDURES" BUTTON     */}
        {/* ============================================================== */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-5 border border-gray-200 rounded-lg shadow-2xs">
          {/* Left: 4 Criteria text */}
          <div className="space-y-1.5 text-xs text-gray-900 leading-relaxed">
            <p className="font-semibold text-gray-900">
              Akun-akun dibawah ini merupakan akun dengan kriteria :
            </p>
            <div className="space-y-1 pl-1 text-[11px] sm:text-xs text-gray-800">
              <div className="flex items-start gap-2">
                <span className="w-4 shrink-0 font-medium">1.</span>
                <span>Akun yang memiliki nilai Material dan termasuk Akun Signifikan; atau</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 shrink-0 font-medium">2.</span>
                <span>Akun yang memiliki nilai Material dan termasuk Akun Tidak Signifikan; atau</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 shrink-0 font-medium">3.</span>
                <span>Akun yang memiliki nilai Tidak Material dan termasuk Akun Signifikan</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 shrink-0 font-medium">4.</span>
                <span>Akun yang berasal dari <em>specific materiality</em></span>
              </div>
            </div>
          </div>

          {/* Right: BANK PROCEDURES Button (Prominent Yellow Rounded Button) */}
          <div className="shrink-0 self-center md:self-center pr-2">
            <button
              type="button"
              onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/bank-prosedur`)}
              className="bg-[#ffff00] hover:bg-[#ffea00] active:scale-95 text-[#c00000] font-black italic text-xs sm:text-sm tracking-wider px-8 py-3 rounded-xl border-2 border-black/80 shadow-[2px_2px_0px_rgba(0,0,0,0.8)] hover:shadow-md transition-all cursor-pointer flex items-center justify-center min-w-[210px] select-none"
              title="Buka Bank Prosedur Audit (Bank Procedures)"
            >
              BANK PROCEDURES
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. MAIN TABLE: EXACT EXCEL STYLING AS IN USER'S IMAGE          */}
        {/* ============================================================== */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Row 1: Top Dual Banners (Brown & Dark Green) */}
              <tr>
                {/* Banner 1: Nama Akun (Brown) */}
                <th 
                  colSpan={2}
                  className="bg-[#6c2e06] text-white font-bold py-2 px-4 text-center border-r border-white/40 text-sm tracking-wide"
                >
                  Nama Akun
                </th>

                {/* Banner 2: Link to Lead Schedule and Audit Procedures (Dark Green) */}
                <th 
                  colSpan={3}
                  className="bg-[#1c4424] text-white font-bold py-2 px-4 text-center text-sm tracking-wide"
                >
                  Link to Lead Schedule and Audit Procedures
                </th>
              </tr>

              {/* Row 2: Sub Headers */}
              <tr className="bg-slate-50 text-gray-800 border-b-2 border-gray-400 text-xs">
                <th className="py-2 px-2 text-center w-10 text-gray-500 font-bold border-r border-gray-300">#</th>
                <th className="py-2 px-4 font-bold text-gray-800 border-r border-gray-300 min-w-[220px]">
                  Rincian Akun
                </th>
                <th className="py-2 px-3 text-center font-bold text-gray-800 w-24 border-r border-gray-300">
                  Index
                </th>
                <th className="py-2 px-4 text-center font-bold text-gray-800 min-w-[320px] border-r border-gray-300">
                  Kesimpulan
                </th>
                <th className="py-2 px-4 text-center font-bold text-gray-800 min-w-[240px]">
                  Keterangan
                </th>
              </tr>
            </thead>

            <tbody>
              {DEFAULT_ACCOUNTS.map((account) => {
                const state = rowStates[account.no] || {
                  kesimpulan: account.defaultKesimpulan,
                  keterangan: '',
                };

                return (
                  <tr 
                    key={account.no} 
                    className="hover:bg-slate-50/80 transition-colors border-b border-red-300"
                  >
                    {/* Row Number */}
                    <td className="py-1.5 px-2 text-center text-gray-500 font-mono text-[11px] border-r border-gray-200">
                      {account.no}
                    </td>

                    {/* Account Name */}
                    <td className="py-1.5 px-4 font-medium text-gray-900 border-r border-gray-300 text-xs">
                      {account.name}
                    </td>

                    {/* Index (Cyan background pill cell) */}
                    <td className="py-1 px-2 border-r border-gray-300 text-center bg-white">
                      <Link
                        to={`/workspace/${engagement?.id}/worksheet/${account.route}`}
                        className="bg-[#00a8e8] hover:bg-[#0096d1] active:scale-95 text-white font-bold text-xs py-1 px-3 rounded inline-flex items-center justify-center min-w-[50px] shadow-2xs transition-all cursor-pointer"
                        title={`Buka Lead Schedule / Prosedur: ${account.name} (${account.index})`}
                      >
                        {account.index}
                      </Link>
                    </td>

                    {/* Kesimpulan (Blue underlined text with quick switcher) */}
                    <td className="py-1 px-4 border-r border-gray-300 relative group">
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={state.kesimpulan}
                          onChange={(e) => handleUpdate(account.no, 'kesimpulan', e.target.value)}
                          className="w-full bg-transparent text-[#0055d4] hover:text-[#003da0] font-semibold underline text-xs cursor-pointer outline-none border-0 py-1 transition-colors"
                        >
                          {KESIMPULAN_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="text-gray-900 no-underline font-normal">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Keterangan */}
                    <td className="py-1 px-3">
                      <input
                        type="text"
                        value={state.keterangan}
                        onChange={(e) => handleUpdate(account.no, 'keterangan', e.target.value)}
                        placeholder="Keterangan..."
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-red-400 outline-none px-1 py-0.5 text-xs text-gray-800 placeholder:text-gray-300 transition-colors"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ============================================================== */}
        {/* 4. FOOTER SIMPULAN & CAJE/PAJE SUMMARY                         */}
        {/* ============================================================== */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 bg-white p-4 border border-gray-200 rounded-lg">
          <span className="font-bold text-red-700 italic w-44 shrink-0 text-xs">
            Kesimpulan CAJE/PAJE :
          </span>
          <textarea 
            className="flex-1 bg-yellow-50 border border-yellow-300 rounded outline-none p-3 font-medium text-xs text-gray-800 min-h-[50px] resize-none focus:ring-1 focus:ring-yellow-400"
            value={simpulanAkhir}
            onChange={e => setSimpulanAkhir(e.target.value)}
            placeholder="Tuliskan kesimpulan akhir mapping lead schedule secara keseluruhan..."
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
          <button 
            onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/b100`)} 
            className="text-gray-600 hover:text-gray-900 text-xs font-semibold flex items-center px-3 py-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} className="mr-1.5" /> Kembali ke B.100
          </button>
          
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/bank-prosedur`)}
              className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border border-yellow-400 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>Buka Bank Procedures</span>
            </button>

            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded-lg text-xs font-bold hover:bg-blue-800 shadow-2xs transition-all cursor-pointer"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5 text-emerald-300" /> : <Save size={14} className="mr-1.5" />}
              <span>{isSaved ? 'Tersimpan!' : 'Simpan B.120'}</span>
            </button>

            <button 
              onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/b130`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue hover:bg-blue-50 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <span>Lanjut B.130</span> 
              <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B120;
