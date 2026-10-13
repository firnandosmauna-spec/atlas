import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

const C400 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [respon1, setRespon1] = useState('');
  const [respon2a, setRespon2a] = useState('');
  const [respon2b, setRespon2b] = useState('');
  
  const [opiniDisarankan, setOpiniDisarankan] = useState('');
  const [opiniAuditor, setOpiniAuditor] = useState('');
  const [simpulan, setSimpulan] = useState('');

  // Logika Opini yang Disarankan
  useEffect(() => {
    let opini = '';
    if (respon1 === 'Ya') {
      if (respon2a === 'Tidak') {
        opini = 'Wajar Tanpa Pengecualian';
      } else if (respon2a === 'Ya') {
        if (respon2b === 'Tidak') {
          opini = 'Wajar Dengan Pengecualian';
        } else if (respon2b === 'Ya') {
          opini = 'Tidak Wajar';
        }
      }
    } else if (respon1 === 'Tidak') {
      if (respon2a === 'Ya') {
        if (respon2b === 'Tidak') {
          opini = 'Wajar Dengan Pengecualian';
        } else if (respon2b === 'Ya') {
          opini = 'Tidak Menyatakan Pendapat';
        }
      } else if (respon2a === 'Tidak') {
        // Technically shouldn't happen based on the table, but fallback to TMP or ask for input
        opini = 'Tidak Menyatakan Pendapat';
      }
    }
    setOpiniDisarankan(opini);
  }, [respon1, respon2a, respon2b]);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const status = simpulan !== '' && opiniAuditor !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="C.400"
      name="Evaluasi Bukti Audit"
      purpose="Merumuskan opini auditor dengan mempertimbangkan kecukupan dan ketepatan bukti audit serta dampak dari temuan (pervasif atau tidak)."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Instructions */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p className="mb-2">Kertas kerja ini digunakan untuk merumuskan opini auditor dengan mempertimbangkan apakah bukti audit yang diperoleh secara keseluruhan telah cukup dan tepat sebagai basis yang opini auditor.</p>
          <p className="mb-2">Pada kertas kerja ini secara garis besar ada 2 hal yang akan dipertimbangkan yaitu:</p>
          <ol className="list-decimal list-inside mb-2">
             <li>Kecukupan dan ketepatan bukti audit (termasuk pertimbangan adanya pembatasan lingkup sebagai pertimbangan kecukupan bukti audit); dan</li>
             <li>Dampak atas respon nomor 1 apakah memiliki dampak pervasif atas akun-akun laporan keuangan keseluruhan atau tidak.</li>
          </ol>
          <p>Penentuan kedua hal tersebut akan menentukan jenis opini yang disarankan untuk diterbitkan oleh auditor. Mengacu ke SA 705, secara ringkas kombinasi yang dapat terjadi telah diimplementasikan dalam logika perhitungan tabel di bawah.</p>
        </div>

        {/* Form Evaluasi */}
        <div className="bg-white border border-gray-400 p-6 shadow-sm max-w-4xl mx-auto rounded-sm">
           <div className="grid grid-cols-[1fr_250px] gap-4 mb-2 font-bold text-[11px]">
             <div></div>
             <div className="text-center text-gray-800 border-b border-gray-400 pb-1">RESPON</div>
           </div>

           <div className="space-y-4 text-[11px] font-bold text-gray-700">
             {/* No 1 */}
             <div className="grid grid-cols-[1fr_250px] gap-4 items-center">
               <div>
                 1. BUKTI AUDIT YANG DIKUMPULKAN TELAH CUKUP DAN TEPAT<br/>
                 <span className="font-normal">(TERMASUK ADANYA PEMBATASAN LINGKUP)</span>
               </div>
               <div>
                 <select 
                   className="w-full bg-green-50 border border-green-400 p-2 outline-none text-center text-gray-800 focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all"
                   value={respon1}
                   onChange={(e) => setRespon1(e.target.value)}
                 >
                   <option value="">- Pilih -</option>
                   <option value="Ya">Ya</option>
                   <option value="Tidak">Tidak</option>
                 </select>
               </div>
             </div>

             {/* No 2 */}
             <div>
               <div className="mb-2">2. DAMPAK ATAS RESPON NO 1</div>
               <div className="grid grid-cols-[1fr_250px] gap-4 items-center mb-2 pl-4">
                 <div className="text-red-600">a. Menyebabkan salah saji material</div>
                 <div>
                   <select 
                     className="w-full bg-green-50 border border-green-400 p-2 outline-none text-center text-gray-800 focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all"
                     value={respon2a}
                     onChange={(e) => setRespon2a(e.target.value)}
                   >
                     <option value="">- Pilih -</option>
                     <option value="Ya">Ya</option>
                     <option value="Tidak">Tidak</option>
                   </select>
                 </div>
               </div>
               <div className="grid grid-cols-[1fr_250px] gap-4 items-center pl-4">
                 <div className="text-red-600">b. Berdampak pervasif</div>
                 <div>
                   <select 
                     className="w-full bg-green-50 border border-green-400 p-2 outline-none text-center text-gray-800 focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all"
                     value={respon2b}
                     onChange={(e) => setRespon2b(e.target.value)}
                     disabled={respon2a !== 'Ya'}
                   >
                     <option value="">- Pilih -</option>
                     <option value="Ya">Ya</option>
                     <option value="Tidak">Tidak</option>
                   </select>
                 </div>
               </div>
             </div>

             {/* Divider */}
             <div className="border-t border-gray-300 my-4"></div>

             {/* Opini */}
             <div className="grid grid-cols-[1fr_250px] gap-4 items-center mb-2">
               <div className="font-normal text-gray-800">OPINI YANG DISARANKAN</div>
               <div>
                 <input 
                   type="text" 
                   readOnly 
                   className="w-full bg-gray-100 border border-gray-300 p-2 text-center font-bold text-atlas-blue"
                   value={opiniDisarankan}
                 />
               </div>
             </div>

             <div className="grid grid-cols-[1fr_250px] gap-4 items-center">
               <div className="font-normal text-gray-800">OPINI AUDITOR</div>
               <div>
                 <select 
                   className="w-full bg-green-100 border border-green-500 p-2 outline-none text-center font-bold text-gray-800 focus:border-green-700 transition-all shadow-inner"
                   value={opiniAuditor}
                   onChange={(e) => setOpiniAuditor(e.target.value)}
                 >
                   <option value="">- Pilih -</option>
                   <option value="Wajar Tanpa Pengecualian">Wajar Tanpa Pengecualian</option>
                   <option value="Wajar Dengan Pengecualian">Wajar Dengan Pengecualian</option>
                   <option value="Tidak Wajar">Tidak Wajar</option>
                   <option value="Tidak Menyatakan Pendapat">Tidak Menyatakan Pendapat</option>
                 </select>
               </div>
             </div>
           </div>

           <div className="mt-8 border border-gray-300">
             <div className="grid grid-cols-[120px_200px] border-b border-gray-300">
               <div className="font-bold text-[10px] p-2 bg-gray-100 border-r border-gray-300">Status KKP</div>
               <div className={`font-bold p-2 text-[10px] text-center ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
                 {status}
               </div>
             </div>
             <div className="p-3 bg-white">
               <div className="font-bold text-gray-800 italic text-[11px] mb-2">Simpulan</div>
               <select 
                 className="w-full bg-green-50 border border-green-400 p-2 outline-none font-medium text-gray-800"
                 value={simpulan}
                 onChange={(e) => setSimpulan(e.target.value)}
               >
                 <option value="">- Pilih Kesimpulan -</option>
                 <option value="Evaluasi bukti audit memadai">Evaluasi bukti audit memadai</option>
                 <option value="Evaluasi bukti audit tidak memadai">Evaluasi bukti audit tidak memadai</option>
               </select>
             </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c300`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.300
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.400
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c500`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut C.500 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C400;
