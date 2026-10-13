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
        const engId = engagements[0]?.id || 'ENG-2023-001';
        found.push({
          id: `ws-${ws.code}`,
          title: `${ws.code} - ${ws.name}`,
          subtitle: `Worksheet Module`,
          type: 'worksheet',
          link: `/workspace/${engId}/worksheet/${ws.code.replace(/\./g, '').toLowerCase()}`
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

  return (
    <div className="relative w-96" ref={searchRef}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-atlas-blue focus:bg-white transition-all outline-none"
          placeholder="Cari worksheet, klien, akun, risiko (Ctrl+K)..."
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
          <div className="p-2">
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
  );
};

export default GlobalSearch;
