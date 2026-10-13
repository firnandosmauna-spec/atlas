import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { FileText, CheckCircle2, AlertCircle, ShieldAlert, Paperclip, ArrowLeft } from 'lucide-react';

const questions = [
  "Apakah terdapat reputasi buruk pada pribadi dan bisnis dari pemilik utama, manajemen kunci dan pihak yang bertanggung jawab atas tata kelola klien?",
  "Apakah terdapat ketidakwajaran sifat operasi klien, termasuk praktik bisnisnya?",
  "Apakah terdapat informasi kurang baik yang berhubungan dengan perilaku pemilik utama, manajemen kunci dan pihak yang bertanggung jawab atas tata kelola klien terhadap hal-hal tertentu seperti interpretasi yang agresif terhadap standar akuntansi dan lingkungan pengendalian internal?",
  "Apakah klien secara agresif berusaha menekan fee jasa profesional KAP serendah mungkin?",
  "Apakah terdapat indikasi terjadinya pembatasan lingkup pekerjaan yang tidak wajar?",
  "Apakah terdapat indikasi bahwa klien mungkin terlibat dalam pencucian uang dan terorisme sebagaimana yang dimaksud PMK No 55/PMK.01/2017 (yang telah diubah dengan PMK 155/PMK.01/2017)?",
  "Apakah terdapat identitas dan reputasi buruk atas bisnis dari pihak-pihak yang mempunyai hubungan istimewa?",
  "Apakah terdapat dua auditor independen untuk melakukan audit atas laporan keuangan pada periode yang sama?"
];

const A1102: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [worksheetStatus, setWorksheetStatus] = useState<'In Progress' | 'Completed' | 'Pending Review'>('In Progress');
  
  // State for answers
  const [answers, setAnswers] = useState<Record<number, string>>({
    5: 'Tidak' // Question 6 (index 5) is default 'Tidak' via A.1102.1
  });

  const isCompleted = Object.keys(answers).length === questions.length;

  return (
    <WorksheetContainer
      code="A.1102"
      name="Integritas Manajemen"
      purpose="Mengevaluasi integritas manajemen calon klien untuk mengidentifikasi risiko sebelum menerima perikatan audit."
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

        {/* Attachment Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <Paperclip size={18} className="text-gray-500 mr-2" />
            <h3 className="text-sm font-bold text-gray-800 uppercase">Lampiran Kertas Kerja</h3>
          </div>
          <textarea 
            className="w-full min-h-[100px] bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none transition-colors resize-y" 
            placeholder="Tuliskan catatan lampiran atau referensi dokumen pendukung di sini..."
          ></textarea>
        </div>

        {/* Checklist Section */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FileText size={20} className="mr-2 text-atlas-blue" />
              Ceklis Isu Integritas Manajemen
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
                {questions.map((q, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-center font-medium text-gray-400 group-hover:text-atlas-blue">{idx + 1}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {q}
                      {idx === 5 && (
                        <div className="mt-2 inline-flex items-center text-xs font-bold text-atlas-blue bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                          <ShieldAlert size={12} className="mr-1" /> Referensi: KKP A.1102.1
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {idx === 5 ? (
                        <div className="w-full px-4 py-2 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-center font-bold">
                          {answers[idx]}
                        </div>
                      ) : (
                        <select 
                          className={`w-full px-4 py-2 rounded-lg font-bold text-center border focus:outline-none focus:ring-2 focus:ring-atlas-blue/20 transition-all ${
                            answers[idx] === 'Ya' ? 'bg-red-50 border-red-200 text-red-700' :
                            answers[idx] === 'Tidak' ? 'bg-green-50 border-green-200 text-green-700' :
                            'bg-white border-gray-300 text-gray-500'
                          }`}
                          value={answers[idx] || ''}
                          onChange={(e) => setAnswers({...answers, [idx]: e.target.value})}
                        >
                          <option value="" disabled>Pilih</option>
                          <option value="Ya">Ya</option>
                          <option value="Tidak">Tidak</option>
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

export default A1102;
