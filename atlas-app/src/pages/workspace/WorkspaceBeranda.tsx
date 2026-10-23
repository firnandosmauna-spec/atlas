import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../store/engagementStore';
import { useEngagementStore } from '../../store/engagementStore';
import { useAuthStore } from '../../store/authStore';
import { useAccountingStandardStore } from '../../store/accountingStandardStore';
import { Users, Building, FileSpreadsheet, Save, CheckCircle, Edit2, X, Plus } from 'lucide-react';
import EngagementFormModal from '../../components/EngagementFormModal';

// ─── Field renderers ────────────────────────────────────────────────
const FieldRow = ({
  label,
  value,
  editing,
  editNode,
}: {
  label: string;
  value: React.ReactNode;
  editing: boolean;
  editNode?: React.ReactNode;
}) => (
  <div className="py-3 border-b border-gray-100 last:border-0">
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    {editing && editNode ? editNode : (
      <p className="text-sm font-medium text-gray-900">{value || <span className="text-gray-400 italic">—</span>}</p>
    )}
  </div>
);

const inputCls = 'w-full border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none bg-white';
const selectCls = `${inputCls}`;

// ─── Helpers ────────────────────────────────────────────────────────
const ENGAGEMENT_TYPE_LABELS: Record<string, string> = {
  'First Year': 'Perikatan Tahun Pertama',
  'Recurring': 'Perikatan Berkelanjutan (Recurring)',
};
const STANDARD_LABELS: Record<string, string> = {
  SAK_UMUM: 'SAK Umum (PSAK)',
  SAK_ETAP: 'SAK ETAP',
  SAK_EMKM: 'SAK EMKM',
  PSAK_SYARIAH: 'PSAK Syariah',
  SAP: 'SAP (Pemerintah)',
};
const UNIT_LABELS: Record<string, string> = {
  Full: 'Penuh (Full)',
  Thousands: 'Ribuan (Rp 000)',
  Millions: 'Jutaan (Rp 000.000)',
};

// ─── Section Card ────────────────────────────────────────────────────
const SectionCard = ({
  number,
  icon,
  title,
  editing,
  canEdit = true,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  editing: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) => (
  <div className="border border-gray-200 bg-white">
    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-bold text-gray-400">{number}</span>
        {icon}
        <h2 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <X size={12} /> Batal
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-gray-900 hover:bg-gray-700 transition-colors"
            >
              <Save size={12} /> Simpan
            </button>
          </>
        ) : (
          canEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Edit2 size={12} /> Edit
            </button>
          )
        )}
      </div>
    </div>
    <div className="px-5">{children}</div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────
