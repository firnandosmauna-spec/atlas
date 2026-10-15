import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabaseClient';
import { useEngagementStore } from '../store/engagementStore';
import type { Engagement } from '../store/engagementStore';

interface EngagementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Engagement | null;
}

const EngagementFormModal = ({ isOpen, onClose, initialData = null }: EngagementFormModalProps) => {
  const { addEngagement, updateEngagement, addAuditLog } = useEngagementStore();
  const [partners, setPartners] = useState<{name: string}[]>([]);
  const [managers, setManagers] = useState<{name: string}[]>([]);
  const [auditors, setAuditors] = useState<{name: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const { data } = await supabase.from('users').select('full_name, roles!inner(name)');
      if (data && data.length > 0) {
        setPartners(data.filter((u: any) => u.roles?.name === 'Partner').map((u: any) => ({ name: u.full_name })));
        setManagers(data.filter((u: any) => u.roles?.name === 'Manager').map((u: any) => ({ name: u.full_name })));
        setAuditors(data.filter((u: any) => u.roles?.name?.includes('Auditor') || u.roles?.name === 'Staff / Junior').map((u: any) => ({ name: u.full_name })));
      } else {
        setPartners([{ name: 'Herika' }, { name: 'Budi (Partner)' }]);
        setManagers([{ name: 'Joko (Manager)' }, { name: 'Siti (Manager)' }]);
        setAuditors([{ name: 'Andi (Senior)' }, { name: 'Rina (Junior)' }, { name: 'User' }]);
      }
    } catch (e) {
      setPartners([{ name: 'Herika' }, { name: 'Budi (Partner)' }]);
      setManagers([{ name: 'Joko (Manager)' }, { name: 'Siti (Manager)' }]);
      setAuditors([{ name: 'Andi (Senior)' }, { name: 'Rina (Junior)' }, { name: 'User' }]);
    }
  };
  
  const { register, handleSubmit, formState: { errors } } = useForm<Engagement>({
    defaultValues: initialData || {
      status: 'Draft',
      progress: 0,
      engagementType: 'First Year',
      accountingStandard: 'SAK_UMUM',
      currency: 'IDR',
      presentationUnit: 'Full'
    }
  });

  const onSubmit = (data: Engagement) => {
    if (initialData) {
      updateEngagement(initialData.id, data);
      addAuditLog({
        engagementId: initialData.id,
        user: data.partnerName || 'User',
        action: 'Memperbarui Perikatan',
        module: 'Engagement',
        record: data.clientName,
      });
    } else {
      // Create logic
      const newEng: Engagement = {
        ...data,
        id: data.id || `ENG-${data.fiscalYear || new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status: 'Draft',
        progress: 0,
      };
      addEngagement(newEng);
      addAuditLog({
        engagementId: newEng.id,
        user: newEng.partnerName || 'User',
        action: 'Membuat Perikatan',
        module: 'Engagement',
        record: newEng.clientName,
        newValue: 'Draft'
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-200 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">
              {initialData ? 'Edit Engagement' : 'Buat Engagement Baru'}
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Setup awal Master Data Perikatan</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-900 p-1 hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            
            {/* ── 2. Identitas Klien (Dimulai dari sini di form) ── */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Identitas Klien</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Nama Entitas Klien *</label>
                <input 
                  {...register('clientName', { required: true })} 
                  className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all" 
                  placeholder="Mis: PT Kertas Makmur" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Alamat Lengkap</label>
                <input 
                  {...register('clientAddress' as any)} 
                  className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all" 
                  placeholder="Jalan, Kota, Provinsi, Kode Pos" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Bidang Usaha / Industri</label>
                <input 
                  {...register('clientIndustry' as any)} 
                  className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all" 
                  placeholder="Mis: Manufaktur, Jasa" 
                />
              </div>
            </div>

            {/* ── 3. Informasi Perikatan ── */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Informasi Perikatan</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Periode Audit</label>
                  <input 
                    type="date"
                    {...register('auditPeriod')} 
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Tahun Buku</label>
                  <input 
                    type="date"
                    {...register('fiscalYear')} 
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Jenis Perikatan</label>
                  <select 
                    {...register('engagementType')} 
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all bg-white"
                  >
                    <option value="First Year">Tahun Pertama</option>
                    <option value="Recurring">Berkelanjutan (Recurring)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Standar Akuntansi</label>
                  <select 
                    {...register('accountingStandard')} 
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all bg-white"
                  >
                    <option value="SAK_UMUM">SAK Umum</option>
                    <option value="SAK_ETAP">SAK ETAP</option>
                    <option value="SAK_EMKM">SAK EMKM</option>
                    <option value="PSAK_SYARIAH">PSAK Syariah</option>
                    <option value="SAP">SAP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Mata Uang</label>
                  <select 
                    {...register('currency')} 
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all bg-white"
                  >
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="USD">USD (Dolar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Satuan</label>
                  <select 
                    {...register('presentationUnit')} 
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all bg-white"
                  >
                    <option value="Full">Penuh</option>
                    <option value="Thousands">Ribuan</option>
                    <option value="Millions">Jutaan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── 1. Tim Perikatan ── */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Identitas Auditor & Tim</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Partner</label>
                  <select 
                    {...register('partnerName')} 
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all bg-white"
                  >
                    <option value="">-- Pilih Partner --</option>
                    {partners.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Manager</label>
                  <select 
                    {...register('managerName')} 
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all bg-white"
                  >
                    <option value="">-- Pilih Manager --</option>
                    {managers.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Auditor In-Charge</label>
                  <select 
                    {...register('auditorName')} 
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-all bg-white"
                  >
                    <option value="">-- Pilih Auditor --</option>
                    {auditors.map(a => (
                      <option key={a.name} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors min-h-[44px] flex items-center justify-center rounded"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors min-h-[44px] flex items-center justify-center rounded"
            >
              {initialData ? 'Simpan Perubahan' : 'Buat Engagement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EngagementFormModal;
