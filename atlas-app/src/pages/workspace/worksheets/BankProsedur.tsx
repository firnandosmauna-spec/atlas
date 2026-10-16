import React, { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useEngagementStore } from '../../../store/engagementStore';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

const STANDAR_AUDIT_PROSEDUR = [
  { no: 1, type: 'PROSEDUR ANALITIS SUBTANTIF', text: 'Membandingkan saldo kas tahun berjalan dengan saldo periode sebelumnya.', asersi: 'C, E, A' },
  { no: 2, type: 'PROSEDUR ANALITIS SUBTANTIF', text: 'Bila terdapat ketidakwajaran atas selisih dari prosedur perbandingan di atas, maka peroleh penjelasan dari Manajemen dan lakukan prosedur lainnya bila diperlukan.', asersi: 'C, E, A' },
  { no: 3, type: 'PROSEDUR SUBTANTIF RINCI', text: 'Melakukan pengadaan atas setoran dan penarikan tunai tahun berjalan termasuk rekening yang ditutup.', asersi: 'C' },
  { no: 4, type: 'PROSEDUR SUBTANTIF RINCI', text: 'Melakukan konfirmasi bank atas saldo akhir simpanan bank', asersi: 'C, E, A, V' },
  { no: 5, type: 'PROSEDUR SUBTANTIF RINCI', text: 'Melakukan pengetesan dan pencocokan hasil konfirmasi bank dengan saldo per catatan.', asersi: 'C, E, A, V' },
  { no: 6, type: 'PROSEDUR SUBTANTIF RINCI', text: 'Untuk akun yang tidak dikonfirmasi, melakukan prosedur alternatif seperti mereviu rekening koran Bank termasuk deposito (bila ada).', asersi: 'C, E, A, V' },
  { no: 7, type: 'PROSEDUR SUBTANTIF RINCI', text: 'Melakukan pengujian rekalkulasi penghitungan rekonsiliasi bank dan mencocokkan ke GL', asersi: 'E, A, V' },
];

const BankProsedur = ({ indeks = 'A' }: { indeks?: string }) => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Group handling
  let groupName = 'Kas dan setara kas';
  let groupAsersi = 'E V';
  if (indeks.toUpperCase() === 'C') { groupName = 'Hutang Usaha'; groupAsersi = 'C V'; }

  const [prosedurState, setProsedurState] = useState<Record<number, { status: string, pic: string, ref: string }>>({});

  const handleUpdate = (no: number, field: string, value: string) => {
    setProsedurState(prev => ({
      ...prev,
      [no]: {
        ...(prev[no] || { status: '', pic: '', ref: '' }),
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <WorksheetContainer
      code={`BP-${indeks.toUpperCase()}`}
      name={`Bank Prosedur - ${groupName}`}
      purpose={`Pemilihan dan pelaksanaan prosedur audit untuk akun ${groupName}`}
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Review'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Header Title */}
        <div className="bg-[#001f5c] text-white text-center p-3 font-bold border-2 border-[#001f5c]">
          <div className="text-lg text-yellow-400 mb-1">{groupName}</div>
          <div className="text-sm">ASERSI {groupAsersi}</div>
        </div>

        {/* Top Controls */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <button className="bg-yellow-400 text-yellow-900 font-bold px-4 py-1 border border-yellow-600 rounded-sm hover:bg-yellow-300">
              TO I
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 mb-1">PILIH AKUN {'>>>>>'}</span>
              <select className="bg-green-200 border border-green-500 font-bold text-gray-800 p-1.5 w-64 outline-none">
                <option value={groupName}>{groupName.toUpperCase()}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prosedur Table */}
        <div className="bg-white border border-gray-400 overflow-x-auto shadow-sm mt-4">
          <table className="w-max min-w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-400">
                <th className="px-2 py-2 border-r border-gray-300 font-bold text-center w-10">NO</th>
                <th className="px-2 py-2 border-r border-gray-300 font-bold text-center w-[500px]">PROSEDUR</th>
                <th className="px-2 py-2 border-r border-gray-300 font-bold text-center w-24">ASERSI</th>
                <th className="px-2 py-2 border-r border-gray-300 font-bold text-center w-32">STATUS</th>
                <th className="px-2 py-2 border-r border-gray-300 font-bold text-center w-32">PIC</th>
                <th className="px-2 py-2 border-gray-300 font-bold text-center w-40">REFERENSI</th>
              </tr>
            </thead>
            <tbody>
              {STANDAR_AUDIT_PROSEDUR.map((p, i) => {
                const data = prosedurState[p.no] || { status: '', pic: '', ref: '' };
                const isNewSection = i === 0 || STANDAR_AUDIT_PROSEDUR[i-1].type !== p.type;
                
                return (
                  <React.Fragment key={p.no}>
                    {isNewSection && (
                      <tr className="bg-gray-50">
                        <td className="border-r border-gray-300"></td>
                        <td className="px-2 py-1 border-r border-gray-300 font-bold text-gray-700">{p.type}</td>
                        <td colSpan={4} className="border-gray-300"></td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-50 transition-colors border-b border-gray-200">
                      <td className="px-2 py-2 border-r border-gray-300 text-center font-bold text-gray-600">{p.no}</td>
                      <td className="px-2 py-2 border-r border-gray-300 text-gray-800 pr-4">{p.text}</td>
                      <td className="px-2 py-2 border-r border-gray-300 text-center font-mono text-gray-600">{p.asersi}</td>
                      
                      {/* Status */}
                      <td className="p-0 border-r border-gray-300 bg-green-100/50">
                        <select 
                          className={`w-full h-full p-2 outline-none font-bold text-center ${!data.status ? 'bg-green-200/50' : 'bg-transparent'}`}
                          value={data.status}
                          onChange={e => handleUpdate(p.no, 'status', e.target.value)}
                        >
                          <option value=""></option>
                          <option value="DILAKUKAN">DILAKUKAN</option>
                          <option value="TIDAK DILAKUKAN">TIDAK DILAKUKAN</option>
                          <option value="TIDAK RELEVAN">TIDAK RELEVAN</option>
                        </select>
                      </td>
                      
                      {/* PIC */}
                      <td className="p-0 border-r border-gray-300 bg-orange-100/30">
                        <input 
                          type="text"
                          className="w-full h-full p-2 bg-transparent outline-none text-center"
                          value={data.pic}
                          onChange={e => handleUpdate(p.no, 'pic', e.target.value)}
                        />
                      </td>

                      {/* Referensi */}
                      <td className="p-0 border-gray-300 bg-orange-100/30">
                        <input 
                          type="text"
                          className="w-full h-full p-2 bg-transparent outline-none text-center text-blue-600 underline"
                          value={data.ref}
                          onChange={e => handleUpdate(p.no, 'ref', e.target.value)}
                          placeholder="Link KKP"
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button onClick={() => navigate(`/workspace/${engagement.id}/worksheet/ls-${indeks.toLowerCase()}`)} className="text-gray-500 hover:text-gray-800 flex items-center font-bold">
            <ArrowLeft size={14} className="mr-1" /> Kembali ke Lead Schedule {indeks.toUpperCase()}
          </button>
          
          <button 
            onClick={handleSave}
            className="flex items-center px-6 py-2.5 bg-atlas-blue text-white rounded font-bold hover:bg-blue-800 shadow transition-colors"
          >
            {isSaved ? <CheckCircle2 size={16} className="mr-2" /> : <Save size={16} className="mr-2" />}
            Simpan Bank Prosedur
          </button>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default BankProsedur;
