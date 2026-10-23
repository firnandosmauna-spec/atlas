import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Engagement } from '../../../store/engagementStore';
import { useEngagementStore } from '../../../store/engagementStore';
import { 
  Calculator, 
  DollarSign, 
  AlertTriangle, 
  CalendarDays, 
  Users, 
  BarChart3, 
  ExternalLink,
  CalendarCheck2,
  CalendarX2,
  Save,
  CheckCircle2,
  Calendar,
  Copy,
  Clock,
  UserPlus,
  Trash2,
  Plus
} from 'lucide-react';
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

interface NationalHoliday {
  date: string; // YYYY-MM-DD
  name: string;
}

// Daftar Hari Libur Nasional Indonesia (2024 - 2027)
export const INDONESIAN_HOLIDAYS: NationalHoliday[] = [
  // 2024
  { date: '2024-01-01', name: 'Tahun Baru 2024 Masehi' },
  { date: '2024-02-08', name: 'Isra Mi\'raj Nabi Muhammad SAW' },
  { date: '2024-02-10', name: 'Tahun Baru Imlek 2575 Kongzili' },
  { date: '2024-03-11', name: 'Hari Suci Nyepi Tahun Baru Saka 1946' },
  { date: '2024-03-29', name: 'Wafat Yesus Kristus' },
  { date: '2024-03-31', name: 'Hari Paskah' },
  { date: '2024-04-10', name: 'Hari Raya Idul Fitri 1445 H' },
  { date: '2024-04-11', name: 'Hari Raya Idul Fitri 1445 H' },
  { date: '2024-05-01', name: 'Hari Buruh Internasional' },
  { date: '2024-05-09', name: 'Kenaikan Yesus Kristus' },
  { date: '2024-05-23', name: 'Hari Raya Waisak 2568 BE' },
  { date: '2024-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2024-06-17', name: 'Hari Raya Idul Adha 1445 H' },
  { date: '2024-07-07', name: 'Tahun Baru Islam 1446 H' },
  { date: '2024-08-17', name: 'Hari Kemerdekaan RI' },
  { date: '2024-09-16', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2024-12-25', name: 'Hari Raya Natal' },

  // 2025
  { date: '2025-01-01', name: 'Tahun Baru 2025 Masehi' },
  { date: '2025-01-27', name: 'Isra Mi\'raj Nabi Muhammad SAW' },
  { date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili' },
  { date: '2025-03-29', name: 'Hari Suci Nyepi Tahun Baru Saka 1947' },
  { date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 H' },
  { date: '2025-04-01', name: 'Hari Raya Idul Fitri 1446 H' },
  { date: '2025-04-18', name: 'Wafat Yesus Kristus' },
  { date: '2025-04-20', name: 'Kebangkitan Yesus Kristus (Paskah)' },
  { date: '2025-05-01', name: 'Hari Buruh Internasional' },
  { date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE' },
  { date: '2025-05-29', name: 'Kenaikan Yesus Kristus' },
  { date: '2025-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2025-06-06', name: 'Hari Raya Idul Adha 1446 H' },
  { date: '2025-06-27', name: 'Tahun Baru Islam 1447 H' },
  { date: '2025-08-17', name: 'Hari Kemerdekaan RI' },
  { date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2025-12-25', name: 'Hari Raya Natal' },

  // 2026
  { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi' },
  { date: '2026-01-16', name: 'Isra Mi\'raj Nabi Muhammad SAW' },
  { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili' },
  { date: '2026-03-19', name: 'Hari Suci Nyepi Saka 1948' },
  { date: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 H' },
  { date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H' },
  { date: '2026-04-03', name: 'Wafat Yesus Kristus' },
  { date: '2026-04-05', name: 'Kebangkitan Yesus Kristus (Paskah)' },
  { date: '2026-05-01', name: 'Hari Buruh Internasional' },
  { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
  { date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 H' },
  { date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE' },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2026-06-16', name: 'Tahun Baru Islam 1448 H' },
  { date: '2026-08-17', name: 'Hari Kemerdekaan RI' },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2026-12-25', name: 'Hari Raya Natal' },

  // 2027
  { date: '2027-01-01', name: 'Tahun Baru 2027 Masehi' },
  { date: '2027-01-06', name: 'Isra Mi\'raj Nabi Muhammad SAW' },
  { date: '2027-02-06', name: 'Tahun Baru Imlek 2578 Kongzili' },
  { date: '2027-03-09', name: 'Hari Suci Nyepi Saka 1949' },
  { date: '2027-03-10', name: 'Hari Raya Idul Fitri 1448 H' },
  { date: '2027-03-11', name: 'Hari Raya Idul Fitri 1448 H' },
  { date: '2027-03-26', name: 'Wafat Yesus Kristus' },
  { date: '2027-05-01', name: 'Hari Buruh Internasional' },
  { date: '2027-05-06', name: 'Kenaikan Yesus Kristus' },
  { date: '2027-05-20', name: 'Hari Raya Waisak 2571 BE' },
  { date: '2027-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2027-05-17', name: 'Hari Raya Idul Adha 1448 H' },
  { date: '2027-06-06', name: 'Tahun Baru Islam 1449 H' },
  { date: '2027-08-15', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2027-08-17', name: 'Hari Kemerdekaan RI' },
  { date: '2027-12-25', name: 'Hari Raya Natal' },
];

export interface HolidayDetail {
  totalDays: number;
  weekendDays: number;
  publicHolidaysCount: number;
  autoHolidays: number;
  holidayList: { date: string; name: string; isWeekend: boolean }[];
}

export const calculateHolidays = (startStr: string, endStr: string): HolidayDetail => {
  if (!startStr || !endStr) {
    return {
      totalDays: 0,
      weekendDays: 0,
      publicHolidaysCount: 0,
      autoHolidays: 0,
      holidayList: [],
    };
  }

  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return {
      totalDays: 0,
      weekendDays: 0,
      publicHolidaysCount: 0,
      autoHolidays: 0,
      holidayList: [],
    };
  }

  let totalCalendarDays = 0;
  let weekendDays = 0;
  const holidayList: { date: string; name: string; isWeekend: boolean }[] = [];

  const cur = new Date(start);
  while (cur <= end) {
    totalCalendarDays++;
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = cur.getDay(); // 0: Minggu, 6: Sabtu
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      weekendDays++;
    }

    const matched = INDONESIAN_HOLIDAYS.find(h => h.date === dateStr);
    if (matched) {
      holidayList.push({
        date: dateStr,
        name: matched.name,
        isWeekend,
      });
    }

    cur.setDate(cur.getDate() + 1);
  }

  // Libur nasional pada hari kerja (tidak dihitung ganda jika jatuh di akhir pekan)
  const weekdayPublicHolidays = holidayList.filter(h => !h.isWeekend).length;
  const autoHolidays = weekendDays + weekdayPublicHolidays;

  return {
    totalDays: totalCalendarDays,
    weekendDays,
    publicHolidaysCount: weekdayPublicHolidays,
    autoHolidays,
    holidayList,
  };
};

// Normalisasi format jam: misal "11:60" otomatis menjadi "12:00", "8" -> "08:00", "11.60" -> "12:00"
export const normalizeTimeString = (raw: string): string => {
  if (!raw) return '';
  let str = raw.trim().toLowerCase();
  str = str.replace(/jam\s*/g, '').replace(/pukul\s*/g, '').trim();
  str = str.replace('.', ':');
  
  if (str.includes(':')) {
    const parts = str.split(':');
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(h)) h = 0;
    if (isNaN(m)) m = 0;
    
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
    h = h % 24;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } else {
    let h = parseInt(str, 10);
    if (!isNaN(h)) {
      h = h % 24;
      return `${String(h).padStart(2, '0')}:00`;
    }
  }
  return raw;
};

// Format tampilan jam untuk label ramah pengguna: "11:60" -> "Jam 12", "08:00" -> "Jam 8"
export const formatDisplayHourLabel = (timeStr: string): string => {
  const norm = normalizeTimeString(timeStr);
  if (!norm) return '';
  const [hStr, mStr] = norm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (m === 0) {
    return `Jam ${h}`;
  }
  return `Jam ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Format angka dengan pemisah ribuan berupa titik (.) untuk format mata uang Indonesia (misal 1000 -> 1.000)
export const formatNumberWithDots = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = val.toString().replace(/\D/g, '');
  if (!numStr) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numStr));
};

export const parseNumberFromDots = (val: string): number => {
  const cleanStr = val.replace(/\D/g, '');
  return cleanStr ? parseInt(cleanStr, 10) : 0;
};

interface MoneyInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  title?: string;
}

const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className,
  id,
  title,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawCursor = input.selectionStart || 0;
    const currentVal = input.value;
    const digitsBeforeCursor = currentVal.slice(0, rawCursor).replace(/\D/g, '').length;
    
    const num = parseNumberFromDots(currentVal);
    onChange(num);

    const formatted = num ? formatNumberWithDots(num) : '';
    requestAnimationFrame(() => {
      if (document.activeElement !== input) return;
      let newCursor = 0;
      let digitCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          digitCount++;
        }
        if (digitCount >= digitsBeforeCursor) {
          newCursor = i + 1;
          break;
        }
      }
      if (digitCount < digitsBeforeCursor) {
        newCursor = formatted.length;
      }
      input.setSelectionRange(newCursor, newCursor);
    });
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={value ? formatNumberWithDots(value) : ''}
      onChange={handleChange}
      className={className}
      title={title}
    />
  );
};

const A120 = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const updateEngagement = useEngagementStore(state => state.updateEngagement);

  const wsA120 = (engagement as any).worksheetA120 || {};

  // ALOKASI JAM STATES
  const [startDate, setStartDate] = useState(wsA120.startDate || engagement.startDate || '');
  const [endDate, setEndDate] = useState(wsA120.endDate || engagement.targetDate || '');
  const [startTime, setStartTime] = useState(normalizeTimeString(wsA120.startTime || '08:00'));
  const [endTime, setEndTime] = useState(normalizeTimeString(wsA120.endTime || '17:00'));
  const [restDuration, setRestDuration] = useState(wsA120.restDuration ?? 1); // in hours
  const [manualHolidays, setManualHolidays] = useState<number>(wsA120.manualHolidays ?? 0);
  const [rencanaBiayaLain, setRencanaBiayaLain] = useState(wsA120.rencanaBiayaLain ?? 0);
  const [simpulanNotes, setSimpulanNotes] = useState(wsA120.simpulanNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  // Kalkulasi hari libur otomatis (Akhir Pekan + Libur Nasional)
  const holidayDetails = useMemo(() => {
    return calculateHolidays(startDate, endDate);
  }, [startDate, endDate]);

  // Total hari libur = Libur Otomatis + Libur Manual
  const totalHolidays = holidayDetails.autoHolidays + manualHolidays;

  // Handler perubahan input jam dengan normalisasi 11:60 -> 12:00
  const handleTimeBlur = (type: 'start' | 'end', val: string) => {
    const norm = normalizeTimeString(val);
    if (type === 'start') {
      setStartTime(norm);
    } else {
      setEndTime(norm);
    }
  };

  // ALOKASI JAM CALCULATIONS
  const timeCalc = useMemo(() => {
    let effectiveHoursPerDay = 0;
    let totalDays = 0;
    let totalEffectiveHours = 0;

    if (startTime && endTime) {
      const normStart = normalizeTimeString(startTime);
      const normEnd = normalizeTimeString(endTime);
      const [startH, startM] = normStart.split(':').map(Number);
      const [endH, endM] = normEnd.split(':').map(Number);
      
      const startDec = startH + (startM || 0) / 60;
      const endDec = endH + (endM || 0) / 60;
      
      effectiveHoursPerDay = Math.max(0, (endDec - startDec) - restDuration);
    }

    if (startDate && endDate) {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
      totalDays = Math.max(0, diffDays - totalHolidays);
      totalEffectiveHours = totalDays * effectiveHoursPerDay;
    }

    return { effectiveHoursPerDay, totalDays, totalEffectiveHours };
  }, [startDate, endDate, startTime, endTime, restDuration, totalHolidays]);

  // 2. Rekap Jam Jasa per Tahapan: Otomatis sinkron persis dengan Total Jam Efektif (misal: 176.0 Jam)
  const phaseAllocation = useMemo(() => {
    const total = timeCalc.totalEffectiveHours;
    const planning = parseFloat((total * 0.20).toFixed(2));
    const riskResponse = parseFloat((total * 0.50).toFixed(2));
    // Sisa dialokasikan ke reporting agar jumlah total persis 100% sama dengan totalEffectiveHours
    const reporting = parseFloat(Math.max(0, total - planning - riskResponse).toFixed(2));
    return {
      planning,
      riskResponse,
      reporting,
      total: parseFloat((planning + riskResponse + reporting).toFixed(2))
    };
  }, [timeCalc.totalEffectiveHours]);

  // TEAM STATES
  const [teamData, setTeamData] = useState<TeamMember[]>(() => {
    if (wsA120.teamData && Array.isArray(wsA120.teamData) && wsA120.teamData.length > 0) {
      return wsA120.teamData;
    }
    const list: TeamMember[] = [
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
    ];

    if (engagement.supervisorName) {
      list.push({
        id: 'sub-sup', name: engagement.supervisorName, role: 'Supervisor', rate: 1200000,
        autoHours: { planning: 0, riskResponse: 0, reporting: 0 },
        manualHours: { planning: 0, riskResponse: 0, reporting: 0 }
      });
    }

    list.push({ 
      id: '3', name: engagement.auditorName || 'Ketua Tim', role: 'Ketua Tim', rate: 800000, 
      autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
      manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
    });

    if (engagement.teamMembers && engagement.teamMembers.length > 0) {
      engagement.teamMembers.forEach((tm, idx) => {
        list.push({
          id: tm.id || `tm-${idx + 4}`,
          name: tm.name,
          role: tm.role || 'Anggota Tim',
          rate: tm.role?.includes('Pendukung') ? 350000 : 500000,
          autoHours: { planning: 0, riskResponse: 0, reporting: 0 },
          manualHours: { planning: 0, riskResponse: 0, reporting: 0 }
        });
      });
    } else {
      list.push({ 
        id: '4', name: 'Anggota Tim 1', role: 'Anggota Tim', rate: 500000, 
        autoHours: { planning: 0, riskResponse: 0, reporting: 0 }, 
        manualHours: { planning: 0, riskResponse: 0, reporting: 0 } 
      });
    }
    return list;
  });

  // Effect to automatically calculate autoHours based on totalEffectiveHours (normalized across active members)
  useEffect(() => {
    if (timeCalc.totalEffectiveHours > 0) {
      const total = timeCalc.totalEffectiveHours;
      const getRawWeight = (role: string) => {
        if (role === 'Partner') return 0.10;
        if (role === 'Manager') return 0.15;
        if (role === 'Supervisor') return 0.10;
        if (role === 'Ketua Tim') return 0.35;
        if (role.includes('Tim') || role.includes('Anggota')) return 0.30;
        return 0.10;
      };

      setTeamData(prev => {
        const totalRawWeight = prev.reduce((acc, m) => acc + getRawWeight(m.role), 0) || 1;
        let allocatedTotal = 0;

        return prev.map((member, index) => {
          const isLast = index === prev.length - 1;
          const normWeight = getRawWeight(member.role) / totalRawWeight;
          let roleTotal = parseFloat((total * normWeight).toFixed(2));

          if (isLast) {
            roleTotal = parseFloat(Math.max(0, total - allocatedTotal).toFixed(2));
          } else {
            allocatedTotal += roleTotal;
          }

          const planHours = parseFloat((roleTotal * 0.20).toFixed(2));
          const respHours = parseFloat((roleTotal * 0.50).toFixed(2));
          const repHours = parseFloat(Math.max(0, roleTotal - planHours - respHours).toFixed(2));

          return {
            ...member,
            autoHours: {
              planning: planHours,
              riskResponse: respHours,
              reporting: repHours,
            }
          };
        });
      });
    }
  }, [timeCalc.totalEffectiveHours]); // Only depend on timeCalc, to avoid infinite loop

  // Distribusi jam rencana efektif ke seluruh personil tim secara proporsional
  const handleDistributeEffectiveHours = () => {
    if (timeCalc.totalEffectiveHours <= 0) return;
    const total = timeCalc.totalEffectiveHours;
    const getRawWeight = (role: string) => {
      if (role === 'Partner') return 0.10;
      if (role === 'Manager') return 0.15;
      if (role === 'Supervisor') return 0.10;
      if (role === 'Ketua Tim') return 0.35;
      if (role.includes('Tim') || role.includes('Anggota')) return 0.30;
      return 0.10;
    };

    const totalRawWeight = teamData.reduce((acc, m) => acc + getRawWeight(m.role), 0) || 1;
    let allocatedTotal = 0;

    const updated = teamData.map((member, index) => {
      const isLast = index === teamData.length - 1;
      const normWeight = getRawWeight(member.role) / totalRawWeight;
      let roleTotal = parseFloat((total * normWeight).toFixed(2));

      if (isLast) {
        roleTotal = parseFloat(Math.max(0, total - allocatedTotal).toFixed(2));
      } else {
        allocatedTotal += roleTotal;
      }

      const planHours = parseFloat((roleTotal * 0.20).toFixed(2));
      const respHours = parseFloat((roleTotal * 0.50).toFixed(2));
      const repHours = parseFloat(Math.max(0, roleTotal - planHours - respHours).toFixed(2));

      return {
        ...member,
        manualHours: {
          planning: planHours,
          riskResponse: respHours,
          reporting: repHours,
        }
      };
    });

    setTeamData(updated);
  };

  // Salin otomatis alokasi rencana ke alokasi aktual tim
  const handleCopyAutoToManual = () => {
    handleDistributeEffectiveHours();
  };

  const handleAddMember = () => {
    const newId = `tm-${Date.now()}`;
    const newCount = teamData.length + 1;
    const newMember: TeamMember = {
      id: newId,
      name: `Anggota Tim ${newCount}`,
      role: 'Anggota Tim',
      rate: 500000,
      autoHours: { planning: 0, riskResponse: 0, reporting: 0 },
      manualHours: { planning: 0, riskResponse: 0, reporting: 0 },
    };
    setTeamData(prev => [...prev, newMember]);
  };

  const handleUpdateName = (id: string, newName: string) => {
    setTeamData(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (teamData.length <= 1) {
      alert('Minimal harus ada 1 personil dalam tim perikatan.');
      return;
    }
    if (window.confirm(`Hapus "${name || 'personil ini'}" dari tim perikatan?`)) {
      setTeamData(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleUpdateManualHours = (id: string, phase: keyof PhaseHours, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTeamData(prev => prev.map(m => m.id === id ? {
      ...m,
      manualHours: { ...m.manualHours, [phase]: numValue }
    } : m));
  };

  const handleUpdateRole = (id: string, newRole: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      let defaultRate = m.rate;
      if (newRole === 'Partner') defaultRate = 2500000;
      else if (newRole === 'Manager') defaultRate = 1500000;
      else if (newRole === 'Supervisor') defaultRate = 1200000;
      else if (newRole === 'Ketua Tim') defaultRate = 800000;
      else if (newRole.includes('Pendukung')) defaultRate = 350000;
      else defaultRate = 500000;
      return { ...m, role: newRole, rate: defaultRate };
    }));
  };

  const handleUpdateRate = (id: string, value: number | string) => {
    const numValue = typeof value === 'number' ? value : parseNumberFromDots(value);
    setTeamData(prev => prev.map(m => m.id === id ? { ...m, rate: numValue } : m));
  };

  const handleUpdateTotalHours = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setTeamData(prev => prev.map(m => {
      if (m.id !== id) return m;
      return {
        ...m,
        manualHours: {
          planning: Math.round(num * 0.20 * 10) / 10,
          riskResponse: Math.round(num * 0.50 * 10) / 10,
          reporting: Math.round(num * 0.30 * 10) / 10,
        }
      };
    }));
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

  // Perhitungan dan status Sisa Jam Efektif (Total Jam Kerja Efektif Rencana - Total Alokasi Jam Aktual ke Tim)
  const remainingEffectiveHoursData = useMemo(() => {
    const totalEffective = timeCalc.totalEffectiveHours;
    const totalAllocated = totals.manualTotal.all;
    const remaining = parseFloat((totalEffective - totalAllocated).toFixed(2));
    
    let status: 'empty' | 'balanced' | 'remaining' | 'over' = 'empty';
    if (totalEffective <= 0) {
      status = 'empty';
    } else if (Math.abs(remaining) <= 0.05) {
      status = 'balanced';
    } else if (remaining > 0.05) {
      status = 'remaining';
    } else {
      status = 'over';
    }

    const allocatedPercentage = totalEffective > 0 
      ? Math.round((totalAllocated / totalEffective) * 100)
      : 0;

    return {
      totalEffective,
      totalAllocated,
      remaining,
      status,
      allocatedPercentage,
    };
  }, [timeCalc.totalEffectiveHours, totals.manualTotal.all]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: engagement.currency === 'USD' ? 'USD' : 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const handleSave = () => {
    updateEngagement(engagement.id, {
      worksheetA120: {
        startDate,
        endDate,
        startTime,
        endTime,
        restDuration,
        manualHolidays,
        autoHolidays: holidayDetails.autoHolidays,
        totalHolidays,
        teamData,
        rencanaBiayaLain,
        simpulanNotes,
      },
      startDate: startDate || engagement.startDate,
      targetDate: endDate || engagement.targetDate,
    } as any);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <CalendarDays className="mr-2 text-atlas-blue" size={20} /> 1. Rencana Jadwal Pelaksanaan
                </h2>

                {/* Badge Informasi Sisa Jam Efektif */}
                <div 
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all shadow-2xs ${
                    remainingEffectiveHoursData.status === 'balanced'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200'
                      : remainingEffectiveHoursData.status === 'remaining'
                      ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200'
                      : remainingEffectiveHoursData.status === 'over'
                      ? 'bg-rose-50 text-rose-900 border-rose-300 ring-1 ring-rose-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                  title={`Total Jam Efektif: ${remainingEffectiveHoursData.totalEffective.toFixed(1)} Jam | Alokasi Tim: ${remainingEffectiveHoursData.totalAllocated.toFixed(1)} Jam`}
                >
                  {remainingEffectiveHoursData.status === 'balanced' && <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />}
                  {remainingEffectiveHoursData.status === 'remaining' && <Clock size={13} className="text-amber-600 shrink-0" />}
                  {remainingEffectiveHoursData.status === 'over' && <AlertTriangle size={13} className="text-rose-600 shrink-0" />}
                  {remainingEffectiveHoursData.status === 'empty' && <Clock size={13} className="text-gray-400 shrink-0" />}
                  
                  <span>
                    Sisa Jam Efektif:{' '}
                    <strong className="font-mono">
                      {remainingEffectiveHoursData.status === 'over' 
                        ? `${remainingEffectiveHoursData.remaining.toFixed(1)}` 
                        : remainingEffectiveHoursData.remaining > 0 
                        ? `+${remainingEffectiveHoursData.remaining.toFixed(1)}` 
                        : '0'} Jam
                    </strong>
                  </span>

                  <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full ${
                    remainingEffectiveHoursData.status === 'balanced'
                      ? 'bg-emerald-200/70 text-emerald-900'
                      : remainingEffectiveHoursData.status === 'remaining'
                      ? 'bg-amber-200/70 text-amber-950'
                      : remainingEffectiveHoursData.status === 'over'
                      ? 'bg-rose-200/70 text-rose-950'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {remainingEffectiveHoursData.status === 'balanced' && 'Teralokasi Penuh'}
                    {remainingEffectiveHoursData.status === 'remaining' && `${remainingEffectiveHoursData.remaining.toFixed(1)} Jam Belum Dibagi`}
                    {remainingEffectiveHoursData.status === 'over' && 'Kelebihan Alokasi'}
                    {remainingEffectiveHoursData.status === 'empty' && 'Jadwal Kosong'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-0.5">
                Tentukan rentang tanggal perikatan untuk menghitung hari libur kalender dan jam kerja efektif secara otomatis.
              </p>
            </div>
            <button 
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-atlas-blue hover:bg-blue-800 rounded-lg transition-colors shadow-xs min-h-[38px]"
            >
              <Save size={15} />
              <span>Simpan Jadwal & Alokasi</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Form Input Baris 1: Tanggal & Waktu Kerja */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tgl Mulai Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue text-sm font-medium text-gray-800" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tgl Berakhir Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue text-sm font-medium text-gray-800" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Jam Mulai & Pulang
                  </label>
                  <span className="text-[11px] font-bold text-atlas-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {formatDisplayHourLabel(startTime)} s/d {formatDisplayHourLabel(endTime)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      className="w-full p-2.5 pl-8 border border-gray-300 rounded-lg outline-none focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue text-sm font-semibold text-gray-800" 
                      value={startTime} 
                      onChange={e => setStartTime(e.target.value)} 
                      onBlur={e => handleTimeBlur('start', e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleTimeBlur('start', e.currentTarget.value);
                      }}
                      placeholder="08:00" 
                      title="Format: 08:00 (misal 11:60 otomatis menjadi Jam 12)"
                    />
                    <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <span className="text-gray-400 font-bold">-</span>
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      className="w-full p-2.5 pl-8 border border-gray-300 rounded-lg outline-none focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue text-sm font-semibold text-gray-800" 
                      value={endTime} 
                      onChange={e => setEndTime(e.target.value)} 
                      onBlur={e => handleTimeBlur('end', e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleTimeBlur('end', e.currentTarget.value);
                      }}
                      placeholder="17:00" 
                      title="Format: 17:00 (misal 11:60 otomatis menjadi Jam 12)"
                    />
                    <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px] text-gray-500">
                  <span>Mulai: <strong className="text-gray-700 font-mono">{formatDisplayHourLabel(startTime) || '-'}</strong></span>
                  <span>Pulang: <strong className="text-gray-700 font-mono">{formatDisplayHourLabel(endTime) || '-'}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Lama Istirahat (Jam)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0" 
                    step="0.5" 
                    className="w-full p-2.5 pr-12 border border-gray-300 rounded-lg outline-none focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue text-sm font-medium text-gray-800" 
                    value={restDuration} 
                    onChange={e => setRestDuration(parseFloat(e.target.value) || 0)} 
                    placeholder="1" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">Jam</span>
                </div>
              </div>
            </div>

            {/* Panel Hari Libur (Otomatis & Manual) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
              
              {/* Box 1: Libur Otomatis */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarCheck2 size={15} className="text-blue-600" />
                    Hari Libur Otomatis
                  </span>
                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {holidayDetails.autoHolidays} Hari
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {startDate && endDate ? (
                    <>
                      Terdiri dari <strong className="text-gray-700">{holidayDetails.weekendDays} hari</strong> akhir pekan (Sabtu & Minggu)
                      {holidayDetails.publicHolidaysCount > 0 ? (
                        <> serta <strong className="text-emerald-700">{holidayDetails.publicHolidaysCount} hari libur nasional</strong>.</>
                      ) : (
                        <>. Tidak ada libur nasional hari kerja di periode ini.</>
                      )}
                    </>
                  ) : (
                    'Masukkan tanggal mulai & berakhir untuk kalkulasi libur otomatis.'
                  )}
                </p>
                {/* Rincian Libur Nasional */}
                {holidayDetails.holidayList.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1 max-h-24 overflow-y-auto">
                    {holidayDetails.holidayList.map((h, i) => (
                      <div key={i} className="text-[10px] text-gray-600 flex items-center justify-between">
                        <span className="truncate pr-1">• {h.name} {h.isWeekend && <span className="text-gray-400 italic">(akhir pekan)</span>}</span>
                        <span className="text-gray-400 font-mono shrink-0">{h.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Libur Manual */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="manual-holidays" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarX2 size={15} className="text-amber-600" />
                    Hari Libur Manual
                  </label>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Input Tambahan
                  </span>
                </div>
                <div className="relative mt-1">
                  <input 
                    id="manual-holidays"
                    type="number" 
                    min="0" 
                    step="1" 
                    className="w-full p-2 pr-12 border border-gray-300 rounded-lg outline-none focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue text-sm font-bold text-gray-800" 
                    value={manualHolidays} 
                    onChange={e => setManualHolidays(Math.max(0, parseInt(e.target.value, 10) || 0))} 
                    placeholder="0" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">Hari</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Masukkan jumlah hari libur manual/cuti bersama KAP jika ada.
                </p>
              </div>

              {/* Box 3: Total Hari Libur & Rekap Efektif */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Total Hari Libur</span>
                    <span className="text-sm font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      {totalHolidays} Hari Libur
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 space-y-1 mt-1.5">
                    <div className="flex justify-between">
                      <span>Total Hari Kalender:</span>
                      <strong className="text-gray-800">{holidayDetails.totalDays} Hari</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Pengurang Libur:</span>
                      <strong className="text-rose-600">- {totalHolidays} Hari ({holidayDetails.autoHolidays} otomatis + {manualHolidays} manual)</strong>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-800">Hari Kerja Efektif:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {timeCalc.totalDays} Hari Kerja
                  </span>
                </div>
              </div>

            </div>
          </div>
          
          <div className="px-6 pb-6">
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Jam Kerja Efektif/Hari</span>
                  <span className="text-lg font-bold text-gray-800">{timeCalc.effectiveHoursPerDay.toFixed(1)} Jam/Hari</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Total Hari Kalender</span>
                  <span className="text-lg font-bold text-gray-800">{holidayDetails.totalDays} Hari</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Total Hari Libur</span>
                  <span className="text-lg font-bold text-rose-700">{totalHolidays} Hari</span>
                </div>
                <div>
                  <span className="block text-xs text-emerald-700 uppercase font-bold mb-1">Hari Kerja Efektif</span>
                  <span className="text-lg font-bold text-emerald-800">{timeCalc.totalDays} Hari</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="text-left sm:text-right">
                  <span className="block text-xs text-atlas-blue uppercase font-bold mb-1">Total Jam Efektif</span>
                  <span className="text-2xl font-black text-atlas-blue">{timeCalc.totalEffectiveHours.toFixed(1)} Jam</span>
                </div>

                {/* Badge & Card Ringkasan Sisa Jam Efektif */}
                <div className={`p-3 rounded-xl border flex flex-col justify-center sm:items-end min-w-[210px] transition-all shadow-2xs ${
                  remainingEffectiveHoursData.status === 'balanced'
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : remainingEffectiveHoursData.status === 'remaining'
                    ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                    : remainingEffectiveHoursData.status === 'over'
                    ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {remainingEffectiveHoursData.status === 'balanced' && <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />}
                    {remainingEffectiveHoursData.status === 'remaining' && <Clock size={13} className="text-amber-600 shrink-0" />}
                    {remainingEffectiveHoursData.status === 'over' && <AlertTriangle size={13} className="text-rose-600 shrink-0" />}
                    {remainingEffectiveHoursData.status === 'empty' && <Clock size={13} className="text-gray-400 shrink-0" />}
                    <span className="text-[11px] font-bold uppercase tracking-wider">Badge Sisa Jam Efektif</span>
                  </div>
                  <div className="text-xl font-black font-mono">
                    {remainingEffectiveHoursData.status === 'over' 
                      ? `${remainingEffectiveHoursData.remaining.toFixed(1)} Jam`
                      : remainingEffectiveHoursData.remaining > 0 
                      ? `+${remainingEffectiveHoursData.remaining.toFixed(1)} Jam` 
                      : '0.0 Jam'}
                  </div>
                  <div className="text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="text-gray-600">Alokasi Tim: <strong>{remainingEffectiveHoursData.totalAllocated.toFixed(1)} Jam</strong></span>
                    <span className="text-gray-400">•</span>
                    <span className={`font-bold ${
                      remainingEffectiveHoursData.status === 'balanced' 
                        ? 'text-emerald-700' 
                        : remainingEffectiveHoursData.status === 'remaining' 
                        ? 'text-amber-700' 
                        : remainingEffectiveHoursData.status === 'over' 
                        ? 'text-rose-700' 
                        : 'text-gray-500'
                    }`}>
                      {remainingEffectiveHoursData.status === 'balanced' && '✓ Pas (100%)'}
                      {remainingEffectiveHoursData.status === 'remaining' && `(${remainingEffectiveHoursData.allocatedPercentage}% terbagi)`}
                      {remainingEffectiveHoursData.status === 'over' && `(${remainingEffectiveHoursData.allocatedPercentage}% over)`}
                      {remainingEffectiveHoursData.status === 'empty' && '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PENGGUNAAN JAM JASA PER TAHAPAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <BarChart3 className="mr-2 text-atlas-blue" size={20} /> 2. Rekap Jam Jasa per Tahapan
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Alokasi rencana jam jasa per tahapan dihitung dari Total Jam Efektif ({timeCalc.totalEffectiveHours.toFixed(1)} Jam) dengan proporsi Planning 20%, Risk Response 50%, dan Reporting 30%.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-atlas-blue bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs">
                Total Jam Efektif: {timeCalc.totalEffectiveHours.toFixed(1)} Jam
              </span>
              <button
                type="button"
                onClick={handleCopyAutoToManual}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shadow-2xs"
                title="Salin alokasi jam rencana ke alokasi aktual tim di Tabel 3"
              >
                <Copy size={13} />
                <span>Salin ke Aktual</span>
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tabel Rencana vs Realisasi Aktual */}
            <div className="lg:col-span-7 space-y-3">
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
                      <th className="py-2.5 px-3.5">Tahapan Audit</th>
                      <th className="py-2.5 px-3 text-center w-16">Bobot</th>
                      <th className="py-2.5 px-3 text-center bg-blue-50/60 text-atlas-blue font-bold">Rencana Efektif</th>
                      <th className="py-2.5 px-3 text-center bg-amber-50/60 text-amber-800 font-bold">Realisasi Aktual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3.5 text-gray-800 font-medium flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                        PraPerikatan & Risk Assessment
                      </td>
                      <td className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">20%</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-atlas-blue bg-blue-50/30">
                        {phaseAllocation.planning.toFixed(2)} jam
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-gray-700 bg-amber-50/20">
                        {totals.manualTotal.planning.toFixed(2)} jam
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3.5 text-gray-800 font-medium flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                        Risk Response
                      </td>
                      <td className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">50%</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-atlas-blue bg-blue-50/30">
                        {phaseAllocation.riskResponse.toFixed(2)} jam
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-gray-700 bg-amber-50/20">
                        {totals.manualTotal.riskResponse.toFixed(2)} jam
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3.5 text-gray-800 font-medium flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                        Reporting (Pelaporan)
                      </td>
                      <td className="py-2.5 px-3 text-center text-xs font-bold text-gray-500">30%</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-atlas-blue bg-blue-50/30">
                        {phaseAllocation.reporting.toFixed(2)} jam
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-gray-700 bg-amber-50/20">
                        {totals.manualTotal.reporting.toFixed(2)} jam
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-gray-200 font-bold">
                    <tr>
                      <td className="py-3 px-3.5 text-gray-900">Total Keseluruhan</td>
                      <td className="py-3 px-3 text-center text-xs text-gray-700">100%</td>
                      <td className="py-3 px-3 text-center font-mono text-sm text-atlas-blue bg-blue-100/50">
                        {phaseAllocation.total.toFixed(2)} jam
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-sm text-amber-900 bg-amber-100/50">
                        {totals.manualTotal.all.toFixed(2)} jam
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>* Nilai Total Keseluruhan ({phaseAllocation.total.toFixed(2)} jam) sama dengan Total Jam Efektif ({timeCalc.totalEffectiveHours.toFixed(1)} Jam).</span>
              </div>
            </div>

            {/* Visualisasi Distribusi Jam Efektif */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/80 border border-gray-200 rounded-xl p-4.5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Distribusi Rencana Jam Efektif
                  </span>
                  <span className="text-xs font-bold text-atlas-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    100% = {phaseAllocation.total.toFixed(1)} Jam
                  </span>
                </div>

                {phaseAllocation.total > 0 ? (
                  <div className="space-y-3">
                    <div className="flex h-8 w-full rounded-lg overflow-hidden shadow-inner border border-gray-200">
                      <div 
                        style={{ width: `${(phaseAllocation.planning / phaseAllocation.total) * 100}%` }} 
                        className="bg-amber-400 flex items-center justify-center text-xs text-amber-950 font-bold opacity-90 transition-all"
                        title={`Planning: ${phaseAllocation.planning.toFixed(2)} Jam (20%)`}
                      >
                        20%
                      </div>
                      <div 
                        style={{ width: `${(phaseAllocation.riskResponse / phaseAllocation.total) * 100}%` }} 
                        className="bg-blue-500 flex items-center justify-center text-xs text-white font-bold opacity-90 transition-all"
                        title={`Risk Response: ${phaseAllocation.riskResponse.toFixed(2)} Jam (50%)`}
                      >
                        50%
                      </div>
                      <div 
                        style={{ width: `${(phaseAllocation.reporting / phaseAllocation.total) * 100}%` }} 
                        className="bg-emerald-500 flex items-center justify-center text-xs text-white font-bold opacity-90 transition-all"
                        title={`Reporting: ${phaseAllocation.reporting.toFixed(2)} Jam (30%)`}
                      >
                        30%
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="bg-white p-2 rounded-lg border border-amber-100 shadow-2xs">
                        <span className="block font-bold text-amber-700">Planning</span>
                        <span className="font-mono text-[11px] text-gray-600 font-semibold">{phaseAllocation.planning.toFixed(1)} Jam</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                        <span className="block font-bold text-blue-700">Response</span>
                        <span className="font-mono text-[11px] text-gray-600 font-semibold">{phaseAllocation.riskResponse.toFixed(1)} Jam</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                        <span className="block font-bold text-emerald-700">Reporting</span>
                        <span className="font-mono text-[11px] text-gray-600 font-semibold">{phaseAllocation.reporting.toFixed(1)} Jam</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-24 w-full rounded-lg bg-gray-100 items-center justify-center text-xs text-gray-400 font-bold">
                    Masukkan jadwal pelaksanaan di Bagian 1 untuk menghitung jam efektif.
                  </div>
                )}
              </div>

              {/* Status Keselarasan Jam */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">Status Keselarasan Jam:</span>
                  {totals.manualTotal.all >= phaseAllocation.total && phaseAllocation.total > 0 ? (
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      ✓ Alokasi Aktual Lengkap ({totals.manualTotal.all.toFixed(1)} Jam)
                    </span>
                  ) : totals.manualTotal.all > 0 ? (
                    <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Alokasi Aktual: {totals.manualTotal.all.toFixed(1)} / {phaseAllocation.total.toFixed(1)} Jam
                    </span>
                  ) : (
                    <span className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      Rencana Siap ({phaseAllocation.total.toFixed(1)} Jam)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL ALOKASI PER TIM */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Users className="mr-2 text-atlas-blue" size={20} /> 3. Rencana Alokasi Jam Jasa per Tim
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Alokasikan jam kerja personil untuk setiap tahapan audit. Anda dapat menambah atau menyesuaikan personil tim sesuai kebutuhan perikatan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDistributeEffectiveHours}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors shadow-2xs"
                title="Bagi alokasi jam kerja efektif ke seluruh personil tim secara proporsional"
              >
                <Copy size={13} />
                <span>Distribusi Jam Efektif ({timeCalc.totalEffectiveHours.toFixed(1)} Jam)</span>
              </button>
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-lg transition-colors shadow-2xs"
              >
                <UserPlus size={14} />
                <span>Tambah Personil</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <th className="px-3 py-3 border-r border-gray-200 text-center w-12">No</th>
                  <th className="px-4 py-3 border-r border-gray-200 min-w-[200px]">Nama Personil</th>
                  <th className="px-3 py-3 border-r border-gray-200 w-44 text-center">Peran Tim</th>
                  <th className="px-3 py-3 border-r border-gray-200 text-center w-32 bg-amber-50/60 text-amber-900">
                    Planning (Jam)
                  </th>
                  <th className="px-3 py-3 border-r border-gray-200 text-center w-32 bg-amber-50/60 text-amber-900">
                    Risk Resp. (Jam)
                  </th>
                  <th className="px-3 py-3 border-r border-gray-200 text-center w-32 bg-amber-50/60 text-amber-900">
                    Reporting (Jam)
                  </th>
                  <th className="px-3 py-3 border-r border-gray-200 text-center w-28 bg-blue-50/70 text-atlas-blue font-bold">
                    Total Jam
                  </th>
                  <th className="px-2 py-3 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamData.map((member, idx) => {
                  const memberTotalHours = (member.manualHours?.planning || 0) + (member.manualHours?.riskResponse || 0) + (member.manualHours?.reporting || 0);
                  return (
                    <tr key={member.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-3 py-2.5 text-center border-r border-gray-100 text-gray-500 font-medium text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-100">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleUpdateName(member.id, e.target.value)}
                          placeholder="Nama Personil..."
                          className="w-full px-2.5 py-1.5 border border-gray-200 hover:border-gray-300 focus:border-atlas-blue rounded-md text-sm font-semibold text-gray-800 outline-none transition-colors"
                        />
                      </td>
                      <td className="px-3 py-2 border-r border-gray-100">
                        <select 
                          className="w-full text-center border border-gray-200 hover:border-gray-300 focus:border-atlas-blue rounded-md text-xs font-semibold text-gray-700 outline-none p-1.5 bg-white cursor-pointer"
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        >
                          <option value="Partner">Partner</option>
                          <option value="Manager">Manager</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Ketua Tim">Ketua Tim</option>
                          <option value="Anggota Tim">Anggota Tim</option>
                          <option value="Tenaga Pendukung">Tenaga Pendukung</option>
                        </select>
                      </td>

                      {/* Manual Hour Inputs */}
                      <td className="px-2 py-2 border-r border-gray-100 bg-amber-50/20">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.5" 
                          className="w-full p-1.5 border border-amber-200 hover:border-amber-300 focus:border-amber-500 rounded text-center text-sm font-bold text-gray-800 outline-none transition-colors" 
                          value={member.manualHours.planning || ''} 
                          onChange={(e) => handleUpdateManualHours(member.id, 'planning', e.target.value)} 
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-gray-100 bg-amber-50/20">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.5" 
                          className="w-full p-1.5 border border-amber-200 hover:border-amber-300 focus:border-amber-500 rounded text-center text-sm font-bold text-gray-800 outline-none transition-colors" 
                          value={member.manualHours.riskResponse || ''} 
                          onChange={(e) => handleUpdateManualHours(member.id, 'riskResponse', e.target.value)} 
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-gray-100 bg-amber-50/20">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.5" 
                          className="w-full p-1.5 border border-amber-200 hover:border-amber-300 focus:border-amber-500 rounded text-center text-sm font-bold text-gray-800 outline-none transition-colors" 
                          value={member.manualHours.reporting || ''} 
                          onChange={(e) => handleUpdateManualHours(member.id, 'reporting', e.target.value)} 
                          placeholder="0"
                        />
                      </td>

                      {/* Total Hours Column */}
                      <td className="px-3 py-2.5 border-r border-gray-100 text-center font-mono font-bold text-atlas-blue bg-blue-50/40 text-sm">
                        {memberTotalHours.toFixed(2)}
                      </td>

                      {/* Action Column */}
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          disabled={teamData.length <= 1}
                          title={teamData.length <= 1 ? 'Minimal 1 personil tim' : `Hapus ${member.name}`}
                          className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                            teamData.length <= 1 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-gray-200">
                <tr className="font-bold text-xs text-gray-800">
                  <td colSpan={3} className="px-4 py-3 text-right border-r border-gray-200 uppercase tracking-wider text-gray-700">
                    Total Alokasi Jam Jasa Tim
                  </td>
                  <td className="px-2 py-3 text-center font-mono font-bold text-amber-900 border-r border-gray-200 bg-amber-50/50">
                    {totals.manualTotal.planning.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-center font-mono font-bold text-amber-900 border-r border-gray-200 bg-amber-50/50">
                    {totals.manualTotal.riskResponse.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-center font-mono font-bold text-amber-900 border-r border-gray-200 bg-amber-50/50">
                    {totals.manualTotal.reporting.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-center font-mono font-black text-sm text-atlas-blue border-r border-gray-200 bg-blue-100/60">
                    {totals.manualTotal.all.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-center text-gray-400">-</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Tombol Tambah Baris Personil & Catatan */}
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-atlas-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
            >
              <Plus size={15} />
              <span>Tambah Baris Personil</span>
            </button>
            <span className="text-xs text-gray-500">
              💡 Tarif per jam dan kalkulasi anggaran biaya tim akan otomatis dihitung pada <strong>Bagian 4. Kalkulasi Anggaran Biaya</strong> di bawah.
            </span>
          </div>
        </div>

        {/* KALKULASI ANGGARAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Calculator className="mr-2 text-atlas-blue" size={20} /> 4. Kalkulasi Anggaran Biaya
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Hitung alokasi biaya personil tim berdasarkan tarif per jam serta estimasi biaya operasional perikatan (OPE).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/fee-calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-atlas-blue bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shadow-2xs"
                title="Buka modul kalkulator fee audit lengkap dengan simulasi IAPI & proposal formal"
              >
                <ExternalLink size={13} />
                <span>Buka Kalkulator Fee Audit</span>
              </a>
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-lg transition-colors shadow-2xs"
              >
                <UserPlus size={14} />
                <span>Tambah Personil</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <th className="px-3 py-3 border-r border-gray-200 text-center w-12">No</th>
                    <th className="px-4 py-3 border-r border-gray-200 min-w-[200px]">Nama Personil</th>
                    <th className="px-3 py-3 border-r border-gray-200 w-44 text-center">Peran Tim</th>
                    <th className="px-3 py-3 border-r border-gray-200 w-36 text-center bg-blue-50/60 text-atlas-blue">Total Jam (Aktual)</th>
                    <th className="px-4 py-3 border-r border-gray-200 w-52">Tarif per Jam</th>
                    <th className="px-4 py-3 border-r border-gray-200 text-right">Total Biaya Personil</th>
                    <th className="px-2 py-3 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {teamData.map((member, idx) => {
                    const totalHours = (member.manualHours?.planning || 0) + (member.manualHours?.riskResponse || 0) + (member.manualHours?.reporting || 0);
                    return (
                      <tr key={member.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-3 py-2.5 text-center border-r border-gray-100 text-gray-500 font-medium text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-100">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleUpdateName(member.id, e.target.value)}
                            placeholder="Nama Personil..."
                            className="w-full px-2.5 py-1.5 border border-gray-200 hover:border-gray-300 focus:border-atlas-blue rounded-md text-sm font-semibold text-gray-800 outline-none transition-colors"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-gray-100">
                          <select 
                            className="w-full text-center border border-gray-200 hover:border-gray-300 focus:border-atlas-blue rounded-md text-xs font-semibold text-gray-700 outline-none p-1.5 bg-white cursor-pointer"
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          >
                            <option value="Partner">Partner</option>
                            <option value="Manager">Manager</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Ketua Tim">Ketua Tim</option>
                            <option value="Anggota Tim">Anggota Tim</option>
                            <option value="Tenaga Pendukung">Tenaga Pendukung</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-100 text-center bg-blue-50/30">
                          <input 
                            type="number"
                            min="0"
                            step="0.5"
                            value={totalHours || ''}
                            onChange={(e) => handleUpdateTotalHours(member.id, e.target.value)}
                            placeholder="0"
                            title="Total jam kerja tim (otomatis menyelaraskan tahapan audit pada Bagian 3)"
                            className="w-24 p-1.5 border border-blue-200 hover:border-blue-300 focus:border-atlas-blue rounded text-center font-mono font-bold text-gray-800 text-sm outline-none transition-colors"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-gray-100">
                          <div className="relative">
                            <MoneyInput 
                              value={member.rate}
                              onChange={(val) => handleUpdateRate(member.id, val)}
                              placeholder="0"
                              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 hover:border-gray-300 rounded-md text-sm focus:border-atlas-blue outline-none font-bold text-gray-700 transition-colors font-mono"
                              title="Tarif per jam personil (Rp)"
                            />
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">Rp</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-gray-800 border-r border-gray-100">
                          {formatCurrency(totalHours * member.rate)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            disabled={teamData.length <= 1}
                            title={teamData.length <= 1 ? 'Minimal 1 personil tim' : `Hapus ${member.name}`}
                            className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                              teamData.length <= 1 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-gray-200">
                  <tr className="font-bold text-xs text-gray-800">
                    <td colSpan={3} className="px-4 py-3 text-right border-r border-gray-200 uppercase tracking-wider text-gray-700">
                      Total Biaya Personil Tim (A)
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-atlas-blue border-r border-gray-200 bg-blue-100/50">
                      {totals.manualTotal.all.toFixed(2)} Jam
                    </td>
                    <td className="px-3 py-3 text-center border-r border-gray-200 text-gray-400">-</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-sm text-emerald-800 border-r border-gray-200 bg-emerald-50/50">
                      {formatCurrency(totals.fee)}
                    </td>
                    <td className="px-2 py-3 text-center text-gray-400">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Tombol Tambah Baris Personil pada Bagian 4 */}
            <div className="mb-6 p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-wrap justify-between items-center gap-3">
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-atlas-blue bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shadow-2xs"
              >
                <Plus size={15} />
                <span>Tambah Baris Personil</span>
              </button>
              <span className="text-xs text-gray-500">
                💡 Penambahan personil dan jam kerja akan otomatis terintegrasi dengan <strong>Bagian 3. Rencana Alokasi Jam Jasa per Tim</strong>.
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6 border-t border-gray-100 pt-6">
              <div className="md:w-1/2 bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Biaya Lain-Lain (OPE) (B)</h3>
                <div className="relative mt-2">
                  <MoneyInput 
                    value={rencanaBiayaLain}
                    onChange={(val) => setRencanaBiayaLain(val)}
                    placeholder="0"
                    className="w-full pl-11 pr-3 py-3 border border-gray-300 rounded-xl font-bold text-gray-800 focus:border-atlas-blue focus:ring-atlas-blue outline-none font-mono"
                    title="Estimasi biaya operasional perikatan / OPE (Rp)"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">Rp</span>
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
                {(totals.manualTotal.all >= phaseAllocation.total && phaseAllocation.total > 0) ? (
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-4 py-2 rounded-lg text-sm text-center">
                    Alokasi jam kerja memadai
                  </div>
                ) : (
                  <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 font-bold px-4 py-2 rounded-lg text-sm text-center">
                    Alokasi jam kerja belum memadai
                  </div>
                )}
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Jelaskan bagaimana rencana proses pemantauan atas perikatan tersebut
                </label>
                <textarea 
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 text-gray-800 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none min-h-[90px] shadow-2xs text-sm"
                  value={simpulanNotes}
                  onChange={e => setSimpulanNotes(e.target.value)}
                  placeholder="Isi penjelasan rencana pemantauan alokasi jam kerja tim audit disini..."
                ></textarea>
              </div>

            </div>

            <div className="mt-6 border-t border-gray-100 pt-6 flex items-center gap-4">
              <div className="text-sm font-bold text-gray-700">Status KKP</div>
              {(totals.manualTotal.all >= phaseAllocation.total && phaseAllocation.total > 0) ? (
                <div className="bg-emerald-50 border border-emerald-400 text-emerald-700 font-black px-4 py-1.5 rounded-lg text-sm uppercase shadow-2xs">
                  Completed
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-400 text-amber-800 font-black px-4 py-1.5 rounded-lg text-sm uppercase shadow-2xs">
                  Incompleted
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Toast Feedback Sukses */}
      {isSaved && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>Jadwal pelaksanaan dan alokasi hari libur berhasil disimpan.</span>
        </div>
      )}
    </WorksheetContainer>
  );
};

export default A120;
