import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import { useEngagementStore } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { AlertCircle, CheckCircle, ShieldAlert, FileSearch, Scale } from 'lucide-react';

const A110 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const updateEngagement = useEngagementStore(state => state.updateEngagement);
  const addAuditLog = useEngagementStore(state => state.addAuditLog);
  
  const wsData = engagement.worksheetA110 || {};
  const [activeTab, setActiveTab] = useState('info');
  const [decision, setDecision] = useState<'Accept' | 'Reject' | null>(wsData.decision || null);
  const [industry, setIndustry] = useState(wsData.industry || '');
  const [alamat, setAlamat] = useState(wsData.boardOfDirectors || '');
  const [reason, setReason] = useState(wsData.decisionReason || '');
  const [evals, setEvals] = useState<Record<string, string>>(wsData.evaluations || { 'A.1101': '', 'A.1102': '', 'A.1103': '', 'A.1104': '' });


  const tabs = [
    { id: 'info', name: 'Informasi Klien & Perikatan', icon: <FileSearch size={16} /> },
    { id: 'eval', name: 'Evaluasi & Risiko', icon: <ShieldAlert size={16} /> },
    { id: 'keputusan', name: 'Kesimpulan & Keputusan', icon: <Scale size={16} /> },
  ];

  const handleValidate = () => {
    const missing = [];
    if (!industry.trim()) missing.push('Bidang Usaha / Industri');
    if (!alamat.trim()) missing.push('Susunan Dewan Komisaris & Direksi Utama');
    if (!decision) missing.push('Keputusan Penerimaan Klien (Tab 3)');
    return missing;
  };

  const handleAjukanReview = () => {
    updateEngagement(engagement.id, {
      worksheetA110: {
        industry,
        boardOfDirectors: alamat,
        usagePurpose: '',
        evaluations: evals as Record<string, 'low' | 'high' | ''>,
        overallRisk: 'low',
        anomalyExplanation: '',
        decision,
        decisionReason: reason,
        status: 'Pending Review'
      },
      status: 'Pending Review' // Optional: update overall engagement status
    });

    addAuditLog({
      engagementId: engagement.id,
      user: engagement.auditorName || 'Auditor',
      action: 'Submitted for Review',
      module: 'A.110 Analisis Penerimaan',
      record: 'Status updated to Pending Review'
    });

    alert('Kertas kerja berhasil diajukan! Notifikasi telah dikirim ke Partner untuk direview.');
  };

  return (
    <WorksheetContainer
      code="A.110"
      name="Analisis Penerimaan Klien (Client Acceptance)"
      purpose="Modul evaluasi terpadu penerimaan calon klien berdasarkan risiko, independensi, dan benturan kepentingan."
      status={wsData.status || 'In Progress'}
      reviewer={engagement.managerName || 'Menunggu Reviewer'}
      lastUpdated="Baru saja"
      validateCompletion={handleValidate}
    >
      {/* Tabs Navigation */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex overflow-x-auto mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === tab.id 
                ? 'bg-blue-50 text-atlas-blue shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab 1: Informasi Klien & Perikatan */}
        {activeTab === 'info' && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Informasi Calon Klien & Manajemen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Entitas</label>
                  <input type="text" defaultValue={engagement.clientName} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 focus:outline-none" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bidang Usaha / Industri <span className="text-red-500">*</span></label>
                  <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Mis: Manufaktur, Jasa, Perdagangan" className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Susunan Dewan Komisaris & Direksi Utama <span className="text-red-500">*</span></label>
                  <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:border-atlas-blue outline-none" rows={3} placeholder="Sebutkan nama dan jabatan eksekutif kunci..."></textarea>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Informasi Perikatan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Perikatan</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:border-atlas-blue outline-none" defaultValue={engagement.engagementType}>
                    <option value="First Year">Perikatan Tahun Pertama</option>
                    <option value="Recurring">Perikatan Berkelanjutan (Recurring)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Standar Akuntansi yang Digunakan</label>
                  <input type="text" defaultValue={engagement.accountingStandard} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 focus:outline-none" readOnly />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tujuan Penggunaan Laporan Keuangan</label>
                  <textarea className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:border-atlas-blue outline-none" rows={2} placeholder="Mis: Untuk pemegang saham, pengajuan kredit bank, tender proyek, dll..."></textarea>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button onClick={() => setActiveTab('eval')} className="bg-atlas-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors">
                Lanjut ke Evaluasi Risiko &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Evaluasi & Risiko (Kontrol Kertas Kerja Pendukung) */}
        {activeTab === 'eval' && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Kontrol Isian Kertas Kerja Pendukung</h2>
              <p className="text-sm text-gray-600 mb-6">
                Kertas kerja ini merupakan kontrol atas isian 4 (empat) kertas kerja pendukung. Auditor harus melengkapi kertas kerja pendukung berikut sebelum mengambil keputusan.
              </p>
              
              <div className="space-y-4">
                {/* A.1101 */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h3 className="font-bold text-gray-800"><span className="text-atlas-blue mr-2">A.1101</span> Isu Pelaporan Keuangan Terdahulu</h3>
                    <p className="text-xs text-gray-500 mt-1">Mengevaluasi isu-isu pelaporan keuangan pada periode sebelumnya.</p>
                  </div>
                  <div className="flex space-x-3 shrink-0 items-center">
                    <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>
                    <select 
                      value={evals['A.1101']} 
                      onChange={(e) => setEvals({...evals, 'A.1101': e.target.value})}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-atlas-blue font-bold text-gray-700"
                    >
                      <option value="">-- Pilih Risiko --</option>
                      <option value="low">Risiko Rendah</option>
                      <option value="high">Risiko Tinggi</option>
                    </select>
                  </div>
                </div>

                {/* A.1102 */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group hover:border-atlas-blue transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <span className="text-atlas-blue mr-2">A.1102</span> Integritas Manajemen
                      <a href={`/workspace/${engagement.id}/worksheet/a1102`} className="ml-3 text-xs bg-gray-100 hover:bg-atlas-blue hover:text-white text-gray-600 px-2 py-1 rounded transition-colors font-medium">Buka Kertas Kerja &rarr;</a>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Mengevaluasi integritas manajemen, termasuk indikasi pencucian uang/ilegal.</p>
                  </div>
                  <div className="flex space-x-3 shrink-0 items-center">
                    <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>
                    <select 
                      value={evals['A.1102']} 
                      onChange={(e) => setEvals({...evals, 'A.1102': e.target.value})}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-atlas-blue font-bold text-gray-700"
                    >
                      <option value="">-- Pilih Risiko --</option>
                      <option value="low">Risiko Rendah</option>
                      <option value="high">Risiko Tinggi</option>
                    </select>
                  </div>
                </div>

                {/* A.1103 */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group hover:border-atlas-blue transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <span className="text-atlas-blue mr-2">A.1103</span> Kompetensi, Waktu, & Independensi Personel KAP
                      <a href={`/workspace/${engagement.id}/worksheet/a1103`} className="ml-3 text-xs bg-gray-100 hover:bg-atlas-blue hover:text-white text-gray-600 px-2 py-1 rounded transition-colors font-medium">Buka Kertas Kerja &rarr;</a>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Mengevaluasi kompetensi tim, ketersediaan waktu, dan benturan kepentingan.</p>
                  </div>
                  <div className="flex space-x-3 shrink-0 items-center">
                    <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>
                    <select 
                      value={evals['A.1103']} 
                      onChange={(e) => setEvals({...evals, 'A.1103': e.target.value})}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-atlas-blue font-bold text-gray-700"
                    >
                      <option value="">-- Pilih Risiko --</option>
                      <option value="low">Risiko Rendah</option>
                      <option value="high">Risiko Tinggi</option>
                    </select>
                  </div>
                </div>

                {/* A.1104 - Conditional based on Engagement Type */}
                {engagement.engagementType === 'First Year' ? (
                  <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group hover:border-atlas-blue transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center">
                        <span className="text-atlas-blue mr-2">A.1104</span> Komunikasi dengan Auditor Pendahulu
                        <a href={`/workspace/${engagement.id}/worksheet/a1104`} className="ml-3 text-xs bg-gray-100 hover:bg-atlas-blue hover:text-white text-gray-600 px-2 py-1 rounded transition-colors font-medium">Buka Kertas Kerja &rarr;</a>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Wajib untuk perikatan tahun pertama.</p>
                    </div>
                    <div className="flex space-x-3 shrink-0 items-center">
                      <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>
                      <select 
                        value={evals['A.1104']} 
                        onChange={(e) => setEvals({...evals, 'A.1104': e.target.value})}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-atlas-blue font-bold text-gray-700"
                      >
                        <option value="">-- Pilih Risiko --</option>
                        <option value="low">Risiko Rendah</option>
                        <option value="high">Risiko Tinggi</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm opacity-60 group hover:border-atlas-blue transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-500 flex items-center">
                        <span className="text-gray-400 mr-2">A.1104</span> Komunikasi dengan Auditor Pendahulu
                        <a href={`/workspace/${engagement.id}/worksheet/a1104`} className="ml-3 text-xs bg-gray-100 hover:bg-atlas-blue hover:text-white text-gray-600 px-2 py-1 rounded transition-colors font-medium">Buka Kertas Kerja &rarr;</a>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Tidak relevan (Bukan Perikatan Tahun Pertama).</p>
                    </div>
                    <div className="flex space-x-3 shrink-0 items-center">
                      <span className="text-xs font-bold px-3 py-1 bg-gray-200 text-gray-500 rounded-full">N/A</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">4. Simpulan Risiko & Penjelasan Anomali</h2>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-blue-900">Tingkat Risiko Perikatan secara Keseluruhan (Overall Engagement Risk)</p>
                    <p className="text-xs text-blue-800 mt-1">Dihitung otomatis berdasarkan hasil pengisian kertas kerja pendukung di atas.</p>
                  </div>
                  <div className="bg-white text-atlas-blue px-6 py-2 rounded-lg font-black border border-blue-200 shrink-0 text-lg shadow-sm">
                    RENDAH (LOW)
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Penjelasan Jawaban Anomali <span className="text-xs font-normal text-gray-500 ml-1">(Wajib diisi jika terdapat risiko tinggi atau kondisi khusus)</span></label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-xl p-4 text-gray-700 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none min-h-[100px] bg-red-50/30" 
                    placeholder="Jelaskan alasan auditor jika mengisi dengan jawaban anomali pada kertas kerja pendukung..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button onClick={() => setActiveTab('info')} className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2">
                &larr; Kembali
              </button>
              <button onClick={() => setActiveTab('keputusan')} className="bg-atlas-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors">
                Lanjut ke Keputusan Akhir &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Keputusan Akhir */}
        {activeTab === 'keputusan' && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">5. Keputusan Penerimaan Klien (Accept/Reject)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button 
                  onClick={() => setDecision('Accept')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${decision === 'Accept' ? 'border-green-500 bg-green-50 shadow-md ring-4 ring-green-500/20' : 'border-gray-200 hover:border-green-300'}`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${decision === 'Accept' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <CheckCircle size={20} />
                    </div>
                    <span className={`text-xl font-black ${decision === 'Accept' ? 'text-green-700' : 'text-gray-700'}`}>ACCEPT (Terima)</span>
                  </div>
                  <p className="text-sm text-gray-600">Risiko dapat dikelola, tim independen dan kompeten. Perikatan dapat dilaksanakan.</p>
                </button>

                <button 
                  onClick={() => setDecision('Reject')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${decision === 'Reject' ? 'border-red-500 bg-red-50 shadow-md ring-4 ring-red-500/20' : 'border-gray-200 hover:border-red-300'}`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${decision === 'Reject' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <AlertCircle size={20} />
                    </div>
                    <span className={`text-xl font-black ${decision === 'Reject' ? 'text-red-700' : 'text-gray-700'}`}>REJECT (Tolak)</span>
                  </div>
                  <p className="text-sm text-gray-600">Terdapat benturan kepentingan atau risiko yang tidak dapat dimitigasi. Perikatan ditolak.</p>
                </button>
              </div>

              {decision === 'Accept' && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl animate-in fade-in duration-300">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <FileSearch size={18} />
                    Langkah Selanjutnya: Input Data Laporan Keuangan
                  </h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Anda telah memutuskan untuk menerima klien ini. Pengisian data laporan keuangan pada template berikut akan digunakan seterusnya secara otomatis dalam mendukung tahapan audit selanjutnya.
                  </p>
                  <a 
                    href={`/workspace/${engagement.id}/worksheet/d100`}
                    className="inline-flex items-center gap-2 bg-white text-atlas-blue font-bold px-5 py-2.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    Buka Template Laporan Keuangan &rarr;
                  </a>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Keputusan & Mitigasi (Jika Ada)</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-4 text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none min-h-[120px]" 
                    placeholder="Contoh: Kami memutuskan menerima perikatan ini dengan mitigasi risiko..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start space-x-4">
              <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800">Ketentuan Workflow Persetujuan</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Draft ini akan diajukan kepada <strong>{engagement.partnerName || 'Partner'}</strong> untuk direview. 
                  Jika disetujui status akan berubah menjadi <strong>Approved</strong>. Jika ditolak akan dikembalikan menjadi <strong>Needs Revision</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setActiveTab('eval')} className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2">
                &larr; Kembali
              </button>
              <button 
                onClick={handleAjukanReview}
                disabled={!decision || wsData.status === 'Pending Review' || wsData.status === 'Approved'}
                className={`px-8 py-3 rounded-lg font-bold text-white shadow-sm transition-colors ${
                  decision && wsData.status !== 'Pending Review' && wsData.status !== 'Approved'
                    ? 'bg-atlas-blue hover:bg-blue-800' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {wsData.status === 'Pending Review' ? 'Menunggu Review' : wsData.status === 'Approved' ? 'Telah Disetujui' : 'Ajukan Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </WorksheetContainer>
  );
};

export default A110;
