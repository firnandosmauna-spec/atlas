import { useParams, useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import A110 from './A110';
import A1101 from './A1101';
import A1102 from './A1102';
import A1103 from './A1103';
import A1104 from './A1104';
import A120 from './A120';
import A130 from './A130';
import A140 from './A140';
import A150 from './A150';
import A160 from './A160';
import A170 from './A170';
import A210 from './A210';
import A2101 from './A2101';
import A220 from './A220';
import A2201 from './A2201';
import A2202 from './A2202';
import A230 from './A230';
import A240 from './A240';
import A250 from './A250';
import A2501 from './A2501';
import A2502 from './A2502';
import A260 from './A260';
import A270 from './A270';
import A2701 from './A2701';
import A2702 from './A2702';
import B100 from './B100';
import B110 from './B110';
import B120 from './B120';
import B130 from './B130';
import B140 from './B140';
import LeadSchedule from './LeadSchedule';
import BankProsedur from './BankProsedur';
import B210 from './B210';
import B220 from './B220';
import B230 from './B230';
import B240 from './B240';
import B250 from './B250';
import B260 from './B260';
import B270 from './B270';
import B280 from './B280';
import B290 from './B290';
import C110 from './C110';
import C120 from './C120';
import C1201 from './C1201';
import C1202 from './C1202';
import C200 from './C200';
import C220 from './C220';
import C300 from './C300';
import C400 from './C400';
import C510 from './C510';
import C520 from './C520';
import C530 from './C530';
import D100 from './D100';
import { AlertTriangle } from 'lucide-react';

const WorksheetView = () => {
  const { worksheetId: paramId } = useParams<{ worksheetId: string }>();
  const worksheetId = paramId?.toLowerCase() || '';

  // Route specific worksheets to their detailed components
  if (worksheetId === 'a110') {
    return <A110 />;
  }
  if (worksheetId === 'a1101' || worksheetId === 'a110.1') {
    return <A1101 />;
  }
  if (worksheetId === 'a1102' || worksheetId === 'a110.2') {
    return <A1102 />;
  }
  if (worksheetId === 'a1103') {
    return <A1103 />;
  }
  if (worksheetId === 'a1104') {
    return <A1104 />;
  }
  if (worksheetId === 'a120') {
    return <A120 />;
  }
  if (worksheetId === 'a130') {
    return <A130 />;
  }
  if (worksheetId === 'a140') {
    return <A140 />;
  }
  if (worksheetId === 'a150') {
    return <A150 />;
  }
  if (worksheetId === 'a160') {
    return <A160 />;
  }
  if (worksheetId === 'a170') {
    return <A170 />;
  }
  if (worksheetId === 'a210') {
    return <A210 />;
  }
  if (worksheetId === 'a2101' || worksheetId === 'a210.1') {
    return <A2101 />;
  }
  if (worksheetId === 'a220') {
    return <A220 />;
  }
  if (worksheetId === 'a2201' || worksheetId === 'a220.1') {
    return <A2201 />;
  }
  if (worksheetId === 'a230') {
    return <A230 />;
  }
  if (worksheetId === 'a240') {
    return <A240 />;
  }
  if (worksheetId === 'a250') {
    return <A250 />;
  }
  if (worksheetId === 'a2501' || worksheetId === 'a250.1') {
    return <A2501 />;
  }
  if (worksheetId === 'a2502' || worksheetId === 'a250.2') {
    return <A2502 />;
  }
  if (worksheetId === 'a260') {
    return <A260 />;
  }
  if (worksheetId === 'a270') {
    return <A270 />;
  }
  if (worksheetId === 'a2701' || worksheetId === 'a270.1') {
    return <A2701 />;
  }
  if (worksheetId === 'a2702' || worksheetId === 'a270.2') {
    return <A2702 />;
  }
  if (worksheetId === 'b100') {
    return <B100 />;
  }
  if (worksheetId === 'b110') {
    return <B110 />;
  }
  if (worksheetId === 'b120') {
    return <B120 />;
  }
  if (worksheetId === 'b130') {
    return <B130 />;
  }
  if (worksheetId === 'b140') {
    return <B140 />;
  }
  if (worksheetId.startsWith('ls-')) {
    const indeks = worksheetId.split('-')[1];
    return <LeadSchedule indeks={indeks} />;
  }
  if (worksheetId.startsWith('bp-') || worksheetId === 'bank-prosedur' || worksheetId === 'bank-procedures' || worksheetId === 'bp' || worksheetId === 'bankprosedur') {
    const indeks = worksheetId.startsWith('bp-') ? worksheetId.split('-')[1] : 'A';
    return <BankProsedur indeks={indeks} />;
  }
  if (worksheetId === 'b210') {
    return <B210 />; 
  }
  if (worksheetId === 'b220') {
    return <B220 />;
  }
  if (worksheetId === 'b230') {
    return <B230 />;
  }
  if (worksheetId === 'b240') {
    return <B240 />;
  }
  if (worksheetId === 'b250') {
    return <B250 />;
  }
  if (worksheetId === 'b260') {
    return <B260 />;
  }
  if (worksheetId === 'b270') {
    return <B270 />;
  }
  if (worksheetId === 'b280') {
    return <B280 />;
  }
  if (worksheetId === 'b290') {
    return <B290 />;
  }
  if (worksheetId === 'c110') {
    return <C110 />;
  }
  if (worksheetId === 'c120') {
    return <C120 />;
  }
  if (worksheetId === 'c1201' || worksheetId === 'c120.1') {
    return <C1201 />;
  }
  if (worksheetId === 'c1202' || worksheetId === 'c120.2') {
    return <C1202 />;
  }
  if (worksheetId === 'c200') {
    return <C200 />;
  }
  if (worksheetId === 'c220') {
    return <C220 />;
  }
  if (worksheetId === 'c300') {
    return <C300 />;
  }
  if (worksheetId === 'c400') {
    return <C400 />;
  }
  if (worksheetId === 'c510') {
    return <C510 />;
  }
  if (worksheetId === 'c520') {
    return <C520 />;
  }
  if (worksheetId === 'c530') {
    return <C530 />;
  }
  if (worksheetId === 'd100') {
    return <D100 />;
  }

  // Fallback for other unimplemented worksheets
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Kertas Kerja {worksheetId?.toUpperCase()}
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-xl">
          Modul untuk kertas kerja ini sedang dalam tahap pengembangan (Work in Progress). 
          Fungsionalitas secara bertahap akan ditambahkan sesuai standar ATLAS.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-atlas-blue text-white rounded-lg font-medium shadow-sm hover:bg-blue-800 transition-colors"
        >
          Kembali ke Daftar
        </button>
      </div>
    </div>
  );
};

export default WorksheetView;
