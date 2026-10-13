import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import { Calculator, DollarSign, AlertTriangle, CalendarDays, Users, BarChart3 } from 'lucide-react';
import WorksheetContainer from '../../../components/WorksheetContainer';

interface PhaseHours {
  planning: number;
  riskResponse: number;
  reporting: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  rate: number;
  autoHours: PhaseHours;
  manualHours: PhaseHours;
}

const A120 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  // ALOKASI JAM STATES
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [restDuration, setRestDuration] = useState(1); // in hours
  const [holidays, setHolidays] = useState(0);
  const [rencanaBiayaLain, setRencanaBiayaLain] = useState(0);

  // ALOKASI JAM CALCULATIONS
  const timeCalc = useMemo(() => {
    let effectiveHoursPerDay = 0;
    let totalDays = 0;
    let totalEffectiveHours = 0;

    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      const startDec = startH + startM / 60;
      const endDec = endH + endM / 60;
      
      effectiveHoursPerDay = Math.max(0, (endDec - startDec) - restDuration);
    }

    if (startDate && endDate) {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
      totalDays = Math.max(0, diffDays - holidays);
      totalEffectiveHours = totalDays * effectiveHoursPerDay;
    }

    return { effectiveHoursPerDay, totalDays, totalEffectiveHours };
  }, [startDate, endDate, startTime, endTime, restDuration, holidays]);

  // TEAM STATES
  const [teamData, setTeamData] = useState<TeamMember[]>([
    { 
      id: '1', name: engagement.partnerName || 'Partner', role: 'Partner', rate: 2500000, 
      autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
      manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
    },
    { 
      id: '2', name: engagement.managerName || 'Manager', role: 'Manager', rate: 1500000, 
      autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
      manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
    },
    { 
      id: '3', name: engagement.auditorName || 'Ketua Tim', role: 'Ketua Tim', rate: 800000, 
      autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
      manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
    },
    { 
      id: '4', name: 'Anggota Tim 1', role: 'Anggota Tim', rate: 500000, 
      autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
      manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
    },
  ]);

  // Effect to automatically calculate autoHours based on totalEffectiveHours
  useEffect(() => {
    if (timeCalc.totalEffectiveHours > 0) {
      const total = timeCalc.totalEffectiveHours;
      const updatedTeam = teamData.map(member => {
        let roleWeight = 0;
        if (member.role === 'Partner') roleWeight = 0.10;
        else if (member.role === 'Manager') roleWeight = 0.15;
        else if (member.role === 'Ketua Tim') roleWeight = 0.35;
        else if (member.role === 'Anggota Tim') roleWeight = 0.40;
        else roleWeight = 0;

        const roleTotal = total * roleWeight;
        return {
          ...member,
          autoHours: {
            planning: parseFloat((roleTotal * 0.20).toFixed(2)),
            riskResponse: parseFloat((roleTotal * 0.50).toFixed(2)),
            reporting: parseFloat((roleTotal * 0.30).toFixed(2))
          }
        };
      });
      setTeamData(updatedTeam);
    }
  }, [timeCalc.totalEffectiveHours]); // Only depend on timeCalc, to avoid infinite loop

  const handleUpdateManualHours = (id: string, phase: keyof PhaseHours, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTeamData(prev => prev.map(m => m.id === id ? {
      ...m,
      manualHours: { ...m.manualHours, [phase]: numValue }
    } : m));
  };

  const handleUpdateRole = (id: string, newRole: string) => {
    setTeamData(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
  };

  const handleUpdateRate = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTeamData(prev => prev.map(m => m.id === id ? { ...m, rate: numValue } : m));
  };

  const totals = useMemo(() => {
    let autoTotal = { planning: 0, riskResponse: 0, reporting: 0, all: 0 };
    let manualTotal = { planning: 0, riskResponse: 0, reporting: 0, all: 0 };
    let totalFee = 0;

    teamData.forEach(member => {
      // Auto
      autoTotal.planning += member.autoHours.planning;
      autoTotal.riskResponse += member.autoHours.riskResponse;
      autoTotal.reporting += member.autoHours.reporting;
      
      // Manual
      manualTotal.planning += member.manualHours.planning;
      manualTotal.riskResponse += member.manualHours.riskResponse;
      manualTotal.reporting += member.manualHours.reporting;
      
      const memberTotalManualHours = member.manualHours.planning + member.manualHours.riskResponse + member.manualHours.reporting;
      totalFee += (memberTotalManualHours * member.rate);
    });

    autoTotal.all = autoTotal.planning + autoTotal.riskResponse + autoTotal.reporting;
    manualTotal.all = manualTotal.planning + manualTotal.riskResponse + manualTotal.reporting;

    return { autoTotal, manualTotal, fee: totalFee, grandTotal: totalFee + rencanaBiayaLain };
  }, [teamData, rencanaBiayaLain]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: engagement.currency === 'USD' ? 'USD' : 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <WorksheetContainer
      code="A.120"
      name="Alokasi Jam Jasa dan Perencanaan Lainnya"
      purpose="Mengalokasikan waktu dan anggaran biaya untuk setiap personel berdasarkan siklus tahapan audit."
      status="In Progress"
      reviewer={engagement.managerName || 'Menunggu Reviewer'}
      lastUpdated="Baru saja"
    >
      <div className="space-y-6">

        {/* ALOKASI JAM SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <CalendarDays className="mr-2 text-atlas-blue" size={20} /> 1. Rencana Jadwal Pelaksanaan
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tgl Mulai Pelaksanaan</label>
              <input type="date" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-atlas-blue/20 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tgl Berakhir Pelaksanaan</label>
              <input type="date" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-atlas-blue/20 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Jam Mulai & Pulang</label>
              <div className="flex items-center space-x-2">
                <input type="time" className="flex-1 p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-atlas-blue/20 text-sm" value={startTime} onChange={e => setStartTime(e.target.value)} />
                <span className="text-gray-400">-</span>
                <input type="time" className="flex-1 p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-atlas-blue/20 text-sm" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Jml Libur & Istirahat (Jam)</label>
              <div className="flex items-center space-x-2">
                <input type="number" min="0" step="1" title="Jumlah Hari Libur" className="flex-1 p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-atlas-blue/20 text-sm" value={holidays} onChange={e => setHolidays(parseFloat(e.target.value) || 0)} placeholder="Hari" />
                <input type="number" min="0" step="0.5" title="Lama Istirahat (Jam)" className="flex-1 p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-atlas-blue/20 text-sm" value={restDuration} onChange={e => setRestDuration(parseFloat(e.target.value) || 0)} placeholder="Jam Istirahat" />
              </div>
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
              <div className="flex space-x-8">
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Jam Kerja Efektif/Hari</span>
                  <span className="text-lg font-bold text-gray-800">{timeCalc.effectiveHoursPerDay.toFixed(1)} Jam</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Total Hari Efektif</span>
                  <span className="text-lg font-bold text-gray-800">{timeCalc.totalDays} Hari</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs text-atlas-blue uppercase font-bold mb-1">Total Jam Efektif</span>
                <span className="text-2xl font-black text-atlas-blue">{timeCalc.totalEffectiveHours.toFixed(1)} Jam</span>
              </div>
            </div>
          </div>
        </div>

        {/* PENGGUNAAN JAM JASA PER TAHAPAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-100 bg-slate-50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
              <BarChart3 className="mr-2 text-atlas-blue" size={20} /> 2. Rekap Jam Jasa per Tahapan
            </h2>
            <p className="text-sm text-gray-500 mb-6">Ringkasan alokasi rencana jam kerja aktual berdasarkan tahapan siklus audit utama.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">PraPerikatan & Risk Assessment</span>
                <span className="font-mono bg-white border border-gray-200 px-3 py-1 rounded shadow-sm">{totals.manualTotal.planning.toFixed(2)} jam</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Risk Response</span>
                <span className="font-mono bg-white border border-gray-200 px-3 py-1 rounded shadow-sm">{totals.manualTotal.riskResponse.toFixed(2)} jam</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Reporting</span>
                <span className="font-mono bg-white border border-gray-200 px-3 py-1 rounded shadow-sm">{totals.manualTotal.reporting.toFixed(2)} jam</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="font-bold text-atlas-blue">Total Keseluruhan</span>
                <span className="font-mono bg-atlas-blue text-white px-3 py-1 rounded shadow-sm font-bold">{totals.manualTotal.all.toFixed(2)} jam</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:w-1/2 flex items-center justify-center">
            {/* Visual breakdown using simple bar */}
            <div className="w-full max-w-sm">
              <div className="text-center mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Distribusi Tahapan (Aktual)</span>
              </div>
              {totals.manualTotal.all > 0 ? (
                <div className="flex h-8 w-full rounded-lg overflow-hidden shadow-inner">
                  <div style={{ width: `${(totals.manualTotal.planning / totals.manualTotal.all) * 100}%` }} className="bg-amber-400 flex items-center justify-center text-xs text-white font-bold opacity-90 transition-all">
                    {((totals.manualTotal.planning / totals.manualTotal.all) * 100).toFixed(0)}%
                  </div>
                  <div style={{ width: `${(totals.manualTotal.riskResponse / totals.manualTotal.all) * 100}%` }} className="bg-blue-500 flex items-center justify-center text-xs text-white font-bold opacity-90 transition-all">
                    {((totals.manualTotal.riskResponse / totals.manualTotal.all) * 100).toFixed(0)}%
                  </div>
                  <div style={{ width: `${(totals.manualTotal.reporting / totals.manualTotal.all) * 100}%` }} className="bg-emerald-500 flex items-center justify-center text-xs text-white font-bold opacity-90 transition-all">
                    {((totals.manualTotal.reporting / totals.manualTotal.all) * 100).toFixed(0)}%
                  </div>
                </div>
              ) : (
                <div className="flex h-8 w-full rounded-lg bg-gray-100 shadow-inner items-center justify-center text-xs text-gray-400 font-bold">
                  Belum ada data aktual
                </div>
              )}
              <div className="flex justify-between mt-3 text-xs font-semibold text-gray-600">
                <div className="flex items-center"><div className="w-3 h-3 bg-amber-400 rounded-sm mr-1"></div> Planning</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div> Response</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded-sm mr-1"></div> Reporting</div>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL ALOKASI PER TIM */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Users className="mr-2 text-atlas-blue" size={20} /> 3. Rencana Alokasi Jam Jasa per Tim
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr>
                  <th rowSpan={2} className="px-4 py-3 bg-gray-50 border-b border-r border-gray-200 text-center font-bold text-gray-600 w-12">No</th>
                  <th rowSpan={2} className="px-4 py-3 bg-gray-50 border-b border-r border-gray-200 font-bold text-gray-600 min-w-[150px]">Nama Personil</th>
                  <th rowSpan={2} className="px-4 py-3 bg-gray-50 border-b border-r border-gray-200 font-bold text-gray-600 w-36 text-center">Peran Tim</th>
                  <th colSpan={3} className="px-4 py-2 bg-blue-50 border-b border-r border-gray-200 text-center font-bold text-atlas-blue">Alokasi Rencana Otomatis</th>
                  <th colSpan={3} className="px-4 py-2 bg-amber-50 border-b border-gray-200 text-center font-bold text-amber-700">Alokasi Rencana Aktual</th>
                </tr>
                <tr>
                  {/* Auto */}
                  <th className="px-2 py-2 bg-blue-50/50 border-b border-r border-gray-200 text-center text-xs font-semibold text-gray-600">Planning</th>
                  <th className="px-2 py-2 bg-blue-50/50 border-b border-r border-gray-200 text-center text-xs font-semibold text-gray-600">Risk Resp.</th>
                  <th className="px-2 py-2 bg-blue-50/50 border-b border-r border-gray-200 text-center text-xs font-semibold text-gray-600">Reporting</th>
                  {/* Manual */}
                  <th className="px-2 py-2 bg-amber-50/50 border-b border-r border-gray-200 text-center text-xs font-semibold text-gray-600">Planning</th>
                  <th className="px-2 py-2 bg-amber-50/50 border-b border-r border-gray-200 text-center text-xs font-semibold text-gray-600">Risk Resp.</th>
                  <th className="px-2 py-2 bg-amber-50/50 border-b border-gray-200 text-center text-xs font-semibold text-gray-600">Reporting</th>
                </tr>
              </thead>
              <tbody>
                {teamData.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 border-b border-gray-100">
                    <td className="px-4 py-3 text-center border-r border-gray-100 text-gray-500 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-700">{member.name}</td>
                    <td className="px-4 py-3 border-r border-gray-100">
                      <select 
                        className="w-full text-center border-gray-300 rounded text-sm font-semibold outline-none focus:ring-1 focus:ring-atlas-blue/30 p-1"
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      >
                        <option value="Partner">Partner</option>
                        <option value="Manager">Manager</option>
                        <option value="Ketua Tim">Ketua Tim</option>
                        <option value="Anggota Tim">Anggota Tim</option>
                      </select>
                    </td>
                    
                    {/* Auto Fields (Readonly) */}
                    <td className="px-2 py-3 border-r border-gray-100 text-center font-mono text-gray-500 bg-gray-50/50">{member.autoHours.planning.toFixed(2)}</td>
                    <td className="px-2 py-3 border-r border-gray-100 text-center font-mono text-gray-500 bg-gray-50/50">{member.autoHours.riskResponse.toFixed(2)}</td>
                    <td className="px-2 py-3 border-r border-gray-100 text-center font-mono text-gray-500 bg-gray-50/50">{member.autoHours.reporting.toFixed(2)}</td>

                    {/* Manual Fields (Input) */}
                    <td className="px-2 py-2 border-r border-gray-100 bg-yellow-50/20">
                      <input type="number" min="0" step="0.5" className="w-full p-1 border border-amber-200 rounded text-center text-sm font-bold text-gray-800 focus:border-amber-500 outline-none" value={member.manualHours.planning || ''} onChange={(e) => handleUpdateManualHours(member.id, 'planning', e.target.value)} />
                    </td>
                    <td className="px-2 py-2 border-r border-gray-100 bg-yellow-50/20">
                      <input type="number" min="0" step="0.5" className="w-full p-1 border border-amber-200 rounded text-center text-sm font-bold text-gray-800 focus:border-amber-500 outline-none" value={member.manualHours.riskResponse || ''} onChange={(e) => handleUpdateManualHours(member.id, 'riskResponse', e.target.value)} />
                    </td>
                    <td className="px-2 py-2 bg-yellow-50/20">
                      <input type="number" min="0" step="0.5" className="w-full p-1 border border-amber-200 rounded text-center text-sm font-bold text-gray-800 focus:border-amber-500 outline-none" value={member.manualHours.reporting || ''} onChange={(e) => handleUpdateManualHours(member.id, 'reporting', e.target.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700 border-r border-gray-200">Jumlah</td>
                  <td className="px-2 py-3 text-center font-bold text-atlas-blue border-r border-gray-200">{totals.autoTotal.planning.toFixed(2)}</td>
                  <td className="px-2 py-3 text-center font-bold text-atlas-blue border-r border-gray-200">{totals.autoTotal.riskResponse.toFixed(2)}</td>
                  <td className="px-2 py-3 text-center font-bold text-atlas-blue border-r border-gray-200">{totals.autoTotal.reporting.toFixed(2)}</td>
                  <td className="px-2 py-3 text-center font-bold text-amber-700 border-r border-gray-200">{totals.manualTotal.planning.toFixed(2)}</td>
                  <td className="px-2 py-3 text-center font-bold text-amber-700 border-r border-gray-200">{totals.manualTotal.riskResponse.toFixed(2)}</td>
                  <td className="px-2 py-3 text-center font-bold text-amber-700">{totals.manualTotal.reporting.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* KALKULASI ANGGARAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Calculator className="mr-2 text-atlas-blue" size={20} /> 4. Kalkulasi Anggaran Biaya
            </h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="pb-3 font-semibold">Nama Personil</th>
                    <th className="pb-3 font-semibold w-32 text-center">Total Jam (Aktual)</th>
                    <th className="pb-3 font-semibold w-48">Tarif per Jam</th>
                    <th className="pb-3 font-semibold text-right">Total Biaya Personil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teamData.map((member) => {
                    const totalHours = member.manualHours.planning + member.manualHours.riskResponse + member.manualHours.reporting;
                    return (
                      <tr key={member.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-4 text-sm font-bold text-gray-700">{member.name} <span className="text-gray-400 font-normal">({member.role})</span></td>
                        <td className="py-4 text-center font-mono font-bold text-gray-800">{totalHours.toFixed(2)}</td>
                        <td className="py-4">
                          <div className="relative">
                            <input 
                              type="number" 
                              min="0"
                              value={member.rate || ''}
                              onChange={(e) => handleUpdateRate(member.id, e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-atlas-blue focus:ring-atlas-blue outline-none font-bold text-gray-700"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                          </div>
                        </td>
                        <td className="py-4 text-right font-semibold text-gray-800">
                          {formatCurrency(totalHours * member.rate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row gap-6 border-t border-gray-100 pt-6">
              <div className="md:w-1/2 bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Biaya Lain-Lain (OPE) (B)</h3>
                <div className="relative mt-2">
                  <input 
                    type="number" 
                    min="0"
                    value={rencanaBiayaLain || ''}
                    onChange={(e) => setRencanaBiayaLain(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl font-bold text-gray-800 focus:border-atlas-blue focus:ring-atlas-blue outline-none"
                    placeholder="0"
                  />
                  <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div className="md:w-1/2 bg-blue-50/50 rounded-xl p-5 border border-blue-100 flex flex-col justify-center">
                <h3 className="font-bold text-atlas-blue mb-1 uppercase text-sm tracking-wider">Total RAB (Personil + OPE)</h3>
                <div className="text-3xl font-black text-gray-900 mt-1">
                  {formatCurrency(totals.grandTotal)}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SIMPULAN PADA KERTAS KERJA A.120 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <AlertTriangle className="mr-2 text-atlas-blue" size={20} /> Simpulan Kertas Kerja A.120
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Simpulan</label>
                <div className="w-full bg-red-50 border border-red-200 text-red-600 font-bold px-4 py-2 rounded-lg text-sm text-center">
                  Alokasi jam kerja belum memadai
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-red-600 mb-2">Jelaskan bagaimana rencana proses pemantauan atas perikatan tersebut</label>
                <textarea 
                  className="w-full border-2 border-yellow-400 bg-yellow-100/50 rounded-xl p-4 text-gray-800 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none min-h-[100px] shadow-sm"
                  placeholder="Isi penjelasan disini karena simpulan alokasi jam belum memadai..."
                ></textarea>
              </div>

            </div>

            <div className="mt-6 border-t border-gray-100 pt-6 flex items-center gap-4">
              <div className="text-sm font-bold text-gray-700">Status KKP</div>
              <div className="bg-red-50 border border-red-400 text-red-600 font-black px-4 py-1.5 rounded-lg text-sm uppercase shadow-sm">
                Incompleted
              </div>
            </div>
          </div>
        </div>

      </div>
    </WorksheetContainer>
  );
};

export default A120;
