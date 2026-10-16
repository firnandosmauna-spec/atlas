import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type RiskAssessmentItem = {
  id: string;
  no: string;
  prosedur: string;
  pelaksanaan: string;
  penjelasan: string;
  referensi: string;
};

type ProsedurTerkaitItem = {
  id: string;
  no: string;
  isParent: boolean;
  prosedur: string;
  yaTidak: string;
  penjelasan: string;
  referensi: string;
};

const B240 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Bagian 1: Analisis Z-Score
  const [saldoLaba, setSaldoLaba] = useState('');
  const [modalSaham, setModalSaham] = useState('');

  // Bagian 2: Risk Assessment
  const [riskItems, setRiskItems] = useState<RiskAssessmentItem[]>([
    { id: 'r1', no: '1.', prosedur: 'melakukan evaluasi adanya indikasi permasalahan going concern dengan menggunakan analisis statistik dan hasil prosedur analisis final', pelaksanaan: '', penjelasan: '', referensi: '' },
    { id: 'r2', no: '2.', prosedur: 'mendapatkan dokumen pendukung yang relevan terkait rencana manajemen dalam merespon isu going concern', pelaksanaan: '', penjelasan: '', referensi: '' },
    { id: 'r3', no: '3.', prosedur: 'melakukan permintaan keterangan dengan manajemen mengenai kejadian/kondisi diluar tanggal neraca yang dapat', pelaksanaan: '', penjelasan: '', referensi: '' },
    { id: 'r4', no: '4.', prosedur: 'melakukan evaluasi kembali berdasarkan dokumen rencana manajemen dan hasil permintaan keterangan dengan', pelaksanaan: '', penjelasan: '', referensi: '' },
  ]);

  // Bagian 3: Prosedur & Aktivitas Terkait
  const [aktivitasItems, setAktivitasItems] = useState<ProsedurTerkaitItem[]>([
    { id: 'a1', no: '1.', isParent: true, prosedur: 'Perusahaan menghadapi kerugian yang substansial atau backlogs dalam kerugian operasi', yaTidak: '', penjelasan: '', referensi: '' },
    { id: 'a1a', no: '', isParent: false, prosedur: 'Produk yang dijual tidak menghasilkan profit', yaTidak: '', penjelasan: '', referensi: '' },
    { id: 'a1b', no: '', isParent: false, prosedur: 'Permintaan yang rendah terhadap barang/jasa', yaTidak: '', penjelasan: '', referensi: '' },
    { id: 'a1c', no: '', isParent: false, prosedur: 'Biaya operasional yang tinggi sehingga profit margin rendah', yaTidak: '', penjelasan: '', referensi: '' },
    { id: 'a1d', no: '', isParent: false, prosedur: 'Penekanan penjualan untuk menghabiskan volume', yaTidak: '', penjelasan: '', referensi: '' },
    { id: 'a2', no: '2.', isParent: true, prosedur: 'Arus kas operasi negatif', yaTidak: '', penjelasan: '', referensi: '' },
  ]);

  const [simpulan, setSimpulan] = useState('');
  const [alasan, setAlasan] = useState('');
  const [rencanaManajemen, setRencanaManajemen] = useState('');
  const [pendapatAuditor, setPendapatAuditor] = useState('');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUpdateRisk = (id: string, field: keyof RiskAssessmentItem, value: string) => {
    setRiskItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleUpdateAktivitas = (id: string, field: keyof ProsedurTerkaitItem, value: string) => {
    setAktivitasItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const hasGoingConcernIssue = aktivitasItems.some(item => item.yaTidak === 'YA');
  const isAnyProsedurFilled = riskItems.some(item => item.pelaksanaan !== '');
  const status = isAnyProsedurFilled && simpulan !== '' ? 'Completed' : 'Incompleted';

  return (
    <WorksheetContainer
      code="B.240"
      name="Kelangsungan Usaha (Going Concern)"
      purpose="Identifikasi dan menilai apakah terdapat isu mengenai keberlangsungan usaha dari klien."
      status={status}
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6 text-xs font-sans">
        
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm text-sm">
          <p>Pada kertas kerja ini auditor melakukan identifikasi dan menilai apakah terdapat isu mengenai keberlangsungan usaha (<strong>going concern</strong>) dari klien berdasarkan dua aspek kriteria yaitu <strong>Aspek Keuangan</strong> dan <strong>Aspek Operasional</strong>.</p>
        </div>

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-cyan-50 border border-cyan-200 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[100px_auto] gap-x-2 gap-y-1 text-[10px] uppercase font-bold text-gray-700">
              <div>Nama Klien</div><div className="text-gray-900">: {engagement.clientName}</div>
              <div>Tahun Buku</div><div className="text-gray-900">: {engagement.period}</div>
              <div>Indeks KKP</div><div className="text-red-600">: B.240</div>
              <div>Nama Indeks</div><div className="text-gray-900">: Kelangsungan Usaha (Going Concern)</div>
            </div>
            
            <div className="mt-6 flex flex-col items-start space-y-2">
              <span className="font-bold text-gray-800 text-[10px]">Simpulan</span>
              <div className="w-full space-y-2">
                <select 
                  className="w-full max-w-xl border border-green-500 bg-white p-1.5 outline-none font-bold text-gray-800 shadow-sm"
                  value={simpulan}
                  onChange={(e) => {
                    setSimpulan(e.target.value);
                    if (e.target.value !== 'Bukti audit tidak cukup dan tepat serta Evaluasi kelangsungan usaha tidak memadai') {
                      setAlasan('');
                    }
                  }}
                >
                  <option value="">- Pilih Simpulan -</option>
                  <option value="Bukti audit cukup dan tepat serta Evaluasi kelangsungan usaha memadai">Bukti audit cukup dan tepat serta Evaluasi kelangsungan usaha memadai.</option>
                  <option value="Bukti audit tidak cukup dan tepat serta Evaluasi kelangsungan usaha tidak memadai">Bukti audit tidak cukup dan tepat serta Evaluasi kelangsungan usaha tidak memadai</option>
                </select>
                
                {simpulan === 'Bukti audit tidak cukup dan tepat serta Evaluasi kelangsungan usaha tidak memadai' && (
                  <div className="w-full max-w-xl bg-yellow-50 border border-yellow-300 p-2 shadow-inner rounded-sm">
                    <label className="block text-red-600 font-bold mb-1 text-[10px] uppercase">Jelaskan ketidakcukupan/ketidakmemadaian bukti audit</label>
                    <textarea 
                      className="w-full bg-white border border-yellow-300 outline-none p-2 resize-none min-h-[50px] text-xs"
                      value={alasan}
                      onChange={(e) => setAlasan(e.target.value)}
                      placeholder="Masukkan penjelasan detail..."
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-32 border border-gray-400 mt-4 text-center bg-white">
              <div className="bg-gray-100 border-b border-gray-400 text-[10px] py-1 font-bold">Status KKP</div>
              <div className={`font-bold py-1.5 text-[10px] ${status === 'Completed' ? 'bg-green-200 text-green-900' : 'bg-cyan-200 text-cyan-900'}`}>
                {status}
              </div>
            </div>
          </div>

          <div className="w-full md:w-96 bg-white border border-gray-300 p-3 rounded shadow-sm text-[10px]">
             <div className="flex justify-between items-center mb-1">
               <span>Disiapkan oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" defaultValue={engagement.auditorName || "Auditor"} />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal mulai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
             <div className="flex justify-between items-center mb-1 pb-2 border-b border-gray-200">
               <span>Tanggal selesai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
             
             <div className="flex justify-between items-center mt-2 mb-1">
               <span>Direview oleh</span>
               <input type="text" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" defaultValue={engagement.managerName || "Manager"} />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal mulai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
             <div className="flex justify-between items-center mb-1">
               <span>Tanggal selesai</span>
               <input type="date" className="border border-red-300 bg-red-50 w-32 px-1 py-0.5 outline-none" />
             </div>
          </div>
        </div>

        {/* Bagian 1: Z-Score (Mocked layout) */}
        <div className="bg-white border border-gray-300 p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 text-xs mb-3 border-b border-gray-200 pb-2">Bagian 1: Analisis Z-Score</h3>
          <div className="flex gap-4 items-start">
             <div className="flex-1 space-y-2">
                <p className="text-[10px] text-gray-600 mb-2">Pilih akun yang sesuai dengan saldo laba dan modal pemegang saham</p>
                <div className="grid grid-cols-[150px_auto] gap-2 items-center text-[10px]">
                   <label className="font-bold">Saldo Laba</label>
                   <select className="border border-gray-300 p-1 w-full bg-green-100 font-bold" value={saldoLaba} onChange={e => setSaldoLaba(e.target.value)}>
                     <option value="2800.000">2800.000 (Saldo Laba)</option>
                   </select>
                   <label className="font-bold">Modal Pemegang Saham</label>
                   <select className="border border-gray-300 p-1 w-full bg-green-100 font-bold" value={modalSaham} onChange={e => setModalSaham(e.target.value)}>
                     <option value="Modal disetor">Modal disetor</option>
                   </select>
                </div>
                <div className="mt-4 text-[9px] text-gray-500 font-mono">
                  Z = 0.717 X1 + 0.847 X2 + 3.107 X3 + 0.420 X4 + 0.998 X5 <br/>
                  dimana:<br/>
                  X1 = Modal Kerja dibagi Total Aset<br/>
                  X2 = Laba Ditahan dibagi Total Aset<br/>
                  X3 = EBIT dibagi Total Aset<br/>
                  X4 = Ekuitas Pemegang Saham dibagi Total Kewajiban<br/>
                  X5 = Penjualan dibagi Total Aset<br/><br/>
                  Jika:<br/>
                  Hasil Z &lt; 1.23, maka mengindikasikan kelangsungan usaha dalam predikat Pailit<br/>
                  Hasil 1.23 &lt; Z &lt; 2.90, maka mengindikasikan kelangsungan usaha dalam predikat Grey Area<br/>
                  Hasil Z &gt; 2.90, maka mengindikasikan kelangsungan usaha dalam predikat Tidak Pailit
                </div>
             </div>
             
             <div className="w-80 border border-gray-400">
               <table className="w-full text-center text-[10px] border-collapse">
                 <thead>
                   <tr>
                     <th className="border border-gray-400 p-1 bg-gray-100"></th>
                     <th className="border border-gray-400 p-1 bg-gray-100 font-bold text-red-600">Unaudited</th>
                     <th className="border border-gray-400 p-1 bg-gray-100 font-bold">Audited</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td className="border border-gray-400 p-1 font-bold text-left bg-gray-50">Z-Score</td>
                     <td className="border border-gray-400 p-1">1.930</td>
                     <td className="border border-gray-400 p-1">1.925</td>
                   </tr>
                   <tr>
                     <td className="border border-gray-400 p-1 font-bold text-left bg-gray-50">Area</td>
                     <td className="border border-gray-400 p-1 font-bold text-orange-600">Grey Area</td>
                     <td className="border border-gray-400 p-1 font-bold text-orange-600">Grey Area</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Bagian 2: Risk Assessment */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <div className="bg-blue-900 text-white font-bold py-1.5 px-4 text-[10px] tracking-widest border-b border-blue-950 uppercase">
             Analisis Kelangsungan Usaha - Risk Assessment
          </div>
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-cyan-100">
                <th colSpan={2} className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-[600px]">Prosedur Audit</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-32">Pelaksanaan Prosedur</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-64">PENJELASAN</th>
                <th className="px-2 py-2 border border-gray-400 font-bold text-center text-cyan-900 w-32">Ref KKP</th>
              </tr>
            </thead>
            <tbody>
              {riskItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-gray-400 bg-white p-2 w-8 text-center">{item.no}</td>
                  <td className="border border-gray-400 bg-white p-2 leading-tight">{item.prosedur}</td>
                  <td className="border border-gray-400 bg-green-50/50 p-0">
                    <select 
                      className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent font-medium text-center text-gray-700" 
                      value={item.pelaksanaan} 
                      onChange={e => handleUpdateRisk(item.id, 'pelaksanaan', e.target.value)}
                    >
                      <option value=""></option>
                      <option value="DILAKSANAKAN">DILAKSANAKAN</option>
                      <option value="TIDAK DILAKSANAKAN">TIDAK DILAKSANAKAN</option>
                      <option value="TIDAK BERLAKU">TIDAK BERLAKU</option>
                    </select>
                  </td>
                  <td className="border border-gray-400 bg-white p-0">
                    <textarea className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent resize-none leading-tight text-gray-700" value={item.penjelasan} onChange={e => handleUpdateRisk(item.id, 'penjelasan', e.target.value)} />
                  </td>
                  <td className="border border-gray-400 bg-white p-0">
                    <input type="text" className="w-full h-full min-h-[40px] p-2 outline-none bg-transparent text-center text-red-600 font-bold" value={item.referensi} onChange={e => handleUpdateRisk(item.id, 'referensi', e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bagian 3: Prosedur dan Aktivitas Terkait */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm">
          <div className="bg-blue-900 text-white font-bold py-1.5 px-4 text-[10px] tracking-widest border-b border-blue-950 uppercase">
             Prosedur dan Aktivitas Terkait
          </div>
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-orange-50">
                <th colSpan={2} className="px-2 py-1.5 border border-gray-400 font-bold text-gray-700 italic text-[9px]">
                  Berikut merupakan contoh peristiwa/kejadian yang dapat mempengaruhi kelangsungan usaha (baik secara individu maupun kolektif)
                </th>
                <th className="px-2 py-1.5 border border-gray-400 font-bold text-center text-cyan-900 w-32 bg-cyan-100">YA/TIDAK</th>
                <th className="px-2 py-1.5 border border-gray-400 font-bold text-center text-cyan-900 w-64 bg-cyan-100">PENJELASAN</th>
                <th className="px-2 py-1.5 border border-gray-400 font-bold text-center text-cyan-900 w-32 bg-cyan-100">Ref KKP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="bg-yellow-100 font-bold px-2 py-1 border border-gray-400 text-gray-800">Keuangan/Perusahaan</td>
              </tr>
              {aktivitasItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className={`border border-gray-400 bg-white p-1 text-right text-red-600 font-bold ${!item.isParent ? 'w-12 border-r-0' : 'w-6'}`}>{item.no}</td>
                  <td className={`border border-gray-400 bg-white p-2 leading-tight ${item.isParent ? 'font-bold text-red-600' : 'border-l-0 pl-0'}`}>{item.prosedur}</td>
                  <td className="border border-gray-400 bg-green-50/50 p-0">
                    <select 
                      className="w-full h-full min-h-[30px] p-2 outline-none bg-transparent font-medium text-center text-gray-800" 
                      value={item.yaTidak} 
                      onChange={e => handleUpdateAktivitas(item.id, 'yaTidak', e.target.value)}
                    >
                      <option value=""></option>
                      <option value="YA">YA</option>
                      <option value="TIDAK">TIDAK</option>
                    </select>
                  </td>
                  <td className="border border-gray-400 bg-orange-50/50 p-0">
                    {item.yaTidak === 'YA' ? (
                      <textarea className="w-full h-full min-h-[30px] p-2 outline-none bg-white resize-none leading-tight border border-orange-200" value={item.penjelasan} onChange={e => handleUpdateAktivitas(item.id, 'penjelasan', e.target.value)} />
                    ) : (
                      <div className="w-full h-full bg-orange-50/50 min-h-[30px]"></div>
                    )}
                  </td>
                  <td className="border border-gray-400 bg-white p-0">
                     <input type="text" className="w-full h-full min-h-[30px] p-2 outline-none bg-transparent text-center text-red-600 font-bold" value={item.referensi} onChange={e => handleUpdateAktivitas(item.id, 'referensi', e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bagian 4: Kesimpulan Khusus jika YA */}
        {hasGoingConcernIssue && (
          <div className="bg-orange-50 border-2 border-orange-400 shadow-md p-0 overflow-hidden rounded">
             <div className="flex text-[10px] font-bold text-center border-b border-orange-300">
               <div className="flex-1 p-2 bg-orange-100 text-orange-900 border-r border-orange-300 uppercase">Terdapat Permasalahan Going Concern, Jelaskan Rencana Manajemen</div>
               <div className="flex-1 p-2 bg-blue-100 text-blue-900 uppercase">Pendapat Auditor Atas Rencana Manajemen</div>
             </div>
             <div className="flex h-32">
               <textarea 
                 className="flex-1 p-3 outline-none resize-none border-r border-orange-300 bg-white"
                 placeholder="Jelaskan rencana manajemen..."
                 value={rencanaManajemen}
                 onChange={(e) => setRencanaManajemen(e.target.value)}
               ></textarea>
               <textarea 
                 className="flex-1 p-3 outline-none resize-none bg-white"
                 placeholder="Tuliskan tanggapan atau pendapat auditor terkait rencana tersebut..."
                 value={pendapatAuditor}
                 onChange={(e) => setPendapatAuditor(e.target.value)}
               ></textarea>
             </div>
          </div>
        )}

        {/* Note */}
        <div className="mt-4 pt-4 border-t border-gray-200">
           <p className="text-gray-500 font-bold italic">Catatan:</p>
           <p className="text-gray-500 italic mt-1">Jika isu kelangsungan usaha teridentifikasi, auditor harus melakukan prosedur sebagaimana diisyaratkan dalam SA diantaranya berupa mendapatkan dokumen pendukung yang relevan dan melakukan evaluasi kembali.</p>
           <p className="text-gray-500 italic mt-1 font-bold text-blue-800">Status KKP akan "Completed" jika minimal satu kondisi saja diisi pelaksanaannya dan Simpulan telah ditentukan.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b230`)} className="text-gray-500 hover:text-gray-800 flex items-center">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke B.230
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
            >
              {isSaved ? <CheckCircle2 size={14} className="mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              Simpan B.240
            </button>
            <button 
              onClick={() => navigate(`/workspace/${engagement.id}/worksheet/b250`)}
              className="flex items-center px-4 py-2 border border-atlas-blue text-atlas-blue rounded font-bold hover:bg-blue-50 shadow transition-colors"
            >
              Lanjut B.250 <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default B240;
