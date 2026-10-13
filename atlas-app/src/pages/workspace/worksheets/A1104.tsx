import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { FileText, CheckCircle2, AlertCircle, ShieldAlert, Paperclip, ArrowLeft } from 'lucide-react';

const questions = [
  { id: '1', text: 'Jika calon klien merupakan perikatan audit LK tahun pertama, apakah sudah dilakukan komunikasi dengan auditor pendahulu?', type: 'main' },
  { id: '2', text: 'Apakah balasan komunikasi dari auditor pendahulu sudah diterima?', type: 'main' },
  { id: '3', text: 'Dalam balasan komunikasi yang diberikan oleh auditor pendahulu:', type: 'header' },
  { id: '3a', text: 'a. Apakah ada keberatan profesional atas penggantian auditor?', type: 'sub' },
  { id: '3b', text: 'b. Apakah terdapat permasalahan imbalan jasa yang belum diselesaikan oleh manajemen?', type: 'sub' }
];

const A1104: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [worksheetStatus, setWorksheetStatus] = useState<'In Progress' | 'Completed' | 'Pending Review'>('In Progress');
  
  // State for answers
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Check if all actionable questions are answered
  const actionableQuestions = questions.filter(q => q.type !== 'header');
  const isCompleted = actionableQuestions.every(q => answers[q.id]);

  return (
    <WorksheetContainer
      code="A.1104"
      name="Komunikasi dengan Auditor Pendahulu"
      purpose="Mendokumentasikan komunikasi dengan auditor pendahulu pada perikatan tahun pertama untuk mengidentifikasi potensi masalah."
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
                <li className="flex items-start"><ShieldAlert size={16} className="mr-2 text-atlas-blue shrink-0 mt-0.5" /> SA 210 : Persetujuan Atas Ketentuan Perikatan</li>
                <li className="flex items-start"><ShieldAlert size={16} className="mr-2 text-atlas-blue shrink-0 mt-0.5" /> SA 220 : Pengendalian Mutu Audit</li>
                <li className="flex items-start"><ShieldAlert size={16} className="mr-2 text-atlas-blue shrink-0 mt-0.5" /> SA 300 : Perencanaan Suatu Audit</li>
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
                <span className="text-xs text-amber-600 mt-1">Harap jawab seluruh pertanyaan</span>
              </div>
            )}
          </div>
        </div>

        {/* Note if not first year */}
        {engagement.engagementType !== 'First Year' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-800">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold text-sm">Informasi Perikatan</p>
              <p className="text-sm mt-1">Klien ini tercatat bukan sebagai Perikatan Tahun Pertama. Pengisian kertas kerja ini mungkin tidak diwajibkan (N/A) bergantung pada kebijakan KAP Anda.</p>
            </div>
          </div>
        )}

        {/* Attachment Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <Paperclip size={18} className="text-gray-500 mr-2" />
            <h3 className="text-sm font-bold text-gray-800 uppercase">Lampiran Kertas Kerja</h3>
          </div>
          <textarea 
            className="w-full min-h-[100px] bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-colors resize-y" 
            placeholder="Tuliskan catatan lampiran surat menyurat atau korespondensi dengan auditor pendahulu di sini..."
          ></textarea>
        </div>

        {/* Checklist Section */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FileText size={20} className="mr-2 text-atlas-blue" />
              Ceklis Komunikasi Auditor Pendahulu
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">No</th>
                  <th className="px-6 py-4">Pertanyaan Evaluasi</th>
                  <th className="px-6 py-4 w-48 text-center">Hasil Analisis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q) => (
                  <tr key={q.id} className={`${q.type === 'header' ? 'bg-gray-50' : 'hover:bg-blue-50/30'} transition-colors group`}>
                    <td className="px-6 py-4 text-center font-medium text-gray-400 group-hover:text-atlas-blue">
                      {q.type === 'main' || q.type === 'header' ? q.id : ''}
                    </td>
                    <td className={`px-6 py-4 ${q.type === 'header' ? 'font-bold text-gray-800' : 'text-gray-700'} ${q.type === 'sub' ? 'pl-10' : ''}`}>
                      {q.text}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {q.type !== 'header' && (
                        <select 
                          className={`w-full px-4 py-2 rounded-lg font-bold text-center border focus:outline-none focus:ring-2 focus:ring-atlas-blue/20 transition-all ${
                            answers[q.id] === 'Ya' ? 'bg-green-50 border-green-200 text-green-700' :
                            answers[q.id] === 'Tidak' ? 'bg-red-50 border-red-200 text-red-700' :
                            answers[q.id] === 'N/A' ? 'bg-gray-100 border-gray-300 text-gray-600' :
                            'bg-white border-gray-300 text-gray-500'
                          }`}
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                        >
                          <option value="" disabled>Pilih</option>
                          <option value="Ya">Ya</option>
                          <option value="Tidak">Tidak</option>
                          <option value="N/A">N/A</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default A1104;
