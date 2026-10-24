import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Printer, 
  Clock, 
  CheckCircle2, 
  Info, 
  AlertCircle, 
  Filter, 
  Calculator, 
  ListFilter, 
  FileText,
  CalendarCheck,
  CalendarDays,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';
import { 
  OFFICIAL_HOLIDAYS, 
  MONTH_NAMES_ID, 
  DAY_NAMES_ID, 
  getAllHolidays, 
  calculateAuditWorkingDays 
} from '../constants/holidaysData';

export type HolidayType = 'national' | 'joint_leave' | 'kap_custom';

export interface HolidayItem {
  id: string;
  date: string;
  name: string;
  type: HolidayType;
  description?: string;
  isCustom?: boolean;
}

export interface WorkingDaysCalculationResult {
  startDate: string;
  endDate: string;
  workDaysPerWeek: 5 | 6;
  hoursPerDay: number;
  totalCalendarDays: number;
  weekendDays: number;
  nationalHolidaysCount: number;
  jointLeaveCount: number;
  kapCustomCount: number;
  effectiveWorkingDays: number;
  effectiveWorkingHours: number;
  holidayDetails: {
    date: string;
    dayName: string;
    name: string;
    type: HolidayType;
    isWeekend: boolean;
  }[];
}

const STORAGE_KEY = 'kap_custom_holidays_v1';

