import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Paperclip, MessageSquare, History, FileText, CheckCircle } from 'lucide-react';
import { useEngagementStore } from '../store/engagementStore';
import { useWorksheetHeaderStore } from '../store/worksheetHeaderStore';
import WorksheetSignReviewFooter from './WorksheetSignReviewFooter';

interface WorksheetContainerProps {
  code: string;
  name: string;
  purpose: string;
  status: string;
  reviewer: string | null;
  lastUpdated: string;
  children: React.ReactNode;
  validateCompletion?: () => string[];
}

interface ReviewNote {
  id: string;
  reviewer: string;
  date: string;
  comment: string;
  status: 'Open' | 'Resolved' | 'Reopened' | 'Closed';
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: string;
}

const WorksheetContainer: React.FC<WorksheetContainerProps> = ({
  code,
  name,
  purpose,
  status,
  reviewer,
  lastUpdated,
  children,
  validateCompletion
}) => {
  const { id: engagementId } = useParams<{ id: string }>();
  const engagements = useEngagementStore((state) => state.engagements);
  const engagement = engagements.find(e => e.id === engagementId);
  const addAuditLog = useEngagementStore((state) => state.addAuditLog);
  const allAuditLogs = useEngagementStore((state) => state.auditLogs);
  const auditLogs = allAuditLogs.filter(log => log.engagementId === engagementId && log.module === code);
  
  const addAttachment = useEngagementStore((state) => state.addAttachment);
  const removeAttachment = useEngagementStore((state) => state.removeAttachment);
  const allAttachments = useEngagementStore((state) => state.attachments);
  const attachments = allAttachments.filter(a => a.engagementId === engagementId && a.worksheetId === code);

  const [saved, setSaved] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'evidence' | 'notes' | 'audit_trail'>('none');
  const [worksheetStatus, setWorksheetStatus] = useState(status);
  
  // Persist review notes per engagement and worksheet
  const notesStorageKey = `atlas_notes_v1_${engagementId || 'default'}_${code}`;
  const [notes, setNotes] = useState<ReviewNote[]>(() => {
    try {
      const saved = localStorage.getItem(notesStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(notesStorageKey, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes, notesStorageKey]);

  const setHeaderData = useWorksheetHeaderStore((state) => state.setHeaderData);
  const clearHeaderData = useWorksheetHeaderStore((state) => state.clearHeaderData);

  useEffect(() => {
    setWorksheetStatus(status);
  }, [status]);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (engagementId) {
        addAttachment({
          engagementId,
          worksheetId: code,
          fileName: file.name,
          fileType: file.type || file.name.split('.').pop() || 'unknown',
          size: file.size,
          uploadedBy: 'Auditor',
          description: `Uploaded from ${code}`,
          url: URL.createObjectURL(file)
        });
        addAuditLog({
          engagementId,
          user: 'Auditor',
          action: 'Uploaded Evidence',
          module: code,
          record: file.name,
        });
      }
    }
  };

  const handleSave = () => {
    setSaved(true);
    if (engagementId) {
      addAuditLog({
        engagementId,
        user: 'Auditor',
        action: 'Saved Draft',
        module: code,
        record: name,
      });
    }
    setTimeout(() => setSaved(false), 3000);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'Completed' && validateCompletion) {
      const missingFields = validateCompletion();
      if (missingFields && missingFields.length > 0) {
        alert(`Worksheet belum dapat diselesaikan. Silakan lengkapi field berikut:\n\n- ${missingFields.join('\n- ')}`);
        return;
      }
    }
    if (engagementId) {
      addAuditLog({
        engagementId,
        user: 'Reviewer/Auditor',
        action: 'Changed Status',
        module: code,
        record: name,
        oldValue: worksheetStatus,
        newValue: newStatus
      });
    }
    setWorksheetStatus(newStatus);
  };

  const addNote = () => {
    if (!newNoteText.trim()) return;
    setNotes([
      ...notes,
      {
        id: Date.now().toString(),
        reviewer: 'Reviewer Saat Ini',
        date: 'Sekarang',
        comment: newNoteText,
        status: 'Open'
      }
    ]);
    setNewNoteText('');
  };

  const resolveNote = (id: string, resolution: string) => {
    setNotes(notes.map(n => n.id === id ? {
      ...n,
      status: 'Resolved',
      resolution: resolution || 'Telah disesuaikan.',
      resolvedBy: 'Auditor A',
      resolvedDate: 'Sekarang'
    } : n));
  };

  const togglePanel = (panel: 'evidence' | 'notes' | 'audit_trail') => {
    if (activePanel === panel) setActivePanel('none');
    else setActivePanel(panel);
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  const handleStatusChangeRef = useRef(handleStatusChange);
  handleStatusChangeRef.current = handleStatusChange;

  const togglePanelRef = useRef(togglePanel);
  togglePanelRef.current = togglePanel;

  const validateCompletionRef = useRef(validateCompletion);
  validateCompletionRef.current = validateCompletion;

  const openNotesCount = notes.filter(n => n.status === 'Open').length;
  const clientName = engagement?.clientName;

  // Sync state & handlers to global unified top bar
  useEffect(() => {
    setHeaderData({
      code,
      name,
      purpose,
      status: worksheetStatus,
      reviewer,
      lastUpdated,
      saved,
      activePanel,
      unreadNotesCount: openNotesCount,
      clientName,
      onSave: () => handleSaveRef.current(),
      onStatusChange: (s) => handleStatusChangeRef.current(s),
      onTogglePanel: (p) => togglePanelRef.current(p),
      validateCompletion: () => validateCompletionRef.current?.() || [],
    });
  }, [
    code,
    name,
    purpose,
    worksheetStatus,
    reviewer,
    lastUpdated,
    saved,
    activePanel,
    openNotesCount,
    clientName,
    setHeaderData
  ]);

  // Clean up store on unmount
  useEffect(() => {
    return () => {
      clearHeaderData();
    };
  }, [clearHeaderData]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
      
      {/* Main Worksheet Area */}
      <div className={`flex-1 flex flex-col h-full min-w-0 ${activePanel !== 'none' ? 'md:pr-0' : ''}`}>
        
        {/* Content Area - starts immediately without duplicate top bar */}
        <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col relative min-h-0 print:overflow-visible print:bg-white print:p-0">
          <div className="p-4 sm:p-6 w-full space-y-6 flex-1 print:p-0 print:space-y-4">
            
            {/* Official Audit Print Header - Only visible during print */}
            <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900 break-inside-avoid">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">KAP FRIDOLINUS PENO</h2>
                  <p className="text-[10px] text-slate-600">Kantor Akuntan Publik • Izin Usaha KMK RI No. 345/KM.1/2020</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold bg-slate-100 border border-slate-400 px-2 py-0.5 rounded">
                    KKP: {code}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-center border-y border-slate-300 py-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight uppercase">
                  {name}
                </h1>
                <p className="text-xs text-slate-700 mt-0.5">
                  Klien: <strong>{engagement?.clientName || '-'}</strong> | Periode: {engagement?.auditPeriod || engagement?.fiscalYear || '-'} | Standar: {engagement?.accountingStandard || 'SAK UMUM'}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2 text-[10px] text-slate-800 bg-slate-50 p-2 border border-slate-300">
                <div><strong>No. Perikatan:</strong> {engagement?.id || '-'}</div>
                <div><strong>Auditor:</strong> {engagement?.auditorName || 'Auditor'}</div>
                <div><strong>Reviewer:</strong> {reviewer || engagement?.managerName || 'Manager'}</div>
                <div><strong>Status KKP:</strong> {worksheetStatus}</div>
              </div>
            </div>

            {children}

            {/* Tanda Tangan & Reviu + Catatan Reviu Footer (Universal for all worksheets) */}
            <div className="no-print">
              <WorksheetSignReviewFooter
                engagementId={engagementId}
                worksheetCode={code}
                worksheetName={name}
                defaultAuditor={engagement?.auditorName}
                defaultReviewer={reviewer || engagement?.managerName}
                notes={notes}
                onAddNote={(comment) => {
                  if (!comment.trim()) return;
                  setNotes(prev => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      reviewer: reviewer || engagement?.managerName || 'Reviewer',
                      date: new Date().toLocaleDateString('id-ID'),
                      comment: comment.trim(),
                      status: 'Open'
                    }
                  ]);
                }}
                onResolveNote={(id, resolution) => {
                  resolveNote(id, resolution);
                }}
              />
            </div>

            {/* Official Audit Print Sign-off Footer - Only visible during print */}
            <div className="hidden print:block mt-8 pt-4 border-t-2 border-slate-900 break-inside-avoid">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                <div className="border border-slate-400 p-3 rounded">
                  <p className="font-semibold text-slate-600 uppercase text-[9px] mb-8">Dibuat Oleh (Auditor)</p>
                  <p className="font-bold border-t border-slate-300 pt-1 text-slate-900">{engagement?.auditorName || 'Auditor'}</p>
                  <p className="text-[9px] text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
                <div className="border border-slate-400 p-3 rounded">
                  <p className="font-semibold text-slate-600 uppercase text-[9px] mb-8">Direview Oleh (Reviewer)</p>
                  <p className="font-bold border-t border-slate-300 pt-1 text-slate-900">{reviewer || engagement?.managerName || 'Manager'}</p>
                  <p className="text-[9px] text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
                <div className="border border-slate-400 p-3 rounded">
                  <p className="font-semibold text-slate-600 uppercase text-[9px] mb-8">Disetujui Oleh (Partner)</p>
                  <p className="font-bold border-t border-slate-300 pt-1 text-slate-900">{engagement?.partnerName || 'Partner'}</p>
                  <p className="text-[9px] text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <div className="mt-3 text-center text-[9px] text-slate-500">
                Dokumen Kertas Kerja Audit Elektronik ATLAS • Sifat: Rahasia & Hak Milik KAP • Dicetak pada {new Date().toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Worksheet Sections Standard Header (Moved to bottom) */}
          <div className="bottom-section-bar no-print w-full bg-white border-t border-gray-200 px-4 sm:px-6 py-2 flex items-center space-x-6 text-xs text-gray-500 overflow-x-auto shadow-xs sticky bottom-0 z-10 mt-auto">
            <a href="#instructions" className="hover:text-atlas-blue font-medium whitespace-nowrap">1. Instructions</a>
            <a href="#input" className="hover:text-atlas-blue font-medium whitespace-nowrap">2. Input</a>
            <a href="#calculation" className="hover:text-atlas-blue font-medium whitespace-nowrap">3. Calculation</a>
            <a href="#evidence" className="hover:text-atlas-blue font-medium whitespace-nowrap" onClick={(e) => { e.preventDefault(); togglePanel('evidence'); }}>4. Evidence</a>
            <a href="#conclusion" className="hover:text-atlas-blue font-medium whitespace-nowrap">5. Conclusion</a>
            <a href="#review" className="hover:text-atlas-blue font-medium whitespace-nowrap" onClick={(e) => { e.preventDefault(); togglePanel('notes'); }}>6. Review</a>
          </div>
        </div>
      </div>

      {/* Right Tools Sidebar (Floating or docked) */}
      <div className="no-print bg-white border-l border-gray-200 w-16 flex flex-col items-center py-4 space-y-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <button onClick={() => togglePanel('evidence')} className={`p-3 rounded-xl transition-colors ${activePanel === 'evidence' ? 'bg-blue-50 text-atlas-blue' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`} title="Evidence / Attachments">
          <Paperclip size={24} />
        </button>
        <button onClick={() => togglePanel('notes')} className={`p-3 rounded-xl transition-colors relative ${activePanel === 'notes' ? 'bg-blue-50 text-atlas-blue' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`} title="Review Notes">
          <MessageSquare size={24} />
          {notes.filter(n => n.status === 'Open').length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        <button onClick={() => togglePanel('audit_trail')} className={`p-3 rounded-xl transition-colors ${activePanel === 'audit_trail' ? 'bg-blue-50 text-atlas-blue' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`} title="Audit Trail">
          <History size={24} />
        </button>
      </div>

      {/* Expanded Panel Drawer */}
      {activePanel !== 'none' && (
        <div className="w-96 bg-white border-l border-gray-200 shadow-xl z-10 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-gray-800 flex items-center">
              {activePanel === 'evidence' && <><Paperclip size={18} className="mr-2 text-atlas-blue"/> Evidence & Attachments</>}
              {activePanel === 'notes' && <><MessageSquare size={18} className="mr-2 text-atlas-blue"/> Review Notes System</>}
              {activePanel === 'audit_trail' && <><History size={18} className="mr-2 text-atlas-blue"/> Audit Trail</>}
            </h3>
            <button onClick={() => setActivePanel('none')} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === 'evidence' && (
              <div className="space-y-4">
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                  <div className="w-10 h-10 bg-blue-100 text-atlas-blue rounded-full flex items-center justify-center mb-2">
                    <Paperclip size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Upload Evidence</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, Excel, Word, Images, CSV</p>
                </label>
                
                <div className="space-y-2">
                  <label className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center text-gray-600 cursor-pointer">
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                    <FileText size={16} className="mr-2 text-blue-500" /> Attach Document
                  </label>
                  <button className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center text-gray-600">
                    <Paperclip size={16} className="mr-2 text-purple-500" /> Add Hyperlink
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Daftar Dokumen</h4>
                  {attachments.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-2">Belum ada dokumen pendukung.</div>
                  ) : (
                    <div className="space-y-3">
                      {attachments.map(att => (
                        <div key={att.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-atlas-blue transition-colors group">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 overflow-hidden">
                              <div className="mt-1 bg-gray-100 p-1.5 rounded text-gray-500">
                                <FileText size={16} />
                              </div>
                              <div className="overflow-hidden">
                                <a href={att.url || '#'} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-800 hover:text-atlas-blue hover:underline truncate block" title={att.fileName}>
                                  {att.fileName}
                                </a>
                                <div className="text-[10px] text-gray-500 flex items-center space-x-2 mt-1">
                                  <span className="uppercase">{att.fileType.split('/').pop()}</span>
                                  <span>•</span>
                                  <span>{(att.size / 1024).toFixed(1)} KB</span>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1">
                                  Diunggah oleh {att.uploadedBy} pada {new Date(att.uploadedDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeAttachment(att.id)}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Hapus Dokumen"
                            >
                              <span className="text-lg leading-none">&times;</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePanel === 'notes' && (
              <div className="space-y-4 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-4">
                  {notes.map(note => (
                    <div key={note.id} className={`border rounded-xl p-3 ${note.status === 'Open' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-gray-800">{note.reviewer}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500">{note.date}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${note.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {note.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{note.comment}</p>
                      
                      {note.status === 'Open' ? (
                        <div className="mt-2 pt-2 border-t border-blue-100">
                          <input 
                            type="text" 
                            placeholder="Ketik resolusi..." 
                            className="w-full text-xs p-1.5 border border-gray-200 rounded mb-2 outline-none focus:border-atlas-blue"
                            id={`res-${note.id}`}
                          />
                          <button 
                            onClick={() => resolveNote(note.id, (document.getElementById(`res-${note.id}`) as HTMLInputElement)?.value)}
                            className="text-xs font-bold text-atlas-blue hover:underline flex items-center"
                          >
                            <CheckCircle size={12} className="mr-1" /> Mark as Resolved
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                          <div className="text-gray-500 mb-1"><strong>Resolved by {note.resolvedBy}</strong> ({note.resolvedDate})</div>
                          <div className="text-gray-700 italic">"{note.resolution}"</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-2">
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-atlas-blue focus:ring-atlas-blue resize-none" 
                    rows={3} 
                    placeholder="Tambahkan issue atau pertanyaan (Request Revision)..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                  />
                  <button onClick={addNote} className="w-full bg-atlas-blue text-white rounded-lg py-2 mt-2 font-medium text-sm hover:bg-blue-800 transition-colors">
                    Post Review Note
                  </button>
                </div>
              </div>
            )}

            {activePanel === 'audit_trail' && (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {auditLogs.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4 relative z-10">Belum ada aktivitas tercatat.</div>
                )}
                {auditLogs.map((log, index) => (
                  <div key={log.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${index === 0 ? 'is-active' : ''}`}>
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-300 bg-white text-slate-500 group-[.is-active]:border-atlas-blue group-[.is-active]:bg-atlas-blue group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900 text-xs">{log.user}</div>
                        <time className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </time>
                      </div>
                      <div className="text-xs text-slate-700 font-medium">{log.action}</div>
                      {(log.oldValue || log.newValue) && (
                        <div className="text-[10px] text-slate-500 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                          {log.oldValue && <span className="line-through mr-1 text-red-400">{log.oldValue}</span>}
                          {log.newValue && <span className="text-green-600 font-medium">→ {log.newValue}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default WorksheetContainer;
