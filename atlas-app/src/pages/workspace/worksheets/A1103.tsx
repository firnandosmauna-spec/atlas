import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Users, CheckCircle2, AlertCircle, ShieldAlert, Plus, Trash2, ArrowLeft, GraduationCap, Scale, FileText } from 'lucide-react';

interface TeamMember {
  id: string;
  nama: string;
  kompetensi: 'Memadai' | 'Tidak Memadai' | '';
  waktu: 'Tersedia' | 'Tidak Tersedia' | '';
  independensi: 'Independen' | 'Tidak Independen' | '';
  dipilih: 'Ya' | 'Tidak' | '';
  inisial: string;
  peran: 'Partner' | 'Manager' | 'Ketua Tim' | 'Anggota Tim' | 'Reviewer' | '';
}

interface TrainingNeed {
  entitas: boolean;
  standarAudit: boolean;
  peraturan: boolean;
  ti: boolean;
  pertimbangan: boolean;
  kebijakan: boolean;
  dokumenId: string;
}

const A1103: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [worksheetStatus, setWorksheetStatus] = useState<'In Progress' | 'Completed' | 'Pending Review'>('In Progress');
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      nama: engagement.partnerName || 'Partner Name',
      kompetensi: 'Memadai',
      waktu: 'Tersedia',
      independensi: 'Independen',
      dipilih: 'Ya',
      inisial: 'PRT',
      peran: 'Partner'
    },
    {
      id: '2',
      nama: engagement.managerName || 'Manager Name',
      kompetensi: 'Memadai',
      waktu: 'Tersedia',
      independensi: 'Independen',
      dipilih: 'Ya',
      inisial: 'MGR',
      peran: 'Manager'
    }
  ]);

  const [trainingNeeds, setTrainingNeeds] = useState<Record<string, TrainingNeed>>({});
  const [temaPelatihan, setTemaPelatihan] = useState('');

  // EQCR States
  const [risikoPenerimaan, setRisikoPenerimaan] = useState('Tinggi'); // From A110 technically
  const [jenisUsaha, setJenisUsaha] = useState('Perdagangan');
  const [statusKepemilikan, setStatusKepemilikan] = useState('Swasta');
  const [eqcr, setEqcr] = useState('Ya');

  const isCompleted = teamMembers.length > 0 && teamMembers.every(
    m => m.nama && m.kompetensi && m.waktu && m.independensi && m.dipilih && m.inisial && m.peran
  );

  const addRow = () => {
    setTeamMembers([
      ...teamMembers,
      { id: Math.random().toString(36).substr(2, 9), nama: '', kompetensi: '', waktu: '', independensi: '', dipilih: '', inisial: '', peran: '' }
    ]);
  };

  const removeRow = (id: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      const newTraining = { ...trainingNeeds };
      delete newTraining[id];
      setTrainingNeeds(newTraining);
    }
  };

  const updateMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const toggleTraining = (id: string, field: keyof TrainingNeed) => {
    setTrainingNeeds(prev => {
      const current = prev[id] || { entitas: false, standarAudit: false, peraturan: false, ti: false, pertimbangan: false, kebijakan: false, dokumenId: '' };
      return {
        ...prev,
        [id]: { ...current, [field]: !current[field as keyof typeof current] }
      };
    });
  };

  return (
    <WorksheetContainer
      code="A.1103"
      name="Penunjukan Tim Perikatan (Kompetensi & Independensi)"
      purpose="Mengevaluasi kompetensi, ketersediaan waktu, dan independensi personel KAP sebelum menugaskan mereka ke dalam tim perikatan."
      status={isCompleted ? 'Completed' : 'In Progress'}
      onStatusChange={setWorksheetStatus}
      reviewer={engagement.managerName || 'Menunggu Reviewer'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6">
        
        {/* Top Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 shadow-sm">
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Standar Auditing yang Relevan</h3>
              <ul className="text-sm text-gray-700 font-medium space-y-1">
                <li className="flex items-start"><ShieldAlert size={16} className="mr-2 text-atlas-blue shrink-0 mt-0.5" /> SPM 1 : Standar Pengendalian Mutu</li>
                <li className="flex items-start"><ShieldAlert size={16} className="mr-2 text-atlas-blue shrink-0 mt-0.5" /> SA 220 : Pengendalian Mutu Audit</li>
              </ul>
            </div>
          </div>
          
          <div className="md:w-1/3 bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center items-center text-center">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status Pengisian</h4>
            {isCompleted ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 size={32} className="text-green-500 mb-2" />
                <span className="text-green-700 font-black text-lg">COMPLETED</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AlertCircle size={32} className="text-amber-500 mb-2" />
                <span className="text-amber-700 font-black text-lg">INCOMPLETED</span>
                <span className="text-xs text-amber-600 mt-1">Lengkapi seluruh data tim perikatan</span>
              </div>
            )}
          </div>
        </div>

        {/* Team Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Users size={20} className="mr-2 text-atlas-blue" />
              Evaluasi Personel Tim Perikatan
            </h2>
            <button 
              onClick={addRow}
              className="flex items-center space-x-1 bg-atlas-blue text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              <Plus size={16} /> <span>Tambah Personel</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-4 py-4 w-12 text-center">No</th>
                  <th className="px-4 py-4 min-w-[200px]">Nama Personel</th>
                  <th className="px-4 py-4 w-40 text-center">Kompetensi</th>
                  <th className="px-4 py-4 w-40 text-center">Ketersediaan Waktu</th>
                  <th className="px-4 py-4 w-40 text-center">Independensi</th>
                  <th className="px-4 py-4 w-32 text-center bg-green-50/50">Pilih sbg Tim</th>
                  <th className="px-4 py-4 w-24 text-center bg-amber-50/50">Inisial</th>
                  <th className="px-4 py-4 w-40 text-center bg-green-50/50">Peran dlm Tim</th>
                  <th className="px-4 py-4 w-12 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamMembers.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-center font-medium text-gray-400">{idx + 1}</td>
                    
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-atlas-blue/20 outline-none"
                        placeholder="Nama Lengkap"
                        value={member.nama}
                        onChange={(e) => updateMember(member.id, 'nama', e.target.value)}
                      />
                    </td>
                    
                    <td className="px-4 py-3">
                      <select 
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-atlas-blue/20 outline-none text-center font-bold ${
                          member.kompetensi === 'Tidak Memadai' ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-300'
                        }`}
                        value={member.kompetensi}
                        onChange={(e) => updateMember(member.id, 'kompetensi', e.target.value)}
                      >
                        <option value="" disabled>-</option>
                        <option value="Memadai">Memadai</option>
                        <option value="Tidak Memadai">Tidak Memadai</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-atlas-blue/20 outline-none text-center"
                        value={member.waktu}
                        onChange={(e) => updateMember(member.id, 'waktu', e.target.value)}
                      >
                        <option value="" disabled>-</option>
                        <option value="Tersedia">Tersedia</option>
                        <option value="Tidak Tersedia">Tidak Tersedia</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-atlas-blue/20 outline-none text-center"
                        value={member.independensi}
                        onChange={(e) => updateMember(member.id, 'independensi', e.target.value)}
                      >
                        <option value="" disabled>-</option>
                        <option value="Independen">Independen</option>
                        <option value="Tidak Independen">Tidak Independen</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 bg-green-50/30">
                      <select 
                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-atlas-blue/20 outline-none text-center font-bold ${
                          member.dipilih === 'Ya' ? 'bg-green-100 border-green-300 text-green-700' : 
                          member.dipilih === 'Tidak' ? 'bg-red-100 border-red-300 text-red-700' : 
                          'border-gray-300 bg-white'
                        }`}
                        value={member.dipilih}
                        onChange={(e) => updateMember(member.id, 'dipilih', e.target.value)}
                      >
                        <option value="" disabled>-</option>
                        <option value="Ya">Ya</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 bg-amber-50/30">
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-atlas-blue/20 outline-none text-center uppercase font-bold"
                        placeholder="ABC"
                        maxLength={4}
                        value={member.inisial}
                        onChange={(e) => updateMember(member.id, 'inisial', e.target.value)}
                      />
                    </td>

                    <td className="px-4 py-3 bg-green-50/30">
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-atlas-blue/20 outline-none text-center font-bold"
                        value={member.peran}
                        onChange={(e) => updateMember(member.id, 'peran', e.target.value)}
                      >
                        <option value="" disabled>-</option>
                        <option value="Partner">Partner</option>
                        <option value="Manager">Manager</option>
                        <option value="Ketua Tim">Ketua Tim</option>
                        <option value="Anggota Tim">Anggota Tim</option>
                        <option value="Reviewer">Reviewer</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => removeRow(member.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Hapus baris"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Analisis Kompetensi Sumber Daya */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-yellow-50/50 border-b border-yellow-100 px-6 py-4">
            <h2 className="text-lg font-black text-gray-800 flex items-center uppercase">
              <GraduationCap size={20} className="mr-2 text-yellow-600" />
              Analisis Kompetensi Sumber Daya Untuk Pelatihan Berkelanjutan
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Pada bagian ini terdapat informasi terkait dengan kebutuhan pengembangan kompetensi personel KAP. Jika KAP telah melakukan tindak lanjut atas pengembangan kompetensi tersebut maka harus didukung dokumentasi yang dilampirkan pada kertas kerja ini.
            </p>
            
            <div className="mb-6 flex items-center gap-4">
              <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Tema pendidikan dan pelatihan berkelanjutan:</label>
              <input 
                type="text" 
                value={temaPelatihan}
                onChange={e => setTemaPelatihan(e.target.value)}
                placeholder="Misal: Standar Akuntansi Terbaru..."
                className="w-full border-b-2 border-gray-300 focus:border-atlas-blue outline-none py-1 bg-transparent"
              />
            </div>
            
            <div className="overflow-x-auto border border-yellow-200 rounded-xl mb-6">
              <table className="w-full text-xs text-center border-collapse">
                <thead className="bg-yellow-50/50 border-b border-yellow-200">
                  <tr>
                    <th className="px-2 py-3 border-r border-yellow-200 w-10">No</th>
                    <th className="px-4 py-3 border-r border-yellow-200 w-48 text-left">Nama</th>
                    <th className="px-2 py-3 border-r border-yellow-200">Pemahaman lanjutan terkait entitas</th>
                    <th className="px-2 py-3 border-r border-yellow-200">Pemahaman lanjutan Standar Audit</th>
                    <th className="px-2 py-3 border-r border-yellow-200">Pemahaman lanjutan Peraturan yang Relevan dengan Klien</th>
                    <th className="px-2 py-3 border-r border-yellow-200">Pemahaman lanjutan Teknologi Informasi yang Relevan dengan Klien</th>
                    <th className="px-2 py-3 border-r border-yellow-200">Pemahaman lanjutan penggunaan pertimbangan profesional dalam audit</th>
                    <th className="px-2 py-3 border-r border-yellow-200">Pemahaman lanjutan Kebijakan dan Prosedur dalam KAP</th>
                    <th className="px-4 py-3 bg-yellow-100">Lampiran Dokumentasi</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member, idx) => {
                    const needs = trainingNeeds[member.id] || { entitas: false, standarAudit: false, peraturan: false, ti: false, pertimbangan: false, kebijakan: false };
                    return (
                      <tr key={member.id} className="border-b border-yellow-100 hover:bg-yellow-50/30">
                        <td className="px-2 py-3 border-r border-yellow-100 text-gray-500 font-bold">{idx + 1}</td>
                        <td className="px-4 py-3 border-r border-yellow-100 text-left font-bold text-gray-800">{member.nama || '-'}</td>
                        <td className="px-2 py-3 border-r border-yellow-100">
                          <input type="checkbox" checked={needs.entitas} onChange={() => toggleTraining(member.id, 'entitas')} className="w-4 h-4 text-atlas-blue rounded border-gray-300 focus:ring-atlas-blue" />
                        </td>
                        <td className="px-2 py-3 border-r border-yellow-100">
                          <input type="checkbox" checked={needs.standarAudit} onChange={() => toggleTraining(member.id, 'standarAudit')} className="w-4 h-4 text-atlas-blue rounded border-gray-300 focus:ring-atlas-blue" />
                        </td>
                        <td className="px-2 py-3 border-r border-yellow-100">
                          <input type="checkbox" checked={needs.peraturan} onChange={() => toggleTraining(member.id, 'peraturan')} className="w-4 h-4 text-atlas-blue rounded border-gray-300 focus:ring-atlas-blue" />
                        </td>
                        <td className="px-2 py-3 border-r border-yellow-100">
                          <input type="checkbox" checked={needs.ti} onChange={() => toggleTraining(member.id, 'ti')} className="w-4 h-4 text-atlas-blue rounded border-gray-300 focus:ring-atlas-blue" />
                        </td>
                        <td className="px-2 py-3 border-r border-yellow-100">
                          <input type="checkbox" checked={needs.pertimbangan} onChange={() => toggleTraining(member.id, 'pertimbangan')} className="w-4 h-4 text-atlas-blue rounded border-gray-300 focus:ring-atlas-blue" />
                        </td>
                        <td className="px-2 py-3 border-r border-yellow-100">
                          <input type="checkbox" checked={needs.kebijakan} onChange={() => toggleTraining(member.id, 'kebijakan')} className="w-4 h-4 text-atlas-blue rounded border-gray-300 focus:ring-atlas-blue" />
                        </td>
                        <td className="px-2 py-3 bg-yellow-100/30 text-center">
                          <button className="text-atlas-blue hover:text-blue-800 bg-white border border-blue-200 px-3 py-1 rounded text-xs font-bold flex items-center justify-center w-full mx-auto shadow-sm">
                            <FileText size={12} className="mr-1" /> Upload
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PENELAAHAN MUTU PERIKATAN (EQCR) */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-black text-gray-800 flex items-center uppercase">
              <Scale size={20} className="mr-2 text-atlas-blue" />
              Penelaahan Mutu Perikatan
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Pada bagian ini terdapat informasi terkait risiko penerimaan dan keberlanjutan klien sehingga KAP dapat menentukan kebutuhan perlu tidaknya EQCR sesuai dengan kebijakan Sistem Pengendalian Mutu KAP.
            </p>
            
            <div className="max-w-2xl bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="grid grid-cols-[1fr_20px_1fr] gap-4 mb-4">
                <div className="text-sm font-medium text-gray-700">Risiko Penerimaan dan Keberlanjutan Hubungan dengan Klien</div>
                <div className="text-sm font-bold text-gray-500 text-center">:</div>
                <div className="flex items-center gap-2">
                  <input type="text" className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm outline-none" value={risikoPenerimaan} readOnly />
                  <span className="text-xs text-red-500 font-bold italic shrink-0">from A.110</span>
                </div>
              </div>
              
              <div className="grid grid-cols-[1fr_20px_1fr] gap-4 mb-4">
                <div className="text-sm font-medium text-gray-700">Jenis Usaha Klien</div>
                <div className="text-sm font-bold text-gray-500 text-center">:</div>
                <div>
                  <input type="text" className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm outline-none" value={jenisUsaha} onChange={e => setJenisUsaha(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_20px_1fr] gap-4 mb-4">
                <div className="text-sm font-medium text-gray-700">Status Kepemilikan Klien</div>
                <div className="text-sm font-bold text-gray-500 text-center">:</div>
                <div>
                  <input type="text" className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm outline-none" value={statusKepemilikan} onChange={e => setStatusKepemilikan(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_20px_1fr] gap-4">
                <div className="text-sm font-medium text-gray-700">EQCR (Penelaahan)</div>
                <div className="text-sm font-bold text-gray-500 text-center">:</div>
                <div>
                  <select 
                    className={`w-full border rounded p-1.5 text-sm font-bold outline-none focus:ring-1 focus:ring-atlas-blue ${eqcr === 'Ya' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}
                    value={eqcr}
                    onChange={e => setEqcr(e.target.value)}
                  >
                    <option value="Ya">Ya</option>
                    <option value="Tidak">Tidak</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/a110`)} className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2 flex items-center transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Kembali ke A.110
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A1103;
