import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import WorksheetContainer from '../../../components/WorksheetContainer';
import { FileSpreadsheet, ArrowRight, Table2, Info } from 'lucide-react';

const D100: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const [worksheetStatus, setWorksheetStatus] = useState<'In Progress' | 'Completed' | 'Pending Review'>('In Progress');

  // Form State
  const [periodeInterim, setPeriodeInterim] = useState('');
  const [periodeBerjalan, setPeriodeBerjalan] = useState(new Date().getFullYear().toString());
  const [periodePerbandingan, setPeriodePerbandingan] = useState((new Date().getFullYear() - 1).toString());
  const [inputType, setInputType] = useState<'posisi_awal' | 'template_kosong'>('template_kosong');
  const [mataUang, setMataUang] = useState('IDR');
  const [pembulatan, setPembulatan] = useState('Satuan Penuh');
  
  // UI State
  const [showGrid, setShowGrid] = useState(false);
  const [headerValidation, setHeaderValidation] = useState<'valid' | 'invalid'>('valid');

  // Table Data dynamically initialized from engagement trial balance or empty
  const [tableData, setTableData] = useState(() => {
    if (engagement.trialBalance && engagement.trialBalance.length > 0) {
      return engagement.trialBalance.map(acc => ({
        no: (acc as any).code || (acc as any).accountCode || '',
        nama: (acc as any).name || (acc as any).accountName || '',
        group: acc.group || '',
        kelompok: (acc as any).subGroup || (acc as any).kelompok || '',
        header: (acc as any).header || (acc as any).name || (acc as any).accountName || '',
        input: 'Ya',
        defaultAkun: (acc as any).endingBalance < 0 ? 'K' : 'D',
        interim_input: 0,
        interim_lk: 0,
        berjalan_input: Math.abs((acc as any).endingBalance || 0),
        berjalan_lk: Math.abs((acc as any).endingBalance || 0),
        banding_input: 0,
        banding_lk: 0,
      }));
    }
    return [];
  });

  const handleAddNewRow = () => {
    setTableData(prev => [
      ...prev,
      {
        no: '',
        nama: '',
        group: '',
        kelompok: '',
        header: '',
        input: 'Ya',
        defaultAkun: 'D',
        interim_input: 0,
        interim_lk: 0,
        berjalan_input: 0,
        berjalan_lk: 0,
        banding_input: 0,
        banding_lk: 0,
      }
    ]);
  };

  const handleValidate = () => {
    if (!periodeBerjalan || !periodePerbandingan) {
      alert("Periode Berjalan dan Periode Perbandingan harus diisi.");
      return false;
    }
    return true;
  };

  return (
    <WorksheetContainer
      worksheetCode="D.100"
      worksheetName="Input Data Laporan Keuangan"
      status={worksheetStatus}
      onStatusChange={setWorksheetStatus}
      validateCompletion={handleValidate}
    >
      <div className="space-y-8">
        {/* Top Section: Form Configuration (Matches the cyan box in the original ATLAS) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-atlas-blue text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold tracking-wider">INPUT DATA LAPORAN KEUANGAN</h2>
            <div className="flex gap-4 items-center">
              <select value={mataUang} onChange={e => setMataUang(e.target.value)} className="bg-white text-gray-800 text-sm px-3 py-1 rounded font-bold outline-none">
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
              <select value={pembulatan} onChange={e => setPembulatan(e.target.value)} className="bg-white text-gray-800 text-sm px-3 py-1 rounded font-bold outline-none">
                <option value="Satuan Penuh">Satuan Penuh</option>
                <option value="Dalam Ribuan">Dalam Ribuan</option>
                <option value="Dalam Jutaan">Dalam Jutaan</option>
              </select>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              
              {/* Otomatis */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Klien <span className="text-xs font-normal text-gray-400 ml-1">(Otomatis)</span></label>
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 font-medium">
                    {engagement.clientName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Standar Akuntansi yang digunakan <span className="text-xs font-normal text-gray-400 ml-1">(Otomatis)</span></label>
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 font-medium">
                    {engagement.accountingStandard}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Usaha <span className="text-xs font-normal text-gray-400 ml-1">(Otomatis)</span></label>
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 font-medium">
                    Perdagangan & Jasa
                  </div>
                </div>
              </div>

              {/* Isi Manual */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Periode Interim Berjalan <span className="text-red-500">*</span></label>
                  <input type="text" value={periodeInterim} onChange={e => setPeriodeInterim(e.target.value)} placeholder="Opsional (contoh: 30 Juni 2023)" className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Periode Berjalan <span className="text-red-500">*</span></label>
                  <input type="text" value={periodeBerjalan} onChange={e => setPeriodeBerjalan(e.target.value)} placeholder="contoh: 31 Desember 2023" className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Periode Perbandingan <span className="text-red-500">*</span></label>
                  <input type="text" value={periodePerbandingan} onChange={e => setPeriodePerbandingan(e.target.value)} placeholder="contoh: 31 Desember 2022" className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none" />
                </div>
              </div>

              {/* Pilihan Template */}
              <div className="lg:col-span-2 pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3">Input Data Laporan Keuangan <span className="text-xs font-normal text-gray-400 ml-1">(Pilihan)</span></label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex-1 flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${inputType === 'posisi_awal' ? 'bg-blue-50 border-atlas-blue ring-1 ring-atlas-blue' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="input_type" value="posisi_awal" checked={inputType === 'posisi_awal'} onChange={() => setInputType('posisi_awal')} className="w-4 h-4 text-atlas-blue mr-3" />
                    <div>
                      <span className="block font-bold text-gray-800">Posisi Awal</span>
                      <span className="text-sm text-gray-500">Mulai dengan daftar akun standar bawaan ATLAS</span>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${inputType === 'template_kosong' ? 'bg-blue-50 border-atlas-blue ring-1 ring-atlas-blue' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="input_type" value="template_kosong" checked={inputType === 'template_kosong'} onChange={() => setInputType('template_kosong')} className="w-4 h-4 text-atlas-blue mr-3" />
                    <div>
                      <span className="block font-bold text-gray-800">Template Kosong</span>
                      <span className="text-sm text-gray-500">Mulai dengan template kosong untuk memetakan akun klien</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* The Red Button equivalent */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center text-white shrink-0 shadow-sm shadow-red-200">
                  <Table2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Buka Worksheet Keuangan</h3>
                  <p className="text-sm text-gray-500">Klik tombol di samping untuk mulai mengisi / memetakan data keuangan.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGrid(true)}
                className="bg-atlas-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Mulai Pengisian Data <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: The Grid (Appears after clicking the button) */}
        {showGrid && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 mt-8">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-green-600" />
                Kertas Kerja: {inputType === 'template_kosong' ? 'Template Kosong' : 'Posisi Awal'}
              </h3>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleAddNewRow}
                  className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  + Tambah Baris Akun
                </button>
                <button className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded shadow-sm hover:bg-red-700 transition-colors">
                  Klik tambah header
                </button>
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-bold uppercase mb-1 ${headerValidation === 'valid' ? 'text-red-500' : 'text-red-600 animate-pulse'}`}>
                    {headerValidation === 'valid' ? 'TIDAK ADA HEADER GANDA' : 'HEADER AKUN GANDA'}
                  </span>
                  <button className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Cek Header Ganda
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[700px]">
              <table className="w-full text-sm text-left border-collapse min-w-[1400px]">
                {/* ... existing table code ... */}
                <thead className="text-xs text-gray-700 bg-gray-100 uppercase sticky top-0 z-10 shadow-sm">
                  {/* Control Rows (EBT, Neraca) */}
                  <tr className="bg-yellow-100/50">
                    <th colSpan={7} className="border border-gray-200 px-4 py-1.5 text-right font-bold text-red-600">INPUT EBT KLIEN</th>
                    <th colSpan={2} className="border border-gray-200 px-4 py-1.5 bg-yellow-200 text-right"></th>
                    <th colSpan={2} className="border border-gray-200 px-4 py-1.5 bg-yellow-200 text-right"></th>
                    <th colSpan={2} className="border border-gray-200 px-4 py-1.5 bg-yellow-200 text-right"></th>
                  </tr>
                  <tr>
                    <th colSpan={7} className="border border-gray-200 px-4 py-1.5 text-center font-bold text-red-600">CEK EBT</th>
                    <th colSpan={2} className="border border-gray-200 px-4 py-1.5 text-center font-bold text-red-600">CEK KEMBALI INPUT DATA</th>
                    <th colSpan={2} className="border border-gray-200 px-4 py-1.5 text-center font-bold text-red-600">CEK KEMBALI INPUT DATA</th>
                    <th colSpan={2} className="border border-gray-200 px-4 py-1.5 text-center font-bold text-red-600">CEK KEMBALI INPUT DATA</th>
                  </tr>
                  <tr>
                    <th colSpan={7} className="border border-gray-200 px-4 py-1.5 text-center font-bold text-red-600">CEK NERACA</th>
                    <th colSpan={2} className="border border-gray-200 px-4 py-1.5 text-center font-bold text-gray-800">BALANCE</th>
                    <th colSpan={2} className="border border-gray-200 px-4 py-1.5 text-center font-bold text-gray-800">BALANCE</th>
                    <th colSpan={2} className="border border-gray-200 px-4 py-1.5 text-center font-bold text-gray-800">BALANCE</th>
                  </tr>
                  
                  {/* Main Header Rows */}
                  <tr>
                    <th rowSpan={2} className="border border-gray-200 px-3 py-2 bg-gray-100 min-w-[80px] text-blue-600">No Akun</th>
                    <th rowSpan={2} className="border border-gray-200 px-3 py-2 bg-gray-100 min-w-[200px] text-blue-600">Nama Akun</th>
                    <th rowSpan={2} className="border border-gray-200 px-3 py-2 bg-gray-100 min-w-[150px] text-blue-600">Mapping Group Akun</th>
                    <th rowSpan={2} className="border border-gray-200 px-3 py-2 bg-gray-100 min-w-[200px] text-blue-600">Mapping Kelompok Akun</th>
                    <th rowSpan={2} className="border border-gray-200 px-3 py-2 bg-gray-100 min-w-[200px] text-blue-600">Mapping Header Akun</th>
                    <th rowSpan={2} className="border border-gray-200 px-3 py-2 bg-gray-100 text-center w-12 text-red-600">Input</th>
                    <th rowSpan={2} className="border border-gray-200 px-3 py-2 bg-gray-100 text-center w-16 text-red-600 italic leading-tight">Default<br/>Akun</th>
                    <th colSpan={2} className="border border-gray-200 px-3 py-1 bg-white text-center text-red-500 font-normal lowercase">{periodeInterim || '-'}</th>
                    <th colSpan={2} className="border border-gray-200 px-3 py-1 bg-white text-center text-red-500 font-normal lowercase">{periodeBerjalan || `31 Desember ${engagement.period || new Date().getFullYear()}`}</th>
                    <th colSpan={2} className="border border-gray-200 px-3 py-1 bg-white text-center text-red-500 font-normal lowercase">{periodePerbandingan || `31 Desember ${Number(engagement.period || new Date().getFullYear()) - 1}`}</th>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 px-2 py-1 bg-gray-100 text-center w-28 text-red-500 italic">Input Angka</th>
                    <th className="border border-gray-200 px-2 py-1 bg-gray-100 text-center w-28 text-red-500 italic">Angka LK</th>
                    <th className="border border-gray-200 px-2 py-1 bg-gray-100 text-center w-28 text-red-500 italic">Input Angka</th>
                    <th className="border border-gray-200 px-2 py-1 bg-gray-100 text-center w-28 text-red-500 italic">Angka LK</th>
                    <th className="border border-gray-200 px-2 py-1 bg-gray-100 text-center w-28 text-red-500 italic">Input Angka</th>
                    <th className="border border-gray-200 px-2 py-1 bg-gray-100 text-center w-28 text-red-500 italic">Angka LK</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="bg-yellow-100/30 hover:bg-yellow-100/80 border-b border-gray-200 group text-xs">
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent" value={row.no} onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].no = e.target.value;
                        setTableData(newData);
                      }} /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent" value={row.nama} onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].nama = e.target.value;
                        setTableData(newData);
                      }} /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent bg-green-200/50" value={row.group} onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].group = e.target.value;
                        setTableData(newData);
                      }} /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent bg-green-200/50" value={row.kelompok} onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].kelompok = e.target.value;
                        setTableData(newData);
                      }} /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent bg-green-200/50" value={row.header} onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].header = e.target.value;
                        setTableData(newData);
                      }} /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-center bg-green-200/50" value={row.input} onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].input = e.target.value;
                        setTableData(newData);
                        // Trigger simple validation
                        const headers = newData.filter(r => r.input.toLowerCase() === 'ya').map(r => r.header);
                        const hasDuplicates = new Set(headers).size !== headers.length;
                        setHeaderValidation(hasDuplicates ? 'invalid' : 'valid');
                      }} /></td>
                      <td className="border border-gray-200 p-0">
                        <select className="w-full h-full px-1 py-1.5 outline-none bg-green-200/50 text-center cursor-pointer text-xs" value={row.defaultAkun} onChange={(e) => {
                          const newData = [...tableData];
                          newData[idx].defaultAkun = e.target.value;
                          setTableData(newData);
                        }}>
                          <option value="D">D</option>
                          <option value="K">K</option>
                        </select>
                      </td>
                      <td className="border border-gray-200 p-0"><input type="number" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600 bg-yellow-100/50" value={row.interim_input} onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].interim_input = Number(e.target.value);
                        newData[idx].interim_lk = Number(e.target.value); // Simple binding for demo
                        setTableData(newData);
                      }} /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600" value={row.interim_lk.toLocaleString('id-ID')} readOnly /></td>
                      <td className="border border-gray-200 p-0"><input type="number" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600 bg-yellow-100/50" value={row.berjalan_input} onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].berjalan_input = Number(e.target.value);
                        newData[idx].berjalan_lk = Number(e.target.value);
                        setTableData(newData);
                      }} /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600" value={row.berjalan_lk.toLocaleString('id-ID')} readOnly /></td>
                      <td className="border border-gray-200 p-0"><input type="number" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600 bg-yellow-100/50" value={row.banding_input} onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].banding_input = Number(e.target.value);
                        newData[idx].banding_lk = Number(e.target.value);
                        setTableData(newData);
                      }} /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600" value={row.banding_lk.toLocaleString('id-ID')} readOnly /></td>
                    </tr>
                  ))}
                  {/* Empty rows to simulate Excel feel */}
                  {[...Array(15)].map((_, idx) => (
                    <tr key={`empty-${idx}`} className="bg-yellow-100/30 hover:bg-yellow-100/80 border-b border-gray-200 text-xs">
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent" /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent" /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent bg-green-200/50" /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent bg-green-200/50" /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent bg-green-200/50" /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-center bg-green-200/50" /></td>
                      <td className="border border-gray-200 p-0"><select className="w-full h-full px-1 py-1.5 outline-none bg-green-200/50 text-center cursor-pointer text-xs"><option value="D">D</option><option value="K">K</option></select></td>
                      <td className="border border-gray-200 p-0"><input type="number" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600 bg-yellow-100/50" /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600" readOnly /></td>
                      <td className="border border-gray-200 p-0"><input type="number" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600 bg-yellow-100/50" /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600" readOnly /></td>
                      <td className="border border-gray-200 p-0"><input type="number" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600 bg-yellow-100/50" /></td>
                      <td className="border border-gray-200 p-0"><input type="text" className="w-full h-full px-2 py-1.5 outline-none bg-transparent text-right font-mono text-red-600" readOnly /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Summary Section (Rekap per periode, DATA UNTUK EBITDA, DATA UNTUK EBIT) */}
            <div className="border-t border-gray-300 p-6 bg-white overflow-x-auto">
              <div className="flex gap-8 min-w-[1000px]">
                
                {/* Left: 3 Stacked Blocks (Rekap per periode) */}
                <div className="w-1/3 flex flex-col">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="w-1/2 p-2"></th>
                        <th className="border border-gray-300 px-2 py-2 text-center text-red-500 italic font-bold">Ekstrapolasi</th>
                        <th className="border border-gray-300 px-2 py-2 text-center text-red-500 italic font-bold">As it is</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Block 1 (Interim) */}
                      {['ASET', 'EKUITAS_ASET_BERSIH', 'PENDAPATAN', 'HPP', 'LABA SBLM PAJAK', 'EBITDA', 'LIABILITAS', 'EBIT'].map((akun, i) => (
                        <tr key={`b1-${i}`}>
                          <td className="font-bold text-gray-700 px-2 py-1">{akun}</td>
                          <td className="border border-red-200 px-2 py-1 text-right text-gray-500 font-mono">-</td>
                          <td className="border border-red-200 px-2 py-1 text-right text-gray-500 font-mono">-</td>
                        </tr>
                      ))}
                      <tr><td colSpan={3} className="h-4"></td></tr>
                      
                      {/* Block 2 (Berjalan) */}
                      {['ASET', 'EKUITAS_ASET_BERSIH', 'PENDAPATAN', 'HPP', 'LABA SBLM PAJAK', 'EBITDA', 'LIABILITAS', 'EBIT'].map((akun, i) => (
                        <tr key={`b2-${i}`}>
                          <td className="font-bold text-gray-700 px-2 py-1">{akun}</td>
                          <td className="border border-red-200 px-2 py-1 text-right text-gray-500 font-mono"></td>
                          <td className="border border-red-200 px-2 py-1 text-right text-gray-500 font-mono">-</td>
                        </tr>
                      ))}
                      <tr><td colSpan={3} className="h-4"></td></tr>
                      
                      {/* Block 3 (Perbandingan) */}
                      {['ASET', 'EKUITAS_ASET_BERSIH', 'PENDAPATAN', 'HPP', 'LABA SBLM PAJAK', 'EBITDA', 'LIABILITAS', 'EBIT'].map((akun, i) => (
                        <tr key={`b3-${i}`}>
                          <td className="font-bold text-gray-700 px-2 py-1">{akun}</td>
                          <td className="border border-red-200 px-2 py-1 text-right text-gray-500 font-mono"></td>
                          <td className="border border-red-200 px-2 py-1 text-right text-gray-500 font-mono">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right: DATA UNTUK EBITDA and EBIT */}
                <div className="w-2/3 flex flex-col gap-6">
                  {/* DATA UNTUK EBITDA */}
                  <div>
                    <div className="text-center text-blue-800 font-bold italic mb-2 text-sm uppercase">DATA UNTUK EBITDA</div>
                    <table className="w-full text-xs border-collapse text-center">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold min-w-[250px]">Akun</th>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold">Periode Ekstrapolasi</th>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold">Periode As it is</th>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold">Periode</th>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold">Periode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4].map((_, i) => (
                          <tr key={`ebitda-${i}`}>
                            <td className="border border-gray-300 p-0">
                              <select className="w-full h-full px-2 py-1.5 outline-none bg-green-200/50 text-red-500 text-xs cursor-pointer">
                                <option value="">{i === 0 ? 'Pilihlah beban penyusutan dan amortisasi, pendapatan bunga dan beban bunga' : ''}</option>
                                <option value="penyusutan">Beban Penyusutan</option>
                                <option value="amortisasi">Beban Amortisasi</option>
                                <option value="bunga_pendapatan">Pendapatan Bunga</option>
                                <option value="bunga_beban">Beban Bunga</option>
                              </select>
                            </td>
                            <td className="border border-gray-300 px-2 py-1.5 text-gray-500 font-mono">-</td>
                            <td className="border border-gray-300 px-2 py-1.5 text-gray-500 font-mono">-</td>
                            <td className="border border-gray-300 px-2 py-1.5 text-gray-500 font-mono">-</td>
                            <td className="border border-gray-300 px-2 py-1.5 text-gray-500 font-mono">-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* DATA UNTUK EBIT */}
                  <div>
                    <div className="text-center text-blue-800 font-bold italic mb-2 text-sm uppercase">DATA UNTUK EBIT</div>
                    <table className="w-full text-xs border-collapse text-center">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold min-w-[250px]">Akun</th>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold">Periode Ekstrapolasi</th>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold">Periode As it is</th>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold">Periode</th>
                          <th className="border border-gray-300 px-2 py-2 text-blue-700 italic font-bold">Periode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4].map((_, i) => (
                          <tr key={`ebit-${i}`}>
                            <td className="border border-gray-300 p-0">
                              <select className="w-full h-full px-2 py-1.5 outline-none bg-green-200/50 text-red-500 text-xs cursor-pointer">
                                <option value="">{i === 0 ? 'Pilihlah pendapatan bunga dan beban bunga' : ''}</option>
                                <option value="bunga_pendapatan">Pendapatan Bunga</option>
                                <option value="bunga_beban">Beban Bunga</option>
                              </select>
                            </td>
                            <td className="border border-gray-300 px-2 py-1.5 text-gray-500 font-mono">-</td>
                            <td className="border border-gray-300 px-2 py-1.5 text-gray-500 font-mono">-</td>
                            <td className="border border-gray-300 px-2 py-1.5 text-gray-500 font-mono">-</td>
                            <td className="border border-gray-300 px-2 py-1.5 text-gray-500 font-mono">-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorksheetContainer>
  );
};

export default D100;