const WorkspaceBeranda = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const updateEngagement = useEngagementStore(state => state.updateEngagement);
  const { hasPermission } = useAuthStore();
  const canEdit = hasPermission('fill_worksheet');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { standards, getStandardName } = useAccountingStandardStore();

  // ── Section 1: Auditor & Tim ──
  const [editAuditor, setEditAuditor] = useState(false);
  const [auditorForm, setAuditorForm] = useState({
    partnerName: engagement.partnerName || '',
    managerName: engagement.managerName || '',
    auditorName: engagement.auditorName || '',
  });
  const [savedAuditor, setSavedAuditor] = useState(false);

  const handleSaveAuditor = () => {
    updateEngagement(engagement.id, auditorForm);
    setEditAuditor(false);
    setSavedAuditor(true);
    setTimeout(() => setSavedAuditor(false), 2000);
  };

  // ── Section 2: Identitas Klien ──
  const [editKlien, setEditKlien] = useState(false);
  const [klienForm, setKlienForm] = useState({
    clientName: engagement.clientName || '',
    clientAddress: (engagement as any).clientAddress || '',
    clientIndustry: (engagement as any).clientIndustry || '',
    auditPeriod: engagement.auditPeriod || '',
  });
  const [savedKlien, setSavedKlien] = useState(false);

  const handleSaveKlien = () => {
    updateEngagement(engagement.id, {
      clientName: klienForm.clientName,
      auditPeriod: klienForm.auditPeriod,
    } as any);
    setEditKlien(false);
    setSavedKlien(true);
    setTimeout(() => setSavedKlien(false), 2000);
  };

  // ── Section 3: Informasi Perikatan ──
  const [editPerikatan, setEditPerikatan] = useState(false);
  const [perikatanForm, setPerikatanForm] = useState({
    engagementType: engagement.engagementType || 'Recurring',
    accountingStandard: engagement.accountingStandard || 'SAK_UMUM',
    fiscalYear: engagement.fiscalYear || '',
    currency: engagement.currency || 'IDR',
    presentationUnit: engagement.presentationUnit || 'Full',
    startDate: engagement.startDate || '',
    targetDate: engagement.targetDate || '',
  });
  const [savedPerikatan, setSavedPerikatan] = useState(false);

  const handleSavePerikatan = () => {
    updateEngagement(engagement.id, perikatanForm as any);
    setEditPerikatan(false);
    setSavedPerikatan(true);
    setTimeout(() => setSavedPerikatan(false), 2000);
  };

  return (
    <div className="w-full space-y-0">

      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-1">Beranda Perikatan</p>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Data Master Perikatan</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Data identitas yang digunakan sebagai referensi otomatis di seluruh kertas kerja.
            Nomor Perikatan: <span className="font-mono font-semibold text-gray-700">{engagement.id}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasPermission('create_engagement') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-atlas-blue hover:bg-blue-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 rounded cursor-pointer min-h-[44px]"
              title="Buat perikatan audit baru"
            >
              <Plus size={15} />
              <span>Buat Engagement Baru</span>
            </button>
          )}

          <div className="bg-white border border-gray-200 px-4 py-2.5 flex flex-col min-w-[180px]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Overall Progress</span>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 w-28">
                <div 
                  className="h-1.5 bg-gray-900 transition-all duration-500" 
                  style={{ width: `${engagement.progress || 0}%` }}
                />
              </div>
              <span className="text-base font-bold text-gray-900 leading-none">{engagement.progress || 0}%</span>
            </div>
          </div>
        </div>
      </div>


      {/* ── 1. Identitas Auditor dan Tim Perikatan ── */}
      <div className="mb-6">
        <SectionCard
          number="1."
          icon={<Users size={15} className="text-gray-600" />}
          title="Identitas Auditor dan Tim Perikatan"
          editing={editAuditor}
          canEdit={canEdit}
          onEdit={() => setEditAuditor(true)}
          onCancel={() => { setEditAuditor(false); setAuditorForm({ partnerName: engagement.partnerName, managerName: engagement.managerName, auditorName: engagement.auditorName }); }}
          onSave={handleSaveAuditor}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Partner */}
            <div className="py-4 md:pr-6">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Partner (Signing Partner)</p>
              <FieldRow
                label="Nama Lengkap"
                value={auditorForm.partnerName}
                editing={editAuditor}
                editNode={
                  <input
                    className={inputCls}
                    value={auditorForm.partnerName}
                    onChange={e => setAuditorForm(f => ({ ...f, partnerName: e.target.value }))}
                    placeholder="Nama Partner"
                  />
                }
              />
              <FieldRow label="Jabatan" value="Partner / Signing Partner" editing={false} />
              <FieldRow label="Tanggung Jawab" value="Penandatangan laporan, persetujuan akhir" editing={false} />
            </div>

            {/* Manager */}
            <div className="py-4 md:px-6">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Manager (Reviewer)</p>
              <FieldRow
                label="Nama Lengkap"
                value={auditorForm.managerName}
                editing={editAuditor}
                editNode={
                  <input
                    className={inputCls}
                    value={auditorForm.managerName}
                    onChange={e => setAuditorForm(f => ({ ...f, managerName: e.target.value }))}
                    placeholder="Nama Manager"
                  />
                }
              />
              <FieldRow label="Jabatan" value="Audit Manager / Reviewer" editing={false} />
              <FieldRow label="Tanggung Jawab" value="Review kertas kerja, koordinasi tim" editing={false} />
            </div>

            {/* Auditor */}
            <div className="py-4 md:pl-6">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Auditor (In-Charge)</p>
              <FieldRow
                label="Nama Lengkap"
                value={auditorForm.auditorName}
                editing={editAuditor}
                editNode={
                  <input
                    className={inputCls}
                    value={auditorForm.auditorName}
                    onChange={e => setAuditorForm(f => ({ ...f, auditorName: e.target.value }))}
                    placeholder="Nama Auditor"
                  />
                }
              />
              <FieldRow label="Jabatan" value="Auditor In-Charge / Team Member" editing={false} />
              <FieldRow label="Tanggung Jawab" value="Pelaksanaan prosedur audit lapangan" editing={false} />
            </div>
          </div>

          {/* Assigned Team Members & Supervisor strip if present */}
          {(engagement.supervisorName || (engagement.teamMembers && engagement.teamMembers.length > 0)) && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">Staf Tim Tambahan:</span>
              {engagement.supervisorName && (
                <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                  <span className="font-semibold mr-1">Supervisor:</span> {engagement.supervisorName}
                </span>
              )}
              {engagement.teamMembers?.map(tm => (
                <span key={tm.id} className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                  <span className="font-semibold mr-1">{tm.role}:</span> {tm.name}
                </span>
              ))}
            </div>
          )}

          {savedAuditor && (
            <div className="flex items-center gap-2 py-2 text-sm text-green-700">
              <CheckCircle size={14} /> Data tim tersimpan
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── 2. Identitas Klien ── */}
      <div className="mb-6">
        <SectionCard
          number="2."
          icon={<Building size={15} className="text-gray-600" />}
          title="Identitas Klien"
          editing={editKlien}
          canEdit={canEdit}
          onEdit={() => setEditKlien(true)}
          onCancel={() => { setEditKlien(false); setKlienForm({ clientName: engagement.clientName, clientAddress: (engagement as any).clientAddress || '', clientIndustry: (engagement as any).clientIndustry || '', auditPeriod: engagement.auditPeriod }); }}
          onSave={handleSaveKlien}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <FieldRow
              label="Nama Entitas / Klien"
              value={klienForm.clientName}
              editing={editKlien}
              editNode={<input className={inputCls} value={klienForm.clientName} onChange={e => setKlienForm(f => ({ ...f, clientName: e.target.value }))} />}
            />
            <FieldRow
              label="Periode Laporan Keuangan yang Diaudit"
              value={klienForm.auditPeriod}
              editing={editKlien}
              editNode={<input className={inputCls} value={klienForm.auditPeriod} onChange={e => setKlienForm(f => ({ ...f, auditPeriod: e.target.value }))} placeholder="Mis: 31 Desember 2023" />}
            />
            <FieldRow
              label="Alamat Lengkap Klien"
              value={klienForm.clientAddress || <span className="text-gray-400 italic text-sm">Belum diisi</span>}
              editing={editKlien}
              editNode={<input className={inputCls} value={klienForm.clientAddress} onChange={e => setKlienForm(f => ({ ...f, clientAddress: e.target.value }))} placeholder="Jalan, Kota, Provinsi, Kode Pos" />}
            />
            <FieldRow
              label="Bidang Usaha / Industri"
              value={klienForm.clientIndustry || <span className="text-gray-400 italic text-sm">Belum diisi</span>}
              editing={editKlien}
              editNode={<input className={inputCls} value={klienForm.clientIndustry} onChange={e => setKlienForm(f => ({ ...f, clientIndustry: e.target.value }))} placeholder="Mis: Manufaktur, Jasa, Perdagangan" />}
            />
          </div>

          {savedKlien && (
            <div className="flex items-center gap-2 py-2 text-sm text-green-700">
              <CheckCircle size={14} /> Data klien tersimpan
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── 3. Informasi Perikatan ── */}
      <div className="mb-6">
        <SectionCard
          number="3."
          icon={<FileSpreadsheet size={15} className="text-gray-600" />}
          title="Informasi Perikatan"
          editing={editPerikatan}
          canEdit={canEdit}
          onEdit={() => setEditPerikatan(true)}
          onCancel={() => { setEditPerikatan(false); }}
          onSave={handleSavePerikatan}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <FieldRow label="Nomor Perikatan" value={engagement.id} editing={false} />
            <FieldRow
              label="Jenis Perikatan"
              value={ENGAGEMENT_TYPE_LABELS[perikatanForm.engagementType] || perikatanForm.engagementType}
              editing={editPerikatan}
              editNode={
                <select className={selectCls} value={perikatanForm.engagementType} onChange={e => setPerikatanForm(f => ({ ...f, engagementType: e.target.value as any }))}>
                  <option value="First Year">Perikatan Tahun Pertama</option>
                  <option value="Recurring">Perikatan Berkelanjutan (Recurring)</option>
                </select>
              }
            />
            <FieldRow
              label="Standar Akuntansi yang Berlaku (Aplikasi PELITA)"
              value={
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{getStandardName(perikatanForm.accountingStandard) || STANDARD_LABELS[perikatanForm.accountingStandard] || perikatanForm.accountingStandard}</span>
                  {standards.find(s => s.code === perikatanForm.accountingStandard)?.pelitaCategory && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      PELITA: {standards.find(s => s.code === perikatanForm.accountingStandard)?.pelitaCategory}
                    </span>
                  )}
                </div>
              }
              editing={editPerikatan}
              editNode={
                <select className={selectCls} value={perikatanForm.accountingStandard} onChange={e => setPerikatanForm(f => ({ ...f, accountingStandard: e.target.value as any }))}>
                  {standards.filter(s => s.isActive || s.code === perikatanForm.accountingStandard).map(std => (
                    <option key={std.code} value={std.code}>
                      {std.name} {std.pelitaCategory ? `— [PELITA: ${std.pelitaCategory}]` : (std.category ? `(${std.category})` : '')}
                    </option>
                  ))}
                </select>
              }
            />
            <FieldRow
              label="Tahun Buku / Fiscal Year"
              value={perikatanForm.fiscalYear}
              editing={editPerikatan}
              editNode={<input className={inputCls} value={perikatanForm.fiscalYear} onChange={e => setPerikatanForm(f => ({ ...f, fiscalYear: e.target.value }))} placeholder="Mis: 2023" />}
            />
            <FieldRow
              label="Mata Uang Pelaporan"
              value={perikatanForm.currency}
              editing={editPerikatan}
              editNode={
                <select className={selectCls} value={perikatanForm.currency} onChange={e => setPerikatanForm(f => ({ ...f, currency: e.target.value as any }))}>
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="USD">USD (Dollar AS)</option>
                  <option value="Other">Lainnya</option>
                </select>
              }
            />
            <FieldRow
              label="Satuan Penyajian"
              value={UNIT_LABELS[perikatanForm.presentationUnit] || perikatanForm.presentationUnit}
              editing={editPerikatan}
              editNode={
                <select className={selectCls} value={perikatanForm.presentationUnit} onChange={e => setPerikatanForm(f => ({ ...f, presentationUnit: e.target.value as any }))}>
                  <option value="Full">Penuh (Full)</option>
                  <option value="Thousands">Ribuan (Rp 000)</option>
                  <option value="Millions">Jutaan (Rp 000.000)</option>
                </select>
              }
            />
            <FieldRow
              label="Tanggal Mulai Penugasan"
              value={perikatanForm.startDate}
              editing={editPerikatan}
              editNode={<input type="date" className={inputCls} value={perikatanForm.startDate} onChange={e => setPerikatanForm(f => ({ ...f, startDate: e.target.value }))} />}
            />
            <FieldRow
              label="Target Penyelesaian"
              value={perikatanForm.targetDate}
              editing={editPerikatan}
              editNode={<input type="date" className={inputCls} value={perikatanForm.targetDate} onChange={e => setPerikatanForm(f => ({ ...f, targetDate: e.target.value }))} />}
            />
          </div>

          {savedPerikatan && (
            <div className="flex items-center gap-2 py-2 text-sm text-green-700">
              <CheckCircle size={14} /> Data perikatan tersimpan
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Progress Perjalanan Audit (Stepper) ── */}
      <div className="mb-10 mt-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Progress Perjalanan Audit</p>
        
        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-4 left-4 right-4 w-[calc(100%-32px)] h-1 bg-gray-200 rounded-full" />
          
          {/* Foreground Progress Line (Assuming up to A.2 is in progress) */}
          <div className="absolute top-4 left-4 w-[35%] h-1 bg-atlas-blue rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,102,204,0.4)]" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                id: 'pra', code: 'A.1', name: 'Pra-Perikatan', desc: 'Client Acceptance & Independence', status: 'Completed',
                tasks: ['A.110 Analisis Penerimaan', 'A.120 Alokasi Jam Jasa', 'A.130 Surat Perikatan']
              },
              { 
                id: 'risk_ass', code: 'A.2', name: 'Risk Assessment', desc: 'Materiality & Risk Planning', status: 'In Progress',
                tasks: ['A.210 Materialitas', 'A.220 Pemahaman Bisnis', 'A.230 Penilaian Risiko']
              },
              { 
                id: 'risk_res', code: 'B', name: 'Risk Response', desc: 'Audit Evidence & Testing', status: 'Pending',
                tasks: ['B.100 Uji Pengendalian', 'B.200 Prosedur Substantif', 'B.300 Bukti Audit']
              },
              { 
                id: 'comp', code: 'C', name: 'Completing & Reporting', desc: 'Final Review & Audit Report', status: 'Pending',
                tasks: ['C.100 Evaluasi Temuan', 'C.200 Kelangsungan Usaha', 'C.300 Laporan Auditor']
              },
            ].map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center md:items-start relative group">
                {/* Step Circle */}
                <div className={`w-9 h-9 rounded-full border-4 border-white flex items-center justify-center shrink-0 mb-4 transition-all duration-300 md:ml-4 shadow-sm ${
                  step.status === 'Completed' ? 'bg-atlas-blue text-white' : 
                  step.status === 'In Progress' ? 'bg-white border-2 border-atlas-blue text-atlas-blue ring-2 ring-atlas-blue/20' : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step.status === 'Completed' ? <CheckCircle size={14} className="stroke-[3]" /> : <span className="text-[11px] font-black">{step.code}</span>}
                </div>
                
                {/* Step Content Card */}
                <div className={`w-full bg-white border rounded-xl p-4 transition-all duration-300 ${
                  step.status === 'Completed' ? 'border-atlas-blue/30 shadow-sm hover:border-atlas-blue/50' : 
                  step.status === 'In Progress' ? 'border-atlas-blue shadow-md ring-1 ring-atlas-blue/10' : 
                  'border-gray-200 opacity-75 group-hover:opacity-100'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{step.code}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      step.status === 'Completed' ? 'text-atlas-blue' :
                      step.status === 'In Progress' ? 'text-atlas-blue' :
                      'text-gray-400'
                    }`}>{step.status}</span>
                  </div>
                  <h3 className={`text-sm font-bold mb-1 ${step.status === 'Pending' ? 'text-gray-600' : 'text-gray-900'}`}>{step.name}</h3>
                  <p className="text-[11px] text-gray-500 leading-tight mb-3">{step.desc}</p>
                  
                  <ul className="space-y-1.5 mt-3 pt-3 border-t border-gray-100">
                    {step.tasks.map((task, i) => (
                      <li key={i} className={`text-[10px] font-medium flex items-start gap-1.5 leading-snug ${step.status === 'Pending' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                          step.status === 'Completed' ? 'bg-atlas-blue' : 
                          step.status === 'In Progress' ? 'bg-atlas-blue' : 'bg-gray-300'
                        }`}></div>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EngagementFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={null}
        />
      )}
    </div>
  );
};

export default WorkspaceBeranda;
