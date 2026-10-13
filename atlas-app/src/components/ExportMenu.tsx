import React, { useState, useEffect, useRef } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown, Archive, ChevronDown, CheckCircle } from 'lucide-react';

interface ExportMenuProps {
  worksheetCode?: string;
  clientName?: string;
  isGlobal?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ worksheetCode, clientName = "Klien", isGlobal = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (type: string, label: string) => {
    setIsExporting(type);
    
    // Simulate export generation process
    setTimeout(() => {
      setIsExporting(null);
      setIsOpen(false);
      alert(`Berhasil mengekspor: ${label}\n\nFile telah diunduh ke folder Downloads Anda.`);
    }, 2000);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center transition-colors text-sm shadow-sm"
      >
        <Download size={16} className="mr-1.5" />
        Export
        <ChevronDown size={14} className="ml-1.5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50">
          
          <div className="px-4 py-3 bg-slate-50 rounded-t-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format Dokumen</p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => handleExport('excel', `ATLAS_Format_${worksheetCode || 'Global'}.xlsx`)}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors"
            >
              {isExporting === 'excel' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-atlas-blue mr-3"></div>
              ) : (
                <FileSpreadsheet className="mr-3 text-green-600 group-hover:text-atlas-blue" size={18} />
              )}
              Export Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExport('pdf', `${worksheetCode || 'Report'}_Signed.pdf`)}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors"
            >
              {isExporting === 'pdf' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-atlas-blue mr-3"></div>
              ) : (
                <FileText className="mr-3 text-red-500 group-hover:text-atlas-blue" size={18} />
              )}
              Export PDF (.pdf)
            </button>
          </div>

          <div className="px-4 py-3 bg-slate-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paket Audit (Bundling)</p>
          </div>

          <div className="py-1">
            {worksheetCode && (
              <button
                onClick={() => handleExport('wp', `WorkingPaper_${worksheetCode}.zip`)}
                className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors"
              >
                <FileDown className="mr-3 text-amber-500 group-hover:text-atlas-blue" size={18} />
                Export Working Paper
              </button>
            )}
            
            {(isGlobal || !worksheetCode) && (
              <>
                <button
                  onClick={() => handleExport('summary', `Engagement_Summary_${clientName}.pdf`)}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors"
                >
                  <FileText className="mr-3 text-blue-500 group-hover:text-atlas-blue" size={18} />
                  Engagement Summary
                </button>
                <button
                  onClick={() => handleExport('full', `Audit_Documentation_Full.zip`)}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-atlas-blue transition-colors"
                >
                  <Archive className="mr-3 text-purple-500 group-hover:text-atlas-blue" size={18} />
                  Full Audit Documentation
                </button>
              </>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
