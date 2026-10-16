import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEngagementStore } from '../../store/engagementStore';
import type { Engagement, Account } from '../../store/engagementStore';
import { Upload, Plus, Save, ArrowLeft, Search, Filter, AlertTriangle, CheckCircle, Calculator, Trash2 } from 'lucide-react';
import ExcelImportModal from '../../components/ExcelImportModal';
import ExportMenu from '../../components/ExportMenu';

const GROUPS = ['Aset', 'Liabilitas', 'Ekuitas', 'Pendapatan', 'Beban'];
const SUB_GROUPS = ['Aset Lancar', 'Aset Tidak Lancar', 'Liabilitas Jangka Pendek', 'Liabilitas Jangka Panjang', 'Modal', 'Pendapatan Usaha', 'Pendapatan Lain-lain', 'Beban Operasional', 'Beban Pokok Penjualan'];

const TrialBalance = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const updateEngagement = useEngagementStore(state => state.updateEngagement);
  
  const [accounts, setAccounts] = useState<Account[]>(engagement.trialBalance || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Math.abs(val));
  };

  const handleSave = () => {
    updateEngagement(engagement.id, { trialBalance: accounts });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleOpenImport = () => {
    setShowImport(true);
  };

  const handleAddManual = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      code: '',
      name: '',
      group: '',
      subGroup: '',
      debit: 0,
      credit: 0,
      endingBalance: 0
    };
    setAccounts([newAccount, ...accounts]);
  };

  const handleEditAccount = (id: string, field: keyof Account, value: string | number) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const updated = { ...acc, [field]: value };
        if (field === 'debit' || field === 'credit') {
          updated.endingBalance = (Number(updated.debit) || 0) - (Number(updated.credit) || 0);
        }
        return updated;
      }
      return acc;
    }));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  // Calculations
  const totalDebit = accounts.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = accounts.reduce((sum, acc) => sum + acc.credit, 0);
  const isBalanced = totalDebit === totalCredit;
  
  const totalPendapatan = accounts.filter(a => a.group === 'Pendapatan').reduce((sum, a) => sum + Math.abs(a.endingBalance), 0);
  const totalBeban = accounts.filter(a => a.group === 'Beban').reduce((sum, a) => sum + Math.abs(a.endingBalance), 0);
  const profitLoss = totalPendapatan - totalBeban;

  return (
    <div className="h-full flex flex-col -m-6 bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shrink-0 z-10 sticky top-0 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('..')} className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Financial Statement & Trial Balance</h1>
            <p className="text-gray-500 text-sm mt-1">
              {engagement.clientName} | Tahun: {engagement.auditPeriod || engagement.fiscalYear} 
              <span className="mx-2">|</span> Mata Uang: <strong>{engagement.currency}</strong> 
              <span className="mx-2">|</span> Satuan: <strong>{engagement.presentationUnit}</strong>
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <div className="flex border border-gray-200 p-1 mr-4">
            <button onClick={handleOpenImport} className="flex items-center px-4 py-2 bg-gray-100 font-semibold text-sm text-gray-900 transition-colors hover:bg-gray-200">
              <Upload size={16} className="mr-2" /> Import Excel/CSV
            </button>
            <button onClick={handleAddManual} className="flex items-center px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors">
              <Plus size={16} className="mr-2" /> Input Manual
            </button>
          </div>
          <ExportMenu worksheetCode="TrialBalance" clientName={engagement?.clientName} />
          <button onClick={handleSave} className="px-5 py-2 bg-gray-950 text-white font-semibold hover:bg-gray-800 flex items-center transition-colors">
            {isSaved ? <CheckCircle size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
            {isSaved ? 'Tersimpan' : 'Simpan Pemetaan'}
          </button>
        </div>
      </div>

      {/* Warnings & Alerts */}
      <div className="px-8 pt-6 pb-2 shrink-0 space-y-3">
        {!isBalanced && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
            <AlertTriangle className="text-red-500 mr-3 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-red-800">Peringatan Validasi: Neraca Saldo Tidak Balance!</h3>
              <p className="text-sm text-red-700 mt-1">Total Debit ({formatCurrency(totalDebit)}) tidak sama dengan Total Kredit ({formatCurrency(totalCredit)}). Selisih: {formatCurrency(Math.abs(totalDebit - totalCredit))}. Pastikan data telah ter-upload dengan benar sebelum masuk ke worksheet Materialitas (A.210).</p>
            </div>
          </div>
        )}
        
        {duplicateWarning && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 flex items-start">
            <AlertTriangle className="text-amber-500 mr-3 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-amber-800">Peringatan: Terdapat Duplikasi Header!</h3>
              <p className="text-sm text-amber-700 mt-1">Sistem mendeteksi adanya duplikasi kode akun atau baris kosong (blank rows) pada file Excel/CSV. Sistem secara otomatis telah memotong baris tersebut, namun mohon periksa kembali.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tools & Summary */}
      <div className="px-8 py-4 shrink-0 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        
        <div className="flex items-center space-x-3 w-full xl:w-auto">
          <div className="relative w-full xl:w-64">
            <input 
              type="text" 
              placeholder="Cari kode atau nama akun..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button className="p-2.5 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 shrink-0">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex flex-wrap space-x-4 bg-white p-3 border border-gray-200 w-full xl:w-auto">
          <div className="px-4 border-r border-gray-200 flex items-center">
            <Calculator className="text-gray-400 mr-3" />
            <div>
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Total Debit</div>
              <div className="text-base font-bold text-gray-900">{formatCurrency(totalDebit)}</div>
            </div>
          </div>
          <div className="px-4 border-r border-gray-200">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Total Kredit</div>
            <div className="text-base font-bold text-gray-900">{formatCurrency(totalCredit)}</div>
          </div>
          <div className="px-4 border-r border-gray-200">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Profit/Loss (Laba Bersih)</div>
            <div className={`text-base font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profitLoss)}
            </div>
          </div>
          <div className={`px-4 py-2 ml-2 flex items-center justify-center font-bold text-sm ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isBalanced ? 'BALANCED' : 'UNBALANCED'}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-hidden px-8 pb-8">
        <div className="h-full bg-white border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse relative min-w-max">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 text-sm">Account Code</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 text-sm">Account Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 text-sm">Group (Mapping)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 text-sm">Sub Group</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 text-sm text-right">Debit</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 text-sm text-right">Credit</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 text-sm text-right">Ending Balance</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 text-sm text-center w-12">Act</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.includes(searchTerm)).map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      <input 
                        type="text" 
                        value={acc.code} 
                        onChange={e => handleEditAccount(acc.id, 'code', e.target.value)}
                        placeholder="Kode"
                        className="w-full bg-transparent outline-none border-b border-transparent focus:border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <input 
                        type="text" 
                        value={acc.name} 
                        onChange={e => handleEditAccount(acc.id, 'name', e.target.value)}
                        placeholder="Nama Akun"
                        className="w-full bg-transparent outline-none border-b border-transparent focus:border-gray-300 min-w-[150px]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        className="w-full border border-gray-200 rounded p-1.5 text-sm focus:border-atlas-blue outline-none bg-transparent hover:bg-white"
                        value={acc.group}
                        onChange={(e) => handleEditAccount(acc.id, 'group', e.target.value)}
                      >
                        <option value="">-- Pilih Group --</option>
                        {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        className="w-full border border-gray-200 rounded p-1.5 text-sm focus:border-atlas-blue outline-none bg-transparent hover:bg-white"
                        value={acc.subGroup}
                        onChange={(e) => handleEditAccount(acc.id, 'subGroup', e.target.value)}
                      >
                        <option value="">-- Pilih Sub Group --</option>
                        {SUB_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-700">
                      <input 
                        type="number" 
                        value={acc.debit === 0 ? '' : acc.debit} 
                        onChange={e => handleEditAccount(acc.id, 'debit', Number(e.target.value))}
                        placeholder="0"
                        className="w-full text-right bg-transparent outline-none border-b border-transparent focus:border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-700">
                      <input 
                        type="number" 
                        value={acc.credit === 0 ? '' : acc.credit} 
                        onChange={e => handleEditAccount(acc.id, 'credit', Number(e.target.value))}
                        placeholder="0"
                        className="w-full text-right bg-transparent outline-none border-b border-transparent focus:border-gray-300"
                      />
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-bold ${acc.endingBalance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatCurrency(acc.endingBalance)} {acc.endingBalance < 0 ? '(Cr)' : '(Dr)'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus baris"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="font-semibold text-gray-700">Belum ada akun di Trial Balance</p>
                        <p className="text-xs text-gray-500">Gunakan tombol "+ Tambah Akun" di atas atau "Import Excel" untuk mengisi data neraca saldo klien.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <ExcelImportModal 
        isOpen={showImport} 
        onClose={() => setShowImport(false)} 
        onImportComplete={(data) => {
          console.log('Imported:', data);
          setShowImport(false);
          setDuplicateWarning(true);
          setTimeout(() => setDuplicateWarning(false), 5000);
        }}
        title="Import Data Trial Balance"
      />
    </div>
  );
};

export default TrialBalance;