const KalenderNasional: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'calculator' | 'list'>('calendar');

  // Custom KAP Holidays stored in localStorage
  const [customHolidays, setCustomHolidays] = useState<HolidayItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading custom holidays', e);
    }
    // Default initial KAP agendas
    return [
      {
        id: 'kap-2026-06-26',
        date: '2026-06-26',
        name: 'Workshop & PPL Tahunan IAPI - Standar Audit Terbaru',
        type: 'kap_custom',
        description: 'Pelatihan profesi berkelanjutan seluruh staf auditor KAP',
        isCustom: true
      },
      {
        id: 'kap-2026-12-31',
        date: '2026-12-31',
        name: 'Tutup Buku Operasional Kantor KAP & Persiapan Stock Opname',
        type: 'kap_custom',
        description: 'Libur kantor operasional internal KAP',
        isCustom: true
      }
    ];
  });

  // Save custom holidays to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customHolidays));
    } catch (e) {
      console.error('Error saving custom holidays', e);
    }
  }, [customHolidays]);

  // Combined holiday list
  const allHolidays = useMemo(() => {
    return getAllHolidays(customHolidays);
  }, [customHolidays]);

  // Modal State for adding custom KAP holiday
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayType, setNewHolidayType] = useState<HolidayType>('kap_custom');
  const [newHolidayDesc, setNewHolidayDesc] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddCustomHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName.trim()) {
      alert('Mohon isi tanggal dan nama agenda/hari libur.');
      return;
    }

    const item: HolidayItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: newHolidayDate,
      name: newHolidayName.trim(),
      type: newHolidayType,
      description: newHolidayDesc.trim() || undefined,
      isCustom: true
    };

    setCustomHolidays(prev => [...prev, item]);
    setIsAddModalOpen(false);
    setNewHolidayDate('');
    setNewHolidayName('');
    setNewHolidayDesc('');
    showToast(`Agenda "${item.name}" berhasil ditambahkan ke kalender.`);
  };

  const handleDeleteCustomHoliday = (id: string, name: string) => {
    if (window.confirm(`Hapus agenda kustom "${name}" dari kalender?`)) {
      setCustomHolidays(prev => prev.filter(h => h.id !== id));
      showToast(`Agenda "${name}" berhasil dihapus.`);
    }
  };

  // ─── Calculator State ────────────────────────────────────────────────
  const [calcStart, setCalcStart] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
  });
  const [calcEnd, setCalcEnd] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-28`;
  });
  const [calcWorkDays, setCalcWorkDays] = useState<5 | 6>(5);
  const [calcHoursPerDay, setCalcHoursPerDay] = useState<number>(8);

  const calcResult: WorkingDaysCalculationResult = useMemo(() => {
    return calculateAuditWorkingDays(calcStart, calcEnd, calcWorkDays, calcHoursPerDay, allHolidays);
  }, [calcStart, calcEnd, calcWorkDays, calcHoursPerDay, allHolidays]);

  // ─── List / Table Filter State ──────────────────────────────────────
  const [tableSearch, setTableSearch] = useState('');
  const [tableTypeFilter, setTableTypeFilter] = useState<string>('all');
  const [tableYearFilter, setTableYearFilter] = useState<number>(currentYear);

  const filteredHolidaysForTable = useMemo(() => {
    return allHolidays.filter(h => {
      const holidayYear = parseInt(h.date.split('-')[0], 10);
      if (tableYearFilter !== 0 && holidayYear !== tableYearFilter) return false;
      if (tableTypeFilter !== 'all' && h.type !== tableTypeFilter) return false;
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase();
        return h.name.toLowerCase().includes(query) || h.date.includes(query) || (h.description && h.description.toLowerCase().includes(query));
      }
      return true;
    });
  }, [allHolidays, tableYearFilter, tableTypeFilter, tableSearch]);

  // ─── Calendar Month Generation ──────────────────────────────────────
  // Returns grid cells for the current month view (Monday to Sunday)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // In JS, getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
    // We want Monday = 0, Tuesday = 1 ... Sunday = 6
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const cells: {
      date: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSunday: boolean;
      isSaturday: boolean;
      holiday?: HolidayItem;
    }[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, d);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayStr}`;
      const holiday = allHolidays.find(h => h.date === dateStr);
      const dayOfWeek = prevDate.getDay();

      cells.push({
        date: prevDate,
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
        holiday
      });
    }

    // Current month days
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(currentYear, currentMonth, d);
      const m = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${m}-${dayStr}`;
      const holiday = allHolidays.find(h => h.date === dateStr);
      const dayOfWeek = curDate.getDay();

      cells.push({
        date: curDate,
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
        holiday
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(i).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayStr}`;
      const holiday = allHolidays.find(h => h.date === dateStr);
      const dayOfWeek = nextDate.getDay();

      cells.push({
        date: nextDate,
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
        holiday
      });
    }

    return cells;
  }, [currentYear, currentMonth, allHolidays]);

  // Statistics for the selected month
  const monthStats = useMemo(() => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const prefix = `${currentYear}-${mStr}`;
    const holidaysInMonth = allHolidays.filter(h => h.date.startsWith(prefix));

    const nationalCount = holidaysInMonth.filter(h => h.type === 'national').length;
    const jointLeaveCount = holidaysInMonth.filter(h => h.type === 'joint_leave').length;
    const kapCustomCount = holidaysInMonth.filter(h => h.type === 'kap_custom').length;

    // Calculate effective working days in this month
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startStr = `${prefix}-01`;
    const endStr = `${prefix}-${String(lastDay).padStart(2, '0')}`;
    const calc = calculateAuditWorkingDays(startStr, endStr, 5, 8, allHolidays);

    return {
      nationalCount,
      jointLeaveCount,
      kapCustomCount,
      totalHolidays: holidaysInMonth.length,
      workingDays5: calc.effectiveWorkingDays,
      workingHours5: calc.effectiveWorkingHours,
      holidaysInMonth
    };
  }, [currentYear, currentMonth, allHolidays]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setSelectedDateStr(`${today.getFullYear()}-${m}-${d}`);
  };

  const selectedDateHoliday = useMemo(() => {
    if (!selectedDateStr) return null;
    return allHolidays.find(h => h.date === selectedDateStr);
  }, [selectedDateStr, allHolidays]);

  const getHolidayBadge = (type: HolidayType) => {
    switch (type) {
      case 'national':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Libur Nasional
          </span>
        );
      case 'joint_leave':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Cuti Bersama
          </span>
        );
      case 'kap_custom':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            Agenda Khusus KAP
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page Header ── */}
      <div className="pb-5 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-atlas-blue border border-blue-200">
              Modul Perencanaan Umum KAP
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200">
              Tidak Terhubung Perikatan
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="text-atlas-blue" size={26} />
            <span>Kalender Libur Nasional & Jadwal Kerja KAP</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Pedoman hari libur nasional & cuti bersama resmi Pemerintah RI (SKB 3 Menteri) sebagai patokan tim audit dalam menentukan jadwal fieldwork, penarikan sampel, deadline pelaporan, dan alokasi hari kerja efektif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-lg transition-colors shadow-2xs cursor-pointer min-h-[38px]"
          >
            <Plus size={15} />
            <span>Tambah Libur / Agenda KAP</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors cursor-pointer min-h-[38px]"
            title="Cetak Kalender"
          >
            <Printer size={15} />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-1 -mb-px">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'calendar'
                ? 'border-atlas-blue text-atlas-blue'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <CalendarIcon size={16} />
            <span>Tampilan Kalender (Grid)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'calculator'
                ? 'border-atlas-blue text-atlas-blue'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Calculator size={16} />
            <span>Kalkulator Hari Kerja Efektif Audit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'border-atlas-blue text-atlas-blue'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <ListFilter size={16} />
            <span>Daftar Hari Libur Tahunan ({allHolidays.filter(h => h.date.startsWith(String(currentYear))).length})</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-400 font-medium hidden sm:block">
          SKB 3 Menteri: Menag, Menaker, MenPAN-RB
        </div>
      </div>

      {/* ── TAB 1: CALENDAR VIEW ── */}
      {activeTab === 'calendar' && (
        <div className="space-y-5">
          {/* Calendar Toolbar & Selectors */}
          <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Month & Year Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Bulan sebelumnya"
                className="p-2 text-gray-600 hover:text-atlas-blue hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                  aria-label="Pilih Bulan"
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                >
                  {MONTH_NAMES_ID.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>

                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                  aria-label="Pilih Tahun"
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none font-mono"
                >
                  {[2024, 2025, 2026, 2027].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Bulan berikutnya"
                className="p-2 text-gray-600 hover:text-atlas-blue hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={handleJumpToToday}
                className="ml-2 px-3 py-1.5 text-xs font-semibold text-atlas-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                Hari Ini
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                <span className="text-gray-700">Libur Nasional</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-gray-700">Cuti Bersama</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0"></span>
                <span className="text-gray-700">Agenda KAP</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-500 shrink-0"></span>
                <span className="text-gray-700">Hari Ini</span>
              </span>
            </div>
          </div>

          {/* Monthly Audit Statistics Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Hari Kerja Efektif
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-gray-900">{monthStats.workingDays5}</span>
                <span className="text-xs text-gray-500">Hari (5 hari/mgg)</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Setara ~{monthStats.workingHours5} jam kerja audit</p>
            </div>

            <div className="p-3.5 bg-rose-50/50 border border-rose-200/70 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block mb-1">
                Libur Nasional
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-rose-700">{monthStats.nationalCount}</span>
                <span className="text-xs text-rose-600">Hari libur resmi</span>
              </div>
              <p className="text-[11px] text-rose-500 mt-0.5">Ditetapkan pemerintah</p>
            </div>

            <div className="p-3.5 bg-amber-50/50 border border-amber-200/70 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mb-1">
                Cuti Bersama
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-700">{monthStats.jointLeaveCount}</span>
                <span className="text-xs text-amber-600">Hari cuti bersama</span>
              </div>
              <p className="text-[11px] text-amber-500 mt-0.5">Surat Keputusan Bersama</p>
            </div>

            <div className="p-3.5 bg-indigo-50/50 border border-indigo-200/70 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block mb-1">
                Agenda Internal KAP
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-indigo-700">{monthStats.kapCustomCount}</span>
                <span className="text-xs text-indigo-600">Agenda / Workshop</span>
              </div>
              <p className="text-[11px] text-indigo-500 mt-0.5">Kustomisasi internal KAP</p>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center font-bold text-xs uppercase tracking-wider">
              {DAY_NAMES_ID.map((dName, idx) => (
                <div 
                  key={idx} 
                  className={`py-3 px-1 border-r border-gray-200 last:border-r-0 ${
                    idx === 5 ? 'text-gray-600 bg-slate-100/60' : 
                    idx === 6 ? 'text-rose-600 bg-rose-50/40' : 'text-gray-700'
                  }`}
                >
                  <span className="hidden md:inline">{dName}</span>
                  <span className="md:hidden">{dName.slice(0, 3)}</span>
                </div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-gray-200 bg-gray-200/60">
              {calendarCells.map((cell, idx) => {
                const isSelected = selectedDateStr === cell.dateStr;
                const hasHoliday = Boolean(cell.holiday);
                const isSunday = cell.isSunday;
                const isSaturday = cell.isSaturday;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`min-h-[96px] sm:min-h-[115px] p-2 flex flex-col justify-between transition-all cursor-pointer relative group ${
                      !cell.isCurrentMonth
                        ? 'bg-gray-50 text-gray-300'
                        : isSunday
                        ? 'bg-rose-50/20'
                        : isSaturday
                        ? 'bg-slate-50/40'
                        : 'bg-white'
                    } ${
                      isSelected ? 'ring-2 ring-atlas-blue z-10 bg-blue-50/30' : 'hover:bg-blue-50/20'
                    }`}
                  >
                    {/* Top Row: Date Number and Flags */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                          cell.isToday
                            ? 'bg-atlas-blue text-white shadow-xs font-black'
                            : hasHoliday && cell.holiday?.type === 'national'
                            ? 'text-rose-600 font-black'
                            : hasHoliday && cell.holiday?.type === 'joint_leave'
                            ? 'text-amber-600 font-black'
                            : isSunday
                            ? 'text-rose-600 font-bold'
                            : isSaturday
                            ? 'text-gray-600 font-semibold'
                            : cell.isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Small Type Indicator Pill */}
                      {hasHoliday && (
                        <span 
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            cell.holiday?.type === 'national' ? 'bg-rose-500' :
                            cell.holiday?.type === 'joint_leave' ? 'bg-amber-500' :
                            'bg-indigo-500'
                          }`}
                          title={cell.holiday?.name}
                        />
                      )}
                    </div>

                    {/* Holiday Event Badge / Name */}
                    {hasHoliday && cell.isCurrentMonth && (
                      <div className="mt-1">
                        <div
                          className={`p-1 sm:p-1.5 rounded text-[10px] leading-tight font-semibold line-clamp-2 shadow-2xs border ${
                            cell.holiday?.type === 'national'
                              ? 'bg-rose-100/90 text-rose-900 border-rose-300'
                              : cell.holiday?.type === 'joint_leave'
                              ? 'bg-amber-100/90 text-amber-900 border-amber-300'
                              : 'bg-indigo-100/90 text-indigo-900 border-indigo-300'
                          }`}
                          title={`${cell.holiday?.name} (${cell.holiday?.type})`}
                        >
                          {cell.holiday?.name}
                        </div>
                      </div>
                    )}

                    {/* Today indicator label */}
                    {cell.isToday && (
                      <span className="text-[9px] font-bold text-atlas-blue uppercase tracking-wider">
                        Hari Ini
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Inspector Card */}
          {selectedDateStr && (
            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-atlas-blue flex items-center justify-center shrink-0">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 font-mono">
                      {selectedDateStr}
                    </h3>
                    {selectedDateHoliday ? (
                      getHolidayBadge(selectedDateHoliday.type)
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Hari Kerja Biasa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedDateHoliday ? (
                      <>
                        <strong>{selectedDateHoliday.name}</strong>
                        {selectedDateHoliday.description && <span> — {selectedDateHoliday.description}</span>}
                      </>
                    ) : (
                      'Hari kerja efektif standar (dapat dialokasikan untuk prosedur audit lapangan, wawancara, atau pengujian substantif).'
                    )}
                  </p>
                </div>
              </div>

              {selectedDateHoliday?.isCustom && (
                <button
                  type="button"
                  onClick={() => handleDeleteCustomHoliday(selectedDateHoliday.id, selectedDateHoliday.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors self-end md:self-auto"
                >
                  <Trash2 size={13} />
                  <span>Hapus Agenda KAP</span>
                </button>
              )}
            </div>
          )}

          {/* Monthly Holidays List Callout */}
          {monthStats.holidaysInMonth.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Info size={14} className="text-atlas-blue" />
                <span>Daftar Hari Libur Bulan {MONTH_NAMES_ID[currentMonth]} {currentYear}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {monthStats.holidaysInMonth.map(h => (
                  <div key={h.id} className="p-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-mono text-[11px] font-bold text-gray-500 mb-0.5">{h.date}</div>
                      <div className="font-semibold text-gray-900 truncate" title={h.name}>{h.name}</div>
                    </div>
                    {getHolidayBadge(h.type)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CALCULATOR (AUDIT WORKING DAYS ESTIMATOR) ── */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
              <Calculator size={18} className="text-atlas-blue" />
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                  Kalkulator Estimasi Hari Kerja Efektif Penugasan Audit
                </h2>
                <p className="text-xs text-gray-500">
                  Hitung secara presisi jumlah hari kerja efektif, jam kerja audit yang tersedia, serta daftar hari libur yang terlewati dalam rentang periode audit.
                </p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Tanggal Mulai Penugasan
                </label>
                <input
                  type="date"
                  value={calcStart}
                  onChange={(e) => setCalcStart(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Target Selesai / Laporan
                </label>
                <input
                  type="date"
                  value={calcEnd}
                  onChange={(e) => setCalcEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Basis Hari Kerja Mingguan
                </label>
                <select
                  value={calcWorkDays}
                  onChange={(e) => setCalcWorkDays(parseInt(e.target.value, 10) as 5 | 6)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                >
                  <option value={5}>5 Hari Kerja (Senin - Jumat)</option>
                  <option value={6}>6 Hari Kerja (Senin - Sabtu)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Jam Kerja Standar per Hari
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={calcHoursPerDay}
                    onChange={(e) => setCalcHoursPerDay(Number(e.target.value) || 8)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none font-mono"
                  />
                  <span className="text-xs text-gray-500 shrink-0 font-medium">Jam/Hari</span>
                </div>
              </div>
            </div>

            {/* Calculation Results Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-gray-100">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
                  Total Kalender
                </span>
                <span className="text-xl font-black text-gray-900">{calcResult.totalCalendarDays}</span>
                <span className="text-[10px] text-gray-500 block">Hari Kalender</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
                  Akhir Pekan
                </span>
                <span className="text-xl font-black text-gray-700">{calcResult.weekendDays}</span>
                <span className="text-[10px] text-gray-500 block">Sabtu/Minggu</span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block mb-0.5">
                  Libur Nasional
                </span>
                <span className="text-xl font-black text-rose-700">{calcResult.nationalHolidaysCount}</span>
                <span className="text-[10px] text-rose-600 block">Hari Libur Kerja</span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mb-0.5">
                  Cuti Bersama
                </span>
                <span className="text-xl font-black text-amber-700">{calcResult.jointLeaveCount}</span>
                <span className="text-[10px] text-amber-600 block">Hari Cuti</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-center shadow-xs">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-0.5">
                  Hari Kerja Efektif
                </span>
                <span className="text-2xl font-black text-emerald-700">{calcResult.effectiveWorkingDays}</span>
                <span className="text-[10px] font-bold text-emerald-800 block">Hari Kerja Bersih</span>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-center shadow-xs">
                <span className="text-[10px] font-black text-atlas-blue uppercase tracking-widest block mb-0.5">
                  Total Jam Kerja
                </span>
                <span className="text-2xl font-black text-atlas-blue">{calcResult.effectiveWorkingHours}</span>
                <span className="text-[10px] font-bold text-atlas-blue block">Audit Man-Hours</span>
              </div>
            </div>
          </div>

          {/* List of Holidays in this Calculation Range */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={15} className="text-atlas-blue" />
                <span>Rincian Hari Libur Dalam Rentang Penugasan ({calcResult.holidayDetails.length} Hari)</span>
              </h3>
              <span className="text-[11px] text-gray-500">
                {calcStart} s/d {calcEnd}
              </span>
            </div>

            {calcResult.holidayDetails.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Tidak ada hari libur nasional atau cuti bersama</p>
                <p className="text-gray-400 mt-0.5">Semua hari kerja dalam rentang waktu ini beroperasi secara penuh.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">No</th>
                      <th className="py-2.5 px-4 w-32">Tanggal</th>
                      <th className="py-2.5 px-4 w-28">Hari</th>
                      <th className="py-2.5 px-4">Nama Hari Libur / Peristiwa</th>
                      <th className="py-2.5 px-4 w-40">Kategori</th>
                      <th className="py-2.5 px-4 w-44">Status Pengurangan Hari</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {calcResult.holidayDetails.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 text-center font-mono text-gray-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-gray-900">
                          {item.date}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-gray-700">
                          {item.dayName}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-gray-900">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-4">
                          {getHolidayBadge(item.type)}
                        </td>
                        <td className="py-2.5 px-4">
                          {item.isWeekend ? (
                            <span className="text-[11px] text-gray-400 italic">
                              Jatuh pada akhir pekan (tidak memotong hari kerja)
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-600">
                              -1 Hari Kerja Efektif
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: TABLE / LIST VIEW ── */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={tableYearFilter}
                onChange={(e) => setTableYearFilter(parseInt(e.target.value, 10))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none font-mono"
              >
                <option value={0}>Semua Tahun</option>
                <option value={2024}>Tahun 2024</option>
                <option value={2025}>Tahun 2025</option>
                <option value={2026}>Tahun 2026</option>
                <option value={2027}>Tahun 2027</option>
              </select>

              <select
                value={tableTypeFilter}
                onChange={(e) => setTableTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
              >
                <option value="all">Semua Kategori</option>
                <option value="national">Hanya Libur Nasional</option>
                <option value="joint_leave">Hanya Cuti Bersama</option>
                <option value="kap_custom">Hanya Agenda Khusus KAP</option>
              </select>
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari hari libur..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
              />
              {tableSearch && (
                <button
                  type="button"
                  onClick={() => setTableSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Holiday Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-32">Tanggal</th>
                    <th className="py-3 px-4 w-28">Hari</th>
                    <th className="py-3 px-4">Nama Hari Libur / Agenda KAP</th>
                    <th className="py-3 px-4 w-40">Kategori</th>
                    <th className="py-3 px-4 w-48">Dasar Keputusan / Catatan</th>
                    <th className="py-3 px-4 w-20 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHolidaysForTable.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        Tidak ada hari libur yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredHolidaysForTable.map((h, idx) => {
                      const d = new Date(h.date);
                      const dayIndex = (d.getDay() + 6) % 7;
                      const dayName = DAY_NAMES_ID[dayIndex];

                      return (
                        <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-gray-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-gray-900">
                            {h.date}
                          </td>
                          <td className={`py-3 px-4 font-semibold ${
                            dayIndex === 6 ? 'text-rose-600' : 
                            dayIndex === 5 ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                            {dayName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900 block">{h.name}</span>
                            {h.description && (
                              <span className="text-[11px] text-gray-500 block mt-0.5">{h.description}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {getHolidayBadge(h.type)}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-gray-600">
                            {h.isCustom ? (
                              <span className="text-indigo-700 font-semibold">Kebijakan Internal KAP</span>
                            ) : (
                              <span>SKB 3 Menteri (Pemerintah RI)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {h.isCustom ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomHoliday(h.id, h.name)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                                title="Hapus agenda kustom"
                              >
                                <Trash2 size={14} />
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-300 font-medium">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TAMBAH HARI LIBUR / AGENDA KHUSUS KAP ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-atlas-blue" />
                <h3 className="text-sm font-bold text-gray-900">
                  Tambah Agenda / Libur Internal KAP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCustomHoliday} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tanggal Agenda / Libur <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Agenda / Hari Libur <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Workshop IAPI, Libur Bersama Kantor KAP..."
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Kategori Agenda
                </label>
                <select
                  value={newHolidayType}
                  onChange={(e) => setNewHolidayType(e.target.value as HolidayType)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                >
                  <option value="kap_custom">Agenda Khusus / Libur Internal KAP</option>
                  <option value="national">Libur Nasional Tambahan</option>
                  <option value="joint_leave">Cuti Bersama Tambahan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Catatan / Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat kegiatan atau dasar pengumuman..."
                  value={newHolidayDesc}
                  onChange={(e) => setNewHolidayDesc(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 bg-white focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-atlas-blue hover:bg-blue-800 rounded-lg transition-colors shadow-2xs"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KalenderNasional;
