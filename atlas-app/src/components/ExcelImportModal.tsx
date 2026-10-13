import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (data: any[]) => void;
  title?: string;
}

type Step = 'upload' | 'preview' | 'map' | 'validate' | 'confirm';

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose, onImportComplete, title = "Import Data Excel" }) => {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStep('preview');
    }
  };

  const handleMap = () => setStep('map');
  
  const handleValidate = () => {
    setStep('validate');
    // Simulate validation process
    setTimeout(() => {
      // Mock error simulation
      if (Math.random() > 0.7) {
        setErrors([
          { row: 2, field: 'Kode Akun', message: 'Format kode akun tidak valid (harus numerik).' },
          { row: 5, field: 'Saldo', message: 'Saldo tidak boleh kosong.' }
        ]);
      } else {
        setErrors([]);
      }
    }, 1500);
  };

  const handleImport = () => {
    setStep('confirm');
    // Simulate import processing
    setTimeout(() => {
      onImportComplete([{ id: 1, name: 'Imported Data' }]);
    }, 1000);
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setErrors([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FileSpreadsheet className="mr-2 text-green-600" />
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Stepper */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className={`flex items-center ${step === 'upload' ? 'text-atlas-blue' : (step !== 'upload' ? 'text-green-500' : '')}`}>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 bg-white">1</div> Upload
            </div>
            <div className="w-12 h-px bg-gray-200"></div>
            <div className={`flex items-center ${step === 'preview' ? 'text-atlas-blue' : (['map','validate','confirm'].includes(step) ? 'text-green-500' : '')}`}>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 bg-white">2</div> Preview
            </div>
            <div className="w-12 h-px bg-gray-200"></div>
            <div className={`flex items-center ${step === 'map' ? 'text-atlas-blue' : (['validate','confirm'].includes(step) ? 'text-green-500' : '')}`}>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 bg-white">3</div> Map
            </div>
            <div className="w-12 h-px bg-gray-200"></div>
            <div className={`flex items-center ${step === 'validate' ? 'text-atlas-blue' : (step === 'confirm' ? 'text-green-500' : '')}`}>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 bg-white">4</div> Validate
            </div>
            <div className="w-12 h-px bg-gray-200"></div>
            <div className={`flex items-center ${step === 'confirm' ? 'text-atlas-blue' : ''}`}>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 bg-white">5</div> Finish
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 min-h-[300px]">
          {step === 'upload' && (
            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-xl bg-white p-12">
              <Upload size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">Upload File Excel (.xlsx, .csv)</h3>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">Tarik dan letakkan file Excel Anda di sini, atau klik tombol di bawah untuk memilih file.</p>
              <label className="px-6 py-2 bg-atlas-blue text-white rounded-lg font-medium hover:bg-blue-800 cursor-pointer shadow-sm">
                Pilih File Excel
                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {step === 'preview' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6 p-3 bg-blue-50 rounded-lg">
                <FileSpreadsheet className="text-atlas-blue" size={24} />
                <div>
                  <div className="font-bold text-gray-800">{file?.name}</div>
                  <div className="text-xs text-gray-500">{(file?.size || 0) / 1024} KB</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-700 mb-4">Preview Data (5 Baris Pertama)</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 font-bold border-b">A</th>
                      <th className="px-4 py-2 font-bold border-b">B</th>
                      <th className="px-4 py-2 font-bold border-b">C</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="px-4 py-2 border-b">1001</td><td className="px-4 py-2 border-b">Kas di Bank</td><td className="px-4 py-2 border-b">50000000</td></tr>
                    <tr><td className="px-4 py-2 border-b">1002</td><td className="px-4 py-2 border-b">Petty Cash</td><td className="px-4 py-2 border-b">2000000</td></tr>
                    <tr><td className="px-4 py-2 border-b">1101</td><td className="px-4 py-2 border-b">Piutang Usaha</td><td className="px-4 py-2 border-b">120000000</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'map' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-700 mb-4">Pemetakan Kolom (Column Mapping)</h4>
              <p className="text-sm text-gray-500 mb-6">Petakan kolom dari file Excel Anda ke kolom sistem ATLAS.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="font-medium text-sm">Kolom ATLAS: <span className="font-bold text-atlas-blue">Kode Akun</span></div>
                  <select className="p-2 border border-gray-300 rounded focus:ring-atlas-blue text-sm">
                    <option>Pilih Kolom Excel...</option>
                    <option selected>Kolom A</option>
                    <option>Kolom B</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="font-medium text-sm">Kolom ATLAS: <span className="font-bold text-atlas-blue">Nama Akun</span></div>
                  <select className="p-2 border border-gray-300 rounded focus:ring-atlas-blue text-sm">
                    <option>Pilih Kolom Excel...</option>
                    <option>Kolom A</option>
                    <option selected>Kolom B</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="font-medium text-sm">Kolom ATLAS: <span className="font-bold text-atlas-blue">Saldo Akhir</span></div>
                  <select className="p-2 border border-gray-300 rounded focus:ring-atlas-blue text-sm">
                    <option>Pilih Kolom Excel...</option>
                    <option>Kolom A</option>
                    <option selected>Kolom C</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 'validate' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
              {errors.length === 0 && <div className="text-center w-full my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-atlas-blue mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Memvalidasi 345 baris data...</p>
              </div>}
              
              {errors.length > 0 && (
                <div className="w-full">
                  <div className="flex items-center space-x-2 text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
                    <AlertTriangle size={24} />
                    <h4 className="font-bold">Validasi Gagal: Ditemukan {errors.length} Kesalahan</h4>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {errors.map((err, i) => (
                      <div key={i} className="p-3 border border-red-200 bg-white rounded-lg flex items-start space-x-3 text-sm">
                        <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-xs mt-0.5">Baris {err.row}</span>
                        <div>
                          <div className="font-bold text-gray-700">Kolom: {err.field}</div>
                          <div className="text-red-600">{err.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <button onClick={reset} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">
                      Upload Ulang File yang Diperbaiki
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Import Berhasil!</h3>
              <p className="text-gray-500 max-w-md">Data dari file Excel telah berhasil divalidasi dan diimpor ke dalam sistem ATLAS.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-800 font-medium">
            {step === 'confirm' ? 'Tutup' : 'Batal'}
          </button>
          
          <div className="space-x-3">
            {step === 'preview' && (
              <button onClick={handleMap} className="px-4 py-2 bg-atlas-blue text-white rounded-lg font-bold hover:bg-blue-800 flex items-center">
                Lanjut Mapping <ArrowRight size={16} className="ml-2" />
              </button>
            )}
            {step === 'map' && (
              <button onClick={handleValidate} className="px-4 py-2 bg-atlas-blue text-white rounded-lg font-bold hover:bg-blue-800 flex items-center">
                Validasi Data <ArrowRight size={16} className="ml-2" />
              </button>
            )}
            {step === 'validate' && errors.length === 0 && (
              <button onClick={handleImport} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center">
                Eksekusi Import <CheckCircle size={16} className="ml-2" />
              </button>
            )}
            {step === 'confirm' && (
              <button onClick={() => { onClose(); reset(); }} className="px-6 py-2 bg-atlas-blue text-white rounded-lg font-bold hover:bg-blue-800">
                Selesai
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExcelImportModal;
