import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Briefcase, AlertTriangle, CheckSquare, Paperclip, MessageSquare, Calculator } from 'lucide-react';
import { useEngagementStore } from '../store/engagementStore';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'client' | 'worksheet' | 'account' | 'risk' | 'procedure' | 'evidence' | 'note';
  link: string;
}

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const engagements = useEngagementStore(state => state.engagements);
  const attachments = useEngagementStore(state => state.attachments);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    // Search engagements / clients
    engagements.forEach(eng => {
      if (eng.clientName.toLowerCase().includes(q) || eng.id.toLowerCase().includes(q)) {
        found.push({
          id: eng.id,
          title: eng.clientName,
          subtitle: `Engagement ${eng.id} | ${eng.auditPeriod}`,
          type: 'client',
          link: `/workspace/${eng.id}`
        });
      }

      // Search accounts (Trial Balance)
      if (eng.trialBalance) {
        eng.trialBalance.forEach(acc => {
          if (acc.name.toLowerCase().includes(q) || acc.code.toLowerCase().includes(q)) {
            found.push({
              id: `${eng.id}-acc-${acc.id}`,
              title: `${acc.code} - ${acc.name}`,
              subtitle: `Account in ${eng.clientName}`,
              type: 'account',
              link: `/workspace/${eng.id}/trial-balance`
            });
          }
        });
      }

      // Search risks
      if (eng.risks) {
        eng.risks.forEach(r => {
          if (r.id.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)) {
            found.push({
              id: `${eng.id}-risk-${r.id}`,
              title: `${r.id} - ${r.description}`,
              subtitle: `Risk in ${eng.clientName}`,
              type: 'risk',
              link: `/workspace/${eng.id}/risk-assessment`
            });
          }
        });
      }

      // Search procedures
      if (eng.procedures) {
        eng.procedures.forEach(p => {
          if (p.id.toLowerCase().includes(q) || p.procedure.toLowerCase().includes(q) || p.auditObjective.toLowerCase().includes(q)) {
            found.push({
              id: `${eng.id}-proc-${p.id}`,
              title: `${p.id} - ${p.auditObjective}`,
              subtitle: `Prosedur Audit · ${eng.clientName}`,
              type: 'procedure',
              link: `/workspace/${eng.id}/worksheet/b210`
            });
          }
        });
      }
    });

    // Search attachments
    attachments.forEach(att => {
      if (att.fileName.toLowerCase().includes(q) || att.description.toLowerCase().includes(q)) {
        found.push({
          id: att.id,
          title: att.fileName,
          subtitle: `Evidence in Worksheet ${att.worksheetId}`,
          type: 'evidence',
          link: `/workspace/${att.engagementId}/worksheet/${att.worksheetId.replace('.', '').toLowerCase()}`
        });
      }
    });

    // Mock search for Worksheets since they are static structure currently
    const staticWorksheets = [
      { code: 'A.110', name: 'Analisis Penerimaan Klien' },
      { code: 'A.120', name: 'Alokasi Jam Jasa' },
      { code: 'A.210', name: 'Pemahaman Bisnis Klien' },
      { code: 'A.220', name: 'Analisis Prosedur Analitis' },
      { code: 'A.240', name: 'Inherent Risk Assessment' },
      { code: 'B.140', name: 'Uji Pengendalian (TOC)' },
      { code: 'B.210', name: 'Substantive Test - Kas' },
      { code: 'C.530', name: 'Draft Laporan Auditor' }
    ];

    staticWorksheets.forEach(ws => {
      if (ws.code.toLowerCase().includes(q) || ws.name.toLowerCase().includes(q)) {
        const engId = engagements[0]?.id;
        found.push({
          id: `ws-${ws.code}`,
          title: `${ws.code} - ${ws.name}`,
          subtitle: `Worksheet Module`,
          type: 'worksheet',
          link: engId ? `/workspace/${engId}/worksheet/${ws.code.replace(/\./g, '').toLowerCase()}` : '/engagements'
        });
      }
    });

    setResults(found.slice(0, 8)); // Limit to 8 results
  }, [query, engagements, attachments]);

  const handleSelect = (link: string) => {
    navigate(link);
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'client': return <Briefcase size={16} className="text-blue-500" />;
      case 'worksheet': return <FileText size={16} className="text-green-500" />;
      case 'account': return <Calculator size={16} className="text-emerald-500" />;
      case 'risk': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'procedure': return <CheckSquare size={16} className="text-indigo-500" />;
      case 'evidence': return <Paperclip size={16} className="text-purple-500" />;
      case 'note': return <MessageSquare size={16} className="text-pink-500" />;
      default: return <FileText size={16} className="text-gray-500" />;
    }
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobileOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Search Trigger Button */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Cari di aplikasi"
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
        >
          <Search size={20} />
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs sm:hidden flex flex-col p-3">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-3 border-b border-gray-200 flex items-center space-x-2">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                ref={mobileInputRef}
                type="text"
                className="flex-1 bg-transparent text-sm outline-none text-gray-900"
                placeholder="Cari worksheet, klien, akun..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setIsMobileOpen(false);
                  setIsOpen(false);
                }}
                className="text-gray-500 hover:text-gray-900 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {query.length >= 2 && (
              <div className="overflow-y-auto p-2 flex-1">
                {results.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-500">
                    Tidak ada hasil untuk "{query}"
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {results.map((res) => (
                      <li key={res.id}>
                        <button
                          type="button"
                          onClick={() => {
                            handleSelect(res.link);
                            setIsMobileOpen(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-blue-50 flex items-start space-x-3 transition-colors group min-h-[44px]"
                        >
                          <div className="mt-0.5 bg-gray-100 group-hover:bg-white p-1.5 rounded text-gray-500 shadow-sm shrink-0">
                            {getIcon(res.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-800 truncate">{res.title}</div>
                            <div className="text-xs text-gray-500 capitalize truncate">{res.type} • {res.subtitle}</div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Search Bar */}
      <div className="hidden sm:block relative w-48 md:w-72 lg:w-96" ref={searchRef}>
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-atlas-blue focus:bg-white transition-all outline-none"
            placeholder="Cari worksheet, klien, akun (Ctrl+K)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
          />
          {query && (
            <button 
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => { setQuery(''); setIsOpen(false); }}
            >
              &times;
            </button>
          )}
        </div>

        {isOpen && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
            <div className="p-2 max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500">
                  Tidak ada hasil ditemukan untuk "{query}"
                </div>
              ) : (
                <ul className="space-y-1">
                  {results.map((res) => (
                    <li key={res.id}>
                      <button
                        onClick={() => handleSelect(res.link)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 flex items-start space-x-3 transition-colors group"
                      >
                        <div className="mt-1 bg-gray-100 group-hover:bg-white p-1.5 rounded text-gray-500 shadow-sm">
                          {getIcon(res.type)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">{res.title}</div>
                          <div className="text-xs text-gray-500 capitalize">{res.type} • {res.subtitle}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
              <span className="text-xs text-gray-500">Tekan ESC untuk menutup</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalSearch;
