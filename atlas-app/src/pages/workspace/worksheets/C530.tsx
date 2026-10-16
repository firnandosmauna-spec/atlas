import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

const C530 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [nomorLai, setNomorLai] = useState('');
  const [tanggalLai, setTanggalLai] = useState('');
  const [noIjinAp, setNoIjinAp] = useState('');
  const [pihakDituju, setPihakDituju] = useState('');
  const [noIndukKap, setNoIndukKap] = useState('');
  const [lokasiOpini, setLokasiOpini] = useState('');
  
  const [penekananSuatuHal, setPenekananSuatuHal] = useState(false);
  const [halLain, setHalLain] = useState(false);
  const [infoTambahan, setInfoTambahan] = useState('');
  
  const [basisModifikasi, setBasisModifikasi] = useState('');
  
  const [kesimpulan, setKesimpulan] = useState('');

  const opiniAuditor = "Wajar Tanpa Pengecualian"; // Should be passed from C400 state in real app
  const isOpiniModifikasian = opiniAuditor !== "Wajar Tanpa Pengecualian";

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const status = kesimpulan !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="C.530"
      name="Laporan Auditor Independen Final"
      purpose="Mencantumkan informasi yang diperlukan terkait dengan Laporan Auditor Independen yang akan diterbitkan sekaligus memberikan contoh format opini yang akan diterbitkan oleh auditor."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Instructions */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Kertas kerja ini digunakan untuk mencantumkan informasi yang diperlukan terkait dengan Laporan Auditor Independen yang akan diterbitkan sekaligus memberikan contoh format opini yang akan diterbitkan oleh auditor.</p>
        </div>

        {/* Form LAI */}
        <div className="bg-white border border-gray-400 p-4 shadow-sm relative">
           <div className="text-[10px] uppercase font-bold text-gray-800 mb-2">Laporan Auditor Independen</div>
           
           <div className="grid grid-cols-[180px_auto] gap-x-2 gap-y-2 items-center text-[11px] font-bold">
             <div className="text-gray-700">Nomor LAI <span className="ml-2 font-normal">:</span></div>
             <div className="flex items-center gap-1 font-normal text-gray-600">
               <input type="text" className="bg-orange-100 border-none outline-none p-1 w-20 text-center font-bold" value={nomorLai} onChange={e => setNomorLai(e.target.value)} />
               <span>/</span>
               <div className="bg-green-100 p-1 w-16 text-center">2.1974</div>
               <span>/</span>
               <div className="bg-green-100 p-1 w-16 text-center">AU-02</div>
               <span>/</span>
               <div className="bg-green-100 p-1 w-10 text-center">08</div>
               <span>/</span>
               <div className="bg-green-100 p-1 w-16 text-center">0001</div>
               <span>/</span>
               <div className="bg-green-100 p-1 w-10 text-center">1</div>
               <span>/</span>
               <div className="bg-green-100 p-1 w-20 text-center">III/{engagement.period}</div>
             </div>

             <div className="text-gray-700">Tanggal LAI <span className="ml-2 font-normal">:</span></div>
             <div>
               <input type="date" className="bg-orange-100 border-none outline-none p-1 w-48 font-bold text-gray-800" value={tanggalLai} onChange={e => setTanggalLai(e.target.value)} />
             </div>

             <div className="text-gray-700">Penandatangan LAI <span className="ml-2 font-normal">:</span></div>
             <div className="font-normal">{engagement.partnerName || '-'}</div>

             <div className="text-gray-700">No Ijin AP <span className="ml-2 font-normal">:</span></div>
             <div>
               <input type="text" className="bg-orange-100 border-none outline-none p-1 w-48 font-bold" value={noIjinAp} onChange={e => setNoIjinAp(e.target.value)} />
             </div>

             <div className="text-gray-700 mt-2">Pihak yang dituju <span className="ml-2 font-normal">:</span></div>
             <div className="mt-2">
               <input type="text" className="bg-orange-100 border-none outline-none p-1 w-full max-w-2xl font-bold" value={pihakDituju} onChange={e => setPihakDituju(e.target.value)} />
             </div>

             <div className="text-gray-700">Tipe Perikatan <span className="ml-2 font-normal">:</span></div>
             <div className="font-normal">{engagement.engagementType || 'Perikatan Tahun Pertama'}</div>
             
             <div></div><div></div>

             <div className="text-gray-700 mt-2">No Induk KAP <span className="ml-2 font-normal">:</span><br/><span className="font-normal text-[9px]">(lihat web PPPK)</span></div>
             <div className="mt-2">
               <input type="text" className="bg-orange-100 border-none outline-none p-1 w-64 font-bold" value={noIndukKap} onChange={e => setNoIndukKap(e.target.value)} />
             </div>

             <div className="text-gray-700">Opini Auditor <span className="ml-2 font-normal">:</span></div>
             <div className="font-bold text-gray-800 uppercase">{opiniAuditor}</div>

             <div className="text-gray-700">Lokasi Opini Terbit <span className="ml-2 font-normal">:</span></div>
             <div>
               <input type="text" className="bg-orange-100 border-none outline-none p-1 w-64 font-bold" value={lokasiOpini} onChange={e => setLokasiOpini(e.target.value)} />
             </div>

             <div className="text-gray-700 mt-4">Contoh Format Opini <span className="ml-2 font-normal">:</span></div>
             <div className="mt-4">
               <button 
                 className="w-16 h-12 bg-white border border-gray-400 flex items-center justify-center relative hover:bg-gray-50 transition-colors shadow-sm"
                 title="Lihat Format Opini"
                 onClick={() => alert(`Contoh format opini untuk ${opiniAuditor} ditampilkan di tab baru (Simulasi).`)}
               >
                  <div className="absolute top-1/2 left-0 right-0 h-4 bg-red-600 -translate-y-1/2"></div>
               </button>
             </div>

             <div className="text-gray-700 mt-6 flex items-start">Tambahan paragraf <span className="ml-2 font-normal">:</span></div>
             <div className="mt-6 flex flex-col gap-2">
               <div className="flex items-center gap-6 border border-gray-400 p-2 w-max bg-white">
                 <label className="flex items-center cursor-pointer font-normal text-gray-700">
                   <input type="checkbox" className="mr-2" checked={penekananSuatuHal} onChange={e => setPenekananSuatuHal(e.target.checked)} />
                   Penekanan Suatu Hal
                 </label>
                 <label className="flex items-center cursor-pointer font-normal text-gray-700">
                   <input type="checkbox" className="mr-2" checked={halLain} onChange={e => setHalLain(e.target.checked)} />
                   Hal Lain
                 </label>
               </div>
               
               {(penekananSuatuHal || halLain) && (
                 <textarea 
                   className="w-full max-w-2xl min-h-[60px] bg-orange-100 border border-orange-300 outline-none p-2 mt-1 resize-none"
                   placeholder="Informasi tentang penekanan suatu hal dan/atau hal lain..."
                   value={infoTambahan}
                   onChange={e => setInfoTambahan(e.target.value)}
                 />
               )}
             </div>

             {isOpiniModifikasian && (
               <>
                 <div className="text-gray-700 mt-4 flex items-start">Basis Opini Modifikasian <span className="ml-2 font-normal">:</span></div>
                 <div className="mt-4">
                   <textarea 
                     className="w-full max-w-2xl min-h-[80px] bg-orange-100 border border-orange-300 outline-none p-2 resize-none"
                     placeholder="Basis untuk opini modifikasian..."
                     value={basisModifikasi}
                     onChange={e => setBasisModifikasi(e.target.value)}
                   />
                 </div>
               </>
             )}

           </div>
        </div>

        {/* Kesimpulan Area */}
        <div className="grid grid-cols-[1fr_200px_200px] border border-gray-400 text-[11px] font-bold">
           <div className="flex border-r border-gray-400">
             <div className="bg-gray-100 p-2 border-r border-gray-400 w-24">Kesimpulan</div>
             <select 
               className="flex-1 bg-green-50 p-2 outline-none text-gray-800"
               value={kesimpulan}
               onChange={e => setKesimpulan(e.target.value)}
             >
               <option value="">- Pilih Kesimpulan -</option>
               <option value="Format LAI telah memadai">Format LAI telah memadai</option>
               <option value="Format LAI belum memadai">Format LAI belum memadai</option>
             </select>
           </div>
           
           <div className="bg-gray-100 p-2 border-r border-gray-400 text-center">Status KKP</div>
           <div className={`p-2 text-center ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
             {status}
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/c520`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke C.520
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan C.530
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Selesai & Ke Beranda <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default C530;
