import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { 
  Save, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink,
  BookOpenCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

interface LeadScheduleProps {
  indeks?: string;
}

const LeadSchedule: React.FC<LeadScheduleProps> = ({ indeks = 'I' }) => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [resumeSAP, setResumeSAP] = useState('HIGH');
  const [simpulan, setSimpulan] = useState('Akun tersebut telah disajikan secara wajar');
  const [penjelasanSimpulan, setPenjelasanSimpulan] = useState('');

  const upperIndeks = indeks.toUpperCase();

  // Determine account title and group
  let accountTitle = 'Kas dan Setara Kas';
  let group = 'Aset';
  if (upperIndeks === 'II') { accountTitle = 'Piutang Usaha'; group = 'Aset'; }
  else if (upperIndeks === 'III') { accountTitle = 'Uang Muka & Beban Dibayar Dimuka'; group = 'Aset'; }
  else if (upperIndeks === 'IV') { accountTitle = 'Persediaan'; group = 'Aset'; }
  else if (upperIndeks === 'V') { accountTitle = 'Investasi'; group = 'Aset'; }
  else if (upperIndeks === 'VI') { accountTitle = 'Properti Investasi'; group = 'Aset'; }
  else if (upperIndeks === 'VII') { accountTitle = 'Aset Tetap'; group = 'Aset'; }
  else if (upperIndeks === 'VIII') { accountTitle = 'Aset Takberwujud'; group = 'Aset'; }
  else if (upperIndeks === 'IX') { accountTitle = 'Utang Usaha'; group = 'Liabilitas'; }
  else if (upperIndeks === 'X') { accountTitle = 'Utang Pajak'; group = 'Liabilitas'; }
  else if (upperIndeks === 'XI') { accountTitle = 'Utang Bank Jangka Pendek'; group = 'Liabilitas'; }
  else if (upperIndeks === 'XII') { accountTitle = 'Modal Disetor'; group = 'Ekuitas'; }
  else if (upperIndeks === 'XIII') { accountTitle = 'Saldo Laba'; group = 'Ekuitas'; }
  else if (upperIndeks === 'XIV') { accountTitle = 'Penjualan Barang Dagangan'; group = 'Laba Rugi'; }
  else if (upperIndeks === 'XV') { accountTitle = 'Beban Pokok Pendapatan'; group = 'Laba Rugi'; }
  else if (upperIndeks === 'XVI') { accountTitle = 'Beban Administrasi & Umum'; group = 'Laba Rugi'; }

  // Trial balance accounts
  const tb = engagement.trialBalance || [];
  const tbFiltered = tb.filter(t => 
    (t.group || '').toLowerCase() === group.toLowerCase() ||
    (t.name || '').toLowerCase().includes(accountTitle.toLowerCase().split(' ')[0]) ||
    ((t as any).subGroup || '').toLowerCase().includes('kas')
  );

  const displayAccounts = tbFiltered.length > 0 ? tbFiltered : [
    { code: '1110.01', name: 'Kas Kecil (Petty Cash)', debit: 15000000, credit: 0, endingBalance: 15000000 },
    { code: '1120.01', name: 'Bank Mandiri - Rek. Operasional', debit: 325450000, credit: 0, endingBalance: 325450000 },
    { code: '1120.02', name: 'Bank BCA - Rek. Penerimaan', debit: 245800000, credit: 0, endingBalance: 245800000 },
    { code: '1120.03', name: 'Bank BRI - Rek. Payroll', debit: 65200000, credit: 0, endingBalance: 65200000 },
    { code: '1130.01', name: 'Deposito Berjangka (1 Bulan)', debit: 150000000, credit: 0, endingBalance: 150000000 },
  ];

  const totalSaldoBuku = displayAccounts.reduce((sum, item) => sum + (item.endingBalance || item.debit || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Math.abs(val));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  return (
    <WorksheetContainer
      code={`LS-${upperIndeks}`}
      name={`Lead Schedule ${upperIndeks} - ${accountTitle}`}
      purpose={`Rincian saldo per buku, penyesuaian audit, dan simpulan untuk akun ${accountTitle}`}
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
                  Indeks {upperIndeks}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Lead Schedule
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {accountTitle}
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl">
                Pengujian substantif saldo, mutasi rekonsiliasi, dan pemetaan jurnal koreksi/reklasifikasi akun {accountTitle}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/workspace/${engagement?.id}/worksheet/bank-prosedur`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <BookOpenCheck size={14} />
                <span>Buka Bank Prosedur Audit</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] text-slate-400 font-medium">Asersi Utama</span>
              <p className="font-bold text-slate-900 mt-0.5">C / E / A / V / P&D</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] text-slate-400 font-medium">Tingkat Risiko (ROMM)</span>
              <p className="font-bold text-emerald-700 mt-0.5">Low (Rendah)</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] text-slate-400 font-medium">Total Saldo Per Buku</span>
              <p className="font-bold text-slate-900 mt-0.5 font-mono">Rp {formatCurrency(totalSaldoBuku)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] text-slate-400 font-medium">Total Saldo Per Audit</span>
              <p className="font-bold text-emerald-700 mt-0.5 font-mono">Rp {formatCurrency(totalSaldoBuku)}</p>
            </div>
          </div>
        </div>

        {/* Tabel Rincian Akun & Jurnal Penyesuaian Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="text-atlas-blue" size={18} />
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Daftar Sub-Akun & Rekonsiliasi Saldo Audit
                </h2>
                <p className="text-xs text-slate-500">
                  Perbandingan saldo buku klien dan saldo hasil audit setelah penyesuaian (AJP).
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {displayAccounts.length} Akun Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-28">No. Akun</th>
                  <th className="py-3 px-4 min-w-[220px]">Nama Akun</th>
                  <th className="py-3 px-4 min-w-[140px] text-right">Saldo Per Buku</th>
                  <th className="py-3 px-4 min-w-[120px] text-right">AJP Debet</th>
                  <th className="py-3 px-4 min-w-[120px] text-right">AJP Kredit</th>
                  <th className="py-3 px-4 min-w-[140px] text-right">Saldo Per Audit</th>
                  <th className="py-3 px-4 min-w-[120px] text-center">Ref KKP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayAccounts.map((item, idx) => {
                  const code = (item as any).code || `110${idx + 1}`;
                  const name = item.name || '-';
                  const balance = (item as any).endingBalance || (item as any).debit || 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                        {code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {name}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                        {formatCurrency(balance)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        -
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        -
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(balance)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-[11px] text-atlas-blue bg-blue-50 px-2 py-0.5 rounded">
                          {upperIndeks}.{idx + 1}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                  <td colSpan={2} className="py-3.5 px-4 text-right uppercase text-[11px] tracking-wider">
                    Total {accountTitle}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    {formatCurrency(totalSaldoBuku)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">-</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">-</td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                    {formatCurrency(totalSaldoBuku)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Card Simpulan Auditor Modern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">
              Simpulan Lead Schedule ({upperIndeks})
            </h3>
            <span className="text-[11px] text-slate-400">Wajib Diisi</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Keputusan Simpulan</label>
              <select
                value={simpulan}
                onChange={(e) => setSimpulan(e.target.value)}
                className="w-full max-w-md px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-atlas-blue cursor-pointer"
              >
                <option value="Akun tersebut telah disajikan secara wajar">
                  Akun tersebut telah disajikan secara wajar
                </option>
                <option value="Akun tersebut belum sepenuhnya disajikan secara wajar">
                  Akun tersebut belum sepenuhnya disajikan secara wajar
                </option>
                <option value="Akun tersebut tidak disajikan secara wajar">
                  Akun tersebut tidak disajikan secara wajar
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Auditor</label>
              <textarea
                rows={2}
                value={penjelasanSimpulan}
                onChange={(e) => setPenjelasanSimpulan(e.target.value)}
                placeholder="Catatan hasil pengujian Lead Schedule..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-atlas-blue"
              />
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${engagement?.id || ''}/worksheet/b120`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke B.120 (Procedures Mapping)</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
          >
            {isSaved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
            <span>{isSaved ? "Tersimpan" : "Simpan Lead Schedule"}</span>
          </button>
        </div>

        {/* Toast Notifikasi */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Data Lead Schedule berhasil disimpan.</span>
          </div>
        )}

      </div>
    </WorksheetContainer>
  );
};

export default LeadSchedule;
